(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});
  const summary = document.getElementById("summary");
  const resultsList = document.getElementById("results");
  const testHelpers = root.browserTestHelpers;
  const {
    assert,
    createFixture,
    equal,
    hasOverlayBackground,
    isTransparentColor,
    mountStyledFixture,
    normalizeColor,
    resetCompletedAssignments,
    resetCustomAssignments,
    resetIgnoredAssignments
  } = testHelpers;
  const harness = testHelpers.createHarness(summary, resultsList);
  const { addTest, tests } = harness;

  addTest("Shared DOM helper creates elements consistently across extension surfaces", () => {
    const element = root.dom.createElement("span", "sample-class", "Hello");

    equal(element.tagName, "SPAN", "The DOM helper should create the requested tag.");
    equal(element.className, "sample-class", "The DOM helper should assign the class name.");
    equal(element.textContent, "Hello", "The DOM helper should assign text content when provided.");
  });

  addTest("Dashboard refresh helper force-refreshes assignments and rerenders with current settings", async () => {
    const calls = [];
    const originalAssignments = root.assignments;
    const originalRenderer = root.renderer;
    const originalStorage = root.storage;

    root.assignments = {
      refreshPendingAssignments(options) {
        calls.push(["assignments", options.force]);
        return Promise.resolve();
      }
    };
    root.renderer = {
      render(settings) {
        calls.push(["renderer", settings.enabled, settings.showDashboardTodoList]);
      }
    };
    root.storage = {
      getSettings() {
        return Promise.resolve({
          ...root.defaults,
          enabled: true,
          showDashboardTodoList: true
        });
      }
    };

    try {
      const settings = await root.dashboardRefresh.refresh();

      equal(settings.enabled, true, "Dashboard refresh should resolve the current settings.");
      equal(calls.length, 2, "Dashboard refresh should refresh assignments and rerender once.");
      equal(calls[0][0], "assignments", "Dashboard refresh should refresh assignments first.");
      equal(calls[1][0], "renderer", "Dashboard refresh should rerender after refreshing assignments.");
    } finally {
      root.assignments = originalAssignments;
      root.renderer = originalRenderer;
      root.storage = originalStorage;
    }
  });

  addTest("Canvas page context resolves stable page types", () => {
    const cases = [
      ["/", "dashboard", "dashboard", "/dashboard"],
      ["/dashboard", "dashboard", "dashboard", "/dashboard"],
      ["/courses/101", "course-home", "course", "/courses/:courseId"],
      ["/courses/101/assignments", "course-assignments", "course", "/courses/:courseId/assignments"],
      ["/courses/101/assignments/7", "course-assignment-detail", "course", "/courses/:courseId/assignments/:assignmentId"],
      ["/courses/101/assignments/7/submissions", "course-assignment-detail", "course", "/courses/:courseId/assignments/:assignmentId"],
      ["/courses/101/modules", "course-modules", "course", "/courses/:courseId/modules"],
      ["/courses/101/modules/items/9", "course-modules", "course", "/courses/:courseId/modules"],
      ["/calendar", "calendar", "calendar", "/calendar"],
      ["/conversations", "inbox", "communication", "/conversations"],
      ["/accounts", "unknown-canvas", "unknown", ""]
    ];

    cases.forEach(([path, pageType, pageFamily, routePattern]) => {
      const courseId = root.courseNavUtils.getCourseIdFromPath(path);
      const match = root.canvas.getPageMatch(path, courseId);
      equal(match.pageType, pageType, `${path} should map to the expected page type.`);
      equal(match.pageFamily, pageFamily, `${path} should map to the expected page family.`);
      equal(match.routePattern, routePattern, `${path} should expose the expected route pattern.`);
    });
  });

  addTest("Phase 6.5 is registered as a disabled roadmap phase flag", () => {
    const phase = root.ui.getPhaseDefinitions().find((item) => item.id === "uiPhaseDashboardUiOverhaul");

    assert(phase, "The dashboard UI overhaul phase should be registered.");
    equal(phase.label, "Phase 6.5: Dashboard UI overhaul", "Phase 6.5 should have the expected label.");
    equal(root.defaults.uiPhaseDashboardUiOverhaul, false, "Phase 6.5 should default to disabled.");
    equal(
      root.ui.normalizePhaseFlags({}).uiPhaseDashboardUiOverhaul,
      false,
      "Phase normalization should preserve the disabled Phase 6.5 default."
    );
  });

  addTest("Phase 6.5 design token roles are available without enabling the phase", () => {
    const tokens = root.ui.buildTokenMap({
      ...root.defaults,
      enabled: true,
      uiLayoutMode: "editorial",
      uiPhaseTypographyReset: true,
      uiPhaseDashboardUiOverhaul: false
    });
    const snapshot = root.ui.getDesignTokenSnapshot({
      ...root.defaults,
      uiLayoutMode: "editorial",
      uiPhaseTypographyReset: true
    });

    equal(tokens["--blank-canvas-control-height"], "54px", "Shared controls should expose a stable height token.");
    equal(tokens["--blank-canvas-control-radius"], "18px", "Shared controls should expose a stable radius token.");
    equal(tokens["--blank-canvas-color-caret"], "rgb(109, 101, 93)", "Carets should use a shared color token.");
    equal(tokens["--blank-canvas-color-placeholder"], "rgba(48, 40, 31, 0.42)", "Placeholder text should use a shared token.");
    assert(
      tokens["--blank-canvas-page-background"],
      "Page backgrounds should use a shared token so dashboard and focused pages stay consistent."
    );
    equal(snapshot.hasControlTokens, true, "The design-token snapshot should report control-token readiness.");
    equal(snapshot.hasCaretTokens, true, "The design-token snapshot should report caret-token readiness.");
    assert(snapshot.tokenGroups.controls >= 5, "The controls token group should be represented in diagnostics.");
    assert(snapshot.tokenCount >= 40, "The expanded token map should expose the design-system roles.");
  });

  addTest("Phase 6.5 visual tokens switch to a white field with black ink when enabled", () => {
    const baseTokens = root.ui.buildTokenMap({
      ...root.defaults,
      enabled: true,
      uiLayoutMode: "editorial",
      uiPhaseTypographyReset: true,
      uiPhaseDashboardUiOverhaul: false
    });
    const visualTokens = root.ui.buildTokenMap({
      ...root.defaults,
      enabled: true,
      uiLayoutMode: "editorial",
      uiPhaseTypographyReset: true,
      uiPhaseDashboardUiOverhaul: true
    });
    const snapshot = root.ui.getDesignTokenSnapshot({
      ...root.defaults,
      enabled: true,
      uiLayoutMode: "editorial",
      uiPhaseTypographyReset: true,
      uiPhaseDashboardUiOverhaul: true
    });

    equal(baseTokens["--blank-canvas-color-bg"], "#f6f1e8", "The base editorial palette should stay unchanged while Phase 6.5 is off.");
    equal(visualTokens["--blank-canvas-color-bg"], "#ffffff", "Phase 6.5 should switch the page background base to white.");
    assert(
        visualTokens["--blank-canvas-page-background"].includes("radial-gradient") &&
        visualTokens["--blank-canvas-page-background"].includes("10% 90%") &&
        visualTokens["--blank-canvas-page-background"].includes("#ffffff") &&
        !visualTokens["--blank-canvas-page-background"].includes("#efbfd0"),
      "Phase 6.5 should expose a white shadow-gradient background instead of the pink wash."
    );
    equal(visualTokens["--blank-canvas-color-text"], "#111111", "Phase 6.5 should switch primary text to near-black ink.");
    equal(
      visualTokens["--blank-canvas-font-heading"],
      '"Helvetica Neue", "Arial Nova", "Segoe UI", Arial, sans-serif',
      "Phase 6.5 should switch headings to the leaner sans stack."
    );
    assert(
      visualTokens["--blank-canvas-shadow-panel"].includes("rgba(26, 33, 39, 0.08)"),
      "Phase 6.5 should restore soft panel shadows for the neutral look."
    );
    equal(snapshot.visualMode, "dashboard-ui-overhaul", "The token snapshot should report the visual mode.");
  });

  addTest("Feature registry exposes page-scoped feature enablement", () => {
    const definitions = root.featureRegistry.getDefinitions();
    const dashboardFeature = definitions.find((feature) => feature.id === "dashboard-assignments");
    const focusedPageFeature = definitions.find((feature) => feature.id === "focused-page-shell");
    const settings = {
      ...root.defaults,
      enabled: true,
      uiLayoutMode: "editorial",
      showDashboardTodoList: true,
      uiPhaseFocusedPages: true
    };

    assert(dashboardFeature, "The dashboard assignments feature should be registered.");
    assert(focusedPageFeature, "The focused page shell feature should be registered.");
    assert(
      dashboardFeature.isEnabled(settings, { pageType: "dashboard" }),
      "Dashboard assignments should be eligible on the dashboard."
    );
    assert(
      !dashboardFeature.isEnabled(settings, { pageType: "course-home" }),
      "Dashboard assignments should not be eligible on course pages."
    );
    assert(
      focusedPageFeature.isEnabled(settings, {
        pageType: "course-assignment-detail",
        pageFamily: "course",
        courseId: "101",
        pageRoutePattern: "/courses/:courseId/assignments/:assignmentId"
      }),
      "The focused page shell should be eligible on focused course pages when Phase 7 is enabled."
    );
  });

  addTest("Feature registry replaces duplicate feature ids without duplicating styles", () => {
    const registry = root.featureRegistry.createRegistry();
    let oldTeardownCount = 0;

    registry.register({
      id: "demo-feature",
      isEnabled: () => true,
      mount: () => ({
        version: "old"
      }),
      teardown: () => {
        oldTeardownCount += 1;
      },
      getStyles: () => ".old-demo-feature {}"
    });

    registry.sync({
      settings: {
        enabled: true
      },
      context: {
        pageType: "dashboard"
      }
    });

    registry.register({
      id: "demo-feature",
      isEnabled: () => true,
      mount: () => ({
        version: "new"
      }),
      getStyles: () => ".new-demo-feature {}"
    });

    const definitions = registry.getDefinitions();
    const styles = registry.getStyles({});
    const replacementSnapshot = registry.getSnapshot();
    const report = registry.sync({
      settings: {
        enabled: true
      },
      context: {
        pageType: "dashboard"
      }
    });

    equal(definitions.length, 1, "Duplicate feature ids should replace the previous feature.");
    equal(oldTeardownCount, 1, "Replacing a mounted feature should teardown the old definition.");
    equal(
      replacementSnapshot.featureSnapshots["demo-feature"].replaced,
      true,
      "Replacing a mounted feature should update diagnostics before the next sync."
    );
    assert(!styles.includes(".old-demo-feature"), "Replaced feature styles should not remain registered.");
    assert(styles.includes(".new-demo-feature"), "The replacement feature styles should be registered.");
    equal(
      report.featureSnapshots["demo-feature"].version,
      "new",
      "The replacement feature should own the next mount."
    );
  });

  addTest("Feature registry tears down only features that were previously mounted", () => {
    const registry = root.featureRegistry.createRegistry();
    let mountCount = 0;
    let teardownCount = 0;
    let featureEnabled = true;

    registry.register({
      id: "lifecycle-feature",
      isEnabled: () => featureEnabled,
      mount: () => {
        mountCount += 1;
        return {
          mountCount
        };
      },
      teardown: () => {
        teardownCount += 1;
      }
    });

    registry.sync({
      settings: {
        enabled: true
      },
      context: {
        pageType: "dashboard"
      }
    });
    featureEnabled = false;
    registry.sync({
      settings: {
        enabled: true
      },
      context: {
        pageType: "course-home"
      }
    });
    registry.sync({
      settings: {
        enabled: true
      },
      context: {
        pageType: "course-home"
      }
    });
    featureEnabled = true;
    registry.sync({
      settings: {
        enabled: true
      },
      context: {
        pageType: "dashboard"
      }
    });
    registry.teardown();
    registry.teardown();

    equal(mountCount, 2, "The feature should mount once per enabled sync after remount.");
    equal(teardownCount, 2, "Teardown should run once per mounted lifecycle.");
  });

  addTest("Focused page shell mounts diagnostics without visual changes", () => {
    const settings = {
      ...root.defaults,
      enabled: true,
      uiLayoutMode: "editorial",
      uiPhaseFocusedPages: true
    };
    const context = {
      path: "/courses/101/assignments/7",
      pageType: "course-assignment-detail",
      pageFamily: "course",
      pageRoutePattern: "/courses/:courseId/assignments/:assignmentId",
      isDashboard: false,
      isCourse: true,
      courseId: "101",
      globalNavKey: "courses"
    };

    try {
      const report = root.featureRegistry.sync({
        settings,
        context,
        assignmentSnapshot: {
          items: [],
          status: "idle",
          source: "none"
        }
      });

      assert(
        report.mountedFeatureIds.includes("focused-page-shell"),
        "The Phase 7 shell should mount as a diagnostic-only feature."
      );
      equal(
        report.featureSnapshots["focused-page-shell"].visualChangesEnabled,
        false,
        "The Phase 7 shell should not enable visible page changes during the refactor."
      );
    } finally {
      root.featureRegistry.teardown();
    }
  });

  addTest("Shared UI primitive styles are included in managed CSS", () => {
    const cssText = root.themeStyles.buildBaseCss({
      ...root.defaults,
      enabled: true,
      uiLayoutMode: "editorial"
    });

    assert(cssText.includes(".blank-canvas-ui-surface"), "Managed CSS should include shared surface primitives.");
    assert(cssText.includes(".blank-canvas-ui-control"), "Managed CSS should include shared control primitives.");
    assert(cssText.includes(".blank-canvas-ui-caret"), "Managed CSS should include shared caret primitives.");
    assert(cssText.includes(".blank-canvas-ui-calendar"), "Managed CSS should include shared calendar primitives.");
    assert(cssText.includes(".blank-canvas-ui-popover"), "Managed CSS should include shared popover primitives.");
  });

  addTest("Dashboard and modal styles consume shared Phase 6.5 token roles", () => {
    const settings = {
      ...root.defaults,
      enabled: true,
      uiLayoutMode: "editorial",
      uiPhaseAgendaList: true,
      uiPhaseAssignmentHierarchy: true
    };
    const dashboardCss = root.dashboardStyles.getStyles(settings);
    const modalCss = root.customAssignmentModal.getStyles();

    assert(
      dashboardCss.includes("--blank-canvas-surface-button-subtle"),
      "Dashboard controls should consume the shared subtle button surface token."
    );
    assert(
      dashboardCss.includes("--blank-canvas-surface-button-muted"),
      "Dashboard action/status controls should consume the shared muted button surface token."
    );
    assert(
      modalCss.includes("--blank-canvas-control-height") &&
        modalCss.includes("--blank-canvas-control-radius") &&
        modalCss.includes("--blank-canvas-color-caret"),
      "The custom assignment modal should consume shared control and caret tokens."
    );
    assert(
      modalCss.includes("--blank-canvas-color-placeholder") &&
        modalCss.includes("--blank-canvas-shadow-popover"),
      "The custom assignment modal should consume shared placeholder and popover tokens."
    );
  });

  addTest("Phase 6.5 dashboard CSS is gated by the visual overhaul flag", () => {
    const baseCss = root.dashboardStyles.getStyles({
      ...root.defaults,
      enabled: true,
      uiLayoutMode: "editorial",
      uiPhaseAgendaList: true,
      uiPhaseAssignmentHierarchy: true,
      uiPhaseDashboardUiOverhaul: false
    });
    const visualCss = root.dashboardStyles.getStyles({
      ...root.defaults,
      enabled: true,
      uiLayoutMode: "editorial",
      uiPhaseAgendaList: true,
      uiPhaseAssignmentHierarchy: true,
      uiPhaseDashboardUiOverhaul: true
    });

    assert(
      !baseCss.includes("blank-canvas--phase-dashboard-ui-overhaul"),
      "Phase 6.5 dashboard selectors should not be emitted while the flag is off."
    );
    assert(
      visualCss.includes("blank-canvas--phase-dashboard-ui-overhaul") &&
        visualCss.includes("var(--blank-canvas-page-background)") &&
        visualCss.includes("var(--blank-canvas-dashboard-column-gap)"),
      "Phase 6.5 should emit the minimalist dashboard visual rules when enabled."
    );
    assert(visualCss.includes("overflow-x: hidden"), "Phase 6.5 should guard against horizontal page overflow.");
    assert(
      !visualCss.includes("blank-canvas--phase-dashboard-ui-overhaul.blank-canvas--dashboard #menu"),
      "Phase 6.5 should not broadly recolor the left rail and risk marking every nav item active."
    );
    assert(
      visualCss.includes("toggle-assignment-done'][data-completed='true']"),
      "Phase 6.5 should preserve the completed custom-assignment green state."
    );
    assert(
      visualCss.includes("#DashboardCard_Container::before") &&
        visualCss.includes('content: "Classes"') &&
        visualCss.includes("writing-mode: vertical-rl"),
      "Phase 6.5 should give the classes block a distinct geometric label treatment."
    );
    assert(
      visualCss.includes("#DashboardCard_Container::after") &&
        visualCss.includes("content: none"),
      "Phase 6.5 should remove the green splash from the classes block in the neutral background pass."
    );
    assert(
      visualCss.includes("border-radius: 6px 34px 34px 6px") &&
        visualCss.includes("border-left: 4px solid"),
      "Phase 6.5 should give the assignments block a distinct paper-like silhouette."
    );
    assert(
      visualCss.includes("--blank-canvas-class-accent") &&
        visualCss.includes("--blank-canvas-class-accent-border") &&
        visualCss.includes("isolation: isolate !important;") &&
        visualCss.includes('content: "→"') &&
        visualCss.includes("--blank-canvas-class-pill-arrow-gutter") &&
        visualCss.includes("inset: 0;") &&
        visualCss.includes(".ic-DashboardCard::after") &&
        visualCss.includes(":has(a.ic-DashboardCard__link:focus-visible)") &&
        visualCss.includes("opacity: 1;") &&
        visualCss.includes("opacity: 0;") &&
        visualCss.includes("left: 0;") &&
        visualCss.includes("right: -18px;") &&
        visualCss.includes("translateX(18px)") &&
        visualCss.includes("transform: scale(1);") &&
        visualCss.includes("color: white !important;"),
      "Phase 6.5 should give Classes a flow-button treatment driven by per-course accent variables."
    );
    assert(
      !visualCss.includes(".ic-DashboardCard__header_content span,"),
      "Phase 6.5 should avoid broad header-content span overrides that would wipe out Canvas course colors."
    );
    assert(
      visualCss.includes("font-weight: 600 !important") &&
        visualCss.includes("font-weight: 500;"),
      "Phase 6.5 should lighten the dashboard typography weights for the thinner type direction."
    );
  });

  addTest("Diagnostics expose page context and feature registry state", () => {
    const originalGetPageContext = root.canvas.getPageContext;
    root.canvas.getPageContext = () => ({
      path: "/courses/101/modules",
      pageType: "course-modules",
      pageFamily: "course",
      pageRoutePattern: "/courses/:courseId/modules",
      isDashboard: false,
      isCourse: true,
      courseId: "101",
      globalNavKey: "courses"
    });

    try {
      const report = root.diagnostics.buildReport({
        ...root.defaults,
        enabled: true,
        uiLayoutMode: "editorial"
      });

      equal(report.pageType, "course-modules", "Diagnostics should include the stable page type.");
      equal(report.pageFamily, "course", "Diagnostics should include the page family.");
      assert(
        report.registeredFeatureIds.includes("dashboard-assignments"),
        "Diagnostics should include registered feature ids."
      );
      assert(Array.isArray(report.mountedFeatureIds), "Diagnostics should expose mounted feature ids.");
      equal(
        report.designSystem.phaseDashboardUiOverhaulEnabled,
        false,
        "Diagnostics should report the Phase 6.5 flag state."
      );
      equal(report.designSystem.primitivesStylesheetPresent, true, "Diagnostics should report primitive CSS readiness.");
      equal(report.designSystem.hasControlTokens, true, "Diagnostics should report control token readiness.");
      equal(report.designSystem.hasCaretTokens, true, "Diagnostics should report caret token readiness.");
      equal(report.reactBridge.available, true, "Diagnostics should expose the React bridge scaffold.");
      equal(report.reactBridge.mountedCount, 0, "Diagnostics should keep the React bridge idle by default.");
      equal(
        report.designSystem.modalPrimitiveAdoption.usesCaretTokens,
        true,
        "Diagnostics should report modal primitive adoption."
      );
      equal(
        report.designSystem.dashboardPrimitiveAdoption.usesDashboardUiOverhaulSelector,
        false,
        "Diagnostics should keep Phase 6.5 visual adoption inactive while the flag is off."
      );
    } finally {
      root.canvas.getPageContext = originalGetPageContext;
    }
  });

  addTest("React bridge mounts and unmounts extension-owned UI safely", async () => {
    assert(root.react && root.react.available, "React bridge should be available in the test harness.");

    const fixture = document.createElement("div");
    document.body.appendChild(fixture);

    try {
      function TestComponent(props) {
        return root.react.createElement("div", {
          id: "react-bridge-proof",
          "data-label": props.label
        }, props.label);
      }

      root.react.mountComponent(TestComponent, {
        container: fixture,
        id: "react-bridge-proof",
        props: {
          label: "React ready"
        },
        strict: false
      });

      await Promise.resolve();

      equal(
        fixture.querySelector("#react-bridge-proof")?.textContent || "",
        "React ready",
        "React bridge should render a mounted component into the provided container."
      );
      equal(
        root.react.getSnapshot().mountedCount,
        1,
        "React bridge should track mounted roots."
      );

      root.react.unmount(fixture);
      await Promise.resolve();

      equal(
        fixture.textContent.trim(),
        "",
        "React bridge should cleanly unmount from the provided container."
      );
      equal(
        root.react.getSnapshot().mountedCount,
        0,
        "React bridge should clear mounted root tracking after unmount."
      );
    } finally {
      fixture.remove();
    }
  });

  addTest("Formats exact due dates and times", () => {
    const item = root.assignmentFormatting.decoratePendingAssignment(
      {
        title: "Essay Draft",
        courseName: "English 101",
        dueAt: "2026-04-10T23:59:00Z",
        dueLabel: "Due",
        url: "https://canvas.example.com/courses/101/assignments/7"
      },
      {
        locale: "en-US",
        timeZone: "UTC"
      }
    );

    equal(item.dueDateText, "Fri, Apr 10", "Exact due dates should be formatted.");
    equal(item.dueTimeText, "11:59 PM", "Exact due times should be formatted.");
    equal(item.dueSummaryText, "Fri, Apr 10 at 11:59 PM", "Date and time should be condensed.");
    equal(item.primaryTitle, "Essay Draft", "Assignment rows should keep the assignment title primary.");
    equal(item.secondaryCourseName, "English 101", "Assignment rows should expose course metadata separately.");
    equal(item.displayTitle, "English 101 - Essay Draft", "Compatibility display titles should stay combined.");
  });

  addTest("Cleans duplicated course names before rendering", () => {
    const item = root.assignmentFormatting.decoratePendingAssignment(
      {
        title: "Lab1",
        courseName: "EECS 70A/70LAEECS 70A/70LASpring 2026",
        dueAt: "2026-04-13T08:00:00Z",
        dueLabel: "Due",
        url: "https://canvas.example.com/courses/101/assignments/7"
      },
      {
        locale: "en-US",
        timeZone: "UTC"
      }
    );

    equal(item.courseName, "EECS 70A/70LA", "Course names should be deduplicated and shortened.");
    equal(item.primaryTitle, "Lab1", "The assignment headline should stay on the assignment title.");
    equal(item.displayTitle, "EECS 70A/70LA - Lab1", "The compatibility title should stay clean.");
  });

  addTest("Normalizes screenshot-style duplicated course fragments out of assignment rows", () => {
    const item = root.assignmentFormatting.decoratePendingAssignment(
      {
        title: "31L | Digital Systems LabsEECS 31LSpring 2026 - Assignment 1",
        courseName: "31L | Digital Systems LabsEECS 31LSpring 2026",
        dueLabel: "Due",
        url: "https://canvas.example.com/courses/82520/assignments/11"
      }
    );

    equal(item.courseName, "31L | Digital Systems Labs", "The course label should drop the repeated suffix.");
    equal(item.primaryTitle, "Assignment 1", "The primary row title should strip duplicated course residue.");
    equal(
      item.displayTitle,
      "31L | Digital Systems Labs - Assignment 1",
      "The compatibility title should no longer concatenate the malformed course string."
    );
  });

  addTest("Store state snapshots fall back to DOM items before refresh", () => {
    const state = root.assignmentStoreState.createState();
    const snapshot = root.assignmentStoreState.createSnapshot(state, [
      {
        title: "DOM fallback",
        url: "https://canvas.example.com/courses/101/assignments/7"
      }
    ]);

    equal(snapshot.items.length, 1, "Snapshots should expose fallback items when the store is empty.");
    equal(snapshot.items[0].title, "DOM fallback", "Fallback assignment titles should be preserved.");
    equal(snapshot.source, "dom", "Fallback snapshots should report the DOM source.");
  });

  addTest("Store state preserves a previously resolved course name over Course fallback regression", () => {
    const state = root.assignmentStoreState.createState();
    state.items = [
      {
        title: "Essay Draft",
        courseId: "101",
        courseName: "English 101",
        url: "https://canvas.example.com/courses/101/assignments/7"
      }
    ];

    root.assignmentStoreState.applyRefreshSuccess(
      state,
      [
        {
          title: "Essay Draft",
          courseId: "101",
          courseName: "Course 101",
          url: "https://canvas.example.com/courses/101/assignments/7"
        }
      ],
      [],
      {
        courseNames: {}
      }
    );

    equal(
      state.items[0].courseName,
      "English 101",
      "Refresh success should not regress a stable course name back to a generic fallback."
    );
  });

  addTest("Store state prefers DOM-resolved course names over generic API fallback", () => {
    const state = root.assignmentStoreState.createState();

    root.assignmentStoreState.applyRefreshSuccess(
      state,
      [
        {
          title: "Essay Draft",
          courseId: "101",
          courseName: "Course 101",
          url: "https://canvas.example.com/courses/101/assignments/7"
        }
      ],
      [
        {
          title: "Essay Draft",
          courseId: "101",
          courseName: "English 101",
          url: "https://canvas.example.com/courses/101/assignments/7"
        }
      ],
      {
        courseNames: {}
      }
    );

    equal(
      state.items[0].courseName,
      "English 101",
      "DOM fallback names should win over generic Course ##### API labels."
    );
  });

  addTest("Store state refresh policy respects cache age and force refresh", () => {
    const state = root.assignmentStoreState.createState();

    assert(root.assignmentStoreState.shouldRefresh(state), "Empty stores should refresh immediately.");

    state.lastLoadedAt = 1_000;
    assert(
      !root.assignmentStoreState.shouldRefresh(state, {
        now: 1_000 + root.assignmentStoreState.REFRESH_WINDOW_MS - 1
      }),
      "Fresh assignment data should not refresh before the cache window expires."
    );
    assert(
      root.assignmentStoreState.shouldRefresh(state, {
        now: 1_000 + root.assignmentStoreState.REFRESH_WINDOW_MS + 1
      }),
      "Stale assignment data should refresh after the cache window."
    );
    assert(
      root.assignmentStoreState.shouldRefresh(state, {
        force: true,
        now: 1_001
      }),
      "Forced refreshes should bypass the cache window."
    );

    state.inFlight = Promise.resolve();
    assert(
      !root.assignmentStoreState.shouldRefresh(state, {
        now: 1_000 + root.assignmentStoreState.REFRESH_WINDOW_MS + 1
      }),
      "Non-forced refreshes should wait for the current request to finish."
    );
  });

  addTest("Scrapes only pending assignments from dashboard DOM", () => {
    const fixture = createFixture(`
      <div id="dashboard">
        <a href="/courses/101">English 101</a>
        <div id="right-side">
          <ul>
            <li>
              <a href="/courses/101/assignments/7">Essay Draft</a>
              <time datetime="2026-04-10T23:59:00Z">Apr 10 at 11:59 PM</time>
            </li>
            <li>
              <a href="/courses/101/assignments/8">Reading Log</a>
              <span>Submitted</span>
            </li>
          </ul>
        </div>
      </div>
    `);

    const items = root.assignmentDom.scrapePendingAssignmentsFromDom(fixture, {
      locale: "en-US",
      timeZone: "UTC"
    });

    equal(items.length, 1, "Only pending assignments should be returned.");
    equal(items[0].title, "Essay Draft", "The assignment title should be preserved.");
    equal(items[0].courseName, "English 101", "The course name should be inferred.");
    equal(items[0].dueDateText, "Fri, Apr 10", "DOM scraping should decorate due date text.");
    equal(items[0].dueTimeText, "11:59 PM", "DOM scraping should decorate due time text.");
  });

  addTest("Course options prefer cleaned course labels over duplicated dashboard card text", () => {
    const fixture = createFixture(`
      <div id="dashboard">
        <a href="https://canvas.example.com/courses/82520" title="31L | Digital Systems Labs">
          31L | Digital Systems LabsEECS 31LSpring 2026
        </a>
        <a href="https://canvas.example.com/courses/75010">
          Open Project Space - 2025-2026Open Project Space - 2025-20262025-26 Academic Year
        </a>
      </div>
    `);

    const options = root.assignmentUtils.buildCourseOptions(fixture, {
      path: "/",
      isDashboard: true,
      courseId: ""
    });

    equal(
      options.find((option) => option.courseId === "82520").courseName,
      "31L | Digital Systems Labs",
      "Course options should prefer clean attribute labels when available."
    );
    equal(
      options.find((option) => option.courseId === "75010").courseName,
      "Open Project Space - 2025-2026",
      "Course options should strip duplicated fragments and academic-year suffixes from raw dashboard text."
    );
  });

  addTest("Assignment row model keeps course metadata separate from a title that already includes the course", () => {
    const row = root.assignmentRowModel.buildAssignmentRow({
      title: "English 101 - Essay Draft",
      courseName: "English 101",
      dueLabel: "Late",
      dueSummaryText: "Fri, Apr 10 at 11:59 PM",
      statusTone: "late",
      url: "https://canvas.example.com/courses/101/assignments/7"
    });

    equal(row.primaryTitle, "Essay Draft", "Primary titles should strip a leading course name.");
    equal(row.secondaryCourseName, "English 101", "Secondary course metadata should stay available.");
    equal(row.statusLabel, "Late", "Status metadata should be exposed separately from the due summary.");
  });

  addTest("Custom assignment storage normalizes, updates, and deletes records", async () => {
    await resetCustomAssignments();

    const created = await root.customAssignments.createCustomAssignment(
      {
        title: "Read chapter 5",
        courseId: root.customAssignments.GENERAL_COURSE_ID,
        courseName: root.customAssignments.GENERAL_COURSE_NAME,
        dueAt: "2026-04-20T17:00"
      },
      {
        now: new Date("2026-04-13T10:30:00Z")
      }
    );

    assert(created.id.startsWith("custom-"), "Custom assignments should receive a stable generated id.");
    equal(created.courseName, "General", "General assignments should keep the General course label.");

    const updated = await root.customAssignments.updateCustomAssignment(
      created.id,
      {
        title: "Read chapter 6"
      },
      {
        now: new Date("2026-04-13T11:30:00Z")
      }
    );

    equal(updated.title, "Read chapter 6", "Updated custom assignments should persist new titles.");

    const completed = await root.customAssignments.toggleCustomAssignmentDone(created.id, {
      now: new Date("2026-04-13T12:30:00Z")
    });
    assert(completed.completedAt, "Completed custom assignments should record a completion timestamp.");
    equal(
      (await root.customAssignments.listPendingAssignments()).length,
      1,
      "Completed custom assignments should remain visible in pending assignment surfaces."
    );

    const reopened = await root.customAssignments.toggleCustomAssignmentDone(created.id, {
      now: new Date("2026-04-13T13:30:00Z")
    });
    equal(reopened.completedAt, null, "Toggling completion again should clear the completed state.");

    const beforeDelete = await root.customAssignments.listCustomAssignments();
    equal(beforeDelete.length, 1, "Custom assignments should be persisted in storage.");

    await root.customAssignments.deleteCustomAssignment(created.id);
    const afterDelete = await root.customAssignments.listCustomAssignments();
    equal(afterDelete.length, 0, "Deleting a custom assignment should remove it from storage.");
  });

  addTest("Shared custom-assignment form normalizes course options, drafts, and validation", () => {
    const options = root.customAssignmentForm.normalizeCourseOptions([
      {
        courseId: "101",
        courseName: "English 101"
      }
    ]);

    equal(options[0].courseName, "English 101", "Discovered course options should appear before the fallback option.");
    equal(options[1].courseId, "general", "The fallback option should remain bound to the general course id.");
    equal(options[1].courseName, "Other", "The custom-assignment picker should label the fallback course as Other.");
    equal(
      root.customAssignmentForm.validateDraft({
        title: "",
        courseId: "general",
        dueDate: "",
        dueTime: root.customAssignmentForm.DEFAULT_DUE_TIME
      }),
      "Enter an assignment title.",
      "Popup validation should require a title."
    );
    equal(
      root.customAssignmentForm.validateDraft({
        title: "Essay draft",
        courseId: "general",
        dueDate: "",
        dueTime: root.customAssignmentForm.DEFAULT_DUE_TIME
      }),
      "Choose a due date.",
      "Shared draft validation should require a due date."
    );
    equal(
      root.customAssignmentForm.validateDraft({
        title: "Essay draft",
        courseId: "general",
        dueDate: "2026-04-20",
        dueTime: "nope"
      }),
      "Enter a valid time like 11:59 PM.",
      "Shared draft validation should reject invalid typed times."
    );

    const draft = root.customAssignmentForm.formatDraftForInputs(
      {
        title: "Essay draft",
        courseId: "101",
        courseName: "English 101",
        dueAt: "2026-04-20T17:00:00.000Z"
      },
      options
    );

    equal(draft.courseId, "101", "Existing records should preserve their course selection in draft form.");
    equal(draft.dueDate, "2026-04-20", "Drafts should prefill the custom date picker with a local date.");
    equal(draft.dueTime, "10:00 AM", "Drafts should prefill the typed time control in local time.");
    equal(root.customAssignmentForm.createDraft().courseId, "", "New custom drafts should start with no class selected.");
    equal(
      root.customAssignmentForm.createDraft().dueTime,
      root.customAssignmentForm.DEFAULT_DUE_TIME,
      "New custom drafts should default the time picker to 11:59 PM."
    );
  });

  addTest("Assignment refresh merges custom assignments with Canvas assignments", async () => {
    const originalDom = root.assignmentDom.scrapePendingAssignmentsFromDom;
    const originalApi = root.assignmentApi.fetchPendingAssignmentsFromApi;
    await resetCustomAssignments();
    await resetIgnoredAssignments();
    await resetCompletedAssignments();

    root.assignmentDom.scrapePendingAssignmentsFromDom = () => [];
    root.assignmentApi.fetchPendingAssignmentsFromApi = async () => [
      {
        title: "Canvas assignment",
        courseId: "101",
        courseName: "English 101",
        dueDateText: "Fri, Apr 10",
        dueTimeText: "11:59 PM",
        dueSummaryText: "Fri, Apr 10 at 11:59 PM",
        dueLabel: "Due",
        dueAt: "2026-04-10T23:59:00Z",
        dueSortValue: 1,
        statusTone: "pending",
        source: "api",
        url: "https://canvas.example.com/courses/101/assignments/7"
      }
    ];

    await root.customAssignments.createCustomAssignment(
      {
        title: "Custom reading",
        courseId: "general",
        courseName: "General",
        dueAt: "2026-04-11T10:00"
      },
      {
        now: new Date("2026-04-13T10:30:00Z")
      }
    );

    root.assignments.invalidate();
    const snapshot = await root.assignments.refreshPendingAssignments({
      force: true
    });

    equal(snapshot.items.length, 2, "Assignment refresh should merge Canvas and custom assignments.");
    equal(snapshot.sourceCounts.custom, 1, "Merged snapshots should report custom source counts.");
    assert(
      snapshot.items.some((item) => item.source === "custom"),
      "Merged snapshots should include custom assignment rows."
    );

    root.assignmentDom.scrapePendingAssignmentsFromDom = originalDom;
    root.assignmentApi.fetchPendingAssignmentsFromApi = originalApi;
    await resetCustomAssignments();
    await resetIgnoredAssignments();
    await resetCompletedAssignments();
  });

  addTest("Assignment refresh applies persisted completion state to native Canvas assignments", async () => {
    const originalDom = root.assignmentDom.scrapePendingAssignmentsFromDom;
    const originalApi = root.assignmentApi.fetchPendingAssignmentsFromApi;
    await resetCustomAssignments();
    await resetIgnoredAssignments();
    await resetCompletedAssignments();

    root.assignmentDom.scrapePendingAssignmentsFromDom = () => [];
    root.assignmentApi.fetchPendingAssignmentsFromApi = async () => [
      {
        title: "Canvas assignment",
        courseId: "101",
        courseName: "English 101",
        dueSummaryText: "Fri, Apr 10 at 11:59 PM",
        dueLabel: "Due",
        dueAt: "2026-04-10T23:59:00Z",
        dueSortValue: 1,
        statusTone: "pending",
        source: "api",
        url: "https://canvas.example.com/courses/101/assignments/7"
      }
    ];

    await root.completedAssignments.toggleAssignmentDone(
      root.assignmentCourseResolver.getAssignmentKey({
        courseId: "101",
        url: "https://canvas.example.com/courses/101/assignments/7",
        title: "Canvas assignment"
      }),
      {
        now: new Date("2026-04-13T10:30:00Z")
      }
    );

    root.assignments.invalidate();
    const snapshot = await root.assignments.refreshPendingAssignments({
      force: true
    });

    equal(snapshot.items[0].completedAt !== null, true, "Merged native assignments should preserve persisted completion state.");
    equal(snapshot.items[0].statusTone, "done", "Completed native assignments should resolve to the done status tone.");

    root.assignmentDom.scrapePendingAssignmentsFromDom = originalDom;
    root.assignmentApi.fetchPendingAssignmentsFromApi = originalApi;
    await resetCustomAssignments();
    await resetIgnoredAssignments();
    await resetCompletedAssignments();
  });

  addTest("Assignment refresh treats stale extension contexts as quiet DOM fallbacks", async () => {
    const originalDom = root.assignmentDom.scrapePendingAssignmentsFromDom;
    const originalFetchMerged = root.assignmentRefresh.fetchMergedAssignments;
    const originalFetchFallback = root.assignmentRefresh.fetchFallbackWithCustom;
    const originalWarn = console.warn;
    const warnCalls = [];
    let fallbackWithCustomCalled = false;

    root.assignmentDom.scrapePendingAssignmentsFromDom = () => [
      {
        title: "Visible DOM assignment",
        courseId: "101",
        courseName: "English 101",
        dueSummaryText: "Fri, Apr 10 at 11:59 PM",
        dueSortValue: 1,
        source: "dom",
        url: "https://canvas.example.com/courses/101/assignments/7"
      }
    ];
    root.assignmentRefresh.fetchMergedAssignments = async () => {
      throw new Error("Extension context invalidated.");
    };
    root.assignmentRefresh.fetchFallbackWithCustom = async () => {
      fallbackWithCustomCalled = true;
      return {
        mergedFallback: []
      };
    };
    console.warn = (...args) => warnCalls.push(args);

    try {
      root.assignments.invalidate();
      const snapshot = await root.assignments.refreshPendingAssignments({
        force: true
      });

      equal(snapshot.status, "ready", "A stale extension context should resolve with the DOM fallback.");
      equal(snapshot.source, "dom", "A stale extension context should keep the fallback source as DOM.");
      equal(snapshot.items.length, 1, "A stale extension context should preserve visible DOM assignments.");
      equal(fallbackWithCustomCalled, false, "Stale contexts should not call extension-backed fallback storage.");

      root.debug.warn("assignments", "Pending assignment refresh failed.", "Error: Extension context invalidated.");
      equal(warnCalls.length, 0, "Stale extension context warnings should not be printed to Chrome errors.");
    } finally {
      root.assignmentDom.scrapePendingAssignmentsFromDom = originalDom;
      root.assignmentRefresh.fetchMergedAssignments = originalFetchMerged;
      root.assignmentRefresh.fetchFallbackWithCustom = originalFetchFallback;
      console.warn = originalWarn;
      root.assignments.invalidate();
    }
  });

  addTest("Ignored Canvas assignment keys filter native assignments out of merged results", async () => {
    await resetIgnoredAssignments();

    const items = [
      {
        title: "Canvas assignment",
        courseId: "101",
        courseName: "English 101",
        dueAt: "2026-04-10T23:59:00Z",
        url: "https://canvas.example.com/courses/101/assignments/7",
        source: "api"
      },
      {
        title: "Custom reading",
        courseId: "general",
        courseName: "General",
        dueAt: "2026-04-11T10:00:00Z",
        source: "custom",
        customAssignmentId: "custom-1",
        url: ""
      }
    ];

    const ignoredKey = root.assignmentCourseResolver.getAssignmentKey(items[0]);
    await root.ignoredAssignments.ignoreAssignmentKey(ignoredKey);
    const filtered = root.assignmentRefresh.filterIgnoredAssignments(items, [ignoredKey]);

    equal(filtered.length, 1, "Ignored native assignments should be filtered from merged lists.");
    equal(filtered[0].source, "custom", "Custom assignments should remain visible when native items are ignored.");

    await resetIgnoredAssignments();
  });

  addTest("Completed assignment storage toggles native Canvas assignments by assignment key", async () => {
    await resetCompletedAssignments();

    const marked = await root.completedAssignments.toggleAssignmentDone("assignment:101:7", {
      now: new Date("2026-04-13T12:30:00Z")
    });
    assert(marked.completedAt, "Completed native assignments should record a completion timestamp.");
    equal(
      (await root.completedAssignments.listCompletedAssignmentKeys()).length,
      1,
      "Completed native assignment keys should be persisted."
    );

    const reopened = await root.completedAssignments.toggleAssignmentDone("assignment:101:7");
    equal(reopened.completedAt, null, "Toggling a completed native assignment again should clear completion.");
    equal(
      (await root.completedAssignments.listCompletedAssignmentKeys()).length,
      0,
      "Clearing completion should remove the native assignment key from storage."
    );
  });

  addTest("Fetches planner items across pages and maps assignment fields", async () => {
    const pageOne = [
      {
        context_type: "Course",
        course_id: 101,
        plannable_type: "Assignment",
        linked_object_html_url: "https://canvas.example.com/courses/101/assignments/7",
        plannable: {
          title: "Essay Draft",
          due_at: "2026-04-10T23:59:00Z"
        },
        submissions: {
          submitted: false
        }
      }
    ];

    const pageTwo = [
      {
        context_type: "Course",
        course_id: 202,
        plannable_type: "Assignment",
        html_url: "https://canvas.example.com/courses/202/assignments/9",
        plannable: {
          title: "Lab Report",
          due_at: "2026-04-12T17:30:00Z"
        },
        submissions: {
          submitted: false
        }
      },
      {
        context_type: "Course",
        course_id: 202,
        plannable_type: "Quiz",
        html_url: "https://canvas.example.com/courses/202/quizzes/9",
        plannable: {
          title: "Practice Quiz"
        }
      }
    ];

    const calls = [];
    const fetchImpl = async (url) => {
      calls.push(url);

      if (calls.length === 1) {
        return {
          ok: true,
          status: 200,
          json: async () => pageOne,
          headers: {
            get: (name) =>
              name.toLowerCase() === "link"
                ? '<https://canvas.example.com/api/v1/planner/items?page=2>; rel="next"'
                : null
          }
        };
      }

      return {
        ok: true,
        status: 200,
        json: async () => pageTwo,
        headers: {
          get: () => null
        }
      };
    };

    const items = await root.assignmentApi.fetchPendingAssignmentsFromApi({
      courseNames: {
        "101": "English 101",
        "202": "Biology 202"
      },
      fetchImpl,
      locale: "en-US",
      timeZone: "UTC"
    });

    equal(items.length, 2, "Planner pagination should merge assignment pages.");
    equal(items[0].courseName, "English 101", "Mapped items should preserve course names.");
    equal(items[1].title, "Lab Report", "Mapped items should preserve assignment titles.");
    assert(calls.length === 2, "Planner fetch should follow the next page link.");
  });

  addTest("Course nav selectors find hidden left tabs by course", () => {
    const fixture = createFixture(`
      <ul id="section-tabs">
        <li><a href="/courses/101">Home</a></li>
        <li><a href="/courses/101/announcements">Announcements</a></li>
        <li><a href="/courses/101/modules">Modules</a></li>
      </ul>
    `);

    const links = root.canvas.findCourseNavLinks(fixture);
    equal(links.length, 3, "Course nav links should be discovered from the section tabs.");
    equal(root.canvas.resolveCourseNavItemKey(links[0], "101"), "home", "Home should map to a stable course nav key.");
    equal(
      root.canvas.resolveCourseNavItemKey(links[1], "101"),
      "announcements",
      "Child course routes should map to the trailing path."
    );

    const targets = root.canvas.findHiddenCourseNavTargets(
      {
        hiddenCourseNavItems: {
          "101": ["announcements"]
        }
      },
      {
        isCourse: true,
        courseId: "101"
      },
      fixture
    );

    equal(targets.length, 1, "Only hidden course nav targets should be returned.");
    equal(targets[0].textContent.trim(), "Announcements", "The matched target should correspond to the hidden tab.");
  });

  addTest("Course nav utils normalize and append hidden tabs safely", () => {
    const normalized = root.courseNavUtils.normalizeHiddenCourseNavItems({
      "101": ["Announcements", " announcements ", "", "Modules"],
      "202": "bad-value"
    });

    equal(normalized["101"].length, 2, "Hidden course nav items should be deduplicated.");
    equal(normalized["101"][0], "announcements", "Hidden course nav keys should be normalized.");
    assert(!normalized["202"], "Invalid hidden course nav entries should be dropped.");

    const next = root.courseNavUtils.addHiddenCourseNavItem(normalized, "101", "modules");
    equal(next["101"].length, 2, "Appending an existing hidden tab should not duplicate it.");
  });

  addTest("Dashboard header helpers match chrome and protect the title", () => {
    const fixture = createFixture(`
      <div id="dashboard">
        <div class="ic-Dashboard-header">
          <div class="ic-Dashboard-header__layout">
            <div><h1>Dashboard</h1></div>
            <atomic-search-desktop-widget></atomic-search-desktop-widget>
            <button data-testid="dashboard-options-button" type="button">More</button>
          </div>
        </div>
      </div>
    `);

    const snapshot = root.dashboardHeader.getDebugSnapshot(fixture);
    const heading = fixture.querySelector("h1");
    const searchWidget = fixture.querySelector("atomic-search-desktop-widget");
    const optionsButton = fixture.querySelector("button[data-testid='dashboard-options-button']");

    equal(snapshot.heading.matchedCount, 1, "The dashboard heading should be discoverable for protection.");
    equal(snapshot.searchWidget.matchedCount, 1, "The dashboard search widget should be matched exactly.");
    equal(snapshot.optionsButton.matchedCount, 1, "The dashboard options button should be matched exactly.");
    assert(root.dashboardHeader.isProtectedElement(heading), "The dashboard heading should be protected.");
    assert(
      !root.dashboardHeader.isProtectedElement(searchWidget),
      "The dashboard search widget should remain hideable."
    );
    assert(
      !root.dashboardHeader.isProtectedElement(optionsButton),
      "The dashboard options button should remain hideable."
    );
  });

  addTest("Dashboard widget switches to agenda layout when Phase 4 is active", () => {
    const widget = root.dashboardView.createWidget();
    document.body.appendChild(widget);

    try {
      const presentation = root.dashboardView.syncPresentationState(widget, {
        uiLayoutMode: "editorial",
        uiPhaseAgendaList: true
      });

      equal(
        presentation.layoutVariant,
        "agenda",
        "Phase 4 should switch the dashboard widget into agenda mode."
      );
      equal(widget.dataset.layoutVariant, "agenda", "The widget should expose its current layout variant.");
    } finally {
      widget.remove();
    }
  });

  addTest("Agenda rows get a subtle hover animation without changing assignment behavior", () => {
    const cssText = root.dashboardStyles.getStyles({
      ...root.defaults,
      enabled: true,
      uiLayoutMode: "editorial",
      uiPhaseAgendaList: true,
      uiPhaseAssignmentHierarchy: true
    });

    assert(
      cssText.includes("#${WIDGET_ID} .blank-canvas__todo-link".replace("${WIDGET_ID}", "blank-canvas-dashboard-todo")) ||
        cssText.includes(".blank-canvas__todo-link"),
      "Dashboard styles should still define the assignment row surface."
    );
    assert(
      cssText.includes("background-color 160ms ease") &&
        cssText.includes('background: rgba(18, 60, 47, 0.035)') &&
        cssText.includes('transform: translateX(4px)') &&
        cssText.includes(".blank-canvas__todo-link:hover") &&
        cssText.includes(".blank-canvas__todo-link:focus-within"),
      "Agenda rows should use a light hover wash and a small horizontal nudge for both linked and custom assignment surfaces."
    );
  });

  addTest("Phase 3 injects left-rail styling when enabled", () => {
    const cssText = root.themeStyles.buildBaseCss({
      uiLayoutMode: "editorial",
      uiPhaseTypographyReset: true,
      uiPhaseDashboardShell: true,
      uiPhaseLeftRailSimplification: true,
      uiPhaseAgendaList: false
    });

    assert(
      cssText.includes("blank-canvas--phase-left-rail-simplification"),
      "Phase 3 CSS should be included when the left-rail phase is active."
    );
    assert(
      cssText.includes(".ic-app-header__menu-list-item--active"),
      "Left-rail CSS should target the active global navigation state."
    );
  });

  addTest("Left rail fixture hides clipped nav labels and keeps a uniform base surface", () => {
    const mounted = mountStyledFixture(
      {
        uiLayoutMode: "editorial",
        uiPhaseTypographyReset: true,
        uiPhaseLeftRailSimplification: true
      },
      `
        <nav id="menu">
          <a id="global_nav_dashboard_link" href="/">
            <div class="menu-item-icon-container ic-app-header__menu-list-item--active">
              <svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1 1h8v8H1z"></path></svg>
              <div class="menu-item__text">Dashboard</div>
            </div>
          </a>
          <a id="global_nav_courses_link" href="/courses">
            <div class="menu-item-icon-container">
              <svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1 1h8v8H1z"></path></svg>
              <div class="menu-item__text">Courses</div>
            </div>
          </a>
        </nav>
      `
    );

    try {
      const rail = mounted.fixture.querySelector("#menu");
      const inactiveContainer = mounted.fixture.querySelector("#global_nav_courses_link .menu-item-icon-container");
      const label = mounted.fixture.querySelector("#global_nav_courses_link .menu-item__text");
      const inactiveStyle = window.getComputedStyle(inactiveContainer);

      equal(
        normalizeColor(inactiveStyle.backgroundColor),
        normalizeColor(window.getComputedStyle(rail).backgroundColor),
        "Inactive rail buttons should sit on the same base surface as the sidebar."
      );
      equal(inactiveStyle.width, "44px", "Collapsed rail icon targets should use compact centered tiles.");
      equal(inactiveStyle.borderRadius, "14px", "Collapsed rail icon targets should have rounded sidebar tiles.");
      equal(window.getComputedStyle(label).display, "none", "Collapsed rail labels should be hidden.");
    } finally {
      mounted.cleanup();
    }
  });

  addTest("Active left rail overlay applies to list-item active state without changing icon hue", () => {
    const mounted = mountStyledFixture(
      {
        uiLayoutMode: "editorial",
        uiPhaseTypographyReset: true,
        uiPhaseLeftRailSimplification: true
      },
      `
        <nav id="menu">
          <ul class="ic-app-header__menu-list">
            <li class="ic-app-header__menu-list-item ic-app-header__menu-list-item--active">
              <a id="global_nav_courses_link" href="/courses">
                <div class="menu-item-icon-container">
                  <svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1 1h8v8H1z"></path></svg>
                  <div class="menu-item__text">Courses</div>
                </div>
              </a>
            </li>
            <li class="ic-app-header__menu-list-item">
              <a id="global_nav_calendar_link" href="/calendar">
                <div class="menu-item-icon-container">
                  <svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1 1h8v8H1z"></path></svg>
                  <div class="menu-item__text">Calendar</div>
                </div>
              </a>
            </li>
          </ul>
        </nav>
      `
    );

    try {
      const activeContainer = mounted.fixture.querySelector("#global_nav_courses_link .menu-item-icon-container");
      const activeStyle = window.getComputedStyle(activeContainer);
      const activeSvg = mounted.fixture.querySelector("#global_nav_courses_link svg");
      const inactiveSvg = mounted.fixture.querySelector("#global_nav_calendar_link svg");

      assert(
        hasOverlayBackground(activeStyle),
        "Active rail items should render a visible selected overlay on the icon container."
      );
      equal(
        normalizeColor(window.getComputedStyle(activeSvg).fill),
        normalizeColor(window.getComputedStyle(inactiveSvg).fill),
        "Active rail icons should keep the same ink color as inactive icons."
      );
    } finally {
      mounted.cleanup();
    }
  });

  addTest("Active left rail overlay applies to aria-current nav state", () => {
    const mounted = mountStyledFixture(
      {
        uiLayoutMode: "editorial",
        uiPhaseTypographyReset: true,
        uiPhaseLeftRailSimplification: true
      },
      `
        <nav id="menu">
          <a id="global_nav_calendar_link" href="/calendar" aria-current="page">
            <div class="menu-item-icon-container">
              <svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1 1h8v8H1z"></path></svg>
              <div class="menu-item__text">Calendar</div>
            </div>
          </a>
        </nav>
      `
    );

    try {
      const activeContainer = mounted.fixture.querySelector("#global_nav_calendar_link .menu-item-icon-container");
      const activeStyle = window.getComputedStyle(activeContainer);

      assert(
        hasOverlayBackground(activeStyle),
        "aria-current rail items should receive the selected overlay."
      );
    } finally {
      mounted.cleanup();
    }
  });

  addTest("Active left rail overlay applies to button-based global nav state", () => {
    const mounted = mountStyledFixture(
      {
        uiLayoutMode: "editorial",
        uiPhaseTypographyReset: true,
        uiPhaseLeftRailSimplification: true
      },
      `
        <nav id="menu">
          <ul class="ic-app-header__menu-list">
            <li class="ic-app-header__menu-list-item ic-app-header__menu-list-item--active">
              <button type="button">
                <svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1 1h8v8H1z"></path></svg>
              </button>
            </li>
            <li class="ic-app-header__menu-list-item">
              <button type="button">
                <svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1 1h8v8H1z"></path></svg>
              </button>
            </li>
          </ul>
        </nav>
      `
    );

    try {
      const activeButton = mounted.fixture.querySelector(".ic-app-header__menu-list-item--active > button");
      const inactiveButton = mounted.fixture.querySelector(".ic-app-header__menu-list-item:not(.ic-app-header__menu-list-item--active) > button");
      const activeStyle = window.getComputedStyle(activeButton);
      const activeSvg = activeButton.querySelector("svg");
      const inactiveSvg = inactiveButton.querySelector("svg");

      assert(
        hasOverlayBackground(activeStyle),
        "Button-based active rail items should receive the shared selected overlay."
      );
      equal(
        activeStyle.borderLeftWidth,
        "2px",
        "Button-based active rail items should receive the shared left marker."
      );
      equal(
        normalizeColor(window.getComputedStyle(activeSvg).fill),
        normalizeColor(window.getComputedStyle(inactiveSvg).fill),
        "Button-based active rail icons should keep the same ink color as inactive icons."
      );
    } finally {
      mounted.cleanup();
    }
  });

  addTest("Route-based selected overlay applies to global nav ids without Canvas active classes", () => {
    const mounted = mountStyledFixture(
      {
        uiLayoutMode: "editorial",
        uiPhaseTypographyReset: true,
        uiPhaseLeftRailSimplification: true
      },
      `
        <nav id="menu">
          <ul class="ic-app-header__menu-list">
            <li class="ic-app-header__menu-list-item">
              <button id="global_nav_courses_link" type="button">
                <svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1 1h8v8H1z"></path></svg>
              </button>
            </li>
            <li class="ic-app-header__menu-list-item">
              <a id="global_nav_calendar_link" href="/calendar">
                <svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1 1h8v8H1z"></path></svg>
              </a>
            </li>
          </ul>
        </nav>
      `
    );

    try {
      document.documentElement.classList.add("blank-canvas--nav-courses");

      const selectedItem = mounted.fixture.querySelector("#global_nav_courses_link").closest("li");
      const selectedSurface = mounted.fixture.querySelector("#global_nav_courses_link");
      const unselected = mounted.fixture.querySelector("#global_nav_calendar_link").closest("li");
      const selectedItemStyle = window.getComputedStyle(selectedItem);
      const selectedSurfaceStyle = window.getComputedStyle(selectedSurface);

      assert(
        hasOverlayBackground(selectedSurfaceStyle),
        "Route-selected global nav ids should receive the selected overlay even without Canvas active classes."
      );
      equal(
        selectedItemStyle.borderLeftWidth,
        "2px",
        "Route-selected global nav ids should receive the left marker."
      );
      equal(
        window.getComputedStyle(unselected).borderLeftWidth,
        "0px",
        "Unselected route ids should not inherit the selected marker."
      );
    } finally {
      document.documentElement.classList.remove("blank-canvas--nav-courses");
      mounted.cleanup();
    }
  });

  addTest("Dashboard rail tile keeps only one outer marker cue", () => {
    const mounted = mountStyledFixture(
      {
        uiLayoutMode: "editorial",
        uiPhaseTypographyReset: true,
        uiPhaseLeftRailSimplification: true
      },
      `
        <nav id="menu">
          <div class="menu-item-container ic-app-header__menu-list-item--active">
            <a id="global_nav_dashboard_link" href="/">
              <div class="menu-item-icon-container">
                <svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1 1h8v8H1z"></path></svg>
                <div class="menu-item__text">Dashboard</div>
              </div>
            </a>
          </div>
        </nav>
      `
    );

    try {
      const outerContainer = mounted.fixture.querySelector(".menu-item-container");
      const innerContainer = mounted.fixture.querySelector("#global_nav_dashboard_link .menu-item-icon-container");

      equal(
        window.getComputedStyle(outerContainer).borderLeftWidth,
        "2px",
        "The outer active rail container should keep the single selection border."
      );
      equal(
        window.getComputedStyle(innerContainer).borderLeftWidth,
        "0px",
        "The inner Dashboard icon tile should not draw a second selection border."
      );
    } finally {
      mounted.cleanup();
    }
  });

  addTest("Secondary global nav hiding catches icon-only buttons", () => {
    const fixture = createFixture(`
      <nav id="menu">
        <ul class="ic-app-header__menu-list">
          <li class="ic-app-header__menu-list-item">
            <a id="global_nav_dashboard_link" href="/" aria-label="Dashboard"></a>
          </li>
          <li class="ic-app-header__menu-list-item">
            <button id="global_nav_history_link" type="button" aria-label="History"></button>
          </li>
          <li class="ic-app-header__menu-list-item">
            <button type="button" title="Search"></button>
          </li>
          <li class="ic-app-header__menu-list-item">
            <button type="button" aria-label="Spark"></button>
          </li>
          <li class="ic-app-header__menu-list-item">
            <button type="button" aria-label="Help"></button>
          </li>
        </ul>
      </nav>
    `);
    document.body.appendChild(fixture);

    try {
      const targets = root.canvas.findSecondaryNavItems();

      equal(targets.length, 4, "Icon-only secondary rail controls should be resolved as hide targets.");
      assert(
        targets.every((target) => target.classList.contains("ic-app-header__menu-list-item")),
        "Secondary rail controls should hide their owning rail list item."
      );
      assert(
        !targets.some((target) => target.querySelector("#global_nav_dashboard_link")),
        "Primary dashboard navigation should not be hidden with secondary controls."
      );
    } finally {
      fixture.remove();
    }
  });

  addTest("Managed-hide still wins over compact left-rail layout display rules", () => {
    const mounted = mountStyledFixture(
      {
        uiLayoutMode: "editorial",
        uiPhaseTypographyReset: true,
        uiPhaseLeftRailSimplification: true
      },
      `
        <nav id="menu">
          <ul class="ic-app-header__menu-list">
            <li class="menu-item ic-app-header__menu-list-item blank-canvas--managed-hide">
              <a id="global_nav_history_link" role="button" href="#" class="ic-app-header__menu-list-link">
                <div class="menu-item-icon-container" aria-hidden="true"></div>
                <div class="menu-item__text">History</div>
              </a>
            </li>
            <li class="menu-item ic-app-header__menu-list-item">
              <a class="ic-app-header__menu-list-link blank-canvas--managed-hide" href="/accounts/1/external_tools/13001?toolId=search-13001">
                <svg class="menu-item__icon"></svg>
                <div class="menu-item__text">Search</div>
              </a>
            </li>
          </ul>
        </nav>
      `
    );

    try {
      const hiddenListItem = mounted.fixture.querySelector("#global_nav_history_link").closest("li");
      const hiddenLink = mounted.fixture.querySelector("a[href*='toolId=search']");

      equal(
        window.getComputedStyle(hiddenListItem).display,
        "none",
        "Managed hidden rail list items should not be restored by compact rail flex rules."
      );
      equal(
        window.getComputedStyle(hiddenLink).display,
        "none",
        "Managed hidden rail links should not be restored by compact rail link rules."
      );
    } finally {
      mounted.cleanup();
    }
  });

  addTest("Assignment store prefers API data after refresh", async () => {
    const originalDom = root.assignmentDom.scrapePendingAssignmentsFromDom;
    const originalApi = root.assignmentApi.fetchPendingAssignmentsFromApi;

    root.assignmentDom.scrapePendingAssignmentsFromDom = () => [
      {
        title: "DOM fallback",
        courseName: "English 101",
        dueDateText: "Fri, Apr 10",
        dueTimeText: "11:59 PM",
        dueLabel: "Due",
        dueAt: "2026-04-10T23:59:00Z",
        dueSortValue: 1,
        statusTone: "pending",
        url: "https://canvas.example.com/courses/101/assignments/7"
      }
    ];

    root.assignmentApi.fetchPendingAssignmentsFromApi = async () => [
      {
        title: "API assignment",
        courseName: "Biology 202",
        dueDateText: "Sun, Apr 12",
        dueTimeText: "5:30 PM",
        dueLabel: "Due",
        dueAt: "2026-04-12T17:30:00Z",
        dueSortValue: 2,
        statusTone: "pending",
        url: "https://canvas.example.com/courses/202/assignments/9"
      }
    ];

    root.assignments.invalidate();
    const snapshot = await root.assignments.refreshPendingAssignments({
      force: true
    });

    equal(snapshot.source, "api", "The assignment store should prefer API data when available.");
    equal(snapshot.items[0].title, "API assignment", "The assignment store should expose API results.");

    root.assignmentDom.scrapePendingAssignmentsFromDom = originalDom;
    root.assignmentApi.fetchPendingAssignmentsFromApi = originalApi;
  });

  addTest("Bootstrap critical CSS preloads key dashboard hide rules", () => {
    const cssText = root.bootstrap.buildCriticalCss({
      ...root.defaults,
      enabled: true,
      previewMode: false
    });

    assert(cssText.includes(".ic-DashboardCard__header-button-bg"), "Bootstrap CSS should hide the menu background.");
    assert(cssText.includes(".ic-DashboardCard__action-container"), "Bootstrap CSS should hide the action row.");
    assert(cssText.includes("#right-side-wrapper"), "Bootstrap CSS should preload the dashboard sidebar hide.");
  });

  addTest("Bootstrap critical CSS preloads saved course tabs on course pages", () => {
    const cssText = root.bootstrap.buildCriticalCss(
      {
        ...root.defaults,
        hiddenCourseNavItems: {
          "101": ["home", "quizzes"]
        }
      },
      {
        courseId: "101"
      }
    );

    assert(cssText.includes("/courses/101/quizzes"), "Bootstrap CSS should preload saved course tab hides.");
    assert(cssText.includes("/courses/101"), "Bootstrap CSS should preload the course home tab hide.");
  });

  addTest("Course nav hide rule resolves saved hidden tabs on course pages", () => {
    const fixture = createFixture(`
      <ul id="section-tabs">
        <li><a href="/courses/101">Home</a></li>
        <li><a href="/courses/101/quizzes">Quizzes</a></li>
      </ul>
    `);

    const rule = root.ruleEngine.domRules.find(({ id }) => id === "hideCourseNavTabs");
    const targets = rule.getTargets(
      {
        hiddenCourseNavItems: {
          "101": ["quizzes"]
        }
      },
      {
        isCourse: true,
        courseId: "101"
      },
      fixture
    );

    equal(targets.length, 1, "Saved hidden course tabs should resolve to a DOM target.");
    equal(targets[0].textContent.trim(), "Quizzes", "The course nav hide rule should target the matching tab.");
  });

  addTest("Dashboard menu-hiding rules remove the menu background circle", () => {
    const rule = root.ruleEngine.cssRules.find(({ id }) => id === "hideCourseCardMenu");
    const selectors = root.ruleEngine.resolveSelectors(
      rule,
      {
        enabled: true,
        hideCourseCardMenu: true
      },
      {
        isDashboard: true
      }
    );

    assert(selectors.includes(".ic-DashboardCard__header-button-bg"), "The menu background circle should be hidden.");
  });

  addTest("Dashboard cards render split assignment hierarchy rows", () => {
    const widget = root.dashboardView.createWidget();
    document.body.appendChild(widget);
    try {
      equal(widget.querySelector("h2").textContent, "Assignments", "The dashboard heading should be renamed.");
      root.dashboardView.syncPresentationState(widget, {
        uiLayoutMode: "editorial",
        uiPhaseAgendaList: true,
        uiPhaseAssignmentHierarchy: true
      });

      root.dashboardView.renderItems(widget, {
        status: "ready",
        source: "api",
        items: [
          {
            title: "Essay Draft",
            courseName: "English 101",
            displayTitle: "English 101 - Essay Draft",
            dueDateText: "Fri, Apr 10",
            dueTimeText: "11:59 PM",
            dueSummaryText: "Fri, Apr 10 at 11:59 PM",
            dueLabel: "Missing",
            statusTone: "missing",
            url: "https://canvas.example.com/courses/101/assignments/7"
          }
        ]
      }, {
        uiLayoutMode: "editorial",
        uiPhaseAgendaList: true,
        uiPhaseAssignmentHierarchy: true
      });

      equal(
        widget.querySelectorAll(".blank-canvas__todo-item").length,
        1,
        "The dashboard should render one assignment card."
      );
      equal(
        widget.querySelector(".blank-canvas__todo-title").textContent,
        "Essay Draft",
        "The dashboard card should render the assignment title as the primary line."
      );
      equal(
        widget.querySelector(".blank-canvas__todo-course").textContent,
        "English 101",
        "The dashboard card should render course metadata separately."
      );
      equal(
        widget.querySelector(".blank-canvas__todo-status").textContent,
        "Missing",
        "The dashboard card should render status metadata separately from the due summary."
      );
      equal(
        widget.querySelector(".blank-canvas__todo-due-summary").textContent,
        "Fri, Apr 10 at 11:59 PM",
        "The dashboard card should render a one-line due summary."
      );
      equal(
        widget.dataset.rowVariant,
        "hierarchy",
        "Phase 5 should switch the widget into hierarchy rows."
      );
      equal(
        widget.querySelector(".blank-canvas__todo-count").textContent,
        "1 Assignment",
        "The dashboard count should use the cleaned assignment label."
      );
      equal(
        widget.querySelector(".blank-canvas__todo-create").textContent,
        "+",
        "The dashboard widget should expose the compact custom-assignment launcher."
      );
      /*
      equal(
        widget.querySelector(".blank-canvas__todo-summary-score").textContent,
        "Busy 28 · Light",
        "Phase 6 should render a compact busy score above the assignment list."
      );
      assert(
        widget.querySelector(".blank-canvas__todo-share-toggle"),
        "Phase 6 should render a share action in the summary strip."
      );
      */
    } finally {
      widget.remove();
    }
  });

  addTest("Dashboard custom rows render edit and delete actions only for custom items", () => {
    const widget = root.dashboardView.createWidget();
    document.body.appendChild(widget);
    try {
      root.dashboardView.syncPresentationState(widget, {
        uiLayoutMode: "editorial",
        uiPhaseAgendaList: true,
        uiPhaseAssignmentHierarchy: true
      });

      root.dashboardView.renderItems(widget, {
        status: "ready",
        source: "api",
        items: [
          {
            title: "Custom reading",
            courseName: "General",
            dueSummaryText: "Mon, Apr 20 at 5:00 PM",
            dueLabel: "Due",
            statusTone: "pending",
            source: "custom",
            customAssignmentId: "custom-1",
            url: ""
          },
          {
            title: "Canvas assignment",
            courseName: "English 101",
            dueSummaryText: "Fri, Apr 10 at 11:59 PM",
            dueLabel: "Due",
            statusTone: "pending",
            source: "api",
            url: "https://canvas.example.com/courses/101/assignments/7"
          }
        ]
      }, {
        uiLayoutMode: "editorial",
        uiPhaseAgendaList: true,
        uiPhaseAssignmentHierarchy: true
      });

      equal(
        widget.querySelectorAll(".blank-canvas__todo-item[data-source='custom'] .blank-canvas__todo-action").length,
        3,
        "Custom rows should expose mark-as-done, edit, and delete controls."
      );
      equal(
        widget.querySelectorAll(".blank-canvas__todo-item[data-source='api'] .blank-canvas__todo-action").length,
        1,
        "Canvas rows should expose only the shared mark-as-done toggle."
      );
      equal(
        widget.querySelector(".blank-canvas__todo-item[data-source='custom'] [data-action='toggle-assignment-done']").textContent,
        "Mark as done",
        "Custom rows should expose the completion toggle."
      );
      equal(
        widget.querySelector(".blank-canvas__todo-item[data-source='custom'] .blank-canvas__todo-action").textContent,
        "Mark as done",
        "Custom rows should show mark-as-done as the first action."
      );
    } finally {
      widget.remove();
    }
  });

  addTest("Completed custom rows stay visible and highlight their completion toggle", () => {
    const widget = root.dashboardView.createWidget();
    document.body.appendChild(widget);
    try {
      root.dashboardView.syncPresentationState(widget, {
        uiLayoutMode: "editorial",
        uiPhaseAgendaList: true,
        uiPhaseAssignmentHierarchy: true
      });

      root.dashboardView.renderItems(widget, {
        status: "ready",
        source: "api",
        items: [
          {
            title: "Custom reading",
            courseName: "General",
            dueSummaryText: "Mon, Apr 20 at 5:00 PM",
            dueLabel: "Done",
            statusTone: "done",
            source: "custom",
            customAssignmentId: "custom-1",
            completedAt: "2026-04-14T02:00:00.000Z",
            url: ""
          }
        ]
      });

      const row = widget.querySelector(".blank-canvas__todo-item[data-source='custom']");
      const action = row.querySelector("[data-action='toggle-assignment-done']");
      equal(row.dataset.completed, "true", "Completed custom rows should stay rendered.");
      equal(action.dataset.completed, "true", "The completion toggle should reflect the completed state.");
      equal(action.getAttribute("aria-pressed"), "true", "The completion toggle should expose its active state.");
      equal(
        widget.querySelector(".blank-canvas__todo-count").textContent,
        "0 Assignments",
        "Completed custom rows should no longer count toward the assignment counter."
      );
      equal(
        widget.querySelector(".blank-canvas__todo-status").textContent,
        "Done",
        "Completed custom rows should expose a Done status."
      );
    } finally {
      widget.remove();
    }
  });

  addTest("Dashboard widget context menu hides native Canvas assignments", async () => {
    await resetIgnoredAssignments();
    const widget = root.dashboardView.createWidget();
    document.body.appendChild(widget);
    const originalConfirm = window.confirm;

    try {
      root.dashboardView.syncPresentationState(widget, {
        uiLayoutMode: "editorial",
        uiPhaseAgendaList: true,
        uiPhaseAssignmentHierarchy: true
      });

      root.dashboardView.renderItems(
        widget,
        {
          status: "ready",
          source: "api",
          items: [
            {
              title: "Canvas assignment",
              courseId: "101",
              courseName: "English 101",
              dueSummaryText: "Fri, Apr 10 at 11:59 PM",
              dueLabel: "Due",
              statusTone: "pending",
              source: "api",
              url: "https://canvas.example.com/courses/101/assignments/7"
            }
          ]
        },
        {
          uiLayoutMode: "editorial",
          uiPhaseAgendaList: true,
          uiPhaseAssignmentHierarchy: true
        }
      );

      window.confirm = () => true;
      const row = widget.querySelector(".blank-canvas__todo-item[data-source='api']");
      let prevented = false;
      await root.dashboardWidgetActions.handleWidgetContextMenu({
        target: row,
        preventDefault() {
          prevented = true;
        }
      });

      const ignoredKeys = await root.ignoredAssignments.listIgnoredAssignmentKeys();
      equal(ignoredKeys.length, 1, "Right-click hiding should persist one ignored native assignment key.");
      assert(prevented, "Right-click hiding should suppress the default context menu.");
    } finally {
      window.confirm = originalConfirm;
      widget.remove();
      await resetIgnoredAssignments();
    }
  });

  addTest("Dashboard done toggles force-refresh assignments without invalidating first", async () => {
    const originalToggleAssignmentDone = root.completedAssignments.toggleAssignmentDone;
    const originalRefreshPendingAssignments = root.assignments.refreshPendingAssignments;
    const originalInvalidate = root.assignments.invalidate;
    const originalRenderer = root.renderer;
    const originalGetSettings = root.storage.getSettings;
    const calls = [];
    const button = document.createElement("button");

    button.type = "button";
    button.dataset.action = "toggle-assignment-done";
    button.dataset.assignmentKey = "assignment:101:7";
    document.body.appendChild(button);

    root.completedAssignments.toggleAssignmentDone = async () => {
      calls.push("toggle");
      return {
        key: "assignment:101:7",
        completedAt: "2026-04-14T02:00:00.000Z"
      };
    };
    root.assignments.refreshPendingAssignments = async (options = {}) => {
      calls.push(`refresh:${options.force === true}`);
      return {
        items: [],
        source: "api",
        sourceCounts: {},
        status: "ready"
      };
    };
    root.assignments.invalidate = () => {
      calls.push("invalidate");
    };
    root.renderer = root.renderer || {};
    root.renderer.render = () => {
      calls.push("render");
      return {};
    };
    root.storage.getSettings = async () => ({ ...root.defaults });

    try {
      await root.dashboardWidgetActions.handleWidgetClick({
        target: button,
        preventDefault() {},
        stopPropagation() {}
      });

      equal(calls.includes("invalidate"), false, "Done toggles should not invalidate the assignment store before refreshing.");
      equal(calls[0], "toggle", "Done toggles should persist the completion state first.");
      equal(calls[1], "refresh:true", "Done toggles should force-refresh assignments after persisting.");
      equal(calls[2], "render", "Done toggles should rerender after the forced refresh settles.");
    } finally {
      root.completedAssignments.toggleAssignmentDone = originalToggleAssignmentDone;
      root.assignments.refreshPendingAssignments = originalRefreshPendingAssignments;
      root.assignments.invalidate = originalInvalidate;
      root.renderer = originalRenderer;
      root.storage.getSettings = originalGetSettings;
      button.remove();
    }
  });

  addTest("Custom assignment modal mounts on demand and exposes course options", async () => {
    root.customAssignmentModal.sync({
      enabled: true
    });

    try {
      await root.customAssignmentModal.openCreate();
      const snapshot = root.customAssignmentModal.getSnapshot();

      assert(snapshot.mounted, "The dashboard custom-assignment modal should mount when enabled.");
      assert(snapshot.open, "The custom-assignment modal should open in create mode.");
      assert(snapshot.courseOptionCount >= 1, "The custom-assignment modal should include at least the General option.");
      equal(snapshot.timeValue, "11:59 PM", "The custom modal should default the time field to 11:59 PM.");
      equal(snapshot.selectedDueDate, "", "New custom assignments should start with no selected due date.");
      equal(
        document.querySelector("#blank-canvas-custom-assignment-modal select").value,
        "",
        "New custom assignments should start with the class placeholder selected."
      );
      assert(
        document.querySelector("#blank-canvas-custom-assignment-modal .blank-canvas__custom-modal-calendar-days"),
        "The custom modal should render the custom calendar grid."
      );
    } finally {
      root.customAssignmentModal.teardown();
    }
  });

  addTest("Custom assignment schedule helper round-trips split date and time fields", () => {
    const schedule = root.customAssignmentSchedule.create({
      modalId: "test-custom-assignment-modal"
    });
    document.body.appendChild(schedule.root);

    try {
      const meridiemField = schedule.root.querySelector("#test-custom-assignment-modal-time-meridiem");
      equal(meridiemField.tagName, "SELECT", "The schedule helper should render a compact AM/PM select.");

      schedule.applyDraft({
        dueDate: "2026-04-20",
        dueTime: "9:05 AM"
      });

      const draft = schedule.readDraft();
      const snapshot = schedule.getSnapshot();

      equal(draft.dueDate, "2026-04-20", "The schedule helper should preserve the selected due date.");
      equal(draft.dueTime, "9:05 AM", "The schedule helper should rebuild the compact time string.");
      equal(snapshot.timeValue, "9:05 AM", "The schedule snapshot should expose the merged time value.");

      schedule.root.querySelector("#test-custom-assignment-modal-date-button").click();
      equal(schedule.getSnapshot().calendarOpen, true, "The schedule helper should open its calendar from the date trigger.");
    } finally {
      schedule.destroy();
    }
  });

  addTest("Dashboard widget snapshot tracks fallback and normalized title counts", () => {
    const widget = root.dashboardView.createWidget();
    document.body.appendChild(widget);
    try {
      root.dashboardView.syncPresentationState(widget, {
        uiLayoutMode: "editorial",
        uiPhaseAgendaList: true,
        uiPhaseAssignmentHierarchy: true
      });

      root.dashboardView.renderItems(widget, {
        status: "ready",
        source: "api",
        items: [
          {
            title: "Essay Draft",
            courseName: "Course 101",
            dueSummaryText: "Fri, Apr 10 at 11:59 PM",
            dueLabel: "Due",
            statusTone: "pending",
            url: "https://canvas.example.com/courses/101/assignments/7"
          },
          {
            title: "English 101 - Lab 1",
            courseName: "English 101",
            dueSummaryText: "Sun, Apr 12 at 5:30 PM",
            dueLabel: "Late",
            statusTone: "late",
            url: "https://canvas.example.com/courses/101/assignments/8"
          }
        ]
      }, {
        uiLayoutMode: "editorial",
        uiPhaseAgendaList: true,
        uiPhaseAssignmentHierarchy: true
      });

      const snapshot = root.dashboardView.getSnapshot();
      equal(snapshot.fallbackCourseCount, 1, "Widget diagnostics should report fallback course rows.");
      equal(snapshot.normalizedTitleCount, 1, "Widget diagnostics should report normalized titles.");
    } finally {
      widget.remove();
    }
  });

  addTest("Custom assignment modal styles keep action buttons rounded", () => {
    const cssText = root.customAssignmentModal.getStyles();
    assert(
      cssText.includes(".blank-canvas__custom-modal-save") &&
        cssText.includes("border-radius: var(--blank-canvas-button-radius)"),
      "The custom assignment modal should keep rounded save/cancel/close controls."
    );
  });

  /*
  addTest("Phase 6 busy index model maps assignment urgency into stable bands", () => {
    const calm = root.dashboardSummaryModel.buildSummary([]);
    const light = root.dashboardSummaryModel.buildSummary([
      {
        title: "Reading",
        dueAt: "2026-04-14T23:59:00.000Z",
        dueSortValue: new Date("2026-04-14T23:59:00.000Z").getTime(),
        statusTone: "pending"
      },
      {
        title: "Notes",
        dueAt: "2026-04-15T23:59:00.000Z",
        dueSortValue: new Date("2026-04-15T23:59:00.000Z").getTime(),
        statusTone: "pending"
      }
    ], {
      now: "2026-04-14T18:00:00.000Z"
    });
    const busy = root.dashboardSummaryModel.buildSummary([
      {
        title: "Quiz",
        dueAt: "2026-04-14T23:59:00.000Z",
        dueSortValue: new Date("2026-04-14T23:59:00.000Z").getTime(),
        statusTone: "pending"
      },
      {
        title: "Lab",
        dueAt: "2026-04-14T22:00:00.000Z",
        dueSortValue: new Date("2026-04-14T22:00:00.000Z").getTime(),
        statusTone: "pending"
      },
      {
        title: "Essay",
        dueAt: "2026-04-14T20:00:00.000Z",
        dueSortValue: new Date("2026-04-14T20:00:00.000Z").getTime(),
        statusTone: "pending"
      }
    ], {
      now: "2026-04-14T18:00:00.000Z"
    });
    const heavy = root.dashboardSummaryModel.buildSummary([
      {
        title: "Problem set",
        dueAt: "2026-04-14T23:59:00.000Z",
        dueSortValue: new Date("2026-04-14T23:59:00.000Z").getTime(),
        statusTone: "pending"
      },
      {
        title: "Writeup",
        dueAt: "2026-04-14T21:00:00.000Z",
        dueSortValue: new Date("2026-04-14T21:00:00.000Z").getTime(),
        statusTone: "pending"
      },
      {
        title: "Report",
        dueAt: "2026-04-14T22:30:00.000Z",
        dueSortValue: new Date("2026-04-14T22:30:00.000Z").getTime(),
        statusTone: "pending"
      },
      {
        title: "Checklist",
        dueAt: "2026-04-15T23:59:00.000Z",
        dueSortValue: new Date("2026-04-15T23:59:00.000Z").getTime(),
        statusTone: "pending"
      }
    ], {
      now: "2026-04-14T18:00:00.000Z"
    });
    const crunch = root.dashboardSummaryModel.buildSummary([
      {
        title: "Project",
        statusTone: "missing",
        dueAt: "2026-04-10T23:59:00.000Z",
        dueSortValue: new Date("2026-04-10T23:59:00.000Z").getTime()
      },
      {
        title: "Lab",
        statusTone: "overdue",
        dueAt: "2026-04-11T23:59:00.000Z",
        dueSortValue: new Date("2026-04-11T23:59:00.000Z").getTime()
      },
      {
        title: "Essay",
        statusTone: "pending",
        dueAt: "2026-04-14T23:59:00.000Z",
        dueSortValue: new Date("2026-04-14T23:59:00.000Z").getTime()
      },
      {
        title: "Quiz",
        statusTone: "pending",
        dueAt: "2026-04-15T23:59:00.000Z",
        dueSortValue: new Date("2026-04-15T23:59:00.000Z").getTime()
      }
    ], {
      now: "2026-04-14T18:00:00.000Z"
    });

    equal(calm.busyIndex, 0, "No pending work should produce a 0 busy index.");
    equal(calm.busyLabel, "Calm", "A 0 busy index should be labeled Calm.");
    equal(light.busyLabel, "Light", "A small amount of pending work should stay in the Light band.");
    equal(busy.busyLabel, "Busy", "Mid-range pending work should map into the Busy band.");
    equal(heavy.busyLabel, "Heavy", "Dense upcoming work should map into the Heavy band.");
    equal(crunch.busyLabel, "Crunch", "Missing and overdue work should saturate into the Crunch band.");
  });

  addTest("Phase 6 next due selection prefers the earliest merged upcoming item", () => {
    const summary = root.dashboardSummaryModel.buildSummary([
      {
        title: "Custom prep",
        primaryTitle: "Custom prep",
        secondaryCourseName: "General",
        dueAt: "2026-04-18T17:00:00.000Z",
        dueTimeText: "5:00 PM",
        dueDateText: "Sat, Apr 18",
        dueSummaryText: "Sat, Apr 18 at 5:00 PM",
        dueSortValue: new Date("2026-04-18T17:00:00.000Z").getTime(),
        statusTone: "pending",
        source: "custom"
      },
      {
        title: "Canvas quiz",
        primaryTitle: "Canvas quiz",
        secondaryCourseName: "Math 3D",
        dueAt: "2026-04-15T23:59:00.000Z",
        dueTimeText: "11:59 PM",
        dueDateText: "Wed, Apr 15",
        dueSummaryText: "Wed, Apr 15 at 11:59 PM",
        dueSortValue: new Date("2026-04-15T23:59:00.000Z").getTime(),
        statusTone: "pending",
        source: "api"
      }
    ], {
      now: "2026-04-14T18:00:00.000Z"
    });

    equal(summary.nextDueTitle, "Canvas quiz", "The summary should use the earliest due assignment as the next due item.");
    equal(summary.nextDueCourse, "Math 3D", "The next due summary should preserve course metadata.");
  });

  addTest("Phase 6 summary strip renders only when the phase is enabled", () => {
    const widget = root.dashboardView.createWidget();
    document.body.appendChild(widget);
    try {
      root.dashboardView.syncPresentationState(widget, {
        uiLayoutMode: "editorial",
        uiPhaseAgendaList: true,
        uiPhaseAssignmentHierarchy: true,
        uiPhaseTodayStrip: false
      });

      root.dashboardView.renderItems(widget, {
        status: "ready",
        source: "api",
        items: []
      }, {
        uiLayoutMode: "editorial",
        uiPhaseAgendaList: true,
        uiPhaseAssignmentHierarchy: true,
        uiPhaseTodayStrip: false
      });

      equal(widget.querySelector(".blank-canvas__todo-summary"), null, "Phase 6 should not render the summary strip while disabled.");

      root.dashboardView.renderItems(widget, {
        status: "ready",
        source: "api",
        items: []
      }, {
        uiLayoutMode: "editorial",
        uiPhaseAgendaList: true,
        uiPhaseAssignmentHierarchy: true,
        uiPhaseTodayStrip: true
      });

      assert(widget.querySelector(".blank-canvas__todo-summary"), "Phase 6 should render the summary strip when enabled.");
    } finally {
      widget.remove();
    }
  });

  addTest("Phase 6 empty-state summary stays calm and shows no due-soon text", () => {
    const summary = root.dashboardSummaryModel.buildSummary([]);
    equal(summary.busyIndex, 0, "The empty-state summary should be completely calm.");
    equal(summary.busyLabel, "Calm", "The empty-state summary should use the Calm label.");
    equal(summary.nextDueText, "Nothing due soon", "The empty-state summary should avoid fake urgency.");
  });

  addTest("Phase 6 share card payload includes score, next due, and timestamp", () => {
    const payload = root.dashboardShareCard.buildPayload({
      busyIndex: 64,
      busyLabel: "Heavy",
      nextDueTitle: "Lab 4",
      nextDueCourse: "Physics 7E",
      nextDueSummary: "Today · 11:59 PM",
      updatedAt: "2026-04-14T18:00:00.000Z"
    });

    equal(payload.busyIndex, 64, "The share payload should include the busy score.");
    equal(payload.busyLabel, "Heavy", "The share payload should include the busy label.");
    equal(payload.nextDueTitle, "Lab 4", "The share payload should include the next due title.");
    assert(payload.updatedLabel.includes("2026"), "The share payload should include a formatted updated timestamp.");
  });

  addTest("Phase 6 share copy falls back cleanly when clipboard image support is unavailable", async () => {
    const widget = root.dashboardView.createWidget();
    document.body.appendChild(widget);
    const originalDownload = root.dashboardShareCard.downloadImage;
    const originalCopy = root.dashboardShareCard.copyImage;
    let fallbackDownloads = 0;

    try {
      root.dashboardSummaryRenderer.renderSummary(widget, {
        timeframeLabel: "Today",
        busyIndex: 64,
        busyLabel: "Heavy",
        urgentCount: 2,
        overdueCount: 1,
        nextDueTitle: "Lab 4",
        nextDueCourse: "Physics 7E",
        nextDueSummary: "Today · 11:59 PM",
        nextDueText: "Lab 4 · Today · 11:59 PM",
        updatedAt: "2026-04-14T18:00:00.000Z"
      }, {
        enabled: true
      });

      root.dashboardSummaryRenderer.toggleShareSurface(widget);
      root.dashboardShareCard.copyImage = async () => ({
        ok: false,
        fallback: "download"
      });
      root.dashboardShareCard.downloadImage = async () => {
        fallbackDownloads += 1;
        return {
          ok: true
        };
      };

      await root.dashboardSummaryRenderer.copyShareImage(widget);

      equal(fallbackDownloads, 1, "Summary share copy should fall back to a PNG download when clipboard image support is unavailable.");
      assert(
        widget.querySelector(".blank-canvas__todo-share-message").textContent.includes("download"),
        "The summary share surface should explain when it used the download fallback."
      );
    } finally {
      root.dashboardShareCard.copyImage = originalCopy;
      root.dashboardShareCard.downloadImage = originalDownload;
      widget.remove();
    }
  });

  addTest("Phase 6 summary styles include a narrow-width stacked layout", () => {
    const cssText = root.dashboardStyles.getStyles({
      uiLayoutMode: "editorial",
      uiPhaseAgendaList: true,
      uiPhaseAssignmentHierarchy: true,
      uiPhaseTodayStrip: true
    });

    assert(cssText.includes(".blank-canvas__todo-summary"), "Dashboard styles should include summary strip rules.");
    assert(cssText.includes("grid-template-columns: 1fr;"), "Dashboard styles should stack the summary strip on narrower widths.");
  });

  });
  */

  addTest("Dashboard layout mounts Assignments and Classes in order", () => {
    const fixture = createFixture(`
      <div class="ic-DashboardLayout__Main" style="width: 1400px;">
        <section id="DashboardCard_Container"></section>
      </div>
    `);
    document.body.appendChild(fixture);

    try {
      const mount = {
        container: fixture.querySelector(".ic-DashboardLayout__Main"),
        anchor: fixture.querySelector("#DashboardCard_Container")
      };
      const rowItems = [
        {
          primaryTitle: "Essay Draft",
          secondaryCourseName: "English 101",
          dueSummaryText: "Fri, Apr 10 at 11:59 PM",
          statusLabel: "Missing",
          statusTone: "missing",
          dueAt: "2026-04-10T23:59:00.000Z",
          dueSortValue: new Date("2026-04-10T23:59:00.000Z").getTime(),
          url: "https://canvas.example.com/courses/101/assignments/7"
        }
      ];

      root.dashboardLayout.sync({
        mount,
        settings: {
          uiLayoutMode: "editorial",
          uiPhaseAgendaList: true,
          uiPhaseAssignmentHierarchy: true
        },
        assignmentSnapshot: {
          status: "ready",
          source: "api",
          items: rowItems
        },
        rowItems
      });

      const layoutSnapshot = root.dashboardLayout.getSnapshot();
      equal(
        layoutSnapshot.sections.join(","),
        "assignments,classes-anchor",
        "The dashboard layout should expose the ordered dashboard sections."
      );
      equal(layoutSnapshot.layoutMode, "split", "Wide dashboard layouts should use the split mode.");
      equal(layoutSnapshot.classesInRightColumn, true, "Wide dashboard layouts should place classes in the right column.");
      equal(layoutSnapshot.leftColumnMounted, true, "Wide dashboard layouts should mount the assignments column.");
      equal(layoutSnapshot.rightColumnMounted, true, "Wide dashboard layouts should mount the classes column.");
      equal(
        fixture.querySelector("#blank-canvas-dashboard-sections").nextElementSibling.id,
        "DashboardCard_Container",
        "The native classes section should remain after the extension-owned sections."
      );
    } finally {
      root.dashboard.teardown();
      fixture.remove();
    }
  });

  addTest("Assignments widget remains the only extension-mounted dashboard section", () => {
    const fixture = createFixture(`
      <div class="ic-DashboardLayout__Main" style="width: 1400px;">
        <section id="DashboardCard_Container"></section>
      </div>
    `);
    document.body.appendChild(fixture);

    try {
      root.dashboardLayout.sync({
        mount: {
          container: fixture.querySelector(".ic-DashboardLayout__Main"),
          anchor: fixture.querySelector("#DashboardCard_Container")
        },
        settings: {
          uiLayoutMode: "editorial",
          uiPhaseAgendaList: true,
          uiPhaseAssignmentHierarchy: true
        },
        assignmentSnapshot: {
          status: "ready",
          source: "api",
          items: []
        },
        rowItems: []
      });

      equal(
        fixture.querySelector("#blank-canvas-dashboard-todo .blank-canvas__today-strip"),
        null,
        "The assignments widget should not contain a rolled-back today-strip section."
      );
      equal(
        fixture.querySelector("#blank-canvas-dashboard-today"),
        null,
        "The dashboard should not mount a standalone today-strip section."
      );
    } finally {
      root.dashboard.teardown();
      fixture.remove();
    }
  });

  addTest("Dashboard diagnostics report section order without a today strip", () => {
    const fixture = createFixture(`
      <div class="ic-DashboardLayout__Main" style="width: 1400px;">
        <section id="DashboardCard_Container"></section>
      </div>
    `);
    document.body.appendChild(fixture);

    const originalGetPageContext = root.canvas.getPageContext;
    const originalIsCanvasLikePage = root.canvas.isCanvasLikePage;

    try {
      root.canvas.getPageContext = () => ({
        path: "/",
        isDashboard: true,
        isCourse: false,
        courseId: "",
        globalNavKey: "dashboard"
      });
      root.canvas.isCanvasLikePage = () => true;

      root.dashboardLayout.sync({
        mount: {
          container: fixture.querySelector(".ic-DashboardLayout__Main"),
          anchor: fixture.querySelector("#DashboardCard_Container")
        },
        settings: {
          ...root.defaults,
          enabled: true,
          showDashboardTodoList: true,
          uiLayoutMode: "editorial",
          uiPhaseAgendaList: true,
          uiPhaseAssignmentHierarchy: true
        },
        assignmentSnapshot: {
          status: "ready",
          source: "api",
          items: []
        },
        rowItems: []
      });

      const report = root.diagnostics.buildReport({
        ...root.defaults,
        enabled: true,
        showDashboardTodoList: true,
        uiLayoutMode: "editorial",
        uiPhaseAgendaList: true,
        uiPhaseAssignmentHierarchy: true
      });

      equal(
        report.dashboardLayout.sections.join(","),
        "assignments,classes-anchor",
        "Diagnostics should report the dashboard section order."
      );
      equal(report.dashboardTodo.classesAnchorFound, true, "Dashboard snapshots should report the classes anchor.");
      equal(report.dashboardLayout.layoutMode, "split", "Diagnostics should report the active dashboard layout mode.");
      equal(report.dashboardLayout.classesInRightColumn, true, "Diagnostics should report when classes are mounted in the right column.");
    } finally {
      root.canvas.getPageContext = originalGetPageContext;
      root.canvas.isCanvasLikePage = originalIsCanvasLikePage;
      root.dashboard.teardown();
      fixture.remove();
    }
  });

  addTest("Phase 6.5 diagnostics report the minimalist two-block dashboard state", () => {
    const fixture = createFixture(`
      <div class="ic-DashboardLayout__Main" style="width: 1400px;">
        <header class="ic-Dashboard-header"><h1>Dashboard</h1></header>
        <section id="DashboardCard_Container">
          <article class="ic-DashboardCard">
            <div class="ic-DashboardCard__header_content">
              <a class="ic-DashboardCard__link" href="/courses/101">English 101</a>
            </div>
          </article>
        </section>
      </div>
    `);
    document.body.appendChild(fixture);

    const originalGetPageContext = root.canvas.getPageContext;
    const originalIsCanvasLikePage = root.canvas.isCanvasLikePage;
    const settings = {
      ...root.defaults,
      enabled: true,
      showDashboardTodoList: true,
      uiLayoutMode: "editorial",
      uiPhaseTypographyReset: true,
      uiPhaseDashboardShell: true,
      uiPhaseAgendaList: true,
      uiPhaseAssignmentHierarchy: true,
      uiPhaseDashboardUiOverhaul: true
    };

    try {
      root.canvas.getPageContext = () => ({
        path: "/",
        pageType: "dashboard",
        pageFamily: "dashboard",
        pageRoutePattern: "/dashboard",
        isDashboard: true,
        isCourse: false,
        courseId: "",
        globalNavKey: "dashboard"
      });
      root.canvas.isCanvasLikePage = () => true;
      root.themeStyles.setRootClasses(settings);

      root.dashboardLayout.sync({
        mount: {
          container: fixture.querySelector(".ic-DashboardLayout__Main"),
          anchor: fixture.querySelector("#DashboardCard_Container")
        },
        settings,
        assignmentSnapshot: {
          status: "ready",
          source: "api",
          items: []
        },
        rowItems: []
      });

      const report = root.diagnostics.buildReport(settings);
      equal(report.designSystem.phaseDashboardUiOverhaulEnabled, true, "Diagnostics should report the Phase 6.5 flag.");
      equal(report.designSystem.dashboardUiOverhaulVisualModeActive, true, "Diagnostics should report active dashboard visual mode.");
      equal(report.designSystem.dashboardTwoBlockLayoutActive, true, "Diagnostics should report the two-block dashboard layout.");
      equal(report.designSystem.assignmentBlockMounted, true, "Diagnostics should report the assignments block.");
      equal(report.designSystem.classesBlockMounted, true, "Diagnostics should report the classes block.");
      assert(
        typeof report.designSystem.hasHorizontalOverflow === "boolean",
        "Diagnostics should expose whether the dashboard is horizontally overflowing."
      );
      equal(
        fixture.querySelector("#blank-canvas-dashboard-todo .blank-canvas__today-strip"),
        null,
        "The Phase 6.5 dashboard should not reintroduce the rolled-back today strip."
      );
    } finally {
      root.canvas.getPageContext = originalGetPageContext;
      root.canvas.isCanvasLikePage = originalIsCanvasLikePage;
      root.themeStyles.clearRootUiState();
      root.dashboard.teardown();
      fixture.remove();
    }
  });

  addTest("Classes lift Canvas inline course colors into flow-button accent variables", () => {
    const fixture = createFixture(`
      <section id="DashboardCard_Container">
        <article class="ic-DashboardCard">
          <div class="ic-DashboardCard__header_content">
            <a class="ic-DashboardCard__link" href="/courses/101">
              <span style="color: rgb(203, 63, 119);">EECS 70A/70LA</span>
            </a>
          </div>
        </article>
      </section>
    `);
    document.body.appendChild(fixture);

    try {
      root.dashboardStyles.syncClassCardAccents(fixture);
      const card = fixture.querySelector(".ic-DashboardCard");
      equal(
        card.style.getPropertyValue("--blank-canvas-class-accent").trim(),
        "rgb(203, 63, 119)",
        "Class cards should adopt the live Canvas course color as their accent."
      );
      equal(
        card.style.getPropertyValue("--blank-canvas-class-accent-soft").trim(),
        "rgba(203, 63, 119, 0.12)",
        "Class cards should derive a soft accent fill from the Canvas course color."
      );
      equal(
        card.style.getPropertyValue("--blank-canvas-class-accent-border").trim(),
        "rgba(203, 63, 119, 0.34)",
        "Class cards should derive a border accent from the Canvas course color."
      );
    } finally {
      fixture.remove();
    }
  });

  addTest("Classes keep Canvas inline accents even when computed text color turns white", () => {
    const fixture = createFixture(`
      <section id="DashboardCard_Container">
        <article class="ic-DashboardCard">
          <div class="ic-DashboardCard__header_content">
            <a class="ic-DashboardCard__link" href="/courses/101">
              <h2 class="ic-DashboardCard__header-title">
                <span style="color: rgb(203, 63, 119);">EECS 70A/70LA</span>
              </h2>
            </a>
          </div>
        </article>
      </section>
    `);
    const override = document.createElement("style");
    override.textContent = `
      #DashboardCard_Container .ic-DashboardCard__header-title span {
        color: white !important;
      }
    `;
    document.head.appendChild(override);
    document.body.appendChild(fixture);

    try {
      root.dashboardStyles.syncClassCardAccents(fixture);
      const card = fixture.querySelector(".ic-DashboardCard");
      equal(
        card.style.getPropertyValue("--blank-canvas-class-accent").trim(),
        "rgb(203, 63, 119)",
        "Class cards should prefer Canvas' inline color over a transient computed white text state."
      );
      equal(
        card.style.getPropertyValue("--blank-canvas-class-accent-border").trim(),
        "rgba(203, 63, 119, 0.34)",
        "Derived class-card borders should still come from the stable inline Canvas accent."
      );
    } finally {
      fixture.remove();
      override.remove();
    }
  });

  addTest("Completed native rows stay visible and no longer count toward active assignments", () => {
    const widget = root.dashboardView.createWidget();
    document.body.appendChild(widget);
    try {
      root.dashboardView.syncPresentationState(widget, {
        uiLayoutMode: "editorial",
        uiPhaseAgendaList: true,
        uiPhaseAssignmentHierarchy: true
      });

      root.dashboardView.renderItems(widget, {
        status: "ready",
        source: "api",
        items: [
          {
            title: "Canvas assignment",
            courseId: "101",
            courseName: "English 101",
            dueSummaryText: "Fri, Apr 10 at 11:59 PM",
            dueLabel: "Done",
            statusTone: "done",
            source: "api",
            completedAt: "2026-04-14T02:00:00.000Z",
            url: "https://canvas.example.com/courses/101/assignments/7"
          }
        ]
      });

      const row = widget.querySelector(".blank-canvas__todo-item[data-source='api']");
      const action = row.querySelector("[data-action='toggle-assignment-done']");
      equal(row.dataset.completed, "true", "Completed native rows should stay rendered.");
      equal(action.dataset.completed, "true", "Native completion toggles should reflect the completed state.");
      equal(
        widget.querySelector(".blank-canvas__todo-count").textContent,
        "0 Assignments",
        "Completed native rows should no longer count toward the assignment counter."
      );
    } finally {
      widget.remove();
    }
  });

  addTest("Classes keep a fixed left-aligned text lane and ellipsize inside it", () => {
    const visualCss = root.dashboardStyles.getStyles({
      ...root.defaults,
      enabled: true,
      uiLayoutMode: "editorial",
      uiPhaseAgendaList: true,
      uiPhaseAssignmentHierarchy: true,
      uiPhaseDashboardUiOverhaul: true
    });

    assert(
      visualCss.includes(".ic-DashboardCard__header_content") &&
        visualCss.includes("--blank-canvas-class-pill-padding-inline") &&
        visualCss.includes("padding: 18px var(--blank-canvas-class-pill-padding-inline) !important;") &&
        visualCss.includes("padding-right: var(--blank-canvas-class-pill-arrow-gutter) !important;") &&
        visualCss.includes("background: transparent !important;") &&
        visualCss.includes("max-width: 100% !important;") &&
        visualCss.includes("text-overflow: ellipsis !important;") &&
        visualCss.includes("text-align: left !important;") &&
        visualCss.includes("justify-content: flex-start !important;"),
      "Classes should keep a fixed left-aligned text lane with symmetric side padding and only ellipsize inside that lane."
    );
    assert(
      !visualCss.includes("data-blank-canvas-class-overflow"),
      "Classes should no longer depend on a special overflow mode to align long titles."
    );
  });

  addTest("Dashboard layout falls back to stacked mode below the split breakpoint", () => {
    const fixture = createFixture(`
      <div class="ic-DashboardLayout__Main" style="width: 840px;">
        <section id="DashboardCard_Container"></section>
      </div>
    `);
    document.body.appendChild(fixture);

    try {
      root.dashboardLayout.sync({
        mount: {
          container: fixture.querySelector(".ic-DashboardLayout__Main"),
          anchor: fixture.querySelector("#DashboardCard_Container")
        },
        settings: {
          uiLayoutMode: "editorial",
          uiPhaseAgendaList: true,
          uiPhaseAssignmentHierarchy: true
        },
        assignmentSnapshot: {
          status: "ready",
          source: "api",
          items: []
        },
        rowItems: []
      });

      const layoutSnapshot = root.dashboardLayout.getSnapshot();
      equal(layoutSnapshot.layoutMode, "stacked", "Narrow dashboard layouts should return to the stacked mode.");
      equal(layoutSnapshot.classesInRightColumn, false, "Stacked layouts should not report classes in the right column.");
      equal(layoutSnapshot.rightColumnMounted, false, "Stacked layouts should not report a dedicated right column.");
    } finally {
      root.dashboard.teardown();
      fixture.remove();
    }
  });

  harness.run();
})();
