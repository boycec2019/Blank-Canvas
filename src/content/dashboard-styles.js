(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});
  const WIDGET_ID = "blank-canvas-dashboard-todo";

  function getStyles() {
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
        grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
        gap: 10px;
        align-items: start;
        width: 100%;
      }

      #${WIDGET_ID} .blank-canvas__todo-item {
        min-width: 0;
        width: 100%;
      }

      #${WIDGET_ID} .blank-canvas__todo-link {
        display: grid;
        gap: 2px;
        min-height: 0;
        width: 100%;
        box-sizing: border-box;
        padding: 12px 14px;
        border-radius: var(--blank-canvas-radius-md);
        border: 1px solid var(--blank-canvas-border-strong);
        background: var(--blank-canvas-color-surface);
        color: inherit;
        text-decoration: none;
        box-shadow: 0 6px 14px rgba(50, 42, 29, 0.035);
        transition:
          transform 140ms ease,
          box-shadow 140ms ease,
          border-color 140ms ease;
      }

      #${WIDGET_ID} .blank-canvas__todo-link:hover,
      #${WIDGET_ID} .blank-canvas__todo-link:focus-visible {
        transform: translateY(-1px);
        border-color: var(--blank-canvas-border-hover);
        box-shadow: 0 10px 20px rgba(50, 42, 29, 0.05);
      }

      #${WIDGET_ID} .blank-canvas__todo-title {
        font-weight: 700;
        line-height: 1.22;
        color: var(--blank-canvas-color-text);
      }

      #${WIDGET_ID} .blank-canvas__todo-due-summary {
        margin-top: 0;
        color: var(--blank-canvas-color-accent);
        font-size: 0.84rem;
        font-weight: 600;
        line-height: 1.2;
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
    `;
  }

  root.dashboardStyles = {
    WIDGET_ID,
    getStyles
  };
})();
