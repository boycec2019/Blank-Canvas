(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});
  const listeners = new Set();
  const state = root.assignmentStoreState.createState();

  function getDomFallback() {
    return root.assignmentDom.scrapePendingAssignmentsFromDom();
  }

  function getSnapshot(fallbackItems) {
    const resolvedFallback = fallbackItems === undefined ? getDomFallback() : fallbackItems;
    return root.assignmentStoreState.createSnapshot(state, resolvedFallback);
  }

  function emit(fallbackItems) {
    const snapshot = getSnapshot(fallbackItems);
    listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (error) {
        if (root.debug) {
          root.debug.warn("assignments", "Assignment subscriber failed.", String(error));
        }
      }
    });
  }

  function shouldRefresh(options = {}) {
    return root.assignmentStoreState.shouldRefresh(state, options);
  }

  async function refreshPendingAssignments(options = {}) {
    if (state.inFlight && !options.force) {
      return state.inFlight;
    }

    if (!shouldRefresh(options)) {
      return getSnapshot();
    }

    const domFallback = getDomFallback();
    root.assignmentStoreState.beginRefresh(state);

    const request = root.assignmentApi
      .fetchPendingAssignmentsFromApi(options)
      .then((items) => {
        root.assignmentStoreState.applyRefreshSuccess(state, items, domFallback);
        emit(domFallback);
        return getSnapshot(domFallback);
      })
      .catch((error) => {
        root.assignmentStoreState.applyRefreshFailure(state, domFallback, error);
        emit(domFallback);
        return getSnapshot(domFallback);
      })
      .finally(() => {
        state.inFlight = null;
      });

    state.inFlight = request;
    root.assignmentStoreState.applyProvisionalFallback(state, domFallback);
    emit(domFallback);

    return request;
  }

  function ensurePendingAssignments(options = {}) {
    if (shouldRefresh(options)) {
      refreshPendingAssignments(options).catch((error) => {
        if (root.debug) {
          root.debug.warn("assignments", "Pending assignment refresh failed.", String(error));
        }
      });
    }

    return getSnapshot();
  }

  function invalidate() {
    root.assignmentStoreState.resetState(state);
    emit();
  }

  function subscribe(listener) {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }

  root.assignments = {
    ensurePendingAssignments,
    getSnapshot,
    invalidate,
    refreshPendingAssignments,
    subscribe
  };
})();
