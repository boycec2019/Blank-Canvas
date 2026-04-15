(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});
  const DEFAULT_DUE_TIME = "11:59 PM";
  const QUICK_TIME_OPTIONS = ["9:00 AM", DEFAULT_DUE_TIME, "5:00 PM"];
  const OTHER_COURSE_LABEL = "Other";

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function parseStoredDate(value) {
    if (!value) {
      return null;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function parseDateInputValue(value) {
    const match = String(value || "").trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) {
      return null;
    }

    const year = Number(match[1]);
    const monthIndex = Number(match[2]) - 1;
    const day = Number(match[3]);
    const date = new Date(year, monthIndex, day);

    if (
      Number.isNaN(date.getTime()) ||
      date.getFullYear() !== year ||
      date.getMonth() !== monthIndex ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  }

  function formatLocalDateValue(date) {
    return [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate())
    ].join("-");
  }

  function formatDateTimeInputValue(value) {
    const date = parseStoredDate(value);
    if (!date) {
      return "";
    }

    return `${formatLocalDateValue(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function formatDateInputValue(value) {
    const date = parseStoredDate(value);
    return date ? formatLocalDateValue(date) : "";
  }

  function formatTimeDisplay(hours24, minutes) {
    const meridiem = hours24 >= 12 ? "PM" : "AM";
    const normalizedHours = hours24 % 12 || 12;
    return `${normalizedHours}:${pad(minutes)} ${meridiem}`;
  }

  function formatTimeInputValue(value) {
    const date = parseStoredDate(value);
    return date ? formatTimeDisplay(date.getHours(), date.getMinutes()) : DEFAULT_DUE_TIME;
  }

  function normalizeTimeInput(value) {
    const normalized = String(value || "")
      .trim()
      .toUpperCase()
      .replace(/\./g, "")
      .replace(/\s+/g, " ");

    if (!normalized) {
      return null;
    }

    const match = normalized.match(/^(\d{1,2})(?::?(\d{2}))?\s*([AP]M)?$/);
    if (!match) {
      return null;
    }

    let hours = Number(match[1]);
    const minutes = match[2] ? Number(match[2]) : 0;
    const meridiem = match[3] || "";

    if (Number.isNaN(hours) || Number.isNaN(minutes) || minutes > 59) {
      return null;
    }

    if (meridiem) {
      if (hours < 1 || hours > 12) {
        return null;
      }
      hours = hours % 12 + (meridiem === "PM" ? 12 : 0);
    } else if (hours > 23) {
      return null;
    }

    return {
      hours24: hours,
      minutes,
      displayValue: formatTimeDisplay(hours, minutes),
      storageValue: `${pad(hours)}:${pad(minutes)}`
    };
  }

  function buildDueAtValue(dateValue, timeValue) {
    const date = parseDateInputValue(dateValue);
    const time = normalizeTimeInput(timeValue);
    if (!date || !time) {
      return "";
    }

    const combined = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.hours24,
      time.minutes,
      0,
      0
    );
    return Number.isNaN(combined.getTime()) ? "" : combined.toISOString();
  }

  function normalizeCourseOptions(items = []) {
    const normalized = root.customAssignments.normalizeCourseOptions(items);
    const generalId = root.customAssignments.GENERAL_COURSE_ID;
    const generalOption = normalized.find((option) => option.courseId === generalId);
    const nonGeneralOptions = normalized.filter((option) => option.courseId !== generalId);

    if (!generalOption) {
      return nonGeneralOptions;
    }

    return [
      ...nonGeneralOptions,
      {
        ...generalOption,
        courseName: OTHER_COURSE_LABEL
      }
    ];
  }

  function getCourseSelection(draft = {}, courseOptions = []) {
    const normalizedOptions = normalizeCourseOptions(courseOptions);
    const selectedId =
      String(draft.courseId || root.customAssignments.GENERAL_COURSE_ID).trim() ||
      root.customAssignments.GENERAL_COURSE_ID;

    return (
      normalizedOptions.find((option) => option.courseId === selectedId) || {
        courseId: root.customAssignments.GENERAL_COURSE_ID,
        courseName: root.customAssignments.GENERAL_COURSE_NAME
      }
    );
  }

  function createDraft(record = null, courseOptions = []) {
    if (!record) {
      return {
        title: "",
        courseId: "",
        courseName: "",
        dueDate: "",
        dueTime: DEFAULT_DUE_TIME
      };
    }

    const courseSelection = getCourseSelection(
      record,
      record && record.courseId && record.courseName
        ? [...courseOptions, { courseId: record.courseId, courseName: record.courseName }]
        : courseOptions
    );

    return {
      title: record.title || record.primaryTitle || "",
      courseId: courseSelection.courseId,
      courseName: courseSelection.courseName,
      dueDate: formatDateInputValue(record.dueAt),
      dueTime: formatTimeInputValue(record.dueAt)
    };
  }

  function formatDraftForInputs(record = null, courseOptions = []) {
    return createDraft(record, courseOptions);
  }

  function validateDraft(draft = {}) {
    if (!root.assignmentUtils.cleanLabel(draft.title)) {
      return "Enter an assignment title.";
    }

    if (!String(draft.courseId || "").trim()) {
      return "Choose a class.";
    }

    if (!draft.dueDate) {
      return "Choose a due date.";
    }

    if (!String(draft.dueTime || "").trim()) {
      return "Enter a due time.";
    }

    if (!normalizeTimeInput(draft.dueTime)) {
      return "Enter a valid time like 11:59 PM.";
    }

    if (!buildDueAtValue(draft.dueDate, draft.dueTime)) {
      return "Choose a valid due date and time.";
    }

    return "";
  }

  async function saveDraft(draft, mode = "create", existingId = "", options = {}) {
    const courseOptions = normalizeCourseOptions(options.courseOptions);
    const courseSelection = getCourseSelection(draft, courseOptions);
    const payload = {
      title: draft.title,
      courseId: courseSelection.courseId,
      courseName: courseSelection.courseName,
      dueAt: buildDueAtValue(draft.dueDate, draft.dueTime)
    };

    if (mode === "edit" && existingId) {
      return root.customAssignments.updateCustomAssignment(existingId, payload, {
        courseOptions
      });
    }

    return root.customAssignments.createCustomAssignment(payload, {
      courseOptions
    });
  }

  async function deleteRecord(id) {
    return root.customAssignments.deleteCustomAssignment(id);
  }

  async function markDoneRecord(id, options = {}) {
    return root.customAssignments.toggleCustomAssignmentDone(id, options);
  }

  function getCourseHintMessage(options = []) {
    if ((options || []).length > 1) {
      return "Class options come from the current Canvas page, with Other as a fallback.";
    }

    return "Open a course or dashboard view to load class choices. You can still save to Other.";
  }

  function formatDateButtonLabel(dateValue) {
    const date = parseDateInputValue(dateValue);
    if (!date) {
      return "Select a due date";
    }

    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric"
    }).format(date);
  }

  function formatMonthLabel(date) {
    const normalized = date instanceof Date ? date : new Date();
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric"
    }).format(normalized);
  }

  root.customAssignmentForm = {
    DEFAULT_DUE_TIME,
    OTHER_COURSE_LABEL,
    QUICK_TIME_OPTIONS,
    buildDueAtValue,
    createDraft,
    deleteRecord,
    formatDateButtonLabel,
    formatDateInputValue,
    formatDateTimeInputValue,
    formatDraftForInputs,
    formatMonthLabel,
    formatTimeInputValue,
    getCourseHintMessage,
    markDoneRecord,
    normalizeCourseOptions,
    normalizeTimeInput,
    parseDateInputValue,
    saveDraft,
    validateDraft
  };
})();
