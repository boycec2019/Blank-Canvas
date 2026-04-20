(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});
  const refreshDashboard =
    root.dashboardRefresh && typeof root.dashboardRefresh.refresh === "function"
      ? () => root.dashboardRefresh.refresh({ forceAssignments: true })
      : () => Promise.resolve();

  function logDashboardWarning(message, error) {
    if (root.debug) {
      root.debug.warn("dashboard", message, String(error));
    }
  }

  function runDashboardTask(task, warningMessage) {
    return Promise.resolve()
      .then(task)
      .catch((error) => {
        logDashboardWarning(warningMessage, error);
      });
  }

  function runModalTask(methodName, warningMessage, ...args) {
    if (
      !root.customAssignmentModal ||
      typeof root.customAssignmentModal[methodName] !== "function"
    ) {
      return;
    }

    runDashboardTask(() => root.customAssignmentModal[methodName](...args), warningMessage);
  }

  function openCustomAssignmentCreate() {
    runModalTask("openCreate", "Custom assignment modal failed to open.");
  }

  function openCustomAssignmentEdit(customAssignmentId) {
    runModalTask("openEditById", "Custom assignment edit action failed.", customAssignmentId);
  }

  function deleteCustomAssignment(customAssignmentId) {
    runModalTask("deleteRecord", "Custom assignment delete action failed.", customAssignmentId);
  }

  function toggleCustomAssignmentDone(customAssignmentId) {
    if (!root.customAssignmentForm) {
      return Promise.resolve();
    }

    return runDashboardTask(
      () => root.customAssignmentForm.markDoneRecord(customAssignmentId).then(refreshDashboard),
      "Custom assignment done toggle failed."
    );
  }

  function toggleNativeAssignmentDone(assignmentKey) {
    if (!root.completedAssignments || !assignmentKey) {
      return Promise.resolve();
    }

    return runDashboardTask(
      () => root.completedAssignments.toggleAssignmentDone(assignmentKey).then(refreshDashboard),
      "Native assignment done toggle failed."
    );
  }

  function ignoreNativeAssignment(assignmentKey) {
    if (!root.ignoredAssignments || !assignmentKey) {
      return Promise.resolve();
    }

    return runDashboardTask(
      () => root.ignoredAssignments.ignoreAssignmentKey(assignmentKey).then(refreshDashboard),
      "Native assignment ignore action failed."
    );
  }

  function handleWidgetClick(event) {
    if (!(event.target instanceof Element)) {
      return;
    }

    const createAction = event.target.closest(".blank-canvas__todo-create");
    if (createAction) {
      event.preventDefault();
      openCustomAssignmentCreate();
      return;
    }

    const rowAction = event.target.closest("[data-action]");
    if (!rowAction) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (rowAction.getAttribute("data-action") === "edit-custom-assignment") {
      const customAssignmentId = rowAction.getAttribute("data-custom-assignment-id");
      if (!customAssignmentId) {
        return;
      }
      openCustomAssignmentEdit(customAssignmentId);
      return;
    }

    if (rowAction.getAttribute("data-action") === "toggle-assignment-done") {
      const customAssignmentId = rowAction.getAttribute("data-custom-assignment-id");
      if (customAssignmentId) {
        return toggleCustomAssignmentDone(customAssignmentId);
      }

      const assignmentKey = rowAction.getAttribute("data-assignment-key");
      if (!assignmentKey) {
        return;
      }

      return toggleNativeAssignmentDone(assignmentKey);
    }

    if (rowAction.getAttribute("data-action") === "delete-custom-assignment") {
      const customAssignmentId = rowAction.getAttribute("data-custom-assignment-id");
      if (!customAssignmentId) {
        return;
      }
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
