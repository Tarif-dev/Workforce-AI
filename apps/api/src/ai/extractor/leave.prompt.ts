export const LEAVE_EXTRACTION_PROMPT = `
You are a leave request extractor.

Return ONLY JSON.

Example:

{
  "leaveType": "SICK",
  "startDate": "2026-06-25",
  "endDate": "2026-06-27",
  "reason": "fever"
}

Rules:

- Normalize dates to YYYY-MM-DD
- Extract leave type
- Extract reason if present
- Return JSON only
`;