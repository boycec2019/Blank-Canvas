(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});

  root.version = "0.1.0";
  root.utils = root.utils || {};

  root.utils.debounce = function debounce(fn, wait = 150) {
    let timeoutId = null;

    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), wait);
    };
  };

  root.utils.parseSelectorList = function parseSelectorList(rawValue) {
    return String(rawValue || "")
      .split(/\r?\n|,/)
      .map((selector) => selector.trim())
      .filter(Boolean);
  };

  root.utils.isValidSelector = function isValidSelector(selector) {
    if (!selector || typeof document === "undefined") {
      return Boolean(selector);
    }

    try {
      document.querySelector(selector);
      return true;
    } catch (error) {
      return false;
    }
  };

  root.utils.filterValidSelectors = function filterValidSelectors(selectors) {
    return selectors.filter((selector) => root.utils.isValidSelector(selector));
  };

  root.utils.uniqueElements = function uniqueElements(elements) {
    return Array.from(new Set((elements || []).filter(Boolean)));
  };

  root.utils.safeQueryAll = function safeQueryAll(selectors, scope = document) {
    const elements = [];

    selectors.forEach((selector) => {
      try {
        elements.push(...scope.querySelectorAll(selector));
      } catch (error) {
        if (root.debug) {
          root.debug.warn("selectors", "Invalid selector skipped.", {
            selector,
            error: String(error)
          });
        }
      }
    });

    return root.utils.uniqueElements(elements);
  };
})();
