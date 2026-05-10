# CSTP Standard Report Schema & Reporting Framework

Version: 1.0  
Status: Foundational framework  
Program: Cannakan Seed Testing Program (CSTP)

## 1. Report Purpose

CSTP reports exist to document observed seed performance under a standardized testing protocol. They are intended to make seed testing more transparent, consistent, and educational without implying that one observed test can guarantee every future outcome.

Each report should support five purposes:

- Observational transparency: show what was tested, when it was observed, and what happened during the observation window.
- Standardized reporting: use consistent fields, terminology, calculations, and report structure across sources, varieties, and future report surfaces.
- Educational insight: help growers, breeders, and source operators understand germination behavior under controlled CSTP conditions.
- Consistency tracking: create a repeatable structure for comparing repeated tests, historical qualification, and long-term source performance.
- Public trust: separate observed data from marketing claims, certification status from participation, and active reports from unavailable or expired records.

A CSTP report represents observed performance under CSTP conditions. It is informational and educational. It is not a guarantee of future germination, grow performance, storage quality, genetic authenticity, commercial reliability, or results under non-CSTP conditions.

## 2. Standard Report Structure

CSTP reports should follow a consistent hierarchy so readers can move from outcome to evidence without needing to understand internal testing operations.

### Required Core Sections

1. Certification Summary
   - Public status, report ID, observed germination rate, test date, sample size, and certification outcome.
   - This section should answer: what is the public result?

2. Source Information
   - Source name and public source profile linkage where available.
   - This section should answer: who or what source is associated with the tested sample?

3. Variety & Lot Information
   - Variety name, lot or batch identifier when available, and sample descriptor.
   - This section should answer: what exact seed sample was tested?

4. Testing Environment Summary
   - CSTP methodology reference, observation window, KAN system details, and controlled-condition summary.
   - This section should answer: under what conditions was the test observed?

5. Germination Results
   - Total tested, successfully germinated, non-germinated during the observation window, observed germination rate, and first germination observation.
   - This section should answer: what happened during the observation window?

6. Certification Outcome
   - Gold, Silver, Tested-only, Previously Tested, Expired Certification, Report Available, or Report Unavailable.
   - This section should answer: what public status should be attached to the tested record?

7. Report Verification
   - Report ID, CSTP version/methodology reference, generated date, and future verification hooks.
   - This section should answer: how can this report be identified and referenced?

### Optional Sections

- Observation Timeline: staged observations, first emergence, midpoint checks, final observation, and delayed germination notes.
- Multi-KAN Consistency: comparison across KAN units or partitions, including variance and consistency observations.
- Media Documentation: first germination image, final observation image, Multi-KAN images, and future replay/video references.
- Historical Qualification Context: prior tests, prior qualification outcomes, expiration status, and repeat-testing history.

### Future Expansion Sections

- Environmental telemetry
- Automated analytics
- PDF export metadata
- Digital signature status
- Public verification or QR validation
- Breeder/source dashboards
- Historical trend tracking

Future sections may be added without changing the required report hierarchy, but they should not replace the required core fields.

## 3. Required Reporting Fields

Every public CSTP report should include the following fields when a report is marked public or reportable:

| Field | Requirement | Notes |
| --- | --- | --- |
| Source Name | Required | Public-facing source or breeder name associated with the submitted sample. |
| Variety Name | Required | Public variety or sample name. If unknown, use `Variety not provided`. |
| Lot/Batch | Required if available | Should not be invented. Use `Not provided` if unavailable. |
| Test Date | Required | Date the CSTP observation began or official test record date. |
| Observation Window | Required | Start and end range used for germination observation. |
| Total Seeds Tested | Required | Denominator for germination calculations. |
| Successfully Germinated | Required | Count of seeds meeting CSTP germination criteria within the observation window. |
| Non-Germinated During Observation Window | Required | Total tested minus successfully germinated during the defined window. |
| Observed Germination Rate | Required | Calculated from successfully germinated / total seeds tested. |
| First Germination Observation | Required | First observed germination marker or `Not observed during first interval`. |
| Certification Status | Required | Gold, Silver, Tested-only, Previously Tested, Expired Certification, Report Available, or Report Unavailable. |
| Report ID | Required | Stable public identifier for the report. |
| CSTP Version/Methodology Reference | Required | CSTP protocol version or methodology reference used for the test. |

Recommended supporting fields:

- KAN system count
- Partition count
- Observation interval cadence
- Final observation timestamp
- Media capture references
- Environmental summary
- Tester or lab role label, if public-safe
- Report generated date
- Report expiration date, when applicable

## 4. Standard Terminology

