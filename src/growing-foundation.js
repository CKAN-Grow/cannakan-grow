const GROWING_PHASE_TABLE = "grow_session_growing_phases";
const PLANT_GROUP_TABLE = "grow_session_plant_groups";
const GROWING_ENVIRONMENT_TYPES = Object.freeze(["Indoor", "Outdoor", "Greenhouse", "Protected Outdoor", "Mixed", "Other"]);
const GROWING_METHODS = Object.freeze(["Soil", "Living Soil", "Coco", "Hydro", "DWC", "RDWC", "Rockwool", "NFT", "Aeroponic", "Raised Bed", "Container", "Other"]);
const PLANT_GROUP_TYPES = Object.freeze(["Seed", "Seedling", "Clone", "Cutting", "Established Plant", "Other"]);
const PLANT_GROUP_SEXES = Object.freeze(["Unknown", "Feminized", "Female", "Male", "Regular", "Other"]);
const SESSION_CONDITION_DIMENSIONS = Object.freeze({
  GROW_METHOD: "grow_method",
  ENVIRONMENT_TYPE: "environment_type",
});
const SESSION_CONDITION_OPERATION_STORAGE_KEY = "cannakan.sessionConditions.pendingOperation";

function normalizeSessionConditionSessionId(value = "") {
  const canonicalId = normalizeGrowingUuid(value);
  if (canonicalId) return canonicalId;
  const previewId = String(value || "").trim();
  return /^scenario-[a-z0-9-]+$/i.test(previewId)
    && typeof canUseDeveloperScenarios === "function"
    && canUseDeveloperScenarios()
    ? previewId
    : "";
}

function normalizeSessionConditionProjection(value = null) {
  if (!value || typeof value !== "object") return null;
  if (!Array.isArray(value.conditions)) {
    throw new Error("Canonical Session Conditions retrieval returned invalid conditions.");
  }
  const allowedStatuses = new Set(["known", "not_applicable", "absent", "unknown", "unresolved", "unavailable"]);
  const conditions = value.conditions.map((condition) => {
    const dimension = condition?.dimension;
    const status = condition?.status;
    const canonicalValue = condition?.value ?? null;
    const canonicalOtherText = Object.hasOwn(condition || {}, "other_text")
      ? condition.other_text
      : Object.hasOwn(condition || {}, "otherText")
        ? condition.otherText
        : "";
    const allowedValues = dimension === SESSION_CONDITION_DIMENSIONS.GROW_METHOD
      ? GROWING_METHODS
      : dimension === SESSION_CONDITION_DIMENSIONS.ENVIRONMENT_TYPE
        ? GROWING_ENVIRONMENT_TYPES
        : null;
    if (
      !allowedValues
      || !allowedStatuses.has(status)
      || (canonicalValue !== null && typeof canonicalValue !== "string")
      || typeof canonicalOtherText !== "string"
      || canonicalOtherText.length > 160
      || (
        status === "known"
        && (
          !allowedValues.includes(canonicalValue)
          || (canonicalValue !== "Other" && canonicalOtherText !== "")
        )
      )
      || (
        status !== "known"
        && ![null, ""].includes(canonicalValue)
      )
      || (
        status !== "known"
        && canonicalOtherText !== ""
      )
    ) {
      throw new Error("Canonical Session Conditions retrieval returned invalid canonical content.");
    }
    return {
      dimension,
      status,
      value: canonicalValue,
      otherText: canonicalOtherText,
      periodId: normalizeGrowingUuid(condition.period_id || condition.periodId),
      effectiveStart: String(condition.effective_start || condition.effectiveStart || ""),
      effectiveEnd: String(condition.effective_end || condition.effectiveEnd || ""),
      periodRevision: Number(condition.period_revision ?? condition.periodRevision) || 0,
      sourceKind: String(condition.source_kind || condition.sourceKind || ""),
    };
  });
  if (
    conditions.length !== Object.keys(SESSION_CONDITION_DIMENSIONS).length
    || new Set(conditions.map((condition) => condition.dimension)).size !== conditions.length
    || !Object.values(SESSION_CONDITION_DIMENSIONS).every(
      (dimension) => conditions.some((condition) => condition.dimension === dimension),
    )
  ) {
    throw new Error("Canonical Session Conditions retrieval returned an incomplete canonical projection.");
  }
  return {
    sessionId: normalizeSessionConditionSessionId(value.session_id || value.sessionId),
    authority: String(value.authority || ""),
    authoritySource: String(value.authority_source || value.authoritySource || ""),
    canonicalRevision: Number(value.canonical_revision ?? value.canonicalRevision) || 0,
    growingCommencementStatus: String(value.growing_commencement_status || value.growingCommencementStatus || ""),
    growingCommencedAt: String(value.growing_commenced_at || value.growingCommencedAt || ""),
    definedAt: String(value.defined_at || value.definedAt || ""),
    earlierConditionsStatus: String(value.earlier_conditions_status || value.earlierConditionsStatus || ""),
    conditions,
  };
}

function getSessionConditionProjection(conditions = null, dimension = "") {
  return normalizeSessionConditionProjection(conditions)?.conditions
    .find((condition) => condition.dimension === dimension) || null;
}

function composeGrowingPhaseConditionProjection(phase = null, conditions = null, sessionId = "") {
  const normalizedPhase = normalizeGrowingPhaseRecord(phase);
  const normalizedConditions = normalizeSessionConditionProjection(conditions);
  if (!normalizedConditions) return normalizedPhase;
  const growMethod = getSessionConditionProjection(normalizedConditions, SESSION_CONDITION_DIMENSIONS.GROW_METHOD);
  const environmentType = getSessionConditionProjection(normalizedConditions, SESSION_CONDITION_DIMENSIONS.ENVIRONMENT_TYPE);
  return {
    ...(normalizedPhase || {
      id: "",
      sessionId: normalizeGrowingUuid(sessionId || normalizedConditions.sessionId),
      plantGroups: [],
      createdAt: "",
      updatedAt: "",
    }),
    growMethod: growMethod?.status === "known" ? growMethod.value : "",
    growMethodOther: growMethod?.status === "known" ? growMethod.otherText : "",
    environmentType: environmentType?.status === "known" ? environmentType.value : "",
    environmentOther: environmentType?.status === "known" ? environmentType.otherText : "",
  };
}

async function fetchCanonicalSessionConditions(sessionId = "", at = null) {
  const normalizedSessionId = normalizeGrowingUuid(sessionId);
  if (!normalizedSessionId) throw new Error("Canonical Session Conditions require a valid Session.");
  const { data, error } = await appState.supabase.rpc("get_current_session_conditions_v1", {
    p_session_id: normalizedSessionId,
    p_at: at,
  });
  if (error) throw error;
  const normalized = normalizeSessionConditionProjection(data);
  if (!normalized || normalized.sessionId !== normalizedSessionId) {
    throw new Error("Canonical Session Conditions retrieval returned an invalid result.");
  }
  return normalized;
}

async function fetchCanonicalSessionConditionHistory(sessionId = "") {
  const normalizedSessionId = normalizeGrowingUuid(sessionId);
  if (!normalizedSessionId) throw new Error("Session Condition history requires a valid Session.");
  const { data, error } = await appState.supabase.rpc("get_session_condition_history", {
    p_session_id: normalizedSessionId,
  });
  if (error) throw error;
  if (
    !data
    || normalizeGrowingUuid(data.session_id || data.sessionId) !== normalizedSessionId
    || !Array.isArray(data.periods)
    || !Array.isArray(data.corrections)
  ) {
    throw new Error("Session Condition history returned an invalid result.");
  }
  return data;
}

function getSessionConditionOperationStorageKey(sessionId = "", dimension = "") {
  return `${SESSION_CONDITION_OPERATION_STORAGE_KEY}:${appState.user?.id || "anonymous"}:${sessionId}:${dimension}`;
}

function readPendingSessionConditionOperation(sessionId = "", dimension = "") {
  const storageKey = getSessionConditionOperationStorageKey(sessionId, dimension);
  const raw = localStorage.getItem(storageKey);
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    if (
      normalizeGrowingUuid(value?.sessionId) !== normalizeGrowingUuid(sessionId)
      || value?.dimension !== dimension
      || !normalizeGrowingUuid(value?.operationId)
      || !["declaration", "operational_change", "legacy_migration"].includes(value?.kind)
      || typeof value?.fingerprint !== "string"
      || !value.fingerprint
    ) {
      throw new Error("Stored Session Conditions operation is invalid.");
    }
    return value;
  } catch {
    throw new Error("Stored Session Conditions operation is invalid.");
  }
}

function getOrCreateSessionConditionOperation(sessionId = "", dimension = "", input = {}) {
  const fingerprint = JSON.stringify(input);
  const existing = readPendingSessionConditionOperation(sessionId, dimension);
  if (existing) {
    if (existing.fingerprint !== fingerprint) {
      throw new Error("A different Session Conditions operation is already awaiting reconciliation.");
    }
    return existing;
  }
  const operation = {
    sessionId,
    dimension,
    operationId: crypto.randomUUID(),
    kind: input.kind,
    fingerprint,
    input,
  };
  localStorage.setItem(
    getSessionConditionOperationStorageKey(sessionId, dimension),
    JSON.stringify(operation),
  );
  return operation;
}

