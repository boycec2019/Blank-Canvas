(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});
  const WIDGET_ID = "blank-canvas-dashboard-todo";

  function getStyles() {
    return `
      #${WIDGET_ID} {
        margin: 0 0 24px;
        padding: 18px 20px;
        border-radius: 20px;
        border: 1px solid rgba(15, 23, 42, 0.08);
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(247, 250, 255, 0.96) 100%);
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
        overflow: hidden;
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
        color: #10203a;
      }

      #${WIDGET_ID} .blank-canvas__todo-count {
        margin: 0;
        color: #5a6a82;
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
        border-radius: 16px;
        border: 1px solid rgba(21, 62, 117, 0.1);
        background: #ffffff;
        color: inherit;
        text-decoration: none;
        box-shadow: 0 6px 18px rgba(15, 23, 42, 0.05);
        transition:
          transform 140ms ease,
          box-shadow 140ms ease,
          border-color 140ms ease;
      }

      #${WIDGET_ID} .blank-canvas__todo-link:hover,
      #${WIDGET_ID} .blank-canvas__todo-link:focus-visible {
        transform: translateY(-1px);
        border-color: rgba(21, 62, 117, 0.22);
        box-shadow: 0 10px 22px rgba(15, 23, 42, 0.08);
      }

      #${WIDGET_ID} .blank-canvas__todo-title {
        font-weight: 700;
        line-height: 1.22;
        color: #10203a;
      }

      #${WIDGET_ID} .blank-canvas__todo-due-summary {
        margin-top: 0;
        color: #153e75;
        font-size: 0.84rem;
        font-weight: 600;
        line-height: 1.2;
      }

      #${WIDGET_ID} .blank-canvas__todo-item[data-status-tone='missing'] .blank-canvas__todo-link {
        border-color: rgba(176, 56, 23, 0.18);
      }

      #${WIDGET_ID} .blank-canvas__todo-item[data-status-tone='missing'] .blank-canvas__todo-due-summary {
        color: #b03817;
      }

      #${WIDGET_ID} .blank-canvas__todo-item[data-status-tone='late'] .blank-canvas__todo-due-summary,
      #${WIDGET_ID} .blank-canvas__todo-item[data-status-tone='overdue'] .blank-canvas__todo-due-summary {
        color: #8a4b14;
      }

      #${WIDGET_ID} .blank-canvas__todo-empty {
        margin: 0;
        color: #5e6b82;
      }
    `;
  }

  root.dashboardStyles = {
    WIDGET_ID,
    getStyles
  };
})();
