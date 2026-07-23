const GROWING_PHASE_TABLE = "grow_session_growing_phases";
const PLANT_GROUP_TABLE = "grow_session_plant_groups";
const GROWING_ENVIRONMENT_TYPES = Object.freeze(["Indoor", "Outdoor", "Greenhouse", "Protected Outdoor", "Mixed", "Other"]);
const GROWING_METHODS = Object.freeze(["Soil", "Living Soil", "Coco", "Hydro", "DWC", "RDWC", "Rockwool", "NFT", "Aeroponic", "Raised Bed", "Container", "Other"]);
const PLANT_GROUP_TYPES = Object.freeze(["Seed", "Seedling", "Clone", "Cutting", "Established Plant", "Other"]);
const PLANT_GROUP_SEXES = Object.freeze(["Unknown", "Feminized", "Female", "Male", "Regular", "Other"]);

function normalizeGrowingChoice(value = "", allowed = []) {
  const candidate = String(value || "").trim();
  return allowed.find((entry) => entry.toLowerCase() === candidate.toLowerCase()) || "";
}

function normalizeGrowingText(value = "", maxLength = 160) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function normalizeGrowingUuid(value = "") {
  const candidate = String(value || "").trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(candidate) ? candidate : "";
}

function normalizePlantGroupRecord(group = {}, index = 0) {
  const id = normalizeGrowingUuid(group.id || group.plant_group_id);
  const count = Number(group.plantCount ?? group.plant_count);
  if (!id || !Number.isInteger(count) || count <= 0) return null;
  return {
    id,
    growingPhaseId: normalizeGrowingUuid(group.growingPhaseId || group.growing_phase_id),
    displayOrder: Math.max(0, Number.isInteger(Number(group.displayOrder ?? group.display_order)) ? Number(group.displayOrder ?? group.display_order) : index),
    plant: normalizeGrowingText(group.plant || group.plant_label),
    sourceId: normalizeGrowingUuid(group.sourceId || group.source_id),
    source: normalizeGrowingText(group.source || group.source_name),
    varietyId: normalizeGrowingUuid(group.varietyId || group.variety_id),
    variety: normalizeGrowingText(group.variety || group.variety_name),
    type: normalizeGrowingChoice(group.type || group.plant_type, PLANT_GROUP_TYPES),
    sex: normalizeGrowingChoice(group.sex, PLANT_GROUP_SEXES),
    plantCount: count,
    harvested: Boolean(group.harvested),
    createdAt: String(group.createdAt || group.created_at || "").trim(),
    updatedAt: String(group.updatedAt || group.updated_at || "").trim(),
  };
}

function normalizeGrowingPhaseRecord(phase = null) {
  if (!phase || typeof phase !== "object") return null;
  const id = normalizeGrowingUuid(phase.id || phase.growing_phase_id);
  const sessionId = normalizeGrowingUuid(phase.sessionId || phase.session_id);
  if (!id || !sessionId) return null;
  return {
    id,
    sessionId,
    environmentType: normalizeGrowingChoice(phase.environmentType || phase.environment_type, GROWING_ENVIRONMENT_TYPES),
    environmentOther: normalizeGrowingText(phase.environmentOther || phase.environment_other),
    growMethod: normalizeGrowingChoice(phase.growMethod || phase.grow_method, GROWING_METHODS),
    growMethodOther: normalizeGrowingText(phase.growMethodOther || phase.grow_method_other),
    plantGroups: (Array.isArray(phase.plantGroups) ? phase.plantGroups : Array.isArray(phase.plant_groups) ? phase.plant_groups : [])
      .map(normalizePlantGroupRecord).filter(Boolean)
      .sort((left, right) => left.displayOrder - right.displayOrder || left.id.localeCompare(right.id)),
    createdAt: String(phase.createdAt || phase.created_at || "").trim(),
    updatedAt: String(phase.updatedAt || phase.updated_at || "").trim(),
  };
}

function getSessionGrowingPhase(session = null) {
  return normalizeGrowingPhaseRecord(session?.growingPhase || session?.growing_phase);
}

function mapGrowingPhaseRow(row = {}, groups = []) {
  return normalizeGrowingPhaseRecord({ ...row, plantGroups: groups.filter((group) => String(group.growing_phase_id || "") === String(row.id || "")) });
}