function retireSessionConditionOperation(operation = null) {
  if (!operation?.sessionId || !operation?.dimension) return;
  localStorage.removeItem(getSessionConditionOperationStorageKey(operation.sessionId, operation.dimension));
}

function getCompositeSessionConditionOperationStorageKey(sessionId = "") {
  return `${SESSION_CONDITION_OPERATION_STORAGE_KEY}:${appState.user?.id || "anonymous"}:${sessionId}:current_change`;
}

function getOrCreateCompositeSessionConditionOperation(sessionId = "", input = {}) {
  const fingerprint = JSON.stringify(input);
  const storageKey = getCompositeSessionConditionOperationStorageKey(sessionId);
  const raw = localStorage.getItem(storageKey);
  if (raw) {
    let existing;
    try { existing = JSON.parse(raw); } catch { throw new Error("Stored Session Conditions operation is invalid."); }
    if (
      normalizeGrowingUuid(existing?.sessionId) !== normalizeGrowingUuid(sessionId)
      || !normalizeGrowingUuid(existing?.operationId)
      || existing?.kind !== "current_change"
      || existing?.fingerprint !== fingerprint
    ) throw new Error("A different Session Conditions operation is already awaiting reconciliation.");
    return existing;
  }
  const operation = {
    sessionId,
    kind: "current_change",
    operationId: crypto.randomUUID(),
    fingerprint,
    input,
  };
  localStorage.setItem(storageKey, JSON.stringify(operation));
  return operation;
}

function retireCompositeSessionConditionOperation(operation = null) {
  if (!operation?.sessionId) return;
  localStorage.removeItem(getCompositeSessionConditionOperationStorageKey(operation.sessionId));
}

function getScopedSessionConditionOperationStorageKey(sessionId = "", kind = "", scope = "") {
  return `${SESSION_CONDITION_OPERATION_STORAGE_KEY}:${appState.user?.id || "anonymous"}:${sessionId}:${kind}:${scope}`;
}

function getOrCreateScopedSessionConditionOperation(sessionId = "", kind = "", scope = "", input = {}) {
  const fingerprint = JSON.stringify(input);
  const storageKey = getScopedSessionConditionOperationStorageKey(sessionId, kind, scope);
  const raw = localStorage.getItem(storageKey);
  if (raw) {
    let existing;
    try { existing = JSON.parse(raw); } catch { throw new Error("Stored Session Conditions operation is invalid."); }
    if (
      normalizeGrowingUuid(existing?.sessionId) !== normalizeGrowingUuid(sessionId)
      || !normalizeGrowingUuid(existing?.operationId)
      || existing?.kind !== kind
      || existing?.scope !== scope
      || existing?.fingerprint !== fingerprint
    ) throw new Error("A different Session Conditions operation is already awaiting reconciliation.");
    return existing;
  }
  const operation = {
    sessionId,
    kind,
    scope,
    operationId: crypto.randomUUID(),
    fingerprint,
    input,
  };
  localStorage.setItem(storageKey, JSON.stringify(operation));
  return operation;
}

function retireScopedSessionConditionOperation(operation = null) {
  if (!operation?.sessionId || !operation?.kind) return;
  localStorage.removeItem(
    getScopedSessionConditionOperationStorageKey(operation.sessionId, operation.kind, operation.scope || ""),
  );
}

function getCanonicalCurrentConditionsChangedSet(conditions = null, growMethod = "", growMethodOther = "", environmentType = "", environmentOther = "") {
  const normalizedConditions = normalizeSessionConditionProjection(conditions);
  const normalizedMethod = normalizeGrowingChoice(growMethod, GROWING_METHODS);
  const normalizedEnvironment = normalizeGrowingChoice(environmentType, GROWING_ENVIRONMENT_TYPES);
  const methodOther = normalizedMethod === "Other" ? normalizeGrowingText(growMethodOther) : "";
  const environmentOtherValue = normalizedEnvironment === "Other" ? normalizeGrowingText(environmentOther) : "";
  if (!normalizedConditions?.sessionId || !normalizedMethod || !normalizedEnvironment) {
    throw new Error("Canonical Session Conditions require approved values for both dimensions.");
  }
  const methodProjection = getSessionConditionProjection(
    normalizedConditions,
    SESSION_CONDITION_DIMENSIONS.GROW_METHOD,
  );
  const environmentProjection = getSessionConditionProjection(
    normalizedConditions,
    SESSION_CONDITION_DIMENSIONS.ENVIRONMENT_TYPE,
  );
  const changes = {};
  if (methodProjection?.status !== "known"
    || methodProjection.value !== normalizedMethod
    || methodProjection.otherText !== methodOther) {
    changes.grow_method = { value: normalizedMethod, other_text: methodOther };
  }
  if (environmentProjection?.status !== "known"
    || environmentProjection.value !== normalizedEnvironment
    || environmentProjection.otherText !== environmentOtherValue) {
    changes.environment_type = { value: normalizedEnvironment, other_text: environmentOtherValue };
  }
  return {
    normalizedConditions,
    changes,
    changedDimensions: Object.keys(changes),
    expectedRevision: normalizedConditions.canonicalRevision,
  };
}

async function changeCanonicalCurrentConditions(conditions = null, growMethod = "", growMethodOther = "", environmentType = "", environmentOther = "") {
  const operationInput = getCanonicalCurrentConditionsChangedSet(
    conditions,
    growMethod,
    growMethodOther,
    environmentType,
    environmentOther,
  );
  if (!operationInput.changedDimensions.length) {
    return {
      operation_kind: "current_change",
      session_id: operationInput.normalizedConditions.sessionId,
      canonical_revision: operationInput.expectedRevision,
      status: "no_change",
      changed_dimensions: [],
    };
  }
  const operation = getOrCreateCompositeSessionConditionOperation(
    operationInput.normalizedConditions.sessionId,
    {
      changes: operationInput.changes,
      expectedRevision: operationInput.expectedRevision,
    },
  );
  const { data, error } = await appState.supabase.rpc("change_current_session_conditions", {
    p_session_id: operationInput.normalizedConditions.sessionId,
    p_operation_id: operation.operationId,
    p_changes: operationInput.changes,
    p_expected_revision: operationInput.expectedRevision,
  });
  if (error) throw error;
  if (!data || !["success", "no_change"].includes(data.status) || !Number.isInteger(Number(data.canonical_revision))) {
    throw new Error("Canonical composite Session Conditions mutation returned an invalid result.");
  }
  retireCompositeSessionConditionOperation(operation);
  return data;
}

async function persistCanonicalSessionConditions(conditions = null, growMethod = "", growMethodOther = "", environmentType = "", environmentOther = "") {
  const result = await changeCanonicalCurrentConditions(
    conditions,
    growMethod,
    growMethodOther,
    environmentType,
    environmentOther,
  );
  return Number(result.canonical_revision);
}

async function setCanonicalCurrentConditionsForUnresolvedLegacy(
  conditions = null,
  growMethod = "",
  growMethodOther = "",
  environmentType = "",
  environmentOther = "",
) {
  const normalizedConditions = normalizeSessionConditionProjection(conditions);
  const normalizedMethod = normalizeGrowingChoice(growMethod, GROWING_METHODS);
  const normalizedEnvironment = normalizeGrowingChoice(environmentType, GROWING_ENVIRONMENT_TYPES);
  const methodOther = normalizedMethod === "Other" ? normalizeGrowingText(growMethodOther) : "";
  const environmentOtherValue = normalizedEnvironment === "Other" ? normalizeGrowingText(environmentOther) : "";
  if (
    !normalizedConditions?.sessionId
    || normalizedConditions.authority !== "legacy"
    || normalizedConditions.growingCommencementStatus !== "unresolved"
    || normalizedConditions.canonicalRevision !== 0
    || !normalizedMethod
    || !normalizedEnvironment
  ) {
    throw new Error("Forward Current Conditions require one eligible unresolved legacy Session and both approved dimensions.");
  }
  const operationInput = {
    changes: {
      grow_method: { value: normalizedMethod, other_text: methodOther },
      environment_type: { value: normalizedEnvironment, other_text: environmentOtherValue },
    },
    expectedRevision: 0,
  };
  const operation = getOrCreateScopedSessionConditionOperation(
    normalizedConditions.sessionId,
    "forward_legacy_declaration",
    "both_dimensions",
    operationInput,
  );
  const { data, error } = await appState.supabase.rpc("set_current_conditions_for_unresolved_legacy", {
    p_session_id: normalizedConditions.sessionId,
    p_operation_id: operation.operationId,
    p_changes: operationInput.changes,
    p_expected_revision: operationInput.expectedRevision,
  });
  if (
    error
    || data?.status !== "success"
    || data?.operation_kind !== "forward_legacy_declaration"
    || Number(data?.canonical_revision) !== 1
  ) {
    if (error) throw error;
    throw new Error("Forward Current Conditions declaration returned an invalid result.");
  }
  retireScopedSessionConditionOperation(operation);
  return data;
}

