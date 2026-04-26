const STORAGE_KEY = "cannakan-grow-sessions";
const SAMPLE_SEED_KEY = "cannakan-grow-sample-seed-version";
const SAMPLE_SEED_VERSION = "history-preview-v2";
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
const SYSTEM_LAYOUT_ASSETS = {
  KAN: "Icons/KAN%20icon.svg",
  TRA: "Icons/TRA%20icon.svg",
};
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
  profile: null,
  profileError: "",
  authNotice: "",
  deletionPromptShown: false,
  accountMenuOpen: false,
  sessions: [],
  theme: "light",
  growthStage: null,
  growthStageModalOpen: false,
  growthStageModalDismissed: false,
  pendingGrowthStageInput: null,
  growthStageModalSuppressedUntil: 0,
};
let sessionTimerInterval = null;
const templates = {
  auth: document.querySelector("#auth-template"),
  setup: document.querySelector("#setup-template"),
  profile: document.querySelector("#profile-template"),
  home: document.querySelector("#home-template"),
  form: document.querySelector("#session-form-template"),
  sessions: document.querySelector("#sessions-template"),
  detail: document.querySelector("#session-detail-template"),
};

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

function closeAllCustomSelects(except = null) {
  document.querySelectorAll(".custom-select.is-open").forEach((wrapper) => {
    if (except && wrapper === except) {
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

  closeAllCustomSelects(wrapper);
  const trigger = wrapper.querySelector(".custom-select-trigger");
  const menu = wrapper.querySelector(".custom-select-menu");
  wrapper.classList.add("is-open");
  trigger?.setAttribute("aria-expanded", "true");
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

    if (select.dataset.customSelectBound === "true") {
      return;
    }

    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (select.disabled) {
        return;
      }

      if (wrapper.classList.contains("is-open")) {
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

  document.body.classList.toggle("theme-dark", normalizedTheme === "dark");
  document.body.dataset.theme = normalizedTheme;

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

function saveSessions(sessions) {
  appState.sessions = sortSessionsNewestFirst(sessions);
  if (!isSupabaseConfigured()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState.sessions));
  }
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
    sessionStatus: config.sessionStatus,
    germinationStartedAt: config.germinationStartedAt || "",
    firstPlantedAt: config.firstPlantedAt || "",
    completedAt: config.completedAt || "",
    createdAt: `${config.date}T${config.time}:00`,
    isSample: true,
    partitions: config.partitionSeeds.map((partition, index) => ({
      id: index + 1,
      seedVariety: partition[0],
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

function createDefaultPartitions() {
  return Array.from({ length: getPartitionCountForSystem("KAN") }, (_, index) => ({
    id: index + 1,
    seedVariety: "",
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

  const hash = window.location.hash || "#home";
  const [route] = hash.replace("#", "").split("/");
  const activeNav = route === "home" || !route ? "home" : "sessions";

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
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

async function handleAuthSession(session, options = { shouldRender: true }) {
  appState.authSession = session || null;
  appState.user = session?.user || null;
  appState.profile = null;
  appState.profileError = "";
  appState.deletionPromptShown = false;
  appState.accountMenuOpen = false;

  if (appState.user) {
    appState.profile = await ensureUserProfile(appState.user);
    const sessions = await loadUserSessions();
    saveSessions(sessions);
  } else if (isSupabaseConfigured()) {
    saveSessions([]);
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

async function deleteCloudSession(sessionId) {
  const existingSession = getSessions().find((item) => item.id === sessionId);
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

  saveSessions(getSessions().filter((item) => item.id !== sessionId));
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
    const card = document.createElement("article");
    card.className = "session-image-card";
    card.innerHTML = `
      <img src="${escapeHtml(image.previewUrl || image.url || "")}" alt="${escapeHtml(image.name || "Session image")}" class="session-image-thumb">
      <div class="session-image-meta">
        <span>${escapeHtml(image.name || "Session image")}</span>
        ${image.pending ? '<span class="session-image-badge">Pending</span>' : ""}
      </div>
      <button type="button" class="session-image-remove">Remove</button>
    `;

    card.querySelector(".session-image-remove")?.addEventListener("click", async () => {
      clearSessionImageMessage(state);
      if (image.pending) {
        URL.revokeObjectURL(image.previewUrl);
        state.pendingFiles = state.pendingFiles.filter((entry) => entry !== image);
        renderSessionImageGrid(state);
        return;
      }

      if (state.session) {
        try {
          await removeSessionImageFromStorage(image);
          state.images = state.images.filter((entry) => entry !== image);
          renderSessionImageGrid(state);
          await state.onImagesChange?.(state.images);
        } catch (error) {
          setSessionImageMessage(state, error.message || "Could not remove image.");
        }
        return;
      }

      state.images = state.images.filter((entry) => entry !== image);
      renderSessionImageGrid(state);
    });

    state.grid.appendChild(card);
  });

  state.onRender?.(allImages);
  renderSessionImageDots(state, allImages.length);
  updateSessionImageDotsFromScroll(state);
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

  const state = {
    scope,
    picker: options.picker,
    preview: options.preview,
    message: options.message,
    generateButton: options.generateButton || null,
    downloadButton: options.downloadButton || null,
    resetButton: options.resetButton || null,
    shareButton: options.shareButton || null,
    getSnapshotData: options.getSnapshotData,
    getImageEntries: options.getImageEntries,
    selectedImageKey: "",
    generatedBlob: null,
    generatedUrl: "",
  };

  scope.__snapshotState = state;
  renderSnapshotSourceSummary(state);
  setSnapshotMessage(state, "");
  setSnapshotPreview(state, null);

  state.generateButton?.addEventListener("click", async () => {
    await generateSnapshotPreview(state);
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

    const shared = await shareSnapshotBlob(result.blob, result.fileName, result.summaryText);
    if (!shared) {
      setSnapshotMessage(state, "Sharing is not available here. Use Download instead.");
    }
  });
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
      <div class="snapshot-source-card">
        <strong>Text-only snapshot</strong>
        <small>No uploaded session images yet. The snapshot will use a clean social-ready summary card.</small>
      </div>
    `;
    return;
  }

  if (images.length === 1) {
    const image = images[0];
    state.picker.innerHTML = `
      <div class="snapshot-source-card">
        <strong>Using uploaded image automatically</strong>
        <small>${escapeHtml(image.name || "Session image")} will be used as the main snapshot image.</small>
      </div>
    `;
    return;
  }

  state.picker.innerHTML = `
    <div class="snapshot-source-card">
      <strong>Choose image at generation time</strong>
      <small>${images.length} uploaded images are available. You'll pick one in the snapshot modal before generating.</small>
    </div>
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
  if (!payload?.blob) {
    state.preview.hidden = true;
    state.preview.innerHTML = "";
    state.downloadButton?.setAttribute("disabled", "disabled");
    state.resetButton?.setAttribute("disabled", "disabled");
    state.shareButton?.setAttribute("disabled", "disabled");
    return;
  }

  state.generatedUrl = URL.createObjectURL(payload.blob);
  state.preview.hidden = false;
  state.preview.innerHTML = `
    <article class="snapshot-preview-card">
      <img src="${state.generatedUrl}" alt="Session snapshot preview" class="snapshot-preview-image">
    </article>
  `;
  state.downloadButton?.removeAttribute("disabled");
  state.resetButton?.removeAttribute("disabled");
  state.shareButton?.removeAttribute("disabled");
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
  if (state.generatedBlob) {
    return {
      blob: state.generatedBlob,
      fileName: buildSnapshotFileName(state.getSnapshotData?.()),
      summaryText: buildSnapshotShareText(state.getSnapshotData?.()),
    };
  }

  return generateSnapshotPreview(state);
}

async function generateSnapshotPreview(state) {
  try {
    setSnapshotMessage(state, "");
    state.generateButton?.setAttribute("disabled", "disabled");
    const data = state.getSnapshotData?.();
    if (!data) {
      throw new Error("Snapshot data is not available yet.");
    }

    const selectedImage = await resolveSnapshotImageSelection(state);
    if (selectedImage === undefined) {
      return null;
    }
    const blob = await buildSessionSnapshotBlob(data, selectedImage?.displayUrl || "");
    setSnapshotPreview(state, { blob });
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
  if (modal) {
    return modal;
  }

  modal = document.createElement("dialog");
  modal.id = "snapshot-image-modal";
  modal.className = "snapshot-modal";
  modal.innerHTML = `
    <form method="dialog" class="snapshot-modal-card">
      <div class="snapshot-modal-copy">
        <p class="eyebrow">Share Snapshot</p>
        <h3>Choose image for snapshot</h3>
        <p class="muted">Select the uploaded image you want to feature as the main visual.</p>
      </div>
      <div class="snapshot-modal-grid" id="snapshot-modal-grid"></div>
      <div class="snapshot-modal-actions">
        <button type="button" class="button button-secondary" data-snapshot-modal-action="cancel">Cancel</button>
        <button type="button" class="button button-primary" data-snapshot-modal-action="confirm">Use Selected Image</button>
      </div>
    </form>
  `;
  document.body.appendChild(modal);
  return modal;
}

function chooseSnapshotImageForState(state, images) {
  const modal = ensureSnapshotImageModal();
  const grid = modal.querySelector("#snapshot-modal-grid");
  let selectedKey = state.selectedImageKey && images.some((image) => image.key === state.selectedImageKey)
    ? state.selectedImageKey
    : images[0]?.key || "";

  const renderChoices = () => {
    grid.innerHTML = images.map((image) => `
      <label class="snapshot-modal-thumb ${selectedKey === image.key ? "is-selected" : ""}">
        <input type="radio" name="snapshot-modal-choice" value="${escapeHtml(image.key)}" ${selectedKey === image.key ? "checked" : ""}>
        <img src="${escapeHtml(image.displayUrl)}" alt="${escapeHtml(image.name || "Session image")}">
        <span>${escapeHtml(image.name || "Session image")}</span>
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

  return new Promise((resolve) => {
    const cancelButton = modal.querySelector('[data-snapshot-modal-action="cancel"]');
    const confirmButton = modal.querySelector('[data-snapshot-modal-action="confirm"]');

    const cleanup = (result) => {
      cancelButton.onclick = null;
      confirmButton.onclick = null;
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

function formatSnapshotSystemLabel(systemType) {
  if (systemType === "TRA") {
    return "TRā™";
  }

  return "KAN®";
}

async function buildSessionSnapshotBlob(data, imageSource = "") {
  const canvas = document.createElement("canvas");
  const size = 1080;
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not generate the snapshot image.");
  }

  drawSnapshotBackground(context, size);

  if (imageSource) {
    const image = await loadSnapshotImage(imageSource);
    drawSnapshotHeroImage(context, image, size);
    drawSnapshotImageFooter(context, size, data);
  } else {
    drawSnapshotTextLayout(context, size, data);
  }

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
  const frameX = 36;
  const frameY = 36;
  const frameWidth = size - 72;
  const frameHeight = 736;
  const radius = 36;
  drawRoundedRectPath(context, frameX, frameY, frameWidth, frameHeight, radius);
  context.save();
  context.clip();
  context.filter = "contrast(1.06) saturate(1.08) brightness(1.03)";
  drawImageCover(context, image, frameX, frameY, frameWidth, frameHeight);
  context.filter = "none";
  context.restore();
}

function drawSnapshotImageFooter(context, size, data) {
  const panelX = 40;
  const panelWidth = size - 80;
  const panelHeight = 326;
  const panelY = size - panelHeight - 40;
  context.save();
  context.shadowColor = "rgba(12, 18, 10, 0.18)";
  context.shadowBlur = 18;
  context.shadowOffsetY = 10;
  context.fillStyle = "#0f130e";
  drawRoundedRectPath(context, panelX, panelY, panelWidth, panelHeight, 30);
  context.fill();
  context.restore();

  context.strokeStyle = "rgba(148, 209, 89, 0.65)";
  context.lineWidth = 1.1;
  drawRoundedRectPath(context, panelX, panelY, panelWidth, panelHeight, 30);
  context.stroke();

  drawSnapshotPanelContent(context, panelX, panelY, panelWidth, panelHeight, data, false);
}

function drawSnapshotTextLayout(context, size, data) {
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

  drawSnapshotPanelContent(context, panelX, panelY, panelWidth, panelHeight, data, true);
}

function drawSnapshotPanelContent(context, x, y, width, height, data, roomy = false) {
  const inset = roomy ? 80 : 44;
  const brandY = roomy ? y + 58 : y + 42;
  const percentY = roomy ? y + 256 : y + 134;
  const rateY = percentY + (roomy ? 48 : 40);
  const seedsY = rateY + (roomy ? 42 : 36);
  const dividerX = x + (roomy ? width * 0.45 : width * 0.44);
  const infoTopY = roomy ? y + 98 : y + 96;
  const footerDividerY = y + height - (roomy ? 80 : 60);
  const footerTextY = y + height - (roomy ? 42 : 30);
  const brandIconSize = roomy ? 20 : 15;
  const metaIconSize = roomy ? 18 : 14;

  drawSproutIcon(context, x + inset, brandY - (brandIconSize - 3), brandIconSize, "#94d159");
  context.fillStyle = "#f4faef";
  context.font = roomy ? "600 22px Arial, sans-serif" : "600 17px Arial, sans-serif";
  context.fillText("Cannakan® Grow", x + inset + brandIconSize + 12, brandY);

  const percentFontSize = roomy ? 164 : 128;
  context.save();
  context.shadowColor = "rgba(148, 209, 89, 0.28)";
  context.shadowBlur = 14;
  context.fillStyle = "#94d159";
  context.font = `700 ${percentFontSize}px Arial, sans-serif`;
  context.fillText(`${data.percentage}%`, x + inset, percentY);
  context.restore();

  context.fillStyle = "#ffffff";
  context.font = roomy ? "500 28px Arial, sans-serif" : "500 23px Arial, sans-serif";
  context.fillText("Germination Rate", x + inset, rateY);

  drawSeedIcon(context, x + inset, seedsY - metaIconSize + 1, metaIconSize, "#94d159");
  context.fillStyle = "#dce9d2";
  context.font = roomy ? "500 25px Arial, sans-serif" : "500 21px Arial, sans-serif";
  context.fillText(`${data.totalPlanted} / ${data.totalSeeds} seeds`, x + inset + metaIconSize + 12, seedsY);

  context.strokeStyle = "rgba(148, 209, 89, 0.35)";
  context.lineWidth = 1.2;
  context.beginPath();
  context.moveTo(dividerX, y + 72);
  context.lineTo(dividerX, y + height - 96);
  context.stroke();

  const infoX = dividerX + (roomy ? 48 : 42);
  drawCalendarIcon(context, infoX, infoTopY - metaIconSize + 1, metaIconSize, "#94d159");
  context.fillStyle = "#f6fbf1";
  context.font = roomy ? "500 22px Arial, sans-serif" : "500 18px Arial, sans-serif";
  context.fillText(data.dateLabel, infoX + metaIconSize + 12, infoTopY);

  const systemPillText = data.systemLabel;
  context.font = roomy ? "700 18px Arial, sans-serif" : "700 16px Arial, sans-serif";
  const badgeTextWidth = context.measureText(systemPillText).width;
  const badgeWidth = badgeTextWidth + 38;
  const badgeHeight = roomy ? 40 : 36;
  const badgeX = x + width - inset - badgeWidth;
  const badgeY = infoTopY - (roomy ? 32 : 28);
  context.fillStyle = "rgba(148, 209, 89, 0.12)";
  drawRoundedRectPath(context, badgeX, badgeY, badgeWidth, badgeHeight, 999);
  context.fill();
  context.strokeStyle = "rgba(148, 209, 89, 0.55)";
  context.lineWidth = 1;
  drawRoundedRectPath(context, badgeX, badgeY, badgeWidth, badgeHeight, 999);
  context.stroke();
  context.fillStyle = "#f4faef";
  context.fillText(systemPillText, badgeX + 19, badgeY + (roomy ? 26 : 24));

  context.strokeStyle = "rgba(148, 209, 89, 0.42)";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(x + inset, footerDividerY);
  context.lineTo(x + width - inset, footerDividerY);
  context.stroke();

  const dateText = data.dateLabel;
  context.font = `600 ${roomy ? 24 : 17}px Arial, sans-serif`;
  const separatorText = " • ";
  const dateWidth = context.measureText(separatorText + dateText).width;
  const sessionNameMaxWidth = width - inset * 2 - dateWidth;
  const sessionNameText = truncateTextToWidth(context, data.sessionName, sessionNameMaxWidth);

  context.fillStyle = "#eef7e6";
  context.fillText(sessionNameText, x + inset, footerTextY);

  const sessionNameWidth = context.measureText(sessionNameText).width;
  context.fillStyle = "#94d159";
  context.fillText(separatorText + dateText, x + inset + sessionNameWidth, footerTextY);
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

function drawImageCover(context, image, x, y, width, height) {
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  const drawX = x + (width - drawWidth) / 2;
  const drawY = y + (height - drawHeight) / 2;
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
  updateNavState();

  if (!appState.initialized || appState.loading) {
    app.innerHTML = `<section class="card"><p class="muted">Loading Cannakan Grow...</p></section>`;
    return;
  }

  if (!isSupabaseConfigured()) {
    renderSetupScreen();
    return;
  }

  if (!appState.user) {
    renderAuthScreen();
    return;
  }

  if (!hasCompletedProfile()) {
    renderProfileSetupScreen();
    return;
  }

  const hash = window.location.hash || "#home";
  const [route, id] = hash.replace("#", "").split("/");

  if (route === "new") {
    renderSessionForm();
    return;
  }

  if (route === "sessions" && id) {
    renderSessionDetail(id);
    return;
  }

  if (route === "sessions") {
    renderSessionsList();
    return;
  }

  renderHome();
}

function renderSetupScreen() {
  app.replaceChildren(cloneTemplate(templates.setup));
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

  const bestSessionId = options.showBestBadge ? getBestCompletedSessionId(allSessions) : "";

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
      ${session.id === bestSessionId ? '<span class="recent-session-badge">Best</span>' : ""}
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

function getBestCompletedSessionId(sessions) {
  return getBestCompletedSession(sessions)?.id || "";
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

function renderSessionForm() {
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
  const imageSection = document.querySelector(".session-images-section");
  const imageInput = document.querySelector("#session-images-input");
  const imageGrid = document.querySelector("#session-images-grid");
  const imageMessage = document.querySelector("#session-images-message");
  const snapshotSection = document.querySelector("#share-snapshot-section");
  const snapshotPicker = document.querySelector("#snapshot-image-picker");
  const snapshotMessage = document.querySelector("#snapshot-message");
  const snapshotPreview = document.querySelector("#snapshot-preview");
  const generateSnapshotButton = document.querySelector("#generate-snapshot");
  const downloadSnapshotButton = document.querySelector("#download-snapshot");
  const resetSnapshotButton = document.querySelector("#reset-snapshot");
  const shareSnapshotButton = document.querySelector("#share-snapshot");
  const timingSection = document.querySelector("#session-timing-section");
  const timingSummary = document.querySelector("#session-timing-summary");
  const runProgressSection = document.querySelector("#run-progress-section");
  const runProgressSummary = document.querySelector("#run-progress-summary");
  const lifecycleSection = document.querySelector("#session-lifecycle-section");
  const lifecycleSummary = document.querySelector("#session-lifecycle-summary");
  const chartShell = document.querySelector("#partition-chart-shell");
  const chartHeader = document.querySelector("#partition-chart-header");
  const today = new Date();

  form.elements.date.value = today.toISOString().slice(0, 10);
  initializeTimeFormatField(form, today.toTimeString().slice(0, 5));
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
    message: snapshotMessage,
    generateButton: generateSnapshotButton,
    downloadButton: downloadSnapshotButton,
    resetButton: resetSnapshotButton,
    shareButton: shareSnapshotButton,
    getSnapshotData: () => getFormSnapshotData(form),
    getImageEntries: () => {
      const imageState = form.__sessionImageState;
      return imageState ? [...imageState.images, ...imageState.pendingFiles] : [];
    },
    });
    form.dataset.currentStage = normalizeSessionStatus(sessionStatusField.value);
    appState.growthStage = sessionStatusField.value || null;

  renderSystemLayoutReference(layoutReference, systemTypeField.value);
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
      renderSystemLayoutReference(layoutReference, systemTypeField.value);
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
      const parsedSeedVariety = parseSeedVarietyInput(formData.get(`seedVariety-${index}`));
      return {
        id: partition.id,
        seedVariety: parsedSeedVariety.variety,
        breeder: parsedSeedVariety.breeder,
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
  row.dataset.partitionId = String(partition.id);
  row.tabIndex = -1;
  row.innerHTML = `
    <div class="partition-number partition-btn" aria-label="Partition ${partition.id}">${partition.id}</div>
    <label>
      <span class="mobile-field-label">Seed Variety</span>
        <input type="text" name="seedVariety-${index}" class="partition-input" placeholder="Enter seed variety - breeder" aria-label="Partition ${partition.id} seed variety">
      <span class="field-warning" aria-live="polite">Please enter seed variety</span>
    </label>
    <label>
      <span class="mobile-field-label">Type</span>
      <div class="custom-select">
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
      <div class="custom-select">
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
  const allowFullEditing = normalizedStatus === "soaking";
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
    field.readOnly = !allowFullEditing;
    field.disabled = false;
  });

  scope.querySelectorAll('.partition-row input[name^="seedVariety-"], .partition-row select[name^="seedType-"], .partition-row select[name^="feminized-"], .partition-row input[name^="seedCount-"]').forEach((field) => {
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
    imageInput.disabled = !allowFullEditing;
  }

  scope.querySelectorAll(".session-image-remove").forEach((button) => {
    button.disabled = !allowFullEditing;
    button.hidden = !allowFullEditing;
  });

  const imageUpload = scope.querySelector(".session-images-upload");
  if (imageUpload) {
    imageUpload.classList.toggle("is-disabled", !allowFullEditing);
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
  row.querySelector('input[name^="seedVariety-"]').value = formatPartitionSeedVariety(partition);
  row.querySelector('select[name^="seedType-"]').value = partition.seedType || "";
  row.querySelector('select[name^="feminized-"]').value = partition.feminized || "";
  row.querySelector('input[name^="seedCount-"]').value = partition.seedCount > 0 ? partition.seedCount : "";
  row.querySelector('input[name="plantedCount"]').value = partition.plantedCount || "";
}

function getCurrentPartitionValues(form) {
  return [...form.querySelectorAll(".partition-row")].map((row) => ({
    ...parseSeedVarietyInput(row.querySelector('input[name^="seedVariety-"]')?.value || ""),
    seedType: row.querySelector('select[name^="seedType-"]')?.value || "",
    feminized: row.querySelector('select[name^="feminized-"]')?.value || "",
    seedCount: Number(row.querySelector('input[name^="seedCount-"]')?.value) || 0,
    plantedCount: row.querySelector('input[name="plantedCount"]')?.value.trim() || "",
  }));
}

function renderSessionsList() {
  app.replaceChildren(cloneTemplate(templates.sessions));
  const sessions = sortSessionsNewestFirst(getSessions());
  const activeContainer = document.querySelector("#active-sessions-list");
  const recentCompletedContainer = document.querySelector("#recent-completed-sessions-list");
  const historyContainer = document.querySelector("#sessions-list");

  const activeSessions = sessions.filter((session) => normalizeSessionStatus(session.sessionStatus) !== "completed");
  const completedSessions = sessions.filter((session) => normalizeSessionStatus(session.sessionStatus) === "completed");

  renderSessionCollection(activeContainer, activeSessions, {
    emptyMessage: "No active sessions.",
    emptyActionLabel: "Create your first session",
    compact: false,
  });

  renderRecentSessions(recentCompletedContainer, completedSessions.slice(0, 3), sessions, {
    emptyMessage: "No completed sessions yet.",
    showBestBadge: true,
  });

  renderSessionCollection(historyContainer, sessions, {
    emptyMessage: "No grow sessions yet.",
    emptyActionLabel: "Create your first session",
    compact: false,
  });
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
    const detailStatusField = document.querySelector("#detail-session-status-control");
    const detailStatusTrigger = document.querySelector("#detail-session-status-trigger");
  const detailReminder = document.querySelector("#detail-session-status-reminder");
  const detailNotesField = document.querySelector("#detail-session-notes");
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
  const detailGenerateSnapshotButton = document.querySelector("#detail-generate-snapshot");
  const detailDownloadSnapshotButton = document.querySelector("#detail-download-snapshot");
  const detailResetSnapshotButton = document.querySelector("#detail-reset-snapshot");
  const detailShareSnapshotButton = document.querySelector("#detail-share-snapshot");
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
  detailStatusField.value = session.sessionStatus || "soaking";
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
    message: detailSnapshotMessage,
    generateButton: detailGenerateSnapshotButton,
    downloadButton: detailDownloadSnapshotButton,
    resetButton: detailResetSnapshotButton,
    shareButton: detailShareSnapshotButton,
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
        refreshDetailDerivedViews();
        detailSaveMessage.textContent = "";
      });
      field.addEventListener("blur", () => {
        validatePartitionRow(row);
        syncSessionPartitionsFromContainer(session, partitions);
        captureFirstPlantedEventForSession(session);
        refreshDetailDerivedViews();
      });
    });
    validatePartitionRow(row);
  });
  refreshDetailDerivedViews();
  bindSessionTimelineDebugTools(detailLifecycleSection, (action) => {
    applyDebugEventToSession(session, detailStatusField, action);
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
      updateSessionStatusAppearance(detailStatusField, detailStatusTrigger);
    updateSessionStatusReminder(
      detailReminder,
      session.date,
      session.time,
      detailStatusField.value,
      session.germinationStartedAt || "",
    );
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

  detailNotesField.addEventListener("change", async () => {
    session.sessionNotes = detailNotesField.value.trim();
    await saveSessionUpdate(session);
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
    row.className = "session-row";
    row.href = `#sessions/${session.id}`;
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
    row.querySelector("[data-session-delete]")?.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();

      const confirmed = window.confirm("Delete this session? This cannot be undone.");
      if (!confirmed) {
        return;
      }

      try {
        await deleteCloudSession(session.id);
        renderSessionCollection(container, sortSessionsNewestFirst(getSessions()), options);
      } catch (error) {
        window.alert(error.message || "Could not delete session.");
      }
    });
    container.appendChild(row);
  });
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
    varietyValue: formatPartitionSeedVariety(partition),
    typeValue: partition?.seedType || "",
    sexValue: partition?.feminized || "",
    seedValue: partition?.seedCount ?? "",
    plantedValue: partition?.plantedCount ?? "",
  });
  const partitionState = getPartitionRowStateFromPartition(partition, sessionStatus);
  const row = document.createElement("article");
  row.className = "chart-row partition-row detail-row";
  row.dataset.partitionBaseState = basePartitionState;
  row.innerHTML = `
    <div class="partition-number partition-btn ${getPartitionButtonClassName(partitionState)}" aria-label="Partition ${partition.id}">${partition.id}</div>
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
  const varietyValue = String(values?.varietyValue || "").trim();
  const typeValue = String(values?.typeValue || "").trim();
  const sexValue = String(values?.sexValue || "").trim();
  const seedValue = String(values?.seedValue || "").trim();
  const plantedValue = String(values?.plantedValue || "").trim();
  const hasSeedCount = seedValue !== "";
  const hasPlantedCount = plantedValue !== "";

  if (varietyValue || typeValue || sexValue || hasSeedCount || hasPlantedCount) {
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

  row.dataset.partitionButtonState = state;
  button.classList.toggle("partition-btn--in-progress", state === "in-progress");
  button.classList.toggle("partition-btn--complete", state === "complete");
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
      cell.style.setProperty("background", "rgba(148, 209, 89, 0.12)", "important");
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
      input.style.setProperty("background", "rgba(247, 252, 244, 0.96)", "important");
      input.style.setProperty("box-shadow", "0 0 0 2px rgba(148, 209, 89, 0.18)", "important");
    } else {
      input.style.removeProperty("border");
      input.style.removeProperty("background");
      input.style.removeProperty("box-shadow");
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

function updateSessionStatusAppearance(control, trigger) {
  if (!control && !trigger) {
    return;
  }

  const value = control?.value || "";
  const normalizedStatus = normalizeSessionStatus(value);

  if (control) {
    control.dataset.sessionStatus = normalizedStatus;
  }

  if (trigger) {
    trigger.dataset.sessionStatus = normalizedStatus;
    trigger.textContent = getSessionStageLabel(value);
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

function parseSeedVarietyInput(value) {
  const rawValue = String(value || "").trim();
  if (!rawValue) {
    return {
      variety: "",
      breeder: "",
    };
  }

  const separatorIndex = rawValue.indexOf("-");
  if (separatorIndex === -1) {
    return {
      variety: rawValue,
      breeder: "",
    };
  }

  const variety = rawValue.slice(0, separatorIndex).trim();
  const breeder = rawValue.slice(separatorIndex + 1).trim();
  return {
    variety,
    breeder,
  };
}

function formatPartitionSeedVariety(partition) {
  const variety = String(partition.seedVariety || "").trim();
  const breeder = String(partition.breeder || "").trim();

  if (!variety) {
    return "";
  }

  return breeder ? `${variety} - ${breeder}` : variety;
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

  const rowStarted = Boolean(varietyValue || typeValue || sexValue || hasSeedCount || hasPlantedCount);
  const fieldsComplete = Boolean(varietyValue && typeValue && sexValue && seedCountValid && plantedCountValid);
  const rowInvalid = (rowStarted && !fieldsComplete) || !plantedCountValid;
  const sessionStatus = row.closest(".partition-table")?.dataset.sessionStatus || row.closest("form")?.dataset.currentStage || "";
  const rowState = getPartitionRowState({
    varietyValue,
    typeValue,
    sexValue,
    seedValue,
    plantedValue,
  }, sessionStatus);

  row.classList.toggle("partition-row--filled", rowStarted);
  row.classList.toggle("row--completed", fieldsComplete);
  row.classList.toggle("row-has-warning", rowInvalid);
  row.classList.toggle("row-complete", normalizeSessionStatus(sessionStatus) === "completed" && rowStarted);
  updatePartitionButtonState(row, rowState);

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
  const maxSeeds = Math.max(...items.map((partition) => Number(partition.seedCount) || 0), 1);
  chartElement.innerHTML = items.map((partition) => {
    const seeds = Number(partition.seedCount) || 0;
    const planted = Math.min(Number(partition.plantedCount) || 0, seeds || Number(partition.plantedCount) || 0);
    const totalWidth = maxSeeds > 0 ? (seeds / maxSeeds) * 100 : 0;
    const plantedWidth = maxSeeds > 0 ? (planted / maxSeeds) * 100 : 0;

    return `
      <div class="progress-chart-row">
        <div class="progress-chart-label">P${partition.id}</div>
        <div class="progress-bar-track" aria-label="Partition ${partition.id} planting progress">
          <div class="progress-bar-total" style="width: ${totalWidth}%"></div>
          <div class="progress-bar-fill" style="width: ${plantedWidth}%"></div>
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
    <article class="timing-card">
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
      <article class="timing-card">
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
    const parsedSeedVariety = parseSeedVarietyInput(row.querySelector('input[name^="seedVariety-"]')?.value || "");
    const existingPartition = session.partitions?.[index] || {};
    return {
      id: Number(row.dataset.partitionId) || existingPartition.id || index + 1,
      seedVariety: parsedSeedVariety.variety,
      breeder: parsedSeedVariety.breeder,
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
});

window.addEventListener("hashchange", safeRender);
window.addEventListener("DOMContentLoaded", safeBootstrapApp);
window.removeCannakanSampleSessions = removeSampleSessions;
