(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});

  const pendingRegionSelectors = [
    "#right-side",
    "#right-side-wrapper",
    "#planner-todosidebar-item-list",
    "[data-testid*='todo']",
    "[data-testid*='planner']",
    ".todo-list",
    ".todo_list",
    ".ToDoSidebarItem"
  ];

  const assignmentContainerSelectors = [
    "#right-side li",
    "#right-side [role='listitem']",
    "#planner-todosidebar-item-list li",
    "[data-testid*='todo'] li",
    "[data-testid*='planner'] li",
    ".todo-list li",
    ".todo_list li",
    ".ToDoSidebarItem",
    ".PlannerItem-styles__root"
  ];

  function isInsidePendingRegion(element) {
    return Boolean(element && element.closest(pendingRegionSelectors.join(", ")));
  }

  function isCompletedAssignmentText(text) {
    return /\bsubmitted\b|\bgraded\b|\bcomplete(?:d)?\b|\bturned in\b|\bclosed\b|\blocked\b/i.test(
      text
    );
  }

  function hasPendingCue(text) {
    return /\bdue\b|\bmissing\b|\blate\b|\boverdue\b|\btoday\b|\btomorrow\b|\bupcoming\b/i.test(
      text
    );
  }

  function findPrimaryAssignmentLink(container) {
    const links = Array.from(container.querySelectorAll("a[href*='/courses/'][href*='/assignments/']"));
    return (
      links.find(
        (link) =>
          root.assignmentUtils.isAssignmentUrl(link.href) &&
          root.assignmentUtils.normalizeText(link.textContent)
      ) ||
      links.find((link) => root.assignmentUtils.isAssignmentUrl(link.href)) ||
      null
    );
  }

  function extractDueInfo(container) {
    const timeElement = container.querySelector("time");
    const dateTime = root.assignmentUtils.normalizeText(
      timeElement && timeElement.getAttribute("datetime")
    );
    const parsedDate = root.assignmentUtils.parseDateValue(dateTime);

    if (timeElement) {
      const timeText = root.assignmentUtils.normalizeText(timeElement.textContent || dateTime);
      if (timeText) {
        return {
          dueLabel: /\b(due|missing|late|overdue)\b/i.test(timeText) ? timeText : `Due ${timeText}`,
          dueAt: parsedDate ? parsedDate.toISOString() : null
        };
      }
    }

    const text = root.assignmentUtils.normalizeText(container.textContent);
    const dueMatch = text.match(
      /\b(due\s+(?:today|tomorrow|[a-z]{3,9}\s+\d{1,2}(?:,\s*\d{4})?(?:\s+at\s+\d{1,2}:\d{2}\s*[ap]m)?))/i
    );

    if (dueMatch) {
      return {
        dueLabel: root.assignmentUtils.cleanLabel(dueMatch[1]),
        dueAt: null
      };
    }

    if (/\bmissing\b/i.test(text)) {
      return {
        dueLabel: "Missing",
        dueAt: null
      };
    }

    if (/\boverdue\b/i.test(text)) {
      return {
        dueLabel: "Overdue",
        dueAt: null
      };
    }

    if (/\blate\b/i.test(text)) {
      return {
        dueLabel: "Late",
        dueAt: null
      };
    }

    return {
      dueLabel: "Pending",
      dueAt: null
    };
  }

  function resolveCourseName(container, assignmentUrl, courseNames, scope = document) {
    const courseId = root.assignmentUtils.extractCourseId(assignmentUrl);
    if (!courseId) {
      return "Canvas course";
    }

    if (courseNames[courseId]) {
      return courseNames[courseId];
    }

    const courseLink = Array.from(container.querySelectorAll("a[href*='/courses/']")).find((anchor) => {
      return (
        !root.assignmentUtils.isAssignmentUrl(anchor.href) &&
        root.assignmentUtils.extractCourseId(anchor.href) === courseId &&
        root.assignmentUtils.normalizeText(anchor.textContent)
      );
    });

    if (courseLink) {
      return root.assignmentUtils.normalizeText(courseLink.textContent);
    }

    const scopedCourseLink = Array.from(scope.querySelectorAll("a[href*='/courses/']")).find((anchor) => {
      return (
        !root.assignmentUtils.isAssignmentUrl(anchor.href) &&
        root.assignmentUtils.extractCourseId(anchor.href) === courseId &&
        root.assignmentUtils.normalizeText(anchor.textContent)
      );
    });

    if (scopedCourseLink) {
      return root.assignmentUtils.normalizeText(scopedCourseLink.textContent);
    }

    return `Course ${courseId}`;
  }

  function buildPendingAssignment(link, courseNames, scope = document) {
    if (!link || !root.assignmentUtils.isAssignmentUrl(link.href)) {
      return null;
    }

    const container =
      link.closest("li, tr, [role='listitem'], article, section, .PlannerItem-styles__root") || link;
    const containerText = root.assignmentUtils.normalizeText(container.textContent);

    if (isCompletedAssignmentText(containerText)) {
      return null;
    }

    if (!isInsidePendingRegion(container) && !hasPendingCue(containerText)) {
      return null;
    }

    const title = root.assignmentUtils.cleanLabel(
      root.assignmentUtils.normalizeText(link.textContent) ||
        root.assignmentUtils.normalizeText(link.getAttribute("title")) ||
        root.assignmentUtils.normalizeText(link.getAttribute("aria-label"))
    );

    if (!title) {
      return null;
    }

    const dueInfo = extractDueInfo(container);

    return {
      title,
      courseName: resolveCourseName(container, link.href, courseNames, scope),
      dueLabel: dueInfo.dueLabel,
      dueAt: dueInfo.dueAt,
      url: root.assignmentUtils.getUrl(link.href).toString()
    };
  }

  function scrapePendingAssignmentsFromDom(scope = document, options = {}) {
    const courseNames = root.assignmentUtils.buildCourseNameMap(scope);
    const seenUrls = new Set();
    const containers = root.utils.safeQueryAll(assignmentContainerSelectors, scope);
    const items = [];

    containers.forEach((container) => {
      const assignment = buildPendingAssignment(findPrimaryAssignmentLink(container), courseNames, scope);
      if (!assignment || seenUrls.has(assignment.url)) {
        return;
      }

      seenUrls.add(assignment.url);
      items.push(assignment);
    });

    if (!items.length) {
      const fallbackLinks = root.utils.safeQueryAll(
        [
          "#application a[href*='/courses/'][href*='/assignments/']",
          "#dashboard a[href*='/courses/'][href*='/assignments/']"
        ],
        scope
      );

      fallbackLinks.forEach((link) => {
        const assignment = buildPendingAssignment(link, courseNames, scope);
        if (!assignment || seenUrls.has(assignment.url)) {
          return;
        }

        seenUrls.add(assignment.url);
        items.push(assignment);
      });
    }

    return root.assignmentFormatting.decoratePendingAssignments(items, options);
  }

  root.assignmentDom = {
    buildPendingAssignment,
    extractDueInfo,
    scrapePendingAssignmentsFromDom
  };
})();
