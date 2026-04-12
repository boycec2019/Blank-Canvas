(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});
  const isDashboardShellActive = (context, settings) =>
    context.isDashboard &&
    root.ui.isEditorialPhaseActive(settings, root.ui.PHASE_DASHBOARD_SHELL);

  const cssRules = [
    {
      id: "hideDashboardHeaderSearchWidget",
      label: "Hide dashboard header search widget",
      settingKey: "uiPhaseDashboardShell",
      when: isDashboardShellActive,
      getSelectors: () => root.dashboardHeader.getSearchWidgetSelectors()
    },
    {
      id: "hideDashboardHeaderOptionsButton",
      label: "Hide dashboard header options button",
      settingKey: "uiPhaseDashboardShell",
      when: isDashboardShellActive,
      getSelectors: () => root.dashboardHeader.getOptionsButtonSelectors()
    },
    {
      id: "hideRightSidebar",
      label: "Hide dashboard sidebar",
      settingKey: "hideRightSidebar",
      when: (context) => context.isDashboard,
      selectors: ["#right-side-wrapper", "#right-side"]
    },
    {
      id: "hideCourseCardImages",
      label: "Hide course card images",
      settingKey: "hideCourseCardImages",
      when: (context) => context.isDashboard,
      selectors: [
        ".ic-DashboardCard__header_image",
        ".ic-DashboardCard__header_hero",
        ".ic-DashboardCard__hero",
        ".ic-DashboardCard__cover-image"
      ]
    },
    {
      id: "hideCourseCardActions",
      label: "Hide course card action row",
      settingKey: "hideCourseCardActions",
      when: (context) => context.isDashboard,
      selectors: [
        ".ic-DashboardCard__action-container",
        ".ic-DashboardCard__action-layout",
        ".ic-DashboardCard__actions"
      ]
    },
    {
      id: "hideCourseCardMeta",
      label: "Hide course card metadata",
      settingKey: "hideCourseCardMeta",
      when: (context) => context.isDashboard,
      selectors: [
        ".ic-DashboardCard__header-subtitle",
        ".ic-DashboardCard__header-term"
      ]
    },
    {
      id: "hideCourseCardMenu",
      label: "Hide course card menu",
      settingKey: "hideCourseCardMenu",
      when: (context) => context.isDashboard,
      selectors: [
        ".ic-DashboardCard__header-button-bg",
        ".ic-DashboardCard__header-button",
        ".ic-DashboardCard__header_hero button[aria-haspopup='menu']"
      ]
    },
    {
      id: "customHiddenSelectors",
      label: "Hide custom selectors",
      settingKey: "customHiddenSelectors",
      when: () => true,
      getSelectors: (settings) =>
        root.utils.filterValidSelectors(root.utils.parseSelectorList(settings.customHiddenSelectors))
    }
  ];

  const domRules = [
    {
      id: "hideDashboardSearch",
      label: "Hide dashboard search",
      settingKey: "hideDashboardSearch",
      when: (context) => context.isDashboard,
      getTargets: () => root.canvas.findDashboardSearchTargets()
    },
    {
      id: "hideSecondaryNavItems",
      label: "Hide secondary nav items",
      settingKey: "hideSecondaryNavItems",
      when: () => true,
      getTargets: () => root.canvas.findSecondaryNavItems()
    },
    {
      id: "hideCourseNavTabs",
      label: "Hide course nav tabs",
      settingKey: "hiddenCourseNavItems",
      when: (context) => context.isCourse,
      getTargets: (settings, context, scope) => root.canvas.findHiddenCourseNavTargets(settings, context, scope)
    }
  ];

  function isRuleEnabled(rule, settings, context) {
    if (!settings.enabled) {
      return false;
    }

    const settingValue = settings[rule.settingKey];
    if (typeof settingValue === "string") {
      return settingValue.trim().length > 0;
    }

    if (Array.isArray(settingValue)) {
      return settingValue.length > 0 && rule.when(context, settings);
    }

    if (settingValue && typeof settingValue === "object") {
      return Object.keys(settingValue).length > 0 && rule.when(context, settings);
    }

    return Boolean(settingValue) && rule.when(context, settings);
  }

  function getApplicableCssRules(settings, context) {
    return cssRules.filter((rule) => isRuleEnabled(rule, settings, context));
  }

  function getApplicableDomRules(settings, context) {
    return domRules.filter((rule) => isRuleEnabled(rule, settings, context));
  }

  function resolveSelectors(rule, settings, context) {
    if (!rule.when(context, settings)) {
      return [];
    }

    const selectors = rule.getSelectors ? rule.getSelectors(settings, context) : rule.selectors || [];
    return root.utils.filterValidSelectors(selectors);
  }

  function resolveTargets(rule, settings, context) {
    if (!rule.when(context, settings)) {
      return [];
    }

    return root.utils.uniqueElements(rule.getTargets(settings, context));
  }

  root.ruleEngine = {
    cssRules,
    domRules,
    getApplicableCssRules,
    getApplicableDomRules,
    resolveSelectors,
    resolveTargets
  };
})();
