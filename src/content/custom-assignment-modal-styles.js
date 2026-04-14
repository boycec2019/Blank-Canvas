(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});

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
        background: rgba(28, 24, 20, 0.52);
        cursor: pointer;
      }

      #${modalId} .blank-canvas__custom-modal-dialog {
        position: relative;
        width: min(520px, calc(100vw - 32px));
        margin: min(8vh, 64px) auto 0;
        padding: 28px;
        max-height: calc(100vh - 32px);
        overflow-y: auto;
        border-radius: 28px;
        border: 1px solid var(--blank-canvas-border-subtle);
        background: linear-gradient(
          180deg,
          var(--blank-canvas-color-surface-elevated) 0%,
          var(--blank-canvas-color-surface) 100%
        );
        box-shadow: 0 24px 60px rgba(32, 27, 21, 0.18);
        color: var(--blank-canvas-color-text);
      }

      #${modalId} .blank-canvas__custom-modal-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 18px;
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
        font-size: 1.15rem;
        line-height: 1.2;
      }

      #${modalId} .blank-canvas__custom-modal-close,
      #${modalId} .blank-canvas__custom-modal-cancel {
        border: 1px solid var(--blank-canvas-border-subtle);
        background: rgba(255, 255, 255, 0.72);
        color: var(--blank-canvas-color-text);
      }

      #${modalId} .blank-canvas__custom-modal-form {
        display: grid;
        gap: 12px;
      }

      #${modalId} .blank-canvas__custom-modal-field strong,
      #${modalId} .blank-canvas__custom-modal-field span {
        display: block;
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
        border: 1px solid rgba(48, 40, 31, 0.12);
        border-radius: 18px;
        min-height: 54px;
        padding: 13px 16px;
        font: inherit;
        line-height: 1.25;
        color: var(--blank-canvas-color-text);
        background: rgba(255, 255, 255, 0.82);
        transition: border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease;
      }

      #${modalId} select:focus,
      #${modalId} input[type='text']:focus,
      #${modalId} .blank-canvas__custom-modal-date-trigger:focus-visible,
      #${modalId} .blank-canvas__custom-modal-calendar-nav:focus-visible,
      #${modalId} .blank-canvas__custom-modal-day:focus-visible {
        outline: none;
        border-color: rgba(53, 102, 93, 0.45);
        box-shadow: 0 0 0 3px rgba(53, 102, 93, 0.12);
      }

      #${modalId} select {
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        padding-right: 56px;
        background-image:
          linear-gradient(45deg, transparent 50%, currentColor 50%),
          linear-gradient(135deg, currentColor 50%, transparent 50%);
        background-position:
          calc(100% - 24px) calc(50% - 3px),
          calc(100% - 16px) calc(50% - 3px);
        background-size: 8px 8px, 8px 8px;
        background-repeat: no-repeat;
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
        min-height: 54px;
        padding: 12px 16px;
        border: 1px solid rgba(48, 40, 31, 0.12);
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.82);
        color: var(--blank-canvas-color-text);
        text-align: left;
      }

      #${modalId} .blank-canvas__custom-modal-date-copy {
        display: flex;
        align-items: center;
        min-width: 0;
      }

      #${modalId} .blank-canvas__custom-modal-date-label {
        font-size: 0.98rem;
        font-weight: 600;
        line-height: 1.1;
      }

      #${modalId} .blank-canvas__custom-modal-date-meta {
        display: none;
      }

      #${modalId} .blank-canvas__custom-modal-date-icon {
        flex: 0 0 auto;
        color: var(--blank-canvas-color-muted);
        font-size: 0.88rem;
        line-height: 1;
      }

      #${modalId} .blank-canvas__custom-modal-calendar {
        margin-top: 10px;
        padding: 12px;
        border-radius: 20px;
        background: #07111f;
        color: #f3f5f8;
        box-shadow: 0 18px 36px rgba(9, 16, 28, 0.28);
        max-width: 100%;
      }

      #${modalId} .blank-canvas__custom-modal-calendar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 12px;
      }

      #${modalId} .blank-canvas__custom-modal-calendar-month {
        margin: 0;
        font-size: 1rem;
        font-weight: 700;
      }

      #${modalId} .blank-canvas__custom-modal-calendar-nav {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.04);
        color: #f3f5f8 !important;
        font-size: 1.15rem;
        line-height: 1;
        opacity: 1;
        text-shadow: none;
      }

      #${modalId} .blank-canvas__custom-modal-calendar-weekdays,
      #${modalId} .blank-canvas__custom-modal-calendar-days {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: 4px;
      }

      #${modalId} .blank-canvas__custom-modal-calendar-weekdays {
        margin-bottom: 10px;
        color: rgba(243, 245, 248, 0.72);
        font-size: 0.76rem;
        text-align: center;
      }

      #${modalId} .blank-canvas__custom-modal-day {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        aspect-ratio: 1 / 1;
        min-height: 30px;
        border: none;
        border-radius: 999px;
        background: transparent;
        color: #f3f5f8 !important;
        font: inherit;
        font-size: 0.9rem;
        font-weight: 600;
        line-height: 1;
        text-indent: 0;
        text-shadow: none;
        opacity: 1;
        transition: background-color 160ms ease, color 160ms ease, transform 160ms ease;
      }

      #${modalId} .blank-canvas__custom-modal-day:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      #${modalId} .blank-canvas__custom-modal-day.is-selected {
        background: rgba(255, 204, 102, 0.22);
        color: #ffe8bd;
      }

      #${modalId} .blank-canvas__custom-modal-day.is-today {
        box-shadow: inset 0 0 0 1px rgba(110, 227, 182, 0.5);
      }

      #${modalId} .blank-canvas__custom-modal-day.is-outside-month {
        color: rgba(243, 245, 248, 0.54) !important;
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
        min-height: 56px;
        text-align: center;
        font-size: 1rem;
        font-weight: 600;
        padding: 12px 10px;
      }

      #${modalId} .blank-canvas__custom-modal-meridiem {
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        display: inline-flex;
        align-items: center;
        min-height: 56px;
        min-width: 92px;
        border: 1px solid rgba(48, 40, 31, 0.12);
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.82);
        align-self: stretch;
        color: var(--blank-canvas-color-text);
        font: inherit;
        font-size: 0.92rem;
        font-weight: 500;
        padding: 0 28px 0 12px;
        background-image:
          linear-gradient(45deg, transparent 50%, currentColor 50%),
          linear-gradient(135deg, currentColor 50%, transparent 50%);
        background-position:
          calc(100% - 14px) calc(50% - 3px),
          calc(100% - 10px) calc(50% - 3px);
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
        height: 56px;
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
        font-size: 1.08rem;
        font-weight: 700;
        line-height: 1;
        transform: translate(-50%, -50%);
      }

      #${modalId} .blank-canvas__custom-modal-error {
        min-height: 1em;
        margin: 0;
        color: var(--blank-canvas-color-danger);
        font-size: 0.82rem;
      }

      #${modalId} .blank-canvas__custom-modal-actions {
        display: flex;
        gap: 10px;
        margin-top: 6px;
      }

      #${modalId} .blank-canvas__custom-modal-actions button {
        flex: 1 1 0;
      }

      @media (max-width: 640px) {
        #${modalId} .blank-canvas__custom-modal-dialog {
          width: calc(100vw - 20px);
          margin-top: 8px;
          padding: 22px;
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
    `;
  }

  root.customAssignmentModalStyles = {
    getStyles
  };
})();
