(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});

  function buildRuleDeclaration(settings) {
    if (settings.previewMode) {
      return `
        outline: 2px dashed #d97706 !important;
        outline-offset: 4px !important;
        background: rgba(217, 119, 6, 0.08) !important;
      `;
    }

    return "display: none !important;";
  }

  function buildManagedCss(settings) {
    const context = root.canvas.getPageContext();
    const declaration = buildRuleDeclaration(settings);
    const ruleBlocks = root.ruleEngine.getApplicableCssRules(settings, context).flatMap((rule) => {
      const selectors = root.ruleEngine.resolveSelectors(rule, settings, context);
      if (!selectors.length) {
        return [];
      }

      return [`${selectors.join(",\n")} {\n${declaration}\n}`];
    });

    return [root.themeStyles.buildBaseCss(settings), ...ruleBlocks].join("\n\n");
  }

  function ensureStyleElement(cssText) {
    let styleElement = document.getElementById(root.themeStyles.STYLE_ID);

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = root.themeStyles.STYLE_ID;
      document.documentElement.appendChild(styleElement);
    }

    styleElement.textContent = cssText;
  }

  function removeStyleElement() {
    const styleElement = document.getElementById(root.themeStyles.STYLE_ID);
    if (styleElement) {
      styleElement.remove();
    }
  }

  function resetManagedElements() {
    document.querySelectorAll("[data-blank-canvas-managed='true']").forEach((element) => {
      element.removeAttribute("data-blank-canvas-managed");
      element.removeAttribute("data-blank-canvas-rule");
      element.classList.remove("blank-canvas--managed-hide", "blank-canvas--preview-match");
    });
  }

  function markTargets(ruleId, elements, settings) {
    const safeElements = elements.filter((element) => !root.dashboardHeader.isProtectedElement(element));

    safeElements.forEach((element) => {
      element.setAttribute("data-blank-canvas-managed", "true");
      element.setAttribute("data-blank-canvas-rule", ruleId);
      element.classList.add(settings.previewMode ? "blank-canvas--preview-match" : "blank-canvas--managed-hide");
    });

    return safeElements.length;
  }

  function applyDomRules(settings) {
    const context = root.canvas.getPageContext();
    const appliedCounts = {};

    root.ruleEngine.getApplicableDomRules(settings, context).forEach((rule) => {
      const targets = root.ruleEngine.resolveTargets(rule, settings, context);
      appliedCounts[rule.id] = markTargets(rule.id, targets, settings);
    });

    return appliedCounts;
  }

  function teardown() {
    resetManagedElements();
    removeStyleElement();
    if (root.dashboard) {
      root.dashboard.teardown();
    }
    root.themeStyles.clearRootUiState();
    document.documentElement.classList.remove(
      "blank-canvas--enabled",
      "blank-canvas--dashboard",
      "blank-canvas--hide-right-sidebar",
      "blank-canvas--quiet-cards"
    );
  }

  function render(settings) {
    if (!root.canvas.isCanvasLikePage()) {
      teardown();
      return null;
    }

    const context = root.canvas.getPageContext();
    root.themeStyles.setRootClasses(settings);

    if (!settings.enabled) {
      teardown();
      return root.diagnostics.buildReport(settings);
    }

    resetManagedElements();
    ensureStyleElement(buildManagedCss(settings));
    const appliedCounts = applyDomRules(settings);
    const assignmentSnapshot =
      context.isDashboard && settings.showDashboardTodoList
        ? root.assignments.ensurePendingAssignments()
        : root.assignments.getSnapshot();
    const dashboardTodo = root.dashboard
      ? root.dashboard.renderPendingAssignmentsWidget(settings, assignmentSnapshot)
      : null;

    const report = root.diagnostics.buildReport(settings);
    report.domRuleApplications = appliedCounts;
    report.dashboardTodo = dashboardTodo;
    root.debug.log("renderer", "Rules rendered.", report);

    return report;
  }

  root.renderer = {
    STYLE_ID: root.themeStyles.STYLE_ID,
    render,
    teardown
  };
})();
