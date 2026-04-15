(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});
  const FOCUSED_PAGE_TYPES = Object.freeze([
    "course-home",
    "course-assignments",
    "course-assignment-detail",
    "course-modules"
  ]);

  let lastContext = null;

  function isFocusedPageContext(context) {
    return Boolean(context && FOCUSED_PAGE_TYPES.includes(context.pageType));
  }

  function sync(settings, context) {
    lastContext = isFocusedPageContext(context)
      ? {
          pageType: context.pageType,
          pageFamily: context.pageFamily,
          courseId: context.courseId,
          routePattern: context.pageRoutePattern
        }
      : null;

    return getSnapshot();
  }

  function teardown() {
    lastContext = null;
  }

  function getSnapshot() {
    return {
      mounted: Boolean(lastContext),
      pageType: lastContext ? lastContext.pageType : "",
      pageFamily: lastContext ? lastContext.pageFamily : "",
      courseId: lastContext ? lastContext.courseId : "",
      routePattern: lastContext ? lastContext.routePattern : "",
      visualChangesEnabled: false
    };
  }

  root.focusedPages = {
    FOCUSED_PAGE_TYPES,
    getSnapshot,
    isFocusedPageContext,
    sync,
    teardown
  };
})();
