"""Quick sanity check for the 3-DB multi-search (Postgres + Neo4j + Qdrant) via /api/auriance/rag-answer.

Usage (backend must be running):
  python test_multi_db_rag.py --question "Montre-moi les patients avec de la fièvre" --base http://localhost:8000

This prints:
- the generated SQL/Cypher/vector query strings
- per-DB hit counts
- per-DB partial errors if any
"""

from __future__ import annotations

import argparse
import json
from typing import Any, Dict

import urllib.parse
import urllib.request


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", default="http://localhost:8000")
    parser.add_argument(
        "--question",
        default="Montre-moi les patients avec de la fièvre",
    )
    parser.add_argument("--top-k", type=int, default=5)
    parser.add_argument(
        "--timeout",
        type=int,
        default=180,
        help="HTTP timeout in seconds (use higher values for first model downloads)",
    )
    args = parser.parse_args()

    url = f"{args.base.rstrip('/')}/api/auriance/rag-answer"
    data = {
        "question": args.question,
        "top_k": str(args.top_k),
        "language": "fr",
        "translate_response": "false",
    }

    body = urllib.parse.urlencode(data).encode("utf-8")
    req = urllib.request.Request(url, data=body, method="POST")
    req.add_header(
        "Content-Type",
        "application/x-www-form-urlencoded; charset=utf-8",
    )
    req.add_header("Accept-Charset", "utf-8")

    try:
        with urllib.request.urlopen(req, timeout=args.timeout) as resp:
            raw = resp.read().decode("utf-8")
            status = getattr(resp, "status", 200)
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", errors="replace")
        print(f"HTTP {e.code}: {raw}")
        return 1
    except Exception as e:
        print(f"Request failed: {e}")
        return 1

    if status != 200:
        print(f"HTTP {status}: {raw}")
        return 1

    res: Dict[str, Any] = json.loads(raw)

    print("\n=== QUERIES ===")
    print("SQL:")
    print(res.get("sql_query") or "—")
    print("\nCypher:")
    print(res.get("cypher_query") or "—")
    print("\nVector:")
    print(res.get("vector_query") or "—")

    print("\n=== COUNTS ===")
    print("Qdrant:", len(res.get("hits_qdrant") or []))
    print("Postgres:", len(res.get("hits_postgres") or []))
    print("Neo4j:", len(res.get("hits_neo4j") or []))

    print("\n=== PARTIAL ERRORS ===")
    print("qdrant_error:", res.get("qdrant_error") or "—")
    print("postgres_error:", res.get("postgres_error") or "—")
    print("neo4j_error:", res.get("neo4j_error") or "—")

    print("\n=== ANSWER (preview) ===")
    ans = (res.get("answer") or "").strip()
    print(ans[:400] + ("..." if len(ans) > 400 else ""))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
