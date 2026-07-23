(function workspaceCompositionFactory(root, factory) {
  const taskEventContract = typeof module === "object" && module.exports
    ? require("./grow-companion-contract.js")
    : root.GrowCompanionContract;
  const temporalProjection = typeof module === "object" && module.exports
    ? require("./growing-workspace-temporal-projection.js")
    : root.GrowingWorkspaceTemporalProjection;
  const notesContract = typeof module === "object" && module.exports
    ? require("./growing-workspace-notes.js")
    : root.GrowingWorkspaceNotes;
  const photosContract = typeof module === "object" && module.exports
    ? require("./photos-composition.js")
    : root.PhotosComposition;
  const documentsContract = typeof module === "object" && module.exports
    ? require("./documents-composition.js")
    : root.DocumentsComposition;
  const contract = factory(taskEventContract, temporalProjection, notesContract, photosContract, documentsContract);
  if (typeof module === "object" && module.exports) module.exports = contract;
  root.WorkspaceComposition = contract;
}(typeof globalThis !== "undefined" ? globalThis : this, function createWorkspaceComposition(
  taskEventContract,
  temporalProjection,
  notesContract,
  photosContract,
  documentsContract,
) {
  if (!taskEventContract || !temporalProjection || !notesContract || !photosContract || !documentsContract) {
    throw new Error("Canonical Task, Event, Temporal Projection, Note, Photo, and Document capabilities are required.");
  }

  function freezeList(records = []) {
    return Object.freeze([...records]);
  }

  function belongsToSession(record = {}, sessionId = "") {
    return Boolean(record.id) && record.sessionId === sessionId;
  }

  function composeWorkspace(input = {}) {
    const sessionId = String(input.sessionId || "").trim();
   if (!sessionId) throw new Error("Workspace Composition requires a canonical Session.");

    const tasks = freezeList((Array.isArray(input.tasks) ? input.tasks : [])
      .filter((record) => belongsToSession(record, sessionId)));
    const events = freezeList((Array.isArray(input.events) ? input.events : [])
      .filter((record) => belongsToSession(record, sessionId)));
    const notes = freezeList((Array.isArray(input.notes) ? input.notes : [])
      .filter((record) => belongsToSession(record, sessionId)));
    const photos = freezeList((Array.isArray(input.photos) ? input.photos : [])
      .filter((record) => belongsToSession(record, sessionId)));
    const temporalEntries = temporalProjection.projectTemporalRecords(tasks, events, { sessionId });
    const documents = freezeList((Array.isArray(input.documents) ? input.documents : [])
      .filter((record) => belongsToSession(record, sessionId)));

    return Object.freeze({
      sessionId,
      tasks,
      events,
      notes,
      photos,
      taskProjection: taskEventContract.projectTasks(tasks),
      documents,
      activity: taskEventContract.buildActivityItems(tasks, events),
      temporalEntries,
    });
  }

  return Object.freeze({
    composeWorkspace,
  });
}));
