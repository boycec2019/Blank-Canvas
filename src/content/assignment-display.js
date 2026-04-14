(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});
  const LARGE_SORT_VALUE = Number.MAX_SAFE_INTEGER;
  const dateFormatterCache = new Map();
  const timeFormatterCache = new Map();

  function getLocale(options) {
    if (options && options.locale) {
      return options.locale;
    }

    if (typeof navigator !== "undefined" && navigator.language) {
      return navigator.language;
    }

    return "en-US";
  }

  function getTimeZone(options) {
    return options && options.timeZone ? options.timeZone : undefined;
  }

  function getFormatterCacheKey(options) {
    return [getLocale(options), getTimeZone(options) || ""].join("|");
  }

  function getCachedFormatter(cache, options, factory) {
    const cacheKey = getFormatterCacheKey(options);

    if (!cache.has(cacheKey)) {
      cache.set(cacheKey, factory());
    }

    return cache.get(cacheKey);
  }

  function getDateFormatter(options) {
    return getCachedFormatter(dateFormatterCache, options, () => {
      return new Intl.DateTimeFormat(getLocale(options), {
        weekday: "short",
        month: "short",
        day: "numeric",
        timeZone: getTimeZone(options)
      });
    });
  }

  function getTimeFormatter(options) {
    return getCachedFormatter(timeFormatterCache, options, () => {
      return new Intl.DateTimeFormat(getLocale(options), {
        hour: "numeric",
        minute: "2-digit",
        timeZone: getTimeZone(options)
      });
    });
  }

  function getStatusTone(dueLabel) {
    const value = root.assignmentUtils.cleanLabel(dueLabel).toLowerCase();

    if (value.includes("missing")) {
      return "missing";
    }

    if (value.includes("overdue")) {
      return "overdue";
    }

    if (value.includes("late")) {
      return "late";
    }

    return "pending";
  }

  function formatCourseName(courseName) {
    return root.assignmentCourseResolver.normalizeCourseName(courseName);
  }

  function buildDisplayTitle(primaryTitle, courseName) {
    const cleanTitle = root.assignmentUtils.cleanLabel(primaryTitle);
    const cleanCourseName = formatCourseName(courseName);

    if (!cleanTitle) {
      return cleanCourseName;
    }

    if (!cleanCourseName) {
      return cleanTitle;
    }

    if (cleanTitle.toLowerCase() === cleanCourseName.toLowerCase()) {
      return cleanTitle;
    }

    return `${cleanCourseName} - ${cleanTitle}`;
  }

  function formatDueDisplay(dueAt, dueLabel, options = {}) {
    const parsedDate = root.assignmentUtils.parseDateValue(dueAt);
    const cleanDueLabel = root.assignmentUtils.cleanLabel(dueLabel);

    if (parsedDate) {
      const dueDateText = getDateFormatter(options).format(parsedDate);
      const dueTimeText = getTimeFormatter(options).format(parsedDate);

      return {
        dueDateText,
        dueTimeText,
        dueSummaryText: `${dueDateText} at ${dueTimeText}`,
        dueSortValue: parsedDate.getTime()
      };
    }

    if (cleanDueLabel) {
      return {
        dueDateText: cleanDueLabel,
        dueTimeText: "Time not listed",
        dueSummaryText: cleanDueLabel,
        dueSortValue: LARGE_SORT_VALUE
      };
    }

    return {
      dueDateText: "Due date not listed",
      dueTimeText: "Time not listed",
      dueSummaryText: "Due date not listed",
      dueSortValue: LARGE_SORT_VALUE
    };
  }

  root.assignmentDisplay = {
    buildDisplayTitle,
    formatCourseName,
    formatDueDisplay,
    getStatusTone
  };
})();
