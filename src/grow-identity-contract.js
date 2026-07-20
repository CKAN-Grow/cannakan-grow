(function exposeGrowIdentityContract(root, factory) {
  const contract = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = contract;
  }
  if (root) {
    root.GROW_IDENTITY_CONTRACT = contract;
  }
}(typeof globalThis !== "undefined" ? globalThis : this, () => {
  const freezeList = (values) => Object.freeze([...values]);

  return Object.freeze({
    version: "grow-identity.v1",
    profileVisibility: freezeList(["personal", "connections", "public"]),
    fieldVisibility: freezeList(["only_me", "connections", "public"]),
    experienceLevels: freezeList(["new", "beginner", "intermediate", "experienced", "expert"]),
    primaryRoles: freezeList([
      "grower",
      "breeder",
      "source",
      "educator",
      "researcher",
      "community_contributor",
      "industry_partner",
    ]),
    connectionRequestPermissions: freezeList(["anyone", "mutual_connections", "nobody"]),
    identityFieldKeys: freezeList([
      "display_name",
      "username",
      "profile_image",
      "cover_image",
      "bio",
      "primary_role",
      "experience_level",
      "years_growing",
      "growing_environments",
      "favorite_methods",
      "grow_interests",
      "grow_goals",
      "favorite_breeders",
      "favorite_sources",
      "languages",
      "city",
      "state_province",
      "country",
      "recognitions",
      "activity_summary",
      "testing_participation",
      "grow_along_participation",
      "collections_vault_summary",
    ]),
    invitationPreferenceKeys: freezeList([
      "testing_programs",
      "grow_alongs",
      "collaborations",
      "vault_sharing",
      "breeder_source_opportunities",
    ]),
    provenanceValues: freezeList([
      "self_declared",
      "observed",
      "suggested",
      "user_confirmed",
      "system_verified",
    ]),
    defaults: Object.freeze({
      profileVisibility: "connections",
      growNetworkDiscoverable: true,
      connectionRequestPermission: "anyone",
      personalizationConsent: false,
      invitationPreferences: Object.freeze({
        testing_programs: false,
        grow_alongs: true,
        collaborations: true,
        vault_sharing: true,
        breeder_source_opportunities: false,
      }),
    }),
  });
}));
