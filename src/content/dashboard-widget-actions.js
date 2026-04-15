(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});

  function logDashboardWarning(message, error) {
    if (root.debug) {
      root.debug.warn("dashboard", message, String(error));
    }
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

  function openCustomAssignmentCreate() {
    if (!root.customAssignmentModal) {
      return;
    }

    root.customAssignmentModal.openCreate().catch((error) => {
      logDashboardWarning("Custom assignment modal failed to open.", error);
    });
  }

  function openCustomAssignmentEdit(customAssignmentId) {
    if (!root.customAssignmentModal) {
      return;
    }

    root.customAssignmentModal.openEditById(customAssignmentId).catch((error) => {
      logDashboardWarning("Custom assignment edit action failed.", error);
    });
  }

  function deleteCustomAssignment(customAssignmentId) {
    if (!root.customAssignmentModal) {
      return;
    }

    root.customAssignmentModal.deleteRecord(customAssignmentId).catch((error) => {
      logDashboardWarning("Custom assignment delete action failed.", error);
    });
  }

  function toggleCustomAssignmentDone(customAssignmentId) {
    if (!root.customAssignmentForm) {
      return Promise.resolve();
    }

    return root.customAssignmentForm
      .markDoneRecord(customAssignmentId)
      .then(refreshDashboard)
      .catch((error) => {
        logDashboardWarning("Custom assignment done toggle failed.", error);
      });
  }

  function ignoreNativeAssignment(assignmentKey) {
    if (!root.ignoredAssignments || !assignmentKey) {
      return Promise.resolve();
    }

    return root.ignoredAssignments
      .ignoreAssignmentKey(assignmentKey)
      .then(refreshDashboard)
      .catch((error) => {
        logDashboardWarning("Native assignment ignore action failed.", error);
      });
  }

  function handleWidgetClick(event) {
    if (!(event.target instanceof Element)) {
      return;
    }

    const createAction = event.target.closest(".blank-canvas__todo-create");
    if (createAction) {
      openCustomAssignmentCreate();
      return;
    }

    const rowAction = event.target.closest("[data-action]");
    if (!rowAction) {
      return;
    }

    const customAssignmentId = rowAction.getAttribute("data-custom-assignment-id");
    if (!customAssignmentId) {
      return;
    }

    if (rowAction.getAttribute("data-action") === "edit-custom-assignment") {
      openCustomAssignmentEdit(customAssignmentId);
      return;
    }

    if (rowAction.getAttribute("data-action") === "toggle-custom-assignment-done") {
      return toggleCustomAssignmentDone(customAssignmentId);
    }

    if (rowAction.getAttribute("data-action") === "delete-custom-assignment") {
      deleteCustomAssignment(customAssignmentId);
    }
  }

  function handleWidgetContextMenu(event) {
    if (!(event.target instanceof Element)) {
      return;
    }

    const row = event.target.closest(".blank-canvas__todo-item");
    if (!row || row.dataset.source === "custom") {
      return;
    }

    const assignmentKey = row.dataset.assignmentKey || "";
    if (!assignmentKey) {
      return;
    }

    event.preventDefault();
    const confirmed = window.confirm("Hide this Canvas assignment from Blank Canvas?");
    if (!confirmed) {
      return;
    }

    return ignoreNativeAssignment(assignmentKey);
  }

  root.dashboardWidgetActions = {
    handleWidgetClick,
    handleWidgetContextMenu
  };
})();