async function attachGrowingEvidenceToSessions(sessions = []) {
  if (!appState.supabase || !appState.user || !sessions.length) return sessions;
  const sessionIds = sessions.map((session) => normalizeGrowingUuid(session.id)).filter(Boolean);
  if (!sessionIds.length) return sessions;
  const { data: phases, error: phaseError } = await appState.supabase.from(GROWING_PHASE_TABLE).select("*").in("session_id", sessionIds);
  if (phaseError) {
    if (!isSupabaseTableMissingError(phaseError, GROWING_PHASE_TABLE)) console.error("Failed to load Growing phase records", phaseError);
    return sessions;
  }
  const phaseIds = (phases || []).map((phase) => phase.id).filter(Boolean);
  let groups = [];
  if (phaseIds.length) {
    const { data, error } = await appState.supabase.from(PLANT_GROUP_TABLE).select("*").in("growing_phase_id", phaseIds).order("display_order", { ascending: true });
    if (error) {
      if (!isSupabaseTableMissingError(error, PLANT_GROUP_TABLE)) console.error("Failed to load Plant Group records", error);
      return sessions;
    }
    groups = data || [];
  }
  const bySession = new Map((phases || []).map((phase) => [String(phase.session_id), mapGrowingPhaseRow(phase, groups)]));
  return sessions.map((session) => {
    const growingPhase = bySession.get(String(session.id)) || null;
    return growingPhase ? { ...session, growingPhase, growing_phase: growingPhase } : session;
  });
}

function getGrowingWriteEligibility(session = null) {
  if (!session?.id || !appState.user?.id) return { canWrite: false, reason: "Sign in to manage Growing evidence." };
  if (isDeveloperScenarioModuleActive("sessions") || isDeveloperScenarioRecord(session)) return { canWrite: false, reason: DEVELOPER_SCENARIO_WRITE_MESSAGE };
  const ownerId = String(session.userId || session.user_id || "").trim();
  if (ownerId && ownerId !== String(appState.user.id)) return { canWrite: false, reason: "Only the Session owner can manage Growing evidence." };
  if (!appState.supabase && !isLocalDevQaBypassActive()) return { canWrite: false, reason: "Growing persistence is unavailable." };
  const lifecycle = getSessionLifecyclePresentation(session);
  if (lifecycle.currentPhaseId !== "grow" || lifecycle.isSessionComplete || lifecycle.terminalStatus) return { canWrite: false, reason: "Growing evidence can only be changed while Growing is current." };
  return { canWrite: true, reason: "" };
}

async function saveCanonicalGrowingEvidence(session = null, draft = {}) {
  assertDeveloperScenarioWritesAllowed("sessions", "save Growing evidence", session);
  const eligibility = getGrowingWriteEligibility(session);
  if (!eligibility.canWrite) throw new Error(eligibility.reason);
  const existing = getSessionGrowingPhase(session);
  const normalized = normalizeGrowingPhaseRecord({
    id: existing?.id || crypto.randomUUID(), sessionId: session.id,
    environmentType: draft.environmentType, environmentOther: draft.environmentOther,
    growMethod: draft.growMethod, growMethodOther: draft.growMethodOther,
    plantGroups: draft.plantGroups,
    createdAt: existing?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString(),
  });
  if (!normalized?.environmentType || !normalized?.growMethod) throw new Error("Choose an Environment Type and Grow Method before saving.");
  if ((draft.plantGroups || []).length !== normalized.plantGroups.length) throw new Error("Every Plant Group must have a positive whole Number of Plants.");

  if (isLocalDevQaBypassActive() || !appState.supabase) {
    session.growingPhase = normalized;
    session.growing_phase = normalized;
    saveSessions(getSessions().map((candidate) => candidate.id === session.id ? { ...candidate, growingPhase: normalized, growing_phase: normalized } : candidate));
    return normalized;
  }

  await getAuthenticatedSupabaseUser("Please sign in to save Growing evidence.");
  const phasePayload = {
    id: normalized.id, session_id: session.id,
    environment_type: normalized.environmentType,
    environment_other: normalized.environmentType === "Other" ? normalized.environmentOther : "",
    grow_method: normalized.growMethod,
    grow_method_other: normalized.growMethod === "Other" ? normalized.growMethodOther : "",
  };
  const { data: savedPhaseRow, error: phaseError } = await appState.supabase.from(GROWING_PHASE_TABLE).upsert(phasePayload, { onConflict: "session_id" }).select("*").single();
  if (phaseError) throw phaseError;
  const phaseId = savedPhaseRow.id;
  const { data: existingRows, error: existingError } = await appState.supabase.from(PLANT_GROUP_TABLE).select("id").eq("growing_phase_id", phaseId);
  if (existingError) throw existingError;
  const desiredIds = new Set(normalized.plantGroups.map((group) => group.id));
  const removedIds = (existingRows || []).map((row) => row.id).filter((id) => !desiredIds.has(id));
  if (removedIds.length) {
    const { error } = await appState.supabase.from(PLANT_GROUP_TABLE).delete().in("id", removedIds);
    if (error) throw error;
  }
  if (normalized.plantGroups.length) {
    const rows = normalized.plantGroups.map((group, index) => ({
      id: group.id, growing_phase_id: phaseId, display_order: index,
      plant_label: group.plant, source_id: group.sourceId || null, source_name: group.source,
      variety_id: group.varietyId || null, variety_name: group.variety,
      plant_type: group.type || null, sex: group.sex || null,
      plant_count: group.plantCount, harvested: group.harvested,
    }));
    const { error } = await appState.supabase.from(PLANT_GROUP_TABLE).upsert(rows, { onConflict: "id" });
    if (error) throw error;
  }
  const saved = normalizeGrowingPhaseRecord({ ...savedPhaseRow, plantGroups: normalized.plantGroups.map((group) => ({ ...group, growingPhaseId: phaseId })) });
  session.growingPhase = saved;
  session.growing_phase = saved;
  saveSessions(getSessions().map((candidate) => candidate.id === session.id ? { ...candidate, growingPhase: saved, growing_phase: saved } : candidate));
  void recordSourceDirectoryUsages(saved.plantGroups.map((group) => group.source).filter(Boolean));
  void recordVarietyDirectoryUsages(saved.plantGroups.map((group) => ({
    varietyName: group.variety,
    sourceName: group.source,
  })).filter((entry) => entry.varietyName));
  return saved;
}

