(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});
  const SECTION_ORDER = Object.freeze(["assignments", "classes-anchor"]);
  const SPLIT_LAYOUT_MIN_WIDTH = 900;
  const CONTAINER_LAYOUT_DATASET = "blankCanvasDashboardLayout";
  const COLUMN_DATASET = "blankCanvasDashboardColumn";

  function getHostId() {
    return root.dashboardStyles ? root.dashboardStyles.HOST_ID : "blank-canvas-dashboard-sections";
  }

  function getHost() {
    return document.getElementById(getHostId());
  }

  function createHost() {
    const host = document.createElement("div");
    host.id = getHostId();
    host.dataset.blankCanvasSectionHost = "true";
    return host;
  }

  function getContainerWidth(container) {
    if (!container) {
      return 0;
    }

    const rectWidth = typeof container.getBoundingClientRect === "function"
      ? container.getBoundingClientRect().width
      : 0;
    return rectWidth || container.clientWidth || 0;
  }

  function getLayoutMode(mount) {
    if (!mount || !mount.container || !mount.anchor) {
      return "stacked";
    }

    const width = getContainerWidth(mount.container) || window.innerWidth || 0;
    return width >= SPLIT_LAYOUT_MIN_WIDTH ? "split" : "stacked";
  }

  function ensureHostPlacement(mount) {
    if (!mount || !mount.container) {
      return null;
    }

    const host = getHost() || createHost();
    const anchor = mount.anchor || null;
    const shouldInsertBeforeAnchor = Boolean(anchor && anchor !== host);
    const needsMove =
      host.parentElement !== mount.container ||
      (shouldInsertBeforeAnchor && host.nextSibling !== anchor) ||
      (!shouldInsertBeforeAnchor && mount.container.firstElementChild !== host);

    if (needsMove) {
      if (shouldInsertBeforeAnchor) {
        mount.container.insertBefore(host, anchor);
      } else {
        mount.container.insertBefore(host, mount.container.firstChild);
      }
    }

    host.dataset.classesAnchorFound = anchor ? "true" : "false";
    return host;
  }

  function syncContainerLayout(mount, host, layoutMode) {
    const container = mount && mount.container ? mount.container : null;
    const anchor = mount && mount.anchor ? mount.anchor : null;
    if (!container || !host) {
      return;
    }

    host.dataset.layoutMode = layoutMode;
    host.dataset[COLUMN_DATASET] = "left";
    container.dataset[CONTAINER_LAYOUT_DATASET] = layoutMode;

    if (anchor) {
      anchor.dataset[COLUMN_DATASET] = layoutMode === "split" ? "right" : "stacked";
    }
  }

  function ensureAssignmentsSection(host) {
    const widget =
      document.getElementById(root.dashboardStyles.WIDGET_ID) || root.dashboardView.createWidget();
    if (widget.parentElement !== host || host.firstElementChild !== widget) {
      host.insertBefore(widget, host.firstChild);
    }

    return widget;
  }

  function buildMountedSections(classesAnchorFound) {
    const sections = ["assignments"];
    if (classesAnchorFound) {
      sections.push("classes-anchor");
    }
    return sections;
  }

  function sync({ mount, settings, assignmentSnapshot, rowItems }) {
    const host = ensureHostPlacement(mount);
    if (!host) {
      return null;
    }
    const layoutMode = getLayoutMode(mount);

    const widget = ensureAssignmentsSection(host);
    root.dashboardView.syncPresentationState(widget, settings);
    root.dashboardView.renderItems(widget, assignmentSnapshot, {
      formatAssignmentCount: root.dashboardView.formatAssignmentCount,
      rowItems
    });
    syncContainerLayout(mount, host, layoutMode);

    const mountedSections = buildMountedSections(Boolean(mount.anchor));
    host.dataset.sectionOrder = mountedSections.join(",");

    return {
      host,
      assignments: widget,
      sections: mountedSections,
      layoutMode
    };
  }

  function getSnapshot() {
    const host = getHost();
    const widget = document.getElementById(root.dashboardStyles.WIDGET_ID);
    const classesAnchor = document.getElementById("DashboardCard_Container");
    const layoutMode = host ? host.dataset.layoutMode || "stacked" : "stacked";
    return {
      mounted: Boolean(host),
      sections: host && host.dataset.sectionOrder
        ? host.dataset.sectionOrder.split(",").filter(Boolean)
        : [],
      assignmentsMounted: Boolean(widget),
      classesAnchorFound: Boolean(host && host.dataset.classesAnchorFound === "true"),
      layoutMode,
      leftColumnMounted: Boolean(widget && host && host.dataset[COLUMN_DATASET] === "left"),
      rightColumnMounted: Boolean(
        layoutMode === "split" &&
          classesAnchor &&
          classesAnchor.dataset[COLUMN_DATASET] === "right"
      ),
      classesInRightColumn: Boolean(
        layoutMode === "split" &&
          classesAnchor &&
          classesAnchor.dataset[COLUMN_DATASET] === "right"
      )
    };
  }

  function teardown() {
    if (root.dashboardView) {
      root.dashboardView.teardown();
    }

    const classesAnchor = document.getElementById("DashboardCard_Container");
    if (classesAnchor) {
      delete classesAnchor.dataset[COLUMN_DATASET];
    }

    const host = getHost();
    if (host && host.parentElement) {
      delete host.parentElement.dataset[CONTAINER_LAYOUT_DATASET];
    }
    if (host) {
      host.remove();
    }
  }

  root.dashboardLayout = {
    SECTION_ORDER,
    SPLIT_LAYOUT_MIN_WIDTH,
    getHost,
    getLayoutMode,
    getSnapshot,
    sync,
    teardown
  };
})();
