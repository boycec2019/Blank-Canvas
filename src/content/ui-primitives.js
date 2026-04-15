(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});

  function getStyles() {
    return `
      .blank-canvas-ui-surface {
        border: 1px solid var(--blank-canvas-border-subtle);
        border-radius: var(--blank-canvas-radius-lg);
        background: var(--blank-canvas-color-surface-elevated);
        color: var(--blank-canvas-color-text);
        box-shadow: var(--blank-canvas-shadow-panel);
      }

      .blank-canvas-ui-control {
        box-sizing: border-box;
        border: 1px solid rgba(48, 40, 31, 0.12);
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.82);
        color: var(--blank-canvas-color-text);
        font: inherit;
      }

      .blank-canvas-ui-button {
        border: 1px solid var(--blank-canvas-border-subtle);
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.72);
        color: var(--blank-canvas-color-text);
        font: inherit;
      }

      .blank-canvas-ui-popover {
        border: 1px solid rgba(48, 40, 31, 0.1);
        border-radius: 18px;
        background: #ffffff;
        color: var(--blank-canvas-color-text);
        box-shadow: 0 16px 38px rgba(32, 27, 21, 0.16);
      }

      .blank-canvas-ui-muted {
        color: var(--blank-canvas-color-muted);
      }
    `;
  }

  root.uiPrimitives = {
    getStyles
  };
})();
