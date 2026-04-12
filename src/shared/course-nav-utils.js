(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});

  function normalizeHiddenCourseNavItems(rawValue) {
    if (!rawValue || typeof rawValue !== "object" || Array.isArray(rawValue)) {
      return {};
    }

    return Object.entries(rawValue).reduce((result, [courseId, hiddenKeys]) => {
      const normalizedCourseId = String(courseId || "").trim();
      if (!normalizedCourseId || !Array.isArray(hiddenKeys)) {
        return result;
      }

      const normalizedKeys = Array.from(
        new Set(
          hiddenKeys
            .map((key) => String(key || "").trim().toLowerCase())
            .filter(Boolean)
        )
      );

      if (normalizedKeys.length) {
        result[normalizedCourseId] = normalizedKeys;
      }

      return result;
    }, {});
  }

  function getHiddenCourseNavKeys(hiddenCourseNavItems, courseId) {
    const normalizedItems = normalizeHiddenCourseNavItems(hiddenCourseNavItems);
    const normalizedCourseId = String(courseId || "").trim();

    return Array.isArray(normalizedItems[normalizedCourseId]) ? normalizedItems[normalizedCourseId] : [];
  }

  function addHiddenCourseNavItem(hiddenCourseNavItems, courseId, key) {
    const normalizedItems = normalizeHiddenCourseNavItems(hiddenCourseNavItems);
    const normalizedCourseId = String(courseId || "").trim();
    const normalizedKey = String(key || "").trim().toLowerCase();

    if (!normalizedCourseId || !normalizedKey) {
      return normalizedItems;
    }

    const currentKeys = getHiddenCourseNavKeys(normalizedItems, normalizedCourseId);
    if (currentKeys.includes(normalizedKey)) {
      return normalizedItems;
    }

    return {
      ...normalizedItems,
      [normalizedCourseId]: [...currentKeys, normalizedKey]
    };
  }

  function getCourseIdFromPath(pathname = window.location.pathname) {
    const normalizedPath = String(pathname || "").replace(/\/+$/, "") || "/";
    const courseIdMatch = normalizedPath.match(/\/courses\/(\d+)(?:\/|$)/i);

    return courseIdMatch ? courseIdMatch[1] : "";
  }

  function buildCourseNavHref(courseId, key) {
    const normalizedCourseId = String(courseId || "").trim();
    const normalizedKey = String(key || "").trim().toLowerCase();

    if (!normalizedCourseId || !normalizedKey) {
      return "";
    }

    if (normalizedKey === "home") {
      return `/courses/${normalizedCourseId}`;
    }

    if (!/^[a-z0-9/_-]+$/.test(normalizedKey)) {
      return "";
    }

    return `/courses/${normalizedCourseId}/${normalizedKey}`;
  }

  function escapeAttributeValue(value) {
    return String(value || "")
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"');
  }

  function buildCriticalCourseNavCss(hiddenCourseNavItems, courseId, rootAttribute = "data-blank-canvas-preload") {
    const hrefs = getHiddenCourseNavKeys(hiddenCourseNavItems, courseId)
      .map((key) => buildCourseNavHref(courseId, key))
      .filter(Boolean);

    if (!hrefs.length) {
      return "";
    }

    const selectors = hrefs.flatMap((href) => {
      const escapedHref = escapeAttributeValue(href);
      const hrefVariants = [`[href$="${escapedHref}"]`, `[href$="${escapedHref}/"]`];

      return hrefVariants.flatMap((hrefSelector) => [
        `html[${rootAttribute}="true"] #section-tabs li:has(> a${hrefSelector})`,
        `html[${rootAttribute}="true"] .ic-app-course-menu li:has(> a${hrefSelector})`,
        `html[${rootAttribute}="true"] nav[aria-label='Course Navigation'] li:has(> a${hrefSelector})`,
        `html[${rootAttribute}="true"] #section-tabs a${hrefSelector}`,
        `html[${rootAttribute}="true"] .ic-app-course-menu a${hrefSelector}`,
        `html[${rootAttribute}="true"] nav[aria-label='Course Navigation'] a${hrefSelector}`
      ]);
    });

    return `
      ${selectors.join(",\n      ")} {
        display: none !important;
      }
    `;
  }

  root.courseNavUtils = {
    addHiddenCourseNavItem,
    buildCourseNavHref,
    buildCriticalCourseNavCss,
    getCourseIdFromPath,
    getHiddenCourseNavKeys,
    normalizeHiddenCourseNavItems
  };
})();
