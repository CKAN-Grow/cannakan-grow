(function documentsCompositionFactory(root, factory) {
  const contract = factory();
  if (typeof module === "object" && module.exports) module.exports = contract;
  root.DocumentsComposition = contract;
}(typeof globalThis !== "undefined" ? globalThis : this, function createDocumentsComposition() {
  function cleanText(value) {
    return String(value || "").trim();
  }

  function freezeStructuredMeaning(value) {
    if (!value || typeof value !== "object") return null;
    if (Array.isArray(value)) {
      return Object.freeze(value.map((item) => (
        item && typeof item === "object" ? freezeStructuredMeaning(item) : item
      )));
    }
    const copy = {};
    for (const [key, item] of Object.entries(value)) {
      copy[key] = item && typeof item === "object" ? freezeStructuredMeaning(item) : item;
    }
    return Object.freeze(copy);
  }

  function normalizeDocumentRecord(record = {}, context = {}) {
    const id = cleanText(record.id || record.documentId || record.document_id);
    const sessionId = cleanText(record.sessionId || record.session_id);
    const ownerId = cleanText(record.ownerId || record.owner_id || record.userId || record.user_id);
    const expectedSessionId = cleanText(context.sessionId);
    const expectedOwnerId = cleanText(context.ownerId);
    const structuredMeaning = freezeStructuredMeaning(
      record.structuredMeaning || record.structured_meaning,
    );

    if (!id || !sessionId || !ownerId || !structuredMeaning) return null;
    if (expectedSessionId && sessionId !== expectedSessionId) return null;
    if (expectedOwnerId && ownerId !== expectedOwnerId) return null;

    return Object.freeze({
      id,
      sessionId,
      ownerId,
      structuredMeaning,
    });
  }

  function normalizeDocumentRecords(records = [], context = {}) {
    if (!Array.isArray(records)) return Object.freeze([]);
    return Object.freeze(records
      .map((record) => normalizeDocumentRecord(record, context))
      .filter(Boolean));
  }

  return Object.freeze({
    normalizeDocumentRecord,
    normalizeDocumentRecords,
  });
}));
