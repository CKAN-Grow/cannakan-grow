const STORAGE_KEY = "cannakan-grow-sessions";
const SAMPLE_SEED_KEY = "cannakan-grow-sample-seed-version";
const SAMPLE_SEED_VERSION = "history-preview-v3";
const GALLERY_MOCK_DATA_VERSION = "community-leaderboard-preview-v1";
const GALLERY_SNAPSHOT_PAGE_SIZE = 12;
const MOCK_DATA_STORAGE_KEY = "cannakanGrowMockDataEnabled";
const ANNOUNCEMENT_STORAGE_KEY = "cannakanGrowAnnouncement";
const FILTER_PAPER_INVENTORY_STORAGE_KEY = "cannakanGrowFilterPaperInventory";
const FILTER_PAPER_DEDUCTION_REGISTRY_STORAGE_KEY = "cannakanGrowFilterPaperDeductionRegistry";
const MOCK_DATA_ACTIVE_NOTICE = "Mock Data Active - Testing Only";
const GALLERY_MOCK_USER_ID = "dev-mock-gallery";
const TIME_FORMAT_KEY = "cannakan-grow-time-format";
const THEME_KEY = "cannakan-grow-theme";
const BACK_TO_TOP_VISIBILITY_OFFSET = 300;
const SESSION_IMAGE_BUCKET = "session-images";
const PROFILE_AVATAR_BUCKET = "profile-avatars";
const SOURCE_LOGO_BUCKET = "source-logos";
const LEADERBOARD_AUDIT_DEFAULT_FILTERS = Object.freeze({
  startDate: "",
  endDate: "",
  source: "",
  seedVariety: "",
  seedType: "",
  profile: "",
  status: "all",
  inclusion: "all",
});
const AUTH_NAVIGATION_KEYS = [
  "cannakan-grow-last-route",
  "cannakan-grow-last-session-id",
  "cannakan-grow-last-session-route",
];
const MAX_SESSION_IMAGES = 3;
const MAX_IMAGE_SIZE_BYTES = 12 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1600;
const MAX_AVATAR_DIMENSION = 512;
const MAX_SOURCE_LOGO_DIMENSION = 768;
const ACTIVE_MEMBER_LOOKBACK_DAYS = 30;
const GROW_GALLERY_BUCKET = "grow-gallery";
const SOURCES_TABLE = "sources";
const GROW_GALLERY_LIKES_TABLE = "grow_gallery_snapshot_likes";
const LEGACY_GROW_GALLERY_LIKES_TABLE = "grow_gallery_snapshot_like";
const GROW_FOLLOWS_TABLE = "grow_follows";
const COMMUNITY_ACTIVITY_TABLE = "community_activity";
const USER_NOTIFICATION_PREFERENCES_TABLE = "user_notification_preferences";
const DEFAULT_ANNOUNCEMENT_BUTTON_TEXT = "View on Instagram →";
const MESSAGE_BOARD_DISPLAY_MODE_STORAGE_KEY = "cannakanGrowAnnouncementDisplayMode";
const FALLBACK_JOKES_STORAGE_KEY = "cannakanGrowFallbackJokes";
const FALLBACK_FACTS_STORAGE_KEY = "cannakanGrowFallbackFacts";
const FALLBACK_MODE_STORAGE_KEY = "cannakanGrowFallbackMode";
const RECENT_FALLBACK_ITEMS_STORAGE_KEY = "cannakanGrowRecentFallbackItems";
const DEFAULT_ANNOUNCEMENT_IMAGE_STORAGE_KEY = "cannakanGrowDefaultAnnouncementImage";
const DEFAULT_JOKE_IMAGE_STORAGE_KEY = "cannakanGrowDefaultJokeImage";
const DEFAULT_FACT_IMAGE_STORAGE_KEY = "cannakanGrowDefaultFactImage";
const MIXED_IMAGE_MODE_STORAGE_KEY = "cannakanGrowMixedImageMode";
const ADMIN_MEMBERS_OPEN_STORAGE_KEY = "cannakanAdminMembersOpen";
const ADMIN_SOURCES_OPEN_STORAGE_KEY = "cannakanAdminSourcesOpen";
const ADMIN_MESSAGE_BOARD_OPEN_STORAGE_KEY = "cannakanAdminMessageBoardOpen";
const ADMIN_USER_REPORTS_OPEN_STORAGE_KEY = "cannakanAdminUserReportsOpen";
const ADMIN_ANALYTICS_OPEN_STORAGE_KEY = "cannakanAdminAnalyticsOpen";
const ADMIN_VISITOR_ANALYTICS_OPEN_STORAGE_KEY = "cannakanAdminVisitorAnalyticsOpen";
const SITE_ANALYTICS_ENABLED = false;
const SITE_ANALYTICS_TABLE = "site_analytics_events";
const ADMIN_REPORTS_TABLE = "admin_reports";
const AUTH_FORGOT_PASSWORD_COOLDOWN_MS = 15000;
const SITE_ANALYTICS_PRESENCE_CHANNEL = "cannakan-grow-presence";
const SITE_ANALYTICS_VISITOR_ID_STORAGE_KEY = "cannakanGrowVisitorId";
const SITE_ANALYTICS_VISIT_ID_SESSION_KEY = "cannakanGrowVisitId";
const SITE_ANALYTICS_VISIT_LOGGED_SESSION_KEY = "cannakanGrowVisitLogged";
const SITE_ANALYTICS_PWA_LOGGED_SESSION_KEY = "cannakanGrowPwaLaunchLogged";
const SITE_ANALYTICS_HEARTBEAT_MS = 30000;
const SITE_ANALYTICS_ACTIVE_WINDOW_MS = 5 * 60 * 1000;
const SITE_ANALYTICS_DEFAULT_FILTER = "today";
const SUPABASE_MISSING_TABLE_ERROR_CODES = new Set(["PGRST116", "PGRST205", "42P01"]);
const SUPABASE_MISSING_COLUMN_ERROR_CODES = new Set(["PGRST204", "42703"]);
const FALLBACK_CONTENT_HISTORY_LIMIT = 7;
const DEFAULT_ANNOUNCEMENT_FALLBACK_SUBTEXT = "No announcements right now. Here’s something to grow on.";
const DEFAULT_MESSAGE_BOARD_DISPLAY_MODE = "announcement";
const DEFAULT_FALLBACK_CONTENT_MODE = "mixed";
const DEFAULT_MIXED_IMAGE_MODE = "match-type";
const MESSAGE_BOARD_IMAGE_FALLBACK_URL = "/public/assets/wow-fallback.png";
const DEFAULT_GROW_JOKES = Object.freeze([
  { question: "Why did the seed bring a blanket?", answer: "It wanted to stay warm before sprouting." },
  { question: "Why was the gardener so calm?", answer: "They knew everything would grow in due thyme." },
  { question: "Why did the tomato turn red in the garden?", answer: "It saw the salad dressing." },
  { question: "Why did the bean plant win the race?", answer: "It knew how to spring ahead." },
  { question: "What did the flowerpot say after a long day?", answer: "I need a little space to grow." },
  { question: "Why did the gardener carry a pencil?", answer: "To draw up a planting plan." },
  { question: "What do seedlings study in school?", answer: "Stem subjects." },
  { question: "Why did the sunflower sit in the front row?", answer: "It wanted a brighter future." },
  { question: "What did one seed say to the other at sunrise?", answer: "Time to rise and root." },
  { question: "Why don’t gardens tell secrets?", answer: "Because the potatoes always spill the beans." },
  { question: "What kind of stories do gardeners love?", answer: "Plot twists." },
  { question: "Why did the watering can get promoted?", answer: "It always poured its heart into the job." },
  { question: "What did the carrot say after a workout?", answer: "I’m really starting to feel rooted." },
  { question: "Why was the compost pile such a good friend?", answer: "It always knew how to break things down." },
  { question: "Why did the gardener talk to the sprouts?", answer: "A little encouragement helps them come out of their shell." },
  { question: "What’s a gardener’s favorite kind of math?", answer: "Mulch-tiplication." },
  { question: "Why did the peas get along so well?", answer: "They were in the same pod cast." },
  { question: "What did the rake say to the leaves?", answer: "I’m falling for all of you." },
  { question: "Why did the gardener plant light bulbs?", answer: "They wanted a power garden." },
  { question: "What did the shovel say after planting day?", answer: "That was groundbreaking work." },
  { question: "Why did the lettuce enjoy the garden party?", answer: "Because everyone was so refreshing." },
  { question: "Why was the greenhouse so popular?", answer: "It was always full of warm welcomes." },
  { question: "What do you call a fast-growing herb garden?", answer: "A mint condition miracle." },
  { question: "Why did the gardener smile at the rain cloud?", answer: "It looked like a shower of support." },
]);
const DEFAULT_GROW_FACTS = Object.freeze([
  "Seeds need moisture, oxygen, and warmth to begin germination.",
  "Many seeds germinate best when the growing medium stays evenly moist, not soaked.",
  "Good airflow helps seedlings grow sturdier and reduces damping-off risk.",
  "Most seedlings stretch when light is too weak or too far away.",
  "Warm root-zone temperatures often improve germination speed and consistency.",
  "A clean seed tray helps reduce disease pressure during early growth.",
  "Bottom watering can help seedlings take up moisture without disturbing the soil surface.",
  "Different crops have different preferred germination temperatures, so labels matter.",
  "Fresh seeds usually germinate more reliably than older seeds stored in poor conditions.",
  "Using a humidity dome can help retain moisture during the earliest stage of germination.",
  "Removing a humidity dome after sprouting helps improve airflow and prevent excess moisture.",
  "Seedlings benefit from a light breeze because it encourages stronger stems.",
  "Overcrowded trays can limit airflow and increase competition for light.",
  "Roots need oxygen too, which is why compacted or waterlogged media can slow growth.",
  "Consistent temperatures usually produce more even germination than big swings between hot and cold.",
  "Labeling trays with the sowing date makes it easier to track germination timing.",
  "Some seeds germinate faster after soaking, while others prefer to be sown dry.",
  "A sterile seed-starting mix is lighter and gentler for new roots than heavy garden soil.",
  "True leaves appear after the first seed leaves and signal that feeding may begin soon.",
  "Hardening off helps indoor seedlings adjust gradually to outdoor sun, wind, and temperature changes.",
]);
const loggedRuntimeIssueKeys = new Set();
const SOURCE_CATALOG_DATALIST_ID = "source-catalog-options";
const NEW_SESSION_NOTES_DRAFT_KEY = "cannakan-grow-new-session-notes-draft";
const FILTER_PAPER_STORE_URLS = Object.freeze({
  US: "https://cannakan.com/products/filter-papers-90mm",
  EU: "https://cannakan.eu/products/filter-papers-90mm",
});
// Button label intentionally generic to avoid SKU lock-in.
const FILTER_PAPER_REORDER_BUTTON_LABEL = "Reorder Filter Papers";
const DEFAULT_FILTER_PAPER_INVENTORY = Object.freeze({
  count: 0,
  autoSubtract: true,
  notifyLowSupply: true,
  storeRegion: "US",
});
const DEFAULT_NOTIFICATION_PREFERENCES = Object.freeze({
  notifySnapshot: true,
  notifyCompletion: true,
  notifyFollow: true,
  notifyLike: true,
  createdAt: "",
  updatedAt: "",
});
const DEFAULT_PROFILE_PAGE_SETTINGS = Object.freeze({
  notifyCommunityActivity: false,
  showProfileInCommunityGrow: true,
  allowFollowers: true,
  showGrowStatsPublicly: true,
});
const PROFILE_PAGE_SETTINGS_STORAGE_KEY = "cannakanGrowProfilePageSettings";
const USER_NOTIFICATION_PREFERENCES_LEGACY_COLUMNS = Object.freeze([
  "notify_snapshot",
  "notify_completion",
  "notify_follow",
  "notify_like",
]);
const USER_NOTIFICATION_PREFERENCES_MODERN_COLUMNS = Object.freeze([
  "email_notifications",
  "low_filter_alerts",
  "session_reminders",
  "community_updates",
]);
const USER_NOTIFICATION_PREFERENCES_SCHEMA_MODES = new Set(["legacy", "modern", "hybrid"]);
const GALLERY_TOP_MEMBERS_MOCK_ENTRIES = Object.freeze([
  {
    key: "mock-avery-moss",
    name: "Avery Moss",
    avatarUrl: buildMockGalleryProfileAvatarDataUri("Avery Moss", "Humboldt Seed Co", 0),
    snapshotCount: 36,
    totalLikes: 1156,
    averageGermination: 97,
  },
  {
    key: "mock-don-cannakan",
    name: "Don-Cannakan",
    avatarUrl: buildMockGalleryProfileAvatarDataUri("Don-Cannakan", "Royal Queen Seeds", 1),
    snapshotCount: 24,
    totalLikes: 842,
    averageGermination: 98,
  },
  {
    key: "mock-mo",
    name: "Mo",
    avatarUrl: buildMockGalleryProfileAvatarDataUri("Mo", "Barney's Farm", 2),
    snapshotCount: 18,
    totalLikes: 611,
    averageGermination: 94,
  },
]);
const GROW_NETWORK_MOCK_PROFILES = Object.freeze([
  { id: "mock-avery-moss", displayName: "Avery Moss", averageGermination: 96, approvedSnapshots: 36, likes: 1156, favoriteSeedType: "Photo", favoriteSource: "Humboldt Seed Co", followerCount: 218, followingCount: 64, isFollowing: true },
  { id: "mock-don-cannakan", displayName: "Don-Cannakan", averageGermination: 98, approvedSnapshots: 24, likes: 842, favoriteSeedType: "Photo", favoriteSource: "Royal Queen Seeds", followerCount: 194, followingCount: 58, isFollowing: true },
  { id: "mock-mo", displayName: "Mo", averageGermination: 94, approvedSnapshots: 18, likes: 611, favoriteSeedType: "Auto", favoriteSource: "Barney's Farm", followerCount: 167, followingCount: 46, isFollowing: true },
  { id: "mock-greenlab", displayName: "GreenLab", averageGermination: 89, approvedSnapshots: 14, likes: 402, favoriteSeedType: "Photo", favoriteSource: "Green House", followerCount: 123, followingCount: 35, isFollowing: true },
  { id: "mock-seedvault", displayName: "SeedVault", averageGermination: 96, approvedSnapshots: 21, likes: 780, favoriteSeedType: "Auto", favoriteSource: "Fast Buds", followerCount: 176, followingCount: 40, isFollowing: true },
  { id: "mock-rootrunner", displayName: "RootRunner", averageGermination: 87, approvedSnapshots: 9, likes: 188, favoriteSeedType: "Fast", favoriteSource: "Fast Buds", followerCount: 72, followingCount: 22, isFollowing: true },
  { id: "mock-sproutscout", displayName: "SproutScout", averageGermination: 93, approvedSnapshots: 16, likes: 530, favoriteSeedType: "Photo", favoriteSource: "Ethos Genetics", followerCount: 144, followingCount: 39, isFollowing: true },
  { id: "mock-kan-trial-user", displayName: "KAN Trial User", averageGermination: 90, approvedSnapshots: 7, likes: 144, favoriteSeedType: "Auto", favoriteSource: "Cannakan Labs", followerCount: 58, followingCount: 18, isFollowing: true },
  { id: "mock-old-seed-rescue", displayName: "Old Seed Rescue", averageGermination: 91, approvedSnapshots: 11, likes: 290, favoriteSeedType: "Regular", favoriteSource: "Archive Seeds", followerCount: 86, followingCount: 28, isFollowing: false },
  { id: "mock-humboldt-tester", displayName: "Humboldt Tester", averageGermination: 95, approvedSnapshots: 19, likes: 690, favoriteSeedType: "Photo", favoriteSource: "Humboldt Seed Co", followerCount: 162, followingCount: 44, isFollowing: false },
  { id: "mock-eu-germination-lab", displayName: "EU Germination Lab", averageGermination: 92, approvedSnapshots: 13, likes: 356, favoriteSeedType: "Auto", favoriteSource: "Sweet Seeds", followerCount: 108, followingCount: 32, isFollowing: false },
  { id: "mock-multi-variety-max", displayName: "Multi-Variety Max", averageGermination: 88, approvedSnapshots: 10, likes: 240, favoriteSeedType: "Mixed", favoriteSource: "Multi-Source", followerCount: 79, followingCount: 24, isFollowing: false },
]);
const GROW_NETWORK_TEST_NOTIFICATION_EMAIL = "don@cannakan.com";
const GROW_NETWORK_NOTIFICATION_GROUP_WINDOW_MS = 10 * 60 * 1000;
const GROW_NETWORK_NOTIFICATION_MAX_STACKED_AVATARS = 3;
const GROW_NETWORK_NOTIFICATION_MOCK_REFERENCE_AT = "2026-05-02T12:00:00.000Z";
const GROW_NETWORK_MOCK_ACTIVITIES = Object.freeze([
  {
    id: "mock-activity-avery-snapshot",
    memberId: "mock-avery-moss",
    activityType: "approved-snapshot",
    typeLabel: "New approved Community Grow snapshot",
    typeMeta: "Approved in Community Grow",
    title: "Avery Moss submitted a 96% germination snapshot",
    summary: "Photo run with a strong early finish and clean germination consistency.",
    germinationRateLabel: "96%",
    sourceLabel: "Photo",
    occurredAt: "2026-05-01T09:18:00.000Z",
    sessionRoute: "#gallery",
  },
  {
    id: "mock-activity-don-session",
    memberId: "mock-don-cannakan",
    activityType: "shared-session",
    typeLabel: "Public session shared",
    typeMeta: "Public session now visible",
    title: "Don-Cannakan started a new KAN® session",
    summary: "Fresh public session shared for photo-line benchmarking.",
    germinationRateLabel: "98%",
    sourceLabel: "Photo",
    occurredAt: "2026-05-01T08:02:00.000Z",
    sessionRoute: "#gallery",
  },
  {
    id: "mock-activity-mo-follow",
    memberId: "mock-mo",
    activityType: "approved-snapshot",
    typeLabel: "Grow Network update",
    typeMeta: "Community connection",
    title: "Mo followed SeedVault",
    summary: "Added a high-performing auto grower to the network.",
    germinationRateLabel: "94%",
    sourceLabel: "Auto",
    occurredAt: "2026-05-01T06:42:00.000Z",
    sessionRoute: "#members/mock-seedvault",
  },
  {
    id: "mock-activity-greenlab-perfect",
    memberId: "mock-greenlab",
    activityType: "completed-session",
    typeLabel: "Completed public session",
    typeMeta: "Approved in Community Grow",
    title: "GreenLab reached 100% germination",
    summary: "Perfect completion on a photo trial with a public wrap-up.",
    germinationRateLabel: "100%",
    sourceLabel: "Photo",
    occurredAt: "2026-04-30T20:14:00.000Z",
    sessionRoute: "#gallery",
  },
  {
    id: "mock-activity-rootrunner-snapshot",
    memberId: "mock-rootrunner",
    activityType: "approved-snapshot",
    typeLabel: "New approved Community Grow snapshot",
    typeMeta: "Approved in Community Grow",
    title: "RootRunner posted a new Community Grow snapshot",
    summary: "Fast-cycle update with a fresh tray check-in.",
    germinationRateLabel: "87%",
    sourceLabel: "Fast",
    occurredAt: "2026-04-30T16:25:00.000Z",
    sessionRoute: "#gallery",
  },
  {
    id: "mock-activity-seedvault-source",
    memberId: "mock-seedvault",
    activityType: "approved-snapshot",
    typeLabel: "Grow Network update",
    typeMeta: "Leaderboard highlight",
    title: "SeedVault became this month’s top source tester",
    summary: "Auto-heavy runs are leading this month’s source chart.",
    germinationRateLabel: "96%",
    sourceLabel: "Auto",
    occurredAt: "2026-04-30T13:38:00.000Z",
    sessionRoute: "#gallery",
  },
  {
    id: "mock-activity-sproutscout-complete",
    memberId: "mock-sproutscout",
    activityType: "completed-session",
    typeLabel: "Completed public session",
    typeMeta: "Approved in Community Grow",
    title: "SproutScout completed a multi-variety session",
    summary: "Shared the final public results from a mixed-variety comparison.",
    germinationRateLabel: "93%",
    sourceLabel: "Photo",
    occurredAt: "2026-04-30T10:11:00.000Z",
    sessionRoute: "#gallery",
  },
  {
    id: "mock-activity-kan-joined",
    memberId: "mock-kan-trial-user",
    activityType: "shared-session",
    typeLabel: "Grow Network update",
    typeMeta: "New member",
    title: "KAN Trial User joined the Grow Network",
    summary: "Started sharing public test runs for new growers to compare against.",
    germinationRateLabel: "90%",
    sourceLabel: "Auto",
    occurredAt: "2026-04-29T18:47:00.000Z",
    sessionRoute: "#members/mock-kan-trial-user",
  },
]);
const GROW_NETWORK_MOCK_NOTIFICATIONS = Object.freeze([
  {
    id: "mock-notification-avery-follow",
    type: "follow",
    displayName: "Avery Moss",
    avatarUrl: "https://i.pravatar.cc/96?u=avery-moss",
    occurredAt: "2026-05-02T11:58:00.000Z",
    isUnseen: true,
    targetId: "self-follow",
    targetLabel: "you",
    targetRoute: "#network",
  },
  {
    id: "mock-notification-sarah-follow",
    type: "follow",
    displayName: "Sarah K.",
    avatarUrl: "https://i.pravatar.cc/96?u=sarah-k",
    occurredAt: "2026-05-02T11:54:30.000Z",
    isUnseen: true,
    targetId: "self-follow",
    targetLabel: "you",
    targetRoute: "#network",
  },
  {
    id: "mock-notification-mike-follow",
    type: "follow",
    displayName: "Mike R.",
    avatarUrl: "https://i.pravatar.cc/96?u=mike-r",
    occurredAt: "2026-05-02T11:51:30.000Z",
    isUnseen: false,
    targetId: "self-follow",
    targetLabel: "you",
    targetRoute: "#network",
  },
  {
    id: "mock-notification-humboldt-grow-session-like",
    type: "like",
    displayName: "Humboldt Seed Co",
    avatarUrl: "",
    occurredAt: "2026-05-02T11:49:00.000Z",
    isUnseen: true,
    targetId: "grow-session-demo",
    targetType: "session",
    targetLabel: "Grow Session",
    targetName: "KAN Session - May 2",
    targetRoute: "#sessions",
  },
  {
    id: "mock-notification-alex-grow-session-like",
    type: "like",
    displayName: "Alex P.",
    avatarUrl: "https://i.pravatar.cc/96?u=alex-p",
    occurredAt: "2026-05-02T11:46:30.000Z",
    isUnseen: true,
    targetId: "grow-session-demo",
    targetType: "session",
    targetLabel: "Grow Session",
    targetName: "KAN Session - May 2",
    targetRoute: "#sessions",
  },
  {
    id: "mock-notification-tina-grow-session-like",
    type: "like",
    displayName: "Tina L.",
    avatarUrl: "",
    occurredAt: "2026-05-02T11:43:30.000Z",
    isUnseen: false,
    targetId: "grow-session-demo",
    targetType: "session",
    targetLabel: "session",
    targetName: "KAN Session - May 2",
    targetRoute: "#sessions",
  },
  {
    id: "mock-notification-sarah-snapshot-like",
    type: "like",
    displayName: "Sarah K.",
    avatarUrl: "https://i.pravatar.cc/96?u=sarah-k-snapshot",
    occurredAt: "2026-05-02T11:22:00.000Z",
    isUnseen: true,
    targetId: "snapshot-demo",
    targetType: "snapshot",
    targetLabel: "snapshot",
    targetName: "Snapshot - May 2",
    targetRoute: "#gallery",
  },
  {
    id: "mock-notification-network-trending",
    type: "system",
    displayName: "Grow Network",
    avatarUrl: "",
    occurredAt: "2026-05-02T09:00:00.000Z",
    isUnseen: true,
    actionText: "Your session is trending",
    targetId: "grow-session-demo",
    targetType: "session",
    targetLabel: "Grow Session",
    targetName: "KAN Session - May 2",
    targetRoute: "#sessions",
  },
]);
const MOCK_PUBLIC_SESSION_SCENARIOS = Object.freeze([
  {
    key: "perfect-run",
    name: "Perfect Run",
    seedVarietyName: "Blue Dream",
    sourceName: "Humboldt Seed Co",
    seedTypeName: "Photo",
    sexLabel: "Feminized",
    totalSeeds: 24,
    totalPlanted: 24,
    successPercent: 100,
    timeline: {
      startedAt: "2026-04-28T08:14:00.000Z",
      germinationStartedAt: "2026-04-29T02:35:00.000Z",
      firstPlantedAt: "2026-04-30T00:45:00.000Z",
      completedAt: "2026-04-30T08:44:00.000Z",
    },
  },
  {
    key: "strong-average-run",
    name: "Strong Average Run",
    seedVarietyName: "Gorilla Glue #4",
    sourceName: "Seedsman",
    seedTypeName: "Photo",
    sexLabel: "Feminized",
    totalSeeds: 26,
    totalPlanted: 22,
    successPercent: 85,
    timeline: {
      startedAt: "2026-04-22T07:10:00.000Z",
      germinationStartedAt: "2026-04-23T03:15:00.000Z",
      firstPlantedAt: "2026-04-24T07:55:00.000Z",
      completedAt: "2026-04-24T19:25:00.000Z",
    },
  },
  {
    key: "difficult-seed-recovery",
    name: "Difficult Seed Recovery",
    seedVarietyName: "Old Stock Test",
    sourceName: "SeedVault",
    seedTypeName: "Regular",
    sexLabel: "Not shared",
    totalSeeds: 24,
    totalPlanted: 17,
    successPercent: 71,
    timeline: {
      startedAt: "2026-04-18T09:00:00.000Z",
      germinationStartedAt: "2026-04-19T09:00:00.000Z",
      firstPlantedAt: "2026-04-21T01:30:00.000Z",
      completedAt: "2026-04-21T15:45:00.000Z",
    },
  },
]);
const FILTER_PAPER_USAGE_PER_COMPLETED_SESSION = 1;
// Future: support multiple pack sizes and dynamic product selection.
// TODO: Support per-session usage amounts instead of a fixed 1 paper per completed session.
const SYSTEM_LAYOUT_ASSETS = {
  KAN: "/public/assets/system-layout-kan.svg",
  TRA: "/public/assets/system-layout-tra.svg",
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
const MOCK_ADMIN_REPORTS = Object.freeze([
  {
    id: "mock-admin-report-technical",
    user_id: "",
    name: "Jamie Ortega",
    email: "jamie@example.com",
    issue_type: "Technical issue",
    message: "The session dashboard saved my latest germination check, but the card did not refresh until I reopened the page. Everything came back after refresh, so this may be a front-end sync issue.",
    status: "new",
    created_at: new Date(Date.now() - (2 * 60 * 60 * 1000)).toISOString(),
  },
  {
    id: "mock-admin-report-account",
    user_id: "",
    name: "Morgan Lee",
    email: "morgan@example.com",
    issue_type: "Account issue",
    message: "I can sign in on desktop, but my phone keeps returning me to the home screen after authentication. Please check whether my account session is expiring too quickly on mobile Safari.",
    status: "reviewed",
    created_at: new Date(Date.now() - (6 * 60 * 60 * 1000)).toISOString(),
  },
  {
    id: "mock-admin-report-feedback",
    user_id: "",
    name: "Avery Moss",
    email: "avery@example.com",
    issue_type: "Feedback",
    message: "The new Grow Network layout feels much better. A pinned explanation of what counts as public activity would make the section even clearer for first-time members.",
    status: "new",
    created_at: new Date(Date.now() - (11 * 60 * 60 * 1000)).toISOString(),
  },
  {
    id: "mock-admin-report-content",
    user_id: "",
    name: "Casey Hart",
    email: "casey@example.com",
    issue_type: "Report content",
    message: "One Community Grow snapshot appears to use a mismatched source label that does not match the session details shown in the public view. Please review the post before it stays on the feed.",
    status: "resolved",
    created_at: new Date(Date.now() - (26 * 60 * 60 * 1000)).toISOString(),
  },
  {
    id: "mock-admin-report-other",
    user_id: "",
    name: "Devon Price",
    email: "devon@example.com",
    issue_type: "Other",
    message: "Could the footer contact form eventually include an optional order or batch reference field? It would help when sending support questions tied to a specific grow setup.",
    status: "new",
    created_at: new Date(Date.now() - (52 * 60 * 60 * 1000)).toISOString(),
  },
]);
const app = document.querySelector("#app");
const authStatus = document.querySelector("#auth-status");
const appFooter = document.querySelector(".app-footer");
const mobileNavToggle = document.querySelector("#mobile-nav-toggle");
const mobileNavDrawer = document.querySelector("#mobile-nav-drawer");
const mobileNavContent = document.querySelector("#mobile-nav-content");
const appState = {
  initialized: false,
  loading: true,
  authReady: false,
  authRecoveryMode: false,
  authForgotPasswordCooldownUntil: 0,
  authHydrationPromise: null,
  lastHydratedAuthSessionKey: "",
  supabase: null,
  authSession: null,
  user: null,
  currentUserEmail: "",
  userRole: "user",
  isAdmin: false,
  mockDataEnabled: false,
  profile: null,
  profileError: "",
  notificationPreferences: null,
  notificationPreferencesError: "",
  notificationPreferencesTableUnavailable: false,
  notificationPreferencesSchemaMode: "",
  authModalDismissHash: "",
  authNotice: "",
  deletionPromptShown: false,
  accountMenuOpen: false,
  mobileNavOpen: false,
  profilePageSettings: null,
  profilePageSettingsUserId: "",
  customSelectOpenKey: "",
  sessions: [],
  filterPaperInventory: null,
  filterPaperDeductionRegistry: null,
  sources: [],
  sourcesLoaded: false,
  sourcesError: "",
  sourcesRefreshPromise: null,
  sourcesTableUnavailable: false,
  sourceAdminEditingId: "",
  sourceAdminMessage: "",
  announcements: [],
  announcementsLoaded: false,
  announcementsError: "",
  announcementsRefreshPromise: null,
  announcementAdminMessage: "",
  fallbackContentAdminMessage: "",
  adminMessages: [],
  adminMessagesLoaded: false,
  adminMessagesError: "",
  adminMessagesRefreshPromise: null,
  adminMessageStatusFilter: "all",
  adminMessageIssueTypeFilter: "all",
  adminMessageExpandedState: {},
  mockAdminMessages: [],
  members: [],
  membersLoaded: false,
  membersError: "",
  membersRefreshPromise: null,
  memberAdminFilters: {
    query: "",
    role: "all",
    status: "all",
  },
  publicMemberProfiles: {},
  publicMemberProfilesRefreshPromises: {},
  publicMemberProfilesViewUnavailable: false,
  publicMemberFollowSummaries: {},
  publicMemberFollowSummaryRefreshPromises: {},
  publicMemberFollowSummaryUnavailable: false,
  publicMemberFollowLists: {},
  publicMemberFollowListsRefreshPromises: {},
  publicMemberFollowListsUnavailable: false,
  publicMemberProfileActiveTabs: {},
  publicMemberFollowStates: {},
  publicMemberFollowStateRefreshPromises: {},
  publicMemberFollowPendingActions: {},
  publicMemberFollowsTableUnavailable: false,
  growNetworkFollowing: [],
  growNetworkFollowingLoaded: false,
  growNetworkFollowingError: "",
  growNetworkFollowingRefreshPromise: null,
  growNetworkActiveTab: "followers",
  mockGrowNetworkFollowStates: {},
  mockGrowNetworkSeenNotificationIds: {},
  mockPublicSessionScenarioKey: "perfect-run",
  growNetworkActivity: [],
  growNetworkActivityLoaded: false,
  growNetworkActivityError: "",
  growNetworkActivityRefreshPromise: null,
  communityActivityTableUnavailable: false,
  gallerySnapshots: [],
  gallerySnapshotsLoaded: false,
  galleryRefreshPromise: null,
  gallerySnapshotLikesTableUnavailable: false,
  homeGalleryRankingsHydrationRequested: false,
  memberCount: null,
  memberCountLoaded: false,
  memberCountError: "",
  memberCountRefreshPromise: null,
  siteVisitorAnalyticsRows: [],
  siteVisitorAnalyticsLoaded: false,
  siteVisitorAnalyticsLoadedFilter: "",
  siteVisitorAnalyticsError: "",
  siteVisitorAnalyticsRefreshPromise: null,
  siteVisitorAnalyticsFilter: SITE_ANALYTICS_DEFAULT_FILTER,
  siteVisitorAnalyticsTableUnavailable: false,
  siteVisitorAnalyticsTrackingBlocked: false,
  siteVisitorPresenceChannel: null,
  siteVisitorPresenceAvailable: false,
  siteVisitorPresenceError: "",
  siteVisitorPresenceState: {},
  siteVisitorPresenceHeartbeatId: 0,
  siteVisitorTrackingInitialized: false,
  siteVisitorPresenceSubscribed: false,
  siteAnalyticsEventInFlight: false,
  siteVisitorId: "",
  siteVisitId: "",
  siteAnalyticsLastTrackedSignature: "",
  mockGalleryReviewStatuses: {},
  deferredInstallPrompt: null,
  installPromptDismissed: false,
  installPromptMode: "",
  gallerySort: "date",
  gallerySortOrder: "desc",
  galleryVisibleSnapshotCount: GALLERY_SNAPSHOT_PAGE_SIZE,
  theme: document.documentElement.dataset.theme === "light" ? "light" : "dark",
  sessionHistorySort: "date",
  leaderboardAuditFilters: { ...LEADERBOARD_AUDIT_DEFAULT_FILTERS },
  leaderboardAuditExpandedId: "",
  leaderboardAuditInsightsExpanded: false,
  growthStage: null,
  growthStageModalOpen: false,
  growthStageModalDismissed: false,
  pendingGrowthStageInput: null,
  growthStageModalSuppressedUntil: 0,
  newSessionSystemType: "",
  newSessionSystemModalOpen: false,
  newSessionReturnHash: "#home",
  currentRouteHash: "#home",
  customSelectPositionFrame: 0,
  unsavedChanges: {
    active: false,
    hasUnsavedChanges: false,
    pageHash: "",
    baselineSignature: "",
    getSignature: null,
    saveFn: null,
    promptOpen: false,
    ignoreNextHashChange: false,
  },
};
let sessionTimerInterval = null;
let backToTopScrollFrame = 0;
let backToTopLastVisibleState = null;
const templates = {
  auth: document.querySelector("#auth-template"),
  authReset: document.querySelector("#auth-reset-template"),
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
]);
// Admin email fallback is only a temporary frontend convenience until a dedicated Supabase role field is enforced.
// Database access should be protected with Supabase RLS policies.

function isAdminUser(userOrEmail = appState.currentUserEmail || appState.user) {
  const normalizedEmail = getNormalizedUserEmail(userOrEmail);
  return ADMIN_EMAILS.has(normalizedEmail);
}

function getNormalizedUserEmail(user = appState.user) {
  return String(
    typeof user === "string"
      ? user
      : (user?.email || "")
  ).trim().toLowerCase();
}

function getAuthSessionHydrationKey(session) {
  const userId = String(session?.user?.id || "").trim();
  const email = getNormalizedUserEmail(session?.user || null);
  const expiresAt = String(session?.expires_at || "").trim();
  return `${userId}|${email}|${expiresAt}`;
}

function normalizeUserRole(role) {
  return String(role || "").trim().toLowerCase() === "admin" ? "admin" : "user";
}

function resolveSupabaseBackedUserRole(session = appState.authSession, profile = appState.profile) {
  if (!session?.user) {
    return "user";
  }

  const sessionRole = normalizeUserRole(
    session.user?.app_metadata?.role
    || session.user?.user_metadata?.role
  );
  if (sessionRole === "admin") {
    return "admin";
  }

  const profileRole = normalizeUserRole(profile?.role);
  if (profileRole === "admin") {
    return "admin";
  }

  return isAdminUser(session.user) ? "admin" : "user";
}

function hasResolvedAdminAccess() {
  // Admin visibility is derived from Supabase auth/session.
  // Do not use localStorage as the source of truth for admin permissions.
  // Database access should be protected with Supabase RLS policies.
  return appState.userRole === "admin";
}

function applyResolvedAuthState(session, reason = "auth-change", profile = appState.profile) {
  const sessionEmail = String(session?.user?.email || "").trim();
  const normalizedEmail = getNormalizedUserEmail(session?.user || null);
  const resolvedRole = session ? resolveSupabaseBackedUserRole(session, profile) : "user";
  const isAdmin = resolvedRole === "admin";

  appState.authSession = session || null;
  appState.user = session?.user || null;
  appState.currentUserEmail = normalizedEmail;
  appState.userRole = resolvedRole;
  appState.isAdmin = isAdmin;

  console.log("[Cannakan App Init] session email", {
    reason,
    sessionEmail,
  });
  console.log("[Cannakan App Init] normalized email", {
    reason,
    normalizedEmail,
  });
  console.log("[Cannakan App Init] isAdmin result", {
    reason,
    isAdminResult: isAdmin,
    userRole: resolvedRole,
  });
}

function markAuthReady(reason = "auth-change") {
  appState.authReady = true;
  console.log("[Cannakan App Init] authReady true", { reason });
}

function initializeTopbarControls() {
  if (mobileNavToggle && mobileNavToggle.dataset.bound !== "true") {
    mobileNavToggle.dataset.bound = "true";
    mobileNavToggle.addEventListener("click", () => {
      toggleMobileNavigation();
    });
  }

  if (mobileNavDrawer && mobileNavDrawer.dataset.bound !== "true") {
    mobileNavDrawer.dataset.bound = "true";
    mobileNavDrawer.querySelectorAll("[data-mobile-nav-close='true']").forEach((button) => {
      button.addEventListener("click", () => {
        closeMobileNavigation();
      });
    });
  }

  syncMobileNavigationMenu();
}

function setTopbarNavigationReadyState() {
  const topbarNav = document.querySelector(".topbar-nav");
  if (topbarNav) {
    topbarNav.hidden = !appState.authReady;
    topbarNav.setAttribute("aria-hidden", appState.authReady ? "false" : "true");
  }
  if (mobileNavToggle) {
    mobileNavToggle.hidden = !appState.authReady;
    mobileNavToggle.setAttribute("aria-hidden", appState.authReady ? "false" : "true");
  }
}

function syncAdminNavigationVisibility() {
  const currentUserEmail = appState.currentUserEmail || getNormalizedUserEmail(appState.user);
  const shouldShowAdminNav = hasResolvedAdminAccess();
  document.querySelectorAll("[data-admin-nav]").forEach((link) => {
    link.hidden = !shouldShowAdminNav;
    if (shouldShowAdminNav) {
      link.removeAttribute("aria-hidden");
    } else {
      link.setAttribute("aria-hidden", "true");
    }
  });
  console.log("[Cannakan Admin Nav] Navigation visibility evaluated", {
    currentEmail: appState.user?.email || "",
    normalizedEmail: currentUserEmail,
    isAdminResult: shouldShowAdminNav,
    adminNavRendered: shouldShowAdminNav,
  });
}

function syncGrowNetworkNavigationVisibility() {
  const shouldShowNetworkNav = Boolean(appState.user);
  const unseenNotificationCount = shouldShowNetworkNav ? getUnseenMockGrowNetworkNotificationCount() : 0;
  const hasUnseenNotifications = unseenNotificationCount > 0;
  const badgeLabel = formatGrowNetworkNotificationBadgeCount(unseenNotificationCount);
  document.querySelectorAll("[data-network-nav]").forEach((link) => {
    let badge = link.querySelector(".topbar-nav-notification-badge");
    if (!(badge instanceof HTMLSpanElement) && shouldShowNetworkNav && hasUnseenNotifications) {
      badge = document.createElement("span");
      badge.className = "topbar-nav-notification-badge";
      badge.setAttribute("aria-hidden", "true");
      link.append(badge);
    }

    link.hidden = !shouldShowNetworkNav;
    link.classList.toggle("has-unseen-notifications", shouldShowNetworkNav && hasUnseenNotifications);
    if (shouldShowNetworkNav && hasUnseenNotifications) {
      link.setAttribute("data-unseen-notifications", "true");
      link.setAttribute("aria-label", `Grow Network (${unseenNotificationCount} unseen notification${unseenNotificationCount === 1 ? "" : "s"})`);
      if (badge instanceof HTMLSpanElement) {
        badge.textContent = badgeLabel;
      }
    } else {
      link.removeAttribute("data-unseen-notifications");
      link.removeAttribute("aria-label");
      if (badge instanceof HTMLSpanElement) {
        badge.remove();
      }
    }
    if (shouldShowNetworkNav) {
      link.removeAttribute("aria-hidden");
    } else {
      link.setAttribute("aria-hidden", "true");
    }
  });
}

function resetSessionScopedAppState() {
  appState.authSession = null;
  appState.user = null;
  appState.currentUserEmail = "";
  appState.userRole = "user";
  appState.isAdmin = false;
  appState.profile = null;
  appState.profileError = "";
  appState.notificationPreferences = null;
  appState.notificationPreferencesError = "";
  // Preserve the missing-table latch for the rest of this browser session so
  // auth resets do not re-trigger repeated 404 requests to Supabase.
  appState.notificationPreferencesSchemaMode = "";
  appState.authModalDismissHash = "";
  appState.deletionPromptShown = false;
  appState.accountMenuOpen = false;
  appState.mobileNavOpen = false;
  appState.profilePageSettings = null;
  appState.profilePageSettingsUserId = "";
  appState.sourcesLoaded = false;
  appState.sourcesError = "";
  appState.sourcesRefreshPromise = null;
  appState.sourceAdminEditingId = "";
  appState.sourceAdminMessage = "";
  appState.announcements = [];
  appState.announcementsLoaded = false;
  appState.announcementsError = "";
  appState.announcementsRefreshPromise = null;
  appState.announcementAdminMessage = "";
  appState.fallbackContentAdminMessage = "";
  appState.adminMessages = [];
  appState.adminMessagesLoaded = false;
  appState.adminMessagesError = "";
  appState.adminMessagesRefreshPromise = null;
  appState.adminMessageStatusFilter = "all";
  appState.adminMessageIssueTypeFilter = "all";
  appState.adminMessageExpandedState = {};
  appState.mockAdminMessages = [];
  appState.members = [];
  appState.membersLoaded = false;
  appState.membersError = "";
  appState.membersRefreshPromise = null;
  appState.memberAdminFilters = {
    query: "",
    role: "all",
    status: "all",
  };
  appState.publicMemberProfiles = {};
  appState.publicMemberProfilesRefreshPromises = {};
  appState.publicMemberProfilesViewUnavailable = false;
  appState.publicMemberFollowSummaries = {};
  appState.publicMemberFollowSummaryRefreshPromises = {};
  appState.publicMemberFollowSummaryUnavailable = false;
  appState.publicMemberFollowLists = {};
  appState.publicMemberFollowListsRefreshPromises = {};
  appState.publicMemberFollowListsUnavailable = false;
  appState.publicMemberProfileActiveTabs = {};
  appState.publicMemberFollowStates = {};
  appState.publicMemberFollowStateRefreshPromises = {};
  appState.publicMemberFollowPendingActions = {};
  appState.publicMemberFollowsTableUnavailable = false;
  appState.growNetworkFollowing = [];
  appState.growNetworkFollowingLoaded = false;
  appState.growNetworkFollowingError = "";
  appState.growNetworkFollowingRefreshPromise = null;
  appState.growNetworkActiveTab = "following";
  appState.mockGrowNetworkFollowStates = {};
  appState.mockPublicSessionScenarioKey = "perfect-run";
  appState.growNetworkActivity = [];
  appState.growNetworkActivityLoaded = false;
  appState.growNetworkActivityError = "";
  appState.growNetworkActivityRefreshPromise = null;
  appState.communityActivityTableUnavailable = false;
  if (!isSupabaseRecoveryHash(window.location.hash || "")) {
    appState.authRecoveryMode = false;
  }
  appState.siteVisitorAnalyticsRows = [];
  appState.siteVisitorAnalyticsLoaded = false;
  appState.siteVisitorAnalyticsLoadedFilter = "";
  appState.siteVisitorAnalyticsError = "";
  appState.siteVisitorAnalyticsRefreshPromise = null;
  appState.siteAnalyticsEventInFlight = false;
  appState.gallerySnapshotsLoaded = false;
  appState.homeGalleryRankingsHydrationRequested = false;
  resetMemberCountState();
}

async function rehydratePersistentBrowserState(reason = "unspecified") {
  appState.mockDataEnabled = isMockDataEnabled();
  appState.filterPaperInventory = loadFilterPaperInventory();
  appState.filterPaperDeductionRegistry = loadFilterPaperDeductionRegistry();
  seedFallbackContentStorageIfEmpty();
  appState.announcements = await loadAnnouncements(reason);
  appState.announcementsLoaded = true;
  appState.announcementsError = "";
  const displayMode = getMessageBoardDisplayMode();
  const fallbackMode = getFallbackContentMode();
  const mixedImageMode = getMixedImageMode();
  const activeAnnouncement = getLatestActiveAnnouncement();
  console.log("[Cannakan App Init] announcement loaded", {
    reason,
    mockDataEnabled: appState.mockDataEnabled,
    displayMode,
    storedAnnouncementCount: appState.announcements.length,
    activeAnnouncementTitle: activeAnnouncement?.title || "",
  });
  console.log("[Cannakan App Init] fallback mode loaded", {
    reason,
    fallbackMode,
    mixedImageMode,
    storedJokesCount: readStoredFallbackJokes().length,
    storedFactsCount: readStoredFallbackFacts().length,
    hasRecentFallbackHistory: readRecentFallbackItemsHistory().length > 0,
  });
  if (!activeAnnouncement) {
    const fallbackContent = getDailyFallbackContent();
    console.log("[Cannakan App Init] announcement fallback used", {
      title: DEFAULT_ANNOUNCEMENT_FALLBACK_SUBTEXT,
      fallbackType: fallbackContent.type,
      body: fallbackContent.type === "joke" ? fallbackContent.question : fallbackContent.text,
      answer: fallbackContent.type === "joke" ? fallbackContent.answer : "",
    });
  }
}

async function resolveSupabaseAuthSession(reason = "unspecified", sessionHint = null) {
  if (!appState.supabase) {
    return sessionHint || null;
  }

  try {
    const { data } = await withTimeout(
      appState.supabase.auth.getSession(),
      8000,
      "Supabase session check timed out.",
    );
    const resolvedSession = data?.session || sessionHint || null;
    const currentEmail = resolvedSession?.user?.email || "";
    const normalizedEmail = getNormalizedUserEmail(resolvedSession?.user || null);
    console.log("[Cannakan App Init] session loaded", {
      reason,
      hasSession: Boolean(resolvedSession),
      currentEmail,
      normalizedEmail,
      isAdminResult: isAdminUser(normalizedEmail),
    });
    return resolvedSession;
  } catch (error) {
    console.error(`Failed to resolve Supabase auth session during ${reason}`, error);
    if (sessionHint) {
      const currentEmail = sessionHint?.user?.email || "";
      const normalizedEmail = getNormalizedUserEmail(sessionHint?.user || null);
      console.log("[Cannakan App Init] session loaded", {
        reason: `${reason}:session-hint-fallback`,
        hasSession: Boolean(sessionHint),
        currentEmail,
        normalizedEmail,
        isAdminResult: isAdminUser(normalizedEmail),
      });
      return sessionHint;
    }
    return null;
  }
}

async function getAuthenticatedSupabaseUser(friendlyMessage = "Please sign in to save your session.") {
  if (!appState.supabase) {
    throw new Error("Cloud sync is not available right now.");
  }

  try {
    const { data, error } = await withTimeout(
      appState.supabase.auth.getUser(),
      8000,
      friendlyMessage,
    );
    if (error) {
      throw error;
    }

    const user = data?.user || null;
    if (!user?.id) {
      throw new Error(friendlyMessage);
    }

    if (!appState.user || appState.user.id !== user.id) {
      appState.user = user;
      appState.currentUserEmail = String(user.email || "").trim();
    }

    return user;
  } catch (error) {
    const fallbackMessage = String(error?.message || "").trim();
    throw new Error(fallbackMessage || friendlyMessage);
  }
}

async function safelyLoadAppData(loader, fallbackValue, errorContext, errorStateKey = "") {
  try {
    return await loader();
  } catch (error) {
    console.error(errorContext, error);
    if (errorStateKey && error?.message) {
      appState[errorStateKey] = error.message;
    }
    return fallbackValue;
  }
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

function isSuppressedExternalStylesheetInspectionFailure({
  message = "",
  filename = "",
  stack = "",
} = {}) {
  const normalizedMessage = String(message || "").trim().toLowerCase();
  const normalizedFilename = String(filename || "").trim().toLowerCase();
  const normalizedStack = String(stack || "").trim().toLowerCase();
  const mentionsCssRules = normalizedMessage.includes("cssrules")
    || normalizedStack.includes("cssrules");
  const isNullAccessError = normalizedMessage.includes("cannot read properties of null")
    || normalizedMessage.includes("cannot read property 'cssrules' of null")
    || normalizedStack.includes("cannot read properties of null")
    || normalizedStack.includes("cannot read property 'cssrules' of null");

  if (!mentionsCssRules || !isNullAccessError) {
    return false;
  }

  const sameOrigin = String(window.location.origin || "").trim().toLowerCase();
  const isVendorLikeSource = (
    normalizedFilename.startsWith("chrome-extension://")
    || normalizedFilename.startsWith("moz-extension://")
    || normalizedFilename.startsWith("safari-web-extension://")
    || normalizedFilename.includes("/vendor")
    || normalizedFilename.includes("vendor.js")
    || normalizedFilename.includes("vm")
    || normalizedStack.includes("vendor.js")
    || normalizedStack.includes(" insertrule ")
    || normalizedStack.includes(" at insertrule ")
    || normalizedStack.includes("(vm")
    || (normalizedFilename.startsWith("http") && sameOrigin && !normalizedFilename.startsWith(sameOrigin))
  );

  return isVendorLikeSource;
}

function shouldSuppressExternalStylesheetInspectionError(event) {
  const message = String(event?.message || "").trim();
  const filename = String(event?.filename || "").trim();
  const stack = String(event?.error?.stack || "").trim();
  return (
    isSuppressedExternalStylesheetInspectionFailure({
      message,
      filename,
      stack,
    })
  );
}

function installRuntimeErrorGuards() {
  if (window.__cannakanRuntimeGuardsInstalled) {
    return;
  }

  window.__cannakanRuntimeGuardsInstalled = true;
  window.addEventListener("error", (event) => {
    if (!shouldSuppressExternalStylesheetInspectionError(event)) {
      return;
    }

    event.preventDefault();
    logRuntimeIssueOnce(
      "warn",
      "external-cssrules-inspection-error",
      "Ignored external stylesheet inspection error while reading cssRules.",
      { filename: event?.filename || "" },
    );
  }, true);

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event?.reason;
    const message = String(
      reason?.message
      || reason?.error?.message
      || reason
      || "",
    ).trim();
    const stack = String(
      reason?.stack
      || reason?.error?.stack
      || "",
    ).trim();
    if (!isSuppressedExternalStylesheetInspectionFailure({ message, stack })) {
      return;
    }

    event.preventDefault();
    logRuntimeIssueOnce(
      "warn",
      "external-cssrules-inspection-rejection",
      "Ignored external stylesheet injection failure while reading cssRules.",
    );
  });
}

installRuntimeErrorGuards();

function safeRender() {
  try {
    render();
  } catch (error) {
    reportAppError(error, "Render failed");
  }
}

function handleHashChange() {
  const nextHash = normalizeNavigationHash(window.location.hash || "#home");
  if (appState.unsavedChanges.ignoreNextHashChange) {
    appState.unsavedChanges.ignoreNextHashChange = false;
    safeRender();
    return;
  }

  if (shouldBlockNavigationForUnsavedChanges(nextHash)) {
    const currentHash = normalizeNavigationHash(appState.unsavedChanges.pageHash || appState.currentRouteHash || "#home");
    if (nextHash !== currentHash) {
      appState.unsavedChanges.ignoreNextHashChange = true;
      window.location.hash = currentHash;
    }
    promptForUnsavedChangesNavigation(nextHash);
    return;
  }

  safeRender();
}

async function safeBootstrapApp() {
  try {
    await bootstrapApp();
  } catch (error) {
    markAuthReady("startup-error");
    appState.loading = false;
    updateAuthStatus();
    reportAppError(error, "Startup failed");
  }
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || !window.isSecureContext) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").then((registration) => {
      void registration.update();
    }).catch((error) => {
      console.warn("Service worker registration failed", error);
    });
  }, { once: true });
}

function isStandaloneAppDisplay() {
  const isStandalone = window.matchMedia?.("(display-mode: standalone)")?.matches
    || window.navigator.standalone;
  return Boolean(isStandalone);
}

function getUserAgent() {
  return String(window.navigator.userAgent || "").toLowerCase();
}

function isIOSDevice() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent || "");
}

function isIPhoneSafariInstallCandidate() {
  const userAgent = getUserAgent();
  const isIos = isIOSDevice();
  const isSafari = /safari/.test(userAgent) && !/crios|fxios|edgios|opr\//.test(userAgent);
  return isIos && isSafari && !isStandaloneAppDisplay();
}

function getDeferredInstallPrompt() {
  return window.deferredPrompt || appState.deferredInstallPrompt || null;
}

function setDeferredInstallPrompt(promptEvent = null) {
  window.deferredPrompt = promptEvent || null;
  appState.deferredInstallPrompt = window.deferredPrompt;
  return appState.deferredInstallPrompt;
}

function getInstallPromptMode() {
  if (isStandaloneAppDisplay()) {
    return "";
  }

  if (getDeferredInstallPrompt()) {
    return "prompt";
  }

  if (!appState.installPromptDismissed && isIPhoneSafariInstallCandidate()) {
    return "ios";
  }

  return "";
}

async function promptInstallGrowApp() {
  const promptEvent = getDeferredInstallPrompt();
  if (!promptEvent) {
    appState.installPromptMode = getInstallPromptMode();
    safeRender();
    return;
  }

  try {
    await promptEvent.prompt();
    const userChoice = await promptEvent.userChoice;
    appState.installPromptDismissed = userChoice?.outcome !== "accepted";
  } catch (error) {
    console.warn("Install prompt was not completed", error);
    appState.installPromptDismissed = true;
  } finally {
    setDeferredInstallPrompt(null);
    appState.installPromptMode = getInstallPromptMode();
    syncInstallPromptBanner();
    safeRender();
  }
}

function syncInstallPromptBanner() {
  const appShell = document.querySelector(".app-shell");
  const topbar = document.querySelector(".topbar");
  if (!appShell || !topbar) {
    return;
  }

  const mode = getInstallPromptMode();
  appState.installPromptMode = mode;
  const existingBanner = appShell.querySelector("#install-grow-app-banner");
  const activeRoute = normalizeNavigationHash(window.location.hash || "#home");
  if (activeRoute === "#home" || activeRoute === "") {
    existingBanner?.remove();
    return;
  }
  if (!mode) {
    existingBanner?.remove();
    return;
  }

  const banner = existingBanner || document.createElement("section");
  banner.id = "install-grow-app-banner";
  banner.className = `card install-app-banner install-app-banner--${mode}`;
  const bodyMarkup = mode === "prompt"
    ? `
      <div class="install-app-banner-actions">
        <button type="button" class="button button-primary install-app-button" data-install-grow-app="true">Install Now</button>
      </div>
    `
    : `
      <div class="install-app-banner-actions">
        <p class="install-app-banner-ios-tip">To install: tap Share, then Add to Home Screen</p>
      </div>
    `;

  banner.innerHTML = `
    <div class="install-app-banner-shell">
      <div class="install-app-banner-copy">
        <span class="install-app-banner-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
            <path d="M12 3.5 5.5 7v5.5c0 3.8 2.4 7 6.5 8 4.1-1 6.5-4.2 6.5-8V7L12 3.5Z"></path>
            <path d="M12 8v8"></path>
            <path d="m8.75 11.25 3.25-3.25 3.25 3.25"></path>
          </svg>
        </span>
        <div>
          <p class="eyebrow">Install App</p>
          <h3>Install Grow App</h3>
          <p class="muted install-app-banner-subtitle">${mode === "prompt"
      ? "Add Cannakan Grow to your home screen for a faster, full-screen experience."
      : "Save Cannakan Grow to your iPhone home screen for a full-screen app experience."}</p>
        </div>
      </div>
      ${bodyMarkup}
    </div>
  `;

  if (!existingBanner) {
    topbar.insertAdjacentElement("afterend", banner);
  }

  banner.querySelector("[data-install-grow-app]")?.addEventListener("click", async () => {
    await promptInstallGrowApp();
  });
}

function bindInstallPromptEvents() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    setDeferredInstallPrompt(event);
    appState.installPromptDismissed = false;
    appState.installPromptMode = getInstallPromptMode();
    syncInstallPromptBanner();
    safeRender();
  });

  window.addEventListener("appinstalled", () => {
    setDeferredInstallPrompt(null);
    appState.installPromptDismissed = true;
    appState.installPromptMode = getInstallPromptMode();
    syncInstallPromptBanner();
    safeRender();
  });
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

function getBackToTopScrollContainerCandidates() {
  return [
    document.scrollingElement,
    document.documentElement,
    document.body,
    document.querySelector(".app-shell"),
    document.querySelector("#app"),
  ].filter((entry, index, items) => entry && items.indexOf(entry) === index);
}

function getBackToTopScrollTop() {
  const windowScrollTop = Math.max(
    window.scrollY || 0,
    window.pageYOffset || 0,
  );
  const containerScrollTop = getBackToTopScrollContainerCandidates().reduce((maxScrollTop, candidate) => (
    Math.max(maxScrollTop, candidate?.scrollTop || 0)
  ), 0);

  return Math.max(windowScrollTop, containerScrollTop);
}

function shouldShowBackToTopButton() {
  return getBackToTopScrollTop() > BACK_TO_TOP_VISIBILITY_OFFSET;
}

function updateBackToTopButtonVisibility() {
  const button = document.querySelector("#back-to-top-button");
  if (!(button instanceof HTMLButtonElement)) {
    return;
  }

  const scrollTop = getBackToTopScrollTop();
  const isVisible = shouldShowBackToTopButton();
  button.classList.toggle("is-visible", isVisible);
  button.setAttribute("aria-hidden", isVisible ? "false" : "true");
  button.tabIndex = isVisible ? 0 : -1;
  if (backToTopLastVisibleState !== isVisible) {
    console.log(`[BackToTop] visible ${isVisible}`, scrollTop);
    backToTopLastVisibleState = isVisible;
  }
}

function requestBackToTopButtonVisibilitySync() {
  if (backToTopScrollFrame) {
    return;
  }

  backToTopScrollFrame = window.requestAnimationFrame(() => {
    backToTopScrollFrame = 0;
    updateBackToTopButtonVisibility();
  });
}

function ensureBackToTopButton() {
  if (!(document.body instanceof HTMLBodyElement)) {
    return null;
  }

  let button = document.querySelector("#back-to-top-button");
  if (!(button instanceof HTMLButtonElement)) {
    button = document.createElement("button");
    button.type = "button";
    button.id = "back-to-top-button";
    button.className = "back-to-top-button";
    button.setAttribute("aria-label", "Back to top");
    button.setAttribute("aria-hidden", "true");
    button.tabIndex = -1;
    button.innerHTML = `
      <span class="back-to-top-button-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
          <path d="M12 19V5"></path>
          <path d="M6.5 10.5 12 5l5.5 5.5"></path>
        </svg>
      </span>
    `;
    button.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      getBackToTopScrollContainerCandidates().forEach((candidate) => {
        if (!candidate || candidate === document.body || candidate === document.documentElement) {
          return;
        }

        if (typeof candidate.scrollTo === "function") {
          candidate.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          candidate.scrollTop = 0;
        }
      });
    });
    document.body.appendChild(button);
    console.log("[BackToTop] button created");
  }

  updateBackToTopButtonVisibility();
  return button;
}

function bindBackToTopVisibilityObservers() {
  if (document.body?.dataset.backToTopObserversBound === "true") {
    return;
  }

  document.body.dataset.backToTopObserversBound = "true";
  window.addEventListener("scroll", requestBackToTopButtonVisibilitySync, { passive: true });
  getBackToTopScrollContainerCandidates().forEach((candidate) => {
    if (!candidate || candidate === document.body || candidate === document.documentElement) {
      return;
    }

    candidate.addEventListener("scroll", requestBackToTopButtonVisibilitySync, { passive: true });
  });
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
    const menu = getCustomSelectMenuElement(wrapper);
    trigger?.setAttribute("aria-expanded", "false");
    if (menu) {
      resetCustomSelectMenuPosition(wrapper, menu);
      menu.hidden = true;
      restoreCustomSelectMenuToWrapper(wrapper, menu);
    }
  });

  appState.customSelectOpenKey = exceptKey || "";
}

function getCustomSelectMenuElement(wrapper) {
  if (!wrapper) {
    return null;
  }

  if (wrapper.__customSelectMenu instanceof HTMLElement) {
    return wrapper.__customSelectMenu;
  }

  const menu = wrapper.querySelector(".custom-select-menu");
  if (menu instanceof HTMLElement) {
    wrapper.__customSelectMenu = menu;
    return menu;
  }

  return null;
}

function mountCustomSelectMenuToBody(wrapper, menu) {
  if (!(document.body instanceof HTMLBodyElement) || !wrapper || !menu) {
    return;
  }

  wrapper.__customSelectMenu = menu;
  menu.dataset.portalMounted = "true";
  menu.dataset.ownerKey = wrapper.dataset.dropdownKey || "";
  wrapper.dataset.portalMounted = "true";

  if (menu.parentElement !== document.body) {
    document.body.appendChild(menu);
  }
}

function restoreCustomSelectMenuToWrapper(wrapper, menu) {
  if (!menu) {
    return;
  }

  delete menu.dataset.portalMounted;
  delete menu.dataset.ownerKey;
  if (wrapper) {
    delete wrapper.dataset.portalMounted;
  }

  if (wrapper?.isConnected) {
    wrapper.appendChild(menu);
    wrapper.__customSelectMenu = menu;
    return;
  }

  if (menu.parentElement === document.body) {
    menu.remove();
  }
}

function resetCustomSelectMenuPosition(wrapper, menu) {
  if (!menu) {
    return;
  }

  menu.style.position = "";
  menu.style.left = "";
  menu.style.top = "";
  menu.style.right = "";
  menu.style.bottom = "";
  menu.style.width = "";
  menu.style.maxHeight = "";
  menu.style.visibility = "";
  menu.dataset.dropdownDirection = "down";
  if (wrapper) {
    wrapper.dataset.dropdownDirection = "down";
  }
}

function positionCustomSelectMenu(select) {
  const wrapper = select?.closest(".custom-select");
  if (!wrapper) {
    return;
  }

  const trigger = wrapper.querySelector(".custom-select-trigger");
  const menu = getCustomSelectMenuElement(wrapper);
  if (!trigger || !menu || menu.hidden) {
    return;
  }

  const triggerRect = trigger.getBoundingClientRect();
  if (triggerRect.width <= 0 || triggerRect.height <= 0) {
    return;
  }

  const viewportPadding = 12;
  const menuGap = 8;
  menu.style.position = "fixed";
  menu.style.left = `${Math.round(triggerRect.left)}px`;
  menu.style.top = "0px";
  menu.style.right = "auto";
  menu.style.bottom = "auto";
  menu.style.width = `${Math.round(triggerRect.width)}px`;
  menu.style.visibility = "hidden";
  menu.style.maxHeight = "";

  const naturalHeight = Math.max(menu.scrollHeight, 0);
  const spaceBelow = Math.max(120, Math.floor(window.innerHeight - triggerRect.bottom - viewportPadding - menuGap));
  const spaceAbove = Math.max(120, Math.floor(triggerRect.top - viewportPadding - menuGap));
  const openUpward = naturalHeight > spaceBelow && spaceAbove > spaceBelow;
  const availableHeight = openUpward ? spaceAbove : spaceBelow;
  const renderedHeight = Math.min(Math.max(menu.scrollHeight, naturalHeight), availableHeight);
  const top = openUpward
    ? Math.max(viewportPadding, Math.round(triggerRect.top - renderedHeight - menuGap))
    : Math.min(
      Math.round(triggerRect.bottom + menuGap),
      Math.max(viewportPadding, Math.round(window.innerHeight - viewportPadding - renderedHeight)),
    );

  menu.style.maxHeight = `${availableHeight}px`;
  menu.style.top = `${top}px`;
  menu.style.visibility = "";
  menu.dataset.dropdownDirection = openUpward ? "up" : "down";
  wrapper.dataset.dropdownDirection = openUpward ? "up" : "down";
}

function syncOpenCustomSelectMenuPosition() {
  const openWrapper = document.querySelector(".custom-select.is-open");
  const openSelect = openWrapper?.querySelector("select[data-custom-select]");
  if (openSelect instanceof HTMLSelectElement) {
    positionCustomSelectMenu(openSelect);
  }
}

function requestOpenCustomSelectMenuPositionSync() {
  if (appState.customSelectPositionFrame) {
    return;
  }

  appState.customSelectPositionFrame = window.requestAnimationFrame(() => {
    appState.customSelectPositionFrame = 0;
    syncOpenCustomSelectMenuPosition();
  });
}

function syncCustomSelect(select) {
  const wrapper = select?.closest(".custom-select");
  if (!wrapper) {
    return;
  }

  const trigger = wrapper.querySelector(".custom-select-trigger");
  const valueLabel = wrapper.querySelector(".custom-select-value");
  const menu = getCustomSelectMenuElement(wrapper);
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
  const menu = getCustomSelectMenuElement(wrapper);
  wrapper.classList.add("is-open");
  trigger?.setAttribute("aria-expanded", "true");
  appState.customSelectOpenKey = dropdownKey;
  if (menu) {
    menu.hidden = false;
    mountCustomSelectMenuToBody(wrapper, menu);
    positionCustomSelectMenu(select);
    const selectedOption = menu.querySelector(".custom-select-option.is-selected") || menu.querySelector(".custom-select-option");
    window.setTimeout(() => {
      positionCustomSelectMenu(select);
      selectedOption?.focus();
    }, 0);
  }
}

function closeCustomSelect(select) {
  const wrapper = select?.closest(".custom-select");
  if (!wrapper) {
    return;
  }

  wrapper.classList.remove("is-open");
  const trigger = wrapper.querySelector(".custom-select-trigger");
  const menu = getCustomSelectMenuElement(wrapper);
  trigger?.setAttribute("aria-expanded", "false");
  if (menu) {
    resetCustomSelectMenuPosition(wrapper, menu);
    menu.hidden = true;
    restoreCustomSelectMenuToWrapper(wrapper, menu);
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

    wrapper.__customSelectMenu = menu;
    buildCustomSelectOptions(select, menu);
    syncCustomSelect(select);
    const dropdownKey = wrapper.dataset.dropdownKey || "";
    const isOpen = appState.customSelectOpenKey === dropdownKey && Boolean(dropdownKey);
    wrapper.classList.toggle("is-open", isOpen);
    menu.hidden = !isOpen;
    trigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    if (isOpen) {
      mountCustomSelectMenuToBody(wrapper, menu);
      positionCustomSelectMenu(select);
    } else {
      resetCustomSelectMenuPosition(wrapper, menu);
      restoreCustomSelectMenuToWrapper(wrapper, menu);
    }

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

function closeMobileNavigation() {
  if (!appState.mobileNavOpen) {
    if (mobileNavDrawer) {
      mobileNavDrawer.hidden = true;
      mobileNavDrawer.setAttribute("aria-hidden", "true");
    }
    mobileNavToggle?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("mobile-nav-open");
    return;
  }

  appState.mobileNavOpen = false;
  if (mobileNavDrawer) {
    mobileNavDrawer.hidden = true;
    mobileNavDrawer.setAttribute("aria-hidden", "true");
  }
  mobileNavToggle?.setAttribute("aria-expanded", "false");
  document.body.classList.remove("mobile-nav-open");
}

function openMobileNavigation() {
  if (!mobileNavDrawer) {
    return;
  }

  appState.mobileNavOpen = true;
  mobileNavDrawer.hidden = false;
  mobileNavDrawer.setAttribute("aria-hidden", "false");
  mobileNavToggle?.setAttribute("aria-expanded", "true");
  document.body.classList.add("mobile-nav-open");
}

function toggleMobileNavigation() {
  if (appState.mobileNavOpen) {
    closeMobileNavigation();
    return;
  }
  openMobileNavigation();
}

function navigateToProfileRoute() {
  closeAccountMenu();
  closeMobileNavigation();
  window.history.pushState(null, "", "/profile");
  appState.currentRouteHash = "#profile";
  safeRender();
}

function navigateToHashRoute(nextHash = "#home") {
  const normalizedHash = normalizeNavigationHash(nextHash);
  closeAccountMenu();
  closeMobileNavigation();
  const pathPrefix = getCurrentAppPathRoute() ? "/" : window.location.pathname;
  window.history.pushState(null, "", `${pathPrefix}${window.location.search}${normalizedHash}`);
  appState.currentRouteHash = normalizedHash;
  safeRender();
}

function syncMobileNavigationMenu() {
  if (!mobileNavContent) {
    return;
  }

  const isSignedIn = Boolean(appState.user);
  const unseenNotificationCount = isSignedIn ? getUnseenMockGrowNetworkNotificationCount() : 0;
  const growNetworkBadge = unseenNotificationCount > 0
    ? `<span class="mobile-nav-link-badge" aria-hidden="true">${escapeHtml(formatGrowNetworkNotificationBadgeCount(unseenNotificationCount))}</span>`
    : "";

  mobileNavContent.innerHTML = `
    <nav class="mobile-nav-links" aria-label="Mobile primary navigation">
      <a class="mobile-nav-link" href="#home" data-mobile-nav-link="true">Home</a>
      <a class="mobile-nav-link" href="#sessions" data-mobile-nav-link="true">Sessions</a>
      <a class="mobile-nav-link" href="#gallery" data-mobile-nav-link="true">Community Grow</a>
      ${isSignedIn ? `<a class="mobile-nav-link" href="#network" data-mobile-nav-link="true" data-network-nav>Grow Network${growNetworkBadge}</a>` : ""}
      ${isSignedIn ? `<button type="button" class="mobile-nav-link mobile-nav-link-button" data-mobile-profile-link="true">Profile</button>` : ""}
      ${isSignedIn ? `<button type="button" class="mobile-nav-link mobile-nav-link-button is-danger" data-mobile-sign-out="true">Sign Out</button>` : `<button type="button" class="mobile-nav-link mobile-nav-link-button" data-mobile-sign-in="true">Sign In</button>`}
    </nav>
  `;

  mobileNavContent.querySelectorAll("[data-mobile-nav-link='true']").forEach((link) => {
    link.addEventListener("click", () => {
      closeMobileNavigation();
    });
  });

  mobileNavContent.querySelector("[data-mobile-profile-link='true']")?.addEventListener("click", () => {
    navigateToProfileRoute();
  });

  mobileNavContent.querySelector("[data-mobile-sign-in='true']")?.addEventListener("click", () => {
    closeMobileNavigation();
    openAuthModal();
  });

  mobileNavContent.querySelector("[data-mobile-sign-out='true']")?.addEventListener("click", async () => {
    closeMobileNavigation();
    appState.userRole = "user";
    appState.isAdmin = false;
    updateAuthStatus();
    safeRender();
    await appState.supabase?.auth.signOut();
  });

  syncAdminNavigationVisibility();
  syncGrowNetworkNavigationVisibility();
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
    chevronDown: `
      <svg viewBox="0 0 24 24" focusable="false">
        <path d="m7 10 5 5 5-5"></path>
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

  const profilePayload = {
    id: user.id,
    username: String(existingProfile?.username || "").trim(),
    email: String(user.email || existingProfile?.email || "").trim().toLowerCase(),
    avatar_url: String(existingProfile?.avatar_url || "").trim(),
    avatar_path: String(existingProfile?.avatar_path || "").trim(),
    account_status: String(existingProfile?.account_status || "active").trim() || "active",
    last_active_at: new Date().toISOString(),
    deletion_requested_at: existingProfile?.deletion_requested_at || null,
    deletion_scheduled_for: existingProfile?.deletion_scheduled_for || null,
    deletion_status: String(existingProfile?.deletion_status || "").trim(),
  };

  const { data: savedProfile, error: upsertError } = await appState.supabase
    .from("profiles")
    .upsert(profilePayload)
    .select("*")
    .single();

  if (upsertError) {
    console.error("Profile create/update error:", upsertError);
    appState.profileError = upsertError.message || "Could not create profile.";
    return null;
  }

  return normalizeProfileRow(savedProfile);
}

function getSessions() {
  return appState.sessions;
}

function normalizeFilterPaperInventory(inventory) {
  const normalizedCount = Math.max(0, Math.floor(Number(inventory?.count) || 0));
  const hasSavedAutoSubtractPreference = Object.prototype.hasOwnProperty.call(inventory || {}, "autoSubtract");
  const hasSavedNotifyLowSupplyPreference = Object.prototype.hasOwnProperty.call(inventory || {}, "notifyLowSupply");
  return {
    count: normalizedCount,
    autoSubtract: hasSavedAutoSubtractPreference
      ? Boolean(inventory?.autoSubtract)
      : DEFAULT_FILTER_PAPER_INVENTORY.autoSubtract,
    notifyLowSupply: hasSavedNotifyLowSupplyPreference
      ? Boolean(inventory?.notifyLowSupply)
      : DEFAULT_FILTER_PAPER_INVENTORY.notifyLowSupply,
    storeRegion: inventory?.storeRegion === "EU" ? "EU" : "US",
  };
}

function loadFilterPaperInventory() {
  try {
    return normalizeFilterPaperInventory(JSON.parse(localStorage.getItem(FILTER_PAPER_INVENTORY_STORAGE_KEY) || "null"));
  } catch (error) {
    console.error("Failed to read filter paper inventory from localStorage", error);
    return { ...DEFAULT_FILTER_PAPER_INVENTORY };
  }
}

function getFilterPaperInventory() {
  if (!appState.filterPaperInventory) {
    appState.filterPaperInventory = loadFilterPaperInventory();
  }
  return normalizeFilterPaperInventory(appState.filterPaperInventory);
}

function hasFilterPaperInventoryBeenSet() {
  try {
    return localStorage.getItem(FILTER_PAPER_INVENTORY_STORAGE_KEY) !== null;
  } catch (error) {
    console.error("Failed to check whether filter paper inventory has been set", error);
    return false;
  }
}

function saveFilterPaperInventory(inventory) {
  const normalizedInventory = normalizeFilterPaperInventory(inventory);
  appState.filterPaperInventory = normalizedInventory;
  localStorage.setItem(FILTER_PAPER_INVENTORY_STORAGE_KEY, JSON.stringify(normalizedInventory));
  return normalizedInventory;
}

function normalizeFilterPaperDeductionRegistry(registry) {
  if (!registry || typeof registry !== "object") {
    return {};
  }

  return Object.entries(registry).reduce((accumulator, [sessionId, deducted]) => {
    const normalizedSessionId = String(sessionId || "").trim();
    if (normalizedSessionId && deducted) {
      accumulator[normalizedSessionId] = true;
    }
    return accumulator;
  }, {});
}

function loadFilterPaperDeductionRegistry() {
  try {
    return normalizeFilterPaperDeductionRegistry(JSON.parse(localStorage.getItem(FILTER_PAPER_DEDUCTION_REGISTRY_STORAGE_KEY) || "{}"));
  } catch (error) {
    console.error("Failed to read filter paper deduction registry from localStorage", error);
    return {};
  }
}

function getFilterPaperDeductionRegistry() {
  if (!appState.filterPaperDeductionRegistry) {
    appState.filterPaperDeductionRegistry = loadFilterPaperDeductionRegistry();
  }
  return appState.filterPaperDeductionRegistry;
}

function saveFilterPaperDeductionRegistry(registry) {
  const normalizedRegistry = normalizeFilterPaperDeductionRegistry(registry);
  appState.filterPaperDeductionRegistry = normalizedRegistry;
  localStorage.setItem(FILTER_PAPER_DEDUCTION_REGISTRY_STORAGE_KEY, JSON.stringify(normalizedRegistry));
  return normalizedRegistry;
}

function getSessionFilterPaperDeducted(session) {
  const sessionId = String(session?.id || "").trim();
  if (!sessionId) {
    return Boolean(session?.filterPaperDeducted);
  }

  return Boolean(session?.filterPaperDeducted || getFilterPaperDeductionRegistry()[sessionId]);
}

function setSessionFilterPaperDeducted(session, deducted = true) {
  const sessionId = String(session?.id || "").trim();
  if (!sessionId) {
    if (session && deducted) {
      session.filterPaperDeducted = true;
    }
    return;
  }

  const nextRegistry = {
    ...getFilterPaperDeductionRegistry(),
  };
  if (deducted) {
    nextRegistry[sessionId] = true;
  } else {
    delete nextRegistry[sessionId];
  }
  saveFilterPaperDeductionRegistry(nextRegistry);

  if (session) {
    session.filterPaperDeducted = Boolean(deducted);
  }
}

function shouldAutoDeductFilterPaperForSessionCompletion(session, previousStatus = "") {
  const inventory = getFilterPaperInventory();
  return (
    inventory.autoSubtract
    && normalizeSessionStatus(previousStatus) !== "completed"
    && normalizeSessionStatus(session?.sessionStatus) === "completed"
    && !getSessionFilterPaperDeducted(session)
  );
}

function applyFilterPaperDeductionForCompletedSession(session) {
  if (!session?.id || getSessionFilterPaperDeducted(session)) {
    return null;
  }

  const inventory = getFilterPaperInventory();
  const nextInventory = saveFilterPaperInventory({
    ...inventory,
    count: Math.max(0, inventory.count - FILTER_PAPER_USAGE_PER_COMPLETED_SESSION),
  });
  setSessionFilterPaperDeducted(session, true);
  // TODO: Persist per-session deduction flags alongside the session record once Supabase sync is added for supplies metadata.
  saveSessions(getSessions().map((item) => (
    item.id === session.id
      ? { ...item, filterPaperDeducted: true }
      : item
  )));
  return nextInventory;
}

function getFilterPaperStatusMeta(count) {
  if (count <= 1) {
    return { key: "critical", label: "Critical" };
  }
  if (count === 2) {
    return { key: "low", label: "Low" };
  }
  return { key: "ok", label: "OK" };
}

function getFilterPaperStatusDisplayLabel(statusKey, options = {}) {
  const { criticalLabel = "Critical" } = options || {};
  if (statusKey === "critical") {
    return criticalLabel;
  }
  if (statusKey === "low") {
    return "Low";
  }
  return "OK";
}

function getSessionEntrySupplyTone(count = getFilterPaperInventory().count) {
  if (!hasFilterPaperInventoryBeenSet()) {
    return "ok";
  }
  if (count <= 1) {
    return "urgent";
  }
  if (count === 2) {
    return "low";
  }
  return "ok";
}

function getFilterPaperReminder(count) {
  if (getFilterPaperInventory().notifyLowSupply === false) {
    return "";
  }
  if (count === 2) {
    return "Running low - about 2 sessions left.";
  }
  if (count === 1) {
    return "Only 1 filter paper left.";
  }
  if (count === 0) {
    return "Out of filter papers - reorder before next session.";
  }
  return "";
}

function getFilterPaperStoreUrl(region = "US") {
  const normalizedRegion = region === "EU" ? "EU" : "US";
  // Future: auto-detect user region for smarter routing.
  // TODO: Route users to distributor-, country-, or province/state-specific product links when regional rules are defined.
  return FILTER_PAPER_STORE_URLS[normalizedRegion] || FILTER_PAPER_STORE_URLS.US;
}

function openFilterPaperStore(region = getFilterPaperInventory().storeRegion) {
  const url = getFilterPaperStoreUrl(region);
  if (!url) {
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}

function applySupplyStatusToSessionEntryButtons(scope = document) {
  if (!scope?.querySelectorAll) {
    return;
  }

  const tone = getSessionEntrySupplyTone();
  scope.querySelectorAll('[data-session-entry="true"]').forEach((button) => {
    button.classList.remove("session-entry-supply-low", "session-entry-supply-urgent");
    // Button styling reflects supply status for subtle UX guidance.
    // Future: could expand to other consumables or predictive warnings.
    if (tone === "low") {
      button.classList.add("session-entry-supply-low");
    } else if (tone === "urgent") {
      button.classList.add("session-entry-supply-urgent");
    }
  });
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
    filterPaperDeducted: getSessionFilterPaperDeducted(session),
    partitions: Array.isArray(session.partitions) ? session.partitions : [],
    snapshotState: normalizePersistedSessionSnapshotState(session.snapshotState),
    createdAt: String(session.createdAt || "").trim(),
    updatedAt: String(
      session.updatedAt
      || session.lastUpdatedAt
      || session.updated_at
      || session.last_updated_at
      || "",
    ).trim(),
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
        ["Blue Dream", "Seedsman", "photo", "feminized", 12, 9],
        ["Blue Dream", "Seedsman", "photo", "feminized", 10, 8],
        ["Blue Dream", "Seedsman", "photo", "feminized", 14, 11],
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
      sessionNotes: "Strong early tails on partitions 2, 3, and 4. One slower pocket stayed in the dome an extra half day before planting.",
      partitionSeeds: [
        ["Lemon Cherry Gelato", "Elev8", "photo", "feminized", 10, 10],
        ["Lemon Cherry Gelato", "Elev8", "photo", "feminized", 12, 11],
        ["Lemon Cherry Gelato", "Elev8", "photo", "feminized", 8, 7],
        ["Lemon Cherry Gelato", "Elev8", "photo", "feminized", 9, 8],
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
        ["Cosmic Queen", "Mephisto", "auto", "feminized", 12, 10],
        ["Cosmic Queen", "Mephisto", "auto", "feminized", 10, 8],
        ["Sour Stomper", "Mephisto", "auto", "feminized", 9, 7],
        ["Double Grape", "Mephisto", "auto", "feminized", 11, 8],
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
        ["Orange Creamsicle", "Humboldt Seed Co", "photo", "feminized", 15, 14],
        ["Blueberry Muffin", "Humboldt Seed Co", "photo", "feminized", 12, 11],
        ["Pineapple Upside Down Cake", "Humboldt Seed Co", "photo", "feminized", 10, 8],
        ["Jelly Donutz", "Humboldt Seed Co", "photo", "feminized", 9, 8],
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
    updatedAt: config.updatedAt || `${config.date}T${config.time}:00`,
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
  return hasResolvedAdminAccess();
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
    appState.mockGalleryReviewStatuses = {};
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
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" role="img" aria-label="Dev mock Community Grow preview">
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
      <text x="96" y="152" fill="${palette.accent}" font-size="36" font-family="Arial, sans-serif" font-weight="700">DEV MOCK COMMUNITY GROW DATA</text>
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
  const seedCountPattern = [18, 22, 24, 28, 32, 36];
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

function buildMockGalleryTimeline(record, index = 0) {
  const completedAt = new Date(record.submittedAt);
  const soakingMinutes = 16 * 60 + ((index % 5) * 47) + (record.seedType === "auto" ? 22 : 9);
  const germinationMinutes = 18 * 60 + ((100 - Math.max(0, Number(record.germinationRate) || 0)) * 9) + ((index % 4) * 26);
  const completionMinutes = 6 * 60 + ((index % 3) * 18) + Math.max(0, Number(record.seedCount) || 0);
  const startedAt = new Date(completedAt.getTime() - ((soakingMinutes + germinationMinutes + completionMinutes) * 60000));
  const germinationStartedAt = new Date(startedAt.getTime() + (soakingMinutes * 60000));
  const firstPlantedAt = new Date(germinationStartedAt.getTime() + (germinationMinutes * 60000));

  return {
    startedAt,
    sessionDate: startedAt.toISOString().slice(0, 10),
    sessionTime: startedAt.toISOString().slice(11, 16),
    germinationStartedAt: germinationStartedAt.toISOString(),
    firstPlantedAt: firstPlantedAt.toISOString(),
    completedAt: completedAt.toISOString(),
  };
}

function buildMockGallerySnapshots(records = buildMockGallerySnapshotSeedRecords()) {
  return records.map((record, index) => {
    const systemType = index % 2 === 0 ? "KAN" : "TRA";
    const unitId = systemType === "KAN"
      ? String.fromCharCode(65 + (index % 4))
      : String((index % 4) + 1);
    const usesDetailsOnlyCard = index % 9 === 0;
    const sharedProfile = getMockGallerySharedProfile(index, record);
    const timeline = buildMockGalleryTimeline(record, index);

    return {
      id: `mock-gallery-${String(index + 1).padStart(2, "0")}`,
      userId: GALLERY_MOCK_USER_ID,
      sessionId: "",
      title: `DEV MOCK - ${record.seedVariety} - ${record.source}`,
      imageUrl: usesDetailsOnlyCard ? "" : buildMockGalleryImageDataUri(record),
      imagePath: "",
      sessionDate: timeline.sessionDate,
      sessionTime: timeline.sessionTime,
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
      germinationStartedAt: timeline.germinationStartedAt,
      firstPlantedAt: timeline.firstPlantedAt,
      completedAt: timeline.completedAt,
      likeCount: record.likes,
      likedByCurrentUser: false,
      isMock: true,
      mockDataVersion: GALLERY_MOCK_DATA_VERSION,
    };
  });
}

const MOCK_GALLERY_SNAPSHOTS = buildMockGallerySnapshots();

function buildMockPendingGalleryReviewSnapshots(now = new Date()) {
  const records = buildMockGallerySnapshotSeedRecords(now)
    .slice(0, 5)
    .map((record, index) => ({
      ...record,
      submittedAt: createMockGalleryMonthDate(
        new Date(now.getFullYear(), now.getMonth(), 1, 12, 0, 0, 0),
        [4, 8, 12, 19, 26][index] || (index + 1),
        [9, 11, 14, 16, 18][index] || 12,
      ),
      approved: false,
      likes: 0,
    }));

  return records.map((record, index) => {
    const systemType = index % 2 === 0 ? "KAN" : "TRA";
    const unitId = systemType === "KAN"
      ? String.fromCharCode(65 + ((index + 1) % 4))
      : String(((index + 1) % 4) + 1);
    const usesDetailsOnlyCard = index === 1 || index === 4;
    const sharedProfile = getMockGallerySharedProfile(index, record);

    return {
      id: `mock-gallery-review-${String(index + 1).padStart(2, "0")}`,
      userId: `${GALLERY_MOCK_USER_ID}-review`,
      sessionId: `mock-gallery-review-session-${String(index + 1).padStart(2, "0")}`,
      title: `DEV MOCK - ${record.seedVariety} - ${record.source}`,
      imageUrl: usesDetailsOnlyCard ? "" : buildMockGalleryImageDataUri(record),
      imagePath: "",
      sessionDate: record.submittedAt.slice(0, 10),
      systemType,
      unitId,
      totalSeeds: record.seedCount,
      totalPlanted: record.germinatedCount,
      successPercent: record.germinationRate,
      submittedBy: "Dev Mock Submission",
      sourceName: record.source,
      sourceLogoUrl: buildMockGallerySourceBadgeDataUri(record.source),
      seedVarietyName: record.seedVariety,
      seedTypeName: record.seedType,
      includeProfileInGallery: sharedProfile.includeProfileInGallery,
      profileName: sharedProfile.profileName,
      profileImageUrl: sharedProfile.profileImageUrl,
      status: "pending_review",
      published: false,
      includeNotes: false,
      publishedAt: "",
      createdAt: record.submittedAt,
      updatedAt: record.submittedAt,
      likeCount: 0,
      likedByCurrentUser: false,
      isMock: true,
      isMockReview: true,
      mockDataVersion: GALLERY_MOCK_DATA_VERSION,
    };
  });
}

const MOCK_PENDING_GALLERY_SUBMISSIONS = buildMockPendingGalleryReviewSnapshots();

function getGallerySnapshotsForDisplay(snapshotRows = appState.gallerySnapshots) {
  if (isMockDataEnabled()) {
    return sortGallerySnapshotsNewestFirst(MOCK_GALLERY_SNAPSHOTS);
  }

  return sortGallerySnapshotsNewestFirst(snapshotRows);
}

function isMockGallerySnapshot(snapshot) {
  return Boolean(snapshot?.isMock) || String(snapshot?.id || "").startsWith("mock-gallery-");
}

function isMockGalleryReviewSnapshot(snapshot) {
  return Boolean(snapshot?.isMockReview) || String(snapshot?.id || "").startsWith("mock-gallery-review-");
}

function normalizeMockPublicSessionScenarioKey(key = "") {
  const normalizedKey = String(key || "").trim().toLowerCase();
  return MOCK_PUBLIC_SESSION_SCENARIOS.some((scenario) => scenario.key === normalizedKey)
    ? normalizedKey
    : MOCK_PUBLIC_SESSION_SCENARIOS[0].key;
}

function getActiveMockPublicSessionScenario(snapshot = null) {
  if (!isMockDataEnabled() || !isMockGallerySnapshot(snapshot)) {
    return null;
  }

  const scenarioKey = normalizeMockPublicSessionScenarioKey(appState.mockPublicSessionScenarioKey);
  return MOCK_PUBLIC_SESSION_SCENARIOS.find((scenario) => scenario.key === scenarioKey) || MOCK_PUBLIC_SESSION_SCENARIOS[0];
}

function setActiveMockPublicSessionScenario(key = "") {
  appState.mockPublicSessionScenarioKey = normalizeMockPublicSessionScenarioKey(key);
}

function getMockGalleryReviewStatus(snapshot) {
  const snapshotId = String(snapshot?.id || "").trim();
  if (!snapshotId) {
    return "pending_review";
  }

  return appState.mockGalleryReviewStatuses[snapshotId] || "pending_review";
}

function getGalleryReviewSnapshotById(snapshotId) {
  const normalizedId = String(snapshotId || "").trim();
  if (!normalizedId) {
    return null;
  }

  return [
    ...appState.gallerySnapshots,
    ...(isMockDataEnabled() ? MOCK_PENDING_GALLERY_SUBMISSIONS : []),
  ].find((snapshot) => String(snapshot?.id || "").trim() === normalizedId) || null;
}

function getAdminReviewPendingSnapshots() {
  const realPendingSnapshots = appState.gallerySnapshots.filter((entry) => (
    getGallerySnapshotDisplayStatus(entry) === "pending_review"
  ));

  if (!isMockDataEnabled()) {
    return sortGallerySnapshotsNewestFirst(realPendingSnapshots);
  }

  const mockPendingSnapshots = MOCK_PENDING_GALLERY_SUBMISSIONS.filter((snapshot) => (
    getMockGalleryReviewStatus(snapshot) === "pending_review"
  ));

  return sortGallerySnapshotsNewestFirst([
    ...mockPendingSnapshots,
    ...realPendingSnapshots,
  ]);
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

function consumeAuthNotice() {
  const nextNotice = String(appState.authNotice || "").trim();
  appState.authNotice = "";
  return nextNotice;
}

function isSupabaseAuthFragmentHash(hash = "") {
  const normalizedHash = String(hash || "").trim().replace(/^#/, "");
  if (!normalizedHash) {
    return false;
  }

  return normalizedHash.includes("access_token=")
    || normalizedHash.includes("refresh_token=")
    || normalizedHash.includes("type=recovery")
    || normalizedHash.includes("type=invite")
    || normalizedHash.includes("type=magiclink");
}

function isSupabaseRecoveryHash(hash = "") {
  return String(hash || "").trim().replace(/^#/, "").includes("type=recovery");
}

function getLocationRouteHash() {
  const currentHash = window.location.hash || "#home";
  if (isSupabaseAuthFragmentHash(currentHash)) {
    return "home";
  }
  return currentHash.replace(/^#/, "");
}

function getCurrentAppPathRoute() {
  const pathRoute = window.location.pathname.replace(/^\/+/, "");
  return pathRoute === "admin/gallery-moderation" || pathRoute === "profile"
    ? pathRoute
    : "";
}

function isUsingPathRoute(route = "") {
  const normalizedRoute = String(route || "").trim().replace(/^\/+/, "");
  const currentHash = window.location.hash || "";
  return Boolean(
    normalizedRoute
    && getCurrentAppPathRoute() === normalizedRoute
    && (!currentHash || isSupabaseAuthFragmentHash(currentHash)),
  );
}

function routeRequiresSignedInUser(hash = window.location.hash || "#home") {
  const normalizedHash = normalizeNavigationHash(hash);
  const [route, id, subroute] = normalizedHash.replace(/^#/, "").split("/");

  if (route === "admin" || route === "network" || route === "new" || route === "members" || route === "profile") {
    return true;
  }

  if (route === "sessions") {
    return !(id === "public" && Boolean(subroute));
  }

  return false;
}

function replaceLocationHashWithoutNavigation(nextHash = "#home") {
  const normalizedHash = normalizeNavigationHash(nextHash);
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${normalizedHash}`);
  return normalizedHash;
}

function dismissAuthModal() {
  const modal = document.querySelector("#auth-modal");
  const dismissHash = !appState.user && appState.authModalDismissHash
    ? normalizeNavigationHash(appState.authModalDismissHash)
    : "";

  appState.authModalDismissHash = "";
  if (modal instanceof HTMLDialogElement && modal.open) {
    modal.close();
  }

  if (dismissHash) {
    replaceLocationHashWithoutNavigation(dismissHash);
    appState.currentRouteHash = dismissHash;
    safeRender();
  }
}

function clearSupabaseAuthFragmentHash() {
  if (!isSupabaseAuthFragmentHash(window.location.hash || "")) {
    return;
  }
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#home`);
}

function renderAuthModalLoginContent(modal, options = {}) {
  const body = modal?.querySelector("#auth-modal-body");
  if (!body) {
    return null;
  }

  body.replaceChildren(cloneTemplate(templates.auth));
  body.querySelector(".auth-card")?.classList.add("auth-card-inline");
  const modalTitle = body.querySelector(".auth-card h2");
  if (modalTitle) {
    modalTitle.textContent = "Sign in to your grow sessions";
  }
  bindAuthForm(body.querySelector("#auth-form"), {
    messageElement: body.querySelector("#auth-message"),
    onLoginSuccess: () => {
      closeAuthModal();
      redirectToHomeAfterLogin();
    },
    initialMessage: options.initialMessage || "",
    initialMessageTone: options.initialMessageTone || "",
  });

  if (!modal.open) {
    modal.showModal();
  }
  body.querySelector(`input[name="${options.focusField || "email"}"]`)?.focus();
  return body;
}

function renderAuthModalResetContent(modal, options = {}) {
  const body = modal?.querySelector("#auth-modal-body");
  if (!body) {
    return null;
  }

  body.replaceChildren(cloneTemplate(templates.authReset));
  body.querySelector(".auth-card")?.classList.add("auth-card-inline");
  bindPasswordResetForm(body.querySelector("#auth-reset-form"), {
    messageElement: body.querySelector("#auth-reset-message"),
    modal,
    initialMessage: options.initialMessage || "",
    initialMessageTone: options.initialMessageTone || "",
  });

  if (!modal.open) {
    modal.showModal();
  }
  body.querySelector('input[name="newPassword"]')?.focus();
  return body;
}

function openPasswordRecoveryModal(options = {}) {
  if (!isSupabaseConfigured() || !appState.supabase) {
    return false;
  }

  const modal = ensureAuthModal();
  appState.authRecoveryMode = true;
  renderAuthModalResetContent(modal, options);
  return true;
}

function bindAuthForm(form, options = {}) {
  if (!form) {
    return;
  }

  const {
    messageElement = form.querySelector("#auth-message"),
    onLoginSuccess = redirectToHomeAfterLogin,
    initialMessage = "",
    initialMessageTone = "",
  } = options;
  const confirmField = form.querySelector("#confirm-password-field");
  const confirmInput = form.elements.confirmPassword;
  const emailInput = form.elements.email;
  const forgotPasswordButton = form.querySelector("[data-auth-forgot-password]");
  let authMode = "login";
  let forgotPasswordCooldownTimeout = null;

  const setMessage = (text = "", tone = "") => {
    if (!messageElement) {
      return;
    }

    messageElement.className = "form-message";
    if (tone === "success") {
      messageElement.classList.add("is-success");
    } else if (tone === "warning") {
      messageElement.classList.add("is-warning");
    }
    messageElement.textContent = text;
  };

  const resetForgotPasswordState = () => {
    if (!forgotPasswordButton) {
      return;
    }
    forgotPasswordButton.disabled = false;
    forgotPasswordButton.dataset.state = "idle";
    forgotPasswordButton.textContent = "Forgot password?";
  };

  const syncForgotPasswordCooldown = () => {
    if (!forgotPasswordButton) {
      return;
    }
    if (forgotPasswordCooldownTimeout) {
      window.clearTimeout(forgotPasswordCooldownTimeout);
      forgotPasswordCooldownTimeout = null;
    }

    const remainingMs = Math.max(0, Number(appState.authForgotPasswordCooldownUntil || 0) - Date.now());
    if (remainingMs <= 0) {
      appState.authForgotPasswordCooldownUntil = 0;
      resetForgotPasswordState();
      return;
    }

    forgotPasswordButton.disabled = true;
    forgotPasswordButton.dataset.state = "sent";
    forgotPasswordButton.textContent = "Email sent ✓";
    forgotPasswordCooldownTimeout = window.setTimeout(() => {
      appState.authForgotPasswordCooldownUntil = 0;
      syncForgotPasswordCooldown();
    }, remainingMs);
  };

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
      setMessage("Passwords do not match.", "warning");
      return false;
    }

    confirmInput.setCustomValidity("");
    if (messageElement?.textContent === "Passwords do not match.") {
      setMessage("");
    }
    return true;
  };

  form.querySelectorAll('button[name="action"]').forEach((button) => {
    button.addEventListener("click", () => {
      setAuthMode(button.value);
      setMessage("");
    });
  });

  confirmInput?.addEventListener("input", validatePasswordMatch);
  form.elements.password?.addEventListener("input", validatePasswordMatch);
  emailInput?.addEventListener("input", () => {
    if (forgotPasswordButton?.dataset.state === "sent" && Date.now() >= Number(appState.authForgotPasswordCooldownUntil || 0)) {
      resetForgotPasswordState();
    }
  });
  setAuthMode("login");
  syncForgotPasswordCooldown();
  const authNotice = initialMessage || consumeAuthNotice();
  if (authNotice) {
    setMessage(authNotice, initialMessage ? initialMessageTone : "");
  }

  forgotPasswordButton?.addEventListener("click", async () => {
    const email = String(emailInput?.value || "").trim();
    if (!email) {
      setMessage("Enter your email first", "warning");
      emailInput?.focus();
      return;
    }

    if (!appState.supabase) {
      setMessage("Password reset is unavailable right now. Please try again later.");
      return;
    }

    forgotPasswordButton.disabled = true;
    try {
      const { error } = await appState.supabase.auth.resetPasswordForEmail(email);
      if (error) {
        throw error;
      }
      appState.authForgotPasswordCooldownUntil = Date.now() + AUTH_FORGOT_PASSWORD_COOLDOWN_MS;
      syncForgotPasswordCooldown();
      setMessage("Password reset email sent. Check your inbox.", "success");
    } catch (error) {
      console.warn("[Auth] Could not send password reset email.", error);
      forgotPasswordButton.disabled = false;
      setMessage("Could not send reset email. Please verify your email and try again.", "warning");
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitter = event.submitter;
    const action = submitter?.value || "login";
    setAuthMode(action);
    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    setMessage("");

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
        setMessage("Check your email to confirm your account, then log in.", "success");
        return;
      }

      const { error } = await appState.supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw error;
      }

      onLoginSuccess();
    } catch (error) {
      setMessage(error.message || "Authentication failed.");
    }
  });
}

function bindPasswordResetForm(form, options = {}) {
  if (!form) {
    return;
  }

  const {
    messageElement = form.querySelector("#auth-reset-message"),
    modal = ensureAuthModal(),
    initialMessage = "",
    initialMessageTone = "",
  } = options;

  const setMessage = (text = "", tone = "") => {
    if (!messageElement) {
      return;
    }
    messageElement.className = "form-message";
    if (tone === "success") {
      messageElement.classList.add("is-success");
    } else if (tone === "warning") {
      messageElement.classList.add("is-warning");
    }
    messageElement.textContent = text;
  };

  const validatePasswords = () => {
    const newPassword = String(form.elements.newPassword?.value || "");
    const confirmPassword = String(form.elements.confirmNewPassword?.value || "");
    if (!newPassword) {
      setMessage("Password required", "warning");
      return false;
    }
    if (newPassword.length < 8) {
      setMessage("Password must be at least 8 characters.", "warning");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setMessage("Passwords must match.", "warning");
      return false;
    }
    if (messageElement?.textContent === "Passwords must match." || messageElement?.textContent === "Password must be at least 8 characters." || messageElement?.textContent === "Password required") {
      setMessage("");
    }
    return true;
  };

  form.elements.newPassword?.addEventListener("input", validatePasswords);
  form.elements.confirmNewPassword?.addEventListener("input", validatePasswords);
  if (initialMessage) {
    setMessage(initialMessage, initialMessageTone);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage("");
    if (!validatePasswords()) {
      form.elements.newPassword?.reportValidity();
      form.elements.confirmNewPassword?.reportValidity();
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    const newPassword = String(form.elements.newPassword?.value || "");
    submitButton?.setAttribute("disabled", "true");
    try {
      const { error } = await appState.supabase.auth.updateUser({ password: newPassword });
      if (error) {
        throw error;
      }

      appState.authRecoveryMode = false;
      setMessage("Password updated. You can now sign in.", "success");
      try {
        await appState.supabase.auth.signOut();
      } catch (signOutError) {
        console.warn("[Auth Recovery] Could not sign out after password reset.", signOutError);
      }
      renderAuthModalLoginContent(modal, {
        initialMessage: "Password updated. You can now sign in.",
        initialMessageTone: "success",
        focusField: "email",
      });
    } catch (error) {
      console.warn("[Auth Recovery] Could not update password.", error);
      setMessage("Could not update password. Please try again.", "warning");
    } finally {
      submitButton?.removeAttribute("disabled");
    }
  });
}

function ensureAuthModal() {
  let modal = document.querySelector("#auth-modal");
  if (modal instanceof HTMLDialogElement) {
    return modal;
  }

  modal = document.createElement("dialog");
  modal.id = "auth-modal";
  modal.className = "snapshot-modal auth-modal";
  modal.innerHTML = `
    <div class="snapshot-modal-card auth-modal-card" role="document" aria-labelledby="auth-modal-title">
      <button type="button" class="modal-close" data-auth-modal-close aria-label="Close sign in">×</button>
      <div class="snapshot-modal-copy">
        <p class="eyebrow">Secure Access</p>
        <h3 id="auth-modal-title">Sign in to Cannakan® Grow</h3>
        <p class="muted">Use your email and password to save and manage sessions across devices.</p>
      </div>
      <div id="auth-modal-body"></div>
    </div>
  `;

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      dismissAuthModal();
    }
  });
  modal.addEventListener("cancel", (event) => {
    event.preventDefault();
    dismissAuthModal();
  });
  modal.querySelector("[data-auth-modal-close]")?.addEventListener("click", () => {
    dismissAuthModal();
  });
  document.body.appendChild(modal);
  return modal;
}

function closeAuthModal() {
  const modal = document.querySelector("#auth-modal");
  appState.authModalDismissHash = "";
  if (modal instanceof HTMLDialogElement && modal.open) {
    modal.close();
  }
}

function openAuthModal(options = {}) {
  const { dismissHash = "" } = options;
  if (!isSupabaseConfigured() || !appState.authReady || appState.loading) {
    return false;
  }

  if (appState.authRecoveryMode) {
    return openPasswordRecoveryModal();
  }

  if (appState.user) {
    return false;
  }

  appState.authModalDismissHash = dismissHash ? normalizeNavigationHash(dismissHash) : "";
  const modal = ensureAuthModal();
  return Boolean(renderAuthModalLoginContent(modal, { focusField: "email" }));
}

function getCurrentAppRawRoute() {
  const currentHash = window.location.hash || "";
  const pathRoute = getCurrentAppPathRoute();

  if (pathRoute === "admin/gallery-moderation") {
    return pathRoute;
  }

  if (currentHash && !isSupabaseAuthFragmentHash(currentHash)) {
    return currentHash.replace(/^#/, "");
  }

  return pathRoute || "home";
}

function getAdminMessageContext() {
  const rawRoute = getCurrentAppRawRoute();
  const [route, id, subroute] = rawRoute.split("/");
  const routeSuffix = rawRoute ? ` (#${rawRoute})` : "";
  const context = {
    userName: String(appState.profile?.username || "").trim(),
    userEmail: appState.currentUserEmail || getNormalizedUserEmail(appState.user),
    pageContext: "Home",
    sessionId: "",
    snapshotId: "",
    timestamp: new Date().toISOString(),
  };

  if (route === "gallery") {
    context.pageContext = `Community Grow${routeSuffix}`;
    if (id) {
      const snapshot = getGallerySnapshotsForDisplay().find((entry) => entry?.id === id) || null;
      context.snapshotId = snapshot?.id || id;
      context.sessionId = snapshot?.sessionId || "";
    }
    return context;
  }

  if (route === "sessions" && id === "public" && subroute) {
    const snapshot = getGallerySnapshotsForDisplay().find((entry) => entry?.id === subroute) || null;
    context.pageContext = `Public Session${routeSuffix}`;
    context.snapshotId = snapshot?.id || subroute;
    context.sessionId = snapshot?.sessionId || "";
    return context;
  }

  if (route === "sessions") {
    context.pageContext = `Sessions${routeSuffix}`;
    context.sessionId = id || "";
    return context;
  }

  if (route === "admin") {
    context.pageContext = `Admin${routeSuffix}`;
    return context;
  }

  context.pageContext = route === "home" || !route
    ? `Home${routeSuffix}`
    : `${capitalize(String(route).replace(/-/g, " "))}${routeSuffix}`;
  return context;
}

function normalizeAdminMessageType(value = "") {
  const normalizedValue = String(value || "").trim().toLowerCase();
  switch (normalizedValue) {
    case "technical issue":
    case "bug":
      return "Technical issue";
    case "account issue":
      return "Account issue";
    case "report content":
      return "Report content";
    case "feedback":
      return "Feedback";
    case "question":
    case "other":
    default:
      return "Other";
  }
}

function normalizeAdminMessageStatus(value = "") {
  const normalizedValue = String(value || "").trim().toLowerCase();
  return ["new", "reviewed", "resolved"].includes(normalizedValue)
    ? normalizedValue
    : "new";
}

function normalizeAdminMessageRow(row) {
  if (!row || typeof row !== "object") {
    return null;
  }

  return {
    id: String(row.id || "").trim(),
    userId: String(row.user_id || "").trim(),
    name: String(row.name || "").trim(),
    email: String(row.email || "").trim(),
    issueType: normalizeAdminMessageType(row.issue_type || row.message_type),
    message: String(row.message || "").trim(),
    status: normalizeAdminMessageStatus(row.status),
    createdAt: String(row.created_at || "").trim(),
  };
}

function isAdminMessagesTableMissingError(error) {
  const normalizedMessage = String(error?.message || error?.details || error?.hint || "").toLowerCase();
  return normalizedMessage.includes("admin_reports")
    && (normalizedMessage.includes("relation") || normalizedMessage.includes("does not exist"));
}

function logAdminReportFallback(record = {}, error = null) {
  if (error) {
    console.warn("[Admin Reports Fallback] Could not insert report into Supabase.", error);
  }
  console.info("[Admin Reports Fallback] Report logged to console fallback.", record);
  return {
    ...record,
    loggedToConsole: true,
  };
}

function getMockAdminMessages() {
  return MOCK_ADMIN_REPORTS.map((row) => normalizeAdminMessageRow(row)).filter(Boolean);
}

function ensureMockAdminMessages() {
  if (!Array.isArray(appState.mockAdminMessages) || !appState.mockAdminMessages.length) {
    appState.mockAdminMessages = getMockAdminMessages();
  }
  return appState.mockAdminMessages;
}

function getAdminMessagesForDisplay() {
  if (isMockDataEnabled()) {
    return ensureMockAdminMessages();
  }
  return Array.isArray(appState.adminMessages) ? appState.adminMessages : [];
}

function getFriendlyAdminMessagesFallbackMessage() {
  if (isMockDataEnabled()) {
    return "Dev Mode mock reports are unavailable right now.";
  }
  return "User reports are unavailable right now. Try again after Supabase is ready.";
}

async function notifyAdminReportByEmail(record = {}) {
  const payload = {
    name: String(record.name || "").trim(),
    email: String(record.email || "").trim(),
    issueType: normalizeAdminMessageType(record.issue_type || record.issueType),
    message: String(record.message || "").trim(),
    createdAt: String(record.created_at || record.createdAt || new Date().toISOString()).trim(),
    userId: String(record.user_id || record.userId || "").trim(),
  };

  try {
    const response = await fetch("/api/admin-report-notify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Email notify returned ${response.status}`);
    }

    return true;
  } catch (error) {
    console.info("[Admin Reports] Email notification skipped or unavailable.", error);
    return false;
  }
}

async function submitAdminMessage(payload = {}) {
  let resolvedUserId = null;
  if (appState.supabase) {
    try {
      const { data, error } = await appState.supabase.auth.getUser();
      if (!error && data?.user?.id) {
        resolvedUserId = data.user.id;
      }
    } catch (authError) {
      console.warn("[Admin Reports] Could not resolve authenticated user for report submission.", authError);
    }
  }

  const record = {
    user_id: resolvedUserId,
    name: String(payload.reporterName || "").trim(),
    email: String(payload.userEmail || "").trim(),
    issue_type: normalizeAdminMessageType(payload.messageType),
    message: String(payload.message || "").trim(),
    status: "new",
    created_at: payload.createdAt || new Date().toISOString(),
  };

  if (!appState.supabase) {
    const fallbackRecord = logAdminReportFallback(record);
    void notifyAdminReportByEmail(record);
    return fallbackRecord;
  }

  const { error } = await appState.supabase
    .from(ADMIN_REPORTS_TABLE)
    .insert(record);

  if (error) {
    const fallbackRecord = logAdminReportFallback(record, error);
    void notifyAdminReportByEmail(record);
    return fallbackRecord;
  }

  void notifyAdminReportByEmail(record);
  return record;
}

async function loadAdminMessages(reason = "refresh") {
  if (!appState.supabase || !isAdminUser()) {
    return [];
  }

  const { data, error } = await appState.supabase
    .from(ADMIN_REPORTS_TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    if (isAdminMessagesTableMissingError(error)) {
      throw new Error("User reports table unavailable. Apply supabase-admin-reports-migration.sql.");
    }
    throw new Error(error.message || `Could not load user reports during ${reason}.`);
  }

  return (data || []).map(normalizeAdminMessageRow).filter(Boolean);
}

async function refreshAdminMessages(options = {}) {
  const { force = false, reason = "refresh" } = options || {};

  if (!appState.supabase || !isAdminUser()) {
    appState.adminMessages = [];
    appState.adminMessagesLoaded = true;
    appState.adminMessagesError = "";
    return [];
  }

  if (!force && appState.adminMessagesLoaded && !appState.adminMessagesRefreshPromise) {
    return appState.adminMessages;
  }

  if (!force && appState.adminMessagesRefreshPromise) {
    return appState.adminMessagesRefreshPromise;
  }

  appState.adminMessagesError = "";
  const refreshPromise = (async () => {
    try {
      const messages = await loadAdminMessages(reason);
      appState.adminMessages = messages;
      appState.adminMessagesLoaded = true;
      appState.adminMessagesError = "";
      return messages;
    } catch (error) {
      appState.adminMessages = [];
      appState.adminMessagesLoaded = true;
      console.warn("[Admin Reports] Could not load user reports.", error);
      appState.adminMessagesError = "Could not load user reports.";
      return [];
    }
  })();

  appState.adminMessagesRefreshPromise = refreshPromise;

  try {
    return await refreshPromise;
  } finally {
    appState.adminMessagesRefreshPromise = null;
  }
}

async function updateAdminMessageStatus(messageId, nextStatus = "reviewed") {
  if (isMockDataEnabled()) {
    const normalizedStatus = normalizeAdminMessageStatus(nextStatus);
    const normalizedMessageId = String(messageId || "").trim();
    ensureMockAdminMessages();
    appState.mockAdminMessages = appState.mockAdminMessages.map((row) => (
      row.id === normalizedMessageId
        ? { ...row, status: normalizedStatus }
        : row
    ));
    return appState.mockAdminMessages.find((row) => row.id === normalizedMessageId) || null;
  }

  if (!appState.supabase || !isAdminUser()) {
    throw new Error("You must be an admin to manage user reports.");
  }

  const normalizedStatus = normalizeAdminMessageStatus(nextStatus);
  const normalizedMessageId = String(messageId || "").trim();
  if (!normalizedMessageId) {
    throw new Error("Message not found.");
  }

  const { data, error } = await appState.supabase
    .from(ADMIN_REPORTS_TABLE)
    .update({ status: normalizedStatus })
    .eq("id", normalizedMessageId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message || "Could not update message status.");
  }

  const normalizedRow = normalizeAdminMessageRow(data);
  appState.adminMessages = appState.adminMessages.map((entry) => (
    entry.id === normalizedMessageId && normalizedRow ? normalizedRow : entry
  ));
  return normalizedRow;
}

function ensureAdminMessageModal() {
  let modal = document.querySelector("#admin-message-modal");
  if (modal instanceof HTMLDialogElement) {
    return modal;
  }

  modal = document.createElement("dialog");
  modal.id = "admin-message-modal";
  modal.className = "snapshot-modal admin-message-modal";
  modal.innerHTML = `
    <form method="dialog" class="snapshot-modal-card profile-modal-card admin-message-modal-card">
      <div class="snapshot-modal-copy">
        <p class="eyebrow">Support</p>
        <h3 id="admin-message-modal-title">Report / Contact Admin</h3>
        <p class="muted">Use this form to report an issue, flag content, or contact the Cannakan Grow admin team.</p>
      </div>
      <div class="admin-message-context-note" id="admin-message-context-note"></div>
      <label class="admin-message-field">
        <span>Name</span>
        <input id="admin-message-name" type="text" maxlength="120" placeholder="Your name">
      </label>
      <label class="admin-message-field">
        <span>Email</span>
        <input id="admin-message-email" type="email" maxlength="160" placeholder="you@example.com" required>
      </label>
      <label class="admin-message-field">
        <span>Issue type</span>
        <select id="admin-message-type" required>
          <option value="" selected>Select an issue type</option>
          <option value="Technical issue">Technical issue</option>
          <option value="Account issue">Account issue</option>
          <option value="Report content">Report content</option>
          <option value="Feedback">Feedback</option>
          <option value="Other">Other</option>
        </select>
      </label>
      <p id="admin-message-type-note" class="form-message is-warning"></p>
      <label class="admin-message-field">
        <span>Message</span>
        <textarea id="admin-message-text" rows="6" maxlength="2000" placeholder="Tell admin what happened or what you need help with." required></textarea>
      </label>
      <p class="admin-message-help-text">You can also email us at <a href="mailto:info@cannakan.com">info@cannakan.com</a></p>
      <p id="admin-message-modal-feedback" class="form-message" role="alert" aria-live="polite"></p>
      <div class="snapshot-modal-actions">
        <button type="button" class="button button-secondary" data-admin-message-cancel="true">Cancel</button>
        <button type="submit" class="button button-primary" data-admin-message-submit="true">Submit Report</button>
      </div>
    </form>
  `;

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.close();
    }
  });
  modal.querySelector("[data-admin-message-cancel='true']")?.addEventListener("click", () => {
    modal.close();
  });
  modal.addEventListener("close", () => {
    modal.dataset.context = "";
  });
  document.body.appendChild(modal);
  return modal;
}

function openAdminMessageModal(options = {}) {
  const modal = ensureAdminMessageModal();
  const context = {
    ...getAdminMessageContext(),
    ...options,
  };
  const form = modal.querySelector("form");
  const nameField = modal.querySelector("#admin-message-name");
  const emailField = modal.querySelector("#admin-message-email");
  const typeField = modal.querySelector("#admin-message-type");
  const typeNote = modal.querySelector("#admin-message-type-note");
  const messageField = modal.querySelector("#admin-message-text");
  const feedback = modal.querySelector("#admin-message-modal-feedback");
  const contextNote = modal.querySelector("#admin-message-context-note");
  const submitButton = modal.querySelector("[data-admin-message-submit='true']");

  if (!form || !nameField || !emailField || !typeField || !typeNote || !messageField || !feedback || !contextNote || !submitButton) {
    return false;
  }

  modal.dataset.context = JSON.stringify(context);
  nameField.value = context.userName || "";
  emailField.value = context.userEmail || "";
  typeField.value = options.messageType ? normalizeAdminMessageType(options.messageType) : "";
  messageField.value = "";
  feedback.className = "form-message";
  feedback.textContent = "";
  typeNote.className = "form-message is-warning";
  typeNote.textContent = typeField.value === "Report content"
    ? "Report content sends this message to the admin team for review of public community content."
    : "";
  contextNote.textContent = [
    `Page: ${context.pageContext || "Unknown"}`,
    context.snapshotId ? `Snapshot ID: ${context.snapshotId}` : "",
    context.sessionId ? `Session ID: ${context.sessionId}` : "",
    context.userEmail ? `Signed in as: ${context.userEmail}` : "Signed in email not available",
  ].filter(Boolean).join(" • ");

  if (typeField.dataset.bound !== "true") {
    typeField.dataset.bound = "true";
    typeField.addEventListener("change", () => {
      const nextTypeNote = modal.querySelector("#admin-message-type-note");
      if (!nextTypeNote) {
        return;
      }
      nextTypeNote.className = "form-message is-warning";
      nextTypeNote.textContent = typeField.value === "Report content"
        ? "Report content sends this message to the admin team for review of public community content."
        : "";
    });
  }

  if (modal.dataset.bound !== "true") {
    modal.dataset.bound = "true";
    modal.addEventListener("submit", async (event) => {
      event.preventDefault();
      const boundContext = JSON.parse(modal.dataset.context || "{}");
      const boundForm = modal.querySelector("form");
      const nextNameField = modal.querySelector("#admin-message-name");
      const nextEmailField = modal.querySelector("#admin-message-email");
      const nextTypeField = modal.querySelector("#admin-message-type");
      const nextMessageField = modal.querySelector("#admin-message-text");
      const nextFeedback = modal.querySelector("#admin-message-modal-feedback");
      const nextSubmitButton = modal.querySelector("[data-admin-message-submit='true']");
      if (!boundForm || !nextNameField || !nextEmailField || !nextTypeField || !nextMessageField || !nextFeedback || !nextSubmitButton) {
        return;
      }

      nextFeedback.className = "form-message";
      nextFeedback.textContent = "";
      if (!boundForm.reportValidity()) {
        return;
      }

      const trimmedEmail = String(nextEmailField.value || "").trim();
      const trimmedType = String(nextTypeField.value || "").trim();
      const trimmedMessage = String(nextMessageField.value || "").trim();
      if (!trimmedEmail) {
        nextFeedback.textContent = "Please enter your email address.";
        nextEmailField.focus();
        return;
      }
      if (!trimmedType) {
        nextFeedback.textContent = "Please choose an issue type.";
        nextTypeField.focus();
        return;
      }
      if (!trimmedMessage) {
        nextFeedback.textContent = "Please add a message before submitting.";
        nextMessageField.focus();
        return;
      }

      nextSubmitButton.disabled = true;
      try {
        const submission = await submitAdminMessage({
          reporterName: nextNameField.value,
          userEmail: trimmedEmail,
          messageType: trimmedType,
          message: trimmedMessage,
          pageContext: boundContext.pageContext || "",
          sessionId: boundContext.sessionId || "",
          snapshotId: boundContext.snapshotId || "",
          createdAt: boundContext.timestamp || new Date().toISOString(),
        });
        nextFeedback.classList.add("is-success");
        nextFeedback.textContent = "Thanks - your message has been received.";
        if (isAdminUser() && appState.supabase && !submission?.loggedToConsole) {
          void refreshAdminMessages({ force: true, reason: "submit:admin-message" }).then(() => {
            if ((window.location.hash || "#home") === "#admin") {
              safeRender();
            }
          });
        }
        window.setTimeout(() => {
          if (modal.open) {
            modal.close();
          }
        }, 900);
      } catch (error) {
        nextFeedback.className = "form-message";
        nextFeedback.textContent = error.message || "Could not send this message.";
      } finally {
        nextSubmitButton.disabled = false;
      }
    });
  }

  if (!modal.open) {
    modal.showModal();
  }
  (emailField.value ? messageField : emailField).focus();
  return true;
}

function bindContactAdminButtons(scope = document) {
  if (!scope?.querySelectorAll) {
    return;
  }

  scope.querySelectorAll("[data-contact-admin-open='true']").forEach((button) => {
    if (button.dataset.contactAdminBound === "true") {
      return;
    }

    button.dataset.contactAdminBound = "true";
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeAccountMenu();
      openAdminMessageModal({
        messageType: button.dataset.contactAdminType || "",
      });
    });
  });
}

function updateNavState() {
  const navLinks = document.querySelectorAll(".topbar-nav a");
  syncAdminNavigationVisibility();
  syncGrowNetworkNavigationVisibility();
  if (!navLinks.length) {
    return;
  }

  const rawRoute = getCurrentAppRawRoute();
  const [route] = rawRoute.split("/");
  const activeNav = route === "home" || !route
    ? "home"
    : (route === "admin"
      ? "admin"
      : (route === "gallery"
        ? "gallery"
        : (route === "network" ? "network" : "sessions")));

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
  console.log("[Cannakan App Init] start", {
    hash: window.location.hash || "#home",
    pathname: window.location.pathname || "/",
  });
  appState.loading = true;
  appState.authReady = false;
  appState.lastHydratedAuthSessionKey = "";
  appState.userRole = "user";
  appState.isAdmin = false;
  appState.mockDataEnabled = isMockDataEnabled();
  appState.gallerySnapshotsLoaded = false;
  appState.homeGalleryRankingsHydrationRequested = false;
  setDeferredInstallPrompt(window.deferredPrompt || null);
  appState.installPromptMode = getInstallPromptMode();
  applyTheme(getPreferredTheme(), { persist: false });
  initializeSupabaseClient();
  initializeSiteVisitorTracking();
  bindBackToTopVisibilityObservers();
  initializeTopbarControls();
  await rehydratePersistentBrowserState("bootstrap:start");
  updateAuthStatus();
  syncInstallPromptBanner();
  safeRender();

  if (appState.supabase) {
    try {
      const resolvedSession = await resolveSupabaseAuthSession("bootstrap:getSession");
      await handleAuthSession(resolvedSession, {
        shouldRender: false,
        reason: "bootstrap:getSession",
        force: true,
      });
      if (isSupabaseRecoveryHash(window.location.hash || "")) {
        appState.authRecoveryMode = true;
        clearSupabaseAuthFragmentHash();
        openPasswordRecoveryModal();
      }
      appState.supabase.auth.onAuthStateChange((event, session) => {
        window.setTimeout(async () => {
          const resolvedSessionForEvent = await resolveSupabaseAuthSession(`auth:${String(event || "").toLowerCase()}`, session);
          await handleAuthSession(resolvedSessionForEvent, {
            reason: `auth:${String(event || "").toLowerCase()}`,
            event,
          });
          if (String(event || "").toUpperCase() === "PASSWORD_RECOVERY") {
            appState.authRecoveryMode = true;
            clearSupabaseAuthFragmentHash();
            openPasswordRecoveryModal();
          }
        }, 0);
      });
    } catch (error) {
      console.error("Falling back to signed-out state after auth bootstrap failure", error);
      resetSessionScopedAppState();
      await rehydratePersistentBrowserState("bootstrap:auth-fallback");
      markAuthReady("bootstrap:auth-fallback");
      saveSessions([]);
    }
  } else {
    resetSessionScopedAppState();
    await rehydratePersistentBrowserState("local-no-supabase");
    ensureSampleSessions();
    saveSessions(loadLocalSessions());
    appState.sources = [];
    appState.sourcesLoaded = true;
    appState.sourcesError = "";
    appState.members = [];
    appState.membersLoaded = true;
    appState.membersError = "";
    appState.gallerySnapshots = await loadGallerySnapshots("local-no-supabase");
    appState.gallerySnapshotsLoaded = true;
    markAuthReady("local-no-supabase");
  }

  appState.initialized = true;
  appState.loading = false;
  updateAuthStatus();
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

function generateSiteAnalyticsId(prefix = "visitor") {
  const randomValue = typeof crypto?.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${randomValue}`;
}

function getOrCreateSiteVisitorId() {
  if (appState.siteVisitorId) {
    return appState.siteVisitorId;
  }

  try {
    const storedValue = localStorage.getItem(SITE_ANALYTICS_VISITOR_ID_STORAGE_KEY);
    if (storedValue) {
      appState.siteVisitorId = storedValue;
      return storedValue;
    }

    const nextValue = generateSiteAnalyticsId("visitor");
    localStorage.setItem(SITE_ANALYTICS_VISITOR_ID_STORAGE_KEY, nextValue);
    appState.siteVisitorId = nextValue;
    return nextValue;
  } catch (error) {
    const fallbackValue = appState.siteVisitorId || generateSiteAnalyticsId("visitor");
    appState.siteVisitorId = fallbackValue;
    return fallbackValue;
  }
}

function getOrCreateSiteVisitId() {
  if (appState.siteVisitId) {
    return appState.siteVisitId;
  }

  try {
    const storedValue = sessionStorage.getItem(SITE_ANALYTICS_VISIT_ID_SESSION_KEY);
    if (storedValue) {
      appState.siteVisitId = storedValue;
      return storedValue;
    }

    const nextValue = generateSiteAnalyticsId("session");
    sessionStorage.setItem(SITE_ANALYTICS_VISIT_ID_SESSION_KEY, nextValue);
    appState.siteVisitId = nextValue;
    return nextValue;
  } catch (error) {
    const fallbackValue = appState.siteVisitId || generateSiteAnalyticsId("session");
    appState.siteVisitId = fallbackValue;
    return fallbackValue;
  }
}

function isStandalonePwaLaunch() {
  return Boolean(
    window.matchMedia?.("(display-mode: standalone)")?.matches
    || window.navigator?.standalone
  );
}

function detectSiteVisitorDeviceType() {
  const userAgent = String(window.navigator?.userAgent || "").toLowerCase();
  if (/ipad|tablet|playbook|silk|kindle/.test(userAgent) || (/android/.test(userAgent) && !/mobile/.test(userAgent))) {
    return "tablet";
  }
  if (/mobi|iphone|ipod|android/.test(userAgent)) {
    return "mobile";
  }
  return "desktop";
}

function detectSiteVisitorBrowser() {
  const userAgent = String(window.navigator?.userAgent || "").toLowerCase();
  if (userAgent.includes("edg/")) {
    return "Edge";
  }
  if (userAgent.includes("opr/") || userAgent.includes("opera")) {
    return "Opera";
  }
  if (userAgent.includes("samsungbrowser")) {
    return "Samsung Internet";
  }
  if (userAgent.includes("firefox")) {
    return "Firefox";
  }
  if (userAgent.includes("chrome")) {
    return "Chrome";
  }
  if (userAgent.includes("safari")) {
    return "Safari";
  }
  return "Unknown";
}

function getSiteVisitorReferrer() {
  const referrer = String(document.referrer || "").trim();
  if (!referrer) {
    return "";
  }

  try {
    return new URL(referrer).hostname || referrer;
  } catch (error) {
    return referrer;
  }
}

function buildSiteAnalyticsPageContext({
  pageGroup = "other",
  pageKey = "other",
  pageLabel = "Other",
  pagePath = "",
} = {}) {
  const resolvedPath = String(pagePath || normalizeNavigationHash(window.location.hash || "#home")).trim();
  return {
    pageGroup,
    pageKey,
    pageLabel,
    pagePath: resolvedPath || "#home",
  };
}

function getCurrentSiteAnalyticsPageContext() {
  const rawRoute = getCurrentAppRawRoute();
  const [route, id] = rawRoute.split("/");

  if (route === "admin" && id === "gallery-moderation") {
    return buildSiteAnalyticsPageContext({
      pageGroup: "admin",
      pageKey: "admin-gallery-moderation",
      pageLabel: "Admin Community Grow Moderation",
      pagePath: "/admin/gallery-moderation",
    });
  }
  if (route === "admin") {
    return buildSiteAnalyticsPageContext({
      pageGroup: "admin",
      pageKey: "admin",
      pageLabel: "Admin",
      pagePath: "#admin",
    });
  }
  if (route === "gallery") {
    return buildSiteAnalyticsPageContext({
      pageGroup: "gallery",
      pageKey: "gallery",
      pageLabel: "Community Grow",
      pagePath: rawRoute ? `#${rawRoute}` : "#gallery",
    });
  }
  if (route === "members") {
    return buildSiteAnalyticsPageContext({
      pageGroup: "gallery",
      pageKey: "member-profile",
      pageLabel: "Member Profile",
      pagePath: rawRoute ? `#${rawRoute}` : "#members",
    });
  }
  if (route === "network") {
    return buildSiteAnalyticsPageContext({
      pageGroup: "gallery",
      pageKey: "grow-network",
      pageLabel: "Grow Network",
      pagePath: rawRoute ? `#${rawRoute}` : "#network",
    });
  }
  if (route === "profile") {
    return buildSiteAnalyticsPageContext({
      pageGroup: "profile",
      pageKey: "profile",
      pageLabel: "Profile",
      pagePath: isUsingPathRoute("profile") ? "/profile" : "#profile",
    });
  }
  if (route === "sessions" || route === "new") {
    return buildSiteAnalyticsPageContext({
      pageGroup: "sessions",
      pageKey: "sessions",
      pageLabel: "Sessions",
      pagePath: rawRoute ? `#${rawRoute}` : "#sessions",
    });
  }
  if (route === "home" || !route) {
    return buildSiteAnalyticsPageContext({
      pageGroup: "home",
      pageKey: "home",
      pageLabel: "Home",
      pagePath: "#home",
    });
  }

  return buildSiteAnalyticsPageContext({
    pageGroup: "other",
    pageKey: route || "other",
    pageLabel: capitalize((route || "other").replace(/[-_]+/g, " ")),
    pagePath: rawRoute ? `#${rawRoute}` : "#home",
  });
}

function buildSiteAnalyticsVisitorPayload(pageContext = getCurrentSiteAnalyticsPageContext()) {
  return {
    visitorId: getOrCreateSiteVisitorId(),
    visitId: getOrCreateSiteVisitId(),
    userId: String(appState.user?.id || "").trim(),
    profileName: String(appState.profile?.username || "").trim(),
    userEmail: String(appState.user?.email || "").trim().toLowerCase(),
    deviceType: detectSiteVisitorDeviceType(),
    browserName: detectSiteVisitorBrowser(),
    referrer: getSiteVisitorReferrer(),
    isPwa: isStandalonePwaLaunch(),
    pageContext,
  };
}

function getSupabaseErrorSearchText(error) {
  return String(
    error?.message
    || error?.details
    || error?.hint
    || error?.error
    || error?.error_description
    || error?.statusText
    || "",
  ).trim().toLowerCase();
}

function getSupabaseErrorStatusCode(error) {
  const statusCode = Number(
    error?.status
    || error?.statusCode
    || error?.response?.status
    || 0,
  );
  return Number.isFinite(statusCode) ? statusCode : 0;
}

function getSafeCssRules(sheet) {
  if (!sheet || typeof sheet !== "object") {
    return [];
  }

  try {
    // Some extension-injected or cross-origin stylesheets block cssRules access.
    // Skip those sheets quietly so style inspection never breaks the app.
    if ("cssRules" in sheet && sheet.cssRules) {
      return sheet.cssRules;
    }
    if ("rules" in sheet && sheet.rules) {
      return sheet.rules;
    }
    return [];
  } catch {
    return [];
  }
}

function logRuntimeIssueOnce(level = "warn", key = "", message = "", details) {
  const normalizedKey = String(key || message || "").trim().toLowerCase();
  if (!normalizedKey || loggedRuntimeIssueKeys.has(normalizedKey)) {
    return;
  }

  loggedRuntimeIssueKeys.add(normalizedKey);
  const logger = typeof console?.[level] === "function"
    ? console[level].bind(console)
    : console.warn.bind(console);

  if (typeof details === "undefined") {
    logger(message);
    return;
  }

  logger(message, details);
}

function isSupabaseTableMissingError(error, tableNames = "") {
  const normalizedTableNames = (Array.isArray(tableNames) ? tableNames : [tableNames])
    .map((tableName) => String(tableName || "").trim().toLowerCase())
    .filter(Boolean);
  if (!normalizedTableNames.length) {
    return false;
  }

  const message = getSupabaseErrorSearchText(error);
  const code = String(error?.code || "").trim().toUpperCase();
  const statusCode = getSupabaseErrorStatusCode(error);
  const referencesKnownTable = normalizedTableNames.some((tableName) => message.includes(tableName));
  const missingTableSignature = (
    message.includes("relation")
    || message.includes("schema cache")
    || message.includes("could not find table")
    || message.includes("could not find the table")
    || statusCode === 404
    || SUPABASE_MISSING_TABLE_ERROR_CODES.has(code)
  );
  if (!missingTableSignature) {
    return false;
  }

  return referencesKnownTable || statusCode === 404 || SUPABASE_MISSING_TABLE_ERROR_CODES.has(code);
}

function isSiteAnalyticsTableMissingError(error) {
  return isSupabaseTableMissingError(error, SITE_ANALYTICS_TABLE);
}

function isSupabaseColumnMissingError(error, tableName = "", columnNames = []) {
  const normalizedTableName = String(tableName || "").trim().toLowerCase();
  const normalizedColumnNames = (Array.isArray(columnNames) ? columnNames : [columnNames])
    .map((columnName) => String(columnName || "").trim().toLowerCase())
    .filter(Boolean);
  if (!normalizedTableName || !normalizedColumnNames.length) {
    return false;
  }

  const message = getSupabaseErrorSearchText(error);
  const code = String(error?.code || "").trim().toUpperCase();
  const missingColumnSignature = (
    (message.includes("column") && (
      message.includes("does not exist")
      || message.includes("could not find")
      || message.includes("schema cache")
    ))
    || SUPABASE_MISSING_COLUMN_ERROR_CODES.has(code)
  );
  if (!missingColumnSignature || !message.includes(normalizedTableName)) {
    return false;
  }

  return normalizedColumnNames.some((columnName) => message.includes(columnName));
}

function isUserNotificationPreferencesTableMissingError(error) {
  return isSupabaseTableMissingError(error, USER_NOTIFICATION_PREFERENCES_TABLE);
}

function isUserNotificationPreferencesSchemaModeError(error) {
  return (
    isSupabaseColumnMissingError(
      error,
      USER_NOTIFICATION_PREFERENCES_TABLE,
      USER_NOTIFICATION_PREFERENCES_LEGACY_COLUMNS,
    )
    || isSupabaseColumnMissingError(
      error,
      USER_NOTIFICATION_PREFERENCES_TABLE,
      USER_NOTIFICATION_PREFERENCES_MODERN_COLUMNS,
    )
  );
}

function getDefaultNotificationPreferences() {
  return { ...DEFAULT_NOTIFICATION_PREFERENCES };
}

function markUserNotificationPreferencesTableUnavailable() {
  // TODO: Apply `supabase-notification-preferences-migration.sql` in Supabase
  // so these preferences can persist instead of falling back to session defaults.
  // This is intentionally session-scoped and resets on full reload.
  appState.notificationPreferencesTableUnavailable = true;
  appState.notificationPreferencesError = "";
  appState.notificationPreferencesSchemaMode = "";
  logRuntimeIssueOnce(
    "warn",
    "notification-preferences-table-unavailable",
    "Notification preferences unavailable; using defaults for this session.",
  );
}

function getUserNotificationPreferencesSchemaModeFromRow(row) {
  if (!row || typeof row !== "object") {
    return "";
  }

  const rowKeys = Object.keys(row);
  const hasLegacyColumns = USER_NOTIFICATION_PREFERENCES_LEGACY_COLUMNS.some((columnName) => rowKeys.includes(columnName));
  const hasModernColumns = USER_NOTIFICATION_PREFERENCES_MODERN_COLUMNS.some((columnName) => rowKeys.includes(columnName));
  if (hasLegacyColumns && hasModernColumns) {
    return "hybrid";
  }
  if (hasModernColumns) {
    return "modern";
  }
  if (hasLegacyColumns) {
    return "legacy";
  }
  return "";
}

function setUserNotificationPreferencesSchemaMode(modeOrRow = "") {
  const nextMode = USER_NOTIFICATION_PREFERENCES_SCHEMA_MODES.has(modeOrRow)
    ? modeOrRow
    : getUserNotificationPreferencesSchemaModeFromRow(modeOrRow);
  appState.notificationPreferencesSchemaMode = USER_NOTIFICATION_PREFERENCES_SCHEMA_MODES.has(nextMode)
    ? nextMode
    : "";
}

async function safelyEnsureUserNotificationPreferences(user) {
  try {
    return await ensureUserNotificationPreferences(user);
  } catch (error) {
    markUserNotificationPreferencesTableUnavailable();
    return getDefaultNotificationPreferences();
  }
}

function getUserNotificationPreferencesBooleanValue(row, keys = [], fallbackValue = true) {
  const normalizedKeys = Array.isArray(keys) ? keys : [keys];
  for (const key of normalizedKeys) {
    if (Object.prototype.hasOwnProperty.call(row || {}, key)) {
      return row[key] !== false;
    }
  }
  return fallbackValue;
}

function buildUserNotificationPreferencesSeedPayload(userId = "", existingPreferences = DEFAULT_NOTIFICATION_PREFERENCES) {
  return {
    user_id: userId,
    created_at: existingPreferences.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function buildUserNotificationPreferencesUpsertPayload(
  userId = "",
  preferencesInput = {},
  existingPreferences = DEFAULT_NOTIFICATION_PREFERENCES,
  schemaMode = "",
) {
  const effectiveMode = USER_NOTIFICATION_PREFERENCES_SCHEMA_MODES.has(schemaMode)
    ? schemaMode
    : "hybrid";
  const notifySnapshot =
    preferencesInput?.notifySnapshot !== undefined
      ? Boolean(preferencesInput.notifySnapshot)
      : existingPreferences.notifySnapshot !== false;
  const notifyCompletion =
    preferencesInput?.notifyCompletion !== undefined
      ? Boolean(preferencesInput.notifyCompletion)
      : existingPreferences.notifyCompletion !== false;
  const notifyFollow =
    preferencesInput?.notifyFollow !== undefined
      ? Boolean(preferencesInput.notifyFollow)
      : existingPreferences.notifyFollow !== false;
  const notifyLike =
    preferencesInput?.notifyLike !== undefined
      ? Boolean(preferencesInput.notifyLike)
      : existingPreferences.notifyLike !== false;
  const payload = {
    user_id: userId,
    created_at: existingPreferences.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (effectiveMode === "legacy" || effectiveMode === "hybrid") {
    payload.notify_snapshot = notifySnapshot;
    payload.notify_completion = notifyCompletion;
    payload.notify_follow = notifyFollow;
    payload.notify_like = notifyLike;
  }

  if (effectiveMode === "modern" || effectiveMode === "hybrid") {
    payload.email_notifications = notifySnapshot;
    payload.session_reminders = notifyCompletion;
    payload.community_updates = notifyFollow;
    payload.low_filter_alerts = notifyLike;
  }

  return payload;
}

function getUserNotificationPreferencesWriteModes(preferredMode = "") {
  if (preferredMode === "legacy") {
    return ["legacy", "modern", "hybrid"];
  }
  if (preferredMode === "modern") {
    return ["modern", "legacy", "hybrid"];
  }
  return ["hybrid", "legacy", "modern"];
}

function normalizeSiteAnalyticsTextValue(value = "", fallback = "") {
  const normalizedValue = String(value || "").trim();
  return normalizedValue || fallback;
}

function buildSiteAnalyticsInsertPayload(eventType = "page_view", pageContext = getCurrentSiteAnalyticsPageContext(), metadata = {}) {
  void metadata;
  const page = normalizeSiteAnalyticsTextValue(
    pageContext?.pagePath,
    normalizeSiteAnalyticsTextValue(pageContext?.pageKey, "/"),
  );
  return {
    event_type: normalizeSiteAnalyticsEventType(eventType),
    page,
  };
}

function isSiteAnalyticsInsertRequestError(error) {
  const status = Number(error?.status || error?.statusCode || 0);
  const code = String(error?.code || "").trim().toUpperCase();
  const message = getSupabaseErrorSearchText(error);
  return (
    status === 400
    || status === 404
    || code === "400"
    || code === "404"
    || message.includes("bad request")
  );
}

function disableSiteAnalyticsForSession(userMessage = "") {
  appState.siteVisitorAnalyticsTrackingBlocked = true;
  if (userMessage) {
    appState.siteVisitorAnalyticsError = userMessage;
  }
}

function applySiteAnalyticsDisabledState() {
  const disabledMessage = "Analytics tracking is currently disabled";
  appState.siteVisitorAnalyticsTrackingBlocked = true;
  appState.siteVisitorAnalyticsLoaded = true;
  appState.siteVisitorAnalyticsLoadedFilter = appState.siteVisitorAnalyticsFilter || SITE_ANALYTICS_DEFAULT_FILTER;
  appState.siteVisitorAnalyticsRows = [];
  appState.siteVisitorAnalyticsError = disabledMessage;
  appState.siteVisitorPresenceAvailable = false;
  appState.siteVisitorPresenceSubscribed = false;
  appState.siteVisitorPresenceError = disabledMessage;
  appState.siteVisitorPresenceState = {};
  stopSiteVisitorPresenceHeartbeat();
}

function markSiteAnalyticsTableUnavailable() {
  appState.siteVisitorAnalyticsTableUnavailable = true;
  appState.siteVisitorAnalyticsError = "Historical analytics table unavailable. Apply the site analytics migration.";
  disableSiteAnalyticsForSession(appState.siteVisitorAnalyticsError);
}

function isSiteAnalyticsPolicyError(error) {
  const message = String(error?.message || error?.details || "").toLowerCase();
  return message.includes("row-level security") || message.includes("permission denied");
}

function markSiteAnalyticsTrackingBlocked() {
  appState.siteVisitorAnalyticsError = "Historical analytics tracking is blocked by the current Supabase policies.";
  disableSiteAnalyticsForSession(appState.siteVisitorAnalyticsError);
}

function normalizeSiteAnalyticsEventType(value = "") {
  const normalizedValue = String(value || "").trim().toLowerCase();
  if (["visit", "page_view", "pwa_launch"].includes(normalizedValue)) {
    return normalizedValue;
  }
  return "page_view";
}

function normalizeSiteAnalyticsRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: String(row.id || "").trim(),
    occurredAt: row.occurred_at || row.created_at || "",
    visitorId: String(row.visitor_id || "").trim(),
    visitId: String(row.visit_id || row.session_id || "").trim(),
    userId: String(row.user_id || "").trim(),
    profileName: String(row.profile_name || "").trim(),
    userEmail: String(row.user_email || "").trim().toLowerCase(),
    eventType: normalizeSiteAnalyticsEventType(row.event_type),
    pageGroup: String(row.page_group || row.page || "").trim().toLowerCase(),
    pageKey: String(row.page_key || row.page || "").trim().toLowerCase(),
    pageLabel: String(row.page_label || row.page || "").trim(),
    pagePath: String(row.page_path || row.page || "").trim(),
    deviceType: String(row.device_type || "").trim().toLowerCase(),
    browserName: String(row.browser_name || "").trim(),
    referrer: String(row.referrer || "").trim(),
    isPwa: Boolean(row.is_pwa),
    metadata: row.metadata && typeof row.metadata === "object" ? row.metadata : {},
  };
}

function getSiteVisitorAnalyticsFilterStart(filterKey = SITE_ANALYTICS_DEFAULT_FILTER) {
  const now = new Date();
  if (filterKey === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  }
  if (filterKey === "last7") {
    return new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)).toISOString();
  }
  if (filterKey === "last30") {
    return new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)).toISOString();
  }
  return "";
}

async function recordSiteAnalyticsEvent(eventType = "page_view", pageContext = getCurrentSiteAnalyticsPageContext(), metadata = {}) {
  if (!SITE_ANALYTICS_ENABLED) {
    applySiteAnalyticsDisabledState();
    return false;
  }
  if (
    !appState.supabase
    || appState.siteVisitorAnalyticsTableUnavailable
    || appState.siteVisitorAnalyticsTrackingBlocked
    || appState.siteAnalyticsEventInFlight
  ) {
    return false;
  }

  appState.siteAnalyticsEventInFlight = true;
  try {
    const insertPayload = buildSiteAnalyticsInsertPayload(eventType, pageContext, metadata);
    let error = null;
    try {
      const response = await appState.supabase
        .from(SITE_ANALYTICS_TABLE)
        .insert(insertPayload);
      error = response?.error || null;
    } catch (insertError) {
      error = insertError;
    }

    if (!error) {
      return true;
    }

    if (isSiteAnalyticsTableMissingError(error)) {
      markSiteAnalyticsTableUnavailable();
      return false;
    }
    if (isSiteAnalyticsPolicyError(error)) {
      markSiteAnalyticsTrackingBlocked();
      return false;
    }
    if (isSiteAnalyticsInsertRequestError(error)) {
      disableSiteAnalyticsForSession("Historical analytics tracking is unavailable in this browser session.");
      return false;
    }

    disableSiteAnalyticsForSession("Historical analytics tracking is unavailable in this browser session.");
    return false;
  } finally {
    appState.siteAnalyticsEventInFlight = false;
  }
}

function trackSiteAnalyticsVisitOnce() {
  if (!SITE_ANALYTICS_ENABLED) {
    applySiteAnalyticsDisabledState();
    return;
  }
  if (!appState.supabase) {
    return;
  }

  let shouldLogVisit = true;
  try {
    shouldLogVisit = sessionStorage.getItem(SITE_ANALYTICS_VISIT_LOGGED_SESSION_KEY) !== "true";
  } catch (error) {
    shouldLogVisit = true;
  }

  if (shouldLogVisit) {
    void recordSiteAnalyticsEvent("visit", getCurrentSiteAnalyticsPageContext(), {
      launchPath: getCurrentSiteAnalyticsPageContext().pagePath,
    });
    try {
      sessionStorage.setItem(SITE_ANALYTICS_VISIT_LOGGED_SESSION_KEY, "true");
    } catch (error) {
      // Ignore storage issues and keep tracking best-effort.
    }
  }

  if (!isStandalonePwaLaunch()) {
    return;
  }

  let shouldLogPwa = true;
  try {
    shouldLogPwa = sessionStorage.getItem(SITE_ANALYTICS_PWA_LOGGED_SESSION_KEY) !== "true";
  } catch (error) {
    shouldLogPwa = true;
  }

  if (shouldLogPwa) {
    void recordSiteAnalyticsEvent("pwa_launch", getCurrentSiteAnalyticsPageContext(), {
      launchPath: getCurrentSiteAnalyticsPageContext().pagePath,
    });
    try {
      sessionStorage.setItem(SITE_ANALYTICS_PWA_LOGGED_SESSION_KEY, "true");
    } catch (error) {
      // Ignore storage issues and keep tracking best-effort.
    }
  }
}

function trackSiteAnalyticsPageView(pageContext) {
  if (!SITE_ANALYTICS_ENABLED) {
    applySiteAnalyticsDisabledState();
    return;
  }
  if (!appState.supabase || !pageContext) {
    return;
  }

  const signature = `${pageContext.pageKey}|${pageContext.pagePath}`;
  if (appState.siteAnalyticsLastTrackedSignature === signature) {
    return;
  }

  appState.siteAnalyticsLastTrackedSignature = signature;
  void recordSiteAnalyticsEvent("page_view", pageContext, {
    routeHash: appState.currentRouteHash || window.location.hash || "#home",
  });
}

function getSiteVisitorPresencePayload(pageContext = getCurrentSiteAnalyticsPageContext()) {
  const payload = buildSiteAnalyticsVisitorPayload(pageContext);
  return {
    visitorId: payload.visitorId,
    visitId: payload.visitId,
    userId: payload.userId,
    pageKey: payload.pageContext.pageKey,
    pageLabel: payload.pageContext.pageLabel,
    pagePath: payload.pageContext.pagePath,
    deviceType: payload.deviceType,
    browserName: payload.browserName,
    lastSeen: new Date().toISOString(),
  };
}

function stopSiteVisitorPresenceHeartbeat() {
  if (appState.siteVisitorPresenceHeartbeatId) {
    window.clearInterval(appState.siteVisitorPresenceHeartbeatId);
    appState.siteVisitorPresenceHeartbeatId = 0;
  }
}

function startSiteVisitorPresenceHeartbeat() {
  stopSiteVisitorPresenceHeartbeat();
  if (!appState.supabase || !appState.siteVisitorPresenceSubscribed) {
    return;
  }

  appState.siteVisitorPresenceHeartbeatId = window.setInterval(() => {
    if (document.visibilityState === "hidden") {
      return;
    }
    void refreshSiteVisitorPresence("heartbeat");
  }, SITE_ANALYTICS_HEARTBEAT_MS);
}

function syncSiteVisitorPresenceState(channel) {
  if (!channel || typeof channel.presenceState !== "function") {
    appState.siteVisitorPresenceState = {};
    syncSiteVisitorLiveVisitorsCard();
    return;
  }

  appState.siteVisitorPresenceState = channel.presenceState() || {};
  syncSiteVisitorLiveVisitorsCard();
}

function initializeSiteVisitorPresence() {
  if (!SITE_ANALYTICS_ENABLED) {
    applySiteAnalyticsDisabledState();
    return;
  }
  if (!appState.supabase || appState.siteVisitorPresenceChannel) {
    return;
  }

  const presenceKey = getOrCreateSiteVisitId();
  const channel = appState.supabase.channel(SITE_ANALYTICS_PRESENCE_CHANNEL, {
    config: {
      presence: {
        key: presenceKey,
      },
    },
  });

  channel
    .on("presence", { event: "sync" }, () => {
      syncSiteVisitorPresenceState(channel);
    })
    .on("presence", { event: "join" }, () => {
      syncSiteVisitorPresenceState(channel);
    })
    .on("presence", { event: "leave" }, () => {
      syncSiteVisitorPresenceState(channel);
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        appState.siteVisitorPresenceChannel = channel;
        appState.siteVisitorPresenceAvailable = true;
        appState.siteVisitorPresenceError = "";
        appState.siteVisitorPresenceSubscribed = true;
        startSiteVisitorPresenceHeartbeat();
        await refreshSiteVisitorPresence("subscribe");
        return;
      }

      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        appState.siteVisitorPresenceAvailable = false;
        appState.siteVisitorPresenceSubscribed = false;
        appState.siteVisitorPresenceError = "Live visitor tracking unavailable";
        stopSiteVisitorPresenceHeartbeat();
        syncSiteVisitorLiveVisitorsCard();
      }
    });

  appState.siteVisitorPresenceChannel = channel;
}

async function refreshSiteVisitorPresence(reason = "update", pageContext = getCurrentSiteAnalyticsPageContext()) {
  if (!SITE_ANALYTICS_ENABLED) {
    applySiteAnalyticsDisabledState();
    return false;
  }
  if (!appState.supabase) {
    return false;
  }

  if (!appState.siteVisitorPresenceChannel) {
    initializeSiteVisitorPresence();
  }

  if (!appState.siteVisitorPresenceChannel || !appState.siteVisitorPresenceSubscribed) {
    return false;
  }

  try {
    await appState.siteVisitorPresenceChannel.track({
      ...getSiteVisitorPresencePayload(pageContext),
      reason,
    });
    appState.siteVisitorPresenceAvailable = true;
    appState.siteVisitorPresenceError = "";
    return true;
  } catch (error) {
    console.warn("Live visitor presence track failed", error);
    appState.siteVisitorPresenceAvailable = false;
    appState.siteVisitorPresenceError = "Live visitor tracking unavailable";
    syncSiteVisitorLiveVisitorsCard();
    return false;
  }
}

function handleSiteVisitorVisibilityChange() {
  if (document.visibilityState === "visible") {
    if (appState.siteVisitorPresenceSubscribed) {
      startSiteVisitorPresenceHeartbeat();
      void refreshSiteVisitorPresence("visible");
    }
    return;
  }

  stopSiteVisitorPresenceHeartbeat();
}

function initializeSiteVisitorTracking() {
  if (!SITE_ANALYTICS_ENABLED) {
    applySiteAnalyticsDisabledState();
    return;
  }
  if (!appState.supabase || appState.siteVisitorTrackingInitialized) {
    return;
  }

  appState.siteVisitorTrackingInitialized = true;
  getOrCreateSiteVisitorId();
  getOrCreateSiteVisitId();
  trackSiteAnalyticsVisitOnce();
  initializeSiteVisitorPresence();
  document.addEventListener("visibilitychange", handleSiteVisitorVisibilityChange);
}

async function loadSiteVisitorAnalyticsRows(filterKey = SITE_ANALYTICS_DEFAULT_FILTER, reason = "refresh") {
  if (!SITE_ANALYTICS_ENABLED) {
    applySiteAnalyticsDisabledState();
    return [];
  }
  if (!appState.supabase || !isAdminUser() || appState.siteVisitorAnalyticsTableUnavailable) {
    return [];
  }

  const rows = [];
  const pageSize = 1000;
  const startDate = getSiteVisitorAnalyticsFilterStart(filterKey);
  let from = 0;

  while (true) {
    let query = appState.supabase
      .from(SITE_ANALYTICS_TABLE)
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, from + pageSize - 1);

    if (startDate) {
      query = query.gte("created_at", startDate);
    }

    const { data, error } = await query;
    if (error) {
      if (isSiteAnalyticsTableMissingError(error)) {
        markSiteAnalyticsTableUnavailable();
        throw new Error("Historical analytics table unavailable. Apply the site analytics migration.");
      }
      throw new Error(error.message || `Could not load site visitor analytics during ${reason}.`);
    }

    const pageRows = (data || []).map(normalizeSiteAnalyticsRow).filter(Boolean);
    rows.push(...pageRows);
    if (pageRows.length < pageSize) {
      break;
    }

    from += pageSize;
  }

  return rows;
}

async function refreshSiteVisitorAnalytics(options = {}) {
  if (!SITE_ANALYTICS_ENABLED) {
    applySiteAnalyticsDisabledState();
    return [];
  }
  const {
    force = false,
    reason = "refresh",
  } = options || {};

  const activeFilter = appState.siteVisitorAnalyticsFilter || SITE_ANALYTICS_DEFAULT_FILTER;
  if (!appState.supabase || !isAdminUser()) {
    appState.siteVisitorAnalyticsRows = [];
    appState.siteVisitorAnalyticsLoaded = true;
    appState.siteVisitorAnalyticsLoadedFilter = activeFilter;
    appState.siteVisitorAnalyticsError = "";
    return [];
  }

  if (!force && appState.siteVisitorAnalyticsLoaded && appState.siteVisitorAnalyticsLoadedFilter === activeFilter && !appState.siteVisitorAnalyticsRefreshPromise) {
    return appState.siteVisitorAnalyticsRows;
  }

  if (!force && appState.siteVisitorAnalyticsRefreshPromise) {
    return appState.siteVisitorAnalyticsRefreshPromise;
  }

  const refreshPromise = (async () => {
    try {
      const rows = await loadSiteVisitorAnalyticsRows(activeFilter, reason);
      appState.siteVisitorAnalyticsRows = rows;
      appState.siteVisitorAnalyticsLoaded = true;
      appState.siteVisitorAnalyticsLoadedFilter = activeFilter;
      appState.siteVisitorAnalyticsError = "";
      return rows;
    } catch (error) {
      appState.siteVisitorAnalyticsRows = [];
      appState.siteVisitorAnalyticsLoaded = true;
      appState.siteVisitorAnalyticsLoadedFilter = activeFilter;
      appState.siteVisitorAnalyticsError = error.message || "Could not load site visitor analytics.";
      return [];
    }
  })();

  appState.siteVisitorAnalyticsRefreshPromise = refreshPromise;

  try {
    return await refreshPromise;
  } finally {
    appState.siteVisitorAnalyticsRefreshPromise = null;
  }
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
  const {
    shouldRender = true,
    reason = "auth-change",
    force = false,
  } = options || {};

  const nextPromise = (appState.authHydrationPromise || Promise.resolve())
    .catch(() => {})
    .then(async () => {
      const sessionKey = getAuthSessionHydrationKey(session);
      if (!force && appState.authReady && appState.lastHydratedAuthSessionKey === sessionKey) {
        return;
      }

      if (!session && !isSupabaseRecoveryHash(window.location.hash || "")) {
        appState.authRecoveryMode = false;
      }

      resetSessionScopedAppState();
      applyResolvedAuthState(session, reason);
      markAuthReady(reason);
      updateAuthStatus();
      await rehydratePersistentBrowserState(reason);
      console.log("[Cannakan App Init] auth user evaluated", {
        reason,
        currentEmail: appState.user?.email || "",
        normalizedEmail: appState.currentUserEmail,
        isAdminResult: appState.isAdmin,
      });

      if (appState.user) {
        appState.profile = await safelyLoadAppData(
          () => ensureUserProfile(appState.user),
          null,
          "Failed to initialize user profile during auth hydration.",
          "profileError",
        );
        appState.notificationPreferences = await safelyLoadAppData(
          () => safelyEnsureUserNotificationPreferences(appState.user),
          getDefaultNotificationPreferences(),
          "Failed to initialize notification preferences during auth hydration.",
          "notificationPreferencesError",
        );
        applyResolvedAuthState(session, `${reason}:profile`, appState.profile);
        updateAuthStatus();
        if (appState.profile?.accountStatus === "disabled" && !appState.isAdmin) {
          appState.authNotice = "This Cannakan Grow account has been disabled. Contact an administrator for help.";
          await appState.supabase?.auth.signOut();
          return;
        }
        if (appState.isAdmin) {
          await safelyLoadAppData(
            () => refreshRegisteredMemberCount({ force: true }),
            null,
            "Failed to refresh registered member count during auth hydration.",
            "memberCountError",
          );
          appState.members = await safelyLoadAppData(
            () => loadAdminMembers("auth:signed-in"),
            [],
            "Failed to load admin members during auth hydration.",
            "membersError",
          );
          appState.membersLoaded = true;
        }
        const sessions = await safelyLoadAppData(
          () => loadUserSessions(),
          [],
          "Failed to load user sessions during auth hydration.",
        );
        saveSessions(sessions);
        appState.sources = await safelyLoadAppData(
          () => loadSources("auth:signed-in"),
          [],
          "Failed to load sources during auth hydration.",
          "sourcesError",
        );
        appState.sourcesLoaded = true;
        appState.gallerySnapshots = await safelyLoadAppData(
          () => loadGallerySnapshots(),
          [],
          "Failed to load Community Grow snapshots during auth hydration.",
        );
        appState.gallerySnapshotsLoaded = true;
      } else if (isSupabaseConfigured()) {
        saveSessions([]);
        appState.sources = await safelyLoadAppData(
          () => loadSources("auth:signed-out"),
          [],
          "Failed to load public sources during auth hydration.",
          "sourcesError",
        );
        appState.sourcesLoaded = true;
        appState.gallerySnapshots = await safelyLoadAppData(
          () => loadGallerySnapshots(),
          [],
          "Failed to load Community Grow snapshots during auth hydration.",
        );
        appState.gallerySnapshotsLoaded = true;
      }

      appState.lastHydratedAuthSessionKey = sessionKey;
      updateAuthStatus();
      void refreshSiteVisitorPresence(`auth:${reason}`);
    });

  appState.authHydrationPromise = nextPromise;

  try {
    await nextPromise;
  } finally {
    if (appState.authHydrationPromise === nextPromise) {
      appState.authHydrationPromise = null;
    }
  }

  if (shouldRender !== false) {
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

async function ensureUserNotificationPreferences(user) {
  if (!appState.supabase || !user?.id || appState.notificationPreferencesTableUnavailable) {
    return getDefaultNotificationPreferences();
  }

  appState.notificationPreferencesError = "";

  const { data: existingPreferences, error: selectError } = await appState.supabase
    .from(USER_NOTIFICATION_PREFERENCES_TABLE)
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (selectError) {
    if (isUserNotificationPreferencesTableMissingError(selectError)) {
      markUserNotificationPreferencesTableUnavailable();
      return getDefaultNotificationPreferences();
    }
    markUserNotificationPreferencesTableUnavailable();
    return getDefaultNotificationPreferences();
  }

  if (existingPreferences) {
    setUserNotificationPreferencesSchemaMode(existingPreferences);
    return normalizeUserNotificationPreferencesRow(existingPreferences);
  }

  const preferencePayload = buildUserNotificationPreferencesSeedPayload(user.id);

  const { data: savedPreferences, error: upsertError } = await appState.supabase
    .from(USER_NOTIFICATION_PREFERENCES_TABLE)
    .upsert(preferencePayload, { onConflict: "user_id" })
    .select("*")
    .single();

  if (upsertError) {
    if (isUserNotificationPreferencesTableMissingError(upsertError)) {
      markUserNotificationPreferencesTableUnavailable();
      return getDefaultNotificationPreferences();
    }
    markUserNotificationPreferencesTableUnavailable();
    return getDefaultNotificationPreferences();
  }

  setUserNotificationPreferencesSchemaMode(savedPreferences);
  return normalizeUserNotificationPreferencesRow(savedPreferences);
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
  if (!appState.supabase || !uniqueSnapshotIds.length || appState.gallerySnapshotLikesTableUnavailable) {
    return [];
  }

  const { data, error } = await appState.supabase
    .from(GROW_GALLERY_LIKES_TABLE)
    .select("snapshot_id, user_id")
    .in("snapshot_id", uniqueSnapshotIds);

  if (error) {
    if (isGallerySnapshotLikesTableMissingError(error)) {
      markGallerySnapshotLikesTableUnavailable();
      return [];
    }
    logRuntimeIssueOnce("error", "gallery-snapshot-likes-load-failed", "Failed to load gallery likes", { reason, error });
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

function resetMemberCountState() {
  appState.memberCount = null;
  appState.memberCountLoaded = false;
  appState.memberCountError = "";
  appState.memberCountRefreshPromise = null;
}

function getRegisteredMemberCount() {
  return Number.isFinite(appState.memberCount) ? appState.memberCount : null;
}

async function refreshRegisteredMemberCount(options = {}) {
  const { force = false } = options;

  if (!appState.supabase || !isAdminUser()) {
    resetMemberCountState();
    return null;
  }

  if (!force && appState.memberCountLoaded) {
    return getRegisteredMemberCount();
  }

  if (!force && appState.memberCountRefreshPromise) {
    return appState.memberCountRefreshPromise;
  }

  appState.memberCountError = "";

  const refreshPromise = (async () => {
    const { count, error } = await appState.supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .or("deletion_status.is.null,deletion_status.neq.deleted");

    if (error) {
      console.error("Failed to load member count", error);
      appState.memberCount = null;
      appState.memberCountLoaded = true;
      appState.memberCountError = error.message || "Could not load member count.";
      return null;
    }

    const visibleMemberCount = Number.isFinite(count) ? count : 0;
    appState.memberCount = visibleMemberCount;
    appState.memberCountLoaded = true;
    appState.memberCountError = "";
    return appState.memberCount;
  })();

  appState.memberCountRefreshPromise = refreshPromise;

  try {
    return await refreshPromise;
  } finally {
    appState.memberCountRefreshPromise = null;
  }
}

function getMemberRole(email = "") {
  return isAdminUser(email) ? "admin" : "member";
}

function formatMemberDateLabel(value) {
  const parsedDate = parseCompletedAtValue(value);
  return parsedDate ? formatTimingDateTime(parsedDate) : "Not available";
}

function formatPublicMemberJoinedDateLabel(value) {
  const parsedDate = parseCompletedAtValue(value);
  if (!parsedDate) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
}

function getStartOfCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function getActiveMemberCutoffDate() {
  return new Date(Date.now() - (ACTIVE_MEMBER_LOOKBACK_DAYS * 24 * 60 * 60 * 1000));
}

function mapAdminMembers(profileRows = [], sessionRows = [], snapshotRows = []) {
  const sessionCountByUserId = new Map();
  const galleryCountByUserId = new Map();

  (sessionRows || []).forEach((row) => {
    const userId = String(row?.user_id || "").trim();
    if (!userId) {
      return;
    }
    sessionCountByUserId.set(userId, (sessionCountByUserId.get(userId) || 0) + 1);
  });

  (snapshotRows || []).forEach((row) => {
    const userId = String(row?.user_id || "").trim();
    if (!userId) {
      return;
    }
    galleryCountByUserId.set(userId, (galleryCountByUserId.get(userId) || 0) + 1);
  });

  return (profileRows || [])
    .map(normalizeProfileRow)
    .filter((profile) => profile && profile.deletionStatus !== "deleted")
    .map((profile) => ({
      id: profile.id,
      profileName: profile.username || "Unnamed member",
      email: profile.email || "",
      role: getMemberRole(profile.email),
      joinedAt: profile.createdAt || "",
      lastActiveAt: profile.lastActiveAt || "",
      sessionCount: sessionCountByUserId.get(profile.id) || 0,
      gallerySubmissionCount: galleryCountByUserId.get(profile.id) || 0,
      accountStatus: profile.accountStatus || "active",
      avatarUrl: profile.avatarUrl || "",
      avatarPath: profile.avatarPath || "",
      deletionStatus: profile.deletionStatus || "",
      deletionRequestedAt: profile.deletionRequestedAt || "",
      deletionScheduledFor: profile.deletionScheduledFor || "",
      createdAt: profile.createdAt || "",
      updatedAt: profile.updatedAt || "",
    }))
    .sort((left, right) => new Date(right.joinedAt || 0).getTime() - new Date(left.joinedAt || 0).getTime());
}

async function loadAdminMembers(reason = "unspecified") {
  if (!appState.supabase || !isAdminUser()) {
    return [];
  }

  const [profilesResponse, sessionsResponse, snapshotsResponse] = await Promise.all([
    appState.supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false }),
    appState.supabase
      .from("grow_sessions")
      .select("id,user_id,created_at"),
    appState.supabase
      .from("grow_gallery_snapshots")
      .select("id,user_id,created_at,published_at,status"),
  ]);

  if (profilesResponse.error) {
    console.error("Failed to load admin members", { reason, error: profilesResponse.error });
    appState.membersError = profilesResponse.error.message || "Could not load members.";
    return [];
  }

  if (sessionsResponse.error) {
    console.error("Failed to load admin member sessions", { reason, error: sessionsResponse.error });
    appState.membersError = sessionsResponse.error.message || "Could not load member session counts.";
    return [];
  }

  if (snapshotsResponse.error) {
    console.error("Failed to load admin member gallery submissions", { reason, error: snapshotsResponse.error });
    appState.membersError = snapshotsResponse.error.message || "Could not load member Community Grow submission counts.";
    return [];
  }

  appState.membersError = "";
  return mapAdminMembers(profilesResponse.data || [], sessionsResponse.data || [], snapshotsResponse.data || []);
}

async function refreshAdminMembers(options = {}) {
  const { force = false, reason = "refresh" } = options;

  if (!appState.supabase || !isAdminUser()) {
    appState.members = [];
    appState.membersLoaded = true;
    appState.membersError = "";
    return [];
  }

  if (!force && appState.membersLoaded && !appState.membersRefreshPromise) {
    return appState.members;
  }

  if (!force && appState.membersRefreshPromise) {
    return appState.membersRefreshPromise;
  }

  const refreshPromise = (async () => {
    const members = await loadAdminMembers(reason);
    appState.members = members;
    appState.membersLoaded = true;
    return members;
  })();

  appState.membersRefreshPromise = refreshPromise;

  try {
    return await refreshPromise;
  } finally {
    appState.membersRefreshPromise = null;
  }
}

function getAdminMemberSummary(members = appState.members) {
  const startOfMonth = getStartOfCurrentMonth();
  const activeCutoff = getActiveMemberCutoffDate();

  return {
    totalMembers: members.length,
    newMembersThisMonth: members.filter((member) => {
      const joinedDate = parseCompletedAtValue(member.joinedAt);
      return joinedDate && joinedDate >= startOfMonth;
    }).length,
    activeMembers: members.filter((member) => {
      const lastActiveDate = parseCompletedAtValue(member.lastActiveAt);
      return member.accountStatus === "active" && lastActiveDate && lastActiveDate >= activeCutoff;
    }).length,
    adminUsers: members.filter((member) => member.role === "admin").length,
  };
}

function getFilteredAdminMembers() {
  const query = String(appState.memberAdminFilters.query || "").trim().toLowerCase();
  const roleFilter = String(appState.memberAdminFilters.role || "all").trim().toLowerCase();
  const statusFilter = String(appState.memberAdminFilters.status || "all").trim().toLowerCase();

  return (appState.members || []).filter((member) => {
    if (roleFilter !== "all" && member.role !== roleFilter) {
      return false;
    }

    if (statusFilter !== "all" && member.accountStatus !== statusFilter) {
      return false;
    }

    if (!query) {
      return true;
    }

    return [
      member.profileName,
      member.email,
      member.role,
    ].some((value) => String(value || "").toLowerCase().includes(query));
  });
}

function getAdminMemberById(memberId) {
  return (appState.members || []).find((member) => member.id === memberId) || null;
}

function isCurrentAdminMember(member) {
  return Boolean(member?.id && member.id === appState.user?.id);
}

async function updateMemberAccountStatus(member, nextStatus = "disabled") {
  if (!appState.supabase || !isAdminUser()) {
    throw new Error("You must be an admin to manage members.");
  }

  if (!member?.id) {
    throw new Error("Member not found.");
  }

  if (isCurrentAdminMember(member)) {
    throw new Error("You cannot change your own account status from this admin tool.");
  }

  const { data, error } = await appState.supabase
    .from("profiles")
    .update({ account_status: nextStatus === "disabled" ? "disabled" : "active" })
    .eq("id", member.id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message || "Could not update account status.");
  }

  const updatedProfile = normalizeProfileRow(data);
  appState.members = appState.members.map((entry) => (
    entry.id === member.id
      ? {
        ...entry,
        profileName: updatedProfile.username || entry.profileName,
        email: updatedProfile.email || entry.email,
        accountStatus: updatedProfile.accountStatus,
        avatarUrl: updatedProfile.avatarUrl,
        avatarPath: updatedProfile.avatarPath,
        lastActiveAt: updatedProfile.lastActiveAt || entry.lastActiveAt,
        updatedAt: updatedProfile.updatedAt || entry.updatedAt,
      }
      : entry
  ));
  return updatedProfile;
}

async function deleteMemberAccount(member) {
  if (!appState.supabase || !isAdminUser()) {
    throw new Error("You must be an admin to manage members.");
  }

  if (!member?.id) {
    throw new Error("Member not found.");
  }

  if (isCurrentAdminMember(member)) {
    throw new Error("You cannot delete your own admin account.");
  }

  const [sessionsResponse, snapshotsResponse] = await Promise.all([
    appState.supabase
      .from("grow_sessions")
      .select("id,session_images")
      .eq("user_id", member.id),
    appState.supabase
      .from("grow_gallery_snapshots")
      .select("id,snapshot_image_path")
      .eq("user_id", member.id),
  ]);

  if (sessionsResponse.error) {
    throw new Error(sessionsResponse.error.message || "Could not load member sessions for deletion.");
  }
  if (snapshotsResponse.error) {
    throw new Error(snapshotsResponse.error.message || "Could not load member Community Grow submissions for deletion.");
  }

  const sessionImagePaths = (sessionsResponse.data || [])
    .flatMap((row) => normalizePersistedSessionImages(row.session_images))
    .map((image) => image.path)
    .filter(Boolean);
  const snapshotImagePaths = (snapshotsResponse.data || [])
    .map((row) => String(row.snapshot_image_path || "").trim())
    .filter(Boolean);

  if (sessionImagePaths.length) {
    await appState.supabase.storage.from(SESSION_IMAGE_BUCKET).remove(sessionImagePaths);
  }

  if (snapshotImagePaths.length) {
    await appState.supabase.storage.from(GROW_GALLERY_BUCKET).remove(snapshotImagePaths);
  }

  const deleteLikesResponse = await appState.supabase
    .from(GROW_GALLERY_LIKES_TABLE)
    .delete()
    .eq("user_id", member.id);
  if (deleteLikesResponse.error) {
    throw new Error(deleteLikesResponse.error.message || "Could not remove member Community Grow likes.");
  }

  const deleteSnapshotsResponse = await appState.supabase
    .from("grow_gallery_snapshots")
    .delete()
    .eq("user_id", member.id);
  if (deleteSnapshotsResponse.error) {
    throw new Error(deleteSnapshotsResponse.error.message || "Could not remove member Community Grow submissions.");
  }

  const deleteSessionsResponse = await appState.supabase
    .from("grow_sessions")
    .delete()
    .eq("user_id", member.id);
  if (deleteSessionsResponse.error) {
    throw new Error(deleteSessionsResponse.error.message || "Could not remove member sessions.");
  }

  if (member.avatarPath) {
    await removeProfileAvatarFromStorage(member.avatarPath);
  }

  const redactProfileResponse = await appState.supabase
    .from("profiles")
    .update({
      username: "Deleted member",
      avatar_url: "",
      avatar_path: "",
      account_status: "disabled",
      deletion_requested_at: new Date().toISOString(),
      deletion_scheduled_for: null,
      deletion_status: "deleted",
    })
    .eq("id", member.id)
    .select("*")
    .single();
  if (redactProfileResponse.error) {
    throw new Error(redactProfileResponse.error.message || "Could not finalize member deletion.");
  }

  appState.gallerySnapshots = appState.gallerySnapshots.filter((snapshot) => snapshot.userId !== member.id);
  await refreshAdminMembers({ force: true, reason: "admin:member-delete" });
  await refreshRegisteredMemberCount({ force: true });
}

function normalizeProfileRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    username: String(row.username || "").trim(),
    email: String(row.email || "").trim().toLowerCase(),
    role: normalizeUserRole(row.role),
    avatarUrl: String(row.avatar_url || "").trim(),
    avatarPath: String(row.avatar_path || "").trim(),
    accountStatus: String(row.account_status || "active").trim().toLowerCase() === "disabled" ? "disabled" : "active",
    lastActiveAt: row.last_active_at || "",
    deletionRequestedAt: row.deletion_requested_at || "",
    deletionScheduledFor: row.deletion_scheduled_for || "",
    deletionStatus: String(row.deletion_status || "").trim(),
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}

function normalizeUserNotificationPreferencesRow(row) {
  if (!row) {
    return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  }

  return {
    notifySnapshot: getUserNotificationPreferencesBooleanValue(row, ["notify_snapshot", "email_notifications"]),
    notifyCompletion: getUserNotificationPreferencesBooleanValue(row, ["notify_completion", "session_reminders"]),
    notifyFollow: getUserNotificationPreferencesBooleanValue(row, ["notify_follow", "community_updates"]),
    notifyLike: getUserNotificationPreferencesBooleanValue(row, ["notify_like", "low_filter_alerts"]),
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}

function normalizePublicMemberProfileRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: String(row.id || "").trim(),
    displayName: String(row.display_name || row.username || "").trim() || "Community member",
    avatarUrl: String(row.avatar_url || "").trim(),
    joinedAt: row.joined_at || row.created_at || "",
  };
}

function isPublicMemberProfilesViewUnavailableError(error) {
  return isSupabaseTableMissingError(error, "public_member_profiles")
    || getSupabaseErrorStatusCode(error) === 404;
}

function markPublicMemberProfilesViewUnavailable(details = {}) {
  // TODO: Create the Supabase `public_member_profiles` table/view so gallery member
  // profiles can load from the backend instead of falling back to snapshot-only data.
  appState.publicMemberProfilesViewUnavailable = true;
  logRuntimeIssueOnce(
    "warn",
    "public-member-profiles-view-unavailable",
    "Public member profiles view unavailable; falling back to snapshot-only profiles.",
    details,
  );
}

function getPublicMemberProfileRoute(memberId = "") {
  const normalizedId = String(memberId || "").trim();
  return normalizedId ? `#members/${encodeURIComponent(normalizedId)}` : "#gallery";
}

function getApprovedPublicSnapshotsForMember(memberId = "", snapshots = getApprovedPublicGallerySnapshots()) {
  const normalizedId = String(memberId || "").trim();
  if (!normalizedId) {
    return [];
  }

  return (snapshots || []).filter((snapshot) => String(snapshot?.userId || "").trim() === normalizedId);
}

function buildDerivedPublicMemberProfile(memberId = "", snapshots = getApprovedPublicSnapshotsForMember(memberId)) {
  const normalizedId = String(memberId || "").trim();
  if (!normalizedId) {
    return null;
  }

  const memberSnapshots = Array.isArray(snapshots) ? snapshots : [];
  if (!memberSnapshots.length) {
    return null;
  }

  const sharedProfileSnapshot = memberSnapshots.find(hasGallerySnapshotGrowMember) || memberSnapshots[0];
  return {
    id: normalizedId,
    displayName: getGallerySnapshotMemberLabel(sharedProfileSnapshot),
    avatarUrl: String(sharedProfileSnapshot?.profileImageUrl || "").trim(),
    joinedAt: "",
  };
}

function getPublicMemberProfile(memberId = "") {
  const normalizedId = String(memberId || "").trim();
  if (!normalizedId) {
    return null;
  }

  return appState.publicMemberProfiles[normalizedId]
    || buildDerivedPublicMemberProfile(normalizedId)
    || null;
}

async function loadPublicMemberProfile(memberId = "", options = {}) {
  const normalizedId = String(memberId || "").trim();
  if (!normalizedId) {
    return null;
  }

  const { force = false, reason = "unspecified" } = options;
  const fallbackProfile = buildDerivedPublicMemberProfile(normalizedId);
  if (!force && appState.publicMemberProfiles[normalizedId]) {
    return appState.publicMemberProfiles[normalizedId];
  }

  if (!appState.supabase || appState.publicMemberProfilesViewUnavailable) {
    if (fallbackProfile) {
      appState.publicMemberProfiles[normalizedId] = fallbackProfile;
    }
    return fallbackProfile || null;
  }

  if (!force && appState.publicMemberProfilesRefreshPromises[normalizedId]) {
    return appState.publicMemberProfilesRefreshPromises[normalizedId];
  }

  const refreshPromise = (async () => {
    try {
      const { data, error } = await appState.supabase
        .from("public_member_profiles")
        .select("id,display_name,avatar_url,joined_at")
        .eq("id", normalizedId)
        .maybeSingle();

      if (error) {
        markPublicMemberProfilesViewUnavailable({
          reason,
          memberId: normalizedId,
          error,
          unavailable: isPublicMemberProfilesViewUnavailableError(error),
        });

        if (fallbackProfile) {
          appState.publicMemberProfiles[normalizedId] = fallbackProfile;
        }
        return fallbackProfile || null;
      }

      const loadedProfile = normalizePublicMemberProfileRow(data);
      const resolvedProfile = loadedProfile
        ? {
          ...fallbackProfile,
          ...loadedProfile,
          displayName: loadedProfile.displayName || fallbackProfile?.displayName || "Community member",
          avatarUrl: loadedProfile.avatarUrl || fallbackProfile?.avatarUrl || "",
          joinedAt: loadedProfile.joinedAt || fallbackProfile?.joinedAt || "",
        }
        : (fallbackProfile || null);

      if (resolvedProfile) {
        appState.publicMemberProfiles[normalizedId] = resolvedProfile;
      }

      return resolvedProfile;
    } catch (error) {
      markPublicMemberProfilesViewUnavailable({
        reason,
        memberId: normalizedId,
        error,
        unavailable: isPublicMemberProfilesViewUnavailableError(error),
      });
      if (fallbackProfile) {
        appState.publicMemberProfiles[normalizedId] = fallbackProfile;
      }
      return fallbackProfile || null;
    } finally {
      delete appState.publicMemberProfilesRefreshPromises[normalizedId];
    }
  })();

  appState.publicMemberProfilesRefreshPromises[normalizedId] = refreshPromise;
  return refreshPromise;
}

async function refreshPublicMemberProfile(memberId = "", options = {}) {
  const normalizedId = String(memberId || "").trim();
  if (!normalizedId) {
    return null;
  }

  const profile = await loadPublicMemberProfile(normalizedId, options);
  if (normalizeNavigationHash(window.location.hash || "#home") === getPublicMemberProfileRoute(normalizedId)) {
    renderPublicMemberProfile(normalizedId);
  }
  return profile;
}

async function loadPublicMemberProfilesByIds(memberIds = [], options = {}) {
  const normalizedIds = [...new Set((memberIds || []).map((memberId) => String(memberId || "").trim()).filter(Boolean))];
  if (!normalizedIds.length) {
    return {};
  }

  const { force = false, reason = "unspecified" } = options;
  const missingIds = normalizedIds.filter((memberId) => force || !appState.publicMemberProfiles[memberId]);
  if (!missingIds.length) {
    return Object.fromEntries(normalizedIds.map((memberId) => [memberId, appState.publicMemberProfiles[memberId] || buildDerivedPublicMemberProfile(memberId)]));
  }

  if (!appState.supabase || appState.publicMemberProfilesViewUnavailable) {
    missingIds.forEach((memberId) => {
      const fallbackProfile = buildDerivedPublicMemberProfile(memberId);
      if (fallbackProfile) {
        appState.publicMemberProfiles[memberId] = fallbackProfile;
      }
    });
    return Object.fromEntries(normalizedIds.map((memberId) => [memberId, appState.publicMemberProfiles[memberId] || buildDerivedPublicMemberProfile(memberId)]));
  }

  let data = null;
  try {
    const response = await appState.supabase
      .from("public_member_profiles")
      .select("id,display_name,avatar_url,joined_at")
      .in("id", missingIds);
    data = response.data;

    if (response.error) {
      markPublicMemberProfilesViewUnavailable({
        reason,
        memberIds: missingIds,
        error: response.error,
        unavailable: isPublicMemberProfilesViewUnavailableError(response.error),
      });

      missingIds.forEach((memberId) => {
        const fallbackProfile = buildDerivedPublicMemberProfile(memberId);
        if (fallbackProfile) {
          appState.publicMemberProfiles[memberId] = fallbackProfile;
        }
      });

      return Object.fromEntries(normalizedIds.map((memberId) => [memberId, appState.publicMemberProfiles[memberId] || buildDerivedPublicMemberProfile(memberId)]));
    }
  } catch (error) {
    markPublicMemberProfilesViewUnavailable({
      reason,
      memberIds: missingIds,
      error,
      unavailable: isPublicMemberProfilesViewUnavailableError(error),
    });

    missingIds.forEach((memberId) => {
      const fallbackProfile = buildDerivedPublicMemberProfile(memberId);
      if (fallbackProfile) {
        appState.publicMemberProfiles[memberId] = fallbackProfile;
      }
    });

    return Object.fromEntries(normalizedIds.map((memberId) => [memberId, appState.publicMemberProfiles[memberId] || buildDerivedPublicMemberProfile(memberId)]));
  }

  const rowsById = new Map((data || []).map((row) => [String(row?.id || "").trim(), row]));
  missingIds.forEach((memberId) => {
    const fallbackProfile = buildDerivedPublicMemberProfile(memberId);
    const loadedProfile = normalizePublicMemberProfileRow(rowsById.get(memberId));
    const resolvedProfile = loadedProfile
      ? {
        ...fallbackProfile,
        ...loadedProfile,
        displayName: loadedProfile.displayName || fallbackProfile?.displayName || "Community member",
        avatarUrl: loadedProfile.avatarUrl || fallbackProfile?.avatarUrl || "",
        joinedAt: loadedProfile.joinedAt || fallbackProfile?.joinedAt || "",
      }
      : fallbackProfile;
    if (resolvedProfile) {
      appState.publicMemberProfiles[memberId] = resolvedProfile;
    }
  });

  return Object.fromEntries(normalizedIds.map((memberId) => [memberId, appState.publicMemberProfiles[memberId] || buildDerivedPublicMemberProfile(memberId)]));
}

function normalizePublicMemberFollowSummaryRow(row) {
  return {
    followerCount: Math.max(0, Number(row?.follower_count ?? row?.followerCount) || 0),
    followingCount: Math.max(0, Number(row?.following_count ?? row?.followingCount) || 0),
  };
}

function normalizePublicMemberFollowListRow(row) {
  const memberId = String(row?.member_id || row?.memberId || "").trim();
  if (!memberId) {
    return null;
  }

  return {
    memberId,
    displayName: String(row?.display_name || row?.displayName || "").trim() || "Community member",
    avatarUrl: String(row?.avatar_url || row?.avatarUrl || "").trim(),
    joinedAt: row?.joined_at || row?.joinedAt || "",
    createdAt: row?.created_at || row?.createdAt || "",
    relationshipType: String(row?.relationship_type || row?.relationshipType || "").trim() === "following"
      ? "following"
      : "followers",
  };
}

function normalizePublicMemberFollowSummariesRows(rows = []) {
  const summaries = {};
  (rows || []).forEach((row) => {
    const userId = String(row?.user_id || row?.userId || "").trim();
    if (!userId) {
      return;
    }
    summaries[userId] = normalizePublicMemberFollowSummaryRow(row);
  });
  return summaries;
}

function isPublicMemberFollowSummaryUnavailableError(error) {
  const message = String(error?.message || error?.details || "").toLowerCase();
  return message.includes("get_public_member_follow_summary") && (
    message.includes("function")
    || message.includes("permission denied")
  );
}

function isPublicMemberFollowMembersUnavailableError(error) {
  const message = String(error?.message || error?.details || "").toLowerCase();
  return message.includes("get_public_member_follow_members") && (
    message.includes("function")
    || message.includes("permission denied")
  );
}

function isGrowFollowsTableUnavailableError(error) {
  const message = String(error?.message || error?.details || "").toLowerCase();
  return message.includes("grow_follows") && (
    message.includes("relation")
    || message.includes("permission denied")
  );
}

function getPublicMemberFollowSummary(memberId = "") {
  const normalizedId = String(memberId || "").trim();
  if (!normalizedId) {
    return null;
  }

  return appState.publicMemberFollowSummaries[normalizedId] || null;
}

function normalizeGrowNetworkFollowingRow(row) {
  if (!row) {
    return null;
  }

  return {
    memberId: String(row.following_id || "").trim(),
    followedAt: row.created_at || "",
    isMock: Boolean(row.isMock),
  };
}

function normalizeGrowNetworkTab(tab = "") {
  const normalizedTab = String(tab || "").trim().toLowerCase();
  return ["discover", "followers"].includes(normalizedTab)
    ? normalizedTab
    : "following";
}

function getGrowNetworkActiveTab() {
  return normalizeGrowNetworkTab(appState.growNetworkActiveTab);
}

function setGrowNetworkActiveTab(tab = "") {
  appState.growNetworkActiveTab = normalizeGrowNetworkTab(tab);
}

function getMockGrowNetworkProfiles() {
  return GROW_NETWORK_MOCK_PROFILES.map((profile) => {
    const hasOverride = Object.prototype.hasOwnProperty.call(appState.mockGrowNetworkFollowStates, profile.id);
    return {
      ...profile,
      isFollowing: hasOverride
        ? Boolean(appState.mockGrowNetworkFollowStates[profile.id])
        : Boolean(profile.isFollowing),
    };
  });
}

function syncMockGrowNetworkCaches() {
  const mockProfiles = getMockGrowNetworkProfiles();
  mockProfiles.forEach((profile, index) => {
    appState.publicMemberProfiles[profile.id] = {
      id: profile.id,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl || buildMockGalleryProfileAvatarDataUri(profile.displayName, profile.favoriteSource || profile.favoriteSeedType || "Grow Network", index),
      joinedAt: "2026-01-01T12:00:00.000Z",
    };
    appState.publicMemberFollowSummaries[profile.id] = {
      followerCount: Math.max(0, Number(profile.followerCount) || 0),
      followingCount: Math.max(0, Number(profile.followingCount) || 0),
    };
    appState.publicMemberFollowStates[profile.id] = Boolean(profile.isFollowing);
  });
  return mockProfiles;
}

function buildMockGrowNetworkFollowingEntries() {
  return syncMockGrowNetworkCaches()
    .filter((profile) => profile.isFollowing)
    .map((profile, index) => ({
      memberId: profile.id,
      followedAt: new Date(Date.UTC(2026, 3, Math.max(1, 28 - index), 16, 0, 0)).toISOString(),
      isMock: true,
    }));
}

function buildMockGrowNetworkMemberCards(tab = "following") {
  const normalizedTab = normalizeGrowNetworkTab(tab);
  const mockProfiles = syncMockGrowNetworkCaches();

  if (normalizedTab === "discover") {
    return mockProfiles;
  }

  if (normalizedTab === "followers") {
    return mockProfiles.slice(4).concat(mockProfiles.slice(0, 4)).slice(0, 8);
  }

  return mockProfiles.filter((profile) => profile.isFollowing);
}

function buildMockGrowNetworkActivityEntries() {
  const followedIds = new Set(buildMockGrowNetworkFollowingEntries().map((entry) => entry.memberId));
  return GROW_NETWORK_MOCK_ACTIVITIES
    .filter((activity) => followedIds.has(activity.memberId))
    .map((activity) => {
      const profile = getPublicMemberProfile(activity.memberId);
      return {
        id: activity.id,
        activityType: activity.activityType,
        typeLabel: activity.typeLabel,
        typeMeta: activity.typeMeta,
        title: activity.title,
        summary: activity.summary,
        successPercent: Math.max(0, Number(String(activity.germinationRateLabel || "").replace(/[^0-9.]/g, "")) || 0),
        occurredAt: activity.occurredAt,
        memberId: activity.memberId,
        displayName: profile?.displayName || activity.memberId,
        avatarUrl: profile?.avatarUrl || "",
        profileRoute: getPublicMemberProfileRoute(activity.memberId),
        sessionRoute: activity.sessionRoute || "#gallery",
        sessionDateLabel: "",
        sourceLabel: activity.sourceLabel || "",
        germinationRateLabel: activity.germinationRateLabel || "0%",
        systemLabel: "KAN",
      };
    });
}

function getMockGrowNetworkNotifications() {
  return GROW_NETWORK_MOCK_NOTIFICATIONS.map((notification) => ({
    ...notification,
    type: ["follow", "like", "system"].includes(String(notification.type || "").trim().toLowerCase())
      ? String(notification.type || "").trim().toLowerCase()
      : "system",
    displayName: String(notification.displayName || "").trim() || "Grow Network",
    avatarUrl: String(notification.avatarUrl || "").trim(),
    actionText: String(notification.actionText || "").trim(),
    occurredAt: String(notification.occurredAt || "").trim() || GROW_NETWORK_NOTIFICATION_MOCK_REFERENCE_AT,
    isUnseen: Boolean(notification.isUnseen) && !appState.mockGrowNetworkSeenNotificationIds[String(notification.id || "").trim()],
    targetId: String(notification.targetId || "").trim(),
    targetType: String(notification.targetType || "").trim().toLowerCase(),
    targetLabel: String(notification.targetLabel || "").trim() || "activity",
    targetName: String(notification.targetName || "").trim(),
    targetRoute: String(notification.targetRoute || "").trim() || "#network",
  })).sort((left, right) => {
    const leftTime = parseCompletedAtValue(left.occurredAt)?.getTime() || 0;
    const rightTime = parseCompletedAtValue(right.occurredAt)?.getTime() || 0;
    return rightTime - leftTime;
  });
}

function formatGrowNetworkNotificationRelativeTime(
  occurredAt = "",
  referenceAt = GROW_NETWORK_NOTIFICATION_MOCK_REFERENCE_AT,
) {
  const occurredAtDate = parseCompletedAtValue(occurredAt);
  const referenceDate = parseCompletedAtValue(referenceAt) || new Date();
  if (!occurredAtDate) {
    return "now";
  }

  const diffMs = Math.max(0, referenceDate.getTime() - occurredAtDate.getTime());
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));
  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h`;
  }

  return `${Math.floor(diffHours / 24)}d`;
}

function getGrowNetworkNotificationGroupKey(notification) {
  const normalizedType = String(notification?.type || "").trim().toLowerCase();
  if (normalizedType === "follow") {
    return `follow:${String(notification?.targetId || "self-follow").trim()}`;
  }
  if (normalizedType === "like" && notification?.targetId) {
    return `like:${String(notification.targetType || "activity").trim().toLowerCase()}:${String(notification.targetId).trim()}`;
  }
  return "";
}

function formatGrowNetworkNotificationActorText(notifications = [], type = "") {
  const names = notifications
    .map((notification) => String(notification?.displayName || "").trim())
    .filter(Boolean);
  if (!names.length) {
    return "Grow Network";
  }

  if (type === "follow") {
    if (names.length === 1) {
      return names[0];
    }
    if (names.length === 2) {
      return `${names[0]} and ${names[1]}`;
    }
    return `${names[0]}, ${names[1]} and ${names.length - 2} other${names.length - 2 === 1 ? "" : "s"}`;
  }

  if (type === "like") {
    if (names.length === 1) {
      return names[0];
    }
    if (names.length === 2) {
      return `${names[0]} and ${names[1]}`;
    }
    return `${names[0]} and ${names.length - 1} other${names.length - 1 === 1 ? "" : "s"}`;
  }

  return names[0];
}

function buildGrowNetworkNotificationFeedGroup(notifications = []) {
  const groupedNotifications = [...notifications].sort((left, right) => {
    const leftTime = parseCompletedAtValue(left?.occurredAt)?.getTime() || 0;
    const rightTime = parseCompletedAtValue(right?.occurredAt)?.getTime() || 0;
    return rightTime - leftTime;
  });
  const primaryNotification = groupedNotifications[0] || {};
  const normalizedType = String(primaryNotification.type || "system").trim().toLowerCase();
  const isGrouped = groupedNotifications.length > 1 && ["follow", "like"].includes(normalizedType);
  const actorText = formatGrowNetworkNotificationActorText(groupedNotifications, normalizedType);
  const actionText = normalizedType === "follow"
    ? "started following you"
    : normalizedType === "like"
      ? `liked your ${primaryNotification.targetLabel || "activity"}`
      : String(primaryNotification.actionText || "sent an update").trim();

  return {
    id: isGrouped
      ? `group-${getGrowNetworkNotificationGroupKey(primaryNotification)}-${String(primaryNotification.occurredAt || "").trim()}`
      : String(primaryNotification.id || crypto.randomUUID()).trim(),
    type: normalizedType,
    isGrouped,
    isUnseen: groupedNotifications.some((notification) => notification.isUnseen),
    actorText,
    actionText,
    timeLabel: formatGrowNetworkNotificationRelativeTime(primaryNotification.occurredAt),
    occurredAt: primaryNotification.occurredAt || "",
    targetLabel: String(primaryNotification.targetLabel || "activity").trim(),
    targetName: String(primaryNotification.targetName || "").trim(),
    targetRoute: String(primaryNotification.targetRoute || "#network").trim() || "#network",
    avatarMembers: groupedNotifications.slice(0, GROW_NETWORK_NOTIFICATION_MAX_STACKED_AVATARS),
    overflowAvatarCount: Math.max(0, groupedNotifications.length - GROW_NETWORK_NOTIFICATION_MAX_STACKED_AVATARS),
    notifications: groupedNotifications,
    modalTitle: normalizedType === "follow"
      ? "Followers"
      : normalizedType === "like"
        ? `Likes on your ${String(primaryNotification.targetLabel || "activity").trim()}`
        : "Grow Network notification",
  };
}

function buildMockGrowNetworkNotificationFeedGroups(
  notifications = [],
  groupWindowMs = GROW_NETWORK_NOTIFICATION_GROUP_WINDOW_MS,
) {
  const sortedNotifications = [...notifications].sort((left, right) => {
    const leftTime = parseCompletedAtValue(left?.occurredAt)?.getTime() || 0;
    const rightTime = parseCompletedAtValue(right?.occurredAt)?.getTime() || 0;
    return rightTime - leftTime;
  });
  const consumedIds = new Set();
  const groups = [];

  sortedNotifications.forEach((notification, index) => {
    const normalizedId = String(notification?.id || "").trim();
    if (!normalizedId || consumedIds.has(normalizedId)) {
      return;
    }

    consumedIds.add(normalizedId);
    const nextGroup = [notification];
    const groupKey = getGrowNetworkNotificationGroupKey(notification);
    const baseTime = parseCompletedAtValue(notification.occurredAt)?.getTime() || 0;

    if (groupKey) {
      for (let cursor = index + 1; cursor < sortedNotifications.length; cursor += 1) {
        const candidate = sortedNotifications[cursor];
        const candidateId = String(candidate?.id || "").trim();
        if (!candidateId || consumedIds.has(candidateId)) {
          continue;
        }
        if (getGrowNetworkNotificationGroupKey(candidate) !== groupKey) {
          continue;
        }

        const candidateTime = parseCompletedAtValue(candidate.occurredAt)?.getTime() || 0;
        if (Math.abs(baseTime - candidateTime) > groupWindowMs) {
          continue;
        }

        nextGroup.push(candidate);
        consumedIds.add(candidateId);
      }
    }

    groups.push(buildGrowNetworkNotificationFeedGroup(nextGroup));
  });

  return groups;
}

function isGrowNetworkMockNotificationTestAccount() {
  return getNormalizedUserEmail() === GROW_NETWORK_TEST_NOTIFICATION_EMAIL;
}

function shouldUseMockGrowNetworkNotifications() {
  if (!appState.user) {
    return false;
  }

  return isMockDataEnabled() || isGrowNetworkMockNotificationTestAccount();
}

function hasUnseenMockGrowNetworkNotifications() {
  if (!shouldUseMockGrowNetworkNotifications()) {
    return false;
  }

  return getMockGrowNetworkNotifications().some((notification) => notification.isUnseen);
}

function getUnseenMockGrowNetworkNotificationCount() {
  if (!shouldUseMockGrowNetworkNotifications()) {
    return 0;
  }

  return getMockGrowNetworkNotifications().filter((notification) => notification.isUnseen).length;
}

function formatGrowNetworkNotificationBadgeCount(count = 0) {
  const normalizedCount = Math.max(0, Number(count) || 0);
  if (!normalizedCount) {
    return "";
  }
  if (normalizedCount > 99) {
    return "99+";
  }
  return String(normalizedCount);
}

function markMockGrowNetworkNotificationsSeen(notificationIds = []) {
  notificationIds.forEach((notificationId) => {
    const normalizedId = String(notificationId || "").trim();
    if (!normalizedId) {
      return;
    }
    appState.mockGrowNetworkSeenNotificationIds[normalizedId] = true;
  });
}

function markAllMockGrowNetworkNotificationsSeen() {
  markMockGrowNetworkNotificationsSeen(GROW_NETWORK_MOCK_NOTIFICATIONS.map((notification) => notification.id));
}

function ensureGrowNetworkNotificationGroupModal() {
  let modal = document.querySelector("#grow-network-notification-group-modal");
  if (modal instanceof HTMLDialogElement) {
    return modal;
  }

  modal = document.createElement("dialog");
  modal.id = "grow-network-notification-group-modal";
  modal.className = "snapshot-modal grow-network-notification-group-modal";
  modal.innerHTML = `
    <form method="dialog" class="snapshot-modal-card grow-network-notification-group-modal-card">
      <div class="snapshot-modal-copy">
        <p class="eyebrow">Grow Network</p>
        <h3 id="grow-network-notification-group-modal-title">Notification details</h3>
        <p id="grow-network-notification-group-modal-copy"></p>
      </div>
      <div id="grow-network-notification-group-modal-list" class="grow-network-notification-group-modal-list"></div>
      <div class="snapshot-modal-actions">
        <a id="grow-network-notification-group-modal-link" class="button button-secondary" href="#network">Open Target</a>
        <button type="submit" class="button button-primary">Close</button>
      </div>
    </form>
  `;

  modal.addEventListener("click", (event) => {
    if (event.target === modal && modal.open) {
      modal.close();
    }
  });

  document.body.appendChild(modal);
  return modal;
}

function openGrowNetworkNotificationGroupModal(notificationGroup) {
  if (!notificationGroup?.isGrouped) {
    return;
  }

  const modal = ensureGrowNetworkNotificationGroupModal();
  const title = modal.querySelector("#grow-network-notification-group-modal-title");
  const copy = modal.querySelector("#grow-network-notification-group-modal-copy");
  const list = modal.querySelector("#grow-network-notification-group-modal-list");
  const link = modal.querySelector("#grow-network-notification-group-modal-link");

  if (!title || !copy || !list || !link) {
    return;
  }

  title.textContent = notificationGroup.modalTitle || "Notification details";
  copy.textContent = notificationGroup.type === "follow"
    ? "Grouped follows within the current notification window."
    : "Grouped likes within the current notification window.";
  list.innerHTML = notificationGroup.notifications.map((notification) => {
    const timeLabel = formatGrowNetworkNotificationRelativeTime(notification.occurredAt);
    return `
      <div class="grow-network-notification-group-modal-item">
        ${renderPublicMemberAvatarMarkup(notification.displayName, notification.avatarUrl, "grow-network-notification-avatar")}
        <div class="grow-network-notification-group-modal-item-copy">
          <strong>${escapeHtml(notification.displayName)}</strong>
          <span>${escapeHtml(notification.type === "follow" ? "Started following you" : `Liked your ${notification.targetLabel || "activity"}`)}</span>
        </div>
        <span class="grow-network-notification-group-modal-item-time">${escapeHtml(timeLabel)}</span>
      </div>
    `;
  }).join("");
  link.href = notificationGroup.targetRoute || "#network";
  link.hidden = !notificationGroup.targetRoute;

  if (!modal.open) {
    modal.showModal();
  }
}

function toggleMockGrowNetworkFollowState(memberId = "") {
  const normalizedId = String(memberId || "").trim();
  if (!normalizedId) {
    return;
  }

  const currentProfile = getMockGrowNetworkProfiles().find((profile) => profile.id === normalizedId);
  if (!currentProfile) {
    return;
  }

  appState.mockGrowNetworkFollowStates[normalizedId] = !currentProfile.isFollowing;
  appState.publicMemberFollowStates[normalizedId] = Boolean(appState.mockGrowNetworkFollowStates[normalizedId]);
  appState.growNetworkFollowing = buildMockGrowNetworkFollowingEntries();
  appState.growNetworkActivity = buildMockGrowNetworkActivityEntries();
  appState.growNetworkFollowingLoaded = true;
  appState.growNetworkActivityLoaded = true;
}

function buildFallbackGrowNetworkFollowingEntries(limit = 6) {
  const seenMemberIds = new Set();
  const approvedSnapshots = getGallerySnapshotsForDisplay()
    .filter((snapshot) => getGallerySnapshotDisplayStatus(snapshot) === "approved");
  const fallbackEntries = [];

  approvedSnapshots.forEach((snapshot) => {
    const memberId = String(snapshot?.userId || "").trim();
    if (!memberId || memberId === appState.user?.id || seenMemberIds.has(memberId)) {
      return;
    }

    seenMemberIds.add(memberId);
    fallbackEntries.push({
      memberId,
      followedAt: snapshot?.publishedAt || snapshot?.createdAt || "",
      isMock: true,
    });
  });

  return fallbackEntries.slice(0, Math.max(0, Number(limit) || 0));
}

function getActivePublicMemberProfileRouteId() {
  const currentHash = normalizeNavigationHash(window.location.hash || "#home");
  if (!currentHash.startsWith("#members/")) {
    return "";
  }

  return decodeURIComponent(currentHash.replace(/^#members\//, ""));
}

function getPublicMemberFollowLists(memberId = "") {
  const normalizedId = String(memberId || "").trim();
  if (!normalizedId) {
    return null;
  }

  return appState.publicMemberFollowLists[normalizedId] || null;
}

function getPublicMemberFollowList(memberId = "", listType = "followers") {
  const normalizedType = String(listType || "").trim() === "following" ? "following" : "followers";
  const lists = getPublicMemberFollowLists(memberId);
  return Array.isArray(lists?.[normalizedType]) ? lists[normalizedType] : null;
}

function getPublicMemberProfileActiveTab(memberId = "") {
  const normalizedId = String(memberId || "").trim();
  if (!normalizedId) {
    return "followers";
  }

  return appState.publicMemberProfileActiveTabs[normalizedId] === "following"
    ? "following"
    : "followers";
}

function setPublicMemberProfileActiveTab(memberId = "", tab = "followers") {
  const normalizedId = String(memberId || "").trim();
  if (!normalizedId) {
    return;
  }

  appState.publicMemberProfileActiveTabs[normalizedId] = String(tab || "").trim() === "following"
    ? "following"
    : "followers";
  rerenderOpenPublicMemberConnectionsModal();
}

function ensurePublicMemberConnectionsModal() {
  let modal = document.querySelector("#public-member-connections-modal");
  if (modal instanceof HTMLDialogElement) {
    return modal;
  }

  modal = document.createElement("dialog");
  modal.id = "public-member-connections-modal";
  modal.className = "snapshot-modal public-member-connections-modal";
  modal.innerHTML = `
    <div class="snapshot-modal-card public-member-connections-modal-card" role="document" aria-labelledby="public-member-connections-modal-title">
      <button type="button" class="modal-close" data-public-member-connections-close aria-label="Close connections">×</button>
      <div class="snapshot-modal-copy public-member-connections-modal-copy">
        <p class="eyebrow">Grow Network</p>
        <h3 id="public-member-connections-modal-title">Followers and following</h3>
        <p id="public-member-connections-modal-subtitle">Explore this member's public social graph.</p>
      </div>
      <div id="public-member-connections-modal-body"></div>
    </div>
  `;

  modal.addEventListener("click", (event) => {
    if (event.target === modal && modal.open) {
      modal.close();
    }
  });
  modal.querySelector("[data-public-member-connections-close]")?.addEventListener("click", () => {
    if (modal.open) {
      modal.close();
    }
  });
  modal.addEventListener("close", () => {
    modal.dataset.memberId = "";
    modal.dataset.listType = "";
  });
  document.body.appendChild(modal);
  return modal;
}

function getOpenPublicMemberConnectionsModalContext() {
  const modal = document.querySelector("#public-member-connections-modal");
  if (!(modal instanceof HTMLDialogElement) || !modal.open) {
    return null;
  }

  const memberId = String(modal.dataset.memberId || "").trim();
  const listType = String(modal.dataset.listType || "").trim() === "following" ? "following" : "followers";
  if (!memberId) {
    return null;
  }

  return {
    modal,
    memberId,
    listType,
  };
}

function renderPublicMemberConnectionRowsMarkup(profileMemberId = "", listType = "followers", options = {}) {
  const normalizedProfileId = String(profileMemberId || "").trim();
  const normalizedType = String(listType || "").trim() === "following" ? "following" : "followers";
  const {
    emptyStateClassName = "public-member-profile-connections-empty",
    followButtonDataAttribute = "data-public-member-list-follow",
    closeModalOnProfileView = false,
  } = options;
  const activeConnectionRows = getPublicMemberFollowList(normalizedProfileId, normalizedType);
  const isLoadingFollowLists = Boolean(appState.publicMemberFollowListsRefreshPromises[normalizedProfileId]);
  const isOwnProfile = isViewingOwnPublicMemberProfile(normalizedProfileId);

  if (isLoadingFollowLists && !Array.isArray(activeConnectionRows)) {
    return `
      <div class="empty-state gallery-empty-state ${escapeHtml(emptyStateClassName)}">
        <p>Loading public member connections...</p>
      </div>
    `;
  }

  if (appState.publicMemberFollowListsUnavailable) {
    return `
      <div class="empty-state gallery-empty-state ${escapeHtml(emptyStateClassName)}">
        <p>Follower and following lists are unavailable right now.</p>
      </div>
    `;
  }

  if (!Array.isArray(activeConnectionRows) || !activeConnectionRows.length) {
    return `
      <div class="empty-state gallery-empty-state ${escapeHtml(emptyStateClassName)}">
        <p>${escapeHtml(normalizedType === "followers" ? "No followers yet." : "Not following anyone yet.")}</p>
      </div>
    `;
  }

  return `
    <div class="public-member-profile-connections-list">
      ${activeConnectionRows.map((row) => {
        const rowFollowState = getViewerPublicMemberFollowState(row.memberId);
        const isRowFollowPending = isPublicMemberFollowPending(row.memberId);
        const canShowRowFollowButton = Boolean(appState.user?.id)
          && !isOwnProfile
          && !appState.publicMemberFollowsTableUnavailable
          && !isViewingOwnPublicMemberProfile(row.memberId);
        const isRowFollowing = rowFollowState === true;
        const isLoadingRowFollowState = canShowRowFollowButton && rowFollowState === null && Boolean(appState.growNetworkFollowingRefreshPromise);
        const rowMetaLabel = formatPublicMemberJoinedDateLabel(row.joinedAt || "")
          ? `Joined ${formatPublicMemberJoinedDateLabel(row.joinedAt || "")}`
          : "Public grow profile";
        return `
          <article class="public-member-profile-connection-card">
            <a class="public-member-profile-connection-link" href="${escapeHtml(getPublicMemberProfileRoute(row.memberId))}" ${closeModalOnProfileView ? 'data-public-member-connections-profile-link="true"' : ""}>
              <span class="public-member-profile-connection-avatar-shell">
                ${renderPublicMemberAvatarMarkup(row.displayName, row.avatarUrl, "public-member-profile-connection-avatar")}
              </span>
              <span class="public-member-profile-connection-copy">
                <strong>${escapeHtml(row.displayName)}</strong>
                <span>${escapeHtml(rowMetaLabel)}</span>
              </span>
            </a>
            <div class="public-member-profile-connection-actions">
              <a
                class="button button-secondary"
                href="${escapeHtml(getPublicMemberProfileRoute(row.memberId))}"
                ${closeModalOnProfileView ? 'data-public-member-connections-profile-link="true"' : ""}
              >View Profile</a>
              ${canShowRowFollowButton ? `
                <button
                  type="button"
                  class="button ${isRowFollowing ? "button-secondary" : "button-primary"} public-member-profile-connection-follow-button${isRowFollowing ? " is-following" : ""}"
                  ${escapeHtml(followButtonDataAttribute)}="${escapeHtml(row.memberId)}"
                  ${(isRowFollowPending || isLoadingRowFollowState) ? "disabled" : ""}
                  aria-pressed="${isRowFollowing ? "true" : "false"}"
                >${escapeHtml(isLoadingRowFollowState ? "Loading..." : (isRowFollowing ? "Following" : "Follow"))}</button>
              ` : ""}
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function renderPublicMemberConnectionsModal(memberId = "", listType = "followers") {
  const normalizedId = String(memberId || "").trim();
  if (!normalizedId) {
    return;
  }

  const normalizedType = String(listType || "").trim() === "following" ? "following" : "followers";
  appState.publicMemberProfileActiveTabs[normalizedId] = normalizedType;
  const modal = ensurePublicMemberConnectionsModal();
  modal.dataset.memberId = normalizedId;
  modal.dataset.listType = normalizedType;

  const body = modal.querySelector("#public-member-connections-modal-body");
  const title = modal.querySelector("#public-member-connections-modal-title");
  const subtitle = modal.querySelector("#public-member-connections-modal-subtitle");
  const profile = getPublicMemberProfile(normalizedId);
  const followSummary = getPublicMemberFollowSummary(normalizedId);
  const followLists = getPublicMemberFollowLists(normalizedId);
  const isLoadingFollowSummary = Boolean(appState.publicMemberFollowSummaryRefreshPromises[normalizedId]);
  const displayName = profile?.displayName || "Community member";
  const followersCount = followSummary
    ? followSummary.followerCount.toLocaleString()
    : (Array.isArray(followLists?.followers) ? followLists.followers.length.toLocaleString() : (isLoadingFollowSummary ? "--" : "0"));
  const followingCount = followSummary
    ? followSummary.followingCount.toLocaleString()
    : (Array.isArray(followLists?.following) ? followLists.following.length.toLocaleString() : (isLoadingFollowSummary ? "--" : "0"));

  if (title) {
    title.textContent = displayName;
  }
  if (subtitle) {
    subtitle.textContent = "Followers and following for this public grow profile.";
  }
  if (body) {
    body.innerHTML = `
      <div class="public-member-connections-modal-tabs" role="tablist" aria-label="Followers and following">
        <button
          type="button"
          class="public-member-profile-connections-tab${normalizedType === "followers" ? " is-active" : ""}"
          data-public-member-connections-modal-tab="followers"
          role="tab"
          aria-selected="${normalizedType === "followers" ? "true" : "false"}"
        >
          <span>Followers</span>
          <strong>${escapeHtml(followersCount)}</strong>
        </button>
        <button
          type="button"
          class="public-member-profile-connections-tab${normalizedType === "following" ? " is-active" : ""}"
          data-public-member-connections-modal-tab="following"
          role="tab"
          aria-selected="${normalizedType === "following" ? "true" : "false"}"
        >
          <span>Following</span>
          <strong>${escapeHtml(followingCount)}</strong>
        </button>
      </div>
      <div class="public-member-connections-modal-list">
        ${renderPublicMemberConnectionRowsMarkup(normalizedId, normalizedType, {
          emptyStateClassName: "public-member-connections-modal-empty",
          followButtonDataAttribute: "data-public-member-modal-follow",
          closeModalOnProfileView: true,
        })}
      </div>
    `;
  }

  body?.querySelectorAll("[data-public-member-connections-modal-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextType = button.dataset.publicMemberConnectionsModalTab || "followers";
      renderPublicMemberConnectionsModal(normalizedId, nextType);
    });
  });
  body?.querySelectorAll("[data-public-member-modal-follow]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await togglePublicMemberFollow(button.dataset.publicMemberModalFollow || "");
      } catch (error) {
        window.alert(error.message || "Could not update this follow right now.");
      }
    });
  });
  body?.querySelectorAll("[data-public-member-connections-profile-link]").forEach((link) => {
    link.addEventListener("click", () => {
      if (modal.open) {
        modal.close();
      }
    });
  });
}

function rerenderOpenPublicMemberConnectionsModal() {
  const context = getOpenPublicMemberConnectionsModalContext();
  if (!context) {
    return;
  }

  renderPublicMemberConnectionsModal(context.memberId, context.listType);
}

function openPublicMemberConnectionsModal(memberId = "", listType = "followers") {
  const normalizedId = String(memberId || "").trim();
  if (!normalizedId) {
    return;
  }

  const normalizedType = String(listType || "").trim() === "following" ? "following" : "followers";
  const modal = ensurePublicMemberConnectionsModal();
  renderPublicMemberConnectionsModal(normalizedId, normalizedType);
  if (!modal.open) {
    modal.showModal();
  }
  modal.querySelector("[data-public-member-connections-close]")?.focus();
  void refreshPublicMemberFollowLists(normalizedId, { force: true, reason: "public-member-connections-modal" });
  void refreshPublicMemberFollowSummary(normalizedId, { force: true, reason: "public-member-connections-modal" });
  if (appState.user?.id) {
    void refreshGrowNetworkFollowing({ force: true, reason: "public-member-connections-modal" });
  }
}

function hasPublicMemberFollowState(memberId = "") {
  const normalizedId = String(memberId || "").trim();
  return normalizedId
    ? Object.prototype.hasOwnProperty.call(appState.publicMemberFollowStates, normalizedId)
    : false;
}

function getPublicMemberFollowState(memberId = "") {
  return hasPublicMemberFollowState(memberId)
    ? Boolean(appState.publicMemberFollowStates[String(memberId || "").trim()])
    : null;
}

function isPublicMemberFollowPending(memberId = "") {
  const normalizedId = String(memberId || "").trim();
  return Boolean(normalizedId && appState.publicMemberFollowPendingActions[normalizedId]);
}

function isViewingOwnPublicMemberProfile(memberId = "", user = appState.user) {
  const normalizedId = String(memberId || "").trim();
  const currentUserId = String(user?.id || "").trim();
  return Boolean(normalizedId && currentUserId && normalizedId === currentUserId);
}

function getViewerPublicMemberFollowState(memberId = "") {
  const normalizedId = String(memberId || "").trim();
  if (!normalizedId || !appState.user?.id || isViewingOwnPublicMemberProfile(normalizedId)) {
    return false;
  }

  const cachedState = getPublicMemberFollowState(normalizedId);
  if (cachedState !== null) {
    return cachedState;
  }

  if (!appState.growNetworkFollowingLoaded) {
    return null;
  }

  return getGrowNetworkFollowingEntries().some((entry) => String(entry?.memberId || "").trim() === normalizedId);
}

async function loadPublicMemberFollowSummary(memberId = "", options = {}) {
  const normalizedId = String(memberId || "").trim();
  if (!normalizedId) {
    return normalizePublicMemberFollowSummaryRow();
  }

  const { force = false, reason = "unspecified" } = options;
  if (!force && appState.publicMemberFollowSummaries[normalizedId]) {
    return appState.publicMemberFollowSummaries[normalizedId];
  }

  if (!appState.supabase || appState.publicMemberFollowSummaryUnavailable) {
    return appState.publicMemberFollowSummaries[normalizedId] || normalizePublicMemberFollowSummaryRow();
  }

  if (!force && appState.publicMemberFollowSummaryRefreshPromises[normalizedId]) {
    return appState.publicMemberFollowSummaryRefreshPromises[normalizedId];
  }

  const refreshPromise = (async () => {
    try {
      const { data, error } = await appState.supabase.rpc("get_public_member_follow_summary", {
        target_user_id: normalizedId,
      });

      if (error) {
        if (isPublicMemberFollowSummaryUnavailableError(error)) {
          appState.publicMemberFollowSummaryUnavailable = true;
          console.warn("Public member follow summary function unavailable.", {
            reason,
            memberId: normalizedId,
            error,
          });
        } else {
          console.error("Failed to load public member follow summary", {
            reason,
            memberId: normalizedId,
            error,
          });
        }

        return appState.publicMemberFollowSummaries[normalizedId] || normalizePublicMemberFollowSummaryRow();
      }

      const summary = normalizePublicMemberFollowSummaryRow(Array.isArray(data) ? data[0] : data);
      appState.publicMemberFollowSummaries[normalizedId] = summary;
      return summary;
    } finally {
      delete appState.publicMemberFollowSummaryRefreshPromises[normalizedId];
    }
  })();

  appState.publicMemberFollowSummaryRefreshPromises[normalizedId] = refreshPromise;
  return refreshPromise;
}

async function loadPublicMemberFollowSummariesByIds(memberIds = [], options = {}) {
  const normalizedIds = [...new Set((memberIds || []).map((memberId) => String(memberId || "").trim()).filter(Boolean))];
  if (!normalizedIds.length) {
    return {};
  }

  const { force = false, reason = "unspecified" } = options;
  const missingIds = normalizedIds.filter((memberId) => force || !appState.publicMemberFollowSummaries[memberId]);
  if (!missingIds.length) {
    return Object.fromEntries(normalizedIds.map((memberId) => [memberId, appState.publicMemberFollowSummaries[memberId]]));
  }

  if (!appState.supabase || appState.publicMemberFollowSummaryUnavailable) {
    return Object.fromEntries(normalizedIds.map((memberId) => [memberId, appState.publicMemberFollowSummaries[memberId] || normalizePublicMemberFollowSummaryRow()]));
  }

  const { data, error } = await appState.supabase.rpc("get_public_member_follow_summaries", {
    target_user_ids: missingIds,
  });

  if (error) {
    if (String(error?.message || error?.details || "").toLowerCase().includes("get_public_member_follow_summaries")) {
      console.warn("Bulk public member follow summaries function unavailable; falling back to single lookups.", {
        reason,
        memberIds: missingIds,
        error,
      });
      await Promise.allSettled(missingIds.map((memberId) => loadPublicMemberFollowSummary(memberId, { force, reason: `${reason}:fallback-single` })));
    } else if (isPublicMemberFollowSummaryUnavailableError(error)) {
      appState.publicMemberFollowSummaryUnavailable = true;
      console.warn("Public member follow summary function unavailable.", {
        reason,
        memberIds: missingIds,
        error,
      });
    } else {
      console.error("Failed to load public member follow summaries", {
        reason,
        memberIds: missingIds,
        error,
      });
    }

    return Object.fromEntries(normalizedIds.map((memberId) => [memberId, appState.publicMemberFollowSummaries[memberId] || normalizePublicMemberFollowSummaryRow()]));
  }

  const summariesById = normalizePublicMemberFollowSummariesRows(data || []);
  missingIds.forEach((memberId) => {
    appState.publicMemberFollowSummaries[memberId] = summariesById[memberId] || normalizePublicMemberFollowSummaryRow();
  });

  return Object.fromEntries(normalizedIds.map((memberId) => [memberId, appState.publicMemberFollowSummaries[memberId]]));
}

async function refreshPublicMemberFollowSummary(memberId = "", options = {}) {
  const normalizedId = String(memberId || "").trim();
  if (!normalizedId) {
    return normalizePublicMemberFollowSummaryRow();
  }

  const summary = await loadPublicMemberFollowSummary(normalizedId, options);
  if (getActivePublicMemberProfileRouteId() === normalizedId) {
    renderPublicMemberProfile(normalizedId);
  }
  const openModalContext = getOpenPublicMemberConnectionsModalContext();
  if (openModalContext?.memberId === normalizedId) {
    renderPublicMemberConnectionsModal(normalizedId, openModalContext.listType);
  }
  return summary;
}

async function loadPublicMemberFollowLists(memberId = "", options = {}) {
  const normalizedId = String(memberId || "").trim();
  if (!normalizedId) {
    return {
      followers: [],
      following: [],
    };
  }

  const { force = false, reason = "unspecified" } = options;
  const existingLists = appState.publicMemberFollowLists[normalizedId];
  const hasLoadedLists = Array.isArray(existingLists?.followers) && Array.isArray(existingLists?.following);
  if (!force && hasLoadedLists) {
    return existingLists;
  }

  if (!appState.supabase || appState.publicMemberFollowListsUnavailable) {
    return existingLists || {
      followers: [],
      following: [],
    };
  }

  if (!force && appState.publicMemberFollowListsRefreshPromises[normalizedId]) {
    return appState.publicMemberFollowListsRefreshPromises[normalizedId];
  }

  const refreshPromise = (async () => {
    try {
      const [followersResult, followingResult] = await Promise.all([
        appState.supabase.rpc("get_public_member_follow_members", {
          target_user_id: normalizedId,
          relationship_type: "followers",
        }),
        appState.supabase.rpc("get_public_member_follow_members", {
          target_user_id: normalizedId,
          relationship_type: "following",
        }),
      ]);

      const nextLists = {
        followers: Array.isArray(existingLists?.followers) ? existingLists.followers : [],
        following: Array.isArray(existingLists?.following) ? existingLists.following : [],
      };
      const handleListResult = (result, listType) => {
        if (result?.error) {
          if (isPublicMemberFollowMembersUnavailableError(result.error)) {
            appState.publicMemberFollowListsUnavailable = true;
            console.warn("Public member follow members function unavailable.", {
              reason,
              memberId: normalizedId,
              listType,
              error: result.error,
            });
          } else {
            console.error("Failed to load public member follow list", {
              reason,
              memberId: normalizedId,
              listType,
              error: result.error,
            });
          }
          return;
        }

        nextLists[listType] = (result?.data || [])
          .map(normalizePublicMemberFollowListRow)
          .filter((row) => row?.memberId);
      };

      handleListResult(followersResult, "followers");
      handleListResult(followingResult, "following");

      appState.publicMemberFollowLists[normalizedId] = nextLists;

      const discoveredProfiles = [...nextLists.followers, ...nextLists.following];
      discoveredProfiles.forEach((row) => {
        const existingProfile = appState.publicMemberProfiles[row.memberId] || buildDerivedPublicMemberProfile(row.memberId) || {};
        appState.publicMemberProfiles[row.memberId] = {
          ...existingProfile,
          id: row.memberId,
          displayName: row.displayName || existingProfile.displayName || "Community member",
          avatarUrl: row.avatarUrl || existingProfile.avatarUrl || "",
          joinedAt: row.joinedAt || existingProfile.joinedAt || "",
        };
      });

      return nextLists;
    } finally {
      delete appState.publicMemberFollowListsRefreshPromises[normalizedId];
    }
  })();

  appState.publicMemberFollowListsRefreshPromises[normalizedId] = refreshPromise;
  return refreshPromise;
}

async function refreshPublicMemberFollowLists(memberId = "", options = {}) {
  const normalizedId = String(memberId || "").trim();
  if (!normalizedId) {
    return {
      followers: [],
      following: [],
    };
  }

  const lists = await loadPublicMemberFollowLists(normalizedId, options);
  if (getActivePublicMemberProfileRouteId() === normalizedId) {
    renderPublicMemberProfile(normalizedId);
  }
  const openModalContext = getOpenPublicMemberConnectionsModalContext();
  if (openModalContext?.memberId === normalizedId) {
    renderPublicMemberConnectionsModal(normalizedId, openModalContext.listType);
  }
  return lists;
}

async function loadPublicMemberFollowState(memberId = "", options = {}) {
  const normalizedId = String(memberId || "").trim();
  if (!normalizedId || !appState.user?.id || isViewingOwnPublicMemberProfile(normalizedId)) {
    return false;
  }

  const { force = false, reason = "unspecified" } = options;
  if (!force && hasPublicMemberFollowState(normalizedId)) {
    return Boolean(appState.publicMemberFollowStates[normalizedId]);
  }

  if (!appState.supabase || appState.publicMemberFollowsTableUnavailable) {
    return hasPublicMemberFollowState(normalizedId)
      ? Boolean(appState.publicMemberFollowStates[normalizedId])
      : false;
  }

  if (!force && appState.publicMemberFollowStateRefreshPromises[normalizedId]) {
    return appState.publicMemberFollowStateRefreshPromises[normalizedId];
  }

  const refreshPromise = (async () => {
    try {
      const { data, error } = await appState.supabase
        .from(GROW_FOLLOWS_TABLE)
        .select("id")
        .eq("follower_id", appState.user.id)
        .eq("following_id", normalizedId)
        .maybeSingle();

      if (error) {
        if (isGrowFollowsTableUnavailableError(error)) {
          appState.publicMemberFollowsTableUnavailable = true;
          console.warn("Grow follows table unavailable.", {
            reason,
            memberId: normalizedId,
            error,
          });
        } else {
          console.error("Failed to load public member follow state", {
            reason,
            memberId: normalizedId,
            error,
          });
        }

        return hasPublicMemberFollowState(normalizedId)
          ? Boolean(appState.publicMemberFollowStates[normalizedId])
          : false;
      }

      const isFollowing = Boolean(String(data?.id || "").trim());
      appState.publicMemberFollowStates[normalizedId] = isFollowing;
      return isFollowing;
    } finally {
      delete appState.publicMemberFollowStateRefreshPromises[normalizedId];
    }
  })();

  appState.publicMemberFollowStateRefreshPromises[normalizedId] = refreshPromise;
  return refreshPromise;
}

async function refreshPublicMemberFollowState(memberId = "", options = {}) {
  const normalizedId = String(memberId || "").trim();
  if (!normalizedId || !appState.user?.id || isViewingOwnPublicMemberProfile(normalizedId)) {
    return false;
  }

  const isFollowing = await loadPublicMemberFollowState(normalizedId, options);
  if (getActivePublicMemberProfileRouteId() === normalizedId) {
    renderPublicMemberProfile(normalizedId);
  }
  rerenderOpenPublicMemberConnectionsModal();
  return isFollowing;
}

async function loadGrowNetworkFollowing(reason = "unspecified") {
  if (!appState.user?.id) {
    appState.growNetworkFollowing = [];
    appState.growNetworkFollowingLoaded = true;
    appState.growNetworkFollowingError = "";
    appState.publicMemberFollowStates = {};
    return [];
  }

  if (isMockDataEnabled()) {
    const mockFollowing = buildMockGrowNetworkFollowingEntries();
    appState.growNetworkFollowing = mockFollowing;
    appState.growNetworkFollowingLoaded = true;
    appState.growNetworkFollowingError = "";
    return mockFollowing;
  }

  if (!appState.supabase) {
    appState.growNetworkFollowing = [];
    appState.growNetworkFollowingLoaded = true;
    appState.growNetworkFollowingError = "";
    return [];
  }

  const { data, error } = await appState.supabase
    .from(GROW_FOLLOWS_TABLE)
    .select("following_id,created_at")
    .eq("follower_id", appState.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    if (isGrowFollowsTableUnavailableError(error)) {
      appState.publicMemberFollowsTableUnavailable = true;
    }
    console.warn("Grow Network follows unavailable; showing friendly empty state.", {
      reason,
      error,
    });
    appState.growNetworkFollowing = [];
    appState.growNetworkFollowingLoaded = true;
    appState.growNetworkFollowingError = "";
    return [];
  }

  const following = (data || [])
    .map(normalizeGrowNetworkFollowingRow)
    .filter((entry) => entry?.memberId);
  if (!following.length) {
    appState.growNetworkFollowing = [];
    appState.growNetworkFollowingLoaded = true;
    appState.growNetworkFollowingError = "";
    return [];
  }

  appState.growNetworkFollowing = following;
  appState.growNetworkFollowingLoaded = true;
  appState.growNetworkFollowingError = "";
  const followedIdSet = new Set(following.map((entry) => entry.memberId));
  Object.keys(appState.publicMemberFollowStates || {}).forEach((memberId) => {
    appState.publicMemberFollowStates[memberId] = followedIdSet.has(memberId);
  });
  followedIdSet.forEach((memberId) => {
    appState.publicMemberFollowStates[memberId] = true;
  });

  const followedIds = following.map((entry) => entry.memberId);
  await Promise.allSettled([
    loadPublicMemberProfilesByIds(followedIds, { force: true, reason: `${reason}:profiles` }),
    loadPublicMemberFollowSummariesByIds(followedIds, { force: true, reason: `${reason}:summaries` }),
  ]);

  return following;
}

async function refreshGrowNetworkFollowing(options = {}) {
  const { force = false, reason = "unspecified" } = options;
  if (!appState.user?.id) {
    appState.growNetworkFollowing = [];
    appState.growNetworkFollowingLoaded = true;
    appState.growNetworkFollowingError = "";
    return [];
  }

  if (!force && appState.growNetworkFollowingLoaded && !appState.growNetworkFollowingRefreshPromise) {
    return appState.growNetworkFollowing;
  }

  if (!force && appState.growNetworkFollowingRefreshPromise) {
    return appState.growNetworkFollowingRefreshPromise;
  }

  const refreshPromise = loadGrowNetworkFollowing(reason);
  appState.growNetworkFollowingRefreshPromise = refreshPromise;
  try {
    const following = await refreshPromise;
    await refreshGrowNetworkActivity({
      force: true,
      reason: `${reason}:activity`,
    });
    if (normalizeNavigationHash(window.location.hash || "#home") === "#network") {
      renderGrowNetworkPage();
    }
    rerenderOpenPublicMemberConnectionsModal();
    return following;
  } finally {
    appState.growNetworkFollowingRefreshPromise = null;
  }
}

function getGrowNetworkFollowingEntries() {
  return appState.growNetworkFollowing || [];
}

function normalizeCommunityActivityMetadata(metadata) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return {};
  }

  return {
    germinationRate: Math.max(0, Number(metadata.germinationRate) || 0),
    germinationRateLabel: String(metadata.germinationRateLabel || "").trim(),
    sourceLabel: String(metadata.sourceLabel || "").trim(),
    sessionDateLabel: String(metadata.sessionDateLabel || "").trim(),
    systemLabel: String(metadata.systemLabel || "").trim(),
    activityTypeLabel: String(metadata.activityTypeLabel || "").trim(),
  };
}

function normalizeCommunityActivityRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: String(row.id || "").trim(),
    userId: String(row.user_id || row.userId || "").trim(),
    activityType: String(row.activity_type || row.activityType || "").trim(),
    sessionId: String(row.session_id || row.sessionId || "").trim(),
    snapshotId: String(row.snapshot_id || row.snapshotId || "").trim(),
    title: String(row.title || "").trim() || "Grow activity",
    summary: String(row.summary || "").trim(),
    metadata: normalizeCommunityActivityMetadata(row.metadata),
    visibility: String(row.visibility || "").trim() || "public",
    createdAt: row.created_at || row.createdAt || "",
  };
}

function isCommunityActivityTableUnavailableError(error) {
  const message = String(error?.message || error?.details || "").toLowerCase();
  return message.includes("community_activity") && (
    message.includes("relation")
    || message.includes("permission denied")
    || message.includes("schema cache")
    || message.includes("column")
    || message.includes("function")
  );
}

function getCommunityActivityTypeDetails(activityType = "") {
  switch (String(activityType || "").trim()) {
    case "snapshot_posted":
    case "snapshot_approved":
      return {
        activityType: "approved-snapshot",
        typeLabel: "New approved Community Grow snapshot",
        typeMeta: "Approved in Community Grow",
      };
    case "public_session_shared":
      return {
        activityType: "shared-session",
        typeLabel: "Public session shared",
        typeMeta: "Public session now visible",
      };
    case "public_session_completed":
      return {
        activityType: "completed-session",
        typeLabel: "Completed public session",
        typeMeta: "Approved in Community Grow",
      };
    default:
      return {
        activityType: "approved-snapshot",
        typeLabel: "Public grow activity",
        typeMeta: "",
      };
  }
}

function getGrowNetworkActivityEntries() {
  return appState.growNetworkActivity || [];
}

function buildCommunityActivityFeedEntry(activity) {
  const normalizedActivity = normalizeCommunityActivityRow(activity);
  if (!normalizedActivity?.id || !normalizedActivity.userId || normalizedActivity.visibility !== "public") {
    return null;
  }

  const profile = getPublicMemberProfile(normalizedActivity.userId);
  const typeDetails = getCommunityActivityTypeDetails(normalizedActivity.activityType);
  const displayName = profile?.displayName || "Community member";
  const avatarUrl = profile?.avatarUrl || "";
  const metadata = normalizedActivity.metadata || {};
  const fallbackRateLabel = `${Math.max(0, Number(metadata.germinationRate) || 0)}%`;

  return {
    id: normalizedActivity.id,
    activityType: typeDetails.activityType,
    typeLabel: metadata.activityTypeLabel || typeDetails.typeLabel,
    typeMeta: typeDetails.typeMeta,
    title: normalizedActivity.title || "Grow activity",
    summary: normalizedActivity.summary || "",
    successPercent: Math.max(0, Number(metadata.germinationRate) || 0),
    occurredAt: normalizedActivity.createdAt || "",
    memberId: normalizedActivity.userId,
    displayName,
    avatarUrl,
    profileRoute: getPublicMemberProfileRoute(normalizedActivity.userId),
    sessionRoute: normalizedActivity.snapshotId ? `#sessions/public/${normalizedActivity.snapshotId}` : "#gallery",
    sessionDateLabel: metadata.sessionDateLabel || "",
    sourceLabel: metadata.sourceLabel || "",
    germinationRateLabel: metadata.germinationRateLabel || fallbackRateLabel,
    systemLabel: metadata.systemLabel || "",
  };
}

function normalizeCommunityActivityType(activityType = "") {
  const normalizedType = String(activityType || "").trim().toLowerCase();
  return [
    "snapshot_posted",
    "snapshot_approved",
    "public_session_shared",
    "public_session_completed",
  ].includes(normalizedType)
    ? normalizedType
    : "snapshot_approved";
}

async function loadCommunityActivitySessionContext(sessionId = "") {
  const normalizedSessionId = String(sessionId || "").trim();
  if (!normalizedSessionId) {
    return null;
  }

  const existingSession = getSessions().find((entry) => entry.id === normalizedSessionId);
  if (existingSession) {
    return {
      id: existingSession.id,
      sessionStatus: existingSession.sessionStatus || "",
      completedAt: existingSession.completedAt || "",
      sessionName: existingSession.sessionName || "",
      date: existingSession.date || "",
      time: existingSession.time || "",
    };
  }

  if (!appState.supabase) {
    return null;
  }

  const { data, error } = await appState.supabase
    .from("grow_sessions")
    .select("id,session_status,completed_at,session_name,date,time")
    .eq("id", normalizedSessionId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load session context for community activity", {
      sessionId: normalizedSessionId,
      error,
    });
    return null;
  }

  return data
    ? {
      id: data.id,
      sessionStatus: data.session_status || "",
      completedAt: data.completed_at || "",
      sessionName: data.session_name || "",
      date: data.date || "",
      time: data.time || "",
    }
    : null;
}

async function loadApprovedGallerySnapshotForSession(sessionId = "") {
  const normalizedSessionId = String(sessionId || "").trim();
  if (!normalizedSessionId) {
    return null;
  }

  const existingSnapshot = getGallerySnapshotForSession(normalizedSessionId);
  if (existingSnapshot && getGallerySnapshotDisplayStatus(existingSnapshot) === "approved") {
    return existingSnapshot;
  }

  if (!appState.supabase) {
    return null;
  }

  const { data, error } = await appState.supabase
    .from("grow_gallery_snapshots")
    .select("*")
    .eq("session_id", normalizedSessionId)
    .eq("status", "approved")
    .maybeSingle();

  if (error) {
    console.error("Failed to load approved gallery snapshot for session", {
      sessionId: normalizedSessionId,
      error,
    });
    return null;
  }

  return mapRowToGallerySnapshot(data);
}

function buildCommunityActivityPayloads(snapshot, sessionContext = null) {
  const normalizedSnapshot = snapshot && getGallerySnapshotDisplayStatus(snapshot) === "approved"
    ? snapshot
    : null;
  if (!normalizedSnapshot?.id || !normalizedSnapshot.userId) {
    return [];
  }

  const safeTitle = String(normalizedSnapshot.title || sessionContext?.sessionName || "Grow Snapshot").trim() || "Grow Snapshot";
  const safeDateLabel = getGallerySnapshotSubmittedDateLabel({
    publishedAt: normalizedSnapshot.publishedAt || "",
    createdAt: normalizedSnapshot.createdAt || "",
  });
  const safeSourceLabel = normalizeLeaderboardLabel(normalizedSnapshot.sourceName || "") || "Not shared";
  const safeRate = Math.max(0, Number(normalizedSnapshot.successPercent) || 0);
  const metadata = {
    activityTypeLabel: "",
    germinationRate: safeRate,
    germinationRateLabel: `${safeRate}%`,
    sourceLabel: safeSourceLabel,
    sessionDateLabel: safeDateLabel,
    systemLabel: formatSnapshotSystemLabel(normalizedSnapshot.systemType || "KAN"),
  };
  const payloads = [
    {
      userId: normalizedSnapshot.userId,
      activityType: "snapshot_approved",
      sessionId: String(normalizedSnapshot.sessionId || "").trim(),
      snapshotId: String(normalizedSnapshot.id || "").trim(),
      title: safeTitle,
      summary: "Approved public Community Grow snapshot.",
      metadata: {
        ...metadata,
        activityTypeLabel: "New approved Community Grow snapshot",
      },
    },
    {
      userId: normalizedSnapshot.userId,
      activityType: "public_session_shared",
      sessionId: String(normalizedSnapshot.sessionId || "").trim(),
      snapshotId: String(normalizedSnapshot.id || "").trim(),
      title: safeTitle,
      summary: "Public grow session shared.",
      metadata: {
        ...metadata,
        activityTypeLabel: "Public session shared",
      },
    },
  ];

  if (normalizeSessionStatus(sessionContext?.sessionStatus || "") === "completed") {
    payloads.push({
      userId: normalizedSnapshot.userId,
      activityType: "public_session_completed",
      sessionId: String(normalizedSnapshot.sessionId || "").trim(),
      snapshotId: String(normalizedSnapshot.id || "").trim(),
      title: safeTitle,
      summary: "Completed public grow session.",
      metadata: {
        ...metadata,
        activityTypeLabel: "Completed public session",
      },
    });
  }

  return payloads;
}

async function recordCommunityActivity(payload = {}) {
  if (!appState.supabase) {
    return null;
  }

  const normalizedUserId = String(payload.userId || "").trim();
  const normalizedType = normalizeCommunityActivityType(payload.activityType || "");
  if (!normalizedUserId || !normalizedType) {
    return null;
  }

  const { data, error } = await appState.supabase.rpc("record_community_activity", {
    activity_user_id: normalizedUserId,
    activity_type: normalizedType,
    activity_session_id: String(payload.sessionId || "").trim(),
    activity_snapshot_id: String(payload.snapshotId || "").trim(),
    activity_title: String(payload.title || "").trim(),
    activity_summary: String(payload.summary || "").trim(),
    activity_metadata: payload.metadata && typeof payload.metadata === "object" && !Array.isArray(payload.metadata)
      ? payload.metadata
      : {},
    activity_visibility: "public",
  });

  if (error) {
    if (isCommunityActivityTableUnavailableError(error)) {
      appState.communityActivityTableUnavailable = true;
      console.warn("Community activity table unavailable.", {
        payload,
        error,
      });
      return null;
    }

    console.error("Failed to record community activity", {
      payload,
      error,
    });
    return null;
  }

  return String(data || "").trim() || null;
}

async function clearCommunityActivityForSnapshot(snapshotId = "") {
  const normalizedSnapshotId = String(snapshotId || "").trim();
  if (!normalizedSnapshotId || !appState.supabase || appState.communityActivityTableUnavailable) {
    return 0;
  }

  const { data, error } = await appState.supabase.rpc("clear_community_activity_for_snapshot", {
    activity_snapshot_id: normalizedSnapshotId,
  });

  if (error) {
    if (isCommunityActivityTableUnavailableError(error)) {
      appState.communityActivityTableUnavailable = true;
      console.warn("Community activity cleanup function unavailable.", {
        snapshotId: normalizedSnapshotId,
        error,
      });
      return 0;
    }

    console.error("Failed to clear community activity for snapshot", {
      snapshotId: normalizedSnapshotId,
      error,
    });
    return 0;
  }

  if (normalizeNavigationHash(window.location.hash || "#home") === "#network") {
    void refreshGrowNetworkActivity({ force: true, reason: "community-activity:clear-snapshot" });
  }
  return Math.max(0, Number(data) || 0);
}

async function syncCommunityActivityForApprovedSnapshot(snapshot, options = {}) {
  const normalizedSnapshot = snapshot && getGallerySnapshotDisplayStatus(snapshot) === "approved"
    ? snapshot
    : null;
  if (!normalizedSnapshot?.id || !normalizedSnapshot.userId || appState.communityActivityTableUnavailable) {
    return [];
  }

  const sessionContext = options.sessionContext || await loadCommunityActivitySessionContext(normalizedSnapshot.sessionId || "");
  const payloads = buildCommunityActivityPayloads(normalizedSnapshot, sessionContext);
  const results = await Promise.all(payloads.map((payload) => recordCommunityActivity(payload)));
  if (normalizeNavigationHash(window.location.hash || "#home") === "#network") {
    void refreshGrowNetworkActivity({ force: true, reason: "community-activity:approved-snapshot" });
  }
  return results.filter(Boolean);
}

async function syncCommunityActivityForCompletedSession(session, options = {}) {
  const normalizedSessionId = String(session?.id || "").trim();
  if (!normalizedSessionId || appState.communityActivityTableUnavailable) {
    return null;
  }

  const sessionStatus = normalizeSessionStatus(session?.sessionStatus || "");
  if (sessionStatus !== "completed") {
    return null;
  }

  const approvedSnapshot = options.snapshot || await loadApprovedGallerySnapshotForSession(normalizedSessionId);
  if (!approvedSnapshot?.id || getGallerySnapshotDisplayStatus(approvedSnapshot) !== "approved") {
    return null;
  }

  const [payload] = buildCommunityActivityPayloads(approvedSnapshot, session).filter((entry) => entry.activityType === "public_session_completed");
  if (!payload) {
    return null;
  }

  const result = await recordCommunityActivity(payload);
  if (normalizeNavigationHash(window.location.hash || "#home") === "#network") {
    void refreshGrowNetworkActivity({ force: true, reason: "community-activity:completed-session" });
  }
  return result;
}

async function loadGrowNetworkActivity(reason = "unspecified") {
  if (isMockDataEnabled()) {
    const mockActivities = buildMockGrowNetworkActivityEntries();
    appState.growNetworkActivity = mockActivities;
    appState.growNetworkActivityLoaded = true;
    appState.growNetworkActivityError = "";
    return mockActivities;
  }

  const followedIds = getGrowNetworkFollowingEntries().map((entry) => String(entry?.memberId || "").trim()).filter(Boolean);
  if (!followedIds.length) {
    appState.growNetworkActivity = [];
    appState.growNetworkActivityLoaded = true;
    appState.growNetworkActivityError = "";
    return [];
  }

  if (!appState.supabase) {
    appState.growNetworkActivity = [];
    appState.growNetworkActivityLoaded = true;
    appState.growNetworkActivityError = "";
    return [];
  }

  const { data, error } = await appState.supabase
    .from(COMMUNITY_ACTIVITY_TABLE)
    .select("*")
    .eq("visibility", "public")
    .in("user_id", followedIds)
    .order("created_at", { ascending: false });

  if (error) {
    if (isCommunityActivityTableUnavailableError(error)) {
      appState.communityActivityTableUnavailable = true;
    }
    console.warn("Failed to load community activity feed; showing friendly empty state.", {
      reason,
      followedIds,
      error,
    });
    appState.growNetworkActivity = [];
    appState.growNetworkActivityLoaded = true;
    appState.growNetworkActivityError = "";
    return [];
  }

  const activities = (data || [])
    .map(buildCommunityActivityFeedEntry)
    .filter(Boolean)
    .sort((left, right) => new Date(right.occurredAt || 0).getTime() - new Date(left.occurredAt || 0).getTime());
  appState.growNetworkActivity = activities;
  appState.growNetworkActivityLoaded = true;
  appState.growNetworkActivityError = "";

  await loadPublicMemberProfilesByIds(activities.map((activity) => activity.memberId), {
    force: true,
    reason: `${reason}:activity-profiles`,
  });
  appState.growNetworkActivity = activities.map((activity) => {
    const profile = getPublicMemberProfile(activity.memberId);
    return {
      ...activity,
      displayName: profile?.displayName || activity.displayName,
      avatarUrl: profile?.avatarUrl || activity.avatarUrl,
    };
  });
  return appState.growNetworkActivity;
}

async function refreshGrowNetworkActivity(options = {}) {
  const { force = false, reason = "unspecified" } = options;
  if (!appState.user?.id) {
    appState.growNetworkActivity = [];
    appState.growNetworkActivityLoaded = true;
    appState.growNetworkActivityError = "";
    return [];
  }

  if (!force && appState.growNetworkActivityLoaded && !appState.growNetworkActivityRefreshPromise) {
    return appState.growNetworkActivity;
  }

  if (!force && appState.growNetworkActivityRefreshPromise) {
    return appState.growNetworkActivityRefreshPromise;
  }

  const refreshPromise = loadGrowNetworkActivity(reason);
  appState.growNetworkActivityRefreshPromise = refreshPromise;
  try {
    const activity = await refreshPromise;
    if (normalizeNavigationHash(window.location.hash || "#home") === "#network") {
      renderGrowNetworkPage();
    }
    return activity;
  } finally {
    appState.growNetworkActivityRefreshPromise = null;
  }
}

async function togglePublicMemberFollow(memberId = "") {
  const normalizedId = String(memberId || "").trim();
  if (!normalizedId) {
    throw new Error("Could not find this community member.");
  }
  if (!appState.supabase) {
    throw new Error("Sign in to follow community members.");
  }
  const authUser = await getAuthenticatedSupabaseUser("Sign in to follow community members.");
  if (isViewingOwnPublicMemberProfile(normalizedId)) {
    throw new Error("You cannot follow your own profile.");
  }
  if (isPublicMemberFollowPending(normalizedId)) {
    return false;
  }

  const rerenderActivePublicMemberProfile = () => {
    const activeProfileRouteId = getActivePublicMemberProfileRouteId();
    if (activeProfileRouteId) {
      renderPublicMemberProfile(activeProfileRouteId);
    }
    rerenderOpenPublicMemberConnectionsModal();
  };
  appState.publicMemberFollowPendingActions[normalizedId] = true;
  rerenderActivePublicMemberProfile();

  try {
    const isFollowing = await loadPublicMemberFollowState(normalizedId, {
      force: true,
      reason: "follow-toggle:preflight",
    });

    if (isFollowing) {
      const { error } = await appState.supabase
        .from(GROW_FOLLOWS_TABLE)
        .delete()
        .eq("follower_id", authUser.id)
        .eq("following_id", normalizedId);

      if (error) {
        throw new Error("Could not unfollow this member right now.");
      }
    } else {
      const { error } = await appState.supabase
        .from(GROW_FOLLOWS_TABLE)
        .upsert(
          {
            follower_id: authUser.id,
            following_id: normalizedId,
          },
          {
            onConflict: "follower_id,following_id",
            ignoreDuplicates: true,
          },
        );

      if (error) {
        throw new Error("Could not follow this member right now.");
      }
    }

    await Promise.all([
      refreshPublicMemberFollowState(normalizedId, {
        force: true,
        reason: "follow-toggle:state",
      }),
      refreshPublicMemberFollowSummary(normalizedId, {
        force: true,
        reason: "follow-toggle:target-summary",
      }),
      refreshPublicMemberFollowSummary(authUser.id, {
        force: true,
        reason: "follow-toggle:viewer-summary",
      }),
      refreshGrowNetworkFollowing({
        force: true,
        reason: "follow-toggle:grow-network",
      }),
    ]);

    return !isFollowing;
  } finally {
    delete appState.publicMemberFollowPendingActions[normalizedId];
    rerenderActivePublicMemberProfile();
  }
}

function hasCompletedProfile(profile = appState.profile) {
  return Boolean(String(profile?.username || "").trim());
}

function getSignedInMemberFirstName() {
  const profileName = String(appState.profile?.username || "").trim();
  if (profileName) {
    return profileName.split(/\s+/).filter(Boolean)[0] || "";
  }

  const metadataFirstName = String(
    appState.user?.user_metadata?.first_name
    || appState.user?.user_metadata?.full_name
    || appState.user?.user_metadata?.name
    || "",
  ).trim();
  if (metadataFirstName) {
    return metadataFirstName.split(/\s+/).filter(Boolean)[0] || "";
  }

  const email = String(appState.user?.email || "").trim();
  if (!email.includes("@")) {
    return "";
  }

  return email.split("@")[0].trim();
}

function getGrowSessionsSectionTitle() {
  if (!appState.user) {
    return "Grow Sessions";
  }

  const firstName = getSignedInMemberFirstName();
  return firstName ? `${firstName}'s Grow Sessions` : "Grow Sessions";
}

function getProfileDisplayName() {
  return appState.profile?.username || appState.user?.email || "Signed in";
}

function getProfileAvatarFallbackLabel() {
  return getPublicMemberInitialsLabel(getProfileDisplayName());
}

function renderProfileAvatarMarkup({
  avatarUrl = "",
  displayName = getProfileDisplayName(),
  className = "profile-page-avatar",
  fallbackClassName = "profile-page-avatar is-fallback",
} = {}) {
  const normalizedDisplayName = String(displayName || "").trim() || "Member";
  const fallbackMarkup = `<span class="${escapeHtml(fallbackClassName)}" aria-hidden="true">${escapeHtml(getPublicMemberInitialsLabel(normalizedDisplayName))}</span>`;
  if (avatarUrl) {
    return `<img src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(normalizedDisplayName)}" class="${escapeHtml(className)}" data-fallback-html="${escapeHtml(fallbackMarkup)}" onerror="this.onerror=null; this.outerHTML=this.dataset.fallbackHtml;">`;
  }
  return fallbackMarkup;
}

function normalizeProfilePageSettings(settings = {}) {
  return {
    notifyCommunityActivity: settings.notifyCommunityActivity === true,
    showProfileInCommunityGrow: settings.showProfileInCommunityGrow !== false,
    allowFollowers: settings.allowFollowers !== false,
    showGrowStatsPublicly: settings.showGrowStatsPublicly !== false,
  };
}

function getProfilePageSettingsStorageKey(userId = "") {
  const normalizedUserId = String(userId || "").trim();
  return normalizedUserId
    ? `${PROFILE_PAGE_SETTINGS_STORAGE_KEY}:${normalizedUserId}`
    : PROFILE_PAGE_SETTINGS_STORAGE_KEY;
}

function loadStoredProfilePageSettings(userId = "") {
  const normalizedUserId = String(userId || "").trim();
  if (!normalizedUserId) {
    return { ...DEFAULT_PROFILE_PAGE_SETTINGS };
  }

  try {
    const storedValue = localStorage.getItem(getProfilePageSettingsStorageKey(normalizedUserId));
    return normalizeProfilePageSettings(JSON.parse(storedValue || "null") || DEFAULT_PROFILE_PAGE_SETTINGS);
  } catch (error) {
    console.warn("[Profile Settings] Failed to read local profile page settings.", error);
    return { ...DEFAULT_PROFILE_PAGE_SETTINGS };
  }
}

function getCurrentProfilePageSettings() {
  const currentUserId = String(appState.user?.id || "").trim();
  if (!currentUserId) {
    return { ...DEFAULT_PROFILE_PAGE_SETTINGS };
  }

  if (!appState.profilePageSettings || appState.profilePageSettingsUserId !== currentUserId) {
    appState.profilePageSettings = loadStoredProfilePageSettings(currentUserId);
    appState.profilePageSettingsUserId = currentUserId;
  }

  return normalizeProfilePageSettings(appState.profilePageSettings);
}

function saveStoredProfilePageSettings(userId = "", settings = {}) {
  const normalizedUserId = String(userId || "").trim();
  if (!normalizedUserId) {
    throw new Error("You must be signed in to save profile settings.");
  }

  const normalizedSettings = normalizeProfilePageSettings(settings);
  try {
    localStorage.setItem(
      getProfilePageSettingsStorageKey(normalizedUserId),
      JSON.stringify(normalizedSettings),
    );
  } catch (error) {
    console.warn("[Profile Settings] Failed to persist local profile page settings.", error);
    throw new Error("Profile settings could not be saved in this browser.");
  }

  appState.profilePageSettings = normalizedSettings;
  appState.profilePageSettingsUserId = normalizedUserId;
  return normalizedSettings;
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
  const authUser = await getAuthenticatedSupabaseUser("Please sign in to save your session.");
  const record = mapSessionToRecord(session, authUser.id);
  const { data, error } = await appState.supabase
    .from("grow_sessions")
    .insert(record)
    .select()
    .single();

  if (error) {
    throw error;
  }

  const savedSession = mapRowToSession(data);
  savedSession.filterPaperDeducted = getSessionFilterPaperDeducted(session);
  const intendedImages = normalizePersistedSessionImages(session.sessionImages);
  if (intendedImages.length > 0 && savedSession.sessionImages.length !== intendedImages.length) {
    savedSession.sessionImages = await persistSessionImages(savedSession, intendedImages);
  }
  saveSessions([savedSession, ...getSessions().filter((item) => item.id !== savedSession.id)]);
  return savedSession;
}

async function updateCloudSession(session) {
  const authUser = await getAuthenticatedSupabaseUser("Please sign in to save your session.");
  const record = mapSessionToRecord(session, authUser.id);
  const { data: previousRow, error: previousRowError } = await appState.supabase
    .from("grow_sessions")
    .select("session_status,completed_at")
    .eq("id", session.id)
    .maybeSingle();

  if (previousRowError) {
    throw previousRowError;
  }

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
  savedSession.filterPaperDeducted = getSessionFilterPaperDeducted(session);
  saveSessions(getSessions().map((item) => (item.id === savedSession.id ? savedSession : item)));
  if (normalizeSessionStatus(previousRow?.session_status || "") !== "completed"
    && normalizeSessionStatus(savedSession.sessionStatus || "") === "completed") {
    void syncCommunityActivityForCompletedSession(savedSession);
  }
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
  savedSession.filterPaperDeducted = getSessionFilterPaperDeducted({ id: sessionId });
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
  setSessionFilterPaperDeducted({ id: sessionId }, false);
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

function normalizeSourceStatus(status) {
  return String(status || "").trim().toLowerCase() === "hidden" ? "hidden" : "active";
}

function isSourcesTableMissingError(error) {
  return isSupabaseTableMissingError(error, SOURCES_TABLE);
}

function markSourcesTableUnavailable() {
  appState.sourcesTableUnavailable = true;
  appState.sourcesError = "Source management data store is missing. Run the latest schema setup.";
  logRuntimeIssueOnce(
    "warn",
    "sources-table-unavailable",
    "Source loading disabled because the Supabase table is missing.",
    { table: SOURCES_TABLE },
  );
}

function isGallerySnapshotLikesTableMissingError(error) {
  return isSupabaseTableMissingError(error, [GROW_GALLERY_LIKES_TABLE, LEGACY_GROW_GALLERY_LIKES_TABLE]);
}

function markGallerySnapshotLikesTableUnavailable() {
  appState.gallerySnapshotLikesTableUnavailable = true;
  logRuntimeIssueOnce(
    "warn",
    "gallery-snapshot-likes-table-unavailable",
    "Community Grow likes disabled because the Supabase table is missing.",
    { table: GROW_GALLERY_LIKES_TABLE },
  );
}

function normalizeSourceWebsiteUrl(value) {
  const rawValue = String(value || "").trim();
  if (!rawValue) {
    return "";
  }

  if (/^https?:\/\//i.test(rawValue)) {
    return rawValue;
  }

  return `https://${rawValue}`;
}

function mapRowToSource(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: normalizeLeaderboardLabel(row.name),
    logoUrl: String(row.logo_url || "").trim(),
    logoPath: String(row.logo_path || "").trim(),
    websiteUrl: normalizeSourceWebsiteUrl(row.website_url || ""),
    description: String(row.description || "").trim(),
    contactName: String(row.contact_name || "").trim(),
    contactEmail: String(row.contact_email || "").trim(),
    notes: String(row.notes || "").trim(),
    status: normalizeSourceStatus(row.status),
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}

function getSourceErrorMessage(error, fallbackMessage) {
  const normalizedMessage = String(
    error?.message
    || error?.error_description
    || error?.details
    || "",
  ).trim().toLowerCase();

  if (normalizedMessage.includes("bucket") && normalizedMessage.includes("not found")) {
    return "Source logo storage is missing or not configured.";
  }
  if (normalizedMessage.includes("duplicate key") || normalizedMessage.includes("sources_name_lower_idx")) {
    return "A source with this name already exists.";
  }
  if (normalizedMessage.includes("row-level security") || normalizedMessage.includes("permission denied")) {
    return "You do not have permission to manage sources.";
  }
  if (isSourcesTableMissingError(error)) {
    return "Source management data store is missing. Run the latest schema setup.";
  }
  if (normalizedMessage.includes("column") && normalizedMessage.includes("sources")) {
    return "Source management schema is out of date. Apply the latest database schema.";
  }

  return fallbackMessage;
}

async function loadSources(reason = "unspecified") {
  if (!appState.supabase || appState.sourcesTableUnavailable) {
    return [];
  }

  const { data, error } = await appState.supabase
    .from(SOURCES_TABLE)
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    if (isSourcesTableMissingError(error)) {
      markSourcesTableUnavailable();
      return [];
    }
    logRuntimeIssueOnce("error", "sources-load-failed", "Failed to load sources", { reason, error });
    appState.sourcesError = getSourceErrorMessage(error, "Could not load sources.");
    return [];
  }

  appState.sourcesError = "";
  return (data || [])
    .map(mapRowToSource)
    .filter(Boolean)
    .sort((left, right) => left.name.localeCompare(right.name, "en", { sensitivity: "base" }));
}

async function refreshSources(options = {}) {
  const { force = false, reason = "refresh" } = options;

  if (!appState.supabase || appState.sourcesTableUnavailable) {
    appState.sources = [];
    appState.sourcesLoaded = true;
    if (!appState.sourcesTableUnavailable) {
      appState.sourcesError = "";
    }
    ensureSourceCatalogDatalist();
    return [];
  }

  if (!force && appState.sourcesLoaded && !appState.sourcesRefreshPromise) {
    return appState.sources;
  }

  if (!force && appState.sourcesRefreshPromise) {
    return appState.sourcesRefreshPromise;
  }

  const refreshPromise = (async () => {
    const sources = await loadSources(reason);
    appState.sources = sources;
    appState.sourcesLoaded = true;
    ensureSourceCatalogDatalist();
    return sources;
  })();

  appState.sourcesRefreshPromise = refreshPromise;

  try {
    return await refreshPromise;
  } finally {
    appState.sourcesRefreshPromise = null;
  }
}

function getSourceCatalogRecords(options = {}) {
  const { includeHidden = false } = options;
  return (appState.sources || []).filter((source) => (
    includeHidden || normalizeSourceStatus(source?.status) === "active"
  ));
}

function findSourceById(sourceId, options = {}) {
  const normalizedId = String(sourceId || "").trim();
  if (!normalizedId) {
    return null;
  }

  return getSourceCatalogRecords(options).find((source) => source.id === normalizedId) || null;
}

function findSourceByName(name, options = {}) {
  const normalizedKey = normalizeLeaderboardKey(name);
  if (!normalizedKey) {
    return null;
  }

  return getSourceCatalogRecords(options).find((source) => normalizeLeaderboardKey(source.name) === normalizedKey) || null;
}

function getManagedSourceRecordForSnapshot(snapshot, options = {}) {
  const { includeHidden = false } = options;
  const sourceId = String(snapshot?.sourceId || "").trim();
  if (sourceId) {
    return findSourceById(sourceId, { includeHidden });
  }

  return findSourceByName(snapshot?.sourceName || "", { includeHidden });
}

function getSourceDisplayMetadata(snapshotOrSource = null, options = {}) {
  const { includeHidden = false } = options;
  if (!snapshotOrSource) {
    return {
      name: "",
      logoUrl: "",
      websiteUrl: "",
      description: "",
      isManaged: false,
    };
  }

  const sourceRecord = typeof snapshotOrSource === "string"
    ? findSourceByName(snapshotOrSource, { includeHidden })
    : getManagedSourceRecordForSnapshot(snapshotOrSource, { includeHidden });
  const fallbackName = typeof snapshotOrSource === "string"
    ? normalizeLeaderboardLabel(snapshotOrSource)
    : normalizeLeaderboardLabel(snapshotOrSource?.sourceName || "");
  const fallbackLogoUrl = typeof snapshotOrSource === "string"
    ? ""
    : String(snapshotOrSource?.sourceLogoUrl || "").trim();
  const hasSourceIdentity = typeof snapshotOrSource === "string"
    ? Boolean(fallbackName)
    : Boolean(String(snapshotOrSource?.sourceId || "").trim() || fallbackName);

  if (sourceRecord && normalizeSourceStatus(sourceRecord.status) === "active") {
    return {
      name: sourceRecord.name,
      logoUrl: sourceRecord.logoUrl,
      websiteUrl: sourceRecord.websiteUrl,
      description: sourceRecord.description,
      isManaged: true,
    };
  }

  return {
    name: fallbackName,
    logoUrl: hasSourceIdentity && sourceRecord ? "" : fallbackLogoUrl,
    websiteUrl: "",
    description: "",
    isManaged: Boolean(sourceRecord),
  };
}

function getPrimaryPartitionSourceDetails(partitions = []) {
  const firstPartition = (partitions || []).find((partition) => (
    normalizeLeaderboardLabel(formatPartitionSource(partition))
    || normalizeLeaderboardLabel(formatPartitionSeedVariety(partition))
  )) || partitions[0] || null;
  const sourceName = normalizeLeaderboardLabel(formatPartitionSource(firstPartition));
  const sourceRecord = findSourceByName(sourceName, { includeHidden: true });

  return {
    sourceId: String(sourceRecord?.id || "").trim(),
    sourceName: sourceRecord?.name || sourceName,
    sourceLogoUrl: normalizeSourceStatus(sourceRecord?.status) === "active"
      ? String(sourceRecord?.logoUrl || "").trim()
      : "",
    seedVarietyName: normalizeLeaderboardLabel(formatPartitionSeedVariety(firstPartition)),
  };
}

async function uploadSourceLogo(file, sourceId = "") {
  if (!appState.supabase?.storage || !appState.user || !isAdminUser()) {
    throw new Error("Source logo uploads are not available until admin storage is ready.");
  }

  const preparedImage = await prepareImageForUpload(file, MAX_SOURCE_LOGO_DIMENSION, 0.88);
  const path = `sources/${sourceId || "new"}/logo-${crypto.randomUUID()}.jpg`;
  const { error } = await appState.supabase.storage
    .from(SOURCE_LOGO_BUCKET)
    .upload(path, preparedImage.blob, {
      contentType: preparedImage.contentType,
      upsert: false,
    });

  if (error) {
    throw new Error(getSourceErrorMessage(error, "Could not upload source logo."));
  }

  const { data } = appState.supabase.storage.from(SOURCE_LOGO_BUCKET).getPublicUrl(path);
  return {
    path,
    url: data.publicUrl,
  };
}

async function removeSourceLogoFromStorage(path) {
  if (!path || !appState.supabase?.storage) {
    return;
  }

  await appState.supabase.storage.from(SOURCE_LOGO_BUCKET).remove([path]);
}

async function saveSourceRecord(sourceInput, options = {}) {
  const existingSource = options.existingSource || null;
  if (!appState.supabase || !isAdminUser()) {
    throw new Error("You must be an admin to manage sources.");
  }
  if (appState.sourcesTableUnavailable) {
    throw new Error("Source management data store is missing. Run the latest schema setup.");
  }

  let uploadedLogo = null;
  let logoUrl = String(existingSource?.logoUrl || "").trim();
  let logoPath = String(existingSource?.logoPath || "").trim();

  if (sourceInput.removeLogo) {
    logoUrl = "";
    logoPath = "";
  }

  if (sourceInput.logoFile) {
    uploadedLogo = await uploadSourceLogo(sourceInput.logoFile, existingSource?.id || "");
    logoUrl = uploadedLogo.url;
    logoPath = uploadedLogo.path;
  }

  const payload = {
    name: normalizeLeaderboardLabel(sourceInput.name),
    logo_url: logoUrl,
    logo_path: logoPath,
    website_url: normalizeSourceWebsiteUrl(sourceInput.websiteUrl),
    description: String(sourceInput.description || "").trim(),
    contact_name: String(sourceInput.contactName || "").trim(),
    contact_email: String(sourceInput.contactEmail || "").trim(),
    notes: String(sourceInput.notes || "").trim(),
    status: normalizeSourceStatus(sourceInput.status),
  };

  const query = existingSource?.id
    ? appState.supabase.from(SOURCES_TABLE).update(payload).eq("id", existingSource.id).select("*").single()
    : appState.supabase.from(SOURCES_TABLE).insert(payload).select("*").single();
  const { data, error } = await query;

  if (error) {
    if (isSourcesTableMissingError(error)) {
      markSourcesTableUnavailable();
    }
    if (uploadedLogo?.path) {
      await removeSourceLogoFromStorage(uploadedLogo.path);
    }
    throw new Error(getSourceErrorMessage(error, existingSource ? "Could not update source." : "Could not add source."));
  }

  if ((sourceInput.removeLogo || sourceInput.logoFile) && existingSource?.logoPath && existingSource.logoPath !== logoPath) {
    await removeSourceLogoFromStorage(existingSource.logoPath);
  }

  const savedSource = mapRowToSource(data);
  appState.sources = [...appState.sources.filter((source) => source.id !== savedSource.id), savedSource]
    .sort((left, right) => left.name.localeCompare(right.name, "en", { sensitivity: "base" }));
  appState.sourcesLoaded = true;
  appState.sourcesError = "";
  ensureSourceCatalogDatalist();
  return savedSource;
}

async function clearManagedSourceBrandingFromSnapshots(source) {
  if (!appState.supabase || !source) {
    return;
  }

  const sourceId = String(source.id || "").trim();
  const sourceName = normalizeLeaderboardLabel(source.name);

  if (sourceName) {
    const { error: sourceNameError } = await appState.supabase
      .from("grow_gallery_snapshots")
      .update({ source_logo_url: "" })
      .eq("source_name", sourceName);
    if (sourceNameError) {
      throw new Error(getSourceErrorMessage(sourceNameError, "Could not detach this source from existing Community Grow sessions."));
    }
  }

  appState.gallerySnapshots = appState.gallerySnapshots.map((snapshot) => {
    const matchesSourceId = sourceId && String(snapshot?.sourceId || "").trim() === sourceId;
    const matchesSourceName = sourceName && normalizeLeaderboardKey(snapshot?.sourceName || "") === normalizeLeaderboardKey(sourceName);
    if (!matchesSourceId && !matchesSourceName) {
      return snapshot;
    }

    return {
      ...snapshot,
      sourceId: "",
      sourceLogoUrl: "",
    };
  });
}

async function deleteSourceRecord(source) {
  if (!appState.supabase || !isAdminUser()) {
    throw new Error("You must be an admin to manage sources.");
  }
  if (appState.sourcesTableUnavailable) {
    throw new Error("Source management data store is missing. Run the latest schema setup.");
  }

  const { error } = await appState.supabase
    .from(SOURCES_TABLE)
    .delete()
    .eq("id", source.id);

  if (error) {
    if (isSourcesTableMissingError(error)) {
      markSourcesTableUnavailable();
    }
    throw new Error(getSourceErrorMessage(error, "Could not delete source."));
  }

  appState.sources = appState.sources.filter((entry) => entry.id !== source.id);
  appState.sourcesLoaded = true;
  appState.sourcesError = "";
  ensureSourceCatalogDatalist();

  try {
    await clearManagedSourceBrandingFromSnapshots(source);
  } catch (cleanupError) {
    if (source.logoPath) {
      await removeSourceLogoFromStorage(source.logoPath);
    }
    throw new Error("Source deleted, but existing Community Grow branding cleanup could not finish automatically.");
  }

  if (source.logoPath) {
    await removeSourceLogoFromStorage(source.logoPath);
  }
}

function normalizeAnnouncementStatus(status) {
  return String(status || "").trim().toLowerCase() === "active" ? "active" : "inactive";
}

function normalizeAnnouncementButtonText(value) {
  const trimmedValue = String(value || "").trim();
  return trimmedValue || DEFAULT_ANNOUNCEMENT_BUTTON_TEXT;
}

function normalizeExternalUrl(value) {
  const rawValue = String(value || "").trim();
  if (!rawValue) {
    return "";
  }

  if (/^https?:\/\//i.test(rawValue)) {
    return rawValue;
  }

  return `https://${rawValue}`;
}

function normalizeMediaUrl(value) {
  const rawValue = String(value || "").trim();
  if (!rawValue) {
    return "";
  }

  if (/^(https?:\/\/|\/\/|\/|\.\.?\/|data:|blob:)/i.test(rawValue)) {
    return rawValue;
  }

  return `https://${rawValue}`;
}

function isDataUrl(value) {
  return /^data:/i.test(String(value || "").trim());
}

function getMessageBoardImageFieldDisplayValue(value) {
  const normalizedValue = normalizeMediaUrl(value);
  return isDataUrl(normalizedValue) ? "" : normalizedValue;
}

function normalizeMessageBoardDisplayMode(value) {
  return String(value || "").trim().toLowerCase() === "fallback"
    ? "fallback"
    : DEFAULT_MESSAGE_BOARD_DISPLAY_MODE;
}

function normalizeMixedImageMode(value) {
  const normalizedValue = String(value || "").trim().toLowerCase();
  if (
    normalizedValue === "match-type"
    || normalizedValue === "joke"
    || normalizedValue === "fact"
    || normalizedValue === "announcement"
  ) {
    return normalizedValue;
  }

  return DEFAULT_MIXED_IMAGE_MODE;
}

function getMessageBoardDisplayModeLabel(mode = getMessageBoardDisplayMode()) {
  return ({
    announcement: "Show Announcement",
    fallback: "Show Default Fallback",
  })[normalizeMessageBoardDisplayMode(mode)] || "Show Announcement";
}

function getFallbackContentModeLabel(mode = getFallbackContentMode()) {
  return ({
    jokes: "Jokes only",
    facts: "Grow facts only",
    mixed: "Mixed jokes + facts",
  })[normalizeFallbackContentMode(mode)] || "Mixed jokes + facts";
}

function getMixedImageModeLabel(mode = getMixedImageMode()) {
  return ({
    "match-type": "Use matching item type image",
    joke: "Always use joke image",
    fact: "Always use grow fact image",
    announcement: "Use announcement default image",
  })[normalizeMixedImageMode(mode)] || "Use matching item type image";
}

function getMessageBoardDisplayMode() {
  try {
    return normalizeMessageBoardDisplayMode(localStorage.getItem(MESSAGE_BOARD_DISPLAY_MODE_STORAGE_KEY) || "");
  } catch (error) {
    console.error("Failed to read message board display mode from localStorage", error);
    try {
      localStorage.setItem(MESSAGE_BOARD_DISPLAY_MODE_STORAGE_KEY, DEFAULT_MESSAGE_BOARD_DISPLAY_MODE);
    } catch (resetError) {
      console.error("Failed to reset message board display mode in localStorage", resetError);
    }
    return DEFAULT_MESSAGE_BOARD_DISPLAY_MODE;
  }
}

function writeMessageBoardDisplayMode(mode) {
  const normalizedMode = normalizeMessageBoardDisplayMode(mode);
  try {
    localStorage.setItem(MESSAGE_BOARD_DISPLAY_MODE_STORAGE_KEY, normalizedMode);
  } catch (error) {
    console.error("Failed to write message board display mode to localStorage", error);
  }
  return normalizedMode;
}

function getMixedImageMode() {
  try {
    return normalizeMixedImageMode(localStorage.getItem(MIXED_IMAGE_MODE_STORAGE_KEY) || "");
  } catch (error) {
    console.error("Failed to read mixed fallback image mode from localStorage", error);
    try {
      localStorage.setItem(MIXED_IMAGE_MODE_STORAGE_KEY, DEFAULT_MIXED_IMAGE_MODE);
    } catch (resetError) {
      console.error("Failed to reset mixed fallback image mode in localStorage", resetError);
    }
    return DEFAULT_MIXED_IMAGE_MODE;
  }
}

function writeMixedImageMode(mode) {
  const normalizedMode = normalizeMixedImageMode(mode);
  try {
    localStorage.setItem(MIXED_IMAGE_MODE_STORAGE_KEY, normalizedMode);
  } catch (error) {
    console.error("Failed to write mixed fallback image mode to localStorage", error);
  }
  return normalizedMode;
}

function readStoredMessageBoardImageUrl(storageKey) {
  try {
    return normalizeMediaUrl(localStorage.getItem(storageKey) || "");
  } catch (error) {
    console.error("Failed to read message board image setting from localStorage", error);
    return "";
  }
}

function writeStoredMessageBoardImageUrl(storageKey, value) {
  try {
    localStorage.setItem(storageKey, normalizeMediaUrl(value));
  } catch (error) {
    console.error("Failed to write message board image setting to localStorage", error);
    throw new Error("Could not save the uploaded image to this browser. Try a smaller image.");
  }
}

function getDefaultAnnouncementImageUrl() {
  return readStoredMessageBoardImageUrl(DEFAULT_ANNOUNCEMENT_IMAGE_STORAGE_KEY);
}

function getDefaultJokeImageUrl() {
  return readStoredMessageBoardImageUrl(DEFAULT_JOKE_IMAGE_STORAGE_KEY);
}

function getDefaultFactImageUrl() {
  return readStoredMessageBoardImageUrl(DEFAULT_FACT_IMAGE_STORAGE_KEY);
}

function resolveMessageBoardImageUrl(value) {
  return normalizeMediaUrl(value) || MESSAGE_BOARD_IMAGE_FALLBACK_URL;
}

function getResolvedDefaultAnnouncementImageUrl() {
  return resolveMessageBoardImageUrl(getDefaultAnnouncementImageUrl());
}

function getResolvedDefaultJokeImageUrl() {
  return resolveMessageBoardImageUrl(getDefaultJokeImageUrl());
}

function getResolvedDefaultFactImageUrl() {
  return resolveMessageBoardImageUrl(getDefaultFactImageUrl());
}

function resolveAnnouncementCardImageUrl(value) {
  return resolveMessageBoardImageUrl(normalizeMediaUrl(value) || getDefaultAnnouncementImageUrl());
}

function resolveFallbackCardImageUrl(fallbackType, fallbackMode = getFallbackContentMode()) {
  if (normalizeFallbackContentMode(fallbackMode) === "mixed") {
    const mixedImageMode = getMixedImageMode();
    if (mixedImageMode === "joke") {
      return getResolvedDefaultJokeImageUrl();
    }
    if (mixedImageMode === "fact") {
      return getResolvedDefaultFactImageUrl();
    }
    if (mixedImageMode === "announcement") {
      return getResolvedDefaultAnnouncementImageUrl();
    }
  }

  return fallbackType === "fact"
    ? getResolvedDefaultFactImageUrl()
    : getResolvedDefaultJokeImageUrl();
}

function mapStoredAnnouncementToAnnouncement(record) {
  if (!record) {
    return null;
  }

  return {
    id: "local-storage-announcement",
    title: String(record.title || "").trim(),
    body: String(record.message || "").trim(),
    imageUrl: String(record.imageUrl || "").trim(),
    imagePath: "",
    instagramPostUrl: normalizeExternalUrl(record.instagramUrl || ""),
    buttonText: String(record.buttonText || "").trim(),
    status: record.active ? "active" : "inactive",
    publishAt: record.updatedAt || "",
    expiresAt: "",
    createdAt: record.updatedAt || "",
    updatedAt: record.updatedAt || "",
  };
}

function normalizeStoredAnnouncementRecord(record) {
  if (!record || typeof record !== "object") {
    return null;
  }

  const title = String(record.title || "").trim();
  const message = String(record.message || record.body || "").trim();
  const imageUrl = normalizeMediaUrl(record.imageUrl || "");
  const instagramUrl = normalizeExternalUrl(record.instagramUrl || record.instagramPostUrl || "");
  const buttonText = String(record.buttonText || "").trim();
  const parsedUpdatedAt = parseCompletedAtValue(record.updatedAt || "");
  const updatedAt = parsedUpdatedAt instanceof Date && !Number.isNaN(parsedUpdatedAt.getTime())
    ? parsedUpdatedAt.toISOString()
    : new Date().toISOString();
  const active = Boolean(record.active);

  if (!title && !message && !imageUrl && !instagramUrl && !buttonText && !active) {
    return null;
  }

  return {
    title,
    message,
    imageUrl,
    instagramUrl,
    buttonText,
    active,
    updatedAt,
  };
}

function readStoredAnnouncementRecord() {
  try {
    const rawValue = localStorage.getItem(ANNOUNCEMENT_STORAGE_KEY);
    if (!rawValue) {
      return null;
    }
    return normalizeStoredAnnouncementRecord(JSON.parse(rawValue));
  } catch (error) {
    console.error("Failed to read announcement from localStorage", error);
    appState.announcementsError = "Could not load the saved announcement from this browser.";
    try {
      localStorage.removeItem(ANNOUNCEMENT_STORAGE_KEY);
    } catch (resetError) {
      console.error("Failed to reset announcement in localStorage", resetError);
    }
    return null;
  }
}

function writeStoredAnnouncementRecord(record) {
  localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, JSON.stringify(record));
}

function removeStoredAnnouncementRecord() {
  localStorage.removeItem(ANNOUNCEMENT_STORAGE_KEY);
}

function getAnnouncementSortTimestamp(announcement) {
  const publishAt = parseCompletedAtValue(announcement?.publishAt);
  const updatedAt = parseCompletedAtValue(announcement?.updatedAt);
  const createdAt = parseCompletedAtValue(announcement?.createdAt);
  return (
    publishAt?.getTime()
    || updatedAt?.getTime()
    || createdAt?.getTime()
    || 0
  );
}

function compareAnnouncementsByRecency(left, right) {
  return getAnnouncementSortTimestamp(right) - getAnnouncementSortTimestamp(left);
}

function isAnnouncementCurrentlyPublic(announcement) {
  return Boolean(announcement && normalizeAnnouncementStatus(announcement.status) === "active");
}

function loadAnnouncementsFromStorage(reason = "unspecified") {
  void reason;
  appState.announcementsError = "";
  const storedAnnouncement = readStoredAnnouncementRecord();
  const mappedAnnouncement = mapStoredAnnouncementToAnnouncement(storedAnnouncement);
  return mappedAnnouncement ? [mappedAnnouncement].sort(compareAnnouncementsByRecency) : [];
}

async function loadAnnouncements(reason = "unspecified") {
  return loadAnnouncementsFromStorage(reason);
}

async function refreshAnnouncements(options = {}) {
  const { force = false } = options;
  if (!force && appState.announcementsLoaded && !appState.announcementsRefreshPromise) {
    return appState.announcements;
  }

  if (!force && appState.announcementsRefreshPromise) {
    return appState.announcementsRefreshPromise;
  }

  const refreshPromise = (async () => {
    const announcements = await loadAnnouncements(options.reason || "refresh");
    appState.announcements = announcements;
    appState.announcementsLoaded = true;
    return announcements;
  })();

  appState.announcementsRefreshPromise = refreshPromise;

  try {
    return await refreshPromise;
  } finally {
    appState.announcementsRefreshPromise = null;
  }
}

function getLatestActiveAnnouncement() {
  return [...(appState.announcements || [])]
    .filter((announcement) => isAnnouncementCurrentlyPublic(announcement))
    .sort(compareAnnouncementsByRecency)[0] || null;
}

async function saveAnnouncementRecord(announcementInput) {
  if (!isAdminUser()) {
    throw new Error("You must be an admin to manage announcements.");
  }

  const title = String(announcementInput.title || "").trim();
  const message = String(announcementInput.message || announcementInput.body || "").trim();

  if (!title) {
    throw new Error("Title is required.");
  }

  if (!message) {
    throw new Error("Message is required.");
  }

  const storedRecord = {
    title,
    message,
    imageUrl: normalizeMediaUrl(announcementInput.imageUrl || announcementInput.imageUrlInput || ""),
    instagramUrl: normalizeExternalUrl(announcementInput.instagramUrl || announcementInput.instagramPostUrl || ""),
    buttonText: String(announcementInput.buttonText || "").trim(),
    active: Boolean(announcementInput.active),
    updatedAt: new Date().toISOString(),
  };

  try {
    writeStoredAnnouncementRecord(storedRecord);
  } catch (error) {
    console.error("Failed to save announcement to localStorage", error);
    throw new Error("Could not save the announcement to this browser.");
  }

  console.log("[Cannakan Announcements] Announcement saved", storedRecord);

  const savedAnnouncement = mapStoredAnnouncementToAnnouncement(storedRecord);
  appState.announcements = savedAnnouncement ? [savedAnnouncement] : [];
  appState.announcementsLoaded = true;
  appState.announcementsError = "";
  return savedAnnouncement;
}

async function clearAnnouncementRecord() {
  if (!isAdminUser()) {
    throw new Error("You must be an admin to manage announcements.");
  }

  try {
    removeStoredAnnouncementRecord();
  } catch (error) {
    console.error("Failed to clear announcement from localStorage", error);
    throw new Error("Could not clear the saved announcement from this browser.");
  }

  appState.announcements = [];
  appState.announcementsLoaded = true;
  appState.announcementsError = "";
}

async function saveUserProfile(profileInput) {
  if (!appState.supabase || !appState.user) {
    throw new Error("You must be signed in to save a profile.");
  }

  const existingProfile = appState.profile || {};
  const payload = {
    id: appState.user.id,
    username: String(profileInput?.username || "").trim(),
    email: String(profileInput?.email !== undefined ? profileInput.email : (appState.user?.email || existingProfile.email || "")).trim().toLowerCase(),
    avatar_url: String(profileInput?.avatarUrl || "").trim(),
    avatar_path: String(profileInput?.avatarPath || "").trim(),
    account_status:
      profileInput?.accountStatus !== undefined
        ? String(profileInput.accountStatus || "active").trim().toLowerCase()
        : String(existingProfile.accountStatus || "active").trim().toLowerCase(),
    last_active_at:
      profileInput?.lastActiveAt !== undefined
        ? profileInput.lastActiveAt
        : (existingProfile.lastActiveAt || new Date().toISOString()),
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
    console.error("[Cannakan Profile] Supabase profile upsert failed", {
      payload,
      error,
    });
    throw error;
  }

  console.log("[Cannakan Profile] Supabase profile upsert succeeded", {
    userId: appState.user.id,
    email: payload.email,
    username: payload.username,
  });
  return normalizeProfileRow(data);
}

async function saveUserNotificationPreferences(preferencesInput) {
  if (!appState.supabase || !appState.user) {
    throw new Error("You must be signed in to save notification preferences.");
  }

  const existingPreferences = appState.notificationPreferences || DEFAULT_NOTIFICATION_PREFERENCES;
  const fallbackPayload = buildUserNotificationPreferencesUpsertPayload(
    appState.user.id,
    preferencesInput,
    existingPreferences,
    "legacy",
  );

  if (appState.notificationPreferencesTableUnavailable) {
    return normalizeUserNotificationPreferencesRow(fallbackPayload);
  }

  const writeModes = getUserNotificationPreferencesWriteModes(appState.notificationPreferencesSchemaMode);
  let lastError = null;

  for (const writeMode of writeModes) {
    const payload = buildUserNotificationPreferencesUpsertPayload(
      appState.user.id,
      preferencesInput,
      existingPreferences,
      writeMode,
    );
    let data = null;
    let error = null;
    try {
      const response = await appState.supabase
        .from(USER_NOTIFICATION_PREFERENCES_TABLE)
        .upsert(payload, { onConflict: "user_id" })
        .select("*")
        .single();
      data = response?.data || null;
      error = response?.error || null;
    } catch (requestError) {
      error = requestError;
    }

    if (!error) {
      setUserNotificationPreferencesSchemaMode(data || writeMode);
      return normalizeUserNotificationPreferencesRow(data);
    }

    if (isUserNotificationPreferencesSchemaModeError(error)) {
      lastError = error;
      continue;
    }

    if (isUserNotificationPreferencesTableMissingError(error)) {
      markUserNotificationPreferencesTableUnavailable();
      return normalizeUserNotificationPreferencesRow(fallbackPayload);
    }

    markUserNotificationPreferencesTableUnavailable();
    return normalizeUserNotificationPreferencesRow(fallbackPayload);
  }

  if (isUserNotificationPreferencesSchemaModeError(lastError)) {
    markUserNotificationPreferencesTableUnavailable();
    return normalizeUserNotificationPreferencesRow(fallbackPayload);
  }

  return normalizeUserNotificationPreferencesRow(fallbackPayload);
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
    throw new Error("Community Grow publishing is not available until Supabase Storage is ready.");
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
    throw new Error(getGalleryPublishErrorMessage(error, "Could not upload this snapshot to Community Grow."));
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

async function buildGallerySnapshotImageHash(blob) {
  if (!blob || typeof blob.arrayBuffer !== "function" || !globalThis.crypto?.subtle) {
    throw new Error("Image hashing is not available in this browser.");
  }

  const imageBuffer = await blob.arrayBuffer();
  const digestBuffer = await globalThis.crypto.subtle.digest("SHA-256", imageBuffer);
  return Array.from(new Uint8Array(digestBuffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function findDuplicateGallerySnapshotByImageHash(imageHash, sessionId = "") {
  if (!appState.supabase || !imageHash) {
    return null;
  }

  const { data, error } = await appState.supabase.rpc("find_duplicate_grow_gallery_snapshot_by_hash", {
    candidate_hash: imageHash,
    candidate_session_id: sessionId || null,
  });

  if (error) {
    throw error;
  }

  const duplicateRow = Array.isArray(data)
    ? data.find(Boolean)
    : data;

  if (!duplicateRow) {
    return null;
  }

  return {
    id: duplicateRow.id,
    status: normalizeGallerySnapshotRecordStatus(duplicateRow.status),
    sessionId: duplicateRow.session_id || "",
  };
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
    imageHash: String(row.image_hash || "").trim(),
    sessionDate: row.session_date || "",
    systemType: String(row.system_type || "KAN").trim() || "KAN",
    unitId: String(row.unit_id || "").trim(),
    totalSeeds: Math.max(0, Number(row.total_seeds) || 0),
    totalPlanted: Math.max(0, Number(row.total_planted) || 0),
    successPercent: Number(row.success_percent) || 0,
    submittedBy: String(row.submitted_by || "").trim(),
    sourceId: String(row.source_id || "").trim(),
    sourceName: String(row.source_name || "").trim(),
    sourceLogoUrl: String(row.source_logo_url || "").trim(),
    seedVarietyName: String(row.seed_variety_name || "").trim(),
    includeProfileInGallery: Boolean(row.include_profile_in_gallery),
    profileName: String(row.submitted_profile_name || "").trim(),
    profileImageUrl: String(row.submitted_profile_avatar_url || "").trim(),
    usageConsent: Boolean(row.usage_consent),
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
    return "Community Grow storage bucket is missing or not configured.";
  }
  if (normalizedMessage.includes("row-level security") || normalizedMessage.includes("permission denied")) {
    return "You do not have permission to publish to Community Grow.";
  }
  if (normalizedMessage.includes("relation") && normalizedMessage.includes("grow_gallery_snapshots")) {
    return "Community Grow data store is missing. Run the latest schema setup.";
  }
  if (normalizedMessage.includes("column") && normalizedMessage.includes("grow_gallery_snapshots")) {
    return "Community Grow schema is out of date. Apply the latest database schema.";
  }
  if (normalizedMessage.includes("find_duplicate_grow_gallery_snapshot_by_hash")) {
    return "Community Grow schema is out of date. Apply the latest database schema.";
  }

  return fallbackMessage;
}

async function publishSnapshotToGallery(session, snapshotData, blob, options = {}) {
  if (!appState.supabase || !appState.user) {
    throw new Error("You must be signed in to publish to Community Grow.");
  }

  if (!session?.id) {
    throw new Error("Save this session before publishing it to Community Grow.");
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

  let imageHash = "";
  try {
    imageHash = await buildGallerySnapshotImageHash(blob);
  } catch (error) {
    console.warn("Grow Gallery image hashing failed; allowing submission without duplicate detection.", {
      sessionId: session.id,
      error,
    });
  }

  if (imageHash) {
    let duplicateSnapshot = null;
    try {
      duplicateSnapshot = await findDuplicateGallerySnapshotByImageHash(imageHash, session.id);
    } catch (error) {
      console.error("Grow Gallery duplicate image check failed", {
        sessionId: session.id,
        imageHash,
        error,
      });
      throw new Error(getGalleryPublishErrorMessage(
        error,
        "Could not verify whether this snapshot image is already in Community Grow.",
      ));
    }

    if (duplicateSnapshot) {
      logGrowGalleryDebug("publishSnapshotToGallery:blocked-duplicate-image", {
        sessionId: session.id,
        duplicateSnapshotId: duplicateSnapshot.id,
        duplicateStatus: duplicateSnapshot.status,
      });
      throw new Error(DUPLICATE_GALLERY_SNAPSHOT_IMAGE_MESSAGE);
    }
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
    image_hash: imageHash || null,
    session_date: session.date || null,
    system_type: session.systemType || "KAN",
    unit_id: String(session.unitId || "").trim(),
    total_seeds: Math.max(0, Number(snapshotData?.totalSeeds) || 0),
    total_planted: Math.max(0, Number(snapshotData?.totalPlanted) || 0),
    success_percent: Number(snapshotData?.percentage) || 0,
    submitted_by: profileName,
    source_id: String(snapshotData?.sourceId || "").trim() || null,
    source_name: normalizeLeaderboardLabel(snapshotData?.sourceName || ""),
    source_logo_url: String(snapshotData?.sourceLogoUrl || "").trim(),
    seed_variety_name: normalizeLeaderboardLabel(snapshotData?.seedVarietyName || ""),
    include_profile_in_gallery: includeProfileInGallery,
    submitted_profile_name: profileName,
    submitted_profile_avatar_url: profileImageUrl,
    usage_consent: Boolean(options.usageConsent),
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
    throw new Error(getGalleryPublishErrorMessage(error, "Could not save this snapshot to Community Grow."));
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

  const previousSnapshot = appState.gallerySnapshots.find((entry) => entry.id === snapshotId) || null;

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

  if (nextStatus === "approved") {
    const sessionContext = await loadCommunityActivitySessionContext(mapped.sessionId || "");
    await syncCommunityActivityForApprovedSnapshot(mapped, { sessionContext });
  } else if (!previousSnapshot || getGallerySnapshotDisplayStatus(previousSnapshot) === "approved") {
    await clearCommunityActivityForSnapshot(snapshotId);
  }

  return mapped;
}

async function approveSnapshot(snapshotId) {
  return updateGallerySnapshotModerationStatus(snapshotId, "approved");
}

async function rejectSnapshot(snapshotId) {
  return updateGallerySnapshotModerationStatus(snapshotId, "rejected");
}

async function approveGalleryReviewSnapshot(snapshotId) {
  const snapshot = getGalleryReviewSnapshotById(snapshotId);
  if (isMockGalleryReviewSnapshot(snapshot)) {
    appState.mockGalleryReviewStatuses[String(snapshot.id)] = "approved";
    return {
      ...snapshot,
      status: "approved",
      published: true,
    };
  }

  return approveSnapshot(snapshotId);
}

async function rejectGalleryReviewSnapshot(snapshotId) {
  const snapshot = getGalleryReviewSnapshotById(snapshotId);
  if (isMockGalleryReviewSnapshot(snapshot)) {
    appState.mockGalleryReviewStatuses[String(snapshot.id)] = "rejected";
    return {
      ...snapshot,
      status: "rejected",
      published: false,
    };
  }

  return rejectSnapshot(snapshotId);
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
    return { mode: "delete", label: "Withdraw from Community Grow" };
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
    throw new Error("You can only manage your own Community Grow snapshots.");
  }

  if (getGallerySnapshotDisplayStatus(existing) === "approved") {
    throw new Error("Approved Community Grow snapshots cannot be removed here.");
  }

  await removeGallerySnapshotImage(existing.imagePath);
  const { error } = await appState.supabase
    .from("grow_gallery_snapshots")
    .delete()
    .eq("id", snapshotId);

  if (error) {
    throw new Error("Could not remove this snapshot from Community Grow.");
  }

  await clearCommunityActivityForSnapshot(snapshotId);
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
    throw new Error("Could not find this Community Grow snapshot.");
  }
  if (isMockGallerySnapshot(snapshot)) {
    throw new Error("Mock Community Grow likes are preview-only in local development.");
  }

  if (!appState.supabase || !appState.user?.id) {
    throw new Error("Sign in to like Community Grow snapshots.");
  }
  if (appState.gallerySnapshotLikesTableUnavailable) {
    throw new Error("Community Grow likes are unavailable until the latest Supabase schema is applied.");
  }

  if (snapshot.likedByCurrentUser) {
    const { error } = await appState.supabase
      .from(GROW_GALLERY_LIKES_TABLE)
      .delete()
      .eq("snapshot_id", snapshotId)
      .eq("user_id", appState.user.id);

    if (error) {
      if (isGallerySnapshotLikesTableMissingError(error)) {
        markGallerySnapshotLikesTableUnavailable();
        throw new Error("Community Grow likes are unavailable until the latest Supabase schema is applied.");
      }
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
      if (isGallerySnapshotLikesTableMissingError(error)) {
        markGallerySnapshotLikesTableUnavailable();
        throw new Error("Community Grow likes are unavailable until the latest Supabase schema is applied.");
      }
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
          return comparePerformanceByRateSpeedAndRecency(left, right, {
            getRate: getGallerySnapshotSuccessRate,
            getDurationMs: getGallerySnapshotCompletedDurationMs,
            getSortTime: getGallerySnapshotSortTime,
            getFallbackLabel: getGallerySnapshotSortLabel,
            sortDirection: normalizedOrder,
          });
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

function getGallerySnapshotSubmittedDateTimeLabel(snapshot) {
  const parsedDate = parseLeaderboardSnapshotDate(snapshot);
  if (!(parsedDate instanceof Date) || Number.isNaN(parsedDate.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
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

  const memberId = String(snapshot.userId || "").trim();
  const memberRoute = memberId ? getPublicMemberProfileRoute(memberId) : "";
  const profileLabel = profileName || "this member";
  const wrapperTag = memberRoute ? "a" : "div";
  const wrapperAttributes = memberRoute
    ? `class="gallery-card-profile gallery-card-profile-link" href="${escapeHtml(memberRoute)}" aria-label="${escapeHtml(`View ${profileLabel}'s public profile`)}"`
    : 'class="gallery-card-profile"';

  return `
    <${wrapperTag} ${wrapperAttributes}>
      ${profileImageUrl ? `<img src="${escapeHtml(profileImageUrl)}" alt="${escapeHtml(profileName || "Shared grower profile image")}" class="gallery-card-profile-avatar">` : ""}
      ${profileName ? `<span class="gallery-card-profile-name">${escapeHtml(profileName)}</span>` : ""}
    </${wrapperTag}>
  `;
}

function getGallerySnapshotCardMemberProfile(snapshot) {
  const memberId = String(snapshot?.userId || "").trim();
  const cachedProfile = memberId ? getPublicMemberProfile(memberId) : null;
  const fallbackDisplayName = String(
    cachedProfile?.displayName
    || snapshot?.profileName
    || snapshot?.submittedBy
    || "Community member",
  ).trim() || "Community member";
  const fallbackAvatarUrl = String(
    cachedProfile?.avatarUrl
    || snapshot?.profileImageUrl
    || "",
  ).trim();

  return {
    memberId,
    displayName: fallbackDisplayName,
    avatarUrl: fallbackAvatarUrl,
    profileRoute: memberId ? getPublicMemberProfileRoute(memberId) : "",
  };
}

function renderGallerySnapshotMemberMarkup(snapshot) {
  const member = getGallerySnapshotCardMemberProfile(snapshot);
  const submittedLabel = getGallerySnapshotSubmittedDateTimeLabel(snapshot);
  const avatarMarkup = renderPublicMemberAvatarMarkup(member.displayName, member.avatarUrl, "gallery-card-profile-avatar");
  const wrapperTag = member.profileRoute ? "a" : "div";
  const wrapperAttributes = member.profileRoute
    ? `class="gallery-card-profile gallery-card-profile-link" href="${escapeHtml(member.profileRoute)}" aria-label="${escapeHtml(`View ${member.displayName}'s public profile`)}"`
    : 'class="gallery-card-profile"';

  return `
    <${wrapperTag} ${wrapperAttributes}>
      ${avatarMarkup}
      <span class="gallery-card-profile-copy">
        <span class="gallery-card-profile-name">${escapeHtml(member.displayName)}</span>
        <span class="gallery-card-profile-meta">${escapeHtml(submittedLabel)}</span>
      </span>
    </${wrapperTag}>
  `;
}

function renderGalleryFollowButtonMarkup(snapshot, options = {}) {
  const { showFollowAction = true } = options;
  if (!showFollowAction || appState.publicMemberFollowsTableUnavailable) {
    return "";
  }

  const memberId = String(snapshot?.userId || "").trim();
  if (!memberId || isViewingOwnPublicMemberProfile(memberId)) {
    return "";
  }

  const isSignedIn = Boolean(appState.user?.id);
  const followState = getViewerPublicMemberFollowState(memberId);
  const isLoadingFollowState = isSignedIn && followState === null && (
    Boolean(appState.growNetworkFollowingRefreshPromise)
    || !appState.growNetworkFollowingLoaded
  );
  const isFollowing = followState === true;
  const isPendingFollow = isPublicMemberFollowPending(memberId);
  const buttonLabel = !isSignedIn
    ? "Follow"
    : isLoadingFollowState
      ? "Loading..."
      : (isFollowing ? "Following" : "Follow");

  return `
    <button
      type="button"
      class="button ${isFollowing ? "button-secondary" : "button-primary"} gallery-card-follow-button${isFollowing ? " is-following" : ""}"
      data-gallery-follow="${escapeHtml(memberId)}"
      ${(isPendingFollow || isLoadingFollowState || !isSignedIn) ? "disabled" : ""}
      aria-pressed="${isFollowing ? "true" : "false"}"
    >${escapeHtml(buttonLabel)}</button>
  `;
}

function renderGallerySnapshotCardMarkup(snapshot, options = {}) {
  const {
    allowOwnerManagement = true,
    linkSharedProfile = true,
    alwaysShowPublicSessionAction = false,
    showFollowAction = true,
  } = options;
  const isOwner = isGallerySnapshotOwner(snapshot);
  const snapshotStatus = getGallerySnapshotDisplayStatus(snapshot);
  const isPending = snapshotStatus === "pending_review";
  const isRejected = snapshotStatus === "rejected";
  const isApproved = snapshotStatus === "approved";
  const isPrivate = snapshotStatus === "private";
  const ownerAction = allowOwnerManagement && isOwner ? getOwnerGalleryAction(snapshot) : null;
  const details = getGallerySnapshotFeedDetails(snapshot);
  const publicDetails = getGallerySnapshotPublicSessionDetails(snapshot);
  const memberMarkup = renderGallerySnapshotMemberMarkup(snapshot);
  const followButtonMarkup = renderGalleryFollowButtonMarkup(snapshot, { showFollowAction });
  const sharedProfileMarkup = linkSharedProfile
    ? renderGallerySharedProfileMarkup(snapshot)
    : "";
  const openSessionMarkup = allowOwnerManagement && isOwner && snapshot.sessionId
    ? `<a class="button button-secondary" href="#sessions/${escapeHtml(snapshot.sessionId)}">Open Session</a>`
    : "";
  const shouldShowPublicSessionAction = Boolean(
    snapshot?.id && (
      alwaysShowPublicSessionAction
      || !allowOwnerManagement
      || !isOwner
    ),
  );
  const publicSessionMarkup = shouldShowPublicSessionAction
    ? `<a class="button button-secondary" href="#sessions/public/${escapeHtml(snapshot.id)}">View Session</a>`
    : "";
  const ownerActionMarkup = ownerAction
    ? `<button type="button" class="button button-secondary gallery-card-remove" data-gallery-owner-action="${escapeHtml(ownerAction.mode)}" data-gallery-remove="${escapeHtml(snapshot.id)}">${escapeHtml(ownerAction.label)}</button>`
    : "";
  const primaryActionMarkup = publicSessionMarkup || openSessionMarkup;
  const visibilityLabel = isPending
    ? "Visible to you while under review"
    : isRejected
      ? "Rejected submission"
      : isPrivate
        ? "Private submission"
        : "Approved public snapshot";

  return `
    ${renderGallerySnapshotMediaMarkup(snapshot, details)}
    <div class="gallery-card-body">
      <div class="gallery-card-feed-header">
        ${memberMarkup}
        <div class="gallery-card-performance-badge" aria-label="${escapeHtml(`${publicDetails.germinationRateLabel} germination`)}">
          <strong>${escapeHtml(publicDetails.germinationRateLabel)}</strong>
          <span>Germination</span>
        </div>
      </div>
      <div class="gallery-card-top">
        <div class="gallery-card-copy">
          <strong>${escapeHtml(snapshot.title)}</strong>
          <p class="gallery-card-caption">${escapeHtml(`${publicDetails.systemLabel} • ${visibilityLabel}`)}</p>
        </div>
      </div>
      <div class="gallery-card-performance-grid">
        <article class="gallery-card-performance-stat">
          <span>Seed Type</span>
          <strong>${escapeHtml(publicDetails.seedTypeLabel)}</strong>
        </article>
        <article class="gallery-card-performance-stat">
          <span>Source</span>
          <strong>${escapeHtml(publicDetails.sourceLabel)}</strong>
        </article>
        <article class="gallery-card-performance-stat">
          <span>Seeds</span>
          <strong>${escapeHtml(`${publicDetails.germinatedLabel} / ${publicDetails.seedCountLabel}`)}</strong>
        </article>
      </div>
      <div class="gallery-card-feed-meta">
        <div class="gallery-card-feed-row gallery-card-feed-row--primary">
          <span class="gallery-card-chip">${escapeHtml(details.systemLabel)}</span>
          ${publicDetails.seedVarietyLabel && publicDetails.seedVarietyLabel !== "Not shared" ? `<span class="gallery-card-chip">${escapeHtml(publicDetails.seedVarietyLabel)}</span>` : ""}
          <span class="gallery-card-chip">${escapeHtml(visibilityLabel)}</span>
        </div>
      </div>
      ${allowOwnerManagement && isOwner && isApproved ? '<p class="gallery-owner-note">This snapshot is published. To make changes, contact support or remove it.</p>' : ""}
      <div class="gallery-card-footer">
        ${renderGalleryLikeButtonMarkup(snapshot)}
        <div class="gallery-card-actions gallery-card-social-actions">
          ${followButtonMarkup}
          ${primaryActionMarkup}
          ${ownerActionMarkup}
        </div>
        ${sharedProfileMarkup && !memberMarkup.includes("gallery-card-profile-name") ? sharedProfileMarkup : ""}
      </div>
    </div>
  `;
}

function bindGallerySnapshotCardInteractions(scope, visibleSnapshots = [], rerender = () => {}) {
  if (!scope) {
    return;
  }

  scope.querySelectorAll("[data-gallery-remove]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        const snapshotId = button.dataset.galleryRemove || "";
        const ownerAction = button.dataset.galleryOwnerAction || "";
        const snapshot = visibleSnapshots.find((entry) => entry.id === snapshotId);
        if (!snapshot || !isGallerySnapshotOwner(snapshot)) {
          throw new Error("You can only manage your own Community Grow snapshots.");
        }
        if (ownerAction === "request-removal") {
          console.info("[GrowGallery] Removal requested for approved snapshot", {
            snapshotId,
            userId: appState.user?.id || "",
          });
          window.alert("Removal request noted. Contact support for published Community Grow changes.");
          return;
        }

        await deleteGallerySnapshot(snapshotId);
        rerender();
      } catch (error) {
        window.alert(error.message || "Could not remove this Community Grow snapshot.");
      }
    });
  });

  scope.querySelectorAll("[data-gallery-like]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await toggleGallerySnapshotLike(button.dataset.galleryLike || "");
        rerender();
      } catch (error) {
        window.alert(error.message || "Could not update your like right now.");
      }
    });
  });

  scope.querySelectorAll("[data-gallery-follow]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        if (!appState.user?.id) {
          throw new Error("Sign in to follow community members.");
        }
        await togglePublicMemberFollow(button.dataset.galleryFollow || "");
        rerender();
      } catch (error) {
        window.alert(error.message || "Could not update your follow right now.");
      }
    });
  });
}

function ensureGalleryReviewPreviewModal() {
  let modal = document.querySelector("#gallery-review-preview-modal");
  if (modal) {
    return modal;
  }

  modal = document.createElement("dialog");
  modal.id = "gallery-review-preview-modal";
  modal.className = "snapshot-modal gallery-review-preview-modal";
  modal.innerHTML = `
    <div class="snapshot-modal-card gallery-review-preview-card" role="document">
      <button type="button" class="modal-close gallery-review-preview-close" aria-label="Close review preview">×</button>
      <div class="gallery-review-preview-content"></div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector(".gallery-review-preview-close")?.addEventListener("click", () => {
    if (modal.open) {
      modal.close();
    }
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.close();
    }
  });

  return modal;
}

function openGalleryReviewPreview(snapshotId) {
  const snapshot = getGalleryReviewSnapshotById(snapshotId);
  if (!snapshot) {
    window.alert("Could not find this Community Grow submission.");
    return;
  }

  const modal = ensureGalleryReviewPreviewModal();
  const content = modal.querySelector(".gallery-review-preview-content");
  if (!content) {
    return;
  }

  const feedDetails = getGallerySnapshotFeedDetails(snapshot);
  const publicDetails = getGallerySnapshotPublicSessionDetails(snapshot);
  const sharedProfileMarkup = renderGallerySharedProfileMarkup(snapshot);
  const isMockReviewSnapshot = isMockGalleryReviewSnapshot(snapshot);
  const facts = [
    { label: "Snapshot ID", value: snapshot.id || "Unknown" },
    { label: "Source", value: publicDetails.sourceLabel },
    { label: "Seed Variety", value: publicDetails.seedVarietyLabel },
    { label: "Seed Type", value: publicDetails.seedTypeLabel },
    { label: "Seed Count", value: publicDetails.seedCountLabel },
    { label: "Germinated", value: publicDetails.germinatedLabel },
    { label: "Germination Rate", value: publicDetails.germinationRateLabel },
    { label: "Submitted", value: getGallerySnapshotSubmittedDateTimeLabel(snapshot) },
  ];

  content.innerHTML = `
    <div class="gallery-review-preview-header">
      <div>
        <p class="eyebrow">${isMockReviewSnapshot ? "DEV MOCK" : "Admin Review"}</p>
        <h3>${escapeHtml(snapshot.title || "Community Grow submission")}</h3>
        <p class="muted">Preview pending Community Grow submission details before moderation.</p>
      </div>
      <div class="gallery-review-preview-statuses">
        ${isMockReviewSnapshot ? '<span class="gallery-review-status-badge is-dev-mock">DEV MOCK</span>' : ""}
        <span class="gallery-review-status-badge is-pending">Pending Review</span>
      </div>
    </div>
    ${sharedProfileMarkup ? `<div class="gallery-review-preview-profile">${sharedProfileMarkup}</div>` : ""}
    <div class="gallery-review-preview-layout">
      <div class="gallery-review-preview-media">
        ${renderGallerySnapshotMediaMarkup(snapshot, feedDetails)}
      </div>
      <div class="gallery-review-preview-meta">
        ${facts.map((fact) => `
          <article class="meta-card gallery-review-preview-meta-card">
            <strong>${escapeHtml(fact.label)}</strong>
            <p>${escapeHtml(fact.value)}</p>
          </article>
        `).join("")}
      </div>
    </div>
  `;

  modal.showModal();
  modal.querySelector(".gallery-review-preview-close")?.focus();
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

function getElapsedDurationMs(startedAt, endedAt) {
  if (!(startedAt instanceof Date) || Number.isNaN(startedAt.getTime())) {
    return null;
  }

  if (!(endedAt instanceof Date) || Number.isNaN(endedAt.getTime())) {
    return null;
  }

  const durationMs = endedAt.getTime() - startedAt.getTime();
  return durationMs >= 0 ? durationMs : null;
}

function formatElapsedMinutesShorthand(totalMinutes) {
  const safeTotalMinutes = Number(totalMinutes);
  if (!Number.isFinite(safeTotalMinutes) || safeTotalMinutes < 0) {
    return "";
  }

  let remainingMinutes = Math.floor(safeTotalMinutes);
  const days = Math.floor(remainingMinutes / (24 * 60));
  remainingMinutes -= days * 24 * 60;
  const hours = Math.floor(remainingMinutes / 60);
  const minutes = remainingMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function formatDurationMsShort(durationMs) {
  const safeDurationMs = Number(durationMs);
  if (!Number.isFinite(safeDurationMs) || safeDurationMs < 0) {
    return "";
  }

  const totalMinutes = Math.floor(safeDurationMs / 60000);
  return formatElapsedMinutesShorthand(totalMinutes);
}

function compareOptionalDurationMs(leftDurationMs, rightDurationMs) {
  const leftHasDuration = Number.isFinite(leftDurationMs);
  const rightHasDuration = Number.isFinite(rightDurationMs);
  if (leftHasDuration && !rightHasDuration) {
    return -1;
  }
  if (!leftHasDuration && rightHasDuration) {
    return 1;
  }
  if (leftHasDuration && rightHasDuration && leftDurationMs !== rightDurationMs) {
    return leftDurationMs - rightDurationMs;
  }
  return 0;
}

function comparePerformanceByRateSpeedAndRecency(left, right, options = {}) {
  const {
    getRate = () => 0,
    getDurationMs = () => null,
    getSortTime = () => 0,
    getFallbackLabel = () => "",
    sortDirection = "desc",
  } = options;

  const leftRate = Math.max(0, Number(getRate(left)) || 0);
  const rightRate = Math.max(0, Number(getRate(right)) || 0);
  if (leftRate !== rightRate) {
    return sortDirection === "asc"
      ? leftRate - rightRate
      : rightRate - leftRate;
  }

  const durationComparison = compareOptionalDurationMs(getDurationMs(left), getDurationMs(right));
  if (durationComparison) {
    return durationComparison;
  }

  const leftSortTime = Number(getSortTime(left)) || 0;
  const rightSortTime = Number(getSortTime(right)) || 0;
  if (leftSortTime !== rightSortTime) {
    return rightSortTime - leftSortTime;
  }

  return String(getFallbackLabel(left) || "").localeCompare(String(getFallbackLabel(right) || ""), "en", {
    sensitivity: "base",
    numeric: true,
  });
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
  const sourceDisplay = getSourceDisplayMetadata(snapshot);
  const fallbackSourceName = normalizeLeaderboardLabel(snapshot?.sourceName || formatPartitionSource(firstPartitionWithIdentity));

  return {
    sourceName: sourceDisplay.name || fallbackSourceName,
    sourceLogoUrl: String(sourceDisplay.logoUrl || "").trim(),
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
    const snapshotDurationMs = getGallerySnapshotCompletedDurationMs(snapshot);
    const currentGroup = groups.get(normalizedKey) || {
      key: normalizedKey,
      name: label,
      sourceLogoUrl: type === "source" ? metadata.sourceLogoUrl : "",
      snapshotCount: 0,
      successPercentTotal: 0,
      totalPlanted: 0,
      totalSeeds: 0,
      latestPublishedAt: "",
      fastestCompletedDurationMs: null,
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
    if (Number.isFinite(snapshotDurationMs) && (!Number.isFinite(currentGroup.fastestCompletedDurationMs) || snapshotDurationMs < currentGroup.fastestCompletedDurationMs)) {
      currentGroup.fastestCompletedDurationMs = snapshotDurationMs;
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
      fastestCompletedDurationLabel: formatDurationMsShort(entry.fastestCompletedDurationMs),
    }))
    .sort((left, right) => comparePerformanceByRateSpeedAndRecency(left, right, {
      getRate: (entry) => entry.averagePercent,
      getDurationMs: (entry) => entry.fastestCompletedDurationMs,
      getSortTime: (entry) => new Date(entry.latestPublishedAt || 0).getTime(),
      getFallbackLabel: (entry) => entry.name,
      sortDirection: "desc",
    }));
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
    const snapshotDurationMs = getGallerySnapshotCompletedDurationMs(snapshot);
    const currentGroup = groups.get(normalizedKey) || {
      key: normalizedKey,
      name: label,
      snapshotCount: 0,
      successPercentTotal: 0,
      totalPlanted: 0,
      totalSeeds: 0,
      latestPublishedAt: "",
      fastestCompletedDurationMs: null,
    };

    currentGroup.snapshotCount += 1;
    currentGroup.successPercentTotal += Number(snapshot?.successPercent) || 0;
    currentGroup.totalPlanted += Math.max(0, Number(snapshot?.totalPlanted) || 0);
    currentGroup.totalSeeds += Math.max(0, Number(snapshot?.totalSeeds) || 0);

    const currentLatest = currentGroup.latestPublishedAt ? new Date(currentGroup.latestPublishedAt) : null;
    if (!currentLatest || Number.isNaN(currentLatest.getTime()) || (publishedDate && publishedDate > currentLatest)) {
      currentGroup.latestPublishedAt = publishedDate?.toISOString() || currentGroup.latestPublishedAt;
    }
    if (Number.isFinite(snapshotDurationMs) && (!Number.isFinite(currentGroup.fastestCompletedDurationMs) || snapshotDurationMs < currentGroup.fastestCompletedDurationMs)) {
      currentGroup.fastestCompletedDurationMs = snapshotDurationMs;
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
      fastestCompletedDurationLabel: formatDurationMsShort(entry.fastestCompletedDurationMs),
    }))
    .sort((left, right) => comparePerformanceByRateSpeedAndRecency(left, right, {
      getRate: (entry) => entry.averagePercent,
      getDurationMs: (entry) => entry.fastestCompletedDurationMs,
      getSortTime: (entry) => new Date(entry.latestPublishedAt || 0).getTime(),
      getFallbackLabel: (entry) => entry.name,
      sortDirection: "desc",
    }))[0] || null;
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
          <span class="gallery-leaderboard-metric">${escapeHtml(`${entry.averagePercent}% avg${entry.fastestCompletedDurationLabel ? ` · fastest ${entry.fastestCompletedDurationLabel}` : ""}`)}</span>
        </li>
      `).join("")}
    </ol>
  `;
}

function getGallerySnapshotMemberKey(snapshot = {}) {
  return String(
    snapshot?.userId
    || snapshot?.profileName
    || snapshot?.submittedBy
    || snapshot?.submittedByName
    || "",
  ).trim();
}

function getGallerySnapshotMemberLabel(snapshot = {}) {
  return String(
    snapshot?.profileName
    || snapshot?.submittedBy
    || snapshot?.submittedByName
    || "Community member",
  ).trim() || "Community member";
}

function getGallerySnapshotMemberAvatarUrl(snapshot = {}) {
  return String(
    snapshot?.profileImageUrl
    || snapshot?.submittedProfileAvatarUrl
    || snapshot?.avatarUrl
    || "",
  ).trim();
}

function findMockGalleryTopMemberEntry(entry = {}) {
  const entryKey = String(entry?.key || "").trim().toLowerCase();
  const entryName = String(entry?.name || "").trim().toLowerCase();
  return GALLERY_TOP_MEMBERS_MOCK_ENTRIES.find((mockEntry) => (
    (entryKey && String(mockEntry?.key || "").trim().toLowerCase() === entryKey)
    || (entryName && String(mockEntry?.name || "").trim().toLowerCase() === entryName)
  )) || null;
}

function buildGalleryTopMemberEntries(snapshots = []) {
  const entriesByMemberKey = new Map();

  (snapshots || []).forEach((snapshot) => {
    const memberKey = getGallerySnapshotMemberKey(snapshot);
    if (!memberKey) {
      return;
    }

    const existingEntry = entriesByMemberKey.get(memberKey) || {
      key: memberKey,
      name: getGallerySnapshotMemberLabel(snapshot),
      avatarUrl: "",
      snapshotCount: 0,
      totalLikes: 0,
      latestPublishedAt: 0,
      totalSuccessPercent: 0,
    };

    existingEntry.name = existingEntry.name === "Community member"
      ? getGallerySnapshotMemberLabel(snapshot)
      : existingEntry.name;
    existingEntry.avatarUrl = existingEntry.avatarUrl || getGallerySnapshotMemberAvatarUrl(snapshot);
    existingEntry.snapshotCount += 1;
    existingEntry.totalLikes += Math.max(0, Number(snapshot?.likeCount) || 0);
    existingEntry.totalSuccessPercent += Math.max(0, Number(snapshot?.successPercent) || 0);
    const publishedAtMs = parseLeaderboardSnapshotDate(snapshot)?.getTime() || 0;
    existingEntry.latestPublishedAt = Math.max(existingEntry.latestPublishedAt, publishedAtMs);
    entriesByMemberKey.set(memberKey, existingEntry);
  });

  return [...entriesByMemberKey.values()]
    .map((entry) => ({
      ...entry,
      avatarUrl: entry.avatarUrl || (isMockDataEnabled() ? findMockGalleryTopMemberEntry(entry)?.avatarUrl || "" : ""),
      averageGermination: entry.snapshotCount
        ? Math.round(entry.totalSuccessPercent / entry.snapshotCount)
        : (isMockDataEnabled() ? findMockGalleryTopMemberEntry(entry)?.averageGermination || 0 : 0),
    }))
    .sort((left, right) => (
      (right.snapshotCount - left.snapshotCount)
      || (right.totalLikes - left.totalLikes)
      || (right.latestPublishedAt - left.latestPublishedAt)
      || left.name.localeCompare(right.name)
    ));
}

function renderLeaderboardMemberIdentityMarkup(entry = {}, className = "leaderboard-member-identity") {
  const displayName = String(entry?.name || "Community member").trim() || "Community member";
  const avatarUrl = String(entry?.avatarUrl || "").trim();
  return `
    <span class="${escapeHtml(className)}">
      ${renderPublicMemberAvatarMarkup(displayName, avatarUrl, "leaderboard-member-avatar")}
      <span class="leaderboard-member-name">${escapeHtml(displayName)}</span>
    </span>
  `;
}

function renderGalleryTopMemberRows(entries = [], emptyMessage = "Not enough member activity yet.") {
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
            <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
              <path d="M8.5 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"></path>
              <path d="M15.5 10.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path>
              <path d="M5.5 17.5c.5-2 2.1-3.3 4.3-3.3s3.8 1.3 4.3 3.3"></path>
              <path d="M13.6 16.8c.4-1.5 1.7-2.5 3.4-2.5 1 0 1.9.3 2.6.9"></path>
            </svg>
          </span>
          <span class="gallery-leaderboard-name">${renderLeaderboardMemberIdentityMarkup(entry)}</span>
          <span class="gallery-leaderboard-metric">${escapeHtml(`${entry.snapshotCount} approved${entry.totalLikes ? ` · ${entry.totalLikes} likes` : ""}`)}</span>
        </li>
      `).join("")}
    </ol>
  `;
}

function getGalleryTopMemberSummaryEntries(monthlySnapshots = []) {
  const actualEntries = buildGalleryTopMemberEntries(monthlySnapshots).slice(0, 3);
  if (actualEntries.length) {
    return actualEntries;
  }
  return GALLERY_TOP_MEMBERS_MOCK_ENTRIES.map((entry) => ({ ...entry }));
}

function renderGalleryTopMembersSummary(entries = []) {
  const summaryEntries = (entries || []).slice(0, 3);
  return `
    <article class="gallery-top-members-summary-card" aria-label="Top 3 Monthly Members">
      <div class="gallery-top-members-summary-head">
        <div class="gallery-top-members-summary-copy">
          <p class="eyebrow">Activity-Based</p>
          <h4>Top 3 Monthly Members</h4>
          <p class="gallery-top-members-summary-note">Approved public snapshots and likes this month.</p>
        </div>
      </div>
      <ol class="gallery-top-members-summary-list">
        ${summaryEntries.map((entry, index) => `
          <li class="gallery-top-members-summary-item ${getLeaderboardRankTone(index)}">
            <span class="gallery-top-members-summary-rank">#${index + 1}</span>
            <span class="gallery-top-members-summary-name">${renderLeaderboardMemberIdentityMarkup(entry)}</span>
            <span class="gallery-top-members-summary-metric">${escapeHtml(`${entry.snapshotCount} approved - ${entry.totalLikes} likes`)}</span>
          </li>
        `).join("")}
      </ol>
    </article>
  `;
}

function renderAppSectionHeaderIcon(iconType = "overview") {
  switch (iconType) {
    case "install":
      return `
        <svg class="section-title-icon" viewBox="0 0 24 24" focusable="false" aria-hidden="true">
          <rect x="7" y="3.5" width="10" height="17" rx="2.5"></rect>
          <path d="M12 7.5v7"></path>
          <path d="m9.5 12 2.5 2.5 2.5-2.5"></path>
          <path d="M10.5 17.5h3"></path>
        </svg>
      `;
    case "community":
      return `
        <svg class="section-title-icon" viewBox="0 0 24 24" focusable="false" aria-hidden="true">
          <path d="M8.5 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"></path>
          <path d="M15.5 10.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path>
          <path d="M5.5 17.5c.5-2 2.1-3.3 4.3-3.3s3.8 1.3 4.3 3.3"></path>
          <path d="M13.6 16.8c.4-1.5 1.7-2.5 3.4-2.5 1 0 1.9.3 2.6.9"></path>
          <path d="M11.2 18.8c1.2.9 2.7 1.4 4.3 1.4"></path>
          <path d="M12 5.5c2.8.2 5.1 1.5 6.4 3.7"></path>
        </svg>
      `;
    case "leaderboard":
      return `
        <svg class="section-title-icon" viewBox="0 0 24 24" focusable="false" aria-hidden="true">
          <path d="M5 17.5h14"></path>
          <path d="M7.5 17.5V11"></path>
          <path d="M12 17.5V7.5"></path>
          <path d="M16.5 17.5v-4"></path>
        </svg>
      `;
    case "members":
      return `
        <svg class="section-title-icon" viewBox="0 0 24 24" focusable="false" aria-hidden="true">
          <path d="M8.5 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"></path>
          <path d="M15.5 10.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path>
          <path d="M5.5 17.5c.5-2 2.1-3.3 4.3-3.3s3.8 1.3 4.3 3.3"></path>
          <path d="M13.8 17.2c.5-1.3 1.7-2.2 3.2-2.2 1.2 0 2.2.4 3 .9"></path>
        </svg>
      `;
    case "reports":
      return `
        <svg class="section-title-icon" viewBox="0 0 24 24" focusable="false" aria-hidden="true">
          <path d="M5.5 6.5A2.5 2.5 0 0 1 8 4h8a2.5 2.5 0 0 1 2.5 2.5v6A2.5 2.5 0 0 1 16 15H11l-4.5 4v-4H8A2.5 2.5 0 0 1 5.5 12.5Z"></path>
          <path d="M12 7.5v3.5"></path>
          <path d="M12 13.5h.01"></path>
        </svg>
      `;
    case "sources":
      return `
        <svg class="section-title-icon" viewBox="0 0 24 24" focusable="false" aria-hidden="true">
          <path d="M4.5 19.5h15"></path>
          <path d="M6.5 19.5V9.5"></path>
          <path d="M12 19.5V5.5"></path>
          <path d="M17.5 19.5v-7"></path>
          <path d="M5.5 9.5h2M11 5.5h2M16.5 12.5h2"></path>
        </svg>
      `;
    case "message-board":
      return `
        <svg class="section-title-icon" viewBox="0 0 24 24" focusable="false" aria-hidden="true">
          <path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v8a2.5 2.5 0 0 1-2.5 2.5H9L5 20v-3.5A2.5 2.5 0 0 1 2.5 14V9"></path>
          <path d="M8 8.5h8"></path>
          <path d="M8 12h5"></path>
        </svg>
      `;
    case "analytics":
      return `
        <svg class="section-title-icon" viewBox="0 0 24 24" focusable="false" aria-hidden="true">
          <path d="M4.5 19.5h15"></path>
          <path d="M6.5 19.5V13"></path>
          <path d="M11.5 19.5V8"></path>
          <path d="M16.5 19.5V10.5"></path>
          <path d="m5.5 9.5 4-3 3 2 6-4"></path>
        </svg>
      `;
    case "moderation":
    case "review":
      return `
        <svg class="section-title-icon" viewBox="0 0 24 24" focusable="false" aria-hidden="true">
          <path d="M8 4.75h8"></path>
          <path d="M14.75 3h-5.5a1.25 1.25 0 0 0-1.25 1.25v.5h8V4.25A1.25 1.25 0 0 0 14.75 3Z"></path>
          <path d="M7.5 4.75H6.75A1.75 1.75 0 0 0 5 6.5v11.75C5 19.216 5.784 20 6.75 20h10.5c.966 0 1.75-.784 1.75-1.75V6.5c0-.966-.784-1.75-1.75-1.75H16.5"></path>
          <path d="M8.5 10.25h5.25"></path>
          <path d="M8.5 13.25h3.5"></path>
          <path d="M13.75 15.5 15 16.75l2.75-3"></path>
          <circle cx="16" cy="15.5" r="3.5"></circle>
        </svg>
      `;
    case "activity":
      return `
        <svg class="section-title-icon" viewBox="0 0 24 24" focusable="false" aria-hidden="true">
          <path d="M4.5 14h3l2.2-4 3.1 8 2.2-5H19.5"></path>
          <path d="M4.5 19.5h15"></path>
          <path d="M7.5 6.5h9"></path>
        </svg>
      `;
    case "following":
      return `
        <svg class="section-title-icon" viewBox="0 0 24 24" focusable="false" aria-hidden="true">
          <path d="M8.5 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"></path>
          <path d="M5.5 17.5c.5-2 2.1-3.3 4.3-3.3s3.8 1.3 4.3 3.3"></path>
          <path d="M16.5 8v6"></path>
          <path d="M13.5 11h6"></path>
        </svg>
      `;
    case "public-session":
      return `
        <svg class="section-title-icon" viewBox="0 0 24 24" focusable="false" aria-hidden="true">
          <path d="M8 4.5h6l3 3v12a1.5 1.5 0 0 1-1.5 1.5h-7A2.5 2.5 0 0 1 6 18.5v-11A3 3 0 0 1 9 4.5"></path>
          <path d="M14 4.5v3h3"></path>
          <path d="M9 12h6"></path>
          <path d="M9 15h4"></path>
        </svg>
      `;
    case "snapshots":
      return `
        <svg class="section-title-icon" viewBox="0 0 24 24" focusable="false" aria-hidden="true">
          <rect x="4" y="6" width="10" height="12" rx="2"></rect>
          <path d="M14 9h4a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-2"></path>
          <path d="m8 14 2-2 2 2"></path>
          <circle cx="10" cy="10" r="1"></circle>
        </svg>
      `;
    case "admin":
    default:
      return `
        <svg class="section-title-icon" viewBox="0 0 24 24" focusable="false" aria-hidden="true">
          <path d="M12 3.5 4.5 7.2V12c0 4.1 2.7 7.8 7.5 8.8 4.8-1 7.5-4.7 7.5-8.8V7.2L12 3.5Z"></path>
          <path d="M9.5 12.2 11 13.7l3.6-3.9"></path>
        </svg>
      `;
  }
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
  const topMembers = getGalleryTopMemberSummaryEntries(monthlySnapshots);

  const section = document.createElement("section");
  section.className = "card gallery-section gallery-leaderboard-section";
  section.innerHTML = `
    <div class="section-heading app-section-header">
      <div class="section-title-with-icon app-section-header-main">
        ${renderAppSectionHeaderIcon("leaderboard")}
        <div>
          <p class="eyebrow">Leaderboard Insights</p>
          <h3>Community Grow Rankings</h3>
          <p class="muted">Approved public snapshots only. Rankings use germination performance only, with a 3-snapshot minimum per source or seed variety.</p>
        </div>
      </div>
    </div>
    <div class="gallery-leaderboard-summary">
      ${renderGallerySeedTypeHighlights(thisMonthTopSeedType, allTimeTopSeedType)}
      ${renderGalleryTopMembersSummary(topMembers)}
    </div>
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
    <p class="gallery-leaderboard-disclaimer">Leaderboard results reflect performance within the KAN® System under user conditions - not the seed source.</p>
  `;

  return section;
}

function formatHomeGalleryRankingMetric(entry) {
  const averagePercent = Math.max(0, Number(entry?.averagePercent) || 0);
  return `${Math.round(averagePercent)}% avg${entry?.fastestCompletedDurationLabel ? ` · fastest ${entry.fastestCompletedDurationLabel}` : ""}`;
}

function buildHomeGalleryRankingsTeaserState() {
  const snapshots = getGallerySnapshotsForDisplay();
  const approvedPublicSnapshots = snapshots.filter((snapshot) => getGallerySnapshotDisplayStatus(snapshot) === "approved");
  const currentMonthKey = getLeaderboardMonthKey(new Date());
  const monthlySnapshots = approvedPublicSnapshots.filter((snapshot) => (
    getLeaderboardMonthKey(parseLeaderboardSnapshotDate(snapshot)) === currentMonthKey
  ));
  const topMemberEntry = buildGalleryTopMemberEntries(monthlySnapshots)[0]
    || (isMockDataEnabled() ? { ...GALLERY_TOP_MEMBERS_MOCK_ENTRIES[0] } : null);
  const rankings = {
    topMember: topMemberEntry,
    topSource: buildGalleryLeaderboardEntries(monthlySnapshots, "source")[0] || null,
    topVariety: buildGalleryLeaderboardEntries(monthlySnapshots, "variety")[0] || null,
    topSeedType: buildGallerySeedTypeHighlightEntry(monthlySnapshots),
  };

  return {
    snapshots,
    approvedPublicSnapshots,
    monthlySnapshots,
    rankings,
  };
}

function formatInstallPreviewElapsed(days, hours, minutes = 0) {
  const normalizedDays = Number.isFinite(Number(days)) ? Math.max(0, Math.floor(Number(days))) : 0;
  const normalizedHours = Number.isFinite(Number(hours)) ? Math.max(0, Math.floor(Number(hours))) : 0;
  const normalizedMinutes = Number.isFinite(Number(minutes)) ? Math.max(0, Math.floor(Number(minutes))) : 0;
  return formatElapsedMinutesShorthand((normalizedDays * 24 * 60) + (normalizedHours * 60) + normalizedMinutes);
}

function renderHomeGalleryRankingsTeaser() {
  const teaserState = buildHomeGalleryRankingsTeaserState();
  const { rankings } = teaserState;
  const rankingRows = [
    {
      label: "#1 Monthly Grow Member",
      toneClass: "is-gold",
      iconType: "member",
      entry: rankings.topMember,
      formatValue: (entry) => entry.name,
    },
    {
      label: "This Month Top Source",
      toneClass: "is-gold",
      iconType: "source",
      entry: rankings.topSource,
      formatValue: (entry) => `${entry.name} - ${formatHomeGalleryRankingMetric(entry)}`,
    },
    {
      label: "This Month Top Seed Variety",
      toneClass: "is-silver",
      iconType: "variety",
      entry: rankings.topVariety,
      formatValue: (entry) => `${entry.name} - ${formatHomeGalleryRankingMetric(entry)}`,
    },
    {
      label: "This Month Top Seed Type",
      toneClass: "is-bronze",
      iconType: "seed-type",
      entry: rankings.topSeedType,
      formatValue: (entry) => `${entry.name} - ${formatHomeGalleryRankingMetric(entry)}`,
    },
  ];

  return `
    <section class="card home-gallery-rankings-card" aria-labelledby="home-gallery-rankings-title">
      <div class="home-gallery-rankings-head">
        <div class="home-leaderboard-header app-section-header">
          <div class="section-title-with-icon home-leaderboard-header-main app-section-header-main">
            ${renderAppSectionHeaderIcon("community")}
            <div>
              <p class="eyebrow">Leaderboard Preview</p>
              <h3 id="home-gallery-rankings-title">Community Grow Rankings</h3>
              <p class="muted home-gallery-rankings-subtitle">Approved public snapshots only.</p>
            </div>
          </div>
          <a class="button button-secondary home-gallery-rankings-cta" href="#gallery">
            <span>View Community Grow</span>
            <span class="home-gallery-rankings-cta-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                <path d="M5 12h14"></path>
                <path d="m13 7 5 5-5 5"></path>
              </svg>
            </span>
          </a>
        </div>
      </div>
      <ul class="home-gallery-rankings-list" aria-label="Community Grow ranking preview">
        ${rankingRows.map((row) => {
          const valueText = row.entry ? row.formatValue(row.entry) : "Not enough data yet";
          const valueMarkup = row.iconType === "member" && row.entry
            ? renderLeaderboardMemberIdentityMarkup(row.entry, "leaderboard-member-identity leaderboard-member-identity--compact")
            : escapeHtml(valueText);
          return `
            <li class="home-gallery-rankings-row ${row.toneClass}">
              <div class="home-gallery-rankings-row-main">
                <span class="home-gallery-rankings-row-icon" aria-hidden="true">
                  ${renderHomeGalleryRankingRowIcon(row.iconType)}
                </span>
                <span class="home-gallery-rankings-row-label">${escapeHtml(row.label)}</span>
              </div>
              <strong class="home-gallery-rankings-row-value${row.iconType === "member" && row.entry ? " home-gallery-rankings-row-value--member" : ""}">${valueMarkup}</strong>
            </li>
          `;
        }).join("")}
      </ul>
    </section>
  `;
}

function renderHomeGalleryRankingRowIcon(iconType = "source") {
  switch (iconType) {
    case "member":
      return `
        <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
          <path d="M4.5 8.5 8.2 11.3 12 6.5l3.8 4.8 3.7-2.8-1.8 8H6.3Z"></path>
          <path d="M8.5 17.5h7"></path>
          <path d="M9.5 20h5"></path>
        </svg>
      `;
    case "variety":
      return `
        <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
          <path d="M12 19v-4.5"></path>
          <path d="M12 14.5c0-3 1.9-5.5 4.5-6.7-.2 3.2-1.7 5.6-4.5 6.7Z"></path>
          <path d="M12 13.5c-2.6-1-4.1-3.4-4.3-6.4 2.5 1.1 4.3 3.5 4.3 6.4Z"></path>
          <path d="M9.6 19.1c.4-1.6 1.5-2.6 2.7-2.6s2.3 1 2.7 2.6"></path>
        </svg>
      `;
    case "seed-type":
      return `
        <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
          <path d="M12 5.5 14.3 10l4.9.7-3.6 3.5.9 4.8-4.5-2.3-4.5 2.3.9-4.8-3.6-3.5 4.9-.7Z"></path>
          <path d="M9.5 20.5h5"></path>
        </svg>
      `;
    case "source":
    default:
      return `
        <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
          <path d="M4.5 19.5h15"></path>
          <path d="M6.5 19.5V9.5"></path>
          <path d="M12 19.5V5.5"></path>
          <path d="M17.5 19.5v-7"></path>
          <path d="M5.5 9.5h2M11 5.5h2M16.5 12.5h2"></path>
        </svg>
      `;
  }
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
      aria-label="${isMock ? "Mock likes are preview-only" : (isLiked ? "Unlike this Community Grow snapshot" : "Like this Community Grow snapshot")}"
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

function getPublicMemberInitialsLabel(displayName = "") {
  const parts = String(displayName || "").trim().split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("");
  return initials || "CG";
}

function renderPublicMemberAvatarFallbackMarkup(displayName = "", className = "public-member-profile-avatar") {
  return `<span class="${escapeHtml(`${className} is-fallback`)}" aria-hidden="true">${escapeHtml(getPublicMemberInitialsLabel(displayName))}</span>`;
}

function renderPublicMemberAvatarMarkup(displayName = "", avatarUrl = "", className = "public-member-profile-avatar") {
  if (avatarUrl) {
    const fallbackMarkup = renderPublicMemberAvatarFallbackMarkup(displayName, className);
    return `<img src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(displayName || "Community member")}" class="${escapeHtml(className)}" data-fallback-html="${escapeHtml(fallbackMarkup)}" onerror="this.onerror=null; this.outerHTML=this.dataset.fallbackHtml;">`;
  }

  return renderPublicMemberAvatarFallbackMarkup(displayName, className);
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

function getSessionCompletedDurationMs(session) {
  if (!session) {
    return null;
  }

  const startedAt = parseSessionStartDateTime(session.date, session.time);
  const completedAt = parseCompletedAtValue(session.completedAt || "");
  return getElapsedDurationMs(startedAt, completedAt);
}

function getGallerySnapshotCompletedDurationMs(snapshot) {
  if (!snapshot) {
    return null;
  }

  const linkedSession = getGallerySnapshotSession(snapshot);
  if (linkedSession) {
    const linkedSessionDurationMs = getSessionCompletedDurationMs(linkedSession);
    if (Number.isFinite(linkedSessionDurationMs)) {
      return linkedSessionDurationMs;
    }
  }

  const sessionDate = String(snapshot?.sessionDate || "").trim();
  const sessionTime = String(snapshot?.sessionTime || snapshot?.session_time || "").trim();
  const startedAt = sessionDate
    ? parseSessionStartDateTime(sessionDate, sessionTime || "00:00")
    : null;
  const completedAt = parseCompletedAtValue(snapshot?.completedAt || snapshot?.completed_at || "");
  return getElapsedDurationMs(startedAt, completedAt);
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
      appState.gallerySnapshotsLoaded = true;
      logGrowGalleryDebug("refreshGallerySnapshots:complete", {
        reason,
        previousSignature,
        nextSignature,
      });

      const hashRoute = window.location.hash || "";
      const pathRoute = window.location.pathname.replace(/^\/+/, "");
      const isGalleryRoute = hashRoute.startsWith("#gallery") || pathRoute === "admin/gallery-moderation";
      const isPublicSessionRoute = hashRoute.startsWith("#sessions/public/");
      const isPublicMemberRoute = hashRoute.startsWith("#members/");
      const isGrowNetworkRoute = hashRoute.startsWith("#network");
      if (isGalleryRoute && previousSignature !== nextSignature) {
        logGrowGalleryDebug("refreshGallerySnapshots:rerender", {
          reason,
          targetSnapshotId,
        });
        renderGallery(targetSnapshotId);
      } else if ((isPublicSessionRoute || isPublicMemberRoute || isGrowNetworkRoute) && previousSignature !== nextSignature) {
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

function getMockPublicSessionDetails(snapshot, scenario) {
  if (!scenario) {
    return getGallerySnapshotPublicSessionDetails(snapshot);
  }

  const startedAt = String(scenario.timeline?.startedAt || "").trim();
  const startedSessionDate = startedAt ? startedAt.slice(0, 10) : "";

  return {
    systemLabel: formatSnapshotSystemLabel(snapshot?.systemType || "KAN"),
    sourceLabel: scenario.sourceName,
    seedVarietyLabel: scenario.seedVarietyName,
    seedTypeLabel: scenario.seedTypeName,
    sexLabel: scenario.sexLabel,
    seedCountLabel: String(scenario.totalSeeds),
    germinatedLabel: String(scenario.totalPlanted),
    germinationRateLabel: `${scenario.successPercent}%`,
    sessionDateLabel: getGallerySnapshotSubmittedDateLabel({ sessionDate: startedSessionDate }),
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
    updated_at: session.updatedAt || session.createdAt || new Date().toISOString(),
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
    filterPaperDeducted: getSessionFilterPaperDeducted({ id: row.id }),
    partitions: Array.isArray(row.partitions) ? row.partitions : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.last_updated_at || "",
  };
}

function updateAuthStatus() {
  if (!authStatus) {
    return;
  }

  setTopbarNavigationReadyState();

  if (isSupabaseConfigured() && !appState.authReady) {
    authStatus.innerHTML = `<span class="auth-pill">Checking session...</span>`;
    syncAdminNavigationVisibility();
    syncGrowNetworkNavigationVisibility();
    syncMobileNavigationMenu();
    return;
  }

  if (!isSupabaseConfigured()) {
    authStatus.innerHTML = `<span class="auth-pill">Supabase setup needed</span>`;
    syncAdminNavigationVisibility();
    syncGrowNetworkNavigationVisibility();
    syncMobileNavigationMenu();
    return;
  }

  if (!appState.user) {
    authStatus.innerHTML = `
      <span class="auth-pill">Signed out</span>
      <button type="button" class="button button-primary auth-sign-in-button" data-auth-sign-in="true">Sign In</button>
    `;
    authStatus.querySelector("[data-auth-sign-in='true']")?.addEventListener("click", () => {
      openAuthModal();
    });
    syncAdminNavigationVisibility();
    syncGrowNetworkNavigationVisibility();
    syncMobileNavigationMenu();
    return;
  }

  closeAuthModal();
  const currentUserEmail = appState.currentUserEmail || getNormalizedUserEmail(appState.user);
  console.log("[Cannakan Admin Nav] Account menu render", {
    currentEmail: appState.user?.email || "",
    normalizedEmail: currentUserEmail,
    isAdminResult: hasResolvedAdminAccess(),
    adminDropdownItemRendered: false,
  });

  authStatus.innerHTML = `
    <div class="account-menu-root" data-account-menu-root>
      <span class="auth-pill auth-user-email">${escapeHtml(appState.user?.email || getProfileDisplayName())}</span>
      <button
        id="account-menu-trigger"
        class="button button-secondary account-menu-trigger account-menu-trigger--avatar"
        type="button"
        aria-label="Open profile menu"
        aria-haspopup="menu"
        aria-expanded="${appState.accountMenuOpen ? "true" : "false"}"
      >
        ${renderProfileAvatarMarkup({
          avatarUrl: appState.profile?.avatarUrl || "",
          displayName: getProfileDisplayName(),
          className: "auth-avatar",
          fallbackClassName: "auth-avatar auth-avatar-fallback",
        })}
      </button>
      <div class="account-dropdown ${appState.accountMenuOpen ? "is-open" : ""}" ${appState.accountMenuOpen ? "" : "hidden"} role="menu" aria-label="Account menu">
        <button id="account-profile-link" class="account-menu-item" type="button" role="menuitem">
          ${getMenuIconMarkup("profile")}
          <span>Profile</span>
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
  syncAdminNavigationVisibility();
  syncGrowNetworkNavigationVisibility();
  syncMobileNavigationMenu();

  menuRoot?.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  trigger?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleAccountMenu();
  });

  dropdown?.querySelector("#account-profile-link")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    navigateToProfileRoute();
  });

  dropdown?.querySelector("#account-sign-out")?.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeAccountMenu();
    appState.userRole = "user";
    appState.isAdmin = false;
    updateAuthStatus();
    safeRender();
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

function readBlobAsDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read the uploaded image."));
    reader.readAsDataURL(blob);
  });
}

async function prepareImageDataUrlForStorage(file, maxDimension = MAX_IMAGE_DIMENSION, quality = 0.84) {
  const preparedImage = await prepareImageForUpload(file, maxDimension, quality);
  return readBlobAsDataUrl(preparedImage.blob || file);
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
    usageConsentCheckbox: options.usageConsentCheckbox || null,
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
  if (state.usageConsentCheckbox) {
    state.usageConsentCheckbox.checked = false;
    state.usageConsentCheckbox.addEventListener("change", () => {
      syncSnapshotShareActionAvailability(state);
    });
  }
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
        setSnapshotMessage(state, "Removal request noted. Contact support for published Community Grow changes.");
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
          ? "Snapshot removed. You can submit a new Community Grow snapshot now."
          : "Snapshot withdrawn from Community Grow.",
      );
    } catch (error) {
      setSnapshotMessage(state, error.message || "Could not remove this snapshot from Community Grow.", true);
    }
  });
}

function getSnapshotDestination(state) {
  const selectedInput = state?.destinationInputs?.find((input) => input.checked);
  return selectedInput?.value || "social";
}

const EXISTING_GALLERY_SNAPSHOT_MESSAGE = "Only one submission per session.";
const EXISTING_GALLERY_SNAPSHOT_SOCIAL_ONLY_MESSAGE = "This session has already been submitted to Community Grow.";
const DUPLICATE_GALLERY_SNAPSHOT_IMAGE_MESSAGE = "This snapshot image is already being used in Community Grow.";

function syncSnapshotShareActionAvailability(state) {
  if (!state?.shareButton) {
    return;
  }

  const hasGeneratedSnapshot = Boolean(state.generatedBlob);
  const hasConsent = Boolean(state.usageConsentCheckbox?.checked);
  if (!hasGeneratedSnapshot || !hasConsent) {
    state.shareButton.setAttribute("disabled", "disabled");
    return;
  }

  state.shareButton.removeAttribute("disabled");
}

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
      state.galleryNote.textContent = "Save this session before submitting anything to Community Grow. Private notes stay private.";
    } else if (destination === "social") {
      state.galleryNote.textContent = "Social only keeps this snapshot private to you. Private notes stay private.";
    } else if (destination === "gallery") {
      state.galleryNote.textContent = currentStatus === "pending_review"
        ? "Submitted for review. This snapshot will not be shared socially. Private notes stay private."
        : "This snapshot will be submitted to Community Grow for review only. Private notes stay private.";
    } else if (!canPublish) {
      state.galleryNote.textContent = "Save this session before submitting anything to Community Grow. Private notes stay private.";
    } else if (currentStatus === "pending_review") {
      state.galleryNote.textContent = "Submitted for review. Social sharing will still work normally. Private notes stay private.";
    } else if (currentStatus === "approved") {
      state.galleryNote.textContent = "Approved and visible in Community Grow. Social sharing will still work normally. Private notes stay private.";
    } else if (currentStatus === "rejected") {
      state.galleryNote.textContent = "This snapshot was rejected. Use Social + Community Grow or Community Grow only to resubmit. Private notes stay private.";
    } else {
      state.galleryNote.textContent = "This snapshot will be shared socially and submitted to Community Grow for review. Private notes stay private.";
    }
  }

  if (state.unpublishButton) {
    const ownerAction = publishedEntry?.userId === appState.user?.id
      ? getOwnerGalleryAction(publishedEntry)
      : null;
    state.unpublishButton.hidden = !ownerAction;
    state.unpublishButton.disabled = false;
    state.unpublishButton.dataset.galleryOwnerAction = ownerAction?.mode || "";
    state.unpublishButton.textContent = ownerAction?.label || "Remove from Community Grow";
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
      usageConsent: Boolean(state.usageConsentCheckbox?.checked),
    });
    logGrowGalleryDebug("maybePublishSnapshotFromState:publish-result", {
      sessionId: session?.id || "",
      publishedSnapshotId: published?.id || "",
      publishedStatus: published?.status || "",
      publishedUserId: published?.userId || "",
    });
    await persistSnapshotStateForSection(state, buildSessionSnapshotStateFromGallerySnapshot(published, getSnapshotStateForSection(state)));
    syncSnapshotGalleryControls(state);
    setSnapshotMessage(state, "Snapshot submitted to Community Grow for review.");
    void refreshGallerySnapshots(`post-publish:${published?.id || "unknown"}`, published?.id || "");
    return { published, blocked: false };
  } catch (error) {
    console.error("Grow Gallery publish flow failed", {
      sessionId: session?.id || "",
      destination,
      snapshotData,
      error,
    });
    setSnapshotMessage(state, error.message || "Could not publish this snapshot to Community Grow.", true);
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
    syncSnapshotShareActionAvailability(state);
    return;
  }
  state.downloadButton?.removeAttribute("disabled");
  state.resetButton?.removeAttribute("disabled");
  syncSnapshotShareActionAvailability(state);
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
    <article class="snapshot-confirmation-card" aria-label="Community Grow submission confirmation">
      <p class="eyebrow snapshot-confirmation-eyebrow">Community Grow</p>
      <h4 class="snapshot-confirmation-title">Snapshot submitted to Community Grow</h4>
      <p class="snapshot-confirmation-time">Submitted ${escapeHtml(submittedDate)}</p>
      <a class="button button-primary snapshot-confirmation-button" href="${escapeHtml(galleryRoute)}">Go to Community Grow</a>
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
          <span>Include my profile name & image with this snapshot in Community Grow</span>
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
  const sourceDetails = getPrimaryPartitionSourceDetails(source.partitions || []);

  return {
    sessionName: source.sessionName || "Session",
    dateLabel: formatSessionNameDate(source.date),
    systemType: source.systemType || "KAN",
    systemLabel: formatSnapshotSystemLabel(source.systemType || "KAN"),
    sourceId: sourceDetails.sourceId,
    sourceName: sourceDetails.sourceName,
    sourceLogoUrl: sourceDetails.sourceLogoUrl,
    seedVarietyName: sourceDetails.seedVarietyName,
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
  closeAllCustomSelects();
  clearSessionTimerInterval();
  closeMobileNavigation();
  updateAuthStatus();
  syncInstallPromptBanner();
  syncMockDataBanner();
  updateNavState();
  appState.currentRouteHash = normalizeNavigationHash(window.location.hash || "#home");
  const pathRoute = getCurrentAppPathRoute();
  const rawRoute = getCurrentAppRawRoute();
  const [route, id, subroute] = rawRoute.split("/");
  const isEditableSessionRoute = route === "new" || (route === "sessions" && id && id !== "public");
  if (!isEditableSessionRoute) {
    clearUnsavedChangesContext();
  }
  const finalizeRender = (pageContext = getCurrentSiteAnalyticsPageContext()) => {
    syncInstallPromptBanner();
    syncMockDataBanner();
    bindContactAdminButtons(app);
    bindContactAdminButtons(authStatus);
    bindContactAdminButtons(appFooter);
    ensureBackToTopButton();
    requestBackToTopButtonVisibilitySync();
    trackSiteAnalyticsPageView(pageContext);
    void refreshSiteVisitorPresence("render", pageContext);
  };
  const renderProtectedRouteSignInPrompt = () => {
    const homeHash = replaceLocationHashWithoutNavigation("#home");
    appState.currentRouteHash = homeHash;
    updateNavState();
    renderHome();
    finalizeRender(buildSiteAnalyticsPageContext({
      pageGroup: "home",
      pageKey: "home",
      pageLabel: "Home",
      pagePath: "#home",
    }));
    queueMicrotask(() => {
      openAuthModal({ dismissHash: "#home" });
    });
  };

  if (!appState.initialized || appState.loading || !appState.authReady) {
    const shouldRenderAnnouncementDuringLoad = route === "home" || !route;
    app.innerHTML = `
      <section class="card"><p class="muted">Loading Cannakan® Grow...</p></section>
      ${shouldRenderAnnouncementDuringLoad ? renderHomeAnnouncementCard() : ""}
    `;
    bindMessageBoardImageFallbacks(app);
    ensureBackToTopButton();
    requestBackToTopButtonVisibilitySync();
    void refreshSiteVisitorPresence("loading");
    return;
  }

  if (!isSupabaseConfigured()) {
    renderSetupScreen();
    finalizeRender(buildSiteAnalyticsPageContext({
      pageGroup: "setup",
      pageKey: "setup",
      pageLabel: "Setup",
      pagePath: "#setup",
    }));
    return;
  }

  if (route === "gallery") {
    renderGallery(id || "");
    finalizeRender(buildSiteAnalyticsPageContext({
      pageGroup: "gallery",
      pageKey: "gallery",
      pageLabel: "Community Grow",
      pagePath: rawRoute ? `#${rawRoute}` : "#gallery",
    }));
    void refreshGallerySnapshots("route:gallery", id || "");
    return;
  }

  if (route === "admin" && !id) {
    if (!appState.user) {
      renderProtectedRouteSignInPrompt();
      return;
    }
    if (!hasCompletedProfile()) {
      renderProfileSetupScreen();
      finalizeRender(buildSiteAnalyticsPageContext({
        pageGroup: "profile",
        pageKey: "profile-setup",
        pageLabel: "Profile Setup",
        pagePath: "#admin",
      }));
      return;
    }
    if (!hasResolvedAdminAccess()) {
      renderAdminAccessDeniedScreen();
      finalizeRender(buildSiteAnalyticsPageContext({
        pageGroup: "admin",
        pageKey: "admin-access-denied",
        pageLabel: "Admin Access Denied",
        pagePath: "#admin",
      }));
      return;
    }
    renderAdminPage();
    finalizeRender(buildSiteAnalyticsPageContext({
      pageGroup: "admin",
      pageKey: "admin",
      pageLabel: "Admin",
      pagePath: "#admin",
    }));
    void refreshGallerySnapshots("route:admin-dashboard");
    return;
  }

  if (route === "admin" && id === "gallery-moderation") {
    if (!appState.user) {
      renderProtectedRouteSignInPrompt();
      return;
    }
    if (!hasCompletedProfile()) {
      renderProfileSetupScreen();
      finalizeRender(buildSiteAnalyticsPageContext({
        pageGroup: "profile",
        pageKey: "profile-setup",
        pageLabel: "Profile Setup",
        pagePath: "/admin/gallery-moderation",
      }));
      return;
    }
    if (!hasResolvedAdminAccess()) {
      renderAdminAccessDeniedScreen();
      finalizeRender(buildSiteAnalyticsPageContext({
        pageGroup: "admin",
        pageKey: "admin-access-denied",
        pageLabel: "Admin Access Denied",
        pagePath: "/admin/gallery-moderation",
      }));
      return;
    }
    renderGalleryReview();
    finalizeRender(buildSiteAnalyticsPageContext({
      pageGroup: "admin",
      pageKey: "admin-gallery-moderation",
      pageLabel: "Admin Community Grow Moderation",
      pagePath: "/admin/gallery-moderation",
    }));
    void refreshGallerySnapshots("route:admin-gallery-review", subroute || "");
    return;
  }

  if (route === "sessions" && id === "public" && subroute) {
    renderPublicSessionDetail(subroute);
    finalizeRender(buildSiteAnalyticsPageContext({
      pageGroup: "gallery",
      pageKey: "public-session",
      pageLabel: "Public Session",
      pagePath: `#sessions/public/${subroute}`,
    }));
    void refreshGallerySnapshots("route:public-session", subroute);
    return;
  }

  if (route === "members" && id) {
    if (!appState.user) {
      renderProtectedRouteSignInPrompt();
      return;
    }
    const memberId = decodeURIComponent(id);
    renderPublicMemberProfile(memberId);
    finalizeRender(buildSiteAnalyticsPageContext({
      pageGroup: "gallery",
      pageKey: "member-profile",
      pageLabel: "Member Profile",
      pagePath: `#members/${id}`,
    }));
    void refreshGallerySnapshots("route:public-member-profile");
    void refreshPublicMemberProfile(memberId, { reason: "route:public-member-profile" });
    void refreshPublicMemberFollowSummary(memberId, { reason: "route:public-member-profile" });
    void refreshPublicMemberFollowLists(memberId, { reason: "route:public-member-profile" });
    if (appState.user?.id) {
      void refreshGrowNetworkFollowing({ force: true, reason: "route:public-member-profile" });
    }
    if (appState.user?.id && appState.user.id !== memberId) {
      void refreshPublicMemberFollowState(memberId, { reason: "route:public-member-profile" });
    }
    return;
  }

  if (route === "network") {
    if (!appState.user) {
      renderProtectedRouteSignInPrompt();
      return;
    }
    if (!hasCompletedProfile()) {
      renderProfileSetupScreen();
      finalizeRender(buildSiteAnalyticsPageContext({
        pageGroup: "profile",
        pageKey: "profile-setup",
        pageLabel: "Profile Setup",
        pagePath: "#network",
      }));
      return;
    }
    renderGrowNetworkPage();
    finalizeRender(buildSiteAnalyticsPageContext({
      pageGroup: "gallery",
      pageKey: "grow-network",
      pageLabel: "Grow Network",
      pagePath: "#network",
    }));
    void refreshGallerySnapshots("route:grow-network");
    void refreshGrowNetworkFollowing({ force: true, reason: "route:grow-network" });
    return;
  }

  if (route === "profile") {
    renderProfilePage();
    finalizeRender(buildSiteAnalyticsPageContext({
      pageGroup: "profile",
      pageKey: "profile",
      pageLabel: "Profile",
      pagePath: pathRoute === "profile" && isUsingPathRoute("profile") ? "/profile" : "#profile",
    }));
    return;
  }

  if (route === "home" || !route) {
    renderHome();
    finalizeRender(buildSiteAnalyticsPageContext({
      pageGroup: "home",
      pageKey: "home",
      pageLabel: "Home",
      pagePath: "#home",
    }));
    return;
  }

  if (!appState.user && routeRequiresSignedInUser(window.location.hash || "#home")) {
    renderProtectedRouteSignInPrompt();
    return;
  }

  if (!hasCompletedProfile()) {
    renderProfileSetupScreen();
    finalizeRender(buildSiteAnalyticsPageContext({
      pageGroup: "profile",
      pageKey: "profile-setup",
      pageLabel: "Profile Setup",
      pagePath: rawRoute ? `#${rawRoute}` : "#profile",
    }));
    return;
  }

  if (route === "new") {
    if (id === "KAN" || id === "TRA") {
      appState.newSessionSystemType = id;
      renderSessionForm(id);
      finalizeRender(buildSiteAnalyticsPageContext({
        pageGroup: "sessions",
        pageKey: "new-session",
        pageLabel: "New Session",
        pagePath: rawRoute ? `#${rawRoute}` : "#new",
      }));
      return;
    }

    appState.newSessionReturnHash = appState.newSessionReturnHash || "#sessions";
    renderSessionsList();
    finalizeRender(buildSiteAnalyticsPageContext({
      pageGroup: "sessions",
      pageKey: "sessions",
      pageLabel: "Sessions",
      pagePath: "#new",
    }));
    openNewSessionSystemModal();
    return;
  }

  if (route === "sessions" && id) {
    renderSessionDetail(id);
    finalizeRender(buildSiteAnalyticsPageContext({
      pageGroup: "sessions",
      pageKey: "session-detail",
      pageLabel: "Session Detail",
      pagePath: rawRoute ? `#${rawRoute}` : "#sessions",
    }));
    return;
  }

  if (route === "sessions") {
    renderSessionsList();
    finalizeRender(buildSiteAnalyticsPageContext({
      pageGroup: "sessions",
      pageKey: "sessions",
      pageLabel: "Sessions",
      pagePath: "#sessions",
    }));
    return;
  }
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

function renderAuthScreen(options = {}) {
  const { autoOpenModal = false } = options;
  app.replaceChildren(cloneTemplate(templates.auth));
  bindAuthForm(document.querySelector("#auth-form"), {
    messageElement: document.querySelector("#auth-message"),
  });
  if (autoOpenModal) {
    queueMicrotask(() => {
      openAuthModal();
    });
  }
}

function renderProfileSettingsToggleMarkup({
  name = "",
  title = "",
  description = "",
  checked = false,
  disabled = false,
} = {}) {
  return `
    <label class="profile-toggle-row${disabled ? " is-disabled" : ""}">
      <span class="profile-toggle-copy">
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(description)}</span>
      </span>
      <span class="profile-toggle-control">
        <input type="checkbox" name="${escapeHtml(name)}" ${checked ? "checked" : ""} ${disabled ? "disabled" : ""}>
        <span class="profile-toggle-switch" aria-hidden="true"></span>
      </span>
    </label>
  `;
}

function renderProfileSignInPrompt() {
  app.innerHTML = `
    <section class="card profile-page profile-page--sign-in" aria-label="Profile sign-in prompt">
      <div class="profile-page-glow" aria-hidden="true"></div>
      <header class="profile-page-header">
        <div class="profile-page-hero">
          <span class="profile-page-badge" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"></path>
              <path d="M4.5 20a7.5 7.5 0 0 1 15 0"></path>
            </svg>
          </span>
          <div class="profile-page-copy">
            <p class="eyebrow">Account</p>
            <h2>Profile</h2>
            <p class="muted">Sign in to open your Cannakan Grow control center and manage account, notification, and community preferences.</p>
          </div>
        </div>
      </header>
      <div class="profile-sign-in-card">
        <strong>Your profile settings are waiting for you.</strong>
        <p>Sign in to manage notification preferences, privacy controls, and the settings that will power future profile tools.</p>
        <div class="profile-page-actions">
          <p class="profile-page-message">Only signed-in members can access the Profile page.</p>
          <div class="inline-actions">
            <button type="button" class="button button-primary" data-profile-sign-in="true">Sign In</button>
            <a class="button button-secondary" href="#home">Go Home</a>
          </div>
        </div>
      </div>
    </section>
  `;

  app.querySelector("[data-profile-sign-in='true']")?.addEventListener("click", () => {
    openAuthModal();
  });
}

function bindProfilePageForm(form) {
  if (!form || !appState.user) {
    return;
  }

  const messageElement = form.querySelector("#profile-settings-message");
  const submitButton = form.querySelector("#profile-settings-submit");
  const state = {
    saving: false,
  };

  const getFormState = () => ({
    notifySnapshot: Boolean(form.elements.notifySnapshot?.checked),
    notifyCompletion: Boolean(form.elements.notifyCompletion?.checked),
    notifyFollow: Boolean(form.elements.notifyFollow?.checked),
    notifyLike: Boolean(form.elements.notifyLike?.checked),
    notifyCommunityActivity: Boolean(form.elements.notifyCommunityActivity?.checked),
    showProfileInCommunityGrow: Boolean(form.elements.showProfileInCommunityGrow?.checked),
    allowFollowers: Boolean(form.elements.allowFollowers?.checked),
    showGrowStatsPublicly: Boolean(form.elements.showGrowStatsPublicly?.checked),
  });

  const setMessage = (message, isError = false) => {
    if (!messageElement) {
      return;
    }
    messageElement.textContent = message;
    messageElement.classList.toggle("is-error", Boolean(message && isError));
  };

  const setSavingState = (isSaving) => {
    state.saving = isSaving;
    if (submitButton instanceof HTMLButtonElement) {
      submitButton.disabled = isSaving;
      submitButton.textContent = isSaving ? "Saving..." : "Save Changes";
    }
  };

  const updateUnsavedState = () => {
    refreshUnsavedChangesState();
    if (!state.saving && !appState.unsavedChanges.hasUnsavedChanges && messageElement?.textContent === "You have unsaved changes.") {
      setMessage("");
    }
  };

  registerUnsavedChangesContext({
    pageHash: "#profile",
    getSignature: () => JSON.stringify(getFormState()),
    saveFn: async () => {
      form.requestSubmit();
    },
  });

  form.addEventListener("input", () => {
    updateUnsavedState();
    if (!state.saving && appState.unsavedChanges.hasUnsavedChanges) {
      setMessage("You have unsaved changes.");
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (state.saving) {
      return;
    }

    const nextValues = getFormState();
    const notificationPreferencesPayload = {
      notifySnapshot: nextValues.notifySnapshot,
      notifyCompletion: nextValues.notifyCompletion,
      notifyFollow: nextValues.notifyFollow,
      notifyLike: nextValues.notifyLike,
    };
    const profilePageSettingsPayload = {
      notifyCommunityActivity: nextValues.notifyCommunityActivity,
      showProfileInCommunityGrow: nextValues.showProfileInCommunityGrow,
      allowFollowers: nextValues.allowFollowers,
      showGrowStatsPublicly: nextValues.showGrowStatsPublicly,
    };

    setSavingState(true);
    setMessage("");

    const warnings = [];

    try {
      appState.notificationPreferences = await saveUserNotificationPreferences(notificationPreferencesPayload);
    } catch (error) {
      warnings.push(`Notification preferences used a safe fallback: ${error.message || "Settings are unavailable right now."}`);
      appState.notificationPreferences = normalizeUserNotificationPreferencesRow(notificationPreferencesPayload);
    }

    try {
      saveStoredProfilePageSettings(appState.user.id, profilePageSettingsPayload);
    } catch (error) {
      warnings.push(error.message || "Privacy settings could not be saved in this browser.");
    }

    if (!warnings.length) {
      markUnsavedChangesSaved();
      setMessage("Profile settings saved.");
    } else {
      markUnsavedChangesSaved();
      setMessage(warnings.join(" "), false);
    }

    setSavingState(false);
  });
}

function renderProfilePage() {
  if (!appState.user) {
    renderProfileSignInPrompt();
    return;
  }

  const displayName = String(appState.profile?.username || "").trim();
  const email = String(appState.user?.email || appState.profile?.email || "").trim() || "No email on file";
  const notificationPreferences = appState.notificationPreferences || DEFAULT_NOTIFICATION_PREFERENCES;
  const profilePageSettings = getCurrentProfilePageSettings();
  const profileSetupComplete = hasCompletedProfile();
  const memberSinceValue = appState.profile?.createdAt || appState.user?.created_at || "";
  const memberSinceLabel = memberSinceValue ? formatPublicMemberJoinedDateLabel(memberSinceValue) : "Not available yet";
  const accountInfoRows = [
    { label: "Email", value: email },
    { label: "Display Name", value: displayName || "Choose a display name in Edit Profile" },
    { label: "Member Since", value: memberSinceLabel },
  ];
  const usesNotificationFallback = Boolean(appState.notificationPreferencesTableUnavailable);

  app.innerHTML = `
    <section class="card profile-page" aria-label="Profile and settings">
      <div class="profile-page-glow" aria-hidden="true"></div>
      <header class="profile-page-header">
        <div class="profile-page-hero">
          ${renderProfileAvatarMarkup({
            avatarUrl: appState.profile?.avatarUrl || "",
            displayName: getProfileDisplayName(),
            className: "profile-page-avatar",
            fallbackClassName: "profile-page-avatar is-fallback",
          })}
          <div class="profile-page-copy">
            <p class="eyebrow">Control Center</p>
            <h2>${escapeHtml(getProfileDisplayName())}</h2>
            <p class="profile-page-email">${escapeHtml(email)}</p>
          </div>
        </div>
        <div class="profile-page-header-actions">
          <span class="profile-status-badge is-member">Member</span>
          <button type="button" class="button button-secondary profile-page-edit-button" data-profile-open-editor="true">Edit Profile</button>
        </div>
      </header>
      <form id="profile-settings-form" class="profile-settings-form">
        <div class="profile-page-layout">
          <article class="profile-section-card">
            <div class="profile-section-heading">
              <div>
                <p class="eyebrow">Account Info</p>
                <h3>Account Info</h3>
                <p class="profile-section-subtitle">Your Cannakan Grow identity details.</p>
              </div>
              <span class="profile-status-badge ${profileSetupComplete ? "is-complete" : "is-pending"}">${escapeHtml(profileSetupComplete ? "Profile ready" : "Setup incomplete")}</span>
            </div>
            <div class="profile-account-grid">
              ${accountInfoRows.map((row) => `
                <div class="profile-detail-card">
                  <span class="profile-detail-label">${escapeHtml(row.label)}</span>
                  <strong class="profile-detail-value">${escapeHtml(row.value)}</strong>
                </div>
              `).join("")}
            </div>
            <p class="profile-section-note">${profileSetupComplete
              ? "Update your display name and avatar any time with Edit Profile."
              : "Complete your display name and avatar so your public and community profile can stay consistent."}</p>
          </article>
          <article class="profile-section-card">
            <div class="profile-section-heading">
              <div>
                <p class="eyebrow">Notifications</p>
                <h3>Notification Preferences</h3>
                <p class="profile-section-subtitle">Control the alerts Cannakan Grow sends and previews for your account.</p>
              </div>
            </div>
            <div class="profile-toggle-list">
              ${renderProfileSettingsToggleMarkup({
                name: "notifySnapshot",
                title: "Email notifications",
                description: "Receive account and grow updates by email.",
                checked: notificationPreferences.notifySnapshot !== false,
              })}
              ${renderProfileSettingsToggleMarkup({
                name: "notifyCompletion",
                title: "Push notifications",
                description: "Stay on top of reminders and grow milestones.",
                checked: notificationPreferences.notifyCompletion !== false,
              })}
              ${renderProfileSettingsToggleMarkup({
                name: "notifyFollow",
                title: "Follow notifications",
                description: "Know when growers start following you.",
                checked: notificationPreferences.notifyFollow !== false,
              })}
              ${renderProfileSettingsToggleMarkup({
                name: "notifyLike",
                title: "Like notifications",
                description: "Get notified when your sessions or snapshots are liked.",
                checked: notificationPreferences.notifyLike !== false,
              })}
              ${renderProfileSettingsToggleMarkup({
                name: "notifyCommunityActivity",
                title: "Community activity",
                description: "Preview upcoming Community Grow activity alerts in this browser.",
                checked: profilePageSettings.notifyCommunityActivity === true,
              })}
            </div>
            <p class="profile-section-note">${usesNotificationFallback
              ? "Notification preferences are currently using safe defaults or fallback storage because the settings table is unavailable."
              : "Notification settings are connected to your saved Cannakan Grow preferences."}</p>
          </article>
          <article class="profile-section-card">
            <div class="profile-section-heading">
              <div>
                <p class="eyebrow">Privacy</p>
                <h3>Privacy & Community</h3>
                <p class="profile-section-subtitle">Choose how visible your profile is in Community Grow and Grow Network.</p>
              </div>
            </div>
            <div class="profile-toggle-list">
              ${renderProfileSettingsToggleMarkup({
                name: "showProfileInCommunityGrow",
                title: "Show profile in Community Grow",
                description: "Display your identity when you share public grow activity.",
                checked: profilePageSettings.showProfileInCommunityGrow !== false,
              })}
              ${renderProfileSettingsToggleMarkup({
                name: "allowFollowers",
                title: "Allow followers",
                description: "Let other growers follow your public profile.",
                checked: profilePageSettings.allowFollowers !== false,
              })}
              ${renderProfileSettingsToggleMarkup({
                name: "showGrowStatsPublicly",
                title: "Show grow stats publicly",
                description: "Include high-level grow performance in public-facing profile surfaces.",
                checked: profilePageSettings.showGrowStatsPublicly !== false,
              })}
            </div>
            <p class="profile-section-note">These community preferences are saved safely in this browser until broader backend profile settings are added.</p>
          </article>
          <article class="profile-section-card">
            <div class="profile-section-heading">
              <div>
                <p class="eyebrow">Future Settings</p>
                <h3>Future Settings</h3>
                <p class="profile-section-subtitle">Reserved slots for profile tools already planned into the settings structure.</p>
              </div>
            </div>
            <div class="profile-future-list" aria-label="Future settings placeholders">
              <div class="profile-future-item is-disabled">
                <strong>Avatar Upload</strong>
                <span>Coming soon</span>
              </div>
              <div class="profile-future-item is-disabled">
                <strong>Bio</strong>
                <span>Coming soon</span>
              </div>
              <div class="profile-future-item is-disabled">
                <strong>Linked Socials</strong>
                <span>Coming soon</span>
              </div>
            </div>
          </article>
        </div>
        <div class="profile-page-actions">
          <p id="profile-settings-message" class="profile-page-message" role="status" aria-live="polite"></p>
          <div class="inline-actions">
            <button id="profile-settings-submit" type="submit" class="button button-primary">Save Changes</button>
          </div>
        </div>
      </form>
    </section>
  `;

  app.querySelector("[data-profile-open-editor='true']")?.addEventListener("click", () => {
    openProfileEditor();
  });

  bindProfilePageForm(app.querySelector("#profile-settings-form"));
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
    copy.textContent = "Choose the username you want Cannakan Grow to show in the app. You can also add an optional profile picture and set notification preferences.";
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
    initialNotificationPreferences: appState.notificationPreferences,
    onSaved: () => {
      window.location.hash = "#home";
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
    copy.textContent = "Update the name, avatar, and notification preferences used in Cannakan Grow.";
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
    initialNotificationPreferences: appState.notificationPreferences,
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
  const notificationPreferences = options.initialNotificationPreferences || appState.notificationPreferences || DEFAULT_NOTIFICATION_PREFERENCES;
  const usernameInput = form.elements.username;
  const avatarInput = form.elements.avatar;
  const message = form.querySelector("#profile-message");
  const preview = form.querySelector("#profile-avatar-preview");
  const removeButton = form.querySelector("#profile-remove-avatar");
  const deleteButton = form.querySelector("#profile-delete-account");
  const submitButton = form.querySelector("#profile-submit");
  const notificationDefaultsNote = form.querySelector("#profile-preferences-default-note");
  const notifyEmailInput = form.elements.notifyEmail;
  const notifyPushInput = form.elements.notifyPush;
  const notifyFollowInput = form.elements.notifyFollow;
  const notifyLikeInput = form.elements.notifyLike;
  const defaultSubmitLabel = submitButton?.textContent || "Save Profile";
  const state = {
    profile,
    removeAvatar: false,
    pendingFile: null,
    previewUrl: "",
  };

  const setProfileFormMessage = (text = "", tone = "") => {
    if (!message) {
      return;
    }
    message.textContent = text;
    message.classList.remove("is-error", "is-success", "is-warning");
    if (tone) {
      message.classList.add(`is-${tone}`);
    }
  };

  const syncNotificationPreferenceAvailability = () => {
    if (notificationDefaultsNote) {
      notificationDefaultsNote.hidden = !appState.notificationPreferencesTableUnavailable;
    }
  };

  usernameInput.value = profile?.username || "";
  if (notifyEmailInput) {
    notifyEmailInput.checked = notificationPreferences.notifySnapshot !== false;
  }
  if (notifyPushInput) {
    notifyPushInput.checked = notificationPreferences.notifyCompletion !== false;
  }
  if (notifyFollowInput) {
    notifyFollowInput.checked = notificationPreferences.notifyFollow !== false;
  }
  if (notifyLikeInput) {
    notifyLikeInput.checked = notificationPreferences.notifyLike !== false;
  }
  syncNotificationPreferenceAvailability();
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
      setProfileFormMessage("Images only. Please choose a valid profile picture.", "error");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setProfileFormMessage("Image is too large. Please choose an image under 12 MB.", "error");
      return;
    }

    if (state.previewUrl) {
      URL.revokeObjectURL(state.previewUrl);
    }

    state.pendingFile = file;
    state.removeAvatar = false;
    state.previewUrl = URL.createObjectURL(file);
    setProfileFormMessage("");
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
    setProfileFormMessage("");

    try {
      const scheduledProfile = await scheduleUserDeletion();
      const scheduledForLabel = formatSessionNameDate(scheduledProfile.deletionScheduledFor.slice(0, 10));
      appState.authNotice = `Account deletion is scheduled for ${scheduledForLabel}. Your app data has not been permanently removed yet. Contact support to fully remove login credentials.`;
      await appState.supabase?.auth.signOut();
    } catch (error) {
      console.error("[Cannakan Profile] Delete profile failed", error);
      setProfileFormMessage(error.message || "Could not delete your account data.", "error");
    } finally {
      deleteButton.disabled = false;
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    console.log("[Cannakan Profile] Save Profile clicked", {
      mode: options.mode || "setup",
      username: String(usernameInput.value || "").trim(),
      hasPendingAvatar: Boolean(state.pendingFile),
      removeAvatar: state.removeAvatar,
    });
    const username = String(usernameInput.value || "").trim();

    if (!username) {
      setProfileFormMessage("Please enter a username before saving.", "error");
      usernameInput.reportValidity();
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Saving...";
    }
    if (deleteButton) {
      deleteButton.disabled = true;
    }
    setProfileFormMessage("");

    try {
      const warnings = [];
      let avatarUrl = state.profile?.avatarUrl || "";
      let avatarPath = state.profile?.avatarPath || "";
      const notificationPreferencePayload = {
        notifySnapshot: Boolean(notifyEmailInput?.checked),
        notifyCompletion: Boolean(notifyPushInput?.checked),
        notifyFollow: Boolean(notifyFollowInput?.checked),
        notifyLike: Boolean(notifyLikeInput?.checked),
      };

      // Save the profile name first so avatar storage problems do not block the main profile save.
      appState.profile = await saveUserProfile({
        username,
        avatarUrl,
        avatarPath,
      });
      state.profile = appState.profile;

      if (state.removeAvatar) {
        const removedAvatarPath = avatarPath;
        avatarUrl = "";
        avatarPath = "";
        appState.profile = await saveUserProfile({
          username,
          avatarUrl,
          avatarPath,
        });
        state.profile = appState.profile;

        if (removedAvatarPath) {
          try {
            await removeProfileAvatarFromStorage(removedAvatarPath);
          } catch (error) {
            console.error("[Cannakan Profile] Avatar removal cleanup failed", error);
            warnings.push("Profile saved, but we could not remove the previous profile image from storage.");
          }
        }
      }

      if (state.pendingFile) {
        try {
          const previousAvatarPath = avatarPath;
          const uploadedAvatar = await uploadProfileAvatar(state.pendingFile);
          avatarUrl = uploadedAvatar.url;
          avatarPath = uploadedAvatar.path;
          appState.profile = await saveUserProfile({
            username,
            avatarUrl,
            avatarPath,
          });
          state.profile = appState.profile;

          if (previousAvatarPath) {
            try {
              await removeProfileAvatarFromStorage(previousAvatarPath);
            } catch (error) {
              console.error("[Cannakan Profile] Previous avatar cleanup failed", error);
              warnings.push("Profile saved and new image applied, but we could not clean up the previous image.");
            }
          }
        } catch (error) {
          console.error("[Cannakan Profile] Avatar upload/save warning", error);
          warnings.push(`Profile saved, but the profile image could not be saved: ${error.message || "Unknown image error."}`);
        }
      }

      try {
        appState.notificationPreferences = await saveUserNotificationPreferences(notificationPreferencePayload);
        syncNotificationPreferenceAvailability();
        if (appState.notificationPreferencesTableUnavailable) {
          warnings.push("Profile saved. Notification preferences are using defaults until preferences are enabled.");
        }
      } catch (error) {
        console.error("[Cannakan Profile] Notification preference save warning", error);
        warnings.push(`Profile saved, but notification preferences could not be saved: ${error.message || "Unknown settings error."}`);
        syncNotificationPreferenceAvailability();
      }

      if (state.previewUrl) {
        URL.revokeObjectURL(state.previewUrl);
        state.previewUrl = "";
      }
      state.pendingFile = null;
      state.removeAvatar = false;
      avatarInput.value = "";
      updateFileUploadName(avatarInput, []);
      renderProfileAvatarPreview(preview, removeButton, state, state.profile);

      if (warnings.length) {
        setProfileFormMessage(warnings.join(" "), "warning");
      } else {
        setProfileFormMessage("Profile saved.", "success");
      }

      window.setTimeout(() => {
        options.onSaved?.(appState.profile, {
          warnings,
        });
      }, 650);
    } catch (error) {
      console.error("[Cannakan Profile] Save profile failed", error);
      setProfileFormMessage(error.message || "Could not save your profile.", "error");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = defaultSubmitLabel;
      }
      if (deleteButton) {
        deleteButton.disabled = false;
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

function renderFilterPaperCardMarkup() {
  const inventory = getFilterPaperInventory();
  const status = getFilterPaperStatusMeta(inventory.count);
  const reminder = getFilterPaperReminder(inventory.count);
  const storeLabel = inventory.storeRegion === "EU" ? "cannakan.eu" : "cannakan.com";
  const statusLabel = getFilterPaperStatusDisplayLabel(status.key);

  return `
    <section class="card filter-paper-card filter-paper-card--${status.key}" data-filter-paper-sessions-card="true" aria-labelledby="filter-paper-card-title">
      <div class="filter-paper-card-head">
        <div>
          <p class="eyebrow">Supplies</p>
          <h3 id="filter-paper-card-title">Filter Papers</h3>
        </div>
        <span class="filter-paper-status-badge filter-paper-status-badge--${status.key}">${escapeHtml(statusLabel)}</span>
      </div>
      <div class="filter-paper-card-body">
        <p class="filter-paper-count">Filter Papers: <strong>${escapeHtml(String(inventory.count))}</strong> remaining</p>
        <p class="filter-paper-status-line">Status: <strong>${escapeHtml(statusLabel)}</strong></p>
        <p class="filter-paper-helper">Each completed session can automatically deduct 1 filter paper.</p>
        <p class="filter-paper-store">Store region: <strong>${escapeHtml(inventory.storeRegion)}</strong> - ${escapeHtml(storeLabel)}</p>
        <p class="filter-paper-auto-subtract ${inventory.autoSubtract ? "is-enabled" : "is-disabled"}">
          ${inventory.autoSubtract ? "Auto subtract is on." : "Auto subtract is off."}
        </p>
        <div class="filter-paper-actions">
          <button type="button" class="button button-secondary" data-filter-paper-edit="true">Update Count</button>
          <button type="button" class="button button-primary" data-filter-paper-reorder="true">${escapeHtml(FILTER_PAPER_REORDER_BUTTON_LABEL)}</button>
        </div>
        ${reminder ? `
          <div class="filter-paper-reminder filter-paper-reminder--${status.key}" role="status" aria-live="polite">
            <p>${escapeHtml(reminder)}</p>
            <button type="button" class="button button-secondary filter-paper-reminder-button" data-filter-paper-reorder="true">${escapeHtml(FILTER_PAPER_REORDER_BUTTON_LABEL)}</button>
          </div>
        ` : ""}
      </div>
    </section>
  `;
}

function renderSessionsFilterPaperCardMarkup() {
  const inventory = getFilterPaperInventory();
  const isInventorySet = hasFilterPaperInventoryBeenSet();
  const status = getFilterPaperStatusMeta(inventory.count);
  const toneKey = isInventorySet ? status.key : "ok";
  const statusLabel = isInventorySet
    ? getFilterPaperStatusDisplayLabel(status.key, { criticalLabel: "Urgent" })
    : "Not set";
  const reminder = isInventorySet && inventory.count <= 2 ? getFilterPaperReminder(inventory.count) : "";
  const countLabel = isInventorySet ? `${inventory.count}` : "Not set";
  const storeLabel = inventory.storeRegion === "EU" ? "cannakan.eu" : "cannakan.com";
  const autoSubtractLabel = inventory.autoSubtract ? "Enabled" : "Off";

  return `
    <section class="card filter-paper-card filter-paper-card--compact filter-paper-card--${toneKey}" aria-labelledby="sessions-filter-paper-card-title">
      <div class="filter-paper-card-head">
        <div>
          <p class="eyebrow">Supplies</p>
          <h3 id="sessions-filter-paper-card-title">Filter Papers</h3>
        </div>
        <span class="filter-paper-status-badge filter-paper-status-badge--${status.key}">${escapeHtml(statusLabel)}</span>
      </div>
      <div class="filter-paper-card-body">
        <p class="filter-paper-count">Filter Papers: <strong>${escapeHtml(String(countLabel))}</strong>${isInventorySet ? " remaining" : ""}</p>
        <p class="filter-paper-status-line">Status: <strong>${escapeHtml(statusLabel)}</strong></p>
        <p class="filter-paper-store">Store region: <strong>${escapeHtml(inventory.storeRegion)}</strong> - ${escapeHtml(storeLabel)}</p>
        <p class="filter-paper-auto-subtract ${inventory.autoSubtract ? "is-enabled" : "is-disabled"}">Auto subtract: <strong>${escapeHtml(autoSubtractLabel)}</strong></p>
        ${reminder ? `<p class="filter-paper-reminder-copy filter-paper-reminder-copy--${status.key}">${escapeHtml(reminder)}</p>` : ""}
        <div class="filter-paper-actions">
          <button type="button" class="button button-secondary" data-filter-paper-edit="true">Update Count</button>
          <button type="button" class="button button-primary" data-filter-paper-reorder="true">${escapeHtml(FILTER_PAPER_REORDER_BUTTON_LABEL)}</button>
        </div>
      </div>
    </section>
  `;
}

function renderActiveSessionFilterPaperCardMarkup() {
  const inventory = getFilterPaperInventory();
  const status = getFilterPaperStatusMeta(inventory.count);
  const reminder = inventory.count <= 2 ? getFilterPaperReminder(inventory.count) : "";
  const statusLabel = getFilterPaperStatusDisplayLabel(status.key);

  return `
    <section class="card active-session-supplies-card active-session-supplies-card--${status.key}" aria-labelledby="active-session-supplies-title">
      <div class="active-session-supplies-head">
        <div class="active-session-supplies-copy">
          <p class="eyebrow">Supplies</p>
          <h4 id="active-session-supplies-title">Supplies</h4>
          <p class="active-session-supplies-count">Filter Papers: <strong>${escapeHtml(String(inventory.count))}</strong> remaining</p>
          ${reminder ? `<p class="active-session-supplies-reminder">${escapeHtml(reminder)}</p>` : ""}
        </div>
        <div class="active-session-supplies-actions">
          <span class="filter-paper-status-badge filter-paper-status-badge--${status.key}">${escapeHtml(statusLabel)}</span>
          <div class="active-session-supplies-button-row">
            <button type="button" class="button button-primary" data-filter-paper-reorder="true">${escapeHtml(FILTER_PAPER_REORDER_BUTTON_LABEL)}</button>
            <button type="button" class="button button-secondary" data-filter-paper-edit="true">Update Count</button>
          </div>
        </div>
      </div>
    </section>
  `;
}

function bindFilterPaperCardActions(scope, options = {}) {
  if (!scope?.querySelectorAll) {
    return;
  }

  const { onSave = null } = options || {};
  scope.querySelectorAll('[data-filter-paper-edit="true"]').forEach((button) => {
    button.addEventListener("click", () => {
      openFilterPaperInventoryModal({ onSave });
    });
  });
  scope.querySelectorAll('[data-filter-paper-reorder="true"]').forEach((button) => {
    button.addEventListener("click", () => {
      openFilterPaperStore();
    });
  });
}

function ensureFilterPaperInventoryModal() {
  let modal = document.querySelector("#filter-paper-inventory-modal");
  if (modal instanceof HTMLDialogElement) {
    return modal;
  }

  modal = document.createElement("dialog");
  modal.id = "filter-paper-inventory-modal";
  modal.className = "snapshot-modal filter-paper-modal";
  modal.innerHTML = `
    <form method="dialog" class="snapshot-modal-card filter-paper-modal-card">
      <div class="snapshot-modal-copy">
        <p class="eyebrow">Supplies Tracker</p>
        <h3>Filter Papers</h3>
        <p>Keep your current count up to date so Cannakan Grow can give you a gentle reorder reminder when you're getting low.</p>
      </div>
      <div class="filter-paper-modal-grid">
        <label>
          <span>Filter papers on hand</span>
          <input type="number" name="filterPaperCount" min="0" step="1" inputmode="numeric" placeholder="0">
        </label>
        <label>
          <span>Store region</span>
          <select name="storeRegion">
            <option value="US">US - cannakan.com</option>
            <option value="EU">EU - cannakan.eu</option>
          </select>
        </label>
      </div>
      <div class="filter-paper-modal-toggle">
        <label class="filter-paper-toggle-row">
          <input type="checkbox" name="autoSubtract">
          <span>Auto subtract 1 filter paper when a session is completed</span>
        </label>
        <label class="filter-paper-toggle-row">
          <input type="checkbox" name="notifyLowSupply">
          <span>Notify me when I'm running low</span>
        </label>
      </div>
      <p class="muted filter-paper-modal-note">You can update this any time without affecting session history.</p>
      <p id="filter-paper-modal-message" class="form-message" role="alert" aria-live="polite"></p>
      <div class="snapshot-modal-actions">
        <button type="button" class="button button-secondary" data-filter-paper-modal-cancel="true">Cancel</button>
        <button type="button" class="button button-primary" data-filter-paper-modal-save="true">Save</button>
      </div>
    </form>
  `;

  modal.addEventListener("click", (event) => {
    if (event.target === modal && modal.open) {
      modal.close();
    }
  });

  document.body.appendChild(modal);
  return modal;
}

function ensureFilterPaperPreSessionWarningModal() {
  let modal = document.querySelector("#filter-paper-pre-session-warning-modal");
  if (modal instanceof HTMLDialogElement) {
    return modal;
  }

  modal = document.createElement("dialog");
  modal.id = "filter-paper-pre-session-warning-modal";
  modal.className = "snapshot-modal filter-paper-warning-modal";
  modal.innerHTML = `
    <div class="snapshot-modal-card filter-paper-warning-modal-card" role="document" aria-labelledby="filter-paper-warning-title">
      <div class="snapshot-modal-copy">
        <p class="eyebrow">Supplies</p>
        <h3 id="filter-paper-warning-title">Filter papers needed</h3>
        <p>You’re out of filter papers. Reorder before starting your next session, or continue if you already have supplies on hand.</p>
      </div>
      <div class="filter-paper-warning-actions">
        <button type="button" class="button button-primary" data-filter-paper-warning-reorder="true">${escapeHtml(FILTER_PAPER_REORDER_BUTTON_LABEL)}</button>
        <button type="button" class="button button-secondary" data-filter-paper-warning-update="true">Update Count</button>
        <button type="button" class="button button-secondary filter-paper-warning-continue" data-filter-paper-warning-continue="true">Continue Anyway</button>
      </div>
    </div>
  `;

  modal.addEventListener("click", (event) => {
    if (event.target === modal && modal.open) {
      modal.close();
    }
  });

  document.body.appendChild(modal);
  return modal;
}

function ensureFilterPaperSetupModal() {
  let modal = document.querySelector("#filter-paper-setup-modal");
  if (modal instanceof HTMLDialogElement) {
    return modal;
  }

  modal = document.createElement("dialog");
  modal.id = "filter-paper-setup-modal";
  modal.className = "snapshot-modal filter-paper-setup-modal";
  modal.innerHTML = `
    <div class="snapshot-modal-card filter-paper-setup-modal-card" role="document" aria-labelledby="filter-paper-setup-title">
      <div class="snapshot-modal-copy">
        <p class="eyebrow">Supplies</p>
        <h3 id="filter-paper-setup-title">Filter paper setup</h3>
        <p>Enter how many filter papers you have on hand. Cannakan Grow will track your usage and notify you when you’re running low.</p>
      </div>
      <label class="filter-paper-setup-field">
        <span>Filter papers on hand</span>
        <input type="number" name="filterPaperSetupCount" min="0" step="1" inputmode="numeric" placeholder="0">
      </label>
      <div class="filter-paper-setup-actions">
        <button type="button" class="button button-primary" data-filter-paper-setup-save="true">Save & Continue</button>
        <button type="button" class="button button-secondary" data-filter-paper-setup-skip="true">Skip for Now</button>
      </div>
    </div>
  `;

  modal.addEventListener("click", (event) => {
    if (event.target === modal && modal.open) {
      modal.close();
    }
  });

  document.body.appendChild(modal);
  return modal;
}

function openFilterPaperInventoryModal(options = {}) {
  const { onSave = null, onCancel = null } = options || {};
  const inventory = getFilterPaperInventory();
  const modal = ensureFilterPaperInventoryModal();
  const form = modal.querySelector("form");
  const countInput = form?.querySelector('input[name="filterPaperCount"]');
  const autoSubtractInput = form?.querySelector('input[name="autoSubtract"]');
  const notifyLowSupplyInput = form?.querySelector('input[name="notifyLowSupply"]');
  const regionSelect = form?.querySelector('select[name="storeRegion"]');
  const message = form?.querySelector("#filter-paper-modal-message");
  const cancelButton = form?.querySelector('[data-filter-paper-modal-cancel="true"]');
  const saveButton = form?.querySelector('[data-filter-paper-modal-save="true"]');

  if (!form || !countInput || !autoSubtractInput || !notifyLowSupplyInput || !regionSelect || !cancelButton || !saveButton) {
    return;
  }

  countInput.value = String(inventory.count);
  autoSubtractInput.checked = Boolean(inventory.autoSubtract);
  notifyLowSupplyInput.checked = inventory.notifyLowSupply !== false;
  regionSelect.value = inventory.storeRegion;
  if (message) {
    message.textContent = "";
    message.classList.remove("is-error");
  }

  let didSave = false;
  const handleClose = () => {
    modal.removeEventListener("close", handleClose);
    if (!didSave && typeof onCancel === "function") {
      onCancel();
    }
  };
  modal.addEventListener("close", handleClose, { once: true });

  cancelButton.onclick = () => {
    if (modal.open) {
      modal.close();
    }
  };

  saveButton.onclick = () => {
    const rawCount = Number(countInput.value);
    const nextCount = Number.isFinite(rawCount) ? Math.max(0, Math.floor(rawCount)) : 0;
    const savedInventory = saveFilterPaperInventory({
      count: nextCount,
      autoSubtract: autoSubtractInput.checked,
      notifyLowSupply: notifyLowSupplyInput.checked,
      storeRegion: regionSelect.value === "EU" ? "EU" : "US",
    });
    // TODO: Mirror this inventory to Supabase once supplies settings become user-scoped across devices.
    applySupplyStatusToSessionEntryButtons(document);
    didSave = true;
    if (modal.open) {
      modal.close();
    }
    if (typeof onSave === "function") {
      onSave(savedInventory);
      return;
    }
    safeRender();
  };

  if (!modal.open) {
    modal.showModal();
  }
  countInput.focus();
  countInput.select();
}

function promptFilterPaperSetupBeforeNewSession() {
  if (hasFilterPaperInventoryBeenSet()) {
    return Promise.resolve(true);
  }

  const inventory = getFilterPaperInventory();
  const modal = ensureFilterPaperSetupModal();
  const countInput = modal.querySelector('input[name="filterPaperSetupCount"]');
  const saveButton = modal.querySelector('[data-filter-paper-setup-save="true"]');
  const skipButton = modal.querySelector('[data-filter-paper-setup-skip="true"]');

  if (!(countInput instanceof HTMLInputElement) || !(saveButton instanceof HTMLButtonElement) || !(skipButton instanceof HTMLButtonElement)) {
    return Promise.resolve(true);
  }

  countInput.value = String(inventory.count || 0);

  return new Promise((resolve) => {
    let settled = false;

    const cleanup = () => {
      modal.removeEventListener("close", handleClose);
      saveButton.onclick = null;
      skipButton.onclick = null;
    };

    const finish = (result) => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      if (modal.open) {
        modal.close();
      }
      resolve(result);
    };

    const handleClose = () => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      resolve(false);
    };

    saveButton.onclick = () => {
      const rawCount = Number(countInput.value);
      const nextCount = Number.isFinite(rawCount) ? Math.max(0, Math.floor(rawCount)) : 0;
      saveFilterPaperInventory({
        ...getFilterPaperInventory(),
        count: nextCount,
      });
      applySupplyStatusToSessionEntryButtons(document);
      finish(true);
    };

    skipButton.onclick = () => {
      finish(true);
    };

    modal.addEventListener("close", handleClose);
    if (!modal.open) {
      modal.showModal();
    }
    countInput.focus();
    countInput.select();
  });
}

function promptFilterPaperPreSessionWarning() {
  if (!hasFilterPaperInventoryBeenSet() || getFilterPaperInventory().count > 0) {
    return Promise.resolve(true);
  }

  const modal = ensureFilterPaperPreSessionWarningModal();
  const reorderButton = modal.querySelector('[data-filter-paper-warning-reorder="true"]');
  const updateButton = modal.querySelector('[data-filter-paper-warning-update="true"]');
  const continueButton = modal.querySelector('[data-filter-paper-warning-continue="true"]');

  if (!reorderButton || !updateButton || !continueButton) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    let settled = false;
    let suppressCloseResolution = false;

    const cleanup = () => {
      modal.removeEventListener("close", handleClose);
      reorderButton.onclick = null;
      updateButton.onclick = null;
      continueButton.onclick = null;
    };

    const finish = (result) => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      if (modal.open) {
        modal.close();
      }
      resolve(result);
    };

    const showWarning = () => {
      if (settled) {
        return;
      }

      if (!modal.open) {
        modal.showModal();
      }
      reorderButton.focus();
    };

    const handleClose = () => {
      if (settled) {
        return;
      }

      if (suppressCloseResolution) {
        suppressCloseResolution = false;
        return;
      }

      settled = true;
      cleanup();
      resolve(false);
    };

    reorderButton.onclick = () => {
      openFilterPaperStore();
    };

    updateButton.onclick = () => {
      suppressCloseResolution = true;
      if (modal.open) {
        modal.close();
      }
      openFilterPaperInventoryModal({
        onSave: (savedInventory) => {
          if ((savedInventory?.count || 0) > 0) {
            finish(true);
            return;
          }
          showWarning();
        },
        onCancel: () => {
          showWarning();
        },
      });
    };

    continueButton.onclick = () => {
      finish(true);
    };

    modal.addEventListener("close", handleClose);
    showWarning();
  });
}

function renderHomeInstallInfoCardMarkup() {
  const mode = getInstallPromptMode();
  const isInstalled = isStandaloneAppDisplay();
  const isIOS = isIOSDevice();
  const cardStateClass = isInstalled ? "is-installed" : "";
  const hasDeferredPrompt = !isIOS && mode === "prompt";
  const isUnsupported = !isInstalled && !isIOS && !hasDeferredPrompt;
  const buttonLabel = isInstalled
    ? "App Installed ✓"
    : isIOS
      ? "Use Share → Add to Home Screen"
      : hasDeferredPrompt
        ? "Install Now"
        : "Install Now";
  const buttonEnabled = hasDeferredPrompt && !isInstalled;
  const statusToneClass = isInstalled
    ? "is-installed"
    : isIOS
      ? "is-ios"
      : hasDeferredPrompt
        ? "is-active"
        : "is-disabled";
  const helperText = isInstalled
    ? "Cannakan Grow is already installed on this device."
    : isIOS
      ? "Use Safari on iPhone or iPad to add Cannakan Grow to your home screen."
      : hasDeferredPrompt
        ? "Install directly from this browser for a faster full-screen experience."
        : "Install becomes available on supported browsers like Chrome.";
  const footerText = isUnsupported
    ? "Install available on supported browsers like Chrome. Support varies by device."
    : helperText;
  const installPreviewElapsed = formatInstallPreviewElapsed(2, 2);
  const installPreviewSuccessRate = 98;
  const installPreviewTotalSeeds = 50;
  const installPreviewGerminatedSeeds = 49;
  const installPreviewPartitionBars = [98, 96];

  return `
    <section class="card home-install-card ${cardStateClass}" aria-labelledby="home-install-card-title">
      <div class="home-install-card-shell">
        <div class="home-install-card-body">
          <div class="home-install-card-preview" aria-hidden="true">
            <div class="phone-mock home-install-phone home-install-phone-mockup">
              <div class="home-install-phone-notch"></div>
              <div class="phone-screen home-install-phone-screen">
                <div class="home-install-phone-screen-head">
                  <span class="home-install-phone-screen-dot"></span>
                  <span>Cannakan® Grow</span>
                </div>
                <div class="home-install-phone-stat">
                  <div class="home-install-progress-ring home-install-phone-stat-ring is-animated">
                    <span>${installPreviewSuccessRate}%</span>
                  </div>
                  <p class="home-install-phone-stat-label">Germination</p>
                </div>
                <div class="home-install-phone-metrics">
                  <div class="home-install-phone-metric">
                    <span>Stage</span>
                    <strong>Germination</strong>
                  </div>
                  <div class="home-install-phone-metric">
                    <span>Seeds</span>
                    <strong>${installPreviewGerminatedSeeds} / ${installPreviewTotalSeeds}</strong>
                  </div>
                  <div class="home-install-phone-metric">
                    <span>Time Elapsed</span>
                    <strong>${escapeHtml(installPreviewElapsed)}</strong>
                  </div>
                </div>
                <div class="home-install-phone-actions">
                  <div class="home-install-phone-progress-panel">
                    <div class="home-install-phone-stage-timeline">
                      <div class="home-install-phone-stage-segment stage-soaking is-complete">
                        <span class="home-install-phone-stage-fill"></span>
                      </div>
                      <div class="home-install-phone-stage-segment stage-germinating is-complete">
                        <span class="home-install-phone-stage-fill"></span>
                      </div>
                      <div class="home-install-phone-stage-segment stage-planted is-complete">
                        <span class="home-install-phone-stage-fill"></span>
                      </div>
                      <div class="home-install-phone-stage-segment stage-completed is-current">
                        <span class="home-install-phone-stage-fill"></span>
                      </div>
                    </div>
                    <div class="home-install-phone-partition-graph">
                      ${installPreviewPartitionBars.map((progressPercent) => {
                        return `
                          <div class="home-install-phone-partition-row">
                            <div class="home-install-phone-partition-track">
                              <span class="home-install-phone-partition-fill" style="width:${progressPercent}%"></span>
                            </div>
                          </div>
                        `;
                      }).join("")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="home-install-card-content">
            <div class="home-install-card-copy">
              <div class="home-install-card-copy-block">
                <p class="eyebrow">Install App</p>
                <h3 id="home-install-card-title">Install the Grow App</h3>
                <p class="muted home-install-card-description">Track sessions, receive notifications, and stay connected on the go.</p>
              </div>
            </div>
            <div class="home-install-card-directions">
              <section class="home-install-card-platform">
                <h4 class="home-install-card-platform-title">iPhone</h4>
                <ol class="home-install-card-steps">
                  <li>Open in Safari</li>
                  <li>Tap Share</li>
                  <li>Add to Home Screen</li>
                </ol>
              </section>
              <section class="home-install-card-platform">
                <h4 class="home-install-card-platform-title">Android</h4>
                <ol class="home-install-card-steps">
                  <li>Open in Chrome</li>
                  <li>Tap Install App or Add to Home Screen</li>
                </ol>
              </section>
            </div>
            <div class="home-install-card-actions">
              <button
                type="button"
                class="button button-primary install-app-button"
                data-install-grow-app="true"
                ${buttonEnabled ? "" : "disabled"}
                aria-disabled="${buttonEnabled ? "false" : "true"}"
              >${escapeHtml(buttonLabel)}</button>
            </div>
            <p class="home-install-card-tip ${statusToneClass}">${escapeHtml(footerText)}</p>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderHomeAdminUtilityCardMarkup() {
  if (!canAccessMockDataControls()) {
    return "";
  }

  return `
    <section class="card mock-data-admin-section ${isMockDataEnabled() ? "is-on" : "is-off"}">
      <div class="mock-data-admin-shell">
        <div class="mock-data-admin-copy">
          <div class="section-title-with-icon app-section-header-main">
            ${renderAppSectionHeaderIcon("admin")}
            <div>
              <p class="eyebrow">Admin Utility</p>
              <h3>Dev Mode (Mock Data)</h3>
              <p class="mock-data-admin-subtitle">
                <span>Admin-only preview controls</span>
                ${isMockDataEnabled() ? '<span class="mock-data-admin-indicator">Mock Data Active</span>' : ""}
              </p>
              <p class="muted">Admin-only preview controls. Mock data never submits to the database or overwrites real user data.</p>
            </div>
          </div>
        </div>
        <div class="mock-data-admin-actions">
          <button
            type="button"
            class="mock-data-toggle ${isMockDataEnabled() ? "is-on" : "is-off"}"
            data-home-mock-data-toggle="true"
            aria-pressed="${isMockDataEnabled() ? "true" : "false"}"
            aria-label="Toggle Dev Mode mock Community Grow data"
          >
            <span class="mock-data-toggle-text">
              <span class="mock-data-toggle-label">Dev Mode</span>
              <span class="mock-data-toggle-sublabel">Mock Community Grow data</span>
            </span>
            <span class="mock-data-toggle-switch" aria-hidden="true">
              <span class="mock-data-toggle-thumb"></span>
            </span>
            <span class="mock-data-toggle-state">${isMockDataEnabled() ? "ON" : "OFF"}</span>
          </button>
          <p class="muted">Shift + D</p>
        </div>
      </div>
    </section>
  `;
}

function renderHomeSecondaryInfoRowMarkup() {
  const announcementMarkup = renderHomeAnnouncementCard();
  const adminUtilityMarkup = renderHomeAdminUtilityCardMarkup();
  return `
    <div class="home-dashboard-secondary-row">
      <div class="home-dashboard-secondary-row-top">
        ${renderHomeGalleryRankingsTeaser()}
        <div class="home-dashboard-secondary-side-column">
          ${renderHomeInstallInfoCardMarkup()}
        </div>
      </div>
      ${announcementMarkup}
      ${adminUtilityMarkup ? `<div class="home-dashboard-secondary-row-bottom">${adminUtilityMarkup}</div>` : ""}
    </div>
  `;
}

function renderRegisteredMemberCountCardMarkup() {
  const memberCount = getRegisteredMemberCount();
  const hasMemberCount = Number.isFinite(memberCount);
  const valueLabel = hasMemberCount
    ? memberCount.toLocaleString()
    : (appState.memberCountLoaded ? "—" : "--");
  const subtext = hasMemberCount
    ? "registered profiles"
    : (appState.memberCountLoaded ? "Count unavailable" : "Loading registered profiles");

  return `
    <article class="card stat-card card-accent card-accent-green" data-admin-member-count-card="true">
      <span class="stat-label">Total Members</span>
      <strong class="stat-value">${escapeHtml(valueLabel)}</strong>
      <p class="summary-subtext">${escapeHtml(subtext)}</p>
    </article>
  `;
}

function renderAdminAccessDeniedScreen() {
  app.innerHTML = `
    <section class="card admin-access-card">
      <p class="eyebrow">Access Denied</p>
      <h2>Admin access required</h2>
      <p class="muted">This page is available only to Cannakan Grow admins.</p>
      <div class="form-actions">
        <a class="button button-primary" href="#home">Return Home</a>
      </div>
    </section>
  `;
}

function renderAdminOverviewCardMarkup({ label, value, subtext = "" }) {
  return `
    <article class="card stat-card card-accent card-accent-green admin-overview-card">
      <span class="stat-label">${escapeHtml(label)}</span>
      <strong class="stat-value">${escapeHtml(value)}</strong>
      <p class="summary-subtext">${escapeHtml(subtext)}</p>
    </article>
  `;
}

function formatAdminTimestamp(value) {
  const parsedDate = parseCompletedAtValue(value);
  return parsedDate ? formatTimingDateTime(parsedDate) : "Not available";
}

function renderSourceLogoPlaceholderMarkup() {
  return `
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <circle cx="12" cy="12" r="9"></circle>
      <path d="M9 14.5h6"></path>
      <path d="M10 10.5h4"></path>
      <path d="M12 7.5v9"></path>
    </svg>
  `;
}

function renderSourceLogoMarkup(source = {}, options = {}) {
  const {
    className = "admin-source-logo",
    imageClassName = "admin-source-logo-image",
    placeholderClassName = "admin-source-logo-placeholder",
    alt = source?.name || "Source logo",
  } = options;
  const logoUrl = String(source?.logoUrl || "").trim();

  if (logoUrl) {
    return `
      <span class="${escapeHtml(className)}">
        <img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(alt)}" class="${escapeHtml(imageClassName)}">
      </span>
    `;
  }

  return `
    <span class="${escapeHtml(className)} ${escapeHtml(placeholderClassName)}" aria-hidden="true">
      ${renderSourceLogoPlaceholderMarkup()}
    </span>
  `;
}

function renderSourceStatusPillMarkup(status) {
  const normalizedStatus = normalizeSourceStatus(status);
  return `<span class="admin-source-status-pill is-${escapeHtml(normalizedStatus)}">${escapeHtml(capitalize(normalizedStatus))}</span>`;
}

function renderAdminSourceCardMarkup(source) {
  const websiteMarkup = source.websiteUrl
    ? `<a href="${escapeHtml(source.websiteUrl)}" target="_blank" rel="noreferrer">${escapeHtml(source.websiteUrl)}</a>`
    : '<span class="muted">No website added</span>';
  const description = source.description || "No description added yet.";
  const contactLabel = [source.contactName, source.contactEmail].filter(Boolean).join(" · ");

  return `
    <article class="meta-card admin-source-card">
      <div class="admin-source-card-head">
        <div class="admin-source-card-brand">
          ${renderSourceLogoMarkup(source)}
          <div class="admin-source-card-copy">
            <strong>${escapeHtml(source.name || "Unnamed source")}</strong>
            <p>${websiteMarkup}</p>
          </div>
        </div>
        <div class="admin-source-card-actions">
          ${renderSourceStatusPillMarkup(source.status)}
          <button type="button" class="button button-secondary" data-source-edit="${escapeHtml(source.id)}">Edit</button>
          <button type="button" class="button button-secondary gallery-admin-reject" data-source-delete="${escapeHtml(source.id)}">Delete</button>
        </div>
      </div>
      <p class="admin-source-card-description">${escapeHtml(description)}</p>
      <div class="admin-source-card-meta">
        <span><strong>Created:</strong> ${escapeHtml(formatAdminTimestamp(source.createdAt))}</span>
        <span><strong>Updated:</strong> ${escapeHtml(formatAdminTimestamp(source.updatedAt))}</span>
        <span><strong>Contact:</strong> ${escapeHtml(contactLabel || "Not provided")}</span>
      </div>
    </article>
  `;
}

function renderAdminSourceEditorMarkup(source = null) {
  const isEditing = Boolean(source?.id);
  const submitLabel = isEditing ? "Update Source" : "Add Source";
  const title = isEditing ? `Edit ${source.name}` : "Add New Source";
  const subtitle = isEditing
    ? "Update display info, branding, and visibility for this source."
    : "Create a source company profile for sessions, Community Grow metadata, and future branding.";

  return `
    <form id="admin-source-form" class="admin-source-form">
      <div class="section-heading admin-source-form-heading app-section-header">
        <div class="section-title-with-icon app-section-header-main">
          ${renderAppSectionHeaderIcon("sources")}
          <div>
            <p class="eyebrow">Source Editor</p>
            <h4>${escapeHtml(title)}</h4>
            <p class="muted">${escapeHtml(subtitle)}</p>
          </div>
        </div>
      </div>
      <div class="admin-source-form-grid">
        <label>
          <span>Company / Source Name</span>
          <input type="text" name="sourceName" value="${escapeHtml(source?.name || "")}" placeholder="Seedsman" required>
        </label>
        <label>
          <span>Website</span>
          <input type="url" name="websiteUrl" value="${escapeHtml(source?.websiteUrl || "")}" placeholder="https://example.com">
        </label>
        <label class="admin-source-form-full">
          <span>Short Description</span>
          <textarea name="description" rows="3" placeholder="Short summary for admins and future source branding.">${escapeHtml(source?.description || "")}</textarea>
        </label>
        <label>
          <span>Contact Name</span>
          <input type="text" name="contactName" value="${escapeHtml(source?.contactName || "")}" placeholder="Optional">
        </label>
        <label>
          <span>Contact Email</span>
          <input type="email" name="contactEmail" value="${escapeHtml(source?.contactEmail || "")}" placeholder="Optional">
        </label>
        <label class="admin-source-form-full">
          <span>Notes</span>
          <textarea name="notes" rows="4" placeholder="Optional internal notes.">${escapeHtml(source?.notes || "")}</textarea>
        </label>
        <label>
          <span>Status</span>
          <select name="status">
            <option value="active"${normalizeSourceStatus(source?.status) === "active" ? " selected" : ""}>Active</option>
            <option value="hidden"${normalizeSourceStatus(source?.status) === "hidden" ? " selected" : ""}>Hidden</option>
          </select>
        </label>
        <div class="admin-source-form-full admin-source-logo-field">
          <span class="admin-source-field-label">Logo</span>
          <div id="admin-source-logo-preview" class="admin-source-logo-preview"></div>
          <span class="file-upload-control">
            <span class="file-upload-button">Choose Logo</span>
            <span class="file-upload-name">No file selected</span>
            <input class="file-upload-input" type="file" name="sourceLogo" accept="image/*">
          </span>
          <div class="admin-source-logo-actions">
            <button type="button" class="button button-secondary" id="admin-source-remove-logo">Remove Logo</button>
          </div>
          <p class="muted admin-source-logo-helper">Logos will be available for future gallery cards, leaderboard rankings, source filters, and session detail views. Hidden sources are not exposed publicly.</p>
        </div>
      </div>
      <p id="admin-source-form-message" class="snapshot-message">${escapeHtml(appState.sourceAdminMessage || "")}</p>
      <div class="form-actions admin-source-form-actions">
        <button type="submit" class="button button-primary">${escapeHtml(submitLabel)}</button>
        ${isEditing ? '<button type="button" class="button button-secondary" id="admin-source-cancel-edit">Cancel</button>' : ""}
      </div>
    </form>
  `;
}

function renderAdminSourcesListMarkup() {
  if (!appState.supabase) {
    return `
      <div class="admin-sources-empty">
        <p>Source management requires Supabase tables and storage to be configured.</p>
      </div>
    `;
  }

  if (!appState.sourcesLoaded && appState.sourcesRefreshPromise) {
    return `
      <div class="admin-sources-empty">
        <p>Loading sources...</p>
      </div>
    `;
  }

  if (appState.sourcesError) {
    return `
      <div class="admin-sources-empty">
        <p>${escapeHtml(appState.sourcesError)}</p>
      </div>
    `;
  }

  if (!appState.sources.length) {
    return `
      <div class="admin-sources-empty">
        <p>No sources have been added yet.</p>
      </div>
    `;
  }

  return appState.sources.map(renderAdminSourceCardMarkup).join("");
}

function renderAdminSourceLogoPreview(container, state, existingSource = null) {
  if (!container) {
    return;
  }

  const displayUrl = state.previewUrl || (state.removeLogo ? "" : existingSource?.logoUrl || "");
  container.innerHTML = `
    <div class="admin-source-logo-preview-shell">
      ${displayUrl
    ? renderSourceLogoMarkup({ logoUrl: displayUrl, name: existingSource?.name || "Source logo" }, {
      className: "admin-source-logo admin-source-logo--preview",
      imageClassName: "admin-source-logo-image admin-source-logo-image--preview",
    })
    : renderSourceLogoMarkup({}, {
      className: "admin-source-logo admin-source-logo--preview",
      placeholderClassName: "admin-source-logo-placeholder admin-source-logo-placeholder--preview",
    })}
      <div class="admin-source-logo-preview-copy">
        <strong>${escapeHtml(displayUrl ? "Logo ready" : "No logo uploaded")}</strong>
        <p>${escapeHtml(displayUrl ? "This logo will be used anywhere source branding is available." : "A clean placeholder icon will be used until a logo is added.")}</p>
      </div>
    </div>
  `;
}

function ensureSourceDeleteConfirmModal() {
  let modal = document.querySelector("#source-delete-confirm-modal");
  if (modal instanceof HTMLDialogElement) {
    return modal;
  }

  modal = document.createElement("dialog");
  modal.id = "source-delete-confirm-modal";
  modal.className = "snapshot-modal source-delete-confirm-modal";
  modal.innerHTML = `
    <form method="dialog" class="snapshot-modal-card profile-modal-card source-delete-confirm-card">
      <div class="snapshot-modal-copy">
        <p class="eyebrow">Delete Source</p>
        <h3 id="source-delete-confirm-title">Delete source?</h3>
        <p id="source-delete-confirm-message">Are you sure? Existing sessions using this source will keep the source name, but the logo/profile info may no longer appear.</p>
      </div>
      <div class="snapshot-modal-actions">
        <button type="button" class="button button-secondary" data-source-delete-cancel>Cancel</button>
        <button type="button" class="button button-primary gallery-admin-reject" data-source-delete-confirm>Delete Source</button>
      </div>
    </form>
  `;
  document.body.appendChild(modal);
  return modal;
}

function confirmSourceDeletion(source) {
  const modal = ensureSourceDeleteConfirmModal();
  const title = modal.querySelector("#source-delete-confirm-title");
  const message = modal.querySelector("#source-delete-confirm-message");
  const cancelButton = modal.querySelector("[data-source-delete-cancel]");
  const confirmButton = modal.querySelector("[data-source-delete-confirm]");

  if (!(cancelButton instanceof HTMLButtonElement) || !(confirmButton instanceof HTMLButtonElement)) {
    return Promise.resolve(window.confirm("Are you sure? Existing sessions using this source will keep the source name, but the logo/profile info may no longer appear."));
  }

  if (title) {
    title.textContent = `Delete ${source?.name || "this source"}?`;
  }
  if (message) {
    message.textContent = "Are you sure? Existing sessions using this source will keep the source name, but the logo/profile info may no longer appear.";
  }

  return new Promise((resolve) => {
    const cleanup = () => {
      cancelButton.removeEventListener("click", onCancel);
      confirmButton.removeEventListener("click", onConfirm);
      modal.removeEventListener("cancel", onCancel);
      if (modal.open) {
        modal.close();
      }
    };

    const onCancel = () => {
      cleanup();
      resolve(false);
    };

    const onConfirm = () => {
      cleanup();
      resolve(true);
    };

    cancelButton.addEventListener("click", onCancel, { once: true });
    confirmButton.addEventListener("click", onConfirm, { once: true });
    modal.addEventListener("cancel", onCancel, { once: true });
    modal.showModal();
    cancelButton.focus();
  });
}

function bindAdminSourcesSection() {
  const list = app.querySelector("#admin-sources-list");
  const editor = app.querySelector("#admin-source-editor");
  if (!list || !editor) {
    return;
  }

  list.querySelectorAll("[data-source-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      appState.sourceAdminEditingId = button.dataset.sourceEdit || "";
      appState.sourceAdminMessage = "";
      safeRender();
    });
  });

  list.querySelectorAll("[data-source-delete]").forEach((button) => {
    button.addEventListener("click", async () => {
      const source = appState.sources.find((entry) => entry.id === button.dataset.sourceDelete);
      if (!source) {
        return;
      }

      const confirmed = await confirmSourceDeletion(source);
      if (!confirmed) {
        return;
      }

      try {
        await deleteSourceRecord(source);
        if (appState.sourceAdminEditingId === source.id) {
          appState.sourceAdminEditingId = "";
        }
        appState.sourceAdminMessage = `Deleted ${source.name}.`;
        safeRender();
      } catch (error) {
        appState.sourceAdminMessage = error.message || "Could not delete source.";
        safeRender();
      }
    });
  });

  const form = editor.querySelector("#admin-source-form");
  if (!form) {
    return;
  }

  const existingSource = appState.sources.find((entry) => entry.id === appState.sourceAdminEditingId) || null;
  const logoInput = form.elements.sourceLogo;
  const preview = form.querySelector("#admin-source-logo-preview");
  const removeLogoButton = form.querySelector("#admin-source-remove-logo");
  const cancelEditButton = form.querySelector("#admin-source-cancel-edit");
  const message = form.querySelector("#admin-source-form-message");
  const submitButton = form.querySelector('button[type="submit"]');
  const state = {
    previewUrl: "",
    pendingFile: null,
    removeLogo: false,
  };

  bindFileUploadControl(logoInput);
  updateFileUploadName(logoInput);
  renderAdminSourceLogoPreview(preview, state, existingSource);

  logoInput?.addEventListener("change", () => {
    const file = logoInput.files?.[0];
    updateFileUploadName(logoInput);
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      message.textContent = "Images only. Please choose a valid source logo.";
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
    state.removeLogo = false;
    state.previewUrl = URL.createObjectURL(file);
    message.textContent = "";
    renderAdminSourceLogoPreview(preview, state, existingSource);
  });

  removeLogoButton?.addEventListener("click", () => {
    if (state.previewUrl) {
      URL.revokeObjectURL(state.previewUrl);
      state.previewUrl = "";
    }
    state.pendingFile = null;
    state.removeLogo = true;
    if (logoInput) {
      logoInput.value = "";
      updateFileUploadName(logoInput, []);
    }
    renderAdminSourceLogoPreview(preview, state, existingSource);
  });

  cancelEditButton?.addEventListener("click", () => {
    if (state.previewUrl) {
      URL.revokeObjectURL(state.previewUrl);
    }
    appState.sourceAdminEditingId = "";
    appState.sourceAdminMessage = "";
    safeRender();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = normalizeLeaderboardLabel(form.elements.sourceName?.value || "");
    if (!name) {
      message.textContent = "Please enter a source name before saving.";
      form.elements.sourceName?.focus();
      return;
    }

    if (submitButton instanceof HTMLButtonElement) {
      submitButton.disabled = true;
    }
    message.textContent = "";

    try {
      const savedSource = await saveSourceRecord({
        name,
        websiteUrl: form.elements.websiteUrl?.value || "",
        description: form.elements.description?.value || "",
        contactName: form.elements.contactName?.value || "",
        contactEmail: form.elements.contactEmail?.value || "",
        notes: form.elements.notes?.value || "",
        status: form.elements.status?.value || "active",
        logoFile: state.pendingFile,
        removeLogo: state.removeLogo,
      }, {
        existingSource,
      });

      if (state.previewUrl) {
        URL.revokeObjectURL(state.previewUrl);
      }

      appState.sourceAdminEditingId = "";
      appState.sourceAdminMessage = `${existingSource ? "Updated" : "Added"} ${savedSource.name}.`;
      safeRender();
    } catch (error) {
      message.textContent = error.message || "Could not save source.";
    } finally {
      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = false;
      }
    }
  });
}

function renderMemberRolePillMarkup(role = "member") {
  const normalizedRole = role === "admin" ? "admin" : "member";
  return `<span class="admin-member-role-pill is-${escapeHtml(normalizedRole)}">${escapeHtml(capitalize(normalizedRole))}</span>`;
}

function renderMemberStatusPillMarkup(status = "active") {
  const normalizedStatus = status === "disabled" ? "disabled" : "active";
  return `<span class="admin-member-status-pill is-${escapeHtml(normalizedStatus)}">${escapeHtml(capitalize(normalizedStatus))}</span>`;
}

function renderAdminMembersFiltersMarkup() {
  return `
    <div class="admin-members-toolbar">
      <label class="admin-members-search">
        <span>Search Members</span>
        <input
          type="search"
          id="admin-members-search"
          value="${escapeHtml(appState.memberAdminFilters.query || "")}"
          placeholder="Search by profile name or email"
        >
      </label>
      <label>
        <span>Role</span>
        <select id="admin-members-role-filter">
          <option value="all"${appState.memberAdminFilters.role === "all" ? " selected" : ""}>All roles</option>
          <option value="admin"${appState.memberAdminFilters.role === "admin" ? " selected" : ""}>Admin</option>
          <option value="member"${appState.memberAdminFilters.role === "member" ? " selected" : ""}>Member</option>
        </select>
      </label>
      <label>
        <span>Status</span>
        <select id="admin-members-status-filter">
          <option value="all"${appState.memberAdminFilters.status === "all" ? " selected" : ""}>All statuses</option>
          <option value="active"${appState.memberAdminFilters.status === "active" ? " selected" : ""}>Active</option>
          <option value="disabled"${appState.memberAdminFilters.status === "disabled" ? " selected" : ""}>Disabled</option>
        </select>
      </label>
    </div>
  `;
}

function renderAdminMemberRowMarkup(member) {
  const isSelf = isCurrentAdminMember(member);
  const actionLabel = member.accountStatus === "disabled" ? "Enable" : "Disable";
  return `
    <tr>
      <td>${escapeHtml(member.profileName)}</td>
      <td>${escapeHtml(member.email || "Not available")}</td>
      <td>${renderMemberRolePillMarkup(member.role)}</td>
      <td>${escapeHtml(formatMemberDateLabel(member.joinedAt))}</td>
      <td>${escapeHtml(formatMemberDateLabel(member.lastActiveAt))}</td>
      <td>${escapeHtml(String(member.sessionCount || 0))}</td>
      <td>${escapeHtml(String(member.gallerySubmissionCount || 0))}</td>
      <td>${renderMemberStatusPillMarkup(member.accountStatus)}</td>
      <td>
        <div class="admin-member-actions">
          <button type="button" class="button button-secondary" data-member-view="${escapeHtml(member.id)}">View</button>
          <button type="button" class="button button-secondary" data-member-toggle-status="${escapeHtml(member.id)}" ${isSelf ? "disabled" : ""}>${escapeHtml(actionLabel)}</button>
          <button type="button" class="button button-secondary gallery-admin-reject" data-member-delete="${escapeHtml(member.id)}" ${isSelf ? "disabled" : ""}>Delete</button>
        </div>
      </td>
    </tr>
  `;
}

function renderAdminMembersTableMarkup() {
  if (!appState.supabase) {
    return `<div class="admin-members-empty"><p>Member management requires Supabase tables and storage to be configured.</p></div>`;
  }

  if (!appState.membersLoaded && appState.membersRefreshPromise) {
    return `<div class="admin-members-empty"><p>Loading members...</p></div>`;
  }

  if (appState.membersError) {
    return `<div class="admin-members-empty"><p>${escapeHtml(appState.membersError)}</p></div>`;
  }

  const filteredMembers = getFilteredAdminMembers();
  if (!filteredMembers.length) {
    return `<div class="admin-members-empty"><p>No members match the current filters.</p></div>`;
  }

  return `
    <div class="admin-members-table-shell">
      <table class="leaderboard-audit-table admin-members-table">
        <thead>
          <tr>
            <th>Profile Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Joined Date</th>
            <th>Last Active</th>
            <th>Sessions</th>
            <th>Community Grow Submissions</th>
            <th>Account Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${filteredMembers.map(renderAdminMemberRowMarkup).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function ensureMemberDeleteConfirmModal() {
  let modal = document.querySelector("#member-delete-confirm-modal");
  if (modal instanceof HTMLDialogElement) {
    return modal;
  }

  modal = document.createElement("dialog");
  modal.id = "member-delete-confirm-modal";
  modal.className = "snapshot-modal member-delete-confirm-modal";
  modal.innerHTML = `
    <form method="dialog" class="snapshot-modal-card profile-modal-card member-delete-confirm-card">
      <div class="snapshot-modal-copy">
        <p class="eyebrow">Delete Member</p>
        <h3 id="member-delete-confirm-title">Delete member account?</h3>
        <p id="member-delete-confirm-message">Are you sure you want to delete this member account? This may remove or disconnect their sessions, Community Grow submissions, and profile data.</p>
      </div>
      <div class="snapshot-modal-actions">
        <button type="button" class="button button-secondary" data-member-delete-cancel>Cancel</button>
        <button type="button" class="button button-primary gallery-admin-reject" data-member-delete-confirm>Delete Member</button>
      </div>
    </form>
  `;
  document.body.appendChild(modal);
  return modal;
}

function confirmMemberDeletion(member) {
  const modal = ensureMemberDeleteConfirmModal();
  const title = modal.querySelector("#member-delete-confirm-title");
  const message = modal.querySelector("#member-delete-confirm-message");
  const cancelButton = modal.querySelector("[data-member-delete-cancel]");
  const confirmButton = modal.querySelector("[data-member-delete-confirm]");

  if (title) {
    title.textContent = `Delete ${member?.profileName || "this member"}?`;
  }
  if (message) {
    message.textContent = "Are you sure you want to delete this member account? This may remove or disconnect their sessions, Community Grow submissions, and profile data.";
  }

  return new Promise((resolve) => {
    const cleanup = () => {
      cancelButton?.removeEventListener("click", onCancel);
      confirmButton?.removeEventListener("click", onConfirm);
      modal.removeEventListener("cancel", onCancel);
      if (modal.open) {
        modal.close();
      }
    };

    const onCancel = () => {
      cleanup();
      resolve(false);
    };

    const onConfirm = () => {
      cleanup();
      resolve(true);
    };

    cancelButton?.addEventListener("click", onCancel, { once: true });
    confirmButton?.addEventListener("click", onConfirm, { once: true });
    modal.addEventListener("cancel", onCancel, { once: true });
    modal.showModal();
    cancelButton?.focus();
  });
}

function ensureAdminMemberDetailsModal() {
  let modal = document.querySelector("#admin-member-details-modal");
  if (modal instanceof HTMLDialogElement) {
    return modal;
  }

  modal = document.createElement("dialog");
  modal.id = "admin-member-details-modal";
  modal.className = "snapshot-modal admin-member-details-modal";
  modal.innerHTML = `
    <div class="snapshot-modal-card profile-modal-card admin-member-details-card" role="document">
      <button type="button" class="modal-close admin-member-details-close" aria-label="Close member details">×</button>
      <div class="admin-member-details-content"></div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector(".admin-member-details-close")?.addEventListener("click", () => {
    if (modal.open) {
      modal.close();
    }
  });
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.close();
    }
  });
  return modal;
}

function openAdminMemberDetails(memberId) {
  const member = getAdminMemberById(memberId);
  if (!member) {
    return;
  }

  const modal = ensureAdminMemberDetailsModal();
  const content = modal.querySelector(".admin-member-details-content");
  const isSelf = isCurrentAdminMember(member);
  const actionLabel = member.accountStatus === "disabled" ? "Enable Account" : "Disable Account";

  if (!content) {
    return;
  }

  content.innerHTML = `
    <div class="admin-member-details-head">
      <div>
        <p class="eyebrow">Member Profile</p>
        <h3>${escapeHtml(member.profileName)}</h3>
        <p class="muted">${escapeHtml(member.email || "No email available")}</p>
      </div>
      <div class="admin-member-details-badges">
        ${renderMemberRolePillMarkup(member.role)}
        ${renderMemberStatusPillMarkup(member.accountStatus)}
      </div>
    </div>
    <div class="admin-member-details-grid">
      ${renderAdminOverviewCardMarkup({
    label: "Joined",
    value: formatMemberDateLabel(member.joinedAt),
    subtext: "profile created",
  })}
      ${renderAdminOverviewCardMarkup({
    label: "Last Active",
    value: formatMemberDateLabel(member.lastActiveAt),
    subtext: `${ACTIVE_MEMBER_LOOKBACK_DAYS}-day activity window`,
  })}
      ${renderAdminOverviewCardMarkup({
    label: "Sessions",
    value: String(member.sessionCount || 0),
    subtext: "saved grow sessions",
  })}
      ${renderAdminOverviewCardMarkup({
    label: "Community Grow Submissions",
    value: String(member.gallerySubmissionCount || 0),
    subtext: "Community Grow records",
  })}
    </div>
    <div class="admin-member-details-meta">
      <p><strong>Deletion Status:</strong> ${escapeHtml(member.deletionStatus || "None")}</p>
      <p><strong>Deletion Requested:</strong> ${escapeHtml(formatMemberDateLabel(member.deletionRequestedAt))}</p>
      <p><strong>Deletion Scheduled:</strong> ${escapeHtml(formatMemberDateLabel(member.deletionScheduledFor))}</p>
    </div>
    <div class="snapshot-modal-actions admin-member-details-actions">
      <div class="admin-member-details-destructive-actions">
        <button type="button" class="button button-secondary" data-member-detail-toggle="${escapeHtml(member.id)}" ${isSelf ? "disabled" : ""}>${escapeHtml(actionLabel)}</button>
        <button type="button" class="button button-secondary gallery-admin-reject" data-member-detail-delete="${escapeHtml(member.id)}" ${isSelf ? "disabled" : ""}>Delete Member</button>
      </div>
      <button type="button" class="button button-secondary admin-member-details-safe-close" data-member-detail-close>Close</button>
    </div>
    ${isSelf ? '<p class="muted admin-member-self-note">You cannot disable or delete your own admin account from this panel.</p>' : ""}
  `;

  content.querySelector("[data-member-detail-toggle]")?.addEventListener("click", async () => {
    try {
      await updateMemberAccountStatus(member, member.accountStatus === "disabled" ? "active" : "disabled");
      await refreshAdminMembers({ force: true, reason: "admin:member-status" });
      safeRender();
      modal.close();
    } catch (error) {
      alert(error.message || "Could not update account status.");
    }
  }, { once: true });

  content.querySelector("[data-member-detail-delete]")?.addEventListener("click", async () => {
    const confirmed = await confirmMemberDeletion(member);
    if (!confirmed) {
      return;
    }

    try {
      await deleteMemberAccount(member);
      safeRender();
      modal.close();
    } catch (error) {
      alert(error.message || "Could not delete member.");
    }
  }, { once: true });

  content.querySelector("[data-member-detail-close]")?.addEventListener("click", () => {
    modal.close();
  }, { once: true });

  modal.showModal();
  modal.querySelector(".admin-member-details-close")?.focus();
}

function bindAdminMembersSection() {
  const searchInput = app.querySelector("#admin-members-search");
  const roleFilter = app.querySelector("#admin-members-role-filter");
  const statusFilter = app.querySelector("#admin-members-status-filter");
  const membersTable = app.querySelector("#admin-members-table-anchor");

  const bindMembersTableActions = () => {
    membersTable?.querySelectorAll("[data-member-view]").forEach((button) => {
      button.addEventListener("click", () => {
        openAdminMemberDetails(button.dataset.memberView || "");
      });
    });

    membersTable?.querySelectorAll("[data-member-toggle-status]").forEach((button) => {
      button.addEventListener("click", async () => {
        const member = getAdminMemberById(button.dataset.memberToggleStatus || "");
        if (!member) {
          return;
        }

        try {
          await updateMemberAccountStatus(member, member.accountStatus === "disabled" ? "active" : "disabled");
          await refreshAdminMembers({ force: true, reason: "admin:member-status" });
          safeRender();
        } catch (error) {
          alert(error.message || "Could not update account status.");
        }
      });
    });

    membersTable?.querySelectorAll("[data-member-delete]").forEach((button) => {
      button.addEventListener("click", async () => {
        const member = getAdminMemberById(button.dataset.memberDelete || "");
        if (!member) {
          return;
        }

        const confirmed = await confirmMemberDeletion(member);
        if (!confirmed) {
          return;
        }

        try {
          await deleteMemberAccount(member);
          safeRender();
        } catch (error) {
          alert(error.message || "Could not delete member.");
        }
      });
    });
  };

  const refreshMembersTable = () => {
    if (!membersTable) {
      return;
    }

    membersTable.innerHTML = renderAdminMembersTableMarkup();
    bindMembersTableActions();
  };

  searchInput?.addEventListener("input", () => {
    appState.memberAdminFilters.query = searchInput.value || "";
    refreshMembersTable();
  });

  roleFilter?.addEventListener("change", () => {
    appState.memberAdminFilters.role = roleFilter.value || "all";
    refreshMembersTable();
  });

  statusFilter?.addEventListener("change", () => {
    appState.memberAdminFilters.status = statusFilter.value || "all";
    refreshMembersTable();
  });

  bindMembersTableActions();
}

function formatAnnouncementDateLabel(value) {
  const parsedDate = parseCompletedAtValue(value);
  if (!(parsedDate instanceof Date) || Number.isNaN(parsedDate.getTime())) {
    return "Latest update";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
}

function getLocalCalendarDateKey(referenceDate = new Date()) {
  const year = referenceDate.getFullYear();
  const month = String(referenceDate.getMonth() + 1).padStart(2, "0");
  const day = String(referenceDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getLocalCalendarDayIndex(referenceDate = new Date()) {
  return Math.floor(new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
  ).getTime() / 86400000);
}

function normalizeFallbackContentMode(value) {
  const normalizedValue = String(value || "").trim().toLowerCase();
  if (normalizedValue === "jokes" || normalizedValue === "facts" || normalizedValue === "mixed") {
    return normalizedValue;
  }
  return DEFAULT_FALLBACK_CONTENT_MODE;
}

function normalizeFallbackJokeRecord(record) {
  const question = String(record?.question || "").trim();
  const answer = String(record?.answer || "").trim();
  if (!question || !answer) {
    return null;
  }

  return { question, answer };
}

function normalizeFallbackFactRecord(record) {
  const text = String(typeof record === "string" ? record : record?.text || "").trim();
  if (!text) {
    return null;
  }

  return { text };
}

function getFallbackJokeKey(record) {
  const normalizedRecord = normalizeFallbackJokeRecord(record);
  if (!normalizedRecord) {
    return "";
  }

  return `joke:${normalizedRecord.question.toLowerCase()}::${normalizedRecord.answer.toLowerCase()}`;
}

function getFallbackFactKey(record) {
  const normalizedRecord = normalizeFallbackFactRecord(record);
  if (!normalizedRecord) {
    return "";
  }

  return `fact:${normalizedRecord.text.toLowerCase()}`;
}

function readStoredFallbackJokes() {
  try {
    const rawValue = localStorage.getItem(FALLBACK_JOKES_STORAGE_KEY);
    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);
    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .map((entry) => normalizeFallbackJokeRecord(entry))
      .filter(Boolean);
  } catch (error) {
    console.error("Failed to read fallback jokes from localStorage", error);
    try {
      localStorage.setItem(FALLBACK_JOKES_STORAGE_KEY, JSON.stringify(DEFAULT_GROW_JOKES));
    } catch (resetError) {
      console.error("Failed to reset fallback jokes in localStorage", resetError);
    }
    return [];
  }
}

function writeStoredFallbackJokes(records = []) {
  try {
    localStorage.setItem(FALLBACK_JOKES_STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error("Failed to write fallback jokes to localStorage", error);
  }
}

function readStoredFallbackFacts() {
  try {
    const rawValue = localStorage.getItem(FALLBACK_FACTS_STORAGE_KEY);
    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);
    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .map((entry) => normalizeFallbackFactRecord(entry))
      .filter(Boolean);
  } catch (error) {
    console.error("Failed to read fallback facts from localStorage", error);
    try {
      localStorage.setItem(FALLBACK_FACTS_STORAGE_KEY, JSON.stringify(DEFAULT_GROW_FACTS.map((text) => ({ text }))));
    } catch (resetError) {
      console.error("Failed to reset fallback facts in localStorage", resetError);
    }
    return [];
  }
}

function writeStoredFallbackFacts(records = []) {
  try {
    localStorage.setItem(FALLBACK_FACTS_STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error("Failed to write fallback facts to localStorage", error);
  }
}

function seedFallbackContentStorageIfEmpty() {
  try {
    const storedDisplayMode = getMessageBoardDisplayMode();
    if (!localStorage.getItem(MESSAGE_BOARD_DISPLAY_MODE_STORAGE_KEY)) {
      writeMessageBoardDisplayMode(storedDisplayMode || DEFAULT_MESSAGE_BOARD_DISPLAY_MODE);
    }
  } catch (error) {
    console.error("Failed to seed message board display mode into localStorage", error);
  }

  try {
    const storedJokes = readStoredFallbackJokes();
    if (!storedJokes.length) {
      writeStoredFallbackJokes(DEFAULT_GROW_JOKES);
    }
  } catch (error) {
    console.error("Failed to seed fallback jokes into localStorage", error);
  }

  try {
    const storedFacts = readStoredFallbackFacts();
    if (!storedFacts.length) {
      writeStoredFallbackFacts(DEFAULT_GROW_FACTS.map((text) => ({ text })));
    }
  } catch (error) {
    console.error("Failed to seed fallback facts into localStorage", error);
  }

  try {
    const storedMode = getFallbackContentMode();
    if (!localStorage.getItem(FALLBACK_MODE_STORAGE_KEY)) {
      writeFallbackContentMode(storedMode || DEFAULT_FALLBACK_CONTENT_MODE);
    }
  } catch (error) {
    console.error("Failed to seed fallback content mode into localStorage", error);
  }

  try {
    const storedMixedImageMode = getMixedImageMode();
    if (!localStorage.getItem(MIXED_IMAGE_MODE_STORAGE_KEY)) {
      writeMixedImageMode(storedMixedImageMode || DEFAULT_MIXED_IMAGE_MODE);
    }
  } catch (error) {
    console.error("Failed to seed mixed fallback image mode into localStorage", error);
  }
}

function getFallbackContentMode() {
  try {
    return normalizeFallbackContentMode(localStorage.getItem(FALLBACK_MODE_STORAGE_KEY) || "");
  } catch (error) {
    console.error("Failed to read fallback content mode from localStorage", error);
    try {
      localStorage.setItem(FALLBACK_MODE_STORAGE_KEY, DEFAULT_FALLBACK_CONTENT_MODE);
    } catch (resetError) {
      console.error("Failed to reset fallback content mode in localStorage", resetError);
    }
    return DEFAULT_FALLBACK_CONTENT_MODE;
  }
}

function writeFallbackContentMode(mode) {
  const normalizedMode = normalizeFallbackContentMode(mode);
  try {
    localStorage.setItem(FALLBACK_MODE_STORAGE_KEY, normalizedMode);
  } catch (error) {
    console.error("Failed to write fallback content mode to localStorage", error);
  }
  return normalizedMode;
}

function mergeUniqueFallbackJokes(baseRecords = [], additionalRecords = []) {
  const merged = [];
  const seenKeys = new Set();
  [...baseRecords, ...additionalRecords].forEach((record) => {
    const normalizedRecord = normalizeFallbackJokeRecord(record);
    const recordKey = getFallbackJokeKey(normalizedRecord);
    if (!normalizedRecord || !recordKey || seenKeys.has(recordKey)) {
      return;
    }

    seenKeys.add(recordKey);
    merged.push(normalizedRecord);
  });
  return merged;
}

function mergeUniqueFallbackFacts(baseRecords = [], additionalRecords = []) {
  const merged = [];
  const seenKeys = new Set();
  [...baseRecords, ...additionalRecords].forEach((record) => {
    const normalizedRecord = normalizeFallbackFactRecord(record);
    const recordKey = getFallbackFactKey(normalizedRecord);
    if (!normalizedRecord || !recordKey || seenKeys.has(recordKey)) {
      return;
    }

    seenKeys.add(recordKey);
    merged.push(normalizedRecord);
  });
  return merged;
}

function getEffectiveFallbackJokes() {
  return mergeUniqueFallbackJokes(DEFAULT_GROW_JOKES, readStoredFallbackJokes());
}

function getEffectiveFallbackFacts() {
  return mergeUniqueFallbackFacts(DEFAULT_GROW_FACTS.map((text) => ({ text })), readStoredFallbackFacts());
}

function readRecentFallbackItemsHistory() {
  try {
    const rawValue = localStorage.getItem(RECENT_FALLBACK_ITEMS_STORAGE_KEY);
    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);
    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .map((entry) => ({
        dateKey: String(entry?.dateKey || "").trim(),
        itemType: String(entry?.itemType || "").trim().toLowerCase(),
        itemKey: String(entry?.itemKey || "").trim(),
      }))
      .filter((entry) => (
        /^\d{4}-\d{2}-\d{2}$/.test(entry.dateKey)
        && (entry.itemType === "joke" || entry.itemType === "fact")
        && entry.itemKey
      ))
      .slice(-FALLBACK_CONTENT_HISTORY_LIMIT);
  } catch (error) {
    console.error("Failed to read recent fallback content history from localStorage", error);
    try {
      localStorage.setItem(RECENT_FALLBACK_ITEMS_STORAGE_KEY, JSON.stringify([]));
    } catch (resetError) {
      console.error("Failed to reset recent fallback content history in localStorage", resetError);
    }
    return [];
  }
}

function writeRecentFallbackItemsHistory(historyEntries = []) {
  try {
    localStorage.setItem(
      RECENT_FALLBACK_ITEMS_STORAGE_KEY,
      JSON.stringify(historyEntries.slice(-FALLBACK_CONTENT_HISTORY_LIMIT)),
    );
  } catch (error) {
    console.error("Failed to write recent fallback content history to localStorage", error);
  }
}

function getFallbackJokeItems() {
  return getEffectiveFallbackJokes().map((entry) => ({
    type: "joke",
    key: getFallbackJokeKey(entry),
    question: entry.question,
    answer: entry.answer,
  }));
}

function getFallbackFactItems() {
  return getEffectiveFallbackFacts().map((entry) => ({
    type: "fact",
    key: getFallbackFactKey(entry),
    text: entry.text,
  }));
}

function findFallbackItemByHistoryEntry(entry, jokes = getFallbackJokeItems(), facts = getFallbackFactItems()) {
  if (!entry?.itemKey) {
    return null;
  }

  const pool = entry.itemType === "fact" ? facts : jokes;
  return pool.find((item) => item.key === entry.itemKey) || null;
}

function selectDailyFallbackItem(items = [], baseIndex = 0, recentKeys = new Set()) {
  if (!items.length) {
    return null;
  }

  const normalizedBaseIndex = ((baseIndex % items.length) + items.length) % items.length;
  if (!recentKeys.has(items[normalizedBaseIndex].key)) {
    return items[normalizedBaseIndex];
  }

  for (let offset = 1; offset < items.length; offset += 1) {
    const candidateItem = items[(normalizedBaseIndex + offset) % items.length];
    if (!recentKeys.has(candidateItem.key)) {
      return candidateItem;
    }
  }

  return items[normalizedBaseIndex];
}

function getDailyFallbackContent(referenceDate = new Date()) {
  const fallbackMode = getFallbackContentMode();
  const jokes = getFallbackJokeItems();
  const facts = getFallbackFactItems();
  const dateKey = getLocalCalendarDateKey(referenceDate);
  const dayIndex = getLocalCalendarDayIndex(referenceDate);
  const history = readRecentFallbackItemsHistory();
  const todayHistoryEntry = history.find((entry) => entry.dateKey === dateKey);
  const todayItem = findFallbackItemByHistoryEntry(todayHistoryEntry, jokes, facts);
  const isTodayItemCompatibleWithMode = Boolean(
    todayItem
    && (
      fallbackMode === "mixed"
      || (fallbackMode === "jokes" && todayItem.type === "joke")
      || (fallbackMode === "facts" && todayItem.type === "fact")
    )
  );
  if (isTodayItemCompatibleWithMode) {
    return todayItem;
  }

  const recentKeys = new Set(
    history
      .filter((entry) => entry.dateKey !== dateKey)
      .map((entry) => entry.itemKey),
  );

  let selectedItem = null;
  if (fallbackMode === "jokes") {
    selectedItem = selectDailyFallbackItem(jokes, dayIndex, recentKeys);
  } else if (fallbackMode === "facts") {
    selectedItem = selectDailyFallbackItem(facts, dayIndex, recentKeys);
  } else {
    const preferredJokesFirst = dayIndex % 2 === 0;
    const primaryPool = preferredJokesFirst ? jokes : facts;
    const secondaryPool = preferredJokesFirst ? facts : jokes;
    selectedItem = selectDailyFallbackItem(primaryPool, dayIndex, recentKeys)
      || selectDailyFallbackItem(secondaryPool, dayIndex, recentKeys);
  }

  if (!selectedItem) {
    selectedItem = jokes[0] || facts[0] || {
      type: "fact",
      key: "fact:fallback",
      text: "Seeds need steady moisture, gentle warmth, and oxygen to begin germination.",
    };
  }

  const nextHistory = [
    ...history.filter((entry) => entry.dateKey !== dateKey),
    { dateKey, itemType: selectedItem.type, itemKey: selectedItem.key },
  ].slice(-FALLBACK_CONTENT_HISTORY_LIMIT);
  writeRecentFallbackItemsHistory(nextHistory);
  console.log("[Cannakan App Init] fallback selected", {
    dateKey,
    fallbackMode,
    fallbackType: selectedItem.type,
    fallbackItemKey: selectedItem.key,
  });
  return selectedItem;
}

function parseFallbackContentBatchInput(value = "") {
  const blocks = String(value || "")
    .split(/\r?\n\s*\r?\n/g)
    .map((block) => block.trim())
    .filter(Boolean);

  const jokes = [];
  const facts = [];

  blocks.forEach((block) => {
    const lines = block
      .split(/\r?\n/g)
      .map((line) => line.trim())
      .filter(Boolean);

    let question = "";
    let answer = "";
    let fact = "";
    let currentField = "";

    lines.forEach((line) => {
      if (/^JOKE:/i.test(line)) {
        currentField = "question";
        question = line.replace(/^JOKE:/i, "").trim();
        return;
      }
      if (/^ANSWER:/i.test(line)) {
        currentField = "answer";
        answer = line.replace(/^ANSWER:/i, "").trim();
        return;
      }
      if (/^FACT:/i.test(line)) {
        currentField = "fact";
        fact = line.replace(/^FACT:/i, "").trim();
        return;
      }

      if (currentField === "question") {
        question = `${question} ${line}`.trim();
      } else if (currentField === "answer") {
        answer = `${answer} ${line}`.trim();
      } else if (currentField === "fact") {
        fact = `${fact} ${line}`.trim();
      }
    });

    const normalizedJoke = normalizeFallbackJokeRecord({ question, answer });
    if (normalizedJoke) {
      jokes.push(normalizedJoke);
      return;
    }

    const normalizedFact = normalizeFallbackFactRecord({ text: fact });
    if (normalizedFact) {
      facts.push(normalizedFact);
    }
  });

  return { jokes, facts };
}

function serializeFallbackContentForExport(jokes = getEffectiveFallbackJokes(), facts = getEffectiveFallbackFacts()) {
  const jokeBlocks = jokes.map((entry) => `JOKE: ${entry.question}\nANSWER: ${entry.answer}`);
  const factBlocks = facts.map((entry) => `FACT: ${entry.text}`);
  return [...jokeBlocks, ...factBlocks].join("\n\n");
}

function clearStoredFallbackContent() {
  try {
    localStorage.removeItem(FALLBACK_JOKES_STORAGE_KEY);
    localStorage.removeItem(FALLBACK_FACTS_STORAGE_KEY);
    localStorage.removeItem(RECENT_FALLBACK_ITEMS_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear fallback content from localStorage", error);
    throw new Error("Could not clear fallback content from this browser.");
  }
}

function getHomeAnnouncementCardData(referenceDate = new Date()) {
  const announcement = getLatestActiveAnnouncement();
  const displayMode = getMessageBoardDisplayMode();
  if (displayMode === "announcement" && announcement) {
    return {
      title: announcement.title || "Latest from Cannakan",
      body: announcement.body || "Latest update from Cannakan.",
      imageUrl: resolveAnnouncementCardImageUrl(announcement.imageUrl || ""),
      linkUrl: announcement.instagramPostUrl || "",
      buttonText: normalizeAnnouncementButtonText(announcement.buttonText || ""),
      dateValue: announcement.publishAt || announcement.updatedAt || announcement.createdAt || referenceDate.toISOString(),
      configuredDisplayMode: displayMode,
      effectiveDisplayMode: "announcement",
    };
  }

  const fallbackContent = getDailyFallbackContent(referenceDate);
  const fallbackMode = getFallbackContentMode();
  return {
    title: DEFAULT_ANNOUNCEMENT_FALLBACK_SUBTEXT,
    body: fallbackContent.type === "joke" ? fallbackContent.question : fallbackContent.text,
    answer: fallbackContent.type === "joke" ? fallbackContent.answer : "",
    imageUrl: resolveFallbackCardImageUrl(fallbackContent.type, fallbackMode),
    linkUrl: "",
    buttonText: "",
    dateValue: referenceDate.toISOString(),
    fallbackType: fallbackContent.type,
    configuredDisplayMode: displayMode,
    effectiveDisplayMode: "fallback",
    fallbackMode,
  };
}

function bindMessageBoardImageFallbacks(scope = document) {
  if (!scope?.querySelectorAll) {
    return;
  }

  scope.querySelectorAll("[data-message-board-image]").forEach((image) => {
    if (!(image instanceof HTMLImageElement)) {
      return;
    }

    const fallbackSrc = image.dataset.fallbackSrc || MESSAGE_BOARD_IMAGE_FALLBACK_URL;
    const visualShell = image.closest(".home-announcement-card-visual-shell");
    const hideBrokenImage = () => {
      image.dataset.fallbackApplied = "true";
      image.dataset.imageFailed = "true";
      image.alt = "";
      image.setAttribute("aria-hidden", "true");
      image.hidden = true;
      image.classList.add("is-hidden");
      visualShell?.classList.add("is-image-failed");
    };

    image.onload = () => {
      image.dataset.imageFailed = "false";
      image.hidden = false;
      image.classList.remove("is-hidden");
      visualShell?.classList.remove("is-image-failed");
    };

    image.onerror = () => {
      if (image.dataset.fallbackApplied !== "true" && fallbackSrc && image.src !== fallbackSrc) {
        image.dataset.fallbackApplied = "true";
        image.src = fallbackSrc;
        return;
      }

      hideBrokenImage();
    };

    if (image.complete && !image.naturalWidth) {
      if (fallbackSrc && image.src !== fallbackSrc) {
        image.dataset.fallbackApplied = "true";
        image.src = fallbackSrc;
      } else {
        hideBrokenImage();
      }
    }
  });
}

function renderHomeAnnouncementCard(cardData = getHomeAnnouncementCardData()) {
  const isFallback = cardData.effectiveDisplayMode !== "announcement";
  const visualImageUrl = resolveMessageBoardImageUrl(cardData.imageUrl);
  console.log("[Cannakan Announcements] announcement section render", {
    hasActiveAnnouncement: !isFallback,
    configuredDisplayMode: cardData.configuredDisplayMode,
    effectiveDisplayMode: cardData.effectiveDisplayMode,
    title: cardData.title,
  });
  console.log("[Cannakan Announcements] Home announcement image resolved", {
    requestedImagePath: visualImageUrl,
    fallbackImagePath: MESSAGE_BOARD_IMAGE_FALLBACK_URL,
    usingAnnouncementImage: !isFallback,
  });
  const imageMarkup = `
      <div class="home-announcement-card-visual-shell${visualImageUrl === MESSAGE_BOARD_IMAGE_FALLBACK_URL ? " home-announcement-card-visual-shell--fallback" : ""}">
        <img
          src="${escapeHtml(visualImageUrl)}"
          alt=""
          class="home-announcement-card-image"
          data-message-board-image="true"
          data-fallback-src="${escapeHtml(MESSAGE_BOARD_IMAGE_FALLBACK_URL)}"
        >
        <div class="home-announcement-card-image-overlay" aria-hidden="true"></div>
      </div>
    `;
  const captionMarkup = cardData.fallbackType === "joke"
    ? `
      <div class="home-announcement-card-caption home-announcement-card-caption--joke">
        <p class="home-announcement-card-caption-line">
          <span class="home-announcement-card-caption-kicker">Joke:</span>
          <span>${escapeHtml(cardData.body)}</span>
        </p>
        <p class="home-announcement-card-caption-line">
          <span class="home-announcement-card-caption-kicker">Answer:</span>
          <span>${escapeHtml(cardData.answer || "")}</span>
        </p>
      </div>
    `
    : (cardData.fallbackType === "fact"
      ? `
      <div class="home-announcement-card-caption home-announcement-card-caption--joke">
        <p class="home-announcement-card-caption-line">
          <span class="home-announcement-card-caption-kicker">Grow Fact:</span>
          <span>${escapeHtml(cardData.body)}</span>
        </p>
      </div>
    `
      : `<p class="home-announcement-card-caption" title="${escapeHtml(cardData.body)}">${escapeHtml(cardData.body)}</p>`);

  return `
    <section class="card home-announcement-card ${isFallback ? "is-fallback" : "is-live"}" aria-labelledby="home-announcement-title">
      <div class="home-announcement-card-media">
        ${imageMarkup}
      </div>
      <div class="home-announcement-card-body">
        <div class="home-announcement-card-copy">
          <p class="home-announcement-card-label">Latest from Cannakan®</p>
          <h3 id="home-announcement-title">${escapeHtml(cardData.title)}</h3>
          ${captionMarkup}
        </div>
        <div class="home-announcement-card-footer">
          <p class="home-announcement-card-date">${escapeHtml(formatAnnouncementDateLabel(cardData.dateValue))}</p>
          ${cardData.linkUrl ? `
            <div class="home-announcement-card-actions">
              <a class="button button-secondary home-announcement-card-link" href="${escapeHtml(cardData.linkUrl)}" target="_blank" rel="noreferrer">
                <span>${escapeHtml(normalizeAnnouncementButtonText(cardData.buttonText || ""))}</span>
              </a>
            </div>
          ` : ""}
        </div>
      </div>
    </section>
  `;
}

function renderAdminMessageBoardRadioSelectorMarkup({
  name,
  legend,
  selectedValue,
  options = [],
}) {
  return `
    <fieldset class="admin-source-form-full admin-message-board-radio-group">
      <legend>${escapeHtml(legend)}</legend>
      <div class="admin-message-board-radio-grid">
        ${options.map((option) => `
          <label class="admin-message-board-radio-option${selectedValue === option.value ? " is-selected" : ""}">
            <input type="radio" name="${escapeHtml(name)}" value="${escapeHtml(option.value)}"${selectedValue === option.value ? " checked" : ""}${option.required ? " required" : ""}>
            <span class="admin-message-board-radio-copy">
              <strong>${escapeHtml(option.label)}</strong>
              <span>${escapeHtml(option.description)}</span>
            </span>
          </label>
        `).join("")}
      </div>
    </fieldset>
  `;
}

function renderAdminMessageBoardImagePreviewMarkup({ title, description, imageUrl }) {
  const resolvedImageUrl = resolveMessageBoardImageUrl(imageUrl);
  return `
    <article class="admin-message-board-image-preview">
      <div class="admin-announcement-preview-image">
        <img
          src="${escapeHtml(resolvedImageUrl)}"
          alt="${escapeHtml(title)}"
          class="admin-announcement-card-image"
          data-message-board-image="true"
          data-fallback-src="${escapeHtml(MESSAGE_BOARD_IMAGE_FALLBACK_URL)}"
        >
      </div>
      <div class="admin-source-logo-preview-copy">
        <strong>${escapeHtml(title)}</strong>
        <p>${escapeHtml(description)}</p>
      </div>
    </article>
  `;
}

function renderAdminMessageBoardImageFieldMarkup({
  label,
  fieldName,
  uploadName,
  clearButtonId,
  value,
  placeholder,
}) {
  const hasLocalUpload = isDataUrl(value);
  const savedStateLabel = hasLocalUpload
    ? "A local uploaded image is currently saved for this slot."
    : (normalizeMediaUrl(value)
      ? "A saved image URL or asset path is currently set for this slot."
      : `If nothing is set, ${MESSAGE_BOARD_IMAGE_FALLBACK_URL} will be used.`);

  return `
    <label class="admin-source-form-full">
      <span>${escapeHtml(label)}</span>
      <input type="text" name="${escapeHtml(fieldName)}" value="${escapeHtml(getMessageBoardImageFieldDisplayValue(value))}" placeholder="${escapeHtml(placeholder)}">
    </label>
    <div class="admin-source-form-full admin-message-board-upload-block">
      <span class="file-upload-control" aria-label="${escapeHtml(`Upload ${label}`)}">
        <button type="button" class="file-upload-button">Upload image file</button>
        <span class="file-upload-name">No file selected</span>
        <input type="file" name="${escapeHtml(uploadName)}" accept="image/*" class="file-upload-input">
      </span>
      <button type="button" class="button button-secondary" id="${escapeHtml(clearButtonId)}">Clear Saved Image</button>
      <p class="muted admin-source-logo-helper">${escapeHtml(savedStateLabel)}</p>
    </div>
  `;
}

function renderAdminAnnouncementStatusPillMarkup(status) {
  const normalizedStatus = normalizeAnnouncementStatus(status);
  return `<span class="admin-source-status-pill is-${escapeHtml(normalizedStatus === "active" ? "active" : "hidden")}">${escapeHtml(capitalize(normalizedStatus))}</span>`;
}

function renderAdminAnnouncementCardMarkup(announcement) {
  const title = announcement.title || "Untitled announcement";
  const body = announcement.body || "No message added yet.";
  const imageMarkup = `
    <img
      src="${escapeHtml(resolveAnnouncementCardImageUrl(announcement.imageUrl || ""))}"
      alt="Announcement preview"
      class="admin-announcement-card-image"
      data-message-board-image="true"
      data-fallback-src="${escapeHtml(MESSAGE_BOARD_IMAGE_FALLBACK_URL)}"
    >
  `;

  return `
    <article class="meta-card admin-announcement-card">
      <div class="admin-announcement-card-media">${imageMarkup}</div>
      <div class="admin-announcement-card-copy">
        <div class="admin-announcement-card-head">
          ${renderAdminAnnouncementStatusPillMarkup(announcement.status)}
          <span class="muted">${escapeHtml(announcement.updatedAt ? `Updated ${formatAnnouncementDateLabel(announcement.updatedAt)}` : "Stored locally")}</span>
        </div>
        <div class="admin-announcement-card-copy-block">
          <strong class="admin-announcement-card-title">${escapeHtml(title)}</strong>
          <p class="admin-announcement-card-caption">${escapeHtml(body)}</p>
        </div>
        <p class="admin-announcement-card-meta">${escapeHtml(isAnnouncementCurrentlyPublic(announcement) ? "This message board item is currently live on Home." : "This message board item is saved but inactive, so Home will show the configured fallback content.")}</p>
        <p class="admin-announcement-card-link-row">
          ${announcement.instagramPostUrl
    ? `<a href="${escapeHtml(announcement.instagramPostUrl)}" target="_blank" rel="noreferrer">${escapeHtml(normalizeAnnouncementButtonText(announcement.buttonText || ""))}</a>`
    : '<span class="muted">No Instagram button configured</span>'}
        </p>
      </div>
    </article>
  `;
}

function renderAdminAnnouncementEditorMarkup(announcement = null) {
  const isActive = normalizeAnnouncementStatus(announcement?.status) === "active";
  const displayMode = getMessageBoardDisplayMode();
  const fallbackMode = getFallbackContentMode();
  const mixedImageMode = getMixedImageMode();
  const defaultAnnouncementImageUrl = getDefaultAnnouncementImageUrl();
  const defaultJokeImageUrl = getDefaultJokeImageUrl();
  const defaultFactImageUrl = getDefaultFactImageUrl();
  console.log("[Cannakan Announcements] Admin announcements CMS rendered", {
    hasStoredAnnouncement: Boolean(announcement),
    isActive,
    displayMode,
    fallbackMode,
    mixedImageMode,
  });
  return `
    <form id="admin-message-board-settings-form" class="admin-source-form">
      <div class="section-heading admin-source-form-heading app-section-header">
        <div class="section-title-with-icon app-section-header-main">
          ${renderAppSectionHeaderIcon("message-board")}
          <div>
            <p class="eyebrow">Message Board CMS</p>
            <h4>Control the Home message board</h4>
            <p class="muted">Choose whether Home shows the saved announcement or the default fallback rotation, then manage the images that support each state.</p>
          </div>
        </div>
      </div>
      <div class="admin-source-form-grid">
        ${renderAdminMessageBoardRadioSelectorMarkup({
    name: "displayMode",
    legend: "Display Mode",
    selectedValue: displayMode,
    options: [
      {
        value: "announcement",
        label: "Show Announcement",
        description: "Use the active saved announcement when one is available.",
        required: true,
      },
      {
        value: "fallback",
        label: "Show Default Fallback",
        description: "Ignore announcement display and show the fallback content rotation.",
      },
    ],
  })}
        <div class="admin-source-form-full admin-message-board-subsection">
          <strong>Announcement Content</strong>
          <p class="muted">Title and message are only required when you want to save or update an announcement.</p>
        </div>
        <label class="admin-source-form-full">
          <span>Title</span>
          <input type="text" name="title" maxlength="120" value="${escapeHtml(announcement?.title || "")}" placeholder="Latest from Cannakan">
        </label>
        <label class="admin-source-form-full">
          <span>Message</span>
          <textarea name="message" rows="5" maxlength="800" placeholder="Share the latest Cannakan update">${escapeHtml(announcement?.body || "")}</textarea>
        </label>
        ${renderAdminMessageBoardImageFieldMarkup({
    label: "Announcement image",
    fieldName: "imageUrl",
    uploadName: "announcementImageUpload",
    clearButtonId: "admin-message-board-clear-announcement-image",
    value: announcement?.imageUrl || "",
    placeholder: "https://example.com/post-image.jpg or /assets/custom-image.png",
  })}
        <label class="admin-source-form-full">
          <span>Instagram URL</span>
          <input type="url" name="instagramUrl" value="${escapeHtml(announcement?.instagramPostUrl || "")}" placeholder="https://www.instagram.com/p/...">
        </label>
        <label class="admin-source-form-full">
          <span>Button Text</span>
          <input type="text" name="buttonText" maxlength="80" value="${escapeHtml(announcement?.buttonText || "")}" placeholder="${escapeHtml(DEFAULT_ANNOUNCEMENT_BUTTON_TEXT)}">
        </label>
        <div class="admin-source-form-full admin-announcement-toggle-field">
          <span class="admin-source-field-label">Active</span>
          <label class="admin-announcement-toggle-row">
            <input type="checkbox" name="active"${isActive ? " checked" : ""}>
            <span>Allow this announcement to appear when Display Mode is set to Show Announcement</span>
          </label>
        </div>
        ${renderAdminMessageBoardRadioSelectorMarkup({
    name: "fallbackMode",
    legend: "Fallback Content Type",
    selectedValue: fallbackMode,
    options: [
      {
        value: "jokes",
        label: "Jokes only",
        description: "Use the daily joke rotation when fallback mode is active.",
        required: true,
      },
      {
        value: "facts",
        label: "Grow facts only",
        description: "Use only grow facts on the Home card.",
      },
      {
        value: "mixed",
        label: "Mixed jokes + facts",
        description: "Rotate between jokes and grow facts over time.",
      },
    ],
  })}
        <div class="admin-source-form-full admin-message-board-subsection">
          <strong>Default Image Manager</strong>
          <p class="muted">If a custom image is missing or fails, the Home card falls back to the built-in wow image.</p>
        </div>
        ${renderAdminMessageBoardImageFieldMarkup({
    label: "Announcement default image",
    fieldName: "defaultAnnouncementImageUrl",
    uploadName: "defaultAnnouncementImageUpload",
    clearButtonId: "admin-message-board-clear-default-announcement-image",
    value: defaultAnnouncementImageUrl,
    placeholder: "https://example.com/announcement-default.jpg or /assets/custom-image.png",
  })}
        ${renderAdminMessageBoardImageFieldMarkup({
    label: "Joke fallback image",
    fieldName: "defaultJokeImageUrl",
    uploadName: "defaultJokeImageUpload",
    clearButtonId: "admin-message-board-clear-default-joke-image",
    value: defaultJokeImageUrl,
    placeholder: "https://example.com/joke-default.jpg or /assets/custom-image.png",
  })}
        ${renderAdminMessageBoardImageFieldMarkup({
    label: "Grow fact fallback image",
    fieldName: "defaultFactImageUrl",
    uploadName: "defaultFactImageUpload",
    clearButtonId: "admin-message-board-clear-default-fact-image",
    value: defaultFactImageUrl,
    placeholder: "https://example.com/fact-default.jpg or /assets/custom-image.png",
  })}
        ${renderAdminMessageBoardRadioSelectorMarkup({
    name: "mixedImageMode",
    legend: "Mixed image behavior",
    selectedValue: mixedImageMode,
    options: [
      {
        value: "match-type",
        label: "Use matching item type image",
        description: "Jokes use the joke image and facts use the grow fact image.",
        required: true,
      },
      {
        value: "joke",
        label: "Always use joke image",
        description: "Mixed fallback items always use the joke fallback image.",
      },
      {
        value: "fact",
        label: "Always use grow fact image",
        description: "Mixed fallback items always use the grow fact fallback image.",
      },
      {
        value: "announcement",
        label: "Use announcement default image",
        description: "Mixed fallback items always use the announcement default image.",
      },
    ],
  })}
        <div class="admin-source-form-full admin-message-board-image-preview-grid">
          ${renderAdminMessageBoardImagePreviewMarkup({
    title: "Announcement default image",
    description: "Used when an active announcement has no custom image.",
    imageUrl: getResolvedDefaultAnnouncementImageUrl(),
  })}
          ${renderAdminMessageBoardImagePreviewMarkup({
    title: "Joke fallback image",
    description: "Used for joke fallback cards unless mixed mode overrides it.",
    imageUrl: getResolvedDefaultJokeImageUrl(),
  })}
          ${renderAdminMessageBoardImagePreviewMarkup({
    title: "Grow fact fallback image",
    description: "Used for grow fact fallback cards unless mixed mode overrides it.",
    imageUrl: getResolvedDefaultFactImageUrl(),
  })}
        </div>
      </div>
      <p id="admin-message-board-settings-message" class="snapshot-message">${escapeHtml(appState.announcementAdminMessage || "")}</p>
      <div class="form-actions admin-source-form-actions">
        <button type="submit" class="button button-primary">Save Message Board Settings</button>
        <button type="button" class="button button-secondary" id="admin-announcement-clear">Clear Announcement</button>
      </div>
    </form>
  `;
}

function renderAdminAnnouncementsListMarkup() {
  if (appState.announcementsError) {
    return `
      <div class="admin-sources-list-shell">
        <div class="admin-sources-empty"><p>${escapeHtml(appState.announcementsError)}</p></div>
      </div>
    `;
  }

  const announcement = appState.announcements[0] || null;
  const cardData = getHomeAnnouncementCardData();
  const previewStatus = cardData.effectiveDisplayMode === "announcement"
    ? "Showing active announcement"
    : (cardData.fallbackType === "fact" ? "Showing daily grow fact fallback" : "Showing daily joke fallback");

  return `
    <div class="admin-sources-list-shell">
      <div class="admin-sources-list-head">
        <strong>Current Home Preview</strong>
        <span class="muted">${escapeHtml(previewStatus)}</span>
      </div>
      ${renderHomeAnnouncementCard(cardData)}
      <div class="admin-message-board-preview-meta">
        <p class="muted"><strong>Display Mode:</strong> ${escapeHtml(getMessageBoardDisplayModeLabel(cardData.configuredDisplayMode))}</p>
        <p class="muted"><strong>Fallback Type:</strong> ${escapeHtml(getFallbackContentModeLabel(cardData.fallbackMode || getFallbackContentMode()))}</p>
      </div>
      ${announcement ? `
        <div class="admin-message-board-saved-announcement">
          <div class="admin-sources-list-head">
            <strong>Saved Announcement</strong>
            <span class="muted">${escapeHtml(normalizeAnnouncementStatus(announcement.status) === "active" ? "Active" : "Inactive")}</span>
          </div>
          ${renderAdminAnnouncementCardMarkup(announcement)}
        </div>
      ` : `
        <div class="admin-sources-empty">
          <p>No announcement is currently saved. Home will still render the fallback message board content.</p>
        </div>
      `}
    </div>
  `;
}

function bindAdminAnnouncementsSection() {
  const form = app.querySelector("#admin-message-board-settings-form");
  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  const existingAnnouncement = appState.announcements[0] || null;
  const message = form.querySelector("#admin-message-board-settings-message");
  const submitButton = form.querySelector('button[type="submit"]');
  const clearButton = form.querySelector("#admin-announcement-clear");
  const imageFieldState = {
    announcementImage: {
      label: "Announcement image",
      input: form.elements.announcementImageUpload,
      clearButton: form.querySelector("#admin-message-board-clear-announcement-image"),
      textInput: form.elements.imageUrl,
      pendingFile: null,
      clearRequested: false,
      existingValue: String(existingAnnouncement?.imageUrl || "").trim(),
    },
    defaultAnnouncementImage: {
      label: "Announcement default image",
      input: form.elements.defaultAnnouncementImageUpload,
      clearButton: form.querySelector("#admin-message-board-clear-default-announcement-image"),
      textInput: form.elements.defaultAnnouncementImageUrl,
      pendingFile: null,
      clearRequested: false,
      existingValue: getDefaultAnnouncementImageUrl(),
    },
    defaultJokeImage: {
      label: "Joke fallback image",
      input: form.elements.defaultJokeImageUpload,
      clearButton: form.querySelector("#admin-message-board-clear-default-joke-image"),
      textInput: form.elements.defaultJokeImageUrl,
      pendingFile: null,
      clearRequested: false,
      existingValue: getDefaultJokeImageUrl(),
    },
    defaultFactImage: {
      label: "Grow fact fallback image",
      input: form.elements.defaultFactImageUpload,
      clearButton: form.querySelector("#admin-message-board-clear-default-fact-image"),
      textInput: form.elements.defaultFactImageUrl,
      pendingFile: null,
      clearRequested: false,
      existingValue: getDefaultFactImageUrl(),
    },
  };

  const validateMessageBoardImageFile = (file, label) => {
    if (!file) {
      return "";
    }
    if (!file.type.startsWith("image/")) {
      return `${label} must be an image file.`;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return `${label} is too large. Please choose an image under 12 MB.`;
    }
    return "";
  };

  const resolveMessageBoardImageValue = async (fieldState) => {
    if (!fieldState) {
      return "";
    }
    if (fieldState.clearRequested) {
      return "";
    }
    if (fieldState.pendingFile) {
      return prepareImageDataUrlForStorage(fieldState.pendingFile, MAX_IMAGE_DIMENSION, 0.86);
    }

    const typedValue = normalizeMediaUrl(fieldState.textInput?.value || "");
    if (typedValue) {
      return typedValue;
    }

    return isDataUrl(fieldState.existingValue) ? fieldState.existingValue : "";
  };

  Object.values(imageFieldState).forEach((fieldState) => {
    if (!(fieldState.input instanceof HTMLInputElement)) {
      return;
    }

    bindFileUploadControl(fieldState.input);
    updateFileUploadName(fieldState.input);

    fieldState.input.addEventListener("change", () => {
      const file = fieldState.input.files?.[0] || null;
      updateFileUploadName(fieldState.input);
      if (!file) {
        fieldState.pendingFile = null;
        return;
      }

      const validationMessage = validateMessageBoardImageFile(file, fieldState.label);
      if (validationMessage) {
        fieldState.input.value = "";
        fieldState.pendingFile = null;
        updateFileUploadName(fieldState.input, []);
        if (message) {
          message.textContent = validationMessage;
        }
        return;
      }

      fieldState.pendingFile = file;
      fieldState.clearRequested = false;
      if (message) {
        message.textContent = `${fieldState.label} will be uploaded and stored locally when you save.`;
      }
    });

    fieldState.clearButton?.addEventListener("click", () => {
      fieldState.pendingFile = null;
      fieldState.clearRequested = true;
      if (fieldState.input) {
        fieldState.input.value = "";
        updateFileUploadName(fieldState.input, []);
      }
      if (fieldState.textInput instanceof HTMLInputElement) {
        fieldState.textInput.value = "";
      }
      if (message) {
        message.textContent = `${fieldState.label} will be cleared when you save.`;
      }
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitButton instanceof HTMLButtonElement) {
      submitButton.disabled = true;
    }
    message.textContent = "";

    try {
      const formData = new FormData(form);
      const previousFallbackMode = getFallbackContentMode();
      const announcementImageValue = await resolveMessageBoardImageValue(imageFieldState.announcementImage);
      const defaultAnnouncementImageValue = await resolveMessageBoardImageValue(imageFieldState.defaultAnnouncementImage);
      const defaultJokeImageValue = await resolveMessageBoardImageValue(imageFieldState.defaultJokeImage);
      const defaultFactImageValue = await resolveMessageBoardImageValue(imageFieldState.defaultFactImage);
      const displayMode = writeMessageBoardDisplayMode(
        String(formData.get("displayMode") || DEFAULT_MESSAGE_BOARD_DISPLAY_MODE),
      );
      const fallbackMode = writeFallbackContentMode(
        String(formData.get("fallbackMode") || DEFAULT_FALLBACK_CONTENT_MODE),
      );
      writeMixedImageMode(
        String(formData.get("mixedImageMode") || DEFAULT_MIXED_IMAGE_MODE),
      );
      writeStoredMessageBoardImageUrl(
        DEFAULT_ANNOUNCEMENT_IMAGE_STORAGE_KEY,
        defaultAnnouncementImageValue,
      );
      writeStoredMessageBoardImageUrl(
        DEFAULT_JOKE_IMAGE_STORAGE_KEY,
        defaultJokeImageValue,
      );
      writeStoredMessageBoardImageUrl(
        DEFAULT_FACT_IMAGE_STORAGE_KEY,
        defaultFactImageValue,
      );

      if (previousFallbackMode !== fallbackMode) {
        try {
          localStorage.removeItem(RECENT_FALLBACK_ITEMS_STORAGE_KEY);
        } catch (historyError) {
          console.error("Failed to reset recent fallback content history after fallback mode change", historyError);
        }
      }

      const announcementTitle = String(form.elements.title?.value || "").trim();
      const announcementMessage = String(form.elements.message?.value || "").trim();
      const instagramUrl = String(form.elements.instagramUrl?.value || "").trim();
      const buttonText = String(form.elements.buttonText?.value || "").trim();
      const announcementActive = Boolean(form.elements.active?.checked);
      const hasAnnouncementInput = Boolean(
        announcementTitle
        || announcementMessage
        || announcementImageValue
        || instagramUrl
        || buttonText
        || announcementActive,
      );
      const announcementChanged = Boolean(existingAnnouncement) && (
        announcementTitle !== String(existingAnnouncement.title || "").trim()
        || announcementMessage !== String(existingAnnouncement.body || "").trim()
        || announcementImageValue !== String(existingAnnouncement.imageUrl || "").trim()
        || normalizeExternalUrl(instagramUrl) !== String(existingAnnouncement.instagramPostUrl || "").trim()
        || buttonText !== String(existingAnnouncement.buttonText || "").trim()
        || announcementActive !== isAnnouncementCurrentlyPublic(existingAnnouncement)
      );
      const shouldSaveAnnouncement = hasAnnouncementInput || announcementChanged;

      if (shouldSaveAnnouncement) {
        if (!announcementTitle) {
          throw new Error("Announcement title is required when saving an announcement.");
        }
        if (!announcementMessage) {
          throw new Error("Announcement message is required when saving an announcement.");
        }

        await saveAnnouncementRecord({
          title: announcementTitle,
          message: announcementMessage,
          imageUrl: announcementImageValue,
          instagramUrl,
          buttonText,
          active: announcementActive,
        });
      }

      const savedAnnouncementIsLive = shouldSaveAnnouncement
        ? announcementActive
        : Boolean(existingAnnouncement && isAnnouncementCurrentlyPublic(existingAnnouncement));
      appState.announcementAdminMessage = shouldSaveAnnouncement
        ? "Message board settings and announcement saved."
        : "Message board settings saved.";
      if (displayMode === "announcement" && !savedAnnouncementIsLive) {
        appState.announcementAdminMessage = `${appState.announcementAdminMessage} No active announcement is available, so Home will show fallback content.`;
      }
      safeRender();
    } catch (error) {
      message.textContent = error.message || "Could not save announcement.";
    } finally {
      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = false;
      }
    }
  });

  clearButton?.addEventListener("click", async () => {
    try {
      await clearAnnouncementRecord();
      appState.announcementAdminMessage = "Announcement cleared. Home will show the configured fallback content when needed.";
      safeRender();
    } catch (error) {
      if (message) {
        message.textContent = error.message || "Could not clear announcement.";
      }
    }
  });
}

function renderFallbackContentCountsMarkup() {
  const jokes = getEffectiveFallbackJokes();
  const facts = getEffectiveFallbackFacts();
  const currentDisplayModeLabel = getMessageBoardDisplayModeLabel();
  const currentModeLabel = getFallbackContentModeLabel();
  const currentMixedImageModeLabel = getMixedImageModeLabel();

  return `
    <div class="admin-fallback-content-stats">
      <article class="meta-card admin-fallback-content-stat">
        <span class="admin-fallback-content-stat-label">Display Mode</span>
        <strong class="admin-fallback-content-stat-value">${escapeHtml(currentDisplayModeLabel)}</strong>
      </article>
      <article class="meta-card admin-fallback-content-stat">
        <span class="admin-fallback-content-stat-label">Fallback Type</span>
        <strong class="admin-fallback-content-stat-value">${escapeHtml(currentModeLabel)}</strong>
      </article>
      <article class="meta-card admin-fallback-content-stat">
        <span class="admin-fallback-content-stat-label">Mixed Image Mode</span>
        <strong class="admin-fallback-content-stat-value">${escapeHtml(currentMixedImageModeLabel)}</strong>
      </article>
      <article class="meta-card admin-fallback-content-stat">
        <span class="admin-fallback-content-stat-label">Jokes</span>
        <strong class="admin-fallback-content-stat-value">${escapeHtml(jokes.length.toLocaleString())}</strong>
      </article>
      <article class="meta-card admin-fallback-content-stat">
        <span class="admin-fallback-content-stat-label">Grow facts</span>
        <strong class="admin-fallback-content-stat-value">${escapeHtml(facts.length.toLocaleString())}</strong>
      </article>
    </div>
  `;
}

function renderAdminFallbackContentEditorMarkup() {
  return `
    <form id="admin-fallback-content-form" class="admin-source-form">
      <div class="section-heading admin-source-form-heading app-section-header">
        <div class="section-title-with-icon app-section-header-main">
          ${renderAppSectionHeaderIcon("message-board")}
          <div>
            <p class="eyebrow">Fallback Content</p>
            <h4>Manage jokes and grow facts</h4>
            <p class="muted">Batch import the content used by the Home message board fallback library. Imported content is added to the seeded default set.</p>
          </div>
        </div>
      </div>
      <div class="admin-source-form-grid">
        <label class="admin-source-form-full">
          <span>Batch Upload</span>
          <textarea name="fallbackBatch" rows="12" placeholder="JOKE: Why did the seed bring a blanket?&#10;ANSWER: It wanted to stay warm before sprouting.&#10;&#10;FACT: Seeds need moisture, oxygen, and warmth to begin germination."></textarea>
        </label>
      </div>
      <p class="admin-source-form-helper muted">Use blank lines between entries. Joke entries need both a <strong>JOKE:</strong> line and an <strong>ANSWER:</strong> line. Fact entries use a single <strong>FACT:</strong> line.</p>
      <p id="admin-fallback-content-message" class="snapshot-message">${escapeHtml(appState.fallbackContentAdminMessage || "")}</p>
      <div class="form-actions admin-source-form-actions">
        <button type="submit" class="button button-primary">Import Batch</button>
        <button type="button" class="button button-secondary" id="admin-fallback-content-export">Export Fallback Content</button>
        <button type="button" class="button button-secondary" id="admin-fallback-content-clear">Clear All Jokes/Facts</button>
      </div>
    </form>
  `;
}

function bindAdminFallbackContentSection() {
  const form = app.querySelector("#admin-fallback-content-form");
  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  const batchField = form.elements.fallbackBatch;
  const message = form.querySelector("#admin-fallback-content-message");
  const exportButton = form.querySelector("#admin-fallback-content-export");
  const clearButton = form.querySelector("#admin-fallback-content-clear");
  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitButton instanceof HTMLButtonElement) {
      submitButton.disabled = true;
    }

    const parsedBatch = parseFallbackContentBatchInput(batchField?.value || "");
    if (!parsedBatch.jokes.length && !parsedBatch.facts.length) {
      if (message) {
        message.textContent = "No valid jokes or grow facts were found in that batch.";
      }
      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = false;
      }
      return;
    }

    try {
      const nextStoredJokes = mergeUniqueFallbackJokes(readStoredFallbackJokes(), parsedBatch.jokes);
      const nextStoredFacts = mergeUniqueFallbackFacts(readStoredFallbackFacts(), parsedBatch.facts);
      writeStoredFallbackJokes(nextStoredJokes);
      writeStoredFallbackFacts(nextStoredFacts);
      localStorage.removeItem(RECENT_FALLBACK_ITEMS_STORAGE_KEY);
      appState.fallbackContentAdminMessage = `Imported ${parsedBatch.jokes.length} joke${parsedBatch.jokes.length === 1 ? "" : "s"} and ${parsedBatch.facts.length} grow fact${parsedBatch.facts.length === 1 ? "" : "s"}.`;
      safeRender();
    } catch (error) {
      console.error("Failed to import fallback content batch", error);
      if (message) {
        message.textContent = "Could not import fallback content.";
      }
    } finally {
      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = false;
      }
    }
  });

  exportButton?.addEventListener("click", async () => {
    const exportValue = serializeFallbackContentForExport();
    if (batchField) {
      batchField.value = exportValue;
      batchField.focus();
      batchField.select();
    }

    let exportMessage = "Fallback content exported to the batch field.";
    try {
      await navigator.clipboard.writeText(exportValue);
      exportMessage = "Fallback content exported to the batch field and copied to the clipboard.";
    } catch (error) {
      console.warn("Could not copy fallback content export to clipboard", error);
    }

    if (message) {
      message.textContent = exportMessage;
    }
    appState.fallbackContentAdminMessage = exportMessage;
  });

  clearButton?.addEventListener("click", () => {
    try {
      clearStoredFallbackContent();
      appState.fallbackContentAdminMessage = "Custom jokes and grow facts cleared. Seeded defaults remain available.";
      safeRender();
    } catch (error) {
      if (message) {
        message.textContent = error.message || "Could not clear fallback content.";
      }
    }
  });
}

function getAdminSectionOpenState(storageKey, defaultOpen = false) {
  try {
    const storedValue = localStorage.getItem(storageKey);
    if (storedValue === null) {
      return Boolean(defaultOpen);
    }

    return storedValue === "true";
  } catch (error) {
    console.warn("Could not read admin section state", { storageKey, error });
    return Boolean(defaultOpen);
  }
}

function setAdminSectionOpenState(storageKey, isOpen) {
  try {
    localStorage.setItem(storageKey, isOpen ? "true" : "false");
  } catch (error) {
    console.warn("Could not save admin section state", { storageKey, error });
  }
}

function renderAdminCollapsibleSectionMarkup({
  eyebrow,
  title,
  description,
  storageKey,
  contentId,
  bodyMarkup,
  defaultOpen = false,
  sectionClassName = "card admin-section-card",
  iconType = "admin",
}) {
  const isOpen = getAdminSectionOpenState(storageKey, defaultOpen);

  return `
    <section class="${escapeHtml(sectionClassName)} admin-collapsible-section${isOpen ? " is-open" : " is-collapsed"}">
      <button
        type="button"
        class="admin-collapsible-toggle"
        data-admin-section-toggle="true"
        data-admin-section-storage-key="${escapeHtml(storageKey)}"
        data-admin-section-content-id="${escapeHtml(contentId)}"
        aria-controls="${escapeHtml(contentId)}"
        aria-expanded="${isOpen ? "true" : "false"}"
      >
        <span class="section-title-with-icon app-section-header-main admin-collapsible-header-main">
          ${renderAppSectionHeaderIcon(iconType)}
          <div class="admin-collapsible-copy">
            <span class="eyebrow">${escapeHtml(eyebrow)}</span>
            <span class="admin-collapsible-title" role="heading" aria-level="3">${escapeHtml(title)}</span>
            <span class="muted admin-collapsible-description">${escapeHtml(description)}</span>
          </div>
        </span>
        <span class="admin-collapsible-chevron" aria-hidden="true"></span>
      </button>
      <div id="${escapeHtml(contentId)}" class="admin-collapsible-content"${isOpen ? "" : " hidden"}>
        ${bodyMarkup}
      </div>
    </section>
  `;
}

function syncAdminCollapsibleSection(button, content, isOpen) {
  if (!button || !content) {
    return;
  }

  button.setAttribute("aria-expanded", isOpen ? "true" : "false");
  content.hidden = !isOpen;
  const section = button.closest(".admin-collapsible-section");
  section?.classList.toggle("is-open", isOpen);
  section?.classList.toggle("is-collapsed", !isOpen);
}

function bindAdminCollapsibleSections(scope = app) {
  if (!scope) {
    return;
  }

  scope.querySelectorAll("[data-admin-section-toggle='true']").forEach((button) => {
    if (button.dataset.adminSectionBound === "true") {
      return;
    }

    button.dataset.adminSectionBound = "true";
    button.addEventListener("click", () => {
      const storageKey = String(button.dataset.adminSectionStorageKey || "").trim();
      const contentId = String(button.dataset.adminSectionContentId || "").trim();
      const content = contentId ? document.getElementById(contentId) : null;
      if (!storageKey || !content) {
        return;
      }

      const isOpen = button.getAttribute("aria-expanded") !== "true";
      syncAdminCollapsibleSection(button, content, isOpen);
      setAdminSectionOpenState(storageKey, isOpen);
    });
  });
}

function getSiteVisitorAnalyticsFilterOptions() {
  return [
    { key: "today", label: "Today" },
    { key: "last7", label: "Last 7 days" },
    { key: "last30", label: "Last 30 days" },
  ];
}

function getSiteVisitorAnalyticsFilterLabel(filterKey = SITE_ANALYTICS_DEFAULT_FILTER) {
  return getSiteVisitorAnalyticsFilterOptions().find((option) => option.key === filterKey)?.label || "Today";
}

function formatSiteVisitorShortId(value, fallback = "Unknown") {
  const normalizedValue = String(value || "").trim();
  if (!normalizedValue) {
    return fallback;
  }

  return normalizedValue.length > 14
    ? `${normalizedValue.slice(0, 6)}…${normalizedValue.slice(-4)}`
    : normalizedValue;
}

function formatSiteVisitorRelativeTime(value) {
  const parsedDate = parseCompletedAtValue(value);
  if (!parsedDate) {
    return "Not available";
  }

  const diffMs = Date.now() - parsedDate.getTime();
  if (diffMs < 15000) {
    return "Just now";
  }
  if (diffMs < 60000) {
    return `${Math.max(1, Math.round(diffMs / 1000))}s ago`;
  }
  if (diffMs < 3600000) {
    return `${Math.max(1, Math.round(diffMs / 60000))}m ago`;
  }
  if (diffMs < 86400000) {
    return `${Math.max(1, Math.round(diffMs / 3600000))}h ago`;
  }

  return formatTimingDateTime(parsedDate);
}

function getTodaySiteVisitorAnalyticsRows(rows = appState.siteVisitorAnalyticsRows) {
  const filteredRows = Array.isArray(rows) ? rows : [];
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  return filteredRows.filter((row) => {
    const occurredAt = parseCompletedAtValue(row?.occurredAt);
    return occurredAt && occurredAt.getTime() >= todayStart.getTime();
  });
}

function getSiteVisitorAnalyticsFriendlyErrorMessage() {
  if (!SITE_ANALYTICS_ENABLED) {
    return "Analytics tracking is currently disabled";
  }
  if (!appState.supabase) {
    return "Analytics are unavailable in this environment.";
  }
  if (appState.siteVisitorAnalyticsTableUnavailable) {
    return "Analytics history is not set up yet. Apply the site analytics migration to populate this dashboard.";
  }
  if (appState.siteVisitorAnalyticsTrackingBlocked) {
    return "Site analytics are currently disabled for this session.";
  }
  return String(appState.siteVisitorAnalyticsError || "").trim();
}

function getSiteVisitorAnalyticsSummary(rows = appState.siteVisitorAnalyticsRows) {
  const todayRows = getTodaySiteVisitorAnalyticsRows(rows);
  const pageViewsToday = todayRows.filter((row) => row.eventType === "page_view");
  const visitorKeys = new Set(todayRows.map((row) => (
    String(row?.visitorId || row?.userId || row?.visitId || row?.id || "").trim()
  )).filter(Boolean));

  return {
    liveVisitors: getActiveSiteVisitorPresenceEntries().length,
    uniqueVisitorsToday: visitorKeys.size,
    pageViewsToday: pageViewsToday.length,
    totalEventsToday: todayRows.length,
  };
}

function getSiteVisitorIdentityLabel(entry) {
  const userId = String(entry?.userId || "").trim();
  if (userId && isAdminUser()) {
    const adminMember = getAdminMemberById(userId);
    if (adminMember?.profileName && adminMember?.email) {
      return `${adminMember.profileName} (${adminMember.email})`;
    }
    if (adminMember?.profileName) {
      return adminMember.profileName;
    }
    if (adminMember?.email) {
      return adminMember.email;
    }
    if (userId === appState.user?.id) {
      return appState.profile?.username || appState.user?.email || `Member ${formatSiteVisitorShortId(userId, "Member")}`;
    }
  }

  return `Anonymous • ${formatSiteVisitorShortId(entry?.visitorId, "Visitor")}`;
}

function getSiteVisitorAnalyticsPageLabel(entry) {
  return String(
    entry?.pageLabel
    || entry?.pagePath
    || entry?.pageKey
    || entry?.pageGroup
    || "Unknown",
  ).trim();
}

function formatSiteAnalyticsEventTypeLabel(value = "page_view") {
  return capitalize(normalizeSiteAnalyticsEventType(value).replace(/_/g, " "));
}

function getSiteVisitorAnalyticsUserDisplay(entry) {
  const profileName = String(entry?.profileName || "").trim();
  const userEmail = String(entry?.userEmail || "").trim().toLowerCase();
  if (profileName && userEmail) {
    return { primary: profileName, secondary: userEmail };
  }
  if (userEmail) {
    return { primary: userEmail, secondary: "" };
  }
  if (profileName) {
    return { primary: profileName, secondary: "" };
  }

  const userId = String(entry?.userId || "").trim();
  if (userId && isAdminUser()) {
    const adminMember = getAdminMemberById(userId);
    if (adminMember?.profileName && adminMember?.email) {
      return { primary: adminMember.profileName, secondary: adminMember.email };
    }
    if (adminMember?.profileName) {
      return { primary: adminMember.profileName, secondary: "" };
    }
    if (adminMember?.email) {
      return { primary: adminMember.email, secondary: "" };
    }
  }

  return { primary: "", secondary: "" };
}

function getSiteVisitorAnalyticsAnonymousDisplay(entry) {
  const userDisplay = getSiteVisitorAnalyticsUserDisplay(entry);
  const visitId = String(entry?.visitId || "").trim();
  const visitorId = String(entry?.visitorId || "").trim();
  const idParts = [];
  if (visitId) {
    idParts.push(`Session ${formatSiteVisitorShortId(visitId, "Session")}`);
  }
  if (visitorId) {
    idParts.push(`Visitor ${formatSiteVisitorShortId(visitorId, "Visitor")}`);
  }

  if (!userDisplay.primary) {
    return {
      primary: idParts.length ? "Anonymous" : "—",
      secondary: idParts.join(" • "),
    };
  }

  return {
    primary: idParts[0] || "—",
    secondary: idParts.slice(1).join(" • "),
  };
}

function renderSiteVisitorAnalyticsCellMarkup(primary = "", secondary = "") {
  const normalizedPrimary = String(primary || "").trim();
  const normalizedSecondary = String(secondary || "").trim();
  if (!normalizedPrimary && !normalizedSecondary) {
    return "—";
  }

  if (!normalizedSecondary) {
    return `<span class="site-visitor-activity-inline">${escapeHtml(normalizedPrimary)}</span>`;
  }

  return `
    <div class="site-visitor-activity-cell">
      <strong>${escapeHtml(normalizedPrimary)}</strong>
      <span>${escapeHtml(normalizedSecondary)}</span>
    </div>
  `;
}

function getActiveSiteVisitorPresenceEntries() {
  const cutoffTime = Date.now() - SITE_ANALYTICS_ACTIVE_WINDOW_MS;

  return Object.entries(appState.siteVisitorPresenceState || {})
    .flatMap(([presenceKey, presences]) => {
      const normalizedPresences = Array.isArray(presences) ? presences : [];
      const latestPresence = normalizedPresences
        .map((presence) => ({
          presenceKey,
          visitorId: String(presence?.visitorId || "").trim(),
          visitId: String(presence?.visitId || "").trim(),
          userId: String(presence?.userId || "").trim(),
          pageKey: String(presence?.pageKey || "").trim(),
          pageLabel: String(presence?.pageLabel || "").trim(),
          pagePath: String(presence?.pagePath || "").trim(),
          deviceType: String(presence?.deviceType || "").trim().toLowerCase(),
          browserName: String(presence?.browserName || "").trim(),
          lastSeen: String(presence?.lastSeen || "").trim(),
        }))
        .sort((left, right) => new Date(right.lastSeen || 0).getTime() - new Date(left.lastSeen || 0).getTime())[0];

      if (!latestPresence) {
        return [];
      }

      const seenAt = parseCompletedAtValue(latestPresence.lastSeen);
      if (!seenAt || seenAt.getTime() < cutoffTime) {
        return [];
      }

      return [latestPresence];
    })
    .sort((left, right) => new Date(right.lastSeen || 0).getTime() - new Date(left.lastSeen || 0).getTime());
}

function renderSiteVisitorAnalyticsFilterMarkup() {
  return `
    <div class="site-visitor-analytics-toolbar" aria-label="Site visitor analytics date range">
      ${getSiteVisitorAnalyticsFilterOptions().map((option) => `
        <button
          type="button"
          class="button ${appState.siteVisitorAnalyticsFilter === option.key ? "button-primary" : "button-secondary"}"
          data-site-analytics-filter="${escapeHtml(option.key)}"
        >
          ${escapeHtml(option.label)}
        </button>
      `).join("")}
    </div>
  `;
}

function renderSiteVisitorAnalyticsSummaryMarkup() {
  const summary = getSiteVisitorAnalyticsSummary();
  const isLoading = Boolean(appState.supabase && !appState.siteVisitorAnalyticsLoaded);
  const historyUnavailable = Boolean(
    getSiteVisitorAnalyticsFriendlyErrorMessage()
    && !appState.siteVisitorAnalyticsRows.length
    && (appState.siteVisitorAnalyticsLoaded || !appState.supabase),
  );
  const formatLiveValue = (value) => (isLoading ? "--" : String(value));
  const formatHistoryValue = (value) => (isLoading ? "--" : (historyUnavailable ? "—" : String(value)));

  return `
    <div class="summary-grid admin-overview-grid site-visitor-analytics-summary-grid">
      ${renderAdminOverviewCardMarkup({
        label: "Live Visitors",
        value: formatLiveValue(summary.liveVisitors),
        subtext: "active in the last 5 minutes",
      })}
      ${renderAdminOverviewCardMarkup({
        label: "Visitors Today",
        value: formatHistoryValue(summary.uniqueVisitorsToday),
        subtext: "distinct visitor IDs today",
      })}
      ${renderAdminOverviewCardMarkup({
        label: "Page Views Today",
        value: formatHistoryValue(summary.pageViewsToday),
        subtext: "tracked route views today",
      })}
      ${renderAdminOverviewCardMarkup({
        label: "Total Events Today",
        value: formatHistoryValue(summary.totalEventsToday),
        subtext: "all recorded events today",
      })}
    </div>
  `;
}

function renderSiteVisitorLiveVisitorsCardMarkup() {
  if (!SITE_ANALYTICS_ENABLED) {
    return `
      <section class="meta-card site-visitor-live-card">
        <div class="site-visitor-live-head">
          <div>
            <strong>Live Visitors</strong>
            <p class="muted">Visitors active in the last 5 minutes</p>
          </div>
          <span class="site-visitor-live-count">0</span>
        </div>
        <div class="empty-state">
          <p>Analytics tracking is currently disabled</p>
        </div>
      </section>
    `;
  }
  const activeVisitors = getActiveSiteVisitorPresenceEntries();
  const unavailableMessage = !appState.siteVisitorPresenceAvailable && appState.siteVisitorPresenceError
    ? appState.siteVisitorPresenceError
    : "";

  return `
    <section class="meta-card site-visitor-live-card">
      <div class="site-visitor-live-head">
        <div>
          <strong>Live Visitors</strong>
          <p class="muted">Visitors active in the last 5 minutes</p>
        </div>
        <span class="site-visitor-live-count">${escapeHtml(String(activeVisitors.length))}</span>
      </div>
      ${unavailableMessage ? `
        <div class="empty-state">
          <p>${escapeHtml(unavailableMessage)}</p>
        </div>
      ` : activeVisitors.length ? `
        <div class="site-visitor-live-table-shell">
          <table class="leaderboard-audit-table site-visitor-live-table">
            <thead>
              <tr>
                <th>Visitor</th>
                <th>Session ID</th>
                <th>Page</th>
                <th>Device</th>
                <th>Browser</th>
                <th>Last Seen</th>
              </tr>
            </thead>
            <tbody>
              ${activeVisitors.map((entry) => `
                <tr>
                  <td>${escapeHtml(getSiteVisitorIdentityLabel(entry))}</td>
                  <td>${escapeHtml(formatSiteVisitorShortId(entry.visitId || entry.presenceKey, "Session"))}</td>
                  <td>${escapeHtml(entry.pageLabel || entry.pageKey || "Unknown")}</td>
                  <td>${escapeHtml(capitalize(entry.deviceType || "unknown"))}</td>
                  <td>${escapeHtml(entry.browserName || "Unknown")}</td>
                  <td>${escapeHtml(formatSiteVisitorRelativeTime(entry.lastSeen))}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      ` : `
        <div class="empty-state">
          <p>No active visitors right now.</p>
        </div>
      `}
    </section>
  `;
}

function renderSiteVisitorRecentActivityMarkup() {
  const rows = (appState.siteVisitorAnalyticsRows || []).slice(0, 50);
  const isLoading = Boolean(appState.supabase && !appState.siteVisitorAnalyticsLoaded);
  const friendlyErrorMessage = getSiteVisitorAnalyticsFriendlyErrorMessage();

  if (isLoading) {
    return `
      <div class="leaderboard-audit-empty-state">
        <strong>Loading analytics</strong>
        <p>Pulling recent site activity for ${escapeHtml(getSiteVisitorAnalyticsFilterLabel(appState.siteVisitorAnalyticsFilter))}.</p>
      </div>
    `;
  }

  if (friendlyErrorMessage && !rows.length) {
    return `
      <div class="leaderboard-audit-empty-state">
        <strong>Analytics unavailable</strong>
        <p>${escapeHtml(friendlyErrorMessage)}</p>
      </div>
    `;
  }

  if (!rows.length) {
    return `
      <div class="leaderboard-audit-empty-state">
        <strong>No visitor activity yet</strong>
        <p>Recent site activity will appear here once analytics events are recorded for this date range.</p>
      </div>
    `;
  }

  return `
    <div class="leaderboard-audit-table-shell">
      <table class="leaderboard-audit-table site-visitor-analytics-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Event Type</th>
            <th>Page</th>
            <th>User / Email</th>
            <th>Anonymous / Session</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((row) => {
            const userDisplay = getSiteVisitorAnalyticsUserDisplay(row);
            const anonymousDisplay = getSiteVisitorAnalyticsAnonymousDisplay(row);
            return `
              <tr>
                <td>${escapeHtml(parseCompletedAtValue(row.occurredAt) ? formatTimingDateTime(parseCompletedAtValue(row.occurredAt)) : "Not available")}</td>
                <td>${escapeHtml(formatSiteAnalyticsEventTypeLabel(row.eventType))}</td>
                <td>${escapeHtml(getSiteVisitorAnalyticsPageLabel(row))}</td>
                <td>${renderSiteVisitorAnalyticsCellMarkup(userDisplay.primary, userDisplay.secondary)}</td>
                <td>${renderSiteVisitorAnalyticsCellMarkup(anonymousDisplay.primary, anonymousDisplay.secondary)}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderSiteVisitorAnalyticsSectionMarkup() {
  return renderAdminCollapsibleSectionMarkup({
    eyebrow: "Admin Analytics",
    title: "Analytics Dashboard",
    description: "See live visitors, daily usage, and recent site activity without leaving Admin.",
    iconType: "analytics",
    storageKey: ADMIN_VISITOR_ANALYTICS_OPEN_STORAGE_KEY,
    contentId: "admin-site-visitor-analytics-content",
    defaultOpen: false,
    bodyMarkup: `
      ${renderSiteVisitorAnalyticsFilterMarkup()}
      ${renderSiteVisitorAnalyticsSummaryMarkup()}
      <div id="admin-site-live-visitors-card">
        ${renderSiteVisitorLiveVisitorsCardMarkup()}
      </div>
      <section class="site-visitor-analytics-activity">
        <div class="section-heading app-section-header">
          <div class="section-title-with-icon app-section-header-main">
            ${renderAppSectionHeaderIcon("activity")}
            <div>
              <p class="eyebrow">Recent Activity</p>
              <h3>Recent Activity</h3>
              <p class="muted">Latest page views, visits, and app launches for ${escapeHtml(getSiteVisitorAnalyticsFilterLabel(appState.siteVisitorAnalyticsFilter))}.</p>
            </div>
          </div>
        </div>
        ${renderSiteVisitorRecentActivityMarkup()}
      </section>
    `,
  });
}

function getAdminMessageStatusLabel(status = "new") {
  switch (normalizeAdminMessageStatus(status)) {
    case "reviewed":
      return "Reviewed";
    case "resolved":
      return "Resolved";
    case "new":
    default:
      return "New";
  }
}

function renderAdminMessageStatusPillMarkup(status = "new") {
  const normalizedStatus = normalizeAdminMessageStatus(status);
  return `<span class="admin-message-status-pill is-${escapeHtml(normalizedStatus)}">${escapeHtml(getAdminMessageStatusLabel(normalizedStatus))}</span>`;
}

function getAdminMessageStatusFilterOptions() {
  return [
    { key: "all", label: "All" },
    { key: "new", label: "New" },
    { key: "reviewed", label: "Reviewed" },
    { key: "resolved", label: "Resolved" },
  ];
}

function getAdminMessageIssueTypeFilterOptions(rows = []) {
  const normalizedRows = Array.isArray(rows) ? rows : [];
  const seen = new Set();
  const issueTypes = normalizedRows
    .map((row) => normalizeAdminMessageType(row?.issueType || row?.issue_type))
    .filter((value) => {
      if (!value || seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    })
    .sort((left, right) => left.localeCompare(right));

  return [
    { key: "all", label: "All issue types" },
    ...issueTypes.map((issueType) => ({ key: issueType, label: issueType })),
  ];
}

function renderAdminMessageIssueTypeBadgeMarkup(issueType = "Other") {
  const normalizedType = normalizeAdminMessageType(issueType);
  const badgeTone = normalizedType.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `<span class="admin-message-issue-pill is-${escapeHtml(badgeTone)}">${escapeHtml(normalizedType)}</span>`;
}

function getAdminMessagesSummary(rows = []) {
  return {
    total: rows.length,
    newCount: rows.filter((row) => row.status === "new").length,
    reviewedCount: rows.filter((row) => row.status === "reviewed").length,
    resolvedCount: rows.filter((row) => row.status === "resolved").length,
  };
}

function renderAdminMessagesFilterMarkup() {
  const displayRows = getAdminMessagesForDisplay();
  const issueTypeOptions = getAdminMessageIssueTypeFilterOptions(displayRows);
  return `
    <div class="admin-messages-filter-shell">
      <div class="admin-messages-filter-toolbar" aria-label="User reports status filter">
        ${getAdminMessageStatusFilterOptions().map((option) => `
          <button
            type="button"
            class="button ${appState.adminMessageStatusFilter === option.key ? "button-primary" : "button-secondary"}"
            data-admin-message-filter="${escapeHtml(option.key)}"
          >
            ${escapeHtml(option.label)}
          </button>
        `).join("")}
      </div>
      <label class="admin-messages-issue-filter">
        <span>Issue type</span>
        <select data-admin-message-issue-filter="true">
          ${issueTypeOptions.map((option) => `
            <option value="${escapeHtml(option.key)}" ${appState.adminMessageIssueTypeFilter === option.key ? "selected" : ""}>
              ${escapeHtml(option.label)}
            </option>
          `).join("")}
        </select>
      </label>
    </div>
  `;
}

function getAdminMessagePreview(message = "") {
  const trimmedMessage = String(message || "").trim();
  if (trimmedMessage.length <= 180) {
    return trimmedMessage;
  }
  return `${trimmedMessage.slice(0, 177).trimEnd()}...`;
}

function isAdminMessageExpanded(messageId = "") {
  return Boolean(appState.adminMessageExpandedState?.[String(messageId || "").trim()]);
}

function getAdminMessageDisplayText(row) {
  const message = String(row?.message || "").trim();
  const expanded = isAdminMessageExpanded(row?.id);
  const truncated = message.length > 180;
  return {
    message: expanded ? message : getAdminMessagePreview(message),
    expanded,
    truncated,
  };
}

function renderAdminMessageCellMarkup(row) {
  const display = getAdminMessageDisplayText(row);
  return `
    <div class="admin-message-cell-copy">
      <p>${escapeHtml(display.message || "No message provided.")}</p>
      ${display.truncated ? `
        <button
          type="button"
          class="admin-message-expand"
          data-admin-message-expand="${escapeHtml(row.id)}"
          aria-expanded="${display.expanded ? "true" : "false"}"
        >
          ${display.expanded ? "Collapse" : "Expand"}
        </button>
      ` : ""}
    </div>
  `;
}

function renderAdminMessagesSummaryMarkup() {
  const summary = getAdminMessagesSummary(getAdminMessagesForDisplay());
  return `
    <div class="summary-grid admin-overview-grid admin-user-reports-summary-grid">
      ${renderAdminOverviewCardMarkup({ label: "New Reports", value: String(summary.newCount), subtext: "awaiting review" })}
      ${renderAdminOverviewCardMarkup({ label: "Reviewed", value: String(summary.reviewedCount), subtext: "triaged by admin" })}
      ${renderAdminOverviewCardMarkup({ label: "Resolved", value: String(summary.resolvedCount), subtext: "closed reports" })}
      ${renderAdminOverviewCardMarkup({ label: "Total Reports", value: String(summary.total), subtext: "all submitted reports" })}
    </div>
  `;
}

function renderAdminMessagesPanelMarkup() {
  const displayRows = getAdminMessagesForDisplay();
  const filteredRows = displayRows.filter((row) => {
    const statusMatches = appState.adminMessageStatusFilter === "all" || row.status === appState.adminMessageStatusFilter;
    const issueTypeMatches = appState.adminMessageIssueTypeFilter === "all"
      || normalizeAdminMessageType(row.issueType) === appState.adminMessageIssueTypeFilter;
    return statusMatches && issueTypeMatches;
  });
  const rows = [...filteredRows].sort((left, right) => (
    new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime()
  ));
  const isLoading = Boolean(!isMockDataEnabled() && appState.supabase && !appState.adminMessagesLoaded && appState.adminMessagesRefreshPromise);

  if (isLoading) {
    return `
      ${renderAdminMessagesSummaryMarkup()}
      ${renderAdminMessagesFilterMarkup()}
      <div class="admin-messages-empty"><p>Loading user reports...</p></div>
    `;
  }

  if (appState.adminMessagesError && !isMockDataEnabled()) {
    return `
      ${renderAdminMessagesSummaryMarkup()}
      ${renderAdminMessagesFilterMarkup()}
      <div class="admin-messages-empty"><p>${escapeHtml(getFriendlyAdminMessagesFallbackMessage())}</p></div>
    `;
  }

  if (!rows.length) {
    let emptyMessage = "No user reports yet.";
    if (appState.adminMessageStatusFilter !== "all" && appState.adminMessageIssueTypeFilter !== "all") {
      emptyMessage = `No ${appState.adminMessageStatusFilter} ${appState.adminMessageIssueTypeFilter.toLowerCase()} reports yet.`;
    } else if (appState.adminMessageStatusFilter !== "all") {
      emptyMessage = `No ${appState.adminMessageStatusFilter} reports yet.`;
    } else if (appState.adminMessageIssueTypeFilter !== "all") {
      emptyMessage = `No ${appState.adminMessageIssueTypeFilter.toLowerCase()} reports yet.`;
    }
    return `
      ${renderAdminMessagesSummaryMarkup()}
      ${renderAdminMessagesFilterMarkup()}
      <div class="admin-messages-empty"><p>${escapeHtml(emptyMessage)}</p></div>
    `;
  }

  return `
    ${renderAdminMessagesSummaryMarkup()}
    ${renderAdminMessagesFilterMarkup()}
    <div class="admin-report-card-list">
      ${rows.map((row) => `
        <article class="meta-card admin-report-card ${row.status === "new" ? "is-new" : ""}">
          <div class="admin-report-card-header">
            <div class="admin-report-card-badges">
              ${renderAdminMessageStatusPillMarkup(row.status)}
              ${renderAdminMessageIssueTypeBadgeMarkup(row.issueType)}
            </div>
            <p class="admin-report-card-date">${escapeHtml(parseCompletedAtValue(row.createdAt) ? formatTimingDateTime(parseCompletedAtValue(row.createdAt)) : "Not available")}</p>
          </div>
          <div class="admin-report-card-meta">
            <div>
              <strong>${escapeHtml(row.name || "Not provided")}</strong>
              <p>${escapeHtml(row.email || "Not provided")}</p>
            </div>
          </div>
          <div class="admin-report-card-message">
            ${renderAdminMessageCellMarkup(row)}
          </div>
          <div class="admin-message-actions">
            ${row.status !== "reviewed" ? `<button type="button" class="button button-secondary" data-admin-message-status="${escapeHtml(row.id)}" data-admin-message-next-status="reviewed">Mark Reviewed</button>` : ""}
            ${row.status !== "resolved" ? `<button type="button" class="button button-secondary" data-admin-message-status="${escapeHtml(row.id)}" data-admin-message-next-status="resolved">Mark Resolved</button>` : ""}
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function renderAdminMessagesSectionMarkup() {
  return renderAdminCollapsibleSectionMarkup({
    eyebrow: "User Reports",
    title: "User Reports",
    description: "Review footer contact forms, content flags, technical issues, and support messages.",
    iconType: "reports",
    storageKey: ADMIN_USER_REPORTS_OPEN_STORAGE_KEY,
    contentId: "admin-user-reports-section-content",
    defaultOpen: false,
    bodyMarkup: renderAdminMessagesPanelMarkup(),
  });
}

function bindAdminMessagesSection(scope = app) {
  scope.querySelectorAll("[data-admin-message-filter]").forEach((button) => {
    if (button.dataset.adminMessageFilterBound === "true") {
      return;
    }

    button.dataset.adminMessageFilterBound = "true";
    button.addEventListener("click", () => {
      appState.adminMessageStatusFilter = String(button.dataset.adminMessageFilter || "all").trim() || "all";
      safeRender();
    });
  });

  scope.querySelectorAll("[data-admin-message-issue-filter='true']").forEach((select) => {
    if (select.dataset.adminMessageIssueFilterBound === "true") {
      return;
    }

    select.dataset.adminMessageIssueFilterBound = "true";
    select.addEventListener("change", () => {
      appState.adminMessageIssueTypeFilter = String(select.value || "all").trim() || "all";
      safeRender();
    });
  });

  scope.querySelectorAll("[data-admin-message-status]").forEach((button) => {
    if (button.dataset.adminMessageStatusBound === "true") {
      return;
    }

    button.dataset.adminMessageStatusBound = "true";
    button.addEventListener("click", async () => {
      const messageId = String(button.dataset.adminMessageStatus || "").trim();
      const nextStatus = String(button.dataset.adminMessageNextStatus || "").trim();
      try {
        await updateAdminMessageStatus(messageId, nextStatus);
        safeRender();
      } catch (error) {
        console.warn("[Admin Reports] Could not update report status.", error);
        window.alert("Could not update this report right now.");
      }
    });
  });

  scope.querySelectorAll("[data-admin-message-expand]").forEach((button) => {
    if (button.dataset.adminMessageExpandBound === "true") {
      return;
    }

    button.dataset.adminMessageExpandBound = "true";
    button.addEventListener("click", () => {
      const messageId = String(button.dataset.adminMessageExpand || "").trim();
      if (!messageId) {
        return;
      }
      appState.adminMessageExpandedState = {
        ...appState.adminMessageExpandedState,
        [messageId]: !isAdminMessageExpanded(messageId),
      };
      safeRender();
    });
  });
}

function syncSiteVisitorLiveVisitorsCard() {
  const liveCardAnchor = document.querySelector("#admin-site-live-visitors-card");
  if (!liveCardAnchor) {
    return;
  }

  liveCardAnchor.innerHTML = renderSiteVisitorLiveVisitorsCardMarkup();
}

function bindSiteVisitorAnalyticsSection() {
  app.querySelectorAll("[data-site-analytics-filter]").forEach((button) => {
    if (button.dataset.siteAnalyticsFilterBound === "true") {
      return;
    }

    button.dataset.siteAnalyticsFilterBound = "true";
    button.addEventListener("click", () => {
      const nextFilter = String(button.dataset.siteAnalyticsFilter || "").trim();
      if (!nextFilter || appState.siteVisitorAnalyticsFilter === nextFilter) {
        return;
      }

      appState.siteVisitorAnalyticsFilter = nextFilter;
      appState.siteVisitorAnalyticsLoaded = false;
      appState.siteVisitorAnalyticsLoadedFilter = "";
      appState.siteVisitorAnalyticsError = "";
      safeRender();
    });
  });
}

function renderAdminPage() {
  app.innerHTML = `
    <section class="card admin-page-hero">
      <div class="section-title-with-icon app-section-header-main">
        ${renderAppSectionHeaderIcon("admin")}
        <div>
          <p class="eyebrow">Admin</p>
          <h2>Admin Tools</h2>
          <p class="muted">Manage moderation, inspect leaderboard inputs, and review system-level controls without exposing admin data in public views.</p>
        </div>
      </div>
    </section>
    <section class="card admin-section-card">
      <div class="section-heading app-section-header">
        <div class="section-title-with-icon app-section-header-main">
          ${renderAppSectionHeaderIcon("analytics")}
          <div>
            <p class="eyebrow">Admin Overview</p>
            <h3>High-level system snapshot</h3>
            <p class="muted">Quick totals for members, gallery activity, and moderation workload.</p>
          </div>
        </div>
      </div>
      <div id="admin-overview-tools"></div>
      <div class="summary-grid admin-overview-grid"></div>
    </section>
    ${renderSiteVisitorAnalyticsSectionMarkup()}
    <section class="card admin-section-card">
      <div class="section-heading app-section-header">
        <div class="section-title-with-icon app-section-header-main">
          ${renderAppSectionHeaderIcon("moderation")}
          <div>
            <p class="eyebrow">Community Grow Moderation</p>
            <h3>Review Community Grow submissions</h3>
            <p class="muted">Open the moderation workspace to approve or reject pending public snapshot submissions.</p>
          </div>
        </div>
        <div class="admin-section-actions">
          <a class="button button-primary" href="/admin/gallery-moderation">Open Community Grow Moderation</a>
        </div>
      </div>
    </section>
    ${renderAdminCollapsibleSectionMarkup({
      eyebrow: "Members",
      title: "View and manage Cannakan Grow members.",
      description: "Review member growth activity, account access, and admin roles without exposing private member data publicly.",
      iconType: "members",
      storageKey: ADMIN_MEMBERS_OPEN_STORAGE_KEY,
      contentId: "admin-members-section-content",
      defaultOpen: false,
      bodyMarkup: `
        <div class="summary-grid admin-overview-grid admin-members-summary-grid" id="admin-members-summary-grid"></div>
        ${renderAdminMembersFiltersMarkup()}
        <div id="admin-members-table-anchor"></div>
      `,
    })}
    ${renderAdminMessagesSectionMarkup()}
    ${renderAdminCollapsibleSectionMarkup({
      eyebrow: "Sources",
      title: "Manage source companies, logos, and display info.",
      description: "Add, update, hide, or delete source companies without changing the current Community Grow layout.",
      iconType: "sources",
      storageKey: ADMIN_SOURCES_OPEN_STORAGE_KEY,
      contentId: "admin-sources-section-content",
      defaultOpen: false,
      bodyMarkup: `
        <div class="admin-sources-layout">
          <div class="admin-sources-list-shell">
            <div class="admin-sources-list-head">
              <strong>Saved Sources</strong>
              <span class="muted">${escapeHtml(`${appState.sources.length} total`)}</span>
            </div>
            <div id="admin-sources-list" class="admin-sources-list"></div>
          </div>
          <div id="admin-source-editor" class="meta-card admin-source-editor"></div>
        </div>
      `,
    })}
    ${renderAdminCollapsibleSectionMarkup({
      eyebrow: "Message Board CMS",
      title: "Message Board CMS",
      description: "Control the Home “Latest from Cannakan” card, fallback library, and default image behavior from one admin-only workspace.",
      iconType: "message-board",
      storageKey: ADMIN_MESSAGE_BOARD_OPEN_STORAGE_KEY,
      contentId: "admin-message-board-section-content",
      defaultOpen: false,
      bodyMarkup: `
        <div class="admin-sources-layout">
          <div id="admin-announcement-editor" class="meta-card admin-source-editor"></div>
          <div class="admin-message-board-sidebar">
            <div id="admin-announcements-list"></div>
            <div id="admin-fallback-content-stats"></div>
            <div id="admin-fallback-content-editor" class="meta-card admin-source-editor"></div>
          </div>
        </div>
      `,
    })}
    <section class="card admin-section-card">
      <div class="section-heading app-section-header">
        <div class="section-title-with-icon app-section-header-main">
          ${renderAppSectionHeaderIcon("admin")}
          <div>
            <p class="eyebrow">System Tools</p>
            <h3>Admin-only utilities</h3>
            <p class="muted">Dev Mode is managed from Admin Overview. Additional admin-only tools will appear here as they are added.</p>
          </div>
        </div>
      </div>
      <div id="admin-system-tools"></div>
    </section>
    <div id="admin-leaderboard-audit-anchor"></div>
  `;

  if (!appState.memberCountLoaded && !appState.memberCountRefreshPromise && appState.supabase) {
    void refreshRegisteredMemberCount().then(() => {
      const currentHash = window.location.hash || "#home";
      if (currentHash === "#admin" || currentHash === "") {
        safeRender();
      }
    });
  }

  if (!appState.sourcesLoaded && !appState.sourcesRefreshPromise && appState.supabase) {
    void refreshSources({ force: true, reason: "route:admin-dashboard" }).then(() => {
      const currentHash = window.location.hash || "#home";
      if (currentHash === "#admin" || currentHash === "") {
        safeRender();
      }
    });
  }

  if (!appState.announcementsLoaded && !appState.announcementsRefreshPromise) {
    void refreshAnnouncements({ force: true, reason: "route:admin-dashboard" }).then(() => {
      const currentHash = window.location.hash || "#home";
      if (currentHash === "#admin" || currentHash === "") {
        safeRender();
      }
    });
  }

  if (isAdminUser() && !appState.membersLoaded && !appState.membersRefreshPromise && appState.supabase) {
    void refreshAdminMembers({ force: true, reason: "route:admin-dashboard" }).then(() => {
      const currentHash = window.location.hash || "#home";
      if (currentHash === "#admin" || currentHash === "") {
        safeRender();
      }
    });
  }

  if (isAdminUser() && !appState.adminMessagesLoaded && !appState.adminMessagesRefreshPromise && appState.supabase) {
    void refreshAdminMessages({ force: true, reason: "route:admin-user-reports" }).then(() => {
      const currentHash = window.location.hash || "#home";
      if (currentHash === "#admin" || currentHash === "") {
        safeRender();
      }
    });
  }

  if (isAdminUser() && (!appState.siteVisitorAnalyticsLoaded || appState.siteVisitorAnalyticsLoadedFilter !== appState.siteVisitorAnalyticsFilter) && !appState.siteVisitorAnalyticsRefreshPromise && appState.supabase) {
    void refreshSiteVisitorAnalytics({ force: true, reason: "route:admin-site-visitor-analytics" }).then(() => {
      const currentHash = window.location.hash || "#home";
      if (currentHash === "#admin" || currentHash === "") {
        safeRender();
      }
    });
  }

  const displaySnapshots = getGallerySnapshotsForDisplay();
  const approvedSnapshots = displaySnapshots.filter((snapshot) => getGallerySnapshotDisplayStatus(snapshot) === "approved");
  const pendingSnapshots = getAdminReviewPendingSnapshots();
  const sharedProfileSnapshots = approvedSnapshots.filter((snapshot) => snapshot.includeProfileInGallery);
  const overviewGrid = app.querySelector(".admin-overview-grid");
  if (overviewGrid) {
    const memberCount = getRegisteredMemberCount();
    const memberValue = Number.isFinite(memberCount)
      ? memberCount.toLocaleString()
      : (appState.memberCountLoaded ? "—" : "--");
    overviewGrid.innerHTML = [
      renderAdminOverviewCardMarkup({
        label: "Total Members",
        value: memberValue,
        subtext: Number.isFinite(memberCount) ? "registered profiles" : (appState.memberCountLoaded ? "Count unavailable" : "Loading members"),
      }),
      renderAdminOverviewCardMarkup({
        label: "Approved Community Grow Snapshots",
        value: approvedSnapshots.length.toLocaleString(),
        subtext: "used in Community Grow views",
      }),
      renderAdminOverviewCardMarkup({
        label: "Pending Moderation",
        value: pendingSnapshots.length.toLocaleString(),
        subtext: "awaiting admin review",
      }),
      renderAdminOverviewCardMarkup({
        label: "Shared Community Grow Profiles",
        value: sharedProfileSnapshots.length.toLocaleString(),
        subtext: "approved snapshots with shared profile info",
      }),
    ].join("");
  }

  const overviewTools = app.querySelector("#admin-overview-tools");
  renderMockDataAdminSection(overviewTools, { embedded: true });

  const membersSummaryGrid = app.querySelector("#admin-members-summary-grid");
  if (membersSummaryGrid) {
    const summary = getAdminMemberSummary();
    const isMembersLoading = Boolean(appState.supabase && !appState.membersLoaded && appState.membersRefreshPromise);
    const summaryValue = (value) => (isMembersLoading ? "--" : value.toLocaleString());
    membersSummaryGrid.innerHTML = [
      renderAdminOverviewCardMarkup({
        label: "Total Members",
        value: summaryValue(summary.totalMembers),
        subtext: "registered member profiles",
      }),
      renderAdminOverviewCardMarkup({
        label: "New Members This Month",
        value: summaryValue(summary.newMembersThisMonth),
        subtext: "joined during the current month",
      }),
      renderAdminOverviewCardMarkup({
        label: "Active Members",
        value: summaryValue(summary.activeMembers),
        subtext: `${ACTIVE_MEMBER_LOOKBACK_DAYS}-day recent activity window`,
      }),
      renderAdminOverviewCardMarkup({
        label: "Admin Users",
        value: summaryValue(summary.adminUsers),
        subtext: "accounts with admin access",
      }),
    ].join("");
  }

  const systemToolsContainer = app.querySelector("#admin-system-tools");
  if (systemToolsContainer) {
    systemToolsContainer.innerHTML = `<p class="muted admin-system-tools-note">Use <strong>Shift + D</strong> or the Admin Overview toggle to switch mock data on and off without affecting real records.</p>`;
  }

  const sourceList = app.querySelector("#admin-sources-list");
  if (sourceList) {
    sourceList.innerHTML = renderAdminSourcesListMarkup();
  }

  const sourceEditor = app.querySelector("#admin-source-editor");
  if (sourceEditor) {
    const editingSource = appState.sources.find((entry) => entry.id === appState.sourceAdminEditingId) || null;
    sourceEditor.innerHTML = renderAdminSourceEditorMarkup(editingSource);
  }

  const announcementsList = app.querySelector("#admin-announcements-list");
  if (announcementsList) {
    announcementsList.innerHTML = renderAdminAnnouncementsListMarkup();
  }

  const announcementEditor = app.querySelector("#admin-announcement-editor");
  if (announcementEditor) {
    announcementEditor.innerHTML = renderAdminAnnouncementEditorMarkup(appState.announcements[0] || null);
  }

  const fallbackContentEditor = app.querySelector("#admin-fallback-content-editor");
  if (fallbackContentEditor) {
    fallbackContentEditor.innerHTML = renderAdminFallbackContentEditorMarkup();
  }

  const fallbackContentStats = app.querySelector("#admin-fallback-content-stats");
  if (fallbackContentStats) {
    fallbackContentStats.innerHTML = renderFallbackContentCountsMarkup();
  }

  const membersTableAnchor = app.querySelector("#admin-members-table-anchor");
  if (membersTableAnchor) {
    membersTableAnchor.innerHTML = renderAdminMembersTableMarkup();
  }

  bindAdminCollapsibleSections(app);
  bindAdminMembersSection();
  bindAdminMessagesSection();
  bindAdminSourcesSection();
  bindAdminAnnouncementsSection();
  bindAdminFallbackContentSection();
  bindSiteVisitorAnalyticsSection();
  bindMessageBoardImageFallbacks(app);

  const leaderboardAuditAnchor = app.querySelector("#admin-leaderboard-audit-anchor");
  renderLeaderboardAuditSection(leaderboardAuditAnchor);
}

function renderHome() {
  console.log("[Cannakan Home] render", {
    route: window.location.hash || "#home",
    authReady: appState.authReady,
    isSignedIn: Boolean(appState.user),
    isAdmin: appState.isAdmin,
  });
  seedFallbackContentStorageIfEmpty();
  appState.announcements = loadAnnouncementsFromStorage("home:render");
  appState.announcementsLoaded = true;
  app.replaceChildren(cloneTemplate(templates.home));
  const growSessionsHeading = app.querySelector(".dashboard-bar .app-section-header-main h2");
  if (growSessionsHeading) {
    growSessionsHeading.textContent = getGrowSessionsSectionTitle();
  }
  app.querySelectorAll('[data-filter-paper-sessions-card="true"], .filter-paper-card').forEach((card) => card.remove());
  applySupplyStatusToSessionEntryButtons(app);
  if (!isMockDataEnabled() && appState.supabase && !appState.homeGalleryRankingsHydrationRequested && !appState.gallerySnapshotsLoaded) {
    appState.homeGalleryRankingsHydrationRequested = true;
    void refreshGallerySnapshots("home-rankings-teaser").then(() => {
      const currentHash = window.location.hash || "#home";
      if (currentHash === "#home" || currentHash === "") {
        safeRender();
      }
    });
  }
  const sessions = sortSessionsNewestFirst(getSessions());
  const activeSessions = sortActiveSessionsNewestFirst(
    sessions.filter((session) => normalizeSessionStatus(session.sessionStatus) !== "completed"),
  );
  const spotlightCard = document.querySelector("#active-session-spotlight");
  const summaryGrid = document.querySelector(".summary-grid");
  const homeAnnouncementAnchor = document.querySelector("#home-dashboard-message-board-anchor");
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
    const bestDurationLabel = formatDurationMsShort(getSessionCompletedDurationMs(bestSession));
    bestSessionCard.href = `#sessions/${bestSession.id}`;
    bestSessionCard.classList.remove("is-empty");
    bestSessionIndicator.hidden = false;
    bestSessionNameEl.textContent = formatSessionLabel(bestSession);
    bestSessionDateEl.textContent = formatSessionNameDate(bestSession.date);
    bestSessionResultEl.textContent = bestDurationLabel
      ? `${bestPercentage}% · ${bestDurationLabel}`
      : `${bestPercentage}%`;
  } else {
    bestSessionCard.href = "#sessions";
    bestSessionCard.classList.add("is-empty");
    bestSessionIndicator.hidden = true;
    bestSessionNameEl.textContent = "No completed sessions yet";
    bestSessionDateEl.textContent = "";
    bestSessionResultEl.textContent = "";
  }

  const homeSecondaryInfoRowMarkup = renderHomeSecondaryInfoRowMarkup();
  if (homeAnnouncementAnchor) {
    homeAnnouncementAnchor.innerHTML = homeSecondaryInfoRowMarkup;
  } else if (summaryGrid) {
    summaryGrid.insertAdjacentHTML("afterend", homeSecondaryInfoRowMarkup);
  } else if (spotlightCard) {
    spotlightCard.insertAdjacentHTML("afterend", homeSecondaryInfoRowMarkup);
  } else {
    app.insertAdjacentHTML("beforeend", homeSecondaryInfoRowMarkup);
  }
  bindMessageBoardImageFallbacks(app);
  app.querySelector(".home-dashboard-secondary-row [data-install-grow-app]")?.addEventListener("click", async () => {
    await promptInstallGrowApp();
  });
  app.querySelector(".home-dashboard-secondary-row [data-home-mock-data-toggle='true']")?.addEventListener("click", () => {
    setMockDataEnabledAndRefresh(!isMockDataEnabled());
  });

  const spotlightSession = activeSessions[0] || null;
  const updateSpotlight = () => {
    if (!spotlightSession) {
      spotlightCard?.classList.remove("stage-soaking", "stage-germinating", "stage-completed");
      if (spotlightStage) {
        spotlightStage.dataset.stage = "No active session";
        spotlightStage.classList.add("is-inactive");
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
      spotlightStage.classList.remove("is-inactive");
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

function renderMockDataAdminSection(target = app, options = {}) {
  if (!target || !canAccessMockDataControls()) {
    return null;
  }

  const embedded = Boolean(options.embedded);
  const section = document.createElement("section");
  section.className = `${embedded ? "mock-data-admin-section mock-data-admin-section--embedded" : "card mock-data-admin-section"} ${isMockDataEnabled() ? "is-on" : "is-off"}`;
  section.innerHTML = `
    <div class="mock-data-admin-shell">
      <div class="mock-data-admin-copy">
        <p class="eyebrow">Admin Utility</p>
        <h3>Dev Mode (Mock Data)</h3>
        <p class="mock-data-admin-subtitle">
          <span>Admin-only preview controls</span>
          ${isMockDataEnabled() ? '<span class="mock-data-admin-indicator">Mock Data Active</span>' : ""}
        </p>
        <p class="muted">Admin-only preview controls. Mock data never submits to the database or overwrites real user data.</p>
      </div>
      <div class="mock-data-admin-actions">
        <button
          type="button"
          class="mock-data-toggle ${isMockDataEnabled() ? "is-on" : "is-off"}"
          data-mock-data-toggle="true"
          aria-pressed="${isMockDataEnabled() ? "true" : "false"}"
          aria-label="Toggle Dev Mode mock Community Grow data"
        >
          <span class="mock-data-toggle-text">
            <span class="mock-data-toggle-label">Dev Mode</span>
            <span class="mock-data-toggle-sublabel">Mock Community Grow data</span>
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

  target.appendChild(section);
  return section;
}

function normalizeLeaderboardAuditFilters(filters = {}) {
  const normalizedStatus = String(filters.status || "all").trim().toLowerCase();
  const normalizedInclusion = String(filters.inclusion || "all").trim().toLowerCase();

  return {
    startDate: String(filters.startDate || "").trim(),
    endDate: String(filters.endDate || "").trim(),
    source: String(filters.source || "").trim(),
    seedVariety: String(filters.seedVariety || "").trim(),
    seedType: String(filters.seedType || "").trim(),
    profile: String(filters.profile || "").trim(),
    status: ["all", "approved", "pending_review", "rejected", "private"].includes(normalizedStatus)
      ? normalizedStatus
      : "all",
    inclusion: ["all", "included", "excluded"].includes(normalizedInclusion)
      ? normalizedInclusion
      : "all",
  };
}

function hasActiveLeaderboardAuditFilters(filters = appState.leaderboardAuditFilters) {
  const normalizedFilters = normalizeLeaderboardAuditFilters(filters);
  return Object.entries(LEADERBOARD_AUDIT_DEFAULT_FILTERS).some(([key, defaultValue]) => (
    String(normalizedFilters[key] || "") !== String(defaultValue || "")
  ));
}

function formatLeaderboardAuditDateInput(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getLeaderboardAuditDatePresets(referenceDate = new Date()) {
  const today = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const last30Start = new Date(today);
  last30Start.setDate(last30Start.getDate() - 29);

  return {
    this_month: {
      startDate: formatLeaderboardAuditDateInput(monthStart),
      endDate: formatLeaderboardAuditDateInput(today),
    },
    last_30_days: {
      startDate: formatLeaderboardAuditDateInput(last30Start),
      endDate: formatLeaderboardAuditDateInput(today),
    },
    all_time: {
      startDate: "",
      endDate: "",
    },
  };
}

function getActiveLeaderboardAuditDatePresetKey(filters = appState.leaderboardAuditFilters) {
  const normalizedFilters = normalizeLeaderboardAuditFilters(filters);
  const presets = getLeaderboardAuditDatePresets();
  return Object.entries(presets).find(([, preset]) => (
    normalizedFilters.startDate === preset.startDate
    && normalizedFilters.endDate === preset.endDate
  ))?.[0] || "";
}

function formatLeaderboardAuditFilterValue(filterKey, value) {
  const normalizedValue = String(value || "").trim();
  if (!normalizedValue) {
    return "";
  }

  if (filterKey === "startDate" || filterKey === "endDate") {
    const parsedDate = parseCompletedAtValue(normalizedValue);
    if (parsedDate) {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(parsedDate);
    }
  }

  if (filterKey === "status") {
    return getLeaderboardAuditStatusLabel(normalizedValue);
  }

  if (filterKey === "inclusion") {
    if (normalizedValue === "included") {
      return "Included only";
    }
    if (normalizedValue === "excluded") {
      return "Excluded only";
    }
  }

  return normalizedValue;
}

function getLeaderboardAuditActiveFilterChips(filters = appState.leaderboardAuditFilters) {
  const normalizedFilters = normalizeLeaderboardAuditFilters(filters);
  const chipDefinitions = [
    { key: "startDate", label: "Start" },
    { key: "endDate", label: "End" },
    { key: "source", label: "Source" },
    { key: "seedVariety", label: "Seed Variety" },
    { key: "seedType", label: "Seed Type" },
    { key: "profile", label: "Profile/User" },
    { key: "status", label: "Status" },
    { key: "inclusion", label: "Inclusion" },
  ];

  return chipDefinitions
    .map(({ key, label }) => {
      const value = normalizedFilters[key];
      const defaultValue = LEADERBOARD_AUDIT_DEFAULT_FILTERS[key];
      if (String(value || "") === String(defaultValue || "")) {
        return null;
      }

      return {
        key,
        label,
        value: formatLeaderboardAuditFilterValue(key, value),
      };
    })
    .filter(Boolean);
}

function getLeaderboardAuditProfileLabel(snapshot) {
  return String(
    snapshot?.profileName
    || snapshot?.submittedBy
    || snapshot?.submittedByName
    || snapshot?.userId
    || "",
  ).trim() || "Unknown grower";
}

function getLeaderboardAuditSessionName(snapshot) {
  const linkedSession = getGallerySnapshotSession(snapshot);
  if (linkedSession) {
    return formatSessionLabel(linkedSession);
  }

  return String(snapshot?.title || "").trim() || "Untitled snapshot";
}

function getLeaderboardAuditStatusLabel(status) {
  switch (String(status || "").trim()) {
    case "approved":
      return "Approved";
    case "pending_review":
      return "Pending Review";
    case "rejected":
      return "Rejected";
    case "private":
      return "Private";
    default:
      return "Unknown";
  }
}

function buildLeaderboardAuditRows() {
  const rankingSourceSnapshots = getGallerySnapshotsForDisplay();
  const rankingSourceIds = new Set(rankingSourceSnapshots.map((snapshot) => String(snapshot?.id || "").trim()).filter(Boolean));
  const reviewSnapshots = isMockDataEnabled() ? MOCK_PENDING_GALLERY_SUBMISSIONS : [];
  const combinedSnapshots = new Map();

  [...rankingSourceSnapshots, ...reviewSnapshots].forEach((snapshot) => {
    const snapshotId = String(snapshot?.id || "").trim();
    if (!snapshotId) {
      return;
    }
    combinedSnapshots.set(snapshotId, snapshot);
  });

  return sortGallerySnapshotsNewestFirst([...combinedSnapshots.values()]).map((snapshot) => {
    const submittedAt = parseLeaderboardSnapshotDate(snapshot);
    const publicDetails = getGallerySnapshotPublicSessionDetails(snapshot);
    const metadata = getGallerySnapshotLeaderboardMetadata(snapshot);
    const effectiveStatus = isMockGalleryReviewSnapshot(snapshot)
      ? getMockGalleryReviewStatus(snapshot)
      : getGallerySnapshotDisplayStatus(snapshot);
    const totalSeeds = Math.max(0, Number(snapshot?.totalSeeds) || 0);
    const totalPlanted = Math.max(0, Number(snapshot?.totalPlanted) || 0);
    const successPercent = Math.max(0, Number(snapshot?.successPercent) || 0);
    const sessionName = getLeaderboardAuditSessionName(snapshot);
    const profileLabel = getLeaderboardAuditProfileLabel(snapshot);
    const completedDurationMs = getGallerySnapshotCompletedDurationMs(snapshot);

    return {
      id: String(snapshot.id || "").trim(),
      snapshot,
      submittedAt,
      submittedAtLabel: getGallerySnapshotSubmittedDateTimeLabel(snapshot),
      submittedDateValue: submittedAt && !Number.isNaN(submittedAt.getTime())
        ? submittedAt.toISOString().slice(0, 10)
        : "",
      profileLabel,
      sessionName,
      sourceLabel: metadata.sourceName || publicDetails.sourceLabel || "Not shared",
      seedVarietyLabel: metadata.seedVarietyName || publicDetails.seedVarietyLabel || "Not shared",
      seedTypeLabel: metadata.seedTypeName || publicDetails.seedTypeLabel || "Not shared",
      sexLabel: publicDetails.sexLabel || "Not shared",
      totalSeeds,
      totalPlanted,
      successPercent,
      status: effectiveStatus,
      statusLabel: getLeaderboardAuditStatusLabel(effectiveStatus),
      isInActiveRankingSource: rankingSourceIds.has(String(snapshot.id || "").trim()),
      hasValidSubmittedAt: Boolean(submittedAt && !Number.isNaN(submittedAt.getTime())),
      hasValidPerformance: totalSeeds > 0 && Number.isFinite(successPercent),
      completedDurationMs,
      completedDurationLabel: formatDurationMsShort(completedDurationMs),
    };
  });
}

function getLeaderboardAuditFilterOptions(rows) {
  const buildOptions = (values) => [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))]
    .sort((left, right) => left.localeCompare(right, "en", { sensitivity: "base" }));

  return {
    sources: buildOptions(rows.map((row) => row.sourceLabel)),
    seedVarieties: buildOptions(rows.map((row) => row.seedVarietyLabel)),
    seedTypes: buildOptions(rows.map((row) => row.seedTypeLabel)),
    profiles: buildOptions(rows.map((row) => row.profileLabel)),
  };
}

function getLeaderboardAuditDateRangeLabel(rows) {
  const datedRows = (rows || []).filter((row) => row.submittedAt && !Number.isNaN(row.submittedAt.getTime()));
  if (!datedRows.length) {
    return "No qualifying dates";
  }

  const sortedDates = datedRows
    .map((row) => row.submittedAt)
    .sort((left, right) => left.getTime() - right.getTime());
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${formatter.format(sortedDates[0])} - ${formatter.format(sortedDates[sortedDates.length - 1])}`;
}

function summarizeLeaderboardAuditReasons(reasons) {
  const counts = new Map();
  (reasons || []).forEach((reason) => {
    const normalizedReason = String(reason || "").trim();
    if (!normalizedReason) {
      return;
    }
    counts.set(normalizedReason, (counts.get(normalizedReason) || 0) + 1);
  });

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], "en", { sensitivity: "base" }))
    .map(([reason, count]) => `${reason} (${count})`);
}

function buildLeaderboardAuditPerformanceEntries(rows, options = {}) {
  const groups = new Map();
  const getLabel = typeof options.getLabel === "function" ? options.getLabel : (row) => row.sourceLabel;
  const minSnapshots = Math.max(1, Number(options.minSnapshots) || 1);

  (rows || []).forEach((row) => {
    const label = normalizeLeaderboardLabel(getLabel(row));
    const normalizedKey = normalizeLeaderboardKey(label);
    if (!normalizedKey) {
      return;
    }

    const currentGroup = groups.get(normalizedKey) || {
      key: normalizedKey,
      name: label,
      snapshotCount: 0,
      successPercentTotal: 0,
      totalPlanted: 0,
      totalSeeds: 0,
      latestSubmittedAt: "",
      fastestCompletedDurationMs: null,
    };

    currentGroup.snapshotCount += 1;
    currentGroup.successPercentTotal += row.successPercent;
    currentGroup.totalPlanted += row.totalPlanted;
    currentGroup.totalSeeds += row.totalSeeds;
    if (row.submittedAt && (!currentGroup.latestSubmittedAt || row.submittedAt.toISOString() > currentGroup.latestSubmittedAt)) {
      currentGroup.latestSubmittedAt = row.submittedAt.toISOString();
    }
    if (Number.isFinite(row.completedDurationMs) && (!Number.isFinite(currentGroup.fastestCompletedDurationMs) || row.completedDurationMs < currentGroup.fastestCompletedDurationMs)) {
      currentGroup.fastestCompletedDurationMs = row.completedDurationMs;
    }

    groups.set(normalizedKey, currentGroup);
  });

  return [...groups.values()]
    .filter((entry) => entry.snapshotCount >= minSnapshots)
    .map((entry) => ({
      ...entry,
      averagePercent: entry.snapshotCount > 0
        ? Math.round((entry.successPercentTotal / entry.snapshotCount) * 10) / 10
        : 0,
      fastestCompletedDurationLabel: formatDurationMsShort(entry.fastestCompletedDurationMs),
    }))
    .sort((left, right) => comparePerformanceByRateSpeedAndRecency(left, right, {
      getRate: (entry) => entry.averagePercent,
      getDurationMs: (entry) => entry.fastestCompletedDurationMs,
      getSortTime: (entry) => new Date(entry.latestSubmittedAt || 0).getTime(),
      getFallbackLabel: (entry) => entry.name,
      sortDirection: "desc",
    }));
}

function buildLeaderboardAuditCalculation(rows, options = {}) {
  const label = String(options.label || "group").trim() || "group";
  const minSnapshots = Math.max(1, Number(options.minSnapshots) || 1);
  const topLimit = Math.max(1, Number(options.topLimit) || 1);
  const dateMode = options.dateMode === "month" ? "month" : "all";
  const getLabel = typeof options.getLabel === "function" ? options.getLabel : (row) => row.sourceLabel;
  const now = new Date();
  const currentMonthKey = getLeaderboardMonthKey(now);
  const scopedRows = (rows || []).filter((row) => (
    dateMode === "month"
      ? getLeaderboardMonthKey(row.submittedAt) === currentMonthKey
      : true
  ));

  const prequalifiedRows = [];
  const excludedReasonsById = new Map();
  const excludedReasons = [];

  scopedRows.forEach((row) => {
    const rowExclusions = [];
    if (!row.isInActiveRankingSource) {
      rowExclusions.push("Not part of the active ranking dataset");
    }
    if (row.status !== "approved") {
      rowExclusions.push(`Status is ${row.statusLabel.toLowerCase()}`);
    }
    if (!row.hasValidSubmittedAt) {
      rowExclusions.push("Missing submitted date");
    }
    if (!row.hasValidPerformance) {
      rowExclusions.push("Missing germination performance");
    }

    const groupLabel = normalizeLeaderboardLabel(getLabel(row));
    if (!groupLabel) {
      rowExclusions.push(`Missing ${label}`);
    }

    if (rowExclusions.length) {
      excludedReasonsById.set(row.id, rowExclusions);
      excludedReasons.push(...rowExclusions);
      return;
    }

    prequalifiedRows.push(row);
  });

  const groupCounts = prequalifiedRows.reduce((accumulator, row) => {
    const groupKey = normalizeLeaderboardKey(getLabel(row));
    accumulator.set(groupKey, (accumulator.get(groupKey) || 0) + 1);
    return accumulator;
  }, new Map());

  const qualifiedRows = prequalifiedRows.filter((row) => {
    const groupKey = normalizeLeaderboardKey(getLabel(row));
    const groupCount = groupCounts.get(groupKey) || 0;
    if (groupCount >= minSnapshots) {
      return true;
    }

    const reason = `Fewer than ${minSnapshots} ${label}${minSnapshots === 1 ? "" : " snapshots"}`;
    const existingReasons = excludedReasonsById.get(row.id) || [];
    existingReasons.push(reason);
    excludedReasonsById.set(row.id, existingReasons);
    excludedReasons.push(reason);
    return false;
  });

  const entries = buildLeaderboardAuditPerformanceEntries(qualifiedRows, {
    getLabel,
    minSnapshots,
  }).slice(0, topLimit);

  const eligibleAverage = qualifiedRows.length
    ? Math.round((qualifiedRows.reduce((sum, row) => sum + row.successPercent, 0) / qualifiedRows.length) * 10) / 10
    : 0;

  return {
    title: String(options.title || "").trim() || label,
    label,
    minSnapshots,
    topEntries: entries,
    topEntry: entries[0] || null,
    eligibleSnapshotCount: qualifiedRows.length,
    excludedSnapshotCount: Math.max(0, scopedRows.length - qualifiedRows.length),
    averageGerminationRate: eligibleAverage,
    dateRangeLabel: getLeaderboardAuditDateRangeLabel(scopedRows),
    excludedReasonSummary: summarizeLeaderboardAuditReasons(excludedReasons),
    scopedRows,
    qualifiedRows,
    excludedReasonsById,
  };
}

function applyLeaderboardAuditFilters(rows, filters = appState.leaderboardAuditFilters) {
  const normalizedFilters = normalizeLeaderboardAuditFilters(filters);
  const startDateValue = normalizedFilters.startDate || "";
  const endDateValue = normalizedFilters.endDate || "";

  return (rows || []).filter((row) => {
    if (startDateValue && (!row.submittedDateValue || row.submittedDateValue < startDateValue)) {
      return false;
    }
    if (endDateValue && (!row.submittedDateValue || row.submittedDateValue > endDateValue)) {
      return false;
    }
    if (normalizedFilters.source && row.sourceLabel !== normalizedFilters.source) {
      return false;
    }
    if (normalizedFilters.seedVariety && row.seedVarietyLabel !== normalizedFilters.seedVariety) {
      return false;
    }
    if (normalizedFilters.seedType && row.seedTypeLabel !== normalizedFilters.seedType) {
      return false;
    }
    if (normalizedFilters.profile && row.profileLabel !== normalizedFilters.profile) {
      return false;
    }
    if (normalizedFilters.status !== "all" && row.status !== normalizedFilters.status) {
      return false;
    }
    return true;
  });
}

function buildLeaderboardAuditState(filters = appState.leaderboardAuditFilters) {
  const allRows = buildLeaderboardAuditRows();
  const options = getLeaderboardAuditFilterOptions(allRows);
  const filteredRowsBeforeInclusion = applyLeaderboardAuditFilters(allRows, filters);
  const filteredActiveRows = filteredRowsBeforeInclusion.filter((row) => row.isInActiveRankingSource);
  const calculations = {
    monthSource: buildLeaderboardAuditCalculation(filteredActiveRows, {
      title: "This Month Top Source",
      label: "source",
      minSnapshots: 3,
      getLabel: (row) => row.sourceLabel,
      topLimit: 1,
      dateMode: "month",
    }),
    allSource: buildLeaderboardAuditCalculation(filteredActiveRows, {
      title: "All-Time Top Source",
      label: "source",
      minSnapshots: 3,
      getLabel: (row) => row.sourceLabel,
      topLimit: 1,
      dateMode: "all",
    }),
    monthSeedType: buildLeaderboardAuditCalculation(filteredActiveRows, {
      title: "This Month Top Seed Type",
      label: "seed type",
      minSnapshots: 3,
      getLabel: (row) => row.seedTypeLabel,
      topLimit: 1,
      dateMode: "month",
    }),
    allSeedType: buildLeaderboardAuditCalculation(filteredActiveRows, {
      title: "All-Time Top Seed Type",
      label: "seed type",
      minSnapshots: 3,
      getLabel: (row) => row.seedTypeLabel,
      topLimit: 1,
      dateMode: "all",
    }),
    monthSessions: buildLeaderboardAuditCalculation(filteredActiveRows, {
      title: "This Month Top 3 Sessions",
      label: "session",
      minSnapshots: 1,
      getLabel: (row) => row.sessionName,
      topLimit: 3,
      dateMode: "month",
    }),
    allSessions: buildLeaderboardAuditCalculation(filteredActiveRows, {
      title: "All-Time Top 3 Sessions",
      label: "session",
      minSnapshots: 1,
      getLabel: (row) => row.sessionName,
      topLimit: 3,
      dateMode: "all",
    }),
  };

  const inclusionMap = new Map();
  Object.values(calculations).forEach((calculation) => {
    calculation.qualifiedRows.forEach((row) => {
      const current = inclusionMap.get(row.id) || { included: false, reasons: [] };
      inclusionMap.set(row.id, { ...current, included: true });
    });
    calculation.excludedReasonsById.forEach((reasons, rowId) => {
      const current = inclusionMap.get(rowId) || { included: false, reasons: [] };
      const combinedReasons = [...current.reasons, ...reasons];
      inclusionMap.set(rowId, {
        included: current.included,
        reasons: [...new Set(combinedReasons)],
      });
    });
  });

  const rowsWithInclusion = filteredRowsBeforeInclusion.map((row) => {
    const inclusion = inclusionMap.get(row.id) || { included: false, reasons: [] };
    return {
      ...row,
      includedInLeaderboard: inclusion.included,
      exclusionReason: inclusion.included
        ? ""
        : (inclusion.reasons[0] || "No qualifying leaderboard group"),
    };
  });

  const normalizedFilters = normalizeLeaderboardAuditFilters(filters);
  const visibleRows = rowsWithInclusion.filter((row) => {
    if (normalizedFilters.inclusion === "included" && !row.includedInLeaderboard) {
      return false;
    }
    if (normalizedFilters.inclusion === "excluded" && row.includedInLeaderboard) {
      return false;
    }
    return true;
  });

  const visibleIncludedRows = visibleRows.filter((row) => row.includedInLeaderboard);
  const visibleExcludedRows = visibleRows.filter((row) => !row.includedInLeaderboard);
  const visibleAverageRate = visibleRows.length
    ? Math.round((visibleRows.reduce((sum, row) => sum + (Number(row.successPercent) || 0), 0) / visibleRows.length) * 10) / 10
    : 0;

  return {
    filters: normalizedFilters,
    hasActiveFilters: hasActiveLeaderboardAuditFilters(normalizedFilters),
    activeFilterChips: getLeaderboardAuditActiveFilterChips(normalizedFilters),
    options,
    allRows,
    rows: visibleRows,
    calculations,
    filteredActiveRowCount: filteredActiveRows.length,
    quickStats: {
      visibleRows: visibleRows.length,
      includedRows: visibleIncludedRows.length,
      excludedRows: visibleExcludedRows.length,
      averageRate: visibleAverageRate,
    },
  };
}

function formatLeaderboardAuditMetric(entry) {
  if (!entry) {
    return "No qualifying data";
  }

  return `${entry.name} - ${entry.averagePercent}% avg${entry.fastestCompletedDurationLabel ? ` · fastest ${entry.fastestCompletedDurationLabel}` : ""}`;
}

function renderLeaderboardAuditSelectOptions(options, selectedValue, allLabel) {
  return [
    `<option value="">${escapeHtml(allLabel)}</option>`,
    ...options.map((option) => `<option value="${escapeHtml(option)}"${option === selectedValue ? " selected" : ""}>${escapeHtml(option)}</option>`),
  ].join("");
}

function renderLeaderboardAuditCalculationCard(calculation) {
  const topSummary = calculation.topEntries.length
    ? calculation.topEntries.map((entry, index) => `${index + 1}. ${formatLeaderboardAuditMetric(entry)}`).join(" | ")
    : "No qualifying data";

  return `
    <article class="leaderboard-audit-metric-card">
      <div class="leaderboard-audit-metric-head">
        <p class="eyebrow">${escapeHtml(calculation.title)}</p>
        <strong>${escapeHtml(topSummary)}</strong>
      </div>
      <div class="leaderboard-audit-metric-grid">
        <span><strong>${calculation.eligibleSnapshotCount}</strong> eligible snapshots</span>
        <span><strong>${calculation.minSnapshots}</strong> minimum required</span>
        <span><strong>${calculation.averageGerminationRate}%</strong> average germination</span>
        <span><strong>${calculation.excludedSnapshotCount}</strong> excluded snapshots</span>
      </div>
      <p class="leaderboard-audit-metric-range">${escapeHtml(calculation.dateRangeLabel)}</p>
      <p class="leaderboard-audit-metric-reasons">${escapeHtml(calculation.excludedReasonSummary.join(" • ") || "No exclusions")}</p>
    </article>
  `;
}

function renderLeaderboardAuditDatePresetButtonsMarkup(state) {
  const activePreset = getActiveLeaderboardAuditDatePresetKey(state.filters);
  const presets = [
    { key: "this_month", label: "This Month" },
    { key: "last_30_days", label: "Last 30 Days" },
    { key: "all_time", label: "All-Time" },
  ];

  return `
    <div class="leaderboard-audit-quick-filter-group" aria-label="Date presets">
      ${presets.map((preset) => `
        <button
          type="button"
          class="leaderboard-audit-quick-filter${activePreset === preset.key ? " is-active" : ""}"
          data-audit-date-preset="${escapeHtml(preset.key)}"
          aria-pressed="${activePreset === preset.key ? "true" : "false"}"
        >
          ${escapeHtml(preset.label)}
        </button>
      `).join("")}
    </div>
  `;
}

function renderLeaderboardAuditInclusionQuickFiltersMarkup(state) {
  const options = [
    { key: "all", label: "All Records" },
    { key: "included", label: "Included Only" },
    { key: "excluded", label: "Excluded Only" },
  ];

  return `
    <div class="leaderboard-audit-quick-filter-group" aria-label="Inclusion quick filters">
      ${options.map((option) => `
        <button
          type="button"
          class="leaderboard-audit-quick-filter${state.filters.inclusion === option.key ? " is-active" : ""}"
          data-audit-inclusion-quick="${escapeHtml(option.key)}"
          aria-pressed="${state.filters.inclusion === option.key ? "true" : "false"}"
        >
          ${escapeHtml(option.label)}
        </button>
      `).join("")}
    </div>
  `;
}

function renderLeaderboardAuditQuickStatsMarkup(state) {
  const stats = [
    {
      label: "Visible Rows",
      value: String(state.quickStats.visibleRows),
      detail: "matching current audit view",
    },
    {
      label: "Included Rows",
      value: String(state.quickStats.includedRows),
      detail: "currently counted in leaderboard calculations",
    },
    {
      label: "Excluded Rows",
      value: String(state.quickStats.excludedRows),
      detail: "visible rows excluded from leaderboard results",
    },
    {
      label: "Average Rate",
      value: `${state.quickStats.averageRate}%`,
      detail: "average germination of visible rows",
    },
  ];

  return `
    <div class="leaderboard-audit-quick-stats" aria-label="Leaderboard audit quick stats">
      ${stats.map((stat) => `
        <article class="leaderboard-audit-quick-stat">
          <span class="leaderboard-audit-quick-stat-label">${escapeHtml(stat.label)}</span>
          <strong class="leaderboard-audit-quick-stat-value">${escapeHtml(stat.value)}</strong>
          <p class="leaderboard-audit-quick-stat-detail">${escapeHtml(stat.detail)}</p>
        </article>
      `).join("")}
    </div>
  `;
}

function renderLeaderboardAuditInsightsSectionMarkup(state) {
  const isExpanded = Boolean(appState.leaderboardAuditInsightsExpanded);
  const toggleLabel = isExpanded ? "Collapse insights" : "Expand insights";

  return `
    <div class="leaderboard-audit-insights-section">
      <div class="leaderboard-audit-insights-heading">
        <div>
          <h4>Ranking Insights</h4>
          <p class="muted">Calculated leaderboard results and debug details</p>
        </div>
      </div>
      <div class="leaderboard-audit-insights-shell ${isExpanded ? "is-expanded" : "is-collapsed"}">
        <button
          type="button"
          class="leaderboard-audit-insights-toggle"
          data-leaderboard-audit-insights-toggle="true"
          aria-expanded="${isExpanded ? "true" : "false"}"
        >
          <span>${escapeHtml(toggleLabel)}</span>
          <span class="leaderboard-audit-insights-chevron" aria-hidden="true"></span>
        </button>
        ${isExpanded ? `
          <div class="leaderboard-audit-insights-content">
            <div class="leaderboard-audit-metrics-grid">
              ${renderLeaderboardAuditCalculationCard(state.calculations.monthSource)}
              ${renderLeaderboardAuditCalculationCard(state.calculations.allSource)}
              ${renderLeaderboardAuditCalculationCard(state.calculations.monthSeedType)}
              ${renderLeaderboardAuditCalculationCard(state.calculations.allSeedType)}
              ${renderLeaderboardAuditCalculationCard(state.calculations.monthSessions)}
              ${renderLeaderboardAuditCalculationCard(state.calculations.allSessions)}
            </div>
          </div>
        ` : ""}
      </div>
    </div>
  `;
}

function renderLeaderboardAuditActiveFilterChipsMarkup(state) {
  if (!state.activeFilterChips.length) {
    return "";
  }

  return `
    <div class="leaderboard-audit-chip-row" aria-label="Active audit filters">
      ${state.activeFilterChips.map((chip) => `
        <button type="button" class="leaderboard-audit-chip" data-audit-filter-remove="${escapeHtml(chip.key)}">
          <span>${escapeHtml(`${chip.label}: ${chip.value}`)}</span>
          <span aria-hidden="true">×</span>
        </button>
      `).join("")}
    </div>
  `;
}

function renderLeaderboardAuditEmptyStateMarkup(state) {
  const title = state.hasActiveFilters
    ? "No audit rows match the current filters."
    : "No leaderboard audit records are available yet.";
  const message = state.hasActiveFilters
    ? "Try removing one or more filters, widening the date range, or clearing all filters to view more leaderboard audit data."
    : "Audit rows will appear here after Community Grow snapshot records are available for review.";
  const actionMarkup = state.hasActiveFilters
    ? '<button type="button" class="button button-secondary" data-leaderboard-audit-clear="true">Clear All Filters</button>'
    : "";

  return `
    <div class="leaderboard-audit-empty-state">
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(message)}</p>
      ${actionMarkup}
    </div>
  `;
}

function renderLeaderboardAuditExpandedPartitionRowsMarkup(session) {
  const partitions = Array.isArray(session?.partitions) ? session.partitions : [];
  if (!partitions.length) {
    return '<p class="leaderboard-audit-expanded-empty">No partition data is available for this session.</p>';
  }

  return `
    <div class="leaderboard-audit-expanded-table-shell">
      <table class="leaderboard-audit-expanded-table">
        <thead>
          <tr>
            <th>Partition</th>
            <th>Source</th>
            <th>Seed Variety</th>
            <th>Type</th>
            <th>Sex</th>
            <th>Seeds</th>
            <th>Germinated</th>
            <th>Success</th>
          </tr>
        </thead>
        <tbody>
          ${partitions.map((partition) => {
            const germinatedCount = Math.max(0, Number(partition?.plantedCount) || 0);
            const seedCount = Math.max(0, Number(partition?.seedCount) || 0);
            const successPercent = seedCount > 0 ? Math.round((germinatedCount / seedCount) * 100) : 0;
            return `
              <tr>
                <td>${escapeHtml(String(partition?.id || "—"))}</td>
                <td>${escapeHtml(formatPartitionSource(partition) || "Not set")}</td>
                <td>${escapeHtml(formatPartitionSeedVariety(partition) || "Not set")}</td>
                <td>${escapeHtml(partition?.seedType ? capitalize(partition.seedType) : "Not selected")}</td>
                <td>${escapeHtml(partition?.feminized ? capitalize(partition.feminized) : "Not selected")}</td>
                <td>${escapeHtml(String(seedCount))}</td>
                <td>${escapeHtml(String(germinatedCount))}</td>
                <td>${escapeHtml(`${successPercent}%`)}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderLeaderboardAuditExpandedRowMarkup(row) {
  const snapshot = row.snapshot;
  const linkedSession = getGallerySnapshotSession(snapshot);
  const publicDetails = getGallerySnapshotPublicSessionDetails(snapshot);
  const feedDetails = getGallerySnapshotFeedDetails(snapshot);
  const sessionFacts = linkedSession
    ? [
      { label: "Session Name", value: formatSessionLabel(linkedSession) },
      { label: "Status", value: capitalize(normalizeSessionStatus(linkedSession.sessionStatus || "")).replace("Unselected", "Not started") },
      { label: "System", value: getSessionSystemSummary(linkedSession) },
      { label: "Date", value: formatSessionNameDate(linkedSession.date) },
      { label: "Time", value: formatStoredTime(linkedSession.time) },
      { label: "Source", value: publicDetails.sourceLabel },
      { label: "Seed Variety", value: publicDetails.seedVarietyLabel },
      { label: "Seed Type", value: publicDetails.seedTypeLabel },
      { label: "Seed Sex", value: publicDetails.sexLabel },
      { label: "Seeds", value: `${feedDetails.totalPlanted} / ${feedDetails.totalSeeds}` },
    ]
    : [
      { label: "Snapshot Title", value: row.sessionName },
      { label: "Profile/User", value: row.profileLabel },
      { label: "System", value: publicDetails.systemLabel },
      { label: "Source", value: publicDetails.sourceLabel },
      { label: "Seed Variety", value: publicDetails.seedVarietyLabel },
      { label: "Seed Type", value: publicDetails.seedTypeLabel },
      { label: "Seed Sex", value: publicDetails.sexLabel },
      { label: "Seeds", value: `${feedDetails.totalPlanted} / ${feedDetails.totalSeeds}` },
      { label: "Submitted", value: row.submittedAtLabel },
      { label: "Status", value: row.statusLabel },
    ];
  const notesMarkup = linkedSession?.sessionNotes
    ? `<div class="leaderboard-audit-expanded-notes"><strong>Session Notes</strong><p>${escapeHtml(linkedSession.sessionNotes)}</p></div>`
    : '<div class="leaderboard-audit-expanded-notes"><strong>Session Notes</strong><p>No saved notes for this session.</p></div>';
  const timelineMarkup = linkedSession
    ? renderSessionLifecycleTimelineMarkup(buildSessionLifecycleState(linkedSession))
    : '<p class="leaderboard-audit-expanded-empty">Timeline data is unavailable because this snapshot is not linked to a saved session.</p>';
  const exclusionMarkup = !row.includedInLeaderboard
    ? `
      <div class="leaderboard-audit-expanded-notice">
        <strong>Exclusion Reason</strong>
        <p>${escapeHtml(row.exclusionReason || "No qualifying leaderboard group")}</p>
      </div>
    `
    : "";

  return `
    <div class="leaderboard-audit-expanded-panel">
      <div class="leaderboard-audit-expanded-layout">
        <div class="leaderboard-audit-expanded-media">
          ${renderGallerySnapshotMediaMarkup(snapshot, feedDetails)}
        </div>
        <div class="leaderboard-audit-expanded-main">
          <div class="leaderboard-audit-expanded-section">
            <div class="leaderboard-audit-expanded-meta-grid">
              ${sessionFacts.map((fact) => `
                <article class="meta-card leaderboard-audit-expanded-meta-card">
                  <strong>${escapeHtml(fact.label)}</strong>
                  <p>${escapeHtml(fact.value || "Not available")}</p>
                </article>
              `).join("")}
            </div>
            ${notesMarkup}
            ${exclusionMarkup}
          </div>
          <div class="leaderboard-audit-expanded-section">
            <div class="leaderboard-audit-expanded-section-head">
              <strong>Partition Data</strong>
            </div>
            ${linkedSession
    ? renderLeaderboardAuditExpandedPartitionRowsMarkup(linkedSession)
    : '<p class="leaderboard-audit-expanded-empty">Partition data is unavailable because this snapshot is not linked to a saved session.</p>'}
          </div>
          <div class="leaderboard-audit-expanded-section">
            <div class="leaderboard-audit-expanded-section-head">
              <strong>Timeline Data</strong>
            </div>
            <div class="leaderboard-audit-expanded-timeline">
              ${timelineMarkup}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function buildLeaderboardAuditSummaryText(state) {
  const scopeLabel = state.hasActiveFilters ? "Filtered results" : "All records";
  const filtersLabel = state.activeFilterChips.length
    ? state.activeFilterChips.map((chip) => chip.label).join(" | ")
    : "None";
  const summaryLines = [
    "Leaderboard Data Audit",
    `Scope: ${scopeLabel}`,
    `Active filters: ${filtersLabel}`,
    `Visible snapshot rows: ${state.rows.length}`,
    `Active ranking snapshot rows: ${state.filteredActiveRowCount}`,
    `This Month Top Source: ${formatLeaderboardAuditMetric(state.calculations.monthSource.topEntry)}`,
    `All-Time Top Source: ${formatLeaderboardAuditMetric(state.calculations.allSource.topEntry)}`,
    `This Month Top Seed Type: ${formatLeaderboardAuditMetric(state.calculations.monthSeedType.topEntry)}`,
    `All-Time Top Seed Type: ${formatLeaderboardAuditMetric(state.calculations.allSeedType.topEntry)}`,
    `This Month Top 3 Sessions: ${state.calculations.monthSessions.topEntries.length ? state.calculations.monthSessions.topEntries.map((entry) => formatLeaderboardAuditMetric(entry)).join(", ") : "No qualifying data"}`,
    `All-Time Top 3 Sessions: ${state.calculations.allSessions.topEntries.length ? state.calculations.allSessions.topEntries.map((entry) => formatLeaderboardAuditMetric(entry)).join(", ") : "No qualifying data"}`,
  ];

  return summaryLines.join("\n");
}

function exportLeaderboardAuditCsv(rows, hasActiveFilters = false) {
  const headers = [
    "submitted_date",
    "profile_user",
    "session_name",
    "source",
    "seed_variety",
    "seed_type",
    "seed_sex",
    "seeds_started",
    "seeds_germinated_planted",
    "germination_percentage",
    "gallery_status",
    "included_in_leaderboard",
    "exclusion_reason",
  ];
  const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, "\"\"")}"`;
  const csvLines = [
    headers.join(","),
    ...rows.map((row) => ([
      row.submittedAtLabel,
      row.profileLabel,
      row.sessionName,
      row.sourceLabel,
      row.seedVarietyLabel,
      row.seedTypeLabel,
      row.sexLabel,
      row.totalSeeds,
      row.totalPlanted,
      `${row.successPercent}%`,
      row.statusLabel,
      row.includedInLeaderboard ? "Yes" : "No",
      row.exclusionReason,
    ].map(escapeCsv).join(","))),
  ];

  const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8" });
  downloadSnapshotBlob(blob, hasActiveFilters ? "leaderboard-data-audit-filtered.csv" : "leaderboard-data-audit-all-records.csv");
}

function exportLeaderboardAuditSummary(state) {
  const summaryText = buildLeaderboardAuditSummaryText(state);
  const blob = new Blob([summaryText], { type: "text/plain;charset=utf-8" });
  downloadSnapshotBlob(
    blob,
    state.hasActiveFilters ? "leaderboard-data-audit-summary-filtered.txt" : "leaderboard-data-audit-summary-all-records.txt",
  );
}

function renderLeaderboardAuditSection(target = app) {
  if (!target || !isAdminUser()) {
    return null;
  }

  const state = buildLeaderboardAuditState();
  const section = document.createElement("section");
  section.className = "admin-leaderboard-audit-shell";
  section.innerHTML = renderAdminCollapsibleSectionMarkup({
    eyebrow: "Admin Analytics",
    title: "Leaderboard Data Audit",
    description: "Inspect the snapshot records and ranking calculations used for Community Grow performance insights.",
    iconType: "leaderboard",
    storageKey: ADMIN_ANALYTICS_OPEN_STORAGE_KEY,
    contentId: "admin-analytics-section-content",
    defaultOpen: false,
    sectionClassName: "card leaderboard-audit-section",
    bodyMarkup: `
    <div class="leaderboard-audit-controls">
      <div class="leaderboard-audit-toolbar">
        <div class="leaderboard-audit-toolbar-group">
          <span class="leaderboard-audit-toolbar-label">Date Presets</span>
          ${renderLeaderboardAuditDatePresetButtonsMarkup(state)}
        </div>
        <div class="leaderboard-audit-toolbar-group">
          <span class="leaderboard-audit-toolbar-label">Quick Filters</span>
          ${renderLeaderboardAuditInclusionQuickFiltersMarkup(state)}
        </div>
      </div>
      <div class="leaderboard-audit-actions">
        <span class="leaderboard-audit-filter-state">${escapeHtml(state.hasActiveFilters ? "Filtered results" : "All records")}</span>
        <button type="button" class="button button-secondary" data-leaderboard-audit-clear="true">Clear All</button>
        <button type="button" class="button button-secondary" data-leaderboard-audit-copy="true">Copy Summary</button>
        <button type="button" class="button button-secondary" data-leaderboard-audit-export-summary="true">Export Summary (${escapeHtml(state.hasActiveFilters ? "Filtered" : "All Records")})</button>
        <button type="button" class="button button-primary" data-leaderboard-audit-export-raw="true">Export Raw CSV (${escapeHtml(state.hasActiveFilters ? "Filtered" : "All Records")})</button>
      </div>
      <div class="leaderboard-audit-filter-grid">
        <label>
          <span>Start Date</span>
          <input type="date" data-audit-filter="startDate" value="${escapeHtml(state.filters.startDate)}">
        </label>
        <label>
          <span>End Date</span>
          <input type="date" data-audit-filter="endDate" value="${escapeHtml(state.filters.endDate)}">
        </label>
        <label>
          <span>Source</span>
          <select data-audit-filter="source">${renderLeaderboardAuditSelectOptions(state.options.sources, state.filters.source, "All sources")}</select>
        </label>
        <label>
          <span>Seed Variety</span>
          <select data-audit-filter="seedVariety">${renderLeaderboardAuditSelectOptions(state.options.seedVarieties, state.filters.seedVariety, "All seed varieties")}</select>
        </label>
        <label>
          <span>Seed Type</span>
          <select data-audit-filter="seedType">${renderLeaderboardAuditSelectOptions(state.options.seedTypes, state.filters.seedType, "All seed types")}</select>
        </label>
        <label>
          <span>Profile/User</span>
          <select data-audit-filter="profile">${renderLeaderboardAuditSelectOptions(state.options.profiles, state.filters.profile, "All profiles")}</select>
        </label>
        <label>
          <span>Community Grow Status</span>
          <select data-audit-filter="status">
            <option value="all"${state.filters.status === "all" ? " selected" : ""}>All statuses</option>
            <option value="approved"${state.filters.status === "approved" ? " selected" : ""}>Approved</option>
            <option value="pending_review"${state.filters.status === "pending_review" ? " selected" : ""}>Pending Review</option>
            <option value="rejected"${state.filters.status === "rejected" ? " selected" : ""}>Rejected</option>
            <option value="private"${state.filters.status === "private" ? " selected" : ""}>Private</option>
          </select>
        </label>
        <label>
          <span>Included/Excluded</span>
          <select data-audit-filter="inclusion">
            <option value="all"${state.filters.inclusion === "all" ? " selected" : ""}>All records</option>
            <option value="included"${state.filters.inclusion === "included" ? " selected" : ""}>Included only</option>
            <option value="excluded"${state.filters.inclusion === "excluded" ? " selected" : ""}>Excluded only</option>
          </select>
        </label>
    </div>
    ${renderLeaderboardAuditActiveFilterChipsMarkup(state)}
  </div>
  ${renderLeaderboardAuditQuickStatsMarkup(state)}
    ${renderLeaderboardAuditInsightsSectionMarkup(state)}
    <div class="leaderboard-audit-table-shell">
      <table class="leaderboard-audit-table">
        <thead>
          <tr>
            <th>Submitted</th>
            <th>Profile/User</th>
            <th>Session</th>
            <th>Source</th>
            <th>Seed Variety</th>
            <th>Seed Type</th>
            <th>Seeds Started</th>
            <th>Germinated</th>
            <th>Rate</th>
            <th>Status</th>
            <th>Included</th>
            <th>Exclusion Reason</th>
          </tr>
        </thead>
        <tbody>
          ${state.rows.length
      ? state.rows.map((row) => {
        const isExpanded = appState.leaderboardAuditExpandedId === row.id;
        return `
              <tr
                class="leaderboard-audit-row${isExpanded ? " is-expanded" : ""}"
                data-audit-row="${escapeHtml(row.id)}"
                aria-expanded="${isExpanded ? "true" : "false"}"
                tabindex="0"
              >
                <td>${escapeHtml(row.submittedAtLabel)}</td>
                <td>${escapeHtml(row.profileLabel)}</td>
                <td>${escapeHtml(row.sessionName)}</td>
                <td>${escapeHtml(row.sourceLabel)}</td>
                <td>${escapeHtml(row.seedVarietyLabel)}</td>
                <td>${escapeHtml(row.seedTypeLabel)}</td>
                <td>${escapeHtml(String(row.totalSeeds || 0))}</td>
                <td>${escapeHtml(String(row.totalPlanted || 0))}</td>
                <td>${escapeHtml(`${row.successPercent}%`)}</td>
                <td><span class="leaderboard-audit-status-pill is-${escapeHtml(row.status)}">${escapeHtml(row.statusLabel)}</span></td>
                <td>${row.includedInLeaderboard ? '<span class="leaderboard-audit-inclusion is-included">Yes</span>' : '<span class="leaderboard-audit-inclusion is-excluded">No</span>'}</td>
                <td>${escapeHtml(row.exclusionReason || "—")}</td>
              </tr>
              ${isExpanded ? `
                <tr class="leaderboard-audit-expanded-row">
                  <td colspan="12" class="leaderboard-audit-expanded-cell">
                    ${renderLeaderboardAuditExpandedRowMarkup(row)}
                  </td>
                </tr>
              ` : ""}
            `;
      }).join("")
      : `
            <tr>
              <td colspan="12" class="leaderboard-audit-empty">${renderLeaderboardAuditEmptyStateMarkup(state)}</td>
            </tr>
          `}
        </tbody>
      </table>
    </div>
  `,
  });

  const card = section.querySelector(".leaderboard-audit-section");
  if (!card) {
    return null;
  }

  card.querySelectorAll("[data-audit-filter]").forEach((control) => {
    control.addEventListener("change", (event) => {
      const { auditFilter } = event.currentTarget.dataset;
      appState.leaderboardAuditFilters = normalizeLeaderboardAuditFilters({
        ...appState.leaderboardAuditFilters,
        [auditFilter]: event.currentTarget.value,
      });
      safeRender();
    });
  });

  card.querySelectorAll("[data-audit-date-preset]").forEach((button) => {
    button.addEventListener("click", () => {
      const presetKey = String(button.dataset.auditDatePreset || "").trim();
      const preset = getLeaderboardAuditDatePresets()[presetKey];
      if (!preset) {
        return;
      }

      appState.leaderboardAuditFilters = normalizeLeaderboardAuditFilters({
        ...appState.leaderboardAuditFilters,
        startDate: preset.startDate,
        endDate: preset.endDate,
      });
      safeRender();
    });
  });

  card.querySelectorAll("[data-audit-inclusion-quick]").forEach((button) => {
    button.addEventListener("click", () => {
      const inclusionValue = String(button.dataset.auditInclusionQuick || "").trim();
      if (!["all", "included", "excluded"].includes(inclusionValue)) {
        return;
      }

      appState.leaderboardAuditFilters = normalizeLeaderboardAuditFilters({
        ...appState.leaderboardAuditFilters,
        inclusion: inclusionValue,
      });
      safeRender();
    });
  });

  card.querySelectorAll("[data-leaderboard-audit-clear='true']").forEach((button) => {
    button.addEventListener("click", () => {
      appState.leaderboardAuditFilters = normalizeLeaderboardAuditFilters({
        ...LEADERBOARD_AUDIT_DEFAULT_FILTERS,
      });
      safeRender();
    });
  });

  card.querySelectorAll("[data-audit-filter-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      const filterKey = String(button.dataset.auditFilterRemove || "").trim();
      if (!filterKey || !(filterKey in LEADERBOARD_AUDIT_DEFAULT_FILTERS)) {
        return;
      }

      appState.leaderboardAuditFilters = normalizeLeaderboardAuditFilters({
        ...appState.leaderboardAuditFilters,
        [filterKey]: LEADERBOARD_AUDIT_DEFAULT_FILTERS[filterKey],
      });
      safeRender();
    });
  });

  card.querySelectorAll("[data-audit-row]").forEach((rowElement) => {
    const toggleExpandedState = () => {
      const rowId = String(rowElement.dataset.auditRow || "").trim();
      if (!rowId) {
        return;
      }

      appState.leaderboardAuditExpandedId = appState.leaderboardAuditExpandedId === rowId ? "" : rowId;
      safeRender();
    };

    rowElement.addEventListener("click", toggleExpandedState);
    rowElement.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }
      event.preventDefault();
      toggleExpandedState();
    });
  });

  card.querySelector("[data-leaderboard-audit-export-raw='true']")?.addEventListener("click", () => {
    exportLeaderboardAuditCsv(state.rows, state.hasActiveFilters);
  });

  card.querySelector("[data-leaderboard-audit-export-summary='true']")?.addEventListener("click", () => {
    exportLeaderboardAuditSummary(state);
  });

  card.querySelector("[data-leaderboard-audit-insights-toggle='true']")?.addEventListener("click", () => {
    appState.leaderboardAuditInsightsExpanded = !appState.leaderboardAuditInsightsExpanded;
    safeRender();
  });

  card.querySelector("[data-leaderboard-audit-copy='true']")?.addEventListener("click", async () => {
    const summaryText = buildLeaderboardAuditSummaryText(state);
    try {
      await navigator.clipboard.writeText(summaryText);
      window.alert("Leaderboard audit summary copied.");
    } catch (error) {
      window.alert("Could not copy the leaderboard audit summary.");
    }
  });

  bindAdminCollapsibleSections(section);
  target.appendChild(section);
  return card;
}

function setMockDataEnabledAndRefresh(enabled) {
  if (!canAccessMockDataControls()) {
    return false;
  }

  setMockDataEnabled(enabled);
  appState.mockDataEnabled = isMockDataEnabled();
  if (appState.mockDataEnabled) {
    ensureMockAdminMessages();
  } else {
    appState.mockAdminMessages = [];
    appState.adminMessageExpandedState = {};
  }
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
  const galleryCountState = document.querySelector("#gallery-count-state");
  const galleryLoadMoreShell = document.querySelector("#gallery-load-more-shell");
  const galleryLoadMoreButton = document.querySelector("#gallery-load-more-button");
  const galleryFeedSection = document.querySelector(".gallery-feed-section");
  if (!galleryGrid) {
    return;
  }

  appState.gallerySort = normalizeGallerySort(appState.gallerySort);
  appState.gallerySortOrder = normalizeGallerySortOrder(appState.gallerySort, appState.gallerySortOrder);
  appState.galleryVisibleSnapshotCount = Math.max(
    GALLERY_SNAPSHOT_PAGE_SIZE,
    Number.parseInt(appState.galleryVisibleSnapshotCount, 10) || GALLERY_SNAPSHOT_PAGE_SIZE,
  );
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
    const pendingSnapshots = getAdminReviewPendingSnapshots();
    logGrowGalleryDebug("renderGallery:admin-review", {
      pendingCount: pendingSnapshots.length,
      pendingSnapshotIds: pendingSnapshots.map((entry) => entry.id),
      pendingStatuses: pendingSnapshots.map((entry) => ({
        id: entry.id,
        status: isMockGalleryReviewSnapshot(entry) ? getMockGalleryReviewStatus(entry) : entry.status,
        displayStatus: isMockGalleryReviewSnapshot(entry)
          ? getMockGalleryReviewStatus(entry)
          : getGallerySnapshotDisplayStatus(entry),
        userId: entry.userId,
      })),
    });
    const adminSection = document.createElement("section");
    adminSection.className = "card gallery-review-section gallery-inline-review-section";
    const pendingReviewCount = pendingSnapshots.length;
    const pendingReviewLabel =
      pendingReviewCount === 1 ? "1 Pending Review" : `${pendingReviewCount} Pending Reviews`;
    adminSection.innerHTML = `
      <div class="section-heading gallery-inline-review-heading app-section-header">
        <div class="section-title-with-icon app-section-header-main">
          <span class="section-title-icon gallery-inline-review-icon${pendingReviewCount > 0 ? " has-pending" : ""}" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
              <path d="M8 4.75h8" />
              <path d="M14.75 3h-5.5a1.25 1.25 0 0 0-1.25 1.25v.5h8V4.25A1.25 1.25 0 0 0 14.75 3Z" />
              <path d="M7.5 4.75H6.75A1.75 1.75 0 0 0 5 6.5v11.75C5 19.216 5.784 20 6.75 20h10.5c.966 0 1.75-.784 1.75-1.75V6.5c0-.966-.784-1.75-1.75-1.75H16.5" />
              <path d="M8.5 10.25h5.25" />
              <path d="M8.5 13.25h3.5" />
              <path d="M13.75 15.5 15 16.75l2.75-3" />
              <circle cx="16" cy="15.5" r="3.5"></circle>
            </svg>
          </span>
          <div class="gallery-inline-review-copy">
            <p class="eyebrow">Admin Review</p>
            <div class="gallery-inline-review-title-row">
              <h3>Community Grow Submissions</h3>
              <span class="gallery-inline-review-badge${pendingReviewCount > 0 ? " has-pending" : ""}">&bull; ${pendingReviewLabel}</span>
            </div>
            <p class="muted">Review pending Community Grow snapshots before they become public.</p>
          </div>
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
          const publicDetails = getGallerySnapshotPublicSessionDetails(snapshot);
          const isMockReviewSnapshot = isMockGalleryReviewSnapshot(snapshot);
          const sharedProfileMarkup = renderGallerySharedProfileMarkup(snapshot);
          item.innerHTML = `
            <div class="gallery-review-media">
              ${renderGallerySnapshotMediaMarkup(snapshot, details)}
            </div>
            <div class="gallery-review-body">
              <div class="gallery-card-top">
                <div>
                  <strong>${escapeHtml(snapshot.title)}</strong>
                  <p>${escapeHtml(getGallerySnapshotSubmittedDateTimeLabel(snapshot))}</p>
                </div>
                <div class="gallery-review-status-stack">
                  ${isMockReviewSnapshot ? '<span class="gallery-review-status-badge is-dev-mock">DEV MOCK</span>' : ""}
                  <span class="gallery-review-status-badge is-pending">Pending Review</span>
                  <span class="gallery-card-rate">${Math.max(0, Number(snapshot.successPercent) || 0)}%</span>
                </div>
              </div>
              <div class="gallery-review-meta-grid">
                <span class="gallery-card-chip">${escapeHtml(`ID ${snapshot.id}`)}</span>
                <span class="gallery-card-chip">${escapeHtml(publicDetails.systemLabel)}</span>
                <span class="gallery-card-chip">${escapeHtml(publicDetails.sourceLabel)}</span>
                <span class="gallery-card-chip">${escapeHtml(publicDetails.seedVarietyLabel)}</span>
                <span class="gallery-card-chip">${escapeHtml(publicDetails.seedTypeLabel)}</span>
                <span class="gallery-card-chip">${escapeHtml(`${publicDetails.germinatedLabel} / ${publicDetails.seedCountLabel} seeds`)}</span>
              </div>
              ${sharedProfileMarkup ? `<div class="gallery-review-profile-row">${sharedProfileMarkup}</div>` : ""}
              <div class="gallery-review-actions">
                <button type="button" class="button button-secondary" data-gallery-review-preview="${escapeHtml(snapshot.id)}">View Session / Preview</button>
                <button type="button" class="button button-primary gallery-admin-approve" data-gallery-approve="${escapeHtml(snapshot.id)}">Approve</button>
                <button type="button" class="button button-secondary gallery-admin-reject" data-gallery-reject="${escapeHtml(snapshot.id)}">Reject</button>
              </div>
            </div>
          `;
          pendingList.appendChild(item);
        });
      }
    }
    adminSection.querySelectorAll("[data-gallery-review-preview]").forEach((button) => {
      button.addEventListener("click", () => {
        openGalleryReviewPreview(button.dataset.galleryReviewPreview);
      });
    });
    adminSection.querySelectorAll("[data-gallery-approve]").forEach((button) => {
      button.addEventListener("click", async () => {
        try {
          await approveGalleryReviewSnapshot(button.dataset.galleryApprove);
          renderGallery(button.dataset.galleryApprove);
        } catch (error) {
          window.alert(error.message || "Could not approve this snapshot.");
        }
      });
    });
    adminSection.querySelectorAll("[data-gallery-reject]").forEach((button) => {
      button.addEventListener("click", async () => {
        try {
          await rejectGalleryReviewSnapshot(button.dataset.galleryReject);
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
    const approvedSnapshots = sortVisibleGallerySnapshots(
      gallerySnapshots.filter((snapshot) => getGallerySnapshotDisplayStatus(snapshot) === "approved"),
      appState.gallerySort,
      appState.gallerySortOrder,
    );
    const nonApprovedSnapshots = sortGallerySnapshotsNewestFirst(
      gallerySnapshots.filter((snapshot) => getGallerySnapshotDisplayStatus(snapshot) !== "approved"),
    );
    const targetApprovedIndex = targetSnapshotId
      ? approvedSnapshots.findIndex((snapshot) => snapshot.id === targetSnapshotId)
      : -1;
    if (targetApprovedIndex >= appState.galleryVisibleSnapshotCount) {
      appState.galleryVisibleSnapshotCount = Math.ceil((targetApprovedIndex + 1) / GALLERY_SNAPSHOT_PAGE_SIZE) * GALLERY_SNAPSHOT_PAGE_SIZE;
    }
    const visibleApprovedSnapshots = approvedSnapshots.slice(0, appState.galleryVisibleSnapshotCount);
    const visibleSnapshots = [
      ...visibleApprovedSnapshots,
      ...nonApprovedSnapshots,
    ];
    if (galleryCountState) {
      galleryCountState.textContent = `Showing ${visibleApprovedSnapshots.length.toLocaleString()} of ${approvedSnapshots.length.toLocaleString()} snapshots`;
    }
    if (galleryLoadMoreShell) {
      galleryLoadMoreShell.hidden = visibleApprovedSnapshots.length >= approvedSnapshots.length;
    }
    const visibleMemberIds = [...new Set(visibleSnapshots.map((snapshot) => String(snapshot?.userId || "").trim()).filter(Boolean))];
    const missingMemberProfileIds = visibleMemberIds.filter((memberId) => !appState.publicMemberProfiles[memberId]);
    if (missingMemberProfileIds.length) {
      void loadPublicMemberProfilesByIds(visibleMemberIds, { reason: "gallery:feed-profiles" }).then(() => {
        if (normalizeNavigationHash(window.location.hash || "#home") === "#gallery") {
          renderGallery(targetSnapshotId);
        }
      });
    }
    if (
      appState.user?.id
      && !appState.growNetworkFollowingLoaded
      && !appState.growNetworkFollowingRefreshPromise
      && visibleMemberIds.some((memberId) => !isViewingOwnPublicMemberProfile(memberId))
    ) {
      void refreshGrowNetworkFollowing({ reason: "gallery:feed-follow-state" }).then(() => {
        if (normalizeNavigationHash(window.location.hash || "#home") === "#gallery") {
          renderGallery(targetSnapshotId);
        }
      });
    }
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
          <p>No Community Grow snapshots yet. Publish one from your Share Snapshot section.</p>
        </div>
      `;
      return;
    }

    visibleSnapshots.forEach((snapshot) => {
      const card = document.createElement("article");
      card.className = "gallery-card";
      card.dataset.gallerySnapshotId = snapshot.id;
      card.tabIndex = -1;
      card.innerHTML = renderGallerySnapshotCardMarkup(snapshot);
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

    bindGallerySnapshotCardInteractions(galleryGrid, gallerySnapshots, () => renderGallery(targetSnapshotId));
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
      appState.galleryVisibleSnapshotCount = GALLERY_SNAPSHOT_PAGE_SIZE;
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
      appState.galleryVisibleSnapshotCount = GALLERY_SNAPSHOT_PAGE_SIZE;
      if (gallerySortState) {
        gallerySortState.textContent = `Sorted by: ${getGallerySortLabel(appState.gallerySort)} · ${getGallerySortOrderLabel(appState.gallerySort, appState.gallerySortOrder)}`;
      }
      renderVisibleGallerySnapshots();
    });
  }

  galleryLoadMoreButton?.addEventListener("click", () => {
    appState.galleryVisibleSnapshotCount += GALLERY_SNAPSHOT_PAGE_SIZE;
    renderVisibleGallerySnapshots();
  });

  renderVisibleGallerySnapshots();
}

function renderGalleryReview() {
  document.title = "Community Grow Moderation";
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
      return {
        session,
        percentage,
        sortTime: getSessionSortTime(session),
        durationMs: getSessionCompletedDurationMs(session),
      };
    })
    .filter((item) => item.percentage >= 0)
    .sort((left, right) => comparePerformanceByRateSpeedAndRecency(left, right, {
      getRate: (item) => item.percentage,
      getDurationMs: (item) => item.durationMs,
      getSortTime: (item) => item.sortTime,
      getFallbackLabel: (item) => formatSessionLabel(item.session),
      sortDirection: "desc",
    }));

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
  const snapshotUsageConsentCheckbox = document.querySelector("#snapshot-usage-consent");
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
    usageConsentCheckbox: snapshotUsageConsentCheckbox,
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
  ensureSourceCatalogDatalist();
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
    refreshUnsavedChangesState();
  });
  form.addEventListener("input", () => {
    refreshUnsavedChangesState();
  });
  form.addEventListener("change", () => {
    refreshUnsavedChangesState();
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

  const persistNewSession = async ({ navigateOnSuccess = true } = {}) => {
    if (!syncStoredTimeFromDisplay(form, { normalize: true, forceError: true })) {
      form.elements.timeDisplay?.focus();
      return null;
    }
    if (!validateSessionStatus(sessionStatusField, sessionStatusError)) {
      formMessage.textContent = "";
      sessionStatusTrigger?.focus();
      return null;
    }

    const validation = validatePartitions(form, { showMessage: true });
    if (!validation.isValid) {
      formMessage.textContent = "Please complete all partition fields before saving";
      validation.firstInvalidField?.focus();
      return null;
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
      filterPaperDeducted: false,
      partitions: partitionEntries,
      createdAt: new Date().toISOString(),
    };
    const shouldDeductFilterPaper = shouldAutoDeductFilterPaperForSessionCompletion(session);

    try {
      const canProceedWithoutFilterPapers = await promptFilterPaperPreSessionWarning();
      if (!canProceedWithoutFilterPapers) {
        return null;
      }
      session.sessionImages = await uploadPendingSessionImages(form, session.id, imageSection);
      const savedSession = await createCloudSession(session);
      clearNewSessionNotesDraft();
      savedSession.sessionImages = normalizePersistedSessionImages(savedSession.sessionImages || session.sessionImages || []);
      if (savedSession.sessionImages.length !== (session.sessionImages || []).length && (session.sessionImages || []).length) {
        savedSession.sessionImages = await persistSessionImages(savedSession, session.sessionImages);
      }
      if (shouldDeductFilterPaper) {
        applyFilterPaperDeductionForCompletedSession(savedSession);
      }
      markUnsavedChangesSaved();
      if (navigateOnSuccess) {
        navigateWithUnsavedChangesBypass(`#sessions/${savedSession.id}`);
      }
      return savedSession;
    } catch (error) {
      formMessage.textContent = error.message || "Could not save session.";
      return null;
    }
  };

  registerUnsavedChangesContext({
    pageHash: appState.currentRouteHash,
    getSignature: () => buildNewSessionDraftSignature(form),
    saveFn: persistNewSession,
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    await persistNewSession();
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
        <input type="text" name="source-${index}" class="partition-input" list="${SOURCE_CATALOG_DATALIST_ID}" placeholder="Seedsman (optional)" aria-label="Partition ${partition.id} source">
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

function ensureSourceCatalogDatalist() {
  if (!(document.body instanceof HTMLBodyElement)) {
    return null;
  }

  let datalist = document.querySelector(`#${SOURCE_CATALOG_DATALIST_ID}`);
  if (!(datalist instanceof HTMLDataListElement)) {
    datalist = document.createElement("datalist");
    datalist.id = SOURCE_CATALOG_DATALIST_ID;
    document.body.appendChild(datalist);
  }

  datalist.innerHTML = getSourceCatalogRecords()
    .map((source) => `<option value="${escapeHtml(source.name)}"></option>`)
    .join("");

  return datalist;
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
  applySupplyStatusToSessionEntryButtons(app);
  const activeSessionsSuppliesSidebar = document.querySelector("#active-sessions-supplies-sidebar");
  if (activeSessionsSuppliesSidebar) {
    activeSessionsSuppliesSidebar.innerHTML = renderSessionsFilterPaperCardMarkup();
    bindFilterPaperCardActions(activeSessionsSuppliesSidebar, {
      onSave: () => safeRender(),
    });
  }
  const sessions = sortSessionsNewestFirst(getSessions());
  const hasSessionHistory = sessions.length > 0;
  const activeContainer = document.querySelector("#active-sessions-list");
  const activeSessionsTitle = document.querySelector("#active-sessions-section .section-title-with-icon h3");
  const recentCompletedContainer = document.querySelector("#recent-completed-sessions-list");
  const historyContainer = document.querySelector("#sessions-list");
  const historySortControl = document.querySelector("#session-history-sort");

  const activeSessions = sortActiveSessionsNewestFirst(
    sessions.filter((session) => normalizeSessionStatus(session.sessionStatus) !== "completed"),
  );
  const completedSessions = sessions.filter((session) => normalizeSessionStatus(session.sessionStatus) === "completed");

  if (activeSessionsTitle) {
    activeSessionsTitle.textContent = activeSessions.length === 1
      ? "Active Session Spotlight"
      : "Active Sessions";
  }

  renderSessionCollection(activeContainer, activeSessions, {
    emptyMessage: hasSessionHistory ? "No active sessions." : "No sessions yet.",
    emptyActionLabel: hasSessionHistory ? "Start New Session" : "Create your first session",
    compact: false,
    variant: "active-grid",
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
        <div class="section-heading app-section-header">
          <div class="section-title-with-icon app-section-header-main">
            ${renderAppSectionHeaderIcon("public-session")}
            <div>
              <p class="eyebrow">Public Session</p>
              <h2>Grow session view</h2>
              <p class="muted">${isLoadingSnapshot ? "Loading public grow session..." : "This public grow session is unavailable."}</p>
            </div>
          </div>
          <div class="inline-actions">
            <a class="button button-secondary" href="#gallery">Back to Community Grow</a>
          </div>
        </div>
      </section>
    `;
    return;
  }

  const activeMockScenario = getActiveMockPublicSessionScenario(snapshot);
  const publicDetails = activeMockScenario
    ? getMockPublicSessionDetails(snapshot, activeMockScenario)
    : getGallerySnapshotPublicSessionDetails(snapshot);
  const sharedProfileMarkup = renderGallerySharedProfileMarkup(snapshot);
  const sessionTitle = activeMockScenario ? activeMockScenario.name : snapshot.title;
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
  const mockScenarioSelectorMarkup = activeMockScenario
    ? `
      <div class="inline-actions" aria-label="Mock public session scenarios">
        ${MOCK_PUBLIC_SESSION_SCENARIOS.map((scenario) => `
          <button
            type="button"
            class="button ${scenario.key === activeMockScenario.key ? "button-primary" : "button-secondary"}"
            data-mock-public-session-scenario="${escapeHtml(scenario.key)}"
            aria-pressed="${scenario.key === activeMockScenario.key ? "true" : "false"}"
          >${escapeHtml(scenario.name)}</button>
        `).join("")}
      </div>
    `
    : "";

  app.innerHTML = `
    <section class="card public-session-card">
      <div class="section-heading app-section-header">
        <div class="section-title-with-icon app-section-header-main">
          ${renderAppSectionHeaderIcon("public-session")}
          <div>
            <p class="eyebrow">Public Session</p>
            <h2>${escapeHtml(sessionTitle)}</h2>
            <p class="muted">Read-only grow session view</p>
            ${mockScenarioSelectorMarkup}
          </div>
        </div>
        <div class="inline-actions">
          <button type="button" class="button button-secondary" data-contact-admin-open="true" data-contact-admin-type="Report content">Report / Contact Admin</button>
          <a class="button button-secondary" href="#gallery">Back to Community Grow</a>
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
          ${renderPublicSessionTimelineSection(snapshot)}
        </div>
      </div>
    </section>
  `;

  app.querySelectorAll("[data-mock-public-session-scenario]").forEach((button) => {
    button.addEventListener("click", () => {
      setActiveMockPublicSessionScenario(button.dataset.mockPublicSessionScenario || "");
      renderPublicSessionDetail(snapshotId);
    });
  });
}

function renderPublicMemberProfile(memberId) {
  const normalizedId = String(memberId || "").trim();
  const isLoadingSnapshots = Boolean(appState.galleryRefreshPromise) || (!isMockDataEnabled() && !appState.gallerySnapshotsLoaded);
  const isLoadingProfile = Boolean(appState.publicMemberProfilesRefreshPromises[normalizedId]);
  const followSummary = getPublicMemberFollowSummary(normalizedId);
  const isLoadingFollowSummary = Boolean(appState.publicMemberFollowSummaryRefreshPromises[normalizedId]);
  const followLists = getPublicMemberFollowLists(normalizedId);
  const isOwnProfile = isViewingOwnPublicMemberProfile(normalizedId);
  const canShowFollowButton = Boolean(appState.user?.id) && !isOwnProfile && !appState.publicMemberFollowsTableUnavailable;
  const followState = getPublicMemberFollowState(normalizedId);
  const isFollowing = followState === true;
  const isLoadingFollowState = Boolean(appState.publicMemberFollowStateRefreshPromises[normalizedId]);
  const isFollowPending = isPublicMemberFollowPending(normalizedId);
  const approvedSnapshots = sortGallerySnapshotsNewestFirst(getApprovedPublicSnapshotsForMember(normalizedId));
  const profile = getPublicMemberProfile(normalizedId);

  if (!normalizedId) {
    app.innerHTML = `
      <section class="card public-member-profile-page">
        <div class="section-heading app-section-header">
          <div class="section-title-with-icon app-section-header-main">
            ${renderAppSectionHeaderIcon("members")}
            <div>
              <p class="eyebrow">Community Member</p>
              <h2>Public profile</h2>
              <p class="muted">This public member profile is unavailable.</p>
            </div>
          </div>
          <div class="inline-actions">
            <a class="button button-secondary" href="#gallery">Back to Community Grow</a>
          </div>
        </div>
      </section>
    `;
    return;
  }

  if (!profile && !approvedSnapshots.length) {
    app.innerHTML = `
      <section class="card public-member-profile-page">
        <div class="section-heading app-section-header">
          <div class="section-title-with-icon app-section-header-main">
            ${renderAppSectionHeaderIcon("members")}
            <div>
              <p class="eyebrow">Community Member</p>
              <h2>Public grow profile</h2>
              <p class="muted">${isLoadingSnapshots || isLoadingProfile ? "Loading public member profile..." : "This public member profile is unavailable."}</p>
            </div>
          </div>
          <div class="inline-actions">
            <a class="button button-secondary" href="#gallery">Back to Community Grow</a>
          </div>
        </div>
      </section>
    `;
    return;
  }

  const displayName = profile?.displayName || "Community member";
  const avatarUrl = profile?.avatarUrl || "";
  const joinedLabel = formatPublicMemberJoinedDateLabel(profile?.joinedAt || "");
  const followerCountValue = followSummary
    ? followSummary.followerCount.toLocaleString()
    : (Array.isArray(followLists?.followers) ? followLists.followers.length.toLocaleString() : (isLoadingFollowSummary ? "--" : "0"));
  const followingCountValue = followSummary
    ? followSummary.followingCount.toLocaleString()
    : (Array.isArray(followLists?.following) ? followLists.following.length.toLocaleString() : (isLoadingFollowSummary ? "--" : "0"));
  const averageRate = approvedSnapshots.length
    ? (approvedSnapshots.reduce((sum, snapshot) => sum + getGallerySnapshotSuccessRate(snapshot), 0) / approvedSnapshots.length)
    : null;
  const roundedAverageRate = averageRate === null
    ? ""
    : String(Number((Math.round(averageRate * 10) / 10).toFixed(1))).replace(/\.0$/, "");
  const stats = [
    {
      label: "Followers",
      value: followerCountValue,
      detail: "community members following this grower",
      listType: "followers",
    },
    {
      label: "Following",
      value: followingCountValue,
      detail: "community members this grower follows",
      listType: "following",
    },
    {
      label: "Approved Snapshots",
      value: approvedSnapshots.length.toLocaleString(),
      detail: approvedSnapshots.length === 1 ? "approved public snapshot" : "approved public snapshots",
    },
    averageRate === null
      ? null
      : {
        label: "Avg Germination",
        value: `${roundedAverageRate}%`,
        detail: "based on approved public snapshots",
      },
    joinedLabel
      ? {
        label: "Joined",
        value: joinedLabel,
        detail: "member since",
      }
      : null,
  ].filter(Boolean);

  app.innerHTML = `
    <section class="card public-member-profile-page">
      <div class="public-member-profile-header">
        <div class="public-member-profile-identity">
          <div class="public-member-profile-avatar-shell">
            ${renderPublicMemberAvatarMarkup(displayName, avatarUrl)}
          </div>
          <div class="public-member-profile-copy">
            <p class="eyebrow">Community Member</p>
            <h2>${escapeHtml(displayName)}</h2>
            <p class="muted">Public grow profile</p>
            ${joinedLabel ? `<p class="public-member-profile-joined">Joined ${escapeHtml(joinedLabel)}</p>` : ""}
          </div>
        </div>
        <div class="inline-actions">
          ${canShowFollowButton ? `
            <button
              type="button"
              class="button ${isFollowing ? "button-secondary" : "button-primary"} public-member-follow-button${isFollowing ? " is-following" : ""}"
              data-public-member-follow="${escapeHtml(normalizedId)}"
              ${(isFollowPending || (isLoadingFollowState && followState === null)) ? "disabled" : ""}
              aria-pressed="${isFollowing ? "true" : "false"}"
            >${escapeHtml(isFollowing ? "Following" : "Follow")}</button>
          ` : ""}
          <button type="button" class="button button-secondary" data-contact-admin-open="true" data-contact-admin-type="Report content">Report / Contact Admin</button>
          <a class="button button-secondary" href="#gallery">Back to Community Grow</a>
        </div>
      </div>
      <div class="public-member-profile-stats">
        ${stats.map((stat) => `
          <article class="meta-card public-member-profile-stat-card">
            ${stat.listType ? `
              <button
                type="button"
                class="public-member-profile-stat-button"
                data-public-member-open-list="${escapeHtml(stat.listType)}"
                aria-label="${escapeHtml(`Open ${stat.label.toLowerCase()} list for ${displayName}`)}"
              >
                <strong>${escapeHtml(stat.label)}</strong>
                <p class="public-member-profile-stat-value">${escapeHtml(stat.value)}</p>
                <p class="public-member-profile-stat-detail">${escapeHtml(stat.detail)}</p>
              </button>
            ` : `
              <strong>${escapeHtml(stat.label)}</strong>
              <p class="public-member-profile-stat-value">${escapeHtml(stat.value)}</p>
              <p class="public-member-profile-stat-detail">${escapeHtml(stat.detail)}</p>
            `}
          </article>
        `).join("")}
      </div>
      <section class="public-member-profile-snapshots">
        <div class="section-heading app-section-header">
          <div class="section-title-with-icon app-section-header-main">
            ${renderAppSectionHeaderIcon("snapshots")}
            <div>
              <p class="eyebrow">Shared Sessions</p>
              <h3>Public snapshots</h3>
              <p class="muted">Only approved Community Grow snapshots are shown here.</p>
            </div>
          </div>
        </div>
        ${approvedSnapshots.length
          ? '<div id="public-member-profile-grid" class="gallery-grid"></div>'
          : `
            <div class="empty-state gallery-empty-state public-member-profile-empty-state">
              <p>This member has not shared any public sessions yet.</p>
            </div>
          `}
      </section>
    </section>
  `;

  app.querySelector("[data-public-member-follow]")?.addEventListener("click", async () => {
    try {
      await togglePublicMemberFollow(normalizedId);
    } catch (error) {
      window.alert(error.message || "Could not update this follow right now.");
    }
  });
  app.querySelectorAll("[data-public-member-open-list]").forEach((button) => {
    button.addEventListener("click", () => {
      openPublicMemberConnectionsModal(normalizedId, button.dataset.publicMemberOpenList || "followers");
    });
  });

  const profileGrid = app.querySelector("#public-member-profile-grid");
  if (!profileGrid) {
    return;
  }

  approvedSnapshots.forEach((snapshot) => {
    const card = document.createElement("article");
    card.className = "gallery-card";
    card.dataset.gallerySnapshotId = snapshot.id;
    card.innerHTML = renderGallerySnapshotCardMarkup(snapshot, {
      allowOwnerManagement: false,
      linkSharedProfile: false,
      alwaysShowPublicSessionAction: true,
      showFollowAction: false,
    });
    profileGrid.appendChild(card);
  });

  bindGallerySnapshotCardInteractions(profileGrid, approvedSnapshots, () => renderPublicMemberProfile(normalizedId));
}

function renderGrowNetworkPage() {
  const followingEntries = getGrowNetworkFollowingEntries();
  const useMockNotifications = shouldUseMockGrowNetworkNotifications();
  const useMockPresentation = isMockDataEnabled() || useMockNotifications;
  const activeTab = useMockPresentation ? getGrowNetworkActiveTab() : "following";
  const isLoadingNetworkActivity = !useMockPresentation && (Boolean(appState.growNetworkActivityRefreshPromise) || (!appState.growNetworkActivityLoaded && Boolean(appState.user?.id)));
  const activities = getGrowNetworkActivityEntries();
  const isLoadingFollowing = !useMockPresentation && (Boolean(appState.growNetworkFollowingRefreshPromise) || (!appState.growNetworkFollowingLoaded && Boolean(appState.user?.id)));
  const hasNoFollows = !isLoadingFollowing && !followingEntries.length;
  const mockMembers = useMockPresentation ? buildMockGrowNetworkMemberCards(activeTab) : [];
  const mockNotificationGroups = useMockNotifications
    ? buildMockGrowNetworkNotificationFeedGroups(getMockGrowNetworkNotifications())
    : [];
  const showPreviewStats = useMockPresentation;
  const unseenNotificationCount = useMockNotifications ? getUnseenMockGrowNetworkNotificationCount() : 0;

  const memberPanelCopy = (() => {
    if (!useMockPresentation) {
      return {
        eyebrow: "Following",
        title: "People You Follow",
        subtitle: "Public growers you follow, with quick access to profile stats and shared activity.",
      };
    }

    if (activeTab === "discover") {
      return {
        eyebrow: "Discover",
        title: "Discover Growers",
        subtitle: "Explore performance-focused mock profiles and test follow interactions visually.",
      };
    }

    if (activeTab === "followers") {
      return {
        eyebrow: "Followers",
        title: "Members Following You",
        subtitle: "See who's following you in the Grow Network and how they are performing.",
      };
    }

    return {
      eyebrow: "Following",
      title: "People You Follow",
      subtitle: "Your followed growers, with enough mock depth to test card behavior and spacing.",
    };
  })();

  const notificationPanelCopy = {
    eyebrow: useMockNotifications ? "Notifications" : "Activity",
    title: useMockNotifications ? "Activity Notifications" : "Network Activity",
    subtitle: useMockNotifications
      ? "Real-time activity from your network. Mock alerts stay isolated from production data."
      : "Recent public grow activity from the growers in your network.",
  };
  const currentUserFollowSummary = appState.user?.id ? getPublicMemberFollowSummary(appState.user.id) : null;
  const headerFollowersValue = useMockPresentation
    ? "128"
    : (currentUserFollowSummary ? currentUserFollowSummary.followerCount.toLocaleString() : "0");
  const headerLikesValue = useMockPresentation
    ? "2.4K"
    : "0";
  const headerStats = [
    { label: "Total Followers", value: headerFollowersValue },
    { label: "Total Likes", value: headerLikesValue },
  ];

  const renderGrowNetworkNotificationTypeIcon = (type = "follow") => {
    if (type === "like") {
      return `
        <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
          <path d="m12 20-1.1-1C5.8 14.3 3 11.8 3 8.8 3 6.6 4.8 5 7 5c1.4 0 2.8.7 3.7 1.8C11.6 5.7 13 5 14.4 5 16.6 5 18.4 6.6 18.4 8.8c0 3-2.8 5.5-7.9 10.2Z"></path>
        </svg>
      `;
    }

    if (type === "system") {
      return `
        <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
          <path d="M5 19h14"></path>
          <path d="M6 16.5 11 11.5l3 3L19 9.5"></path>
          <path d="M14.5 9.5H19v4.5"></path>
        </svg>
      `;
    }

    return `
      <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
        <path d="M8.5 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"></path>
        <path d="M5.5 18c.6-2.1 2.2-3.5 4.5-3.5 2.1 0 3.7 1.2 4.4 3.1"></path>
        <path d="M17 8v8"></path>
        <path d="M13 12h8"></path>
      </svg>
    `;
  };

  const renderMockTabsMarkup = () => {
    if (!useMockPresentation) {
      return "";
    }

    const tabs = [
      { key: "following", label: "Following" },
      { key: "discover", label: "Discover Growers" },
      { key: "followers", label: "Followers" },
    ];

    return `
      <div class="grow-network-tabs" role="tablist" aria-label="Grow Network views">
        ${tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return `
            <button
              type="button"
              class="grow-network-tab${isActive ? " is-active" : ""}"
              data-grow-network-tab="${escapeHtml(tab.key)}"
              role="tab"
              aria-selected="${isActive ? "true" : "false"}"
            >${escapeHtml(tab.label)}</button>
          `;
        }).join("")}
      </div>
    `;
  };

  const renderMemberMetaMarkup = (member) => `
    <p class="grow-network-member-caption">${escapeHtml(`${member.averageGermination}% avg germination · ${member.favoriteSeedType} · ${member.favoriteSource || "Grow Network"}`)}</p>
    <div class="grow-network-member-stats" aria-label="${escapeHtml(`${member.displayName} performance`)}">
      <span class="grow-network-member-stat-chip">${escapeHtml(`${member.approvedSnapshots} approved`)}</span>
      <span class="grow-network-member-stat-chip">${escapeHtml(`${member.likes} likes`)}</span>
    </div>
  `;

  const renderMembersFooterMarkup = () => {
    if (useMockPresentation) {
      const footerTab = activeTab === "discover" ? "discover" : (activeTab === "following" ? "following" : "followers");
      const footerLabel = activeTab === "discover"
        ? "Discover More Growers"
        : (activeTab === "following" ? "View All Following" : "View All Followers");
      return `
        <button
          type="button"
          class="grow-network-panel-footer grow-network-panel-footer-button"
          data-grow-network-tab="${escapeHtml(footerTab)}"
        >
          <span>${escapeHtml(footerLabel)}</span>
          <span class="grow-network-panel-footer-arrow" aria-hidden="true">›</span>
        </button>
      `;
    }

    return `
      <a class="grow-network-panel-footer" href="#gallery">
        <span>Browse Community Grow</span>
        <span class="grow-network-panel-footer-arrow" aria-hidden="true">›</span>
      </a>
    `;
  };

  const renderNotificationFooterMarkup = () => `
    <a class="grow-network-panel-footer" href="#network">
      <span>View All Notifications</span>
      <span class="grow-network-panel-footer-arrow" aria-hidden="true">›</span>
    </a>
  `;

  const recentWindowMs = 14 * 24 * 60 * 60 * 1000;
  const nowMs = Date.now();
  const currentUserId = String(appState.user?.id || "").trim();
  const currentUserFollowList = currentUserId ? getPublicMemberFollowList(currentUserId, "followers") : null;
  const approvedPublicSnapshots = getGallerySnapshotsForDisplay().filter((snapshot) => (
    getGallerySnapshotDisplayStatus(snapshot) === "approved"
  ));
  const currentUserPublicSnapshots = approvedPublicSnapshots.filter((snapshot) => (
    String(snapshot?.userId || "").trim() === currentUserId
  ));
  const isWithinRecentWindow = (value = "") => {
    const dateMs = parseCompletedAtValue(value)?.getTime() || 0;
    return dateMs > 0 && (nowMs - dateMs) <= recentWindowMs;
  };
  const formatGrowNetworkStatValue = (value = 0) => {
    const normalizedValue = Math.max(0, Number(value) || 0);
    if (normalizedValue >= 1000) {
      return new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(normalizedValue);
    }
    return normalizedValue.toLocaleString();
  };

  let totalFollowersCount = 0;
  let activeGrowersCount = 0;
  let likesReceivedCount = 0;
  let sessionsTrendingCount = 0;

  if (showPreviewStats) {
    const mockPrimaryProfile = getMockGrowNetworkProfiles().find((profile) => profile.id === "mock-don-cannakan")
      || getMockGrowNetworkProfiles()[0]
      || null;
    const mockActivityEntries = buildMockGrowNetworkActivityEntries();
    const mockRecentNotifications = getMockGrowNetworkNotifications().filter((notification) => isWithinRecentWindow(notification.occurredAt));

    // Temporary preview fallback: until live social aggregates exist for the signed-in account,
    // Grow Network preview mode uses the canonical mock profile and mock notification feed.
    totalFollowersCount = Math.max(0, Number(mockPrimaryProfile?.followerCount) || 0);
    likesReceivedCount = Math.max(0, Number(mockPrimaryProfile?.likes) || 0);
    activeGrowersCount = new Set(mockActivityEntries.map((activity) => activity.memberId).filter(Boolean)).size;
    sessionsTrendingCount = new Set(mockRecentNotifications
      .filter((notification) => (
        ["like", "system"].includes(String(notification?.type || "").trim().toLowerCase())
        && ["session", "snapshot"].includes(String(notification?.targetType || "").trim().toLowerCase())
        && String(notification?.targetId || "").trim()
      ))
      .map((notification) => String(notification.targetId || "").trim())).size;
  } else {
    totalFollowersCount = currentUserFollowSummary
      ? Math.max(0, Number(currentUserFollowSummary.followerCount) || 0)
      : (Array.isArray(currentUserFollowList) ? currentUserFollowList.length : 0);

    const recentActivityEntries = activities.filter((activity) => isWithinRecentWindow(activity.occurredAt));
    const recentApprovedSnapshots = approvedPublicSnapshots.filter((snapshot) => (
      isWithinRecentWindow(snapshot.publishedAt || snapshot.createdAt || "")
    ));
    activeGrowersCount = recentActivityEntries.length
      ? new Set(recentActivityEntries.map((activity) => activity.memberId).filter(Boolean)).size
      : new Set(recentApprovedSnapshots.map((snapshot) => String(snapshot?.userId || "").trim()).filter(Boolean)).size;

    likesReceivedCount = currentUserPublicSnapshots.reduce((sum, snapshot) => (
      sum + Math.max(0, Number(snapshot?.likeCount) || 0)
    ), 0);

    // Temporary engagement proxy: the app does not yet store like timestamps, so "trending"
    // uses recently published public snapshots with at least one like.
    sessionsTrendingCount = currentUserPublicSnapshots.filter((snapshot) => (
      isWithinRecentWindow(snapshot.publishedAt || snapshot.createdAt || "")
      && Math.max(0, Number(snapshot?.likeCount) || 0) > 0
    )).length;
  }

  const growNetworkStats = [
    {
      icon: "members",
      tone: "white",
      value: formatGrowNetworkStatValue(totalFollowersCount),
      label: "Total Followers",
      detail: showPreviewStats ? "preview network reach" : "following your profile",
    },
    {
      icon: "snapshots",
      tone: "green",
      value: formatGrowNetworkStatValue(activeGrowersCount),
      label: "Active Growers",
      detail: showPreviewStats ? "with recent public activity" : "recent public growers",
    },
    {
      icon: "activity",
      tone: "red",
      value: formatGrowNetworkStatValue(likesReceivedCount),
      label: "Likes Received",
      detail: appState.gallerySnapshotLikesTableUnavailable ? "likes fallback active" : "across your public grow",
    },
    {
      icon: "analytics",
      tone: "orange",
      value: formatGrowNetworkStatValue(sessionsTrendingCount),
      label: "Sessions Trending",
      detail: showPreviewStats ? "recent engagement signals" : "recent public sessions with likes",
    },
  ];

  const renderFollowingListMarkup = () => {
    if (isLoadingFollowing) {
      return `
        <div class="empty-state gallery-empty-state grow-network-empty-state grow-network-panel-empty">
          <p>Loading your Grow Network...</p>
        </div>
      `;
    }

    if (appState.growNetworkFollowingError) {
      return `
        <div class="empty-state gallery-empty-state grow-network-empty-state grow-network-panel-empty">
          <p>Follow members to build your Grow Network.</p>
        </div>
      `;
    }

    if (useMockPresentation) {
      if (!mockMembers.length) {
        return `
          <div class="empty-state gallery-empty-state grow-network-empty-state grow-network-panel-empty">
            <p>Follow members to build your Grow Network.</p>
          </div>
        `;
      }

      return `
        <div class="grow-network-member-list grow-network-member-list--mock">
          ${mockMembers.map((member) => `
            <article class="grow-network-member-card grow-network-member-card--mock">
              <a class="grow-network-member-identity" href="${escapeHtml(getPublicMemberProfileRoute(member.id))}">
                <span class="grow-network-member-avatar-shell">
                  ${renderPublicMemberAvatarMarkup(
                    member.displayName,
                    getPublicMemberProfile(member.id)?.avatarUrl || "",
                    "grow-network-member-avatar",
                  )}
                </span>
                <div class="grow-network-member-copy">
                  <strong>${escapeHtml(member.displayName)}</strong>
                  ${renderMemberMetaMarkup(member)}
                </div>
              </a>
              <div class="grow-network-member-actions">
                <a class="button button-secondary" href="${escapeHtml(getPublicMemberProfileRoute(member.id))}">View Profile</a>
                <button
                  type="button"
                  class="button ${member.isFollowing ? "button-secondary" : "button-primary"} grow-network-mock-follow-button grow-network-member-follow-button${member.isFollowing ? " is-following" : ""}"
                  data-grow-network-mock-follow="${escapeHtml(member.id)}"
                  aria-pressed="${member.isFollowing ? "true" : "false"}"
                >${escapeHtml(member.isFollowing ? "Following" : "Follow")}</button>
              </div>
            </article>
          `).join("")}
        </div>
      `;
    }

    if (!followingEntries.length) {
      return `
        <div class="empty-state gallery-empty-state grow-network-empty-state grow-network-panel-empty">
          <p>Follow members to build your Grow Network.</p>
        </div>
      `;
    }

    return `
      <div class="grow-network-member-list">
        ${followingEntries.map((entry) => {
          const memberId = entry.memberId;
          const isMockEntry = Boolean(entry.isMock);
          const profile = getPublicMemberProfile(memberId);
          const displayName = profile?.displayName || "Community member";
          const avatarUrl = profile?.avatarUrl || "";
          const followSummary = appState.publicMemberFollowSummaries[memberId] || null;
          const publicSnapshotCount = getApprovedPublicSnapshotsForMember(memberId).length;
          const publicSnapshotLabel = isLoadingNetworkActivity
            ? "Public snapshot count loading..."
            : (publicSnapshotCount === 1
              ? "1 public snapshot"
              : `${publicSnapshotCount.toLocaleString()} public snapshots`);
          return `
            <article class="grow-network-member-card">
              <a class="grow-network-member-identity" href="${escapeHtml(getPublicMemberProfileRoute(memberId))}">
                <span class="grow-network-member-avatar-shell">
                  ${renderPublicMemberAvatarMarkup(displayName, avatarUrl, "grow-network-member-avatar")}
                </span>
                <div class="grow-network-member-copy">
                  <strong>${escapeHtml(displayName)}</strong>
                  <span class="grow-network-member-caption">${escapeHtml(publicSnapshotLabel)}</span>
                  <div class="grow-network-member-stats">
                    <span class="grow-network-member-stat-chip">${escapeHtml(`${publicSnapshotCount.toLocaleString()} approved`)}</span>
                    ${followSummary ? `<span class="grow-network-member-stat-chip">${escapeHtml(`${followSummary.followerCount.toLocaleString()} followers`)}</span>` : ""}
                    <span class="grow-network-member-stat-chip">Community Grow</span>
                  </div>
                </div>
              </a>
              <div class="grow-network-member-actions">
                <a class="button button-secondary" href="${escapeHtml(getPublicMemberProfileRoute(memberId))}">View Profile</a>
                ${isMockEntry
                  ? ""
                  : `
                    <button
                      type="button"
                      class="button button-secondary grow-network-unfollow-button grow-network-member-follow-button is-following"
                      data-grow-network-unfollow="${escapeHtml(memberId)}"
                      aria-pressed="true"
                      ${isPublicMemberFollowPending(memberId) ? "disabled" : ""}
                    >Following</button>
                  `}
              </div>
            </article>
          `;
        }).join("")}
      </div>
    `;
  };

  const renderActivityFeedMarkup = () => {
    if (hasNoFollows) {
      return `
        <div class="empty-state gallery-empty-state grow-network-empty-state grow-network-panel-empty">
          <p>Follow members to build your Grow Network.</p>
        </div>
      `;
    }

    if (appState.growNetworkActivityError) {
      return `
        <div class="empty-state gallery-empty-state grow-network-empty-state grow-network-panel-empty">
          <p>No public activity from your Grow Network yet.</p>
        </div>
      `;
    }

    if (isLoadingNetworkActivity) {
      return `
        <div class="empty-state gallery-empty-state grow-network-empty-state grow-network-panel-empty">
          <p>Loading public activity from your Grow Network...</p>
        </div>
      `;
    }

    if (!activities.length) {
      return `
        <div class="empty-state gallery-empty-state grow-network-empty-state grow-network-panel-empty">
          <p>No public activity from your Grow Network yet.</p>
        </div>
      `;
    }

    return `
      <div class="grow-network-feed-list">
        ${activities.map((activity) => `
          <article class="grow-network-feed-card">
            <div class="grow-network-feed-card-head">
              <a class="grow-network-feed-member" href="${escapeHtml(activity.profileRoute)}">
                <span class="grow-network-feed-avatar-shell">
                  ${renderPublicMemberAvatarMarkup(activity.displayName, activity.avatarUrl, "grow-network-feed-avatar")}
                </span>
                <div class="grow-network-feed-member-copy">
                  <strong>${escapeHtml(activity.displayName)}</strong>
                  <span>${escapeHtml(activity.typeLabel)}</span>
                </div>
              </a>
              <span class="grow-network-feed-time">${escapeHtml(getGallerySnapshotSubmittedDateTimeLabel({ publishedAt: activity.occurredAt, createdAt: activity.occurredAt }))}</span>
            </div>
            <div class="grow-network-feed-body">
              <strong class="grow-network-feed-title">${escapeHtml(activity.title)}</strong>
              ${activity.summary ? `<p class="muted">${escapeHtml(activity.summary)}</p>` : ""}
              <div class="grow-network-feed-meta">
                <span class="gallery-card-chip">${escapeHtml(activity.typeLabel)}</span>
                <span class="gallery-card-chip">${escapeHtml(`${activity.germinationRateLabel} germination`)}</span>
                ${activity.sourceLabel && activity.sourceLabel !== "Unknown source" ? `<span class="gallery-card-chip">${escapeHtml(activity.sourceLabel)}</span>` : ""}
                ${activity.typeMeta ? `<span class="gallery-card-chip">${escapeHtml(activity.typeMeta)}</span>` : ""}
              </div>
            </div>
            <div class="grow-network-feed-actions">
              <a class="button button-secondary" href="${escapeHtml(activity.profileRoute)}">Profile</a>
              <a class="button button-secondary" href="${escapeHtml(activity.sessionRoute)}">View Public Session</a>
            </div>
          </article>
        `).join("")}
      </div>
    `;
  };

  const renderMockNotificationFeedMarkup = () => {
    if (!mockNotificationGroups.length) {
      return `
        <div class="empty-state gallery-empty-state grow-network-empty-state grow-network-notification-empty-state grow-network-panel-empty">
          <strong>No activity yet</strong>
          <p>Follow growers and share sessions to start seeing activity</p>
        </div>
      `;
    }

    return `
      <div class="grow-network-notification-list" aria-label="Mock Grow Network notifications">
        ${mockNotificationGroups.map((notificationGroup) => `
          <${notificationGroup.isGrouped ? "button" : "article"}
            ${notificationGroup.isGrouped ? 'type="button"' : ""}
            class="grow-network-notification-card${notificationGroup.isUnseen ? " is-unseen" : ""}${notificationGroup.isGrouped ? " is-interactive grow-network-notification-button" : ""}"
            ${notificationGroup.isGrouped ? `data-grow-network-notification-group="${escapeHtml(notificationGroup.id)}"` : ""}
          >
            <span class="grow-network-notification-avatar-shell">
              <span class="${escapeHtml(notificationGroup.avatarMembers.length > 1 || notificationGroup.overflowAvatarCount ? "grow-network-notification-avatar-stack" : "grow-network-notification-avatar-stack is-single")}">
                ${notificationGroup.avatarMembers.map((member) => `
                  <span class="grow-network-notification-avatar-stack-item">
                    ${renderPublicMemberAvatarMarkup(member.displayName, member.avatarUrl, "grow-network-notification-avatar")}
                  </span>
                `).join("")}
                ${notificationGroup.overflowAvatarCount ? `
                  <span class="grow-network-notification-avatar-stack-item grow-network-notification-avatar-stack-count" aria-hidden="true">
                    <span class="grow-network-notification-avatar grow-network-notification-avatar-count">+${escapeHtml(String(notificationGroup.overflowAvatarCount))}</span>
                  </span>
                ` : ""}
              </span>
            </span>
            <div class="grow-network-notification-main">
              <div class="grow-network-notification-copy">
                <p class="grow-network-notification-text">
                  <strong>${escapeHtml(notificationGroup.actorText)}</strong>
                  <span>${escapeHtml(notificationGroup.actionText)}</span>
                </p>
                ${notificationGroup.targetName ? `<p class="grow-network-notification-target">${escapeHtml(notificationGroup.targetName)}</p>` : ""}
              </div>
              <div class="grow-network-notification-meta">
                <span class="grow-network-notification-time">${escapeHtml(notificationGroup.timeLabel)}</span>
                <span class="grow-network-notification-type-icon is-${escapeHtml(notificationGroup.type)}" aria-hidden="true">
                  ${renderGrowNetworkNotificationTypeIcon(notificationGroup.type)}
                </span>
              </div>
            </div>
          </${notificationGroup.isGrouped ? "button" : "article"}>
        `).join("")}
      </div>
    `;
  };

  app.innerHTML = `
    <section class="card grow-network-page">
      <div class="grow-network-page-glow" aria-hidden="true"></div>
      <div class="grow-network-page-heading">
        <div class="grow-network-hero">
          <div class="grow-network-hero-badge" aria-hidden="true">
            ${renderAppSectionHeaderIcon("community")}
          </div>
          <div class="grow-network-hero-copy">
            <p class="eyebrow">COMMUNITY</p>
            <h2>Grow Network</h2>
            <p class="muted">Follow members and see public grow activity from your network.</p>
          </div>
        </div>
        <div class="grow-network-header-stats" aria-label="Grow Network quick stats">
          ${headerStats.map((stat) => `
            <article class="grow-network-header-stat">
              <strong>${escapeHtml(stat.value)}</strong>
              <span>${escapeHtml(stat.label)}</span>
            </article>
          `).join("")}
        </div>
        <a class="button button-secondary grow-network-hero-button" href="#gallery">Browse Community Grow</a>
      </div>
      <div class="grow-network-layout">
        <section class="grow-network-panel grow-network-panel--members grow-network-section">
          ${renderMockTabsMarkup()}
          <div class="grow-network-section-heading">
            <div class="grow-network-panel-header">
              <div class="grow-network-panel-icon" aria-hidden="true">
                ${renderAppSectionHeaderIcon("following")}
              </div>
              <div>
                <p class="eyebrow">${escapeHtml(memberPanelCopy.eyebrow)}</p>
                <h3>${escapeHtml(memberPanelCopy.title)}</h3>
                <p class="muted grow-network-section-subtitle">${escapeHtml(memberPanelCopy.subtitle)}</p>
              </div>
            </div>
          </div>
          ${renderFollowingListMarkup()}
          ${renderMembersFooterMarkup()}
        </section>
        <section class="grow-network-panel grow-network-panel--notifications grow-network-section">
          <div class="grow-network-section-heading grow-network-section-heading--featured">
            <div class="grow-network-panel-header">
              <div class="grow-network-panel-icon" aria-hidden="true">
                ${renderAppSectionHeaderIcon("activity")}
              </div>
              <div>
                <p class="eyebrow">${escapeHtml(notificationPanelCopy.eyebrow)}</p>
                <h3>${escapeHtml(notificationPanelCopy.title)}</h3>
                <p class="muted grow-network-section-subtitle">${escapeHtml(notificationPanelCopy.subtitle)}</p>
              </div>
            </div>
            ${useMockNotifications ? `
              <button
                type="button"
                class="button button-secondary grow-network-mark-read-button"
                data-grow-network-mark-all-read="true"
                ${unseenNotificationCount ? "" : "disabled"}
              >
                <span aria-hidden="true">✓</span>
                <span>Mark all as read</span>
              </button>
            ` : ""}
          </div>
          ${useMockNotifications ? renderMockNotificationFeedMarkup() : renderActivityFeedMarkup()}
          ${renderNotificationFooterMarkup()}
        </section>
      </div>
      <div class="grow-network-stats-strip" aria-label="Grow Network highlights">
        ${growNetworkStats.map((stat) => `
          <article class="grow-network-stat-card">
            <div class="grow-network-stat-icon icon-${escapeHtml(stat.tone || "green")}" aria-hidden="true">
              ${renderAppSectionHeaderIcon(stat.icon)}
            </div>
            <div class="grow-network-stat-copy">
              <strong>${escapeHtml(stat.value)}</strong>
              <span>${escapeHtml(stat.label)}</span>
              <p>${escapeHtml(stat.detail)}</p>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;

  app.querySelectorAll("[data-grow-network-unfollow]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await togglePublicMemberFollow(button.dataset.growNetworkUnfollow || "");
      } catch (error) {
        window.alert(error.message || "Could not update this follow right now.");
      }
    });
  });

  app.querySelectorAll("[data-grow-network-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      setGrowNetworkActiveTab(button.dataset.growNetworkTab || "following");
      renderGrowNetworkPage();
    });
  });

  app.querySelectorAll("[data-grow-network-mock-follow]").forEach((button) => {
    button.addEventListener("click", () => {
      toggleMockGrowNetworkFollowState(button.dataset.growNetworkMockFollow || "");
      renderGrowNetworkPage();
    });
  });

  app.querySelector("[data-grow-network-mark-all-read='true']")?.addEventListener("click", () => {
    markAllMockGrowNetworkNotificationsSeen();
    renderGrowNetworkPage();
  });

  app.querySelectorAll("[data-grow-network-notification-group]").forEach((button) => {
    button.addEventListener("click", () => {
      const notificationGroup = mockNotificationGroups.find((entry) => entry.id === (button.dataset.growNetworkNotificationGroup || ""));
      if (notificationGroup) {
        openGrowNetworkNotificationGroupModal(notificationGroup);
      }
    });
  });

  updateNavState();
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
  const detailSuppliesAnchor = document.querySelector("#detail-supplies-anchor");
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
  const detailSnapshotUsageConsentCheckbox = document.querySelector("#detail-snapshot-usage-consent");
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
    usageConsentCheckbox: detailSnapshotUsageConsentCheckbox,
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
  ensureSourceCatalogDatalist();
  initializeCustomSelects(partitions);
  bindPartitionRowVisualState(partitions);
  applySessionStatusLayout(detailChartShell, detailChartHeader, partitions, detailStatusField.value);
  syncPartitionButtonStates(partitions, detailStatusField.value);
  applyStageEditingMode(app, detailStatusField.value);
  const renderDetailSuppliesCard = () => {
    if (!detailSuppliesAnchor) {
      return;
    }

    const isActiveSession = normalizeSessionStatus(detailStatusField.value) !== "completed";
    detailSuppliesAnchor.innerHTML = isActiveSession ? renderActiveSessionFilterPaperCardMarkup() : "";
    if (!isActiveSession) {
      return;
    }

    bindFilterPaperCardActions(detailSuppliesAnchor, {
      onSave: renderDetailSuppliesCard,
    });
  };
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
    renderDetailSuppliesCard();
  };
  const refreshDetailUnsavedChanges = () => {
    refreshUnsavedChangesState();
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
        refreshDetailUnsavedChanges();
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
        refreshDetailUnsavedChanges();
      });
    });
    validatePartitionRow(row);
  });
  refreshDetailDerivedViews();
  bindSessionTimelineDebugTools(detailLifecycleSection, (action) => {
    const previousStatus = session.sessionStatus || "";
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
    const shouldDeductFilterPaper = shouldAutoDeductFilterPaperForSessionCompletion(session, previousStatus);
    void saveSessionUpdate(session).then((savedSession) => {
      if (savedSession) {
        if (shouldDeductFilterPaper) {
          applyFilterPaperDeductionForCompletedSession(savedSession);
          Object.assign(session, savedSession);
        }
        markUnsavedChangesSaved();
      }
    });
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

    const shouldDeductFilterPaper = shouldAutoDeductFilterPaperForSessionCompletion(session, previousStatus);
    const savedSession = await saveSessionUpdate(session);
    if (savedSession) {
      if (shouldDeductFilterPaper) {
        applyFilterPaperDeductionForCompletedSession(savedSession);
        Object.assign(session, savedSession);
      }
      markUnsavedChangesSaved();
    }
  });

  const persistDetailSession = async () => {
    syncSessionPartitionsFromContainer(session, partitions);
    captureFirstPlantedEventForSession(session);
    session.sessionNotes = detailNotesField.value.trim();
    detailSaveMessage.textContent = "";
    refreshDetailDerivedViews();
    const savedSession = await saveSessionUpdate(session);
    detailSaveMessage.textContent = savedSession ? "Session saved." : "Could not save session.";
    if (savedSession) {
      markUnsavedChangesSaved();
    }
    return savedSession;
  };

  registerUnsavedChangesContext({
    pageHash: appState.currentRouteHash,
    getSignature: () => buildSessionDetailDraftSignature(session, partitions, detailStatusField, detailNotesField),
    saveFn: persistDetailSession,
  });

  detailSaveShortcutButton?.addEventListener("click", persistDetailSession);
  detailSaveButton?.addEventListener("click", persistDetailSession);

  const persistDetailNote = async () => {
    try {
      const savedSession = await updateCloudSessionNotes(session.id, detailNotesField.value);
      Object.assign(session, savedSession);
      if (detailNotesField) {
        detailNotesField.value = session.sessionNotes || "";
      }
      patchUnsavedChangesBaseline((baseline, current) => ({
        ...baseline,
        sessionNotes: current.sessionNotes,
      }));
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
    refreshDetailUnsavedChanges();
  });

  document.querySelector("#delete-session").addEventListener("click", async () => {
    const confirmed = window.confirm("Delete this session?");
    if (!confirmed) {
      return;
    }

    try {
      await deleteCloudSession(sessionId);
      navigateWithUnsavedChangesBypass("#sessions");
    } catch (error) {
      window.alert(error.message || "Could not delete session.");
    }
  });
}

function renderSessionCollection(container, sessions, options) {
  container.innerHTML = "";
  container.classList.toggle("compact-list", options.compact);
  container.classList.toggle("session-history-grid", options.variant === "history-grid");
  container.classList.toggle("active-sessions-grid", options.variant === "active-grid");
  if (options.variant === "active-grid") {
    container.dataset.sessionCount = String(sessions.length);
  } else {
    delete container.dataset.sessionCount;
  }

  if (!sessions.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = `
      <p>${options.emptyMessage}</p>
      <a class="button button-primary" href="#new" data-session-entry="true">${options.emptyActionLabel}</a>
    `;
    container.appendChild(empty);
    applySupplyStatusToSessionEntryButtons(empty);
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
        return comparePerformanceByRateSpeedAndRecency(left, right, {
          getRate: getSessionSuccessRate,
          getDurationMs: getSessionCompletedDurationMs,
          getSortTime: getSessionSortTime,
          getFallbackLabel: formatSessionLabel,
          sortDirection: "desc",
        });
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

function sortActiveSessionsNewestFirst(sessions) {
  return [...sessions].sort((left, right) => {
    const leftTime = getActiveSessionSortTime(left);
    const rightTime = getActiveSessionSortTime(right);
    return rightTime - leftTime;
  });
}

function getActiveSessionSortTime(session) {
  const updatedAt = parseCompletedAtValue(
    session?.lastUpdatedAt
    || session?.last_updated_at
    || session?.updatedAt
    || session?.updated_at,
  );
  if (updatedAt) {
    return updatedAt.getTime();
  }

  const createdAt = parseCompletedAtValue(session?.createdAt || session?.created_at);
  if (createdAt) {
    return createdAt.getTime();
  }

  const startedAt = parseSessionStartDateTime(session?.date, session?.time);
  return startedAt ? startedAt.getTime() : 0;
}

function getSessionSortTime(session) {
  const createdAt = parseCompletedAtValue(session?.createdAt || session?.created_at);
  if (createdAt) {
    return createdAt.getTime();
  }

  const startedAt = parseSessionStartDateTime(session?.date, session?.time);
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
      container.innerHTML = markup || buildSystemLayoutUnavailableMarkup(systemType);
      attachSystemLayoutReady(container);
    }
    return;
  }

  if (container.dataset.pendingSystem === systemType) {
    container.innerHTML = buildSystemLayoutUnavailableMarkup(systemType);
  }
}

async function buildSystemLayoutImage(systemType) {
  const svgMarkup = await getInlineSvgMarkup(systemType);
  if (!svgMarkup) {
    return "";
  }

  return `
    <div class="system-layout-image system-layout-image-${systemType.toLowerCase()}" data-system-layout="${systemType}">
      ${svgMarkup}
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

function buildSystemLayoutUnavailableMarkup(systemType) {
  return `
    <div class="layout-reference-copy">
      <p>Layout image unavailable</p>
    </div>
    <div class="layout-placeholder" aria-label="${systemType || "System"} layout image unavailable">
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
    if (!response.ok) {
      return "";
    }

    const svgMarkup = normalizeInlineSvgMarkup(await response.text());
    if (!/^<svg[\s>]/i.test(svgMarkup)) {
      return "";
    }

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

  summaryElement.innerHTML = renderSessionLifecycleTimelineMarkup(state);
  sectionElement.hidden = false;
}

function renderSessionLifecycleTimelineMarkup(state) {
  const events = [
    {
      label: "SOAKING",
      timestamp: state.startedAt,
      displayLabel: state.startedDisplayLabel || "",
      tone: "soaking",
      complete: state.startedComplete !== undefined ? state.startedComplete : Boolean(state.startedAt),
    },
    {
      label: "GERMINATION STARTED",
      timestamp: state.germinationStartedAt,
      displayLabel: state.germinationStartedDisplayLabel || "",
      tone: "germination",
      complete: state.germinationStartedComplete !== undefined ? state.germinationStartedComplete : Boolean(state.germinationStartedAt),
    },
    {
      label: "FIRST GERMINATED",
      timestamp: state.firstPlantedAt,
      displayLabel: state.firstPlantedDisplayLabel || "",
      tone: "green",
      complete: state.firstPlantedComplete !== undefined ? state.firstPlantedComplete : Boolean(state.firstPlantedAt),
    },
    {
      label: "COMPLETED",
      timestamp: state.completedAt,
      displayLabel: state.completedDisplayLabel || "",
      tone: "completed",
      complete: state.completedComplete !== undefined ? state.completedComplete : Boolean(state.completedAt),
    },
  ];

  return `
    <div class="lifecycle-bar">
      ${events.map((event) => `
        <span class="lifecycle-segment lifecycle-${event.tone} ${event.complete ? "is-complete" : ""}"></span>
      `).join("")}
    </div>
    <div class="lifecycle-events">
      ${events.map((event) => `
        <article class="lifecycle-event lifecycle-event-${event.tone} ${event.complete ? "is-complete" : ""}">
          <strong>${event.label}</strong>
          <p>${event.displayLabel || (event.timestamp ? formatTimingDateTime(event.timestamp) : "Not recorded yet")}</p>
        </article>
        `).join("")}
      </div>
  `;
}

function formatPublicTimelineElapsedDuration(startedAt, endedAt) {
  if (!(startedAt instanceof Date) || Number.isNaN(startedAt.getTime())) {
    return "";
  }

  if (!(endedAt instanceof Date) || Number.isNaN(endedAt.getTime())) {
    return "";
  }

  const totalMinutes = Math.max(0, Math.floor((endedAt.getTime() - startedAt.getTime()) / 60000));
  return formatElapsedMinutesShorthand(totalMinutes);
}

function renderPublicSessionLifecycleTimelineMarkup(state) {
  const soakingDuration = formatPublicTimelineElapsedDuration(state.startedAt, state.germinationStartedAt);
  const germinationDuration = formatPublicTimelineElapsedDuration(state.germinationStartedAt, state.firstPlantedAt);
  const completedDuration = formatPublicTimelineElapsedDuration(state.startedAt, state.completedAt);

  const events = [
    {
      label: "SOAKING",
      displayLabel: soakingDuration || "Duration unavailable",
      tone: "soaking",
      complete: Boolean(state.startedAt && state.germinationStartedAt),
    },
    {
      label: "GERMINATION",
      displayLabel: state.germinationStartedAt
        ? (germinationDuration || "Duration unavailable")
        : "Not started",
      tone: "germination",
      complete: Boolean(state.germinationStartedAt),
    },
    {
      label: "FIRST GERMINATED",
      displayLabel: soakingDuration && germinationDuration
        ? `${soakingDuration} + ${germinationDuration}`
        : "Duration unavailable",
      tone: "green",
      complete: Boolean(state.firstPlantedAt),
    },
    {
      label: "COMPLETED",
      displayLabel: completedDuration || "Duration unavailable",
      tone: "completed",
      complete: Boolean(state.completedAt),
    },
  ];

  return `
    <div class="lifecycle-bar">
      ${events.map((event) => `
        <span class="lifecycle-segment lifecycle-${event.tone} ${event.complete ? "is-complete" : ""}"></span>
      `).join("")}
    </div>
    <div class="lifecycle-events">
      ${events.map((event) => `
        <article class="lifecycle-event lifecycle-event-${event.tone} ${event.complete ? "is-complete" : ""}">
          <strong>${event.label}</strong>
          <p>${escapeHtml(event.displayLabel)}</p>
        </article>
      `).join("")}
    </div>
  `;
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

function buildMockPublicSessionLifecycleState(scenario = null) {
  const activeScenario = scenario || MOCK_PUBLIC_SESSION_SCENARIOS[0];
  return {
    showEmptyTimeline: false,
    startedAt: parseCompletedAtValue(activeScenario.timeline.startedAt),
    germinationStartedAt: parseCompletedAtValue(activeScenario.timeline.germinationStartedAt),
    firstPlantedAt: parseCompletedAtValue(activeScenario.timeline.firstPlantedAt),
    completedAt: parseCompletedAtValue(activeScenario.timeline.completedAt),
  };
}

function buildPublicSessionLifecycleState(snapshot) {
  const activeMockScenario = getActiveMockPublicSessionScenario(snapshot);
  if (activeMockScenario) {
    return buildMockPublicSessionLifecycleState(activeMockScenario);
  }

  const linkedSession = getGallerySnapshotSession(snapshot);
  if (linkedSession) {
    return buildSessionLifecycleState(linkedSession);
  }

  const sessionDate = String(snapshot?.sessionDate || "").trim();
  const sessionTime = String(snapshot?.sessionTime || snapshot?.session_time || "").trim();
  const startedAt = sessionDate && sessionTime ? parseSessionStartDateTime(sessionDate, sessionTime) : null;
  const germinationStartedAt = parseCompletedAtValue(snapshot?.germinationStartedAt || snapshot?.germination_started_at || "");
  const firstPlantedAt = parseCompletedAtValue(snapshot?.firstPlantedAt || snapshot?.first_planted_at || "");
  const completedAt = parseCompletedAtValue(snapshot?.completedAt || snapshot?.completed_at || "");
  const startedDisplayLabel = !startedAt && sessionDate ? getGallerySnapshotSubmittedDateLabel(snapshot) : "";
  const hasTimelineData = Boolean(
    startedAt
    || startedDisplayLabel
    || germinationStartedAt
    || firstPlantedAt
    || completedAt
  );

  if (!hasTimelineData) {
    return null;
  }

  return {
    showEmptyTimeline: false,
    startedAt,
    startedDisplayLabel,
    startedComplete: Boolean(startedAt || startedDisplayLabel),
    germinationStartedAt,
    firstPlantedAt,
    completedAt,
  };
}

function renderPublicSessionTimelineSection(snapshot) {
  const lifecycleState = buildPublicSessionLifecycleState(snapshot);
  const timelineMarkup = lifecycleState
    ? renderPublicSessionLifecycleTimelineMarkup(lifecycleState)
    : '<p class="public-session-timeline-empty">Timeline not shared.</p>';

  return `
    <section class="session-lifecycle-section public-session-timeline-section" aria-labelledby="public-session-progress-title">
      <div class="progress-chart-heading">
        <p class="eyebrow">Timeline</p>
        <h4 id="public-session-progress-title" class="section-title-with-icon">
          <svg class="section-title-icon" viewBox="0 0 24 24" focusable="false" aria-hidden="true">
            <path d="M5 12h3l2.2-4 3.6 8 2.2-4H19"></path>
            <path d="M5 6v12"></path>
          </svg>
          <span>Session Progress</span>
        </h4>
      </div>
      <div class="session-lifecycle-summary">
        ${timelineMarkup}
      </div>
    </section>
  `;
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

  const totalMinutes = Math.max(0, Math.floor((Date.now() - startedAt.getTime()) / 60000));
  return formatElapsedMinutesShorthand(totalMinutes);
}

function formatDurationBetween(startedAt, endedAt) {
  if (!(startedAt instanceof Date) || Number.isNaN(startedAt.getTime())) {
    return "";
  }

  if (!(endedAt instanceof Date) || Number.isNaN(endedAt.getTime())) {
    return "";
  }

  const totalMinutes = Math.max(0, Math.floor((endedAt.getTime() - startedAt.getTime()) / 60000));
  return formatElapsedMinutesShorthand(totalMinutes);
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

function normalizeNavigationHash(hash) {
  const raw = String(hash || "").trim();
  if (!raw || raw === "#") {
    return "#home";
  }

  if (isSupabaseAuthFragmentHash(raw)) {
    return "#home";
  }

  return raw.startsWith("#") ? raw : `#${raw.replace(/^#+/, "")}`;
}

function buildPartitionDraftValuesFromContainer(container) {
  if (!container) {
    return [];
  }

  return [...container.querySelectorAll(".partition-row")].map((row, index) => ({
    id: Number(row.dataset.partitionId) || index + 1,
    source: String(row.querySelector('input[name^="source-"]')?.value || "").trim(),
    seedVariety: String(row.querySelector('input[name^="seedVariety-"]')?.value || "").trim(),
    seedType: String(row.querySelector('select[name^="seedType-"]')?.value || "").trim(),
    feminized: String(row.querySelector('select[name^="feminized-"]')?.value || "").trim(),
    seedCount: String(row.querySelector('input[name^="seedCount-"]')?.value || "").trim(),
    plantedCount: String(row.querySelector('input[name="plantedCount"]')?.value || "").trim(),
  }));
}

function buildNewSessionDraftSignature(form) {
  if (!form) {
    return "";
  }

  return JSON.stringify({
    sessionName: String(form.elements.sessionName?.value || "").trim(),
    date: String(form.elements.date?.value || "").trim(),
    time: String(form.elements.time?.value || "").trim(),
    timeDisplay: String(form.elements.timeDisplay?.value || "").trim(),
    systemType: String(form.elements.systemType?.value || "").trim(),
    unitId: String(form.elements.unitId?.value || "").trim(),
    sessionStatus: String(form.elements.sessionStatus?.value || "").trim(),
    sessionNotes: String(form.elements.sessionNotes?.value || "").trim(),
    germinationStartedAt: String(form.dataset.germinationStartedAt || "").trim(),
    firstPlantedAt: String(form.dataset.firstPlantedAt || "").trim(),
    completedAt: String(form.dataset.completedAt || "").trim(),
    partitions: buildPartitionDraftValuesFromContainer(form.querySelector("#partition-fields")),
  });
}

function buildSessionDetailDraftSignature(session, partitions, statusField, notesField) {
  return JSON.stringify({
    sessionId: String(session?.id || "").trim(),
    sessionStatus: String(statusField?.value || session?.sessionStatus || "").trim(),
    sessionNotes: String(notesField?.value || session?.sessionNotes || "").trim(),
    germinationStartedAt: String(session?.germinationStartedAt || "").trim(),
    firstPlantedAt: String(session?.firstPlantedAt || "").trim(),
    completedAt: String(session?.completedAt || "").trim(),
    partitions: buildPartitionDraftValuesFromContainer(partitions),
  });
}

function clearUnsavedChangesContext() {
  appState.unsavedChanges.active = false;
  appState.unsavedChanges.hasUnsavedChanges = false;
  appState.unsavedChanges.pageHash = "";
  appState.unsavedChanges.baselineSignature = "";
  appState.unsavedChanges.getSignature = null;
  appState.unsavedChanges.saveFn = null;
  appState.unsavedChanges.promptOpen = false;
}

function registerUnsavedChangesContext({ pageHash, getSignature, saveFn }) {
  if (typeof getSignature !== "function" || typeof saveFn !== "function") {
    clearUnsavedChangesContext();
    return;
  }

  appState.unsavedChanges.active = true;
  appState.unsavedChanges.pageHash = normalizeNavigationHash(pageHash || window.location.hash || "#home");
  appState.unsavedChanges.getSignature = getSignature;
  appState.unsavedChanges.saveFn = saveFn;
  appState.unsavedChanges.baselineSignature = getSignature();
  appState.unsavedChanges.hasUnsavedChanges = false;
}

function refreshUnsavedChangesState() {
  if (!appState.unsavedChanges.active || typeof appState.unsavedChanges.getSignature !== "function") {
    appState.unsavedChanges.hasUnsavedChanges = false;
    return false;
  }

  const currentSignature = appState.unsavedChanges.getSignature();
  appState.unsavedChanges.hasUnsavedChanges = currentSignature !== appState.unsavedChanges.baselineSignature;
  return appState.unsavedChanges.hasUnsavedChanges;
}

function markUnsavedChangesSaved() {
  if (!appState.unsavedChanges.active || typeof appState.unsavedChanges.getSignature !== "function") {
    appState.unsavedChanges.hasUnsavedChanges = false;
    return;
  }

  appState.unsavedChanges.baselineSignature = appState.unsavedChanges.getSignature();
  appState.unsavedChanges.hasUnsavedChanges = false;
}

function patchUnsavedChangesBaseline(mutator) {
  if (!appState.unsavedChanges.active || typeof appState.unsavedChanges.getSignature !== "function") {
    return;
  }

  try {
    const baseline = JSON.parse(appState.unsavedChanges.baselineSignature || "{}");
    const current = JSON.parse(appState.unsavedChanges.getSignature() || "{}");
    const nextBaseline = mutator({ ...baseline }, current) || baseline;
    appState.unsavedChanges.baselineSignature = JSON.stringify(nextBaseline);
    refreshUnsavedChangesState();
  } catch {
    markUnsavedChangesSaved();
  }
}

function hasPendingUnsavedSessionChanges() {
  return refreshUnsavedChangesState();
}

function shouldBlockNavigationForUnsavedChanges(nextHash = window.location.hash || "#home") {
  if (!appState.unsavedChanges.active || appState.unsavedChanges.promptOpen) {
    return false;
  }

  const currentHash = normalizeNavigationHash(appState.unsavedChanges.pageHash || appState.currentRouteHash || "#home");
  const targetHash = normalizeNavigationHash(nextHash);
  if (currentHash === targetHash) {
    return false;
  }

  return hasPendingUnsavedSessionChanges();
}

function navigateWithUnsavedChangesBypass(nextHash) {
  const targetHash = normalizeNavigationHash(nextHash);
  appState.unsavedChanges.ignoreNextHashChange = true;
  clearUnsavedChangesContext();
  if ((window.location.hash || "#home") === targetHash) {
    safeRender();
    return;
  }
  window.location.hash = targetHash;
}

function ensureUnsavedChangesDialog() {
  let modal = document.querySelector("#unsaved-changes-dialog");
  if (modal instanceof HTMLDialogElement) {
    return modal;
  }

  modal = document.createElement("dialog");
  modal.id = "unsaved-changes-dialog";
  modal.className = "snapshot-modal unsaved-changes-dialog";
  modal.innerHTML = `
    <form method="dialog" class="snapshot-modal-card profile-modal-card unsaved-changes-dialog-card">
      <div class="snapshot-modal-copy">
        <p class="eyebrow">Unsaved Changes</p>
        <h3>You have unsaved changes. Save before leaving?</h3>
        <p class="muted">You have unsaved changes. Are you sure you want to leave?</p>
      </div>
      <p id="unsaved-changes-dialog-message" class="form-message" role="alert" aria-live="polite"></p>
      <div class="snapshot-modal-actions">
        <button type="button" class="button button-primary" data-unsaved-action="save">Save and continue</button>
        <button type="button" class="button button-danger" data-unsaved-action="leave">Leave without saving</button>
        <button type="button" class="button button-secondary" data-unsaved-action="cancel">Cancel</button>
      </div>
    </form>
  `;
  document.body.appendChild(modal);
  return modal;
}

function promptForUnsavedChangesNavigation(nextHash) {
  const targetHash = normalizeNavigationHash(nextHash);
  if (appState.unsavedChanges.promptOpen || !appState.unsavedChanges.active) {
    return;
  }

  const modal = ensureUnsavedChangesDialog();
  const message = modal.querySelector("#unsaved-changes-dialog-message");
  const saveButton = modal.querySelector('[data-unsaved-action="save"]');
  const leaveButton = modal.querySelector('[data-unsaved-action="leave"]');
  const cancelButton = modal.querySelector('[data-unsaved-action="cancel"]');
  if (!(saveButton instanceof HTMLButtonElement) || !(leaveButton instanceof HTMLButtonElement) || !(cancelButton instanceof HTMLButtonElement)) {
    return;
  }

  appState.unsavedChanges.promptOpen = true;
  if (message) {
    message.textContent = "";
    message.classList.remove("is-error");
  }

  const cleanup = () => {
    saveButton.disabled = false;
    leaveButton.disabled = false;
    cancelButton.disabled = false;
    appState.unsavedChanges.promptOpen = false;
    saveButton.onclick = null;
    leaveButton.onclick = null;
    cancelButton.onclick = null;
  };

  cancelButton.onclick = () => {
    cleanup();
    if (modal.open) {
      modal.close();
    }
  };

  leaveButton.onclick = () => {
    cleanup();
    if (modal.open) {
      modal.close();
    }
    navigateWithUnsavedChangesBypass(targetHash);
  };

  saveButton.onclick = async () => {
    saveButton.disabled = true;
    leaveButton.disabled = true;
    cancelButton.disabled = true;
    if (message) {
      message.textContent = "";
      message.classList.remove("is-error");
    }

    try {
      const didSave = await appState.unsavedChanges.saveFn({ navigateOnSuccess: false, destinationHash: targetHash });
      if (!didSave) {
        throw new Error("Could not save this session before leaving.");
      }

      markUnsavedChangesSaved();
      cleanup();
      if (modal.open) {
        modal.close();
      }
      navigateWithUnsavedChangesBypass(targetHash);
    } catch (error) {
      if (message) {
        message.textContent = error.message || "Could not save this session before leaving.";
        message.classList.add("is-error");
      }
      saveButton.disabled = false;
      leaveButton.disabled = false;
      cancelButton.disabled = false;
    }
  };

  modal.addEventListener("close", cleanup, { once: true });
  modal.showModal();
  saveButton.focus();
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

if (document.body) {
  applyTheme(getPreferredTheme(), { persist: false });
}

registerServiceWorker();
bindInstallPromptEvents();

window.addEventListener("error", (event) => {
  reportAppError(event.error || new Error(event.message || "Unknown script error"), "JavaScript Error");
});

window.addEventListener("unhandledrejection", (event) => {
  reportAppError(event.reason instanceof Error ? event.reason : new Error(String(event.reason || "Unhandled promise rejection")), "Unhandled Promise Rejection");
});

document.addEventListener("click", (event) => {
  const internalLink = event.target instanceof Element
    ? event.target.closest('a[href^="#"]')
    : null;
  if (internalLink instanceof HTMLAnchorElement) {
    const targetHash = normalizeNavigationHash(internalLink.getAttribute("href") || "#home");
    if (shouldBlockNavigationForUnsavedChanges(targetHash)) {
      event.preventDefault();
      event.stopPropagation();
      promptForUnsavedChangesNavigation(targetHash);
      return;
    }
    if (getCurrentAppPathRoute()) {
      event.preventDefault();
      event.stopPropagation();
      navigateToHashRoute(targetHash);
      return;
    }
  }

  const newSessionTrigger = event.target instanceof Element
    ? event.target.closest('a[href="#new"]')
    : null;

  if (newSessionTrigger instanceof HTMLAnchorElement) {
    event.preventDefault();
    appState.newSessionReturnHash = window.location.hash || "#home";
    void promptFilterPaperSetupBeforeNewSession().then((canProceed) => {
      if (!canProceed) {
        return;
      }
      openNewSessionSystemModal();
    });
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

  if (event.key === "Escape" && appState.mobileNavOpen) {
    closeMobileNavigation();
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

window.addEventListener("beforeunload", (event) => {
  if (!hasPendingUnsavedSessionChanges()) {
    return;
  }

  event.preventDefault();
  event.returnValue = "You have unsaved changes. Are you sure you want to leave?";
});

window.addEventListener("resize", requestOpenCustomSelectMenuPositionSync, { passive: true });
document.addEventListener("scroll", requestOpenCustomSelectMenuPositionSync, true);
window.addEventListener("popstate", safeRender);
window.addEventListener("hashchange", handleHashChange);
window.addEventListener("DOMContentLoaded", safeBootstrapApp);
window.removeCannakanSampleSessions = removeSampleSessions;
