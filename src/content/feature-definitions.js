(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});

  if (!root.featureRegistry) {
    return;
  }

  root.featureRegistry.register({
    id: "global-page-styling",
    isEnabled: () => true,
    mount(settings, context) {
      return {
        pageType: context.pageType,
        pageFamily: context.pageFamily,
        routePattern: context.pageRoutePattern
      };
    },
    getStyles(settings) {
      return root.uiPrimitives ? root.uiPrimitives.getStyles(settings) : "";
    }
  });

  root.featureRegistry.register({
    id: "course-nav-cleanup",
    isEnabled: (settings, context) => Boolean(context.isCourse && settings.hiddenCourseNavItems),
    mount(settings) {
      if (root.courseNav && typeof root.courseNav.sync === "function") {
        root.courseNav.sync(settings);
      }

      return {
        pageScoped: true
      };
    },
    getSnapshot(settings, context) {
      return {
        pageType: context.pageType,
        courseId: context.courseId || "",
        hiddenCourseNavItemsConfigured: Boolean(
          settings.hiddenCourseNavItems &&
            Object.keys(settings.hiddenCourseNavItems).length
        )
      };
    }
  });

  root.featureRegistry.register({
    id: "dashboard-assignments",
    isEnabled: (settings, context) =>
      Boolean(context.pageType === "dashboard" && settings.showDashboardTodoList),
    mount(settings, context, options) {
      return root.dashboard
        ? root.dashboard.renderPendingAssignmentsWidget(settings, options.assignmentSnapshot)
        : null;
    },
    teardown() {
      if (root.dashboard) {
        root.dashboard.teardown();
      }
    },
    getSnapshot() {
      return root.dashboard ? root.dashboard.getSnapshot() : null;
    },
    getStyles(settings) {
      return root.dashboard ? root.dashboard.getStyles(settings) : "";
    }
  });

  root.featureRegistry.register({
    id: "custom-assignment-modal",
    isEnabled: (settings, context) =>
      Boolean(context.pageType === "dashboard" && settings.showDashboardTodoList),
    mount() {
      if (root.customAssignmentModal) {
        root.customAssignmentModal.sync({
          enabled: true
        });
      }

      return root.customAssignmentModal ? root.customAssignmentModal.getSnapshot() : null;
    },
    teardown() {
      if (root.customAssignmentModal) {
        root.customAssignmentModal.sync({
          enabled: false
        });
      }
    },
    getSnapshot() {
      return root.customAssignmentModal ? root.customAssignmentModal.getSnapshot() : null;
    },
    getStyles(settings) {
      return root.customAssignmentModal ? root.customAssignmentModal.getStyles(settings) : "";
    }
  });

  root.featureRegistry.register({
    id: "focused-page-shell",
    isEnabled: (settings, context) =>
      Boolean(
        root.ui.isEditorialPhaseActive(settings, "uiPhaseFocusedPages") &&
          root.focusedPages &&
          root.focusedPages.isFocusedPageContext(context)
      ),
    mount(settings, context) {
      return root.focusedPages ? root.focusedPages.sync(settings, context) : null;
    },
    teardown() {
      if (root.focusedPages) {
        root.focusedPages.teardown();
      }
    },
    getSnapshot() {
      return root.focusedPages ? root.focusedPages.getSnapshot() : null;
    }
  });
})();
