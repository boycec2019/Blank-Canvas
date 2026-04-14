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
    const createButton = createElement("button", "blank-canvas__todo-create", "New custom");
    createButton.type = "button";
    const content = createElement("div", "blank-canvas__todo-content");

    headerActions.append(count, createButton);
    header.append(heading, headerActions);
    widget.append(header, content);
    widget.addEventListener("click", root.dashboardWidgetActions.handleWidgetClick);

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

  function ensureWidgetPlacement(widget, mount) {
    if (!mount || !mount.container) {
      return false;
    }

    const shouldInsertBeforeAnchor = Boolean(mount.anchor && mount.anchor !== widget);
    const needsMove =
      widget.parentElement !== mount.container ||
      (shouldInsertBeforeAnchor && widget.nextSibling !== mount.anchor) ||
      (!shouldInsertBeforeAnchor && mount.container.firstElementChild !== widget);

    if (!needsMove) {
      return true;
    }

    if (shouldInsertBeforeAnchor) {
      mount.container.insertBefore(widget, mount.anchor);
      return true;
    }

    mount.container.insertBefore(widget, mount.container.firstChild);
    return true;
  }

  function renderItems(widget, snapshot) {
    const items = snapshot.items || [];
    const rowItems = root.assignmentRowModel.buildAssignmentRows(items, {
      courseNames: root.assignmentUtils.buildCourseNameMap(document)
    });

    root.dashboardRowRenderer.renderItems(widget, snapshot, {
      formatAssignmentCount,
      rowItems
    });
  }

  function getSnapshot() {
    const widget = document.getElementById(root.dashboardStyles.WIDGET_ID);

    return {
      rendered: Boolean(widget),
      itemCount: widget ? Number(widget.dataset.itemCount || 0) : 0,
      layoutVariant: widget ? widget.dataset.layoutVariant || "classic" : "none",
      rowVariant: widget ? widget.dataset.rowVariant || "legacy" : "none",
      fallbackCourseCount: widget ? Number(widget.dataset.fallbackCourseCount || 0) : 0,
      normalizedTitleCount: widget ? Number(widget.dataset.normalizedTitleCount || 0) : 0,
      source: widget ? widget.dataset.assignmentSource || "dom" : "none",
      status: widget ? widget.dataset.assignmentStatus || "idle" : "idle",
      customItemCount: widget ? Number(widget.dataset.customItemCount || 0) : 0,
      hasCustomItems: widget ? Number(widget.dataset.customItemCount || 0) > 0 : false
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
    ensureWidgetPlacement,
    formatAssignmentCount,
    getSnapshot,
    renderItems,
    syncPresentationState,
    teardown
  };
})();
