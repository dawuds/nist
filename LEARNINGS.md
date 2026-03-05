# LEARNINGS.md — NIST CSF 2.0

Lessons and best practice design patterns for this repository.

---

## Audit Package — Best Practice Design Pattern

### What It Is

The "Audit Package" is a reusable UI component on the control detail view that links controls to their required artifacts and evidence items. It answers three questions an auditor asks when reviewing a control:

1. **What must I implement?** → Key Activities + Maturity Levels (existing)
2. **What documents must exist?** → Required Artifacts (new)
3. **How do I verify it works?** → Evidence Checklist (new)

### Architecture

```
Control (slug)
  └─ controlSlugs[] on artifacts → direct semantic mapping
       │
       ├─ artifacts/inventory.json → full artifact objects
       │    └─ each with keyContents[], mandatory flag
       │
       └─ evidence/by-function/[function] → evidenceItems[]
            └─ each with artifactSlugs[], whatGoodLooksLike[], commonGaps[]
```

**NIST-specific join key:** Subcategory ID (e.g., `GV.OC-01`, `PR.AA-01`) via `subcategoryId` on each control. But artifacts and evidence use **direct `controlSlugs[]`** mapping, not subcategory-based joins.

### Why Direct Mapping Over Section-Based Joins

Section-based joins (via provision maps) explode on broad provisions. In the PDPA-MY repo, s6 (General Principle) mapped to 19 of 60 artifacts — producing 20 results for a single control. The same problem applies to NIST's broad functions/categories. Direct `controlSlugs[]` on each artifact provides curated, semantically relevant mappings (median 2 per control, max 6).

**Rule of thumb:** If a join key can match >5 items, the join is too broad and needs direct curation.

### Implementation Checklist

1. Ensure the repo has `controls/`, `artifacts/`, `evidence/` directories with the standard structure
2. Add `controlSlugs[]` to each artifact in `artifacts/inventory.json` — curate 1-4 control slugs per artifact
3. Add `artifactSlugs[]` to each evidence item in `evidence/` — link 1-2 artifact slugs per item
4. In `renderControlDetail()`, load artifacts + evidence data (use existing state cache)
5. Filter artifacts where `controlSlugs` includes the current control's slug
6. Filter evidence items by artifact overlap (evidence linked to artifacts that are linked to the control)
7. Sort artifacts mandatory-first
8. Render the Audit Package HTML using the shared CSS classes
9. Ensure nested accordion click handlers work (reuse existing `[data-accordion]` handler)

### UI Components (CSS classes — shared across all repos)

| Class | Purpose |
|-------|---------|
| `.audit-package` | Wrapper — accent top border, light blue background |
| `.audit-package-title` | "AUDIT PACKAGE" uppercase label |
| `.audit-package-summary` | "N artifacts required, M evidence items" |
| `.artifact-link-card` | Compact artifact card with hover |
| `.artifact-link-card-checklist` | Checkbox-styled keyContents list |
| `.evidence-checklist-item` | Evidence item card |
| `.evidence-good` | Green-bordered "What Good Looks Like" list |
| `.evidence-gap` | Red-bordered "Common Gaps" list |

### Design Decisions

- **Direct `controlSlugs[]` mapping chosen over subcategory-based joins:** Curated semantic mappings prevent broad subcategories from flooding results.
- **`artifactSlugs[]` on evidence items:** Evidence filtered by artifact overlap ensures only relevant evidence appears per control.
- **Mandatory artifacts sorted first:** Auditors prioritize mandatory items.
- **Evidence sub-accordions collapsed by default:** "What Good Looks Like" and "Common Gaps" are verbose — show on demand.
- **Checkbox-styled artifact contents:** Makes artifact cards feel like an auditor's checklist.

### Reference Implementation

See `dawuds/pdpa-my` repo — `app.js` lines 664-870 (`renderControlDetail()`) and `style.css` Audit Package section. Pattern is designed for copy-adapt across all compliance repos.

---

## Verification Checklist

- [ ] All NIST CSF 2.0 codes use `XX.YY-nn` format (not SP 800-53 `XX-n` format)
- [ ] `sourceType` field present on every JSON file
- [ ] Field names in new JSON files cross-referenced against the app.js renderer
- [ ] All cross-references resolvable in both directions
- [ ] README/app.js counts match actual JSON data array lengths
