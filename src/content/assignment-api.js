(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});
  const DEFAULT_PAST_DAYS = 45;
  const DEFAULT_FUTURE_DAYS = 120;
  const DEFAULT_PAGE_SIZE = 100;
  const MAX_PAGES = 3;

  function toIsoDate(rawDate) {
    return rawDate.toISOString().slice(0, 10);
  }

  function offsetDate(rawDate, days) {
    return new Date(rawDate.getTime() + days * 24 * 60 * 60 * 1000);
  }

  function buildPlannerItemsUrl(options = {}) {
    const now = options.now || new Date();
    const startDate = offsetDate(now, -(options.pastDays || DEFAULT_PAST_DAYS));
    const endDate = offsetDate(now, options.futureDays || DEFAULT_FUTURE_DAYS);
    const url = new URL("/api/v1/planner/items", window.location.origin);

    url.searchParams.set("filter", "incomplete_items");
    url.searchParams.set("start_date", toIsoDate(startDate));
    url.searchParams.set("end_date", toIsoDate(endDate));
    url.searchParams.set("per_page", String(options.perPage || DEFAULT_PAGE_SIZE));

    return url.toString();
  }

  function readNextLink(linkHeader) {
    if (!linkHeader) {
      return null;
    }

    const links = String(linkHeader).split(",");
    const nextEntry = links.find((entry) => /rel="?next"?/i.test(entry));
    if (!nextEntry) {
      return null;
    }

    const match = nextEntry.match(/<([^>]+)>/);
    return match ? match[1] : null;
  }

  function isIncompleteSubmission(submissions) {
    if (!submissions || typeof submissions !== "object") {
      return true;
    }

    if (submissions.excused || submissions.graded) {
      return false;
    }

    if ("submitted" in submissions) {
      return !submissions.submitted;
    }

    return true;
  }

  function getDueLabel(item) {
    const submissions = item && item.submissions;

    if (submissions && typeof submissions === "object") {
      if (submissions.missing) {
        return "Missing";
      }

      if (submissions.late) {
        return "Late";
      }
    }

    return "Due";
  }

  function mapPlannerItemToPendingAssignment(item, options = {}) {
    const isCourseContext =
      String(item && item.context_type).toLowerCase() === "course" || Boolean(item && item.course_id);
    if (!item || !isCourseContext) {
      return null;
    }

    if (String(item.plannable_type).toLowerCase() !== "assignment") {
      return null;
    }

    if (item.planner_override && item.planner_override.marked_complete) {
      return null;
    }

    if (!isIncompleteSubmission(item.submissions)) {
      return null;
    }

    const url =
      item.html_url ||
      item.linked_object_html_url ||
      (item.plannable && (item.plannable.html_url || item.plannable.url));
    if (!root.assignmentUtils.isAssignmentUrl(url)) {
      return null;
    }

    const title = root.assignmentUtils.cleanLabel(
      (item.plannable && (item.plannable.title || item.plannable.name)) || ""
    );
    if (!title) {
      return null;
    }

    const courseNames = options.courseNames || {};
    const courseId = String(item.course_id || root.assignmentUtils.extractCourseId(url) || "");
    const courseName = courseNames[courseId] || (courseId ? `Course ${courseId}` : "Canvas course");

    return {
      title,
      courseName,
      dueLabel: getDueLabel(item),
      dueAt:
        item.plannable_date ||
        item.todo_date ||
        (item.plannable && (item.plannable.due_at || item.plannable.todo_date)) ||
        null,
      url: root.assignmentUtils.getUrl(url).toString()
    };
  }

  async function fetchPendingAssignmentsFromApi(options = {}) {
    const fetchImpl = options.fetchImpl || window.fetch.bind(window);
    const courseNames = options.courseNames || root.assignmentUtils.buildCourseNameMap(document);
    const collectedItems = [];
    const seenUrls = new Set();
    let nextUrl = buildPlannerItemsUrl(options);

    for (let pageIndex = 0; pageIndex < MAX_PAGES && nextUrl; pageIndex += 1) {
      const response = await fetchImpl(nextUrl, {
        credentials: "include",
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Canvas planner request failed with ${response.status}.`);
      }

      const payload = await response.json();
      payload.forEach((item) => {
        const assignment = mapPlannerItemToPendingAssignment(item, {
          courseNames
        });

        if (!assignment || seenUrls.has(assignment.url)) {
          return;
        }

        seenUrls.add(assignment.url);
        collectedItems.push(assignment);
      });

      nextUrl = readNextLink(response.headers.get("Link"));
    }

    return root.assignmentFormatting.decoratePendingAssignments(collectedItems, options);
  }

  root.assignmentApi = {
    buildPlannerItemsUrl,
    fetchPendingAssignmentsFromApi,
    mapPlannerItemToPendingAssignment,
    readNextLink
  };
})();