function getGrowingTotals(phase = null) {
  const groups = normalizeGrowingPhaseRecord(phase)?.plantGroups || [];
  return groups.reduce((totals, group) => ({ plantCount: totals.plantCount + group.plantCount, harvestedCount: totals.harvestedCount + (group.harvested ? group.plantCount : 0) }), { plantCount: 0, harvestedCount: 0 });
}

function renderGrowingOptions(values = [], selected = "", placeholder = "Select") {
  return `<option value="">${escapeHtml(placeholder)}</option>${values.map((value) => `<option value="${escapeHtml(value)}"${value === selected ? " selected" : ""}>${escapeHtml(value)}</option>`).join("")}`;
}

function renderPlantGroupRowMarkup(group = {}, index = 0, readOnly = false) {
  const disabled = readOnly ? " disabled" : "";
  return `<article class="growing-plant-group-row" data-growing-plant-group-row data-plant-group-id="${escapeHtml(group.id)}">
    <span class="growing-row-number" aria-hidden="true">${index + 1}</span>
    <label><span>Plant</span><input name="plant" value="${escapeHtml(group.plant)}" maxlength="160"${disabled}></label>
    <label data-source-directory-autocomplete="true"><span>Source</span><input name="source" value="${escapeHtml(group.source)}" data-source-directory-input="true" data-canonical-id="${escapeHtml(group.sourceId)}" autocomplete="off" aria-autocomplete="list"${disabled}><div class="partition-identity-suggestions" data-source-directory-suggestions hidden></div></label>
    <label data-variety-directory-autocomplete="true"><span>Variety</span><input name="variety" value="${escapeHtml(group.variety)}" data-variety-directory-input="true" data-canonical-id="${escapeHtml(group.varietyId)}" autocomplete="off" aria-autocomplete="list"${disabled}><div class="partition-identity-suggestions" data-variety-directory-suggestions hidden></div></label>
    <label><span>Type</span><select name="type"${disabled}>${renderGrowingOptions(PLANT_GROUP_TYPES, group.type, "Select Type")}</select></label>
    <label><span>Sex</span><select name="sex"${disabled}>${renderGrowingOptions(PLANT_GROUP_SEXES, group.sex, "Select Sex")}</select></label>
    <label><span>Number of Plants</span><input name="plantCount" type="number" min="1" step="1" inputmode="numeric" value="${escapeHtml(String(group.plantCount || ""))}" required${disabled}></label>
    <label class="growing-harvested-field"><input name="harvested" type="checkbox"${group.harvested ? " checked" : ""}${disabled}><span>Harvested</span><small>Entire group</small></label>
    ${readOnly ? "" : '<button type="button" class="button button-secondary growing-remove-row" data-growing-remove-row>Remove Row</button>'}
  </article>`;
}

