/* ============================================
   NIST CSF 2.0 Explorer — Application
   ============================================ */

// ---- State ----
const state = {
  core: null,
  refs: null,
  impl: null,
  evidence: null,
  artifacts: null,
  subMap: null,
  riskMgmt: null,
  route: { view: 'overview' },
  searchQuery: '',
};

// ---- Data Cache ----
const cache = new Map();

async function fetchJSON(path) {
  if (cache.has(path)) return cache.get(path);
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  const data = await res.json();
  cache.set(path, data);
  return data;
}

// ---- Router ----
function parseHash() {
  const hash = location.hash.slice(1);
  if (!hash) return { view: 'overview' };
  if (hash === 'risk-management') return { view: 'risk-management' };
  if (hash.startsWith('search/')) return { view: 'search', query: decodeURIComponent(hash.slice(7)) };
  if (hash.startsWith('ref/')) return { view: 'ref-lookup', framework: decodeURIComponent(hash.slice(4)) };
  // Subcategory: contains a dash (e.g., GV.OC-01)
  if (hash.includes('-')) return { view: 'subcategory', id: hash };
  // Function: 2-letter code
  return { view: 'function', id: hash };
}

function navigate(hash) {
  location.hash = hash;
}

// ---- Helpers ----
function escHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function getFunctionForSubcategory(subId) {
  if (!state.core) return null;
  const fnId = subId.split('.')[0];
  return state.core.functions.find(f => f.id === fnId);
}

function getCategoryForSubcategory(subId) {
  if (!state.core) return null;
  const fn = getFunctionForSubcategory(subId);
  if (!fn) return null;
  const catId = subId.replace(/-\d+$/, '');
  return fn.categories.find(c => c.id === catId);
}

function getSubcategory(subId) {
  const cat = getCategoryForSubcategory(subId);
  if (!cat) return null;
  return cat.subcategories.find(s => s.id === subId);
}

function getArtifactCount(subId) {
  if (!state.subMap) return 0;
  const slugs = state.subMap.subcategoryToArtifacts[subId];
  return slugs ? slugs.length : 0;
}

// ---- Render Helpers ----
function renderBreadcrumbs(items) {
  return `<nav class="breadcrumbs">${items.map((item, i) => {
    if (i === items.length - 1) return `<span class="current">${escHtml(item.label)}</span>`;
    return `<a href="#${item.hash || ''}">${escHtml(item.label)}</a><span class="sep">›</span>`;
  }).join('')}</nav>`;
}

function renderLoading() {
  return '<div class="loading"><div class="spinner"></div><span>Loading data…</span></div>';
}

// ---- View: Overview ----
function renderOverview() {
  const { functions } = state.core;
  const totalCats = functions.reduce((s, f) => s + f.categories.length, 0);
  const totalSubs = functions.reduce((s, f) => s + f.categories.reduce((s2, c) => s2 + c.subcategories.length, 0), 0);

  // Count unique frameworks from subMap keys (we'll estimate from known count)
  const refCount = 15; // from by-framework directory

  return `
    <div class="stats-banner">
      <div class="stat"><div class="stat-value">${functions.length}</div><div class="stat-label">Functions</div></div>
      <div class="stat"><div class="stat-value">${totalCats}</div><div class="stat-label">Categories</div></div>
      <div class="stat"><div class="stat-value">${totalSubs}</div><div class="stat-label">Subcategories</div></div>
      <div class="stat"><div class="stat-value">${refCount}</div><div class="stat-label">Ref Frameworks</div></div>
    </div>
    <div class="fn-grid">
      ${functions.map(fn => {
        const cats = fn.categories.length;
        const subs = fn.categories.reduce((s, c) => s + c.subcategories.length, 0);
        return `
          <div class="fn-card fn-${fn.id}" data-nav="${fn.id}">
            <div class="fn-card-code">${fn.id}</div>
            <div class="fn-card-name">${escHtml(fn.name)}</div>
            <div class="fn-card-desc">${escHtml(fn.description)}</div>
            <div class="fn-card-counts">
              <div><span>${cats}</span> categories</div>
              <div><span>${subs}</span> subcategories</div>
            </div>
          </div>`;
      }).join('')}
    </div>
    <div style="margin-top:2rem">
      <a href="#ref/" style="font-size:0.875rem">Browse Reference Framework Mappings →</a>
    </div>`;
}

// ---- View: Function Drilldown ----
function renderFunction(fnId) {
  const fn = state.core.functions.find(f => f.id === fnId);
  if (!fn) return '<div class="error-state">Function not found.</div>';

  return `
    ${renderBreadcrumbs([{ label: 'Home', hash: '' }, { label: `${fn.name} (${fn.id})` }])}
    <div class="fn-header">
      <div class="fn-header-title">
        <span class="fn-badge fn-badge-${fn.id}">${fn.id}</span>
        <h2>${escHtml(fn.name)}</h2>
      </div>
      <p class="fn-header-desc">${escHtml(fn.description)}</p>
    </div>
    <div class="accordion">
      ${fn.categories.map(cat => {
        const subCount = cat.subcategories.length;
        return `
          <div class="accordion-item open">
            <button class="accordion-trigger" data-accordion>
              <span class="accordion-trigger-left">
                <span class="cat-id" style="background:var(--fn-${fn.id}-bg);color:var(--fn-${fn.id})">${cat.id}</span>
                <span>${escHtml(cat.name)}</span>
                <span style="color:var(--text-muted);font-weight:400;font-size:0.8125rem">(${subCount})</span>
              </span>
              <span class="chevron">▶</span>
            </button>
            <div class="accordion-content">
              <div class="accordion-desc">${escHtml(cat.description)}</div>
              <ul class="sub-list">
                ${cat.subcategories.map(sub => `
                  <li>
                    <a class="sub-link" href="#${sub.id}">
                      <span class="sub-id">${sub.id}</span>
                      <span class="sub-desc">${escHtml(sub.description)}</span>
                    </a>
                  </li>`).join('')}
              </ul>
            </div>
          </div>`;
      }).join('')}
    </div>`;
}

