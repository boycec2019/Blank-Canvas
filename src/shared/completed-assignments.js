(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});
  const STORAGE_KEY = "completedAssignmentStates";

  function getStorageArea() {
    return chrome.storage.sync || chrome.storage.local;
  }

  function normalizeDateTimeValue(value) {
    if (!value) {
      return null;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed.toISOString();
  }

  function normalizeCompletedRecord(record = {}) {
    const key = String(record.key || "").trim();
    const completedAt = normalizeDateTimeValue(record.completedAt);
    if (!key || !completedAt) {
      return null;
    }

    return {
      key,
      completedAt
    };
  }

  async function readCompletedAssignmentStates() {
    const values = await getStorageArea().get({
      [STORAGE_KEY]: []
    });
    return Array.isArray(values[STORAGE_KEY]) ? values[STORAGE_KEY] : [];
  }

  async function writeCompletedAssignmentStates(records) {
    const normalizedRecords = [];
    const seen = new Set();

    (records || []).forEach((record) => {
      const normalized = normalizeCompletedRecord(record);
      if (!normalized || seen.has(normalized.key)) {
        return;
      }

      seen.add(normalized.key);
      normalizedRecords.push(normalized);
    });

    await getStorageArea().set({
      [STORAGE_KEY]: normalizedRecords
    });

    return normalizedRecords;
  }

  async function listCompletedAssignmentStates() {
    const records = await readCompletedAssignmentStates();
    return records
      .map((record) => normalizeCompletedRecord(record))
      .filter(Boolean);
  }

  async function listCompletedAssignmentKeys() {
    const records = await listCompletedAssignmentStates();
    return records.map((record) => record.key);
  }

  async function markAssignmentDone(key, options = {}) {
    const normalizedKey = String(key || "").trim();
    if (!normalizedKey) {
      return null;
    }

    const records = await listCompletedAssignmentStates();
    const existing = records.find((record) => record.key === normalizedKey);
    if (existing) {
      return existing;
    }

    const nextRecord = {
      key: normalizedKey,
      completedAt: normalizeDateTimeValue(options.completedAt || options.now || new Date())
    };
    await writeCompletedAssignmentStates([...records, nextRecord]);
    return nextRecord;
  }

  async function unmarkAssignmentDone(key) {
    const normalizedKey = String(key || "").trim();
    const records = await listCompletedAssignmentStates();
    const nextRecords = records.filter((record) => record.key !== normalizedKey);
    await writeCompletedAssignmentStates(nextRecords);
    return nextRecords;
  }

  async function toggleAssignmentDone(key, options = {}) {
    const normalizedKey = String(key || "").trim();
    if (!normalizedKey) {
      return null;
    }

    const records = await listCompletedAssignmentStates();
    const existing = records.find((record) => record.key === normalizedKey);
    if (existing) {
      await writeCompletedAssignmentStates(records.filter((record) => record.key !== normalizedKey));
      return {
        key: normalizedKey,
        completedAt: null
      };
    }

    const nextRecord = {
      key: normalizedKey,
      completedAt: normalizeDateTimeValue(options.completedAt || options.now || new Date())
    };
    await writeCompletedAssignmentStates([...records, nextRecord]);
    return nextRecord;
  }

  function applyCompletionState(items = [], completedRecords = []) {
    const completedMap = new Map(
      (completedRecords || [])
        .map((record) => normalizeCompletedRecord(record))
        .filter(Boolean)
        .map((record) => [record.key, record.completedAt])
    );

    return (items || []).map((item) => {
      if (!item || item.source === "custom" || item.customAssignmentId) {
        return item;
      }

      const assignmentKey = root.assignmentCourseResolver
        ? root.assignmentCourseResolver.getAssignmentKey(item)
        : "";
      const completedAt = assignmentKey ? completedMap.get(assignmentKey) || null : null;

      return {
        ...item,
        completedAt
      };
    });
  }

  function onChanged(listener) {
    const handler = (changes, areaName) => {
      const expectedArea = chrome.storage.sync ? "sync" : "local";
      if (areaName !== expectedArea || !changes[STORAGE_KEY]) {
        return;
      }

      listener(changes[STORAGE_KEY]);
    };

    chrome.storage.onChanged.addListener(handler);

    return () => {
      chrome.storage.onChanged.removeListener(handler);
    };
  }

  root.completedAssignments = {
    STORAGE_KEY,
    applyCompletionState,
    listCompletedAssignmentKeys,
    listCompletedAssignmentStates,
    markAssignmentDone,
    onChanged,
    toggleAssignmentDone,
    unmarkAssignmentDone
  };
})();
