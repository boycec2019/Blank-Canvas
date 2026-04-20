(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});
  const PRIMITIVE_CLASS_NAMES = Object.freeze([
    "blank-canvas-ui-surface",
    "blank-canvas-ui-card",
    "blank-canvas-ui-control",
    "blank-canvas-ui-select",
    "blank-canvas-ui-caret",
    "blank-canvas-ui-button",
    "blank-canvas-ui-button-subtle",
    "blank-canvas-ui-popover",
    "blank-canvas-ui-calendar",
    "blank-canvas-ui-label",
    "blank-canvas-ui-meta",
    "blank-canvas-ui-muted",
    "blank-canvas-ui-modal-actions"
  ]);

  function getStyles() {
    return `
      .blank-canvas-ui-surface {
        border: 1px solid var(--blank-canvas-border-subtle);
        border-radius: var(--blank-canvas-radius-lg);
        background: var(--blank-canvas-surface-card);
        color: var(--blank-canvas-color-text);
        box-shadow: var(--blank-canvas-shadow-panel);
      }

      .blank-canvas-ui-card {
        border: 1px solid var(--blank-canvas-border-subtle);
        border-radius: var(--blank-canvas-radius-lg);
        background: var(--blank-canvas-surface-card);
        color: var(--blank-canvas-color-text);
        box-shadow: var(--blank-canvas-shadow-card);
      }

      .blank-canvas-ui-control {
        box-sizing: border-box;
        min-height: var(--blank-canvas-control-height);
        border: 1px solid var(--blank-canvas-control-border);
        border-radius: var(--blank-canvas-control-radius);
        background: var(--blank-canvas-surface-control);
        color: var(--blank-canvas-color-text);
        font: inherit;
        font-size: var(--blank-canvas-font-size-md);
        line-height: var(--blank-canvas-line-height-base);
      }

      .blank-canvas-ui-control::placeholder {
        color: var(--blank-canvas-color-placeholder);
      }

      .blank-canvas-ui-control:focus,
      .blank-canvas-ui-control:focus-visible {
        outline: none;
        border-color: var(--blank-canvas-control-focus-border);
        box-shadow: 0 0 0 3px var(--blank-canvas-control-focus-ring);
      }

      .blank-canvas-ui-select {
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        padding-right: 44px;
      }

      .blank-canvas-ui-caret {
        color: var(--blank-canvas-color-caret);
        pointer-events: none;
      }

      .blank-canvas-ui-caret::before {
        content: "";
        display: block;
        border-left: calc(var(--blank-canvas-caret-size) - 1px) solid transparent;
        border-right: calc(var(--blank-canvas-caret-size) - 1px) solid transparent;
        border-top: var(--blank-canvas-caret-size) solid currentColor;
      }

      .blank-canvas-ui-button {
        border: 1px solid var(--blank-canvas-border-subtle);
        border-radius: var(--blank-canvas-button-radius);
        background: var(--blank-canvas-surface-button);
        color: var(--blank-canvas-color-text);
        font: inherit;
      }

      .blank-canvas-ui-button-subtle {
        border-color: var(--blank-canvas-border-subtle);
        background: rgba(255, 255, 255, 0.5);
        color: var(--blank-canvas-color-muted);
      }

      .blank-canvas-ui-popover {
        border: 1px solid var(--blank-canvas-border-subtle);
        border-radius: var(--blank-canvas-popover-radius);
        background: var(--blank-canvas-surface-popover);
        color: var(--blank-canvas-color-text);
        box-shadow: var(--blank-canvas-shadow-popover);
      }

      .blank-canvas-ui-calendar {
        border: 1px solid var(--blank-canvas-border-subtle);
        border-radius: var(--blank-canvas-popover-radius);
        background: var(--blank-canvas-surface-popover);
        color: var(--blank-canvas-color-text);
        box-shadow: var(--blank-canvas-shadow-popover);
      }

      .blank-canvas-ui-label {
        color: var(--blank-canvas-color-text);
        font-size: var(--blank-canvas-font-size-sm);
        font-weight: 700;
        line-height: var(--blank-canvas-line-height-tight);
      }

      .blank-canvas-ui-meta {
        color: var(--blank-canvas-color-muted);
        font-size: var(--blank-canvas-font-size-sm);
        line-height: var(--blank-canvas-line-height-base);
      }

      .blank-canvas-ui-muted {
        color: var(--blank-canvas-color-muted);
      }

      .blank-canvas-ui-modal-actions {
        display: flex;
        gap: 10px;
      }
    `;
  }

  function getSnapshot(settings = {}) {
    const tokenSnapshot = root.ui ? root.ui.getDesignTokenSnapshot(settings) : null;
    return {
      primitiveClassNames: PRIMITIVE_CLASS_NAMES.slice(),
      primitiveCount: PRIMITIVE_CLASS_NAMES.length,
      phaseDashboardUiOverhaulEnabled: Boolean(settings.uiPhaseDashboardUiOverhaul),
      stylesheetPresent: true,
      tokenCount: tokenSnapshot ? tokenSnapshot.tokenCount : 0,
      tokenGroups: tokenSnapshot ? tokenSnapshot.tokenGroups : {},
      hasControlPrimitives: PRIMITIVE_CLASS_NAMES.includes("blank-canvas-ui-control"),
      hasCaretPrimitives: PRIMITIVE_CLASS_NAMES.includes("blank-canvas-ui-caret"),
      hasCalendarPrimitives: PRIMITIVE_CLASS_NAMES.includes("blank-canvas-ui-calendar")
    };
  }

  root.uiPrimitives = {
    PRIMITIVE_CLASS_NAMES,
    getSnapshot,
    getStyles
  };
})();
