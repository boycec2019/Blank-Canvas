(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});

  function renderPendingAssignmentsWidget(settings, assignmentSnapshot) {
    const context = root.canvas.getPageContext();
    if (!settings.enabled || !settings.showDashboardTodoList || !context.isDashboard) {
      root.dashboardView.teardown();
      return {
        rendered: false,
        itemCount: 0,
        mountFound: false
      };
    }

    const mount = root.canvas.findDashboardTodoMount();
    if (!mount || !mount.container) {
      root.dashboardView.teardown();
      return {
        rendered: false,
        itemCount: 0,
        mountFound: false
      };
    }

    const widget =
      document.getElementById(root.dashboardStyles.WIDGET_ID) || root.dashboardView.createWidget();
    root.dashboardView.ensureWidgetPlacement(widget, mount);
    const layoutVariant = root.dashboardView.syncPresentationState(widget, settings);
    root.dashboardView.renderItems(widget, assignmentSnapshot);

    return {
      rendered: true,
      itemCount: (assignmentSnapshot.items || []).length,
      mountFound: true,
      layoutVariant,
      source: assignmentSnapshot.source,
      status: assignmentSnapshot.status
    };
  }

  root.dashboard = {
    getSnapshot: root.dashboardView.getSnapshot,
    getStyles: root.dashboardStyles.getStyles,
    renderPendingAssignmentsWidget,
    teardown: root.dashboardView.teardown
  };
})();
