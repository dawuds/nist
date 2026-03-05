# NIST Cybersecurity Framework 2.0 — Structured Compliance Database

Machine-readable extraction of the **NIST Cybersecurity Framework (CSF) 2.0**, with six integrated data layers: core framework hierarchy, cross-framework reference mappings, implementation guidance, assessment evidence, audit artifacts, and risk management.

132 subcategories across 6 functions and 22 categories, sourced from the official [NIST CSF 2.0 Reference Tool](https://csrc.nist.gov/Projects/cybersecurity-framework).

## Repository Structure

```
core/                                   # Layer 1: Framework hierarchy
  functions.json                        # 6 functions with descriptions
  categories.json                       # 22 categories with descriptions
  subcategories.json                    # 132 subcategories with implementation examples
  index.json                            # Full nested hierarchy (function → category → subcategory)
  by-function/
    GV-govern.json                      # 31 subcategories across 6 categories
    ID-identify.json                    # 22 subcategories across 3 categories
    PR-protect.json                     # 31 subcategories across 5 categories
    DE-detect.json                      # 17 subcategories across 2 categories
    RS-respond.json                     # 21 subcategories across 4 categories
    RC-recover.json                     # 10 subcategories across 2 categories

references/                             # Layer 2: Cross-framework mappings
  index.json                            # All informative references by subcategory
  by-framework/
    sp800-53.json                       # NIST SP 800-53 Rev 5 control mappings
    iso27001.json                       # ISO/IEC 27001:2022 mappings
    pci-dss.json                        # PCI DSS v4.0 mappings
    cri-profile.json                    # CRI Profile v2.0 mappings
    ccmv4.json                          # CSA Cloud Controls Matrix v4.0 mappings
    sp800-171.json                      # NIST SP 800-171 Rev 3 mappings
    sp800-37.json                       # NIST SP 800-37 Rev 2 (RMF) mappings
    sp800-221a.json                     # NIST SP 800-221A mappings
    csf-v1.1.json                       # Legacy CSF v1.1 backward-compatibility mappings
    cis-controls.json                   # CIS Controls v8 mappings
    nice-framework.json                 # NICE Workforce Framework mappings
    scf.json                            # Secure Controls Framework mappings
    sp800-218.json                      # NIST SP 800-218 (SSDF) mappings
    cop.json                            # Code of Practice mappings
    irp.json                            # Incident Response Plan references

implementation/                         # Layer 3: Implementation guidance (AI-generated)
  index.json                            # All guidance keyed by subcategory ID
  by-function/
    GV-govern.json … RC-recover.json

evidence/                               # Layer 4: Assessment evidence (AI-generated)
  index.json                            # All evidence keyed by subcategory ID
  by-function/
    GV-govern.json … RC-recover.json

artifacts/                              # Layer 5: Assessment artifacts (AI-generated)
  inventory.json                        # All artifacts grouped by category
  subcategory-map.json                  # Bidirectional subcategory ↔ artifact mappings

risk-management/                        # Layer 6: Risk management (AI-generated)
  methodology.json                      # Risk assessment methodology aligned to CSF 2.0 + SP 800-30
  risk-matrix.json                      # 5×5 likelihood/impact risk matrix with risk levels
  risk-register.json                    # 20 cyber risks mapped to CSF functions and subcategories
  checklist.json                        # 18-item risk assessment checklist by CSF function
  treatment-options.json                # 4 treatment strategies with CSF-aligned examples
```

## Core Schema

### Function

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Function code (e.g. `"GV"`) |
| `name` | string | Function name (e.g. `"GOVERN"`) |
| `description` | string | Outcome statement from NIST |

### Category

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Category code (e.g. `"GV.OC"`) |
| `functionId` | string | Parent function code |
| `name` | string | Category name (e.g. `"Organizational Context"`) |
| `description` | string | Outcome statement from NIST |

### Subcategory

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Subcategory code (e.g. `"GV.OC-01"`) |
| `categoryId` | string | Parent category code |
| `functionId` | string | Parent function code |
| `description` | string | Outcome statement from NIST |
| `implementationExamples` | string[] | Official NIST implementation examples |

## References Schema

Each entry in `references/index.json` (keyed by subcategory ID):

| Field | Type | Description |
|-------|------|-------------|
| `subcategoryId` | string | Subcategory code |
| `references` | object[] | Array of informative references |

Each reference:

| Field | Type | Description |
|-------|------|-------------|
| `framework` | string | Framework identifier (e.g. `"SP 800-53 Rev 5.2.0"`) |
| `control` | string | Specific control/clause (e.g. `"PM-11"`) |
| `raw` | string | Original reference string from NIST |

Each `by-framework/*.json` file (keyed by framework control ID):

| Field | Type | Description |
|-------|------|-------------|
| `control` | string | Framework control ID |
| `subcategories` | string[] | CSF 2.0 subcategory IDs that map to this control |

## Implementation Schema

Each entry in `implementation/index.json` (keyed by subcategory ID):

| Field | Type | Description |
|-------|------|-------------|
| `subcategoryId` | string | Subcategory code |
| `categoryId` | string | Parent category code |
| `functionId` | string | Parent function code |
| `title` | string | Short descriptive title |
| `objective` | string | What this subcategory achieves |
| `keyActivities` | object[] | Implementation activities |
| `maturity` | object | Three-tier maturity model |

Each key activity:

| Field | Type | Description |
|-------|------|-------------|
| `activity` | string | What must be done |
| `owner` | string | Responsible role |
| `frequency` | string | Execution frequency |
| `priority` | string | `"Critical"`, `"High"`, or `"Medium"` |

Maturity levels:

| Field | Type | Description |
|-------|------|-------------|
| `basic` | string | Minimum acceptable — ad-hoc, informal |
| `mature` | string | Defined, repeatable, measured |
| `advanced` | string | Optimized, adaptive, metrics-driven |

## Evidence Schema

Each entry in `evidence/index.json` (keyed by subcategory ID):

| Field | Type | Description |
|-------|------|-------------|
| `subcategoryId` | string | Subcategory code |
| `categoryId` | string | Parent category code |
| `functionId` | string | Parent function code |
| `title` | string | Short descriptive title |
| `assessorFocus` | string | What an assessor specifically looks for |
| `evidenceItems` | object[] | Detailed evidence items |
| `assessmentTips` | string[] | Actionable preparation tips |

Each evidence item:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Evidence ID (e.g. `"GV.OC-01-E1"`) |
| `name` | string | Evidence name |
| `description` | string | What this evidence demonstrates |
| `whatGoodLooksLike` | string[] | Indicators of strong evidence |
| `commonGaps` | string[] | Typical deficiencies assessors flag |
| `suggestedSources` | string[] | Where to obtain this evidence |
| `format` | string | Expected document format |
| `retentionPeriod` | string | How long to retain |

## Artifact Schema

Artifacts in `artifacts/inventory.json` are grouped by category (`policies`, `procedures`, `standards`, `evidence`, `reports`, `logs`).

Each artifact:

| Field | Type | Description |
|-------|------|-------------|
| `slug` | string | Unique identifier (e.g. `"cybersecurity-risk-management-policy"`) |
| `name` | string | Artifact name |
| `category` | string | `"policies"`, `"procedures"`, `"standards"`, `"evidence"`, `"reports"`, or `"logs"` |
| `description` | string | Purpose and content |
| `format` | string | Expected format |
| `subcategories` | string[] | Subcategory IDs this artifact serves |
| `owner` | string | Responsible role |
| `reviewFrequency` | string | How often to review/update |
| `typicalPages` | string | Expected document size |
| `keyContents` | string[] | Expected sections/content |

`artifacts/subcategory-map.json` contains:

| Field | Type | Description |
|-------|------|-------------|
| `subcategoryToArtifacts` | object | Subcategory ID → artifact slug[] |
| `artifactToSubcategories` | object | Artifact slug → subcategory ID[] |

## Risk Management Schema

### Risk Register Entry

Each risk in `risk-management/risk-register.json`:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Risk identifier (e.g. `"CR-001"`) |
| `title` | string | Short risk title |
| `description` | string | Detailed risk description |
| `csfFunction` | string | NIST CSF 2.0 function code |
| `csfCategory` | string | Category name (e.g. `"Identify"`) |
| `csfSubcategory` | string | Specific subcategory (e.g. `"ID.AM-01"`) |
| `likelihood` | number | Inherent likelihood (1-5) |
| `impact` | number | Inherent impact (1-5) |
| `inherentRisk` | number | Likelihood x Impact score |
| `inherentRiskLevel` | string | `"Critical"`, `"High"`, `"Medium"`, `"Low"`, or `"Very Low"` |
| `existingControls` | string[] | Controls already in place |
| `residualLikelihood` | number | Likelihood after controls (1-5) |
| `residualImpact` | number | Impact after controls (1-5) |
| `residualRisk` | number | Residual risk score |
| `residualRiskLevel` | string | Residual risk level |
| `treatment` | string | Treatment strategy (Mitigate, Transfer, Accept, Avoid) |
| `treatmentPlan` | string | Planned treatment actions |
| `owner` | string | Risk owner role |
| `reviewDate` | string | Next review date |

### Checklist Item

Each item in `risk-management/checklist.json`:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Checklist item ID (e.g. `"CHK-01"`) |
| `csfFunction` | string | NIST CSF 2.0 function code |
| `csfSubcategory` | string | Referenced subcategory |
| `title` | string | Assessment activity title |
| `description` | string | What to verify |
| `verificationCriteria` | string[] | Specific criteria to check |
| `assessorQuestions` | string[] | Questions to ask during assessment |

## Functions Overview

| Function | Code | Categories | Subcategories | Description |
|----------|------|------------|---------------|-------------|
| Govern | GV | 6 | 31 | Cybersecurity risk management strategy, expectations, and policy |
| Identify | ID | 3 | 22 | Current cybersecurity risks are understood |
| Protect | PR | 5 | 31 | Safeguards to manage cybersecurity risks |
| Detect | DE | 2 | 17 | Possible attacks and compromises are found and analyzed |
| Respond | RS | 4 | 21 | Actions regarding detected incidents are taken |
| Recover | RC | 2 | 10 | Affected assets and operations are restored |

## Categories

| Category | Name | Subcategories |
|----------|------|---------------|
| GV.OC | Organizational Context | 5 |
| GV.RM | Risk Management Strategy | 7 |
| GV.RR | Roles, Responsibilities, and Authorities | 4 |
| GV.PO | Policy | 2 |
| GV.OV | Oversight | 3 |
| GV.SC | Cybersecurity Supply Chain Risk Management | 10 |
| ID.AM | Asset Management | 8 |
| ID.RA | Risk Assessment | 10 |
| ID.IM | Improvement | 4 |
| PR.AA | Identity Management, Authentication, and Access Control | 6 |
| PR.AT | Awareness and Training | 5 |
| PR.DS | Data Security | 10 |
| PR.PS | Platform Security | 6 |
| PR.IR | Technology Infrastructure Resilience | 4 |
| DE.CM | Continuous Monitoring | 9 |
| DE.AE | Adverse Event Analysis | 8 |
| RS.MA | Incident Management | 5 |
| RS.AN | Incident Analysis | 8 |
| RS.CO | Incident Response Reporting and Communication | 5 |
| RS.MI | Incident Mitigation | 3 |
| RC.RP | Incident Recovery Plan Execution | 6 |
| RC.CO | Incident Recovery Communication | 4 |

## Cross-Framework References

Each subcategory maps to controls in multiple frameworks. 15 reference frameworks included:

| Framework | Key | Description |
|-----------|-----|-------------|
| SP 800-53 Rev 5 | `sp800-53` | NIST Security and Privacy Controls |
| ISO/IEC 27001:2022 | `iso27001` | Information Security Management |
| PCI DSS v4.0 | `pci-dss` | Payment Card Industry Data Security |
| CRI Profile v2.0 | `cri-profile` | Cyber Risk Institute Profile |
| CSA CCM v4.0 | `ccmv4` | Cloud Controls Matrix |
| SP 800-171 Rev 3 | `sp800-171` | Protecting CUI in Nonfederal Systems |
| SP 800-37 Rev 2 | `sp800-37` | Risk Management Framework |
| SP 800-221A | `sp800-221a` | ICT Risk Outcomes |
| CSF v1.1 | `csf-v1.1` | Legacy backward-compatibility mappings |
| CIS Controls v8 | `cis-controls` | Center for Internet Security Controls |
| NICE Framework | `nice-framework` | Workforce Framework for Cybersecurity |
| SCF | `scf` | Secure Controls Framework |
| SP 800-218 | `sp800-218` | Secure Software Development Framework |
| CoP | `cop` | Code of Practice |
| IRP | `irp` | Incident Response Plan references |

## Usage

### JavaScript / Node.js

```javascript
// Layer 1: Core — browse the hierarchy
const { functions, categories, subcategories } = require('./core/index.json');
const govern = require('./core/by-function/GV-govern.json');
console.log(`GV has ${govern.categories.length} categories, ${govern.subcategories.length} subcategories`);

// Find a specific subcategory
const sub = subcategories.find(s => s.id === 'PR.AA-03');
console.log(sub.description);
console.log('Examples:', sub.implementationExamples);

// Layer 2: References — cross-framework lookup
const refs = require('./references/index.json');
const sp80053 = require('./references/by-framework/sp800-53.json');

// Which SP 800-53 controls map to PR.AA-03?
const praa03Refs = refs['PR.AA-03'].references
  .filter(r => r.framework.startsWith('SP 800-53'))
  .map(r => r.control);
console.log('SP 800-53 controls:', praa03Refs);

// Reverse: which subcategories does AC-02 appear in?
console.log('AC-02 maps to:', sp80053['AC-02']);

// Layer 3: Implementation guidance
const impl = require('./implementation/index.json');
const guidance = impl['PR.AA-03'];
console.log(guidance.objective);
guidance.keyActivities.forEach(a =>
  console.log(`  [${a.priority}] ${a.activity} — ${a.owner}, ${a.frequency}`)
);
console.log('Maturity:', guidance.maturity);

// Layer 4: Evidence
const evidence = require('./evidence/index.json');
const ev = evidence['PR.AA-03'];
console.log('Assessor focus:', ev.assessorFocus);
ev.evidenceItems.forEach(e => {
  console.log(`  ${e.name}`);
  console.log('    Good:', e.whatGoodLooksLike[0]);
  console.log('    Gap:', e.commonGaps[0]);
});

// Layer 5: Artifacts
const artMap = require('./artifacts/subcategory-map.json');
const inventory = require('./artifacts/inventory.json');
const slugs = artMap.subcategoryToArtifacts['PR.AA-03'];
const allArtifacts = Object.values(inventory).flat();
slugs.forEach(slug => {
  const art = allArtifacts.find(a => a.slug === slug);
  console.log(`${art.name} (${art.owner}, ${art.reviewFrequency})`);
});
```

### Python

```python
import json

# Load all layers
with open('core/index.json') as f:
    core = json.load(f)
with open('references/index.json') as f:
    refs = json.load(f)
with open('implementation/index.json') as f:
    impl = json.load(f)
with open('evidence/index.json') as f:
    evidence = json.load(f)

# All Govern subcategories with their SP 800-53 mappings
for sub in core['subcategories']:
    if not sub['id'].startswith('GV.'): continue
    sp53 = [r['control'] for r in refs[sub['id']]['references']
            if r['framework'].startswith('SP 800-53')]
    print(f"{sub['id']}: {sub['description'][:60]}...")
    print(f"  SP 800-53: {', '.join(sp53)}")

# Subcategories with the most cross-framework references
ranked = sorted(refs.items(), key=lambda x: len(x[1]['references']), reverse=True)
print("\nMost referenced subcategories:")
for sid, data in ranked[:5]:
    print(f"  {sid}: {len(data['references'])} references")

# Implementation maturity overview
for sid, g in impl.items():
    if sid.startswith('DE.'):
        print(f"\n{sid} — {g['title']}")
        print(f"  Basic:    {g['maturity']['basic'][:80]}...")
        print(f"  Advanced: {g['maturity']['advanced'][:80]}...")
```

## Statistics

| Layer | Count | Description |
|-------|-------|-------------|
| Functions | 6 | GV, ID, PR, DE, RS, RC |
| Categories | 22 | Grouped under 6 functions |
| Subcategories | 132 | Outcome statements with implementation examples |
| Reference Frameworks | 15 | Cross-framework informative references |
| Implementation Guidance | 132 | Key activities, maturity levels per subcategory |
| Evidence Guidance | 132 | Assessor focus, evidence items, assessment tips |
| Artifacts | 57 | Across 6 categories (policies, procedures, standards, evidence, reports, logs) |
| Risk Register | 20 | Cyber risks mapped to CSF functions with inherent/residual ratings |
| Assessment Checklist | 18 | Risk assessment verification items by CSF function |
| Treatment Strategies | 4 | Mitigate, Transfer, Accept, Avoid with CSF-aligned examples |

## Data Sources

- **Layers 1-2** (core + references): Parsed directly from the official [NIST CSF 2.0 Reference Tool](https://csrc.nist.gov/Projects/cybersecurity-framework) export — authoritative NIST data, not AI-generated.
- **Layers 3-6** (implementation, evidence, artifacts, risk management): AI-generated by expert GRC practitioners using the official NIST implementation examples and informative references as context.

## Source

NIST — The NIST Cybersecurity Framework (CSF) 2.0, NIST CSWP 29, February 2024.

Available at: [nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf)