Public CSTP wording must be precise, consistent, and resistant to overclaiming.

### Approved Public-Facing Terms

- Observed Germination Rate
- Successfully Germinated
- Non-Germinated During Observation Window
- Observed Under CSTP Conditions
- CSTP Report
- Report Available
- Report Unavailable
- Gold Certified
- Silver Certified
- Tested Sources
- CSTP Tested
- Tested-only
- Previously Tested
- Expired Certification
- Controlled Observation Window
- CSTP Methodology Reference
- Multi-KAN Consistency
- First Germination Observation
- Final Observation

### Discouraged Wording

Avoid wording that sounds absolute, promotional, or broader than the observed test:

- Guaranteed germination
- Guaranteed results
- Best seeds
- Lab proven to grow
- Officially superior
- Perfect germination
- Always germinates
- Certified source, when only a batch or sample was tested
- Verified genetics, unless genetic verification was actually performed
- Disease-free, contaminant-free, or purity claims unless those tests are part of the documented protocol

### Terminology Rules

- Use `Observed Germination Rate`, not simply `success rate`, when presenting CSTP result percentages.
- Use `Successfully Germinated`, not `passed`, for seed-level germination counts.
- Use `Non-Germinated During Observation Window`, not `failed seeds`, unless the SOP defines failure criteria separately.
- Use `Observed Under CSTP Conditions`, not `proven in all conditions`.
- Use `Report Available` only when a public Gold or Silver report can be opened.
- Use `Previously Tested` or `Expired Certification` for historical records that no longer carry an active report status.
- Do not call a tested-only source certified.

## 5. Germination Result Logic

CSTP germination calculations must be standardized across all reports.

### Core Calculation

Observed Germination Rate = Successfully Germinated / Total Seeds Tested x 100

Rules:

- Total Seeds Tested is the denominator.
- Successfully Germinated is the numerator.
- Counts must be whole numbers.
- Percentages should be rounded consistently. Default public display should use whole percentages unless the SOP later requires decimal precision.
- The report must show both the count and percentage, for example: `28 of 30 seeds, 93% observed germination rate`.

### Observation Window Rules

- The observation window must be stated clearly.
- Germination counted toward the public result must occur within the defined observation window.
- Seeds that germinate after the observation window should not change the primary Observed Germination Rate.
- Late germination may be documented as an extended observation note if observed and verified.

### Delayed Germination Treatment

Delayed germination should be handled transparently:

- If delayed germination occurs within the observation window, include it in Successfully Germinated.
- If delayed germination occurs after the observation window, document it separately as an extended observation.
- Extended observations should not silently alter certification status unless the SOP explicitly permits a revision process.

### Incomplete Data Handling

Incomplete data should never be hidden or converted into a stronger claim.

- If total tested is missing, the report is not reportable.
- If germinated count is missing, the report is not reportable.
- If observation window is missing, the report is not reportable.
- If media is missing but required numeric fields are complete, the report may be reportable only if media is optional for that report type.
- If a report is not reportable, use `Report Unavailable`.

## 6. Certification Outcome Logic

CSTP outcome labels must align with the SOP certification system and must distinguish participation from certification.

### Gold Certified

Gold Certified indicates the tested sample met the Gold threshold under CSTP conditions and has a public report available. It should be shown with a Gold badge only while the certification is active.

Public behavior:

- May show certification badge.
- May show `View Report`.
- May appear under `Gold Certified`, `CSTP Tested`, and `Report Available`.

### Silver Certified

Silver Certified indicates the tested sample met the Silver threshold under CSTP conditions and has a public report available. It should be shown with a Silver badge only while the certification is active.

Public behavior:

- May show certification badge.
- May show `View Report`.
- May appear under `Silver Certified`, `CSTP Tested`, and `Report Available`.

### Tested-only

Tested-only indicates a source or sample participated in CSTP testing but did not receive an active public Gold or Silver report.

Public behavior:

- May show quiet `CSTP Tested` status.
- Must not show `View Report`.
- Must not use Gold, Silver, or certified wording.
- May appear under `CSTP Tested`.

### Previously Tested

Previously Tested indicates a historical CSTP test exists, but no active public certification/report should be presented.

Public behavior:

- May show quiet historical status.
- Must not imply active certification.
- Must not show `View Report`.
- May appear under `CSTP Tested`.

### Report Unavailable

Report Unavailable indicates that a public report should not be opened or shown.

Use this when:

- Required report data is missing.
- Certification is not public.
- Certification is expired.
- A direct route does not match a reportable record.
- The source was tested but did not qualify for a public Gold or Silver report.

### Expired Certification