async function correctCanonicalCurrentSessionCondition(
  conditions = null,
  conditionPeriodId = "",
  correction = {},
) {
  const normalizedConditions = normalizeSessionConditionProjection(conditions);
  const normalizedPeriodId = normalizeGrowingUuid(conditionPeriodId);
  const allowedKeys = new Set(["value", "other_text", "correction_note"]);
  if (
    !normalizedConditions?.sessionId
    || normalizedConditions.authority !== "conditions"
    || !normalizedPeriodId
    || !correction
    || typeof correction !== "object"
    || Array.isArray(correction)
    || Object.keys(correction).some((key) => !allowedKeys.has(key))
    || (!Object.hasOwn(correction, "value") && !Object.hasOwn(correction, "other_text"))
  ) {
    throw new Error("A canonical Session Condition period and bounded value correction are required.");
  }
  const normalizedCorrection = {
    ...(Object.hasOwn(correction, "value") ? { value: String(correction.value ?? "") } : {}),
    ...(Object.hasOwn(correction, "other_text") ? { other_text: String(correction.other_text ?? "") } : {}),
    ...(Object.hasOwn(correction, "correction_note")
      ? { correction_note: String(correction.correction_note ?? "").replace(/\r\n?/g, "\n").trim() }
      : {}),
  };
  if (
    normalizedCorrection.correction_note?.length > 2000
    || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(normalizedCorrection.correction_note || "")
  ) {
    throw new Error("The correction note contains an unauthorized character or exceeds 2,000 characters.");
  }
  const operationInput = {
    periodId: normalizedPeriodId,
    correction: normalizedCorrection,
    expectedRevision: normalizedConditions.canonicalRevision,
  };
  const operation = getOrCreateScopedSessionConditionOperation(
    normalizedConditions.sessionId,
    "correction",
    normalizedPeriodId,
    operationInput,
  );
  const { data, error } = await appState.supabase.rpc("correct_current_session_condition", {
    p_session_id: normalizedConditions.sessionId,
    p_condition_period_id: normalizedPeriodId,
    p_operation_id: operation.operationId,
    p_correction: normalizedCorrection,
    p_expected_revision: operationInput.expectedRevision,
  });
  if (
    error
    || data?.status !== "success"
    || data?.operation_kind !== "correction"
    || !Number.isInteger(Number(data?.canonical_revision))
  ) {
    if (error) throw error;
    throw new Error("Session Condition correction returned an invalid result.");
  }
  retireScopedSessionConditionOperation(operation);
  return data;
}

async function declareCanonicalSessionCondition(conditions = null, dimension = "", value = "", otherText = "") {
  const normalizedConditions = normalizeSessionConditionProjection(conditions);
  const allowed = dimension === SESSION_CONDITION_DIMENSIONS.GROW_METHOD
    ? GROWING_METHODS
    : GROWING_ENVIRONMENT_TYPES;
  const normalizedValue = normalizeGrowingChoice(value, allowed);
  const normalizedOther = normalizedValue === "Other" ? normalizeGrowingText(otherText) : "";
  if (!normalizedConditions?.sessionId || !normalizedValue) throw new Error("Canonical Session Conditions require an approved value and Session.");
  const operationInput = {
    kind: "declaration",
    value: normalizedValue,
    otherText: normalizedOther,
    expectedRevision: normalizedConditions.canonicalRevision,
  };
  const operation = getOrCreateSessionConditionOperation(normalizedConditions.sessionId, dimension, operationInput);
  const { data, error } = await appState.supabase.rpc("declare_session_condition", {
    p_session_id: normalizedConditions.sessionId,
    p_operation_id: operation.operationId,
    p_dimension: dimension,
    p_value: operationInput.value,
    p_other_text: operationInput.otherText,
    p_expected_revision: operationInput.expectedRevision,
  });
  if (error) throw error;
  if (!data || !Number.isInteger(Number(data.canonical_revision))) throw new Error("Canonical Session Conditions declaration returned an invalid result.");
  retireSessionConditionOperation(operation);
  return Number(data.canonical_revision);
}

async function migrateLegacySessionConditions(sessionId = "", phase = null) {
  const normalizedPhase = normalizeGrowingPhaseRecord(phase);
  if (!normalizedPhase?.updatedAt) {
    throw new Error("Legacy Growing truth lacks an attributable source revision.");
  }
  const operationInput = {
    kind: "legacy_migration",
    sourcePhaseId: normalizedPhase.id,
    expectedSourceUpdatedAt: normalizedPhase.updatedAt,
  };
  const operation = getOrCreateSessionConditionOperation(
    sessionId,
    "migration",
    operationInput,
  );
  const { data, error } = await appState.supabase.rpc("migrate_session_conditions", {
    p_session_id: sessionId,
    p_operation_id: operation.operationId,
    p_expected_source_updated_at: operationInput.expectedSourceUpdatedAt,
  });
  if (error) throw error;
  if (data?.authority !== "conditions") {
    throw new Error("Session Conditions migration did not establish canonical authority.");
  }
  retireSessionConditionOperation(operation);
  return data;
}

const SESSION_CONDITION_LABELS = Object.freeze({
  [SESSION_CONDITION_DIMENSIONS.GROW_METHOD]: "Grow Method",
  [SESSION_CONDITION_DIMENSIONS.ENVIRONMENT_TYPE]: "Environment Type",
});
const sessionCurrentConditionsControllers = new WeakMap();

function getStoredSessionConditions(session = null) {
  const value = session?.sessionConditions || session?.session_conditions || null;
  if (!value) return null;
  try {
    return normalizeSessionConditionProjection(value);
  } catch {
    return null;
  }
}

function getSessionConditionDisplayValue(condition = null) {
  if (condition?.status !== "known") {
    if (condition?.status === "unresolved" || condition?.status === "unavailable") return "Unavailable";
    return "Not established";
  }
  return condition.value === "Other" ? condition.otherText || "Other" : condition.value;
}

function formatSessionConditionTimestamp(value = "") {
  const parsed = new Date(String(value || ""));
  if (Number.isNaN(parsed.getTime())) return "Time unavailable";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(parsed);
}

function isSessionConditionsPreview(session = null) {
  return Boolean(
    (typeof isDeveloperScenarioRecord === "function" && isDeveloperScenarioRecord(session))
    || (typeof isLocalDevQaBypassActive === "function" && isLocalDevQaBypassActive()),
  );
}

function getSessionConditionsActionState(session = null, conditions = null, readOnly = false) {
  const lifecycle = getSessionLifecyclePresentation(session);
  const isActiveGrowing = !readOnly
    && lifecycle.currentPhaseId === "grow"
    && !lifecycle.isSessionComplete
    && !lifecycle.terminalStatus;
  const currentPeriods = conditions?.conditions?.filter(
    (condition) => condition.status === "known" && condition.periodId,
  ) || [];
  return Object.freeze({
    canChange: isActiveGrowing && conditions?.authority === "conditions",
    canSetForward: isActiveGrowing
      && conditions?.authority === "legacy"
      && conditions?.growingCommencementStatus === "unresolved"
      && Number(conditions?.canonicalRevision) === 0,
    canCorrect: conditions?.authority === "conditions" && currentPeriods.length > 0,
    canView: Boolean(conditions),
    canViewHistory: Boolean(conditions),
  });
}

function renderSessionConditionCardsMarkup(conditions = null, options = {}) {
  const normalized = conditions ? normalizeSessionConditionProjection(conditions) : null;
  const compact = options.compact === true;
  if (!normalized) {
    return '<div class="session-current-conditions-empty" role="note"><strong>Current Conditions unavailable</strong><p>No canonical condition projection is available for this Session.</p></div>';
  }
  return `<div class="session-current-conditions-grid${compact ? " is-compact" : ""}">
    ${Object.values(SESSION_CONDITION_DIMENSIONS).map((dimension) => {
      const condition = getSessionConditionProjection(normalized, dimension);
      const timestamp = condition?.effectiveStart || normalized.definedAt;
      return `<article class="session-current-condition-card" data-session-condition-dimension="${escapeHtml(dimension)}">
        <span>${escapeHtml(SESSION_CONDITION_LABELS[dimension])}</span>
        <strong>${escapeHtml(getSessionConditionDisplayValue(condition))}</strong>
        <small>${condition?.status === "known" ? `Applying since ${escapeHtml(formatSessionConditionTimestamp(timestamp))}` : "Historical truth remains unfilled"}</small>
      </article>`;
    }).join("")}
  </div>`;
}

function renderSessionCurrentConditionsMarkup(session = null, options = {}) {
  const conditions = options.conditions || getStoredSessionConditions(session);
  const readOnly = options.readOnly === true;
  const actionState = getSessionConditionsActionState(session, conditions, readOnly);
  const legacyUnavailable = conditions?.authority === "legacy"
    && conditions?.growingCommencementStatus === "unresolved";
  const actionMarkup = [
    actionState.canView ? '<button type="button" class="button button-secondary" data-session-conditions-action="view">View Conditions</button>' : "",
    actionState.canChange ? '<button type="button" class="button button-primary" data-session-conditions-action="change">Change Conditions</button>' : "",
    actionState.canSetForward ? '<button type="button" class="button button-primary" data-session-conditions-action="set-forward">Set Current Conditions</button>' : "",
    actionState.canViewHistory ? '<button type="button" class="button button-secondary" data-session-conditions-action="history">Condition History</button>' : "",
    actionState.canCorrect ? '<button type="button" class="button button-secondary" data-session-conditions-action="correct">Correct a Record</button>' : "",
  ].filter(Boolean).join("");
  return `<section class="session-current-conditions" data-session-current-conditions data-session-conditions-read-only="${String(readOnly)}" aria-labelledby="session-current-conditions-title">
    <header class="session-current-conditions-heading">
      <div><p class="eyebrow">Current Conditions</p><h4 id="session-current-conditions-title">Grow Method and Environment</h4><p>${legacyUnavailable ? "Current truth has not been established. Earlier conditions remain unavailable." : "Authoritative conditions applying to this Session now."}</p></div>
    </header>
    ${renderSessionConditionCardsMarkup(conditions)}
    ${actionMarkup ? `<div class="session-current-conditions-actions" aria-label="Current Conditions actions">${actionMarkup}</div>` : ""}
    <p class="session-current-conditions-feedback" data-session-conditions-feedback role="status" aria-live="polite">${escapeHtml(options.feedback || "")}</p>
  </section>`;
}

