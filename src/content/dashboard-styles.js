(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});
  const WIDGET_ID = "blank-canvas-dashboard-todo";

  function getStyles(settings) {
    const useAgendaList = root.ui.isEditorialPhaseActive(settings, root.ui.PHASE_AGENDA_LIST);

    return `
      #${WIDGET_ID} {
        margin: 0 0 var(--blank-canvas-space-5);
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
        align-items: baseline;
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
          transform 140ms ease,
          box-shadow 140ms ease,
          border-color 140ms ease;
      }

      #${WIDGET_ID} .blank-canvas__todo-link:hover,
      #${WIDGET_ID} .blank-canvas__todo-link:focus-visible {
        transform: ${useAgendaList ? "none" : "translateY(-1px)"};
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

      #${WIDGET_ID} .blank-canvas__todo-item[data-status-tone='missing'] .blank-canvas__todo-due-summary {
        color: var(--blank-canvas-color-danger);
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
      @media (max-width: 720px) {
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
    `;
  }

  root.dashboardStyles = {
    WIDGET_ID,
    getStyles
  };
})();
