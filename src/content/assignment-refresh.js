(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});

  function listCustomPendingAssignments(options = {}) {
    if (!root.customAssignments) {
      return Promise.resolve([]);
    }

    return root.customAssignments.listPendingAssignments({
      ...options,
      decorate: false
    });
  }

  function buildCourseNames(scope = document) {
    return root.assignmentUtils.buildCourseNameMap(scope);
  }

  function getDomFallback(courseNames, scope = document) {
    return root.assignmentDom.scrapePendingAssignmentsFromDom(scope, {
      courseNames
    });
  }

  function getAssignmentKey(item) {
    if (!root.assignmentCourseResolver) {
      return "";
    }

    return root.assignmentCourseResolver.getAssignmentKey(item);
  }

  function filterIgnoredAssignments(items = [], ignoredKeys = []) {
    if (!ignoredKeys.length) {
      return items;
    }

    const ignored = new Set(ignoredKeys);
    return (items || []).filter((item) => {
      if (!item || item.source === "custom" || item.customAssignmentId) {
        return true;
      }

      const assignmentKey = getAssignmentKey(item);
      return !assignmentKey || !ignored.has(assignmentKey);
    });
  }

  function mergePendingAssignments(primaryItems, customItems, options = {}) {
    return root.assignmentFormatting.mergePendingAssignments([...primaryItems, ...customItems], options);
  }

  function applyCompletedAssignments(items = [], completedStates = []) {
    if (!root.completedAssignments) {
      return items;
    }

    return root.completedAssignments.applyCompletionState(items, completedStates);
  }

  function createRefreshContext(options = {}, scope = document) {
    const courseNames = buildCourseNames(scope);
    return {
      options,
      courseNames,
      domFallback: getDomFallback(courseNames, scope)
    };
  }

  async function fetchMergedAssignments(context) {
    const [apiItems, customItems, ignoredKeys, completedStates] = await Promise.all([
      root.assignmentApi.fetchPendingAssignmentsFromApi({
        ...context.options,
        courseNames: context.courseNames
      }),
      listCustomPendingAssignments(context.options),
      root.ignoredAssignments ? root.ignoredAssignments.listIgnoredAssignmentKeys() : Promise.resolve([]),
      root.completedAssignments ? root.completedAssignments.listCompletedAssignmentStates() : Promise.resolve([])
    ]);
    const visibleApiItems = applyCompletedAssignments(filterIgnoredAssignments(apiItems, ignoredKeys), completedStates);
    const visibleDomFallback = applyCompletedAssignments(
      filterIgnoredAssignments(context.domFallback, ignoredKeys),
      completedStates
    );

    return {
      apiItems: visibleApiItems,
      customItems,
      mergedItems: mergePendingAssignments(visibleApiItems, customItems, {
        ...context.options,
        courseNames: context.courseNames
      }),
      mergedFallback: mergePendingAssignments(visibleDomFallback, customItems, {
        ...context.options,
        courseNames: context.courseNames
      })
    };
  }

  async function fetchFallbackWithCustom(context) {
    const [customItems, ignoredKeys, completedStates] = await Promise.all([
      listCustomPendingAssignments(context.options),
      root.ignoredAssignments ? root.ignoredAssignments.listIgnoredAssignmentKeys() : Promise.resolve([]),
      root.completedAssignments ? root.completedAssignments.listCompletedAssignmentStates() : Promise.resolve([])
    ]);
    const visibleDomFallback = applyCompletedAssignments(
      filterIgnoredAssignments(context.domFallback, ignoredKeys),
      completedStates
    );
    return {
      customItems,
      mergedFallback: mergePendingAssignments(visibleDomFallback, customItems, {
        ...context.options,
        courseNames: context.courseNames
      })
    };
  }

  function buildProvisionalFallback(context, customItems = [], ignoredKeys = [], completedStates = []) {
    return mergePendingAssignments(
      applyCompletedAssignments(filterIgnoredAssignments(context.domFallback, ignoredKeys), completedStates),
      customItems,
      {
      ...context.options,
      courseNames: context.courseNames
      }
    );
  }

  root.assignmentRefresh = {
    buildCourseNames,
    buildProvisionalFallback,
    createRefreshContext,
    fetchFallbackWithCustom,
    fetchMergedAssignments,
    filterIgnoredAssignments,
    getDomFallback,
    listCustomPendingAssignments,
    mergePendingAssignments,
    applyCompletedAssignments
  };
})();
