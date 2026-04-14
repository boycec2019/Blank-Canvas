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
      const courseName = extractCourseName(anchor);

      if (!courseId || !courseName) {
        return;
      }

      const existing = courseNames[courseId];
      if (!existing || shouldPreferCourseName(courseName, existing)) {
        courseNames[courseId] = courseName;
      }
    });

    return courseNames;
  }

  function resolveCurrentCourseName(scope = document, pageContext = null) {
    const context = pageContext || (root.canvas ? root.canvas.getPageContext() : null);
    if (!context || !context.courseId) {
      return "";
    }

    const headingSelectors = [
      "[data-testid='breadcrumbs'] .ellipsible",
      ".ic-app-course-header__course-title",
      ".page-title",
      ".ellipsible",
      "h1"
    ];
    const candidate = root.utils.safeQueryAll(headingSelectors, scope).find((element) => {
      const text = normalizeText(element.textContent);
      return text && !/^(dashboard|courses|calendar|inbox|account|home)$/i.test(text);
    });

    return candidate ? cleanLabel(candidate.textContent) : "";
  }

  function buildCourseOptions(scope = document, pageContext = null) {
    const courseNames = buildCourseNameMap(scope);
    const context = pageContext || (root.canvas ? root.canvas.getPageContext() : null);
    const currentCourseId = context && context.courseId ? context.courseId : "";

    if (currentCourseId && !courseNames[currentCourseId]) {
      const currentCourseName = resolveCurrentCourseName(scope, context);
      if (currentCourseName) {
        courseNames[currentCourseId] = currentCourseName;
      }
    }

    return Object.entries(courseNames)
      .map(([courseId, courseName]) => ({
        courseId,
        courseName
      }))
      .sort((left, right) => left.courseName.localeCompare(right.courseName));
  }

  function normalizeCourseOptionName(value) {
    const normalized = cleanLabel(value);
    if (!normalized) {
      return "";
    }

    if (root.assignmentCourseResolver && root.assignmentCourseResolver.normalizeCourseName) {
      return root.assignmentCourseResolver.normalizeCourseName(normalized);
    }

    return normalized;
  }

  function getCourseTextCandidates(anchor) {
    const candidateSelectors = [
      ".ic-DashboardCard__header-title",
      ".ic-DashboardCard__header-title a",
      "[class*='course-title']",
      ".ellipsible",
      "[title]",
      "[aria-label]"
    ];
    const descendants = root.utils.safeQueryAll(candidateSelectors, anchor);

    return [
      anchor.getAttribute("data-course-name"),
      anchor.getAttribute("title"),
      anchor.getAttribute("aria-label"),
      ...descendants.flatMap((element) => [
        element.getAttribute("title"),
        element.getAttribute("aria-label"),
        element.textContent
      ]),
      anchor.textContent
    ]
      .map((value) => normalizeCourseOptionName(value))
      .filter(Boolean);
  }

  function isSuspiciousCourseName(value) {
    const normalized = normalizeText(value).toLowerCase();
    const compact = normalized.replace(/[^a-z0-9]+/g, "");

    return /…|\.\.\./.test(normalized) || /academic year/.test(normalized) || (
      compact.length > 12 &&
      compact.indexOf(compact.slice(0, Math.min(12, compact.length)), 6) !== -1
    );
  }

  function extractCourseName(anchor) {
    const candidates = getCourseTextCandidates(anchor);
    if (!candidates.length) {
      return "";
    }

    const preferred = candidates.find((value) => !isSuspiciousCourseName(value));
    return preferred || candidates[0];
  }

  function shouldPreferCourseName(nextValue, existingValue) {
    const nextSuspicious = isSuspiciousCourseName(nextValue);
    const existingSuspicious = isSuspiciousCourseName(existingValue);

    if (nextSuspicious !== existingSuspicious) {
      return !nextSuspicious;
    }

    if (existingValue && nextValue.includes(existingValue)) {
      return false;
    }

    if (nextValue && existingValue.includes(nextValue)) {
      return true;
    }

    return nextValue.length > existingValue.length;
  }

  root.assignmentUtils = {
    buildCourseOptions,
    buildCourseNameMap,
    cleanLabel,
    extractCourseId,
    getUrl,
    isAssignmentUrl,
    isCourseHomeUrl,
    normalizeText,
    normalizeCourseOptionName,
    parseDateValue,
    resolveCurrentCourseName
  };
})();
