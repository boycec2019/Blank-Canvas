(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});

  function normalizeText(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function cleanLabel(rawValue) {
    const value = normalizeText(rawValue);
    return value ? value.replace(/[.:]\s*$/, "") : "";
  }

  function getUrl(rawUrl, baseUrl = window.location.href) {
    if (!rawUrl) {
      return null;
    }

    try {
      return new URL(rawUrl, baseUrl);
    } catch (error) {
      return null;
    }
  }

  function parseDateValue(rawValue) {
    if (!rawValue) {
      return null;
    }

    const date = new Date(rawValue);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function extractCourseId(rawUrl, baseUrl = window.location.href) {
    const url = getUrl(rawUrl, baseUrl);
    if (!url) {
      return null;
    }

    const match = url.pathname.match(/\/courses\/(\d+)(?:\/|$)/i);
    return match ? match[1] : null;
  }

  function isAssignmentUrl(rawUrl, baseUrl = window.location.href) {
    const url = getUrl(rawUrl, baseUrl);
    if (!url) {
      return false;
    }

    return /\/courses\/\d+\/assignments\/[^/?#]+/i.test(url.pathname);
  }

  function isCourseHomeUrl(rawUrl, baseUrl = window.location.href) {
    const url = getUrl(rawUrl, baseUrl);
    if (!url) {
      return false;
    }

    return /^\/courses\/\d+\/?$/i.test(url.pathname);
  }

  function buildCourseNameMap(scope = document) {
    const courseNames = {};

    Array.from(scope.querySelectorAll("a[href*='/courses/']")).forEach((anchor) => {
      if (!isCourseHomeUrl(anchor.href)) {
        return;
      }

      const courseId = extractCourseId(anchor.href);
      const courseName = normalizeText(
        anchor.textContent ||
          anchor.getAttribute("title") ||
          anchor.getAttribute("aria-label")
      );

      if (!courseId || !courseName) {
        return;
      }

      const existing = courseNames[courseId];
      if (!existing || courseName.length > existing.length) {
        courseNames[courseId] = courseName;
      }
    });

    return courseNames;
  }

  root.assignmentUtils = {
    buildCourseNameMap,
    cleanLabel,
    extractCourseId,
    getUrl,
    isAssignmentUrl,
    isCourseHomeUrl,
    normalizeText,
    parseDateValue
  };
})();
