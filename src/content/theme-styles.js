(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});
  const STYLE_ID = "blank-canvas-managed-style";
  const LAYOUT_CLASS_PREFIX = "blank-canvas--layout-";
  const EDITORIAL_PHASE_SELECTOR =
    "html.blank-canvas--layout-editorial.blank-canvas--phase-typography-reset";

  function editorialTypographyResetCss() {
    return `
      ${EDITORIAL_PHASE_SELECTOR} body {
        background:
          radial-gradient(circle at top left, rgba(47, 93, 80, 0.05), transparent 22%),
          linear-gradient(180deg, var(--blank-canvas-color-bg) 0%, #f8f3eb 100%) !important;
        color: var(--blank-canvas-color-text) !important;
      }

      ${EDITORIAL_PHASE_SELECTOR} #application,
      ${EDITORIAL_PHASE_SELECTOR} #dashboard_container,
      ${EDITORIAL_PHASE_SELECTOR} .ic-DashboardLayout,
      ${EDITORIAL_PHASE_SELECTOR} .ic-DashboardLayout__Main {
        background: transparent !important;
      }

      ${EDITORIAL_PHASE_SELECTOR} .ic-Dashboard-header,
      ${EDITORIAL_PHASE_SELECTOR} .ic-Dashboard-header__layout,
      ${EDITORIAL_PHASE_SELECTOR} .ic-Dashboard-header__hero,
      ${EDITORIAL_PHASE_SELECTOR} .ic-Action-header,
      ${EDITORIAL_PHASE_SELECTOR} .ic-Action-header__Layout,
      ${EDITORIAL_PHASE_SELECTOR} #dashboard_header_container,
      ${EDITORIAL_PHASE_SELECTOR} #dashboard > header,
      ${EDITORIAL_PHASE_SELECTOR} #dashboard > div:first-child {
        background: transparent !important;
        box-shadow: none !important;
        border: none !important;
      }

      ${EDITORIAL_PHASE_SELECTOR}.blank-canvas--dashboard body,
      ${EDITORIAL_PHASE_SELECTOR}.blank-canvas--dashboard button,
      ${EDITORIAL_PHASE_SELECTOR}.blank-canvas--dashboard input,
      ${EDITORIAL_PHASE_SELECTOR}.blank-canvas--dashboard option,
      ${EDITORIAL_PHASE_SELECTOR}.blank-canvas--dashboard select,
      ${EDITORIAL_PHASE_SELECTOR}.blank-canvas--dashboard textarea {
        font-family: var(--blank-canvas-font-body) !important;
        color: var(--blank-canvas-color-text) !important;
      }

      ${EDITORIAL_PHASE_SELECTOR} .ic-app-header,
      ${EDITORIAL_PHASE_SELECTOR} .ic-app-header *,
      ${EDITORIAL_PHASE_SELECTOR} #dashboard,
      ${EDITORIAL_PHASE_SELECTOR} #dashboard *,
      ${EDITORIAL_PHASE_SELECTOR} #DashboardCard_Container,
      ${EDITORIAL_PHASE_SELECTOR} #DashboardCard_Container *,
      ${EDITORIAL_PHASE_SELECTOR} .ic-Dashboard-header__layout,
      ${EDITORIAL_PHASE_SELECTOR} .ic-Dashboard-header__layout * {
        font-family: var(--blank-canvas-font-body);
      }

      ${EDITORIAL_PHASE_SELECTOR} .ic-Dashboard-header__layout h1,
      ${EDITORIAL_PHASE_SELECTOR} .ic-Dashboard-header h1,
      ${EDITORIAL_PHASE_SELECTOR} #dashboard h1 {
        color: var(--blank-canvas-color-text) !important;
        font-family: var(--blank-canvas-font-heading) !important;
        font-weight: 600 !important;
        letter-spacing: -0.01em !important;
      }

      ${EDITORIAL_PHASE_SELECTOR} .ic-Dashboard-header__layout h1 + *,
      ${EDITORIAL_PHASE_SELECTOR} .ic-Dashboard-header h1 + * {
        font-family: var(--blank-canvas-font-body) !important;
      }

      ${EDITORIAL_PHASE_SELECTOR} .ic-Dashboard-header__layout p,
      ${EDITORIAL_PHASE_SELECTOR} .ic-Dashboard-header p,
      ${EDITORIAL_PHASE_SELECTOR} #dashboard p,
      ${EDITORIAL_PHASE_SELECTOR} .ic-DashboardCard__header-subtitle,
      ${EDITORIAL_PHASE_SELECTOR} .ic-DashboardCard__header-term {
        color: var(--blank-canvas-color-muted) !important;
      }

      ${EDITORIAL_PHASE_SELECTOR} form,
      ${EDITORIAL_PHASE_SELECTOR} input,
      ${EDITORIAL_PHASE_SELECTOR} button,
      ${EDITORIAL_PHASE_SELECTOR} select,
      ${EDITORIAL_PHASE_SELECTOR} textarea {
        font-family: var(--blank-canvas-font-body) !important;
      }

      ${EDITORIAL_PHASE_SELECTOR} input[type='search'],
      ${EDITORIAL_PHASE_SELECTOR} input[placeholder*='Search'],
      ${EDITORIAL_PHASE_SELECTOR} input[placeholder*='search'] {
        border: 1px solid var(--blank-canvas-border-strong) !important;
        border-radius: 14px !important;
        background: rgba(255, 255, 255, 0.62) !important;
        box-shadow: none !important;
        color: var(--blank-canvas-color-text) !important;
      }

      ${EDITORIAL_PHASE_SELECTOR} #DashboardCard_Container .ic-DashboardCard,
      ${EDITORIAL_PHASE_SELECTOR} .ic-DashboardCard {
        background: var(--blank-canvas-color-surface-elevated) !important;
        border: 1px solid var(--blank-canvas-border-subtle) !important;
        border-radius: 22px !important;
        box-shadow: 0 10px 24px rgba(50, 42, 29, 0.045) !important;
        overflow: hidden !important;
      }

      ${EDITORIAL_PHASE_SELECTOR} .ic-DashboardCard__header,
      ${EDITORIAL_PHASE_SELECTOR} .ic-DashboardCard__header_hero,
      ${EDITORIAL_PHASE_SELECTOR} .ic-DashboardCard__header_content {
        background: transparent !important;
      }

      ${EDITORIAL_PHASE_SELECTOR} .ic-DashboardCard__header_content {
        padding-top: 20px !important;
        padding-bottom: 20px !important;
      }

      ${EDITORIAL_PHASE_SELECTOR} .ic-DashboardCard__header-title,
      ${EDITORIAL_PHASE_SELECTOR} .ic-DashboardCard__header-title a,
      ${EDITORIAL_PHASE_SELECTOR} .ic-DashboardCard a.ic-DashboardCard__link {
        color: var(--blank-canvas-color-text) !important;
        font-family: var(--blank-canvas-font-body) !important;
        font-weight: 700 !important;
        font-size: 1rem !important;
        line-height: 1.3 !important;
        text-decoration: none !important;
      }

      ${EDITORIAL_PHASE_SELECTOR} .ic-DashboardCard__header-title a:hover,
      ${EDITORIAL_PHASE_SELECTOR} .ic-DashboardCard__header-title a:focus-visible,
      ${EDITORIAL_PHASE_SELECTOR} .ic-DashboardCard a.ic-DashboardCard__link:hover,
      ${EDITORIAL_PHASE_SELECTOR} .ic-DashboardCard a.ic-DashboardCard__link:focus-visible {
        color: var(--blank-canvas-color-accent) !important;
      }

      ${EDITORIAL_PHASE_SELECTOR} a,
      ${EDITORIAL_PHASE_SELECTOR} .btn-link {
        color: var(--blank-canvas-color-accent);
      }

      ${EDITORIAL_PHASE_SELECTOR} .ic-DashboardCard__header-subtitle,
      ${EDITORIAL_PHASE_SELECTOR} .ic-DashboardCard__header-term,
      ${EDITORIAL_PHASE_SELECTOR} .ic-DashboardCard__header_content span,
      ${EDITORIAL_PHASE_SELECTOR} .ic-DashboardCard__header_content p {
        font-family: var(--blank-canvas-font-body) !important;
      }

      ${EDITORIAL_PHASE_SELECTOR} .ic-DashboardCard:hover,
      ${EDITORIAL_PHASE_SELECTOR} .ic-DashboardCard:focus-within {
        box-shadow: 0 14px 30px rgba(50, 42, 29, 0.06) !important;
        border-color: var(--blank-canvas-border-hover) !important;
      }
    `;
  }

  function buildBaseCss(settings) {
    return `
      :root {
${root.ui.buildTokenCss(settings)}
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
        box-shadow: var(--blank-canvas-shadow-panel) !important;
        overflow: hidden !important;
      }

      html.blank-canvas--quiet-cards .ic-DashboardCard__header_content {
        padding-top: 18px !important;
      }

      html.blank-canvas--dashboard body,
      html.blank-canvas--dashboard button,
      html.blank-canvas--dashboard input,
      html.blank-canvas--dashboard option,
      html.blank-canvas--dashboard select,
      html.blank-canvas--dashboard textarea {
        font-family: var(--blank-canvas-font-body) !important;
      }

      ${root.ui.isEditorialPhaseActive(settings, root.ui.PHASE_TYPOGRAPHY_RESET)
        ? editorialTypographyResetCss()
        : ""}

      ${root.dashboard ? root.dashboard.getStyles() : ""}
    `;
  }

  function setRootClasses(settings) {
    const rootElement = document.documentElement;
    const context = root.canvas.getPageContext();
    const layoutMode = root.ui.getLayoutMode(settings);
    const activePhases = root.ui.getActivePhaseIds(settings);
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
    Object.keys(root.ui.layoutModes).forEach((modeId) => {
      rootElement.classList.toggle(`${LAYOUT_CLASS_PREFIX}${modeId}`, layoutMode === modeId);
    });
    root.ui.getPhaseDefinitions().forEach((phase) => {
      rootElement.classList.toggle(phase.className, Boolean(settings.enabled && settings[phase.id]));
    });
    rootElement.dataset.blankCanvasLayoutMode = layoutMode;
    rootElement.dataset.blankCanvasActivePhases = activePhases.join(" ");
  }

  function clearRootUiState() {
    const rootElement = document.documentElement;

    Object.keys(root.ui.layoutModes).forEach((modeId) => {
      rootElement.classList.remove(`${LAYOUT_CLASS_PREFIX}${modeId}`);
    });
    root.ui.getPhaseDefinitions().forEach((phase) => {
      rootElement.classList.remove(phase.className);
    });
    delete rootElement.dataset.blankCanvasLayoutMode;
    delete rootElement.dataset.blankCanvasActivePhases;
  }

  root.themeStyles = {
    STYLE_ID,
    buildBaseCss,
    setRootClasses,
    clearRootUiState
  };
})();
