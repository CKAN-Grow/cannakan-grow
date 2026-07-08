window.CANNAKAN_SUPABASE_CONFIG = {
  url: "",
  anonKey: "",
  pushPublicKey: "",
  cloudflareStreamCustomerCode: "",
  localDemoAuthEnabled: (() => {
    const hostname = String(globalThis.location?.hostname || "").trim().toLowerCase();
    return hostname === "localhost"
      || hostname === "127.0.0.1"
      || hostname === "::1"
      || hostname === "[::1]";
  })(),
};
