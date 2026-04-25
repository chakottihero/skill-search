"""
Dedup script for skills.json
Level 1: exact name+desc or exact content
Level 2: same name + desc sim>=90% or same content first 200 chars
Level 3: same name + same author + desc sim>=70% AND content sim>=70%
Keeps: most stars; tie → shorter/more known repoUrl
"""
import json, sys, os, time
from collections import defaultdict

SKILLS_PATH = "data/skills.json"

def levenshtein(a, b):
    if len(a) > 800: a = a[:800]
    if len(b) > 800: b = b[:800]
    m, n = len(a), len(b)
    prev = list(range(n + 1))
    for i in range(1, m + 1):
        curr = [i] + [0] * n
        for j in range(1, n + 1):
            if a[i-1] == b[j-1]:
                curr[j] = prev[j-1]
            else:
                curr[j] = 1 + min(prev[j], curr[j-1], prev[j-1])
        prev = curr
    return prev[n]

def similarity(a, b):
    a, b = (a or "").strip(), (b or "").strip()
    if not a and not b: return 1.0
    if not a or not b: return 0.0
    longer  = a if len(a) >= len(b) else b
    shorter = b if len(a) >= len(b) else a
    if len(longer) == 0: return 1.0
    dist = levenshtein(longer, shorter)
    return (len(longer) - dist) / len(longer)

def author(skill):
    url = skill.get("repoUrl", "")
    parts = url.replace("https://github.com/", "").split("/")
    return parts[0] if parts else ""

def pick_winner(group):
    """Return the best skill from a group (most stars, then shorter repoUrl)."""
    return max(group, key=lambda s: (s.get("stars", 0), -len(s.get("repoUrl", ""))))

