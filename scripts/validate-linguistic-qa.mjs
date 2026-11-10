#!/usr/bin/env node
/**
 * Munpro linguistic QA inventory and educator packet exporter.
 * Structural checks only: this program cannot certify Korean naturalness.
 * Does not edit authored curriculum, review decisions, or source ledgers.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REVIEW_FILE = "docs/research/educator-review/review-records.json";
const STATUS = new Set(["not_reviewed","needs_clarification","approved","rejected","revised_pending_recheck"]);
const DIMENSIONS = ["formationAccuracy","semanticAccuracy","registerAppropriateness",
  "pragmaticNaturalness","morphologicalCorrectness","lexicalRestrictions","promptClarity"];
const args = process.argv.slice(2);
const value = (prefix, fallback) => (args.find(a => a.startsWith(prefix + "=")) || "").slice(prefix.length + 1) || fallback;
const checkOnly = args.includes("--check-only");
const tierFilter = value("--tier","all");
const maxItems = Number(value("--limit","0"));
const output = resolve(ROOT, value("--out",".qa-reports/linguistic"));
if (!["1","2","3","all"].includes(tierFilter) || !Number.isInteger(maxItems) || maxItems < 0) {
  console.error("Usage: node scripts/validate-linguistic-qa.mjs [--check-only] [--tier=1|2|3|all] [--limit=N] [--out=PATH]");
  process.exit(2);
}

const items = [], byId = new Map(), findings = [], reviewMap = new Map();
const grammarPoints = new Map(), grammarCards = new Map(), ledgerMap = new Map();
const flaggedMap = new Map(), newAuditMap = new Map();
const summary = { byType:{}, byTier:{}, byStatus:{}, findings:{blocker:0, needs_review:0, suggestion:0} };
const normalize = x => String(x ?? "").normalize("NFC").trim();
const fingerprint = item => createHash("sha256").update(JSON.stringify([
  item.type,item.id,item.korean,item.english,item.targetConstruction,
  item.canonicalAnswer,item.acceptedAlternatives,item.explanation
])).digest("hex");
const hasText = x => typeof x === "string" && Boolean(x.trim());
const load = (relative, optional=false) => {
  const abs = join(ROOT, relative);
  if (optional && !existsSync(abs)) return null;
  try { return JSON.parse(readFileSync(abs,"utf8")); }
  catch (err) { throw new Error("Cannot load " + relative + ": " + err.message); }
};
const issue = (severity,code,itemId,detail,source) => {
  findings.push({severity,code,itemId:itemId || null,detail,source:source || null});
  summary.findings[severity]++;
};
const unique = (xs) => [...new Set(xs.filter(Boolean))];
const add = obj => {
  if (!hasText(obj.id)) { issue("blocker","missing_id",null,"Item is missing a stable ID",obj.source); return; }
  if (byId.has(obj.id)) issue("blocker","duplicate_item_id",obj.id,"Duplicate ID across item types; earlier source: " + byId.get(obj.id).source,obj.source);
  const item = {
    id:obj.id,type:obj.type,source:obj.source,grammarPointId:obj.grammarPointId || null,
    level:obj.level ?? null, korean:obj.korean || "", english:obj.english || "",
    targetConstruction:obj.targetConstruction || "",canonicalAnswer:obj.canonicalAnswer || "",
    acceptedAlternatives:obj.acceptedAlternatives || [],nearMisses:obj.nearMisses || [],
    explanation:obj.explanation || "",referenceEvidence:obj.referenceEvidence || [],
    evidenceClassification:obj.evidenceClassification || "not_recorded",
    reviewQuestions:obj.reviewQuestions || [],
    contextualFlags:obj.contextualFlags || [],tier:3,tierReasons:[],
    reviewStatus:"not_reviewed",reviewer:null,reviewDate:null
  };
  item.sourceFingerprint = fingerprint(item);
  items.push(item);
  if (!byId.has(item.id)) byId.set(item.id,item);
  if (!hasText(item.english)) issue("needs_review","missing_english_context",item.id,"No English meaning or instructional context",item.source);
  if (!hasText(item.explanation)) issue("needs_review","missing_explanation",item.id,"Missing authored teaching explanation; an educator must supply or request one",item.source);
  if (!hasText(item.targetConstruction)) issue("needs_review","missing_target_construction",item.id,"Target construction or language skill is not specified",item.source);
  if (obj.isCloze) {
    const original = obj.sentenceWithBlank;
    const answer = obj.canonicalAnswer;
    if (typeof original !== "string" || original.split("___").length !== 2 ||
        !hasText(answer) || original.replace("___",answer) !== obj.korean)
      issue("blocker","invalid_cloze_reconstruction",item.id,"Exactly one ___ must reconstruct the complete Korean sentence using the canonical answer",item.source);
  }
  const seen = new Set([normalize(item.canonicalAnswer)]);
  for (const alt of item.acceptedAlternatives) {
    const norm = normalize(typeof alt === "string" ? alt : alt.input);
    if (!norm || seen.has(norm)) issue("blocker","duplicate_accepted_answer",item.id,
      "Blank or duplicate accepted answer: " + JSON.stringify(norm),item.source);
    seen.add(norm);
  }
};
const fallbackEvidence = pointId => {
  const entry = ledgerMap.get(pointId);
  if (!entry) return [];
  return (entry.evidence || []).map(e => ({
    reference:e.url || e.source || "", locator:e.locator || "",
    supports:e.evidenceScope || "", source:e.source || "",
    personallyChecked:false, classification:"ledger_claim_not_rechecked_by_this_validator"
  }));
};
const explanationFor = gp => [gp.description, ...(gp.notes || []).filter(n =>
  ["caution","tip"].includes(n.type)).slice(0,3).map(n=>n.content)].filter(hasText).join("\n");

const ledger = load("docs/research/korean-grammar-source-ledger.json");
for (const p of ledger.points || []) {
  if (ledgerMap.has(p.pointId)) issue("blocker","duplicate_ledger_id",p.pointId,"Repeated grammar ledger ID");
  ledgerMap.set(p.pointId,p);
  if (!hasText(p.evidenceStatus)) issue("blocker","missing_source_evidence_classification",p.pointId,"Missing evidence-status classification in ledger");
}
const flagged = load("prisma/seed-data/review-qa/flagged-card-fixes.json");
const legacy = load("docs/research/legacy-answer-ambiguity-backlog.json");
const newAudit = load("docs/research/grammar-answer-ambiguity-audit.json");
for (const row of flagged.rows || []) {
  if (flaggedMap.has(row.cardId)) issue("blocker","duplicate_flagged_id",row.cardId,"Repeated flagged-card ID");
  flaggedMap.set(row.cardId,row);
}
for (const row of newAudit.cards || []) {
  if (newAuditMap.has(row.cardId)) issue("blocker","duplicate_answer_audit_id",row.cardId,"Repeated answer-audit ID");
  newAuditMap.set(row.cardId,row);
}
const structuralIds = new Set((newAudit.cards || []).map(x => x.grammarPointId));
const legacyIds = new Set((legacy.queue || []).map(x => x.cardId));
for (const row of flagged.rows || []) {
  if (!legacyIds.has(row.cardId)) issue("blocker","flagged_backlog_mismatch",row.cardId,"Flagged-card source lacks a matching historical backlog row");
  if (!hasText(row.disposition) || !hasText(row.editorialReason))
    issue("blocker","missing_editorial_disposition",row.cardId,"Flagged card lacks reason or disposition");
}

for (let level = 1; level <= 6; level++) {
  const source = "mobile/src/content/" + (level <= 2 ? "topik1" : "topik2") + "-level" + level + ".json";
  const bundle = load(source);
  for (const lesson of bundle.lessons || []) for (const gp of lesson.grammarPoints || []) {
    if (grammarPoints.has(gp.id)) issue("blocker","duplicate_grammar_id",gp.id,"Duplicate grammar ID in level bundles",source);
    grammarPoints.set(gp.id,gp);
    const evidence = fallbackEvidence(gp.id), ledgerRow = ledgerMap.get(gp.id);
    if (!ledgerRow) issue("blocker","missing_grammar_reference",gp.id,"Grammar point absent from source ledger",source);
    else {
      if (ledgerRow.deckLevel !== level) issue("blocker","inconsistent_grammar_level",gp.id,"Ledger level differs from bundle level",source);
      if (!evidence.length) issue("needs_review","missing_item_level_evidence",gp.id,"No exact form-specific evidence entry recorded; a category reference is insufficient",source);
      else issue("needs_review","source_scope_not_sentence_certification",gp.id,"Existing ledger citations cover specified forms/contrasts only; sentence naturalness not independently verified",source);
    }
    add({id:gp.id,type:"grammar_point",source,level,grammarPointId:gp.id,
      korean:gp.title,english:gp.description || gp.hint,targetConstruction:gp.structurePattern || gp.title,
      explanation:explanationFor(gp),referenceEvidence:evidence,
      evidenceClassification:ledgerRow?.evidenceStatus,
      reviewQuestions:["Is this form's formation, meaning, register and set of lexical restrictions accurate?",
        "Are the model examples natural, and does the teaching order make sense?"]});
    for (const ex of gp.lessonExamples || []) add({
      id:ex.id,type:"worked_example",source,level,grammarPointId:gp.id,
      korean:ex.fullSentence,english:ex.englishHint,targetConstruction:gp.title,
      canonicalAnswer:ex.answer,sentenceWithBlank:ex.sentenceWithBlank,isCloze:true,
      explanation:ex.notes || explanationFor(gp),referenceEvidence:evidence,
      evidenceClassification:ledgerRow?.evidenceStatus,
      reviewQuestions:["Does the reconstructed Korean sentence mean the English and model the target construction naturally?"]});
    for (const card of gp.cards || []) {
      if (grammarCards.has(card.id)) issue("blocker","duplicate_grammar_card_id",card.id,"Repeated review card",source);
      grammarCards.set(card.id,{card,gp,level});
      const annotated = newAuditMap.get(card.id), fix = flaggedMap.get(card.id);
      const assessments = fix?.acceptedVariantAssessments || [];
      if (annotated && annotated.grammarPointId !== gp.id)
        issue("blocker","inconsistent_answer_audit_grammar_id",card.id,"Answer audit points to a different grammar ID",source);
      if (fix && fix.grammarPointId !== gp.id)
        issue("blocker","inconsistent_flagged_grammar_id",card.id,"Flagged-card manifest points to a different grammar ID",source);
      if (fix && JSON.stringify(fix.after?.alternateAnswers || []) !== JSON.stringify(card.alternateAnswers || []))
        issue("blocker","flagged_variant_drift",card.id,"Published alternatives disagree with editorial disposition",source);
      if (annotated && JSON.stringify((annotated.acceptedAlternatives || []).map(a=>a.input)) !== JSON.stringify(card.alternateAnswers || []))
        issue("blocker","new_audit_variant_drift",card.id,"Accepted answer audit disagrees with published card",source);
      if ((card.alternateAnswers || []).length) {
        issue("needs_review","accepted_alternatives_require_educator",card.id,
          "Check full-sentence naturalness and whether every alternative demonstrates the target construction",source);
      }
      if (assessments.some(a => a.classification === "natural_other_construction"))
        issue("needs_review","natural_but_off_target_accepted_answer",card.id,
          "A proposed answer may be natural Korean without demonstrating the target grammar; distinguish correctness from mastery",source);
      if (fix && /particle|register|tense|honorific|context|direction/i.test((fix.originalFlags || []).join(" ") + " " + fix.editorialReason))
        issue("needs_review","contextual_cue_needs_educator",card.id,
          "Editorial cue clarified, but communicative context/register still needs educator confirmation",source);
      if (hasText(card.tense) && hasText(gp.tense) && card.tense !== gp.tense)
        issue("needs_review","tense_metadata_conflict",card.id,"Explicit card and grammar tense fields disagree; verify contextual intent",source);
      if (hasText(card.register) && hasText(gp.register) && card.register !== gp.register)
        issue("needs_review","register_metadata_conflict",card.id,"Explicit card and grammar register fields disagree; verify contextual intent",source);
      add({id:card.id,type:"grammar_card",source,level,grammarPointId:gp.id,
        korean:card.fullSentence,english:card.englishHint,targetConstruction:gp.title,
        canonicalAnswer:card.answer,sentenceWithBlank:card.sentenceWithBlank,isCloze:true,
        acceptedAlternatives:card.alternateAnswers || [],
        nearMisses:annotated?.nearMissExamples || [],
        contextualFlags:unique([...(fix?.originalFlags || []),...(legacy.queue || []).find(q=>q.cardId===card.id)?.flags || []]),
        explanation:explanationFor(gp),referenceEvidence:evidence,evidenceClassification:ledgerRow?.evidenceStatus,
        reviewQuestions:unique([
          "Is the complete Korean sentence natural and accurately translated?",
          "Is the cloze cue unambiguous in discourse and appropriate for this register?",
          (card.alternateAnswers || []).length ? "For each accepted alternative, is the full sentence natural AND does it demonstrate target-grammar mastery?" : null,
          annotated?.nearMissExamples?.length ? "Are the proposed near-miss classifications and targeted hints correct?" : null
        ])});
    }
  }
}
for (const gp of grammarPoints.values()) for (const id of gp.relatedPointIds || []) {
  if (!grammarPoints.has(id)) issue("needs_review","unknown_related_grammar_id",gp.id,"Related grammar ID is not in the current catalogue: " + id);
}
for (const pointId of ledgerMap.keys()) {
  if (!grammarPoints.has(pointId)) issue("blocker","orphaned_ledger_grammar_id",pointId,"Source ledger references missing grammar point");
}
for (const cardId of flaggedMap.keys()) if (!grammarCards.has(cardId))
  issue("blocker","orphaned_flagged_card",cardId,"Flagged remediation references missing card");
for (const cardId of newAuditMap.keys()) if (!grammarCards.has(cardId))
  issue("blocker","orphaned_answer_audit_card",cardId,"New-answer audit references missing card");

const vocabulary = load("mobile/src/content/vocabulary-foundations.json");
for (const deck of vocabulary.decks || []) for (const entry of deck.entries || []) add({
  id:entry.id,type:"vocabulary",source:"mobile/src/content/vocabulary-foundations.json",
  korean:entry.usageExample?.korean || entry.front,
  english:entry.usageExample?.english || entry.meaning,
  targetConstruction:"Vocabulary: " + (deck.deck?.title || "") + " — " + entry.front,
  canonicalAnswer:entry.front,acceptedAlternatives:entry.variant ? [entry.variant] : [],
  explanation:entry.usageNote || ("Lexical meaning: " + (entry.meaning || "")),
  referenceEvidence:[],evidenceClassification:"item_level_evidence_pending",
  reviewQuestions:["Are the dictionary sense, counter/collocation restrictions, variants, Korean example and gloss accurate?"]});
const topics = load("mobile/src/content/language-topics.json");
for (const topic of topics.topics || []) {
  const evidence = (topic.sourceReferences || []).map(url=>({
    reference:url, locator:"not_given", supports:"topic-level background",
    personallyChecked:false, classification:"topic_scope_only"
  }));
  (topic.sections || []).forEach((section,index) => add({
    id:topic.id + ":section:" + (index+1),type:"language_section",
    source:"mobile/src/content/language-topics.json",korean:(section.examples || []).map(e=>e.korean).join(" / ") || section.heading,
    english:(section.examples || []).map(e=>e.english).join(" / ") || section.heading,
    targetConstruction:topic.title + ": " + section.heading,
    explanation:section.explanation,referenceEvidence:evidence,evidenceClassification:"topic_level",
    reviewQuestions:["Are the pronunciation/morphology, explanation, English examples and all listed phonetic transcriptions correct?"]}));
  for (const check of topic.checks || []) {
    if (!Array.isArray(check.choices) || !Number.isInteger(check.correctIndex) ||
        check.correctIndex < 0 || check.correctIndex >= check.choices.length)
      issue("blocker","invalid_language_answer_key",check.id,"Knowledge check has no valid choice-index answer","mobile/src/content/language-topics.json");
    add({id:check.id,type:"language_check",source:"mobile/src/content/language-topics.json",
      korean:check.choices?.[check.correctIndex] || "",
      english:check.prompt,targetConstruction:topic.title,
      canonicalAnswer:check.choices?.[check.correctIndex] || "",
      explanation:check.explanation,referenceEvidence:evidence,evidenceClassification:"topic_level",
      reviewQuestions:["Is this key uniquely defensible and supported by the explanation and listed pronunciation evidence?"]});
  }
}

// Dynamic pilot discovery: schema-neutral review inventory, with conservative answer-key checks.
// When an unfamiliar schema appears, do not silently pronounce it valid.
const contentDir = join(ROOT,"mobile/src/content");
const pilotFiles = readdirSync(contentDir).filter(name => /^(practice|comprehension)-.*\.json$/.test(name));
for (const filename of pilotFiles) {
  const source = "mobile/src/content/" + filename, data = load(source);
  const visited = new WeakSet();
  let found = 0;
  const walk = (node, context={}, trail="root") => {
    if (!node || typeof node !== "object" || visited.has(node)) return;
    visited.add(node);
    if (Array.isArray(node)) {node.forEach((v,i)=>walk(v,context,trail+"."+i));return;}
    const next = {...context};
    if (hasText(node.passage) || hasText(node.passageText) || hasText(node.textKorean))
      next.passage = node.passage || node.passageText || node.textKorean;
    if (hasText(node.grammarPointId)) next.grammarPointId = node.grammarPointId;
    const prompt = node.prompt || node.question || node.questionText;
    if (hasText(node.id) && hasText(prompt)) {
      found++;
      const choices = node.choices || node.options;
      const answer = node.correctAnswer ?? node.answer ?? node.answerKey ??
        (Number.isInteger(node.correctIndex) && Array.isArray(choices) ? choices[node.correctIndex] : null);
      const answerEvidence = node.answerEvidence || node.evidenceSpan ||
        node.supportingQuote || node.evidence || node.sourceSpan;
      if (!hasText(answer) && !(Array.isArray(answer) && answer.length))
        issue("blocker","missing_pilot_answer_key",node.id,"Question needs an explicit correct answer/key",source);
      if (node.correctIndex !== undefined && (!Array.isArray(choices) ||
          !Number.isInteger(node.correctIndex) || node.correctIndex < 0 || node.correctIndex >= choices.length))
        issue("blocker","invalid_pilot_answer_index",node.id,"Choice key is out of range",source);
      if (Array.isArray(choices) && hasText(answer) && !choices.some(x=>normalize(typeof x==="string"?x:x?.text)===normalize(answer)))
        issue("needs_review","answer_not_in_choices",node.id,"Answer is not equal to any listed choice",source);
      if (filename.startsWith("comprehension-") && !hasText(answerEvidence) &&
        !(answerEvidence && typeof answerEvidence === "object"))
        issue("needs_review","unverifiable_comprehension_answer",node.id,"No passage anchor, answer rationale or evidence span recorded; educator must verify",source);
      if (next.grammarPointId && !grammarPoints.has(next.grammarPointId))
        issue("blocker","unknown_pilot_grammar_id",node.id,"Pilot references an unknown grammar point ID",source);
      add({id:node.id,type:filename.startsWith("comprehension-")?"comprehension_question":"transfer_question",
        source,grammarPointId:next.grammarPointId,
        korean:next.passage || node.fullSentence || node.korean || "",
        english:prompt,targetConstruction:next.grammarPointId || node.targetConstruction || "reading/transfer",
        canonicalAnswer:hasText(answer)?answer:JSON.stringify(answer || ""),
        explanation:node.explanation || node.rationale || "",
        referenceEvidence:hasText(answerEvidence)?[{reference:source,locator:answerEvidence,personallyChecked:false}]:[],
        evidenceClassification:answerEvidence?"answer_anchor_supplied_unverified":"answer_anchor_missing",
        reviewQuestions:["Does the passage license this answer, uniquely where required?","Do distractors and feedback test the intended construction?"]});
    }
    for (const [key,val] of Object.entries(node)) walk(val,next,trail+"."+key);
  };
  walk(data);
  if (!found) issue("needs_review","unrecognized_pilot_schema",null,"No reviewable question IDs found; adapt scanner to the agreed pilot schema",source);
}

// Human sign-off registry. Missing explicit record means not_reviewed, never approved.
const registry = load(REVIEW_FILE);
if (registry.defaultStatus !== "not_reviewed") issue("blocker","unsafe_default_status",null,"Review registry must default to not_reviewed",REVIEW_FILE);
for (const review of registry.reviews || []) {
  const id = review.sourceItemId;
  if (!hasText(id) || !byId.has(id)) {issue("blocker","unknown_review_item",id,"Review record refers to a missing source item",REVIEW_FILE);continue;}
  if (reviewMap.has(id)) issue("blocker","duplicate_review_record",id,"One current review record per item; preserve past decisions in history",REVIEW_FILE);
  reviewMap.set(id,review);
  if (!STATUS.has(review.status)) issue("blocker","invalid_review_status",id,"Unknown or missing status: " + JSON.stringify(review.status),REVIEW_FILE);
  const item = byId.get(id);
  item.reviewStatus = STATUS.has(review.status) ? review.status : "not_reviewed";
  item.reviewer = review.reviewer || null;item.reviewDate = review.reviewDate || null;
  const history = review.history || [];
  if (!Array.isArray(history) || (review.status !== "not_reviewed" && !history.length))
    issue("blocker","missing_decision_trail",id,"Nondefault review states require append-only history",REVIEW_FILE);
  else if (history.length && history[history.length-1].status !== review.status)
    issue("blocker","history_status_mismatch",id,"Latest history status must equal current status",REVIEW_FILE);
  const sameVersion = review.sourceFingerprint === item.sourceFingerprint;
  if (review.status === "approved") {
    if (!sameVersion) issue("blocker","stale_approval",id,"Approved item text changed since educator reviewed it; set revised_pending_recheck",REVIEW_FILE);
    if (!hasText(review.reviewer?.identity) || !hasText(review.reviewer?.role) ||
        review.reviewer?.type !== "human_educator" || !/^\d{4}-\d{2}-\d{2}$/.test(review.reviewDate || ""))
      issue("blocker","unsigned_approval",id,"Approval requires identified human educator, role and ISO review date",REVIEW_FILE);
    if (!DIMENSIONS.every(k=>["pass","not_applicable"].includes(review.dimensions?.[k])))
      issue("blocker","incomplete_approved_dimensions",id,"Every linguistic dimension requires pass/not_applicable",REVIEW_FILE);
    if (!(review.evidence || []).some(e=>hasText(e.reference) && hasText(e.claimSupported) &&
        e.personallyChecked === true && hasText(e.classification)))
      issue("blocker","unsubstantiated_approval",id,"At least one checked item-specific reference with explicit claim scope is required",REVIEW_FILE);
    if (!hasText(review.decisionRationale))
      issue("blocker","missing_approval_rationale",id,"Approved decision must include rationale",REVIEW_FILE);
  } else if (review.sourceFingerprint && !sameVersion)
    issue("needs_review","changed_since_review",id,"Source content changed after a human decision; request re-review",REVIEW_FILE);
}
for (const item of items) {
  const reasons = [];
  if (item.type === "grammar_card" && (item.acceptedAlternatives.length || flaggedMap.has(item.id)))
    reasons.push(item.acceptedAlternatives.length?"accepted alternatives":"historically flagged card");
  if (item.grammarPointId && structuralIds.has(item.grammarPointId))
    reasons.push("new structural grammar point");
  if (item.type === "grammar_point" && structuralIds.has(item.id))
    reasons.push("new structural grammar point");
  if (item.type === "grammar_card" && (/(particle|register|honorific|subject|topic|direction|location)/i.test(item.contextualFlags.join(" ")) ||
      /\((?:Treat|Use|Specify|Make|Focus|Emphasize).*?(?:topic|subject|particle|register|direction|destination|honorific)/i.test(item.english)))
    reasons.push("context-dependent particle/register cue");
  const tierTwo = (item.level >= 5 && item.level <= 6) ||
    (item.grammarPointId && /passive|causative|irregular|negat|honorific|evidential/i.test(
      (grammarPoints.get(item.grammarPointId)?.category || "") + " " +
      (grammarPoints.get(item.grammarPointId)?.title || "") + " " +
      (grammarPoints.get(item.grammarPointId)?.tags || []).toString()));
  if (!reasons.length && tierTwo) reasons.push("advanced or morphology-sensitive construction");
  item.tier = reasons.some(r=>r !== "advanced or morphology-sensitive construction") ? 1 : tierTwo ? 2 : 3;
  item.tierReasons = reasons.length ? unique(reasons) : ["remaining curriculum or pilot"];
  summary.byType[item.type]=(summary.byType[item.type]||0)+1;
  summary.byTier[item.tier]=(summary.byTier[item.tier]||0)+1;
  summary.byStatus[item.reviewStatus]=(summary.byStatus[item.reviewStatus]||0)+1;
}
const queue = items.sort((a,b)=>a.tier-b.tier || (a.level ?? 0)-(b.level ?? 0) || a.id.localeCompare(b.id));
const selected = queue.filter(x=>tierFilter==="all" || String(x.tier)===tierFilter).slice(0,maxItems || Infinity);
const report = {
  schemaVersion:1, generatedAt:new Date().toISOString(),baseline:"c17cfab84f978056e55665b40fbeaec92ca044ce",
  auditKind:"mechanical_qa_only_not_korean_certification",
  reviewRegistry:REVIEW_FILE,summary,totalItems:items.length,selectedPacketItems:selected.length,
  checkedSources:{grammarBundles:6,flaggedRows:flagged.rows?.length||0,answerAuditCards:newAudit.cards?.length||0,
    grammarLedger:ledgerMap.size,pilotFiles},
  findings,reviewDecisions:queue.map(x=>({
    id:x.id,type:x.type,source:x.source,tier:x.tier,tierReasons:x.tierReasons,
    reviewStatus:x.reviewStatus,reviewer:x.reviewer,reviewDate:x.reviewDate,
    sourceFingerprint:x.sourceFingerprint
  }))
};
const packetEntry = x => ({
  sourceItemId:x.id,source:x.source,itemType:x.type,priorityTier:x.tier,priorityReasons:x.tierReasons,
  koreanText:x.korean,englishMeaning:x.english,targetConstruction:x.targetConstruction,
  proposedCanonicalAnswer:x.canonicalAnswer,acceptedAlternatives:x.acceptedAlternatives,
  suspectedNearMisses:x.nearMisses,explanation:x.explanation,
  formationAccuracy:"not_reviewed",semanticAccuracy:"not_reviewed",registerAppropriateness:"not_reviewed",
  pragmaticNaturalness:"not_reviewed",morphologicalCorrectness:"not_reviewed",
  lexicalRestrictions:"not_reviewed",promptClarity:"not_reviewed",
  referenceEvidence:x.referenceEvidence.map(e=>({...e,
    personallyChecked:e.personallyChecked===true})),
  evidenceClassification:x.evidenceClassification,
  exactQuestionsForEducator:x.reviewQuestions.length?x.reviewQuestions:
    ["Is this text natural, accurate, appropriate for its level/register and instructional goal?"],
  sourceFingerprint:x.sourceFingerprint,reviewStatus:x.reviewStatus,
  reviewer:x.reviewer,reviewDate:x.reviewDate
});
const esc = s => String(s ?? "").replaceAll("|","\\|").replaceAll("\n"," ");
const packetMd = rows => {
  const lines = ["# Munpro educator review packet","",
    "Mechanical queue export. NOT a Korean educator approval or sentence-naturalness certificate.",
    "Editors: record decisions in " + REVIEW_FILE + "; do not modify content while reviewing.","",
    "Items: " + rows.length + ". Review each sentence in its full context; separate valid Korean from target-form mastery.",""];
  for (const x of rows) {
    lines.push("## " + x.sourceItemId + " — Tier " + x.priorityTier,"",
      "- Source: " + x.source,
      "- Priority reason: " + x.priorityReasons.join("; "),
      "- Current review status: " + x.reviewStatus,
      "- Korean: " + x.koreanText,
      "- English/context: " + x.englishMeaning,
      "- Target: " + x.targetConstruction,
      "- Canonical answer: " + (x.proposedCanonicalAnswer || "(not a cloze)"),
      "- Accepted alternatives: " + (x.acceptedAlternatives.map(a=>typeof a==="string"?a:a.input).join("; ") || "(none listed)"),
      "- Suspected near misses: " + (x.suspectedNearMisses.map(a=>(a.input || "")+" ["+(a.classification||"unclassified")+"]").join("; ") || "(none listed)"),
      "- Evidence classification: " + x.evidenceClassification,
      "- Source fingerprint: " + x.sourceFingerprint,
      "",
      "**Current explanation**","",x.explanation || "(missing)","","**Reference evidence (not independently checked by exporter)**","");
    for (const e of x.referenceEvidence) lines.push("- "+(e.reference || e.source || "(missing)")+
      (e.locator?" — "+e.locator:"")+(e.supports?" — supports: "+e.supports:"")+
      " — personally checked: "+(e.personallyChecked?"yes":"no"));
    if (!x.referenceEvidence.length) lines.push("- No item-specific source recorded.");
    lines.push("","**Questions for educator**","");
    x.exactQuestionsForEducator.forEach((q,i)=>lines.push((i+1)+". "+q));
    lines.push("","**Decision (fill in external review register, not here):** status / reviewer identity+role / date / seven accuracy dimensions / checked source claim / nuance / corrective issue IDs.","","---","");
  }
  return lines.join("\n");
};
const summaryMd = [
  "# Linguistic QA audit — mechanical results","",
  "Generated " + report.generatedAt + ". No automated approval or linguistic naturalness certification.",
  "Total items: " + report.totalItems + "; packet items selected: " + selected.length + ".",
  "Statuses: " + JSON.stringify(summary.byStatus),
  "Priorities: " + JSON.stringify(summary.byTier),
  "Types: " + JSON.stringify(summary.byType),
  "Findings: " + JSON.stringify(summary.findings),
  "The missing-item-level-evidence and unverified-alternatives findings are educator-review tasks, not proof of errors.",
  "Structural blockers cause a nonzero exit code. Human review remains a separate release gate.","",
  "## Highest-priority examples","",
  ...findings.filter(f=>f.severity==="blocker").slice(0,40).map(f=>"- [BLOCKER] "+f.code+" "+(f.itemId||"")+" — "+f.detail),
  ...findings.filter(f=>f.code==="natural_but_off_target_accepted_answer").slice(0,20).map(f=>"- [NEEDS REVIEW] "+f.itemId+" — "+f.detail),
  ""
].join("\n");
if (!checkOnly) {
  mkdirSync(output,{recursive:true});
  const write = (filename,obj) => writeFileSync(join(output,filename),
    typeof obj==="string"?obj:JSON.stringify(obj,null,2)+"\n","utf8");
  write("audit.json",report);
  write("review-queue.json",queue.map(x=>({
    sourceItemId:x.id,type:x.type,tier:x.tier,reasons:x.tierReasons,
    reviewStatus:x.reviewStatus,source:x.source,sourceFingerprint:x.sourceFingerprint
  })));
  write("educator-packet.json",selected.map(packetEntry));
  write("educator-packet.md",packetMd(selected.map(packetEntry)));
  write("summary.md",summaryMd);
}
console.log("Munpro mechanical linguistic QA: "+items.length+" items; "+
  summary.findings.blocker+" blockers, "+summary.findings.needs_review+
  " educator-review findings, "+summary.findings.suggestion+" suggestions.");
console.log("By tier: "+JSON.stringify(summary.byTier)+"; by status: "+JSON.stringify(summary.byStatus));
if (!checkOnly) console.log("Report and educator packets: "+output);
if (summary.findings.blocker) process.exitCode=1;
