(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});
  const REFRESH_WINDOW_MS = 5 * 60 * 1000;

  function cloneItems(items) {
    return (items || []).map((item) => ({ ...item }));
  }

  function createState() {
    return {
      error: null,
      inFlight: null,
      items: [],
      lastLoadedAt: 0,
      source: "dom",
      status: "idle"
    };
  }

  function hasStoredItems(state) {
    return Boolean(state && Array.isArray(state.items) && state.items.length);
  }

  function createSnapshot(state, fallbackItems = []) {
    const visibleItems = hasStoredItems(state) ? state.items : fallbackItems;
    const sourceCounts = visibleItems.reduce((result, item) => {
      const source = item && item.source ? item.source : "unknown";
      result[source] = (result[source] || 0) + 1;
      return result;
    }, {});

    return {
      error: state.error,
      items: cloneItems(visibleItems),
      lastLoadedAt: state.lastLoadedAt,
      source: hasStoredItems(state) ? state.source : "dom",
      sourceCounts,
      status: state.status
    };
  }

  function shouldRefresh(state, options = {}) {
    if (options.force) {
      return true;
    }

    if (state.inFlight) {
      return false;
    }

    if (!state.lastLoadedAt) {
      return true;
    }

    const now = typeof options.now === "number" ? options.now : Date.now();
    return now - state.lastLoadedAt > REFRESH_WINDOW_MS;
  }

  function beginRefresh(state) {
    state.status = "loading";
    state.error = null;
  }

  function stabilizeVisibleItems(state, items = [], fallbackItems = [], options = {}) {
    return root.assignmentCourseResolver.stabilizeAssignments(items, {
      previousItems: state.items,
      fallbackItems,
      courseNames: options.courseNames
    });
  }

  function applyProvisionalFallback(state, fallbackItems = [], options = {}) {
    if (hasStoredItems(state) || !fallbackItems.length) {
      return;
    }

    state.items = stabilizeVisibleItems(state, fallbackItems, fallbackItems, options);
    state.source = "dom";
  }

  function applyRefreshSuccess(state, apiItems = [], fallbackItems = [], options = {}) {
    const hasApiItems = Boolean(apiItems.length);
    const resolvedItems = hasApiItems ? apiItems : fallbackItems;

    state.items = stabilizeVisibleItems(state, resolvedItems, fallbackItems, options);
    state.source = hasApiItems ? "api" : "dom";
    state.status = "ready";
    state.error = null;
    state.lastLoadedAt = typeof options.now === "number" ? options.now : Date.now();
  }

  function applyRefreshFailure(state, fallbackItems = [], error, options = {}) {
    state.items = stabilizeVisibleItems(state, fallbackItems, fallbackItems, options);
    state.source = "dom";
    state.status = fallbackItems.length ? "ready" : "error";
    state.error = String(error);
    state.lastLoadedAt = typeof options.now === "number" ? options.now : Date.now();
  }

  function resetState(state) {
    Object.assign(state, createState());
  }

  root.assignmentStoreState = {
    REFRESH_WINDOW_MS,
    applyProvisionalFallback,
    applyRefreshFailure,
    applyRefreshSuccess,
    beginRefresh,
    cloneItems,
    createSnapshot,
    createState,
    resetState,
    shouldRefresh
  };
})();
