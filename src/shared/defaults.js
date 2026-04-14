(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});

  root.defaults = Object.freeze({
    enabled: true,
    uiLayoutMode: "editorial",
    uiPhaseTypographyReset: true,
    uiPhaseDashboardShell: true,
    uiPhaseLeftRailSimplification: true,
    uiPhaseAgendaList: true,
    uiPhaseAssignmentHierarchy: true,
    uiPhaseTodayStrip: false,
    uiPhaseFocusedPages: false,
    uiPhaseMobilePolish: false,
    uiPhaseMotionPolish: false,
    showDashboardTodoList: true,
    hideRightSidebar: true,
    hideDashboardSearch: true,
    hideCourseCardImages: true,
    hideCourseCardActions: true,
    hideCourseCardMeta: true,
    hideCourseCardMenu: true,
    hideSecondaryNavItems: true,
    hiddenCourseNavItems: {},
    customHiddenSelectors: "",
    debugMode: false,
    previewMode: false
  });

  root.settingMeta = Object.freeze({
    enabled: {
      label: "Enable Blank Canvas",
      description: "Master switch for all decluttering behavior."
    },
    uiLayoutMode: {
      label: "UI layout mode",
      description: "Selects the layout system Blank Canvas should prepare for the current page."
    },
    uiPhaseTypographyReset: {
      label: "Phase 1: Typography and color reset",
      description: "Keeps the editorial visual reset behind a temporary rollout switch."
    },
    uiPhaseDashboardShell: {
      label: "Phase 2: Dashboard shell and spacing",
      description: "Keeps page-shell spacing changes behind a temporary rollout switch."
    },
    uiPhaseLeftRailSimplification: {
      label: "Phase 3: Left rail simplification",
      description: "Keeps the softened global navigation rail behind a temporary rollout switch."
    },
    uiPhaseAgendaList: {
      label: "Phase 4: Agenda list layout",
      description: "Keeps the assignment reading-list layout behind a temporary rollout switch."
    },
    uiPhaseAssignmentHierarchy: {
      label: "Phase 5: Assignment row hierarchy",
      description: "Keeps refined assignment row hierarchy behind a temporary rollout switch."
    },
    uiPhaseTodayStrip: {
      label: "Phase 6: Today strip and focus summary",
      description: "Keeps the top summary surface behind a temporary rollout switch."
    },
    uiPhaseFocusedPages: {
      label: "Phase 7: Focused page variants",
      description: "Keeps page-specific minimalist variants behind a temporary rollout switch."
    },
    uiPhaseMobilePolish: {
      label: "Phase 8: Mobile and narrow-width polish",
      description: "Keeps narrow-screen layout refinements behind a temporary rollout switch."
    },
    uiPhaseMotionPolish: {
      label: "Phase 9: Motion and final polish",
      description: "Keeps optional interaction polish behind a temporary rollout switch."
    },
    showDashboardTodoList: {
      label: "Show dashboard to-do list",
      description: "Adds a minimalist pending-assignment list to the Canvas dashboard."
    },
    hideRightSidebar: {
      label: "Hide dashboard sidebar",
      description: "Removes To Do, Recent Feedback, and related sidebar blocks."
    },
    hideDashboardSearch: {
      label: "Hide dashboard search",
      description: "Removes the course search control from the dashboard header."
    },
    hideCourseCardImages: {
      label: "Hide course card images",
      description: "Removes large dashboard card cover images."
    },
    hideCourseCardActions: {
      label: "Hide course card actions",
      description: "Removes the announcement, assignment, discussion, and files icon row."
    },
    hideCourseCardMeta: {
      label: "Hide course card metadata",
      description: "Removes secondary course card text like terms and subtitles."
    },
    hideCourseCardMenu: {
      label: "Hide course card menus",
      description: "Removes the kebab menu from course cards."
    },
    hideSecondaryNavItems: {
      label: "Hide secondary nav items",
      description: "Hides lower-priority global nav items such as Groups, History, Search, Spark, and Help."
    },
    hiddenCourseNavItems: {
      label: "Hidden course tabs",
      description: "Stores course-specific left-navigation tabs hidden through right-click."
    },
    customHiddenSelectors: {
      label: "Custom selectors",
      description: "Additional CSS selectors to hide, one per line."
    },
    debugMode: {
      label: "Debug mode",
      description: "Turns on console logging and richer diagnostics."
    },
    previewMode: {
      label: "Preview mode",
      description: "Highlights matched elements instead of hiding them."
    }
  });
})();
