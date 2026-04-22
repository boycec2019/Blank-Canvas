(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});

  const ROUTE_KEYS = Object.freeze(["dashboard", "courses", "calendar", "inbox"]);
  const NAV_LINK_ID_BY_KEY = Object.freeze({
    dashboard: "global_nav_dashboard_link",
    courses: "global_nav_courses_link",
    calendar: "global_nav_calendar_link",
    inbox: "global_nav_conversations_link"
  });

  function normalizePath(pathname = window.location.pathname) {
    return String(pathname || "").replace(/\/+$/, "") || "/";
  }

  function getGlobalNavKeyFromPath(pathname = window.location.pathname) {
    const normalizedPath = normalizePath(pathname);

    if (normalizedPath === "/" || normalizedPath === "/dashboard") {
      return "dashboard";
    }

    if (normalizedPath.startsWith("/courses")) {
      return "courses";
    }

    if (normalizedPath.startsWith("/calendar")) {
      return "calendar";
    }

    if (normalizedPath.startsWith("/conversations")) {
      return "inbox";
    }

    return "";
  }

  function getRouteClassName(routeKey) {
    return routeKey ? `blank-canvas--nav-${routeKey}` : "";
  }

  function getGlobalNavLinkId(routeKey) {
    return NAV_LINK_ID_BY_KEY[routeKey] || "";
  }

  function getGlobalNavLinkSelector(routeKey) {
    const linkId = getGlobalNavLinkId(routeKey);
    return linkId ? `#${linkId}` : "";
  }

  function getRouteSelectedListItemSelector(routeKey) {
    const linkSelector = getGlobalNavLinkSelector(routeKey);
    return linkSelector ? `#menu li:has(> ${linkSelector})` : "";
  }

  function getRouteSelectedSurfaceSelectors(routeKey) {
    const listItemSelector = getRouteSelectedListItemSelector(routeKey);
    const linkSelector = getGlobalNavLinkSelector(routeKey);
    if (!listItemSelector || !linkSelector) {
      return [];
    }

    return [
      `${listItemSelector} > ${linkSelector}:is(button)`,
      `${listItemSelector} > ${linkSelector} > .menu-item-icon-container`
    ];
  }

  root.globalNav = {
    ROUTE_KEYS,
    NAV_LINK_ID_BY_KEY,
    normalizePath,
    getGlobalNavKeyFromPath,
    getRouteClassName,
    getGlobalNavLinkId,
    getGlobalNavLinkSelector,
    getRouteSelectedListItemSelector,
    getRouteSelectedSurfaceSelectors
  };
})();
