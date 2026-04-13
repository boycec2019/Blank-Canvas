const ROUTE_SELECTOR_BY_KEY = Object.freeze({
  dashboard: "#global_nav_dashboard_link",
  courses: "#global_nav_courses_link",
  calendar: "#global_nav_calendar_link",
  inbox: "#global_nav_conversations_link"
});

export async function collectRailSnapshot(page) {
  return page.evaluate(({ routeSelectorByKey }) => {
    const root = document.documentElement;
    const rail = document.querySelector("#menu, .ic-app-header");
    const managedStyle = document.getElementById("blank-canvas-managed-style");
    const activeLink = document.querySelector(
      "#menu a[id^='global_nav_'].active, #menu a[id^='global_nav_'][aria-current='page']"
    );
    const activeListItem =
      activeLink?.closest("li") ||
      document.querySelector(
        "#menu li.ic-app-header__menu-list-item--active, #menu li[class*='active']"
      );
    const activeContainer = activeLink?.querySelector(".menu-item-icon-container") ||
      activeListItem?.querySelector(".menu-item-icon-container");
    const path = window.location.pathname;
    const activeNavKey =
      path === "/" ? "dashboard" :
      path.startsWith("/courses") ? "courses" :
      path.startsWith("/calendar") ? "calendar" :
      path.startsWith("/conversations") ? "inbox" :
      "";
    const routeSelectedNode = activeNavKey ? document.querySelector(routeSelectorByKey[activeNavKey]) : null;
    const routeSelectedListItem = routeSelectedNode?.closest("li");
    const borderNode = routeSelectedListItem || activeListItem || routeSelectedNode || activeContainer || activeLink;
    const surfaceNode =
      routeSelectedNode?.querySelector(".menu-item-icon-container") ||
      routeSelectedNode ||
      activeContainer ||
      routeSelectedListItem ||
      activeListItem ||
      activeLink;

    const railStyle = rail ? window.getComputedStyle(rail) : null;
    const borderStyle = borderNode ? window.getComputedStyle(borderNode) : null;
    const surfaceStyle = surfaceNode ? window.getComputedStyle(surfaceNode) : null;

    return {
      extensionMounted:
        Boolean(managedStyle) &&
        root.dataset.blankCanvasLayoutMode === "editorial" &&
        root.classList.contains("blank-canvas--layout-editorial") &&
        root.classList.contains("blank-canvas--phase-left-rail-simplification"),
      activeNavKey,
      routeSelectedId: routeSelectedNode ? routeSelectedNode.id : "",
      activeLinkId: activeLink ? activeLink.id : "",
      railBackground: railStyle ? railStyle.backgroundColor : "",
      activeBackground: surfaceStyle ? surfaceStyle.backgroundColor : "",
      activeBackgroundImage: surfaceStyle ? surfaceStyle.backgroundImage : "",
      activeBorderLeftWidth: borderStyle ? borderStyle.borderLeftWidth : "",
      activeBorderLeftColor: borderStyle ? borderStyle.borderLeftColor : "",
      activeOverlayAfter: surfaceNode ? window.getComputedStyle(surfaceNode, "::after").backgroundColor : "",
      hiddenLabelCount: document.querySelectorAll("#menu .menu-item__text").length,
      visibleLabelCount: Array.from(document.querySelectorAll("#menu .menu-item__text")).filter((element) => {
        const style = window.getComputedStyle(element);
        return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
      }).length
    };
  }, {
    routeSelectorByKey: ROUTE_SELECTOR_BY_KEY
  });
}

export async function collectHeaderSnapshot(page) {
  return page.evaluate(() => {
    const title = document.querySelector("#dashboard h1, .ic-Dashboard-header h1, .ic-Dashboard-header__layout h1");
    const search = document.querySelector("atomic-search-desktop-widget, .ajax-search-widget.ajax-search-widget-dashboard, #ajax-search-form");
    const options = document.querySelector("button[data-testid='dashboard-options-button']");

    function statusFor(element) {
      if (!element) {
        return "missing";
      }

      const style = window.getComputedStyle(element);
      if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
        return "hidden";
      }

      return "visible";
    }

    return {
      titleText: title ? title.textContent.trim() : "",
      titleStatus: statusFor(title),
      searchStatus: statusFor(search),
      optionsStatus: statusFor(options)
    };
  });
}
