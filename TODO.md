# TODO — NIST CSF 2.0

## Completed

- [x] fetchJSON error handling fix (proper HTTP status checking)
- [x] `_meta` field filtering (excluded from rendered counts and UI)
- [x] Risk management diversity (4 treatment strategies, 20 risks across all functions)
- [x] Dark mode (CSS `prefers-color-scheme` auto-detection)
- [x] Favicon (SVG)
- [x] GitHub Pages deployment workflow (`.github/workflows/pages.yml`)
- [x] AI-generated content disclaimer (README section + `sourceType: "constructed-indicative"` in `_meta` fields)
- [x] Audit Package UI on subcategory detail view (artifacts + evidence)
- [x] `controlSlugs[]` on 57 artifacts for direct semantic mapping
- [x] `artifactSlugs[]` on 336 evidence items for artifact-evidence linkage
- [x] `sourceType` metadata on evidence, artifacts, and risk-management files
- [x] Stale counts corrected in app.js and README
- [x] `sourceType` `_meta` field on remaining JSON files (core/, implementation/index.json, references/index.json, artifacts/subcategory-map.json) — `official-extracted` for NIST source data, `constructed-indicative` for AI-generated layers

## Remaining

- [ ] Document templates (currently 0 -- no `templates/` directory; PDPA-MY has 60 as reference)
- [x] Persistent navigation bar (sticky header with section links)
- [ ] Compliance maturity scoring (visual maturity assessment across subcategories)
- [ ] Export functionality (PDF/CSV export of subcategories, evidence, artifacts, etc.)
