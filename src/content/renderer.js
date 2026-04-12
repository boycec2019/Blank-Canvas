(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});
  const STYLE_ID = "blank-canvas-managed-style";

  function baseStyle() {
    return `
      :root {
        --blank-canvas-font-sans: "Aptos", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
      }

      .blank-canvas--managed-hide {
        display: none !important;
      }

      .blank-canvas--preview-match {
        outline: 2px dashed #d97706 !important;
        outline-offset: 4px !important;
        background: rgba(217, 119, 6, 0.08) !important;
      }

      html.blank-canvas--hide-right-sidebar #dashboard,
      html.blank-canvas--hide-right-sidebar .ic-DashboardLayout__Main,
      html.blank-canvas--hide-right-sidebar #DashboardCard_Container {
        width: 100% !important;
        max-width: none !important;
        margin-right: 0 !important;
      }

      html.blank-canvas--hide-right-sidebar #dashboard_container,
      html.blank-canvas--hide-right-sidebar .ic-DashboardLayout {
        max-width: none !important;
      }

      html.blank-canvas--quiet-cards .ic-DashboardCard {
        border-radius: 18px !important;
        box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08) !important;
        overflow: hidden !important;
      }

      html.blank-canvas--quiet-cards .ic-DashboardCard__header_content {
        padding-top: 18px !important;
      }

      html.blank-canvas--dashboard body,
      html.blank-canvas--dashboard button,
      html.blank-canvas--dashboard input,
      html.blank-canvas--dashboard select,
      html.blank-canvas--dashboard textarea {
        font-family: var(--blank-canvas-font-sans) !important;
      }

      ${root.dashboard ? root.dashboard.getStyles() : ""}
    `;
  }

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

    return [baseStyle(), ...ruleBlocks].join("\n\n");
  }

  function ensureStyleElement(cssText) {
    let styleElement = document.getElementById(STYLE_ID);

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = STYLE_ID;
      document.documentElement.appendChild(styleElement);
    }

    styleElement.textContent = cssText;
  }

  function removeStyleElement() {
    const styleElement = document.getElementById(STYLE_ID);
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

  function setRootClasses(settings) {
    const rootElement = document.documentElement;
    const context = root.canvas.getPageContext();
    const quietCards =
      settings.hideCourseCardImages ||
      settings.hideCourseCardActions ||
      settings.hideCourseCardMeta ||
      settings.hideCourseCardMenu;

    rootElement.classList.toggle("blank-canvas--enabled", Boolean(settings.enabled));
    rootElement.classList.toggle(
      "blank-canvas--hide-right-sidebar",
      Boolean(settings.enabled && settings.hideRightSidebar)
    );
    rootElement.classList.toggle("blank-canvas--dashboard", Boolean(settings.enabled && context.isDashboard));
    rootElement.classList.toggle("blank-canvas--quiet-cards", Boolean(settings.enabled && quietCards));
  }

  function markTargets(ruleId, elements, settings) {
    elements.forEach((element) => {
      element.setAttribute("data-blank-canvas-managed", "true");
      element.setAttribute("data-blank-canvas-rule", ruleId);
      element.classList.add(settings.previewMode ? "blank-canvas--preview-match" : "blank-canvas--managed-hide");
    });

    return elements.length;
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
    setRootClasses(settings);

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
    render,
    teardown
  };
})();
