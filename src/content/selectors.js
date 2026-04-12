(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});

  function isCanvasLikePage() {
    const hostname = window.location.hostname.toLowerCase();
    const hasCanvasHostname = hostname.includes("instructure") || hostname.includes("canvas");
    const hasCanvasChrome = Boolean(
      document.querySelector("#menu") &&
      document.querySelector("#application, #dashboard, .ic-app")
    );

    return hasCanvasHostname || hasCanvasChrome;
  }

  function getPageContext() {
    const normalizedPath = window.location.pathname.replace(/\/+$/, "") || "/";
    const courseId = root.courseNavUtils.getCourseIdFromPath(normalizedPath);

    return {
      path: normalizedPath,
      isDashboard: normalizedPath === "/" || normalizedPath === "/dashboard",
      isCourse: Boolean(courseId),
      courseId
    };
  }

  function findDashboardSearchTargets() {
    const context = getPageContext();
    if (!context.isDashboard) {
      return [];
    }

    const inputs = Array.from(document.querySelectorAll("input")).filter((input) => {
      const label = `${input.placeholder || ""} ${input.getAttribute("aria-label") || ""}`;
      return /search my courses/i.test(label);
    });

    const targets = inputs.flatMap((input) => {
      const form = input.closest("form");
      const wrapper = form ? form.parentElement || form : input.parentElement || input;
      const maybeMenu = wrapper && wrapper.nextElementSibling ? [wrapper.nextElementSibling] : [];
      return [wrapper, ...maybeMenu].filter(Boolean);
    });

    return root.utils.uniqueElements(targets);
  }

  function findSecondaryNavItems() {
    const navAnchors = Array.from(
      document.querySelectorAll("#menu a, .ic-app-header a, nav[aria-label] a")
    );

    return navAnchors.filter((anchor) => {
      const href = (anchor.getAttribute("href") || "").toLowerCase();
      const text = (anchor.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();

      if (href.includes("/groups") || text === "groups") {
        return true;
      }

      if (href.includes("/history") || text === "history") {
        return true;
      }

      if (href.includes("/search") || text === "search") {
        return true;
      }

      if (text.includes("spark")) {
        return true;
      }

      if (text === "help") {
        return true;
      }

      return false;
    });
  }

  function getCourseNavLinkSelector() {
    return "#section-tabs a, .ic-app-course-menu a, nav[aria-label='Course Navigation'] a";
  }

  function findCourseNavLinks(scope = document) {
    return Array.from(scope.querySelectorAll(getCourseNavLinkSelector())).filter((anchor) => {
      const text = (anchor.textContent || "").replace(/\s+/g, " ").trim();
      return Boolean(text);
    });
  }

  function slugifyCourseNavText(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function resolveCourseNavItemKey(anchor, courseId = getPageContext().courseId) {
    if (!anchor || !courseId) {
      return "";
    }

    const rawHref = anchor.getAttribute("href") || anchor.href || "";
    const rawText = (anchor.textContent || "").replace(/\s+/g, " ").trim();

    try {
      const url = new URL(rawHref, window.location.origin);
      const normalizedPath = url.pathname.replace(/\/+$/, "");
      const coursePrefix = `/courses/${courseId}`;

      if (normalizedPath === coursePrefix) {
        return "home";
      }

      if (normalizedPath.startsWith(`${coursePrefix}/`)) {
        return normalizedPath.slice(coursePrefix.length + 1).toLowerCase();
      }
    } catch (error) {
      // Fall back to a text-based key if the href is missing or malformed.
    }

    return slugifyCourseNavText(rawText);
  }

  function findCourseNavLinkTarget(target, scope = document) {
    if (!(target instanceof Element)) {
      return null;
    }

    const anchor = target.closest(getCourseNavLinkSelector());
    if (!anchor) {
      return null;
    }

    return scope.contains(anchor) ? anchor : null;
  }

  function findHiddenCourseNavTargets(settings, context = getPageContext(), scope = document) {
    if (!context.isCourse || !context.courseId) {
      return [];
    }

    const hiddenKeys = new Set(root.courseNavUtils.getHiddenCourseNavKeys(settings.hiddenCourseNavItems, context.courseId));

    if (!hiddenKeys.size) {
      return [];
    }

    return findCourseNavLinks(scope)
      .filter((anchor) => hiddenKeys.has(resolveCourseNavItemKey(anchor, context.courseId)))
      .map((anchor) => anchor.closest("li") || anchor);
  }

  function findDashboardTodoMount() {
    const context = getPageContext();
    if (!context.isDashboard) {
      return null;
    }

    const cardContainer = document.querySelector("#DashboardCard_Container");
    if (cardContainer && cardContainer.parentElement) {
      return {
        container: cardContainer.parentElement,
        anchor: cardContainer
      };
    }

    const mainContent = document.querySelector(".ic-DashboardLayout__Main") || document.querySelector("#dashboard");
    if (!mainContent) {
      return null;
    }

    return {
      container: mainContent,
      anchor: null
    };
  }

  root.canvas = {
    isCanvasLikePage,
    getPageContext,
    findDashboardSearchTargets,
    findCourseNavLinkTarget,
    findCourseNavLinks,
    findHiddenCourseNavTargets,
    findSecondaryNavItems,
    findDashboardTodoMount,
    getCourseNavLinkSelector,
    resolveCourseNavItemKey
  };
})();