function cloneSessionConditionHistory(value = null, sessionId = "") {
  if (!value || typeof value !== "object") {
    return { session_id: sessionId, periods: [], corrections: [] };
  }
  return {
    ...value,
    session_id: value.session_id || value.sessionId || sessionId,
    periods: Array.isArray(value.periods) ? structuredClone(value.periods) : [],
    corrections: Array.isArray(value.corrections) ? structuredClone(value.corrections) : [],
  };
}

function getSessionCurrentConditionsController(root = null, session = null) {
  if (!(root instanceof HTMLElement) || !session) return null;
  const existing = sessionCurrentConditionsControllers.get(root);
  if (existing?.sessionId === String(session.id)) return existing;
  const conditions = getStoredSessionConditions(session);
  const controller = {
    sessionId: String(session.id),
    session,
    conditions,
    history: cloneSessionConditionHistory(
      session?.sessionConditionHistory || session?.session_condition_history,
      String(session.id),
    ),
    feedback: "",
    pending: false,
  };
  sessionCurrentConditionsControllers.set(root, controller);
  return controller;
}

function syncSessionCurrentConditionsController(root = null, controller = null) {
  const current = root?.querySelector?.("[data-session-current-conditions]");
  if (!(current instanceof HTMLElement) || !controller) return;
  const replacement = document.createElement("div");
  replacement.innerHTML = renderSessionCurrentConditionsMarkup(controller.session, {
    conditions: controller.conditions,
    readOnly: current.dataset.sessionConditionsReadOnly === "true",
    feedback: controller.feedback,
  });
  current.replaceWith(replacement.firstElementChild);
  controller.session.sessionConditions = controller.conditions;
  controller.session.session_conditions = controller.conditions;
  controller.session.sessionConditionHistory = controller.history;
  controller.session.session_condition_history = controller.history;
  const composedPhase = composeGrowingPhaseConditionProjection(
    controller.session.growingPhase || controller.session.growing_phase,
    controller.conditions,
    controller.session.id,
  );
  controller.session.growingPhase = composedPhase;
  controller.session.growing_phase = composedPhase;
  const method = getSessionConditionProjection(controller.conditions, SESSION_CONDITION_DIMENSIONS.GROW_METHOD);
  const environment = getSessionConditionProjection(controller.conditions, SESSION_CONDITION_DIMENSIONS.ENVIRONMENT_TYPE);
  const methodSummary = root.querySelector("[data-growing-summary-method]");
  const environmentSummary = root.querySelector("[data-growing-summary-environment]");
  if (methodSummary) methodSummary.textContent = getSessionConditionDisplayValue(method);
  if (environmentSummary) environmentSummary.textContent = getSessionConditionDisplayValue(environment);
  const growingForm = root.querySelector("[data-growing-evidence-form]");
  if (growingForm instanceof HTMLFormElement) {
    if (growingForm.elements.growMethod) growingForm.elements.growMethod.value = method.value || "";
    if (growingForm.elements.growMethodOther) growingForm.elements.growMethodOther.value = method.otherText || "";
    if (growingForm.elements.environmentType) growingForm.elements.environmentType.value = environment.value || "";
    if (growingForm.elements.environmentOther) growingForm.elements.environmentOther.value = environment.otherText || "";
  }
}

function createSessionConditionsDialog(title = "Current Conditions", eyebrow = "Session Conditions") {
  document.querySelector("[data-session-conditions-dialog]")?.remove();
  const dialog = document.createElement("dialog");
  dialog.className = "session-conditions-dialog grow-companion-record-dialog";
  dialog.dataset.sessionConditionsDialog = "true";
  dialog.setAttribute("aria-labelledby", "session-conditions-dialog-title");
  dialog.innerHTML = `<div class="session-conditions-dialog-shell"><header><p class="eyebrow">${escapeHtml(eyebrow)}</p><h2 id="session-conditions-dialog-title">${escapeHtml(title)}</h2></header><div data-session-conditions-dialog-body></div></div>`;
  document.body.append(dialog);
  dialog.addEventListener("close", () => dialog.remove(), { once: true });
  return dialog;
}

function bindSessionConditionsDialogDismissal(dialog = null) {
  dialog?.querySelectorAll?.("[data-session-conditions-dialog-close]").forEach((button) => {
    button.addEventListener("click", () => dialog.close());
  });
}

function renderSessionConditionHistoryMarkup(history = null) {
  const normalized = cloneSessionConditionHistory(history, history?.session_id || history?.sessionId || "");
  if (normalized.earlier_conditions_status === "unavailable") {
    normalized.periods.unshift({
      id: "earlier-unavailable",
      dimension: "",
      canonical_value: "Earlier conditions unavailable",
      effective_start: "",
      source_kind: "forward_legacy_declaration",
    });
  }
  if (!normalized.periods.length) {
    return '<div class="session-condition-history-empty"><p>No condition history is available.</p></div>';
  }
  return `<ol class="session-condition-history-list">
    ${normalized.periods.map((period) => {
      const periodId = String(period.id || "");
      const corrections = normalized.corrections.filter(
        (correction) => String(correction.condition_period_id || correction.conditionPeriodId || "") === periodId,
      );
      const label = SESSION_CONDITION_LABELS[period.dimension] || "Current Conditions set";
      const value = period.canonical_value === "Other"
        ? period.other_text || "Other"
        : period.canonical_value || "Earlier conditions unavailable";
      return `<li class="session-condition-history-item">
        <div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><small>${period.effective_start ? `Effective ${escapeHtml(formatSessionConditionTimestamp(period.effective_start))}` : "Set from this point forward"}</small></div>
        ${corrections.length ? `<span class="session-condition-corrected-marker">Corrected</span><details><summary>Correction details</summary>${corrections.map((correction) => `<p>${escapeHtml(correction.correction_note || "Correction recorded")}${correction.corrected_at ? ` · ${escapeHtml(formatSessionConditionTimestamp(correction.corrected_at))}` : ""}</p>`).join("")}</details>` : ""}
      </li>`;
    }).join("")}
  </ol>`;
}

function openSessionConditionsViewDialog(controller = null) {
  const dialog = createSessionConditionsDialog("Current Conditions", "View Conditions");
  dialog.querySelector("[data-session-conditions-dialog-body]").innerHTML = `
    ${renderSessionConditionCardsMarkup(controller.conditions, { compact: true })}
    <footer><button type="button" class="button button-primary" data-session-conditions-dialog-close>Done</button></footer>`;
  bindSessionConditionsDialogDismissal(dialog);
  dialog.showModal();
  dialog.querySelector("[data-session-conditions-dialog-close]")?.focus();
}

async function loadSessionConditionHistory(controller = null) {
  if (!controller) return null;
  if (isSessionConditionsPreview(controller.session) || !appState.supabase) return controller.history;
  controller.history = await fetchCanonicalSessionConditionHistory(controller.sessionId);
  return controller.history;
}

async function openSessionConditionsHistoryDialog(controller = null) {
  const dialog = createSessionConditionsDialog("Condition History", "Session Conditions");
  const body = dialog.querySelector("[data-session-conditions-dialog-body]");
  body.innerHTML = '<p class="session-conditions-dialog-loading" role="status">Loading Condition History…</p>';
  dialog.showModal();
  try {
    const history = await loadSessionConditionHistory(controller);
    body.innerHTML = `${renderSessionConditionHistoryMarkup(history)}<footer><button type="button" class="button button-primary" data-session-conditions-dialog-close>Done</button></footer>`;
    bindSessionConditionsDialogDismissal(dialog);
    dialog.querySelector("[data-session-conditions-dialog-close]")?.focus();
  } catch (error) {
    body.innerHTML = `<p class="form-message" role="alert">${escapeHtml(error.message || "Could not load Condition History.")}</p><footer><button type="button" class="button button-primary" data-session-conditions-dialog-close>Close</button></footer>`;
    bindSessionConditionsDialogDismissal(dialog);
  }
}

