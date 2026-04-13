(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});

  function getMountedSurfaces() {
    const surfaces = [
      {
        id: "managed-style",
        label: "Managed stylesheet",
        mounted: Boolean(root.renderer && document.getElementById(root.renderer.STYLE_ID))
      },
      {
        id: "dashboard-shell",
        label: "Dashboard shell layout",
        mounted: Boolean(
          document.documentElement.classList.contains("blank-canvas--phase-dashboard-shell") &&
          document.querySelector(".ic-DashboardLayout__Main, #dashboard")
        )
      },
      {
        id: "left-rail-simplification",
        label: "Left rail simplification",
        mounted: Boolean(
          document.documentElement.classList.contains("blank-canvas--phase-left-rail-simplification") &&
          document.querySelector("#menu, .ic-app-header")
        )
      },
      {
        id: "dashboard-assignments-widget",
        label: "Dashboard assignments widget",
        mounted: Boolean(
          root.dashboardStyles && document.getElementById(root.dashboardStyles.WIDGET_ID)
        )
      },
      {
        id: "dashboard-agenda-list",
        label: "Dashboard agenda list",
        mounted: Boolean(
          document.documentElement.classList.contains("blank-canvas--phase-agenda-list") &&
          document.querySelector(`#${root.dashboardStyles ? root.dashboardStyles.WIDGET_ID : "blank-canvas-dashboard-todo"}[data-layout-variant='agenda']`)
        )
      }
    ];

    return surfaces;
  }

  function buildReport(settings) {
    const context = root.canvas.getPageContext();
    const uiLayoutMode = root.ui.getLayoutMode(settings);
    const uiPhaseStates = root.ui.getPhaseStates(settings);
    const mountedSurfaces = getMountedSurfaces();
    const dashboardHeader = root.dashboardHeader
      ? root.dashboardHeader.getDebugSnapshot()
      : null;
    const pendingAssignments = context.isDashboard && root.assignments
      ? root.assignments.getSnapshot()
      : {
          items: [],
          source: "none",
          status: "idle"
        };
    const dashboardTodo = root.dashboard ? root.dashboard.getSnapshot() : null;
    const cssRules = root.ruleEngine.getApplicableCssRules(settings, context).map((rule) => {
      const selectors = root.ruleEngine.resolveSelectors(rule, settings, context);
      const matches = root.utils.safeQueryAll(selectors);

      return {
        id: rule.id,
        label: rule.label,
        type: "css",
        matchedCount: matches.length,
        selectors
      };
    });

    const domRules = root.ruleEngine.getApplicableDomRules(settings, context).map((rule) => {
      const targets = root.ruleEngine.resolveTargets(rule, settings, context);

      return {
        id: rule.id,
        label: rule.label,
        type: "dom",
        matchedCount: targets.length,
        selectors: []
      };
    });

    return {
      url: window.location.href,
      pagePath: context.path,
      globalNavKey: context.globalNavKey,
      isCanvasLike: root.canvas.isCanvasLikePage(),
      previewMode: Boolean(settings.previewMode),
      uiLayoutMode,
      uiLayoutLabel: root.ui.getLayoutModeMeta(uiLayoutMode).label,
      uiActivePhases: uiPhaseStates.filter((phase) => phase.enabled).map((phase) => phase.id),
      uiPhaseStates,
      mountedSurfaces,
      dashboardHeader,
      managedElements: document.querySelectorAll("[data-blank-canvas-managed='true']").length,
      pendingAssignmentsError: pendingAssignments.error || null,
      pendingAssignmentsCount: pendingAssignments.items.length,
      pendingAssignmentsLastLoadedAt: pendingAssignments.lastLoadedAt || 0,
      pendingAssignmentsSource: pendingAssignments.source,
      pendingAssignmentsStatus: pendingAssignments.status,
      dashboardTodo,
      rules: [...cssRules, ...domRules],
      logEntries: root.debug.snapshot(),
      generatedAt: new Date().toISOString()
    };
  }

  root.diagnostics = {
    buildReport
  };
})();
