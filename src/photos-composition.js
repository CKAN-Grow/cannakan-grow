(function photosCompositionFactory(root, factory) {
  const contract = factory();
  if (typeof module === "object" && module.exports) module.exports = contract;
  root.PhotosComposition = contract;
}(typeof globalThis !== "undefined" ? globalThis : this, function createPhotosComposition() {
  function cleanText(value) {
    return String(value || "").trim();
  }

  function mapSessionImageToCanonicalPhoto(image = {}, context = {}) {
    const id = cleanText(image.id || image.photoId || image.photo_id);
    const sessionId = cleanText(context.sessionId);
    const ownerId = cleanText(context.ownerId);
    const storedSessionId = cleanText(image.sessionId || image.session_id);
    const path = cleanText(image.path);
    const url = cleanText(image.url || image.previewUrl);
    const filename = cleanText(image.filename || image.name) || "Session image";

    if (!id || !sessionId || !ownerId || (!path && !url)) return null;
    if (storedSessionId && storedSessionId !== sessionId) return null;

    return Object.freeze({
      id,
      sessionId,
      ownerId,
      path,
      url,
      filename,
    });
  }

  function mapSessionImagesToCanonicalPhotos(images = [], context = {}) {
    if (!Array.isArray(images)) return Object.freeze([]);
    return Object.freeze(images
      .map((image) => mapSessionImageToCanonicalPhoto(image, context))
      .filter(Boolean));
  }

  return Object.freeze({
    mapSessionImageToCanonicalPhoto,
    mapSessionImagesToCanonicalPhotos,
  });
}));