// ---- View: Subcategory Detail ----
function renderSubcategory(subId) {
  const fn = getFunctionForSubcategory(subId);
  const cat = getCategoryForSubcategory(subId);
  const sub = getSubcategory(subId);
  if (!fn || !cat || !sub) return '<div class="error-state">Subcategory not found.</div>';

  const tabs = ['Overview', 'Implementation', 'Evidence', 'References', 'Artifacts'];

  // Audit Package
  const artifactIndex = {};
  if (state.artifacts) {
    Object.values(state.artifacts).forEach(arr => {
      if (Array.isArray(arr)) arr.forEach(a => { artifactIndex[a.slug] = a; });
    });
  }
  const linkedArtifacts = Object.values(artifactIndex)
    .filter(a => Array.isArray(a.controlSlugs) && a.controlSlugs.includes(subId))
    .sort((a, b) => (b.mandatory ? 1 : 0) - (a.mandatory ? 1 : 0));

  const linkedArtifactSlugs = new Set(linkedArtifacts.map(a => a.slug));
  const linkedEvidence = [];
  const evEntry = state.evidence?.[subId];
  if (evEntry && evEntry.evidenceItems) {
    evEntry.evidenceItems.forEach(item => {
      if (linkedEvidence.find(e => e.id === item.id)) return;
      const itemArtifacts = item.artifactSlugs || [];
      if (!itemArtifacts.length || itemArtifacts.some(sl => linkedArtifactSlugs.has(sl))) {
        linkedEvidence.push(item);
      }
    });
  }

  const auditPackageHTML = (linkedArtifacts.length || linkedEvidence.length) ? `
    <div class="audit-package">
      <h3 class="audit-package-title">Audit Package</h3>
      <div class="accordion">
        ${linkedArtifacts.length ? `
        <div class="accordion-item open">
          <button class="accordion-trigger" data-accordion>
            <span class="accordion-trigger-left">
              <span>Required Artifacts</span>
              <span style="color:var(--text-muted);font-weight:400;font-size:0.8125rem">(${linkedArtifacts.length})</span>
            </span>
            <span class="chevron">▶</span>
          </button>
          <div class="accordion-content">
            <div class="audit-artifact-list">
              ${linkedArtifacts.map(a => `
                <div class="audit-artifact-item${a.mandatory ? ' mandatory' : ''}">
                  <div class="audit-artifact-header">
                    <span class="audit-artifact-name">${escHtml(a.name)}</span>
                    ${a.mandatory ? '<span class="badge badge-mandatory">Required</span>' : '<span class="badge badge-frequency">Optional</span>'}
                  </div>
                  <div class="audit-artifact-meta">
                    ${a.category ? `<span class="badge badge-category">${escHtml(a.category)}</span>` : ''}
                    ${a.owner ? `<span class="badge badge-owner">${escHtml(a.owner)}</span>` : ''}
                    ${a.reviewFrequency ? `<span class="badge badge-frequency">${escHtml(a.reviewFrequency)}</span>` : ''}
                  </div>
                  ${a.keyContents && a.keyContents.length > 0 ? `
                    <ul class="audit-artifact-contents">
                      ${a.keyContents.map(k => `<li>${escHtml(k)}</li>`).join('')}
                    </ul>` : ''}
                </div>`).join('')}
            </div>
          </div>
        </div>` : ''}
        ${linkedEvidence.length ? `
        <div class="accordion-item open">
          <button class="accordion-trigger" data-accordion>
            <span class="accordion-trigger-left">
              <span>Evidence Checklist</span>
              <span style="color:var(--text-muted);font-weight:400;font-size:0.8125rem">(${linkedEvidence.length})</span>
            </span>
            <span class="chevron">▶</span>
          </button>
          <div class="accordion-content">
            ${linkedEvidence.map(ev => `
              <div class="audit-evidence-item">
                <div class="audit-evidence-header">
                  <span class="audit-evidence-name">${escHtml(ev.name)}</span>
                  <span class="audit-evidence-id">${escHtml(ev.id)}</span>
                </div>
                <p class="audit-evidence-desc">${escHtml(ev.description)}</p>
                <div class="audit-evidence-meta">
                  ${ev.format ? `<span>Format: <strong>${escHtml(ev.format)}</strong></span>` : ''}
                  ${ev.retentionPeriod ? `<span>Retention: <strong>${escHtml(ev.retentionPeriod)}</strong></span>` : ''}
                </div>
                ${(ev.whatGoodLooksLike && ev.whatGoodLooksLike.length) || (ev.commonGaps && ev.commonGaps.length) ? `
                <div class="accordion audit-evidence-details">
                  ${ev.whatGoodLooksLike && ev.whatGoodLooksLike.length ? `
                  <div class="accordion-item">
                    <button class="accordion-trigger" data-accordion>
                      <span class="accordion-trigger-left">
                        <span>What Good Looks Like</span>
                      </span>
                      <span class="chevron">▶</span>
                    </button>
                    <div class="accordion-content">
                      <ul class="ev-list good">
                        ${ev.whatGoodLooksLike.map(w => `<li>${escHtml(w)}</li>`).join('')}
                      </ul>
                    </div>
                  </div>` : ''}
                  ${ev.commonGaps && ev.commonGaps.length ? `
                  <div class="accordion-item">
                    <button class="accordion-trigger" data-accordion>
                      <span class="accordion-trigger-left">
                        <span>Common Gaps</span>
                      </span>
                      <span class="chevron">▶</span>
                    </button>
                    <div class="accordion-content">
                      <ul class="ev-list gap">
                        ${ev.commonGaps.map(g => `<li>${escHtml(g)}</li>`).join('')}
                      </ul>
                    </div>
                  </div>` : ''}
                </div>` : ''}
              </div>`).join('')}
          </div>
        </div>` : ''}
      </div>
    </div>` : '';

  return `
    ${renderBreadcrumbs([
      { label: 'Home', hash: '' },
      { label: `${fn.name} (${fn.id})`, hash: fn.id },
      { label: `${cat.name} (${cat.id})`, hash: fn.id },
      { label: sub.id }
    ])}
    <div class="sub-detail-header">
      <h2>
        <span class="sub-id-badge" style="background:var(--fn-${fn.id}-bg);color:var(--fn-${fn.id})">${sub.id}</span>
        ${escHtml(sub.description)}
      </h2>
    </div>
    <div class="tabs">
      <div class="tab-list" role="tablist">
        ${tabs.map((t, i) => `<button class="tab-btn${i === 0 ? ' active' : ''}" data-tab="${t.toLowerCase()}" role="tab">${t}</button>`).join('')}
      </div>
      <div class="tab-panel active" data-panel="overview">
        ${renderOverviewTab(sub)}
      </div>
      <div class="tab-panel" data-panel="implementation">
        ${renderLoading()}
      </div>
      <div class="tab-panel" data-panel="evidence">
        ${renderLoading()}
      </div>
      <div class="tab-panel" data-panel="references">
        ${renderLoading()}
      </div>
      <div class="tab-panel" data-panel="artifacts">
        ${renderLoading()}
      </div>
    </div>
    ${auditPackageHTML}`;
}

