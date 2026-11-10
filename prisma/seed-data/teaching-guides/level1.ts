import type { TeachingGuide } from './types';

/** Layperson-first Level 1 grammar teaching: use, formation, reasoning and traps. */
export const level1Guides: Record<string, TeachingGuide> = {
  "gp_ieyo_yeyo": {
    "meaning": "Use this ending when saying that a person or thing is a noun: 'I am a student' or 'That is a book'. It is polite but everyday speech.",
    "formation": "Start with the noun, not the whole sentence. If its final syllable has a bottom consonant, attach 이에요; otherwise attach 예요.",
    "worked": "학생 ends in ㄴ, so 학생 + 이에요 = 학생이에요. 의사 ends in a vowel, so 의사 + 예요 = 의사예요.",
    "trap": "Do not use 예요 after 학생, or write 이예요. The negative version is the separate construction N이/가 아니에요."
  },
  "gp_ani_eyo": {
    "meaning": "Use this pattern to say a person or thing is NOT a noun: 'I'm not a student' or 'It isn't coffee'.",
    "formation": "Say the noun being denied, add 이 after a final consonant or 가 after a vowel, and finish with 아니에요.",
    "worked": "학생 ends in a consonant: 학생 + 이 + 아니에요 = 학생이 아니에요. 의사 ends in a vowel: 의사가 아니에요.",
    "trap": "아니에요 is the correct spelling, not 아니예요. 안 학생이에요 is not the normal way to negate a noun."
  },
  "gp_eun_neun": {
    "meaning": "은/는 tells the listener what you're talking about. It often marks a topic or sets up a contrast: 'As for me...'.",
    "formation": "Add 은 after a noun ending in a consonant; add 는 after a vowel-ending noun.",
    "worked": "저 has no final consonant, so 저 + 는 = 저는. 저는 학생이에요 gives information about the topic 'me'.",
    "trap": "It is not interchangeable with 이/가 in every context. In 'Who is the student?', the answer commonly uses 이/가 to identify the person."
  },
  "gp_igeos": {
    "meaning": "이것 means 'this thing' near the speaker. It belongs to the 이것/그것/저것 pointing system.",
    "formation": "Choose 이것 for something close to you. Add the necessary sentence particle AFTER the complete word, such as 이것은.",
    "worked": "이것은 책이에요: identify the nearby thing as a book. The topic particle 은 follows the final consonant ㅅ in 이것.",
    "trap": "이거 is a common casual form, but 이거은 is wrong. You would say 이거는 or 이것은; the remaining particle matters."
  },
  "gp_geugeos": {
    "meaning": "그것 means 'that thing' near the listener or already mentioned. It contrasts with 이것 (here) and 저것 (over there).",
    "formation": "Choose 그것 when the item is by the other person or in the shared conversation. Then attach the right particle: 그것은.",
    "worked": "그것은 연필이에요 points to the other person's item (or a previously mentioned item) and calls it a pencil.",
    "trap": "그것 does not always mean 'far away'; 저것 is for something away from both speakers. Casual 그거 needs its own correct particle."
  },
  "gp_jeogeos": {
    "meaning": "저것 means 'that thing over there', away from both the speaker and listener.",
    "formation": "Use 저것 for a visible item at a distance, then add a particle as needed.",
    "worked": "저것은 학교예요 describes a building over there as a school. 저것 ends in ㅅ, so add 은.",
    "trap": "Do not confuse 저것 (away from both people) with 그것 (by the listener or already mentioned). 저거은 is not grammatical."
  },
  "gp_ui": {
    "meaning": "의 links one noun to another to show ownership or a relationship: 'someone's book'.",
    "formation": "Put the owner first, then 의, then the owned noun: 민수 + 의 + 책.",
    "worked": "저의 이름은 민수예요: 저의 means 'my'; 이름 is the thing being described. Spoken 저의 often becomes 제.",
    "trap": "의 does not simply replace English 'of' in every phrase. Pronunciation may sound like 에, but the written particle is 의."
  },
  "gp_do": {
    "meaning": "도 means 'also' or 'too'. It adds a person or thing to something already true.",
    "formation": "Attach 도 directly to the noun or pronoun being added: 저 + 도 = 저도.",
    "worked": "저도 학생이에요 means 'I am a student too'. 도 tells the listener someone else is a student as well.",
    "trap": "도 often replaces 은/는 or 이/가 on the same noun; do not stack 저도는 as a normal topic expression."
  },
  "gp_ida": {
    "meaning": "이다 is the dictionary form used to link a noun with 'is/am/are'. You will mostly speak with endings such as 이에요/예요.",
    "formation": "In plain dictionary-style sentences, attach 이다 to a noun: 학생 + 이다.",
    "worked": "학생이다 is a plain statement. In a normal polite exchange, use 학생이에요 instead.",
    "trap": "이다 is not the normal way to end a polite conversation. It also attaches to nouns, not arbitrary action-verb stems."
  },
  "gp_i_ga": {
    "meaning": "이/가 identifies who or what is doing something, or what exists. It is often especially useful when answering 'who?' or 'what?'.",
    "formation": "First identify who or what the sentence is about. Add 이 after a noun with a final consonant, or 가 after a noun ending in a vowel.",
    "worked": "이름이 민수예요: 이름 ends with ㅁ, so take 이. 민수가 학생이에요 identifies Minsu as the student.",
    "trap": "은/는 sets a topic or contrast; 이/가 marks a subject. Sometimes both work but change what the listener focuses on."
  },
  "gp_isseoyo": {
    "meaning": "있어요 means someone or something exists, is somewhere, or is possessed. Context tells you which sense is intended.",
    "formation": "Put the thing that exists before 있어요, usually with 이/가. For a location use 에: 책이 집에 있어요.",
    "worked": "고양이가 있어요 means 'There is a cat' or 'I have a cat', depending on context. 가 marks the cat as the thing present.",
    "trap": "있어요 is not a general equivalent of English 'is'. For 'is a student', use 학생이에요; use 있어요 for existence, location or possession."
  },
  "gp_eopseoyo": {
    "meaning": "없어요 says that something doesn't exist, isn't present, or isn't possessed.",
    "formation": "Name what is missing and add 없어요, usually after its 이/가-marked noun.",
    "worked": "시간이 없어요: 시간이 is 'time' as the thing missing; 없어요 means it is not available.",
    "trap": "없어요 is not the negative of 'I am a student'. Use 학생이 아니에요 for noun identity; 없어요 is for absence."
  },
  "gp_ayo_eoyo": {
    "meaning": "This is the basic polite ending for everyday actions and descriptions, like 'eat', 'go', or 'is good'.",
    "formation": "Remove 다 from the dictionary form. With many regular verbs, use 아요 after a last stem vowel ㅏ/ㅗ and 어요 otherwise; 하다 becomes 해요.",
    "worked": "공부하다 → 공부하 + 여요 → 공부해요. 저는 공부해요 is 'I study' in everyday polite speech.",
    "trap": "Many verbs contract: 가다 → 가요, 보다 → 봐요. Irregular verbs need extra rules; don't mechanically paste 아요/어요 onto every spelling."
  },
  "gp_eul_reul": {
    "meaning": "을/를 marks the thing directly affected by an action: what you eat, read, buy, or watch.",
    "formation": "Add 을 if the noun ends in a final consonant; add 를 if it ends in a vowel.",
    "worked": "커피 ends in a vowel, so 커피 + 를 = 커피를. 커피를 마셔요 = 'I drink coffee'.",
    "trap": "Don't mark the person doing an action with 을/를; use 이/가 or a topic particle when needed. Not every Korean sentence needs an object."
  },
  "gp_an": {
    "meaning": "안 placed before an action or description usually means 'not'. It often expresses a choice, habit, or simple negation.",
    "formation": "Put 안 before the main verb: 안 먹어요, 안 가요. In many noun+하다 verbs, put it between the noun and 해요: 공부 안 해요.",
    "worked": "커피를 안 마셔요: 안 sits directly before 마셔요, so the speaker does not drink coffee.",
    "trap": "안 is different from 못 ('can't'). For 'not a student', use 학생이 아니에요, not 안 학생이에요."
  },
  "gp_ji_anha": {
    "meaning": "-지 않다 is another way to say 'not do' or 'not be' with an action or descriptive verb. It often sounds more measured than short 안.",
    "formation": "Remove 다 from the verb, add 지 않다, and conjugate 않다: 먹다 → 먹지 않아요.",
    "worked": "고기를 먹지 않아요: 먹 + 지 않아요 makes the eating negative. The whole expression still ends politely.",
    "trap": "This is not the construction for 'not a doctor' (의사가 아니에요). It does not automatically mean a stronger 'no' than 안."
  },
  "gp_mos": {
    "meaning": "못 before a verb means 'cannot' or 'am unable to'. It points to lack of ability or circumstances that prevent the action.",
    "formation": "Put 못 before a normal verb: 못 가요, 못 먹어요. With noun+하다, say 공부 못 해요.",
    "worked": "매운 음식을 못 먹어요: 못 before 먹어요 means the person is unable to eat spicy food.",
    "trap": "Don't use 못 for a deliberate preference when you just mean 'I don't want to'. 안 먹어요 is 'I don't eat'; 못 먹어요 is 'I can't eat'."
  },
  "gp_yeogi": {
    "meaning": "여기 means 'here', near the speaker. It is the place counterpart of 여기/거기/저기.",
    "formation": "Use 여기 when naming where you are. Add a correct particle if a full sentence needs one: 여기는, 여기에, 여기에서.",
    "worked": "여기는 학교예요 says 'This place is a school'. 는 makes 'here' the topic.",
    "trap": "여기 is a place word, not a general subject pronoun. 여기에서 is for an action occurring here; 여기에 for being or going here."
  },
  "gp_geogi": {
    "meaning": "거기 means 'there', often near the listener or at a place already being discussed.",
    "formation": "Choose 거기 rather than 여기 when pointing to the other person's place. Then attach a particle: 거기는, 거기에.",
    "worked": "거기는 학교예요? asks whether the place by the listener is a school.",
    "trap": "Don't assume 거기 and 저기 are identical. 저기 normally points to somewhere away from both people."
  },
  "gp_jeogi": {
    "meaning": "저기 means 'over there', for a location away from speaker and listener.",
    "formation": "Use 저기 for a distant place. Add the particle demanded by the sentence: 저기는, 저기에, 저기에서.",
    "worked": "저기는 공원이에요: 저기 points to a place far from both speakers. 는 marks that place as the topic, and 공원이에요 identifies it.",
    "trap": "저기 can also be used to get someone's attention; that separate conversational use is not the location pattern practiced here."
  },
  "gp_e_loc": {
    "meaning": "에 marks where someone or something is, or the destination of movement: 'at', 'in', or 'to'.",
    "formation": "Place 에 after the destination/location noun: 학교에, 집에, 방에.",
    "worked": "학교에 가요: 학교 is the destination, and 에 marks 'to school'.",
    "trap": "For the place where an activity happens, use 에서: 학교에서 공부해요. English 'at' can translate to either particle."
  },
  "gp_eseo": {
    "meaning": "에서 marks the place where an action takes place. Think 'at/in a place, doing something'.",
    "formation": "Put 에서 after the location noun before an action verb: 도서관에서 공부해요.",
    "worked": "도서관에서 공부해요 means studying happens in the library; 도서관 is not a destination here.",
    "trap": "Don't substitute 에 just because English uses 'at'. 학교에 가요 marks where you go, whereas 학교에서 공부해요 marks where you study."
  },
  "gp_position": {
    "meaning": "Korean places words such as 위 (above/on), 아래 (below), 앞 (front), 뒤 (behind), and 옆 (beside) after a reference noun.",
    "formation": "Say the reference thing first, then the position word, then 에 if saying where something is: 책상 위에.",
    "worked": "책이 책상 위에 있어요: 책상 is the reference, 위 means 'above/on it', and 에 locates the book there.",
    "trap": "English often says 'on the desk', but Korean says 'desk + top + at'. Don't reverse the noun and position word."
  },
  "gp_e_time": {
    "meaning": "에 also marks when something happens, such as a clock time or a specific day.",
    "formation": "Find the day or clock time that answers 'when?'. Put 에 immediately after that time: 월요일에, 세 시에, 아침에.",
    "worked": "월요일에 한국어를 공부해요 means studying happens on Monday. 에 gives the time of the action.",
    "trap": "Don't automatically add 에 after every time word: 오늘, 내일, 어제 and 지금 normally stand without it."
  },
  "gp_buteo": {
    "meaning": "부터 marks where a time or range starts: 'from' or 'starting at'.",
    "formation": "Attach 부터 immediately after the starting time or point: 아홉 시부터.",
    "worked": "9시부터 일해요: work starts at 9; 부터 belongs to the starting time.",
    "trap": "부터 gives the beginning, not the end; use 까지 for 'until'. For movement from a place, 에서 is often more natural than 부터."
  },
  "gp_kkaji": {
    "meaning": "까지 marks the end of a time, range, or destination: 'until', 'up to', or 'as far as'.",
    "formation": "Choose the finishing time or destination, then add 까지: 여섯 시까지, 학교까지. To name the starting point as well, use 부터 there.",
    "worked": "6시까지 일해요: work lasts until six; 까지 points to the cutoff.",
    "trap": "Don't swap 까지 and 부터. A full interval is usually X부터 Y까지 (from X to Y)."
  },
  "gp_jeone": {
    "meaning": "전에 means 'before' when put after a noun or named event.",
    "formation": "Put the noun/event first and add 전에: 수업 전에 ('before class'). Verbs need -기 전에, which is introduced later.",
    "worked": "수업 전에 커피를 마셔요: 수업 ('class') is the event. Put 전에 after 수업; the coffee-drinking happens before that event.",
    "trap": "Don't attach 전에 directly to a plain verb stem. 먹기 전에 is 'before eating'; 먹전에 is not Korean."
  },
  "gp_hue": {
    "meaning": "후에 means 'after' when placed after a noun or named event. It tells the listener which event finishes before the next action.",
    "formation": "Put the noun/event first and add 후에: 수업 후에 ('after class'). For a completed verb action, use -(으)ㄴ 후에 later.",
    "worked": "수업 후에 운동해요: 수업 is 'class', and 후에 places exercise AFTER that class. No verb ending is needed on the noun 수업.",
    "trap": "Don't use 후에 directly after an unconjugated verb stem. 먹은 후에 is 'after eating', not 먹후에."
  },
  "gp_asseoyo": {
    "meaning": "-았어요/-었어요 makes an action or state past in everyday polite speech.",
    "formation": "Remove 다. Use 았어요 after most stems with ㅏ/ㅗ, 었어요 after others, and 했어요 for 하다; contractions are common.",
    "worked": "가다 → 갔어요. 어제 학교에 갔어요 means 'I went to school yesterday'.",
    "trap": "Do not keep both the old vowel and the new vowel when they contract: 가았어요 is wrong; 갔어요 is correct."
  },
  "gp_eun_modifier": {
    "meaning": "Descriptive verbs (often called adjectives) can go before a noun using -(으)ㄴ: a 'big bag', 'small cat', or 'good book'.",
    "formation": "Remove 다 from a descriptive verb. Add 은 after most consonant-ending stems or ㄴ after vowel-ending stems: 작다 → 작은, 크다 → 큰.",
    "worked": "큰 가방이 있어요: start with 크다 ('to be big'), remove 다, and add ㄴ to 크 to form 큰. Put 큰 directly before 가방 ('bag').",
    "trap": "This is not the present modifier of an action verb: 'a person who reads' needs 읽는 사람. ㄹ-final and some irregular stems also change."
  },
  "gp_man": {
    "meaning": "만 means 'only' or 'just', limiting the person or thing you mean.",
    "formation": "Attach 만 directly to the noun or phrase being restricted: 물만, 나만.",
    "worked": "물만 마셔요: 물 means 'water'. Attach 만 immediately after 물 to limit the drinks to water, rather than saying water is one of several drinks.",
    "trap": "Don't confuse 만 with 도: 물도 means 'water too', but 물만 means 'water and nothing else' in the relevant set."
  },
  "gp_hago": {
    "meaning": "하고 can connect nouns: 'A and B' or 'with someone'. It is commonly used in casual conversation.",
    "formation": "Name the first noun, add 하고, then name the second: 빵하고 우유. If the pair is an object, put 을/를 on the final noun.",
    "worked": "빵하고 우유를 사요 means 'I buy bread and milk'; 를 goes on the whole noun grouping's last word.",
    "trap": "Don't confuse noun-connecting 하고 with action-connecting -고. 먹고 means 'eat and (then)'; 빵하고 means 'bread and'."
  },
  "gp_eusi_honorific": {
    "meaning": "Use -(으)시- inside a verb to show respect to the PERSON being described, not merely the person listening.",
    "formation": "Remove 다, add 시 after a vowel stem or 으시 after most consonant stems, then the ending: 오다 → 오세요, 읽다 → 읽으세요.",
    "worked": "선생님이 오세요 describes the teacher respectfully; 오 + 시 + 어요 contracts to 오세요.",
    "trap": "The same -세요 surface form can also be a polite command. Check who the subject is; do not confuse respect for the subject with polite -요 for the listener."
  },
  "gp_euseyo": {
    "meaning": "Use -(으)세요 to politely ask someone to do something: 'please sit', 'please read'. The same form can also describe a respected subject.",
    "formation": "Remove 다; after most consonant stems add 으세요, after vowel stems add 세요: 읽다 → 읽으세요, 가다 → 가세요.",
    "worked": "여기에 앉으세요 is an instruction to sit here, spoken politely.",
    "trap": "-세요 is not always a command. 선생님이 오세요 is instead an honorific statement; context matters."
  },
  "gp_a_juseyo": {
    "meaning": "Use -아/어 주세요 to ask someone politely to do an action as a favor.",
    "formation": "Add 아/어 to the action stem, then write 주세요 as a separate word: 찍다 → 찍어 주세요.",
    "worked": "사진을 찍어 주세요: 'Please take a photo (for me).' The request asks for the action as a favor.",
    "trap": "-아/어 주세요 is not simply another way to make every imperative. It specifically asks someone to do something for someone else's benefit."
  },
  "gp_aya_hada": {
    "meaning": "Use -아/어야 하다 to say something is necessary: 'must' or 'have to'.",
    "formation": "After the verb stem add 아야/어야, followed by 해요: 가다 → 가야 해요, 먹다 → 먹어야 해요.",
    "worked": "내일 학교에 가야 해요: 가야 says going is required; 해요 completes the obligation.",
    "trap": "'Must not' is NOT -아/어야 안 하다. Use -(으)면 안 되다 or -지 마세요 for prohibitions."
  },
  "gp_go_sipda": {
    "meaning": "Use -고 싶다 to say what you want to do, or ask what the listener wants.",
    "formation": "Add 고 to the action stem and conjugate 싶다: 가다 → 가고 싶어요.",
    "worked": "한국에 가고 싶어요: the speaker wants to go to Korea, not that the trip is already planned.",
    "trap": "For a third person's desire, Korean commonly uses -고 싶어하다, not plain -고 싶다 in a declarative statement."
  },
  "gp_eul_su_issda": {
    "meaning": "Use -(으)ㄹ 수 있다 to say an action is possible or someone has the ability to do it.",
    "formation": "Add 을 to most consonant-ending verb stems or ㄹ to vowel-ending stems, then 수 있어요: 읽다 → 읽을 수 있어요.",
    "worked": "한국어를 읽을 수 있어요: 읽을 수 is the ability to read, and 있어요 says that ability exists.",
    "trap": "Keep 수 as a separate word. 못 읽어요 can express inability too, but does not have the same grammatical structure."
  },
  "gp_eunikka": {
    "meaning": "Use -(으)니까 to explain a reason, often before telling someone what to do or suggesting an action.",
    "formation": "Add 으니까 after most consonant stems or 니까 after vowel stems: 없다 → 없으니까.",
    "worked": "시간이 없으니까 빨리 가세요: 'Since there's no time, please go quickly.' The reason supports an instruction.",
    "trap": "Unlike causal -아/어서 in the beginner pattern, -(으)니까 naturally works before an imperative or suggestion. Past marking is also possible."
  },
  "gp_aseo": {
    "meaning": "Use -아/어서 to connect a cause with its result: 'because X, Y'.",
    "formation": "Add 아서 after ㅏ/ㅗ stems, 어서 after others; 하다 → 해서. Put tense on the main verb in these beginner examples.",
    "worked": "배가 고파서 밥을 먹었어요: being hungry explains eating; only the final verb marks past here.",
    "trap": "Do not use causal -아/어서 before a direct command in the standard beginner pattern. Use -(으)니까 for that reason→command relationship."
  },
  "gp_geuraeseo": {
    "meaning": "그래서 begins a new sentence with the result: 'so' or 'therefore'.",
    "formation": "Say the reason as a finished sentence; start the next sentence with 그래서.",
    "worked": "배가 고팠어요. 그래서 밥을 먹었어요: hunger is one sentence, eating is the consequence.",
    "trap": "그래서 joins sentences, not verb stems. Don't attach it as a suffix like -아/어서."
  },
  "gp_eumyeon": {
    "meaning": "Use -(으)면 to say 'if' or 'when' one condition makes another possible.",
    "formation": "Add 으면 after most consonant-ending verb stems and 면 after vowel-ending stems: 있다 → 있으면.",
    "worked": "시간이 있으면 같이 가요: start with 있다 ('to have'), add 으면 to get 있으면 ('if there is'). Going together depends on having time.",
    "trap": "A final ㄹ stays: 살다 → 살면, not 사으면. For a mere reason ('because'), choose a reason connective instead."
  },
  "gp_jiman": {
    "meaning": "-지만 joins two facts that contrast, meaning 'but'. One fact remains true even though another might make you expect the opposite.",
    "formation": "Attach 지만 directly to the stem of a verb or descriptive verb; no vowel-choice rule: 비싸다 → 비싸지만.",
    "worked": "비싸지만 맛있어요: it is expensive but tasty; the two facts contrast.",
    "trap": "Do not confuse -지만 (inside one sentence) with 하지만 (at the start of a second sentence)."
  },
  "gp_hajiman": {
    "meaning": "하지만 starts a new sentence meaning 'but' or 'however'. It contrasts with what was just said.",
    "formation": "Finish the first sentence. Begin the next with 하지만 and give the unexpected or opposing fact.",
    "worked": "한국어는 어려워요. 하지만 재미있어요: Korean is hard; however, it is fun.",
    "trap": "Don't glue 하지만 onto a verb stem. For two clauses in one sentence use -지만: 어렵지만 재미있어요."
  },
  "gp_go_seq": {
    "meaning": "-고 links actions or lists them: 'do A and do B'. Sometimes the order is sequential, sometimes it just joins facts.",
    "formation": "Attach 고 to the first verb stem, then write the next verb phrase: 먹다 → 먹고.",
    "worked": "아침을 먹고 학교에 가요: breakfast comes first, then going to school.",
    "trap": "-고 does not always mean 'and then'. When two actions must be strictly sequential, -고 나서 makes the order clearer."
  },
  "gp_eulgeyo": {
    "meaning": "Use -(으)ㄹ게요 when the SPEAKER is committing to doing something, often considering the listener.",
    "formation": "After a consonant stem add 을게요; after a vowel stem add ㄹ게요: 하다 → 할게요.",
    "worked": "제가 할게요: 하다 becomes 할게요. The speaker volunteers to do the action and signals that promise to the listener.",
    "trap": "Don't use -(으)ㄹ게요 for a neutral prediction about someone else. -(으)ㄹ 거예요 is used for plans or predictions."
  },
  "gp_eul_geoyeyo": {
    "meaning": "Use -(으)ㄹ 거예요 for a future plan or prediction: 'will', 'going to', 'probably'.",
    "formation": "Use 을 after most consonant stems or ㄹ after vowel stems, then write 거예요 separately: 가다 → 갈 거예요.",
    "worked": "내일 한국어를 공부할 거예요: 공부하다 becomes 공부할. Add 거예요 separately to express the speaker's future study plan.",
    "trap": "Keep 거예요 as a separate word. Compare 제가 할게요 (commitment) with 제가 할 거예요 (plan)."
  },
  "gp_neyo": {
    "meaning": "-네요 shows the speaker has just noticed or reacted to something: 'Oh, it's...'",
    "formation": "Take off 다 from the dictionary form and add 네요: 좋다 → 좋네요. Use this ending when reacting to something you have noticed.",
    "worked": "날씨가 좋네요: the speaker notices and reacts to the pleasant weather.",
    "trap": "-네요 is not just a normal fact-reporting -아요/어요 ending; it carries a feeling of discovery or reaction."
  },
  "gp_jiyo": {
    "meaning": "-지요/죠 often asks for agreement or checks something the speaker thinks the listener knows: 'right?'",
    "formation": "Add 지요 to a stem; in speech it commonly contracts to 죠: 재미있다 → 재미있지요?",
    "worked": "한국어는 재미있지요? checks or invites agreement that Korean is interesting.",
    "trap": "Don't use -지요 for every neutral question. It often implies an expectation that the statement is true."
  },
  "gp_n_geos_gatda": {
    "meaning": "-(으)ㄴ 것 같다 softens a judgment about a PRESENT state: 'seems', 'looks like', or 'I think'.",
    "formation": "Use a descriptive verb's -(으)ㄴ modifier before 것 같아요: 비싸다 → 비싼 것 같아요.",
    "worked": "이 음식은 비싼 것 같아요: the speaker believes the food seems expensive, rather than stating it as certain.",
    "trap": "Action-verb predictions usually use -(으)ㄹ 것 같아요, not this present descriptive-verb pattern. 것 is a separate word."
  }
};