function renderGrowingSummaryMarkup(phase = null) {
  const normalized = normalizeGrowingPhaseRecord(phase);
  const totals = getGrowingTotals(normalized);
  const environment = normalized?.environmentType === "Other" ? normalized.environmentOther || "Other" : normalized?.environmentType || "Not recorded";
  const method = normalized?.growMethod === "Other" ? normalized.growMethodOther || "Other" : normalized?.growMethod || "Not recorded";
  return `<section class="growing-summary" aria-labelledby="growing-summary-title" data-growing-summary><p class="eyebrow">Growing Summary</p><h4 id="growing-summary-title">Current Growing evidence</h4><div class="growing-summary-grid">
    <span><strong data-growing-summary-environment>${escapeHtml(environment)}</strong><small>Environment Type</small></span><span><strong data-growing-summary-method>${escapeHtml(method)}</strong><small>Grow Method</small></span><span><strong data-growing-summary-plant-count>${totals.plantCount}</strong><small>Plant Count</small></span><span><strong data-growing-summary-harvested-count>${totals.harvestedCount}</strong><small>Harvested Count</small></span>
  </div></section>`;
}

function renderGrowingFoundationMarkup(session = null, options = {}) {
  const readOnly = Boolean(options.readOnly);
  const phase = getSessionGrowingPhase(session);
  const groups = phase?.plantGroups || [];
  const eligibility = readOnly ? { canWrite: false, reason: "Historical Growing evidence is read-only." } : getGrowingWriteEligibility(session);
  const controlsReadOnly = readOnly || !eligibility.canWrite;
  return `<div class="growing-foundation" data-growing-foundation data-growing-read-only="${readOnly}">${renderGrowingSummaryMarkup(phase)}
    <form class="growing-evidence-form" data-growing-evidence-form novalidate><fieldset${readOnly || !eligibility.canWrite ? " disabled" : ""}><legend>Grow Context</legend><div class="growing-context-grid">
      <label><span>Environment Type</span><select name="environmentType" required>${renderGrowingOptions(GROWING_ENVIRONMENT_TYPES, phase?.environmentType, "Select Environment")}</select></label>
      <label data-growing-other-field="environment"${phase?.environmentType === "Other" ? "" : " hidden"}><span>Other Environment</span><input name="environmentOther" value="${escapeHtml(phase?.environmentOther || "")}" maxlength="160"></label>
      <label><span>Grow Method</span><select name="growMethod" required>${renderGrowingOptions(GROWING_METHODS, phase?.growMethod, "Select Grow Method")}</select></label>
      <label data-growing-other-field="method"${phase?.growMethod === "Other" ? "" : " hidden"}><span>Other Grow Method</span><input name="growMethodOther" value="${escapeHtml(phase?.growMethodOther || "")}" maxlength="160"></label>
    </div></fieldset>
    <section class="growing-chart" aria-labelledby="growing-chart-title"><div class="growing-chart-heading"><div><p class="eyebrow">Growing evidence</p><h4 id="growing-chart-title">Plant Groups</h4></div>${readOnly ? "" : `<button type="button" class="button button-secondary" data-growing-add-row${controlsReadOnly ? " disabled" : ""}>Add Row</button>`}</div>
      <div class="growing-plant-groups" data-growing-plant-groups>${groups.map((group, index) => renderPlantGroupRowMarkup(group, index, controlsReadOnly)).join("")}</div><p class="growing-empty-state" data-growing-empty-state${groups.length ? " hidden" : ""}>No Plant Groups recorded. Growing does not copy plants from Germination.</p>
    </section>${readOnly ? "" : `<div class="growing-save-row"><button type="submit" class="button button-primary"${eligibility.canWrite ? "" : " disabled"}>Save Growing Evidence</button><p class="form-message" data-growing-message role="status" aria-live="polite">${escapeHtml(eligibility.reason)}</p></div>`}</form>
  </div>`;
}

