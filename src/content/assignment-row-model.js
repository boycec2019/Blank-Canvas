(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});

  function buildStatusLabel(item) {
    const dueLabel = root.assignmentUtils.cleanLabel(item && item.dueLabel);
    const statusTone = item && item.statusTone;

    if (statusTone === "missing") {
      return "Missing";
    }

    if (statusTone === "overdue") {
      return "Overdue";
    }

    if (statusTone === "late") {
      return "Late";
    }

    if (!dueLabel || /^(due|pending)$/i.test(dueLabel)) {
      return "";
    }

    return dueLabel;
  }

  function buildAssignmentRow(item, options = {}) {
    const sourceItem = item || {};
    const courseId = String(
      sourceItem.courseId || root.assignmentUtils.extractCourseId(sourceItem.url) || ""
    );
    const courseNames = options.courseNames || {};
    const resolvedCourse = root.assignmentCourseResolver.resolveCourseName({
      courseId,
      previousCourseName: options.previousCourseName,
      courseMapName: courseNames[courseId],
      itemCourseName: sourceItem.courseName,
      itemCourseNameSource: sourceItem.courseNameSource
    });
    const titleHierarchy = root.assignmentCourseResolver.buildTitleHierarchy(
      sourceItem.title,
      resolvedCourse.courseName
    );
    const statusTone = sourceItem.statusTone || root.assignmentDisplay.getStatusTone(sourceItem.dueLabel);
    const statusLabel = buildStatusLabel({
      ...sourceItem,
      statusTone
    });

    const rowModel = {
      primaryTitle: titleHierarchy.primaryTitle,
      secondaryCourseName: resolvedCourse.courseName,
      statusLabel,
      statusTone,
      dueSummaryText: sourceItem.dueSummaryText || sourceItem.dueDateText || "Due date not listed",
      isFallbackCourseName: resolvedCourse.isFallbackCourseName,
      debugSource: resolvedCourse.debugSource,
      titleWasNormalized: titleHierarchy.titleWasNormalized
    };

    return {
      ...sourceItem,
      courseId,
      courseName: resolvedCourse.courseName,
      courseNameSource: resolvedCourse.debugSource,
      displayTitle: titleHierarchy.displayTitle,
      primaryTitle: rowModel.primaryTitle,
      secondaryCourseName: rowModel.secondaryCourseName,
      statusLabel: rowModel.statusLabel,
      statusTone: rowModel.statusTone,
      dueSummaryText: rowModel.dueSummaryText,
      isFallbackCourseName: rowModel.isFallbackCourseName,
      debugSource: rowModel.debugSource,
      titleWasNormalized: rowModel.titleWasNormalized,
      rowModel
    };
  }

  function buildAssignmentRows(items, options = {}) {
    return (items || []).map((item) => buildAssignmentRow(item, options));
  }

  root.assignmentRowModel = {
    buildAssignmentRow,
    buildAssignmentRows
  };
})();
