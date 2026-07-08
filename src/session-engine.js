(function sessionEngineFactory(root, factory) {
  const engine = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = engine;
  }
  root.CannakanSessionEngine = engine;
}(typeof globalThis !== "undefined" ? globalThis : this, function createSessionEngine() {
  const HOUR_MS = 60 * 60 * 1000;
  const DAY_HOURS = 24;

  function freeze(value) {
    if (!value || typeof value !== "object") {
      return value;
    }
    Object.keys(value).forEach((key) => freeze(value[key]));
    return Object.freeze(value);
  }

  function reminder(key, atHours, title, message, options) {
    const config = options || {};
    return {
      key,
      atHours,
      maxHours: config.maxHours ?? null,
      from: config.from || "start",
      phaseKey: config.phaseKey || "",
      category: config.category || "germination-reminder",
      level: config.level || "guidance",
      title,
      message,
      actionText: config.actionText || message,
      requiredAction: config.requiredAction || "",
      stage: config.stage || "active",
      urgency: config.urgency || (config.level === "critical" ? "high" : "normal"),
      supportsPostpone: config.supportsPostpone === true,
      postponeOptionsHours: Array.isArray(config.postponeOptionsHours) ? config.postponeOptionsHours : [],
    };
  }

  function phase(key, label, startHour, endHour, options) {
    const config = options || {};
    return {
      key,
      label,
      startHour,
      endHour,
      from: config.from || "start",
      timing: config.timing || "",
      tone: config.tone || "green",
      iconName: config.iconName || "",
      requiredConfirmation: config.requiredConfirmation || "",
      preparationComplete: config.preparationComplete === true,
      statusLabel: config.statusLabel || "",
    };
  }

  const STANDARD_KAN_REMINDERS = [
    reminder("soaking-prepare-18h", 18, "Prepare to move to germination", "Prepare to move this session into germination.", {
      category: "soaking-reminder",
      stage: "soaking",
      actionText: "Confirm moved to germination when the seeds are ready.",
      requiredAction: "confirm-moved-to-germination",
    }),
    reminder("germination-expected-24h", 24, "Expected germination phase", "Expected transition into germination.", {
      category: "soaking-reminder",
      stage: "soaking",
      level: "warning",
      actionText: "Confirm moved to germination if the transfer is complete.",
      requiredAction: "confirm-moved-to-germination",
    }),
    reminder("check-seeds-36h", 36, "Check seeds", "Check seed progress.", {
      stage: "germinating",
      requiredAction: "check-seeds",
    }),
    reminder("completion-window-42h", 42, "Completion window begins", "Expected completion window begins.", {
      stage: "germinating",
      actionText: "Review results and complete the session when ready.",
      requiredAction: "complete-session",
    }),
    reminder("complete-session-48h", 48, "Complete session", "Reminder to complete this session.", {
      stage: "germinating",
      actionText: "Complete the session or record why it needs more time.",
      requiredAction: "complete-session",
      supportsPostpone: true,
      postponeOptionsHours: [2, 6, 12],
    }),
    reminder("urgent-complete-56h", 56, "Urgent completion reminder", "This session needs attention.", {
      stage: "germinating",
      level: "critical",
      actionText: "Complete the session or snooze this reminder.",
      requiredAction: "complete-session",
      supportsPostpone: true,
      postponeOptionsHours: [2, 6, 12],
    }),
  ];

  const PAPER_TOWEL_REMINDERS = [
    reminder("check-seeds-24h", 24, "Check seeds", "Check seed progress.", {
      from: "paperTowelStart",
      requiredAction: "check-seeds",
    }),
    reminder("check-again-36h", 36, "Check again", "Check seed progress again.", {
      from: "paperTowelStart",
      requiredAction: "check-seeds",
    }),
    reminder("complete-session-48h", 48, "Complete session", "Complete this session when results are ready.", {
      from: "paperTowelStart",
      requiredAction: "complete-session",
      supportsPostpone: true,
      postponeOptionsHours: [2, 6, 12],
    }),
    reminder("urgent-complete-56h", 56, "Urgent completion reminder", "This session needs attention.", {
      from: "paperTowelStart",
      level: "critical",
      requiredAction: "complete-session",
      supportsPostpone: true,
      postponeOptionsHours: [2, 6, 12],
    }),
  ];

  const DIRECT_MEDIA_REMINDERS = [
    reminder("keep-moist-day-1", DAY_HOURS, "Keep moist", "Check moisture and keep the medium evenly moist.", {
      stage: "active",
      category: "germination-reminder",
      requiredAction: "check-moisture",
    }),
    reminder("watch-sprouts-day-2", 2 * DAY_HOURS, "Watch for sprouts", "Check for early sprout activity.", {
      stage: "active",
      requiredAction: "check-sprouts",
    }),
    reminder("record-results-day-5", 5 * DAY_HOURS, "Record results", "Record germination results when sprouts have emerged.", {
      stage: "active",
      requiredAction: "record-results",
    }),
    reminder("urgent-results-day-7", 7 * DAY_HOURS, "Results reminder", "This planted session needs attention.", {
      stage: "active",
      level: "critical",
      requiredAction: "record-results",
      supportsPostpone: true,
      postponeOptionsHours: [12, 24, 48],
    }),
  ];

  const METHOD_DEFINITIONS = freeze({
    KAN: {
      key: "KAN",
      displayName: "KAN",
      tone: "green",
      iconName: "method-kan",
      startLabel: "Soaking begins",
      resultRequired: true,
      phases: [
        phase("started", "Start", 0, 0, { timing: "Session started", tone: "green", iconName: "method-kan" }),
        phase("soaking", "Soak", 0, 18, { timing: "0-18h", tone: "soaking", requiredConfirmation: "confirm-moved-to-germination" }),
        phase("move-germination", "Move to Germination", 18, 24, { timing: "18-24h", tone: "germination", requiredConfirmation: "confirm-moved-to-germination" }),
        phase("germination", "Germination", 24, 36, { timing: "24-36h", tone: "germination" }),
        phase("check-window", "Check Seeds", 36, 56, { timing: "36-56h", tone: "green" }),
        phase("complete", "Complete", 56, null, { timing: "Results recorded", tone: "completed" }),
      ],
      milestones: STANDARD_KAN_REMINDERS,
      completionWindow: { from: "start", startHour: 42, endHour: 56 },
      overdueAfterHours: 56,
    },
    TRA: {
      key: "TRA",
      displayName: "TRā",
      tone: "green",
      iconName: "method-tra",
      startLabel: "Soaking begins",
      resultRequired: true,
      phases: [
        phase("started", "Start", 0, 0, { timing: "Session started", tone: "green", iconName: "method-tra" }),
        phase("soaking", "Soak", 0, 18, { timing: "0-18h", tone: "soaking", requiredConfirmation: "confirm-moved-to-germination" }),
        phase("move-germination", "Move to Germination", 18, 24, { timing: "18-24h", tone: "germination", requiredConfirmation: "confirm-moved-to-germination" }),
        phase("germination", "Germination", 24, 36, { timing: "24-36h", tone: "germination" }),
        phase("check-window", "Check Seeds", 36, 56, { timing: "36-56h", tone: "green" }),
        phase("complete", "Complete", 56, null, { timing: "Results recorded", tone: "completed" }),
      ],
      milestones: STANDARD_KAN_REMINDERS,
      completionWindow: { from: "start", startHour: 42, endHour: 56 },
      overdueAfterHours: 56,
    },
    PAPER_TOWEL_SOAK: {
      key: "PAPER_TOWEL_SOAK",
      displayName: "Paper Towel + Soak",
      tone: "purple",
      iconName: "method-soak-paper",
      startLabel: "Soak begins",
      resultRequired: true,
      phases: [
        phase("started", "Start", 0, 0, { timing: "Session started", tone: "purple" }),
        phase("soak", "Soak", 0, 12, { timing: "0-12h", tone: "soaking", requiredConfirmation: "confirm-moved-to-paper-towel" }),
        phase("ready-transfer", "Move to Paper Towel", 12, null, { timing: "12-18h", tone: "germination", requiredConfirmation: "confirm-moved-to-paper-towel" }),
        phase("paper-towel", "Paper Towel", 0, 24, { from: "paperTowelStart", timing: "0-24h", tone: "germination" }),
        phase("check-window", "Check Seeds", 24, 48, { from: "paperTowelStart", timing: "24-48h", tone: "green" }),
        phase("complete", "Complete", 48, null, { from: "paperTowelStart", timing: "48h+", tone: "completed" }),
      ],
      milestones: [
        reminder("move-paper-towel-12h", 12, "Move to paper towel soon", "Prepare to move seeds to paper towel.", {
          category: "soaking-reminder",
          stage: "soaking",
          requiredAction: "confirm-moved-to-paper-towel",
        }),
        reminder("move-paper-towel-18h", 18, "Move to paper towel", "Move seeds to paper towel if soaking is complete.", {
          category: "soaking-reminder",
          stage: "soaking",
          level: "warning",
          requiredAction: "confirm-moved-to-paper-towel",
        }),
        ...PAPER_TOWEL_REMINDERS,
      ],
      completionWindow: { from: "paperTowelStart", startHour: 48, endHour: 56 },
      overdueAfterHours: 56,
    },
    PAPER_TOWEL: {
      key: "PAPER_TOWEL",
      displayName: "Paper Towel",
      tone: "blue",
      iconName: "method-paper-towel",
      startLabel: "Paper towel begins",
      resultRequired: true,
      phases: [
        phase("started", "Start", 0, 0, { timing: "Session started", tone: "blue" }),
        phase("paper-towel", "Paper Towel", 0, 12, { timing: "0-12h", tone: "germination" }),
        phase("first-check", "First Check", 12, 24, { timing: "12-24h", tone: "green" }),
        phase("check-window", "Check Seeds", 24, 48, { timing: "24-48h", tone: "green" }),
        phase("complete", "Complete", 48, null, { timing: "48h+", tone: "completed" }),
      ],
      milestones: PAPER_TOWEL_REMINDERS.map((entry) => ({ ...entry, from: "start" })),
      completionWindow: { from: "start", startHour: 48, endHour: 56 },
      overdueAfterHours: 56,
    },
    DIRECT_SOW: {
      key: "DIRECT_SOW",
      displayName: "Direct Soil",
      tone: "orange",
      iconName: "method-direct-sow",
      startLabel: "Seeds planted",
      resultRequired: true,
      phases: [
        phase("started", "Start", 0, 0, { timing: "Session started", tone: "orange" }),
        phase("seeds-planted", "Seeds Planted", 0, DAY_HOURS, { timing: "Day 0", tone: "soaking" }),
        phase("keep-moist", "Keep Moist", DAY_HOURS, 2 * DAY_HOURS, { timing: "Day 1-3", tone: "germination" }),
        phase("watch-sprouts", "Watch for Sprouts", 2 * DAY_HOURS, 5 * DAY_HOURS, { timing: "Day 2-5", tone: "green" }),
        phase("complete", "Complete", 5 * DAY_HOURS, null, { timing: "Day 5+", tone: "completed" }),
      ],
      milestones: DIRECT_MEDIA_REMINDERS,
      completionWindow: { from: "start", startHour: 5 * DAY_HOURS, endHour: 7 * DAY_HOURS },
      overdueAfterHours: 7 * DAY_HOURS,
    },
    ROCKWOOL: {
      key: "ROCKWOOL",
      displayName: "Rockwool",
      extends: "DIRECT_SOW",
      tone: "gray",
      iconName: "method-direct-sow",
      startLabel: "Prep cubes",
      phases: [
        phase("started", "Start", 0, 0, { timing: "Session started", tone: "gray" }),
        phase("prep-cubes", "Prep Cubes", 0, 2, { timing: "Day 0", tone: "soaking" }),
        phase("seeds-planted", "Plant Seeds", 2, DAY_HOURS, { timing: "Day 0", tone: "germination" }),
        phase("keep-cubes-moist", "Keep Cubes Moist", DAY_HOURS, 2 * DAY_HOURS, { timing: "Day 1-3", tone: "germination" }),
        phase("watch-sprouts", "Watch for Sprouts", 2 * DAY_HOURS, 5 * DAY_HOURS, { timing: "Day 2-5", tone: "green" }),
        phase("complete", "Complete", 5 * DAY_HOURS, null, { timing: "Day 5+", tone: "completed" }),
      ],
    },
    RAPID_ROOTER: {
      key: "RAPID_ROOTER",
      displayName: "Starter Plug",
      extends: "DIRECT_SOW",
      tone: "green",
      iconName: "method-direct-sow",
      startLabel: "Prep plugs",
      phases: [
        phase("started", "Start", 0, 0, { timing: "Session started", tone: "green" }),
        phase("prep-plugs", "Prep Plugs", 0, 2, { timing: "Day 0", tone: "soaking" }),
        phase("seeds-planted", "Plant Seeds", 2, DAY_HOURS, { timing: "Day 0", tone: "germination" }),
        phase("keep-plugs-moist", "Keep Plugs Moist", DAY_HOURS, 2 * DAY_HOURS, { timing: "Day 1-3", tone: "germination" }),
        phase("watch-sprouts", "Watch for Sprouts", 2 * DAY_HOURS, 5 * DAY_HOURS, { timing: "Day 2-5", tone: "green" }),
        phase("complete", "Complete", 5 * DAY_HOURS, null, { timing: "Day 5+", tone: "completed" }),
      ],
    },
    WATER_SOAK: {
      key: "WATER_SOAK",
      displayName: "Water Glass",
      tone: "cyan",
      iconName: "method-soak-only",
      startLabel: "Soaking begins",
      resultRequired: true,
      phases: [
        phase("started", "Start", 0, 0, { timing: "Session started", tone: "cyan" }),
        phase("soak", "Soak", 0, 12, { timing: "0-12h", tone: "soaking" }),
        phase("check-seeds", "Check Seeds", 12, 24, { timing: "12-24h", tone: "germination" }),
        phase("complete", "Complete", 24, null, { timing: "24h+", tone: "completed" }),
      ],
      milestones: [
        reminder("check-seeds-12h", 12, "Check seeds", "Check water glass progress.", {
          category: "soaking-reminder",
          stage: "soaking",
          requiredAction: "check-seeds",
        }),
        reminder("check-again-18h", 18, "Check again", "Check seeds and prepare the next step.", {
          category: "soaking-reminder",
          stage: "soaking",
          requiredAction: "check-seeds",
        }),
        reminder("complete-water-glass-24h", 24, "Complete water glass session", "Complete this water glass session or move seeds into their next method.", {
          category: "soaking-reminder",
          stage: "soaking",
          level: "critical",
          requiredAction: "complete-session",
          supportsPostpone: true,
          postponeOptionsHours: [2, 6, 12],
        }),
      ],
      completionWindow: { from: "start", startHour: 18, endHour: 24 },
      overdueAfterHours: 24,
      todo: "Future method chaining can connect Water Glass to another germination method after transfer.",
    },
    OTHER: {
      key: "OTHER",
      displayName: "Custom Method",
      tone: "gray",
      iconName: "method-custom",
      startLabel: "Seeds started",
      resultRequired: true,
      phases: [
        phase("started", "Start", 0, 0, { timing: "Session started", tone: "gray" }),
        phase("seeds-started", "Seeds Started", 0, 48, { timing: "0-48h", tone: "germination" }),
        phase("complete", "Complete", 48, null, { timing: "48h+", tone: "completed" }),
      ],
      milestones: [
        reminder("custom-check-48h", 48, "Review seeds", "Review this custom method session.", {
          stage: "active",
          requiredAction: "check-seeds",
          supportsPostpone: true,
          postponeOptionsHours: [6, 12, 24],
        }),
      ],
      completionWindow: { from: "start", startHour: 48, endHour: 72 },
      overdueAfterHours: 72,
    },
  });

  const METHOD_ALIASES = freeze({
    TR: "TRA",
    TRA: "TRA",
    "TRĀ": "TRA",
    KAN: "KAN",
    PAPER: "PAPER_TOWEL",
    PAPER_TOWELS: "PAPER_TOWEL",
    PAPER_TOWEL_ONLY: "PAPER_TOWEL",
    PAPER_TOWEL: "PAPER_TOWEL",
    SOAK_PAPER: "PAPER_TOWEL_SOAK",
    SOAK_AND_PAPER_TOWEL: "PAPER_TOWEL_SOAK",
    SOAK_PAPER_TOWEL: "PAPER_TOWEL_SOAK",
    SOAK_PLUS_PAPER_TOWEL: "PAPER_TOWEL_SOAK",
    WATER_SOAK_PAPER_TOWEL: "PAPER_TOWEL_SOAK",
    DIRECT: "DIRECT_SOW",
    DIRECT_SOIL: "DIRECT_SOW",
    DIRECT_SOW: "DIRECT_SOW",
    SOIL: "DIRECT_SOW",
    WATER: "WATER_SOAK",
    SOAK: "WATER_SOAK",
    WATER_GLASS: "WATER_SOAK",
    WATER_SOAK: "WATER_SOAK",
    ROCKWOOL: "ROCKWOOL",
    RAPID_ROOTER: "RAPID_ROOTER",
    STARTER_PLUG: "RAPID_ROOTER",
    STARTER_PLUGS: "RAPID_ROOTER",
    CUSTOM: "OTHER",
    OTHER: "OTHER",
  });

  function normalizeMethodKey(value) {
    const normalized = String(value || "")
      .trim()
      .toUpperCase()
      .replace(/[\s\-+/&]+/g, "_")
      .replace(/_+/g, "_")
      .replace(/[\u0100\u0101]/g, "A");
    return METHOD_ALIASES[normalized] || (METHOD_DEFINITIONS[normalized] ? normalized : "KAN");
  }

  function getMethodDefinition(value) {
    const key = normalizeMethodKey(value);
    const definition = METHOD_DEFINITIONS[key] || METHOD_DEFINITIONS.KAN;
    if (definition.extends) {
      const base = getMethodDefinition(definition.extends);
      return {
        ...base,
        ...definition,
        phases: definition.phases || base.phases,
        milestones: definition.milestones || base.milestones,
        completionWindow: definition.completionWindow || base.completionWindow,
        overdueAfterHours: definition.overdueAfterHours ?? base.overdueAfterHours,
      };
    }
    return definition;
  }

  function getSessionMethodSetup(session) {
    const setup = session?.methodSetup || session?.method_setup || {};
    return setup && typeof setup === "object" ? setup : {};
  }

  function hasPreparedMediaSetup(session) {
    const setup = getSessionMethodSetup(session);
    const choice = String(setup.choice || setup.preparedMediaChoice || setup.prepared_media_choice || "")
      .trim()
      .toLowerCase();
    return setup.preparedMedia === true
      || setup.prepared_media === true
      || setup.prepared === true
      || setup.cubesPrepared === true
      || setup.plugsPrepared === true
      || choice === "prepared";
  }

  function getPreparedMediaPhases(methodKey) {
    if (methodKey === "ROCKWOOL") {
      return [
        phase("started", "Start", 0, 0, { timing: "Session started", tone: "gray" }),
        phase("seeds-planted", "Plant Seeds", 0, DAY_HOURS, { timing: "Day 0", tone: "germination" }),
        phase("keep-cubes-moist", "Keep Cubes Moist", DAY_HOURS, 2 * DAY_HOURS, { timing: "Day 1-3", tone: "germination" }),
        phase("watch-sprouts", "Watch for Sprouts", 2 * DAY_HOURS, 5 * DAY_HOURS, { timing: "Day 2-5", tone: "green" }),
        phase("complete", "Complete", 5 * DAY_HOURS, null, { timing: "Day 5+", tone: "completed" }),
      ];
    }

    if (methodKey === "RAPID_ROOTER") {
      return [
        phase("started", "Start", 0, 0, { timing: "Session started", tone: "green" }),
        phase("seeds-planted", "Plant Seeds", 0, DAY_HOURS, { timing: "Day 0", tone: "germination" }),
        phase("keep-plugs-moist", "Keep Plugs Moist", DAY_HOURS, 2 * DAY_HOURS, { timing: "Day 1-3", tone: "germination" }),
        phase("watch-sprouts", "Watch for Sprouts", 2 * DAY_HOURS, 5 * DAY_HOURS, { timing: "Day 2-5", tone: "green" }),
        phase("complete", "Complete", 5 * DAY_HOURS, null, { timing: "Day 5+", tone: "completed" }),
      ];
    }

    return null;
  }

  function getEffectiveMethodDefinition(definition, methodKey, session) {
    const preparedPhases = hasPreparedMediaSetup(session) ? getPreparedMediaPhases(methodKey) : null;
    if (!preparedPhases) {
      return definition;
    }
    return {
      ...definition,
      phases: preparedPhases,
      startLabel: "Seeds planted",
    };
  }

  function parseTimestamp(value) {
    const normalized = String(value || "").trim();
    if (!normalized) {
      return null;
    }
    const parsed = new Date(normalized);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function parseSessionStartDateTime(sessionDate, sessionTime) {
    const normalizedDate = String(sessionDate || "").trim();
    if (!normalizedDate) {
      return null;
    }
    const normalizedTime = String(sessionTime || "").trim() || "00:00";
    const parsed = new Date(`${normalizedDate}T${normalizedTime}:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function addHours(date, hours) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      return null;
    }
    return new Date(date.getTime() + (Math.max(0, Number(hours) || 0) * HOUR_MS));
  }

  function normalizeSessionStatus(value) {
    const normalized = String(value || "").trim().toLowerCase();
    if (["germinating", "germination", "first-germinated"].includes(normalized)) {
      return "germinating";
    }
    if (["completed", "closed"].includes(normalized)) {
      return "completed";
    }
    if (normalized === "soaking") {
      return "soaking";
    }
    if (normalized === "active" || normalized === "custom") {
      return "active";
    }
    return normalized || "unselected";
  }

  function getSessionMethodKey(session, fallbackMethod) {
    return normalizeMethodKey(
      fallbackMethod
      || session?.methodType
      || session?.method_type
      || session?.systemType
      || session?.system_type
      || ""
    );
  }

  function getStartAt(session) {
    return parseTimestamp(session?.soakStartedAt || session?.soak_started_at || "")
      || parseTimestamp(session?.timerStartAt || session?.timer_start_at || "")
      || parseTimestamp(session?.sessionStartedAt || session?.session_started_at || "")
      || parseSessionStartDateTime(session?.date || "", session?.time || "")
      || parseTimestamp(session?.createdAt || session?.created_at || "");
  }

  function getPaperTowelStartAt(session, methodKey, startAt) {
    if (methodKey === "PAPER_TOWEL") {
      return startAt;
    }
    return parseTimestamp(session?.paperTowelStartedAt || session?.paper_towel_started_at || "")
      || parseTimestamp(session?.germinationStartedAt || session?.germination_started_at || "")
      || null;
  }

  function getAnchorAt(anchorName, context) {
    switch (anchorName || "start") {
      case "paperTowelStart":
        return context.paperTowelStartAt || null;
      case "germinationStart":
        return context.germinationStartedAt || null;
      case "plantedStart":
        return context.firstPlantedAt || context.startAt || null;
      case "start":
      default:
        return context.startAt || null;
    }
  }

  function getResultSummary(session, explicitResults) {
    const source = explicitResults && typeof explicitResults === "object" ? explicitResults : {};
    const partitions = Array.isArray(session?.partitions) ? session.partitions : [];
    const fromPartitions = partitions.reduce((summary, partition) => {
      const seedCount = Number(partition?.seedCount ?? partition?.seed_count ?? "");
      const plantedRaw = String(partition?.plantedCount ?? partition?.planted_count ?? "").trim();
      const plantedCount = Number(plantedRaw);
      if (Number.isFinite(seedCount) && seedCount > 0) {
        summary.totalSeeds += seedCount;
        if (plantedRaw !== "" && Number.isFinite(plantedCount) && plantedCount >= 0) {
          const germinated = Math.max(0, Math.min(seedCount, plantedCount));
          summary.totalGerminated += germinated;
          summary.totalAccounted += seedCount;
        }
      }
      return summary;
    }, { totalSeeds: 0, totalGerminated: 0, totalAccounted: 0 });

    const totalSeeds = Number.isFinite(Number(source.totalSeeds)) ? Math.max(0, Number(source.totalSeeds)) : fromPartitions.totalSeeds;
    const totalGerminated = Number.isFinite(Number(source.totalGerminated ?? source.totalPlanted))
      ? Math.max(0, Number(source.totalGerminated ?? source.totalPlanted))
      : fromPartitions.totalGerminated;
    const totalAccounted = Number.isFinite(Number(source.totalAccounted))
      ? Math.max(0, Number(source.totalAccounted))
      : fromPartitions.totalAccounted;

    return {
      totalSeeds,
      totalGerminated: Math.min(totalSeeds || totalGerminated, totalGerminated),
      totalAccounted,
      hasAnyResultEntry: totalSeeds > 0 && totalAccounted > 0,
      hasCompleteResultEntry: totalSeeds > 0 && totalAccounted >= totalSeeds,
    };
  }

  function getTimelineSteps(definition, context, state) {
    const phases = Array.isArray(definition.phases) ? definition.phases : [];
    const currentKey = state.currentPhase?.key || "";
    const completed = Boolean(state.completedAt);
    const nowMs = state.now.getTime();

    return phases.map((item) => {
      const anchorAt = getAnchorAt(item.from, context);
      const startAt = addHours(anchorAt, item.startHour);
      const endAt = item.endHour === null || item.endHour === undefined ? null : addHours(anchorAt, item.endHour);
      const isCurrent = item.key === currentKey;
      const isComplete = completed
        ? item.key !== "complete" || Boolean(state.completedAt)
        : Boolean(endAt && nowMs >= endAt.getTime() && !isCurrent);
      return {
        key: item.key,
        label: item.label,
        timing: item.timing,
        tone: item.tone,
        iconName: item.iconName || getDefaultIconName(item.key),
        startAt: startAt ? startAt.toISOString() : "",
        endAt: endAt ? endAt.toISOString() : "",
        isCurrent,
        isComplete,
        isFuture: !isCurrent && !isComplete,
        requiredConfirmation: item.requiredConfirmation || "",
        preparationComplete: item.preparationComplete === true,
        statusLabel: item.statusLabel || "",
      };
    });
  }

  function getDefaultIconName(phaseKey) {
    const normalized = String(phaseKey || "").trim();
    if (["soaking", "soak", "ready-transfer", "prep-cubes", "prep-plugs"].includes(normalized)) {
      return "stage-soaking";
    }
    if ([
      "germination",
      "paper-towel",
      "seeds-started",
      "seeds-planted",
      "move-germination",
      "keep-moist",
      "keep-cubes-moist",
      "keep-plugs-moist",
    ].includes(normalized)) {
      return "stage-germination";
    }
    if (["check-window", "emergence", "first-check", "check-seeds", "check-sprouts", "watch-sprouts"].includes(normalized)) {
      return "stage-first-germinated";
    }
    if (["complete", "completion-window"].includes(normalized)) {
      return "stage-completed";
    }
    return "stage-soaking";
  }

  function resolveCurrentPhase(definition, context, now, completedAt) {
    const phases = Array.isArray(definition.phases) ? definition.phases : [];
    if (completedAt) {
      return phases.find((item) => item.key === "complete") || phases[phases.length - 1] || null;
    }

    const candidates = phases
      .map((item) => {
        const anchorAt = getAnchorAt(item.from, context);
        const startAt = addHours(anchorAt, item.startHour);
        const endAt = item.endHour === null || item.endHour === undefined ? null : addHours(anchorAt, item.endHour);
        return { item, startAt, endAt };
      })
      .filter((entry) => entry.startAt && now.getTime() >= entry.startAt.getTime())
      .filter((entry) => !entry.endAt || now.getTime() < entry.endAt.getTime())
      .sort((left, right) => right.startAt.getTime() - left.startAt.getTime());

    return candidates[0]?.item || phases[0] || null;
  }

  function getMilestoneDueAt(session, milestone, options) {
    if (!milestone) {
      return null;
    }
    const methodKey = getSessionMethodKey(session, options?.method);
    const startAt = getStartAt(session);
    const context = {
      startAt,
      germinationStartedAt: parseTimestamp(session?.germinationStartedAt || session?.germination_started_at || ""),
      firstPlantedAt: parseTimestamp(session?.firstPlantedAt || session?.first_planted_at || ""),
      paperTowelStartAt: getPaperTowelStartAt(session, methodKey, startAt),
    };
    return addHours(getAnchorAt(milestone?.from || "start", context), milestone?.atHours ?? milestone?.sendAfterHours ?? 0);
  }

  function calculateSessionState(input, maybeOptions) {
    const session = input?.session || input || {};
    const options = input?.session ? input : (maybeOptions || {});
    const now = options.now instanceof Date && !Number.isNaN(options.now.getTime())
      ? options.now
      : parseTimestamp(options.now) || new Date();
    const methodKey = getSessionMethodKey(session, options.method);
    const definition = getEffectiveMethodDefinition(getMethodDefinition(methodKey), methodKey, session);
    const status = normalizeSessionStatus(session?.sessionStatus || session?.session_status || "");
    const startAt = getStartAt(session);
    const completedAt = parseTimestamp(session?.completedAt || session?.completed_at || "");
    const germinationStartedAt = parseTimestamp(session?.germinationStartedAt || session?.germination_started_at || "");
    const firstPlantedAt = parseTimestamp(session?.firstPlantedAt || session?.first_planted_at || "");
    const paperTowelStartAt = getPaperTowelStartAt(session, methodKey, startAt);
    const resultSummary = getResultSummary(session, options.results);
    const context = { startAt, germinationStartedAt, firstPlantedAt, paperTowelStartAt };
    const elapsedMs = startAt ? Math.max(0, now.getTime() - startAt.getTime()) : 0;
    const elapsedHours = elapsedMs / HOUR_MS;
    const currentPhase = resolveCurrentPhase(definition, context, now, completedAt);
    const completionWindowStartAt = addHours(getAnchorAt(definition.completionWindow?.from || "start", context), definition.completionWindow?.startHour || 0);
    const completionWindowEndAt = addHours(getAnchorAt(definition.completionWindow?.from || "start", context), definition.completionWindow?.endHour || definition.overdueAfterHours || 0);
    const overdueAnchorAt = getAnchorAt(definition.completionWindow?.from || "start", context);
    const overdueAt = addHours(overdueAnchorAt, definition.overdueAfterHours || definition.completionWindow?.endHour || 0);
    const milestones = (definition.milestones || [])
      .map((item) => {
        const dueAt = addHours(getAnchorAt(item.from, context), item.atHours);
        return {
          ...item,
          dueAt: dueAt ? dueAt.toISOString() : "",
          isDue: Boolean(dueAt && now.getTime() >= dueAt.getTime()),
          isFuture: Boolean(dueAt && now.getTime() < dueAt.getTime()),
        };
      })
      .filter((item) => item.dueAt);
    const dueMilestones = milestones
      .filter((item) => item.isDue)
      .sort((left, right) => (Date.parse(right.dueAt) || 0) - (Date.parse(left.dueAt) || 0));
    const nextMilestone = milestones
      .filter((item) => item.isFuture)
      .sort((left, right) => (Date.parse(left.dueAt) || 0) - (Date.parse(right.dueAt) || 0))[0] || null;
    const activeMilestone = completedAt ? null : (dueMilestones[0] || null);
    const expectedEnd = completionWindowEndAt || overdueAt;
    const progressPercentage = completedAt
      ? 100
      : Math.max(0, Math.min(99, expectedEnd && startAt ? Math.round((elapsedMs / Math.max(1, expectedEnd.getTime() - startAt.getTime())) * 100) : 0));
    const requiresResultEntry = Boolean(completedAt && definition.resultRequired !== false && !resultSummary.hasCompleteResultEntry);
    const isOverdue = Boolean(!completedAt && overdueAt && now.getTime() >= overdueAt.getTime());
    const requiredUserActions = [];

    if (activeMilestone?.requiredAction) {
      requiredUserActions.push({
        key: activeMilestone.requiredAction,
        label: activeMilestone.actionText || activeMilestone.title,
        milestoneKey: activeMilestone.key,
        priority: activeMilestone.level === "critical" ? "high" : "normal",
      });
    }
    if (requiresResultEntry) {
      requiredUserActions.push({
        key: "record-germination-results",
        label: "Record germination results",
        priority: "high",
      });
    }

    const state = {
      methodKey,
      methodName: definition.displayName,
      definition,
      currentPhase: currentPhase ? {
        key: currentPhase.key,
        label: currentPhase.label,
        timing: currentPhase.timing || "",
        tone: currentPhase.tone || definition.tone || "green",
      } : null,
      phaseLabel: currentPhase?.label || "Tracking",
      startedAt: startAt ? startAt.toISOString() : "",
      completedAt: completedAt ? completedAt.toISOString() : "",
      elapsedMs,
      elapsedHours,
      nextMilestone,
      activeMilestone,
      dueMilestones,
      expectedCompletionWindow: {
        startAt: completionWindowStartAt ? completionWindowStartAt.toISOString() : "",
        endAt: completionWindowEndAt ? completionWindowEndAt.toISOString() : "",
      },
      overdueStatus: {
        isOverdue,
        level: isOverdue ? (elapsedHours >= (definition.overdueAfterHours || 0) + 24 ? "critical" : "warning") : "none",
        label: isOverdue ? "Overdue" : "On track",
        overdueAt: overdueAt ? overdueAt.toISOString() : "",
      },
      progressPercentage,
      requiredUserActions,
      requiresResultEntry,
      resultSummary,
      status,
      now,
    };
    return {
      ...state,
      timelineSteps: getTimelineSteps(definition, context, state),
    };
  }

  function buildReminderRules(methodKeys) {
    const requestedMethodKeys = typeof methodKeys === "string"
      ? [methodKeys]
      : (methodKeys && typeof methodKeys === "object" && !Array.isArray(methodKeys) && methodKeys.method)
        ? [methodKeys.method]
        : methodKeys;
    const keys = Array.isArray(requestedMethodKeys) && requestedMethodKeys.length
      ? requestedMethodKeys.map(normalizeMethodKey)
      : Object.keys(METHOD_DEFINITIONS);
    return keys.flatMap((methodKey) => {
      const definition = getMethodDefinition(methodKey);
      return (definition.milestones || []).map((item) => ({
        ...item,
        methodKey,
        sendAfterHours: item.atHours,
        body: item.message,
        skipReasonDisabled: item.category === "soaking-reminder"
          ? "Soaking reminders are disabled for this user."
          : "Germination reminders are disabled for this user.",
        actions: [
          { action: "open-session", title: "Open Session", routeMode: "session" },
          { action: item.requiredAction || "review-session", title: "Review Session", routeMode: "session" },
        ],
      }));
    });
  }

  return freeze({
    HOUR_MS,
    METHOD_DEFINITIONS,
    normalizeMethodKey,
    getMethodDefinition,
    calculateSessionState,
    buildReminderRules,
    getMilestoneDueAt,
    parseTimestamp,
  });
}));
