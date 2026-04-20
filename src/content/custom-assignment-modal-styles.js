(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});
  const DASHBOARD_UI_OVERHAUL_SELECTOR =
    "html.blank-canvas--layout-editorial.blank-canvas--phase-dashboard-ui-overhaul";

  function getStyles(modalId) {
    return `
      body.blank-canvas__custom-modal-open {
        overflow: hidden !important;
      }

      #${modalId} {
        position: fixed;
        inset: 0;
        z-index: 2147483646;
        overflow-y: auto;
        padding: 12px 0;
      }

      #${modalId}[hidden] {
        display: none !important;
      }

      #${modalId} .blank-canvas__custom-modal-backdrop {
        position: absolute;
        inset: 0;
        border: none;
        background: var(--blank-canvas-color-overlay);
        cursor: pointer;
      }

      #${modalId} .blank-canvas__custom-modal-dialog {
        position: relative;
        width: min(520px, calc(100vw - 32px));
        margin: min(8vh, 64px) auto 0;
        padding: 24px;
        max-height: calc(100vh - 32px);
        overflow: visible;
        border-radius: var(--blank-canvas-modal-radius);
        border: 1px solid var(--blank-canvas-border-subtle);
        background: var(--blank-canvas-surface-modal);
        box-shadow: var(--blank-canvas-shadow-modal);
        color: var(--blank-canvas-color-text);
      }

      #${modalId} .blank-canvas__custom-modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 14px;
      }

      #${modalId} .blank-canvas__custom-modal-eyebrow {
        margin: 0 0 8px;
        color: var(--blank-canvas-color-muted);
        font-size: 0.74rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      #${modalId} h3 {
        margin: 0;
        font-family: var(--blank-canvas-font-body);
        font-size: 1.24rem;
        font-weight: 700;
        letter-spacing: -0.02em;
        line-height: 1.15;
      }

      #${modalId} .blank-canvas__custom-modal-close,
      #${modalId} .blank-canvas__custom-modal-cancel {
        border: 1px solid var(--blank-canvas-border-subtle);
        background: var(--blank-canvas-surface-button);
        color: var(--blank-canvas-color-text);
        border-radius: var(--blank-canvas-button-radius);
      }

      #${modalId} .blank-canvas__custom-modal-close,
      #${modalId} .blank-canvas__custom-modal-cancel,
      #${modalId} .blank-canvas__custom-modal-save {
        min-height: 44px;
        padding: 10px 16px;
        font: inherit;
        border-radius: var(--blank-canvas-button-radius);
      }

      #${modalId} .blank-canvas__custom-modal-save {
        border: 1px solid var(--blank-canvas-border-strong);
        background: rgba(255, 255, 255, 0.88);
        color: var(--blank-canvas-color-text);
      }

      #${modalId} .blank-canvas__custom-modal-form {
        display: grid;
        gap: 10px;
      }

      #${modalId} .blank-canvas__custom-modal-field strong,
      #${modalId} .blank-canvas__custom-modal-field span {
        display: block;
      }

      #${modalId} .blank-canvas__custom-modal-field strong {
        font-size: 0.92rem;
        font-weight: 700;
        line-height: 1.2;
      }

      #${modalId} .blank-canvas__custom-modal-field span {
        margin-top: 4px;
        color: var(--blank-canvas-color-muted);
        font-size: 0.84rem;
      }

      #${modalId} select,
      #${modalId} input[type='text'] {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid var(--blank-canvas-control-border);
        border-radius: var(--blank-canvas-control-radius);
        min-height: var(--blank-canvas-control-height);
        padding: var(--blank-canvas-control-padding-y) var(--blank-canvas-control-padding-x);
        font: inherit;
        font-size: var(--blank-canvas-font-size-md);
        line-height: var(--blank-canvas-line-height-base);
        color: var(--blank-canvas-color-text);
        background: var(--blank-canvas-surface-control);
        transition: border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease;
      }

      #${modalId} input[type='text']::placeholder {
        color: var(--blank-canvas-color-placeholder);
      }

      #${modalId} select:focus,
      #${modalId} input[type='text']:focus,
      #${modalId} .blank-canvas__custom-modal-date-trigger:focus-visible,
      #${modalId} .blank-canvas__custom-modal-calendar-nav:focus-visible,
      #${modalId} .blank-canvas__custom-modal-day:focus-visible {
        outline: none;
        border-color: var(--blank-canvas-control-focus-border);
        box-shadow: 0 0 0 3px var(--blank-canvas-control-focus-ring);
      }

      #${modalId} select {
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        padding-right: 28px;
        background-image: none;
        background-repeat: no-repeat;
      }

      #${modalId} .blank-canvas__custom-modal-select-wrap {
        position: relative;
        display: block;
      }

      #${modalId} .blank-canvas__custom-modal-select-wrap select {
        padding-right: 44px;
      }

      #${modalId} .blank-canvas__custom-modal-select-caret {
        position: absolute;
        top: 50%;
        right: 17px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        color: var(--blank-canvas-color-caret);
        pointer-events: none;
        transform: translateY(-50%);
      }

      #${modalId} .blank-canvas__custom-modal-select-caret::before {
        content: "";
        display: block;
        border-left: calc(var(--blank-canvas-caret-size) - 1px) solid transparent;
        border-right: calc(var(--blank-canvas-caret-size) - 1px) solid transparent;
        border-top: var(--blank-canvas-caret-size) solid currentColor;
        transform: translateY(-3px);
      }

      #${modalId} .blank-canvas__custom-modal-meridiem {
        background-image:
          linear-gradient(45deg, transparent 50%, var(--blank-canvas-color-caret) 50%),
          linear-gradient(135deg, var(--blank-canvas-color-caret) 50%, transparent 50%);
        background-position:
          calc(100% - 14px) 50%,
          calc(100% - 10px) 50%;
        background-size: 6px 6px, 6px 6px;
        background-repeat: no-repeat;
      }

      #${modalId} select:required:invalid {
        color: var(--blank-canvas-color-placeholder);
      }

      #${modalId}-course[data-placeholder='true'] {
        color: var(--blank-canvas-color-placeholder) !important;
      }

      #${modalId} select option {
        color: var(--blank-canvas-color-text);
      }

      #${modalId} .blank-canvas__custom-modal-hint {
        margin: 0 0 4px;
        color: var(--blank-canvas-color-muted);
        font-size: 0.82rem;
      }

      #${modalId} .blank-canvas__custom-modal-schedule {
        position: relative;
        gap: 10px;
      }

      #${modalId} .blank-canvas__custom-modal-schedule-body {
        position: relative;
        margin-top: 10px;
      }

      #${modalId} .blank-canvas__custom-modal-schedule-row {
        display: grid;
        grid-template-columns: minmax(156px, 0.58fr) minmax(0, 1fr);
        gap: 10px;
        align-items: start;
      }

      #${modalId} .blank-canvas__custom-modal-date-trigger {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        width: 100%;
        min-height: var(--blank-canvas-control-height);
        padding: 12px 16px;
        border: 1px solid var(--blank-canvas-control-border);
        border-radius: var(--blank-canvas-control-radius);
        background: var(--blank-canvas-surface-control);
        color: var(--blank-canvas-color-text);
        text-align: left;
      }

      #${modalId} .blank-canvas__custom-modal-date-copy {
        display: flex;
        align-items: center;
        min-width: 0;
      }

      #${modalId} .blank-canvas__custom-modal-date-trigger .blank-canvas__custom-modal-date-label {
        color: var(--blank-canvas-color-text);
        font-size: var(--blank-canvas-font-size-md);
        font-weight: 400;
        line-height: var(--blank-canvas-line-height-base);
      }

      #${modalId} .blank-canvas__custom-modal-date-trigger[data-placeholder='true']
        .blank-canvas__custom-modal-date-label {
        color: var(--blank-canvas-color-placeholder);
      }

      #${modalId} .blank-canvas__custom-modal-date-meta {
        display: none;
      }

      #${modalId} .blank-canvas__custom-modal-date-icon {
        flex: 0 0 auto;
        width: 14px;
        height: 14px;
        color: var(--blank-canvas-color-caret);
        font-size: 0;
        line-height: 0;
        background-image:
          linear-gradient(45deg, transparent 50%, currentColor 50%),
          linear-gradient(135deg, currentColor 50%, transparent 50%);
        background-position:
          calc(50% - 2px) 50%,
          calc(50% + 2px) 50%;
        background-size: 6px 6px, 6px 6px;
        background-repeat: no-repeat;
      }

      #${modalId} .blank-canvas__custom-modal-calendar {
        position: absolute;
        top: calc(100% + 8px);
        left: 0;
        z-index: 2;
        width: min(312px, 100%);
        box-sizing: border-box;
        padding: 10px;
        border: 1px solid var(--blank-canvas-border-subtle);
        border-radius: var(--blank-canvas-popover-radius);
        background: var(--blank-canvas-surface-popover);
        color: var(--blank-canvas-color-text);
        box-shadow: var(--blank-canvas-shadow-popover);
      }

      #${modalId} .blank-canvas__custom-modal-calendar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
        margin-bottom: 8px;
      }

      #${modalId} .blank-canvas__custom-modal-calendar-month {
        margin: 0;
        font-size: 0.9rem;
        font-weight: 700;
      }

      #${modalId} .blank-canvas__custom-modal-calendar-nav {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border: none;
        border-radius: 999px;
        background: rgba(48, 40, 31, 0.04);
        color: var(--blank-canvas-color-text) !important;
        font-size: 1rem;
        line-height: 1;
        opacity: 1;
        text-shadow: none;
      }

      #${modalId} .blank-canvas__custom-modal-calendar-weekdays,
      #${modalId} .blank-canvas__custom-modal-calendar-days {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: 2px;
      }

      #${modalId} .blank-canvas__custom-modal-calendar-weekdays {
        margin-bottom: 6px;
        color: var(--blank-canvas-color-muted);
        font-size: 0.68rem;
        font-weight: 600;
        text-align: center;
      }

      #${modalId} .blank-canvas__custom-modal-day {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        aspect-ratio: 1 / 1;
        min-height: 28px;
        border: none;
        border-radius: 999px;
        background: transparent;
        color: var(--blank-canvas-color-text) !important;
        font: inherit;
        font-size: 0.78rem;
        font-weight: 500;
        line-height: 1;
        text-indent: 0;
        text-shadow: none;
        opacity: 1;
        transition: background-color 160ms ease, color 160ms ease, transform 160ms ease;
      }

      #${modalId} .blank-canvas__custom-modal-day:hover {
        background: rgba(53, 102, 93, 0.08);
      }

      #${modalId} .blank-canvas__custom-modal-day.is-selected {
        background: rgba(53, 102, 93, 0.14);
        color: rgb(43, 84, 76) !important;
      }

      #${modalId} .blank-canvas__custom-modal-day.is-today {
        box-shadow: inset 0 0 0 1px rgba(53, 102, 93, 0.38);
      }

      #${modalId} .blank-canvas__custom-modal-day.is-outside-month {
        color: rgba(48, 40, 31, 0.36) !important;
      }

      #${modalId} .blank-canvas__custom-modal-time-field {
        display: block;
        padding-top: 0;
      }

      #${modalId} .blank-canvas__custom-modal-time-group {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 18px minmax(0, 1fr) minmax(92px, 0.9fr);
        gap: 6px;
        align-items: stretch;
        margin-top: 0;
      }

      #${modalId} .blank-canvas__custom-modal-time-field input[type='text'] {
        min-height: var(--blank-canvas-control-height);
        color: var(--blank-canvas-color-text);
        text-align: center;
        font-size: var(--blank-canvas-font-size-md);
        font-weight: 400;
        line-height: var(--blank-canvas-line-height-base);
        padding: 12px 10px;
      }

      #${modalId} .blank-canvas__custom-modal-meridiem {
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        display: inline-flex;
        align-items: center;
        min-height: var(--blank-canvas-control-height);
        min-width: 92px;
        border: 1px solid var(--blank-canvas-control-border);
        border-radius: var(--blank-canvas-control-radius);
        background: var(--blank-canvas-surface-control);
        align-self: stretch;
        color: var(--blank-canvas-color-text);
        font: inherit;
        font-size: var(--blank-canvas-font-size-md);
        font-weight: 400;
        line-height: var(--blank-canvas-line-height-base);
        padding: 0 29px 0 20px;
        text-align: left;
        text-align-last: left;
        background-image:
          linear-gradient(45deg, transparent 50%, var(--blank-canvas-color-caret) 50%),
          linear-gradient(135deg, var(--blank-canvas-color-caret) 50%, transparent 50%);
        background-position:
          calc(100% - 14px) 50%,
          calc(100% - 10px) 50%;
        background-size: 6px 6px, 6px 6px;
        background-repeat: no-repeat;
      }

      #${modalId} .blank-canvas__custom-modal-meridiem:focus {
        outline: none;
      }

      #${modalId} .blank-canvas__custom-modal-time-separator {
        position: relative;
        display: block;
        align-self: stretch;
        height: var(--blank-canvas-control-height);
        width: 18px;
        color: var(--blank-canvas-color-muted);
        font-size: 0;
        text-align: center;
        margin: 0;
        padding: 0;
      }

      #${modalId} .blank-canvas__custom-modal-time-separator::before {
        content: ":";
        position: absolute;
        top: 50%;
        left: 50%;
        font-size: var(--blank-canvas-font-size-md);
        font-weight: 400;
        line-height: 1;
        transform: translate(-50%, -50%);
      }

      #${modalId} .blank-canvas__custom-modal-error {
        min-height: 0;
        margin: 0;
        color: var(--blank-canvas-color-danger);
        font-size: 0.82rem;
      }

      #${modalId} .blank-canvas__custom-modal-actions {
        display: flex;
        gap: 10px;
        margin-top: 0;
      }

      #${modalId} .blank-canvas__custom-modal-actions button {
        flex: 1 1 0;
      }

      @media (max-width: 640px) {
        #${modalId} .blank-canvas__custom-modal-dialog {
          width: calc(100vw - 20px);
          margin-top: 8px;
          padding: 20px;
          max-height: calc(100vh - 16px);
        }

        #${modalId} .blank-canvas__custom-modal-calendar {
          padding: 10px;
        }

        #${modalId} .blank-canvas__custom-modal-schedule-row {
          grid-template-columns: 1fr;
        }

        #${modalId} .blank-canvas__custom-modal-calendar-weekdays,
        #${modalId} .blank-canvas__custom-modal-calendar-days {
          gap: 4px;
        }

        #${modalId} .blank-canvas__custom-modal-day {
          min-height: 28px;
          font-size: 0.84rem;
        }
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #${modalId} .blank-canvas__custom-modal-dialog {
        border-color: var(--blank-canvas-border-subtle);
        background: var(--blank-canvas-surface-modal);
        color: var(--blank-canvas-color-text);
        box-shadow: var(--blank-canvas-shadow-modal);
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #${modalId} h3 {
        color: var(--blank-canvas-color-text);
        font-family: var(--blank-canvas-font-body);
        font-size: clamp(1.2rem, 1.9vw, 1.45rem);
        font-weight: 700;
        letter-spacing: -0.025em;
        line-height: 1.1;
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #${modalId} .blank-canvas__custom-modal-field strong {
        color: var(--blank-canvas-color-text);
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #${modalId} select,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #${modalId} input[type='text'],
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #${modalId} .blank-canvas__custom-modal-date-trigger,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #${modalId} .blank-canvas__custom-modal-meridiem {
        border-color: var(--blank-canvas-control-border);
        background: var(--blank-canvas-surface-control);
        color: var(--blank-canvas-color-text);
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #${modalId} .blank-canvas__custom-modal-close,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #${modalId} .blank-canvas__custom-modal-save,
      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #${modalId} .blank-canvas__custom-modal-cancel {
        background: transparent;
        border-color: var(--blank-canvas-border-subtle);
        color: var(--blank-canvas-color-text);
      }

      ${DASHBOARD_UI_OVERHAUL_SELECTOR} #${modalId} .blank-canvas__custom-modal-calendar {
        background: var(--blank-canvas-surface-popover);
        border-color: var(--blank-canvas-border-subtle);
      }
    `;
  }

  root.customAssignmentModalStyles = {
    getStyles
  };
})();
