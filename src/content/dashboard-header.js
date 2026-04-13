(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});

  const SEARCH_WIDGET_SELECTORS = Object.freeze([
    "atomic-search-desktop-widget",
    ".ajax-search-widget.ajax-search-widget-dashboard",
    "#ajax-search-form"
  ]);
  const OPTIONS_BUTTON_SELECTORS = Object.freeze([
    "button[data-testid='dashboard-options-button']"
  ]);
  const HEADING_SELECTORS = Object.freeze([
    "#dashboard h1",
    ".ic-Dashboard-header h1",
    ".ic-Dashboard-header__layout h1",
    "#dashboard h2",
    ".ic-Dashboard-header h2",
    ".ic-Dashboard-header__layout h2"
  ]);

  function getSearchWidgetSelectors() {
    return [...SEARCH_WIDGET_SELECTORS];
  }

  function getOptionsButtonSelectors() {
    return [...OPTIONS_BUTTON_SELECTORS];
  }

  function getProtectedHeadingSelectors() {
    return [...HEADING_SELECTORS];
  }

  function getHeaderChromeSelectors() {
    return [...SEARCH_WIDGET_SELECTORS, ...OPTIONS_BUTTON_SELECTORS];
  }

  function getMatchedElements(selectors, scope = document) {
    return root.utils.safeQueryAll(selectors, scope);
  }

  function isVisibleElement(element) {
    if (!(element instanceof Element)) {
      return false;
    }

    const style = window.getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
  }

  function isProtectedElement(element) {
    if (!(element instanceof Element)) {
      return false;
    }

    const headingSelectors = HEADING_SELECTORS.join(", ");
    return element.matches(headingSelectors) || Boolean(element.querySelector(headingSelectors));
  }

  function getDebugSnapshot(scope = document) {
    const headingMatches = getMatchedElements(HEADING_SELECTORS, scope);
    const searchMatches = getMatchedElements(SEARCH_WIDGET_SELECTORS, scope);
    const optionsMatches = getMatchedElements(OPTIONS_BUTTON_SELECTORS, scope);
    const protectedHeadingText =
      headingMatches
        .map((element) => (element.textContent || "").replace(/\s+/g, " ").trim())
        .find(Boolean) || "";

    return {
      protectedHeadingText,
      heading: {
        selectors: getProtectedHeadingSelectors(),
        matchedCount: headingMatches.length,
        visibleCount: headingMatches.filter(isVisibleElement).length
      },
      searchWidget: {
        selectors: getSearchWidgetSelectors(),
        matchedCount: searchMatches.length,
        visibleCount: searchMatches.filter(isVisibleElement).length
      },
      optionsButton: {
        selectors: getOptionsButtonSelectors(),
        matchedCount: optionsMatches.length,
        visibleCount: optionsMatches.filter(isVisibleElement).length
      }
    };
  }

  root.dashboardHeader = {
    getSearchWidgetSelectors,
    getOptionsButtonSelectors,
    getProtectedHeadingSelectors,
    getHeaderChromeSelectors,
    isProtectedElement,
    getDebugSnapshot
  };
})();
