(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});

  function renderPendingAssignmentsWidget(settings, assignmentSnapshot) {
    const context = root.canvas.getPageContext();
    if (!settings.enabled || !settings.showDashboardTodoList || !context.isDashboard) {
      if (root.customAssignmentModal) {
        root.customAssignmentModal.sync({
          enabled: false
        });
      }
      root.dashboardView.teardown();
      return {
        rendered: false,
        itemCount: 0,
        mountFound: false
      };
    }

    const mount = root.canvas.findDashboardTodoMount();
    if (!mount || !mount.container) {
      if (root.customAssignmentModal) {
        root.customAssignmentModal.sync({
          enabled: false
        });
      }
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
    const presentation = root.dashboardView.syncPresentationState(widget, settings);
    root.dashboardView.renderItems(widget, assignmentSnapshot);
    if (root.customAssignmentModal) {
      root.customAssignmentModal.sync({
        enabled: true
      });
    }
    const widgetSnapshot = root.dashboardView.getSnapshot();
    const modalSnapshot = root.customAssignmentModal ? root.customAssignmentModal.getSnapshot() : null;

    return {
      rendered: true,
      itemCount: widgetSnapshot.itemCount,
      mountFound: true,
      layoutVariant: presentation.layoutVariant,
      rowVariant: presentation.rowVariant,
      fallbackCourseCount: widgetSnapshot.fallbackCourseCount,
      normalizedTitleCount: widgetSnapshot.normalizedTitleCount,
      customItemCount: widgetSnapshot.customItemCount,
      hasCustomItems: widgetSnapshot.hasCustomItems,
      customLauncherMounted: modalSnapshot ? modalSnapshot.launcherMounted : false,
      customModalMounted: modalSnapshot ? modalSnapshot.mounted : false,
      customModalOpen: modalSnapshot ? modalSnapshot.open : false,
      customModalCourseOptionCount: modalSnapshot ? modalSnapshot.courseOptionCount : 0,
      source: widgetSnapshot.source,
      status: widgetSnapshot.status
    };
  }

  root.dashboard = {
    getSnapshot: root.dashboardView.getSnapshot,
    getStyles: root.dashboardStyles.getStyles,
    renderPendingAssignmentsWidget,
    teardown: root.dashboardView.teardown
  };
})();
