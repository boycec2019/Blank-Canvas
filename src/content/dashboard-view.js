(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});

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

  function formatAssignmentCount(count) {
    return `${count} Assignment${count === 1 ? "" : "s"}`;
  }

  function createWidget() {
    const widget = document.createElement("section");
    widget.id = root.dashboardStyles.WIDGET_ID;
    widget.setAttribute("aria-label", "Assignments");
    widget.dataset.layoutVariant = "classic";
    widget.dataset.rowVariant = "legacy";

    const header = createElement("header", "blank-canvas__todo-header");
    const heading = createElement("h2", "", "Assignments");
    const count = createElement("p", "blank-canvas__todo-count");
    const headerActions = createElement("div", "blank-canvas__todo-header-actions");
    const createButton = createElement("button", "blank-canvas__todo-create", "+");
    createButton.type = "button";
    createButton.setAttribute("aria-label", "New custom assignment");
    createButton.title = "New custom assignment";
    const content = createElement("div", "blank-canvas__todo-content");

    headerActions.append(count, createButton);
    header.append(heading, headerActions);
    widget.append(header, content);
    widget.addEventListener("click", root.dashboardWidgetActions.handleWidgetClick);
    widget.addEventListener("contextmenu", root.dashboardWidgetActions.handleWidgetContextMenu);

    return widget;
  }

  function syncPresentationState(widget, settings) {
    const layoutVariant = root.ui.isEditorialPhaseActive(settings, root.ui.PHASE_AGENDA_LIST)
      ? "agenda"
      : "classic";
    const rowVariant = root.ui.isEditorialPhaseActive(settings, root.ui.PHASE_ASSIGNMENT_HIERARCHY)
      ? "hierarchy"
      : "legacy";

    widget.dataset.layoutVariant = layoutVariant;
    widget.dataset.rowVariant = rowVariant;
    return {
      layoutVariant,
      rowVariant
    };
  }

  function renderItems(widget, snapshot, options = {}) {
    const rowItems = options.rowItems || root.assignmentRowModel.buildAssignmentRows(snapshot.items || [], {
      courseNames: root.assignmentUtils.buildCourseNameMap(document)
    });

    root.dashboardRowRenderer.renderItems(widget, snapshot, {
      formatAssignmentCount,
      rowItems
    });
  }

  function getSnapshot(widget = document.getElementById(root.dashboardStyles.WIDGET_ID)) {
    const itemCount = widget ? Number(widget.dataset.itemCount || 0) : 0;
    const customItemCount = widget ? Number(widget.dataset.customItemCount || 0) : 0;

    return {
      rendered: Boolean(widget),
      itemCount,
      layoutVariant: widget ? widget.dataset.layoutVariant || "classic" : "none",
      rowVariant: widget ? widget.dataset.rowVariant || "legacy" : "none",
      fallbackCourseCount: widget ? Number(widget.dataset.fallbackCourseCount || 0) : 0,
      normalizedTitleCount: widget ? Number(widget.dataset.normalizedTitleCount || 0) : 0,
      source: widget ? widget.dataset.assignmentSource || "dom" : "none",
      status: widget ? widget.dataset.assignmentStatus || "idle" : "idle",
      customItemCount,
      hasCustomItems: customItemCount > 0
    };
  }

  function teardown() {
    const widget = document.getElementById(root.dashboardStyles.WIDGET_ID);
    if (widget) {
      widget.remove();
    }
  }

  root.dashboardView = {
    createWidget,
    formatAssignmentCount,
    getSnapshot,
    renderItems,
    syncPresentationState,
    teardown
  };
})();