def main():
    print("Loading skills.json...")
    with open(SKILLS_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    skills = data.get("skills", [])
    original_count = len(skills)
    print(f"Loaded {original_count:,} skills")

    # Backup
    ts = int(time.time())
    backup_path = f"data/skills_backup_{ts}.json"
    with open(backup_path, "w", encoding="utf-8") as f:
        json.dump(data, f)
    print(f"Backup saved: {backup_path}")

    to_delete = set()  # indices of skills to remove

    # ── Level 1: Exact duplicates ─────────────────────────────────────────────
    print("\n[Level 1] Exact duplicate check...")
    # 1a: exact name + description
    seen_name_desc = {}
    for i, s in enumerate(skills):
        key = (s.get("name","").strip(), (s.get("description","") or "").strip())
        if key in seen_name_desc:
            prev_i = seen_name_desc[key]
            # keep higher stars
            if s.get("stars", 0) >= skills[prev_i].get("stars", 0):
                to_delete.add(prev_i)
                seen_name_desc[key] = i
            else:
                to_delete.add(i)
        else:
            seen_name_desc[key] = i

    l1a = len(to_delete)
    print(f"  1a name+desc exact: {l1a:,} duplicates")

    # 1b: exact content (non-empty)
    seen_content = {}
    for i, s in enumerate(skills):
        if i in to_delete: continue
        c = (s.get("content") or "").strip()
        if not c or len(c) < 50: continue
        if c in seen_content:
            prev_i = seen_content[c]
            if s.get("stars", 0) >= skills[prev_i].get("stars", 0):
                to_delete.add(prev_i)
                seen_content[c] = i
            else:
                to_delete.add(i)
        else:
            seen_content[c] = i

    l1b = len(to_delete) - l1a
    print(f"  1b content exact:   {l1b:,} duplicates")
    print(f"  Level 1 total: {len(to_delete):,}")

    # ── Level 2: Same name, high similarity ───────────────────────────────────
    print("\n[Level 2] Same-name similarity check (desc>=90% or content[:200] same)...")
    # Group remaining by normalized name
    name_groups = defaultdict(list)
    for i, s in enumerate(skills):
        if i in to_delete: continue
        name_groups[s.get("name","").strip().lower()].append(i)

    l2_count = 0
    groups_processed = 0
    for name, indices in name_groups.items():
        if len(indices) < 2: continue
        groups_processed += 1
        if groups_processed % 500 == 0:
            print(f"  ... {groups_processed} groups done, {l2_count} new dups found")

        # Compare each pair in the group
        merged = []  # list of sets (clusters)
        assigned = {}
        for idx in indices:
            s = skills[idx]
            found_cluster = None
            for ci, cluster in enumerate(merged):
                rep_idx = next(iter(cluster))
                rep = skills[rep_idx]
                # Check desc similarity
                desc_sim = similarity(s.get("description",""), rep.get("description",""))
                # Check content[:200] exact
                sc = (s.get("content") or "")[:200].strip()
                rc = (rep.get("content") or "")[:200].strip()
                content_match = sc and rc and sc == rc
                if desc_sim >= 0.90 or content_match:
                    found_cluster = ci
                    break
            if found_cluster is not None:
                merged[found_cluster].add(idx)
            else:
                merged.append({idx})

        # For each cluster with >1 member, keep winner, delete rest
        for cluster in merged:
            if len(cluster) < 2: continue
            group = [skills[i] for i in cluster]
            winner = pick_winner(group)
            winner_idx = next(i for i in cluster if skills[i] is winner)
            for i in cluster:
                if i != winner_idx and i not in to_delete:
                    to_delete.add(i)
                    l2_count += 1

    print(f"  Level 2 total: {l2_count:,} new duplicates")
    print(f"  Running total: {len(to_delete):,}")

    # ── Level 3: Same name + same author + high similarity ────────────────────
    print("\n[Level 3] Same-name + same-author similarity check (sim>=70%)...")
    # Re-group remaining by (normalized_name, author)
    na_groups = defaultdict(list)
    for i, s in enumerate(skills):
        if i in to_delete: continue
        key = (s.get("name","").strip().lower(), author(s).lower())
        na_groups[key].append(i)

    l3_count = 0
    for (name, auth), indices in na_groups.items():
        if len(indices) < 2 or not auth: continue

        merged = []
        for idx in indices:
            s = skills[idx]
            found_cluster = None
            for ci, cluster in enumerate(merged):
                rep_idx = next(iter(cluster))
                rep = skills[rep_idx]
                desc_sim = similarity(s.get("description",""), rep.get("description",""))
                # Content: compare first 500 chars
                sc = (s.get("content") or "")[:500]
                rc = (rep.get("content") or "")[:500]
                cont_sim = similarity(sc, rc)
                if desc_sim >= 0.70 and cont_sim >= 0.70:
                    found_cluster = ci
                    break
            if found_cluster is not None:
                merged[found_cluster].add(idx)
            else:
                merged.append({idx})

        for cluster in merged:
            if len(cluster) < 2: continue
            group = [skills[i] for i in cluster]
            winner = pick_winner(group)
            winner_idx = next(i for i in cluster if skills[i] is winner)
            for i in cluster:
                if i != winner_idx and i not in to_delete:
                    to_delete.add(i)
                    l3_count += 1

    print(f"  Level 3 total: {l3_count:,} new duplicates")
    print(f"  Total to delete: {len(to_delete):,}")

    # ── Save ─────────────────────────────────────────────────────────────────
    remaining = [s for i, s in enumerate(skills) if i not in to_delete]
    print(f"\nResults:")
    print(f"  Original:  {original_count:,}")
    print(f"  Deleted:   {len(to_delete):,}")
    print(f"  Remaining: {len(remaining):,}")

    # Sanitize surrogate characters before saving
    def sanitize(obj):
        if isinstance(obj, str):
            return obj.encode("utf-8", "surrogatepass").decode("utf-8", "replace")
        if isinstance(obj, dict):
            return {k: sanitize(v) for k, v in obj.items()}
        if isinstance(obj, list):
            return [sanitize(v) for v in obj]
        return obj

    data["skills"] = sanitize(remaining)
    with open(SKILLS_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)
    print(f"\nSaved {len(remaining):,} skills to {SKILLS_PATH}")

if __name__ == "__main__":
    main()
