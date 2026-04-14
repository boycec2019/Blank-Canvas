(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});
  const listeners = new Set();
  const state = root.assignmentStoreState.createState();

  function getSnapshot(fallbackItems) {
    const resolvedFallback =
      fallbackItems === undefined
        ? root.assignmentRefresh.getDomFallback(root.assignmentRefresh.buildCourseNames(document))
        : fallbackItems;
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

    const context = root.assignmentRefresh.createRefreshContext(options);
    root.assignmentStoreState.beginRefresh(state);

    const request = root.assignmentRefresh
      .fetchMergedAssignments(context)
      .then(({ mergedItems, mergedFallback }) => {
        root.assignmentStoreState.applyRefreshSuccess(state, mergedItems, mergedFallback, {
          ...context.options,
          courseNames: context.courseNames
        });
        emit(context.domFallback);
        return getSnapshot(mergedFallback);
      })
      .catch((error) => {
        return root.assignmentRefresh.fetchFallbackWithCustom(context).then(({ mergedFallback }) => {
            root.assignmentStoreState.applyRefreshFailure(state, mergedFallback, error, {
              ...context.options,
              courseNames: context.courseNames
            });
            emit(mergedFallback);
            return getSnapshot(mergedFallback);
          });
      })
      .finally(() => {
        state.inFlight = null;
      });

    state.inFlight = request;
    root.assignmentRefresh
      .listCustomPendingAssignments(options)
      .then((customItems) => {
        const provisionalItems = root.assignmentRefresh.buildProvisionalFallback(context, customItems);
        root.assignmentStoreState.applyProvisionalFallback(state, provisionalItems, {
          ...context.options,
          courseNames: context.courseNames
        });
        emit(provisionalItems);
      })
      .catch(() => {
        root.assignmentStoreState.applyProvisionalFallback(state, context.domFallback, {
          ...context.options,
          courseNames: context.courseNames
        });
        emit(context.domFallback);
      });

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
