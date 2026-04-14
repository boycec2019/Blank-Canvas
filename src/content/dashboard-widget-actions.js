(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});

  function logDashboardWarning(message, error) {
    if (root.debug) {
      root.debug.warn("dashboard", message, String(error));
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

    if (rowAction.getAttribute("data-action") === "delete-custom-assignment") {
      deleteCustomAssignment(customAssignmentId);
    }
  }

  root.dashboardWidgetActions = {
    handleWidgetClick
  };
})();
