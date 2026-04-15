(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});

  function buildSignature(items) {
    return items
      .map((item) =>
        [
          item.primaryTitle,
          item.secondaryCourseName,
          item.statusLabel,
          item.dueSummaryText,
          item.url,
          item.source,
          item.customAssignmentId || ""
        ].join("|")
      )
      .join("||");
  }

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

  function setNavigationState(element, url) {
    if (url) {
      element.href = url;
    }
  }

  function renderEmptyState(content, message) {
    content.replaceChildren(createElement("p", "blank-canvas__todo-empty", message));
  }

  function buildWidgetStats(rowItems, snapshot) {
    return {
      assignmentSource: snapshot.source || "dom",
      assignmentStatus: snapshot.status || "idle",
      activeItemCount: rowItems.filter((item) => !item.completedAt).length,
      customItemCount: rowItems.filter((item) => item.source === "custom").length,
      fallbackCourseCount: rowItems.filter((item) => item.isFallbackCourseName).length,
      normalizedTitleCount: rowItems.filter((item) => item.titleWasNormalized).length
    };
  }

  function createRowActions(item) {
    if (item.source !== "custom" || !item.customAssignmentId) {
      return null;
    }

    const actions = createElement("span", "blank-canvas__todo-actions");
    const editAction = createElement("button", "blank-canvas__todo-action", "Edit");
    const deleteAction = createElement("button", "blank-canvas__todo-action", "Delete");
    const doneAction = createElement("button", "blank-canvas__todo-action", "Mark as done");

    editAction.type = "button";
    deleteAction.type = "button";
    doneAction.type = "button";
    editAction.dataset.action = "edit-custom-assignment";
    deleteAction.dataset.action = "delete-custom-assignment";
    doneAction.dataset.action = "toggle-custom-assignment-done";
    editAction.dataset.customAssignmentId = item.customAssignmentId;
    deleteAction.dataset.customAssignmentId = item.customAssignmentId;
    doneAction.dataset.customAssignmentId = item.customAssignmentId;
    doneAction.dataset.completed = item.completedAt ? "true" : "false";
    doneAction.setAttribute("aria-pressed", item.completedAt ? "true" : "false");
    actions.append(editAction, deleteAction, doneAction);

    return actions;
  }

  function createAssignmentCard(item) {
    const listItem = createElement("li", "blank-canvas__todo-item");
    const surface = createElement(item.url ? "a" : "div", "blank-canvas__todo-link");
    const main = createElement("span", "blank-canvas__todo-main");
    const title = createElement("span", "blank-canvas__todo-title", item.primaryTitle || item.title);
    const meta = createElement("span", "blank-canvas__todo-meta");
    const course = item.secondaryCourseName
      ? createElement("span", "blank-canvas__todo-course", item.secondaryCourseName)
      : null;
    const status = item.statusLabel
      ? createElement("span", "blank-canvas__todo-status", item.statusLabel)
      : null;
    const dueSummary = createElement(
      "span",
      "blank-canvas__todo-due-summary",
      item.dueSummaryText || item.dueDateText
    );

    listItem.dataset.statusTone = item.statusTone || "pending";
    listItem.dataset.fallbackCourseName = item.isFallbackCourseName ? "true" : "false";
    listItem.dataset.debugSource = item.debugSource || "item";
    listItem.dataset.titleNormalized = item.titleWasNormalized ? "true" : "false";
    listItem.dataset.source = item.source || "unknown";
    listItem.dataset.completed = item.completedAt ? "true" : "false";
    listItem.dataset.assignmentKey = root.assignmentCourseResolver
      ? root.assignmentCourseResolver.getAssignmentKey(item)
      : "";
    setNavigationState(surface, item.url);

    main.appendChild(title);
    if (course) {
      meta.appendChild(course);
    }
    if (status) {
      meta.appendChild(status);
    }
    if (meta.childElementCount) {
      main.appendChild(meta);
    }

    const actions = createRowActions(item);
    if (actions) {
      main.appendChild(actions);
    }

    surface.append(main, dueSummary);
    listItem.appendChild(surface);

    return listItem;
  }

  function renderItems(widget, snapshot, options = {}) {
    const rowItems = options.rowItems || [];
    const content = widget.querySelector(".blank-canvas__todo-content");
    const count = widget.querySelector(".blank-canvas__todo-count");
    const signature = buildSignature(rowItems);
    const currentSignature = widget.dataset.signature || "";
    const stats = buildWidgetStats(rowItems, snapshot);

    count.textContent = options.formatAssignmentCount(stats.activeItemCount);
    widget.dataset.itemCount = String(stats.activeItemCount);
    widget.dataset.renderedItemCount = String(rowItems.length);
    widget.dataset.assignmentSource = stats.assignmentSource;
    widget.dataset.assignmentStatus = stats.assignmentStatus;
    widget.dataset.customItemCount = String(stats.customItemCount);
    widget.dataset.fallbackCourseCount = String(stats.fallbackCourseCount);
    widget.dataset.normalizedTitleCount = String(stats.normalizedTitleCount);

    if (!rowItems.length) {
      widget.dataset.signature = signature;
      renderEmptyState(
        content,
        snapshot.status === "loading"
          ? "Loading assignments from Canvas..."
          : "Nothing pending right now."
      );
      return;
    }

    if (currentSignature === signature) {
      return;
    }

    widget.dataset.signature = signature;
    const list = createElement("ul", "blank-canvas__todo-list");
    rowItems.forEach((item) => {
      list.appendChild(createAssignmentCard(item));
    });

    content.replaceChildren(list);
  }

  root.dashboardRowRenderer = {
    buildSignature,
    buildWidgetStats,
    renderItems
  };
})();