function buildPreviewChangedConditions(controller = null, values = {}, changedDimensions = []) {
  const operationAt = new Date().toISOString();
  const prior = normalizeSessionConditionProjection(controller.conditions);
  const current = prior.conditions.map((condition) => {
    if (!changedDimensions.includes(condition.dimension)) return condition;
    const input = values[condition.dimension];
    const historyPeriod = controller.history.periods.find(
      (period) => String(period.id || "") === String(condition.periodId || ""),
    );
    if (historyPeriod && !historyPeriod.effective_end) historyPeriod.effective_end = operationAt;
    const periodId = crypto.randomUUID();
    controller.history.periods.push({
      id: periodId,
      session_id: controller.sessionId,
      dimension: condition.dimension,
      canonical_value: input.value,
      other_text: input.other_text,
      effective_start: operationAt,
      effective_end: null,
      source_kind: "operational_change",
      revision: 1,
    });
    return {
      ...condition,
      status: "known",
      value: input.value,
      otherText: input.other_text,
      periodId,
      effectiveStart: operationAt,
      effectiveEnd: "",
      periodRevision: 1,
      sourceKind: "operational_change",
    };
  });
  return normalizeSessionConditionProjection({
    ...prior,
    session_id: prior.sessionId,
    canonical_revision: prior.canonicalRevision + 1,
    defined_at: operationAt,
    conditions: current,
  });
}

function buildPreviewForwardConditions(controller = null, values = {}) {
  const operationAt = new Date().toISOString();
  const periods = Object.values(SESSION_CONDITION_DIMENSIONS).map((dimension) => ({
    id: crypto.randomUUID(),
    session_id: controller.sessionId,
    dimension,
    canonical_value: values[dimension].value,
    other_text: values[dimension].other_text,
    effective_start: operationAt,
    effective_end: null,
    source_kind: "forward_legacy_declaration",
    revision: 1,
  }));
  controller.history = {
    session_id: controller.sessionId,
    authority: "conditions",
    authority_source: "forward_legacy_declaration",
    earlier_conditions_status: "unavailable",
    canonical_revision: 1,
    periods,
    corrections: [],
  };
  return normalizeSessionConditionProjection({
    session_id: controller.sessionId,
    authority: "conditions",
    authority_source: "forward_legacy_declaration",
    canonical_revision: 1,
    growing_commencement_status: "unresolved",
    growing_commenced_at: null,
    defined_at: operationAt,
    earlier_conditions_status: "unavailable",
    conditions: periods.map((period) => ({
      dimension: period.dimension,
      status: "known",
      value: period.canonical_value,
      other_text: period.other_text,
      period_id: period.id,
      effective_start: period.effective_start,
      effective_end: null,
      period_revision: 1,
      source_kind: period.source_kind,
    })),
  });
}

function getSessionConditionsFormValues(form = null) {
  const growMethod = normalizeGrowingChoice(form?.elements?.growMethod?.value, GROWING_METHODS);
  const environmentType = normalizeGrowingChoice(form?.elements?.environmentType?.value, GROWING_ENVIRONMENT_TYPES);
  return {
    [SESSION_CONDITION_DIMENSIONS.GROW_METHOD]: {
      value: growMethod,
      other_text: growMethod === "Other" ? normalizeGrowingText(form?.elements?.growMethodOther?.value) : "",
    },
    [SESSION_CONDITION_DIMENSIONS.ENVIRONMENT_TYPE]: {
      value: environmentType,
      other_text: environmentType === "Other" ? normalizeGrowingText(form?.elements?.environmentOther?.value) : "",
    },
  };
}

function syncSessionConditionsFormOtherFields(form = null) {
  const values = getSessionConditionsFormValues(form);
  form.querySelector('[data-session-conditions-other="grow_method"]').hidden = values.grow_method.value !== "Other";
  form.querySelector('[data-session-conditions-other="environment_type"]').hidden = values.environment_type.value !== "Other";
}

function openSessionConditionsChangeDialog(root = null, controller = null, mode = "change") {
  const isForward = mode === "set-forward";
  const conditions = normalizeSessionConditionProjection(controller.conditions);
  const method = getSessionConditionProjection(conditions, SESSION_CONDITION_DIMENSIONS.GROW_METHOD);
  const environment = getSessionConditionProjection(conditions, SESSION_CONDITION_DIMENSIONS.ENVIRONMENT_TYPE);
  const dialog = createSessionConditionsDialog(
    isForward ? "Set Current Conditions" : "Change Conditions",
    isForward ? "Unresolved legacy Session" : "Effective now",
  );
  const body = dialog.querySelector("[data-session-conditions-dialog-body]");
  body.innerHTML = `<form method="dialog" class="session-conditions-form" data-session-conditions-change-form novalidate>
    <div data-session-conditions-change-fields>
      <p>${isForward ? "Set both conditions from this point forward. Earlier conditions remain unavailable." : "Choose the conditions that apply now. Unchanged dimensions continue without a new history entry."}</p>
      <div class="session-conditions-form-grid">
        <label><span>Grow Method</span><select name="growMethod" required>${renderGrowingOptions(GROWING_METHODS, method?.status === "known" ? method.value : "", "Select Grow Method")}</select></label>
        <label data-session-conditions-other="grow_method"${method?.value === "Other" ? "" : " hidden"}><span>Other Grow Method</span><input name="growMethodOther" maxlength="160" value="${escapeHtml(method?.otherText || "")}"></label>
        <label><span>Environment Type</span><select name="environmentType" required>${renderGrowingOptions(GROWING_ENVIRONMENT_TYPES, environment?.status === "known" ? environment.value : "", "Select Environment")}</select></label>
        <label data-session-conditions-other="environment_type"${environment?.value === "Other" ? "" : " hidden"}><span>Other Environment</span><input name="environmentOther" maxlength="160" value="${escapeHtml(environment?.otherText || "")}"></label>
      </div>
    </div>
    <section class="session-conditions-review" data-session-conditions-review hidden><p class="eyebrow">Review changes</p><h3>${isForward ? "Set from this point forward" : "Effective now"}</h3><div data-session-conditions-review-values></div></section>
    <p class="form-message" data-session-conditions-form-message role="status" aria-live="polite"></p>
    <footer><button type="button" class="button button-secondary" data-session-conditions-dialog-close>Cancel</button><button type="button" class="button button-secondary" data-session-conditions-review-back hidden>Back</button><button type="submit" class="button button-primary" data-session-conditions-submit>${isForward ? "Review conditions" : "Review changes"}</button></footer>
  </form>`;
  const form = body.querySelector("[data-session-conditions-change-form]");
  const message = form.querySelector("[data-session-conditions-form-message]");
  const submit = form.querySelector("[data-session-conditions-submit]");
  const back = form.querySelector("[data-session-conditions-review-back]");
  const fields = form.querySelector("[data-session-conditions-change-fields]");
  const review = form.querySelector("[data-session-conditions-review]");
  const sync = () => {
    syncSessionConditionsFormOtherFields(form);
    if (form.dataset.reviewing === "true") return;
    const values = getSessionConditionsFormValues(form);
    if (!values.grow_method.value || !values.environment_type.value) {
      submit.disabled = false;
      message.textContent = "";
      return;
    }
    if (!isForward) {
      const changed = getCanonicalCurrentConditionsChangedSet(
        conditions,
        values.grow_method.value,
        values.grow_method.other_text,
        values.environment_type.value,
        values.environment_type.other_text,
      );
      const noChange = changed.changedDimensions.length === 0;
      submit.disabled = noChange;
      message.textContent = noChange ? "No changes to save" : "";
    }
  };
  form.addEventListener("input", sync);
  form.addEventListener("change", sync);
  back.addEventListener("click", () => {
    form.dataset.reviewing = "false";
    fields.hidden = false;
    review.hidden = true;
    back.hidden = true;
    submit.textContent = isForward ? "Review conditions" : "Review changes";
    sync();
    form.elements.growMethod.focus();
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (controller.pending || !form.reportValidity()) return;
    const values = getSessionConditionsFormValues(form);
    const changed = isForward ? Object.values(SESSION_CONDITION_DIMENSIONS) : getCanonicalCurrentConditionsChangedSet(
      conditions,
      values.grow_method.value,
      values.grow_method.other_text,
      values.environment_type.value,
      values.environment_type.other_text,
    ).changedDimensions;
    if (!changed.length) {
      message.textContent = "No changes to save";
      submit.disabled = true;
      return;
    }
    if (form.dataset.reviewing !== "true") {
      form.dataset.reviewing = "true";
      fields.hidden = true;
      review.hidden = false;
      back.hidden = false;
      review.querySelector("[data-session-conditions-review-values]").innerHTML = changed.map((dimension) => `<p><span>${escapeHtml(SESSION_CONDITION_LABELS[dimension])}</span><strong>${escapeHtml(values[dimension].value === "Other" ? values[dimension].other_text || "Other" : values[dimension].value)}</strong></p>`).join("");
      submit.textContent = isForward ? "Set Current Conditions" : "Save changes";
      submit.focus();
      return;
    }
    controller.pending = true;
    submit.disabled = true;
    back.disabled = true;
    message.textContent = isForward ? "Setting Current Conditions…" : "Saving Current Conditions…";
    try {
      if (isSessionConditionsPreview(controller.session) || !appState.supabase) {
        controller.conditions = isForward
          ? buildPreviewForwardConditions(controller, values)
          : buildPreviewChangedConditions(controller, values, changed);
      } else if (isForward) {
        await setCanonicalCurrentConditionsForUnresolvedLegacy(
          conditions,
          values.grow_method.value,
          values.grow_method.other_text,
          values.environment_type.value,
          values.environment_type.other_text,
        );
        controller.conditions = await fetchCanonicalSessionConditions(controller.sessionId);
        controller.history = await fetchCanonicalSessionConditionHistory(controller.sessionId);
      } else {
        const result = await changeCanonicalCurrentConditions(
          conditions,
          values.grow_method.value,
          values.grow_method.other_text,
          values.environment_type.value,
          values.environment_type.other_text,
        );
        if (result.status === "no_change") {
          message.textContent = "No changes to save";
          return;
        }
        controller.conditions = await fetchCanonicalSessionConditions(controller.sessionId);
        controller.history = await fetchCanonicalSessionConditionHistory(controller.sessionId);
      }
      controller.feedback = isForward ? "Current Conditions set." : "Current Conditions updated.";
      syncSessionCurrentConditionsController(root, controller);
      dialog.close();
      root.querySelector('[data-session-conditions-action="view"]')?.focus();
    } catch (error) {
      message.textContent = error.message || "Could not save Current Conditions.";
      submit.disabled = false;
      back.disabled = false;
    } finally {
      controller.pending = false;
    }
  });
  bindSessionConditionsDialogDismissal(dialog);
  dialog.showModal();
  sync();
  form.elements.growMethod.focus();
}

