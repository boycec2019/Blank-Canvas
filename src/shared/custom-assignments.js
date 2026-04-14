(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});
  const STORAGE_KEY = "customAssignments";
  const GENERAL_COURSE_ID = "general";
  const GENERAL_COURSE_NAME = "General";

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

  function createId(now = Date.now()) {
    return `custom-${now}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function normalizeCourseSelection(input = {}, courseOptions = []) {
    const selectedId = String(input.courseId || GENERAL_COURSE_ID).trim() || GENERAL_COURSE_ID;
    const normalizedOptions = normalizeCourseOptions(courseOptions);
    const selected = normalizedOptions.find((option) => option.courseId === selectedId);

    if (selected) {
      return selected;
    }

    return {
      courseId: selectedId,
      courseName: root.assignmentUtils.cleanLabel(input.courseName) || GENERAL_COURSE_NAME
    };
  }

  function normalizeCustomAssignment(input = {}, options = {}) {
    const now = options.now || new Date();
    const normalizedNow = new Date(now);
    const createdAt = input.createdAt ? normalizeDateTimeValue(input.createdAt) : normalizedNow.toISOString();
    const updatedAt = normalizedNow.toISOString();
    const courseSelection = normalizeCourseSelection(input, options.courseOptions);

    return {
      id: String(input.id || createId(normalizedNow.getTime())),
      title: root.assignmentUtils.cleanLabel(input.title),
      courseId: courseSelection.courseId,
      courseName: courseSelection.courseName,
      dueAt: normalizeDateTimeValue(input.dueAt),
      createdAt,
      updatedAt,
      source: "custom"
    };
  }

  async function readCustomAssignments() {
    const values = await getStorageArea().get({
      [STORAGE_KEY]: []
    });

    return Array.isArray(values[STORAGE_KEY]) ? values[STORAGE_KEY] : [];
  }

  async function writeCustomAssignments(records) {
    await getStorageArea().set({
      [STORAGE_KEY]: records
    });

    return records;
  }

  async function listCustomAssignments() {
    const records = await readCustomAssignments();
    return records
      .map((record) => normalizeCustomAssignment(record, {
        now: record.updatedAt || record.createdAt || new Date()
      }))
      .sort((left, right) => {
        const leftTime = left.updatedAt || left.createdAt || "";
        const rightTime = right.updatedAt || right.createdAt || "";
        return leftTime.localeCompare(rightTime);
      });
  }

  async function createCustomAssignment(input, options = {}) {
    const records = await listCustomAssignments();
    const record = normalizeCustomAssignment(input, options);
    await writeCustomAssignments([...records, record]);
    return record;
  }

  async function updateCustomAssignment(id, input, options = {}) {
    const records = await listCustomAssignments();
    const index = records.findIndex((record) => record.id === id);
    if (index === -1) {
      throw new Error("Custom assignment not found.");
    }

    const nextRecord = normalizeCustomAssignment(
      {
        ...records[index],
        ...input,
        id
      },
      options
    );
    const nextRecords = records.slice();
    nextRecords[index] = nextRecord;
    await writeCustomAssignments(nextRecords);
    return nextRecord;
  }

  async function deleteCustomAssignment(id) {
    const records = await listCustomAssignments();
    const nextRecords = records.filter((record) => record.id !== id);
    await writeCustomAssignments(nextRecords);
    return nextRecords;
  }

  function toPendingAssignment(record) {
    const normalized = normalizeCustomAssignment(record, {
      now: record.updatedAt || record.createdAt || new Date()
    });

    return {
      customAssignmentId: normalized.id,
      title: normalized.title,
      courseId: normalized.courseId,
      courseName: normalized.courseName,
      dueAt: normalized.dueAt,
      dueLabel: "Due",
      source: "custom",
      url: ""
    };
  }

  async function listPendingAssignments(options = {}) {
    const records = await listCustomAssignments();
    const rawItems = records.map((record) => toPendingAssignment(record));

    if (options.decorate === false || !root.assignmentFormatting) {
      return rawItems;
    }

    return root.assignmentFormatting.decoratePendingAssignments(rawItems, options);
  }

  function normalizeCourseOptions(options = []) {
    const seen = new Set();
    const normalized = [];
    const generalOption = {
      courseId: GENERAL_COURSE_ID,
      courseName: GENERAL_COURSE_NAME
    };

    [generalOption, ...(options || [])].forEach((option) => {
      const courseId = String(option && option.courseId ? option.courseId : "").trim() || GENERAL_COURSE_ID;
      const courseName = root.assignmentUtils.cleanLabel(
        option && option.courseName ? option.courseName : courseId === GENERAL_COURSE_ID ? GENERAL_COURSE_NAME : ""
      );

      if (!courseName || seen.has(courseId)) {
        return;
      }

      seen.add(courseId);
      normalized.push({
        courseId,
        courseName
      });
    });

    return normalized.sort((left, right) => {
      if (left.courseId === GENERAL_COURSE_ID) {
        return -1;
      }

      if (right.courseId === GENERAL_COURSE_ID) {
        return 1;
      }

      return left.courseName.localeCompare(right.courseName);
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

  root.customAssignments = {
    STORAGE_KEY,
    GENERAL_COURSE_ID,
    GENERAL_COURSE_NAME,
    normalizeCourseOptions,
    normalizeCustomAssignment,
    listCustomAssignments,
    listPendingAssignments,
    createCustomAssignment,
    updateCustomAssignment,
    deleteCustomAssignment,
    toPendingAssignment,
    onChanged
  };
})();
