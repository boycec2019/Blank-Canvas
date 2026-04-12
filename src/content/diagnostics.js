(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});

  function buildReport(settings) {
    const context = root.canvas.getPageContext();
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
      isCanvasLike: root.canvas.isCanvasLikePage(),
      previewMode: Boolean(settings.previewMode),
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