function getSessionConditionCorrectionRecords(conditions = null, history = null) {
  const normalizedConditions = normalizeSessionConditionProjection(conditions);
  const normalizedHistory = cloneSessionConditionHistory(history, normalizedConditions?.sessionId || "");
  return normalizedHistory.periods.map((period) => {
    const dimension = String(period.dimension || "").trim();
    const allowed = dimension === SESSION_CONDITION_DIMENSIONS.GROW_METHOD
      ? GROWING_METHODS
      : dimension === SESSION_CONDITION_DIMENSIONS.ENVIRONMENT_TYPE
        ? GROWING_ENVIRONMENT_TYPES
        : [];
    const periodId = normalizeGrowingUuid(period.id || period.period_id);
    const value = normalizeGrowingChoice(period.canonical_value ?? period.value, allowed);
    const otherText = value === "Other"
      ? normalizeGrowingText(period.other_text ?? period.otherText)
      : "";
    const currentProjection = getSessionConditionProjection(normalizedConditions, dimension);
    const effectiveStart = String(period.effective_start || period.effectiveStart || "").trim();
    const effectiveEnd = String(period.effective_end || period.effectiveEnd || "").trim();
    const periodRevision = Math.max(1, Math.floor(Number(period.revision ?? period.period_revision) || 1));
    if (!periodId || !value || (value === "Other" && !otherText)) return null;
    return {
      periodId,
      dimension,
      value,
      otherText,
      effectiveStart,
      effectiveEnd,
      periodRevision,
      isCurrent: String(currentProjection?.periodId || "") === periodId,
    };
  }).filter(Boolean).sort((left, right) => (
    Number(right.isCurrent) - Number(left.isCurrent)
    || (Date.parse(right.effectiveStart) || 0) - (Date.parse(left.effectiveStart) || 0)
    || left.dimension.localeCompare(right.dimension)
    || left.periodId.localeCompare(right.periodId)
  ));
}

function getSessionConditionCorrectionRecordValue(record = null) {
  return record?.value === "Other" ? record.otherText || "Other" : record?.value || "Not recorded";
}

function getSessionConditionCorrectionRecordTiming(record = null) {
  if (!record) return "Canonical timing unavailable";
  const start = record.effectiveStart ? formatSessionConditionTimestamp(record.effectiveStart) : "time unavailable";
  if (record.isCurrent) return `Current record · Applying since ${start}`;
  const end = record.effectiveEnd ? formatSessionConditionTimestamp(record.effectiveEnd) : "open-ended";
  return `Historical record · Effective ${start} to ${end}`;
}

function renderSessionConditionCorrectionRecordOption(record = null) {
  const label = SESSION_CONDITION_LABELS[record.dimension] || "Current Conditions";
  return `<option value="${escapeHtml(record.periodId)}" data-dimension="${escapeHtml(record.dimension)}" data-stored-value="${escapeHtml(record.value)}" data-other-text="${escapeHtml(record.otherText)}" data-effective-start="${escapeHtml(record.effectiveStart)}" data-effective-end="${escapeHtml(record.effectiveEnd)}" data-period-revision="${record.periodRevision}" data-current-record="${String(record.isCurrent)}">${escapeHtml(`${label} — ${getSessionConditionCorrectionRecordValue(record)} — ${getSessionConditionCorrectionRecordTiming(record)}`)}</option>`;
}

function renderSessionConditionCorrectionTargetMarkup(record = null) {
  const label = SESSION_CONDITION_LABELS[record?.dimension] || "Current Conditions";
  return `<section class="session-conditions-correction-target" data-session-conditions-correction-target>
    <p class="eyebrow">Selected record</p>
    <h3>${escapeHtml(label)} · ${escapeHtml(getSessionConditionCorrectionRecordValue(record))}</h3>
    <p>${escapeHtml(getSessionConditionCorrectionRecordTiming(record))}</p>
  </section>`;
}

function buildPreviewCorrectedConditions(controller = null, conditionPeriodId = "", correction = {}) {
  const correctedAt = new Date().toISOString();
  const prior = normalizeSessionConditionProjection(controller.conditions);
  const periodId = normalizeGrowingUuid(conditionPeriodId);
  const historyPeriod = controller.history.periods.find(
    (period) => String(period.id || period.period_id || "") === periodId,
  );
  if (!prior || !periodId || !historyPeriod) {
    throw new Error("The selected record is no longer available for correction.");
  }
  const dimension = String(historyPeriod.dimension || "");
  const nextPeriodRevision = Math.max(1, Math.floor(Number(historyPeriod.revision || 1))) + 1;
  const current = prior.conditions.map((condition) => String(condition.periodId || "") === periodId ? {
    ...condition,
    value: correction.value,
    otherText: correction.other_text,
    periodRevision: nextPeriodRevision,
  } : condition);
  controller.history.corrections.push({
    id: crypto.randomUUID(),
    session_id: controller.sessionId,
    condition_period_id: periodId,
    corrected_value: correction.value,
    corrected_other_text: correction.other_text,
    correction_note: correction.correction_note,
    corrected_at: correctedAt,
    revision: nextPeriodRevision,
  });
  historyPeriod.canonical_value = correction.value;
  historyPeriod.other_text = correction.other_text;
  historyPeriod.revision = nextPeriodRevision;
  controller.history.canonical_revision = prior.canonicalRevision + 1;
  return normalizeSessionConditionProjection({
    ...prior,
    session_id: prior.sessionId,
    canonical_revision: prior.canonicalRevision + 1,
    conditions: current,
  });
}

