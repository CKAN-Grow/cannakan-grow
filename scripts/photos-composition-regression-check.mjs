import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const photos = require(path.join(root, "src", "photos-composition.js"));
const workspace = require(path.join(root, "src", "workspace-composition.js"));

const sessionId = "00000000-0000-4000-8000-000000000601";
const ownerId = "00000000-0000-4000-8000-000000000602";
const rawImage = {
  id: "00000000-0000-4000-8000-000000000603",
  path: `${ownerId}/${sessionId}/photo.jpg`,
  url: "https://example.test/photo.jpg",
  filename: "photo.jpg",
};
const rawSnapshot = JSON.stringify(rawImage);
const canonicalPhoto = photos.mapSessionImageToCanonicalPhoto(rawImage, { sessionId, ownerId });

assert.deepEqual(canonicalPhoto, {
  id: rawImage.id,
  sessionId,
  ownerId,
  path: rawImage.path,
  url: rawImage.url,
  filename: rawImage.filename,
});
assert.ok(Object.isFrozen(canonicalPhoto));
assert.equal(JSON.stringify(rawImage), rawSnapshot);
assert.equal(photos.mapSessionImageToCanonicalPhoto({ ...rawImage, id: "" }, { sessionId, ownerId }), null);
assert.equal(photos.mapSessionImageToCanonicalPhoto(
  { ...rawImage, session_id: "another-session" },
  { sessionId, ownerId },
), null);

const canonicalPhotos = photos.mapSessionImagesToCanonicalPhotos([
  rawImage,
  { ...rawImage, id: "" },
], { sessionId, ownerId });
assert.equal(canonicalPhotos.length, 1);
assert.ok(Object.isFrozen(canonicalPhotos));

const composed = workspace.composeWorkspace({
  sessionId,
  photos: [
    canonicalPhoto,
    Object.freeze({ ...canonicalPhoto, id: "other-photo", sessionId: "another-session" }),
  ],
});
assert.equal(composed.photos.length, 1);
assert.strictEqual(composed.photos[0], canonicalPhoto);
assert.ok(Object.isFrozen(composed.photos));

const photoSource = fs.readFileSync(path.join(root, "src", "photos-composition.js"), "utf8");
const workspaceSource = fs.readFileSync(path.join(root, "src", "workspace-composition.js"), "utf8");
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
const indexSource = fs.readFileSync(path.join(root, "index.html"), "utf8");
const serviceWorkerSource = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");

assert.doesNotMatch(photoSource, /localStorage|sessionStorage|indexedDB|fetch\(|\.from\(/);
assert.doesNotMatch(photoSource, /authorize|permission|lifecycle|evidence/i);
assert.ok(workspaceSource.includes("photosContract"));
assert.doesNotMatch(workspaceSource, /mapSessionImageToCanonicalPhoto|mapSessionImagesToCanonicalPhotos/);
assert.ok(appSource.includes("id: photoId"));
assert.ok(appSource.includes("mapSessionImagesToCanonicalPhotos"));
assert.ok(appSource.includes("root.dataset.workspacePhotoCount = String(composition.photos.length)"));
assert.ok(indexSource.includes('/src/photos-composition.js'));
assert.ok(serviceWorkerSource.includes('"/src/photos-composition.js"'));

console.log("Photos Composition regression checks passed.");
