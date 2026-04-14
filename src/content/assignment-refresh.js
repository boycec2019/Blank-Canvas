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

  function mergePendingAssignments(primaryItems, customItems, options = {}) {
    return root.assignmentFormatting.mergePendingAssignments([...primaryItems, ...customItems], options);
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
    const [apiItems, customItems] = await Promise.all([
      root.assignmentApi.fetchPendingAssignmentsFromApi({
        ...context.options,
        courseNames: context.courseNames
      }),
      listCustomPendingAssignments(context.options)
    ]);

    return {
      apiItems,
      customItems,
      mergedItems: mergePendingAssignments(apiItems, customItems, {
        ...context.options,
        courseNames: context.courseNames
      }),
      mergedFallback: mergePendingAssignments(context.domFallback, customItems, {
        ...context.options,
        courseNames: context.courseNames
      })
    };
  }

  async function fetchFallbackWithCustom(context) {
    const customItems = await listCustomPendingAssignments(context.options);
    return {
      customItems,
      mergedFallback: mergePendingAssignments(context.domFallback, customItems, {
        ...context.options,
        courseNames: context.courseNames
      })
    };
  }

  function buildProvisionalFallback(context, customItems = []) {
    return mergePendingAssignments(context.domFallback, customItems, {
      ...context.options,
      courseNames: context.courseNames
    });
  }

  root.assignmentRefresh = {
    buildCourseNames,
    buildProvisionalFallback,
    createRefreshContext,
    fetchFallbackWithCustom,
    fetchMergedAssignments,
    getDomFallback,
    listCustomPendingAssignments,
    mergePendingAssignments
  };
})();
