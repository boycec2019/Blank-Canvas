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

  function isExtensionContextInvalidated(error) {
    if (root.debug && typeof root.debug.isExtensionContextInvalidatedError === "function") {
      return root.debug.isExtensionContextInvalidatedError(error);
    }

    return /extension context invalidated/i.test(String(error || ""));
  }

  function applyStaleContextFallback(context, error) {
    const completedDomFallback = root.assignmentRefresh.applyCompletedAssignments(
      context.domFallback,
      context.completedStates || []
    );
    root.assignmentStoreState.applyRefreshFailure(state, completedDomFallback, error, {
      ...context.options,
      courseNames: context.courseNames
    });
    emit(completedDomFallback);
    return getSnapshot(completedDomFallback);
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
        if (isExtensionContextInvalidated(error)) {
          return applyStaleContextFallback(context, error);
        }

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
    Promise.all([
      root.assignmentRefresh.listCustomPendingAssignments(options),
      root.ignoredAssignments ? root.ignoredAssignments.listIgnoredAssignmentKeys() : Promise.resolve([]),
      root.completedAssignments ? root.completedAssignments.listCompletedAssignmentStates() : Promise.resolve([])
    ])
      .then(([customItems, ignoredKeys, completedStates]) => {
        context.completedStates = completedStates;
        const provisionalItems = root.assignmentRefresh.buildProvisionalFallback(
          context,
          customItems,
          ignoredKeys,
          completedStates
        );
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
        if (isExtensionContextInvalidated(error)) {
          return;
        }

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