function renderOverviewTab(sub) {
  if (!sub.implementationExamples || sub.implementationExamples.length === 0) {
    return '<p class="empty-state">No implementation examples available.</p>';
  }
  return `
    <h3 style="font-size:1rem;margin-bottom:0.75rem">Implementation Examples</h3>
    <ul class="examples-list">
      ${sub.implementationExamples.map(ex => `<li>${escHtml(ex)}</li>`).join('')}
    </ul>`;
}

function renderImplementationTab(subId) {
  const entry = state.impl?.[subId];
  if (!entry) return '<p class="empty-state">No implementation guidance available for this subcategory.</p>';

  return `
    <div class="impl-objective">
      <strong style="display:block;margin-bottom:0.25rem;font-size:0.8125rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--accent)">Objective</strong>
      ${escHtml(entry.objective)}
    </div>
    ${entry.keyActivities && entry.keyActivities.length > 0 ? `
      <h4 style="font-size:1rem;margin-bottom:0.75rem">Key Activities</h4>
      <div style="overflow-x:auto">
        <table class="data-table">
          <thead>
            <tr><th>Activity</th><th>Owner</th><th>Frequency</th><th>Priority</th></tr>
          </thead>
          <tbody>
            ${entry.keyActivities.map(a => `
              <tr>
                <td>${escHtml(a.activity)}</td>
                <td style="white-space:nowrap">${escHtml(a.owner)}</td>
                <td style="white-space:nowrap">${escHtml(a.frequency)}</td>
                <td><span class="badge ${a.priority === 'High' ? 'badge-category' : 'badge-frequency'}">${escHtml(a.priority)}</span></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>` : ''}
    ${entry.maturity ? `
      <div class="maturity-section">
        <h4>Maturity Levels</h4>
        <div class="maturity-grid">
          <div class="maturity-card maturity-basic"><h5>Basic</h5><p>${escHtml(entry.maturity.basic)}</p></div>
          <div class="maturity-card maturity-mature"><h5>Mature</h5><p>${escHtml(entry.maturity.mature)}</p></div>
          <div class="maturity-card maturity-advanced"><h5>Advanced</h5><p>${escHtml(entry.maturity.advanced)}</p></div>
        </div>
      </div>` : ''}`;
}

function renderEvidenceTab(subId) {
  const entry = state.evidence?.[subId];
  if (!entry) return '<p class="empty-state">No evidence guidance available for this subcategory.</p>';

  return `
    ${entry.assessorFocus ? `
      <div class="assessor-focus">
        <strong>Assessor Focus</strong>
        ${escHtml(entry.assessorFocus)}
      </div>` : ''}
    ${entry.evidenceItems && entry.evidenceItems.length > 0 ? entry.evidenceItems.map(ev => `
      <div class="evidence-card">
        <h4>${escHtml(ev.name)}</h4>
        <div class="ev-id">${escHtml(ev.id)}</div>
        <div class="ev-desc">${escHtml(ev.description)}</div>
        ${ev.whatGoodLooksLike && ev.whatGoodLooksLike.length > 0 ? `
          <div class="ev-section">
            <div class="ev-section-title">What Good Looks Like</div>
            <ul class="ev-list good">${ev.whatGoodLooksLike.map(w => `<li>${escHtml(w)}</li>`).join('')}</ul>
          </div>` : ''}
        ${ev.commonGaps && ev.commonGaps.length > 0 ? `
          <div class="ev-section">
            <div class="ev-section-title">Common Gaps</div>
            <ul class="ev-list gap">${ev.commonGaps.map(g => `<li>${escHtml(g)}</li>`).join('')}</ul>
          </div>` : ''}
        <div class="ev-meta">
          ${ev.suggestedSources ? `<div>Sources: <span>${escHtml(ev.suggestedSources.join(', '))}</span></div>` : ''}
          ${ev.format ? `<div>Format: <span>${escHtml(ev.format)}</span></div>` : ''}
          ${ev.retentionPeriod ? `<div>Retention: <span>${escHtml(ev.retentionPeriod)}</span></div>` : ''}
        </div>
      </div>`).join('') : ''}
    ${entry.assessmentTips && entry.assessmentTips.length > 0 ? `
      <div class="assessment-tips">
        <h4>Assessment Tips</h4>
        <ul>${entry.assessmentTips.map(t => `<li>${escHtml(t)}</li>`).join('')}</ul>
      </div>` : ''}`;
}

function renderReferencesTab(subId) {
  const entry = state.refs?.[subId];
  if (!entry || !entry.references || entry.references.length === 0) {
    return '<p class="empty-state">No reference mappings available for this subcategory.</p>';
  }

  // Group by framework
  const groups = {};
  for (const ref of entry.references) {
    if (!groups[ref.framework]) groups[ref.framework] = [];
    groups[ref.framework].push(ref);
  }

  return Object.entries(groups).map(([fw, refs]) => `
    <div class="ref-group">
      <h4>${escHtml(fw)}</h4>
      <table class="data-table">
        <thead><tr><th>Control</th><th>Raw Reference</th></tr></thead>
        <tbody>
          ${refs.map(r => `<tr><td class="mono" style="white-space:nowrap">${escHtml(r.control)}</td><td>${escHtml(r.raw)}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>`).join('');
}

function renderArtifactsTab(subId) {
  if (!state.subMap || !state.artifacts) {
    return '<p class="empty-state">No artifact data available.</p>';
  }

  const slugs = state.subMap.subcategoryToArtifacts[subId];
  if (!slugs || slugs.length === 0) {
    return '<p class="empty-state">No artifacts mapped to this subcategory.</p>';
  }

  // Build lookup from all artifact categories
  const allArtifacts = {};
  for (const category of ['policies', 'procedures', 'standards', 'evidence', 'reports', 'logs']) {
    const items = state.artifacts[category];
    if (!items) continue;
    for (const item of items) {
      allArtifacts[item.slug] = { ...item, categoryLabel: category };
    }
  }

  const matched = slugs.map(s => allArtifacts[s]).filter(Boolean);
  if (matched.length === 0) {
    return '<p class="empty-state">No artifact details found.</p>';
  }

  return matched.map(a => `
    <div class="artifact-card">
      <h4>${escHtml(a.name)}</h4>
      <div class="artifact-meta">
        <span class="badge badge-category">${escHtml(a.categoryLabel)}</span>
        ${a.owner ? `<span class="badge badge-owner">${escHtml(a.owner)}</span>` : ''}
        ${a.reviewFrequency ? `<span class="badge badge-frequency">${escHtml(a.reviewFrequency)}</span>` : ''}
      </div>
      ${a.keyContents && a.keyContents.length > 0 ? `
        <div class="artifact-contents">
          <h5>Key Contents</h5>
          <ul>${a.keyContents.map(k => `<li>${escHtml(k)}</li>`).join('')}</ul>
        </div>` : ''}
    </div>`).join('');
}

// ---- View: Reference Lookup ----
function renderRefLookup(framework) {
  const frameworks = [
    'ccmv4', 'cis-controls', 'cop', 'cri-profile', 'csf-v1.1',
    'irp', 'iso27001', 'nice-framework', 'pci-dss', 'scf',
    'sp800-171', 'sp800-218', 'sp800-221a', 'sp800-37', 'sp800-53'
  ];

  return `
    ${renderBreadcrumbs([{ label: 'Home', hash: '' }, { label: 'Reference Lookup' }])}
    <h2 style="font-size:1.25rem;margin-bottom:1rem">Reference Framework Lookup</h2>
    <p style="font-size:0.875rem;color:var(--text-secondary);margin-bottom:1.5rem">
      Select a framework to see which NIST CSF 2.0 subcategories map to its controls.
    </p>
    <div class="ref-lookup-controls">
      <select id="ref-fw-select">
        <option value="">Select a framework…</option>
        ${frameworks.map(fw => `<option value="${fw}" ${fw === framework ? 'selected' : ''}>${escHtml(fw)}</option>`).join('')}
      </select>
      <input type="text" id="ref-filter" placeholder="Filter controls…" />
    </div>
    <div id="ref-lookup-results">
      ${framework ? renderLoading() : '<p class="empty-state">Select a framework above to view mappings.</p>'}
    </div>`;
}

async function loadRefLookup(framework) {
  const resultsEl = document.getElementById('ref-lookup-results');
  if (!resultsEl || !framework) return;

  resultsEl.innerHTML = renderLoading();
  try {
    const data = await fetchJSON(`references/by-framework/${framework}.json`);
    renderRefResults(data, '');
  } catch {
    resultsEl.innerHTML = '<div class="error-state">Failed to load framework data.</div>';
  }
}

function renderRefResults(data, filter) {
  const resultsEl = document.getElementById('ref-lookup-results');
  if (!resultsEl) return;

  // data is an object: { controls: [...] } or an array, or { controlId: [...subcats] }
  // Let's check the shape
  let entries;
  if (Array.isArray(data)) {
    entries = data;
  } else if (data.mappings) {
    entries = data.mappings;
  } else {
    // It's an object keyed by control → subcategories
    entries = Object.entries(data).map(([control, subcats]) => ({ control, subcategories: subcats }));
  }

  if (filter) {
    const f = filter.toLowerCase();
    entries = entries.filter(e => {
      const ctrl = (e.control || '').toLowerCase();
      const subs = (e.subcategories || []).join(' ').toLowerCase();
      return ctrl.includes(f) || subs.includes(f);
    });
  }

  if (entries.length === 0) {
    resultsEl.innerHTML = '<p class="empty-state">No matching controls found.</p>';
    return;
  }

  resultsEl.innerHTML = `
    <p style="font-size:0.8125rem;color:var(--text-muted);margin-bottom:0.75rem">${entries.length} control${entries.length !== 1 ? 's' : ''}</p>
    <table class="data-table">
      <thead><tr><th>Control</th><th>Mapped CSF 2.0 Subcategories</th></tr></thead>
      <tbody>
        ${entries.map(e => `
          <tr>
            <td class="mono" style="white-space:nowrap">${escHtml(e.control)}</td>
            <td>${(e.subcategories || []).map(s => `<a href="#${s}" style="margin-right:0.5rem">${escHtml(s)}</a>`).join('')}</td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

// ---- View: Search ----
function renderSearch(query) {
  if (!query) return '<p class="empty-state">Enter a search term to find subcategories.</p>';

  const q = query.toLowerCase();
  const results = [];

  for (const fn of state.core.functions) {
    for (const cat of fn.categories) {
      for (const sub of cat.subcategories) {
        if (sub.id.toLowerCase().includes(q) || sub.description.toLowerCase().includes(q)) {
          results.push({ fn, cat, sub });
        }
      }
    }
  }

  if (results.length === 0) {
    return `<p class="empty-state">No subcategories match "${escHtml(query)}".</p>`;
  }

  // Group by function
  const grouped = {};
  for (const r of results) {
    if (!grouped[r.fn.id]) grouped[r.fn.id] = { fn: r.fn, items: [] };
    grouped[r.fn.id].items.push(r);
  }

  return `
    <div class="search-results-header">${results.length} result${results.length !== 1 ? 's' : ''} for "${escHtml(query)}"</div>
    ${Object.values(grouped).map(g => `
      <div class="search-group">
        <div class="search-group-title">
          <span class="fn-pill fn-pill-${g.fn.id}">${g.fn.id}</span>
          <span style="font-weight:600">${escHtml(g.fn.name)}</span>
        </div>
        <ul class="sub-list">
          ${g.items.map(r => `
            <li>
              <a class="sub-link" href="#${r.sub.id}">
                <span class="sub-id">${r.sub.id}</span>
                <span class="sub-desc">${escHtml(r.sub.description)}</span>
              </a>
            </li>`).join('')}
        </ul>
      </div>`).join('')}`;
}

// ---- View: Risk Management ----
function getRiskLevelClass(level) {
  switch (level) {
    case 'Critical': return 'risk-critical';
    case 'High': return 'risk-high';
    case 'Medium': return 'risk-medium';
    case 'Low': return 'risk-low';
    case 'Very Low': return 'risk-verylow';
    default: return '';
  }
}

function renderRiskMatrix(matrix) {
  const { headers, cells } = matrix;
  return `
    <div class="risk-matrix-wrapper">
      <table class="risk-matrix-table">
        <thead>
          <tr>
            <th class="risk-matrix-corner">Likelihood / Impact</th>
            ${headers.columns.map(c => `<th>${escHtml(c)}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${cells.map((row, i) => `
            <tr>
              <td class="risk-matrix-row-header">${escHtml(headers.rows[i])}</td>
              ${row.map(cell => `
                <td class="risk-matrix-cell ${getRiskLevelClass(cell.level)}">
                  <span class="risk-matrix-score">${cell.score}</span>
                  <span class="risk-matrix-level">${escHtml(cell.level)}</span>
                </td>`).join('')}
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function renderRiskManagement() {
  const rm = state.riskMgmt;
  if (!rm) return '<div class="error-state">Failed to load risk management data.</div>';

  const { methodology, matrix, register, checklist, treatment } = rm;

  // Stats
  const totalRisks = register.risks.length;
  const criticalCount = register.risks.filter(r => r.inherentRiskLevel === 'Critical').length;
  const highCount = register.risks.filter(r => r.inherentRiskLevel === 'High').length;
  const avgResidual = (register.risks.reduce((s, r) => s + r.residualRisk, 0) / totalRisks).toFixed(1);

  // Group checklist items by function
  const checklistByFn = {};
  for (const item of checklist.items) {
    if (!checklistByFn[item.csfFunction]) checklistByFn[item.csfFunction] = [];
    checklistByFn[item.csfFunction].push(item);
  }
  const fnOrder = ['GV', 'ID', 'PR', 'DE', 'RS', 'RC'];
  const fnNames = { GV: 'Govern', ID: 'Identify', PR: 'Protect', DE: 'Detect', RS: 'Respond', RC: 'Recover' };

  return `
    ${renderBreadcrumbs([{ label: 'Home', hash: '' }, { label: 'Risk Management' }])}
    <div class="fn-header">
      <h2>Risk Management</h2>
      <p class="fn-header-desc">Cyber risk assessment methodology, risk register, and assessment checklist aligned to NIST CSF 2.0.</p>
    </div>

    <div class="stats-banner">
      <div class="stat"><div class="stat-value">${totalRisks}</div><div class="stat-label">Risks</div></div>
      <div class="stat"><div class="stat-value">${criticalCount}</div><div class="stat-label">Critical (Inherent)</div></div>
      <div class="stat"><div class="stat-value">${highCount}</div><div class="stat-label">High (Inherent)</div></div>
      <div class="stat"><div class="stat-value">${avgResidual}</div><div class="stat-label">Avg Residual Score</div></div>
      <div class="stat"><div class="stat-value">${checklist.items.length}</div><div class="stat-label">Checklist Items</div></div>
    </div>

    <div class="accordion">
      <!-- Methodology -->
      <div class="accordion-item open">
        <button class="accordion-trigger" data-accordion>
          <span class="accordion-trigger-left">
            <span class="cat-id" style="background:var(--fn-GV-bg);color:var(--fn-GV)">M</span>
            <span>Methodology</span>
          </span>
          <span class="chevron">&#9654;</span>
        </button>
        <div class="accordion-content">
          <div class="impl-objective">
            <strong style="display:block;margin-bottom:0.25rem;font-size:0.8125rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--accent)">Purpose</strong>
            ${escHtml(methodology.purpose)}
          </div>
          <p style="font-size:0.875rem;color:var(--text-secondary);margin-bottom:1rem"><strong>Scope:</strong> ${escHtml(methodology.scope)}</p>

          <h4 style="font-size:1rem;margin-bottom:0.75rem">Aligned Frameworks</h4>
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1.5rem">
            ${methodology.alignedFrameworks.map(f => `
              <a href="${f.url}" target="_blank" rel="noopener" class="badge badge-category" style="text-decoration:none;padding:0.25rem 0.75rem;font-size:0.75rem">${escHtml(f.framework)}</a>
            `).join('')}
          </div>

          <h4 style="font-size:1rem;margin-bottom:0.75rem">Assessment Process</h4>
          <div style="overflow-x:auto">
            <table class="data-table">
              <thead>
                <tr><th>Step</th><th>Name</th><th>CSF Function</th><th>SP 800-30 Task</th></tr>
              </thead>
              <tbody>
                ${methodology.riskAssessmentProcess.steps.map(step => `
                  <tr>
                    <td style="white-space:nowrap;font-weight:600">${step.step}</td>
                    <td>
                      <strong>${escHtml(step.name)}</strong>
                      <div style="font-size:0.8125rem;color:var(--text-secondary);margin-top:0.25rem">${escHtml(step.description)}</div>
                    </td>
                    <td><span class="fn-pill fn-pill-${step.csfFunction}" style="color:white;padding:0.125rem 0.5rem;border-radius:4px;font-size:0.6875rem;font-weight:700">${step.csfFunction}</span></td>
                    <td style="font-size:0.8125rem;color:var(--text-secondary)">${escHtml(step.sp800_30_task)}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>

          <h4 style="font-size:1rem;margin:1.5rem 0 0.75rem">Impact Dimensions</h4>
          <div class="maturity-grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">
            ${methodology.impactScale.dimensions.map(d => `
              <div class="maturity-card">
                <h5 style="color:var(--accent)">${escHtml(d.dimension)}</h5>
                <p>${escHtml(d.description)}</p>
              </div>`).join('')}
          </div>

          <h4 style="font-size:1rem;margin:1.5rem 0 0.75rem">Review Schedule</h4>
          <div style="overflow-x:auto">
            <table class="data-table">
              <thead><tr><th>Type</th><th>Schedule</th></tr></thead>
              <tbody>
                <tr><td style="font-weight:600">Full Assessment</td><td>${escHtml(methodology.reviewSchedule.fullAssessment)}</td></tr>
                <tr><td style="font-weight:600">Quarterly Review</td><td>${escHtml(methodology.reviewSchedule.quarterlyReview)}</td></tr>
                <tr><td style="font-weight:600">Trigger-Based Review</td><td>${escHtml(methodology.reviewSchedule.triggerBasedReview)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Risk Matrix -->
      <div class="accordion-item open">
        <button class="accordion-trigger" data-accordion>
          <span class="accordion-trigger-left">
            <span class="cat-id" style="background:var(--fn-DE-bg);color:var(--fn-DE)">5x5</span>
            <span>Risk Matrix</span>
          </span>
          <span class="chevron">&#9654;</span>
        </button>
        <div class="accordion-content">
          ${renderRiskMatrix(matrix.matrix)}
          <h4 style="font-size:1rem;margin:1.5rem 0 0.75rem">Risk Levels</h4>
          <div style="overflow-x:auto">
            <table class="data-table">
              <thead><tr><th>Level</th><th>Score Range</th><th>Action Required</th><th>Reporting</th></tr></thead>
              <tbody>
                ${matrix.riskLevels.map(l => `
                  <tr>
                    <td><span class="badge ${getRiskLevelClass(l.level)}" style="background:${l.color};color:white;padding:0.125rem 0.5rem">${escHtml(l.level)}</span></td>
                    <td class="mono">${escHtml(l.range)}</td>
                    <td style="font-size:0.8125rem">${escHtml(l.action)}</td>
                    <td style="font-size:0.8125rem;white-space:nowrap">${escHtml(l.reportingFrequency)}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Risk Register -->
      <div class="accordion-item open">
        <button class="accordion-trigger" data-accordion>
          <span class="accordion-trigger-left">
            <span class="cat-id" style="background:var(--fn-RS-bg);color:var(--fn-RS)">R</span>
            <span>Risk Register</span>
            <span style="color:var(--text-muted);font-weight:400;font-size:0.8125rem">(${register.risks.length})</span>
          </span>
          <span class="chevron">&#9654;</span>
        </button>
        <div class="accordion-content">
          <div style="overflow-x:auto">
            <table class="data-table risk-register-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Risk</th>
                  <th>CSF</th>
                  <th>Inherent</th>
                  <th>Residual</th>
                  <th>Treatment</th>
                  <th>Owner</th>
                </tr>
              </thead>
              <tbody>
                ${register.risks.map(r => `
                  <tr class="risk-row" data-risk-id="${r.id}">
                    <td class="mono" style="white-space:nowrap;font-weight:600">${escHtml(r.id)}</td>
                    <td>
                      <strong style="display:block">${escHtml(r.title)}</strong>
                      <span style="font-size:0.75rem;color:var(--text-muted)">${escHtml(r.description).substring(0, 100)}${r.description.length > 100 ? '...' : ''}</span>
                    </td>
                    <td>
                      <span class="fn-pill fn-pill-${r.csfFunction}" style="color:white;padding:0.125rem 0.5rem;border-radius:4px;font-size:0.6875rem;font-weight:700">${r.csfFunction}</span>
                      <div class="mono" style="font-size:0.6875rem;color:var(--text-muted);margin-top:0.25rem">${escHtml(r.csfSubcategory)}</div>
                    </td>
                    <td style="text-align:center">
                      <span class="risk-score-badge ${getRiskLevelClass(r.inherentRiskLevel)}">${r.inherentRisk}</span>
                      <div style="font-size:0.6875rem;color:var(--text-muted)">${escHtml(r.inherentRiskLevel)}</div>
                    </td>
                    <td style="text-align:center">
                      <span class="risk-score-badge ${getRiskLevelClass(r.residualRiskLevel)}">${r.residualRisk}</span>
                      <div style="font-size:0.6875rem;color:var(--text-muted)">${escHtml(r.residualRiskLevel)}</div>
                    </td>
                    <td><span class="badge badge-category">${escHtml(r.treatment)}</span></td>
                    <td style="font-size:0.8125rem;white-space:nowrap">${escHtml(r.owner)}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Assessment Checklist -->
      <div class="accordion-item">
        <button class="accordion-trigger" data-accordion>
          <span class="accordion-trigger-left">
            <span class="cat-id" style="background:var(--fn-PR-bg);color:var(--fn-PR)">C</span>
            <span>Assessment Checklist</span>
            <span style="color:var(--text-muted);font-weight:400;font-size:0.8125rem">(${checklist.items.length})</span>
          </span>
          <span class="chevron">&#9654;</span>
        </button>
        <div class="accordion-content">
          ${fnOrder.filter(fn => checklistByFn[fn]).map(fn => `
            <div style="margin-bottom:1.5rem">
              <h4 style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem">
                <span class="fn-pill fn-pill-${fn}" style="color:white;padding:0.125rem 0.5rem;border-radius:4px;font-size:0.6875rem;font-weight:700">${fn}</span>
                ${escHtml(fnNames[fn])}
              </h4>
              ${checklistByFn[fn].map(item => `
                <div class="checklist-item">
                  <div class="checklist-item-header">
                    <span class="mono" style="font-size:0.75rem;color:var(--text-muted)">${escHtml(item.id)}</span>
                    <strong>${escHtml(item.title)}</strong>
                    <span class="mono" style="font-size:0.6875rem;color:var(--accent)">${escHtml(item.csfSubcategory)}</span>
                  </div>
                  <p style="font-size:0.8125rem;color:var(--text-secondary);margin:0.25rem 0 0.5rem">${escHtml(item.description)}</p>
                  <div style="font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-muted);margin-bottom:0.25rem">Verification Criteria</div>
                  <ul class="ev-list good">
                    ${item.verificationCriteria.map(v => `<li>${escHtml(v)}</li>`).join('')}
                  </ul>
                </div>`).join('')}
            </div>`).join('')}
        </div>
      </div>

      <!-- Treatment Options -->
      <div class="accordion-item">
        <button class="accordion-trigger" data-accordion>
          <span class="accordion-trigger-left">
            <span class="cat-id" style="background:var(--fn-ID-bg);color:var(--fn-ID)">T</span>
            <span>Treatment Options</span>
            <span style="color:var(--text-muted);font-weight:400;font-size:0.8125rem">(${treatment.strategies.length})</span>
          </span>
          <span class="chevron">&#9654;</span>
        </button>
        <div class="accordion-content">
          ${treatment.strategies.map(s => `
            <div class="treatment-card">
              <h4>${escHtml(s.name)}</h4>
              <p style="font-size:0.875rem;color:var(--text-secondary);margin-bottom:0.75rem">${escHtml(s.description)}</p>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem">
                <div>
                  <div style="font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--fn-PR);margin-bottom:0.25rem">When to Use</div>
                  <ul class="ev-list good">
                    ${s.whenToUse.map(w => `<li>${escHtml(w)}</li>`).join('')}
                  </ul>
                </div>
                <div>
                  <div style="font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--fn-DE);margin-bottom:0.25rem">Considerations</div>
                  <ul class="ev-list gap">
                    ${s.considerations.map(c => `<li>${escHtml(c)}</li>`).join('')}
                  </ul>
                </div>
              </div>
              <div style="font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-muted);margin-bottom:0.5rem">CSF-Aligned Examples</div>
              <div style="overflow-x:auto">
                <table class="data-table">
                  <thead><tr><th>Function</th><th>Subcategory</th><th>Example</th></tr></thead>
                  <tbody>
                    ${s.csfAlignedExamples.map(ex => `
                      <tr>
                        <td><span class="fn-pill fn-pill-${ex.csfFunction}" style="color:white;padding:0.125rem 0.5rem;border-radius:4px;font-size:0.6875rem;font-weight:700">${ex.csfFunction}</span></td>
                        <td class="mono" style="white-space:nowrap"><a href="#${ex.csfSubcategory}">${escHtml(ex.csfSubcategory)}</a></td>
                        <td style="font-size:0.8125rem">${escHtml(ex.example)}</td>
                      </tr>`).join('')}
                  </tbody>
                </table>
              </div>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
}

// ---- Main Render ----
async function render() {
  const app = document.getElementById('app');
  const route = state.route;

  // Ensure core data is loaded
  if (!state.core) {
    app.innerHTML = renderLoading();
    try {
      const [core, subMap] = await Promise.all([
        fetchJSON('core/index.json'),
        fetchJSON('artifacts/subcategory-map.json'),
      ]);
      state.core = core;
      state.subMap = subMap;
    } catch (err) {
      app.innerHTML = `<div class="error-state">Failed to load core data: ${escHtml(err.message)}</div>`;
      return;
    }
  }

  // Pre-load risk management data
  if (route.view === 'risk-management' && !state.riskMgmt) {
    try {
      const [methodology, matrix, register, checklist, treatment] = await Promise.all([
        fetchJSON('risk-management/methodology.json'),
        fetchJSON('risk-management/risk-matrix.json'),
        fetchJSON('risk-management/risk-register.json'),
        fetchJSON('risk-management/checklist.json'),
        fetchJSON('risk-management/treatment-options.json'),
      ]);
      state.riskMgmt = { methodology, matrix, register, checklist, treatment };
    } catch (err) {
      app.innerHTML = `<div class="error-state">Failed to load risk management data: ${escHtml(err.message)}</div>`;
      return;
    }
  }

  // Pre-load artifacts and evidence for subcategory view (needed by Audit Package)
  if (route.view === 'subcategory') {
    try {
      const loads = [];
      if (!state.artifacts) loads.push(fetchJSON('artifacts/inventory.json').then(d => { state.artifacts = d; }));
      if (!state.evidence) loads.push(fetchJSON('evidence/index.json').then(d => { state.evidence = d; }));
      if (loads.length) await Promise.all(loads);
    } catch (err) {
      // Non-fatal: Audit Package will degrade gracefully
    }
  }

  let content = '';
  switch (route.view) {
    case 'overview':
      content = renderOverview();
      break;
    case 'function':
      content = renderFunction(route.id);
      break;
    case 'subcategory':
      content = renderSubcategory(route.id);
      break;
    case 'ref-lookup':
      content = renderRefLookup(route.framework);
      break;
    case 'risk-management':
      content = renderRiskManagement();
      break;
    case 'search':
      content = renderSearch(route.query);
      break;
    default:
      content = renderOverview();
  }

  app.innerHTML = `<div class="main">${content}</div>`;

  // Post-render actions
  if (route.view === 'ref-lookup' && route.framework) {
    loadRefLookup(route.framework);
  }

  // Update search input
  const searchInput = document.getElementById('search-input');
  if (searchInput && route.view === 'search') {
    searchInput.value = route.query || '';
  }
}

// ---- Tab Lazy Loading ----
async function activateTab(tabName, subId) {
  const panels = document.querySelectorAll('.tab-panel');
  const btns = document.querySelectorAll('.tab-btn');

  btns.forEach(b => b.classList.toggle('active', b.dataset.tab === tabName));
  panels.forEach(p => p.classList.toggle('active', p.dataset.panel === tabName));

  const panel = document.querySelector(`[data-panel="${tabName}"]`);
  if (!panel) return;

  // If already rendered (not a loading spinner), skip
  if (!panel.querySelector('.loading')) return;

  try {
    switch (tabName) {
      case 'implementation':
        if (!state.impl) state.impl = await fetchJSON('implementation/index.json');
        panel.innerHTML = renderImplementationTab(subId);
        break;
      case 'evidence':
        if (!state.evidence) state.evidence = await fetchJSON('evidence/index.json');
        panel.innerHTML = renderEvidenceTab(subId);
        break;
      case 'references':
        if (!state.refs) state.refs = await fetchJSON('references/index.json');
        panel.innerHTML = renderReferencesTab(subId);
        break;
      case 'artifacts':
        if (!state.artifacts) state.artifacts = await fetchJSON('artifacts/inventory.json');
        panel.innerHTML = renderArtifactsTab(subId);
        break;
    }
  } catch (err) {
    panel.innerHTML = `<div class="error-state">Failed to load: ${escHtml(err.message)}</div>`;
  }
}

// ---- Event Delegation ----
function setupEvents() {
  // Hash change
  window.addEventListener('hashchange', () => {
    state.route = parseHash();
    render();
  });

  // Click delegation on app
  document.addEventListener('click', (e) => {
    // Function card navigation
    const card = e.target.closest('[data-nav]');
    if (card) {
      e.preventDefault();
      navigate(card.dataset.nav);
      return;
    }

    // Accordion toggle
    const accTrigger = e.target.closest('[data-accordion]');
    if (accTrigger) {
      const item = accTrigger.closest('.accordion-item');
      if (item) item.classList.toggle('open');
      return;
    }

    // Tab click
    const tabBtn = e.target.closest('.tab-btn');
    if (tabBtn) {
      const tabName = tabBtn.dataset.tab;
      const subId = state.route.id;
      activateTab(tabName, subId);
      return;
    }
  });

  // Search input
  let searchTimeout;
  document.addEventListener('input', (e) => {
    if (e.target.id === 'search-input') {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const val = e.target.value.trim();
        if (val) {
          navigate(`search/${encodeURIComponent(val)}`);
        } else {
          navigate('');
        }
      }, 300);
    }

    // Ref filter
    if (e.target.id === 'ref-filter') {
      const fw = document.getElementById('ref-fw-select')?.value;
      if (fw && cache.has(`references/by-framework/${fw}.json`)) {
        renderRefResults(cache.get(`references/by-framework/${fw}.json`), e.target.value.trim());
      }
    }
  });

  // Ref framework select
  document.addEventListener('change', (e) => {
    if (e.target.id === 'ref-fw-select') {
      const fw = e.target.value;
      if (fw) {
        navigate(`ref/${fw}`);
      }
    }
  });

  // Search on Enter key in header search
  document.addEventListener('keydown', (e) => {
    if (e.target.id === 'search-input' && e.key === 'Enter') {
      e.preventDefault();
      clearTimeout(searchTimeout);
      const val = e.target.value.trim();
      if (val) {
        navigate(`search/${encodeURIComponent(val)}`);
      }
    }
  });
}

// ---- Header ----
function renderHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;
  header.innerHTML = `
    <div class="header-inner">
      <h1><a href="#">NIST CSF 2.0 Explorer</a></h1>
      <nav class="header-nav">
        <a href="#ref/">References</a>
        <a href="#risk-management">Risk Management</a>
      </nav>
      <div class="search-box">
        <span class="search-icon">⌕</span>
        <input type="text" id="search-input" placeholder="Search subcategories…" autocomplete="off" />
      </div>
    </div>`;
}

// ---- Init ----
function init() {
  renderHeader();
  state.route = parseHash();
  setupEvents();
  render();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
