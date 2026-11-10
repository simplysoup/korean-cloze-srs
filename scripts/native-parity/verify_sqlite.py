#!/usr/bin/env python3
"""Read-only native SQLite parity/survival verifier. Python 3 stdlib only.

Examples:
  python3 scripts/native-parity/verify_sqlite.py --db old.db --capture before.json
  python3 scripts/native-parity/verify_sqlite.py --db upgraded.db --compare before.json

Export app-private SQLite files through an authorized emulator/device workflow.
Do not use this script to edit, clear, or migrate a user's database.
"""
import argparse
import hashlib
import json
import sqlite3
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
BUNDLES = [
    "topik1-level1", "topik1-level2", "topik2-level3",
    "topik2-level4", "topik2-level5", "topik2-level6",
]
USER_TABLES = [
    "review_cards", "review_logs", "library_decks", "user_deck_progress",
    "user_streaks", "users", "device_trust",
]
VERSION = "native-parity-v3-20261110"


def j(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def tables(conn):
    return {
        r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table'")
    }


def capture_user_snapshot(conn):
    """Digest every exact row without storing PII or authentication secrets."""
    existing = tables(conn)
    snapshot = {}
    for table in USER_TABLES + ["meta"]:
        if table not in existing:
            continue
        rows = []
        for row in conn.execute(f'SELECT * FROM "{table}"'):
            d = dict(row)
            if table == "meta" and d["key"] in ("contentVersion", "libraryMigrated"):
                continue
            # SQLite BLOB fields are rare, but account fields must round-trip.
            rows.append({k: ({"blob_hex": v.hex()} if isinstance(v, bytes) else v)
                         for k, v in d.items()})
        canonical = j(sorted(rows, key=j)).encode("utf-8")
        # Persist only a count and digest, never an email, hash, token or
        # review-history record. This still detects a single-field change.
        snapshot[table] = {
            "row_count": len(rows),
            "sha256": hashlib.sha256(canonical).hexdigest(),
        }
    return snapshot


def validate_survival(conn, before):
    after = capture_user_snapshot(conn)
    errors = []
    for table, summary in before.items():
        if table not in after:
            errors.append(f"User table disappeared: {table}")
        elif summary != after[table]:
            errors.append(f"History/settings changed in {table}: "
                          f"{summary['row_count']} rows before, "
                          f"{after[table]['row_count']} after")
    for table, summary in after.items():
        if table not in before and summary["row_count"]:
            errors.append(f"Unexpected user rows appeared in {table}")
    return errors


def authored_rows():
    expected = {name: {} for name in (
        "grammar_points", "cloze_cards", "cloze_card_grammar_targets",
        "lesson_examples", "deck_grammar_points", "decks",
    )}
    position = 0
    for deck_order, name in enumerate(BUNDLES):
        bundle = json.loads((REPO / "mobile/src/content" / (name + ".json")).read_text())
        d = bundle["deck"]
        expected["decks"][d["id"]] = {
            "title": d["title"], "slug": d["slug"], "level": d["level"],
            "topik_level": d["topikLevel"], "sort_order": deck_order,
        }
        deck_pos = 0
        for lesson in bundle["lessons"]:
            for gp in lesson["grammarPoints"]:
                position += 1
                deck_pos += 1
                gid = gp["id"]
                expected["grammar_points"][gid] = {
                    "title": gp["title"], "category": gp["category"],
                    "tense": gp["tense"], "register": gp["register"],
                    "hint": gp["hint"], "description": gp["description"],
                    "level": gp["level"], "tags": gp["tags"],
                    "structure_pattern": gp["structurePattern"],
                    "notes": gp["notes"],
                    "related_point_ids": gp.get("relatedPointIds") or [],
                    "lesson_number": lesson["lessonNumber"], "position": position,
                }
                rel_id = f'dgp_{d["id"]}_{gid}'
                expected["deck_grammar_points"][rel_id] = {
                    "deck_id": d["id"], "grammar_point_id": gid,
                    "sort_order": deck_pos - 1, "lesson_number": lesson["lessonNumber"],
                }
                for card in gp["cards"]:
                    cid = card["id"]
                    expected["cloze_cards"][cid] = {
                        "grammar_point_id": gid,
                        "full_sentence": card["fullSentence"],
                        "sentence_with_blank": card["sentenceWithBlank"],
                        "vocab_base_form": card["vocabBaseForm"],
                        "answer": card["answer"],
                        "alternate_answers": card["alternateAnswers"],
                        "english_hint": card["englishHint"],
                        "introduced_at_position": card["introducedAtPosition"],
                    }
                    targets = [(gid, card["answer"], 0)] + [
                        (t["grammarPointId"], t["wordReplacement"], t["blankIndex"])
                        for t in card.get("extraTargets", [])
                    ]
                    for target_gp, replacement, blank in targets:
                        tid = f"tgt_{cid}_{target_gp}"
                        expected["cloze_card_grammar_targets"][tid] = {
                            "cloze_card_id": cid, "grammar_point_id": target_gp,
                            "word_replacement": replacement, "blank_index": blank,
                        }
                for ex in gp["lessonExamples"]:
                    expected["lesson_examples"][ex["id"]] = {
                        "grammar_point_id": gid,
                        "full_sentence": ex["fullSentence"],
                        "sentence_with_blank": ex["sentenceWithBlank"],
                        "answer": ex["answer"], "english_hint": ex["englishHint"],
                        "order": ex["order"], "notes": ex.get("notes"),
                    }
    expected["decks"]["deck_non_topik"] = {
        "title": "Non-TOPIK", "slug": "non-topik", "level": 0,
        "topik_level": "non-topik", "sort_order": 6,
    }
    return expected


JSON_COLUMNS = {
    ("grammar_points", "tags"),
    ("grammar_points", "notes"),
    ("grammar_points", "related_point_ids"),
    ("cloze_cards", "alternate_answers"),
    ("cloze_cards", "english_hint"),
    ("lesson_examples", "english_hint"),
}


def validate_content(conn):
    errors = []
    expected = authored_rows()
    existing = tables(conn)
    for table, entries in expected.items():
        if table not in existing:
            errors.append(f"Missing table: {table}")
            continue
        found = {row["id"]: dict(row)
                 for row in conn.execute(f'SELECT * FROM "{table}"')}
        missing = set(entries) - set(found)
        unexpected = set(found) - set(entries)
        if missing:
            errors.append(f"{table}: missing IDs: {sorted(missing)[:8]}")
        if unexpected:
            errors.append(f"{table}: extra IDs: {sorted(unexpected)[:8]}")
        for pk, want in entries.items():
            got = found.get(pk)
            if got is None:
                continue
            for field, value in want.items():
                actual = got.get(field)
                if (table, field) in JSON_COLUMNS and actual is not None:
                    try:
                        actual = json.loads(actual)
                    except (ValueError, TypeError):
                        errors.append(f"{table} {pk}: malformed JSON in {field}")
                        continue
                if actual != value:
                    errors.append(f"{table} {pk}: {field} differs from authoring source")
    if "meta" in existing:
        ver = conn.execute("SELECT value FROM meta WHERE key='contentVersion'").fetchone()
        if ver is None or ver["value"] != VERSION:
            errors.append(f"Unexpected contentVersion (expected {VERSION}): {ver}")
    else:
        errors.append("Missing table: meta")
    # These are independent of the ID and count checks.
    for table, pair in [
        ("cloze_card_grammar_targets", ("cloze_card_id", "grammar_point_id")),
        ("deck_grammar_points", ("deck_id", "grammar_point_id")),
    ]:
        if table in existing:
            p, q = pair
            duplicate = conn.execute(
                f'SELECT COUNT(*) FROM (SELECT 1 FROM "{table}" '
                f'GROUP BY "{p}", "{q}" HAVING COUNT(*) > 1)'
            ).fetchone()[0]
            if duplicate:
                errors.append(f"{table}: {duplicate} duplicate relation pairs")
    for sql, label in [
        ("""SELECT COUNT(*) FROM cloze_card_grammar_targets t
             LEFT JOIN cloze_cards c ON t.cloze_card_id=c.id
             LEFT JOIN grammar_points g ON t.grammar_point_id=g.id
             WHERE c.id IS NULL OR g.id IS NULL""", "orphaned cloze targets"),
        ("""SELECT COUNT(*) FROM deck_grammar_points d
             LEFT JOIN decks k ON d.deck_id=k.id
             LEFT JOIN grammar_points g ON d.grammar_point_id=g.id
             WHERE k.id IS NULL OR g.id IS NULL""", "orphaned deck relations"),
    ]:
        if {"cloze_cards", "grammar_points", "cloze_card_grammar_targets",
            "deck_grammar_points", "decks"}.issubset(existing):
            count = conn.execute(sql).fetchone()[0]
            if count:
                errors.append(f"{count} {label}")
    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--db", required=True, type=Path, help="Copied native SQLite database")
    parser.add_argument("--capture", type=Path, help="Write pre-upgrade user-row snapshot")
    parser.add_argument("--compare", type=Path, help="Compare with pre-upgrade user-row snapshot")
    parser.add_argument("--skip-content", action="store_true",
                        help="Use only for pre-upgrade snapshot capture")
    args = parser.parse_args()
    if args.capture and args.compare:
        parser.error("Choose --capture or --compare, not both")
    uri = args.db.resolve().as_uri() + "?mode=ro"
    with sqlite3.connect(uri, uri=True) as conn:
        conn.row_factory = sqlite3.Row
        errors = []
        if not args.skip_content:
            errors.extend(validate_content(conn))
        if args.compare:
            baseline = json.loads(args.compare.read_text())
            errors.extend(validate_survival(conn, baseline))
        if args.capture:
            args.capture.write_text(json.dumps(capture_user_snapshot(conn),
                                              ensure_ascii=False, indent=2))
        if errors:
            print(f"FAIL: {len(errors)} parity/history issues")
            for error in errors[:50]:
                print(" -", error)
            return 1
        print("PASS: native SQLite content and user-history checks", "(snapshot only)" if args.skip_content else "")
        return 0


if __name__ == "__main__":
    sys.exit(main())
