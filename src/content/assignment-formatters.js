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
    const courseName = root.assignmentDisplay.formatCourseName(sourceItem.courseName);

    return {
      ...sourceItem,
      courseNameRaw: sourceItem.courseName,
      courseName,
      displayTitle: root.assignmentDisplay.buildDisplayTitle(sourceItem.title, courseName),
      dueDateText: dueDisplay.dueDateText,
      dueTimeText: dueDisplay.dueTimeText,
      dueSummaryText: dueDisplay.dueSummaryText,
      dueSortValue: dueDisplay.dueSortValue,
      statusTone: root.assignmentDisplay.getStatusTone(sourceItem.dueLabel)
    };
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

    return String(left.displayTitle || left.title || "").localeCompare(
      String(right.displayTitle || right.title || "")
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
    formatCourseName: root.assignmentDisplay.formatCourseName,
    formatDueDisplay: root.assignmentDisplay.formatDueDisplay,
    getStatusTone: root.assignmentDisplay.getStatusTone
  };
})();
