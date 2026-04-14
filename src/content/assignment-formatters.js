(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});
  const STATUS_SEVERITY = Object.freeze({
    missing: 0,
    overdue: 1,
    late: 2,
    pending: 3
  });

  function getStatusSeverity(statusTone) {
    return STATUS_SEVERITY[statusTone] ?? STATUS_SEVERITY.pending;
  }

  function decoratePendingAssignment(item, options = {}) {
    const sourceItem = item || {};
    const dueDisplay = root.assignmentDisplay.formatDueDisplay(
      sourceItem.dueAt,
      sourceItem.dueLabel,
      options
    );
    const statusTone = root.assignmentDisplay.getStatusTone(sourceItem.dueLabel);
    const normalizedItem = root.assignmentCourseResolver.stabilizeAssignments(
      [
        {
          ...sourceItem,
          courseId:
            sourceItem.courseId || root.assignmentUtils.extractCourseId(sourceItem.url) || "",
          dueDateText: dueDisplay.dueDateText,
          dueTimeText: dueDisplay.dueTimeText,
          dueSummaryText: dueDisplay.dueSummaryText,
          dueSortValue: dueDisplay.dueSortValue,
          statusTone
        }
      ],
      {
        courseNames: options.courseNames
      }
    )[0];

    return root.assignmentRowModel.buildAssignmentRow(
      {
        ...normalizedItem,
        courseNameRaw: sourceItem.courseName
      },
      options
    );
  }

  function comparePendingAssignments(left, right) {
    const leftSeverity = getStatusSeverity(left.statusTone);
    const rightSeverity = getStatusSeverity(right.statusTone);

    if (leftSeverity !== rightSeverity) {
      return leftSeverity - rightSeverity;
    }

    if (left.dueSortValue !== right.dueSortValue) {
      return left.dueSortValue - right.dueSortValue;
    }

    return String(left.primaryTitle || left.title || "").localeCompare(
      String(right.primaryTitle || right.title || "")
    );
  }

  function decoratePendingAssignments(items, options = {}) {
    return (items || [])
      .filter(Boolean)
      .map((item) => decoratePendingAssignment(item, options))
      .sort(comparePendingAssignments);
  }

  root.assignmentFormatting = {
    buildDisplayTitle: root.assignmentDisplay.buildDisplayTitle,
    comparePendingAssignments,
    decoratePendingAssignment,
    decoratePendingAssignments,
    formatCourseName: root.assignmentCourseResolver.normalizeCourseName,
    formatDueDisplay: root.assignmentDisplay.formatDueDisplay,
    getStatusTone: root.assignmentDisplay.getStatusTone,
    mergePendingAssignments(items, options = {}) {
      return decoratePendingAssignments(items, options);
    }
  };
})();
