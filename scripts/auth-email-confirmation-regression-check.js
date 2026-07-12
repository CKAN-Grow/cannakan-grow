const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const indexSource = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");
const supabaseConfigSource = fs.readFileSync(path.join(repoRoot, "supabase", "config.toml"), "utf8");

function assertIncludes(source, needle, message = needle) {
  if (!source.includes(needle)) {
    throw new Error(`Missing auth email confirmation behavior: ${message}`);
  }
}

assertIncludes(indexSource, 'data-auth-pending-verification');
assertIncludes(indexSource, 'data-auth-resend-confirmation="true"');
assertIncludes(indexSource, 'Check your email to confirm your account.');
assertIncludes(indexSource, 'data-auth-change-email="true"');
assertIncludes(indexSource, 'data-auth-signin-after-confirm="true"');

assertIncludes(appSource, 'const AUTH_RESEND_CONFIRMATION_COOLDOWN_MS = 30000;');
assertIncludes(appSource, 'function getAuthEmailRedirectUrl()');
assertIncludes(appSource, 'options: { emailRedirectTo }');
assertIncludes(appSource, 'appState.supabase.auth.resend({');
assertIncludes(appSource, 'type: "signup"');
assertIncludes(appSource, 'function resolveSignupSessionForEmail(email = "", signUpSession = null)');
assertIncludes(appSource, 'const signupSession = await resolveSignupSessionForEmail(email, data?.session || null);');
assertIncludes(appSource, 'await handleAuthSession(signupSession');
assertIncludes(appSource, 'if (signupSession)');
assertIncludes(appSource, 'setPendingVerificationMode(email);');
assertIncludes(appSource, 'logAuthSignupDiagnostics("signup:response"');
assertIncludes(appSource, 'maskAuthEmailForLog');
assertIncludes(appSource, 'function getAuthDisplayErrorMessage(error = null');

assertIncludes(stylesSource, '.auth-form.is-pending-verification');
assertIncludes(stylesSource, '.auth-pending-verification');
assertIncludes(stylesSource, '.auth-pending-actions');

assertIncludes(supabaseConfigSource, 'enable_confirmations = false');
assertIncludes(supabaseConfigSource, 'http://localhost:4174');

console.log("Auth email confirmation regression check passed.");
