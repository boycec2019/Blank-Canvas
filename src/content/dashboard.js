(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});

  function renderPendingAssignmentsWidget(settings, assignmentSnapshot) {
    const context = root.canvas.getPageContext();
    if (!settings.enabled || !settings.showDashboardTodoList || !context.isDashboard) {
      root.dashboard.teardown();
      return {
        rendered: false,
        itemCount: 0,
        mountFound: false
      };
    }

    const mount = root.canvas.findDashboardTodoMount();
    if (!mount || !mount.container) {
      root.dashboard.teardown();
      return {
        rendered: false,
        itemCount: 0,
        mountFound: false
      };
    }

    const rowItems = root.assignmentRowModel.buildAssignmentRows(assignmentSnapshot.items || [], {
      courseNames: root.assignmentUtils.buildCourseNameMap(document)
    });
    const layoutSnapshot = root.dashboardLayout.sync({
      mount,
      settings,
      assignmentSnapshot,
      rowItems
    });
    const widget = layoutSnapshot ? layoutSnapshot.assignments : null;
    const presentation = root.dashboardView.getSnapshot(widget);
    const widgetSnapshot = root.dashboardView.getSnapshot();
    const dashboardLayoutSnapshot = root.dashboardLayout ? root.dashboardLayout.getSnapshot() : null;
    const modalSnapshot = root.customAssignmentModal ? root.customAssignmentModal.getSnapshot() : null;

    return {
      rendered: true,
      itemCount: widgetSnapshot.itemCount,
      mountFound: true,
      sections: dashboardLayoutSnapshot ? dashboardLayoutSnapshot.sections : [],
      assignmentsMounted: dashboardLayoutSnapshot ? dashboardLayoutSnapshot.assignmentsMounted : false,
      classesAnchorFound: dashboardLayoutSnapshot ? dashboardLayoutSnapshot.classesAnchorFound : false,
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
    getSnapshot() {
      const layoutSnapshot = root.dashboardLayout ? root.dashboardLayout.getSnapshot() : null;
      const widgetSnapshot = root.dashboardView ? root.dashboardView.getSnapshot() : null;

      return {
        ...(widgetSnapshot || {}),
        sections: layoutSnapshot ? layoutSnapshot.sections : [],
        assignmentsMounted: layoutSnapshot ? layoutSnapshot.assignmentsMounted : false,
        classesAnchorFound: layoutSnapshot ? layoutSnapshot.classesAnchorFound : false
      };
    },
    getStyles: root.dashboardStyles.getStyles,
    renderPendingAssignmentsWidget,
    teardown() {
      if (root.dashboardLayout) {
        root.dashboardLayout.teardown();
      } else {
        root.dashboardView.teardown();
      }
    }
  };
})();
