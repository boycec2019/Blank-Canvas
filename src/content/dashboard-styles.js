(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});
  const WIDGET_ID = "blank-canvas-dashboard-todo";

  function getStyles(settings) {
    const useAgendaList = root.ui.isEditorialPhaseActive(settings, root.ui.PHASE_AGENDA_LIST);
    const useAssignmentHierarchy = root.ui.isEditorialPhaseActive(
      settings,
      root.ui.PHASE_ASSIGNMENT_HIERARCHY
    );

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
        background: rgba(255, 255, 255, 0.68);
        color: var(--blank-canvas-color-text);
        padding: 8px 12px;
        font-size: 0.82rem;
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
          transform 140ms ease,
          box-shadow 140ms ease,
          border-color 140ms ease;
      }

      #${WIDGET_ID} a.blank-canvas__todo-link:hover,
      #${WIDGET_ID} a.blank-canvas__todo-link:focus-visible {
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
        background: rgba(255, 255, 255, 0.45);
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
        background: rgba(255, 255, 255, 0.5);
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
      @media (max-width: 720px) {
        #${WIDGET_ID} .blank-canvas__todo-header {
          flex-direction: column;
        }

        #${WIDGET_ID} .blank-canvas__todo-header-actions {
          width: 100%;
          justify-content: space-between;
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
    `;
  }

  root.dashboardStyles = {
    WIDGET_ID,
    getStyles
  };
})();
