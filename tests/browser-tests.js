(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});
  const summary = document.getElementById("summary");
  const resultsList = document.getElementById("results");
  const tests = [];

  function assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  function equal(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(`${message} Expected "${expected}", got "${actual}".`);
    }
  }

  function addTest(name, run) {
    tests.push({
      name,
      run
    });
  }

  function createFixture(html) {
    const fixture = document.createElement("div");
    fixture.innerHTML = html.trim();
    return fixture;
  }

  function resetDocumentUiState() {
    root.themeStyles.clearRootUiState();
    document.documentElement.classList.remove(
      "blank-canvas--enabled",
      "blank-canvas--dashboard",
      "blank-canvas--hide-right-sidebar",
      "blank-canvas--quiet-cards"
    );
  }

  function mountStyledFixture(settings, html) {
    const nextSettings = {
      ...root.defaults,
      enabled: true,
      ...settings
    };
    const fixture = createFixture(html);
    const style = document.createElement("style");
    style.textContent = root.themeStyles.buildBaseCss(nextSettings);

    resetDocumentUiState();
    root.themeStyles.setRootClasses(nextSettings);
    document.head.appendChild(style);
    document.body.appendChild(fixture);

    return {
      fixture,
      cleanup() {
        fixture.remove();
        style.remove();
        resetDocumentUiState();
      }
    };
  }

  function normalizeColor(value) {
    return String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function isTransparentColor(value) {
    const normalized = normalizeColor(value);
    return (
      normalized === "transparent" ||
      normalized === "rgba(0, 0, 0, 0)" ||
      normalized === "rgba(0,0,0,0)"
    );
  }

  function hasOverlayBackground(style) {
    const image = String(style.backgroundImage || "");
    return image !== "none" && image.includes("gradient");
  }

  async function resetCustomAssignments() {
    await chrome.storage.sync.set({
      customAssignments: []
    });
  }

  function renderResults(results) {
    const passed = results.filter((result) => result.ok).length;
    const failed = results.length - passed;

    document.body.dataset.testStatus = failed ? "failed" : "passed";
    summary.textContent = failed
      ? `${failed} test${failed === 1 ? "" : "s"} failed, ${passed} passed.`
      : `All ${passed} tests passed.`;
    summary.className = `summary ${failed ? "fail" : "pass"}`;

    resultsList.replaceChildren();
    results.forEach((result) => {
      const item = document.createElement("li");
      item.className = result.ok ? "pass" : "fail";
      item.textContent = result.ok ? `PASS: ${result.name}` : `FAIL: ${result.name} - ${result.error}`;
      resultsList.appendChild(item);
    });
  }

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

    equal(options[0].courseId, "general", "General should be the first available popup course option.");
    equal(options[1].courseName, "English 101", "Discovered course options should be preserved.");
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

      equal(
        normalizeColor(window.getComputedStyle(inactiveContainer).backgroundColor),
        normalizeColor(window.getComputedStyle(rail).backgroundColor),
        "Inactive rail buttons should sit on the same base surface as the sidebar."
      );
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
        "New custom",
        "The dashboard widget should expose the custom-assignment launcher."
      );
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
      });

      equal(
        widget.querySelectorAll(".blank-canvas__todo-item[data-source='custom'] .blank-canvas__todo-action").length,
        2,
        "Custom rows should expose edit and delete controls."
      );
      equal(
        widget.querySelectorAll(".blank-canvas__todo-item[data-source='api'] .blank-canvas__todo-action").length,
        0,
        "Canvas rows should not expose custom-assignment actions."
      );
    } finally {
      widget.remove();
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
      });

      const snapshot = root.dashboardView.getSnapshot();
      equal(snapshot.fallbackCourseCount, 1, "Widget diagnostics should report fallback course rows.");
      equal(snapshot.normalizedTitleCount, 1, "Widget diagnostics should report normalized titles.");
    } finally {
      widget.remove();
    }
  });

  (async () => {
    const results = [];

    for (const test of tests) {
      try {
        await test.run();
        results.push({
          name: test.name,
          ok: true
        });
      } catch (error) {
        results.push({
          name: test.name,
          ok: false,
          error: String(error && error.message ? error.message : error)
        });
      }
    }

    renderResults(results);
  })();
})();
