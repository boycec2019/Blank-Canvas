(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});
  const HOST_ID = "blank-canvas-dashboard-sections";
  const WIDGET_ID = "blank-canvas-dashboard-todo";
  const DASHBOARD_UI_OVERHAUL_SELECTOR =
    "html.blank-canvas--layout-editorial.blank-canvas--phase-dashboard-ui-overhaul.blank-canvas--dashboard";

  function syncClassCardAccents(scope = document) {
    if (root.classCardAccents && typeof root.classCardAccents.sync === "function") {
      root.classCardAccents.sync(scope);
    }
  }

  function getDashboardUiOverhaulStyles(splitMinWidth) {
    return `
      ${DASHBOARD_UI_OVERHAUL_SELECTOR},
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} body {
        background: var(--blank-canvas-page-background) !important;
        background-attachment: fixed !important;
        color: var(--blank-canvas-color-text) !important;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} body {
        overflow-x: hidden !important;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #application,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} .ic-app-main-content,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #dashboard_container,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} .ic-DashboardLayout,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} .ic-DashboardLayout__Main,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #dashboard {
        background: transparent !important;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} .ic-DashboardLayout__Main,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #dashboard,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR}.blank-canvas--hide-right-sidebar .ic-DashboardLayout__Main,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR}.blank-canvas--hide-right-sidebar #dashboard {
        width: min(var(--blank-canvas-dashboard-page-width), calc(100vw - 160px)) !important;
        max-width: var(--blank-canvas-dashboard-page-width) !important;
        margin: 0 auto !important;
        padding: clamp(56px, 8vh, 92px) clamp(38px, 5vw, 76px) 78px !important;
        box-sizing: border-box !important;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #dashboard {
        display: grid !important;
        gap: 42px !important;
        align-content: start !important;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} .ic-Dashboard-header,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} .ic-Dashboard-header__layout {
        margin: 0 !important;
        padding: 0 !important;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} .ic-Dashboard-header__layout h1,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} .ic-Dashboard-header h1,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #dashboard h1 {
        max-width: 10ch !important;
        color: var(--blank-canvas-color-text) !important;
        font-family: var(--blank-canvas-font-heading) !important;
        font-size: var(--blank-canvas-font-size-display) !important;
        font-weight: 600 !important;
        letter-spacing: -0.06em !important;
        line-height: 0.92 !important;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} [data-blank-canvas-dashboard-layout='split'] {
        grid-template-columns: minmax(0, 1.38fr) minmax(280px, 0.62fr) !important;
        column-gap: var(--blank-canvas-dashboard-column-gap) !important;
        row-gap: 28px !important;
        align-items: start !important;
        overflow: visible !important;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} [data-blank-canvas-dashboard-layout='split'] #${HOST_ID},
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} [data-blank-canvas-dashboard-layout='split'] .ic-Dashboard-header,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} [data-blank-canvas-dashboard-layout='split'] .ic-Dashboard-header__layout {
        grid-column: 1 !important;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} [data-blank-canvas-dashboard-layout='split'] #DashboardCard_Container {
        grid-column: 2 !important;
        grid-row: 1 / span 3 !important;
        align-self: start !important;
        position: relative !important;
        z-index: 0 !important;
        isolation: isolate !important;
        overflow: visible !important;
        padding-right: 0 !important;
        padding: 34px 28px 30px 54px !important;
        min-width: 0 !important;
        max-width: 100% !important;
        border: 1px solid transparent !important;
        border-radius: 34px 6px 34px 6px !important;
        background: transparent !important;
        box-sizing: border-box !important;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} [data-blank-canvas-dashboard-layout='split'] #DashboardCard_Container::after {
        content: none;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} [data-blank-canvas-dashboard-layout='split'] #DashboardCard_Container,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} [data-blank-canvas-dashboard-layout='split'] #DashboardCard_Container > div,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} [data-blank-canvas-dashboard-layout='split'] #DashboardCard_Container .ic-DashboardCard__box,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} [data-blank-canvas-dashboard-layout='split'] #DashboardCard_Container .ic-DashboardCard__box__container,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} [data-blank-canvas-dashboard-layout='split'] #DashboardCard_Container .ic-DashboardCard {
        width: 100% !important;
        max-width: 440px !important;
        min-width: 0 !important;
        box-sizing: border-box !important;
        justify-self: stretch !important;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} [data-blank-canvas-dashboard-layout='split'] #DashboardCard_Container::before {
        content: "Classes";
        position: absolute;
        z-index: 1;
        left: 20px;
        top: 32px;
        color: rgba(17, 17, 17, 0.52);
        font-size: 0.72rem;
        font-weight: 600;
        letter-spacing: 0.18em;
        line-height: 1;
        text-transform: uppercase;
        writing-mode: vertical-rl;
        text-orientation: mixed;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} [data-blank-canvas-dashboard-layout='split'] #DashboardCard_Container > * {
        position: relative;
        z-index: 1;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #${HOST_ID} {
        gap: 0 !important;
        margin: 0 !important;
        min-width: 0 !important;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #${WIDGET_ID} {
        border: 1px solid var(--blank-canvas-border-subtle);
        border-left: 4px solid rgba(18, 60, 47, 0.86);
        border-radius: 6px 34px 34px 6px;
        background: var(--blank-canvas-surface-card);
        box-shadow: none;
        padding: clamp(22px, 3vw, 34px);
        color: var(--blank-canvas-color-text);
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #${WIDGET_ID} .blank-canvas__todo-header {
        align-items: center;
        margin-bottom: 16px;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #${WIDGET_ID} h2 {
        font-size: clamp(1.18rem, 1.8vw, 1.55rem);
        font-weight: 600;
        letter-spacing: -0.035em;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #${WIDGET_ID} .blank-canvas__todo-count {
        color: var(--blank-canvas-color-muted);
        font-size: var(--blank-canvas-font-size-sm);
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #${WIDGET_ID} .blank-canvas__todo-create,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #${WIDGET_ID} .blank-canvas__todo-action {
        border-color: var(--blank-canvas-border-subtle);
        background: transparent;
        color: var(--blank-canvas-color-text);
        box-shadow: none;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #${WIDGET_ID} .blank-canvas__todo-create {
        min-width: 36px;
        min-height: 36px;
        padding: 0 11px;
        font-weight: 500;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #${WIDGET_ID} .blank-canvas__todo-create:hover,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #${WIDGET_ID} .blank-canvas__todo-create:focus-visible,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #${WIDGET_ID} .blank-canvas__todo-action:hover,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #${WIDGET_ID} .blank-canvas__todo-action:focus-visible {
        background: rgba(18, 60, 47, 0.045);
        border-color: var(--blank-canvas-border-hover);
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #${WIDGET_ID} .blank-canvas__todo-action[data-action='toggle-assignment-done'][data-completed='true'] {
        background: rgba(70, 131, 97, 0.14);
        border-color: rgba(70, 131, 97, 0.45);
        color: #2f6f4f;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #${WIDGET_ID} .blank-canvas__todo-item {
        border-top: 1px solid var(--blank-canvas-border-subtle);
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #${WIDGET_ID} .blank-canvas__todo-item:first-child {
        border-top: none;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #${WIDGET_ID} .blank-canvas__todo-link {
        padding: 18px 0;
        border: none;
        border-radius: 0;
        background: transparent;
        box-shadow: none;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #${WIDGET_ID} .blank-canvas__todo-link:hover,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #${WIDGET_ID} a.blank-canvas__todo-link:focus-visible,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #${WIDGET_ID} .blank-canvas__todo-link:focus-within {
        box-shadow: none;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #${WIDGET_ID} .blank-canvas__todo-title {
        color: var(--blank-canvas-color-text);
        font-size: clamp(1rem, 1.25vw, 1.16rem);
        font-weight: 600;
        letter-spacing: -0.028em;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #${WIDGET_ID} .blank-canvas__todo-meta {
        color: var(--blank-canvas-color-muted);
        font-size: var(--blank-canvas-font-size-sm);
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #${WIDGET_ID} .blank-canvas__todo-due-summary {
        color: var(--blank-canvas-color-accent);
        font-size: var(--blank-canvas-font-size-sm);
        font-weight: 500;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container {
        gap: 16px !important;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container > div,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard__box,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard__box__container {
        display: grid !important;
        gap: 16px !important;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard {
        --blank-canvas-class-accent: #111111;
        --blank-canvas-class-accent-soft: rgba(17, 17, 17, 0.12);
        --blank-canvas-class-accent-border: rgba(17, 17, 17, 0.34);
        --blank-canvas-class-pill-padding-inline: 10%;
        position: relative !important;
        z-index: 0 !important;
        isolation: isolate !important;
        overflow: hidden !important;
        border: 1.5px solid var(--blank-canvas-class-accent-border) !important;
        border-radius: 999px !important;
        background: transparent !important;
        box-shadow: none !important;
        min-height: 0 !important;
        transition:
          background-color 600ms cubic-bezier(0.23, 1, 0.32, 1),
          border-color 600ms cubic-bezier(0.23, 1, 0.32, 1),
          transform 600ms cubic-bezier(0.23, 1, 0.32, 1),
          border-radius 600ms cubic-bezier(0.23, 1, 0.32, 1) !important;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: var(--blank-canvas-class-accent) !important;
        opacity: 0;
        transform: scale(0.16);
        transform-origin: center;
        transition:
          transform 800ms cubic-bezier(0.19, 1, 0.22, 1),
          opacity 800ms cubic-bezier(0.19, 1, 0.22, 1) !important;
        z-index: 0;
        pointer-events: none;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard::after {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: var(--blank-canvas-surface-card) !important;
        opacity: 1;
        transition: opacity 420ms cubic-bezier(0.23, 1, 0.32, 1) !important;
        z-index: 1;
        pointer-events: none;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard__header_content {
        position: relative !important;
        z-index: 2 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: flex-start !important;
        width: 100% !important;
        min-height: 68px !important;
        padding: 18px var(--blank-canvas-class-pill-padding-inline) !important;
        box-sizing: border-box !important;
        background: transparent !important;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard__header-title,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard__header-title a,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard a.ic-DashboardCard__link {
        position: relative !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: flex-start !important;
        width: 100% !important;
        min-width: 0 !important;
        padding: 0 !important;
        box-sizing: border-box !important;
        color: inherit !important;
        font-size: clamp(1rem, 1.2vw, 1.12rem) !important;
        font-weight: 600 !important;
        letter-spacing: -0.026em !important;
        line-height: 1.1 !important;
        text-decoration: none !important;
        transition:
          color 800ms cubic-bezier(0.34, 1.56, 0.64, 1),
          transform 800ms ease-out !important;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard a.ic-DashboardCard__link {
        overflow: hidden !important;
        background: transparent !important;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard__header-title {
        max-width: 100% !important;
        overflow: hidden !important;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard__header-title a::before,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard__header-title a::after,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard a.ic-DashboardCard__link::before,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard a.ic-DashboardCard__link::after {
        content: "→";
        position: absolute;
        top: 50%;
        font-size: 1.42rem;
        font-weight: 600;
        line-height: 1;
        color: var(--blank-canvas-class-accent) !important;
        transform: translateY(-50%);
        transition:
          color 800ms cubic-bezier(0.34, 1.56, 0.64, 1),
          left 800ms cubic-bezier(0.34, 1.56, 0.64, 1),
          right 800ms cubic-bezier(0.34, 1.56, 0.64, 1),
          opacity 800ms cubic-bezier(0.34, 1.56, 0.64, 1),
          transform 800ms cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        z-index: 3;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard__header-title a::before,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard a.ic-DashboardCard__link::before {
        left: -18px;
        opacity: 0;
        transform: translateY(-50%) translateX(-8px);
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard__header-title a::after,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard a.ic-DashboardCard__link::after {
        right: 0;
        opacity: 1;
        transform: translateY(-50%) translateX(0);
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard__header-title span,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard a.ic-DashboardCard__link span {
        display: block !important;
        flex: 1 1 auto !important;
        min-width: 0 !important;
        max-width: 100% !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
        text-align: left !important;
        position: relative !important;
        z-index: 4 !important;
        transform: translateX(0);
        transition:
          color 800ms cubic-bezier(0.34, 1.56, 0.64, 1),
          transform 800ms ease-out !important;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard:hover,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard:has(a.ic-DashboardCard__link:focus),
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard:has(a.ic-DashboardCard__link:focus-visible),
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard:focus-within {
        border-color: transparent !important;
        border-radius: 12px !important;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard:hover::before,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard:has(a.ic-DashboardCard__link:focus)::before,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard:has(a.ic-DashboardCard__link:focus-visible)::before,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard:focus-within::before {
        opacity: 1;
        transform: scale(1);
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard:hover::after,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard:has(a.ic-DashboardCard__link:focus)::after,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard:has(a.ic-DashboardCard__link:focus-visible)::after,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard:focus-within::after {
        opacity: 0;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard__header-title a:hover,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard__header-title a:focus-visible,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard a.ic-DashboardCard__link:hover,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard a.ic-DashboardCard__link:focus-visible {
        color: white !important;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard:hover .ic-DashboardCard__header-title a::before,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard:has(a.ic-DashboardCard__link:focus) .ic-DashboardCard__header-title a::before,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard:has(a.ic-DashboardCard__link:focus-visible) .ic-DashboardCard__header-title a::before,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard:focus-within .ic-DashboardCard__header-title a::before,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard:hover a.ic-DashboardCard__link::before,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard:has(a.ic-DashboardCard__link:focus) a.ic-DashboardCard__link::before,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard:has(a.ic-DashboardCard__link:focus-visible) a.ic-DashboardCard__link::before,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard:focus-within a.ic-DashboardCard__link::before {
        left: 20px;
        opacity: 1;
        color: white !important;
        transform: translateY(-50%) translateX(0);
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard:hover .ic-DashboardCard__header-title a::after,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard:has(a.ic-DashboardCard__link:focus) .ic-DashboardCard__header-title a::after,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard:has(a.ic-DashboardCard__link:focus-visible) .ic-DashboardCard__header-title a::after,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard:focus-within .ic-DashboardCard__header-title a::after,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard:hover a.ic-DashboardCard__link::after,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard:has(a.ic-DashboardCard__link:focus) a.ic-DashboardCard__link::after,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard:has(a.ic-DashboardCard__link:focus-visible) a.ic-DashboardCard__link::after,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard:focus-within a.ic-DashboardCard__link::after {
        right: -18px;
        opacity: 0;
        color: white !important;
        transform: translateY(-50%) translateX(8px);
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard:hover .ic-DashboardCard__header-title span,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard:has(a.ic-DashboardCard__link:focus) .ic-DashboardCard__header-title span,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard:has(a.ic-DashboardCard__link:focus-visible) .ic-DashboardCard__header-title span,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard:focus-within .ic-DashboardCard__header-title span,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard:hover a.ic-DashboardCard__link span,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard:has(a.ic-DashboardCard__link:focus) a.ic-DashboardCard__link span,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard:has(a.ic-DashboardCard__link:focus-visible) a.ic-DashboardCard__link span,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard:focus-within a.ic-DashboardCard__link span {
        color: white !important;
        transform: translateX(18px);
      }

      /* Retired class-pill arrow treatment:
         content: "â†’"
         padding-right: var(--blank-canvas-class-pill-arrow-gutter) !important;
         left: 0;
         right: -18px;
         translateX(18px)
      */
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard a.ic-DashboardCard__link::after {
        content: none !important;
        display: none !important;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard__header-subtitle,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard__header-term,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard__header_content p {
        display: none !important;
      }

      @media (max-width: ${splitMinWidth - 1}px) {
        ${DASHBOARD_UI_OVERHAUL_SELECTOR} [data-blank-canvas-dashboard-layout='stacked'] {
          display: grid !important;
          gap: 28px !important;
        }

        ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container {
          max-width: 100% !important;
          padding: 0 !important;
          border: none !important;
          border-radius: 0 !important;
          background: transparent !important;
        }

        ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container::before {
          content: none;
        }

        ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container::after {
          content: none;
        }

        ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container,
        ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container > div,
        ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard__box,
        ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard__box__container,
        ${DASHBOARD_UI_OVERHAUL_SELECTOR} #DashboardCard_Container .ic-DashboardCard {
          max-width: none !important;
        }
      }

      @media (max-width: 720px) {
        ${DASHBOARD_UI_OVERHAUL_SELECTOR} .ic-DashboardLayout__Main,
        ${DASHBOARD_UI_OVERHAUL_SELECTOR} #dashboard,
        ${DASHBOARD_UI_OVERHAUL_SELECTOR}.blank-canvas--hide-right-sidebar .ic-DashboardLayout__Main,
        ${DASHBOARD_UI_OVERHAUL_SELECTOR}.blank-canvas--hide-right-sidebar #dashboard {
          width: calc(100vw - 72px) !important;
          padding: 36px 16px 56px !important;
        }

        ${DASHBOARD_UI_OVERHAUL_SELECTOR} #${WIDGET_ID} {
          padding: 20px;
        }

        ${DASHBOARD_UI_OVERHAUL_SELECTOR} .ic-Dashboard-header__layout h1,
        ${DASHBOARD_UI_OVERHAUL_SELECTOR} .ic-Dashboard-header h1,
        ${DASHBOARD_UI_OVERHAUL_SELECTOR} #dashboard h1 {
          max-width: none !important;
        }
      }
    `;
  }

  function getStyles(settings) {
    const useAgendaList = root.ui.isEditorialPhaseActive(settings, root.ui.PHASE_AGENDA_LIST);
    const useAssignmentHierarchy = root.ui.isEditorialPhaseActive(
      settings,
      root.ui.PHASE_ASSIGNMENT_HIERARCHY
    );
    const splitMinWidth = root.dashboardLayout
      ? root.dashboardLayout.SPLIT_LAYOUT_MIN_WIDTH
      : 1180;
    const useDashboardUiOverhaul = root.ui.isEditorialPhaseActive(
      settings,
      root.ui.PHASE_DASHBOARD_UI_OVERHAUL
    );

    return `
      #${HOST_ID} {
        display: grid;
        gap: 14px;
        margin: 0 0 var(--blank-canvas-space-4);
      }

      [data-blank-canvas-dashboard-layout='split'] {
        display: grid !important;
        grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.72fr) !important;
        column-gap: 56px !important;
        row-gap: 10px !important;
        align-items: start !important;
      }

      [data-blank-canvas-dashboard-layout='split'] .ic-Dashboard-header__layout,
      [data-blank-canvas-dashboard-layout='split'] .ic-Dashboard-header,
      [data-blank-canvas-dashboard-layout='split'] #${HOST_ID} {
        grid-column: 1 !important;
      }

      [data-blank-canvas-dashboard-layout='split'] #DashboardCard_Container {
        grid-column: 2 !important;
        grid-row: 1 / span 3 !important;
        align-self: start !important;
        padding-right: 48px !important;
        box-sizing: border-box !important;
      }

      [data-blank-canvas-dashboard-layout='split'] #DashboardCard_Container,
      [data-blank-canvas-dashboard-layout='split'] #DashboardCard_Container > div,
      [data-blank-canvas-dashboard-layout='split'] #DashboardCard_Container .ic-DashboardCard__box,
      [data-blank-canvas-dashboard-layout='split'] #DashboardCard_Container .ic-DashboardCard__box__container,
      [data-blank-canvas-dashboard-layout='split'] #DashboardCard_Container .ic-DashboardCard {
        width: 100% !important;
        max-width: 460px !important;
        min-width: 0 !important;
        box-sizing: border-box !important;
        justify-self: start !important;
      }

      [data-blank-canvas-dashboard-layout='split'] #${HOST_ID}[data-blank-canvas-dashboard-column='left'] {
        align-self: start;
      }

      #${WIDGET_ID} {
        margin: 0;
        padding: 18px 20px;
        border-radius: var(--blank-canvas-radius-lg);
        border: 1px solid var(--blank-canvas-border-subtle);
        background:
          linear-gradient(
            180deg,
            var(--blank-canvas-color-surface-elevated) 0%,
            var(--blank-canvas-color-surface-muted) 100%
          );
        box-shadow: 0 12px 28px rgba(50, 42, 29, 0.05);
        overflow: hidden;
        color: var(--blank-canvas-color-text);
      }

      #${WIDGET_ID} .blank-canvas__todo-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 10px;
      }

      #${WIDGET_ID} .blank-canvas__todo-header-actions {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      #${WIDGET_ID} h2 {
        margin: 0;
        font-size: 1.1rem;
        line-height: 1.2;
        color: var(--blank-canvas-color-text);
        font-family: var(--blank-canvas-font-body);
        font-weight: 700;
      }

      #${WIDGET_ID} .blank-canvas__todo-count {
        margin: 0;
        color: var(--blank-canvas-color-muted);
        font-size: 0.92rem;
        white-space: nowrap;
      }

      #${WIDGET_ID} .blank-canvas__todo-create,
      #${WIDGET_ID} .blank-canvas__todo-action {
        appearance: none;
        border-radius: 999px;
        cursor: pointer;
        font: inherit;
        transition:
          background-color 140ms ease,
          border-color 140ms ease,
          color 140ms ease;
      }

      #${WIDGET_ID} .blank-canvas__todo-create {
        border: 1px solid var(--blank-canvas-border-strong);
        background: var(--blank-canvas-surface-button-subtle);
        color: var(--blank-canvas-color-text);
        min-width: 40px;
        min-height: 40px;
        padding: 0 12px;
        font-size: 1.05rem;
        font-weight: 600;
        white-space: nowrap;
      }

      #${WIDGET_ID} .blank-canvas__todo-create:hover,
      #${WIDGET_ID} .blank-canvas__todo-create:focus-visible {
        background: rgba(255, 255, 255, 0.86);
        border-color: var(--blank-canvas-border-hover);
      }

      #${WIDGET_ID} .blank-canvas__todo-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        ${useAgendaList
          ? `
        grid-template-columns: 1fr;
        gap: 0;
          `
          : `
        grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
        gap: 10px;
          `}
        align-items: start;
        width: 100%;
      }

      #${WIDGET_ID} .blank-canvas__todo-item {
        min-width: 0;
        width: 100%;
        ${useAgendaList
          ? `
        border-top: 1px solid var(--blank-canvas-border-subtle);
          `
          : ""}
      }

      ${useAgendaList
        ? `
      #${WIDGET_ID} .blank-canvas__todo-item:first-child {
        border-top: none;
      }
        `
        : ""}

      #${WIDGET_ID} .blank-canvas__todo-link {
        display: grid;
        ${useAgendaList
          ? `
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: ${useAssignmentHierarchy ? "start" : "baseline"};
        column-gap: 18px;
        row-gap: 6px;
        `
          : `
        gap: 2px;
        `}
        min-height: 0;
        width: 100%;
        box-sizing: border-box;
        padding: ${useAgendaList ? "16px 4px" : "12px 14px"};
        border-radius: ${useAgendaList ? "0" : "var(--blank-canvas-radius-md)"};
        border: ${useAgendaList ? "none" : "1px solid var(--blank-canvas-border-strong)"};
        background: ${useAgendaList ? "transparent" : "var(--blank-canvas-color-surface)"};
        color: inherit;
        text-decoration: none;
        box-shadow: ${useAgendaList ? "none" : "0 6px 14px rgba(50, 42, 29, 0.035)"};
        transition:
          background-color 160ms ease,
          transform 140ms ease,
          box-shadow 140ms ease,
          border-color 140ms ease;
      }

      #${WIDGET_ID} .blank-canvas__todo-link:hover,
      #${WIDGET_ID} a.blank-canvas__todo-link:focus-visible,
      #${WIDGET_ID} .blank-canvas__todo-link:focus-within {
        background: ${useAgendaList ? "rgba(18, 60, 47, 0.035)" : "var(--blank-canvas-color-surface)"};
        transform: ${useAgendaList ? "translateX(4px)" : "translateY(-1px)"};
        border-color: var(--blank-canvas-border-hover);
        box-shadow: ${useAgendaList ? "none" : "0 10px 20px rgba(50, 42, 29, 0.05)"};
      }

      #${WIDGET_ID} .blank-canvas__todo-title {
        font-weight: 700;
        line-height: 1.22;
        color: var(--blank-canvas-color-text);
        min-width: 0;
        ${useAgendaList
          ? `
        font-size: 1rem;
        letter-spacing: -0.01em;
          `
          : ""}
      }

      #${WIDGET_ID} .blank-canvas__todo-main {
        display: grid;
        gap: ${useAssignmentHierarchy ? "6px" : "0"};
        min-width: 0;
      }

      #${WIDGET_ID} .blank-canvas__todo-meta {
        display: ${useAssignmentHierarchy ? "flex" : "none"};
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        min-width: 0;
        color: var(--blank-canvas-color-muted);
        font-size: 0.84rem;
        line-height: 1.25;
      }

      #${WIDGET_ID} .blank-canvas__todo-course {
        min-width: 0;
      }

      #${WIDGET_ID} .blank-canvas__todo-status {
        display: inline-flex;
        align-items: center;
        padding: 2px 8px;
        border-radius: 999px;
        border: 1px solid var(--blank-canvas-border-subtle);
        background: var(--blank-canvas-surface-button-muted);
        font-size: 0.78rem;
        font-weight: 600;
        letter-spacing: 0.01em;
      }

      #${WIDGET_ID} .blank-canvas__todo-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      #${WIDGET_ID} .blank-canvas__todo-action {
        border: 1px solid var(--blank-canvas-border-subtle);
        background: var(--blank-canvas-surface-button-muted);
        color: var(--blank-canvas-color-muted);
        padding: 4px 10px;
        font-size: 0.76rem;
        font-weight: 600;
      }

      #${WIDGET_ID} .blank-canvas__todo-action:hover,
      #${WIDGET_ID} .blank-canvas__todo-action:focus-visible {
        background: rgba(255, 255, 255, 0.84);
        border-color: var(--blank-canvas-border-hover);
        color: var(--blank-canvas-color-text);
      }

      #${WIDGET_ID} .blank-canvas__todo-action[data-action='toggle-assignment-done'][data-completed='true'] {
        background: rgba(70, 131, 97, 0.14);
        border-color: rgba(70, 131, 97, 0.45);
        color: #2f6f4f;
      }

      #${WIDGET_ID} .blank-canvas__todo-item[data-completed='true'] .blank-canvas__todo-title {
        color: rgba(39, 57, 49, 0.8);
      }

      #${WIDGET_ID} .blank-canvas__todo-item[data-completed='true'] .blank-canvas__todo-link {
        opacity: 0.88;
      }

      #${WIDGET_ID} .blank-canvas__todo-item[data-completed='true'] .blank-canvas__todo-due-summary {
        visibility: hidden;
      }

      #${WIDGET_ID} .blank-canvas__todo-item[data-status-tone='done'] .blank-canvas__todo-status {
        color: #2f6f4f;
        border-color: rgba(70, 131, 97, 0.35);
        background: rgba(70, 131, 97, 0.08);
      }

      #${WIDGET_ID} .blank-canvas__todo-due-summary {
        margin-top: 0;
        color: var(--blank-canvas-color-accent);
        font-size: ${useAgendaList ? "0.88rem" : "0.84rem"};
        font-weight: 600;
        line-height: 1.2;
        ${useAgendaList
          ? `
        justify-self: end;
        text-align: right;
        white-space: nowrap;
          `
          : ""}
      }

      #${WIDGET_ID} .blank-canvas__todo-item[data-status-tone='missing'] .blank-canvas__todo-link {
        border-color: var(--blank-canvas-border-danger);
      }

      #${WIDGET_ID} .blank-canvas__todo-item[data-status-tone='missing'] .blank-canvas__todo-status {
        color: var(--blank-canvas-color-danger);
        border-color: var(--blank-canvas-border-danger);
      }

      #${WIDGET_ID} .blank-canvas__todo-item[data-status-tone='missing'] .blank-canvas__todo-due-summary {
        color: var(--blank-canvas-color-danger);
      }

      #${WIDGET_ID} .blank-canvas__todo-item[data-status-tone='late'] .blank-canvas__todo-status,
      #${WIDGET_ID} .blank-canvas__todo-item[data-status-tone='overdue'] .blank-canvas__todo-status {
        color: var(--blank-canvas-color-warning);
      }

      #${WIDGET_ID} .blank-canvas__todo-item[data-status-tone='late'] .blank-canvas__todo-due-summary,
      #${WIDGET_ID} .blank-canvas__todo-item[data-status-tone='overdue'] .blank-canvas__todo-due-summary {
        color: var(--blank-canvas-color-warning);
      }

      #${WIDGET_ID} .blank-canvas__todo-empty {
        margin: 0;
        color: var(--blank-canvas-color-muted);
      }

      ${useAgendaList
        ? `
      @media (max-width: ${splitMinWidth - 1}px) {
        [data-blank-canvas-dashboard-layout='stacked'] {
          display: block !important;
        }
      }

      @media (max-width: 720px) {
        #${HOST_ID} {
          gap: 14px;
        }

        #${WIDGET_ID} .blank-canvas__todo-header {
          flex-direction: column;
        }

        #${WIDGET_ID} .blank-canvas__todo-header-actions {
          width: 100%;
          justify-content: space-between;
        }

        #${WIDGET_ID} .blank-canvas__todo-summary {
          grid-template-columns: 1fr;
          align-items: start;
        }

        #${WIDGET_ID} .blank-canvas__todo-link {
          grid-template-columns: 1fr;
          align-items: start;
        }

        #${WIDGET_ID} .blank-canvas__todo-due-summary {
          justify-self: start;
          text-align: left;
          white-space: normal;
        }
      }
        `
        : ""}

      ${useDashboardUiOverhaul ? getDashboardUiOverhaulStyles(splitMinWidth) : ""}
    `;
  }

  root.dashboardStyles = {
    HOST_ID,
    WIDGET_ID,
    getStyles,
    syncClassCardAccents
  };
})();