async function openSessionConditionsCorrectionDialog(root = null, controller = null) {
  const dialog = createSessionConditionsDialog("Correct a Record", "Correction");
  const body = dialog.querySelector("[data-session-conditions-dialog-body]");
  body.innerHTML = '<p class="session-conditions-dialog-loading" role="status">Loading correction-eligible records…</p>';
  dialog.showModal();
  let conditions = normalizeSessionConditionProjection(controller.conditions);
  try {
    if (!isSessionConditionsPreview(controller.session) && appState.supabase) {
      [conditions, controller.history] = await Promise.all([
        fetchCanonicalSessionConditions(controller.sessionId),
        fetchCanonicalSessionConditionHistory(controller.sessionId),
      ]);
      controller.conditions = conditions;
    }
  } catch (error) {
    body.innerHTML = `<p class="form-message is-error" role="alert">${escapeHtml(error.message || "Could not load correction-eligible records.")}</p><footer><button type="button" class="button button-primary" data-session-conditions-dialog-close>Done</button></footer>`;
    bindSessionConditionsDialogDismissal(dialog);
    return;
  }
  const correctionRecords = getSessionConditionCorrectionRecords(conditions, controller.history);
  if (!correctionRecords.length) {
    body.innerHTML = '<p class="session-condition-history-empty">No records are available for correction.</p><footer><button type="button" class="button button-primary" data-session-conditions-dialog-close>Done</button></footer>';
    bindSessionConditionsDialogDismissal(dialog);
    return;
  }
  const recordsById = new Map(correctionRecords.map((record) => [record.periodId, record]));
  body.innerHTML = `<form method="dialog" class="session-conditions-form" data-session-conditions-correction-form novalidate>
    <p>Correct inaccurate evidence without creating a new condition change. The original effective time remains unchanged.</p>
    <div class="session-conditions-form-grid">
      <label class="session-conditions-correction-record-field"><span>Record to correct</span><select name="record" required>${correctionRecords.map(renderSessionConditionCorrectionRecordOption).join("")}</select></label>
      <label><span>Correct value</span><select name="value" required></select></label>
      <label data-session-conditions-correction-other hidden><span>Other value</span><input name="otherText" maxlength="160"></label>
      <label class="session-conditions-form-note"><span>Add a correction note — optional</span><textarea name="correctionNote" maxlength="2000" rows="4"></textarea></label>
    </div>
    ${renderSessionConditionCorrectionTargetMarkup(correctionRecords[0])}
    <p class="session-conditions-correction-notice">This record will be marked Corrected.</p>
    <p class="form-message" data-session-conditions-form-message role="status" aria-live="polite"></p>
    <footer><button type="button" class="button button-secondary" data-session-conditions-dialog-close>Cancel</button><button type="submit" class="button button-primary" disabled>Save correction</button></footer>
  </form>`;
  const form = body.querySelector("[data-session-conditions-correction-form]");
  const message = form.querySelector("[data-session-conditions-form-message]");
  const submit = form.querySelector('[type="submit"]');
  const getSelectedRecord = () => recordsById.get(String(form.elements.record.value || "")) || null;
  const getProposedCorrection = () => {
    const record = getSelectedRecord();
    const allowed = record?.dimension === SESSION_CONDITION_DIMENSIONS.GROW_METHOD ? GROWING_METHODS : GROWING_ENVIRONMENT_TYPES;
    const value = normalizeGrowingChoice(form.elements.value.value, allowed);
    const otherText = value === "Other" ? normalizeGrowingText(form.elements.otherText.value) : "";
    return {
      record,
      value,
      otherText,
      valid: Boolean(record && value && (value !== "Other" || otherText)),
      changed: Boolean(record && value && (record.value !== value || record.otherText !== otherText)),
    };
  };
  const syncProposal = () => {
    const proposal = getProposedCorrection();
    const isOther = proposal.value === "Other";
    form.querySelector("[data-session-conditions-correction-other]").hidden = !isOther;
    form.elements.otherText.required = isOther;
    submit.disabled = !proposal.valid || !proposal.changed;
    if (proposal.value && !proposal.valid) {
      message.textContent = "Enter the required Other value for this correction.";
    } else if (proposal.valid && !proposal.changed) {
      message.textContent = "The proposed value matches the stored record.";
    } else {
      message.textContent = "";
    }
  };
  const syncRecord = () => {
    const record = getSelectedRecord();
    if (!record) return;
    const allowed = record.dimension === SESSION_CONDITION_DIMENSIONS.GROW_METHOD ? GROWING_METHODS : GROWING_ENVIRONMENT_TYPES;
    form.elements.value.innerHTML = renderGrowingOptions(allowed, record.value, "Select corrected value");
    form.elements.otherText.value = record.value === "Other" ? record.otherText : "";
    form.querySelector("[data-session-conditions-correction-target]").outerHTML = renderSessionConditionCorrectionTargetMarkup(record);
    syncProposal();
  };
  form.elements.record.addEventListener("change", syncRecord);
  form.elements.value.addEventListener("change", syncProposal);
  form.elements.otherText.addEventListener("input", syncProposal);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const proposal = getProposedCorrection();
    if (controller.pending) return;
    if (!proposal.valid || !proposal.changed) {
      message.textContent = proposal.valid
        ? "The proposed value matches the stored record."
        : "Choose a valid corrected value.";
      submit.disabled = true;
      return;
    }
    if (!form.reportValidity()) return;
    const correction = {
      value: proposal.value,
      other_text: proposal.otherText,
      correction_note: String(form.elements.correctionNote.value || "").replace(/\r\n?/g, "\n").trim(),
    };
    controller.pending = true;
    submit.disabled = true;
    message.textContent = "Saving correction…";
    try {
      if (isSessionConditionsPreview(controller.session) || !appState.supabase) {
        controller.conditions = buildPreviewCorrectedConditions(controller, proposal.record.periodId, correction);
      } else {
        await correctCanonicalCurrentSessionCondition(conditions, proposal.record.periodId, correction);
        [controller.conditions, controller.history] = await Promise.all([
          fetchCanonicalSessionConditions(controller.sessionId),
          fetchCanonicalSessionConditionHistory(controller.sessionId),
        ]);
      }
      controller.feedback = `${SESSION_CONDITION_LABELS[proposal.record.dimension]} correction saved.`;
      syncSessionCurrentConditionsController(root, controller);
      dialog.close();
      root.querySelector('[data-session-conditions-action="history"]')?.focus();
    } catch (error) {
      message.textContent = error.message || "Could not save the correction.";
      submit.disabled = false;
    } finally {
      controller.pending = false;
    }
  });
  bindSessionConditionsDialogDismissal(dialog);
  syncRecord();
  form.elements.record.focus();
}

function initializeSessionCurrentConditions(root = null, session = null) {
  const host = root?.matches?.("[data-session-current-conditions]")
    ? root
    : root?.querySelector?.("[data-session-current-conditions]");
  if (!(host instanceof HTMLElement) || !session) return;
  const scope = host.closest("[data-session-phase-foundation]") || root;
  if (!(scope instanceof HTMLElement)) return;
  const controller = getSessionCurrentConditionsController(scope, session);
  if (!controller || scope.dataset.sessionConditionsBound === "true") return;
  scope.dataset.sessionConditionsBound = "true";
  scope.addEventListener("click", (event) => {
    const button = event.target instanceof Element
      ? event.target.closest("[data-session-conditions-action]")
      : null;
    if (!(button instanceof HTMLButtonElement) || button.disabled) return;
    const action = button.dataset.sessionConditionsAction;
    if (action === "view") openSessionConditionsViewDialog(controller);
    if (action === "history") void openSessionConditionsHistoryDialog(controller);
    if (action === "change" || action === "set-forward") openSessionConditionsChangeDialog(scope, controller, action);
    if (action === "correct") void openSessionConditionsCorrectionDialog(scope, controller);
  });
}


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

function normalizeBeginGrowingInitialConditions(value = {}) {
  const growMethodInput = value?.grow_method && typeof value.grow_method === "object"
    ? value.grow_method
    : { value: value?.growMethod, other_text: value?.growMethodOther };
  const environmentInput = value?.environment_type && typeof value.environment_type === "object"
    ? value.environment_type
    : { value: value?.environmentType, other_text: value?.environmentOther };
  const growMethod = normalizeGrowingChoice(growMethodInput?.value, GROWING_METHODS);
  const environmentType = normalizeGrowingChoice(environmentInput?.value, GROWING_ENVIRONMENT_TYPES);
  const growMethodOther = growMethod === "Other"
    ? normalizeGrowingText(growMethodInput?.other_text)
    : "";
  const environmentOther = environmentType === "Other"
    ? normalizeGrowingText(environmentInput?.other_text)
    : "";
  if (
    !growMethod
    || !environmentType
    || (growMethod === "Other" && !growMethodOther)
    || (environmentType === "Other" && !environmentOther)
  ) {
    throw new Error("Choose an Environment Type and Grow Method before beginning Growing.");
  }
  return {
    grow_method: { value: growMethod, other_text: growMethodOther },
    environment_type: { value: environmentType, other_text: environmentOther },
  };
}

function renderBeginGrowingInitialConditionsMarkup(scope = "begin-growing") {
  const normalizedScope = String(scope || "begin-growing").replace(/[^a-z0-9_-]+/gi, "-");
  return `<div class="growing-context-grid" data-begin-growing-initial-conditions="${escapeHtml(normalizedScope)}">
    <label><span>Environment Type</span><select data-begin-growing-condition="environment_type" required>${renderGrowingOptions(GROWING_ENVIRONMENT_TYPES, "", "Select Environment")}</select></label>
    <label data-begin-growing-other-field="environment_type" hidden><span>Other Environment</span><input data-begin-growing-other="environment_type" maxlength="160"></label>
    <label><span>Grow Method</span><select data-begin-growing-condition="grow_method" required>${renderGrowingOptions(GROWING_METHODS, "", "Select Grow Method")}</select></label>
    <label data-begin-growing-other-field="grow_method" hidden><span>Other Grow Method</span><input data-begin-growing-other="grow_method" maxlength="160"></label>
  </div>`;
}

function syncBeginGrowingInitialConditionsState(host = null) {
  if (!(host instanceof HTMLElement)) return false;
  [SESSION_CONDITION_DIMENSIONS.ENVIRONMENT_TYPE, SESSION_CONDITION_DIMENSIONS.GROW_METHOD]
    .forEach((dimension) => {
      const select = host.querySelector(`[data-begin-growing-condition="${dimension}"]`);
      const field = host.querySelector(`[data-begin-growing-other-field="${dimension}"]`);
      const input = host.querySelector(`[data-begin-growing-other="${dimension}"]`);
      const usesOther = select?.value === "Other";
      if (field instanceof HTMLElement) field.hidden = !usesOther;
      if (input instanceof HTMLInputElement) input.required = usesOther;
    });
  let valid = false;
  try {
    readBeginGrowingInitialConditions(host);
    valid = true;
  } catch {
    valid = false;
  }
  const continueButton = host.closest(".post-germination-decision")
    ?.querySelector('[data-post-germination-decision="grow"]');
  if (continueButton instanceof HTMLButtonElement) {
    continueButton.disabled = !valid;
    continueButton.setAttribute("aria-disabled", String(!valid));
  }
  return valid;
}

function initializeBeginGrowingInitialConditions(root = null) {
  const hosts = root?.matches?.("[data-begin-growing-initial-conditions]")
    ? [root]
    : [...(root?.querySelectorAll?.("[data-begin-growing-initial-conditions]") || [])];
  hosts.forEach((host) => {
    if (!(host instanceof HTMLElement) || host.dataset.beginGrowingConditionsBound === "true") return;
    host.dataset.beginGrowingConditionsBound = "true";
    syncBeginGrowingInitialConditionsState(host);
    host.addEventListener("change", (event) => {
      const select = event.target instanceof Element
        ? event.target.closest("[data-begin-growing-condition]")
        : null;
      if (select) syncBeginGrowingInitialConditionsState(host);
    });
    host.addEventListener("input", () => syncBeginGrowingInitialConditionsState(host));
  });
  return hosts[0] || null;
}

