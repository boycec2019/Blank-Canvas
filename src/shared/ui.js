(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});
  const DEFAULT_LAYOUT_MODE = "classic";
  const PHASE_TYPOGRAPHY_RESET = "uiPhaseTypographyReset";
  const PHASE_DASHBOARD_SHELL = "uiPhaseDashboardShell";
  const PHASE_LEFT_RAIL_SIMPLIFICATION = "uiPhaseLeftRailSimplification";
  const PHASE_AGENDA_LIST = "uiPhaseAgendaList";
  const PHASE_ASSIGNMENT_HIERARCHY = "uiPhaseAssignmentHierarchy";

  const layoutModes = Object.freeze({
    classic: Object.freeze({
      id: "classic",
      label: "Classic",
      description: "Keeps the current stable layout while the redesign scaffolding lands."
    }),
    editorial: Object.freeze({
      id: "editorial",
      label: "Editorial",
      description: "Turns on the new minimalist design system scaffolding and future UI phases."
    })
  });

  const phaseDefinitions = Object.freeze([
    Object.freeze({
      id: "uiPhaseTypographyReset",
      className: "blank-canvas--phase-typography-reset",
      label: "Phase 1: Typography and color reset",
      description: "Allows the editorial palette, type scale, and calmer surface treatments."
    }),
    Object.freeze({
      id: "uiPhaseDashboardShell",
      className: "blank-canvas--phase-dashboard-shell",
      label: "Phase 2: Dashboard shell and spacing",
      description: "Enables the larger page rhythm and dashboard shell cleanup."
    }),
    Object.freeze({
      id: PHASE_LEFT_RAIL_SIMPLIFICATION,
      className: "blank-canvas--phase-left-rail-simplification",
      label: "Phase 3: Left rail simplification",
      description: "Softens the global navigation rail without changing Canvas navigation behavior."
    }),
    Object.freeze({
      id: PHASE_AGENDA_LIST,
      className: "blank-canvas--phase-agenda-list",
      label: "Phase 4: Agenda list layout",
      description: "Switches the dashboard assignments widget toward a reading-list layout."
    }),
    Object.freeze({
      id: PHASE_ASSIGNMENT_HIERARCHY,
      className: "blank-canvas--phase-assignment-hierarchy",
      label: "Phase 5: Assignment row hierarchy",
      description: "Enables refined assignment row metadata and status emphasis."
    }),
    Object.freeze({
      id: "uiPhaseTodayStrip",
      className: "blank-canvas--phase-today-strip",
      label: "Phase 6: Today strip and focus summary",
      description: "Turns on the compact top summary surface once it exists."
    }),
    Object.freeze({
      id: "uiPhaseFocusedPages",
      className: "blank-canvas--phase-focused-pages",
      label: "Phase 7: Focused page variants",
      description: "Allows page-specific minimalist variants outside the dashboard."
    }),
    Object.freeze({
      id: "uiPhaseMobilePolish",
      className: "blank-canvas--phase-mobile-polish",
      label: "Phase 8: Mobile and narrow-width polish",
      description: "Enables layout and spacing refinements for narrower screens."
    }),
    Object.freeze({
      id: "uiPhaseMotionPolish",
      className: "blank-canvas--phase-motion-polish",
      label: "Phase 9: Motion and final polish",
      description: "Allows subtle transitions and interaction polish once structure is stable."
    })
  ]);

  function normalizeLayoutMode(value) {
    if (typeof value === "string" && layoutModes[value]) {
      return value;
    }

    return DEFAULT_LAYOUT_MODE;
  }

  function getLayoutModeMeta(value) {
    return layoutModes[normalizeLayoutMode(value)];
  }

  function getLayoutMode(settings) {
    return normalizeLayoutMode(settings && settings.uiLayoutMode);
  }

  function isLayoutMode(settings, layoutMode) {
    return getLayoutMode(settings) === layoutMode;
  }

  function getPhaseDefinitions() {
    return phaseDefinitions.slice();
  }

  function normalizePhaseFlags(settings) {
    return phaseDefinitions.reduce((result, phase) => {
      result[phase.id] = Boolean(settings && settings[phase.id]);
      return result;
    }, {});
  }

  function getPhaseStates(settings) {
    return phaseDefinitions.map((phase) => ({
      ...phase,
      enabled: Boolean(settings && settings[phase.id])
    }));
  }

  function isPhaseEnabled(settings, phaseId) {
    return Boolean(settings && settings[phaseId]);
  }

  function isEditorialPhaseActive(settings, phaseId) {
    return isLayoutMode(settings, "editorial") && isPhaseEnabled(settings, phaseId);
  }

  function getActivePhaseIds(settings) {
    return getPhaseStates(settings)
      .filter((phase) => phase.enabled)
      .map((phase) => phase.id);
  }

  function buildTokenMap(settings) {
    const useEditorialTokens = isEditorialPhaseActive(settings, PHASE_TYPOGRAPHY_RESET);
    const sharedTokens = {
      "--blank-canvas-font-sans": '"Aptos", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
      "--blank-canvas-font-serif": '"Georgia", "Times New Roman", serif',
      "--blank-canvas-font-body": "var(--blank-canvas-font-sans)",
      "--blank-canvas-font-heading": "var(--blank-canvas-font-sans)",
      "--blank-canvas-space-1": "8px",
      "--blank-canvas-space-2": "12px",
      "--blank-canvas-space-3": "16px",
      "--blank-canvas-space-4": "20px",
      "--blank-canvas-space-5": "24px",
      "--blank-canvas-space-6": "32px",
      "--blank-canvas-radius-sm": "12px",
      "--blank-canvas-radius-md": "16px",
      "--blank-canvas-radius-lg": "20px",
      "--blank-canvas-shadow-panel": "0 18px 40px rgba(15, 23, 42, 0.08)",
      "--blank-canvas-shadow-card": "0 6px 18px rgba(15, 23, 42, 0.05)",
      "--blank-canvas-shadow-card-hover": "0 10px 22px rgba(15, 23, 42, 0.08)"
    };
    const classicTokens = {
      "--blank-canvas-color-bg": "#fbfcff",
      "--blank-canvas-color-surface": "#ffffff",
      "--blank-canvas-color-surface-elevated": "rgba(255, 255, 255, 0.98)",
      "--blank-canvas-color-surface-muted": "rgba(247, 250, 255, 0.96)",
      "--blank-canvas-color-text": "#10203a",
      "--blank-canvas-color-muted": "#5a6a82",
      "--blank-canvas-color-accent": "#153e75",
      "--blank-canvas-color-warning": "#8a4b14",
      "--blank-canvas-color-danger": "#b03817",
      "--blank-canvas-border-subtle": "rgba(15, 23, 42, 0.08)",
      "--blank-canvas-border-strong": "rgba(21, 62, 117, 0.1)",
      "--blank-canvas-border-hover": "rgba(21, 62, 117, 0.22)",
      "--blank-canvas-border-danger": "rgba(176, 56, 23, 0.18)"
    };
    const editorialTokens = {
      "--blank-canvas-color-bg": "#f6f1e8",
      "--blank-canvas-color-surface": "#fbf8f2",
      "--blank-canvas-color-surface-elevated": "rgba(251, 248, 242, 0.98)",
      "--blank-canvas-color-surface-muted": "rgba(246, 241, 232, 0.92)",
      "--blank-canvas-color-text": "#1f1c19",
      "--blank-canvas-color-muted": "#6d655d",
      "--blank-canvas-color-accent": "#2f5d50",
      "--blank-canvas-color-warning": "#8d5a36",
      "--blank-canvas-color-danger": "#b86a4b",
      "--blank-canvas-border-subtle": "rgba(44, 38, 31, 0.08)",
      "--blank-canvas-border-strong": "rgba(47, 93, 80, 0.12)",
      "--blank-canvas-border-danger": "rgba(184, 106, 75, 0.18)",
      "--blank-canvas-border-hover": "rgba(47, 93, 80, 0.22)",
      "--blank-canvas-font-heading": "var(--blank-canvas-font-serif)",
      "--blank-canvas-shadow-panel": "0 18px 36px rgba(50, 42, 29, 0.08)",
      "--blank-canvas-shadow-card": "0 8px 18px rgba(50, 42, 29, 0.04)",
      "--blank-canvas-shadow-card-hover": "0 12px 24px rgba(50, 42, 29, 0.06)"
    };

    return {
      ...sharedTokens,
      ...(useEditorialTokens ? editorialTokens : classicTokens)
    };
  }

  function buildTokenCss(settings) {
    const tokens = buildTokenMap(settings);
    return Object.entries(tokens)
      .map(([key, value]) => `        ${key}: ${value};`)
      .join("\n");
  }

  function applyDocumentTheme(target, settings) {
    if (!target) {
      return;
    }

    const tokens = buildTokenMap(settings);
    Object.entries(tokens).forEach(([key, value]) => {
      target.style.setProperty(key, value);
    });

    target.dataset.blankCanvasLayoutMode = getLayoutMode(settings);
    phaseDefinitions.forEach((phase) => {
      target.dataset[phase.id] = isPhaseEnabled(settings, phase.id) ? "true" : "false";
    });
  }

  root.ui = {
    DEFAULT_LAYOUT_MODE,
    PHASE_TYPOGRAPHY_RESET,
    PHASE_DASHBOARD_SHELL,
    PHASE_LEFT_RAIL_SIMPLIFICATION,
    PHASE_AGENDA_LIST,
    PHASE_ASSIGNMENT_HIERARCHY,
    layoutModes,
    phaseDefinitions,
    normalizeLayoutMode,
    normalizePhaseFlags,
    getLayoutMode,
    getLayoutModeMeta,
    isLayoutMode,
    getPhaseDefinitions,
    getPhaseStates,
    isPhaseEnabled,
    isEditorialPhaseActive,
    getActivePhaseIds,
    buildTokenMap,
    buildTokenCss,
    applyDocumentTheme
  };
})();
