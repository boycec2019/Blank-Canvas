(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});
  const ACADEMIC_TERM_PATTERN = /\b(Spring|Summer|Fall|Winter)\s+\d{4}\b/gi;
  const ACADEMIC_YEAR_PATTERN = /\b\d{4}\s*-\s*\d{2,4}\s+Academic\s+Year\b/gi;
  const FALLBACK_COURSE_PATTERN = /^Course\s+\d{3,}$/i;

  function escapeRegExp(value) {
    return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function normalizeCourseCode(value) {
    const normalized = root.assignmentUtils
      .normalizeText(value)
      .replace(/\b[A-Z&]{2,}\s+(?=\d)/g, "")
      .replace(/[^A-Z0-9/]+/gi, "")
      .toUpperCase();

    return normalized;
  }

  function normalizeLabelBoundaries(value) {
    return root.assignmentUtils
      .normalizeText(String(value || ""))
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/([A-Za-z0-9])((?:Spring|Summer|Fall|Winter)\s+\d{4})/g, "$1 $2")
      .replace(/(\d{4})\s*-\s*(\d{2,4})/g, "$1-$2")
      .replace(/\s*\|\s*/g, " | ")
      .replace(/[–—]/g, "-")
      .replace(/\s*-\s*/g, " - ");
  }

  function collapseRepeatedPrefix(value) {
    const normalized = root.assignmentUtils.normalizeText(value);
    const maxPrefixLength = Math.floor(normalized.length / 2);

    for (let prefixLength = 4; prefixLength <= maxPrefixLength; prefixLength += 1) {
      const prefix = normalized.slice(0, prefixLength).trim();
      if (prefix.length < 4) {
        continue;
      }

      const doubledPrefix = `${prefix}${prefix}`;
      if (!normalized.startsWith(doubledPrefix)) {
        continue;
      }

      const remainder = normalized.slice(doubledPrefix.length).trim();
      if (!remainder || /^(spring|summer|fall|winter|\(|\[|-|,)/i.test(remainder)) {
        return root.assignmentUtils.normalizeText([prefix, remainder].filter(Boolean).join(" "));
      }
    }

    return normalized;
  }

  function collapseRepeatedPhrase(value) {
    const normalized = root.assignmentUtils.normalizeText(value);
    const maxPrefixLength = Math.floor(normalized.length / 2);

    for (let prefixLength = maxPrefixLength; prefixLength >= 8; prefixLength -= 1) {
      const prefix = normalized.slice(0, prefixLength).trim();
      if (prefix.length < 8) {
        continue;
      }

      const remainder = normalized.slice(prefixLength).trim();
      if (!remainder.startsWith(prefix)) {
        continue;
      }

      const trailingSuffix = root.assignmentUtils.normalizeText(remainder.slice(prefix.length));
      if (!trailingSuffix) {
        return prefix;
      }

      ACADEMIC_YEAR_PATTERN.lastIndex = 0;
      ACADEMIC_TERM_PATTERN.lastIndex = 0;
      if (ACADEMIC_YEAR_PATTERN.test(trailingSuffix) || ACADEMIC_TERM_PATTERN.test(trailingSuffix)) {
        ACADEMIC_YEAR_PATTERN.lastIndex = 0;
        ACADEMIC_TERM_PATTERN.lastIndex = 0;
        return root.assignmentUtils.cleanLabel([prefix, stripAcademicTerms(trailingSuffix)].filter(Boolean).join(" "));
      }

      ACADEMIC_YEAR_PATTERN.lastIndex = 0;
      ACADEMIC_TERM_PATTERN.lastIndex = 0;
    }

    return normalized;
  }

  function stripAcademicTerms(value) {
    return root.assignmentUtils.cleanLabel(
      root.assignmentUtils.normalizeText(
        String(value || "")
          .replace(ACADEMIC_TERM_PATTERN, " ")
          .replace(ACADEMIC_YEAR_PATTERN, " ")
      )
    );
  }

  function stripTrailingRepeatedCode(value) {
    const normalized = root.assignmentUtils.cleanLabel(value);
    if (!normalized.includes("|")) {
      return normalized;
    }

    const [codePart, ...restParts] = normalized.split("|");
    const titlePart = root.assignmentUtils.cleanLabel(restParts.join("|"));
    const normalizedCode = normalizeCourseCode(codePart);
    const suffixMatch = titlePart.match(/^(.*?)(?:\s+)([A-Z]{2,}\s*\d+[A-Z0-9/.-]*)$/i);

    if (!normalizedCode || !suffixMatch) {
      return root.assignmentUtils.cleanLabel([codePart, titlePart].filter(Boolean).join(" | "));
    }

    const suffixCode = normalizeCourseCode(suffixMatch[2]);
    if (!suffixCode || suffixCode !== normalizedCode) {
      return root.assignmentUtils.cleanLabel([codePart, titlePart].filter(Boolean).join(" | "));
    }

    const cleanedTitle = root.assignmentUtils.cleanLabel(suffixMatch[1]);
    return root.assignmentUtils.cleanLabel([codePart, cleanedTitle].filter(Boolean).join(" | "));
  }

  function compactYearRanges(value) {
    return root.assignmentUtils.cleanLabel(String(value || "").replace(/(\d{4})\s+-\s+(\d{2,4})/g, "$1-$2"));
  }

  function normalizeCourseName(value) {
    const normalized = root.assignmentUtils.cleanLabel(value);
    if (!normalized) {
      return "";
    }

    const withBoundaries = normalizeLabelBoundaries(normalized);
    const withoutRepeatedPhrase = collapseRepeatedPhrase(withBoundaries);
    const withoutTerms = stripAcademicTerms(withoutRepeatedPhrase) || withoutRepeatedPhrase;
    const collapsed = collapseRepeatedPrefix(withoutTerms);
    const withoutRepeatedCode = stripTrailingRepeatedCode(collapsed);

    return compactYearRanges(root.assignmentUtils.cleanLabel(withoutRepeatedCode || collapsed || withBoundaries));
  }

  function getFallbackCourseName(courseId) {
    return courseId ? `Course ${courseId}` : "Canvas course";
  }

  function isFallbackCourseName(value, courseId = "") {
    const normalized = root.assignmentUtils.cleanLabel(value);
    if (!normalized) {
      return false;
    }

    if (normalized === "Canvas course") {
      return true;
    }

    if (courseId && normalized === getFallbackCourseName(courseId)) {
      return true;
    }

    return FALLBACK_COURSE_PATTERN.test(normalized);
  }

  function collectCourseNameCandidate({ value, source, courseId }) {
    const normalized = normalizeCourseName(value);
    if (!normalized) {
      return null;
    }

    return {
      source,
      value: normalized,
      isFallbackCourseName: isFallbackCourseName(normalized, courseId)
    };
  }

  function resolveCourseName(options = {}) {
    const courseId = String(options.courseId || "");
    const candidates = [
      collectCourseNameCandidate({
        value: options.previousCourseName,
        source: "stored",
        courseId
      }),
      collectCourseNameCandidate({
        value: options.courseMapName,
        source: "dom-map",
        courseId
      }),
      collectCourseNameCandidate({
        value: options.localCourseName,
        source: "dom-local",
        courseId
      }),
      collectCourseNameCandidate({
        value: options.scopedCourseName,
        source: "dom-scope",
        courseId
      }),
      collectCourseNameCandidate({
        value: options.itemCourseName,
        source: options.itemCourseNameSource || "item",
        courseId
      }),
      collectCourseNameCandidate({
        value: options.fallbackCourseName || getFallbackCourseName(courseId),
        source: "fallback",
        courseId
      })
    ].filter(Boolean);

    const preferred = candidates.find((candidate) => !candidate.isFallbackCourseName);
    const resolved = preferred || candidates[0] || {
      source: "fallback",
      value: getFallbackCourseName(courseId),
      isFallbackCourseName: true
    };

    return {
      courseId,
      courseName: resolved.value,
      debugSource: resolved.source,
      isFallbackCourseName: resolved.isFallbackCourseName
    };
  }

  function buildCompactPattern(value) {
    return root.assignmentUtils
      .normalizeText(value)
      .replace(/[^a-z0-9]+/gi, "")
      .toLowerCase();
  }

  function stripLeadingCourseResidue(title, courseName) {
    const normalizedCourseName = normalizeCourseName(courseName);
    const compactCourse = buildCompactPattern(normalizedCourseName);
    if (!normalizedCourseName || !compactCourse) {
      return {
        value: title,
        wasNormalized: false
      };
    }

    let nextTitle = normalizeLabelBoundaries(title);
    let wasNormalized = false;
    const prefixPattern = new RegExp(`^${escapeRegExp(normalizedCourseName)}(?:\\s*[-:|]\\s*|\\s+)`, "i");

    if (prefixPattern.test(nextTitle)) {
      nextTitle = nextTitle.replace(prefixPattern, "");
      wasNormalized = true;
    }

    const compactTitle = buildCompactPattern(nextTitle);
    if (!wasNormalized && compactTitle.startsWith(compactCourse)) {
      nextTitle = nextTitle.slice(normalizedCourseName.length);
      nextTitle = nextTitle.replace(/^\s*[-:|]\s*/, "");
      wasNormalized = true;
    }

    const codeSegment = normalizeCourseCode(normalizedCourseName.split("|")[0]);
    if (codeSegment) {
      const residuePattern = new RegExp(
        `^(?:[A-Z]{2,}\\s*)?${escapeRegExp(codeSegment)}(?:\\s+(?:Spring|Summer|Fall|Winter)\\s+\\d{4})?\\s*[-:|]?\\s*`,
        "i"
      );
      if (residuePattern.test(nextTitle)) {
        nextTitle = nextTitle.replace(residuePattern, "");
        wasNormalized = true;
      }
    }

    return {
      value: root.assignmentUtils.cleanLabel(nextTitle) || root.assignmentUtils.cleanLabel(title),
      wasNormalized
    };
  }

  function buildTitleHierarchy(title, courseName) {
    const normalizedTitle = root.assignmentUtils.cleanLabel(normalizeLabelBoundaries(title));
    if (!normalizedTitle) {
      return {
        displayTitle: normalizeCourseName(courseName),
        primaryTitle: normalizeCourseName(courseName),
        titleWasNormalized: false
      };
    }

    const stripped = stripLeadingCourseResidue(normalizedTitle, courseName);
    const primaryTitle = stripped.value || normalizedTitle;
    const normalizedCourseName = normalizeCourseName(courseName);
    const displayTitle = root.assignmentDisplay.buildDisplayTitle(primaryTitle, normalizedCourseName);

    return {
      displayTitle,
      primaryTitle,
      titleWasNormalized:
        stripped.wasNormalized || primaryTitle !== normalizedTitle || normalizedTitle !== title
    };
  }

  function getAssignmentKey(item = {}) {
    if (item.customAssignmentId) {
      return `custom:${item.customAssignmentId}`;
    }

    if (item.url) {
      const normalizedUrl = root.assignmentUtils.getUrl(item.url);
      if (normalizedUrl) {
        return normalizedUrl.toString();
      }
    }

    return [item.courseId || root.assignmentUtils.extractCourseId(item.url), item.title, item.dueAt].join("|");
  }

  function indexAssignments(items = []) {
    const indexed = new Map();

    items.forEach((item) => {
      const key = getAssignmentKey(item);
      if (key) {
        indexed.set(key, item);
      }
    });

    return indexed;
  }

  function stabilizeAssignments(items = [], options = {}) {
    const previousItems = indexAssignments(options.previousItems);
    const fallbackItems = indexAssignments(options.fallbackItems);
    const courseNames = options.courseNames || {};

    return (items || []).map((item) => {
      const key = getAssignmentKey(item);
      const previousItem = previousItems.get(key);
      const fallbackItem = fallbackItems.get(key);
      const courseId = String(
        item.courseId ||
          previousItem?.courseId ||
          fallbackItem?.courseId ||
          root.assignmentUtils.extractCourseId(item.url) ||
          ""
      );
      const resolved = resolveCourseName({
        courseId,
        previousCourseName: previousItem && previousItem.courseName,
        courseMapName: courseNames[courseId],
        localCourseName: fallbackItem && fallbackItem.courseName,
        itemCourseName: item.courseName
      });

      return {
        ...item,
        courseId,
        courseName: resolved.courseName,
        courseNameSource: resolved.debugSource,
        isFallbackCourseName: resolved.isFallbackCourseName
      };
    });
  }

  root.assignmentCourseResolver = {
    buildTitleHierarchy,
    getAssignmentKey,
    getFallbackCourseName,
    isFallbackCourseName,
    normalizeCourseName,
    resolveCourseName,
    stabilizeAssignments
  };
})();