function readGrowingDraft(form) {
  return {
    environmentType: form.elements.environmentType.value, environmentOther: form.elements.environmentOther.value,
    growMethod: form.elements.growMethod.value, growMethodOther: form.elements.growMethodOther.value,
    plantGroups: [...form.querySelectorAll("[data-growing-plant-group-row]")].map((row, index) => ({
      id: row.dataset.plantGroupId, displayOrder: index,
      plant: row.querySelector('[name="plant"]')?.value || "",
      sourceId: row.querySelector('[name="source"]')?.dataset.canonicalId || "", source: row.querySelector('[name="source"]')?.value || "",
      varietyId: row.querySelector('[name="variety"]')?.dataset.canonicalId || "", variety: row.querySelector('[name="variety"]')?.value || "",
      type: row.querySelector('[name="type"]')?.value || "", sex: row.querySelector('[name="sex"]')?.value || "",
      plantCount: Number(row.querySelector('[name="plantCount"]')?.value), harvested: Boolean(row.querySelector('[name="harvested"]')?.checked),
    })),
  };
}

function syncGrowingDraftProjections(form) {
  const draft = readGrowingDraft(form);
  const totals = draft.plantGroups.reduce((sum, group) => ({ plantCount: sum.plantCount + (Number.isInteger(group.plantCount) && group.plantCount > 0 ? group.plantCount : 0), harvestedCount: sum.harvestedCount + (group.harvested && Number.isInteger(group.plantCount) && group.plantCount > 0 ? group.plantCount : 0) }), { plantCount: 0, harvestedCount: 0 });
  const root = form.closest("[data-growing-foundation]");
  root.querySelector("[data-growing-summary-environment]").textContent = draft.environmentType === "Other" ? draft.environmentOther || "Other" : draft.environmentType || "Not recorded";
  root.querySelector("[data-growing-summary-method]").textContent = draft.growMethod === "Other" ? draft.growMethodOther || "Other" : draft.growMethod || "Not recorded";
  root.querySelector("[data-growing-summary-plant-count]").textContent = String(totals.plantCount);
  root.querySelector("[data-growing-summary-harvested-count]").textContent = String(totals.harvestedCount);
  form.querySelector('[data-growing-other-field="environment"]').hidden = draft.environmentType !== "Other";
  form.querySelector('[data-growing-other-field="method"]').hidden = draft.growMethod !== "Other";
  form.querySelector("[data-growing-empty-state]").hidden = draft.plantGroups.length > 0;
}

function initializeGrowingFoundation(root = null, session = null) {
  const form = root?.querySelector?.("[data-growing-evidence-form]");
  if (!(form instanceof HTMLFormElement) || form.dataset.growingBound === "true" || form.closest("[data-growing-read-only='true']")) return;
  form.dataset.growingBound = "true";
  initializeSourceDirectoryAutocompletes(form); initializeVarietyDirectoryAutocompletes(form);
  form.addEventListener("input", () => syncGrowingDraftProjections(form)); form.addEventListener("change", () => syncGrowingDraftProjections(form));
  form.addEventListener("click", (event) => {
    const add = event.target instanceof Element ? event.target.closest("[data-growing-add-row]") : null;
    const remove = event.target instanceof Element ? event.target.closest("[data-growing-remove-row]") : null;
    if (add) {
      const host = form.querySelector("[data-growing-plant-groups]"); const wrapper = document.createElement("div");
      wrapper.innerHTML = renderPlantGroupRowMarkup({ id: crypto.randomUUID(), plantCount: 1, type: "", sex: "Unknown", harvested: false }, host.childElementCount, false);
      host.append(wrapper.firstElementChild); initializeSourceDirectoryAutocompletes(host); initializeVarietyDirectoryAutocompletes(host); syncGrowingDraftProjections(form); host.lastElementChild?.querySelector('[name="plant"]')?.focus();
    } else if (remove) {
      remove.closest("[data-growing-plant-group-row]")?.remove();
      [...form.querySelectorAll("[data-growing-plant-group-row]")].forEach((row, index) => { row.querySelector(".growing-row-number").textContent = String(index + 1); }); syncGrowingDraftProjections(form);
    }
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault(); const message = form.querySelector("[data-growing-message]"); const submit = form.querySelector('[type="submit"]');
    if (!form.reportValidity()) return; submit.disabled = true; message.textContent = "Saving Growing evidence…";
    try { const saved = await saveCanonicalGrowingEvidence(session, readGrowingDraft(form)); message.textContent = "Growing evidence saved."; form.closest("[data-growing-foundation]").querySelector("[data-growing-summary]").outerHTML = renderGrowingSummaryMarkup(saved); }
    catch (error) { message.textContent = error.message || "Could not save Growing evidence."; }
    finally { submit.disabled = !getGrowingWriteEligibility(session).canWrite; }
  });
  syncGrowingDraftProjections(form);
}