Expired Certification indicates a certification previously existed but is no longer active under the current CSTP validity rules.

Public behavior:

- May show historical context.
- Must not show active Gold/Silver certification wording.
- Must not show active report links unless the system supports explicitly historical public reports.

Certification does not equal participation. Participation does not guarantee public report publication. A source may be tested without being certified, and a certified report may become unavailable or expired.

## 7. Media & Image Standards

Media in CSTP reports should support observation, not promotion.

### Allowed Media Types

- First Germination image
- Final Observation image
- Multi-KAN observation images
- Partition-level observation images
- Future replay/video support placeholders

### Media Requirements

Media should be:

- Captured during the relevant observation interval.
- Associated with the report ID or test record.
- Clear enough to support observational review.
- Labeled by observation stage, not marketing copy.
- Consistent in framing where practical.
- Free of unrelated promotional overlays.

### Standard Image Labels

- First Germination Observation
- Final Observation
- KAN A Observation
- KAN B Observation
- KAN C Observation
- Extended Observation, if applicable

### Timing Consistency

Image timestamps should align with observation records. If image timing cannot be verified, the report should avoid presenting the image as primary evidence and may label it as supporting documentation.

### Future Replay/Video Placeholder

Future CSTP reports may support replay or video documentation. Video should follow the same principle as still images: observational clarity first, promotional value second.

## 8. Historical Trust & Transparency

CSTP trust should be built through repeatable history, not one-time spectacle.

Historical qualification tracking should support:

- Repeat testing by source.
- Qualification history by variety or lot where available.
- Expiration-aware trust.
- Separation between active reports and prior records.
- Long-term consistency analysis.
- Visibility into report availability and unavailability.

A single Gold or Silver report represents one observed sample under CSTP conditions. It should be valuable, but it should not be treated as a permanent or universal claim. Repeated qualification over time may support stronger confidence, but it should still be presented as historical observed performance rather than a guarantee.

Transparency should include both positive and limiting context:

- What was tested.
- How it was observed.
- What result was recorded.
- Whether the report is active, unavailable, or expired.
- Whether the source has historical qualification context.

## 9. Report Verification Standards

Every CSTP report should be designed for future verification even before public validation tooling exists.

### Required Verification Fields

- Report ID
- CSTP version or methodology reference
- Source name
- Variety name
- Lot/batch value, if available
- Test date
- Report generated date
- Certification status
- Expiration date, if applicable

### Report ID Standards

Report IDs should be stable, unique, and non-ambiguous. They should not expose sensitive internal identifiers if the report is public.

Recommended pattern:

`CSTP-{OUTCOME}-{YEAR}-{SEQUENCE}-{SOURCECODE}`

Example:

`CSTP-GLD-2026-0001-GHSC`

### Methodology References

Reports should reference the CSTP version or methodology used at the time of testing. If methodology changes over time, reports should preserve the original version reference rather than silently updating historical records.

### Future Verification Readiness

The report structure should remain compatible with:

- Public verification pages
- QR codes
- Signed report payloads
- PDF exports
- External validation records
- Historical report lookup

## 10. Future Expansion Placeholders

The following capabilities are future expansion areas. They should be planned for in the reporting framework but not treated as current public features until implemented.

### PDF Exports

Future reports may support standardized PDF export. PDF exports should preserve the same fields, terminology, and trust statements as the web report.

### Digital Signatures

Future reports may include signed payloads or tamper-evident report metadata. Signature status should be displayed only when implemented and verifiable.

### Blockchain / External Verification

Future verification may include blockchain, timestamping, or third-party validation. These should remain optional and should not replace the primary CSTP report record.

### Environmental Telemetry

Future reports may include temperature, humidity, moisture, or device telemetry. Telemetry should be summarized clearly and tied to the observation window.

### Automated Analytics

Future reports may include automated trend detection, anomaly flags, partition variance, or timing analysis. Automated analytics should be labeled as analysis, not raw observation.

### Breeder Dashboards

Future breeder or source dashboards may aggregate reports, historical results, and qualification history. Dashboard summaries must preserve report-level caveats and expiration status.

### Historical Trend Tracking

Future systems may track repeated results across varieties, lots, seasons, or sources. Trend data should distinguish observed consistency from guaranteed future performance.

## Implementation Boundaries

This framework defines CSTP reporting structure and terminology. It does not introduce UI changes, backend persistence, authentication, submission workflows, public navigation, or live certification operations.

Any future implementation should preserve the core trust logic defined here: CSTP reports document observed performance under standardized conditions, communicate reportability clearly, and avoid claims that exceed the tested sample and observation window.
