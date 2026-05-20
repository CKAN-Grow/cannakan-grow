# Grow Session Source and Variety Normalization

Grow session partition identity uses two related values:

- Display label: `source` and `seedVariety` preserve the submitted or selected label shown back to the user.
- Canonical matching key: `sourceNormalizedName` and `seedVarietyNormalizedName` are additive keys used for autocomplete, duplicate detection, and analytics grouping.

The source matching key trims whitespace, lowercases comparison text, collapses duplicate spaces, normalizes common punctuation, removes website prefixes such as `https://` and `www.`, and strips safe trailing aliases such as `Co.`, `Company`, `Seeds`, and `Seed Co.`. Seed variety matching uses the same whitespace, lowercase, and punctuation normalization without source-specific suffix stripping.

These keys are stored inside the existing `grow_sessions.partitions` JSON payload for new saves. Existing session data is not rewritten; older rows can be grouped by computing the same key from their stored display labels at read time.
