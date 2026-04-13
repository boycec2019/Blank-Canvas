(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});

  function buildSignature(items) {
    return items
      .map((item) =>
        [
          item.displayTitle,
          item.dueSummaryText,
          item.statusTone,
          item.url
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

  function formatAssignmentCount(count) {
    return `${count} Assignment${count === 1 ? "" : "s"}`;
  }

  function createWidget() {
    const widget = document.createElement("section");
    widget.id = root.dashboardStyles.WIDGET_ID;
    widget.setAttribute("aria-label", "Assignments");
    widget.dataset.layoutVariant = "classic";

    const header = createElement("header", "blank-canvas__todo-header");
    const heading = createElement("h2", "", "Assignments");
    const count = createElement("p", "blank-canvas__todo-count");
    const content = createElement("div", "blank-canvas__todo-content");

    header.append(heading, count);
    widget.append(header, content);

    return widget;
  }

  function syncPresentationState(widget, settings) {
    const variant = root.ui.isEditorialPhaseActive(settings, root.ui.PHASE_AGENDA_LIST)
      ? "agenda"
      : "classic";

    widget.dataset.layoutVariant = variant;
    return variant;
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

  function renderEmptyState(content, message) {
    content.replaceChildren(createElement("p", "blank-canvas__todo-empty", message));
  }

  function createAssignmentCard(item) {
    const listItem = createElement("li", "blank-canvas__todo-item");
    const link = createElement("a", "blank-canvas__todo-link");
    const title = createElement("span", "blank-canvas__todo-title", item.displayTitle || item.title);
    const dueSummary = createElement(
      "span",
      "blank-canvas__todo-due-summary",
      item.dueSummaryText || item.dueDateText
    );

    listItem.dataset.statusTone = item.statusTone || "pending";
    link.href = item.url;
    link.append(title, dueSummary);
    listItem.appendChild(link);

    return listItem;
  }

  function renderItems(widget, snapshot) {
    const items = snapshot.items || [];
    const content = widget.querySelector(".blank-canvas__todo-content");
    const count = widget.querySelector(".blank-canvas__todo-count");
    const signature = buildSignature(items);
    const currentSignature = widget.dataset.signature || "";

    count.textContent = formatAssignmentCount(items.length);
    widget.dataset.itemCount = String(items.length);

    if (!items.length) {
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
    items.forEach((item) => {
      list.appendChild(createAssignmentCard(item));
    });

    content.replaceChildren(list);
  }

  function getSnapshot() {
    const widget = document.getElementById(root.dashboardStyles.WIDGET_ID);

    return {
      rendered: Boolean(widget),
      itemCount: widget ? Number(widget.dataset.itemCount || 0) : 0,
      layoutVariant: widget ? widget.dataset.layoutVariant || "classic" : "none"
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
