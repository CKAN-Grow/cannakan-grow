const STORAGE_KEY = "cannakan-grow-sessions";
const SAMPLE_SEED_KEY = "cannakan-grow-sample-seed-version";
const SAMPLE_SEED_VERSION = "history-preview-v2";
const GALLERY_MOCK_DATA_VERSION = "community-leaderboard-preview-v1";
const MOCK_DATA_STORAGE_KEY = "cannakanGrowMockDataEnabled";
const MOCK_DATA_ACTIVE_NOTICE = "Mock Data Active - Testing Only";
const GALLERY_MOCK_USER_ID = "dev-mock-gallery";
const TIME_FORMAT_KEY = "cannakan-grow-time-format";
const THEME_KEY = "cannakan-grow-theme";
const SESSION_IMAGE_BUCKET = "session-images";
const PROFILE_AVATAR_BUCKET = "profile-avatars";
const AUTH_NAVIGATION_KEYS = [
  "cannakan-grow-last-route",
  "cannakan-grow-last-session-id",
  "cannakan-grow-last-session-route",
];
const MAX_SESSION_IMAGES = 3;
const MAX_IMAGE_SIZE_BYTES = 12 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1600;
const MAX_AVATAR_DIMENSION = 512;
const GROW_GALLERY_BUCKET = "grow-gallery";
const GROW_GALLERY_LIKES_TABLE = "grow_gallery_snapshot_likes";
const NEW_SESSION_NOTES_DRAFT_KEY = "cannakan-grow-new-session-notes-draft";
const SYSTEM_LAYOUT_ASSETS = {
  KAN: "Icons/KAN%20icon.svg",
  TRA: "Icons/TRA%20icon.svg",
};
const PARTITION_HEADER_ICON_ASSETS = {
  KAN: "src/assets/kan-partition-icon-v2.png",
  TRA: "src/assets/tra-partition-icon.png",
};
const GROW_GALLERY_DEBUG = true;
const SESSION_STAGE_OPTIONS = [
  { value: "soaking", label: "Soaking", modalLabel: "Start Soak", tone: "is-soaking" },
  { value: "germinating", label: "Germination", modalLabel: "Start Germination", tone: "is-germinating" },
  { value: "completed", label: "Completed", modalLabel: "Complete", tone: "is-completed" },
];
const inlineSvgCache = {};
const ACTIVE_PARTITION_STYLE = {
  fill: "#f2ff4d",
  stroke: "#0d5b1f",
  strokeWidth: "18px",
  filter: "drop-shadow(0 0 28px rgba(180, 255, 60, 0.95))",
};
const ACTIVE_SECTION_STYLE = {
  stroke: "rgba(13, 91, 31, 0.65)",
  strokeWidth: "8px",
};
const STAGE_REMINDER_SCHEDULES = {
  soaking: [
    { hours: 18, message: "Check your seeds.", level: "guidance" },
    { hours: 24, message: "Stop soaking. Move to germination.", level: "critical" },
  ],
  germinating: [
    { hours: 2, message: "Check heat pad and lid (condensation).", level: "guidance" },
    { hours: 12, message: "Check seeds.", level: "guidance" },
    { hours: 24, message: "Check seeds.", level: "guidance" },
    { hours: 36, message: "Check seeds. Plant if ready.", level: "guidance" },
    { hours: 48, message: "Plant when ready. Mark session complete.", level: "critical" },
    { hours: 72, message: "Check seeds. Plant and complete session.", level: "critical" },
    { hours: 120, message: "This session has been running for several days. Check seeds and complete when ready.", level: "critical" },
  ],
};
const app = document.querySelector("#app");
const authStatus = document.querySelector("#auth-status");
const appState = {
  initialized: false,
  loading: true,
  supabase: null,
  authSession: null,
  user: null,
  isAdmin: false,
  profile: null,
  profileError: "",
  authNotice: "",
  deletionPromptShown: false,
  accountMenuOpen: false,
  customSelectOpenKey: "",
  sessions: [],
  gallerySnapshots: [],
  galleryRefreshPromise: null,
  gallerySort: "date",
  gallerySortOrder: "desc",
  theme: document.documentElement.dataset.theme === "light" ? "light" : "dark",
  sessionHistorySort: "date",
  growthStage: null,
  growthStageModalOpen: false,
  growthStageModalDismissed: false,
  pendingGrowthStageInput: null,
  growthStageModalSuppressedUntil: 0,
  newSessionSystemType: "",
  newSessionSystemModalOpen: false,
  newSessionReturnHash: "#home",
};
let sessionTimerInterval = null;
const templates = {
  auth: document.querySelector("#auth-template"),
  setup: document.querySelector("#setup-template"),
  profile: document.querySelector("#profile-template"),
  home: document.querySelector("#home-template"),
  form: document.querySelector("#session-form-template"),
  sessions: document.querySelector("#sessions-template"),
  gallery: document.querySelector("#gallery-template"),
  galleryReview: document.querySelector("#gallery-review-template"),
  detail: document.querySelector("#session-detail-template"),
};

const ADMIN_EMAILS = new Set([
  "don@cannakan.com",
  "mo@cannakan.com",
  "admin",
]);
const MOCK_DATA_ADMIN_EMAILS = new Set([
  "don@cannakan.com",
  "mo@cannakan.com",
]);
// TODO: Keep this UI allowlist in sync with database/RLS admin enforcement before production.

function isConfiguredAdminEmail(email) {
  return ADMIN_EMAILS.has(String(email || "").trim().toLowerCase());
}

function logGrowGalleryDebug(event, details = {}) {
  if (!GROW_GALLERY_DEBUG) {
    return;
  }

  console.info(`[GrowGalleryDebug] ${event}`, details);
}

function reportAppError(error, context = "App Error") {
  const errorMessage = error?.message || String(error || "Unknown error");
  const errorStack = error?.stack || "";
  console.error(context, error);

  if (!app) {
    return;
  }

  app.innerHTML = `
    <section class="card app-error-card">
      <p class="eyebrow">Render Error</p>
      <h2>${escapeHtml(context)}</h2>
      <p class="app-error-message">${escapeHtml(errorMessage)}</p>
      ${errorStack ? `<pre class="app-error-stack">${escapeHtml(errorStack)}</pre>` : ""}
    </section>
  `;
}

function safeRender() {
  try {
    render();
  } catch (error) {
    reportAppError(error, "Render failed");
  }
}

async function safeBootstrapApp() {
  try {
    await bootstrapApp();
  } catch (error) {
    appState.loading = false;
    reportAppError(error, "Startup failed");
  }
}

function getPreferredTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return "dark";
}

function getFileUploadNameLabel(input, files = input?.files) {
  if (!files || !files.length) {
    return "No file selected";
  }

  if (files.length === 1) {
    return files[0].name;
  }

  return `${files.length} images selected`;
}

function updateFileUploadName(input, files = input?.files) {
  const control = input?.closest(".file-upload-control");
  const nameElement = control?.querySelector(".file-upload-name");
  if (!nameElement) {
    return;
  }

  nameElement.textContent = getFileUploadNameLabel(input, files);
}

function bindFileUploadControl(input) {
  const control = input?.closest(".file-upload-control");
  const trigger = control?.querySelector(".file-upload-button");
  if (!input || !control || !trigger || control.dataset.bound === "true") {
    return;
  }

  const openPicker = () => {
    if (input.disabled) {
      return;
    }

    input.click();
  };

  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    openPicker();
  });

  control.addEventListener("click", (event) => {
    if (event.target === input || event.target === trigger) {
      return;
    }

    event.preventDefault();
    openPicker();
  });

  control.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    openPicker();
  });

  control.setAttribute("tabindex", input.disabled ? "-1" : "0");
  control.setAttribute("role", "button");
  control.setAttribute("aria-disabled", input.disabled ? "true" : "false");
  if (!control.getAttribute("aria-label")) {
    control.setAttribute("aria-label", trigger.textContent?.trim() || "Choose file");
  }
  control.dataset.bound = "true";
}

function closeAllCustomSelects(exceptKey = "") {
  document.querySelectorAll(".custom-select.is-open").forEach((wrapper) => {
    if (exceptKey && wrapper.dataset.dropdownKey === exceptKey) {
      return;
    }

    wrapper.classList.remove("is-open");
    const trigger = wrapper.querySelector(".custom-select-trigger");
    const menu = wrapper.querySelector(".custom-select-menu");
    trigger?.setAttribute("aria-expanded", "false");
    if (menu) {
      menu.hidden = true;
    }
  });

  appState.customSelectOpenKey = exceptKey || "";
}

function syncCustomSelect(select) {
  const wrapper = select?.closest(".custom-select");
  if (!wrapper) {
    return;
  }

  const trigger = wrapper.querySelector(".custom-select-trigger");
  const valueLabel = wrapper.querySelector(".custom-select-value");
  const menu = wrapper.querySelector(".custom-select-menu");
  const selectedOption = select.options[select.selectedIndex] || select.options[0];
  const selectedText = selectedOption?.textContent?.trim() || "Select";

  if (valueLabel) {
    valueLabel.textContent = selectedText;
  }

  trigger?.toggleAttribute("disabled", Boolean(select.disabled));
  trigger?.setAttribute("aria-disabled", select.disabled ? "true" : "false");
  trigger?.classList.toggle("is-missing", select.classList.contains("is-missing"));
  if (select.disabled) {
    closeCustomSelect(select);
  }

  menu?.querySelectorAll(".custom-select-option").forEach((optionButton) => {
    const isSelected = optionButton.dataset.value === select.value;
    optionButton.classList.toggle("is-selected", isSelected);
    optionButton.setAttribute("aria-selected", isSelected ? "true" : "false");
  });
}

function openCustomSelect(select) {
  const wrapper = select?.closest(".custom-select");
  if (!wrapper || select.disabled) {
    return;
  }

  const dropdownKey = wrapper.dataset.dropdownKey || "";
  closeAllCustomSelects(dropdownKey);
  const trigger = wrapper.querySelector(".custom-select-trigger");
  const menu = wrapper.querySelector(".custom-select-menu");
  wrapper.classList.add("is-open");
  trigger?.setAttribute("aria-expanded", "true");
  appState.customSelectOpenKey = dropdownKey;
  if (menu) {
    menu.hidden = false;
    const selectedOption = menu.querySelector(".custom-select-option.is-selected") || menu.querySelector(".custom-select-option");
    window.setTimeout(() => selectedOption?.focus(), 0);
  }
}

function closeCustomSelect(select) {
  const wrapper = select?.closest(".custom-select");
  if (!wrapper) {
    return;
  }

  wrapper.classList.remove("is-open");
  const trigger = wrapper.querySelector(".custom-select-trigger");
  const menu = wrapper.querySelector(".custom-select-menu");
  trigger?.setAttribute("aria-expanded", "false");
  if (menu) {
    menu.hidden = true;
  }

  if (appState.customSelectOpenKey === (wrapper.dataset.dropdownKey || "")) {
    appState.customSelectOpenKey = "";
  }
}

function buildCustomSelectOptions(select, menu) {
  if (!select || !menu) {
    return;
  }

  menu.innerHTML = "";
  [...select.options].forEach((option) => {
    const optionButton = document.createElement("button");
    optionButton.type = "button";
    optionButton.className = "custom-select-option";
    optionButton.dataset.value = option.value;
    optionButton.textContent = option.textContent;
    optionButton.setAttribute("role", "option");
    optionButton.setAttribute("aria-selected", option.selected ? "true" : "false");
    optionButton.classList.toggle("is-selected", option.selected);
    optionButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      select.value = option.value;
      syncCustomSelect(select);
      closeCustomSelect(select);
      select.dispatchEvent(new Event("change", { bubbles: true }));
      select.dispatchEvent(new Event("input", { bubbles: true }));
      const trigger = select.closest(".custom-select")?.querySelector(".custom-select-trigger");
      trigger?.focus();
    });
    optionButton.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeCustomSelect(select);
        select.closest(".custom-select")?.querySelector(".custom-select-trigger")?.focus();
      }
    });
    menu.appendChild(optionButton);
  });
}

function initializeCustomSelects(scope) {
  if (!scope) {
    return;
  }

  scope.querySelectorAll("select[data-custom-select]").forEach((select) => {
    const wrapper = select.closest(".custom-select");
    const trigger = wrapper?.querySelector(".custom-select-trigger");
    const menu = wrapper?.querySelector(".custom-select-menu");
    if (!wrapper || !trigger || !menu) {
      return;
    }

    buildCustomSelectOptions(select, menu);
    syncCustomSelect(select);
    const dropdownKey = wrapper.dataset.dropdownKey || "";
    const isOpen = appState.customSelectOpenKey === dropdownKey && Boolean(dropdownKey);
    wrapper.classList.toggle("is-open", isOpen);
    menu.hidden = !isOpen;
    trigger.setAttribute("aria-expanded", isOpen ? "true" : "false");

    if (select.dataset.customSelectBound === "true") {
      return;
    }

    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (select.disabled) {
        return;
      }

      const currentKey = wrapper.dataset.dropdownKey || "";
      if (appState.customSelectOpenKey === currentKey && wrapper.classList.contains("is-open")) {
        closeCustomSelect(select);
      } else {
        openCustomSelect(select);
      }
    });

    trigger.addEventListener("keydown", (event) => {
      if (select.disabled) {
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (wrapper.classList.contains("is-open")) {
          closeCustomSelect(select);
        } else {
          openCustomSelect(select);
        }
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        openCustomSelect(select);
      }

      if (event.key === "Escape") {
        event.preventDefault();
        closeCustomSelect(select);
      }
    });

    select.addEventListener("change", () => {
      syncCustomSelect(select);
    });

    select.dataset.customSelectBound = "true";
  });
}

function getCustomSelectTrigger(select) {
  return select?.closest(".custom-select")?.querySelector(".custom-select-trigger") || null;
}

function animateStageBadge(stageBadge) {
  if (!stageBadge) {
    return;
  }

  stageBadge.classList.remove("stage-badge--animate");
  void stageBadge.offsetWidth;
  stageBadge.classList.add("stage-badge--animate");

  window.clearTimeout(stageBadge.__animationTimeoutId);
  stageBadge.__animationTimeoutId = window.setTimeout(() => {
    stageBadge.classList.remove("stage-badge--animate");
  }, 380);
}

function syncThemeToggleButtons() {
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    const isDark = appState.theme === "dark";
    button.classList.toggle("is-dark", isDark);
    button.classList.toggle("is-light", !isDark);
    button.setAttribute("aria-pressed", isDark ? "true" : "false");
    button.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
    button.setAttribute("title", `Switch to ${isDark ? "light" : "dark"} mode`);
    button.innerHTML = isDark
      ? `
        <span class="theme-toggle-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <circle cx="12" cy="12" r="4.25"></circle>
            <path d="M12 2.5v2.25M12 19.25v2.25M4.75 12H2.5M21.5 12h-2.25M5.84 5.84 4.25 4.25M19.75 19.75l-1.59-1.59M18.16 5.84l1.59-1.59M5.84 18.16l-1.59 1.59"></path>
          </svg>
        </span>
      `
      : `
        <span class="theme-toggle-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a9 9 0 1 0 10.7 10.7Z"></path>
          </svg>
        </span>
      `;
  });
}

function applyTheme(theme, options = {}) {
  const normalizedTheme = theme === "dark" ? "dark" : "light";
  const persist = options.persist !== false;
  appState.theme = normalizedTheme;

  document.documentElement.classList.toggle("theme-dark", normalizedTheme === "dark");
  document.documentElement.dataset.theme = normalizedTheme;
  document.documentElement.style.colorScheme = normalizedTheme;
  document.body.classList.toggle("theme-dark", normalizedTheme === "dark");
  document.body.dataset.theme = normalizedTheme;
  document.body.style.colorScheme = normalizedTheme;

  if (persist) {
    localStorage.setItem(THEME_KEY, normalizedTheme);
  }

  syncThemeToggleButtons();
}

function toggleTheme() {
  applyTheme(appState.theme === "dark" ? "light" : "dark");
}

function closeAccountMenu() {
  if (!appState.accountMenuOpen) {
    return;
  }

  appState.accountMenuOpen = false;
  updateAuthStatus();
}

function toggleAccountMenu() {
  appState.accountMenuOpen = !appState.accountMenuOpen;
  updateAuthStatus();
}

function getMenuIconMarkup(icon) {
  const icons = {
    menu: `
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M4 7h16M4 12h16M4 17h16"></path>
      </svg>
    `,
    moon: `
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a9 9 0 1 0 10.7 10.7Z"></path>
      </svg>
    `,
    sun: `
      <svg viewBox="0 0 24 24" focusable="false">
        <circle cx="12" cy="12" r="4.25"></circle>
        <path d="M12 2.5v2.25M12 19.25v2.25M4.75 12H2.5M21.5 12h-2.25M5.84 5.84 4.25 4.25M19.75 19.75l-1.59-1.59M18.16 5.84l1.59-1.59M5.84 18.16l-1.59 1.59"></path>
      </svg>
    `,
    profile: `
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"></path>
        <path d="M4.5 20a7.5 7.5 0 0 1 15 0"></path>
      </svg>
    `,
    delete: `
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M4 7h16"></path>
        <path d="M9 7V4.5h6V7"></path>
        <path d="M8 7l.8 11h6.4L16 7"></path>
        <path d="M10 11v4M14 11v4"></path>
      </svg>
    `,
    signout: `
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="M10 5H6.5A1.5 1.5 0 0 0 5 6.5v11A1.5 1.5 0 0 0 6.5 19H10"></path>
        <path d="M14 16l5-4-5-4"></path>
        <path d="M19 12H9"></path>
      </svg>
    `,
  };

  return `<span class="account-menu-icon" aria-hidden="true">${icons[icon] || ""}</span>`;
}

async function handleAccountMenuDelete() {
  closeAccountMenu();
  const confirmed = await confirmAccountDeletion();
  if (!confirmed) {
    return;
  }

  try {
    const scheduledProfile = await scheduleUserDeletion();
    const scheduledForLabel = formatSessionNameDate(scheduledProfile.deletionScheduledFor.slice(0, 10));
    appState.authNotice = `Account deletion is scheduled for ${scheduledForLabel}. Your app data has not been permanently removed yet. Contact support to fully remove login credentials.`;
    await appState.supabase?.auth.signOut();
  } catch (error) {
    alert(error.message || "Could not delete your account data.");
  }
}

async function ensureUserProfile(user) {
  if (!appState.supabase || !user?.id) {
    return null;
  }

  appState.profileError = "";

  const { data: existingProfile, error: selectError } = await appState.supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (selectError) {
    console.error("Profile check error:", selectError);
    appState.profileError = selectError.message || "Could not check profile.";
    return null;
  }

  if (existingProfile) {
    return normalizeProfileRow(existingProfile);
  }

  const { data: createdProfile, error: insertError } = await appState.supabase
    .from("profiles")
    .upsert({
      id: user.id,
      username: "",
      avatar_url: "",
      avatar_path: "",
    })
    .select("*")
    .single();

  if (insertError) {
    console.error("Profile create error:", insertError);
    appState.profileError = insertError.message || "Could not create profile.";
    return null;
  }

  console.log("Profile created for user:", user.id);
  return normalizeProfileRow(createdProfile);
}

function getSessions() {
  return appState.sessions;
}

function normalizeStoredSession(session) {
  if (!session || typeof session !== "object") {
    return null;
  }

  return {
    ...session,
    customSessionName: String(session.customSessionName || "").trim(),
    sessionNotes: String(session.sessionNotes || "").trim(),
    sessionImages: normalizePersistedSessionImages(session.sessionImages),
    sessionStatus: String(session.sessionStatus || "").trim(),
    germinationStartedAt: String(session.germinationStartedAt || "").trim(),
    firstPlantedAt: String(session.firstPlantedAt || "").trim(),
    completedAt: String(session.completedAt || "").trim(),
    partitions: Array.isArray(session.partitions) ? session.partitions : [],
    snapshotState: normalizePersistedSessionSnapshotState(session.snapshotState),
    createdAt: String(session.createdAt || "").trim(),
  };
}

function saveSessions(sessions) {
  appState.sessions = sortSessionsNewestFirst((sessions || []).map(normalizeStoredSession).filter(Boolean));
  if (!isSupabaseConfigured()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState.sessions));
  }
}

function loadNewSessionNotesDraft() {
  try {
    return JSON.parse(localStorage.getItem(NEW_SESSION_NOTES_DRAFT_KEY) || "null");
  } catch (error) {
    console.error("Could not load new session notes draft", error);
    return null;
  }
}

function saveNewSessionNotesDraft(draft) {
  localStorage.setItem(NEW_SESSION_NOTES_DRAFT_KEY, JSON.stringify(draft));
}

function clearNewSessionNotesDraft() {
  localStorage.removeItem(NEW_SESSION_NOTES_DRAFT_KEY);
}

function ensureSampleSessions() {
  if (isSupabaseConfigured()) {
    return;
  }

  if (localStorage.getItem(SAMPLE_SEED_KEY) === SAMPLE_SEED_VERSION) {
    return;
  }

  const existingSessions = getSessions();
  const sampleSessions = buildSampleSessions();
  const sampleIds = new Set(sampleSessions.map((session) => session.id));
  const nonSampleSessions = existingSessions.filter((session) => !sampleIds.has(session.id));
  saveSessions([...sampleSessions, ...nonSampleSessions]);

  localStorage.setItem(SAMPLE_SEED_KEY, SAMPLE_SEED_VERSION);
}

function buildSampleSessions() {
  return [
    createSampleSession({
      id: "sample-kan-blue-dream-apr-21-2026",
      date: "2026-04-21",
      time: "07:10",
      systemType: "KAN",
      unitId: "A",
      sessionName: "Blue Dream pheno test - Seedsman - Apr 21, 2026",
      sessionStatus: "germinating",
      germinationStartedAt: "2026-04-21T18:20:00",
      firstPlantedAt: "2026-04-22T09:05:00",
      sessionNotes: "Moved to paper towel after 11 hours soaking. Dome is holding steady humidity and the Blue Dream partitions are opening first.",
      partitionSeeds: [
        ["Blue Dream", "Seedsman", "photo", "feminized", 4, 2],
        ["Blue Dream", "Seedsman", "photo", "feminized", 4, 3],
        ["Blue Dream", "Seedsman", "photo", "feminized", 4, 1],
        ["Blue Dream", "Seedsman", "photo", "feminized", 4, 2],
        ["Blue Dream", "Seedsman", "photo", "feminized", 4, 0],
        ["Blue Dream", "Seedsman", "photo", "feminized", 4, 1],
        ["Blue Dream", "Seedsman", "photo", "feminized", 4, 0],
        ["Blue Dream", "Seedsman", "photo", "feminized", 4, 2],
      ],
    }),
    createSampleSession({
      id: "sample-kan-lcg-apr-18-2026",
      date: "2026-04-18",
      time: "18:40",
      systemType: "KAN",
      unitId: "B",
      sessionName: "Lemon Cherry Gelato check - Elev8 - Apr 18, 2026",
      sessionStatus: "completed",
      germinationStartedAt: "2026-04-19T07:15:00",
      firstPlantedAt: "2026-04-19T22:40:00",
      completedAt: "2026-04-20T09:18:00",
      sessionNotes: "Strong early tails on partitions 2, 3, and 6. Two slower seeds stayed in the dome an extra half day before planting.",
      partitionSeeds: [
        ["Lemon Cherry Gelato", "Elev8", "photo", "feminized", 3, 3],
        ["Lemon Cherry Gelato", "Elev8", "photo", "feminized", 3, 2],
        ["Lemon Cherry Gelato", "Elev8", "photo", "feminized", 3, 3],
        ["Lemon Cherry Gelato", "Elev8", "photo", "feminized", 3, 2],
        ["Lemon Cherry Gelato", "Elev8", "photo", "feminized", 3, 1],
        ["Lemon Cherry Gelato", "Elev8", "photo", "feminized", 3, 3],
        ["Lemon Cherry Gelato", "Elev8", "photo", "feminized", 3, 2],
        ["Lemon Cherry Gelato", "Elev8", "photo", "feminized", 3, 2],
      ],
    }),
    createSampleSession({
      id: "sample-tra-cosmic-queen-apr-17-2026",
      date: "2026-04-17",
      time: "06:55",
      systemType: "TRA",
      unitId: "1",
      sessionName: "Cosmic Queen mixed tray - Mephisto - Apr 17, 2026",
      sessionStatus: "germinating",
      germinationStartedAt: "2026-04-17T20:05:00",
      firstPlantedAt: "2026-04-18T08:30:00",
      sessionNotes: "Tray sections A and B were warmed first. Outer edge partitions are a little slower, so keeping the lid cracked slightly for airflow.",
      partitionSeeds: [
        ["Cosmic Queen", "Mephisto", "auto", "feminized", 2, 1],
        ["Cosmic Queen", "Mephisto", "auto", "feminized", 2, 2],
        ["Cosmic Queen", "Mephisto", "auto", "feminized", 2, 1],
        ["Cosmic Queen", "Mephisto", "auto", "feminized", 2, 0],
        ["Sour Stomper", "Mephisto", "auto", "feminized", 2, 1],
        ["Sour Stomper", "Mephisto", "auto", "feminized", 2, 2],
        ["Sour Stomper", "Mephisto", "auto", "feminized", 2, 1],
        ["Sour Stomper", "Mephisto", "auto", "feminized", 2, 1],
        ["Strawberry Nuggets", "Mephisto", "auto", "feminized", 2, 0],
        ["Strawberry Nuggets", "Mephisto", "auto", "feminized", 2, 1],
        ["Strawberry Nuggets", "Mephisto", "auto", "feminized", 2, 1],
        ["Strawberry Nuggets", "Mephisto", "auto", "feminized", 2, 0],
        ["Double Grape", "Mephisto", "auto", "feminized", 2, 1],
        ["Double Grape", "Mephisto", "auto", "feminized", 2, 1],
        ["Double Grape", "Mephisto", "auto", "feminized", 2, 0],
        ["Double Grape", "Mephisto", "auto", "feminized", 2, 1],
      ],
    }),
    createSampleSession({
      id: "sample-tra-orange-creamsicle-apr-11-2026",
      date: "2026-04-11",
      time: "19:25",
      systemType: "TRA",
      unitId: "2",
      sessionName: "Orange Creamsicle archive - Humboldt - Apr 11, 2026",
      sessionStatus: "completed",
      germinationStartedAt: "2026-04-12T08:10:00",
      firstPlantedAt: "2026-04-13T06:55:00",
      completedAt: "2026-04-14T09:42:00",
      sessionNotes: "",
      partitionSeeds: [
        ["Orange Creamsicle", "Humboldt Seed Co", "photo", "feminized", 2, 2],
        ["Orange Creamsicle", "Humboldt Seed Co", "photo", "feminized", 2, 2],
        ["Orange Creamsicle", "Humboldt Seed Co", "photo", "feminized", 2, 1],
        ["Orange Creamsicle", "Humboldt Seed Co", "photo", "feminized", 2, 2],
        ["Blueberry Muffin", "Humboldt Seed Co", "photo", "feminized", 2, 2],
        ["Blueberry Muffin", "Humboldt Seed Co", "photo", "feminized", 2, 1],
        ["Blueberry Muffin", "Humboldt Seed Co", "photo", "feminized", 2, 2],
        ["Blueberry Muffin", "Humboldt Seed Co", "photo", "feminized", 2, 2],
        ["Pineapple Upside Down Cake", "Humboldt Seed Co", "photo", "feminized", 2, 1],
        ["Pineapple Upside Down Cake", "Humboldt Seed Co", "photo", "feminized", 2, 2],
        ["Pineapple Upside Down Cake", "Humboldt Seed Co", "photo", "feminized", 2, 2],
        ["Pineapple Upside Down Cake", "Humboldt Seed Co", "photo", "feminized", 2, 1],
        ["Jelly Donutz", "Humboldt Seed Co", "photo", "feminized", 2, 2],
        ["Jelly Donutz", "Humboldt Seed Co", "photo", "feminized", 2, 2],
        ["Jelly Donutz", "Humboldt Seed Co", "photo", "feminized", 2, 1],
        ["Jelly Donutz", "Humboldt Seed Co", "photo", "feminized", 2, 2],
      ],
    }),
  ];
}

function createSampleSession(config) {
  return {
    id: config.id,
    date: config.date,
    time: config.time,
    systemType: config.systemType,
    unitId: config.unitId,
    sessionName: config.sessionName,
    customSessionName: config.sessionName.replace(/\s-\s[A-Z][a-z]{2}\s\d{1,2},\s\d{4}$/, ""),
    sessionNotes: config.sessionNotes || "",
    sessionImages: [],
    snapshotState: null,
    sessionStatus: config.sessionStatus,
    germinationStartedAt: config.germinationStartedAt || "",
    firstPlantedAt: config.firstPlantedAt || "",
    completedAt: config.completedAt || "",
    createdAt: `${config.date}T${config.time}:00`,
    isSample: true,
    partitions: config.partitionSeeds.map((partition, index) => ({
      id: index + 1,
      seedVariety: partition[0],
      source: partition[1],
      breeder: partition[1],
      seedType: partition[2],
      feminized: partition[3],
      seedCount: partition[4],
      plantedCount: String(partition[5]),
    })),
  };
}

function removeSampleSessions() {
  const sessions = getSessions().filter((session) => !session.isSample);
  saveSessions(sessions);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  localStorage.removeItem(SAMPLE_SEED_KEY);
}

function canAccessMockDataControls() {
  const email = String(appState.user?.email || "").trim().toLowerCase();
  return Boolean(appState.isAdmin || MOCK_DATA_ADMIN_EMAILS.has(email));
}

function isMockDataEnabled() {
  if (!canAccessMockDataControls()) {
    return false;
  }

  const storedValue = localStorage.getItem(MOCK_DATA_STORAGE_KEY);
  return storedValue === "true" || storedValue === "1";
}

function setMockDataEnabled(enabled) {
  if (enabled) {
    localStorage.setItem(MOCK_DATA_STORAGE_KEY, "true");
    return;
  }

  localStorage.removeItem(MOCK_DATA_STORAGE_KEY);
}

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getMockGallerySeededNoise(seed) {
  const raw = Math.sin(seed * 12.9898) * 43758.5453;
  return raw - Math.floor(raw);
}

function createMockGalleryMonthDate(monthReference, day, hour) {
  const maxDay = new Date(
    monthReference.getFullYear(),
    monthReference.getMonth() + 1,
    0,
  ).getDate();
  const clampedDay = clampNumber(day, 1, maxDay);
  return new Date(
    monthReference.getFullYear(),
    monthReference.getMonth(),
    clampedDay,
    clampNumber(hour, 0, 23),
    (clampedDay * 7) % 60,
    0,
    0,
  ).toISOString();
}

function getMockGallerySourcePalette(sourceName) {
  const normalized = String(sourceName || "").trim().toLowerCase();
  if (normalized.includes("seedsman")) {
    return { background: "#113822", accent: "#8ed16f", text: "#f4ffe9" };
  }
  if (normalized.includes("humboldt")) {
    return { background: "#1f3022", accent: "#d8a85d", text: "#fff5df" };
  }
  if (normalized.includes("mephisto")) {
    return { background: "#1f2033", accent: "#9fb8ff", text: "#edf2ff" };
  }
  if (normalized.includes("barney")) {
    return { background: "#3a2415", accent: "#f0b06e", text: "#fff0df" };
  }
  if (normalized.includes("ethos")) {
    return { background: "#1d2833", accent: "#86d7ff", text: "#eefbff" };
  }
  if (normalized.includes("royal")) {
    return { background: "#33211c", accent: "#e7bf7a", text: "#fff6e8" };
  }

  return { background: "#182422", accent: "#94d159", text: "#f5ffec" };
}

function buildMockGalleryImageDataUri(record) {
  const palette = getMockGallerySourcePalette(record.source);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" role="img" aria-label="Dev mock grow gallery preview">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${palette.background}" />
          <stop offset="100%" stop-color="#0f1514" />
        </linearGradient>
      </defs>
      <rect width="1200" height="900" fill="url(#bg)" />
      <circle cx="960" cy="190" r="180" fill="${palette.accent}" opacity="0.16" />
      <circle cx="250" cy="680" r="220" fill="${palette.accent}" opacity="0.12" />
      <rect x="74" y="74" width="1052" height="752" rx="34" fill="none" stroke="${palette.accent}" stroke-width="4" opacity="0.35" />
      <text x="96" y="152" fill="${palette.accent}" font-size="36" font-family="Arial, sans-serif" font-weight="700">DEV MOCK GALLERY DATA</text>
      <text x="96" y="260" fill="${palette.text}" font-size="74" font-family="Arial, sans-serif" font-weight="700">${record.seedVariety}</text>
      <text x="96" y="330" fill="${palette.text}" font-size="38" font-family="Arial, sans-serif">${record.source}</text>
      <text x="96" y="448" fill="${palette.text}" font-size="118" font-family="Arial, sans-serif" font-weight="700">${record.germinationRate}%</text>
      <text x="96" y="508" fill="${palette.accent}" font-size="34" font-family="Arial, sans-serif">GERMINATION RATE</text>
      <text x="96" y="648" fill="${palette.text}" font-size="34" font-family="Arial, sans-serif">${record.germinatedCount} of ${record.seedCount} germinated</text>
      <text x="96" y="708" fill="${palette.text}" font-size="30" font-family="Arial, sans-serif">Likes ${record.likes}   Submitted ${record.submittedAt.slice(0, 10)}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function buildMockGallerySourceBadgeDataUri(sourceName) {
  const palette = getMockGallerySourcePalette(sourceName);
  const initials = String(sourceName || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0].toUpperCase())
    .join("") || "MG";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" role="img" aria-label="Mock source badge">
      <rect width="160" height="160" rx="40" fill="${palette.background}" />
      <rect x="8" y="8" width="144" height="144" rx="34" fill="none" stroke="${palette.accent}" stroke-width="6" opacity="0.55" />
      <text x="80" y="96" fill="${palette.text}" text-anchor="middle" font-size="52" font-family="Arial, sans-serif" font-weight="700">${initials}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function buildMockGalleryProfileAvatarDataUri(profileName, sourceName, index = 0) {
  const palette = getMockGallerySourcePalette(sourceName);
  const safeName = String(profileName || "").trim();
  const initials = safeName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0].toUpperCase())
    .join("") || "CG";
  const accentOpacity = 0.18 + ((index % 3) * 0.06);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="Mock grower avatar">
      <defs>
        <linearGradient id="avatarBg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${palette.background}" />
          <stop offset="100%" stop-color="#101714" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="60" fill="url(#avatarBg)" />
      <circle cx="92" cy="28" r="20" fill="${palette.accent}" opacity="${accentOpacity}" />
      <circle cx="26" cy="96" r="24" fill="${palette.accent}" opacity="0.14" />
      <circle cx="60" cy="60" r="52" fill="none" stroke="${palette.accent}" stroke-width="4" opacity="0.5" />
      <text x="60" y="70" fill="${palette.text}" text-anchor="middle" font-size="34" font-family="Arial, sans-serif" font-weight="700">${initials}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getMockGallerySharedProfile(index, record) {
  const mockProfiles = [
    "Avery Moss",
    "Jordan Vale",
    "Riley Stone",
    "Harper Lane",
    "Kai Rivers",
    "Sage Bennett",
    "Morgan Frost",
    "Parker Quinn",
  ];
  const profileName = mockProfiles[index % mockProfiles.length];
  const profileImageUrl = buildMockGalleryProfileAvatarDataUri(profileName, record?.source, index);
  const scenario = index % 4;

  if (scenario === 0) {
    return {
      includeProfileInGallery: true,
      profileName,
      profileImageUrl,
    };
  }

  if (scenario === 1) {
    return {
      includeProfileInGallery: true,
      profileName,
      profileImageUrl: "",
    };
  }

  if (scenario === 2) {
    return {
      includeProfileInGallery: true,
      profileName: "",
      profileImageUrl,
    };
  }

  return {
    includeProfileInGallery: false,
    profileName: "",
    profileImageUrl: "",
  };
}

function buildMockGallerySnapshotSeedRecords(now = new Date()) {
  const sources = [
    "Seedsman",
    "Humboldt Seed Co",
    "Mephisto",
    "Barney's Farm",
    "Ethos",
    "Royal Queen Seeds",
  ];
  const seedVarieties = [
    "Blue Dream",
    "Gelato 41",
    "Wedding Cake",
    "Gorilla Glue #4",
    "Sour Diesel",
    "White Widow",
  ];
  const varietyBaseRates = [92, 87, 79, 71, 55, 83];
  const sourceAdjustments = [4, 2, -1, -4, 1, -7];
  const rowAdjustments = [6, 1, -4, 3, -8, 0];
  const seedTypePattern = ["photo", "photo", "auto", "photo", "auto", "photo"];
  const seedCountPattern = [5, 6, 8, 10, 12, 8];
  const dayPattern = [3, 7, 10, 13, 17, 21, 24, 27, 29];
  const hourPattern = [8, 10, 12, 15, 17, 19];

  return sources.flatMap((source, sourceIndex) => (
    seedVarieties.map((_, rowIndex) => {
      const recordIndex = (sourceIndex * seedVarieties.length) + rowIndex;
      const seedVariety = seedVarieties[(sourceIndex + rowIndex) % seedVarieties.length];
      const varietyIndex = seedVarieties.indexOf(seedVariety);
      const monthOffset = Math.floor(recordIndex / 9);
      const monthReference = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1, 12, 0, 0, 0);
      const seedCount = seedCountPattern[(sourceIndex + rowIndex) % seedCountPattern.length];
      const targetRate = clampNumber(
        varietyBaseRates[varietyIndex] + sourceAdjustments[sourceIndex] + rowAdjustments[rowIndex],
        33,
        100,
      );
      const germinatedCount = clampNumber(Math.round((seedCount * targetRate) / 100), 1, seedCount);
      const germinationRate = Math.round((germinatedCount / seedCount) * 100);
      const likeNoise = getMockGallerySeededNoise(recordIndex + 1);
      const monthRecencyBoost = [10, 7, 4, 2][monthOffset] || 1;
      const likes = clampNumber(
        Math.round((germinationRate * 0.22) + (likeNoise * 18) + monthRecencyBoost),
        3,
        48,
      );

      return {
        source,
        seedVariety,
        seedType: seedTypePattern[(sourceIndex + rowIndex) % seedTypePattern.length],
        seedCount,
        germinatedCount,
        germinationRate,
        submittedAt: createMockGalleryMonthDate(
          monthReference,
          dayPattern[recordIndex % dayPattern.length],
          hourPattern[(sourceIndex + (rowIndex * 2)) % hourPattern.length],
        ),
        approved: true,
        likes,
      };
    })
  ));
}

function buildMockGallerySnapshots(records = buildMockGallerySnapshotSeedRecords()) {
  return records.map((record, index) => {
    const systemType = index % 2 === 0 ? "KAN" : "TRA";
    const unitId = systemType === "KAN"
      ? String.fromCharCode(65 + (index % 4))
      : String((index % 4) + 1);
    const usesDetailsOnlyCard = index % 9 === 0;
    const sharedProfile = getMockGallerySharedProfile(index, record);

    return {
      id: `mock-gallery-${String(index + 1).padStart(2, "0")}`,
      userId: GALLERY_MOCK_USER_ID,
      sessionId: "",
      title: `DEV MOCK - ${record.seedVariety} - ${record.source}`,
      imageUrl: usesDetailsOnlyCard ? "" : buildMockGalleryImageDataUri(record),
      imagePath: "",
      sessionDate: record.submittedAt.slice(0, 10),
      systemType,
      unitId,
      totalSeeds: record.seedCount,
      totalPlanted: record.germinatedCount,
      successPercent: record.germinationRate,
      submittedBy: "Dev Mock Preview",
      sourceName: record.source,
      sourceLogoUrl: buildMockGallerySourceBadgeDataUri(record.source),
      seedVarietyName: record.seedVariety,
      seedTypeName: record.seedType,
      includeProfileInGallery: sharedProfile.includeProfileInGallery,
      profileName: sharedProfile.profileName,
      profileImageUrl: sharedProfile.profileImageUrl,
      status: "approved",
      published: record.approved,
      includeNotes: false,
      publishedAt: record.submittedAt,
      createdAt: record.submittedAt,
      updatedAt: record.submittedAt,
      likeCount: record.likes,
      likedByCurrentUser: false,
      isMock: true,
      mockDataVersion: GALLERY_MOCK_DATA_VERSION,
    };
  });
}

const MOCK_GALLERY_SNAPSHOTS = buildMockGallerySnapshots();

function getGallerySnapshotsForDisplay(snapshotRows = appState.gallerySnapshots) {
  if (isMockDataEnabled()) {
    return sortGallerySnapshotsNewestFirst(MOCK_GALLERY_SNAPSHOTS);
  }

  return sortGallerySnapshotsNewestFirst(snapshotRows);
}

function isMockGallerySnapshot(snapshot) {
  return Boolean(snapshot?.isMock) || String(snapshot?.id || "").startsWith("mock-gallery-");
}

function createDefaultPartitions() {
  return Array.from({ length: getPartitionCountForSystem("KAN") }, (_, index) => ({
    id: index + 1,
    seedVariety: "",
    source: "",
    breeder: "",
    seedType: "",
    feminized: "",
    seedCount: 0,
    plantedCount: "",
  }));
}

function formatSessionLabel(session) {
  return session.sessionName || `${session.date} at ${session.time}`;
}

function cloneTemplate(template) {
  return template.content.cloneNode(true);
}

function clearStoredNavigationState() {
  AUTH_NAVIGATION_KEYS.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {}

    try {
      sessionStorage.removeItem(key);
    } catch {}
  });
}

function redirectToHomeAfterLogin() {
  clearStoredNavigationState();
  if (window.location.hash !== "#home") {
    window.location.hash = "#home";
    return;
  }

  safeRender();
}

function updateNavState() {
  const navLinks = document.querySelectorAll(".topbar-nav a");
  if (!navLinks.length) {
    return;
  }

  const hashRoute = (window.location.hash || "#home").replace(/^#/, "");
  const pathRoute = window.location.pathname.replace(/^\/+/, "");
  const rawRoute = pathRoute === "admin/gallery-moderation" ? pathRoute : hashRoute;
  const [route] = rawRoute.split("/");
  const activeNav = route === "home" || !route
    ? "home"
    : ((route === "gallery" || route === "admin") ? "gallery" : "sessions");

  navLinks.forEach((link) => {
    const href = link.getAttribute("href") || "";
    const isActive = href === `#${activeNav}`;
    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  document.querySelectorAll("[data-admin-nav]").forEach((link) => {
    link.hidden = true;
  });
}

async function bootstrapApp() {
  appState.loading = true;
  applyTheme(getPreferredTheme(), { persist: false });
  initializeSupabaseClient();
  updateAuthStatus();
  safeRender();

  if (appState.supabase) {
    try {
      const { data } = await withTimeout(appState.supabase.auth.getSession(), 8000, "Supabase session check timed out.");
      await handleAuthSession(data?.session, { shouldRender: false });
      appState.supabase.auth.onAuthStateChange((event, session) => {
        window.setTimeout(async () => {
          await handleAuthSession(session);
        }, 0);
      });
    } catch (error) {
      console.error("Falling back to signed-out state after auth bootstrap failure", error);
      appState.authSession = null;
      appState.user = null;
      saveSessions([]);
    }
  } else {
    ensureSampleSessions();
    saveSessions(loadLocalSessions());
    appState.gallerySnapshots = await loadGallerySnapshots("local-no-supabase");
  }

  appState.initialized = true;
  appState.loading = false;
  safeRender();
}

function withTimeout(promise, timeoutMs, timeoutMessage) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => {
        reject(new Error(timeoutMessage));
      }, timeoutMs);
    }),
  ]);
}

function initializeSupabaseClient() {
  const config = window.CANNAKAN_SUPABASE_CONFIG || {};
  if (!config.url || !config.anonKey || !window.supabase?.createClient) {
    appState.supabase = null;
    return;
  }

  appState.supabase = window.supabase.createClient(config.url, config.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "cannakan-grow-auth",
    },
  });
}

function isSupabaseConfigured() {
  return Boolean(window.CANNAKAN_SUPABASE_CONFIG?.url && window.CANNAKAN_SUPABASE_CONFIG?.anonKey);
}

function loadLocalSessions() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return [];
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.map(normalizeStoredSession).filter(Boolean) : [];
  } catch {
    return [];
  }
}

async function handleAuthSession(session, options = { shouldRender: true }) {
  appState.authSession = session || null;
  appState.user = session?.user || null;
  appState.isAdmin = false;
  appState.profile = null;
  appState.profileError = "";
  appState.deletionPromptShown = false;
  appState.accountMenuOpen = false;

  if (appState.user) {
    appState.profile = await ensureUserProfile(appState.user);
    appState.isAdmin = await loadAdminStatus();
    const sessions = await loadUserSessions();
    saveSessions(sessions);
    appState.gallerySnapshots = await loadGallerySnapshots();
  } else if (isSupabaseConfigured()) {
    saveSessions([]);
    appState.gallerySnapshots = await loadGallerySnapshots();
  }

  updateAuthStatus();
  if (options.shouldRender !== false) {
    appState.loading = false;
    safeRender();
    maybePromptScheduledDeletion();
  }
}

async function loadUserSessions() {
  if (!appState.supabase || !appState.user) {
    return [];
  }

  const { data, error } = await appState.supabase
    .from("grow_sessions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load sessions", error);
    return [];
  }

  return data.map(mapRowToSession);
}

async function loadUserProfile() {
  if (!appState.supabase || !appState.user) {
    return null;
  }

  const { data, error } = await appState.supabase
    .from("profiles")
    .select("*")
    .eq("id", appState.user.id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load profile", error);
    return null;
  }

  return normalizeProfileRow(data);
}

async function loadGallerySnapshots(reason = "unspecified") {
  if (!appState.supabase) {
    logGrowGalleryDebug("loadGallerySnapshots:skipped", {
      reason,
      cause: "supabase-missing",
    });
    return [];
  }

  const { data, error } = await appState.supabase
    .from("grow_gallery_snapshots")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) {
    logGrowGalleryDebug("loadGallerySnapshots:error", { reason, error });
    console.error("Failed to load gallery snapshots", error);
    return [];
  }

  logGrowGalleryDebug("loadGallerySnapshots:raw", {
    reason,
    count: (data || []).length,
    rows: (data || []).map((row) => ({
      id: row.id,
      status: row.status,
      isPublished: row.is_published,
      userId: row.user_id,
      sessionId: row.session_id,
    })),
  });

  const mapped = (data || []).map(mapRowToGallerySnapshot);
  const likedSnapshots = await hydrateGallerySnapshotLikes(mapped, reason);
  logGrowGalleryDebug("loadGallerySnapshots:mapped", {
    reason,
    count: likedSnapshots.length,
    rows: likedSnapshots.map((row) => ({
      id: row.id,
      status: row.status,
      userId: row.userId,
      sessionId: row.sessionId,
      likeCount: row.likeCount,
      likedByCurrentUser: row.likedByCurrentUser,
    })),
  });
  return likedSnapshots;
}

async function loadGallerySnapshotLikes(snapshotIds = [], reason = "unspecified") {
  const uniqueSnapshotIds = [...new Set((snapshotIds || []).filter(Boolean))];
  if (!appState.supabase || !uniqueSnapshotIds.length) {
    return [];
  }

  const { data, error } = await appState.supabase
    .from(GROW_GALLERY_LIKES_TABLE)
    .select("snapshot_id, user_id")
    .in("snapshot_id", uniqueSnapshotIds);

  if (error) {
    console.error("Failed to load gallery likes", { reason, error });
    return [];
  }

  return data || [];
}

function applyGallerySnapshotLikes(snapshotRows = [], likeRows = []) {
  const likeCountBySnapshotId = new Map();
  const likedSnapshotIds = new Set();
  const currentUserId = appState.user?.id || "";

  (likeRows || []).forEach((row) => {
    const snapshotId = String(row?.snapshot_id || "").trim();
    if (!snapshotId) {
      return;
    }

    likeCountBySnapshotId.set(snapshotId, (likeCountBySnapshotId.get(snapshotId) || 0) + 1);
    if (currentUserId && row?.user_id === currentUserId) {
      likedSnapshotIds.add(snapshotId);
    }
  });

  return (snapshotRows || []).map((snapshot) => {
    if (!snapshot) {
      return snapshot;
    }

    return {
      ...snapshot,
      likeCount: likeCountBySnapshotId.get(snapshot.id) || 0,
      likedByCurrentUser: likedSnapshotIds.has(snapshot.id),
    };
  });
}

function buildGallerySnapshotLikeState(likeRows = []) {
  const likeCountBySnapshotId = new Map();
  const likedSnapshotIds = new Set();
  const currentUserId = appState.user?.id || "";

  (likeRows || []).forEach((row) => {
    const snapshotId = String(row?.snapshot_id || "").trim();
    if (!snapshotId) {
      return;
    }

    likeCountBySnapshotId.set(snapshotId, (likeCountBySnapshotId.get(snapshotId) || 0) + 1);
    if (currentUserId && row?.user_id === currentUserId) {
      likedSnapshotIds.add(snapshotId);
    }
  });

  return {
    likeCountBySnapshotId,
    likedSnapshotIds,
  };
}

async function hydrateGallerySnapshotLikes(snapshotRows = [], reason = "unspecified") {
  const uniqueSnapshotIds = [...new Set((snapshotRows || []).map((snapshot) => snapshot?.id).filter(Boolean))];
  if (!uniqueSnapshotIds.length) {
    return snapshotRows;
  }

  const likeRows = await loadGallerySnapshotLikes(uniqueSnapshotIds, reason);
  return applyGallerySnapshotLikes(snapshotRows, likeRows);
}

async function refreshGallerySnapshotLikes(snapshotIds = [], reason = "refresh") {
  const uniqueSnapshotIds = [...new Set((snapshotIds || []).filter(Boolean))];
  if (!uniqueSnapshotIds.length) {
    return;
  }

  const likeRows = await loadGallerySnapshotLikes(uniqueSnapshotIds, reason);
  const { likeCountBySnapshotId, likedSnapshotIds } = buildGallerySnapshotLikeState(likeRows);
  appState.gallerySnapshots = appState.gallerySnapshots.map((snapshot) => {
    if (!snapshot || !uniqueSnapshotIds.includes(snapshot.id)) {
      return snapshot;
    }

    return {
      ...snapshot,
      likeCount: likeCountBySnapshotId.get(snapshot.id) || 0,
      likedByCurrentUser: likedSnapshotIds.has(snapshot.id),
    };
  });
}

async function loadAdminStatus() {
  if (!appState.user) {
    logGrowGalleryDebug("loadAdminStatus:skipped", { cause: "user-missing" });
    return false;
  }

  const isAdmin = isConfiguredAdminEmail(appState.user.email);
  logGrowGalleryDebug("loadAdminStatus:resolved", {
    email: appState.user.email || "",
    userId: appState.user.id || "",
    isAdmin,
  });
  return isAdmin;
}

function normalizeProfileRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    username: String(row.username || "").trim(),
    avatarUrl: String(row.avatar_url || "").trim(),
    avatarPath: String(row.avatar_path || "").trim(),
    deletionRequestedAt: row.deletion_requested_at || "",
    deletionScheduledFor: row.deletion_scheduled_for || "",
    deletionStatus: String(row.deletion_status || "").trim(),
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}

function hasCompletedProfile(profile = appState.profile) {
  return Boolean(String(profile?.username || "").trim());
}

function getProfileDisplayName() {
  return appState.profile?.username || appState.user?.email || "Signed in";
}

function isAdminUser(profile = appState.profile) {
  const isAdmin = Boolean(appState.isAdmin || isConfiguredAdminEmail(appState.user?.email));
  logGrowGalleryDebug("isAdminUser:checked", {
    email: appState.user?.email || "",
    userId: appState.user?.id || "",
    appStateIsAdmin: Boolean(appState.isAdmin),
    isAdmin,
  });
  return isAdmin;
}

function isDeletionScheduled(profile = appState.profile) {
  if (!profile) {
    return false;
  }

  if (String(profile.deletionStatus || "").trim() !== "scheduled") {
    return false;
  }

  const scheduledFor = parseCompletedAtValue(profile.deletionScheduledFor);
  return Boolean(scheduledFor && scheduledFor.getTime() > Date.now());
}

async function createCloudSession(session) {
  const record = mapSessionToRecord(session, appState.user.id);
  const { data, error } = await appState.supabase
    .from("grow_sessions")
    .insert(record)
    .select()
    .single();

  if (error) {
    throw error;
  }

  const savedSession = mapRowToSession(data);
  const intendedImages = normalizePersistedSessionImages(session.sessionImages);
  if (intendedImages.length > 0 && savedSession.sessionImages.length !== intendedImages.length) {
    savedSession.sessionImages = await persistSessionImages(savedSession, intendedImages);
  }
  saveSessions([savedSession, ...getSessions().filter((item) => item.id !== savedSession.id)]);
  return savedSession;
}

async function updateCloudSession(session) {
  const record = mapSessionToRecord(session, appState.user.id);
  const { data, error } = await appState.supabase
    .from("grow_sessions")
    .update(record)
    .eq("id", session.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  const savedSession = mapRowToSession(data);
  saveSessions(getSessions().map((item) => (item.id === savedSession.id ? savedSession : item)));
  return savedSession;
}

async function updateCloudSessionNotes(sessionId, sessionNotes) {
  const { data, error } = await appState.supabase
    .from("grow_sessions")
    .update({ session_notes: String(sessionNotes || "").trim() })
    .eq("id", sessionId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  const savedSession = mapRowToSession(data);
  saveSessions(getSessions().map((item) => (item.id === savedSession.id ? savedSession : item)));
  return savedSession;
}

async function deleteCloudSession(sessionId) {
  const existingSession = getSessions().find((item) => item.id === sessionId);
  const existingGallerySnapshot = appState.gallerySnapshots.find((item) => item.sessionId === sessionId);
  if (existingSession?.sessionImages?.length) {
    const paths = existingSession.sessionImages
      .map((image) => image.path)
      .filter(Boolean);
    if (paths.length && appState.supabase?.storage) {
      await appState.supabase.storage.from(SESSION_IMAGE_BUCKET).remove(paths);
    }
  }

  const { error } = await appState.supabase
    .from("grow_sessions")
    .delete()
    .eq("id", sessionId);

  if (error) {
    throw error;
  }

  if (existingGallerySnapshot?.imagePath) {
    await removeGallerySnapshotImage(existingGallerySnapshot.imagePath);
  }
  saveSessions(getSessions().filter((item) => item.id !== sessionId));
  appState.gallerySnapshots = appState.gallerySnapshots.filter((item) => item.sessionId !== sessionId);
}

async function uploadSessionImageFile(sessionId, file) {
  if (!appState.supabase?.storage || !appState.user) {
    throw new Error("Image uploads are not available until Supabase Storage is ready.");
  }

  const preparedImage = await prepareImageForUpload(file);
  const extension = preparedImage.extension || "jpg";
  const fileName = `${crypto.randomUUID()}.${extension}`;
  const path = `${appState.user.id}/${sessionId}/${fileName}`;
  const { error } = await appState.supabase.storage
    .from(SESSION_IMAGE_BUCKET)
    .upload(path, preparedImage.blob, {
      contentType: preparedImage.contentType,
      upsert: false,
    });

  if (error) {
    throw new Error("Could not upload images. Make sure the Supabase Storage bucket is ready.");
  }

  const { data } = appState.supabase.storage.from(SESSION_IMAGE_BUCKET).getPublicUrl(path);
  return {
    path,
    url: data.publicUrl,
    filename: file.name,
    name: file.name,
  };
}

async function uploadProfileAvatar(file) {
  if (!appState.supabase?.storage || !appState.user) {
    throw new Error("Profile image uploads are not available until Supabase Storage is ready.");
  }

  const preparedImage = await prepareImageForUpload(file, MAX_AVATAR_DIMENSION, 0.84);
  const path = `${appState.user.id}/avatar-${crypto.randomUUID()}.jpg`;
  const { error } = await appState.supabase.storage
    .from(PROFILE_AVATAR_BUCKET)
    .upload(path, preparedImage.blob, {
      contentType: preparedImage.contentType,
      upsert: false,
    });

  if (error) {
    throw new Error("Could not upload profile image.");
  }

  const { data } = appState.supabase.storage.from(PROFILE_AVATAR_BUCKET).getPublicUrl(path);
  return {
    path,
    url: data.publicUrl,
  };
}

async function removeProfileAvatarFromStorage(path) {
  if (!path || !appState.supabase?.storage) {
    return;
  }

  await appState.supabase.storage.from(PROFILE_AVATAR_BUCKET).remove([path]);
}

async function saveUserProfile(profileInput) {
  if (!appState.supabase || !appState.user) {
    throw new Error("You must be signed in to save a profile.");
  }

  const existingProfile = appState.profile || {};
  const payload = {
    id: appState.user.id,
    username: String(profileInput?.username || "").trim(),
    avatar_url: String(profileInput?.avatarUrl || "").trim(),
    avatar_path: String(profileInput?.avatarPath || "").trim(),
    deletion_requested_at:
      profileInput?.deletionRequestedAt !== undefined
        ? profileInput.deletionRequestedAt
        : existingProfile.deletionRequestedAt || null,
    deletion_scheduled_for:
      profileInput?.deletionScheduledFor !== undefined
        ? profileInput.deletionScheduledFor
        : existingProfile.deletionScheduledFor || null,
    deletion_status:
      profileInput?.deletionStatus !== undefined
        ? String(profileInput.deletionStatus || "").trim()
        : String(existingProfile.deletionStatus || "").trim(),
  };

  const { data, error } = await appState.supabase
    .from("profiles")
    .upsert(payload)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return normalizeProfileRow(data);
}

async function scheduleUserDeletion() {
  if (!appState.profile) {
    throw new Error("No profile found to schedule for deletion.");
  }

  const requestedAt = new Date();
  const scheduledFor = new Date(requestedAt.getTime() + 7 * 24 * 60 * 60 * 1000);
  appState.profile = await saveUserProfile({
    username: appState.profile.username,
    avatarUrl: appState.profile.avatarUrl,
    avatarPath: appState.profile.avatarPath,
    deletionRequestedAt: requestedAt.toISOString(),
    deletionScheduledFor: scheduledFor.toISOString(),
    deletionStatus: "scheduled",
  });
  return appState.profile;
}

async function cancelScheduledDeletion() {
  if (!appState.profile) {
    throw new Error("No profile found to update.");
  }

  appState.profile = await saveUserProfile({
    username: appState.profile.username,
    avatarUrl: appState.profile.avatarUrl,
    avatarPath: appState.profile.avatarPath,
    deletionRequestedAt: null,
    deletionScheduledFor: null,
    deletionStatus: "",
  });
  return appState.profile;
}

async function removeSessionImageFromStorage(image) {
  if (!image?.path || !appState.supabase?.storage) {
    return;
  }

  await appState.supabase.storage.from(SESSION_IMAGE_BUCKET).remove([image.path]);
}

function getSessionImagePublicUrl(path) {
  if (!path || !appState.supabase?.storage) {
    return "";
  }

  const { data } = appState.supabase.storage.from(SESSION_IMAGE_BUCKET).getPublicUrl(path);
  return data?.publicUrl || "";
}

function normalizePersistedSessionImages(images) {
  if (!Array.isArray(images)) {
    return [];
  }

  return images
    .map((image) => {
      const path = String(image?.path || "").trim();
      const url = String(image?.url || image?.previewUrl || "").trim() || getSessionImagePublicUrl(path);
      const filename = String(image?.filename || image?.name || "Session image").trim() || "Session image";

      if (!url && !path) {
        return null;
      }

      return {
        path,
        url,
        filename,
        name: filename,
      };
    })
    .filter(Boolean);
}

function getEffectiveSessionImages(session) {
  const currentImages = normalizePersistedSessionImages(session?.sessionImages);
  if (currentImages.length > 0) {
    return currentImages;
  }

  const existingSession = getSessions().find((item) => item.id === session?.id);
  return normalizePersistedSessionImages(existingSession?.sessionImages);
}

async function persistSessionImages(session, images) {
  const normalizedImages = normalizePersistedSessionImages(images);
  session.sessionImages = normalizedImages;

  if (!appState.supabase || !appState.user) {
    saveSessions(getSessions().map((item) => (item.id === session.id ? { ...item, sessionImages: normalizedImages } : item)));
    return normalizedImages;
  }

  const { data, error } = await appState.supabase
    .from("grow_sessions")
    .update({ session_images: normalizedImages })
    .eq("id", session.id)
    .select("id, session_images")
    .single();

  if (error) {
    throw error;
  }

  const nextImages = normalizePersistedSessionImages(data?.session_images || normalizedImages);
  session.sessionImages = nextImages;
  saveSessions(getSessions().map((item) => (
    item.id === session.id
      ? { ...item, sessionImages: nextImages }
      : item
  )));
  return nextImages;
}

async function uploadGallerySnapshotBlob(sessionId, blob) {
  if (!appState.supabase?.storage || !appState.user) {
    throw new Error("Public gallery publishing is not available until Supabase Storage is ready.");
  }

  const scopeId = sessionId || crypto.randomUUID();
  const path = `${appState.user.id}/${scopeId}/snapshot-${crypto.randomUUID()}.png`;
  const { error } = await appState.supabase.storage
    .from(GROW_GALLERY_BUCKET)
    .upload(path, blob, {
      contentType: "image/png",
      upsert: false,
    });

  if (error) {
    console.error("Grow Gallery storage upload failed", {
      bucket: GROW_GALLERY_BUCKET,
      path,
      sessionId,
      userId: appState.user.id,
      error,
    });
    throw new Error(getGalleryPublishErrorMessage(error, "Could not upload this snapshot to the Grow Gallery."));
  }

  const { data } = appState.supabase.storage.from(GROW_GALLERY_BUCKET).getPublicUrl(path);
  return {
    path,
    url: data?.publicUrl || "",
  };
}

async function removeGallerySnapshotImage(path) {
  if (!path || !appState.supabase?.storage) {
    return;
  }

  await appState.supabase.storage.from(GROW_GALLERY_BUCKET).remove([path]);
}

function mapRowToGallerySnapshot(row) {
  if (!row) {
    return null;
  }

  const normalizedStatus = normalizeGallerySnapshotRecordStatus(
    row.status,
    row.is_published,
  );

  return {
    id: row.id,
    userId: row.user_id,
    sessionId: row.session_id || "",
    title: String(row.snapshot_title || "").trim() || "Grow Snapshot",
    imageUrl: String(row.snapshot_image_url || "").trim(),
    imagePath: String(row.snapshot_image_path || "").trim(),
    sessionDate: row.session_date || "",
    systemType: String(row.system_type || "KAN").trim() || "KAN",
    unitId: String(row.unit_id || "").trim(),
    totalSeeds: Math.max(0, Number(row.total_seeds) || 0),
    totalPlanted: Math.max(0, Number(row.total_planted) || 0),
    successPercent: Number(row.success_percent) || 0,
    submittedBy: String(row.submitted_by || "").trim(),
    sourceName: String(row.source_name || "").trim(),
    sourceLogoUrl: String(row.source_logo_url || "").trim(),
    seedVarietyName: String(row.seed_variety_name || "").trim(),
    includeProfileInGallery: Boolean(row.include_profile_in_gallery),
    profileName: String(row.submitted_profile_name || "").trim(),
    profileImageUrl: String(row.submitted_profile_avatar_url || "").trim(),
    status: normalizedStatus,
    published: Boolean(row.is_published),
    includeNotes: Boolean(row.include_notes),
    publishedAt: row.published_at || row.created_at || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
    likeCount: Math.max(0, Number(row.like_count) || 0),
    likedByCurrentUser: Boolean(row.liked_by_current_user),
  };
}

function normalizeGallerySnapshotRecordStatus(status, isPublished = false) {
  const normalizedStatus = String(status || "").trim().toLowerCase();
  if (normalizedStatus === "pending") {
    logGrowGalleryDebug("normalizeGallerySnapshotRecordStatus", {
      inputStatus: status,
      isPublished,
      normalizedStatus: "pending_review",
    });
    return "pending_review";
  }
  if (normalizedStatus === "published") {
    logGrowGalleryDebug("normalizeGallerySnapshotRecordStatus", {
      inputStatus: status,
      isPublished,
      normalizedStatus: "approved",
    });
    return "approved";
  }
  if (["private", "pending_review", "approved", "rejected"].includes(normalizedStatus)) {
    return normalizedStatus;
  }
  logGrowGalleryDebug("normalizeGallerySnapshotRecordStatus:fallback", {
    inputStatus: status,
    isPublished,
    normalizedStatus: isPublished ? "approved" : "private",
  });
  return isPublished ? "approved" : "private";
}

function getGallerySnapshotForSession(sessionId) {
  if (!sessionId) {
    return null;
  }

  return appState.gallerySnapshots.find((entry) => entry.sessionId === sessionId) || null;
}

function getGallerySnapshotSubmitterLabel(snapshot) {
  if (!snapshot) {
    return "Anonymous grower";
  }

  return snapshot.includeProfileInGallery
    ? (snapshot.profileName || snapshot.submittedBy || "Submitted by grower")
    : "Anonymous grower";
}

function getGalleryPublishErrorMessage(error, fallbackMessage) {
  const normalizedMessage = String(
    error?.message
    || error?.error_description
    || error?.details
    || "",
  ).trim().toLowerCase();

  if (normalizedMessage.includes("bucket") && normalizedMessage.includes("not found")) {
    return "Grow Gallery storage bucket is missing or not configured.";
  }
  if (normalizedMessage.includes("row-level security") || normalizedMessage.includes("permission denied")) {
    return "You do not have permission to publish to the Grow Gallery.";
  }
  if (normalizedMessage.includes("relation") && normalizedMessage.includes("grow_gallery_snapshots")) {
    return "Grow Gallery data store is missing. Run the latest schema setup.";
  }
  if (normalizedMessage.includes("column") && normalizedMessage.includes("grow_gallery_snapshots")) {
    return "Grow Gallery schema is out of date. Apply the latest database schema.";
  }

  return fallbackMessage;
}

async function publishSnapshotToGallery(session, snapshotData, blob, options = {}) {
  if (!appState.supabase || !appState.user) {
    throw new Error("You must be signed in to publish to the Grow Gallery.");
  }

  if (!session?.id) {
    throw new Error("Save this session before publishing it to the Grow Gallery.");
  }

  const existing = getGallerySnapshotForSession(session.id);
  if (existing) {
    logGrowGalleryDebug("publishSnapshotToGallery:blocked-existing", {
      sessionId: session.id,
      existingSnapshotId: existing.id,
      existingStatus: existing.status,
    });
    throw new Error(EXISTING_GALLERY_SNAPSHOT_MESSAGE);
  }

  const upload = await uploadGallerySnapshotBlob(session.id, blob);
  const includeProfileInGallery = Boolean(options.includeProfileInGallery);
  const profileName = includeProfileInGallery
    ? String(appState.profile?.username || appState.user?.email || "").trim()
    : "";
  const profileImageUrl = includeProfileInGallery
    ? String(appState.profile?.avatarUrl || "").trim()
    : "";
  const payload = {
    user_id: appState.user.id,
    session_id: session.id,
    snapshot_title: String(snapshotData?.sessionName || formatSessionLabel(session) || "Grow Snapshot").trim(),
    snapshot_image_url: upload.url,
    snapshot_image_path: upload.path,
    session_date: session.date || null,
    system_type: session.systemType || "KAN",
    success_percent: Number(snapshotData?.percentage) || 0,
    submitted_by: profileName,
    include_profile_in_gallery: includeProfileInGallery,
    submitted_profile_name: profileName,
    submitted_profile_avatar_url: profileImageUrl,
    status: "pending_review",
    is_published: false,
    include_notes: false,
    published_at: new Date().toISOString(),
  };

  const query = appState.supabase.from("grow_gallery_snapshots").insert(payload).select("*").single();
  logGrowGalleryDebug("publishSnapshotToGallery:submit", {
    sessionId: session.id,
    userId: appState.user.id,
    destinationStatus: payload.status,
    payload,
  });

  const { data, error } = await query;
  if (error) {
    console.error("Grow Gallery snapshot save failed", {
      bucket: GROW_GALLERY_BUCKET,
      upload,
      existingSnapshotId: "",
      sessionId: session.id,
      snapshotData,
      payload,
      error,
    });
    await removeGallerySnapshotImage(upload.path);
    throw new Error(getGalleryPublishErrorMessage(error, "Could not save this snapshot to the Grow Gallery."));
  }

  const mapped = mapRowToGallerySnapshot(data);
  mapped.likeCount = 0;
  mapped.likedByCurrentUser = false;
  logGrowGalleryDebug("publishSnapshotToGallery:saved", {
    savedRow: {
      id: data?.id || "",
      status: data?.status || "",
      isPublished: data?.is_published,
      userId: data?.user_id || "",
      sessionId: data?.session_id || "",
    },
    mapped,
  });
  appState.gallerySnapshots = sortGallerySnapshotsNewestFirst([
    mapped,
    ...appState.gallerySnapshots.filter((entry) => entry.id !== mapped.id),
  ]);
  return mapped;
}

async function updateGallerySnapshotModerationStatus(snapshotId, nextStatus) {
  const allowedStatuses = new Set(["private", "pending_review", "approved", "rejected"]);
  if (!allowedStatuses.has(nextStatus)) {
    throw new Error("Invalid moderation status.");
  }

  const { data, error } = await appState.supabase
    .from("grow_gallery_snapshots")
    .update({
      status: nextStatus,
      is_published: nextStatus === "approved",
      published_at: new Date().toISOString(),
    })
    .eq("id", snapshotId)
    .select("*")
    .single();

  if (error) {
    throw new Error("Could not update moderation status.");
  }

  const existing = appState.gallerySnapshots.find((entry) => entry.id === snapshotId);
  const mapped = {
    ...mapRowToGallerySnapshot(data),
    likeCount: Math.max(0, Number(existing?.likeCount) || 0),
    likedByCurrentUser: Boolean(existing?.likedByCurrentUser),
  };
  appState.gallerySnapshots = sortGallerySnapshotsNewestFirst([
    mapped,
    ...appState.gallerySnapshots.filter((entry) => entry.id !== mapped.id),
  ]);
  return mapped;
}

async function approveSnapshot(snapshotId) {
  return updateGallerySnapshotModerationStatus(snapshotId, "approved");
}

async function rejectSnapshot(snapshotId) {
  return updateGallerySnapshotModerationStatus(snapshotId, "rejected");
}

function buildClearedSessionSnapshotState(snapshotState) {
  const existingSnapshotState = normalizePersistedSessionSnapshotState(snapshotState) || {};
  return normalizePersistedSessionSnapshotState({
    ...existingSnapshotState,
    submittedAt: "",
    galleryStatus: "social-only",
    gallerySnapshotId: "",
    galleryRoute: "",
    imageUrl: "",
    imagePath: "",
  });
}

async function clearGallerySnapshotStateForSession(sessionId) {
  if (!sessionId) {
    return null;
  }

  const session = getSessions().find((entry) => entry.id === sessionId) || null;
  if (!session) {
    return null;
  }

  session.snapshotState = buildClearedSessionSnapshotState(session.snapshotState);
  updateSessionSnapshotStateCache(session.id, session.snapshotState);
  const savedSession = await saveSessionUpdate(session);
  if (savedSession?.snapshotState !== undefined) {
    session.snapshotState = normalizePersistedSessionSnapshotState(savedSession.snapshotState);
  }
  return session.snapshotState;
}

function getOwnerGalleryAction(snapshot) {
  const status = getGallerySnapshotDisplayStatus(snapshot);
  if (status === "pending_review") {
    return { mode: "delete", label: "Withdraw from Grow Gallery" };
  }
  if (status === "rejected") {
    return { mode: "delete", label: "Remove & Resubmit" };
  }
  if (status === "approved") {
    return { mode: "request-removal", label: "Request Removal" };
  }
  return null;
}

function isGallerySnapshotOwner(snapshot, user = appState.user) {
  const snapshotUserId = String(snapshot?.userId || "").trim();
  const currentUserId = String(user?.id || "").trim();
  return Boolean(snapshotUserId && currentUserId && snapshotUserId === currentUserId);
}

async function deleteGallerySnapshot(snapshotId) {
  const existing = appState.gallerySnapshots.find((entry) => entry.id === snapshotId);
  if (!existing || !appState.supabase) {
    return;
  }

  if (!isGallerySnapshotOwner(existing)) {
    throw new Error("You can only manage your own Grow Gallery snapshots.");
  }

  if (getGallerySnapshotDisplayStatus(existing) === "approved") {
    throw new Error("Approved Grow Gallery snapshots cannot be removed here.");
  }

  await removeGallerySnapshotImage(existing.imagePath);
  const { error } = await appState.supabase
    .from("grow_gallery_snapshots")
    .delete()
    .eq("id", snapshotId);

  if (error) {
    throw new Error("Could not remove this snapshot from the Grow Gallery.");
  }

  appState.gallerySnapshots = appState.gallerySnapshots.filter((entry) => entry.id !== snapshotId);
  if (existing.sessionId) {
    await clearGallerySnapshotStateForSession(existing.sessionId);
  }
}

async function unpublishGallerySnapshot(snapshotId) {
  return deleteGallerySnapshot(snapshotId);
}

async function toggleGallerySnapshotLike(snapshotId) {
  const snapshot = appState.gallerySnapshots.find((entry) => entry.id === snapshotId);
  if (!snapshot) {
    throw new Error("Could not find this Grow Gallery snapshot.");
  }
  if (isMockGallerySnapshot(snapshot)) {
    throw new Error("Mock gallery likes are preview-only in local development.");
  }

  if (!appState.supabase || !appState.user?.id) {
    throw new Error("Sign in to like Grow Gallery snapshots.");
  }

  if (snapshot.likedByCurrentUser) {
    const { error } = await appState.supabase
      .from(GROW_GALLERY_LIKES_TABLE)
      .delete()
      .eq("snapshot_id", snapshotId)
      .eq("user_id", appState.user.id);

    if (error) {
      throw new Error("Could not remove your like right now.");
    }
  } else {
    const { error } = await appState.supabase
      .from(GROW_GALLERY_LIKES_TABLE)
      .upsert(
        {
          snapshot_id: snapshotId,
          user_id: appState.user.id,
        },
        {
          onConflict: "snapshot_id,user_id",
          ignoreDuplicates: true,
        },
      );

    if (error) {
      throw new Error("Could not save your like right now.");
    }
  }

  await refreshGallerySnapshotLikes([snapshotId], "toggle-like");
}

function sortGallerySnapshotsNewestFirst(items) {
  return [...(items || [])]
    .filter(Boolean)
    .sort((left, right) => new Date(right.publishedAt || right.createdAt || 0).getTime() - new Date(left.publishedAt || left.createdAt || 0).getTime());
}

function normalizeGallerySort(sortBy = "date") {
  const normalizedSort = String(sortBy || "").trim().toLowerCase();
  if (
    normalizedSort === "date"
    || normalizedSort === "rate"
    || normalizedSort === "source"
    || normalizedSort === "seed-type"
    || normalizedSort === "profile"
    || normalizedSort === "likes"
  ) {
    return normalizedSort;
  }

  return "date";
}

function getGallerySortOrderOptions(sortBy = "date") {
  switch (normalizeGallerySort(sortBy)) {
    case "source":
    case "seed-type":
    case "profile":
      return [
        { value: "asc", label: "A-Z" },
        { value: "desc", label: "Z-A" },
      ];
    case "rate":
    case "likes":
      return [
        { value: "desc", label: "Highest to Lowest" },
        { value: "asc", label: "Lowest to Highest" },
      ];
    case "date":
    default:
      return [
        { value: "desc", label: "Newest to Oldest" },
        { value: "asc", label: "Oldest to Newest" },
      ];
  }
}

function getDefaultGallerySortOrder(sortBy = "date") {
  return getGallerySortOrderOptions(sortBy)[0]?.value || "desc";
}

function normalizeGallerySortOrder(sortBy = "date", sortOrder = "") {
  const normalizedOrder = String(sortOrder || "").trim().toLowerCase();
  const validOptions = new Set(getGallerySortOrderOptions(sortBy).map((option) => option.value));
  return validOptions.has(normalizedOrder)
    ? normalizedOrder
    : getDefaultGallerySortOrder(sortBy);
}

function getGallerySortLabel(sortBy = "date") {
  switch (normalizeGallerySort(sortBy)) {
    case "source":
      return "Source";
    case "seed-type":
      return "Seed Type";
    case "profile":
      return "Profile";
    case "rate":
      return "Highest Germination Rate";
    case "likes":
      return "Most Likes";
    case "date":
    default:
      return "Date";
  }
}

function getGallerySortOrderLabel(sortBy = "date", sortOrder = "") {
  const normalizedOrder = normalizeGallerySortOrder(sortBy, sortOrder);
  return getGallerySortOrderOptions(sortBy).find((option) => option.value === normalizedOrder)?.label || "";
}

function getGallerySnapshotSortSourceLabel(snapshot) {
  return getGallerySnapshotLeaderboardMetadata(snapshot).sourceName;
}

function getGallerySnapshotSortSeedTypeLabel(snapshot) {
  return getGallerySnapshotLeaderboardMetadata(snapshot).seedTypeName;
}

function compareGalleryTextValues(leftValue, rightValue, sortOrder = "asc") {
  const leftText = String(leftValue || "").trim();
  const rightText = String(rightValue || "").trim();
  if (leftText && !rightText) {
    return -1;
  }
  if (!leftText && rightText) {
    return 1;
  }
  if (!leftText && !rightText) {
    return 0;
  }

  return sortOrder === "desc"
    ? rightText.localeCompare(leftText, "en", { sensitivity: "base" })
    : leftText.localeCompare(rightText, "en", { sensitivity: "base" });
}

function sortVisibleGallerySnapshots(items, sortBy = "date", sortOrder = "") {
  const normalizedSort = normalizeGallerySort(sortBy);
  const normalizedOrder = normalizeGallerySortOrder(normalizedSort, sortOrder);
  return [...(items || [])]
    .filter(Boolean)
    .sort((left, right) => {
      switch (normalizedSort) {
        case "likes":
          return ((normalizedOrder === "asc"
            ? (Math.max(0, Number(left?.likeCount) || 0) - Math.max(0, Number(right?.likeCount) || 0))
            : (Math.max(0, Number(right?.likeCount) || 0) - Math.max(0, Number(left?.likeCount) || 0)))
            || (getGallerySnapshotSortTime(right) - getGallerySnapshotSortTime(left)));
        case "profile":
          return compareGalleryTextValues(
            getGallerySnapshotGrowMemberLabel(left),
            getGallerySnapshotGrowMemberLabel(right),
            normalizedOrder,
          )
            || (getGallerySnapshotSortTime(right) - getGallerySnapshotSortTime(left));
        case "seed-type":
          return compareGalleryTextValues(
            getGallerySnapshotSortSeedTypeLabel(left),
            getGallerySnapshotSortSeedTypeLabel(right),
            normalizedOrder,
          )
            || (getGallerySnapshotSortTime(right) - getGallerySnapshotSortTime(left));
        case "source":
          return compareGalleryTextValues(
            getGallerySnapshotSortSourceLabel(left),
            getGallerySnapshotSortSourceLabel(right),
            normalizedOrder,
          )
            || (getGallerySnapshotSortTime(right) - getGallerySnapshotSortTime(left));
        case "rate":
          return ((normalizedOrder === "asc"
            ? getGallerySnapshotSuccessRate(left) - getGallerySnapshotSuccessRate(right)
            : getGallerySnapshotSuccessRate(right) - getGallerySnapshotSuccessRate(left)))
            || (getGallerySnapshotSortTime(right) - getGallerySnapshotSortTime(left));
        case "date":
        default:
          return normalizedOrder === "asc"
            ? getGallerySnapshotSortTime(left) - getGallerySnapshotSortTime(right)
            : getGallerySnapshotSortTime(right) - getGallerySnapshotSortTime(left);
      }
    });
}

function getGallerySnapshotSortLabel(snapshot) {
  return String(snapshot?.title || "").trim();
}

function getGallerySnapshotGrowMemberLabel(snapshot) {
  if (!hasGallerySnapshotGrowMember(snapshot)) {
    return "";
  }

  return String(snapshot?.profileName || "").trim();
}

function hasGallerySnapshotImage(snapshot) {
  return Boolean(String(snapshot?.imageUrl || "").trim());
}

function getGallerySnapshotSourceLabel(snapshot) {
  return getGallerySnapshotLeaderboardMetadata(snapshot).sourceName || "Unknown source";
}

function getGallerySnapshotPlaceholderPalette(snapshot) {
  return getMockGallerySourcePalette(getGallerySnapshotSourceLabel(snapshot));
}

function getGallerySnapshotSubmittedDateLabel(snapshot) {
  if (snapshot?.sessionDate) {
    return formatSessionNameDate(snapshot.sessionDate);
  }

  const parsedDate = parseLeaderboardSnapshotDate(snapshot);
  if (!(parsedDate instanceof Date) || Number.isNaN(parsedDate.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
}

function renderGallerySnapshotMediaMarkup(snapshot, details = {}) {
  if (hasGallerySnapshotImage(snapshot)) {
    return `
      <div class="gallery-card-media">
        <img src="${escapeHtml(snapshot.imageUrl)}" alt="${escapeHtml(snapshot.title)}" class="gallery-card-image">
      </div>
    `;
  }

  const palette = getGallerySnapshotPlaceholderPalette(snapshot);
  const safeTitle = String(snapshot?.title || "Grow Snapshot").trim() || "Grow Snapshot";
  const safeSource = getGallerySnapshotSourceLabel(snapshot);
  const safeRate = `${Math.max(0, Number(snapshot.successPercent) || 0)}%`;
  const safeSeeds = details.seedCountLabel || "Seed count unavailable";
  const safeSubmitted = getGallerySnapshotSubmittedDateLabel(snapshot);

  return `
    <div
      class="gallery-card-media gallery-card-media--details-only"
      style="--gallery-placeholder-bg:${escapeHtml(palette.background)};--gallery-placeholder-accent:${escapeHtml(palette.accent)};--gallery-placeholder-text:${escapeHtml(palette.text)};"
    >
      <span class="gallery-card-placeholder-orb gallery-card-placeholder-orb--top" aria-hidden="true"></span>
      <span class="gallery-card-placeholder-orb gallery-card-placeholder-orb--bottom" aria-hidden="true"></span>
      <div class="gallery-card-placeholder">
        <div class="gallery-card-placeholder-header">
          <span class="gallery-card-placeholder-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
              <rect x="4" y="5" width="16" height="14" rx="2"></rect>
              <path d="M8 11h8"></path>
              <path d="M8 15h5"></path>
              <circle cx="9" cy="9" r="1"></circle>
            </svg>
          </span>
          <div class="gallery-card-placeholder-copy">
            <p class="gallery-card-placeholder-eyebrow">No image uploaded</p>
            <p class="gallery-card-placeholder-title">Snapshot details only</p>
          </div>
        </div>
        <div class="gallery-card-placeholder-main">
          <p class="gallery-card-placeholder-snapshot-title">${escapeHtml(safeTitle)}</p>
          <p class="gallery-card-placeholder-source">${escapeHtml(safeSource)}</p>
        </div>
        <div class="gallery-card-placeholder-rate">
          <span class="gallery-card-placeholder-rate-value">${escapeHtml(safeRate)}</span>
          <span class="gallery-card-placeholder-rate-label">Germination rate</span>
        </div>
        <div class="gallery-card-placeholder-stats">
          <div class="gallery-card-placeholder-stat">
            <span class="gallery-card-placeholder-label">Seed count</span>
            <span class="gallery-card-placeholder-value">${escapeHtml(safeSeeds)}</span>
          </div>
          <div class="gallery-card-placeholder-stat">
            <span class="gallery-card-placeholder-label">Submitted</span>
            <span class="gallery-card-placeholder-value">${escapeHtml(safeSubmitted)}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderGallerySharedProfileMarkup(snapshot) {
  if (!snapshot?.includeProfileInGallery) {
    return "";
  }

  const profileName = String(snapshot.profileName || "").trim();
  const profileImageUrl = String(snapshot.profileImageUrl || "").trim();
  if (!profileName && !profileImageUrl) {
    return "";
  }

  return `
    <div class="gallery-card-profile">
      ${profileImageUrl ? `<img src="${escapeHtml(profileImageUrl)}" alt="${escapeHtml(profileName || "Shared grower profile image")}" class="gallery-card-profile-avatar">` : ""}
      ${profileName ? `<span class="gallery-card-profile-name">${escapeHtml(profileName)}</span>` : ""}
    </div>
  `;
}

function normalizeLeaderboardLabel(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function normalizeLeaderboardKey(value) {
  return normalizeLeaderboardLabel(value).toLowerCase();
}

function parseLeaderboardSnapshotDate(snapshot) {
  const rawValue = snapshot?.publishedAt || snapshot?.createdAt || "";
  if (!rawValue) {
    return null;
  }

  const parsed = new Date(rawValue);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getLeaderboardMonthKey(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "";
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getGallerySnapshotLeaderboardMetadata(snapshot) {
  const linkedSession = snapshot?.sessionId
    ? getSessions().find((session) => session.id === snapshot.sessionId)
    : null;
  const firstPartitionWithIdentity = (linkedSession?.partitions || []).find((partition) => (
    normalizeLeaderboardLabel(formatPartitionSource(partition))
    || normalizeLeaderboardLabel(formatPartitionSeedVariety(partition))
  )) || linkedSession?.partitions?.[0] || null;
  const firstPartitionWithSeedType = (linkedSession?.partitions || []).find((partition) => (
    normalizeLeaderboardLabel(partition?.seedType)
  )) || linkedSession?.partitions?.[0] || null;
  const normalizedSeedType = normalizeLeaderboardLabel(snapshot?.seedTypeName || firstPartitionWithSeedType?.seedType || "");

  return {
    sourceName: normalizeLeaderboardLabel(snapshot?.sourceName || formatPartitionSource(firstPartitionWithIdentity)),
    sourceLogoUrl: String(snapshot?.sourceLogoUrl || "").trim(),
    seedVarietyName: normalizeLeaderboardLabel(snapshot?.seedVarietyName || formatPartitionSeedVariety(firstPartitionWithIdentity)),
    seedTypeName: normalizedSeedType ? capitalize(normalizedSeedType) : "",
  };
}

// Performance leaderboards are intentionally based only on germination results.
// Likes remain separate display/sort metadata for future non-performance views.
function buildGalleryLeaderboardEntries(snapshots, type = "source") {
  const groups = new Map();

  (snapshots || []).forEach((snapshot) => {
    const metadata = getGallerySnapshotLeaderboardMetadata(snapshot);
    const label = type === "source" ? metadata.sourceName : metadata.seedVarietyName;
    const normalizedKey = normalizeLeaderboardKey(label);
    if (!normalizedKey) {
      return;
    }

    const publishedDate = parseLeaderboardSnapshotDate(snapshot);
    const currentGroup = groups.get(normalizedKey) || {
      key: normalizedKey,
      name: label,
      sourceLogoUrl: type === "source" ? metadata.sourceLogoUrl : "",
      snapshotCount: 0,
      successPercentTotal: 0,
      totalPlanted: 0,
      totalSeeds: 0,
      latestPublishedAt: "",
    };

    currentGroup.snapshotCount += 1;
    currentGroup.successPercentTotal += Number(snapshot?.successPercent) || 0;
    currentGroup.totalPlanted += Math.max(0, Number(snapshot?.totalPlanted) || 0);
    currentGroup.totalSeeds += Math.max(0, Number(snapshot?.totalSeeds) || 0);
    if (metadata.sourceLogoUrl && !currentGroup.sourceLogoUrl) {
      currentGroup.sourceLogoUrl = metadata.sourceLogoUrl;
    }

    const currentLatest = currentGroup.latestPublishedAt ? new Date(currentGroup.latestPublishedAt) : null;
    if (!currentLatest || Number.isNaN(currentLatest.getTime()) || (publishedDate && publishedDate > currentLatest)) {
      currentGroup.latestPublishedAt = publishedDate?.toISOString() || currentGroup.latestPublishedAt;
    }

    groups.set(normalizedKey, currentGroup);
  });

  return [...groups.values()]
    .filter((entry) => entry.snapshotCount >= 3)
    .map((entry) => ({
      ...entry,
      averagePercent: entry.snapshotCount > 0
        ? Math.round((entry.successPercentTotal / entry.snapshotCount) * 10) / 10
        : 0,
    }))
    .sort((left, right) => {
      if (right.averagePercent !== left.averagePercent) {
        return right.averagePercent - left.averagePercent;
      }
      if (right.totalPlanted !== left.totalPlanted) {
        return right.totalPlanted - left.totalPlanted;
      }
      if (right.totalSeeds !== left.totalSeeds) {
        return right.totalSeeds - left.totalSeeds;
      }
      const leftTime = new Date(left.latestPublishedAt || 0).getTime();
      const rightTime = new Date(right.latestPublishedAt || 0).getTime();
      if (rightTime !== leftTime) {
        return rightTime - leftTime;
      }
      return left.name.localeCompare(right.name, "en", { sensitivity: "base" });
    });
}

function getApprovedPublicGallerySnapshots() {
  return getGallerySnapshotsForDisplay().filter((snapshot) => getGallerySnapshotDisplayStatus(snapshot) === "approved");
}

function getCurrentMonthApprovedGallerySnapshots() {
  const now = new Date();
  const currentMonthKey = getLeaderboardMonthKey(now);
  return getApprovedPublicGallerySnapshots().filter((snapshot) => (
    getLeaderboardMonthKey(parseLeaderboardSnapshotDate(snapshot)) === currentMonthKey
  ));
}

function buildGallerySeedTypeHighlightEntry(snapshots) {
  const groups = new Map();

  (snapshots || []).forEach((snapshot) => {
    const metadata = getGallerySnapshotLeaderboardMetadata(snapshot);
    const label = metadata.seedTypeName;
    const normalizedKey = normalizeLeaderboardKey(label);
    if (!normalizedKey) {
      return;
    }

    const publishedDate = parseLeaderboardSnapshotDate(snapshot);
    const currentGroup = groups.get(normalizedKey) || {
      key: normalizedKey,
      name: label,
      snapshotCount: 0,
      successPercentTotal: 0,
      totalPlanted: 0,
      totalSeeds: 0,
      latestPublishedAt: "",
    };

    currentGroup.snapshotCount += 1;
    currentGroup.successPercentTotal += Number(snapshot?.successPercent) || 0;
    currentGroup.totalPlanted += Math.max(0, Number(snapshot?.totalPlanted) || 0);
    currentGroup.totalSeeds += Math.max(0, Number(snapshot?.totalSeeds) || 0);

    const currentLatest = currentGroup.latestPublishedAt ? new Date(currentGroup.latestPublishedAt) : null;
    if (!currentLatest || Number.isNaN(currentLatest.getTime()) || (publishedDate && publishedDate > currentLatest)) {
      currentGroup.latestPublishedAt = publishedDate?.toISOString() || currentGroup.latestPublishedAt;
    }

    groups.set(normalizedKey, currentGroup);
  });

  return [...groups.values()]
    .filter((entry) => entry.snapshotCount >= 3)
    .map((entry) => ({
      ...entry,
      averagePercent: entry.snapshotCount > 0
        ? Math.round((entry.successPercentTotal / entry.snapshotCount) * 10) / 10
        : 0,
    }))
    .sort((left, right) => {
      if (right.averagePercent !== left.averagePercent) {
        return right.averagePercent - left.averagePercent;
      }
      if (right.totalPlanted !== left.totalPlanted) {
        return right.totalPlanted - left.totalPlanted;
      }
      if (right.totalSeeds !== left.totalSeeds) {
        return right.totalSeeds - left.totalSeeds;
      }
      const leftTime = new Date(left.latestPublishedAt || 0).getTime();
      const rightTime = new Date(right.latestPublishedAt || 0).getTime();
      if (rightTime !== leftTime) {
        return rightTime - leftTime;
      }
      return left.name.localeCompare(right.name, "en", { sensitivity: "base" });
    })[0] || null;
}

function renderGallerySeedTypeHighlights(thisMonthTopSeedType, allTimeTopSeedType) {
  const thisMonthLabel = thisMonthTopSeedType?.name || "Not enough data yet";
  const allTimeLabel = allTimeTopSeedType?.name || "Not enough data yet";

  return `
    <div class="gallery-seedtype-highlights" aria-label="Top seed type highlights">
      <div class="gallery-seedtype-highlight">
        <span class="gallery-seedtype-highlight-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
            <path d="M8 4.5h8"></path>
            <path d="M9 4.5v3a3 3 0 0 0 3 3 3 3 0 0 0 3-3v-3"></path>
            <path d="M6.5 6.5c0 2.8 2.2 5 5 5"></path>
            <path d="M17.5 6.5c0 2.8-2.2 5-5 5"></path>
            <path d="M12 12v3.5"></path>
            <path d="M9.5 19.5 12 15.5l2.5 4"></path>
          </svg>
        </span>
        <span class="gallery-seedtype-highlight-text">${escapeHtml(`This Month Top Seed Type: ${thisMonthLabel}`)}</span>
      </div>
      <div class="gallery-seedtype-highlight">
        <span class="gallery-seedtype-highlight-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
            <path d="M8 4.5h8"></path>
            <path d="M9 4.5v3a3 3 0 0 0 3 3 3 3 0 0 0 3-3v-3"></path>
            <path d="M6.5 6.5c0 2.8 2.2 5 5 5"></path>
            <path d="M17.5 6.5c0 2.8-2.2 5-5 5"></path>
            <path d="M12 12v3.5"></path>
            <path d="M9.5 19.5 12 15.5l2.5 4"></path>
          </svg>
        </span>
        <span class="gallery-seedtype-highlight-text">${escapeHtml(`All-Time Top Seed Type: ${allTimeLabel}`)}</span>
      </div>
    </div>
  `;
}

function buildGalleryLongestTopStreak(snapshots, type = "source") {
  const snapshotsByMonth = new Map();
  (snapshots || []).forEach((snapshot) => {
    const monthKey = getLeaderboardMonthKey(parseLeaderboardSnapshotDate(snapshot));
    if (!monthKey) {
      return;
    }

    const monthSnapshots = snapshotsByMonth.get(monthKey) || [];
    monthSnapshots.push(snapshot);
    snapshotsByMonth.set(monthKey, monthSnapshots);
  });

  const monthlyWinners = [...snapshotsByMonth.entries()]
    .sort((left, right) => left[0].localeCompare(right[0], "en"))
    .map(([monthKey, monthSnapshots]) => {
      const topEntry = buildGalleryLeaderboardEntries(monthSnapshots, type)[0] || null;
      return topEntry ? { monthKey, entry: topEntry } : null;
    })
    .filter(Boolean);

  let bestStreak = null;
  let currentStreak = null;

  monthlyWinners.forEach(({ monthKey, entry }) => {
    const [year, month] = monthKey.split("-").map((value) => Number(value));
    const monthIndex = year * 12 + (month - 1);

    if (
      currentStreak
      && currentStreak.key === entry.key
      && monthIndex === currentStreak.lastMonthIndex + 1
    ) {
      currentStreak.length += 1;
      currentStreak.lastMonthIndex = monthIndex;
      currentStreak.lastMonthKey = monthKey;
      currentStreak.averagePercent = entry.averagePercent;
      currentStreak.sourceLogoUrl = currentStreak.sourceLogoUrl || entry.sourceLogoUrl || "";
    } else {
      currentStreak = {
        key: entry.key,
        name: entry.name,
        averagePercent: entry.averagePercent,
        sourceLogoUrl: entry.sourceLogoUrl || "",
        length: 1,
        firstMonthKey: monthKey,
        lastMonthKey: monthKey,
        lastMonthIndex: monthIndex,
      };
    }

    if (
      !bestStreak
      || currentStreak.length > bestStreak.length
      || (currentStreak.length === bestStreak.length && currentStreak.averagePercent > bestStreak.averagePercent)
    ) {
      bestStreak = { ...currentStreak };
    }
  });

  return bestStreak;
}

function getLeaderboardRankTone(index) {
  if (index === 0) {
    return "is-gold";
  }
  if (index === 1) {
    return "is-silver";
  }
  return "is-bronze";
}

function renderGalleryLeaderboardIcon(type, entry = {}) {
  const logoUrl = type === "source" ? String(entry?.sourceLogoUrl || "").trim() : "";
  if (type === "source" && logoUrl) {
    return `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(entry?.name || "Source logo")}" class="gallery-leaderboard-icon-image">`;
  }

  if (type === "source") {
    return `
      <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
        <circle cx="12" cy="12" r="9"></circle>
        <path d="M8.5 14.5h7"></path>
        <path d="M9 10.5h6"></path>
        <path d="M12 7.5v9"></path>
      </svg>
    `;
  }

  return `
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path d="M12 18c-2.8 0-5-2.1-5-4.8 0-2.9 2.2-5.3 5.6-7.5.2-.1.5-.1.7 0 3.4 2.2 5.7 4.6 5.7 7.5 0 2.7-2.3 4.8-5 4.8Z"></path>
      <path d="M12 10.5c0 3.6-1.2 6.1-3.5 7.5"></path>
    </svg>
  `;
}

function renderGalleryLeaderboardRows(entries = [], type = "source", emptyMessage = "Not enough approved public data yet.") {
  if (!entries.length) {
    return `
      <div class="gallery-leaderboard-empty">
        <p>${escapeHtml(emptyMessage)}</p>
      </div>
    `;
  }

  return `
    <ol class="gallery-leaderboard-list">
      ${entries.map((entry, index) => `
        <li class="gallery-leaderboard-row ${getLeaderboardRankTone(index)}">
          <span class="gallery-leaderboard-rank">#${index + 1}</span>
          <span class="gallery-leaderboard-icon" aria-hidden="true">
            ${renderGalleryLeaderboardIcon(type, entry)}
          </span>
          <span class="gallery-leaderboard-name">${escapeHtml(entry.name)}</span>
          <span class="gallery-leaderboard-metric">${escapeHtml(`${entry.averagePercent}% avg`)}</span>
        </li>
      `).join("")}
    </ol>
  `;
}

function renderGalleryLeaderboardSectionHeadingIcon(iconType = "month") {
  switch (iconType) {
    case "all-time":
      return `
        <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
          <circle cx="12" cy="12" r="8"></circle>
          <path d="M12 7v5l3 2"></path>
        </svg>
      `;
    case "streak":
      return `
        <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
          <path d="M13 3 6 14h5l-1 7 8-12h-5l0-6Z"></path>
        </svg>
      `;
    case "month":
    default:
      return `
        <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
          <rect x="4.5" y="5.5" width="15" height="14" rx="2.5"></rect>
          <path d="M8 3.5v4M16 3.5v4M4.5 9.5h15"></path>
          <path d="M8.5 13h3M8.5 16h7"></path>
        </svg>
      `;
  }
}

function renderGalleryLeaderboardCardHeading(title, subtitle, iconType = "month") {
  return `
    <div class="gallery-leaderboard-card-heading">
      <div class="gallery-leaderboard-card-heading-row">
        <span class="gallery-leaderboard-section-icon" aria-hidden="true">
          ${renderGalleryLeaderboardSectionHeadingIcon(iconType)}
        </span>
        <div class="gallery-leaderboard-card-heading-copy">
          <h4>${escapeHtml(title)}</h4>
          <p class="eyebrow">${escapeHtml(subtitle)}</p>
        </div>
      </div>
    </div>
  `;
}

function renderGalleryLongestStreakRow(streakEntry, type = "source", emptyMessage = "Not enough approved monthly data yet.") {
  if (!streakEntry) {
    return `
      <div class="gallery-leaderboard-empty">
        <p>${escapeHtml(emptyMessage)}</p>
      </div>
    `;
  }

  return `
    <div class="gallery-leaderboard-row ${getLeaderboardRankTone(0)}">
      <span class="gallery-leaderboard-rank">#1</span>
      <span class="gallery-leaderboard-icon" aria-hidden="true">
        ${renderGalleryLeaderboardIcon(type, streakEntry)}
      </span>
      <span class="gallery-leaderboard-name">${escapeHtml(streakEntry.name)}</span>
      <span class="gallery-leaderboard-metric">${escapeHtml(`${streakEntry.averagePercent}% avg · ${streakEntry.length} mo`)}</span>
    </div>
  `;
}

function renderGalleryLeaderboardSection() {
  const approvedSnapshots = getApprovedPublicGallerySnapshots();
  const monthlySnapshots = getCurrentMonthApprovedGallerySnapshots();
  const thisMonthTopSeedType = buildGallerySeedTypeHighlightEntry(monthlySnapshots);
  const allTimeTopSeedType = buildGallerySeedTypeHighlightEntry(approvedSnapshots);
  const thisMonthSources = buildGalleryLeaderboardEntries(monthlySnapshots, "source").slice(0, 3);
  const thisMonthVarieties = buildGalleryLeaderboardEntries(monthlySnapshots, "variety").slice(0, 3);
  const allTimeSources = buildGalleryLeaderboardEntries(approvedSnapshots, "source").slice(0, 3);
  const allTimeVarieties = buildGalleryLeaderboardEntries(approvedSnapshots, "variety").slice(0, 3);
  const sourceStreak = buildGalleryLongestTopStreak(approvedSnapshots, "source");
  const varietyStreak = buildGalleryLongestTopStreak(approvedSnapshots, "variety");

  const section = document.createElement("section");
  section.className = "card gallery-section gallery-leaderboard-section";
  section.innerHTML = `
    <div class="section-heading">
      <div class="section-title-with-icon">
        <svg class="section-title-icon" viewBox="0 0 24 24" focusable="false" aria-hidden="true">
          <path d="M5 17.5h14"></path>
          <path d="M7.5 17.5V11"></path>
          <path d="M12 17.5V7.5"></path>
          <path d="M16.5 17.5v-4"></path>
        </svg>
        <div>
          <p class="eyebrow">Leaderboard Insights</p>
          <h3>Community Grow Gallery Rankings</h3>
          <p class="muted">Approved public snapshots only. Rankings use germination performance only, with a 3-snapshot minimum per source or seed variety. Likes stay separate for future sorting.</p>
        </div>
      </div>
    </div>
    ${renderGallerySeedTypeHighlights(thisMonthTopSeedType, allTimeTopSeedType)}
    <div class="gallery-leaderboard-grid">
      <article class="gallery-leaderboard-card">
        ${renderGalleryLeaderboardCardHeading("Top 3 Sources", "This Month", "month")}
        ${renderGalleryLeaderboardRows(thisMonthSources, "source", "Not enough approved public source data this month yet.")}
      </article>
      <article class="gallery-leaderboard-card">
        ${renderGalleryLeaderboardCardHeading("Top 3 Seed Varieties", "This Month", "month")}
        ${renderGalleryLeaderboardRows(thisMonthVarieties, "variety", "Not enough approved public seed variety data this month yet.")}
      </article>
      <article class="gallery-leaderboard-card">
        ${renderGalleryLeaderboardCardHeading("Top 3 Sources", "All Time", "all-time")}
        ${renderGalleryLeaderboardRows(allTimeSources, "source", "Not enough approved public source data yet.")}
      </article>
      <article class="gallery-leaderboard-card">
        ${renderGalleryLeaderboardCardHeading("Top 3 Seed Varieties", "All Time", "all-time")}
        ${renderGalleryLeaderboardRows(allTimeVarieties, "variety", "Not enough approved public seed variety data yet.")}
      </article>
      <article class="gallery-leaderboard-card">
        ${renderGalleryLeaderboardCardHeading("#1 Source", "Longest Streak on Top", "streak")}
        ${renderGalleryLongestStreakRow(sourceStreak, "source", "No monthly source streak is available yet.")}
      </article>
      <article class="gallery-leaderboard-card">
        ${renderGalleryLeaderboardCardHeading("#1 Seed Variety", "Longest Streak on Top", "streak")}
        ${renderGalleryLongestStreakRow(varietyStreak, "variety", "No monthly seed variety streak is available yet.")}
      </article>
    </div>
  `;

  return section;
}

function renderGalleryLikeButtonMarkup(snapshot) {
  const likeCount = Math.max(0, Number(snapshot?.likeCount) || 0);
  const isLiked = Boolean(snapshot?.likedByCurrentUser);
  const isMock = isMockGallerySnapshot(snapshot);

  return `
    <button
      type="button"
      class="gallery-like-button${isLiked ? " is-liked" : ""}"
      data-gallery-like="${escapeHtml(snapshot?.id || "")}"
      aria-pressed="${isLiked ? "true" : "false"}"
      aria-label="${isMock ? "Mock likes are preview-only" : (isLiked ? "Unlike this Grow Gallery snapshot" : "Like this Grow Gallery snapshot")}"
      ${isMock ? "disabled" : ""}
    >
      <span class="gallery-like-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
          <path d="M12 20.2 4.95 13.7a4.96 4.96 0 0 1 0-7.11 4.85 4.85 0 0 1 6.97 0L12 7.08l.08-.49a4.85 4.85 0 0 1 6.97 0 4.96 4.96 0 0 1 0 7.11Z"></path>
        </svg>
      </span>
      <span class="gallery-like-count">${escapeHtml(String(likeCount))}</span>
    </button>
  `;
}

function hasGallerySnapshotGrowMember(snapshot) {
  if (!snapshot?.includeProfileInGallery) {
    return false;
  }

  return Boolean(
    String(snapshot?.profileName || "").trim()
    || String(snapshot?.profileImageUrl || "").trim(),
  );
}

function getGallerySnapshotSuccessRate(snapshot) {
  return Math.max(0, Number(snapshot?.successPercent) || 0);
}

function getGallerySnapshotSortTime(snapshot) {
  return new Date(snapshot?.publishedAt || snapshot?.createdAt || 0).getTime();
}

function getGallerySnapshotDisplayStatus(snapshot) {
  return normalizeGallerySnapshotRecordStatus(snapshot?.status, snapshot?.published);
}

function getGallerySnapshotDebugSignature(snapshots) {
  return JSON.stringify((snapshots || []).map((snapshot) => ({
    id: snapshot.id,
    status: getGallerySnapshotDisplayStatus(snapshot),
    userId: snapshot.userId || "",
    sessionId: snapshot.sessionId || "",
  })));
}

async function refreshGallerySnapshots(reason = "unspecified", targetSnapshotId = "") {
  if (!appState.supabase) {
    logGrowGalleryDebug("refreshGallerySnapshots:skipped", { reason, cause: "supabase-missing", targetSnapshotId });
    return appState.gallerySnapshots;
  }

  if (appState.galleryRefreshPromise) {
    logGrowGalleryDebug("refreshGallerySnapshots:join", { reason });
    return appState.galleryRefreshPromise;
  }

  const previousSignature = getGallerySnapshotDebugSignature(appState.gallerySnapshots);
  appState.galleryRefreshPromise = (async () => {
    try {
      const snapshots = await loadGallerySnapshots(reason);
      const nextSignature = getGallerySnapshotDebugSignature(snapshots);
      appState.gallerySnapshots = snapshots;
      logGrowGalleryDebug("refreshGallerySnapshots:complete", {
        reason,
        previousSignature,
        nextSignature,
      });

      const hashRoute = window.location.hash || "";
      const pathRoute = window.location.pathname.replace(/^\/+/, "");
      const isGalleryRoute = hashRoute.startsWith("#gallery") || pathRoute === "admin/gallery-moderation";
      const isPublicSessionRoute = hashRoute.startsWith("#sessions/public/");
      if (isGalleryRoute && previousSignature !== nextSignature) {
        logGrowGalleryDebug("refreshGallerySnapshots:rerender", {
          reason,
          targetSnapshotId,
        });
        renderGallery(targetSnapshotId);
      } else if (isPublicSessionRoute && previousSignature !== nextSignature) {
        render();
      }

      return snapshots;
    } finally {
      appState.galleryRefreshPromise = null;
    }
  })();

  return appState.galleryRefreshPromise;
}

function getGallerySnapshotSession(snapshot) {
  if (!snapshot?.sessionId) {
    return null;
  }

  return getSessions().find((session) => session.id === snapshot.sessionId) || null;
}

function getApprovedPublicGallerySnapshotById(snapshotId) {
  const normalizedId = String(snapshotId || "").trim();
  if (!normalizedId) {
    return null;
  }

  return getGallerySnapshotsForDisplay().find((snapshot) => (
    snapshot?.id === normalizedId
    && getGallerySnapshotDisplayStatus(snapshot) === "approved"
  )) || null;
}

function getGallerySnapshotFeedDetails(snapshot) {
  const linkedSession = getGallerySnapshotSession(snapshot);
  const totalSeeds = snapshot.totalSeeds > 0
    ? snapshot.totalSeeds
    : linkedSession
      ? getSessionSeedTotals(linkedSession).totalSeeds
      : 0;
  const totalPlanted = snapshot.totalPlanted > 0
    ? snapshot.totalPlanted
    : linkedSession
      ? getSessionSeedTotals(linkedSession).totalPlanted
      : 0;
  const unitId = String(snapshot.unitId || linkedSession?.unitId || "").trim();

  return {
    totalSeeds,
    totalPlanted,
    seedCountLabel: totalSeeds > 0 ? `${totalPlanted} / ${totalSeeds} seeds` : "",
    systemLabel: unitId
      ? `${formatSnapshotSystemLabel(snapshot.systemType)} • ${unitId}`
      : formatSnapshotSystemLabel(snapshot.systemType),
  };
}

function getGallerySnapshotPublicSessionDetails(snapshot) {
  const linkedSession = getGallerySnapshotSession(snapshot);
  const metadata = getGallerySnapshotLeaderboardMetadata(snapshot);
  const feedDetails = getGallerySnapshotFeedDetails(snapshot);
  const firstPartition = (linkedSession?.partitions || []).find((partition) => (
    normalizeLeaderboardLabel(formatPartitionSource(partition))
    || normalizeLeaderboardLabel(formatPartitionSeedVariety(partition))
    || normalizeLeaderboardLabel(partition?.seedType)
    || normalizeLeaderboardLabel(partition?.feminized)
  )) || linkedSession?.partitions?.[0] || null;
  const totalSeeds = Math.max(0, Number(feedDetails.totalSeeds) || 0);
  const germinatedCount = Math.max(0, Number(feedDetails.totalPlanted) || 0);
  const germinationRate = Math.max(0, Number(snapshot?.successPercent) || 0);
  const sexValue = String(firstPartition?.feminized || "").trim();

  return {
    systemLabel: feedDetails.systemLabel || formatSnapshotSystemLabel(snapshot?.systemType || "KAN"),
    sourceLabel: metadata.sourceName || "Not shared",
    seedVarietyLabel: metadata.seedVarietyName || "Not shared",
    seedTypeLabel: metadata.seedTypeName || "Not shared",
    sexLabel: sexValue ? capitalize(sexValue) : "Not shared",
    seedCountLabel: totalSeeds > 0 ? String(totalSeeds) : "Not shared",
    germinatedLabel: totalSeeds > 0 ? String(germinatedCount) : "Not shared",
    germinationRateLabel: `${germinationRate}%`,
    sessionDateLabel: getGallerySnapshotSubmittedDateLabel(snapshot),
  };
}

function normalizeSessionSnapshotGalleryStatus(status) {
  const normalizedStatus = String(status || "").trim();
  return ["social-only", "private", "pending_review", "approved", "rejected"].includes(normalizedStatus)
    ? normalizedStatus
    : "";
}

function normalizePersistedSessionSnapshotState(snapshotState) {
  if (!snapshotState || typeof snapshotState !== "object" || Array.isArray(snapshotState)) {
    return null;
  }

  const normalized = {
    referenceId: String(snapshotState.referenceId || snapshotState.id || "").trim(),
    createdAt: String(snapshotState.createdAt || "").trim(),
    submittedAt: String(snapshotState.submittedAt || "").trim(),
    galleryStatus: normalizeSessionSnapshotGalleryStatus(snapshotState.galleryStatus),
    selectedImageKey: String(snapshotState.selectedImageKey || "").trim(),
    renderKey: String(snapshotState.renderKey || "").trim(),
    imageUrl: String(snapshotState.imageUrl || "").trim(),
    imagePath: String(snapshotState.imagePath || "").trim(),
    gallerySnapshotId: String(snapshotState.gallerySnapshotId || snapshotState.snapshotId || "").trim(),
    galleryRoute: String(snapshotState.galleryRoute || "").trim(),
  };

  const hasSubmittedStatus = ["pending_review", "approved", "rejected"].includes(normalized.galleryStatus);
  if (normalized.gallerySnapshotId && !normalized.submittedAt) {
    normalized.gallerySnapshotId = "";
    normalized.galleryRoute = "";
    normalized.imageUrl = "";
    normalized.imagePath = "";
    normalized.galleryStatus = normalized.galleryStatus === "social-only" ? "social-only" : "private";
  }
  if (!normalized.gallerySnapshotId && hasSubmittedStatus) {
    normalized.submittedAt = "";
    normalized.galleryRoute = "";
    normalized.imageUrl = "";
    normalized.imagePath = "";
    normalized.galleryStatus = "private";
  }

  return Object.values(normalized).some(Boolean) ? normalized : null;
}

function buildSessionSnapshotStateFromGallerySnapshot(snapshot, baseSnapshotState = null) {
  const normalizedBase = normalizePersistedSessionSnapshotState(baseSnapshotState) || null;
  if (!snapshot) {
    return normalizedBase;
  }

  return normalizePersistedSessionSnapshotState({
    ...normalizedBase,
    referenceId: normalizedBase?.referenceId || snapshot.id || `snapshot-${crypto.randomUUID()}`,
    createdAt: normalizedBase?.createdAt || snapshot.createdAt || snapshot.publishedAt || new Date().toISOString(),
    submittedAt: snapshot.publishedAt || snapshot.createdAt || normalizedBase?.submittedAt || "",
    galleryStatus: normalizeSessionSnapshotGalleryStatus(snapshot.status) || normalizedBase?.galleryStatus || "pending_review",
    imageUrl: String(snapshot.imageUrl || normalizedBase?.imageUrl || "").trim(),
    imagePath: String(snapshot.imagePath || normalizedBase?.imagePath || "").trim(),
    gallerySnapshotId: String(snapshot.id || normalizedBase?.gallerySnapshotId || "").trim(),
    galleryRoute: snapshot.id ? `#gallery/${snapshot.id}` : (normalizedBase?.galleryRoute || ""),
  });
}

function getConfirmedGallerySnapshotForState(session = null, snapshotState = null) {
  const liveGallerySnapshot = getGallerySnapshotForSession(session?.id);
  if (liveGallerySnapshot?.id) {
    return liveGallerySnapshot;
  }

  const persistedSnapshotId = String(snapshotState?.gallerySnapshotId || "").trim();
  if (!persistedSnapshotId) {
    return null;
  }

  return appState.gallerySnapshots.find((entry) => (
    entry.id === persistedSnapshotId
    && (!session?.id || entry.sessionId === session.id)
  )) || null;
}

function clearStaleGallerySnapshotState(session, snapshotState) {
  if (!session?.id || !snapshotState?.gallerySnapshotId) {
    return buildClearedSessionSnapshotState(snapshotState);
  }

  const clearedSnapshotState = buildClearedSessionSnapshotState(snapshotState);
  session.snapshotState = clearedSnapshotState;
  updateSessionSnapshotStateCache(session.id, clearedSnapshotState);
  logGrowGalleryDebug("clearStaleGallerySnapshotState", {
    sessionId: session.id,
    staleGallerySnapshotId: snapshotState.gallerySnapshotId,
  });
  void saveSessionUpdate(session);
  return clearedSnapshotState;
}

function getSessionSnapshotState(session) {
  const baseSnapshotState = normalizePersistedSessionSnapshotState(session?.snapshotState);
  if (!session?.id) {
    return baseSnapshotState;
  }

  const gallerySnapshot = getConfirmedGallerySnapshotForState(session, baseSnapshotState);
  return gallerySnapshot
    ? buildSessionSnapshotStateFromGallerySnapshot(gallerySnapshot, baseSnapshotState)
    : (baseSnapshotState?.gallerySnapshotId ? clearStaleGallerySnapshotState(session, baseSnapshotState) : baseSnapshotState);
}

function mapSessionToRecord(session, userId) {
  return {
    id: session.id,
    user_id: userId,
    date: session.date,
    time: session.time,
    system_type: session.systemType,
    unit_id: session.unitId,
    session_name: session.sessionName,
    custom_session_name: session.customSessionName || "",
    session_notes: session.sessionNotes || "",
    session_images: getEffectiveSessionImages(session),
    snapshot_state: normalizePersistedSessionSnapshotState(session.snapshotState) || {},
    session_status: session.sessionStatus || "",
    germination_started_at: session.germinationStartedAt || null,
    first_planted_at: session.firstPlantedAt || null,
    completed_at: session.completedAt || null,
    partitions: session.partitions || [],
    created_at: session.createdAt,
  };
}

function mapRowToSession(row) {
  return {
    id: row.id,
    date: row.date,
    time: row.time,
    systemType: row.system_type,
    unitId: row.unit_id,
    sessionName: row.session_name,
    customSessionName: row.custom_session_name || "",
    sessionNotes: row.session_notes || "",
    sessionImages: normalizePersistedSessionImages(row.session_images),
    snapshotState: normalizePersistedSessionSnapshotState(row.snapshot_state),
    sessionStatus: row.session_status || "",
    germinationStartedAt: row.germination_started_at || "",
    firstPlantedAt: row.first_planted_at || "",
    completedAt: row.completed_at || "",
    partitions: Array.isArray(row.partitions) ? row.partitions : [],
    createdAt: row.created_at,
  };
}

function updateAuthStatus() {
  if (!authStatus) {
    return;
  }

  if (!isSupabaseConfigured()) {
    authStatus.innerHTML = `<span class="auth-pill">Supabase setup needed</span>`;
    return;
  }

  if (!appState.user) {
    authStatus.innerHTML = `<span class="auth-pill">Signed out</span>`;
    return;
  }

  const themeTarget = appState.theme === "dark" ? "light" : "dark";
  const themeLabel = `Switch to ${themeTarget} mode`;
  const themeIcon = themeTarget === "dark" ? "moon" : "sun";

  authStatus.innerHTML = `
    <div class="account-menu-root" data-account-menu-root>
      <div class="auth-profile-chip">
        ${appState.profile?.avatarUrl ? `<img src="${escapeHtml(appState.profile.avatarUrl)}" alt="${escapeHtml(getProfileDisplayName())}" class="auth-avatar">` : '<span class="auth-avatar auth-avatar-fallback" aria-hidden="true"></span>'}
        <span class="auth-pill">${escapeHtml(getProfileDisplayName())}</span>
      </div>
      <button
        id="account-menu-trigger"
        class="button button-secondary account-menu-trigger"
        type="button"
        aria-label="Open account menu"
        aria-haspopup="menu"
        aria-expanded="${appState.accountMenuOpen ? "true" : "false"}"
      >
        ${getMenuIconMarkup("menu")}
      </button>
      <div class="account-dropdown ${appState.accountMenuOpen ? "is-open" : ""}" ${appState.accountMenuOpen ? "" : "hidden"} role="menu" aria-label="Account menu">
        <button id="account-theme-toggle" class="account-menu-item" type="button" role="menuitem">
          ${getMenuIconMarkup(themeIcon)}
          <span>${themeLabel}</span>
        </button>
        <button id="account-edit-profile" class="account-menu-item" type="button" role="menuitem">
          ${getMenuIconMarkup("profile")}
          <span>Edit Profile</span>
        </button>
        <button id="account-delete-profile" class="account-menu-item is-danger" type="button" role="menuitem">
          ${getMenuIconMarkup("delete")}
          <span>Delete Profile</span>
        </button>
        <button id="account-sign-out" class="account-menu-item" type="button" role="menuitem">
          ${getMenuIconMarkup("signout")}
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  `;

  const menuRoot = authStatus.querySelector("[data-account-menu-root]");
  const trigger = authStatus.querySelector("#account-menu-trigger");
  const dropdown = authStatus.querySelector(".account-dropdown");

  menuRoot?.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  trigger?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleAccountMenu();
  });

  dropdown?.querySelector("#account-theme-toggle")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeAccountMenu();
    toggleTheme();
  });

  dropdown?.querySelector("#account-edit-profile")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeAccountMenu();
    openProfileEditor();
  });

  dropdown?.querySelector("#account-delete-profile")?.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    await handleAccountMenuDelete();
  });

  dropdown?.querySelector("#account-sign-out")?.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeAccountMenu();
    await appState.supabase.auth.signOut();
  });
}

function initializeSessionImageState(scope, options) {
  if (!scope || !options?.input || !options?.grid || !options?.message) {
    return;
  }

  const state = {
    scope,
    input: options.input,
    grid: options.grid,
    message: options.message,
    editable: options.editable !== false,
    session: options.session || null,
    onImagesChange: options.onImagesChange || null,
    onRender: options.onRender || null,
    images: normalizeSessionImages(normalizePersistedSessionImages(options.images || [])),
    pendingFiles: [],
    dots: ensureSessionImageDots(scope, options.grid),
  };

  scope.__sessionImageState = state;
  bindFileUploadControl(state.input);
  updateFileUploadName(state.input);
  renderSessionImageGrid(state);

  if (state.editable && !state.input.dataset.bound) {
    state.input.addEventListener("change", async () => {
      updateFileUploadName(state.input);
      await handleSessionImageSelection(state, state.input.files);
      state.input.value = "";
      updateFileUploadName(state.input, state.input.files);
    });
    state.input.dataset.bound = "true";
  }

  if (!state.grid.dataset.dotsBound) {
    state.grid.addEventListener("scroll", () => {
      updateSessionImageDotsFromScroll(state);
    });
    state.grid.dataset.dotsBound = "true";
  }

  if (!state.grid.dataset.removeBound) {
    state.grid.addEventListener("click", async (event) => {
      const removeButton = event.target instanceof Element
        ? event.target.closest(".session-image-remove")
        : null;
      if (!removeButton) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const imageKey = removeButton.getAttribute("data-image-key") || "";
      if (!imageKey) {
        return;
      }

      await removeSessionImageEntry(state, imageKey, removeButton);
    });
    state.grid.dataset.removeBound = "true";
  }
}

function ensureSessionImageDots(scope, grid) {
  if (!scope || !grid) {
    return null;
  }

  let dots = scope.querySelector(".image-dots");
  if (dots) {
    return dots;
  }

  dots = document.createElement("div");
  dots.className = "image-dots";
  dots.hidden = true;
  grid.insertAdjacentElement("afterend", dots);
  return dots;
}

function normalizeSessionImages(images) {
  return images.map((image) => ({
    ...image,
    filename: image.filename || image.name || "Session image",
    name: image.name || image.filename || "Session image",
    previewUrl: image.url || image.previewUrl || "",
    pending: Boolean(image.pending),
  }));
}

function getSessionImageEntryKey(image, index = 0) {
  return String(
    image?.path
    || image?.previewUrl
    || image?.url
    || `${image?.name || image?.filename || "session-image"}-${index}`,
  );
}

async function handleSessionImageSelection(state, fileList) {
  if (!fileList?.length) {
    return;
  }

  clearSessionImageMessage(state);
  const files = [...fileList];
  const currentCount = state.images.length + state.pendingFiles.length;
  if (currentCount + files.length > MAX_SESSION_IMAGES) {
    setSessionImageMessage(state, `You can upload up to ${MAX_SESSION_IMAGES} images per session.`);
    return;
  }

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      setSessionImageMessage(state, "Images only. Videos and other files are not supported.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setSessionImageMessage(state, "Image is too large. Please choose an image under 12 MB.");
      return;
    }
  }

  if (state.session) {
    try {
      for (const file of files) {
        const uploaded = await uploadSessionImageFile(state.session.id, file);
        state.images.push(uploaded);
      }
      renderSessionImageGrid(state);
      await state.onImagesChange?.(state.images);
    } catch (error) {
      setSessionImageMessage(state, error.message || "Could not upload image.");
    }
    return;
  }

  const previewEntries = await Promise.all(files.map(async (file) => ({
    file,
    previewUrl: URL.createObjectURL(file),
    name: file.name,
    pending: true,
  })));

  state.pendingFiles.push(...previewEntries);
  renderSessionImageGrid(state);
}

function renderSessionImageGrid(state) {
  const allImages = [...state.images, ...state.pendingFiles];
  state.grid.innerHTML = "";

  if (!allImages.length) {
    state.grid.innerHTML = `<p class="session-images-empty">No images added yet.</p>`;
    renderSessionImageDots(state, 0);
    state.onRender?.(allImages);
    return;
  }

  allImages.forEach((image, index) => {
    const imageKey = getSessionImageEntryKey(image, index);
    const card = document.createElement("article");
    card.className = "session-image-card";
    card.innerHTML = `
      <div class="session-image-frame">
        <img src="${escapeHtml(image.previewUrl || image.url || "")}" alt="${escapeHtml(image.name || "Session image")}" class="session-image-thumb">
        ${image.pending ? '<span class="session-image-badge">Pending</span>' : ""}
        <button type="button" class="session-image-remove" data-image-key="${escapeHtml(imageKey)}" aria-label="Remove image">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M9 4.5h6M5.5 7h13M9.5 10.5v6M14.5 10.5v6M7.5 7l.7 10.1a2 2 0 0 0 2 1.9h3.6a2 2 0 0 0 2-1.9L16.5 7" />
          </svg>
        </button>
      </div>
    `;

    state.grid.appendChild(card);
  });

  state.onRender?.(allImages);
  renderSessionImageDots(state, allImages.length);
  updateSessionImageDotsFromScroll(state);
}

async function removeSessionImageEntry(state, imageKey, triggerButton = null) {
  clearSessionImageMessage(state);

  const pendingImage = state.pendingFiles.find((entry, index) => getSessionImageEntryKey(entry, index) === imageKey);
  if (pendingImage) {
    URL.revokeObjectURL(pendingImage.previewUrl);
    state.pendingFiles = state.pendingFiles.filter((entry) => entry !== pendingImage);
    renderSessionImageGrid(state);
    return;
  }

  const persistedImage = state.images.find((entry, index) => getSessionImageEntryKey(entry, index) === imageKey);
  if (!persistedImage) {
    return;
  }

  if (triggerButton) {
    triggerButton.disabled = true;
  }

  if (state.session) {
    try {
      await removeSessionImageFromStorage(persistedImage);
      state.images = state.images.filter((entry) => entry !== persistedImage);
      renderSessionImageGrid(state);
      await state.onImagesChange?.(state.images);
    } catch (error) {
      setSessionImageMessage(state, error.message || "Could not remove image.");
      if (triggerButton) {
        triggerButton.disabled = false;
      }
    }
    return;
  }

  state.images = state.images.filter((entry) => entry !== persistedImage);
  renderSessionImageGrid(state);
}

function renderSessionImageDots(state, imageCount) {
  if (!state?.dots) {
    return;
  }

  if (imageCount <= 1) {
    state.dots.hidden = true;
    state.dots.innerHTML = "";
    return;
  }

  state.dots.hidden = false;
  state.dots.innerHTML = Array.from({ length: imageCount }, (_, index) => `
    <button type="button" class="image-dot${index === 0 ? " active" : ""}" data-image-dot-index="${index}" aria-label="Go to image ${index + 1}"></button>
  `).join("");

  state.dots.querySelectorAll(".image-dot").forEach((dot, index) => {
    dot.addEventListener("click", () => {
      const cards = [...state.grid.querySelectorAll(".session-image-card")];
      const targetCard = cards[index];
      if (!targetCard) {
        return;
      }

      targetCard.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
      setActiveSessionImageDot(state, index);
    });
  });
}

function updateSessionImageDotsFromScroll(state) {
  if (!state?.dots || state.dots.hidden) {
    return;
  }

  const cards = [...state.grid.querySelectorAll(".session-image-card")];
  if (!cards.length) {
    return;
  }

  const cardWidth = cards[0].offsetWidth || 1;
  const gapValue = window.getComputedStyle(state.grid).gap || window.getComputedStyle(state.grid).columnGap || "0";
  const gap = Number.parseFloat(gapValue) || 0;
  const stepWidth = cardWidth + gap;
  const rawIndex = Math.round(state.grid.scrollLeft / stepWidth);
  const activeIndex = Math.max(0, Math.min(cards.length - 1, rawIndex));

  setActiveSessionImageDot(state, activeIndex);
}

function setActiveSessionImageDot(state, activeIndex) {
  if (!state?.dots) {
    return;
  }

  state.dots.querySelectorAll(".image-dot").forEach((dot, index) => {
    dot.classList.toggle("active", index === activeIndex);
  });
}

function setSessionImageMessage(state, message) {
  state.message.textContent = message;
  state.message.classList.toggle("is-error", Boolean(message));
}

function clearSessionImageMessage(state) {
  state.message.textContent = "";
  state.message.classList.remove("is-error");
}

async function uploadPendingSessionImages(form, sessionId, scope) {
  const state = scope?.__sessionImageState || form.__sessionImageState || form.querySelector(".session-images-section")?.__sessionImageState;
  if (!state?.pendingFiles?.length) {
    return state?.images || [];
  }

  const uploadedImages = [...(state.images || [])];
  for (const entry of state.pendingFiles) {
    const uploaded = await uploadSessionImageFile(sessionId, entry.file);
    uploadedImages.push(uploaded);
    URL.revokeObjectURL(entry.previewUrl);
  }

  state.pendingFiles = [];
  state.images = uploadedImages;
  renderSessionImageGrid(state);
  return uploadedImages;
}

async function prepareImageForUpload(file, maxDimension = MAX_IMAGE_DIMENSION, quality = 0.82) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const bitmap = await loadImageBitmap(objectUrl);
    const { width, height } = scaleDimensions(bitmap.width, bitmap.height, maxDimension);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", quality);
    });

    return {
      blob: blob || file,
      contentType: "image/jpeg",
      extension: "jpg",
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImageBitmap(objectUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not process image."));
    image.src = objectUrl;
  });
}

function scaleDimensions(width, height, maxDimension) {
  const longestSide = Math.max(width, height);
  if (longestSide <= maxDimension) {
    return { width, height };
  }

  const scale = maxDimension / longestSide;
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

function initializeSnapshotSection(scope, options) {
  if (!scope || !options?.picker || !options?.preview || !options?.message) {
    return;
  }

  const initialSnapshotState = normalizePersistedSessionSnapshotState(
    options.initialSnapshotState || options.getGallerySession?.()?.snapshotState,
  );
  const state = {
    scope,
    picker: options.picker,
    preview: options.preview,
    postActions: options.postActions || null,
    message: options.message,
    generateButton: options.generateButton || null,
    downloadButton: options.downloadButton || null,
    resetButton: options.resetButton || null,
    shareButton: options.shareButton || null,
    destinationInputs: options.destinationInputs || [],
    galleryNote: options.galleryNote || null,
    unpublishButton: options.unpublishButton || null,
    canPublish: options.canPublish !== false,
    getGallerySession: options.getGallerySession || null,
    getSnapshotData: options.getSnapshotData,
    getImageEntries: options.getImageEntries,
    includeProfileToggle: options.includeProfileToggle || null,
    includeProfileToggleRow: options.includeProfileToggleRow || null,
    includeProfileDividerRow: options.includeProfileDividerRow || null,
    savedSnapshotNotice: options.savedSnapshotNotice || null,
    savedSnapshotText: options.savedSnapshotText || null,
    savedSnapshotLink: options.savedSnapshotLink || null,
    selectedImageKey: "",
    generatedBlob: null,
    generatedUrl: "",
    generatedRenderKey: "",
    pendingSnapshotState: initialSnapshotState,
  };

  scope.__snapshotState = state;
  if (state.includeProfileToggle) {
    state.includeProfileToggle.checked = false;
    state.includeProfileToggle.addEventListener("change", async () => {
      if (!state.generatedBlob) {
        return;
      }

      await generateSnapshotPreview(state);
    });
  }
  if (state.destinationInputs.length) {
    const defaultDestination = "social";
    const defaultInput = state.destinationInputs.find((input) => input.value === defaultDestination) || state.destinationInputs[0];
    if (defaultInput) {
      defaultInput.checked = true;
    }
  }
  renderSnapshotSourceSummary(state);
  syncSnapshotGalleryControls(state);
  renderSnapshotSavedNotice(state);
  setSnapshotMessage(state, "");
  setSnapshotPreview(state, null);

  state.generateButton?.addEventListener("click", async () => {
    await generateSnapshotPreview(state);
  });

  state.preview.addEventListener("click", (event) => {
    const previewCard = event.target instanceof Element
      ? event.target.closest(".snapshot-preview-card")
      : null;
    if (!previewCard || !state.generatedUrl || !isDesktopSnapshotPreviewEnabled()) {
      return;
    }

    openSnapshotPreviewModal(state.generatedUrl);
  });

  state.downloadButton?.addEventListener("click", async () => {
    const result = await ensureSnapshotGenerated(state);
    if (!result) {
      return;
    }

    downloadSnapshotBlob(result.blob, result.fileName);
  });

  state.resetButton?.addEventListener("click", async () => {
    await resetSnapshotState(state);
  });

  state.shareButton?.addEventListener("click", async () => {
    const result = await ensureSnapshotGenerated(state);
    if (!result) {
      return;
    }

    const destination = getSnapshotDestination(state);
    const publishResult = await maybePublishSnapshotFromState(state, result);
    if (publishResult?.blocked) {
      return;
    }
    if (destination === "gallery") {
      return;
    }

    const shared = await shareSnapshotBlob(result.blob, result.fileName, result.summaryText);
    if (!shared) {
      setSnapshotMessage(
        state,
        publishResult?.published
          ? "Submitted for review. Sharing is not available here. Use Download instead."
          : "Sharing is not available here. Use Download instead.",
      );
    }
  });

  state.destinationInputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (hasExistingGallerySnapshotForState(state) && input.checked && (input.value === "social-gallery" || input.value === "gallery")) {
        const socialInput = state.destinationInputs.find((item) => item.value === "social");
        if (socialInput) {
          socialInput.checked = true;
        }
        setSnapshotMessage(state, EXISTING_GALLERY_SNAPSHOT_MESSAGE);
      }
      syncSnapshotGalleryControls(state);
    });
  });

  state.unpublishButton?.addEventListener("click", async () => {
    const session = state.getGallerySession?.();
    const existing = getGallerySnapshotForSession(session?.id);
    if (!existing) {
      return;
    }

    try {
      const ownerAction = getOwnerGalleryAction(existing);
      if (ownerAction?.mode === "request-removal") {
        console.info("[GrowGallery] Removal requested for approved snapshot", {
          snapshotId: existing.id,
          sessionId: existing.sessionId || "",
          userId: appState.user?.id || "",
        });
        setSnapshotMessage(state, "Removal request noted. Contact support for published Grow Gallery changes.");
        return;
      }

      await deleteGallerySnapshot(existing.id);
      const socialInput = state.destinationInputs.find((input) => input.value === "social");
      if (socialInput) {
        socialInput.checked = true;
      }
      await persistSnapshotStateForSection(state, buildClearedSessionSnapshotState(getSnapshotStateForSection(state)));
      syncSnapshotGalleryControls(state);
      setSnapshotMessage(
        state,
        getGallerySnapshotDisplayStatus(existing) === "rejected"
          ? "Snapshot removed. You can submit a new Grow Gallery snapshot now."
          : "Snapshot withdrawn from the Grow Gallery.",
      );
    } catch (error) {
      setSnapshotMessage(state, error.message || "Could not remove this snapshot from the Grow Gallery.", true);
    }
  });
}

function getSnapshotDestination(state) {
  const selectedInput = state?.destinationInputs?.find((input) => input.checked);
  return selectedInput?.value || "social";
}

const EXISTING_GALLERY_SNAPSHOT_MESSAGE = "Only one submission per session.";
const EXISTING_GALLERY_SNAPSHOT_SOCIAL_ONLY_MESSAGE = "This session has already been submitted to Grow Gallery.";

function formatSnapshotSavedDateTime(value) {
  const parsedDate = parseCompletedAtValue(value);
  return parsedDate ? formatTimingDateTime(parsedDate) : "Unknown date";
}

function getSnapshotStateForSection(state) {
  const session = state?.getGallerySession?.() || null;
  return session
    ? getSessionSnapshotState(session)
    : normalizePersistedSessionSnapshotState(state?.pendingSnapshotState);
}

function hasSubmittedGallerySnapshotState(snapshotState) {
  if (!snapshotState) {
    return false;
  }

  const galleryStatus = String(snapshotState.galleryStatus || "").trim();
  const hasSubmissionStatus = ["pending_review", "approved", "rejected"].includes(galleryStatus);
  return Boolean(
    snapshotState.gallerySnapshotId
    && snapshotState.submittedAt
    && hasSubmissionStatus
  );
}

function hasConfirmedGallerySubmissionForState(state) {
  const session = state?.getGallerySession?.() || null;
  const snapshotState = getSnapshotStateForSection(state);
  const confirmedSnapshot = getConfirmedGallerySnapshotForState(session, snapshotState);
  return Boolean(
    confirmedSnapshot?.id
    && snapshotState?.gallerySnapshotId
    && snapshotState?.submittedAt
    && ["pending_review", "approved", "rejected"].includes(String(snapshotState?.galleryStatus || "").trim())
  );
}

function renderSnapshotSavedNotice(state) {
  if (!state) {
    return;
  }

  const snapshotState = getSnapshotStateForSection(state);
  if (!hasConfirmedGallerySubmissionForState(state)) {
    renderSnapshotPreviewSurface(state);
    return;
  }
  renderSnapshotPreviewSurface(state);
}

function prefersReducedSnapshotMotion() {
  return typeof window !== "undefined"
    && typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function setSnapshotAnimatedVisibility(elements, visible) {
  const targets = (Array.isArray(elements) ? elements : [elements]).filter(Boolean);
  const reducedMotion = prefersReducedSnapshotMotion();

  targets.forEach((element) => {
    const isConcealing = element.classList.contains("is-concealing");
    if (visible && !element.hidden && !isConcealing) {
      return;
    }
    if (!visible && element.hidden) {
      return;
    }

    if (element.__snapshotVisibilityTimer) {
      window.clearTimeout(element.__snapshotVisibilityTimer);
      element.__snapshotVisibilityTimer = 0;
    }
    if (element.__snapshotVisibilityFrame) {
      window.cancelAnimationFrame(element.__snapshotVisibilityFrame);
      element.__snapshotVisibilityFrame = 0;
    }

    element.classList.remove("is-revealing", "is-concealing");

    if (visible) {
      element.hidden = false;
      if (reducedMotion) {
        return;
      }

      element.__snapshotVisibilityFrame = window.requestAnimationFrame(() => {
        element.__snapshotVisibilityFrame = 0;
        element.classList.add("is-revealing");
        element.__snapshotVisibilityTimer = window.setTimeout(() => {
          element.classList.remove("is-revealing");
          element.__snapshotVisibilityTimer = 0;
        }, 180);
      });
      return;
    }

    if (reducedMotion) {
      element.hidden = true;
      return;
    }

    element.classList.add("is-concealing");
    element.__snapshotVisibilityTimer = window.setTimeout(() => {
      element.hidden = true;
      element.classList.remove("is-concealing");
      element.__snapshotVisibilityTimer = 0;
    }, 180);
  });
}

function doesSnapshotDestinationIncludeGallery(destination) {
  return destination === "social-gallery" || destination === "gallery";
}

function setSnapshotIncludeProfileEnabled(state, checked) {
  if (!state?.includeProfileToggle) {
    return;
  }

  const normalizedChecked = Boolean(checked);
  if (state.includeProfileToggle.checked === normalizedChecked) {
    return;
  }

  state.includeProfileToggle.checked = normalizedChecked;
  state.includeProfileToggle.dispatchEvent(new Event("change"));
}

function updateSessionSnapshotStateCache(sessionId, snapshotState) {
  if (!sessionId) {
    return;
  }

  saveSessions(getSessions().map((session) => (
    session.id === sessionId
      ? { ...session, snapshotState }
      : session
  )));
}

async function persistSnapshotStateForSection(state, snapshotState) {
  const normalizedSnapshotState = normalizePersistedSessionSnapshotState(snapshotState);
  if (!state) {
    return normalizedSnapshotState;
  }

  state.pendingSnapshotState = normalizedSnapshotState;
  const session = state.getGallerySession?.() || null;
  if (session?.id) {
    session.snapshotState = normalizedSnapshotState;
    updateSessionSnapshotStateCache(session.id, normalizedSnapshotState);
    const savedSession = await saveSessionUpdate(session);
    if (savedSession?.snapshotState !== undefined) {
      session.snapshotState = normalizePersistedSessionSnapshotState(savedSession.snapshotState);
      state.pendingSnapshotState = session.snapshotState;
    }
  }

  renderSnapshotSavedNotice(state);
  return state.pendingSnapshotState;
}

function buildGeneratedSessionSnapshotState(state) {
  const existingSnapshotState = getSnapshotStateForSection(state);
  const destination = getSnapshotDestination(state);
  const generatedStatus = existingSnapshotState?.gallerySnapshotId
    ? (existingSnapshotState.galleryStatus || "pending_review")
    : (destination === "social" ? "social-only" : "private");

  return {
    ...existingSnapshotState,
    referenceId: existingSnapshotState?.referenceId || `snapshot-${crypto.randomUUID()}`,
    createdAt: new Date().toISOString(),
    submittedAt: existingSnapshotState?.gallerySnapshotId ? existingSnapshotState.submittedAt || "" : "",
    galleryStatus: generatedStatus,
    gallerySnapshotId: existingSnapshotState?.gallerySnapshotId || "",
    galleryRoute: existingSnapshotState?.gallerySnapshotId ? (existingSnapshotState.galleryRoute || "") : "",
    selectedImageKey: String(state?.selectedImageKey || "").trim(),
    renderKey: String(state?.generatedRenderKey || "").trim(),
  };
}

function buildUnpublishedSessionSnapshotState(state) {
  const existingSnapshotState = getSnapshotStateForSection(state);
  return {
    ...existingSnapshotState,
    referenceId: existingSnapshotState?.referenceId || `snapshot-${crypto.randomUUID()}`,
    createdAt: existingSnapshotState?.createdAt || new Date().toISOString(),
    submittedAt: "",
    galleryStatus: "social-only",
    gallerySnapshotId: "",
    galleryRoute: "",
    imageUrl: "",
    imagePath: "",
  };
}

function hasExistingGallerySnapshotForState(state) {
  return hasConfirmedGallerySubmissionForState(state);
}

function syncSnapshotDestinationAvailability(state) {
  const hasExistingGallerySnapshot = hasExistingGallerySnapshotForState(state);
  const socialInput = state?.destinationInputs?.find((input) => input.value === "social") || null;

  state?.destinationInputs?.forEach((input) => {
    const option = input.closest(".snapshot-destination-option");
    const isGalleryMode = input.value === "social-gallery" || input.value === "gallery";
    option?.classList.toggle("is-unavailable", Boolean(hasExistingGallerySnapshot && isGalleryMode));
    option?.setAttribute("aria-disabled", hasExistingGallerySnapshot && isGalleryMode ? "true" : "false");
    input.disabled = Boolean(hasExistingGallerySnapshot && isGalleryMode);
  });

  if (!hasExistingGallerySnapshot) {
    return;
  }

  const selectedDestination = getSnapshotDestination(state);
  if ((selectedDestination === "social-gallery" || selectedDestination === "gallery") && socialInput) {
    socialInput.checked = true;
  }
}

function syncSnapshotGalleryControls(state) {
  if (!state) {
    return;
  }

  const session = state.getGallerySession?.() || null;
  const snapshotState = getSnapshotStateForSection(state);
  const publishedEntry = getConfirmedGallerySnapshotForState(session, snapshotState);
  const canPublish = Boolean(state.canPublish && session?.id);
  const currentStatus = String(publishedEntry?.status || "private");
  syncSnapshotDestinationAvailability(state);
  const destination = getSnapshotDestination(state);
  const includesGallery = doesSnapshotDestinationIncludeGallery(destination);
  const hasConfirmedSubmission = Boolean(publishedEntry?.id);

  setSnapshotAnimatedVisibility([state.includeProfileToggleRow, state.includeProfileDividerRow], includesGallery);
  if (state.includeProfileToggle && !includesGallery) {
    setSnapshotIncludeProfileEnabled(state, false);
  }

  if (state.galleryNote) {
    if (currentStatus === "approved" && publishedEntry?.userId === appState.user?.id) {
      state.galleryNote.textContent = "This snapshot is published. To make changes, contact support or remove it.";
    } else if (hasConfirmedSubmission) {
      state.galleryNote.textContent = EXISTING_GALLERY_SNAPSHOT_MESSAGE;
    } else if (!canPublish && destination !== "social") {
      state.galleryNote.textContent = "Save this session before submitting anything to the Grow Gallery. Private notes stay private.";
    } else if (destination === "social") {
      state.galleryNote.textContent = "Social only keeps this snapshot private to you. Private notes stay private.";
    } else if (destination === "gallery") {
      state.galleryNote.textContent = currentStatus === "pending_review"
        ? "Submitted for review. This snapshot will not be shared socially. Private notes stay private."
        : "This snapshot will be submitted to the Grow Gallery for review only. Private notes stay private.";
    } else if (!canPublish) {
      state.galleryNote.textContent = "Save this session before submitting anything to the Grow Gallery. Private notes stay private.";
    } else if (currentStatus === "pending_review") {
      state.galleryNote.textContent = "Submitted for review. Social sharing will still work normally. Private notes stay private.";
    } else if (currentStatus === "approved") {
      state.galleryNote.textContent = "Approved and visible in the Grow Gallery. Social sharing will still work normally. Private notes stay private.";
    } else if (currentStatus === "rejected") {
      state.galleryNote.textContent = "This snapshot was rejected. Use Social + Grow Gallery or Grow Gallery only to resubmit. Private notes stay private.";
    } else {
      state.galleryNote.textContent = "This snapshot will be shared socially and submitted to the Grow Gallery for review. Private notes stay private.";
    }
  }

  if (state.unpublishButton) {
    const ownerAction = publishedEntry?.userId === appState.user?.id
      ? getOwnerGalleryAction(publishedEntry)
      : null;
    state.unpublishButton.hidden = !ownerAction;
    state.unpublishButton.disabled = false;
    state.unpublishButton.dataset.galleryOwnerAction = ownerAction?.mode || "";
    state.unpublishButton.textContent = ownerAction?.label || "Remove from Gallery";
  }

  renderSnapshotSavedNotice(state);
}

async function maybePublishSnapshotFromState(state, result) {
  const destination = getSnapshotDestination(state);
  logGrowGalleryDebug("maybePublishSnapshotFromState:start", {
    destination,
    hasBlob: Boolean(result?.blob),
    sessionId: state.getGallerySession?.()?.id || "",
  });
  if (destination === "social") {
    logGrowGalleryDebug("maybePublishSnapshotFromState:skip-social", {
      sessionId: state.getGallerySession?.()?.id || "",
    });
    return { published: null, blocked: false };
  }

  const session = state.getGallerySession?.();
  const snapshotData = state.getSnapshotData?.();
  if (hasExistingGallerySnapshotForState(state)) {
    logGrowGalleryDebug("maybePublishSnapshotFromState:blocked-existing", {
      sessionId: session?.id || "",
      snapshotState: getSnapshotStateForSection(state),
    });
    syncSnapshotGalleryControls(state);
    setSnapshotMessage(state, EXISTING_GALLERY_SNAPSHOT_SOCIAL_ONLY_MESSAGE);
    return { published: null, blocked: true };
  }

  try {
    const published = await publishSnapshotToGallery(session, snapshotData, result.blob, {
      includeProfileInGallery: Boolean(state.includeProfileToggle?.checked),
    });
    logGrowGalleryDebug("maybePublishSnapshotFromState:publish-result", {
      sessionId: session?.id || "",
      publishedSnapshotId: published?.id || "",
      publishedStatus: published?.status || "",
      publishedUserId: published?.userId || "",
    });
    await persistSnapshotStateForSection(state, buildSessionSnapshotStateFromGallerySnapshot(published, getSnapshotStateForSection(state)));
    syncSnapshotGalleryControls(state);
    setSnapshotMessage(state, "Snapshot submitted to the Grow Gallery for review.");
    void refreshGallerySnapshots(`post-publish:${published?.id || "unknown"}`, published?.id || "");
    return { published, blocked: false };
  } catch (error) {
    console.error("Grow Gallery publish flow failed", {
      sessionId: session?.id || "",
      destination,
      snapshotData,
      error,
    });
    setSnapshotMessage(state, error.message || "Could not publish this snapshot to the Grow Gallery.", true);
    return { published: null, blocked: true };
  }
}

function getSnapshotImageEntries(state) {
  return (state.getImageEntries?.() || []).map((image, index) => {
    const key = image.path || image.previewUrl || image.url || `${image.name || "snapshot-image"}-${index}`;
    return {
      ...image,
      key,
      displayUrl: image.previewUrl || image.url || "",
    };
  }).filter((image) => image.displayUrl);
}

function renderSnapshotSourceSummary(state) {
  if (!state?.picker) {
    return;
  }

  const images = getSnapshotImageEntries(state);
  if (state.selectedImageKey && !images.some((image) => image.key === state.selectedImageKey)) {
    state.selectedImageKey = "";
  }
  if (!state.selectedImageKey && images.length === 1) {
    state.selectedImageKey = images[0].key;
  }

  if (!images.length) {
    state.picker.innerHTML = `
      <div class="snapshot-source-card snapshot-source-card--preview">
        <div class="snapshot-source-media" aria-hidden="true">
          ${getSnapshotFeatureIconMarkup("photo")}
        </div>
        <div class="snapshot-source-copy">
          <strong>Share-ready preview</strong>
          <small>Your session summary and images are styled into a polished post.</small>
        </div>
      </div>
    `;
    return;
  }

  const previewMessage = "Your session summary and images are styled into a polished post.";
  const shouldShowChoiceCard = images.length > 1;

  const choiceCard = shouldShowChoiceCard
    ? `
      <div class="snapshot-source-card snapshot-source-card--choice">
        <div class="snapshot-source-media" aria-hidden="true">
          ${getSnapshotFeatureIconMarkup("layers")}
        </div>
        <div class="snapshot-source-copy">
          <strong>Choose image at generation time</strong>
          <small>${images.length} uploaded images are available. You'll pick one in the snapshot modal before generating.</small>
        </div>
        <div class="snapshot-source-placeholder" aria-hidden="true">
          ${getSnapshotFeatureIconMarkup("preview")}
        </div>
      </div>
    `
    : "";

  state.picker.innerHTML = `
    <div class="snapshot-source-card snapshot-source-card--preview">
      <div class="snapshot-source-media" aria-hidden="true">
        ${getSnapshotFeatureIconMarkup("photo")}
      </div>
      <div class="snapshot-source-copy">
        <strong>Share-ready preview</strong>
        <small>${previewMessage}</small>
      </div>
    </div>
    ${choiceCard}
  `;
}

function getSnapshotFeatureIconMarkup(kind) {
  if (kind === "layers") {
    return `
      <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
        <path d="M12 4l7 4-7 4-7-4 7-4z"></path>
        <path d="M5 12l7 4 7-4"></path>
        <path d="M5 16l7 4 7-4"></path>
      </svg>
    `;
  }

  if (kind === "preview") {
    return `
      <svg viewBox="0 0 32 24" focusable="false" aria-hidden="true">
        <path d="M5 6h14"></path>
        <path d="M5 11h18"></path>
        <path d="M5 16h10"></path>
        <path d="M19 19l4-5 4 5 3-3v5H19z"></path>
      </svg>
    `;
  }

  return `
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <rect x="4" y="5" width="16" height="14" rx="2.5"></rect>
      <circle cx="9" cy="10" r="1.5"></circle>
      <path d="M6.5 17l4-4 3 3 3.5-4 2.5 5"></path>
    </svg>
  `;
}

function setSnapshotMessage(state, message, isError = false) {
  if (!state?.message) {
    return;
  }

  state.message.textContent = message;
  state.message.classList.toggle("is-error", Boolean(message && isError));
}

function setSnapshotPreview(state, payload) {
  if (!state?.preview) {
    return;
  }

  if (state.generatedUrl) {
    URL.revokeObjectURL(state.generatedUrl);
    state.generatedUrl = "";
  }

  state.generatedBlob = payload?.blob || null;
  state.generatedRenderKey = payload?.renderKey || "";
  if (payload?.blob) {
    state.generatedUrl = URL.createObjectURL(payload.blob);
  }
  renderSnapshotPreviewSurface(state);
  if (state.postActions) {
    state.postActions.hidden = !payload?.blob;
  }
  if (!payload?.blob) {
    state.downloadButton?.setAttribute("disabled", "disabled");
    state.resetButton?.setAttribute("disabled", "disabled");
    state.shareButton?.setAttribute("disabled", "disabled");
    return;
  }
  state.downloadButton?.removeAttribute("disabled");
  state.resetButton?.removeAttribute("disabled");
  state.shareButton?.removeAttribute("disabled");
}

function renderSnapshotPreviewMarkup({ previewImageUrl = "", fallbackImageUrl = "", data = null }) {
  const baseImageUrl = previewImageUrl || fallbackImageUrl;
  if (!baseImageUrl) {
    return "";
  }
  return `
    <article class="snapshot-preview-card" aria-label="Generated session snapshot preview">
      <div class="snapshot-preview-media">
        <img src="${escapeHtml(baseImageUrl)}" alt="Session snapshot preview" class="snapshot-preview-image">
      </div>
    </article>
  `;
}

function renderSnapshotSubmissionConfirmationMarkup(snapshotState) {
  const submittedDate = formatSnapshotSavedDateTime(snapshotState?.submittedAt || "");
  const galleryRoute = snapshotState?.gallerySnapshotId
    ? `#gallery/${snapshotState.gallerySnapshotId}`
    : "#gallery";
  return `
    <article class="snapshot-confirmation-card" aria-label="Grow Gallery submission confirmation">
      <p class="eyebrow snapshot-confirmation-eyebrow">Grow Gallery</p>
      <h4 class="snapshot-confirmation-title">Snapshot submitted to Grow Gallery</h4>
      <p class="snapshot-confirmation-time">Submitted ${escapeHtml(submittedDate)}</p>
      <a class="button button-primary snapshot-confirmation-button" href="${escapeHtml(galleryRoute)}">Go to Grow Gallery</a>
    </article>
  `;
}

function renderSnapshotPreviewSurface(state) {
  if (!state?.preview) {
    return;
  }

  const snapshotState = getSnapshotStateForSection(state);
  if (hasConfirmedGallerySubmissionForState(state)) {
    state.preview.hidden = false;
    state.preview.innerHTML = renderSnapshotSubmissionConfirmationMarkup(snapshotState);
    return;
  }

  if (!state.generatedUrl) {
    state.preview.hidden = true;
    state.preview.innerHTML = "";
    return;
  }

  state.preview.hidden = false;
  state.preview.innerHTML = renderSnapshotPreviewMarkup({
    previewImageUrl: state.generatedUrl,
    fallbackImageUrl: state.generatedUrl,
    data: null,
  });
}

function isDesktopSnapshotPreviewEnabled() {
  return window.matchMedia("(min-width: 768px)").matches;
}

function ensureSnapshotPreviewModal() {
  let modal = document.querySelector("#snapshot-preview-modal");
  if (modal) {
    return modal;
  }

  modal = document.createElement("dialog");
  modal.id = "snapshot-preview-modal";
  modal.className = "snapshot-modal snapshot-preview-modal";
  modal.innerHTML = `
    <div class="snapshot-preview-modal-card" role="document">
      <button type="button" class="modal-close snapshot-preview-modal-close" aria-label="Close preview">×</button>
      <img src="" alt="Generated snapshot preview" class="snapshot-preview-modal-image">
    </div>
  `;

  modal.addEventListener("click", (event) => {
    if (event.target === modal && modal.open) {
      modal.close();
    }
  });

  modal.querySelector(".snapshot-preview-modal-close")?.addEventListener("click", () => {
    if (modal.open) {
      modal.close();
    }
  });

  document.body.appendChild(modal);
  return modal;
}

function openSnapshotPreviewModal(imageUrl) {
  if (!imageUrl || !isDesktopSnapshotPreviewEnabled()) {
    return;
  }

  const modal = ensureSnapshotPreviewModal();
  const image = modal.querySelector(".snapshot-preview-modal-image");
  if (!image) {
    return;
  }

  image.src = imageUrl;
  if (!modal.open) {
    modal.showModal();
  }
  modal.querySelector(".snapshot-preview-modal-close")?.focus();
}

async function resetSnapshotState(state) {
  setSnapshotPreview(state, null);
  setSnapshotMessage(state, "");
  if (getSnapshotImageEntries(state).length > 1) {
    state.selectedImageKey = "";
    renderSnapshotSourceSummary(state);
    const selectedImage = await resolveSnapshotImageSelection(state);
    if (selectedImage === undefined) {
      return;
    }
    await generateSnapshotPreview(state);
    return;
  }

  renderSnapshotSourceSummary(state);
}

async function ensureSnapshotGenerated(state) {
  const baseData = state.getSnapshotData?.();
  const data = buildSnapshotGenerationData(state, baseData);
  const selectedImage = getExistingSnapshotSelection(state);
  const renderKey = buildSnapshotRenderKey(state, data, selectedImage);

  if (state.generatedBlob && renderKey && renderKey === state.generatedRenderKey) {
    return {
      blob: state.generatedBlob,
      fileName: buildSnapshotFileName(data),
      summaryText: buildSnapshotShareText(data),
    };
  }

  return generateSnapshotPreview(state);
}

async function generateSnapshotPreview(state) {
  try {
    setSnapshotMessage(state, "");
    state.generateButton?.setAttribute("disabled", "disabled");
    const baseData = state.getSnapshotData?.();
    if (!baseData) {
      throw new Error("Snapshot data is not available yet.");
    }

    const selectedImage = await resolveSnapshotImageSelection(state);
    if (selectedImage === undefined) {
      return null;
    }
    const data = buildSnapshotGenerationData(state, baseData);
    const blob = await buildSessionSnapshotBlob(data, selectedImage?.displayUrl || "");
    const renderKey = buildSnapshotRenderKey(state, data, selectedImage);
    setSnapshotPreview(state, {
      blob,
      data,
      imageUrl: selectedImage?.displayUrl || "",
      renderKey,
    });
    await persistSnapshotStateForSection(state, buildGeneratedSessionSnapshotState(state));
    setSnapshotMessage(state, selectedImage ? "Snapshot ready with your selected image." : "Snapshot ready as a text-only share image.");
    return {
      blob,
      fileName: buildSnapshotFileName(data),
      summaryText: buildSnapshotShareText(data),
    };
  } catch (error) {
    setSnapshotPreview(state, null);
    setSnapshotMessage(state, error.message || "Could not generate snapshot.", true);
    return null;
  } finally {
    state.generateButton?.removeAttribute("disabled");
  }
}

async function resolveSnapshotImageSelection(state) {
  const images = getSnapshotImageEntries(state);
  if (!images.length) {
    state.selectedImageKey = "";
    return null;
  }

  const existingSelection = getExistingSnapshotSelection(state, images);
  if (existingSelection) {
    state.selectedImageKey = existingSelection.key;
    return existingSelection;
  }

  if (images.length === 1) {
    state.selectedImageKey = images[0].key;
    return images[0];
  }

  const chosenKey = await chooseSnapshotImageForState(state, images);
  if (!chosenKey) {
    return undefined;
  }

  state.selectedImageKey = chosenKey;
  renderSnapshotSourceSummary(state);
  return images.find((image) => image.key === chosenKey) || undefined;
}

function ensureSnapshotImageModal() {
  let modal = document.querySelector("#snapshot-image-modal");
  const markup = `
    <form method="dialog" class="snapshot-modal-card">
      <div class="snapshot-modal-copy">
        <p class="eyebrow">Share Snapshot</p>
        <h3>Choose image for snapshot</h3>
        <p class="muted">Select the uploaded image you want to feature as the main visual.</p>
      </div>
      <div class="snapshot-modal-grid" id="snapshot-modal-grid"></div>
      <div class="snapshot-modal-profile-option">
        <label class="snapshot-profile-toggle-row">
          <input type="checkbox" id="snapshot-modal-include-profile">
          <span>Include my profile name & image with this snapshot in the Grow Gallery</span>
        </label>
        <p class="snapshot-modal-profile-helper">Only your profile name and image will be shown.</p>
      </div>
      <div class="snapshot-modal-actions">
        <button type="button" class="button button-secondary" data-snapshot-modal-action="cancel">Cancel</button>
        <button type="button" class="button button-primary" data-snapshot-modal-action="confirm">Use Selected Image</button>
      </div>
    </form>
  `;

  if (!modal) {
    modal = document.createElement("dialog");
    modal.id = "snapshot-image-modal";
    modal.className = "snapshot-modal";
    document.body.appendChild(modal);
  }

  modal.innerHTML = markup;
  return modal;
}

function chooseSnapshotImageForState(state, images) {
  const modal = ensureSnapshotImageModal();
  const grid = modal.querySelector("#snapshot-modal-grid");
  const includeProfileOption = modal.querySelector(".snapshot-modal-profile-option");
  const includeProfileToggle = modal.querySelector("#snapshot-modal-include-profile");
  let selectedKey = state.selectedImageKey && images.some((image) => image.key === state.selectedImageKey)
    ? state.selectedImageKey
    : images[0]?.key || "";

  const renderChoices = () => {
    grid.innerHTML = images.map((image) => `
      <label class="snapshot-modal-thumb ${selectedKey === image.key ? "is-selected" : ""}">
        <input type="radio" name="snapshot-modal-choice" value="${escapeHtml(image.key)}" ${selectedKey === image.key ? "checked" : ""}>
        <img src="${escapeHtml(image.displayUrl)}" alt="${escapeHtml(image.name || "Session image")}">
      </label>
    `).join("");

    grid.querySelectorAll('input[name="snapshot-modal-choice"]').forEach((input) => {
      input.addEventListener("change", () => {
        selectedKey = input.value;
        renderChoices();
      });
    });
  };

  renderChoices();
  const includesGallery = doesSnapshotDestinationIncludeGallery(getSnapshotDestination(state));
  setSnapshotAnimatedVisibility(includeProfileOption, includesGallery);
  if (includeProfileToggle) {
    includeProfileToggle.checked = Boolean(state?.includeProfileToggle?.checked) && includesGallery;
    includeProfileToggle.onchange = () => {
      setSnapshotIncludeProfileEnabled(state, includeProfileToggle.checked);
    };
  }

  return new Promise((resolve) => {
    const cancelButton = modal.querySelector('[data-snapshot-modal-action="cancel"]');
    const confirmButton = modal.querySelector('[data-snapshot-modal-action="confirm"]');

    const cleanup = (result) => {
      cancelButton.onclick = null;
      confirmButton.onclick = null;
      if (includeProfileToggle) {
        includeProfileToggle.onchange = null;
      }
      modal.removeEventListener("cancel", onCancel);
      if (modal.open) {
        modal.close();
      }
      resolve(result);
    };

    const onCancel = (event) => {
      event.preventDefault();
      cleanup("");
    };

    cancelButton.onclick = () => cleanup("");
    confirmButton.onclick = () => cleanup(selectedKey);
    modal.addEventListener("cancel", onCancel, { once: true });
    modal.showModal();
  });
}

function getFormSnapshotData(form) {
  if (!form) {
    return null;
  }

  const partitions = [...form.querySelectorAll(".partition-row")].map((row, index) => ({
    id: Number(row.dataset.partitionId) || index + 1,
    source: row.querySelector('input[name^="source-"]')?.value.trim() || "",
    seedVariety: row.querySelector('input[name^="seedVariety-"]')?.value.trim() || "",
    seedCount: Number(row.querySelector('input[name^="seedCount-"]')?.value) || 0,
    plantedCount: Number(row.querySelector('input[name="plantedCount"]')?.value) || 0,
  }));
  const firstPartition = partitions[0] || {};
  const date = form.elements.date?.value || "";
  return buildSnapshotData({
    sessionName: buildFinalSessionName(form.elements.sessionName?.value, firstPartition, date),
    date,
    systemType: form.elements.systemType?.value || "",
    partitions,
  });
}

function getSessionSnapshotData(session) {
  if (!session) {
    return null;
  }

  return buildSnapshotData({
    sessionName: formatSessionLabel(session),
    date: session.date,
    systemType: session.systemType,
    partitions: session.partitions || [],
  });
}

function buildSnapshotData(source) {
  const totals = getSessionSeedTotals(source);
  const percentage = totals.totalSeeds > 0
    ? Math.round((totals.totalPlanted / totals.totalSeeds) * 100)
    : 0;

  return {
    sessionName: source.sessionName || "Session",
    dateLabel: formatSessionNameDate(source.date),
    systemType: source.systemType || "KAN",
    systemLabel: formatSnapshotSystemLabel(source.systemType || "KAN"),
    totalSeeds: totals.totalSeeds,
    totalPlanted: totals.totalPlanted,
    percentage,
  };
}

function getSnapshotProfileAttribution(state) {
  if (!state?.includeProfileToggle?.checked) {
    return null;
  }

  const name = String(appState.profile?.username || appState.user?.email || "").trim();
  if (!name) {
    return null;
  }

  return {
    name,
    imageUrl: String(appState.profile?.avatarUrl || "").trim(),
  };
}

function buildSnapshotGenerationData(state, baseData) {
  if (!baseData) {
    return null;
  }

  return {
    ...baseData,
    profileAttribution: getSnapshotProfileAttribution(state),
  };
}

function getExistingSnapshotSelection(state, images = getSnapshotImageEntries(state)) {
  if (!images.length) {
    return null;
  }

  if (state?.selectedImageKey) {
    return images.find((image) => image.key === state.selectedImageKey) || null;
  }

  if (images.length === 1) {
    return images[0];
  }

  return null;
}

function buildSnapshotRenderKey(state, data, selectedImage) {
  if (!data) {
    return "";
  }

  return JSON.stringify({
    sessionName: data.sessionName || "",
    dateLabel: data.dateLabel || "",
    systemType: data.systemType || "",
    totalSeeds: Number(data.totalSeeds) || 0,
    totalPlanted: Number(data.totalPlanted) || 0,
    percentage: Number(data.percentage) || 0,
    imageKey: selectedImage?.key || "",
    profileName: data.profileAttribution?.name || "",
    profileImageUrl: data.profileAttribution?.imageUrl || "",
  });
}

function formatSnapshotSystemLabel(systemType) {
  if (systemType === "TRA") {
    return "TRā™";
  }

  return "KAN®";
}

async function buildSessionSnapshotBlob(data, imageSource = "") {
  const canvas = document.createElement("canvas");
  const size = 1080;
  const exportRadius = 42;
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not generate the snapshot image.");
  }

  context.save();
  drawRoundedRectPath(context, 0, 0, size, size, exportRadius);
  context.clip();
  drawSnapshotBackground(context, size);
  const brandLogo = await loadSnapshotBrandLogo();
  const profileAvatar = await loadSnapshotProfileAvatar(data?.profileAttribution?.imageUrl || "");

  if (imageSource) {
    const image = await loadSnapshotImage(imageSource);
    drawSnapshotHeroImage(context, image, size);
    drawSnapshotImageFooter(context, size, data, brandLogo, profileAvatar);
  } else {
    drawSnapshotTextLayout(context, size, data, brandLogo, profileAvatar);
  }
  context.restore();

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not create the snapshot file."));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

function drawSnapshotBackground(context, size) {
  context.fillStyle = "#eef4e8";
  context.fillRect(0, 0, size, size);
}

function drawSnapshotHeroImage(context, image, size) {
  const frameX = 40;
  const frameY = 40;
  const frameWidth = size - 80;
  const frameBottomInset = 40;
  const frameHeight = size - frameY - frameBottomInset;
  const radius = 36;
  drawRoundedRectPath(context, frameX, frameY, frameWidth, frameHeight, radius);
  context.save();
  context.clip();
  context.filter = "contrast(1.06) saturate(1.08) brightness(1.03)";
  drawImageCover(context, image, frameX, frameY, frameWidth, frameHeight, 0.485, 0.47);
  context.filter = "none";
  context.restore();
}

function drawSnapshotImageFooter(context, size, data, brandLogo = null, profileAvatar = null) {
  const frameX = 40;
  const frameY = 40;
  const frameWidth = size - 80;
  const frameBottomInset = 40;
  const frameHeight = size - frameY - frameBottomInset;
  const panelSideInset = 16;
  const panelLeft = frameX + panelSideInset;
  const panelRight = frameX + frameWidth - panelSideInset;
  const panelX = panelLeft;
  const panelWidth = panelRight - panelLeft;
  const panelHeight = 228;
  const panelY = frameY + frameHeight - panelHeight - 18;
  context.save();
  context.shadowColor = "rgba(0, 0, 0, 0.14)";
  context.shadowBlur = 12;
  context.shadowOffsetY = 4;
  context.fillStyle = "rgba(0, 0, 0, 0.45)";
  drawRoundedRectPath(context, panelX, panelY, panelWidth, panelHeight, 30);
  context.fill();
  context.restore();

  drawSnapshotPanelContent(context, panelX, panelY, panelWidth, panelHeight, data, false, brandLogo, profileAvatar);
}

function drawSnapshotTextLayout(context, size, data, brandLogo = null, profileAvatar = null) {
  const panelX = 40;
  const panelY = 40;
  const panelWidth = size - 80;
  const panelHeight = size - 80;
  context.fillStyle = "#0f130e";
  drawRoundedRectPath(context, panelX, panelY, panelWidth, panelHeight, 42);
  context.fill();
  context.strokeStyle = "rgba(148, 209, 89, 0.65)";
  context.lineWidth = 1.25;
  drawRoundedRectPath(context, panelX, panelY, panelWidth, panelHeight, 42);
  context.stroke();

  drawSnapshotPanelContent(context, panelX, panelY, panelWidth, panelHeight, data, true, brandLogo, profileAvatar);
}

function drawSnapshotPanelContent(context, x, y, width, height, data, roomy = false, brandLogo = null, profileAvatar = null) {
  const inset = roomy ? 80 : 36;
  const overlayHeight = roomy ? 338 : height;
  const overlayTopY = roomy ? y + 132 : y + height - overlayHeight;
  const overlayBottomY = overlayTopY + overlayHeight;
  const percentY = overlayTopY + (roomy ? 156 : 112);
  const rateY = percentY + (roomy ? 54 : 25);
  const seedsY = rateY + (roomy ? 42 : 22);
  const dividerX = x + (roomy ? width * 0.45 : width * 0.426);
  const footerDividerY = overlayBottomY - (roomy ? 64 : 50);
  const footerTextY = overlayBottomY - (roomy ? 28 : 20);
  const metaIconSize = roomy ? 18 : 14;
  const rightRegionX = dividerX + (roomy ? 48 : 24);
  const rightRegionWidth = x + width - inset - rightRegionX;
  const badgeTopY = overlayTopY + (roomy ? 18 : 20);

  const percentFontSize = roomy ? 164 : 86;
  context.save();
  context.shadowColor = "rgba(148, 209, 89, 0.28)";
  context.shadowBlur = 14;
  context.fillStyle = "#94d159";
  context.font = `700 ${percentFontSize}px Arial, sans-serif`;
  context.fillText(`${data.percentage}%`, x + inset, percentY);
  context.restore();

  context.fillStyle = "#ffffff";
  context.font = roomy ? "500 28px Arial, sans-serif" : "600 18px Arial, sans-serif";
  context.fillText("Germination Rate", x + inset, rateY);

  drawSeedIcon(context, x + inset, seedsY - metaIconSize + 1, metaIconSize, "#94d159");
  context.fillStyle = "#dce9d2";
  context.font = roomy ? "500 25px Arial, sans-serif" : "600 16px Arial, sans-serif";
  context.fillText(`${data.totalPlanted} / ${data.totalSeeds} seeds`, x + inset + metaIconSize + 12, seedsY);

  context.strokeStyle = "rgba(148, 209, 89, 0.22)";
  context.lineWidth = 0.8;
  context.beginPath();
  context.moveTo(dividerX, overlayTopY + (roomy ? 14 : 56));
  context.lineTo(dividerX, overlayBottomY - (roomy ? 82 : 38));
  context.stroke();

  const systemPillText = data.systemLabel;
  context.font = roomy ? "700 18px Arial, sans-serif" : "700 16px Arial, sans-serif";
  const badgeTextWidth = context.measureText(systemPillText).width;
  const badgeWidth = badgeTextWidth + 38;
  const badgeHeight = roomy ? 40 : 36;
  const badgeX = x + width - inset - badgeWidth;
  const badgeY = badgeTopY;
  context.fillStyle = "rgba(148, 209, 89, 0.12)";
  drawRoundedRectPath(context, badgeX, badgeY, badgeWidth, badgeHeight, 999);
  context.fill();
  context.strokeStyle = "rgba(148, 209, 89, 0.55)";
  context.lineWidth = 1;
  drawRoundedRectPath(context, badgeX, badgeY, badgeWidth, badgeHeight, 999);
  context.stroke();
  context.fillStyle = "#f4faef";
  context.fillText(systemPillText, badgeX + 19, badgeY + (roomy ? 26 : 24));

  context.strokeStyle = "rgba(148, 209, 89, 0.26)";
  context.lineWidth = 0.8;
  context.beginPath();
  context.moveTo(x + inset, footerDividerY);
  context.lineTo(x + width - inset, footerDividerY);
  context.stroke();

  if (brandLogo) {
    const maxLogoWidth = roomy ? 280 : 388;
    const baseLogoWidth = Math.min(maxLogoWidth, rightRegionWidth - (roomy ? 18 : 12));
    const baseLogoHeight = baseLogoWidth * (brandLogo.height / brandLogo.width);
    const logoScale = roomy ? 1 : 1.2;
    const logoWidth = Math.min(baseLogoWidth * logoScale, rightRegionWidth);
    const logoHeight = logoWidth * (brandLogo.height / brandLogo.width);
    const logoX = rightRegionX + Math.max(0, (rightRegionWidth - baseLogoWidth) / 2) - (roomy ? 12 : 18);
    const logoY = roomy
      ? overlayTopY + 118
      : overlayTopY + ((footerDividerY - overlayTopY) - baseLogoHeight) / 2 + 11;
    context.save();
    context.globalAlpha = roomy ? 0.92 : 0.94;
    context.drawImage(brandLogo, logoX, logoY, logoWidth, logoHeight);
    context.restore();
  }

  const dateText = data.dateLabel;
  const profileName = String(data?.profileAttribution?.name || "").trim();
  const showProfileAttribution = Boolean(profileName);
  context.font = `600 ${roomy ? 24 : 17}px Arial, sans-serif`;
  const separatorText = " • ";
  const dateWidth = context.measureText(separatorText + dateText).width;
  let profileAttributionWidth = 0;
  const profileAvatarSize = roomy ? 56 : 48;
  const profileGap = roomy ? 8 : 6;
  const profileFontSize = roomy ? 24 : 21;
  const profileRightInset = roomy ? 20 : 16;
  const minimumSessionNameWidth = roomy ? 240 : 180;
  let profileText = "";
  if (showProfileAttribution) {
    context.font = `600 ${profileFontSize}px Arial, sans-serif`;
    const profileTextMaxWidth = Math.max(
      roomy ? 220 : 160,
      width - inset * 2 - dateWidth - minimumSessionNameWidth - profileAvatarSize - profileGap - profileRightInset,
    );
    profileText = truncateTextToWidth(context, profileName, profileTextMaxWidth);
    profileAttributionWidth = profileAvatarSize + profileGap + context.measureText(profileText).width + profileRightInset;
  }
  context.font = `600 ${roomy ? 24 : 17}px Arial, sans-serif`;
  const sessionNameMaxWidth = Math.max(120, width - inset * 2 - dateWidth - profileAttributionWidth);
  const sessionNameText = truncateTextToWidth(context, data.sessionName, sessionNameMaxWidth);

  context.fillStyle = "#eef7e6";
  context.fillText(sessionNameText, x + inset, footerTextY);

  const sessionNameWidth = context.measureText(sessionNameText).width;
  context.fillStyle = "#94d159";
  context.fillText(separatorText + dateText, x + inset + sessionNameWidth, footerTextY);

  if (showProfileAttribution) {
    context.font = `600 ${profileFontSize}px Arial, sans-serif`;
    const profileTextWidth = context.measureText(profileText).width;
    const attributionRightX = x + width - inset - profileRightInset;
    const attributionX = attributionRightX - profileTextWidth - profileGap - profileAvatarSize;
    const profileMetrics = context.measureText(profileText);
    const profileAscent = profileMetrics.actualBoundingBoxAscent || (roomy ? 18 : 16);
    const profileDescent = profileMetrics.actualBoundingBoxDescent || (roomy ? 6 : 5);
    const profileCenterY = footerTextY - profileDescent - ((profileAscent + profileDescent) / 2) + 1;
    const avatarY = profileCenterY - (profileAvatarSize / 2) + 20;
    drawSnapshotProfileAvatar(context, profileAvatar, profileName, attributionX, avatarY, profileAvatarSize, roomy);
    context.fillStyle = "#dce9d2";
    context.save();
    context.textBaseline = "middle";
    context.fillText(profileText, attributionX + profileAvatarSize + profileGap, profileCenterY);
    context.restore();
  }
}

async function loadSnapshotBrandLogo() {
  try {
    return await loadImageElement("src/assets/Cannakan_GROW_darkmode.png");
  } catch {
    return null;
  }
}

async function loadSnapshotProfileAvatar(source) {
  if (!source) {
    return null;
  }

  try {
    return await loadSnapshotImage(source);
  } catch {
    return null;
  }
}

function drawSnapshotProfileAvatar(context, image, name, x, y, size, roomy = false) {
  context.save();
  context.beginPath();
  context.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  context.closePath();
  context.clip();

  if (image) {
    drawImageCover(context, image, x, y, size, size);
  } else {
    context.fillStyle = "rgba(148, 209, 89, 0.92)";
    context.fillRect(x, y, size, size);
    context.fillStyle = "#182218";
    context.font = `700 ${roomy ? 12 : 10}px Arial, sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    const initials = String(name || "G").trim().charAt(0).toUpperCase() || "G";
    context.fillText(initials, x + size / 2, y + size / 2 + 0.5);
    context.textAlign = "start";
    context.textBaseline = "alphabetic";
  }

  context.restore();

  context.save();
  context.strokeStyle = "rgba(255, 255, 255, 0.22)";
  context.lineWidth = 1;
  context.beginPath();
  context.arc(x + size / 2, y + size / 2, size / 2 - 0.5, 0, Math.PI * 2);
  context.stroke();
  context.restore();
}

function drawSproutIcon(context, x, y, size, color) {
  context.save();
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineWidth = Math.max(1.5, size * 0.1);
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(x + size * 0.5, y + size);
  context.lineTo(x + size * 0.5, y + size * 0.42);
  context.stroke();

  context.beginPath();
  context.ellipse(x + size * 0.34, y + size * 0.38, size * 0.22, size * 0.12, -0.55, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.ellipse(x + size * 0.67, y + size * 0.32, size * 0.24, size * 0.13, 0.55, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawSeedIcon(context, x, y, size, color) {
  context.save();
  context.strokeStyle = color;
  context.fillStyle = "transparent";
  context.lineWidth = Math.max(1.4, size * 0.1);
  context.beginPath();
  context.ellipse(x + size * 0.5, y + size * 0.5, size * 0.34, size * 0.42, 0.35, 0, Math.PI * 2);
  context.stroke();
  context.beginPath();
  context.moveTo(x + size * 0.38, y + size * 0.26);
  context.quadraticCurveTo(x + size * 0.52, y + size * 0.5, x + size * 0.63, y + size * 0.76);
  context.stroke();
  context.restore();
}

function drawCalendarIcon(context, x, y, size, color) {
  context.save();
  context.strokeStyle = color;
  context.lineWidth = Math.max(1.4, size * 0.09);
  drawRoundedRectPath(context, x, y + size * 0.12, size, size * 0.82, size * 0.16);
  context.stroke();
  context.beginPath();
  context.moveTo(x, y + size * 0.34);
  context.lineTo(x + size, y + size * 0.34);
  context.stroke();
  context.beginPath();
  context.moveTo(x + size * 0.26, y);
  context.lineTo(x + size * 0.26, y + size * 0.22);
  context.moveTo(x + size * 0.74, y);
  context.lineTo(x + size * 0.74, y + size * 0.22);
  context.stroke();
  context.restore();
}

function fitTextSize(context, text, maxWidth, startSize, minSize, fontWeight = "700") {
  let size = startSize;
  while (size > minSize) {
    context.font = `${fontWeight} ${size}px Arial, sans-serif`;
    if (context.measureText(text).width <= maxWidth) {
      return size;
    }
    size -= 1;
  }
  return minSize;
}

function truncateTextToWidth(context, text, maxWidth) {
  const rawText = String(text || "");
  if (context.measureText(rawText).width <= maxWidth) {
    return rawText;
  }

  let output = rawText;
  while (output.length > 0 && context.measureText(`${output}…`).width > maxWidth) {
    output = output.slice(0, -1);
  }

  return `${output.replace(/\s+$/, "")}…`;
}

function drawRoundedRectPath(context, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + width, y, safeRadius);
  context.closePath();
}

function drawImageCover(context, image, x, y, width, height, focalX = 0.5, focalY = 0.5) {
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  const clampedFocalX = Math.min(1, Math.max(0, focalX));
  const clampedFocalY = Math.min(1, Math.max(0, focalY));
  const drawX = x + width / 2 - drawWidth * clampedFocalX;
  const drawY = y + height / 2 - drawHeight * clampedFocalY;
  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

function wrapCanvasText(context, text, x, y, maxWidth, lineHeight, maxLines) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (context.measureText(nextLine).width <= maxWidth) {
      currentLine = nextLine;
      return;
    }

    if (currentLine) {
      lines.push(currentLine);
    }
    currentLine = word;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  lines.slice(0, maxLines).forEach((line, index) => {
    const isLastVisibleLine = index === maxLines - 1 && lines.length > maxLines;
    const output = isLastVisibleLine ? `${line.replace(/[.,\s]+$/, "")}…` : line;
    context.fillText(output, x, y + lineHeight * index);
  });
}

async function loadSnapshotImage(source) {
  if (!source) {
    return null;
  }

  if (source.startsWith("blob:") || source.startsWith("data:")) {
    return loadImageElement(source);
  }

  const response = await fetch(source);
  if (!response.ok) {
    throw new Error("Could not load the selected image for the snapshot.");
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  try {
    return await loadImageElement(objectUrl);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImageElement(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load the selected image."));
    image.src = source;
  });
}

function buildSnapshotFileName(data) {
  const baseName = String(data?.sessionName || "session-snapshot")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "session-snapshot";
  return `${baseName}.png`;
}

function buildSnapshotShareText(data) {
  if (!data) {
    return "Cannakan Grow snapshot";
  }

  return `${data.sessionName} • ${data.percentage}% germination (${data.totalPlanted} / ${data.totalSeeds})`;
}

function downloadSnapshotBlob(blob, fileName) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
}

async function shareSnapshotBlob(blob, fileName, text) {
  if (!navigator.share) {
    return false;
  }

  const file = new File([blob], fileName, { type: "image/png" });
  if (navigator.canShare && !navigator.canShare({ files: [file] })) {
    return false;
  }

  try {
    await navigator.share({
      files: [file],
      title: "Cannakan Grow Snapshot",
      text,
    });
    return true;
  } catch (error) {
    if (error?.name === "AbortError") {
      return true;
    }
    return false;
  }
}

function render() {
  clearSessionTimerInterval();
  updateAuthStatus();
  syncMockDataBanner();
  updateNavState();
  const hashRoute = (window.location.hash || "#home").replace(/^#/, "");
  const pathRoute = window.location.pathname.replace(/^\/+/, "");
  const rawRoute = pathRoute === "admin/gallery-moderation" ? pathRoute : hashRoute;
  const [route, id, subroute] = rawRoute.split("/");
  const finalizeRender = () => {
    renderMockDataAdminSection();
    syncMockDataBanner();
  };

  if (!appState.initialized || appState.loading) {
    app.innerHTML = `<section class="card"><p class="muted">Loading Cannakan Grow...</p></section>`;
    return;
  }

  if (!isSupabaseConfigured()) {
    renderSetupScreen();
    finalizeRender();
    return;
  }

  if (route === "gallery") {
    renderGallery(id || "");
    finalizeRender();
    void refreshGallerySnapshots("route:gallery", id || "");
    return;
  }

  if (route === "admin" && id === "gallery-moderation") {
    if (!appState.user) {
      renderAuthScreen();
      return;
    }
    if (!hasCompletedProfile()) {
      renderProfileSetupScreen();
      finalizeRender();
      return;
    }
    renderGalleryReview();
    finalizeRender();
    void refreshGallerySnapshots("route:admin-gallery-review", subroute || "");
    return;
  }

  if (route === "sessions" && id === "public" && subroute) {
    renderPublicSessionDetail(subroute);
    finalizeRender();
    void refreshGallerySnapshots("route:public-session", subroute);
    return;
  }

  if (!appState.user) {
    renderAuthScreen();
    finalizeRender();
    return;
  }

  if (!hasCompletedProfile()) {
    renderProfileSetupScreen();
    finalizeRender();
    return;
  }

  if (route === "new") {
    if (id === "KAN" || id === "TRA") {
      appState.newSessionSystemType = id;
      renderSessionForm(id);
      finalizeRender();
      return;
    }

    appState.newSessionReturnHash = appState.newSessionReturnHash || "#sessions";
    renderSessionsList();
    finalizeRender();
    openNewSessionSystemModal();
    return;
  }

  if (route === "sessions" && id) {
    renderSessionDetail(id);
    finalizeRender();
    return;
  }

  if (route === "sessions") {
    renderSessionsList();
    finalizeRender();
    return;
  }

  renderHome();
  finalizeRender();
}

function renderSetupScreen() {
  app.replaceChildren(cloneTemplate(templates.setup));
}

function closeNewSessionSystemModal({ navigateBack = false } = {}) {
  const overlay = document.querySelector("#new-session-system-modal-overlay");
  if (!overlay || overlay.dataset.closing === "true") {
    return;
  }

  overlay.dataset.closing = "true";
  overlay.classList.add("closing");
  overlay.querySelector(".new-session-system-modal")?.classList.add("closing");
  appState.newSessionSystemModalOpen = false;
  document.body.classList.remove("modal-open");

  window.setTimeout(() => {
    overlay.remove();
    if (navigateBack && window.location.hash === "#new") {
      window.location.hash = appState.newSessionReturnHash || "#sessions";
    }
  }, 180);
}

function selectNewSessionSystemType(systemType) {
  const normalizedSystemType = systemType === "TRA" ? "TRA" : "KAN";
  appState.newSessionSystemType = normalizedSystemType;
  closeNewSessionSystemModal();
  window.location.hash = `#new/${normalizedSystemType}`;
}

function ensureNewSessionSystemModal() {
  let overlay = document.querySelector("#new-session-system-modal-overlay");
  if (overlay) {
    return overlay;
  }

  overlay = document.createElement("div");
  overlay.id = "new-session-system-modal-overlay";
  overlay.className = "new-session-system-modal-overlay";
  overlay.hidden = false;
  overlay.dataset.closing = "false";
  overlay.innerHTML = `
    <div class="new-session-system-modal" role="dialog" aria-modal="true" aria-labelledby="new-session-system-modal-title">
      <button type="button" class="modal-close" aria-label="Close">×</button>
      <div class="new-session-system-modal-copy">
        <h2 id="new-session-system-modal-title">Choose System Type</h2>
      </div>
      <div class="new-session-system-options">
        <button type="button" class="new-session-system-option" data-system-type="KAN">
          <strong>KAN</strong>
          <span>8-part radial system</span>
        </button>
        <button type="button" class="new-session-system-option" data-system-type="TRA">
          <strong>TRa</strong>
          <span>16-part tray system</span>
        </button>
      </div>
    </div>
  `;

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      event.preventDefault();
      event.stopPropagation();
      closeNewSessionSystemModal({ navigateBack: true });
    }
  });

  overlay.querySelector(".modal-close")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeNewSessionSystemModal({ navigateBack: true });
  });

  overlay.querySelectorAll("[data-system-type]").forEach((button) => {
    button.addEventListener("click", () => {
      selectNewSessionSystemType(button.dataset.systemType || "KAN");
    });
  });

  if (!ensureNewSessionSystemModal.escapeBound) {
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && appState.newSessionSystemModalOpen) {
        closeNewSessionSystemModal({ navigateBack: window.location.hash === "#new" });
      }
    });
    ensureNewSessionSystemModal.escapeBound = true;
  }

  document.body.appendChild(overlay);
  return overlay;
}

function openNewSessionSystemModal() {
  const overlay = ensureNewSessionSystemModal();
  overlay.hidden = false;
  overlay.dataset.closing = "false";
  overlay.classList.remove("closing");
  overlay.querySelector(".new-session-system-modal")?.classList.remove("closing");
  appState.newSessionSystemModalOpen = true;
  document.body.classList.add("modal-open");
  overlay.querySelector(".modal-close")?.focus();
}

function renderAuthScreen() {
  app.replaceChildren(cloneTemplate(templates.auth));
  const form = document.querySelector("#auth-form");
  const message = document.querySelector("#auth-message");
  const confirmField = document.querySelector("#confirm-password-field");
  const confirmInput = form.elements.confirmPassword;
  let authMode = "login";

  const setAuthMode = (mode) => {
    authMode = mode;
    const isSignup = mode === "signup";
    confirmField.hidden = !isSignup;
    confirmInput.toggleAttribute("required", isSignup);
    if (!isSignup) {
      confirmInput.value = "";
      confirmInput.setCustomValidity("");
    }
  };

  const validatePasswordMatch = () => {
    if (authMode !== "signup") {
      confirmInput.setCustomValidity("");
      return true;
    }

    const password = String(form.elements.password.value || "");
    const confirmPassword = String(confirmInput.value || "");
    const passwordsMatch = password === confirmPassword;
    if (!passwordsMatch) {
      confirmInput.setCustomValidity("Passwords do not match.");
      message.textContent = "Passwords do not match.";
      return false;
    }

    confirmInput.setCustomValidity("");
    if (message.textContent === "Passwords do not match.") {
      message.textContent = "";
    }
    return true;
  };

  form.querySelectorAll('button[name="action"]').forEach((button) => {
    button.addEventListener("click", () => {
      setAuthMode(button.value);
      message.textContent = "";
    });
  });

  confirmInput.addEventListener("input", validatePasswordMatch);
  form.elements.password.addEventListener("input", validatePasswordMatch);
  setAuthMode("login");
  if (appState.authNotice) {
    message.textContent = appState.authNotice;
    appState.authNotice = "";
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitter = event.submitter;
    const action = submitter?.value || "login";
    setAuthMode(action);
    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    message.textContent = "";

    try {
      if (action === "signup") {
        if (!validatePasswordMatch()) {
          confirmInput.reportValidity();
          return;
        }
        const { error } = await appState.supabase.auth.signUp({ email, password });
        if (error) {
          throw error;
        }
        message.textContent = "Check your email to confirm your account, then log in.";
        return;
      }

      const { error } = await appState.supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw error;
      }

      redirectToHomeAfterLogin();
    } catch (error) {
      message.textContent = error.message || "Authentication failed.";
    }
  });
}

function renderProfileSetupScreen() {
  app.replaceChildren(cloneTemplate(templates.profile));
  const title = document.querySelector("#profile-title");
  const copy = document.querySelector("#profile-copy");
  const eyebrow = document.querySelector("#profile-eyebrow");
  const submit = document.querySelector("#profile-submit");

  if (title) {
    title.textContent = "Set up your profile";
  }
  if (copy) {
    copy.textContent = "Choose the username you want Cannakan Grow to show in the app. You can also add an optional profile picture.";
  }
  if (eyebrow) {
    eyebrow.textContent = "Profile Setup";
  }
  if (submit) {
    submit.textContent = "Save Profile";
  }

  const message = document.querySelector("#profile-message");
  if (message && appState.profileError) {
    message.textContent = appState.profileError;
  }

  bindProfileForm(document.querySelector("#profile-form"), {
    mode: "setup",
    initialProfile: appState.profile,
    onSaved: () => {
      safeRender();
    },
  });
}

function openProfileEditor() {
  if (!appState.user) {
    return;
  }

  let modal = document.querySelector("#profile-modal");
  if (!modal) {
    modal = document.createElement("dialog");
    modal.id = "profile-modal";
    modal.className = "snapshot-modal profile-modal";
    modal.innerHTML = `
      <form method="dialog" class="snapshot-modal-card profile-modal-card">
        <div class="snapshot-modal-copy">
          <p class="eyebrow">Account</p>
          <h3>Edit Profile</h3>
          <p class="muted">Update the name and avatar shown in Cannakan Grow.</p>
        </div>
        <div id="profile-modal-body"></div>
        <div class="snapshot-modal-actions">
          <button type="button" class="button button-secondary" data-profile-close>Close</button>
        </div>
      </form>
    `;
    document.body.appendChild(modal);
  }

  const body = modal.querySelector("#profile-modal-body");
  if (!body) {
    return;
  }

  body.replaceChildren(cloneTemplate(templates.profile));
  body.querySelector(".profile-card")?.classList.add("profile-card-inline");
  const title = body.querySelector("#profile-title");
  const copy = body.querySelector("#profile-copy");
  const eyebrow = body.querySelector("#profile-eyebrow");
  const submit = body.querySelector("#profile-submit");
  if (title) {
    title.textContent = "Edit your profile";
  }
  if (copy) {
    copy.textContent = "Choose the name and avatar you want shown in the app header.";
  }
  if (eyebrow) {
    eyebrow.textContent = "Profile";
  }
  if (submit) {
    submit.textContent = "Update Profile";
  }

  bindProfileForm(body.querySelector("#profile-form"), {
    mode: "edit",
    initialProfile: appState.profile,
    onSaved: () => {
      updateAuthStatus();
      safeRender();
      if (modal.open) {
        modal.close();
      }
    },
  });

  modal.querySelector("[data-profile-close]")?.addEventListener("click", () => {
    if (modal.open) {
      modal.close();
    }
  }, { once: true });

  modal.showModal();
}

function bindProfileForm(form, options = {}) {
  if (!form) {
    return;
  }

  const profile = options.initialProfile || appState.profile || null;
  const usernameInput = form.elements.username;
  const avatarInput = form.elements.avatar;
  const message = form.querySelector("#profile-message");
  const preview = form.querySelector("#profile-avatar-preview");
  const removeButton = form.querySelector("#profile-remove-avatar");
  const deleteButton = form.querySelector("#profile-delete-account");
  const submitButton = form.querySelector("#profile-submit");
  const state = {
    profile,
    removeAvatar: false,
    pendingFile: null,
    previewUrl: "",
  };

  usernameInput.value = profile?.username || "";
  bindFileUploadControl(avatarInput);
  updateFileUploadName(avatarInput);
  renderProfileAvatarPreview(preview, removeButton, state, profile);

  avatarInput.addEventListener("change", () => {
    const file = avatarInput.files?.[0];
    updateFileUploadName(avatarInput);
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      message.textContent = "Images only. Please choose a valid profile picture.";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      message.textContent = "Image is too large. Please choose an image under 12 MB.";
      return;
    }

    if (state.previewUrl) {
      URL.revokeObjectURL(state.previewUrl);
    }

    state.pendingFile = file;
    state.removeAvatar = false;
    state.previewUrl = URL.createObjectURL(file);
    message.textContent = "";
    renderProfileAvatarPreview(preview, removeButton, state, profile);
  });

  removeButton?.addEventListener("click", () => {
    if (state.previewUrl) {
      URL.revokeObjectURL(state.previewUrl);
      state.previewUrl = "";
    }
    state.pendingFile = null;
    state.removeAvatar = true;
    avatarInput.value = "";
    updateFileUploadName(avatarInput, []);
    renderProfileAvatarPreview(preview, removeButton, state, profile);
  });

  deleteButton?.addEventListener("click", async () => {
    const confirmed = await confirmAccountDeletion();
    if (!confirmed) {
      return;
    }

    deleteButton.disabled = true;
    if (submitButton) {
      submitButton.disabled = true;
    }
    message.textContent = "";

    try {
      const scheduledProfile = await scheduleUserDeletion();
      const scheduledForLabel = formatSessionNameDate(scheduledProfile.deletionScheduledFor.slice(0, 10));
      appState.authNotice = `Account deletion is scheduled for ${scheduledForLabel}. Your app data has not been permanently removed yet. Contact support to fully remove login credentials.`;
      await appState.supabase?.auth.signOut();
    } catch (error) {
      message.textContent = error.message || "Could not delete your account data.";
    } finally {
      deleteButton.disabled = false;
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = String(usernameInput.value || "").trim();

    if (!username) {
      message.textContent = "Please enter a username before saving.";
      usernameInput.reportValidity();
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
    }
    message.textContent = "";

    try {
      let avatarUrl = profile?.avatarUrl || "";
      let avatarPath = profile?.avatarPath || "";

      if (state.removeAvatar && avatarPath) {
        await removeProfileAvatarFromStorage(avatarPath);
        avatarUrl = "";
        avatarPath = "";
      }

      if (state.pendingFile) {
        if (avatarPath) {
          await removeProfileAvatarFromStorage(avatarPath);
        }
        const uploadedAvatar = await uploadProfileAvatar(state.pendingFile);
        avatarUrl = uploadedAvatar.url;
        avatarPath = uploadedAvatar.path;
      }

      appState.profile = await saveUserProfile({
        username,
        avatarUrl,
        avatarPath,
      });

      if (state.previewUrl) {
        URL.revokeObjectURL(state.previewUrl);
        state.previewUrl = "";
      }

      options.onSaved?.(appState.profile);
    } catch (error) {
      message.textContent = error.message || "Could not save your profile.";
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
}

function ensureDeleteAccountModal() {
  let modal = document.querySelector("#delete-account-modal");
  if (modal) {
    return modal;
  }

  modal = document.createElement("dialog");
  modal.id = "delete-account-modal";
  modal.className = "snapshot-modal delete-account-modal";
  modal.innerHTML = `
    <form method="dialog" class="snapshot-modal-card profile-modal-card delete-account-modal-card">
      <div id="delete-account-step-warning" class="delete-account-step">
        <div class="snapshot-modal-copy">
          <p class="eyebrow">Danger Zone</p>
          <h3>Warning: schedule account deletion</h3>
          <p class="muted">Warning: this will schedule deletion of your profile, saved sessions, and uploaded images. This cannot be undone once permanent cleanup happens.</p>
        </div>
        <div class="snapshot-modal-actions">
          <button type="button" class="button button-secondary" data-delete-account-cancel>Cancel</button>
          <button type="button" class="button button-danger" data-delete-account-continue>Continue to Permanent Delete</button>
        </div>
      </div>
      <div id="delete-account-step-confirm" class="delete-account-step" hidden>
        <div class="snapshot-modal-copy">
          <p class="eyebrow">Final Confirmation</p>
          <h3>Schedule account deletion</h3>
          <p class="muted">Type DELETE to schedule deletion of your Cannakan Grow app data in 7 days. Your login credentials are not removed from Supabase Auth by this frontend action.</p>
        </div>
        <label class="auth-form">
          <span>Type DELETE to confirm</span>
          <input id="delete-account-confirm-input" type="text" autocomplete="off" placeholder="DELETE">
        </label>
        <p id="delete-account-confirm-message" class="form-message" role="alert" aria-live="polite"></p>
        <div class="snapshot-modal-actions">
          <button type="button" class="button button-secondary" data-delete-account-back>Back</button>
          <button type="button" class="button button-danger" data-delete-account-confirm disabled>Schedule Account Deletion</button>
        </div>
      </div>
    </form>
  `;
  document.body.appendChild(modal);
  return modal;
}

function confirmAccountDeletion() {
  const modal = ensureDeleteAccountModal();
  const warningStep = modal.querySelector("#delete-account-step-warning");
  const confirmStep = modal.querySelector("#delete-account-step-confirm");
  const input = modal.querySelector("#delete-account-confirm-input");
  const message = modal.querySelector("#delete-account-confirm-message");
  const cancelButton = modal.querySelector("[data-delete-account-cancel]");
  const continueButton = modal.querySelector("[data-delete-account-continue]");
  const backButton = modal.querySelector("[data-delete-account-back]");
  const confirmButton = modal.querySelector("[data-delete-account-confirm]");

  if (!warningStep || !confirmStep || !input || !message || !cancelButton || !continueButton || !backButton || !confirmButton) {
    return Promise.resolve(false);
  }

  warningStep.hidden = false;
  confirmStep.hidden = true;
  input.value = "";
  message.textContent = "";
  confirmButton.disabled = true;

  return new Promise((resolve) => {
    const cleanup = (result) => {
      cancelButton.onclick = null;
      continueButton.onclick = null;
      backButton.onclick = null;
      confirmButton.onclick = null;
      input.oninput = null;
      modal.removeEventListener("cancel", onCancel);
      if (modal.open) {
        modal.close();
      }
      resolve(result);
    };

    const onCancel = (event) => {
      event.preventDefault();
      cleanup(false);
    };

    cancelButton.onclick = () => cleanup(false);
    continueButton.onclick = () => {
      warningStep.hidden = true;
      confirmStep.hidden = false;
      input.focus();
    };
    backButton.onclick = () => {
      confirmStep.hidden = true;
      warningStep.hidden = false;
      input.value = "";
      message.textContent = "";
      confirmButton.disabled = true;
    };
    input.oninput = () => {
      const matches = String(input.value || "").trim() === "DELETE";
      confirmButton.disabled = !matches;
      if (matches) {
        message.textContent = "";
      }
    };
    confirmButton.onclick = () => {
      cleanup(true);
    };

    modal.addEventListener("cancel", onCancel, { once: true });
    modal.showModal();
    continueButton.focus();
  });
}

function ensureScheduledDeletionModal() {
  let modal = document.querySelector("#scheduled-deletion-modal");
  if (modal) {
    return modal;
  }

  modal = document.createElement("dialog");
  modal.id = "scheduled-deletion-modal";
  modal.className = "snapshot-modal scheduled-deletion-modal";
  modal.innerHTML = `
    <form method="dialog" class="snapshot-modal-card profile-modal-card">
      <div class="snapshot-modal-copy">
        <p class="eyebrow">Account Status</p>
        <h3>Account deletion is scheduled</h3>
        <p id="scheduled-deletion-copy" class="muted">Your Cannakan Grow account data is scheduled for deletion.</p>
      </div>
      <p id="scheduled-deletion-message" class="form-message" role="alert" aria-live="polite"></p>
      <div class="snapshot-modal-actions">
        <button type="button" class="button button-secondary" data-scheduled-deletion-continue>Continue to Account</button>
        <button type="button" class="button button-primary" data-scheduled-deletion-cancel>Cancel Deletion</button>
      </div>
    </form>
  `;
  document.body.appendChild(modal);
  return modal;
}

function maybePromptScheduledDeletion() {
  if (!appState.user || !isDeletionScheduled() || appState.deletionPromptShown) {
    return;
  }

  appState.deletionPromptShown = true;
  const modal = ensureScheduledDeletionModal();
  const copy = modal.querySelector("#scheduled-deletion-copy");
  const message = modal.querySelector("#scheduled-deletion-message");
  const continueButton = modal.querySelector("[data-scheduled-deletion-continue]");
  const cancelButton = modal.querySelector("[data-scheduled-deletion-cancel]");

  if (!copy || !message || !continueButton || !cancelButton) {
    return;
  }

  const scheduledDate = parseCompletedAtValue(appState.profile?.deletionScheduledFor);
  const scheduledLabel = scheduledDate
    ? scheduledDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : "the scheduled date";
  copy.textContent = `Your account deletion is scheduled for ${scheduledLabel}. You can cancel deletion now or continue into the app.`;
  message.textContent = "";

  const cleanup = () => {
    continueButton.onclick = null;
    cancelButton.onclick = null;
  };

  continueButton.onclick = () => {
    cleanup();
    if (modal.open) {
      modal.close();
    }
  };

  cancelButton.onclick = async () => {
    cancelButton.disabled = true;
    continueButton.disabled = true;
    message.textContent = "";
    try {
      await cancelScheduledDeletion();
      updateAuthStatus();
      safeRender();
      cleanup();
      if (modal.open) {
        modal.close();
      }
    } catch (error) {
      message.textContent = error.message || "Could not cancel scheduled deletion.";
      cancelButton.disabled = false;
      continueButton.disabled = false;
    }
  };

  modal.showModal();
}

async function deleteUserAppData() {
  if (!appState.supabase || !appState.user) {
    throw new Error("You must be signed in to delete your account data.");
  }

  const sessions = [...getSessions()];
  const sessionImagePaths = sessions.flatMap((session) => (
    (session.sessionImages || [])
      .map((image) => image.path)
      .filter(Boolean)
  ));

  if (sessionImagePaths.length) {
    await appState.supabase.storage.from(SESSION_IMAGE_BUCKET).remove(sessionImagePaths);
  }

  if (appState.profile?.avatarPath) {
    await removeProfileAvatarFromStorage(appState.profile.avatarPath);
  }

  const { error: deleteSessionsError } = await appState.supabase
    .from("grow_sessions")
    .delete()
    .eq("user_id", appState.user.id);

  if (deleteSessionsError) {
    throw deleteSessionsError;
  }

  const { error: deleteProfileError } = await appState.supabase
    .from("profiles")
    .delete()
    .eq("id", appState.user.id);

  if (deleteProfileError) {
    throw deleteProfileError;
  }

  appState.profile = null;
  saveSessions([]);
}

function renderProfileAvatarPreview(preview, removeButton, state, profile) {
  if (!preview || !removeButton) {
    return;
  }

  const displayUrl = state.previewUrl || (state.removeAvatar ? "" : profile?.avatarUrl || "");
  if (!displayUrl) {
    preview.hidden = true;
    preview.innerHTML = "";
    removeButton.hidden = true;
    return;
  }

  preview.hidden = false;
  preview.innerHTML = `
    <img src="${escapeHtml(displayUrl)}" alt="Profile preview" class="profile-avatar-preview-image">
  `;
  removeButton.hidden = false;
}

function renderHome() {
  app.replaceChildren(cloneTemplate(templates.home));
  const sessions = sortSessionsNewestFirst(getSessions());
  const activeSessions = sessions.filter((session) => normalizeSessionStatus(session.sessionStatus) !== "completed");
  const spotlightCard = document.querySelector("#active-session-spotlight");
  const spotlightStage = document.querySelector("#active-session-spotlight-stage");
  const spotlightName = document.querySelector("#active-session-spotlight-name");
  const spotlightDate = document.querySelector("#active-session-spotlight-date");
  const spotlightDescription = document.querySelector("#active-session-spotlight-description");
  const spotlightTimer = document.querySelector("#active-session-spotlight-timer");
  const spotlightSeeds = document.querySelector("#active-session-spotlight-seeds");
  const spotlightRate = document.querySelector("#active-session-spotlight-rate");
  const spotlightAction = document.querySelector("#active-session-spotlight-action");
  const countEl = document.querySelector("#session-count");
  const activeCountEl = document.querySelector("#active-session-count");
  const activeSubtextEl = document.querySelector("#active-session-subtext");
  const activeCard = document.querySelector("#active-sessions-card");
  const bestSessionCard = document.querySelector("#best-session-card");
  const bestSessionNameEl = document.querySelector("#best-session-name");
  const bestSessionDateEl = document.querySelector("#best-session-date");
  const bestSessionResultEl = document.querySelector("#best-session-result");
  const bestSessionIndicator = bestSessionCard?.querySelector(".best-session-indicator");
  const overallRateEl = document.querySelector("#overall-germination-rate");
  const overallTotalEl = document.querySelector("#overall-germination-total");
  const overallFillEl = document.querySelector("#overall-germination-fill");
  countEl.textContent = String(sessions.length);
  activeCountEl.textContent = String(activeSessions.length);
  activeSubtextEl.textContent = activeSessions.length ? "in progress" : "No active sessions";
  const hasGerminatingActive = activeSessions.some((session) => normalizeSessionStatus(session.sessionStatus) === "germinating");
  activeCard?.classList.toggle("has-active-sessions", activeSessions.length > 0);
  activeCard?.classList.toggle("has-germinating-sessions", hasGerminatingActive);
  activeCard?.classList.toggle("has-soaking-sessions", activeSessions.length > 0 && !hasGerminatingActive);

  const totals = sessions.reduce((accumulator, session) => {
    const sessionTotals = getSessionSeedTotals(session);
    accumulator.totalSeeds += sessionTotals.totalSeeds;
    accumulator.totalPlanted += sessionTotals.totalPlanted;
    return accumulator;
  }, { totalSeeds: 0, totalPlanted: 0 });

  const percentage = totals.totalSeeds > 0
    ? Math.round((totals.totalPlanted / totals.totalSeeds) * 100)
    : 0;

  overallRateEl.textContent = `${percentage}%`;
  overallTotalEl.textContent = `${totals.totalPlanted} / ${totals.totalSeeds} seeds`;
  overallFillEl.style.width = `${percentage}%`;

  const bestSession = getBestCompletedSession(sessions);
  if (bestSession) {
    const bestTotals = getSessionSeedTotals(bestSession);
    const bestPercentage = bestTotals.totalSeeds > 0
      ? Math.round((bestTotals.totalPlanted / bestTotals.totalSeeds) * 100)
      : 0;
    bestSessionCard.href = `#sessions/${bestSession.id}`;
    bestSessionCard.classList.remove("is-empty");
    bestSessionIndicator.hidden = false;
    bestSessionNameEl.textContent = formatSessionLabel(bestSession);
    bestSessionDateEl.textContent = formatSessionNameDate(bestSession.date);
    bestSessionResultEl.textContent = `${bestPercentage}%`;
  } else {
    bestSessionCard.href = "#sessions";
    bestSessionCard.classList.add("is-empty");
    bestSessionIndicator.hidden = true;
    bestSessionNameEl.textContent = "No completed sessions yet";
    bestSessionDateEl.textContent = "";
    bestSessionResultEl.textContent = "";
  }

  const spotlightSession = activeSessions[0] || null;
  const updateSpotlight = () => {
    if (!spotlightSession) {
      spotlightCard?.classList.remove("stage-soaking", "stage-germinating", "stage-completed");
      if (spotlightStage) {
        spotlightStage.dataset.stage = "";
      }
      spotlightStage.textContent = "No active session";
      spotlightName.textContent = "No active session";
      spotlightDate.textContent = "";
      spotlightDescription.textContent = "Start a new grow session to begin tracking.";
      spotlightTimer.textContent = "--";
      spotlightSeeds.textContent = "--";
      spotlightRate.textContent = "--";
      spotlightAction.textContent = "Start New Session";
      spotlightAction.href = "#new";
      return;
    }

    const normalizedStage = normalizeSessionStatus(spotlightSession.sessionStatus);
    const totalsForSession = getSessionSeedTotals(spotlightSession);
    const percentageForSession = totalsForSession.totalSeeds > 0
      ? Math.round((totalsForSession.totalPlanted / totalsForSession.totalSeeds) * 100)
      : 0;
    const stageStart = getStageStartDateTime(
      spotlightSession.date,
      spotlightSession.time,
      normalizedStage,
      spotlightSession.germinationStartedAt || "",
    );

    const previousStage = spotlightStage?.dataset.stage || "";

    spotlightCard?.classList.toggle("stage-soaking", normalizedStage === "soaking");
    spotlightCard?.classList.toggle("stage-germinating", normalizedStage === "germinating");
    spotlightCard?.classList.toggle("stage-completed", normalizedStage === "completed");
    spotlightStage.textContent = capitalize(normalizedStage).replace("Unselected", "Not started");
    if (spotlightStage) {
      spotlightStage.dataset.stage = normalizedStage;
      if (previousStage && previousStage !== normalizedStage) {
        animateStageBadge(spotlightStage);
      }
    }
    spotlightName.textContent = formatSessionLabel(spotlightSession);
    spotlightDate.textContent = spotlightSession.date || "";
    spotlightDescription.textContent = normalizedStage === "soaking"
      ? "Soaking is underway. Keep this run moving toward germination."
      : "Germination is active. Review progress and continue this session.";
    spotlightTimer.textContent = formatSpotlightElapsed(stageStart);
    spotlightSeeds.textContent = `${totalsForSession.totalPlanted} / ${totalsForSession.totalSeeds} seeds`;
    spotlightRate.textContent = totalsForSession.totalSeeds > 0 ? `${percentageForSession}%` : "--";
    spotlightAction.textContent = "Continue Session";
    spotlightAction.href = `#sessions/${spotlightSession.id}`;
  };

  startSessionTimer(updateSpotlight);
}

function syncMockDataBanner() {
  if (!app) {
    return;
  }

  const existingBanner = app.querySelector("#mock-data-banner");
  if (!isMockDataEnabled()) {
    existingBanner?.remove();
    return;
  }

  const banner = existingBanner || document.createElement("section");
  banner.id = "mock-data-banner";
  banner.className = "card mock-data-banner";
  banner.innerHTML = `
    <span class="mock-data-banner-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
        <path d="M12 3.5 4.5 7.2V12c0 4.1 2.7 7.8 7.5 8.8 4.8-1 7.5-4.7 7.5-8.8V7.2L12 3.5Z"></path>
        <path d="M9.5 12.2 11 13.7l3.6-3.9"></path>
      </svg>
    </span>
    <span class="mock-data-banner-copy">${escapeHtml(MOCK_DATA_ACTIVE_NOTICE)}</span>
  `;
  if (!existingBanner) {
    app.prepend(banner);
  }
}

function renderMockDataAdminSection() {
  if (!app || !canAccessMockDataControls()) {
    return;
  }

  const section = document.createElement("section");
  section.className = `card mock-data-admin-section ${isMockDataEnabled() ? "is-on" : "is-off"}`;
  section.innerHTML = `
    <div class="mock-data-admin-shell">
      <div class="mock-data-admin-copy">
        <p class="eyebrow">Admin Utility</p>
        <h3>Dev Mode</h3>
        <p class="mock-data-admin-subtitle">Mock gallery data</p>
        <p class="muted">Admin-only preview controls. Mock data never submits to the database or overwrites real user data.</p>
      </div>
      <div class="mock-data-admin-actions">
        <button
          type="button"
          class="mock-data-toggle ${isMockDataEnabled() ? "is-on" : "is-off"}"
          data-mock-data-toggle="true"
          aria-pressed="${isMockDataEnabled() ? "true" : "false"}"
          aria-label="Toggle Dev Mode mock gallery data"
        >
          <span class="mock-data-toggle-text">
            <span class="mock-data-toggle-label">Dev Mode</span>
            <span class="mock-data-toggle-sublabel">Mock gallery data</span>
          </span>
          <span class="mock-data-toggle-switch" aria-hidden="true">
            <span class="mock-data-toggle-thumb"></span>
          </span>
          <span class="mock-data-toggle-state">${isMockDataEnabled() ? "ON" : "OFF"}</span>
        </button>
        <p class="muted">Shift + D</p>
      </div>
    </div>
  `;

  section.querySelector("[data-mock-data-toggle='true']")?.addEventListener("click", () => {
    setMockDataEnabledAndRefresh(!isMockDataEnabled());
  });

  app.appendChild(section);
}

function setMockDataEnabledAndRefresh(enabled) {
  if (!canAccessMockDataControls()) {
    return false;
  }

  setMockDataEnabled(enabled);
  updateAuthStatus();
  syncMockDataBanner();
  safeRender();
  return true;
}

function renderGallery(targetSnapshotId = "") {
  app.replaceChildren(cloneTemplate(templates.gallery));
  initializeCustomSelects(app);
  const galleryGrid = document.querySelector("#gallery-grid");
  const gallerySortControl = document.querySelector("#gallery-sort");
  const gallerySortOrderControl = document.querySelector("#gallery-sort-order");
  const gallerySortState = document.querySelector("#gallery-sort-state");
  const galleryFeedSection = document.querySelector(".gallery-feed-section");
  if (!galleryGrid) {
    return;
  }

  appState.gallerySort = normalizeGallerySort(appState.gallerySort);
  appState.gallerySortOrder = normalizeGallerySortOrder(appState.gallerySort, appState.gallerySortOrder);
  if (gallerySortState) {
    gallerySortState.textContent = `Sorted by: ${getGallerySortLabel(appState.gallerySort)} · ${getGallerySortOrderLabel(appState.gallerySort, appState.gallerySortOrder)}`;
  }

  if (galleryFeedSection) {
    galleryFeedSection.before(renderGalleryLeaderboardSection());
  }

  const isAdminView = isAdminUser();
  const gallerySnapshots = getGallerySnapshotsForDisplay().filter((entry) => {
    const status = getGallerySnapshotDisplayStatus(entry);
    if (isAdminView) {
      return true;
    }
    if (status === "approved") {
      return true;
    }
    return entry.userId === appState.user?.id && ["pending_review", "rejected"].includes(status);
  });
  logGrowGalleryDebug("renderGallery:start", {
    targetSnapshotId,
    isAdminView,
    currentUserId: appState.user?.id || "",
    currentUserEmail: appState.user?.email || "",
    loadedSnapshots: getGallerySnapshotsForDisplay().map((entry) => ({
      id: entry.id,
      status: entry.status,
      displayStatus: getGallerySnapshotDisplayStatus(entry),
      userId: entry.userId,
      sessionId: entry.sessionId,
    })),
    visibleSnapshotIds: gallerySnapshots.map((entry) => entry.id),
  });

  if (isAdminView && galleryFeedSection) {
    const pendingSnapshots = sortGallerySnapshotsNewestFirst(
      appState.gallerySnapshots.filter((entry) => getGallerySnapshotDisplayStatus(entry) === "pending_review"),
    );
    logGrowGalleryDebug("renderGallery:admin-review", {
      pendingCount: pendingSnapshots.length,
      pendingSnapshotIds: pendingSnapshots.map((entry) => entry.id),
      pendingStatuses: pendingSnapshots.map((entry) => ({
        id: entry.id,
        status: entry.status,
        displayStatus: getGallerySnapshotDisplayStatus(entry),
        userId: entry.userId,
      })),
    });
    const adminSection = document.createElement("section");
    adminSection.className = "card gallery-review-section gallery-inline-review-section";
    adminSection.innerHTML = `
      <div class="section-heading">
        <div>
          <p class="eyebrow">Admin Review</p>
          <h3>Grow Gallery Submissions</h3>
          <p class="muted">Review pending Grow Gallery snapshots before they become public.</p>
        </div>
      </div>
      <div class="gallery-review-list"></div>
    `;
    const pendingList = adminSection.querySelector(".gallery-review-list");
    if (pendingList) {
      if (!pendingSnapshots.length) {
        pendingList.innerHTML = `
          <div class="empty-state gallery-empty-state">
            <p>No pending snapshots to review.</p>
          </div>
        `;
      } else {
        pendingSnapshots.forEach((snapshot) => {
          const item = document.createElement("article");
          item.className = "gallery-review-card";
          item.dataset.gallerySnapshotId = snapshot.id;
          const details = getGallerySnapshotFeedDetails(snapshot);
          item.innerHTML = `
            <div class="gallery-review-media">
              ${renderGallerySnapshotMediaMarkup(snapshot, details)}
            </div>
            <div class="gallery-review-body">
              <div class="gallery-card-top">
                <div>
                  <strong>${escapeHtml(snapshot.title)}</strong>
                  <p>${escapeHtml(formatSessionNameDate(snapshot.sessionDate) || "Unknown date")}</p>
                </div>
                <div class="gallery-review-status-stack">
                  <span class="gallery-review-status-badge is-pending">Pending Review</span>
                  <span class="gallery-card-rate">${Math.max(0, Number(snapshot.successPercent) || 0)}%</span>
                </div>
              </div>
              <div class="gallery-card-meta">
                <span>${escapeHtml(formatSnapshotSystemLabel(snapshot.systemType))}</span>
                <span>${escapeHtml(getGallerySnapshotSubmitterLabel(snapshot))}</span>
              </div>
              <div class="gallery-review-actions">
                <button type="button" class="button button-primary gallery-admin-approve" data-gallery-approve="${escapeHtml(snapshot.id)}">Approve</button>
                <button type="button" class="button button-secondary gallery-admin-reject" data-gallery-reject="${escapeHtml(snapshot.id)}">Reject</button>
              </div>
            </div>
          `;
          pendingList.appendChild(item);
        });
      }
    }
    adminSection.querySelectorAll("[data-gallery-approve]").forEach((button) => {
      button.addEventListener("click", async () => {
        try {
          await approveSnapshot(button.dataset.galleryApprove);
          renderGallery(button.dataset.galleryApprove);
        } catch (error) {
          window.alert(error.message || "Could not approve this snapshot.");
        }
      });
    });
    adminSection.querySelectorAll("[data-gallery-reject]").forEach((button) => {
      button.addEventListener("click", async () => {
        try {
          await rejectSnapshot(button.dataset.galleryReject);
          renderGallery(button.dataset.galleryReject);
        } catch (error) {
          window.alert(error.message || "Could not reject this snapshot.");
        }
      });
    });
    galleryFeedSection.before(adminSection);
  }

  const renderVisibleGallerySnapshots = () => {
    galleryGrid.innerHTML = "";
    const approvedSnapshots = gallerySnapshots.filter((snapshot) => getGallerySnapshotDisplayStatus(snapshot) === "approved");
    const nonApprovedSnapshots = sortGallerySnapshotsNewestFirst(
      gallerySnapshots.filter((snapshot) => getGallerySnapshotDisplayStatus(snapshot) !== "approved"),
    );
    const visibleSnapshots = [
      ...sortVisibleGallerySnapshots(approvedSnapshots, appState.gallerySort, appState.gallerySortOrder),
      ...nonApprovedSnapshots,
    ];
    let targetCard = null;
    if (!visibleSnapshots.length) {
      galleryGrid.innerHTML = `
        <div class="empty-state gallery-empty-state">
          <div class="gallery-empty-state-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
              <rect x="3.5" y="5" width="17" height="14" rx="2"></rect>
              <circle cx="9" cy="10" r="1.25"></circle>
              <path d="m20.5 15-4.5-4.5L11 16l-2.5-2.5L3.5 18"></path>
            </svg>
          </div>
          <p>No gallery snapshots yet. Publish one from your Share Snapshot section.</p>
        </div>
      `;
      return;
    }

    visibleSnapshots.forEach((snapshot) => {
      const card = document.createElement("article");
      card.className = "gallery-card";
      card.dataset.gallerySnapshotId = snapshot.id;
      card.tabIndex = -1;
      const isOwner = isGallerySnapshotOwner(snapshot);
      const snapshotStatus = getGallerySnapshotDisplayStatus(snapshot);
      const isPending = snapshotStatus === "pending_review";
      const isRejected = snapshotStatus === "rejected";
      const isApproved = snapshotStatus === "approved";
      const isPrivate = snapshotStatus === "private";
      const ownerAction = isOwner ? getOwnerGalleryAction(snapshot) : null;
      const details = getGallerySnapshotFeedDetails(snapshot);
      const sharedProfileMarkup = renderGallerySharedProfileMarkup(snapshot);
      const openSessionMarkup = isOwner && snapshot.sessionId
        ? `<a class="button button-secondary" href="#sessions/${escapeHtml(snapshot.sessionId)}">Open Session</a>`
        : "";
      const publicSessionMarkup = !isOwner
        ? `<a class="button button-secondary" href="#sessions/public/${escapeHtml(snapshot.id)}">View Grow Session</a>`
        : "";
      const ownerActionMarkup = ownerAction
        ? `<button type="button" class="button button-secondary gallery-card-remove" data-gallery-owner-action="${escapeHtml(ownerAction.mode)}" data-gallery-remove="${escapeHtml(snapshot.id)}">${escapeHtml(ownerAction.label)}</button>`
        : "";
      const footerMainMarkup = (sharedProfileMarkup || openSessionMarkup || ownerActionMarkup || publicSessionMarkup)
        ? `
            <div class="gallery-card-footer-main">
              ${sharedProfileMarkup}
              ${(openSessionMarkup || ownerActionMarkup || publicSessionMarkup)
                ? `
                  <div class="gallery-card-actions">
                    ${openSessionMarkup}
                    ${ownerActionMarkup}
                    ${publicSessionMarkup}
                  </div>
                `
                : ""}
            </div>
          `
        : "";
      const statusBadge = isPending
        ? '<span class="gallery-review-status-badge is-pending">Pending Review</span>'
        : isRejected
          ? '<span class="gallery-review-status-badge is-rejected">Rejected</span>'
          : (isAdminView && isPrivate)
              ? '<span class="gallery-review-status-badge is-private">Private</span>'
              : "";
      const visibilityLabel = isPending
        ? "Visible to you while under review"
        : isRejected
          ? "Rejected submission"
          : isPrivate
            ? "Private submission"
            : "Germination success";
      card.innerHTML = `
        ${renderGallerySnapshotMediaMarkup(snapshot, details)}
        <div class="gallery-card-body">
          <div class="gallery-card-top">
            <div class="gallery-card-copy">
              <strong>${escapeHtml(snapshot.title)}</strong>
            </div>
            ${statusBadge ? `<div class="gallery-review-status-stack">${statusBadge}</div>` : ""}
          </div>
          <div class="gallery-card-feed-meta">
            <div class="gallery-card-feed-row gallery-card-feed-row--primary">
              <span class="gallery-card-chip">${escapeHtml(details.systemLabel)}</span>
              ${details.seedCountLabel ? `<span class="gallery-card-chip">${escapeHtml(details.seedCountLabel)}</span>` : ""}
            </div>
            <div class="gallery-card-feed-row gallery-card-feed-row--secondary">
              <div class="gallery-card-pill-pair">
                <span class="gallery-card-chip">${escapeHtml(visibilityLabel)}</span>
                <span class="gallery-card-rate">${Math.max(0, Number(snapshot.successPercent) || 0)}%</span>
              </div>
            </div>
          </div>
          ${isOwner && isApproved ? '<p class="gallery-owner-note">This snapshot is published. To make changes, contact support or remove it.</p>' : ""}
          <div class="gallery-card-footer">
            ${footerMainMarkup}
            ${renderGalleryLikeButtonMarkup(snapshot)}
          </div>
        </div>
      `;
      if (targetSnapshotId && snapshot.id === targetSnapshotId) {
        card.classList.add("is-targeted");
        targetCard = card;
      }
      galleryGrid.appendChild(card);
    });

    if (targetCard) {
      targetCard.scrollIntoView({
        block: "center",
        behavior: prefersReducedSnapshotMotion() ? "auto" : "smooth",
      });
      targetCard.focus({ preventScroll: true });
    }

    galleryGrid.querySelectorAll("[data-gallery-remove]").forEach((button) => {
      button.addEventListener("click", async () => {
        try {
          const snapshotId = button.dataset.galleryRemove || "";
          const ownerAction = button.dataset.galleryOwnerAction || "";
          const snapshot = gallerySnapshots.find((entry) => entry.id === snapshotId);
          if (!snapshot || !isGallerySnapshotOwner(snapshot)) {
            throw new Error("You can only manage your own Grow Gallery snapshots.");
          }
          if (ownerAction === "request-removal") {
            console.info("[GrowGallery] Removal requested for approved snapshot", {
              snapshotId,
              userId: appState.user?.id || "",
            });
            window.alert("Removal request noted. Contact support for published Grow Gallery changes.");
            return;
          }

          await deleteGallerySnapshot(snapshotId);
          renderGallery();
        } catch (error) {
          window.alert(error.message || "Could not remove this gallery snapshot.");
        }
      });
    });

    galleryGrid.querySelectorAll("[data-gallery-like]").forEach((button) => {
      button.addEventListener("click", async () => {
        try {
          await toggleGallerySnapshotLike(button.dataset.galleryLike || "");
          renderGallery(targetSnapshotId);
        } catch (error) {
          window.alert(error.message || "Could not update your like right now.");
        }
      });
    });
  };

  const syncGallerySortOrderControl = (resetToDefault = false) => {
    if (!gallerySortOrderControl) {
      return;
    }

    const sortOrderOptions = getGallerySortOrderOptions(appState.gallerySort);
    if (resetToDefault) {
      appState.gallerySortOrder = getDefaultGallerySortOrder(appState.gallerySort);
    } else {
      appState.gallerySortOrder = normalizeGallerySortOrder(appState.gallerySort, appState.gallerySortOrder);
    }

    gallerySortOrderControl.innerHTML = sortOrderOptions.map((option) => (
      `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`
    )).join("");
    gallerySortOrderControl.value = appState.gallerySortOrder;
    const sortOrderMenu = gallerySortOrderControl.closest(".custom-select")?.querySelector(".custom-select-menu");
    if (sortOrderMenu) {
      buildCustomSelectOptions(gallerySortOrderControl, sortOrderMenu);
    }
    syncCustomSelect(gallerySortOrderControl);
  };

  if (gallerySortControl) {
    gallerySortControl.value = normalizeGallerySort(appState.gallerySort);
    gallerySortControl.addEventListener("change", () => {
      appState.gallerySort = normalizeGallerySort(gallerySortControl.value);
      syncGallerySortOrderControl(true);
      if (gallerySortState) {
        gallerySortState.textContent = `Sorted by: ${getGallerySortLabel(appState.gallerySort)} · ${getGallerySortOrderLabel(appState.gallerySort, appState.gallerySortOrder)}`;
      }
      renderVisibleGallerySnapshots();
    });
  }

  if (gallerySortOrderControl) {
    syncGallerySortOrderControl(false);
    gallerySortOrderControl.addEventListener("change", () => {
      appState.gallerySortOrder = normalizeGallerySortOrder(appState.gallerySort, gallerySortOrderControl.value);
      if (gallerySortState) {
        gallerySortState.textContent = `Sorted by: ${getGallerySortLabel(appState.gallerySort)} · ${getGallerySortOrderLabel(appState.gallerySort, appState.gallerySortOrder)}`;
      }
      renderVisibleGallerySnapshots();
    });
  }

  renderVisibleGallerySnapshots();
}

function renderGalleryReview() {
  document.title = "Grow Gallery Moderation";
  renderGallery();
}

function renderRecentSessions(container, recentSessions, allSessions, options = {}) {
  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (!recentSessions.length) {
    container.innerHTML = `
      <div class="empty-state recent-sessions-empty">
        <p>${escapeHtml(options.emptyMessage || "No sessions yet. Start your first grow session.")}</p>
      </div>
    `;
    return;
  }

  recentSessions.forEach((session) => {
    const totals = getSessionSeedTotals(session);
    const percentage = totals.totalSeeds > 0
      ? Math.round((totals.totalPlanted / totals.totalSeeds) * 100)
      : 0;
    const normalizedStage = normalizeSessionStatus(session.sessionStatus);
    const stageLabel = capitalize(normalizedStage).replace("Unselected", "Not started");
    const card = document.createElement("a");
    card.className = `recent-session-card stage-${normalizedStage}`;
    card.href = `#sessions/${session.id}`;
    card.innerHTML = `
      <div class="recent-session-top">
        <strong>${escapeHtml(formatSessionLabel(session))}</strong>
        <span class="recent-session-rate">${percentage}%</span>
      </div>
      <div class="recent-session-meta">
        <p>${escapeHtml(session.date || "")}</p>
        <p>${escapeHtml(stageLabel)}</p>
      </div>
      <p class="recent-session-seeds">${totals.totalPlanted} / ${totals.totalSeeds} seeds</p>
    `;
    container.appendChild(card);
  });
}

function getBestCompletedSession(sessions) {
  const completedSessions = (sessions || [])
    .filter((session) => normalizeSessionStatus(session.sessionStatus) === "completed")
    .map((session) => {
      const totals = getSessionSeedTotals(session);
      const percentage = totals.totalSeeds > 0
        ? Math.round((totals.totalPlanted / totals.totalSeeds) * 100)
        : -1;
      return { session, percentage, sortTime: getSessionSortTime(session) };
    })
    .filter((item) => item.percentage >= 0)
    .sort((left, right) => {
      if (right.percentage !== left.percentage) {
        return right.percentage - left.percentage;
      }
      return right.sortTime - left.sortTime;
    });

  return completedSessions[0]?.session || null;
}

function renderSessionForm(initialSystemType = "KAN") {
  app.replaceChildren(cloneTemplate(templates.form));

  const form = document.querySelector("#session-form");
  const partitionFields = document.querySelector("#partition-fields");
  const formMessage = document.querySelector("#form-message");
  const systemTypeField = form.elements.systemType;
    const sessionStatusField = form.elements.sessionStatus;
    const sessionStatusTrigger = document.querySelector("#session-status-trigger");
  const sessionStatusError = document.querySelector("#session-status-error");
  const layoutReference = document.querySelector("#system-layout-reference");
  const reminder = document.querySelector("#session-status-reminder");
  const sessionSuccessSummary = document.querySelector("#session-success-summary");
  const progressSection = document.querySelector("#partition-progress-section");
  const progressChart = document.querySelector("#partition-progress-chart");
  const partitionWorkTitle = document.querySelector("#partition-work-title");
  const imageSection = document.querySelector(".session-images-section");
  const imageInput = document.querySelector("#session-images-input");
  const imageGrid = document.querySelector("#session-images-grid");
  const imageMessage = document.querySelector("#session-images-message");
  const snapshotSection = document.querySelector("#share-snapshot-section");
  const snapshotPicker = document.querySelector("#snapshot-image-picker");
  const snapshotMessage = document.querySelector("#snapshot-message");
  const snapshotPreview = document.querySelector("#snapshot-preview");
  const snapshotPostActions = document.querySelector("#snapshot-post-actions");
  const generateSnapshotButton = document.querySelector("#generate-snapshot");
  const downloadSnapshotButton = document.querySelector("#download-snapshot");
  const resetSnapshotButton = document.querySelector("#reset-snapshot");
  const shareSnapshotButton = document.querySelector("#share-snapshot");
  const snapshotGalleryNote = document.querySelector("#snapshot-gallery-note");
  const snapshotUnpublishButton = document.querySelector("#snapshot-unpublish");
  const snapshotIncludeProfileToggle = document.querySelector("#snapshot-include-profile");
  const snapshotIncludeProfileToggleRow = document.querySelector("#snapshot-profile-toggle-row");
  const snapshotIncludeProfileDividerRow = document.querySelector("#snapshot-profile-divider-row");
  const snapshotDestinationInputs = [...document.querySelectorAll('input[name="snapshot-destination"]')];
  const timingSection = document.querySelector("#session-timing-section");
  const timingSummary = document.querySelector("#session-timing-summary");
  const runProgressSection = document.querySelector("#run-progress-section");
  const runProgressSummary = document.querySelector("#run-progress-summary");
  const lifecycleSection = document.querySelector("#session-lifecycle-section");
  const lifecycleSummary = document.querySelector("#session-lifecycle-summary");
  const chartShell = document.querySelector("#partition-chart-shell");
  const chartHeader = document.querySelector("#partition-chart-header");
  const notesField = document.querySelector("#session-notes");
  const notesSaveButton = document.querySelector("#session-notes-save");
  const notesMessage = document.querySelector("#session-notes-message");
  const today = new Date();
  const normalizedSystemType = initialSystemType === "TRA" ? "TRA" : "KAN";
  const notesDraft = loadNewSessionNotesDraft();
  appState.newSessionSystemType = normalizedSystemType;

  form.elements.date.value = today.toISOString().slice(0, 10);
  initializeTimeFormatField(form, today.toTimeString().slice(0, 5));
  systemTypeField.value = normalizedSystemType;
  if (notesField && notesDraft && (notesDraft.systemType || "KAN") === normalizedSystemType) {
    notesField.value = notesDraft.sessionNotes || "";
  }
  initializeSessionImageState(form, {
    input: imageInput,
    grid: imageGrid,
    message: imageMessage,
    images: [],
    editable: true,
    onRender: () => {
      if (snapshotSection?.__snapshotState) {
        setSnapshotPreview(snapshotSection.__snapshotState, null);
        setSnapshotMessage(snapshotSection.__snapshotState, "");
        renderSnapshotSourceSummary(snapshotSection.__snapshotState);
      }
    },
  });
  initializeSnapshotSection(snapshotSection, {
    picker: snapshotPicker,
    preview: snapshotPreview,
    postActions: snapshotPostActions,
    message: snapshotMessage,
    generateButton: generateSnapshotButton,
    downloadButton: downloadSnapshotButton,
    resetButton: resetSnapshotButton,
    shareButton: shareSnapshotButton,
    destinationInputs: snapshotDestinationInputs,
    includeProfileToggle: snapshotIncludeProfileToggle,
    includeProfileToggleRow: snapshotIncludeProfileToggleRow,
    includeProfileDividerRow: snapshotIncludeProfileDividerRow,
    galleryNote: snapshotGalleryNote,
    unpublishButton: snapshotUnpublishButton,
    canPublish: false,
    getGallerySession: () => null,
    getSnapshotData: () => getFormSnapshotData(form),
    getImageEntries: () => {
      const imageState = form.__sessionImageState;
      return imageState ? [...imageState.images, ...imageState.pendingFiles] : [];
    },
  });
  form.dataset.currentStage = normalizeSessionStatus(sessionStatusField.value);
  appState.growthStage = sessionStatusField.value || null;
  syncSessionStatusControlDatasets(sessionStatusField, {
    germinationStartedAt: form.dataset.germinationStartedAt || "",
    firstPlantedAt: form.dataset.firstPlantedAt || "",
    completedAt: form.dataset.completedAt || "",
  });

  renderSystemLayoutReference(layoutReference, systemTypeField.value);
  if (partitionWorkTitle) {
    updatePartitionWorkHeading(partitionWorkTitle, systemTypeField.value);
  }
  updateSessionStatusAppearance(sessionStatusField, sessionStatusTrigger);
  renderPartitionRows(form, systemTypeField.value, sessionStatusField.value);
  applySessionStatusLayout(chartShell, chartHeader, partitionFields, sessionStatusField.value);
  applyStageEditingMode(form, sessionStatusField.value);
  updateSessionStatusReminder(
    reminder,
    form.elements.date.value,
    form.elements.time.value,
    sessionStatusField.value,
    form.dataset.germinationStartedAt || "",
  );
  updateSessionSuccessSummary(form, sessionSuccessSummary);
  updatePartitionProgressChart(
    getPartitionProgressDataFromForm(form),
    progressChart,
    progressSection,
  );
  updateSessionTimingSummary(
    timingSummary,
    timingSection,
    form.elements.date.value,
    form.elements.time.value,
    sessionStatusField.value,
  );
  updateRunProgressSummary(
    runProgressSummary,
    runProgressSection,
    sessionStatusField.value,
    getPartitionProgressDataFromForm(form),
  );
  updateSessionLifecycleTimeline(
    lifecycleSummary,
    lifecycleSection,
    buildFormLifecycleState(form),
  );
  bindFormTimelineDebugTools(form, () => {
    validatePartitions(form, { showMessage: false });
    updateSessionSuccessSummary(form, sessionSuccessSummary);
    updatePartitionProgressChart(
      getPartitionProgressDataFromForm(form),
      progressChart,
      progressSection,
    );
    syncSessionStatusControlDatasets(sessionStatusField, {
      germinationStartedAt: form.dataset.germinationStartedAt || "",
      firstPlantedAt: form.dataset.firstPlantedAt || "",
      completedAt: form.dataset.completedAt || "",
    });
    updateSessionStatusAppearance(sessionStatusField, sessionStatusTrigger);
    updateSessionStatusReminder(
      reminder,
      form.elements.date.value,
      form.elements.time.value,
      sessionStatusField.value,
      form.dataset.germinationStartedAt || "",
    );
    updateRunProgressSummary(
      runProgressSummary,
      runProgressSection,
      sessionStatusField.value,
      getPartitionProgressDataFromForm(form),
    );
    updateSessionLifecycleTimeline(
      lifecycleSummary,
      lifecycleSection,
      buildFormLifecycleState(form),
    );
  });
  const persistNewSessionNoteDraft = () => {
    if (!notesField) {
      return false;
    }

    try {
      saveNewSessionNotesDraft({
        systemType: systemTypeField.value,
        sessionNotes: notesField.value.trim(),
      });
      if (notesMessage) {
        notesMessage.textContent = "Note saved.";
        notesMessage.classList.remove("is-error");
      }
      return true;
    } catch (error) {
      console.error("Could not save new session note", error);
      if (notesMessage) {
        notesMessage.textContent = "Could not save note.";
        notesMessage.classList.add("is-error");
      }
      return false;
    }
  };
  notesSaveButton?.addEventListener("click", () => {
    persistNewSessionNoteDraft();
  });
  notesField?.addEventListener("input", () => {
    if (!notesMessage?.textContent) {
      return;
    }

    notesMessage.textContent = "";
    notesMessage.classList.remove("is-error");
  });
    startSessionTimer(() => {
      updateSessionStatusReminder(
        reminder,
      form.elements.date.value,
      form.elements.time.value,
      sessionStatusField.value,
      form.dataset.germinationStartedAt || "",
    );
    updateSessionTimingSummary(
      timingSummary,
      timingSection,
      form.elements.date.value,
      form.elements.time.value,
      sessionStatusField.value,
      );
    });
    sessionStatusTrigger?.addEventListener("click", () => {
      appState.growthStageModalDismissed = false;
      openGrowthStageModal({ stageField: sessionStatusField, stageTrigger: sessionStatusTrigger });
    });
    chartShell.addEventListener("click", (event) => {
      if (!event.target.closest("#partition-fields")) {
        return;
      }

      if (maybePromptGrowthStage(form, sessionStatusField, sessionStatusTrigger)) {
        event.preventDefault();
      }
    });
    partitionFields.addEventListener("focusin", (event) => {
      if (!event.target.closest("input, select, textarea")) {
        return;
      }

      if (maybePromptGrowthStage(form, sessionStatusField, sessionStatusTrigger)) {
        event.target.blur();
      }
    });
    partitionFields.addEventListener("keydown", (event) => {
      if (!event.target.closest(".partition-input")) {
        return;
      }

      if (maybePromptGrowthStage(form, sessionStatusField, sessionStatusTrigger)) {
        event.preventDefault();
      }
    });
    systemTypeField.addEventListener("change", () => {
      const nextNotesDraft = loadNewSessionNotesDraft();
      if (notesField) {
        notesField.value =
          nextNotesDraft && (nextNotesDraft.systemType || "KAN") === systemTypeField.value
            ? nextNotesDraft.sessionNotes || ""
            : "";
      }
      if (notesMessage?.textContent) {
        notesMessage.textContent = "";
        notesMessage.classList.remove("is-error");
      }
      renderSystemLayoutReference(layoutReference, systemTypeField.value);
      if (partitionWorkTitle) {
        updatePartitionWorkHeading(partitionWorkTitle, systemTypeField.value);
      }
      renderPartitionRows(form, systemTypeField.value, sessionStatusField.value);
    applySessionStatusLayout(chartShell, chartHeader, partitionFields, sessionStatusField.value);
    clearActiveSystemLayout(form);
    updateSessionSuccessSummary(form, sessionSuccessSummary);
    updatePartitionProgressChart(
      getPartitionProgressDataFromForm(form),
      progressChart,
      progressSection,
    );
    updateRunProgressSummary(
      runProgressSummary,
      runProgressSection,
      sessionStatusField.value,
      getPartitionProgressDataFromForm(form),
    );
    updateSessionLifecycleTimeline(
      lifecycleSummary,
      lifecycleSection,
      buildFormLifecycleState(form),
    );
  });
    sessionStatusField.addEventListener("change", () => {
      const previousStatus = form.dataset.currentStage || "unselected";
      const nextStatus = normalizeSessionStatus(sessionStatusField.value);
    if (previousStatus !== "germinating" && nextStatus === "germinating") {
      form.dataset.germinationStartedAt = new Date().toISOString();
    }
    if (previousStatus !== "completed" && nextStatus === "completed" && !form.dataset.completedAt) {
      form.dataset.completedAt = new Date().toISOString();
    }
    if (previousStatus === "completed" && nextStatus !== "completed") {
      delete form.dataset.completedAt;
    }
    form.dataset.currentStage = nextStatus;
    appState.growthStage = sessionStatusField.value || null;
    clearSessionStatusError(sessionStatusField, sessionStatusError);
    syncSessionStatusControlDatasets(sessionStatusField, {
      germinationStartedAt: form.dataset.germinationStartedAt || "",
      firstPlantedAt: form.dataset.firstPlantedAt || "",
      completedAt: form.dataset.completedAt || "",
    });
    updateSessionStatusAppearance(sessionStatusField, sessionStatusTrigger);
    applySessionStatusLayout(chartShell, chartHeader, partitionFields, sessionStatusField.value);
    applyStageEditingMode(form, sessionStatusField.value);
    updateGrowthStageLock(form, sessionStatusField.value);
    updateSessionStatusReminder(
      reminder,
      form.elements.date.value,
      form.elements.time.value,
      sessionStatusField.value,
      form.dataset.germinationStartedAt || "",
    );
    updateSessionTimingSummary(
      timingSummary,
      timingSection,
      form.elements.date.value,
      form.elements.time.value,
      sessionStatusField.value,
    );
    updateRunProgressSummary(
      runProgressSummary,
      runProgressSection,
      sessionStatusField.value,
      getPartitionProgressDataFromForm(form),
    );
      updateSessionLifecycleTimeline(
        lifecycleSummary,
        lifecycleSection,
        buildFormLifecycleState(form),
      );
      syncSessionStatusControlDatasets(sessionStatusField, {
        germinationStartedAt: form.dataset.germinationStartedAt || "",
        firstPlantedAt: form.dataset.firstPlantedAt || "",
        completedAt: form.dataset.completedAt || "",
      });
      updateSessionStatusAppearance(sessionStatusField, sessionStatusTrigger);
    });
  form.elements.date.addEventListener("change", () => {
    updateSessionStatusReminder(
      reminder,
      form.elements.date.value,
      form.elements.time.value,
      sessionStatusField.value,
      form.dataset.germinationStartedAt || "",
    );
    updateSessionTimingSummary(
      timingSummary,
      timingSection,
      form.elements.date.value,
      form.elements.time.value,
      sessionStatusField.value,
    );
    updateSessionLifecycleTimeline(
      lifecycleSummary,
      lifecycleSection,
      buildFormLifecycleState(form),
    );
  });
  form.elements.time.addEventListener("change", () => {
    updateSessionStatusReminder(
      reminder,
      form.elements.date.value,
      form.elements.time.value,
      sessionStatusField.value,
      form.dataset.germinationStartedAt || "",
    );
    updateSessionTimingSummary(
      timingSummary,
      timingSection,
      form.elements.date.value,
      form.elements.time.value,
      sessionStatusField.value,
    );
    updateSessionLifecycleTimeline(
      lifecycleSummary,
      lifecycleSection,
      buildFormLifecycleState(form),
    );
  });

  bindPartitionRowHighlighting(form);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!syncStoredTimeFromDisplay(form, { normalize: true, forceError: true })) {
      form.elements.timeDisplay?.focus();
      return;
    }
    if (!validateSessionStatus(sessionStatusField, sessionStatusError)) {
      formMessage.textContent = "";
        sessionStatusTrigger?.focus();
        return;
      }

    const validation = validatePartitions(form, { showMessage: true });
    if (!validation.isValid) {
      formMessage.textContent = "Please complete all partition fields before saving";
      validation.firstInvalidField?.focus();
      return;
    }

    formMessage.textContent = "";

    const formData = new FormData(form);
    const partitionRows = [...form.querySelectorAll(".partition-row")];
    const partitionEntries = createPartitionsForSystem(formData.get("systemType")).map((partition, index) => {
      const row = partitionRows[index];
      return {
        id: partition.id,
        source: String(formData.get(`source-${index}`) || "").trim(),
        seedVariety: String(formData.get(`seedVariety-${index}`) || "").trim(),
        breeder: "",
        seedType: formData.get(`seedType-${index}`),
        feminized: formData.get(`feminized-${index}`),
        seedCount: Number(formData.get(`seedCount-${index}`)) || 0,
        plantedCount: row?.querySelector('input[name="plantedCount"]')?.value.trim() || "",
      };
    });
    const session = {
      id: crypto.randomUUID(),
      date: formData.get("date"),
      time: formData.get("time"),
      systemType: formData.get("systemType"),
      unitId: String(formData.get("unitId") || "").trim() || "A",
      sessionName: buildFinalSessionName(
        formData.get("sessionName"),
        partitionEntries[0],
        formData.get("date"),
      ),
      customSessionName: String(formData.get("sessionName") || "").trim(),
      sessionNotes: String(formData.get("sessionNotes") || "").trim(),
      sessionImages: [],
      snapshotState: normalizePersistedSessionSnapshotState(snapshotSection?.__snapshotState?.pendingSnapshotState),
      sessionStatus: formData.get("sessionStatus") || "soaking",
      germinationStartedAt:
        normalizeSessionStatus(formData.get("sessionStatus")) === "germinating"
          ? form.dataset.germinationStartedAt || new Date().toISOString()
          : "",
      firstPlantedAt: form.dataset.firstPlantedAt || "",
      completedAt:
        formData.get("sessionStatus") === "completed"
          ? form.dataset.completedAt || new Date().toISOString()
          : form.dataset.completedAt || "",
      partitions: partitionEntries,
      createdAt: new Date().toISOString(),
    };

    try {
      session.sessionImages = await uploadPendingSessionImages(form, session.id, imageSection);
      const savedSession = await createCloudSession(session);
      clearNewSessionNotesDraft();
      savedSession.sessionImages = normalizePersistedSessionImages(savedSession.sessionImages || session.sessionImages || []);
      if (savedSession.sessionImages.length !== (session.sessionImages || []).length && (session.sessionImages || []).length) {
        savedSession.sessionImages = await persistSessionImages(savedSession, session.sessionImages);
      }
      window.location.hash = `#sessions/${savedSession.id}`;
    } catch (error) {
      formMessage.textContent = error.message || "Could not save session.";
    }
  });
}

function buildPartitionFormCard(partition, index) {
  const row = document.createElement("article");
  row.className = "chart-row partition-row";
  row.dataset.partitionRow = "true";
  row.dataset.partitionId = String(partition.id);
  row.tabIndex = -1;
  row.innerHTML = `
    <div class="partition-number partition-btn" aria-label="Partition ${partition.id}">${partition.id}</div>
    <label>
      <span class="mobile-field-label">Source</span>
        <input type="text" name="source-${index}" class="partition-input" placeholder="Seedsman (optional)" aria-label="Partition ${partition.id} source">
    </label>
    <label>
      <span class="mobile-field-label">Seed Variety</span>
        <input type="text" name="seedVariety-${index}" class="partition-input" placeholder="Blue Dream" aria-label="Partition ${partition.id} seed variety">
      <span class="field-warning" aria-live="polite">Please enter seed variety</span>
    </label>
    <label>
      <span class="mobile-field-label">Type</span>
      <div class="custom-select" data-dropdown-key="partition-${partition.id}-type-${index}">
        <select name="seedType-${index}" class="partition-input custom-select-native" data-custom-select="true" data-required-choice="true" aria-label="Partition ${partition.id} type">
          <option value="" selected>Select Type</option>
          <option value="auto">Auto</option>
          <option value="fast">Fast</option>
          <option value="photo">Photo</option>
          <option value="not-applicable">Not applicable</option>
        </select>
        <button type="button" class="custom-select-trigger partition-input" aria-haspopup="listbox" aria-expanded="false">
          <span class="custom-select-value">Select Type</span>
          <span class="custom-select-chevron" aria-hidden="true"></span>
        </button>
        <div class="custom-select-menu" role="listbox" hidden></div>
      </div>
      <span class="field-warning" aria-live="polite">Choose a type.</span>
    </label>
    <label>
      <span class="mobile-field-label">Sex</span>
      <div class="custom-select" data-dropdown-key="partition-${partition.id}-sex-${index}">
        <select name="feminized-${index}" class="partition-input custom-select-native" data-custom-select="true" data-required-choice="true" aria-label="Partition ${partition.id} sex">
          <option value="" selected>Select Sex</option>
          <option value="feminized">Feminized</option>
          <option value="regular">Regular</option>
          <option value="not-applicable">Not applicable</option>
        </select>
        <button type="button" class="custom-select-trigger partition-input" aria-haspopup="listbox" aria-expanded="false">
          <span class="custom-select-value">Select Sex</span>
          <span class="custom-select-chevron" aria-hidden="true"></span>
        </button>
        <div class="custom-select-menu" role="listbox" hidden></div>
      </div>
      <span class="field-warning" aria-live="polite">Choose feminized or regular.</span>
    </label>
    <label>
      <span class="mobile-field-label">Seeds</span>
        <input type="number" name="seedCount-${index}" class="partition-input" min="0" step="1" placeholder="Enter #" aria-label="Partition ${partition.id} number of seeds">
      <span class="field-warning" aria-live="polite">Enter a seed count greater than zero.</span>
    </label>
    <label>
      <span class="mobile-field-label"># Germinated</span>
        <input type="number" name="plantedCount" class="partition-input" min="0" step="1" placeholder="Enter #" aria-label="Partition ${partition.id} number germinated">
      <span class="field-warning" aria-live="polite"># Germinated cannot exceed # Seeds.</span>
    </label>
    <div class="detail-cell success-cell" aria-live="polite">
      <span class="mobile-field-label">Success %</span>
      <p data-success-output></p>
    </div>
  `;
  return row;
}

function renderPartitionRows(form, systemType, sessionStatus) {
  const partitionFields = form.querySelector("#partition-fields");
  const formMessage = form.querySelector("#form-message");
  const existingPartitions = getCurrentPartitionValues(form);
  const partitions = createPartitionsForSystem(systemType).map((partition, index) => ({
    ...partition,
    ...existingPartitions[index],
    id: partition.id,
  }));

  partitionFields.innerHTML = "";
  if (systemType === "TRA") {
    renderTraPartitionSections(partitionFields, partitions);
  } else {
    partitions.forEach((partition, index) => {
      partitionFields.appendChild(buildPartitionFormCard(partition, index));
      hydratePartitionRow(partitionFields.lastElementChild, partition);
    });
  }

  initializeCustomSelects(partitionFields);
  bindPartitionRowVisualState(partitionFields);
  attachPartitionValidation(form, formMessage);
  applySessionStatusLayout(
    form.querySelector("#partition-chart-shell"),
    form.querySelector("#partition-chart-header"),
    partitionFields,
    sessionStatus,
  );
  syncPartitionButtonStates(partitionFields, sessionStatus);
  updateGrowthStageLock(form, sessionStatus);
  clearActiveSystemLayout(form);
}

function updateGrowthStageLock(form, sessionStatus) {
  if (!form) {
    return;
  }

  const normalizedStatus = normalizeSessionStatus(sessionStatus);
  const trigger = form.querySelector("#session-status-trigger, #detail-session-status-trigger");

  appState.growthStage = normalizedStatus === "unselected" ? null : normalizedStatus;

  if (trigger) {
    trigger.classList.toggle("growth-stage-attention", normalizedStatus === "unselected");
  }
}

function applyStageEditingMode(scope, sessionStatus, options = {}) {
  if (!scope) {
    return;
  }

  const normalizedStatus = normalizeSessionStatus(sessionStatus);
  const isUnselected = normalizedStatus === "unselected";
  const allowFullEditing = normalizedStatus === "soaking" || isUnselected;
  const allowGerminationOnlyEditing = normalizedStatus === "germinating";
  const isCompleted = normalizedStatus === "completed";
  const allowAnyEditing = allowFullEditing || allowGerminationOnlyEditing;

  const saveButtons = [
    ...scope.querySelectorAll('button[type="submit"]'),
    ...scope.querySelectorAll('#detail-save-shortcut, #detail-save-session'),
  ];

  const timelineSaveShortcut = scope.querySelector(".timeline-save-shortcut");
  if (timelineSaveShortcut) {
    timelineSaveShortcut.hidden = isCompleted;
  }

  saveButtons.forEach((button) => {
    button.hidden = isCompleted;
    button.disabled = false;
  });

  const textFields = scope.querySelectorAll([
    'input[name="sessionName"]',
    'input[name="date"]',
    'input[name="timeDisplay"]',
    'input[name="unitId"]',
  ].join(", "));

  textFields.forEach((field) => {
    field.disabled = !allowFullEditing;
  });

  scope.querySelectorAll('select[name="systemType"]').forEach((field) => {
    field.disabled = !allowFullEditing;
  });

  scope.querySelectorAll('#detail-session-notes, #session-notes').forEach((field) => {
    field.readOnly = false;
    field.disabled = false;
  });

  scope.querySelectorAll('.partition-row input[name^="source-"], .partition-row input[name^="seedVariety-"], .partition-row select[name^="seedType-"], .partition-row select[name^="feminized-"], .partition-row input[name^="seedCount-"]').forEach((field) => {
    field.disabled = isCompleted || allowGerminationOnlyEditing;
  });

  scope.querySelectorAll('.partition-row input[name="plantedCount"]').forEach((field) => {
    field.disabled = isCompleted || isUnselected;
  });

  scope.querySelectorAll('select[data-custom-select]').forEach((field) => {
    syncCustomSelect(field);
  });

  const imageInput = scope.querySelector('#session-images-input, #detail-session-images-input');
  if (imageInput) {
    imageInput.disabled = false;
  }

  scope.querySelectorAll(".session-image-remove").forEach((button) => {
    button.disabled = false;
    button.hidden = false;
  });

  const imageUpload = scope.querySelector(".session-images-upload");
  if (imageUpload) {
    imageUpload.classList.remove("is-disabled");
    const fileUploadControl = imageUpload.querySelector(".file-upload-control");
    if (fileUploadControl) {
      fileUploadControl.setAttribute("tabindex", "0");
      fileUploadControl.setAttribute("aria-disabled", "false");
    }
  }
}

function closeGrowthStageModal() {
  const overlay = document.querySelector("#growth-stage-modal-overlay");
  const modal = overlay?.querySelector(".growth-stage-modal");

  console.log("Closing growth stage modal");
  if (!overlay || overlay.dataset.closing === "true") {
    return;
  }

  overlay.dataset.closing = "true";
  overlay.classList.add("closing");
  modal?.classList.add("closing");

  appState.growthStageModalOpen = false;
  appState.growthStageModalDismissed = true;
  appState.pendingGrowthStageInput = null;
  document.body.classList.remove("modal-open");
  appState.growthStageModalSuppressedUntil = Date.now() + 180;

  window.setTimeout(() => {
    overlay.hidden = true;
    overlay.classList.remove("is-open", "closing");
    overlay.dataset.closing = "false";
    modal?.classList.remove("closing");
    overlay.remove();
  }, 180);
}

function ensureGrowthStageModal() {
  let overlay = document.querySelector("#growth-stage-modal-overlay");
  if (overlay) {
    return overlay;
  }

  overlay = document.createElement("div");
  overlay.id = "growth-stage-modal-overlay";
  overlay.className = "growth-stage-modal-overlay";
  overlay.hidden = true;
  overlay.dataset.closing = "false";
  overlay.innerHTML = `
    <div class="growth-stage-modal" role="dialog" aria-modal="true" aria-labelledby="growth-stage-modal-title">
      <button type="button" class="modal-close" aria-label="Close">×</button>
      <div class="growth-stage-modal-copy">
        <h2 id="growth-stage-modal-title">Choose Growth Stage</h2>
      </div>
      <div class="growth-stage-modal-actions" id="growth-stage-modal-actions"></div>
    </div>
  `;

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      console.log("Overlay clicked");
      event.preventDefault();
      event.stopPropagation();
      closeGrowthStageModal();
    }
  });

  overlay.querySelector(".modal-close")?.addEventListener("click", (event) => {
    console.log("X clicked");
    event.preventDefault();
    event.stopPropagation();
    closeGrowthStageModal();
  });

  if (!ensureGrowthStageModal.escapeBound) {
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && appState.growthStageModalOpen) {
        closeGrowthStageModal();
      }
    });
    ensureGrowthStageModal.escapeBound = true;
  }

  document.body.appendChild(overlay);
  return overlay;
}

function getSessionStageLabel(value) {
  return SESSION_STAGE_OPTIONS.find((option) => option.value === value)?.label || "Select Growth Stage";
}

function getSessionStageDisplayLabel(value) {
  return SESSION_STAGE_OPTIONS.find((option) => option.value === value)?.label || "Not Started";
}

function getSessionStageButtonLabel(value) {
  return value ? "Update Growth Stage" : "Select Growth Stage";
}

function getSessionProgressDisplayLabel(progressKey, value) {
  if (progressKey === "germination") {
    return "Germination Started";
  }
  if (progressKey === "first-germinated") {
    return "First Germinated";
  }
  if (progressKey === "completed") {
    return "Completed";
  }
  if (progressKey === "soaking") {
    return "Soaking";
  }
  return getSessionStageDisplayLabel(value);
}

function syncSessionStatusControlDatasets(control, source = {}) {
  if (!control) {
    return;
  }

  control.dataset.sessionStatus = normalizeSessionStatus(control.value);
  control.dataset.germinationStartedAt = source.germinationStartedAt || "";
  control.dataset.firstPlantedAt = source.firstPlantedAt || "";
  control.dataset.completedAt = source.completedAt || "";
}

function getPartitionChartTitle(systemType) {
  return systemType === "TRA" ? "TRā™ Partition Chart" : "KAN® Partition Chart";
}

function updatePartitionWorkHeading(titleElement, systemType) {
  if (!titleElement) {
    return;
  }

  const normalizedSystemType = systemType === "TRA" ? "TRA" : "KAN";
  const titleText = titleElement.querySelector("[data-partition-title-text]");
  const titleIcon = titleElement.querySelector("[data-partition-title-icon]");

  if (titleText) {
    titleText.textContent = getPartitionChartTitle(normalizedSystemType);
  } else {
    titleElement.textContent = getPartitionChartTitle(normalizedSystemType);
  }

  if (titleIcon) {
    const iconAsset = PARTITION_HEADER_ICON_ASSETS[normalizedSystemType] || "";
    if (iconAsset) {
      titleIcon.src = iconAsset;
    }
    titleIcon.alt = normalizedSystemType === "TRA" ? "TRA partition icon" : "KAN partition icon";
    titleIcon.dataset.systemType = normalizedSystemType;
  }
}

function openGrowthStageModal({ stageField, stageTrigger } = {}) {
  if (!stageField) {
    return false;
  }

  if (appState.growthStageModalOpen) {
    return true;
  }

  const overlay = ensureGrowthStageModal();
  const actions = overlay.querySelector("#growth-stage-modal-actions");
  const currentStage = normalizeSessionStatus(stageField.value);
  if (!actions) {
    return false;
  }

  actions.innerHTML = SESSION_STAGE_OPTIONS.map((option) => `
    <button
      type="button"
      class="stage-button ${option.tone} ${currentStage === option.value ? "is-active" : ""}"
      data-growth-stage-value="${option.value}"
    >
      <span>${escapeHtml(option.modalLabel)}</span>
      ${currentStage === option.value ? '<span class="stage-option-check" aria-hidden="true">✓</span>' : ""}
    </button>
  `).join("");

  actions.querySelectorAll("[data-growth-stage-value]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const nextValue = button.getAttribute("data-growth-stage-value") || "";
      appState.growthStageModalDismissed = false;
      appState.growthStage = nextValue || null;
      stageField.value = nextValue;
      syncSessionStatusControlDatasets(stageField, {
        germinationStartedAt: stageField.dataset.germinationStartedAt || "",
        firstPlantedAt: stageField.dataset.firstPlantedAt || "",
        completedAt: stageField.dataset.completedAt || "",
      });
      updateSessionStatusAppearance(stageField, stageTrigger);
      stageField.dispatchEvent(new Event("change", { bubbles: true }));
      closeGrowthStageModal();
    });
  });

  overlay.__stageContext = { stageField, stageTrigger };
  appState.growthStageModalOpen = true;
  appState.pendingGrowthStageInput = stageField.name || stageField.id || "sessionStatus";
  overlay.hidden = false;
  overlay.classList.add("is-open");
  document.body.classList.add("modal-open");
  overlay.querySelector(".modal-close")?.focus();
  return true;
}

function maybePromptGrowthStage(form, stageField, stageTrigger) {
  if (!form || normalizeSessionStatus(stageField?.value) !== "unselected") {
    return false;
  }

  if (appState.growthStageModalOpen) {
    return true;
  }

  if (Date.now() < (appState.growthStageModalSuppressedUntil || 0)) {
    return false;
  }

  return openGrowthStageModal({ stageField, stageTrigger });
}

function renderTraPartitionSections(container, partitions) {
  const sections = [
    { label: "A", start: 0, end: 4 },
    { label: "B", start: 4, end: 8 },
    { label: "C", start: 8, end: 12 },
    { label: "D", start: 12, end: 16 },
  ];

  sections.forEach((section) => {
    const wrapper = document.createElement("section");
    wrapper.className = "tra-section";
    wrapper.innerHTML = `
      <div class="tra-section-label">Section ${section.label}</div>
      <div class="tra-section-body"></div>
    `;

    const body = wrapper.querySelector(".tra-section-body");
    partitions.slice(section.start, section.end).forEach((partition, localIndex) => {
      const index = section.start + localIndex;
      body.appendChild(buildPartitionFormCard(partition, index));
      hydratePartitionRow(body.lastElementChild, partition);
    });

    container.appendChild(wrapper);
  });
}

function hydratePartitionRow(row, partition) {
  row.querySelector('input[name^="source-"]').value = formatPartitionSource(partition);
  row.querySelector('input[name^="seedVariety-"]').value = formatPartitionSeedVariety(partition);
  row.querySelector('select[name^="seedType-"]').value = partition.seedType || "";
  row.querySelector('select[name^="feminized-"]').value = partition.feminized || "";
  row.querySelector('input[name^="seedCount-"]').value = partition.seedCount > 0 ? partition.seedCount : "";
  row.querySelector('input[name="plantedCount"]').value = partition.plantedCount || "";
}

function getCurrentPartitionValues(form) {
  return [...form.querySelectorAll(".partition-row")].map((row) => ({
    source: row.querySelector('input[name^="source-"]')?.value.trim() || "",
    seedVariety: row.querySelector('input[name^="seedVariety-"]')?.value.trim() || "",
    breeder: "",
    seedType: row.querySelector('select[name^="seedType-"]')?.value || "",
    feminized: row.querySelector('select[name^="feminized-"]')?.value || "",
    seedCount: Number(row.querySelector('input[name^="seedCount-"]')?.value) || 0,
    plantedCount: row.querySelector('input[name="plantedCount"]')?.value.trim() || "",
  }));
}

function renderSessionsList() {
  app.replaceChildren(cloneTemplate(templates.sessions));
  initializeCustomSelects(app);
  const sessions = sortSessionsNewestFirst(getSessions());
  const activeContainer = document.querySelector("#active-sessions-list");
  const recentCompletedContainer = document.querySelector("#recent-completed-sessions-list");
  const historyContainer = document.querySelector("#sessions-list");
  const historySortControl = document.querySelector("#session-history-sort");

  const activeSessions = sessions.filter((session) => normalizeSessionStatus(session.sessionStatus) !== "completed");
  const completedSessions = sessions.filter((session) => normalizeSessionStatus(session.sessionStatus) === "completed");

  renderSessionCollection(activeContainer, activeSessions, {
    emptyMessage: "No active sessions.",
    emptyActionLabel: "Create your first session",
    compact: false,
  });

  renderRecentSessions(recentCompletedContainer, completedSessions.slice(0, 2), sessions, {
    emptyMessage: "No completed sessions yet.",
  });

  const renderHistorySessions = () => renderSessionCollection(
    historyContainer,
    sortSessionHistorySessions(sessions, appState.sessionHistorySort),
    {
      emptyMessage: "No grow sessions yet.",
      emptyActionLabel: "Create your first session",
      compact: false,
      variant: "history-grid",
    },
  );

  if (historySortControl) {
    historySortControl.value = appState.sessionHistorySort || "date";
    historySortControl.addEventListener("change", () => {
      appState.sessionHistorySort = historySortControl.value || "date";
      renderHistorySessions();
    });
  }

  renderHistorySessions();
}

function renderPublicSessionDetail(snapshotId) {
  const snapshot = getApprovedPublicGallerySnapshotById(snapshotId);
  const isLoadingSnapshot = Boolean(appState.galleryRefreshPromise) || (!isMockDataEnabled() && !appState.gallerySnapshots.length);

  if (!snapshot) {
    app.innerHTML = `
      <section class="card public-session-card">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Public Session</p>
            <h2>Grow session view</h2>
            <p class="muted">${isLoadingSnapshot ? "Loading public grow session..." : "This public grow session is unavailable."}</p>
          </div>
          <div class="inline-actions">
            <a class="button button-secondary" href="#gallery">Back to Gallery</a>
          </div>
        </div>
      </section>
    `;
    return;
  }

  const publicDetails = getGallerySnapshotPublicSessionDetails(snapshot);
  const sharedProfileMarkup = renderGallerySharedProfileMarkup(snapshot);
  const facts = [
    { label: "System", value: publicDetails.systemLabel },
    { label: "Source", value: publicDetails.sourceLabel },
    { label: "Seed Variety", value: publicDetails.seedVarietyLabel },
    { label: "Type", value: publicDetails.seedTypeLabel },
    { label: "Sex", value: publicDetails.sexLabel },
    { label: "Seed Count", value: publicDetails.seedCountLabel },
    { label: "Germinated", value: publicDetails.germinatedLabel },
    { label: "Germination Rate", value: publicDetails.germinationRateLabel },
    { label: "Session Date", value: publicDetails.sessionDateLabel },
  ];

  app.innerHTML = `
    <section class="card public-session-card">
      <div class="section-heading">
        <div class="section-title-with-icon">
          <svg class="section-title-icon" viewBox="0 0 24 24" focusable="false" aria-hidden="true">
            <path d="M8 4.5h6l3 3v12a1.5 1.5 0 0 1-1.5 1.5h-7A2.5 2.5 0 0 1 6 18.5v-11A3 3 0 0 1 9 4.5"></path>
            <path d="M14 4.5v3h3"></path>
            <path d="M9 12h6"></path>
            <path d="M9 15h4"></path>
          </svg>
          <div>
            <p class="eyebrow">Public Session</p>
            <h2>${escapeHtml(snapshot.title)}</h2>
            <p class="muted">Read-only grow session view</p>
          </div>
        </div>
        <div class="inline-actions">
          <a class="button button-secondary" href="#gallery">Back to Gallery</a>
        </div>
      </div>
      ${sharedProfileMarkup ? `<div class="public-session-profile">${sharedProfileMarkup}</div>` : ""}
      <div class="public-session-layout">
        <div class="public-session-media">
          ${renderGallerySnapshotMediaMarkup(snapshot, getGallerySnapshotFeedDetails(snapshot))}
        </div>
        <div class="public-session-details">
          <div class="public-session-readonly-note">
            <strong>Read-only</strong>
            <p>Public viewers can explore shared grow results here without editing sessions, notes, images, or gallery settings.</p>
          </div>
          <div class="public-session-meta-grid">
            ${facts.map((fact) => `
              <article class="meta-card public-session-meta-card">
                <strong>${escapeHtml(fact.label)}</strong>
                <p>${escapeHtml(fact.value)}</p>
              </article>
            `).join("")}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderSessionDetail(sessionId) {
  const session = getSessions().find((item) => item.id === sessionId);

  if (!session) {
    window.location.hash = "#sessions";
    return;
  }

  app.replaceChildren(cloneTemplate(templates.detail));

  document.querySelector("#detail-title").textContent = formatSessionLabel(session);

  const meta = document.querySelector("#detail-meta");
  const layoutReference = document.querySelector("#detail-layout-reference");
  const detailPartitionWorkTitle = document.querySelector("#detail-partition-work-title");
  const detailStatusField = document.querySelector("#detail-session-status-control");
  const detailStatusTrigger = document.querySelector("#detail-session-status-trigger");
  const detailReminder = document.querySelector("#detail-session-status-reminder");
  const detailNotesField = document.querySelector("#detail-session-notes");
  const detailNotesSaveButton = document.querySelector("#detail-session-notes-save");
  const detailNotesMessage = document.querySelector("#detail-session-notes-message");
  const detailSaveShortcutButton = document.querySelector("#detail-save-shortcut");
  const detailSaveButton = document.querySelector("#detail-save-session");
  const detailSaveMessage = document.querySelector("#detail-save-message");
  const detailImageSection = document.querySelector(".session-images-section");
  const detailImageInput = document.querySelector("#detail-session-images-input");
  const detailImageGrid = document.querySelector("#detail-session-images-grid");
  const detailImageMessage = document.querySelector("#detail-session-images-message");
  const detailSnapshotSection = document.querySelector("#detail-share-snapshot-section");
  const detailSnapshotPicker = document.querySelector("#detail-snapshot-image-picker");
  const detailSnapshotMessage = document.querySelector("#detail-snapshot-message");
  const detailSnapshotPreview = document.querySelector("#detail-snapshot-preview");
  const detailSnapshotPostActions = document.querySelector("#detail-snapshot-post-actions");
  const detailGenerateSnapshotButton = document.querySelector("#detail-generate-snapshot");
  const detailDownloadSnapshotButton = document.querySelector("#detail-download-snapshot");
  const detailResetSnapshotButton = document.querySelector("#detail-reset-snapshot");
  const detailShareSnapshotButton = document.querySelector("#detail-share-snapshot");
  const detailSnapshotGalleryNote = document.querySelector("#detail-snapshot-gallery-note");
  const detailSnapshotUnpublishButton = document.querySelector("#detail-snapshot-unpublish");
  const detailSnapshotIncludeProfileToggle = document.querySelector("#detail-snapshot-include-profile");
  const detailSnapshotIncludeProfileToggleRow = document.querySelector("#detail-snapshot-profile-toggle-row");
  const detailSnapshotIncludeProfileDividerRow = document.querySelector("#detail-snapshot-profile-divider-row");
  const detailSnapshotDestinationInputs = [...document.querySelectorAll('input[name="detail-snapshot-destination"]')];
  const detailChartShell = document.querySelector("#detail-chart-shell");
  const detailChartHeader = document.querySelector("#detail-chart-header");
  const detailProgressSection = document.querySelector("#detail-progress-section");
  const detailProgressChart = document.querySelector("#detail-progress-chart");
  const detailTimingSection = document.querySelector("#detail-timing-section");
  const detailTimingSummary = document.querySelector("#detail-timing-summary");
  const detailRunProgressSection = document.querySelector("#detail-run-progress-section");
  const detailRunProgressSummary = document.querySelector("#detail-run-progress-summary");
  const detailLifecycleSection = document.querySelector("#detail-lifecycle-section");
  const detailLifecycleSummary = document.querySelector("#detail-lifecycle-summary");
  meta.innerHTML = `
    <article class="meta-card">
      <strong>Session Name</strong>
      <p>${escapeHtml(formatSessionLabel(session))}</p>
    </article>
    <article class="meta-card">
      <strong>System Type</strong>
      <p>${session.systemType}</p>
    </article>
    <article class="meta-card">
      <strong>Unit ID</strong>
      <p>${escapeHtml(session.unitId)}</p>
    </article>
    <article class="meta-card">
      <strong>Date</strong>
      <p>${session.date}</p>
    </article>
    <article class="meta-card">
      <strong>Time</strong>
      <p>${formatStoredTime(session.time)}</p>
    </article>
  `;

  renderSystemLayoutReference(layoutReference, session.systemType);
  if (detailPartitionWorkTitle) {
    updatePartitionWorkHeading(detailPartitionWorkTitle, session.systemType);
  }
  detailStatusField.value = session.sessionStatus || "soaking";
  syncSessionStatusControlDatasets(detailStatusField, {
    germinationStartedAt: session.germinationStartedAt || "",
    firstPlantedAt: session.firstPlantedAt || "",
    completedAt: session.completedAt || "",
  });
  detailNotesField.value = session.sessionNotes || "";
  initializeSessionImageState(detailImageSection, {
    input: detailImageInput,
    grid: detailImageGrid,
    message: detailImageMessage,
    images: session.sessionImages || [],
    editable: true,
    session,
    onImagesChange: async (nextImages) => {
      try {
        session.sessionImages = await persistSessionImages(session, nextImages);
      } catch (error) {
        detailImageMessage.textContent = error.message || "Could not save session images.";
        detailImageMessage.classList.add("is-error");
      }
    },
    onRender: () => {
      if (detailSnapshotSection?.__snapshotState) {
        setSnapshotPreview(detailSnapshotSection.__snapshotState, null);
        setSnapshotMessage(detailSnapshotSection.__snapshotState, "");
        renderSnapshotSourceSummary(detailSnapshotSection.__snapshotState);
      }
    },
  });
  initializeSnapshotSection(detailSnapshotSection, {
    picker: detailSnapshotPicker,
    preview: detailSnapshotPreview,
    postActions: detailSnapshotPostActions,
    message: detailSnapshotMessage,
    generateButton: detailGenerateSnapshotButton,
    downloadButton: detailDownloadSnapshotButton,
    resetButton: detailResetSnapshotButton,
    shareButton: detailShareSnapshotButton,
    destinationInputs: detailSnapshotDestinationInputs,
    includeProfileToggle: detailSnapshotIncludeProfileToggle,
    includeProfileToggleRow: detailSnapshotIncludeProfileToggleRow,
    includeProfileDividerRow: detailSnapshotIncludeProfileDividerRow,
    galleryNote: detailSnapshotGalleryNote,
    unpublishButton: detailSnapshotUnpublishButton,
    canPublish: true,
    getGallerySession: () => session,
    getSnapshotData: () => getSessionSnapshotData(session),
    getImageEntries: () => {
      const imageState = detailImageSection.__sessionImageState;
      return imageState ? [...imageState.images, ...imageState.pendingFiles] : [];
    },
  });
  updateSessionStatusAppearance(detailStatusField, detailStatusTrigger);
  updateSessionStatusReminder(
    detailReminder,
    session.date,
    session.time,
    detailStatusField.value,
    session.germinationStartedAt || "",
  );

  const partitions = document.querySelector("#detail-partitions");
  session.partitions.forEach((partition, index) => {
    partitions.appendChild(buildPartitionFormCard(partition, index));
    hydratePartitionRow(partitions.lastElementChild, partition);
  });
  initializeCustomSelects(partitions);
  bindPartitionRowVisualState(partitions);
  applySessionStatusLayout(detailChartShell, detailChartHeader, partitions, detailStatusField.value);
  syncPartitionButtonStates(partitions, detailStatusField.value);
  applyStageEditingMode(app, detailStatusField.value);
  const refreshDetailDerivedViews = () => {
    updatePartitionProgressChart(
      session.partitions.map((partition) => ({
        id: partition.id,
        seedCount: Number(partition.seedCount) || 0,
        plantedCount: Number(partition.plantedCount) || 0,
      })),
      detailProgressChart,
      detailProgressSection,
    );
    updateSessionTimingSummary(
      detailTimingSummary,
      detailTimingSection,
      session.date,
      session.time,
      detailStatusField.value,
      session.completedAt,
    );
    updateRunProgressSummary(
      detailRunProgressSummary,
      detailRunProgressSection,
      detailStatusField.value,
      session.partitions,
    );
    updateSessionLifecycleTimeline(
      detailLifecycleSummary,
      detailLifecycleSection,
      buildSessionLifecycleState(session),
    );
  };
  partitions.querySelectorAll(".partition-row").forEach((row) => {
    row.querySelectorAll("input, select").forEach((field) => {
      const eventName = field.tagName === "SELECT" ? "change" : "input";
      field.addEventListener(eventName, () => {
        validatePartitionRow(row);
        syncSessionPartitionsFromContainer(session, partitions);
        captureFirstPlantedEventForSession(session);
        syncSessionStatusControlDatasets(detailStatusField, {
          germinationStartedAt: session.germinationStartedAt || "",
          firstPlantedAt: session.firstPlantedAt || "",
          completedAt: session.completedAt || "",
        });
        updateSessionStatusAppearance(detailStatusField, detailStatusTrigger);
        refreshDetailDerivedViews();
        detailSaveMessage.textContent = "";
      });
      field.addEventListener("blur", () => {
        validatePartitionRow(row);
        syncSessionPartitionsFromContainer(session, partitions);
        captureFirstPlantedEventForSession(session);
        syncSessionStatusControlDatasets(detailStatusField, {
          germinationStartedAt: session.germinationStartedAt || "",
          firstPlantedAt: session.firstPlantedAt || "",
          completedAt: session.completedAt || "",
        });
        updateSessionStatusAppearance(detailStatusField, detailStatusTrigger);
        refreshDetailDerivedViews();
      });
    });
    validatePartitionRow(row);
  });
  refreshDetailDerivedViews();
  bindSessionTimelineDebugTools(detailLifecycleSection, (action) => {
    applyDebugEventToSession(session, detailStatusField, action);
    syncSessionStatusControlDatasets(detailStatusField, {
      germinationStartedAt: session.germinationStartedAt || "",
      firstPlantedAt: session.firstPlantedAt || "",
      completedAt: session.completedAt || "",
    });
    updateSessionStatusAppearance(detailStatusField, detailStatusTrigger);
    updateSessionStatusReminder(
      detailReminder,
      session.date,
      session.time,
      detailStatusField.value,
      session.germinationStartedAt || "",
    );
    updateRunProgressSummary(
      detailRunProgressSummary,
      detailRunProgressSection,
      detailStatusField.value,
      session.partitions,
    );
    updateSessionLifecycleTimeline(
      detailLifecycleSummary,
      detailLifecycleSection,
      buildSessionLifecycleState(session),
    );
    saveSessionUpdate(session);
  });
  startSessionTimer(() => {
    updateSessionStatusReminder(
      detailReminder,
      session.date,
      session.time,
      detailStatusField.value,
      session.germinationStartedAt || "",
    );
    updateSessionTimingSummary(
      detailTimingSummary,
      detailTimingSection,
      session.date,
      session.time,
      detailStatusField.value,
      session.completedAt,
    );
    updateRunProgressSummary(
      detailRunProgressSummary,
      detailRunProgressSection,
      detailStatusField.value,
      session.partitions,
    );
    updateSessionLifecycleTimeline(
      detailLifecycleSummary,
      detailLifecycleSection,
      buildSessionLifecycleState(session),
    );
  });

    detailStatusTrigger?.addEventListener("click", () => {
      appState.growthStageModalDismissed = false;
      openGrowthStageModal({ stageField: detailStatusField, stageTrigger: detailStatusTrigger });
    });

  detailStatusField.addEventListener("change", async () => {
    const previousStatus = session.sessionStatus || "";
    session.sessionStatus = detailStatusField.value;
    if (normalizeSessionStatus(previousStatus) !== "germinating" && normalizeSessionStatus(detailStatusField.value) === "germinating") {
      session.germinationStartedAt = new Date().toISOString();
    }
    if (detailStatusField.value === "completed" && previousStatus !== "completed") {
      session.completedAt = new Date().toISOString();
    }
    if (previousStatus === "completed" && detailStatusField.value !== "completed") {
      session.completedAt = "";
    }
    syncSessionStatusControlDatasets(detailStatusField, {
      germinationStartedAt: session.germinationStartedAt || "",
      firstPlantedAt: session.firstPlantedAt || "",
      completedAt: session.completedAt || "",
    });
    updateSessionStatusAppearance(detailStatusField, detailStatusTrigger);
    updateSessionStatusReminder(
      detailReminder,
      session.date,
      session.time,
      detailStatusField.value,
      session.germinationStartedAt || "",
    );
    bindPartitionRowVisualState(partitions);
    applySessionStatusLayout(detailChartShell, detailChartHeader, partitions, detailStatusField.value);
    syncPartitionButtonStates(partitions, detailStatusField.value);
    applyStageEditingMode(app, detailStatusField.value);
    syncSessionPartitionsFromContainer(session, partitions);
    refreshDetailDerivedViews();

    await saveSessionUpdate(session);
  });

  const persistDetailSession = async () => {
    syncSessionPartitionsFromContainer(session, partitions);
    captureFirstPlantedEventForSession(session);
    session.sessionNotes = detailNotesField.value.trim();
    detailSaveMessage.textContent = "";
    refreshDetailDerivedViews();
    const savedSession = await saveSessionUpdate(session);
    detailSaveMessage.textContent = savedSession ? "Session saved." : "Could not save session.";
  };

  detailSaveShortcutButton?.addEventListener("click", persistDetailSession);
  detailSaveButton?.addEventListener("click", persistDetailSession);

  const persistDetailNote = async () => {
    try {
      const savedSession = await updateCloudSessionNotes(session.id, detailNotesField.value);
      Object.assign(session, savedSession);
      if (detailNotesField) {
        detailNotesField.value = session.sessionNotes || "";
      }
      if (detailNotesMessage) {
        detailNotesMessage.textContent = "Note saved.";
        detailNotesMessage.classList.remove("is-error");
      }
    } catch (error) {
      console.error("Failed to save session note", error);
      if (detailNotesMessage) {
        detailNotesMessage.textContent = "Could not save note.";
        detailNotesMessage.classList.add("is-error");
      }
    }
  };

  detailNotesSaveButton?.addEventListener("click", persistDetailNote);
  detailNotesField.addEventListener("input", () => {
    if (!detailNotesMessage?.textContent) {
      return;
    }

    detailNotesMessage.textContent = "";
    detailNotesMessage.classList.remove("is-error");
  });

  document.querySelector("#delete-session").addEventListener("click", async () => {
    const confirmed = window.confirm("Delete this session?");
    if (!confirmed) {
      return;
    }

    try {
      await deleteCloudSession(sessionId);
      window.location.hash = "#sessions";
    } catch (error) {
      window.alert(error.message || "Could not delete session.");
    }
  });
}

function renderSessionCollection(container, sessions, options) {
  container.innerHTML = "";
  container.classList.toggle("compact-list", options.compact);
  container.classList.toggle("session-history-grid", options.variant === "history-grid");

  if (!sessions.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = `
      <p>${options.emptyMessage}</p>
      <a class="button button-primary" href="#new">${options.emptyActionLabel}</a>
    `;
    container.appendChild(empty);
    return;
  }

  sessions.forEach((session) => {
    const successLabel = formatSessionSuccessLabel(session);
    const stageLabel = capitalize(normalizeSessionStatus(session.sessionStatus)).replace("Unselected", "Not started");
    const row = document.createElement("a");
    row.className = `session-row${options.variant === "history-grid" ? " session-history-card" : ""}`;
    row.href = `#sessions/${session.id}`;
    if (options.variant === "history-grid") {
      row.innerHTML = `
        <div class="session-row-top">
          <strong>${escapeHtml(formatSessionLabel(session))}</strong>
          <div class="session-row-actions">
            <button type="button" class="session-delete-button" data-session-delete="${session.id}" aria-label="Delete ${escapeHtml(formatSessionLabel(session))}">Delete</button>
          </div>
        </div>
        <div class="session-history-meta">
          <div class="session-history-meta-item">
            <span>Date</span>
            <p>${escapeHtml(formatSessionNameDate(session.date))}</p>
          </div>
          <div class="session-history-meta-item">
            <span>System</span>
            <p>${escapeHtml(getSessionSystemSummary(session))}</p>
          </div>
          <div class="session-history-meta-item">
            <span>Status</span>
            <p>${escapeHtml(stageLabel)}</p>
          </div>
        </div>
        <div class="session-history-footer">
          <span class="session-success-pill">${formatSessionRateBadgeLabel(session)}</span>
          <span class="session-history-view">Open session</span>
        </div>
      `;
    } else {
      row.innerHTML = `
        <div class="session-row-top">
          <strong>${escapeHtml(formatSessionLabel(session))}</strong>
          <div class="session-row-actions">
            <span class="session-success-pill">${successLabel}</span>
            <button type="button" class="session-delete-button" data-session-delete="${session.id}" aria-label="Delete ${escapeHtml(formatSessionLabel(session))}">Delete</button>
          </div>
        </div>
        <div class="session-row-bottom">
          <p>${escapeHtml(formatSessionNameDate(session.date))}</p>
          <p>${session.systemType}</p>
          <p>${escapeHtml(stageLabel)}</p>
        </div>
      `;
    }
    row.querySelector("[data-session-delete]")?.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();

      const confirmed = window.confirm("Delete this session? This cannot be undone.");
      if (!confirmed) {
        return;
      }

      try {
        await deleteCloudSession(session.id);
        renderSessionsList();
      } catch (error) {
        window.alert(error.message || "Could not delete session.");
      }
    });
    container.appendChild(row);
  });
}

function sortSessionHistorySessions(sessions, sortBy = "date") {
  const collator = new Intl.Collator("en", {
    sensitivity: "base",
    numeric: true,
  });

  return [...sessions].sort((left, right) => {
    switch (sortBy) {
      case "name-asc":
        return collator.compare(formatSessionLabel(left), formatSessionLabel(right))
          || (getSessionSortTime(right) - getSessionSortTime(left));
      case "name-desc":
        return collator.compare(formatSessionLabel(right), formatSessionLabel(left))
          || (getSessionSortTime(right) - getSessionSortTime(left));
      case "rate":
        return getSessionSuccessRate(right) - getSessionSuccessRate(left)
          || (getSessionSortTime(right) - getSessionSortTime(left));
      case "date":
      default:
        return getSessionSortTime(right) - getSessionSortTime(left);
    }
  });
}

function getSessionSuccessRate(session) {
  const totals = getSessionSeedTotals(session);
  if (totals.totalSeeds <= 0) {
    return 0;
  }

  return Math.round((totals.totalPlanted / totals.totalSeeds) * 100);
}

function getSessionSystemSummary(session) {
  const systemType = String(session.systemType || "").trim();
  const unitId = String(session.unitId || "").trim();

  if (systemType && unitId) {
    return `${systemType} / ${unitId}`;
  }

  return systemType || unitId || "Not provided";
}

function formatSessionRateBadgeLabel(session) {
  const totals = getSessionSeedTotals(session);
  if (totals.totalSeeds <= 0) {
    return "Germination --";
  }

  return `Germination ${getSessionSuccessRate(session)}%`;
}

function formatSessionSuccessLabel(session) {
  const totals = getSessionSeedTotals(session);
  if (totals.totalSeeds <= 0) {
    return "Success --";
  }

  return `Success ${Math.round((totals.totalPlanted / totals.totalSeeds) * 100)}%`;
}

function getSessionSeedTotals(session) {
  return (session.partitions || []).reduce((accumulator, partition) => {
    const seeds = Number(partition.seedCount) || 0;
    const planted = Number(partition.plantedCount) || 0;
    accumulator.totalSeeds += Math.max(0, seeds);
    accumulator.totalPlanted += Math.max(0, planted);
    return accumulator;
  }, { totalSeeds: 0, totalPlanted: 0 });
}

function sortSessionsNewestFirst(sessions) {
  return [...sessions].sort((left, right) => {
    const leftTime = getSessionSortTime(left);
    const rightTime = getSessionSortTime(right);
    return rightTime - leftTime;
  });
}

function getSessionSortTime(session) {
  const createdAt = parseCompletedAtValue(session.createdAt);
  if (createdAt) {
    return createdAt.getTime();
  }

  const startedAt = parseSessionStartDateTime(session.date, session.time);
  return startedAt ? startedAt.getTime() : 0;
}

function buildPartitionDetailRow(partition, sessionStatus = "") {
  const germinationStatus = getPartitionGerminationDisplay(partition);
  const successDisplay = getPartitionSuccessDisplay(partition);
  const basePartitionState = getPartitionBaseRowState({
    sourceValue: formatPartitionSource(partition),
    varietyValue: formatPartitionSeedVariety(partition),
    typeValue: partition?.seedType || "",
    sexValue: partition?.feminized || "",
    seedValue: partition?.seedCount ?? "",
    plantedValue: partition?.plantedCount ?? "",
  });
  const partitionState = getPartitionRowStateFromPartition(partition, sessionStatus);
  const row = document.createElement("article");
  row.className = "chart-row partition-row detail-row";
  row.dataset.partitionRow = "true";
  row.dataset.partitionBaseState = basePartitionState;
  row.innerHTML = `
    <div class="partition-number partition-btn ${getPartitionButtonClassName(partitionState)}" aria-label="Partition ${partition.id}">${partition.id}</div>
    <div class="detail-cell">
      <span class="mobile-field-label">Source</span>
      <p>${escapeHtml(formatPartitionSource(partition) || "Not set")}</p>
    </div>
    <div class="detail-cell">
      <span class="mobile-field-label">Seed Variety</span>
      <p>${escapeHtml(formatPartitionSeedVariety(partition) || "Not set")}</p>
    </div>
    <div class="detail-cell">
      <span class="mobile-field-label">Type</span>
      <p>${partition.seedType ? capitalize(partition.seedType) : "Not selected"}</p>
    </div>
    <div class="detail-cell">
      <span class="mobile-field-label">Sex</span>
      <p>${partition.feminized ? capitalize(partition.feminized) : "Not selected"}</p>
    </div>
    <div class="detail-cell">
      <span class="mobile-field-label">Seeds</span>
      <p>${partition.seedCount || 0}</p>
    </div>
    <div class="detail-cell">
      <span class="mobile-field-label">Germinated</span>
      <p class="${germinationStatus.className}">${germinationStatus.label}</p>
    </div>
    <div class="detail-cell success-cell">
      <span class="mobile-field-label">Success %</span>
      <p class="${successDisplay.className}">${successDisplay.label}</p>
    </div>
  `;
  return row;
}

function getPartitionBaseRowState(values) {
  const sourceValue = String(values?.sourceValue || "").trim();
  const varietyValue = String(values?.varietyValue || "").trim();
  const typeValue = String(values?.typeValue || "").trim();
  const sexValue = String(values?.sexValue || "").trim();
  const seedValue = String(values?.seedValue || "").trim();
  const plantedValue = String(values?.plantedValue || "").trim();
  const hasSeedCount = seedValue !== "";
  const hasPlantedCount = plantedValue !== "";

  if (sourceValue || varietyValue || typeValue || sexValue || hasSeedCount || hasPlantedCount) {
    return "in-progress";
  }

  return "empty";
}

function getPartitionRowState(values, sessionStatus = "") {
  const baseState = getPartitionBaseRowState(values);

  if (baseState === "empty") {
    return "empty";
  }

  if (normalizeSessionStatus(sessionStatus) === "completed") {
    return "complete";
  }

  return "in-progress";
}

function getPartitionRowStateFromPartition(partition, sessionStatus = "") {
  return getPartitionRowState({
    sourceValue: formatPartitionSource(partition),
    varietyValue: formatPartitionSeedVariety(partition),
    typeValue: partition?.seedType || "",
    sexValue: partition?.feminized || "",
    seedValue: partition?.seedCount ?? "",
    plantedValue: partition?.plantedCount ?? "",
  }, sessionStatus);
}

function getPartitionButtonClassName(state) {
  if (state === "complete") {
    return "partition-btn--complete";
  }

  if (state === "in-progress") {
    return "partition-btn--in-progress";
  }

  return "";
}

function updatePartitionButtonState(row, state) {
  const button = row.querySelector(".partition-btn");
  if (!button) {
    return;
  }

  const sessionStatus = row.closest(".partition-table")?.dataset.sessionStatus || row.closest("form")?.dataset.currentStage || "";
  const isCompletedSession = normalizeSessionStatus(sessionStatus) === "completed";
  row.dataset.partitionButtonState = state;
  button.classList.toggle("partition-btn--in-progress", state === "in-progress");
  button.classList.toggle("partition-btn--complete", state === "complete");
  if (isCompletedSession) {
    button.style.setProperty("background", "#363022", "important");
    button.style.setProperty("border-color", "#a56a3f", "important");
    button.style.setProperty("color", "#fff", "important");
    button.style.setProperty("box-shadow", "0 0 0 3px rgba(165, 106, 63, 0.18)", "important");
  } else {
    button.style.removeProperty("background");
    button.style.removeProperty("border-color");
    button.style.removeProperty("color");
    button.style.removeProperty("box-shadow");
  }
}

function applyPartitionRowVisualState(row) {
  if (!row) {
    return;
  }

  const isDarkTheme = document.body.classList.contains("theme-dark");
  const labels = row.querySelectorAll("label, .detail-cell");
  const fields = row.querySelectorAll('input:not([name="plantedCount"]), select, .custom-select-trigger');
  const sessionStatus = row.closest(".partition-table")?.dataset.sessionStatus || row.closest("form")?.dataset.currentStage || "";
  const isCompletedSession = normalizeSessionStatus(sessionStatus) === "completed";
  const isCompletedEmpty = row.classList.contains("row-completed-empty");

  if (!isDarkTheme) {
    row.style.removeProperty("background");
    row.style.removeProperty("background-image");
    row.style.removeProperty("box-shadow");
    row.style.removeProperty("opacity");
    row.style.removeProperty("filter");
    labels.forEach((node) => {
      node.style.removeProperty("background");
      node.style.removeProperty("background-image");
    });
    fields.forEach((node) => {
      node.style.removeProperty("background");
      node.style.removeProperty("background-image");
      node.style.removeProperty("color");
      node.style.removeProperty("-webkit-text-fill-color");
      node.style.removeProperty("border-color");
      node.style.removeProperty("box-shadow");
      node.style.removeProperty("opacity");
    });
    return;
  }

  const isHovered = row.dataset.hovered === "true";
  const isWarning = row.classList.contains("row-has-warning");
  const isCompleted = row.classList.contains("row--completed");
  const isFilled = row.classList.contains("partition-row--filled");

  let background = "";
  let boxShadow = "";

  if (isHovered) {
    background = "rgba(148, 209, 89, 0.035)";
    boxShadow = "inset 0 0 0 1px rgba(148, 209, 89, 0.10)";
  } else if (isWarning) {
    background = "rgba(221, 128, 69, 0.05)";
    boxShadow = "inset 0 0 0 1px rgba(221, 128, 69, 0.12)";
  } else if (isCompleted) {
    background = "#262D27";
    boxShadow = "inset 0 1px 0 rgba(255, 255, 255, 0.02), inset 0 0 0 1px rgba(148, 209, 89, 0.06)";
  } else if (isFilled) {
    background = "#2A312B";
    boxShadow = "inset 0 0 0 1px rgba(148, 209, 89, 0.05)";
  }

  if (background) {
    row.style.setProperty("background", background, "important");
    row.style.setProperty("background-image", "none", "important");
    row.style.setProperty("box-shadow", boxShadow, "important");
  } else {
    row.style.removeProperty("background");
    row.style.removeProperty("background-image");
    row.style.removeProperty("box-shadow");
  }

  if (isCompletedSession && isCompletedEmpty) {
    row.style.setProperty("opacity", "0.55", "important");
    row.style.setProperty("filter", "grayscale(0.35)", "important");
    row.style.setProperty("background", "#18201b", "important");
    row.style.setProperty("background-image", "none", "important");
    row.style.setProperty("box-shadow", "inset 0 0 0 1px rgba(148, 209, 89, 0.12)", "important");
  } else {
    row.style.removeProperty("opacity");
    row.style.removeProperty("filter");
  }

  labels.forEach((node) => {
    node.style.setProperty("background", "transparent", "important");
    node.style.setProperty("background-image", "none", "important");
  });

  fields.forEach((node) => {
    const fieldBackground = isCompletedSession && isCompletedEmpty
      ? "#202622"
      : (isFilled || isCompleted ? "#232823" : "#1E221F");
    node.style.setProperty("background", fieldBackground, "important");
    node.style.setProperty("background-image", "none", "important");
    node.style.setProperty("color", "#f6f8f5", "important");
    node.style.setProperty("-webkit-text-fill-color", "#f6f8f5", "important");
    node.style.setProperty(
      "border-color",
      isCompletedSession && isCompletedEmpty ? "rgba(148, 209, 89, 0.12)" : "#343a35",
      "important",
    );
    node.style.setProperty("box-shadow", "none", "important");
    if (isCompletedSession && isCompletedEmpty) {
      node.style.setProperty("opacity", "0.88", "important");
    } else {
      node.style.removeProperty("opacity");
    }
  });
}

function bindPartitionRowVisualState(partitionContainer) {
  if (!partitionContainer || partitionContainer.dataset.rowVisualBound === "true") {
    return;
  }

  const setHoverState = (target, hovered) => {
    const row = target instanceof Element ? target.closest(".partition-row") : null;
    if (!row || !partitionContainer.contains(row)) {
      return;
    }

    row.dataset.hovered = hovered ? "true" : "false";
    applyPartitionRowVisualState(row);
  };

  partitionContainer.addEventListener("mouseover", (event) => {
    setHoverState(event.target, true);
  });

  partitionContainer.addEventListener("mouseout", (event) => {
    const row = event.target instanceof Element ? event.target.closest(".partition-row") : null;
    if (!row || !partitionContainer.contains(row)) {
      return;
    }

    const relatedRow = event.relatedTarget instanceof Element ? event.relatedTarget.closest(".partition-row") : null;
    if (relatedRow === row) {
      return;
    }

    row.dataset.hovered = "false";
    applyPartitionRowVisualState(row);
  });

  partitionContainer.dataset.rowVisualBound = "true";
}

function syncPartitionButtonStates(partitionContainer, sessionStatus = "") {
  if (!partitionContainer) {
    return;
  }

  const normalizedStatus = normalizeSessionStatus(sessionStatus);

  partitionContainer.querySelectorAll(".partition-row").forEach((row) => {
    const varietyInput = row.querySelector('input[name^="seedVariety-"]');

    if (varietyInput) {
      validatePartitionRow(row);
      return;
    }

    const baseState = row.dataset.partitionBaseState || "empty";
    const nextState = baseState === "empty"
      ? "empty"
      : normalizedStatus === "completed"
        ? "complete"
        : "in-progress";

    row.classList.toggle("row-complete", normalizedStatus === "completed" && baseState !== "empty");
    updatePartitionButtonState(row, nextState);
    applyPartitionRowVisualState(row);
  });
}

function isEmptyPartition(partition) {
  const variety = formatPartitionSeedVariety(partition).trim();
  const seeds = Number(partition?.seedCount) || 0;
  const plantedRaw = String(partition?.plantedCount ?? "").trim();
  const planted = Number(plantedRaw);
  const hasGerminationData = plantedRaw !== "" && Number.isFinite(planted) && planted > 0;
  return !variety && seeds === 0 && !hasGerminationData;
}

function getPartitionGerminationDisplay(partition) {
  if (isEmptyPartition(partition)) {
    return { label: "Empty", className: "is-muted" };
  }

  const plantedRaw = String(partition?.plantedCount ?? "").trim();
  if (plantedRaw === "") {
    return { label: "Not germinated yet", className: "" };
  }

  return { label: plantedRaw, className: "" };
}

function getPartitionSuccessDisplay(partition) {
  if (isEmptyPartition(partition)) {
    return { label: "Empty", className: "is-muted" };
  }

  return {
    label: formatSuccessPercent(partition.seedCount, partition.plantedCount),
    className: "",
  };
}

function attachPartitionValidation(form, formMessage) {
  const rows = form.querySelectorAll(".partition-row");
  rows.forEach((row) => {
    row.querySelectorAll("input, select").forEach((field) => {
      const eventName = field.tagName === "SELECT" ? "change" : "input";
      field.addEventListener(eventName, () => {
        captureFirstPlantedEventForForm(form);
        syncSessionStatusControlDatasets(form.elements.sessionStatus, {
          germinationStartedAt: form.dataset.germinationStartedAt || "",
          firstPlantedAt: form.dataset.firstPlantedAt || "",
          completedAt: form.dataset.completedAt || "",
        });
        updateSessionStatusAppearance(
          form.elements.sessionStatus,
          form.querySelector("#session-status-trigger"),
        );
        validatePartitionRow(row);
        updateSessionSuccessSummary(form, form.querySelector("#session-success-summary"));
        updatePartitionProgressChart(
          getPartitionProgressDataFromForm(form),
          form.querySelector("#partition-progress-chart"),
          form.querySelector("#partition-progress-section"),
        );
        updateRunProgressSummary(
          form.querySelector("#run-progress-summary"),
          form.querySelector("#run-progress-section"),
          form.elements.sessionStatus?.value,
          getPartitionProgressDataFromForm(form),
        );
        updateSessionLifecycleTimeline(
          form.querySelector("#session-lifecycle-summary"),
          form.querySelector("#session-lifecycle-section"),
          buildFormLifecycleState(form),
        );
        if (formMessage.textContent) {
          const validation = validatePartitions(form, { showMessage: false });
          if (validation.isValid) {
            formMessage.textContent = "";
          }
        }
      });
      field.addEventListener("blur", () => {
        captureFirstPlantedEventForForm(form);
        syncSessionStatusControlDatasets(form.elements.sessionStatus, {
          germinationStartedAt: form.dataset.germinationStartedAt || "",
          firstPlantedAt: form.dataset.firstPlantedAt || "",
          completedAt: form.dataset.completedAt || "",
        });
        updateSessionStatusAppearance(
          form.elements.sessionStatus,
          form.querySelector("#session-status-trigger"),
        );
        validatePartitionRow(row);
        updateSessionSuccessSummary(form, form.querySelector("#session-success-summary"));
        updatePartitionProgressChart(
          getPartitionProgressDataFromForm(form),
          form.querySelector("#partition-progress-chart"),
          form.querySelector("#partition-progress-section"),
        );
        updateRunProgressSummary(
          form.querySelector("#run-progress-summary"),
          form.querySelector("#run-progress-section"),
          form.elements.sessionStatus?.value,
          getPartitionProgressDataFromForm(form),
        );
        updateSessionLifecycleTimeline(
          form.querySelector("#session-lifecycle-summary"),
          form.querySelector("#session-lifecycle-section"),
          buildFormLifecycleState(form),
        );
      });
    });

    validatePartitionRow(row);
  });

  updateSessionSuccessSummary(form, form.querySelector("#session-success-summary"));
  updatePartitionProgressChart(
    getPartitionProgressDataFromForm(form),
    form.querySelector("#partition-progress-chart"),
    form.querySelector("#partition-progress-section"),
  );
  updateRunProgressSummary(
    form.querySelector("#run-progress-summary"),
    form.querySelector("#run-progress-section"),
    form.elements.sessionStatus?.value,
    getPartitionProgressDataFromForm(form),
  );
  updateSessionLifecycleTimeline(
    form.querySelector("#session-lifecycle-summary"),
    form.querySelector("#session-lifecycle-section"),
    buildFormLifecycleState(form),
  );
}

async function renderSystemLayoutReference(container, systemType) {
  if (!container) {
    return;
  }

  container.dataset.pendingSystem = systemType;

  if (SYSTEM_LAYOUT_ASSETS[systemType]) {
    const markup = await buildSystemLayoutImage(systemType);
    if (container.dataset.pendingSystem === systemType) {
      container.innerHTML = markup;
      attachSystemLayoutReady(container);
    }
    return;
  }

  if (container.dataset.pendingSystem === systemType) {
    container.innerHTML = buildSystemLayoutPlaceholder(systemType);
  }
}

async function buildSystemLayoutImage(systemType) {
  const svgMarkup = await getInlineSvgMarkup(systemType);
  const content = svgMarkup || `
    <object
      class="system-layout-object"
      data="${SYSTEM_LAYOUT_ASSETS[systemType]}"
      type="image/svg+xml"
      aria-label="${systemType} system layout"
    ></object>
  `;
  return `
    <div class="system-layout-image system-layout-image-${systemType.toLowerCase()}" data-system-layout="${systemType}">
      ${content}
    </div>
  `;
}

function getPartitionCountForSystem(systemType) {
  if (systemType === "TRA") {
    return 16;
  }

  return 8;
}

function createPartitionsForSystem(systemType) {
  return Array.from({ length: getPartitionCountForSystem(systemType) }, (_, index) => ({
    id: index + 1,
    seedVariety: "",
    source: "",
    breeder: "",
    seedType: "",
    feminized: "",
    seedCount: 0,
    plantedCount: "",
  }));
}

function applySessionStatusLayout(chartShell, chartHeader, partitionContainer, sessionStatus) {
  if (!chartShell || !chartHeader || !partitionContainer) {
    return;
  }

  const normalizedStatus = normalizeSessionStatus(sessionStatus);
  chartShell.dataset.sessionStatus = normalizedStatus;
  chartHeader.dataset.sessionStatus = normalizedStatus;
  partitionContainer.dataset.sessionStatus = normalizedStatus;
  applyPlantedColumnDebugStyles(chartHeader, partitionContainer, normalizedStatus);
}

function applyPlantedColumnDebugStyles(chartHeader, partitionContainer, sessionStatus) {
  const isVisible = sessionStatus === "germinating" || sessionStatus === "completed";
  const isDarkTheme = document.body.classList.contains("theme-dark");
  const headerCell = chartHeader.querySelector("span:nth-child(6)");
  const plantedCells = [...partitionContainer.querySelectorAll('.partition-row label:has(input[name="plantedCount"])')];
  const plantedInputs = [...partitionContainer.querySelectorAll('input[name="plantedCount"]')];

  if (headerCell) {
    if (isVisible) {
      headerCell.style.setProperty("background", "rgba(148, 209, 89, 0.12)", "important");
      headerCell.style.setProperty("color", "#5f8f2f", "important");
    } else {
      headerCell.style.removeProperty("background");
      headerCell.style.removeProperty("color");
    }
  }

  plantedCells.forEach((cell) => {
    if (isVisible) {
      cell.style.setProperty("background", isDarkTheme ? "rgba(148, 209, 89, 0.08)" : "rgba(148, 209, 89, 0.12)", "important");
      cell.style.borderRadius = "10px";
      cell.style.padding = "6px";
    } else {
      cell.style.removeProperty("background");
      cell.style.removeProperty("border-radius");
      cell.style.removeProperty("padding");
    }
  });

  plantedInputs.forEach((input) => {
    if (isVisible) {
      input.style.setProperty("border", "1px solid #94d159", "important");
      input.style.setProperty("background", isDarkTheme ? "#18201c" : "rgba(247, 252, 244, 0.96)", "important");
      input.style.setProperty("box-shadow", isDarkTheme ? "0 0 0 2px rgba(148, 209, 89, 0.14)" : "0 0 0 2px rgba(148, 209, 89, 0.18)", "important");
      if (isDarkTheme) {
        input.style.setProperty("color", "#f3f7f1", "important");
        input.style.setProperty("-webkit-text-fill-color", "#f3f7f1", "important");
        input.style.setProperty("caret-color", "#94d159", "important");
      } else {
        input.style.removeProperty("color");
        input.style.removeProperty("-webkit-text-fill-color");
        input.style.removeProperty("caret-color");
      }
    } else {
      input.style.removeProperty("border");
      input.style.removeProperty("background");
      input.style.removeProperty("box-shadow");
      input.style.removeProperty("color");
      input.style.removeProperty("-webkit-text-fill-color");
      input.style.removeProperty("caret-color");
    }
  });

  window.__plantedColumnDebug = {
    sessionStatus,
    headerSelector: "#partition-chart-header span:nth-child(6) or #detail-chart-header span:nth-child(6)",
    cellSelector: '.partition-row label:has(input[name="plantedCount"])',
    inputSelector: 'input[name="plantedCount"]',
    headerFound: Boolean(headerCell),
    cellCount: plantedCells.length,
    inputCount: plantedInputs.length,
  };
}

function normalizeSessionStatus(sessionStatus) {
  return sessionStatus || "unselected";
}

function getSessionStatusProgressKey(control) {
  if (!control) {
    return "";
  }

  const normalizedStatus = normalizeSessionStatus(control.value || "");
  if (normalizedStatus === "completed" || control.dataset.completedAt) {
    return "completed";
  }
  if (control.dataset.firstPlantedAt) {
    return "first-germinated";
  }
  if (normalizedStatus === "germinating" || control.dataset.germinationStartedAt) {
    return "germination";
  }
  if (normalizedStatus === "soaking") {
    return "soaking";
  }
  return "";
}

function updateSessionStatusAppearance(control, trigger) {
  if (!control && !trigger) {
    return;
  }

  const value = control?.value || "";
  const normalizedStatus = normalizeSessionStatus(value);
  const progressKey = getSessionStatusProgressKey(control);
  const stageOrder = ["soaking", "germination", "first-germinated", "completed"];
  const currentStageIndex = stageOrder.indexOf(progressKey);
  const nextStageIndex = progressKey ? Math.min(currentStageIndex + 1, stageOrder.length - 1) : 0;
  const panel = control?.closest(".session-status-panel") || trigger?.closest(".session-status-panel");
  const currentValueElement = panel?.querySelector(".session-status-current-value");

  if (control) {
    control.dataset.sessionStatus = normalizedStatus;
  }

  panel?.setAttribute("data-session-status", normalizedStatus);
  panel?.setAttribute("data-session-progress", progressKey || "unselected");

  if (currentValueElement) {
    currentValueElement.textContent = getSessionProgressDisplayLabel(progressKey, value);
  }

  panel?.querySelectorAll("[data-stage-step]").forEach((stepElement) => {
    const stepKey = stepElement.dataset.stageStep;
    const stepIndex = stageOrder.indexOf(stepKey);
    const isCurrent = Boolean(progressKey) && stepKey === progressKey;
    const isComplete = currentStageIndex > -1 && stepIndex < currentStageIndex;
    const isNext = !isCurrent && !isComplete && stepIndex === nextStageIndex;

    stepElement.classList.toggle("is-current", isCurrent);
    stepElement.classList.toggle("is-complete", isComplete);
    stepElement.classList.toggle("is-next", isNext);
  });

  if (trigger) {
    trigger.dataset.sessionStatus = normalizedStatus;
    trigger.textContent = getSessionStageButtonLabel(value);
  }
}

  function updateSessionStatusReminder(element, sessionDate, sessionTime, sessionStatus, germinationStartedAt = "") {
  if (!element) {
    return;
  }

  element.classList.remove("is-guidance", "is-warning");
  const normalizedStatus = normalizeSessionStatus(sessionStatus);

    if (normalizedStatus === "unselected") {
      element.textContent = "";
      return;
    }

  if (!["soaking", "germinating"].includes(normalizedStatus)) {
    element.textContent = "";
    return;
  }

  const reminder = getActiveStageReminder(sessionDate, sessionTime, normalizedStatus, germinationStartedAt);
  if (!reminder) {
    element.textContent = "";
    return;
  }

  element.textContent = reminder.message;
  element.classList.add(reminder.level === "critical" ? "is-warning" : "is-guidance");
}

  function validateSessionStatus(control, errorElement) {
    const isValid = Boolean(control?.value);
    if (isValid) {
      clearSessionStatusError(control, errorElement);
      return true;
    }

    const trigger = document.querySelector("#session-status-trigger, #detail-session-status-trigger");
    trigger?.classList.add("is-invalid");
    if (errorElement) {
      errorElement.textContent = "Please select a growth stage before saving.";
    }
    return false;
  }

  function clearSessionStatusError(control, errorElement) {
    control?.classList.remove("is-invalid");
    document.querySelector("#session-status-trigger, #detail-session-status-trigger")?.classList.remove("is-invalid");
    if (errorElement) {
      errorElement.textContent = "";
    }
  }

function getActiveStageReminder(sessionDate, sessionTime, sessionStatus, germinationStartedAt = "") {
  const schedule = STAGE_REMINDER_SCHEDULES[sessionStatus];
  if (!schedule?.length) {
    return null;
  }

  const stageStart = getStageStartDateTime(sessionDate, sessionTime, sessionStatus, germinationStartedAt);
  if (!stageStart) {
    return null;
  }

  const elapsedHours = Math.max(0, (Date.now() - stageStart.getTime()) / (60 * 60 * 1000));
  let activeReminder = schedule[0];
  for (const reminder of schedule) {
    if (elapsedHours >= reminder.hours) {
      activeReminder = reminder;
      continue;
    }

    if (activeReminder.hours > elapsedHours) {
      activeReminder = reminder;
    }
    break;
  }

  return activeReminder;
}

function getStageStartDateTime(sessionDate, sessionTime, sessionStatus, germinationStartedAt = "") {
  if (sessionStatus === "germinating") {
    return parseCompletedAtValue(germinationStartedAt) || parseSessionStartDateTime(sessionDate, sessionTime);
  }

  return parseSessionStartDateTime(sessionDate, sessionTime);
}

function parseSessionStartDateTime(sessionDate, sessionTime) {
  if (!sessionDate) {
    return null;
  }

  const safeTime = sessionTime || "00:00";
  const parsedDate = new Date(`${sessionDate}T${safeTime}:00`);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

function formatPartitionSeedVariety(partition) {
  return String(partition?.seedVariety || "").trim();
}

function formatPartitionSource(partition) {
  const source = String(partition?.source || "").trim();
  if (source) {
    return source;
  }

  return String(partition?.breeder || "").trim();
}

function buildFinalSessionName(inputName, firstPartition, sessionDate) {
  const manualName = String(inputName || "").trim();
  const partitionName = formatPartitionSeedVariety(firstPartition || {});
  const baseName = manualName || partitionName || "Session";
  return `${baseName} - ${formatSessionNameDate(sessionDate)}`;
}

function formatSessionNameDate(sessionDate) {
  if (!sessionDate) {
    return "Unknown date";
  }

  const parsedDate = new Date(`${sessionDate}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) {
    return sessionDate;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
}

function buildSystemLayoutPlaceholder(systemType) {
  const label = systemType === "TRA" ? "TRA layout reference coming next" : "Choose a system type";
  return `
    <div class="layout-reference-copy">
      <p>${label}</p>
    </div>
    <div class="layout-placeholder" aria-label="${label}">
      <span>${systemType || "System"}</span>
    </div>
  `;
}

async function getInlineSvgMarkup(systemType) {
  if (inlineSvgCache[systemType]) {
    return inlineSvgCache[systemType];
  }

  try {
    const response = await fetch(SYSTEM_LAYOUT_ASSETS[systemType]);
    const svgMarkup = normalizeInlineSvgMarkup(await response.text());
    inlineSvgCache[systemType] = svgMarkup;
    return svgMarkup;
  } catch {
    return "";
  }
}

function normalizeInlineSvgMarkup(svgMarkup) {
  return svgMarkup
    .replace(/<\?xml[\s\S]*?\?>\s*/i, "")
    .replace(/<!DOCTYPE[\s\S]*?>\s*/i, "")
    .trim();
}

function bindPartitionRowHighlighting(form) {
  if (form.dataset.partitionHighlightBound === "true") {
    return;
  }

  form.addEventListener("focusin", (event) => {
    const row = event.target.closest(".partition-row");
    if (row) {
      setActiveSystemLayoutPartition(form, row.dataset.partitionId);
    }
  });

  form.addEventListener("click", (event) => {
    const row = event.target.closest(".partition-row");
    if (row) {
      if (!event.target.closest("input, select, option")) {
        row.focus({ preventScroll: true });
      }
      setActiveSystemLayoutPartition(form, row.dataset.partitionId);
    }
  });

  form.addEventListener("focusout", () => {
    window.setTimeout(() => {
      const activeRow = document.activeElement?.closest(".partition-row");
      if (activeRow && form.contains(activeRow)) {
        setActiveSystemLayoutPartition(form, activeRow.dataset.partitionId);
        return;
      }

      clearActiveSystemLayout(form);
    }, 0);
  });

  form.dataset.partitionHighlightBound = "true";
}

function setActiveSystemLayoutPartition(scope, partitionId) {
  const nodes = getSystemLayoutNodes(scope);
  if (!nodes.length || !partitionId) {
    return;
  }

  const activeSection = getTraSectionForPartition(partitionId);
  nodes.forEach((node) => {
    const isActive = node.dataset.partition === String(partitionId);
    const isSectionActive = !isActive && node.dataset.section && node.dataset.section === activeSection;
    applySystemLayoutNodeState(node, { isActive, isSectionActive });
  });

  updatePartitionDebugState(scope, {
    activePartition: String(partitionId),
    activeSection,
    nodeCount: nodes.length,
  });
}

function clearActiveSystemLayout(scope) {
  getSystemLayoutNodes(scope).forEach((node) => {
    applySystemLayoutNodeState(node, { isActive: false, isSectionActive: false });
  });
  updatePartitionDebugState(scope, {
    activePartition: "",
    activeSection: "",
    nodeCount: getSystemLayoutNodes(scope).length,
  });
}

function getSystemLayoutNodes(scope) {
  const layout = scope.querySelector("[data-system-layout]");
  if (!layout) {
    return [];
  }

  const inlineNodes = [...layout.querySelectorAll(".partition-node")];
  if (inlineNodes.length) {
    return inlineNodes;
  }

  const objectElement = layout.querySelector(".system-layout-object");
  if (!objectElement?.contentDocument) {
    return [];
  }

  return [...objectElement.contentDocument.querySelectorAll(".partition-node")];
}

function attachSystemLayoutReady(container) {
  const objectElement = container.querySelector(".system-layout-object");
  if (!objectElement) {
    updatePartitionDebugState(container, {
      renderMode: "inline",
      nodeCount: getSystemLayoutNodes(container).length,
    });
    return;
  }

  objectElement.addEventListener("load", () => {
    const form = container.closest("form");
    const activeRow = form?.querySelector(".partition-row:focus-within");
    updatePartitionDebugState(container, {
      renderMode: "object",
      nodeCount: getSystemLayoutNodes(container).length,
    });
    if (activeRow) {
      setActiveSystemLayoutPartition(form, activeRow.dataset.partitionId);
    }
  }, { once: true });
}

function applySystemLayoutNodeState(node, state) {
  node.classList.toggle("is-active", state.isActive);
  node.classList.toggle("section-active", state.isSectionActive);

  if (state.isActive) {
    Object.entries(ACTIVE_PARTITION_STYLE).forEach(([property, value]) => {
      node.style[property] = value;
    });
    return;
  }

  if (state.isSectionActive) {
    node.style.removeProperty("fill");
    node.style.stroke = ACTIVE_SECTION_STYLE.stroke;
    node.style.strokeWidth = ACTIVE_SECTION_STYLE.strokeWidth;
    node.style.removeProperty("filter");
    return;
  }

  node.style.removeProperty("fill");
  node.style.removeProperty("stroke");
  node.style.removeProperty("stroke-width");
  node.style.removeProperty("filter");
}

function updatePartitionDebugState(scope, values) {
  window.__partitionLayoutDebug = {
    ...(window.__partitionLayoutDebug || {}),
    ...values,
  };

  const layout = scope.querySelector?.("[data-system-layout]") || scope.closest?.("[data-system-layout]");
  if (!layout) {
    return;
  }

  if ("activePartition" in values) {
    layout.dataset.activePartition = values.activePartition;
  }
  if ("activeSection" in values) {
    layout.dataset.activeSection = values.activeSection;
  }
  if ("nodeCount" in values) {
    layout.dataset.nodeCount = String(values.nodeCount);
  }
  if ("renderMode" in values) {
    layout.dataset.renderMode = values.renderMode;
  }
}

function getTraSectionForPartition(partitionId) {
  const number = Number(partitionId);
  if (number >= 1 && number <= 4) {
    return "A";
  }
  if (number >= 5 && number <= 8) {
    return "B";
  }
  if (number >= 9 && number <= 12) {
    return "C";
  }
  if (number >= 13 && number <= 16) {
    return "D";
  }
  return "";
}

function validatePartitions(form, options = { showMessage: false }) {
  const rows = [...form.querySelectorAll(".partition-row")];
  let firstInvalidField = null;

  rows.forEach((row) => {
    const result = validatePartitionRow(row);
    if (!result.isValid && !firstInvalidField) {
      firstInvalidField = result.firstInvalidField;
    }
  });

  return {
    isValid: !firstInvalidField,
    firstInvalidField,
  };
}

function validatePartitionRow(row) {
  const sourceInput = row.querySelector('input[name^="source-"]');
  const varietyInput = row.querySelector('input[name^="seedVariety-"]');
  const typeSelect = row.querySelector('select[name^="seedType-"]');
  const sexSelect = row.querySelector('select[name^="feminized-"]');
  const seedInput = row.querySelector('input[name^="seedCount-"]');
  const plantedInput = row.querySelector('input[name="plantedCount"]');
  const varietyLabel = varietyInput.closest("label");
  const typeLabel = typeSelect.closest("label");
  const sexLabel = sexSelect.closest("label");
  const seedLabel = seedInput.closest("label");
  const plantedLabel = plantedInput.closest("label");

  const sourceValue = sourceInput.value.trim();
  const varietyValue = varietyInput.value.trim();
  const typeValue = typeSelect.value;
  const sexValue = sexSelect.value;
  const seedValue = seedInput.value.trim();
  const plantedValue = plantedInput.value.trim();
  const successOutput = row.querySelector("[data-success-output]");
  const hasSeedCount = seedValue !== "";
  const hasPlantedCount = plantedValue !== "";
  const seedNumber = Number(seedValue);
  const plantedNumber = Number(plantedValue);
  const seedCountValid = hasSeedCount && seedNumber > 0;
  const plantedCountValid = !hasPlantedCount || (Number.isFinite(plantedNumber) && plantedNumber >= 0 && seedCountValid && plantedNumber <= seedNumber);

  const rowStarted = Boolean(sourceValue || varietyValue || typeValue || sexValue || hasSeedCount || hasPlantedCount);
  const fieldsComplete = Boolean(varietyValue && typeValue && sexValue && seedCountValid && plantedCountValid);
  const rowInvalid = (rowStarted && !fieldsComplete) || !plantedCountValid;
  const sessionStatus = row.closest(".partition-table")?.dataset.sessionStatus || row.closest("form")?.dataset.currentStage || "";
  const normalizedSessionStatus = normalizeSessionStatus(sessionStatus);
  const rowState = getPartitionRowState({
    sourceValue,
    varietyValue,
    typeValue,
    sexValue,
    seedValue,
    plantedValue,
  }, sessionStatus);

  row.classList.toggle("partition-row--filled", rowStarted);
  row.classList.toggle("row--completed", fieldsComplete);
  row.classList.toggle("row-has-warning", rowInvalid);
  row.classList.toggle("row-complete", normalizedSessionStatus === "completed" && rowStarted);
  row.classList.toggle("row-completed-empty", normalizedSessionStatus === "completed" && !rowStarted);
  updatePartitionButtonState(row, rowState);
  applyPartitionRowVisualState(row);

  varietyLabel.classList.toggle("field-has-warning", rowInvalid && !varietyValue);
  typeLabel.classList.toggle("field-has-warning", rowInvalid && !typeValue);
  sexLabel.classList.toggle("field-has-warning", rowInvalid && !sexValue);
  seedLabel.classList.toggle("field-has-warning", rowInvalid && !seedCountValid);
  plantedLabel.classList.toggle("field-has-warning", !plantedCountValid);

  typeSelect.classList.toggle("is-missing", rowInvalid && !typeValue);
  sexSelect.classList.toggle("is-missing", rowInvalid && !sexValue);
  varietyInput.classList.toggle("is-missing", rowInvalid && !varietyValue);
  seedInput.classList.toggle("is-missing", rowInvalid && !seedCountValid);
  plantedInput.classList.toggle("is-missing", !plantedCountValid);
  syncCustomSelect(typeSelect);
  syncCustomSelect(sexSelect);
  if (successOutput) {
    successOutput.textContent = formatSuccessPercent(
      hasSeedCount ? seedNumber : "",
      hasPlantedCount ? plantedNumber : "",
    );
  }

  let firstInvalidField = null;
  if (rowInvalid) {
    firstInvalidField = varietyValue ? null : varietyInput;
    if (!firstInvalidField && !typeValue) {
      firstInvalidField = getCustomSelectTrigger(typeSelect) || typeSelect;
    }
    if (!firstInvalidField && !sexValue) {
      firstInvalidField = getCustomSelectTrigger(sexSelect) || sexSelect;
    }
    if (!firstInvalidField && !seedCountValid) {
      firstInvalidField = seedInput;
    }
    if (!firstInvalidField && !plantedCountValid) {
      firstInvalidField = plantedInput;
    }
  }

  return {
    isValid: !rowInvalid,
    firstInvalidField,
  };
}

function formatSuccessPercent(seedCount, plantedCount) {
  const seeds = Number(seedCount);
  const planted = Number(plantedCount);

  if (!Number.isFinite(seeds) || !Number.isFinite(planted) || seeds <= 0) {
    return "";
  }

  if (planted < 0 || planted > seeds) {
    return "";
  }

  return `${Math.round((planted / seeds) * 100)}%`;
}

function updateSessionSuccessSummary(form, summaryElement) {
  if (!form || !summaryElement) {
    return;
  }

  const rows = [...form.querySelectorAll(".partition-row")];
  const totals = rows.reduce((accumulator, row) => {
    const seedValue = row.querySelector('input[name^="seedCount-"]')?.value.trim() || "";
    const plantedValue = row.querySelector('input[name="plantedCount"]')?.value.trim() || "";
    const seeds = Number(seedValue);
    const planted = Number(plantedValue);

    if (Number.isFinite(seeds) && seeds > 0) {
      accumulator.totalSeeds += seeds;
    }

    if (Number.isFinite(planted) && planted >= 0) {
      accumulator.totalPlanted += planted;
    }

    return accumulator;
  }, { totalSeeds: 0, totalPlanted: 0 });

  if (totals.totalSeeds <= 0) {
    summaryElement.textContent = "";
    summaryElement.hidden = true;
    return;
  }

  const successRate = Math.round((totals.totalPlanted / totals.totalSeeds) * 100);
  summaryElement.textContent = `Session Success: ${successRate}% (${totals.totalPlanted} / ${totals.totalSeeds})`;
  summaryElement.hidden = false;
}

function getPartitionProgressDataFromForm(form) {
  return [...form.querySelectorAll(".partition-row")].map((row, index) => ({
    id: Number(row.dataset.partitionId) || index + 1,
    seedCount: Number(row.querySelector('input[name^="seedCount-"]')?.value) || 0,
    plantedCount: Number(row.querySelector('input[name="plantedCount"]')?.value) || 0,
  }));
}

function updatePartitionProgressChart(partitions, chartElement, sectionElement) {
  if (!chartElement || !sectionElement) {
    return;
  }

  const items = (partitions || []).filter((partition) => (
    Number(partition.seedCount) > 0 || Number(partition.plantedCount) > 0
  ));

  if (!items.length) {
    chartElement.innerHTML = "";
    sectionElement.hidden = true;
    return;
  }

  sectionElement.hidden = false;
  chartElement.innerHTML = items.map((partition) => {
    const seeds = Number(partition.seedCount) || 0;
    const planted = Math.min(Number(partition.plantedCount) || 0, seeds || Number(partition.plantedCount) || 0);
    const plantedPercentage = seeds > 0 ? Math.max(0, Math.min(100, (planted / seeds) * 100)) : 0;
    const plantedPercentageLabel = seeds > 0 ? `${Math.round(plantedPercentage)}%` : "0%";

    return `
      <div class="progress-chart-row">
        <div class="progress-chart-label">P${partition.id} <span class="progress-chart-percent">(${plantedPercentageLabel})</span></div>
        <div class="progress-bar-track" aria-label="Partition ${partition.id} planting progress">
          <div class="progress-bar-total" style="width: 100%"></div>
          <div class="progress-bar-fill" style="width: ${plantedPercentage}%"></div>
        </div>
      <div class="progress-chart-values">${planted} / ${seeds}</div>
      </div>
    `;
  }).join("");
}

function updateSessionTimingSummary(summaryElement, sectionElement, sessionDate, sessionTime, sessionStatus, completedAt = "") {
  if (!summaryElement || !sectionElement) {
    return;
  }

  const startedAt = parseSessionStartDateTime(sessionDate, sessionTime);
  if (!startedAt) {
    summaryElement.innerHTML = "";
    sectionElement.hidden = true;
    return;
  }

  const normalizedStatus = normalizeSessionStatus(sessionStatus);
  const completedDate = normalizedStatus === "completed"
    ? parseCompletedAtValue(completedAt) || new Date()
    : null;
  const durationTarget = completedDate || new Date();

  summaryElement.innerHTML = `
    <article class="timing-card timing-card-started">
      <strong>Started</strong>
      <p>${formatTimingDateTime(startedAt)}</p>
    </article>
    ${completedDate ? `
      <article class="timing-card">
        <strong>Completed On</strong>
        <p>${formatTimingDateTime(completedDate)}</p>
      </article>
      <article class="timing-card">
        <strong>Total Duration</strong>
        <p>${formatDurationBetween(startedAt, completedDate)}</p>
      </article>
    ` : `
      <article class="timing-card timing-card-elapsed">
        <strong>Elapsed Time</strong>
        <p>${formatDurationBetween(startedAt, durationTarget)}</p>
      </article>
    `}
  `;
  sectionElement.hidden = false;
}

function updateRunProgressSummary(summaryElement, sectionElement, sessionStatus, partitions) {
  if (!summaryElement || !sectionElement) {
    return;
  }

  const totals = (partitions || []).reduce((accumulator, partition) => {
    const seeds = Number(partition.seedCount) || 0;
    const planted = Number(partition.plantedCount) || 0;
    accumulator.totalSeeds += Math.max(0, seeds);
    accumulator.totalPlanted += Math.max(0, planted);
    return accumulator;
  }, { totalSeeds: 0, totalPlanted: 0 });

  if (totals.totalSeeds <= 0) {
    summaryElement.innerHTML = "";
    sectionElement.hidden = true;
    return;
  }

  const progressPercent = Math.max(0, Math.min(100, Math.round((totals.totalPlanted / totals.totalSeeds) * 100)));
  const progressGradient = getRunProgressGradient(progressPercent);
  sectionElement.hidden = false;
  summaryElement.innerHTML = `
    <div class="run-progress-meta">
      <strong>${totals.totalPlanted} / ${totals.totalSeeds} germinated</strong>
      <span>${progressPercent}%</span>
    </div>
    <div class="run-progress-track" aria-label="Run progress">
      <div class="run-progress-fill" style="width: ${progressPercent}%; background: ${progressGradient};"></div>
    </div>
  `;
}

function getRunProgressGradient(progressPercent) {
  return "linear-gradient(90deg, #c2410c 0%, #f59e0b 35%, #84cc16 65%, #166534 100%)";
}

function updateSessionLifecycleTimeline(summaryElement, sectionElement, state) {
  if (!summaryElement || !sectionElement) {
    return;
  }

  if (!state.startedAt && !state.showEmptyTimeline) {
    summaryElement.innerHTML = "";
    sectionElement.hidden = true;
    return;
  }

  const events = [
    { label: "SOAKING", timestamp: state.startedAt, tone: "soaking", complete: Boolean(state.startedAt) },
    { label: "GERMINATION STARTED", timestamp: state.germinationStartedAt, tone: "germination", complete: Boolean(state.germinationStartedAt) },
    { label: "FIRST GERMINATED", timestamp: state.firstPlantedAt, tone: "green", complete: Boolean(state.firstPlantedAt) },
    { label: "COMPLETED", timestamp: state.completedAt, tone: "completed", complete: Boolean(state.completedAt) },
  ];

  summaryElement.innerHTML = `
    <div class="lifecycle-bar">
      ${events.map((event) => `
        <span class="lifecycle-segment lifecycle-${event.tone} ${event.complete ? "is-complete" : ""}"></span>
      `).join("")}
    </div>
    <div class="lifecycle-events">
      ${events.map((event) => `
        <article class="lifecycle-event lifecycle-event-${event.tone} ${event.complete ? "is-complete" : ""}">
          <strong>${event.label}</strong>
          <p>${event.timestamp ? formatTimingDateTime(event.timestamp) : "Not recorded yet"}</p>
        </article>
      `).join("")}
    </div>
  `;
  sectionElement.hidden = false;
}

function buildFormLifecycleState(form) {
  const normalizedStatus = normalizeSessionStatus(form.dataset.currentStage || form.elements.sessionStatus?.value || "");
  if (normalizedStatus === "unselected") {
    return {
      showEmptyTimeline: true,
      startedAt: null,
      germinationStartedAt: null,
      firstPlantedAt: null,
      completedAt: null,
    };
  }

  return {
    showEmptyTimeline: false,
    startedAt: parseSessionStartDateTime(form.elements.date.value, form.elements.time.value),
    germinationStartedAt: parseCompletedAtValue(form.dataset.germinationStartedAt || ""),
    firstPlantedAt: parseCompletedAtValue(form.dataset.firstPlantedAt || ""),
    completedAt: parseCompletedAtValue(form.dataset.completedAt || ""),
  };
}

function buildSessionLifecycleState(session) {
  return {
    showEmptyTimeline: false,
    startedAt: parseSessionStartDateTime(session.date, session.time),
    germinationStartedAt: parseCompletedAtValue(session.germinationStartedAt || ""),
    firstPlantedAt: parseCompletedAtValue(session.firstPlantedAt || ""),
    completedAt: parseCompletedAtValue(session.completedAt || ""),
  };
}

function captureFirstPlantedEventForForm(form) {
  if (form.dataset.firstPlantedAt) {
    return;
  }

  const hasPlantedValue = getPartitionProgressDataFromForm(form)
    .some((partition) => Number(partition.plantedCount) > 0);
  if (hasPlantedValue) {
    form.dataset.firstPlantedAt = new Date().toISOString();
  }
}

function captureFirstPlantedEventForSession(session) {
  if (session.firstPlantedAt) {
    return;
  }

  const hasPlantedValue = (session.partitions || [])
    .some((partition) => Number(partition.plantedCount) > 0);
  if (hasPlantedValue) {
    session.firstPlantedAt = new Date().toISOString();
  }
}

function syncSessionPartitionsFromContainer(session, container) {
  if (!session || !container) {
    return;
  }

  session.partitions = [...container.querySelectorAll(".partition-row")].map((row, index) => {
    const existingPartition = session.partitions?.[index] || {};
    return {
      id: Number(row.dataset.partitionId) || existingPartition.id || index + 1,
      source: row.querySelector('input[name^="source-"]')?.value.trim() || "",
      seedVariety: row.querySelector('input[name^="seedVariety-"]')?.value.trim() || "",
      breeder: existingPartition.breeder || "",
      seedType: row.querySelector('select[name^="seedType-"]')?.value || "",
      feminized: row.querySelector('select[name^="feminized-"]')?.value || "",
      seedCount: Number(row.querySelector('input[name^="seedCount-"]')?.value) || 0,
      plantedCount: row.querySelector('input[name="plantedCount"]')?.value.trim() || "",
    };
  });
}

function bindFormTimelineDebugTools(form, onUpdate) {
  const debugPanel = form.querySelector(".timeline-debug-panel");
  if (!debugPanel || debugPanel.dataset.bound === "true") {
    return;
  }

  debugPanel.addEventListener("click", (event) => {
    const action = event.target.closest("[data-debug-event]")?.dataset.debugEvent;
    if (!action) {
      return;
    }

    applyDebugEventToForm(form, action);
    onUpdate?.(action);
  });

  debugPanel.dataset.bound = "true";
}

function bindSessionTimelineDebugTools(scope, onUpdate) {
  const debugPanel = scope.querySelector(".timeline-debug-panel");
  if (!debugPanel || debugPanel.dataset.bound === "true") {
    return;
  }

  debugPanel.addEventListener("click", (event) => {
    const action = event.target.closest("[data-debug-event]")?.dataset.debugEvent;
    if (!action) {
      return;
    }

    onUpdate?.(action);
  });

  debugPanel.dataset.bound = "true";
}

function applyDebugEventToForm(form, action) {
  const stageField = form.elements.sessionStatus;
  const firstSeedInput = form.querySelector('input[name^="seedCount-"]');
  const firstPlantedInput = form.querySelector('input[name="plantedCount"]');

  if (action === "reset") {
    delete form.dataset.germinationStartedAt;
    delete form.dataset.firstPlantedAt;
    delete form.dataset.completedAt;
    stageField.value = "";
    if (firstPlantedInput) {
      firstPlantedInput.value = "";
    }
    return;
  }

  if (action === "germination") {
    if (!form.dataset.germinationStartedAt) {
      form.dataset.germinationStartedAt = new Date().toISOString();
    }
    stageField.value = "germinating";
    form.dataset.currentStage = "germinating";
    return;
  }

  if (action === "first-planted") {
    if (!form.dataset.germinationStartedAt) {
      form.dataset.germinationStartedAt = new Date().toISOString();
    }
    if (!form.dataset.firstPlantedAt) {
      form.dataset.firstPlantedAt = new Date().toISOString();
    }
    stageField.value = "germinating";
    form.dataset.currentStage = "germinating";
    if (firstSeedInput && !firstSeedInput.value) {
      firstSeedInput.value = "4";
    }
    if (firstPlantedInput && !firstPlantedInput.value) {
      firstPlantedInput.value = "1";
    }
    return;
  }

  if (action === "completed") {
    if (!form.dataset.germinationStartedAt) {
      form.dataset.germinationStartedAt = new Date().toISOString();
    }
    if (!form.dataset.firstPlantedAt) {
      form.dataset.firstPlantedAt = new Date().toISOString();
    }
    if (!form.dataset.completedAt) {
      form.dataset.completedAt = new Date().toISOString();
    }
    stageField.value = "completed";
    form.dataset.currentStage = "completed";
  }
}

function applyDebugEventToSession(session, stageField, action) {
  if (action === "reset") {
    session.germinationStartedAt = "";
    session.firstPlantedAt = "";
    session.completedAt = "";
    session.sessionStatus = "soaking";
    stageField.value = "soaking";
    return;
  }

  if (action === "germination") {
    if (!session.germinationStartedAt) {
      session.germinationStartedAt = new Date().toISOString();
    }
    session.sessionStatus = "germinating";
    stageField.value = "germinating";
    return;
  }

  if (action === "first-planted") {
    if (!session.germinationStartedAt) {
      session.germinationStartedAt = new Date().toISOString();
    }
    if (!session.firstPlantedAt) {
      session.firstPlantedAt = new Date().toISOString();
    }
    session.sessionStatus = "germinating";
    stageField.value = "germinating";
    return;
  }

  if (action === "completed") {
    if (!session.germinationStartedAt) {
      session.germinationStartedAt = new Date().toISOString();
    }
    if (!session.firstPlantedAt) {
      session.firstPlantedAt = new Date().toISOString();
    }
    if (!session.completedAt) {
      session.completedAt = new Date().toISOString();
    }
    session.sessionStatus = "completed";
    stageField.value = "completed";
  }
}

async function saveSessionUpdate(session) {
  try {
    const savedSession = await updateCloudSession(session);
    Object.assign(session, savedSession);
    return savedSession;
  } catch (error) {
    console.error("Failed to save session update", error);
    return null;
  }
}

function parseCompletedAtValue(completedAt) {
  if (!completedAt) {
    return null;
  }

  const parsedDate = new Date(completedAt);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

function formatTimingDateTime(value) {
  const datePart = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");
  const timePart = formatStoredTime(`${hours}:${minutes}`);
  return `${datePart} - ${timePart}`;
}

function formatSpotlightElapsed(startedAt) {
  if (!(startedAt instanceof Date) || Number.isNaN(startedAt.getTime())) {
    return "--";
  }

  let totalMinutes = Math.max(0, Math.floor((Date.now() - startedAt.getTime()) / 60000));
  if (totalMinutes < 60) {
    return `${totalMinutes} minute${totalMinutes === 1 ? "" : "s"}`;
  }

  const days = Math.floor(totalMinutes / (24 * 60));
  totalMinutes -= days * 24 * 60;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

function formatDurationBetween(startedAt, endedAt) {
  if (!(startedAt instanceof Date) || Number.isNaN(startedAt.getTime())) {
    return "";
  }

  if (!(endedAt instanceof Date) || Number.isNaN(endedAt.getTime())) {
    return "";
  }

  let totalMinutes = Math.max(0, Math.floor((endedAt.getTime() - startedAt.getTime()) / 60000));
  const days = Math.floor(totalMinutes / (24 * 60));
  totalMinutes -= days * 24 * 60;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const parts = [];

  if (days > 0) {
    parts.push(`${days} day${days === 1 ? "" : "s"}`);
  }
  if (hours > 0) {
    parts.push(`${hours} hour${hours === 1 ? "" : "s"}`);
  }
  if (minutes > 0 || !parts.length) {
    parts.push(`${minutes} minute${minutes === 1 ? "" : "s"}`);
  }

  return parts.slice(0, 2).join(" ");
}

function startSessionTimer(callback) {
  clearSessionTimerInterval();
  callback();
  sessionTimerInterval = window.setInterval(callback, 60 * 1000);
}

function clearSessionTimerInterval() {
  if (sessionTimerInterval) {
    window.clearInterval(sessionTimerInterval);
    sessionTimerInterval = null;
  }
}

function initializeTimeFormatField(form, initialTime = "") {
  const storedTimeField = form.elements.time;
  const displayTimeField = form.elements.timeDisplay;
  if (!storedTimeField || !displayTimeField) {
    return;
  }

  const preferredFormat = getPreferredTimeFormat();
  setTimeFormatButtons(form, preferredFormat);
  storedTimeField.value = initialTime || storedTimeField.value || "";
  displayTimeField.placeholder = preferredFormat === "12h" ? "7:04 PM" : "19:04";
  displayTimeField.value = formatStoredTime(storedTimeField.value, preferredFormat);

  form.querySelectorAll("[data-time-format]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextFormat = button.dataset.timeFormat;
      setPreferredTimeFormat(nextFormat);
      setTimeFormatButtons(form, nextFormat);
      displayTimeField.placeholder = nextFormat === "12h" ? "7:04 PM" : "19:04";
      if (storedTimeField.value) {
        displayTimeField.value = formatStoredTime(storedTimeField.value, nextFormat);
      }
    });
  });

  displayTimeField.addEventListener("input", () => {
    syncStoredTimeFromDisplay(form, { normalize: false, forceError: false });
  });

  displayTimeField.addEventListener("blur", () => {
    syncStoredTimeFromDisplay(form, { normalize: true, forceError: true });
  });
}

function syncStoredTimeFromDisplay(form, options = { normalize: false, forceError: false }) {
  const storedTimeField = form.elements.time;
  const displayTimeField = form.elements.timeDisplay;
  if (!storedTimeField || !displayTimeField) {
    return false;
  }

  const rawValue = displayTimeField.value.trim();
  if (!rawValue) {
    storedTimeField.value = "";
    if (options.forceError) {
      displayTimeField.setCustomValidity("Please enter a time.");
      displayTimeField.reportValidity();
    } else {
      displayTimeField.setCustomValidity("");
    }
    return false;
  }

  const parsedTime = parseDisplayTime(rawValue, getPreferredTimeFormat());
  if (!parsedTime) {
    storedTimeField.value = "";
    if (options.forceError) {
      displayTimeField.setCustomValidity(getPreferredTimeFormat() === "12h" ? "Enter time like 7:04 PM." : "Enter time like 19:04.");
      displayTimeField.reportValidity();
    } else {
      displayTimeField.setCustomValidity("");
    }
    return false;
  }

  storedTimeField.value = parsedTime;
  displayTimeField.setCustomValidity("");
  if (options.normalize) {
    displayTimeField.value = formatStoredTime(parsedTime, getPreferredTimeFormat());
  }
  return true;
}

function parseDisplayTime(value, format = getPreferredTimeFormat()) {
  const rawValue = String(value || "").trim();
  if (!rawValue) {
    return "";
  }

  if (format === "24h") {
    const match = rawValue.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
    if (!match) {
      return "";
    }

    const hours = String(match[1]).padStart(2, "0");
    return `${hours}:${match[2]}`;
  }

  const match = rawValue.match(/^(1[0-2]|0?[1-9]):([0-5]\d)\s*([AP]M)$/i);
  if (!match) {
    return "";
  }

  let hours = Number(match[1]);
  const minutes = match[2];
  const meridiem = match[3].toUpperCase();
  if (meridiem === "AM" && hours === 12) {
    hours = 0;
  } else if (meridiem === "PM" && hours !== 12) {
    hours += 12;
  }

  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

function formatStoredTime(value, format = getPreferredTimeFormat()) {
  const rawValue = String(value || "").trim();
  const match = rawValue.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!match) {
    return rawValue;
  }

  const hours = Number(match[1]);
  const minutes = match[2];
  if (format === "24h") {
    return `${match[1]}:${minutes}`;
  }

  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes} ${suffix}`;
}

function setTimeFormatButtons(form, format) {
  form.querySelectorAll("[data-time-format]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.timeFormat === format);
    button.setAttribute("aria-pressed", button.dataset.timeFormat === format ? "true" : "false");
  });
}

function getPreferredTimeFormat() {
  return localStorage.getItem(TIME_FORMAT_KEY) || detectDefaultTimeFormat();
}

function setPreferredTimeFormat(format) {
  localStorage.setItem(TIME_FORMAT_KEY, format);
}

function detectDefaultTimeFormat() {
  const hasDayPeriod = new Intl.DateTimeFormat(undefined, { hour: "numeric" })
    .formatToParts(new Date("2026-04-22T13:00:00"))
    .some((part) => part.type === "dayPeriod");
  return hasDayPeriod ? "12h" : "24h";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

if (document.body) {
  applyTheme(getPreferredTheme(), { persist: false });
}

window.addEventListener("error", (event) => {
  reportAppError(event.error || new Error(event.message || "Unknown script error"), "JavaScript Error");
});

window.addEventListener("unhandledrejection", (event) => {
  reportAppError(event.reason instanceof Error ? event.reason : new Error(String(event.reason || "Unhandled promise rejection")), "Unhandled Promise Rejection");
});

document.addEventListener("click", (event) => {
  const newSessionTrigger = event.target instanceof Element
    ? event.target.closest('a[href="#new"]')
    : null;

  if (newSessionTrigger instanceof HTMLAnchorElement) {
    event.preventDefault();
    appState.newSessionReturnHash = window.location.hash || "#home";
    openNewSessionSystemModal();
    return;
  }

  if (!(event.target instanceof Node) || !event.target.closest(".custom-select")) {
    closeAllCustomSelects();
  }

  if (!appState.accountMenuOpen) {
    return;
  }

  const menuRoot = document.querySelector("[data-account-menu-root]");
  if (menuRoot && event.target instanceof Node && menuRoot.contains(event.target)) {
    return;
  }

  closeAccountMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeAllCustomSelects();
  }

  if (event.key === "Escape" && appState.accountMenuOpen) {
    closeAccountMenu();
  }

  const target = event.target;
  const isTypingTarget = target instanceof HTMLElement && (
    target.matches("input, textarea, select")
    || target.isContentEditable
  );
  if (
    !isTypingTarget
    && event.shiftKey
    && String(event.key || "").toLowerCase() === "d"
    && canAccessMockDataControls()
  ) {
    event.preventDefault();
    setMockDataEnabledAndRefresh(!isMockDataEnabled());
  }
});

window.addEventListener("hashchange", safeRender);
window.addEventListener("DOMContentLoaded", safeBootstrapApp);
window.removeCannakanSampleSessions = removeSampleSessions;
