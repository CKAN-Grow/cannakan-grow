# Grow Session Source and Variety Normalization

Grow session partition identity uses three related values:

- Display label: `source` / `sourceDisplayName` and `seedVariety` / `seedVarietyDisplayName` preserve the submitted or selected label shown back to the user.
- Normalized key: `sourceNormalizedName` and `seedVarietyNormalizedName` are additive comparison keys used for autocomplete, duplicate detection, and review.
- Canonical ID: `sourceCanonicalId` and `seedVarietyCanonicalId` are trusted grouping handles when the user selected a suggestion or the app found a very high-confidence match.

The source matching key trims whitespace, lowercases comparison text, collapses duplicate spaces, normalizes common punctuation, removes website prefixes such as `https://` and `www.`, and strips safe trailing aliases such as `Co.`, `Company`, `Seeds`, and `Seed Co.`. Seed variety matching uses the same whitespace, lowercase, and punctuation normalization without source-specific suffix stripping.

Each saved identity also gets a `sourceMatchStatus` or `seedVarietyMatchStatus`:

- `selected`: the user chose an autocomplete suggestion.
- `auto_matched`: the normalized key was exact or a very close typo match.
- `needs_review`: a medium-confidence candidate exists, but the app did not link it.
- `new`: no safe candidate exists yet.

`needs_review` rows store `sourceReviewCandidateId` / `sourceReviewCandidateName` or `seedVarietyReviewCandidateId` / `seedVarietyReviewCandidateName` so a future admin merge tool can review the candidate without destructively changing historical session data.

These keys are stored inside the existing `grow_sessions.partitions` JSON payload for new saves. Existing session data is not rewritten; older rows can be grouped by computing the same key from their stored display labels at read time. Analytics grouping should prefer canonical ID when present, then fall back to normalized key.
