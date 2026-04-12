(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});

  root.defaults = Object.freeze({
    enabled: true,
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
