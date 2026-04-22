(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});
  const STYLE_ID = "blank-canvas-managed-style";
  const LAYOUT_CLASS_PREFIX = "blank-canvas--layout-";
  const EDITORIAL_PHASE_SELECTOR =
    "html.blank-canvas--layout-editorial.blank-canvas--phase-typography-reset";
  const DASHBOARD_SHELL_PHASE_SELECTOR =
    "html.blank-canvas--layout-editorial.blank-canvas--phase-dashboard-shell";
  const LEFT_RAIL_PHASE_SELECTOR =
    "html.blank-canvas--layout-editorial.blank-canvas--phase-left-rail-simplification";

  function editorialTypographyResetCss() {
    return `
      ${EDITORIAL_PHASE_SELECTOR} body {
        background: var(--blank-canvas-page-background) !important;
        background-attachment: fixed !important;
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
      ${EDITORIAL_PHASE_SELECTOR} .ic-app-nav-toggle-and-crumbs,
      ${EDITORIAL_PHASE_SELECTOR} .ic-app-crumbs,
      ${EDITORIAL_PHASE_SELECTOR} .ic-app-crumbs--secondary,
      ${EDITORIAL_PHASE_SELECTOR} .ic-app-main-content__secondary,
      ${EDITORIAL_PHASE_SELECTOR} .module-sequence-footer,
      ${EDITORIAL_PHASE_SELECTOR} .module-sequence-footer-content,
      ${EDITORIAL_PHASE_SELECTOR} .module-sequence-footer-left,
      ${EDITORIAL_PHASE_SELECTOR} .module-sequence-footer-right,
      ${EDITORIAL_PHASE_SELECTOR} #breadcrumbs,
      ${EDITORIAL_PHASE_SELECTOR} [data-testid='breadcrumbs'],
      ${EDITORIAL_PHASE_SELECTOR} .header-bar,
      ${EDITORIAL_PHASE_SELECTOR} .header-bar-outer-container,
      ${EDITORIAL_PHASE_SELECTOR} .page-title,
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

      ${EDITORIAL_PHASE_SELECTOR} .item-group-container,
      ${EDITORIAL_PHASE_SELECTOR} #ag-list,
      ${EDITORIAL_PHASE_SELECTOR} .item-group-condensed,
      ${EDITORIAL_PHASE_SELECTOR} .assignment_group,
      ${EDITORIAL_PHASE_SELECTOR} .collectionViewItems.ig-list {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
      }

      ${EDITORIAL_PHASE_SELECTOR} .item-group-container,
      ${EDITORIAL_PHASE_SELECTOR} #ag-list {
        margin-top: 0 !important;
        margin-bottom: 0 !important;
        padding-top: 0 !important;
        padding-bottom: 0 !important;
      }

      ${EDITORIAL_PHASE_SELECTOR} .item-group-condensed {
        margin-bottom: 24px !important;
      }

      ${EDITORIAL_PHASE_SELECTOR} .assignment_group {
        margin: 0 !important;
      }

      ${EDITORIAL_PHASE_SELECTOR} .ig-header {
        background: rgba(255, 255, 255, 0.68) !important;
        border: 1px solid var(--blank-canvas-border-subtle) !important;
        border-bottom: none !important;
        border-radius: 18px 18px 0 0 !important;
        box-shadow: none !important;
      }

      ${EDITORIAL_PHASE_SELECTOR} .assignment-list {
        background: rgba(255, 255, 255, 0.52) !important;
        border: 1px solid var(--blank-canvas-border-subtle) !important;
        border-top: none !important;
        border-radius: 0 0 18px 18px !important;
        box-shadow: none !important;
      }

      ${EDITORIAL_PHASE_SELECTOR} .ig-row,
      ${EDITORIAL_PHASE_SELECTOR} .ig-row__layout {
        background: transparent !important;
        box-shadow: none !important;
      }
    `;
  }

  function editorialDashboardShellCss() {
    return `
      ${DASHBOARD_SHELL_PHASE_SELECTOR} #application,
      ${DASHBOARD_SHELL_PHASE_SELECTOR} .ic-app-main-content,
      ${DASHBOARD_SHELL_PHASE_SELECTOR} #dashboard_container {
        background: transparent !important;
      }

      ${DASHBOARD_SHELL_PHASE_SELECTOR} .ic-DashboardLayout {
        display: block !important;
        max-width: none !important;
        padding: 0 !important;
      }

      ${DASHBOARD_SHELL_PHASE_SELECTOR} .ic-DashboardLayout__Main,
      ${DASHBOARD_SHELL_PHASE_SELECTOR} #dashboard {
        width: min(1480px, calc(100vw - 160px)) !important;
        max-width: 1480px !important;
        margin: 0 auto !important;
        padding: 52px 44px 80px !important;
        box-sizing: border-box !important;
      }

      ${DASHBOARD_SHELL_PHASE_SELECTOR}.blank-canvas--hide-right-sidebar .ic-DashboardLayout__Main,
      ${DASHBOARD_SHELL_PHASE_SELECTOR}.blank-canvas--hide-right-sidebar #dashboard {
        width: min(1480px, calc(100vw - 160px)) !important;
        max-width: 1480px !important;
      }

      ${DASHBOARD_SHELL_PHASE_SELECTOR} #dashboard {
        display: grid !important;
        gap: 44px !important;
        align-content: start !important;
      }

      ${DASHBOARD_SHELL_PHASE_SELECTOR} .ic-Dashboard-header,
      ${DASHBOARD_SHELL_PHASE_SELECTOR} .ic-Dashboard-header__layout,
      ${DASHBOARD_SHELL_PHASE_SELECTOR} #dashboard > header,
      ${DASHBOARD_SHELL_PHASE_SELECTOR} #dashboard > div:first-child {
        margin: 0 !important;
      }

      ${DASHBOARD_SHELL_PHASE_SELECTOR} .ic-Dashboard-header,
      ${DASHBOARD_SHELL_PHASE_SELECTOR} .ic-Dashboard-header__layout {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 20px !important;
        padding: 0 !important;
      }

      ${DASHBOARD_SHELL_PHASE_SELECTOR} .ic-Dashboard-header__layout h1,
      ${DASHBOARD_SHELL_PHASE_SELECTOR} .ic-Dashboard-header h1,
      ${DASHBOARD_SHELL_PHASE_SELECTOR} #dashboard h1 {
        margin: 0 !important;
      }

      ${DASHBOARD_SHELL_PHASE_SELECTOR} .ic-Dashboard-header__layout > div:first-child,
      ${DASHBOARD_SHELL_PHASE_SELECTOR} .ic-Dashboard-header > div:first-child {
        flex: 1 1 auto !important;
        min-width: 0 !important;
      }

      ${DASHBOARD_SHELL_PHASE_SELECTOR} .ic-Dashboard-header__layout > div:last-child,
      ${DASHBOARD_SHELL_PHASE_SELECTOR} .ic-Dashboard-header > div:last-child,
      ${DASHBOARD_SHELL_PHASE_SELECTOR} .ic-Dashboard-header__layout > form,
      ${DASHBOARD_SHELL_PHASE_SELECTOR} .ic-Dashboard-header > form {
        flex: 0 0 auto !important;
      }

      ${DASHBOARD_SHELL_PHASE_SELECTOR} #DashboardCard_Container {
        margin: 0 !important;
      }

      ${DASHBOARD_SHELL_PHASE_SELECTOR} #DashboardCard_Container > div,
      ${DASHBOARD_SHELL_PHASE_SELECTOR} #DashboardCard_Container .ic-DashboardCard__box,
      ${DASHBOARD_SHELL_PHASE_SELECTOR} #DashboardCard_Container .ic-DashboardCard__box__container {
        margin-top: 0 !important;
      }

      ${DASHBOARD_SHELL_PHASE_SELECTOR} #DashboardCard_Container .ic-DashboardCard {
        min-height: 0 !important;
      }

      ${DASHBOARD_SHELL_PHASE_SELECTOR}.blank-canvas--dashboard footer,
      ${DASHBOARD_SHELL_PHASE_SELECTOR}.blank-canvas--dashboard [role='contentinfo'],
      ${DASHBOARD_SHELL_PHASE_SELECTOR}.blank-canvas--dashboard .ic-app-footer,
      ${DASHBOARD_SHELL_PHASE_SELECTOR}.blank-canvas--dashboard #footer,
      ${DASHBOARD_SHELL_PHASE_SELECTOR}.blank-canvas--dashboard #footer-links {
        display: none !important;
      }

      ${DASHBOARD_SHELL_PHASE_SELECTOR}.blank-canvas--dashboard hr:has(+ footer),
      ${DASHBOARD_SHELL_PHASE_SELECTOR}.blank-canvas--dashboard hr:has(+ [role='contentinfo']),
      ${DASHBOARD_SHELL_PHASE_SELECTOR}.blank-canvas--dashboard hr:has(+ .ic-app-footer),
      ${DASHBOARD_SHELL_PHASE_SELECTOR}.blank-canvas--dashboard hr:has(+ #footer),
      ${DASHBOARD_SHELL_PHASE_SELECTOR}.blank-canvas--dashboard footer + hr,
      ${DASHBOARD_SHELL_PHASE_SELECTOR}.blank-canvas--dashboard [role='contentinfo'] + hr,
      ${DASHBOARD_SHELL_PHASE_SELECTOR}.blank-canvas--dashboard .ic-app-footer + hr,
      ${DASHBOARD_SHELL_PHASE_SELECTOR}.blank-canvas--dashboard #footer + hr {
        display: none !important;
      }

      ${DASHBOARD_SHELL_PHASE_SELECTOR} #DashboardCard_Container,
      ${DASHBOARD_SHELL_PHASE_SELECTOR} #DashboardCard_Container > div {
        display: grid !important;
        gap: 22px !important;
      }

      ${DASHBOARD_SHELL_PHASE_SELECTOR} .ic-Dashboard-header__layout,
      ${DASHBOARD_SHELL_PHASE_SELECTOR} .ic-Dashboard-header {
        padding: 0 !important;
      }

      ${DASHBOARD_SHELL_PHASE_SELECTOR} .ic-Dashboard-header__layout form,
      ${DASHBOARD_SHELL_PHASE_SELECTOR} .ic-Dashboard-header form {
        margin: 0 !important;
      }

      @media (max-width: 1100px) {
        ${DASHBOARD_SHELL_PHASE_SELECTOR} .ic-DashboardLayout__Main,
        ${DASHBOARD_SHELL_PHASE_SELECTOR} #dashboard,
        ${DASHBOARD_SHELL_PHASE_SELECTOR}.blank-canvas--hide-right-sidebar .ic-DashboardLayout__Main,
        ${DASHBOARD_SHELL_PHASE_SELECTOR}.blank-canvas--hide-right-sidebar #dashboard {
          width: calc(100vw - 132px) !important;
          padding: 40px 30px 68px !important;
        }
      }

      @media (max-width: 720px) {
        ${DASHBOARD_SHELL_PHASE_SELECTOR} .ic-DashboardLayout__Main,
        ${DASHBOARD_SHELL_PHASE_SELECTOR} #dashboard,
        ${DASHBOARD_SHELL_PHASE_SELECTOR}.blank-canvas--hide-right-sidebar .ic-DashboardLayout__Main,
        ${DASHBOARD_SHELL_PHASE_SELECTOR}.blank-canvas--hide-right-sidebar #dashboard {
          width: calc(100vw - 88px) !important;
          padding: 28px 20px 52px !important;
          gap: 32px !important;
        }

        ${DASHBOARD_SHELL_PHASE_SELECTOR} .ic-Dashboard-header,
        ${DASHBOARD_SHELL_PHASE_SELECTOR} .ic-Dashboard-header__layout {
          align-items: flex-start !important;
          flex-direction: column !important;
        }

        ${DASHBOARD_SHELL_PHASE_SELECTOR} .ic-Dashboard-header__layout form,
        ${DASHBOARD_SHELL_PHASE_SELECTOR} .ic-Dashboard-header form {
          width: 100% !important;
          box-sizing: border-box !important;
        }
      }
    `;
  }

  function editorialLeftRailCss() {
    const railSurface = "#fffaf7";
    const railBorder = "rgba(18, 60, 47, 0.12)";
    const railHoverSurface = "rgba(18, 60, 47, 0.055)";
    const railSelectedSurface = "rgba(18, 60, 47, 0.095)";
    const railInk = "rgba(18, 60, 47, 0.66)";
    const railSelectedInk = railInk;
    const railMarker = "rgba(18, 60, 47, 0.82)";
    const routeSelectedNavSelectors = root.globalNav.ROUTE_KEYS
      .filter((routeKey) => routeKey !== "dashboard")
      .map((routeKey) => {
        const routeClassName = root.globalNav.getRouteClassName(routeKey);
        const listItemSelector = root.globalNav.getRouteSelectedListItemSelector(routeKey);
        return routeClassName && listItemSelector
          ? `${LEFT_RAIL_PHASE_SELECTOR}.${routeClassName} ${listItemSelector}`
          : "";
      })
      .filter(Boolean)
      .join(",\n");
    const routeSelectedSurfaceSelectors = root.globalNav.ROUTE_KEYS
      .filter((routeKey) => routeKey !== "dashboard")
      .flatMap((routeKey) => {
        const routeClassName = root.globalNav.getRouteClassName(routeKey);
        return root.globalNav.getRouteSelectedSurfaceSelectors(routeKey).map((selector) =>
          `${LEFT_RAIL_PHASE_SELECTOR}.${routeClassName} ${selector}`
        );
      })
      .filter(Boolean)
      .join(",\n");
    const routeSelectedInkSelectors = root.globalNav.ROUTE_KEYS
      .filter((routeKey) => routeKey !== "dashboard")
      .flatMap((routeKey) => {
        const routeClassName = root.globalNav.getRouteClassName(routeKey);
        const linkSelector = root.globalNav.getGlobalNavLinkSelector(routeKey);
        return routeClassName && linkSelector
          ? [
              `${LEFT_RAIL_PHASE_SELECTOR}.${routeClassName} ${linkSelector}`,
              `${LEFT_RAIL_PHASE_SELECTOR}.${routeClassName} ${linkSelector} *`
            ]
          : [];
      })
      .join(",\n");

    return `
      ${LEFT_RAIL_PHASE_SELECTOR} #menu,
      ${LEFT_RAIL_PHASE_SELECTOR} .ic-app-header,
      ${LEFT_RAIL_PHASE_SELECTOR} .ic-app-header__main-navigation,
      ${LEFT_RAIL_PHASE_SELECTOR} .ic-app-header__menu-list {
        background: ${railSurface} !important;
        background-color: ${railSurface} !important;
        background-image: none !important;
        border: none !important;
        box-shadow: none !important;
        outline: none !important;
      }

      ${LEFT_RAIL_PHASE_SELECTOR} #menu,
      ${LEFT_RAIL_PHASE_SELECTOR} .ic-app-header {
        border-right: 1px solid ${railBorder} !important;
        color: ${railInk} !important;
        container-type: inline-size !important;
        overflow-x: hidden !important;
      }

      ${LEFT_RAIL_PHASE_SELECTOR} #menu .ic-app-header__menu-list,
      ${LEFT_RAIL_PHASE_SELECTOR} .ic-app-header__menu-list {
        display: grid !important;
        gap: 6px !important;
        align-content: start !important;
        padding: 10px 0 !important;
      }

      ${LEFT_RAIL_PHASE_SELECTOR} #menu li,
      ${LEFT_RAIL_PHASE_SELECTOR} .ic-app-header__menu-list-item {
        display: flex !important;
        justify-content: center !important;
        width: 100% !important;
        min-height: 0 !important;
        padding: 0 !important;
      }

      ${LEFT_RAIL_PHASE_SELECTOR} #menu .menu-item,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu .menu-item-container,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu .menu-item-icon-container,
      ${LEFT_RAIL_PHASE_SELECTOR} .ic-app-header__menu-list-item,
      ${LEFT_RAIL_PHASE_SELECTOR} .ic-app-header__menu-list-item > * {
        background: ${railSurface} !important;
        background-color: ${railSurface} !important;
        background-image: none !important;
        box-shadow: none !important;
        border: none !important;
        border-color: transparent !important;
        outline: none !important;
        position: relative !important;
      }

      ${LEFT_RAIL_PHASE_SELECTOR} #menu .menu-item-container,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu .menu-item-icon-container,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu .ic-app-header__menu-list-item > a,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu .ic-app-header__menu-list-item > button,
      ${LEFT_RAIL_PHASE_SELECTOR} .ic-app-header__menu-list-link {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 44px !important;
        min-width: 44px !important;
        height: 44px !important;
        min-height: 44px !important;
        margin: 0 auto !important;
        padding: 0 !important;
        border-radius: 14px !important;
        box-sizing: border-box !important;
      }

      ${LEFT_RAIL_PHASE_SELECTOR} #menu a,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu a[id^='global_nav_'],
      ${LEFT_RAIL_PHASE_SELECTOR} #menu button,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu .menu-item__text,
      ${LEFT_RAIL_PHASE_SELECTOR} .ic-app-header__menu-list-link,
      ${LEFT_RAIL_PHASE_SELECTOR} .ic-app-header__menu-list-link span,
      ${LEFT_RAIL_PHASE_SELECTOR} .ic-app-header__menu-list-link svg {
        color: ${railInk} !important;
        fill: currentColor !important;
        background: transparent !important;
        background-color: transparent !important;
        background-image: none !important;
        box-shadow: none !important;
        filter: none !important;
        opacity: 0.88 !important;
        border: none !important;
        outline: none !important;
        text-decoration: none !important;
      }

      ${LEFT_RAIL_PHASE_SELECTOR} #menu a svg,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu a svg *,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu button svg,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu button svg *,
      ${LEFT_RAIL_PHASE_SELECTOR} .ic-app-header__menu-list-link svg,
      ${LEFT_RAIL_PHASE_SELECTOR} .ic-app-header__menu-list-link svg * {
        fill: currentColor !important;
        stroke: currentColor !important;
        filter: none !important;
        opacity: 0.88 !important;
      }

      ${LEFT_RAIL_PHASE_SELECTOR} #menu a svg,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu button svg,
      ${LEFT_RAIL_PHASE_SELECTOR} .ic-app-header__menu-list-link svg {
        width: 22px !important;
        height: 22px !important;
      }

      ${LEFT_RAIL_PHASE_SELECTOR} #menu .menu-item__text,
      ${LEFT_RAIL_PHASE_SELECTOR} .ic-app-header__menu-list-link span {
        font-size: 0.82rem !important;
        letter-spacing: 0.01em !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }

      ${LEFT_RAIL_PHASE_SELECTOR} #menu .menu-item__text {
        display: none !important;
      }

      ${LEFT_RAIL_PHASE_SELECTOR} body.primary-nav-expanded #menu,
      ${LEFT_RAIL_PHASE_SELECTOR} body.primary-nav-expanded .ic-app-header {
        width: 88px !important;
        min-width: 88px !important;
        max-width: 88px !important;
        overflow-x: hidden !important;
      }

      ${LEFT_RAIL_PHASE_SELECTOR} body.primary-nav-expanded #menu li,
      ${LEFT_RAIL_PHASE_SELECTOR} body.primary-nav-expanded .ic-app-header__menu-list-item {
        justify-content: center !important;
      }

      ${LEFT_RAIL_PHASE_SELECTOR} body.primary-nav-expanded #menu .menu-item-container,
      ${LEFT_RAIL_PHASE_SELECTOR} body.primary-nav-expanded #menu .menu-item-icon-container,
      ${LEFT_RAIL_PHASE_SELECTOR} body.primary-nav-expanded #menu .ic-app-header__menu-list-item > a,
      ${LEFT_RAIL_PHASE_SELECTOR} body.primary-nav-expanded #menu .ic-app-header__menu-list-item > button,
      ${LEFT_RAIL_PHASE_SELECTOR} body.primary-nav-expanded .ic-app-header__menu-list-link {
        flex-direction: column !important;
        justify-content: center !important;
        align-items: center !important;
        gap: 2px !important;
        width: calc(100% - 8px) !important;
        min-width: 0 !important;
        height: auto !important;
        min-height: 50px !important;
        padding: 4px 4px !important;
      }

      ${LEFT_RAIL_PHASE_SELECTOR} body.primary-nav-expanded #menu .menu-item__text {
        display: block !important;
        flex: 0 1 auto !important;
        min-width: 0 !important;
        max-width: 100% !important;
        opacity: 1 !important;
        text-align: center !important;
        white-space: normal !important;
        line-height: 1 !important;
      }

      ${LEFT_RAIL_PHASE_SELECTOR} #menu .menu-item-icon-container,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu .menu-item-container,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu .menu-item-icon-container a,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu .ic-app-header__menu-list-item > button,
      ${LEFT_RAIL_PHASE_SELECTOR} .ic-app-header__menu-list-item,
      ${LEFT_RAIL_PHASE_SELECTOR} .ic-app-header__menu-list-link {
        background: ${railSurface} !important;
        background-color: ${railSurface} !important;
        background-image: none !important;
        box-shadow: none !important;
        border: none !important;
        outline: none !important;
      }

      ${LEFT_RAIL_PHASE_SELECTOR} #menu .menu-item-icon-container {
        isolation: isolate !important;
        overflow: hidden !important;
      }

      ${LEFT_RAIL_PHASE_SELECTOR} #menu .menu-item-icon-container:hover,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu .menu-item-container:hover,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu .menu-item-icon-container:focus-within,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu .menu-item-container:focus-within,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu .ic-app-header__menu-list-item > button:hover,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu .ic-app-header__menu-list-item > button:focus-visible,
      ${LEFT_RAIL_PHASE_SELECTOR} .ic-app-header__menu-list-item a:hover,
      ${LEFT_RAIL_PHASE_SELECTOR} .ic-app-header__menu-list-item a:focus-visible {
        background: ${railHoverSurface} !important;
        background-color: ${railHoverSurface} !important;
        background-image: none !important;
        box-shadow: none !important;
        border-radius: 14px !important;
      }

      ${LEFT_RAIL_PHASE_SELECTOR} #menu .menu-item-icon-container.ic-app-header__menu-list-item--active,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu .ic-app-header__menu-list-item--active > button {
        background: ${railSelectedSurface} !important;
        background-color: ${railSelectedSurface} !important;
        background-image: none !important;
        border-radius: 14px !important;
        border-left: none !important;
        box-shadow: none !important;
        outline: none !important;
      }

      ${LEFT_RAIL_PHASE_SELECTOR} #menu .menu-item-container.ic-app-header__menu-list-item--active,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu .ic-app-header__menu-list-item--active,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu li.ic-app-header__menu-list-item.ic-app-header__menu-list-item--active,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu .ic-app-header__menu-list-item--active > a[id^='global_nav_'] {
        background: transparent !important;
        background-color: transparent !important;
        background-image: none !important;
        border-left: none !important;
        box-shadow: none !important;
        outline: none !important;
      }

      ${LEFT_RAIL_PHASE_SELECTOR} #menu a.active,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu a[aria-current='page'],
      ${LEFT_RAIL_PHASE_SELECTOR} #menu a[id^='global_nav_'],
      ${LEFT_RAIL_PHASE_SELECTOR} #menu .ic-app-header__menu-list-item > button,
      ${LEFT_RAIL_PHASE_SELECTOR} #global_nav_dashboard_link,
      ${LEFT_RAIL_PHASE_SELECTOR} #global_nav_dashboard_link.active,
      ${LEFT_RAIL_PHASE_SELECTOR} #global_nav_dashboard_link[aria-current='page'] {
        background: transparent !important;
        background-color: transparent !important;
        background-image: none !important;
        box-shadow: none !important;
        border-radius: 14px !important;
        filter: none !important;
      }

      ${LEFT_RAIL_PHASE_SELECTOR} #menu .menu-item-icon-container.ic-app-header__menu-list-item--active::before,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu .menu-item-icon-container.ic-app-header__menu-list-item--active::after,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu .ic-app-header__menu-list-item--active > button::before,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu .ic-app-header__menu-list-item--active > button::after,
      ${LEFT_RAIL_PHASE_SELECTOR} .ic-app-header__menu-list-item--active::before,
      ${LEFT_RAIL_PHASE_SELECTOR} .ic-app-header__menu-list-item--active::after,
      ${LEFT_RAIL_PHASE_SELECTOR} #global_nav_dashboard_link.active::before,
      ${LEFT_RAIL_PHASE_SELECTOR} #global_nav_dashboard_link.active::after,
      ${LEFT_RAIL_PHASE_SELECTOR} #global_nav_dashboard_link[aria-current='page']::before,
      ${LEFT_RAIL_PHASE_SELECTOR} #global_nav_dashboard_link[aria-current='page']::after {
        display: none !important;
        content: none !important;
      }

      ${LEFT_RAIL_PHASE_SELECTOR} #menu .menu-item-icon-container.ic-app-header__menu-list-item--active a,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu .menu-item-icon-container a.active,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu .ic-app-header__menu-list-item--active > button,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu .ic-app-header__menu-list-item--active > button *,
      ${LEFT_RAIL_PHASE_SELECTOR} #global_nav_dashboard_link,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu .menu-item-icon-container.ic-app-header__menu-list-item--active .menu-item__text,
      ${LEFT_RAIL_PHASE_SELECTOR} .ic-app-header__menu-list-item--active .ic-app-header__menu-list-link,
      ${LEFT_RAIL_PHASE_SELECTOR} .ic-app-header__menu-list-item--active .ic-app-header__menu-list-link span,
      ${LEFT_RAIL_PHASE_SELECTOR} .ic-app-header__menu-list-link[aria-current='page'],
      ${LEFT_RAIL_PHASE_SELECTOR} .ic-app-header__menu-list-link[aria-current='page'] span {
        color: ${railSelectedInk} !important;
        filter: none !important;
        opacity: 1 !important;
      }

      ${LEFT_RAIL_PHASE_SELECTOR} #menu .menu-item-icon-container.ic-app-header__menu-list-item--active svg,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu a.active svg,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu .ic-app-header__menu-list-item--active > button svg,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu .ic-app-header__menu-list-item--active > button svg *,
      ${LEFT_RAIL_PHASE_SELECTOR} #global_nav_dashboard_link svg,
      ${LEFT_RAIL_PHASE_SELECTOR} .ic-app-header__menu-list-item--active svg,
      ${LEFT_RAIL_PHASE_SELECTOR} .ic-app-header__menu-list-link[aria-current='page'] svg {
        fill: currentColor !important;
        stroke: currentColor !important;
        filter: none !important;
        opacity: 1 !important;
      }

      ${routeSelectedNavSelectors} {
        background: transparent !important;
        background-color: transparent !important;
        background-image: none !important;
        border-left: none !important;
        border-radius: 14px !important;
        box-shadow: none !important;
      }

      ${routeSelectedSurfaceSelectors} {
        background: ${railSelectedSurface} !important;
        background-color: ${railSelectedSurface} !important;
        background-image: linear-gradient(0deg, ${railSelectedSurface}, ${railSelectedSurface}) !important;
        border-radius: 14px !important;
        box-shadow: none !important;
      }

      ${routeSelectedInkSelectors} {
        color: ${railSelectedInk} !important;
        fill: currentColor !important;
        stroke: currentColor !important;
        filter: none !important;
        opacity: 1 !important;
      }

      ${LEFT_RAIL_PHASE_SELECTOR} #menu .ic-app-header__menu-list-item--active > a[id^='global_nav_'] > div.menu-item-icon-container,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu a[id^='global_nav_'].active > div.menu-item-icon-container,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu a[id^='global_nav_'][aria-current='page'] > div.menu-item-icon-container {
        background: ${railSelectedSurface} !important;
        background-color: ${railSelectedSurface} !important;
        background-image: linear-gradient(0deg, ${railSelectedSurface}, ${railSelectedSurface}) !important;
        border-left: none !important;
        border-radius: 14px !important;
        box-shadow: none !important;
      }

      ${LEFT_RAIL_PHASE_SELECTOR} #menu .ic-app-header__menu-list-item--active > button {
        background: ${railSelectedSurface} !important;
        background-color: ${railSelectedSurface} !important;
        background-image: linear-gradient(0deg, ${railSelectedSurface}, ${railSelectedSurface}) !important;
        border-left: none !important;
        border-radius: 14px !important;
        box-shadow: none !important;
      }

      ${LEFT_RAIL_PHASE_SELECTOR} #menu .menu-item-container.ic-app-header__menu-list-item--active:has(#global_nav_dashboard_link),
      ${LEFT_RAIL_PHASE_SELECTOR} #menu .ic-app-header__menu-list-item.ic-app-header__menu-list-item--active:has(#global_nav_dashboard_link),
      ${LEFT_RAIL_PHASE_SELECTOR} #menu li.ic-app-header__menu-list-item.ic-app-header__menu-list-item--active:has(#global_nav_dashboard_link) {
        border-left: none !important;
      }

      ${LEFT_RAIL_PHASE_SELECTOR} #menu .ic-app-header__menu-list-item--active > a[id^='global_nav_'] > div.menu-item-icon-container::after,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu .ic-app-header__menu-list-item--active > button::after,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu a[id^='global_nav_'].active > div.menu-item-icon-container::after,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu a[id^='global_nav_'][aria-current='page'] > div.menu-item-icon-container::after {
        display: none !important;
        content: none !important;
      }

      ${LEFT_RAIL_PHASE_SELECTOR} #menu .ic-app-header__menu-list-item--active > a[id^='global_nav_'] > div.menu-item-icon-container,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu .ic-app-header__menu-list-item--active > a[id^='global_nav_'] > div.menu-item-icon-container *,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu .ic-app-header__menu-list-item--active > a[id^='global_nav_'] > div.menu-item-icon-container svg,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu .ic-app-header__menu-list-item--active > a[id^='global_nav_'] > div.menu-item-icon-container svg *,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu .ic-app-header__menu-list-item--active > button,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu .ic-app-header__menu-list-item--active > button *,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu a[id^='global_nav_'].active > div.menu-item-icon-container,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu a[id^='global_nav_'].active > div.menu-item-icon-container *,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu a[id^='global_nav_'].active > div.menu-item-icon-container svg,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu a[id^='global_nav_'].active > div.menu-item-icon-container svg *,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu a[id^='global_nav_'][aria-current='page'] > div.menu-item-icon-container,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu a[id^='global_nav_'][aria-current='page'] > div.menu-item-icon-container *,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu a[id^='global_nav_'][aria-current='page'] > div.menu-item-icon-container svg,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu a[id^='global_nav_'][aria-current='page'] > div.menu-item-icon-container svg * {
        color: ${railSelectedInk} !important;
        fill: currentColor !important;
        stroke: currentColor !important;
        filter: none !important;
        opacity: 1 !important;
      }

      ${LEFT_RAIL_PHASE_SELECTOR} #menu .ic-app-header__logomark-container,
      ${LEFT_RAIL_PHASE_SELECTOR} .ic-app-header__logomark-container {
        background: transparent !important;
        box-shadow: none !important;
      }

      ${LEFT_RAIL_PHASE_SELECTOR} #menu .menu-item__badge,
      ${LEFT_RAIL_PHASE_SELECTOR} .ic-app-header__menu-list-badge {
        box-shadow: none !important;
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

      ${root.ui.isEditorialPhaseActive(settings, root.ui.PHASE_DASHBOARD_SHELL)
        ? editorialDashboardShellCss()
        : ""}

      ${root.ui.isEditorialPhaseActive(settings, root.ui.PHASE_LEFT_RAIL_SIMPLIFICATION)
        ? editorialLeftRailCss()
        : ""}

      ${root.featureRegistry
        ? root.featureRegistry.getStyles(settings)
        : [
            root.uiPrimitives ? root.uiPrimitives.getStyles(settings) : "",
            root.dashboard ? root.dashboard.getStyles(settings) : "",
            root.customAssignmentModal ? root.customAssignmentModal.getStyles(settings) : ""
          ].join("\n\n")}

      .blank-canvas--managed-hide {
        display: none !important;
      }

      html #menu .blank-canvas--managed-hide,
      html #menu li.blank-canvas--managed-hide,
      html #menu a.blank-canvas--managed-hide,
      html #menu button.blank-canvas--managed-hide,
      html .ic-app-header .blank-canvas--managed-hide,
      html .ic-app-header li.blank-canvas--managed-hide,
      html .ic-app-header a.blank-canvas--managed-hide,
      html .ic-app-header button.blank-canvas--managed-hide,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu .blank-canvas--managed-hide,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu li.blank-canvas--managed-hide,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu a.blank-canvas--managed-hide,
      ${LEFT_RAIL_PHASE_SELECTOR} #menu button.blank-canvas--managed-hide,
      ${LEFT_RAIL_PHASE_SELECTOR} .ic-app-header .blank-canvas--managed-hide,
      ${LEFT_RAIL_PHASE_SELECTOR} .ic-app-header li.blank-canvas--managed-hide,
      ${LEFT_RAIL_PHASE_SELECTOR} .ic-app-header a.blank-canvas--managed-hide,
      ${LEFT_RAIL_PHASE_SELECTOR} .ic-app-header button.blank-canvas--managed-hide {
        display: none !important;
      }

      .blank-canvas--preview-match {
        outline: 2px dashed #d97706 !important;
        outline-offset: 4px !important;
        background: rgba(217, 119, 6, 0.08) !important;
      }
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
    root.globalNav.ROUTE_KEYS.forEach((routeKey) => {
      rootElement.classList.toggle(
        root.globalNav.getRouteClassName(routeKey),
        Boolean(settings.enabled && context.globalNavKey === routeKey)
      );
    });
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
    root.globalNav.ROUTE_KEYS.forEach((routeKey) => {
      rootElement.classList.remove(root.globalNav.getRouteClassName(routeKey));
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