function readBeginGrowingInitialConditions(root = null) {
  const host = root?.matches?.("[data-begin-growing-initial-conditions]")
    ? root
    : root?.querySelector?.("[data-begin-growing-initial-conditions]");
  if (!(host instanceof HTMLElement)) {
    throw new Error("Begin Growing initial conditions are unavailable.");
  }
  return normalizeBeginGrowingInitialConditions({
    growMethod: host.querySelector('[data-begin-growing-condition="grow_method"]')?.value,
    growMethodOther: host.querySelector('[data-begin-growing-other="grow_method"]')?.value,
    environmentType: host.querySelector('[data-begin-growing-condition="environment_type"]')?.value,
    environmentOther: host.querySelector('[data-begin-growing-other="environment_type"]')?.value,
  });
}

function buildInitialSessionConditionProjection(sessionId = "", commencement = null, initialConditions = {}) {
  const normalizedSessionId = normalizeSessionConditionSessionId(sessionId);
  const normalizedCommencement = normalizeCanonicalGrowingCommencement(commencement);
  const normalizedConditions = normalizeBeginGrowingInitialConditions(initialConditions);
  if (
    !normalizedSessionId
    || normalizedCommencement.status !== GROWING_COMMENCEMENT_STATUS.AUTHORITATIVE
    || normalizedCommencement.sessionId !== normalizedSessionId
  ) {
    throw new Error("Atomic Begin Growing returned an invalid commencement boundary.");
  }
  return normalizeSessionConditionProjection({
    session_id: normalizedSessionId,
    authority: "conditions",
    authority_source: "future_growing_entry",
    canonical_revision: 2,
    growing_commencement_status: "authoritative",
    growing_commenced_at: normalizedCommencement.commencedAt,
    defined_at: normalizedCommencement.commencedAt,
    earlier_conditions_status: "absent",
    conditions: [
      {
        dimension: SESSION_CONDITION_DIMENSIONS.GROW_METHOD,
        status: "known",
        value: normalizedConditions.grow_method.value,
        other_text: normalizedConditions.grow_method.other_text,
        period_id: crypto.randomUUID(),
        effective_start: normalizedCommencement.commencedAt,
        effective_end: "",
        period_revision: 1,
        source_kind: "initial_declaration",
      },
      {
        dimension: SESSION_CONDITION_DIMENSIONS.ENVIRONMENT_TYPE,
        status: "known",
        value: normalizedConditions.environment_type.value,
        other_text: normalizedConditions.environment_type.other_text,
        period_id: crypto.randomUUID(),
        effective_start: normalizedCommencement.commencedAt,
        effective_end: "",
        period_revision: 1,
        source_kind: "initial_declaration",
      },
    ],
  });
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
  return composeGrowingPhaseConditionProjection(
    session?.growingPhase || session?.growing_phase,
    session?.sessionConditions || session?.session_conditions,
    session?.id,
  );
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
  const conditionResults = await Promise.all(
    sessions.map((session) => fetchCanonicalSessionConditions(session.id)),
  );
  const conditionsBySession = new Map(
    conditionResults.map((conditions) => [conditions.sessionId, conditions]),
  );
  return sessions.map((session) => {
    const growingPhase = bySession.get(String(session.id)) || null;
    const sessionConditions = conditionsBySession.get(String(session.id)) || null;
    const composedPhase = composeGrowingPhaseConditionProjection(
      growingPhase,
      sessionConditions,
      session.id,
    );
    return {
      ...session,
      growingPhase: composedPhase,
      growing_phase: composedPhase,
      sessionConditions,
      session_conditions: sessionConditions,
    };
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
  let sessionConditions = await fetchCanonicalSessionConditions(session.id);
  let establishedForwardConditions = false;
  if (
    sessionConditions.authority === "legacy"
    && sessionConditions.growingCommencementStatus === "unresolved"
  ) {
    await setCanonicalCurrentConditionsForUnresolvedLegacy(
      sessionConditions,
      normalized.growMethod,
      normalized.growMethodOther,
      normalized.environmentType,
      normalized.environmentOther,
    );
    sessionConditions = await fetchCanonicalSessionConditions(session.id);
    establishedForwardConditions = true;
  }
  if (sessionConditions.authority === "conditions") {
    const methodProjection = getSessionConditionProjection(sessionConditions, SESSION_CONDITION_DIMENSIONS.GROW_METHOD);
    const environmentProjection = getSessionConditionProjection(sessionConditions, SESSION_CONDITION_DIMENSIONS.ENVIRONMENT_TYPE);
    let canonicalRevision = sessionConditions.canonicalRevision;
    if (
      !establishedForwardConditions
      && methodProjection?.status === "known"
      && environmentProjection?.status === "known"
    ) {
      canonicalRevision = await persistCanonicalSessionConditions(
        sessionConditions,
        normalized.growMethod,
        normalized.growMethodOther,
        normalized.environmentType,
        normalized.environmentOther,
      );
    } else {
      if (methodProjection?.status !== "known") {
        canonicalRevision = await declareCanonicalSessionCondition(
          { ...sessionConditions, canonicalRevision },
          SESSION_CONDITION_DIMENSIONS.GROW_METHOD,
          normalized.growMethod,
          normalized.growMethodOther,
        );
      }
      if (environmentProjection?.status !== "known") {
        canonicalRevision = await declareCanonicalSessionCondition(
          { ...sessionConditions, canonicalRevision },
          SESSION_CONDITION_DIMENSIONS.ENVIRONMENT_TYPE,
          normalized.environmentType,
          normalized.environmentOther,
        );
      }
    }
    sessionConditions = { ...sessionConditions, canonicalRevision };
  }

  const phasePayload = {
    id: normalized.id,
    session_id: session.id,
    ...(sessionConditions.authority === "legacy" ? {
      environment_type: normalized.environmentType,
      environment_other: normalized.environmentType === "Other" ? normalized.environmentOther : "",
      grow_method: normalized.growMethod,
      grow_method_other: normalized.growMethod === "Other" ? normalized.growMethodOther : "",
    } : {}),
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

  const savedLegacyPhase = normalizeGrowingPhaseRecord({
    ...savedPhaseRow,
    plantGroups: normalized.plantGroups.map((group) => ({ ...group, growingPhaseId: phaseId })),
  });
  if (
    sessionConditions.authority === "legacy"
    && sessionConditions.growingCommencementStatus === "authoritative"
  ) {
    await migrateLegacySessionConditions(session.id, savedLegacyPhase);
  }
  sessionConditions = await fetchCanonicalSessionConditions(session.id);
  const saved = composeGrowingPhaseConditionProjection(
    savedLegacyPhase,
    sessionConditions,
    session.id,
  );
  session.growingPhase = saved;
  session.growing_phase = saved;
  session.sessionConditions = sessionConditions;
  session.session_conditions = sessionConditions;
  saveSessions(getSessions().map((candidate) => candidate.id === session.id ? {
    ...candidate,
    growingPhase: saved,
    growing_phase: saved,
    sessionConditions,
    session_conditions: sessionConditions,
  } : candidate));
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
  return `<section class="growing-summary" aria-labelledby="growing-summary-title" data-growing-summary><p class="eyebrow">Growing evidence</p><h4 id="growing-summary-title">Plant overview</h4><div class="growing-summary-grid">
    <span><strong data-growing-summary-plant-count>${totals.plantCount}</strong><small>Plant Count</small></span><span><strong data-growing-summary-harvested-count>${totals.harvestedCount}</strong><small>Harvested Count</small></span>
  </div></section>`;
}

function renderGrowingFoundationMarkup(session = null, options = {}) {
  const readOnly = Boolean(options.readOnly);
  const phase = getSessionGrowingPhase(session);
  const groups = phase?.plantGroups || [];
  const eligibility = readOnly ? { canWrite: false, reason: "Historical Growing evidence is read-only." } : getGrowingWriteEligibility(session);
  const controlsReadOnly = readOnly || !eligibility.canWrite;
  return `<div class="growing-foundation" data-growing-foundation data-growing-read-only="${readOnly}">${renderGrowingSummaryMarkup(phase)}
    <form class="growing-evidence-form" data-growing-evidence-form novalidate>
      <input type="hidden" name="environmentType" value="${escapeHtml(phase?.environmentType || "")}">
      <input type="hidden" name="environmentOther" value="${escapeHtml(phase?.environmentOther || "")}">
      <input type="hidden" name="growMethod" value="${escapeHtml(phase?.growMethod || "")}">
      <input type="hidden" name="growMethodOther" value="${escapeHtml(phase?.growMethodOther || "")}">
    <section class="growing-chart" aria-labelledby="growing-chart-title"><div class="growing-chart-heading"><div><p class="eyebrow">Growing evidence</p><h4 id="growing-chart-title">Plant Groups</h4><p>Grow Method and Environment Type are managed above in Current Conditions.</p></div>${readOnly ? "" : `<button type="button" class="button button-secondary" data-growing-add-row${controlsReadOnly ? " disabled" : ""}>Add Row</button>`}</div>
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
  root.querySelector("[data-growing-summary-plant-count]").textContent = String(totals.plantCount);
  root.querySelector("[data-growing-summary-harvested-count]").textContent = String(totals.harvestedCount);
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
