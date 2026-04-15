(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});
  const MODAL_ID = "blank-canvas-custom-assignment-modal";

  let editingCustomAssignmentId = null;
  let currentCourseOptions = root.customAssignmentForm.normalizeCourseOptions([]);
  let elements = null;
  let scheduleController = null;

  function createElement(tagName, className, textContent) {
    const element = document.createElement(tagName);
    if (className) {
      element.className = className;
    }
    if (textContent !== undefined) {
      element.textContent = textContent;
    }
    return element;
  }

  function getSettings() {
    if (!root.storage || typeof root.storage.getSettings !== "function") {
      return Promise.resolve({ ...root.defaults });
    }

    return root.storage.getSettings();
  }

  async function refreshDashboard() {
    root.assignments.invalidate();
    if (root.renderer && typeof root.renderer.render === "function") {
      const settings = await getSettings();
      root.renderer.render(settings);
    }
  }

  function getCourseOptions(record = null) {
    const discovered = root.assignmentUtils.buildCourseOptions(document, root.canvas.getPageContext());
    const additionalOption =
      record && record.courseId && record.courseName
        ? [{ courseId: record.courseId, courseName: record.courseName }]
        : [];

    currentCourseOptions = root.customAssignmentForm.normalizeCourseOptions([
      ...discovered,
      ...additionalOption
    ]);

    return currentCourseOptions;
  }

  function buildModal() {
    const rootElement = createElement("section", "blank-canvas__custom-modal");
    rootElement.id = MODAL_ID;
    rootElement.hidden = true;

    const backdrop = createElement("button", "blank-canvas__custom-modal-backdrop");
    backdrop.type = "button";
    backdrop.setAttribute("aria-label", "Close custom assignment dialog");

    const dialog = createElement("section", "blank-canvas__custom-modal-dialog");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", `${MODAL_ID}-title`);

    const header = createElement("header", "blank-canvas__custom-modal-header");
    const headerCopy = createElement("div", "blank-canvas__custom-modal-copy");
    const title = createElement("h3", "", "New custom assignment");
    title.id = `${MODAL_ID}-title`;
    const close = createElement("button", "blank-canvas__custom-modal-close", "Close");
    close.type = "button";

    headerCopy.append(title);
    header.append(headerCopy, close);

    const form = createElement("form", "blank-canvas__custom-modal-form");
    form.noValidate = true;

    const courseLabel = createElement("label", "blank-canvas__custom-modal-field");
    courseLabel.htmlFor = `${MODAL_ID}-course`;
    courseLabel.append(createElement("strong", "", "Class"));
    const courseField = document.createElement("select");
    courseField.id = `${MODAL_ID}-course`;
    courseField.name = "customAssignmentCourse";
    courseField.required = true;
    const courseFieldWrapper = createElement("span", "blank-canvas__custom-modal-select-wrap");
    const courseFieldCaret = createElement("span", "blank-canvas__custom-modal-select-caret");
    courseFieldCaret.setAttribute("aria-hidden", "true");
    courseFieldWrapper.append(courseField, courseFieldCaret);

    const titleLabel = createElement("label", "blank-canvas__custom-modal-field");
    titleLabel.htmlFor = `${MODAL_ID}-title-input`;
    titleLabel.append(createElement("strong", "", "Assignment"));
    const titleField = document.createElement("input");
    titleField.id = `${MODAL_ID}-title-input`;
    titleField.name = "customAssignmentTitle";
    titleField.type = "text";
    titleField.maxLength = 140;
    titleField.placeholder = "Read chapter 5";

    const dueSection = createElement(
      "section",
      "blank-canvas__custom-modal-field blank-canvas__custom-modal-schedule"
    );
    dueSection.append(createElement("strong", "", "Due date"));

    if (!root.customAssignmentSchedule || typeof root.customAssignmentSchedule.create !== "function") {
      throw new Error("Custom assignment schedule helper is unavailable.");
    }

    scheduleController = root.customAssignmentSchedule.create({
      modalId: MODAL_ID,
      onChange: clearError
    });
    dueSection.appendChild(scheduleController.root);

    const error = createElement("p", "blank-canvas__custom-modal-error");
    error.setAttribute("aria-live", "polite");

    const actions = createElement("div", "blank-canvas__custom-modal-actions");
    const save = createElement("button", "blank-canvas__custom-modal-save", "Save");
    save.type = "submit";
    const cancel = createElement("button", "blank-canvas__custom-modal-cancel", "Cancel");
    cancel.type = "button";
    actions.append(save, cancel);

    form.append(courseLabel, courseFieldWrapper, titleLabel, titleField, dueSection, error, actions);
    dialog.append(header, form);
    rootElement.append(backdrop, dialog);
    document.body.appendChild(rootElement);

    elements = {
      root: rootElement,
      backdrop,
      cancel,
      close,
      courseField,
      error,
      form,
      save,
      title,
      titleField
    };

    backdrop.addEventListener("click", closeModal);
    cancel.addEventListener("click", closeModal);
    close.addEventListener("click", closeModal);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      saveCurrentDraft().catch((errorValue) => {
        setError(String(errorValue));
      });
    });
    [courseField, titleField].forEach((field) => {
      field.addEventListener("input", clearError);
      field.addEventListener("change", clearError);
    });
    courseField.addEventListener("input", syncCoursePlaceholderState);
    courseField.addEventListener("change", syncCoursePlaceholderState);

    return elements;
  }

  function ensureMounted() {
    if (elements && elements.root && elements.root.isConnected) {
      return elements;
    }

    return buildModal();
  }

  function clearError() {
    if (elements) {
      elements.error.textContent = "";
    }
  }

  function setError(message) {
    if (elements) {
      elements.error.textContent = message || "";
    }
  }

  function syncCoursePlaceholderState() {
    if (!elements) {
      return;
    }

    const hasSelection = Boolean(String(elements.courseField.value || "").trim());
    elements.courseField.dataset.placeholder = hasSelection ? "false" : "true";
  }

  function renderCourseOptions(selectedCourseId) {
    const modalElements = ensureMounted();
    modalElements.courseField.replaceChildren();

    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = "Select a class...";
    placeholderOption.disabled = true;
    placeholderOption.hidden = true;
    modalElements.courseField.appendChild(placeholderOption);

    currentCourseOptions.forEach((option) => {
      const optionElement = document.createElement("option");
      optionElement.value = option.courseId;
      optionElement.textContent = option.courseName;
      modalElements.courseField.appendChild(optionElement);
    });

    modalElements.courseField.value = currentCourseOptions.some((option) => option.courseId === selectedCourseId)
      ? selectedCourseId
      : "";
    syncCoursePlaceholderState();
  }

  function getDraft() {
    const modalElements = ensureMounted();
    const selectedId = String(modalElements.courseField.value || "").trim();
    const selectedCourse = currentCourseOptions.find((option) => option.courseId === selectedId) || {
      courseId: "",
      courseName: ""
    };
    const scheduleDraft = scheduleController
      ? scheduleController.readDraft()
      : {
          dueDate: "",
          dueTime: root.customAssignmentForm.DEFAULT_DUE_TIME
        };

    return {
      title: modalElements.titleField.value,
      courseId: selectedCourse.courseId,
      courseName: selectedCourse.courseName,
      dueDate: scheduleDraft.dueDate,
      dueTime: scheduleDraft.dueTime
    };
  }

  function closeModal() {
    if (!elements) {
      return;
    }

    elements.root.hidden = true;
    editingCustomAssignmentId = null;
    if (scheduleController) {
      scheduleController.closeCalendar();
    }
    clearError();
    document.body.classList.remove("blank-canvas__custom-modal-open");
  }

  async function openEditor(record = null) {
    const modalElements = ensureMounted();
    getCourseOptions(record);

    editingCustomAssignmentId = record ? record.customAssignmentId || record.id : null;
    const draft = root.customAssignmentForm.formatDraftForInputs(record, currentCourseOptions);

    modalElements.title.textContent = editingCustomAssignmentId
      ? "Edit custom assignment"
      : "New custom assignment";
    modalElements.titleField.value = draft.title;
    renderCourseOptions(draft.courseId || "");
    if (scheduleController) {
      scheduleController.applyDraft(draft);
    }
    clearError();

    modalElements.root.hidden = false;
    document.body.classList.add("blank-canvas__custom-modal-open");
    modalElements.titleField.focus();
  }

  async function saveCurrentDraft() {
    const draft = getDraft();
    const errorMessage = root.customAssignmentForm.validateDraft(draft);
    if (errorMessage) {
      setError(errorMessage);
      return null;
    }

    const modalElements = ensureMounted();
    const normalizedTime = root.customAssignmentForm.normalizeTimeInput(draft.dueTime);
    if (normalizedTime && scheduleController) {
      scheduleController.applyDraft({
        ...draft,
        dueTime: normalizedTime.displayValue
      });
    }

    modalElements.save.disabled = true;

    try {
      const record = await root.customAssignmentForm.saveDraft(
        draft,
        editingCustomAssignmentId ? "edit" : "create",
        editingCustomAssignmentId,
        {
          courseOptions: currentCourseOptions
        }
      );
      closeModal();
      await refreshDashboard();
      return record;
    } finally {
      modalElements.save.disabled = false;
    }
  }

  async function openCreate() {
    return openEditor(null);
  }

  async function openEditById(customAssignmentId) {
    const records = await root.customAssignments.listCustomAssignments();
    const record = records.find((item) => item.id === customAssignmentId);

    if (!record) {
      throw new Error("Custom assignment not found.");
    }

    return openEditor(record);
  }

  async function deleteRecord(customAssignmentId) {
    const confirmed = window.confirm("Delete this custom assignment?");
    if (!confirmed) {
      return false;
    }

    await root.customAssignmentForm.deleteRecord(customAssignmentId);
    closeModal();
    await refreshDashboard();
    return true;
  }

  function sync(options = {}) {
    if (!options.enabled) {
      closeModal();
      teardown();
      return;
    }

    ensureMounted();
  }

  function teardown() {
    if (elements && elements.root) {
      elements.root.remove();
    }

    elements = null;
    editingCustomAssignmentId = null;
    if (scheduleController) {
      scheduleController.destroy();
    }
    scheduleController = null;
    currentCourseOptions = root.customAssignmentForm.normalizeCourseOptions([]);
    document.body.classList.remove("blank-canvas__custom-modal-open");
  }

  function getSnapshot() {
    const modalRoot = document.getElementById(MODAL_ID);
    const scheduleSnapshot = scheduleController
      ? scheduleController.getSnapshot()
      : {
          selectedDueDate: "",
          timeValue: root.customAssignmentForm.DEFAULT_DUE_TIME,
          calendarOpen: false
        };

    return {
      mounted: Boolean(modalRoot),
      open: Boolean(modalRoot && !modalRoot.hidden),
      courseOptionCount: currentCourseOptions.length,
      editingCustomAssignmentId: editingCustomAssignmentId || "",
      selectedDueDate: scheduleSnapshot.selectedDueDate,
      timeValue: scheduleSnapshot.timeValue,
      calendarOpen: scheduleSnapshot.calendarOpen,
      launcherMounted: Boolean(
        root.dashboardStyles &&
          document.querySelector(`#${root.dashboardStyles.WIDGET_ID} .blank-canvas__todo-create`)
      )
    };
  }

  function getStyles() {
    return root.customAssignmentModalStyles.getStyles(MODAL_ID);
  }

  root.customAssignmentModal = {
    MODAL_ID,
    deleteRecord,
    getSnapshot,
    getStyles,
    openCreate,
    openEditById,
    sync,
    teardown
  };
})();
