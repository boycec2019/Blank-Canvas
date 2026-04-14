(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});
  const fields = Array.from(document.querySelectorAll("[name]"));
  const statusText = document.getElementById("status-text");
  const diagnosticsOutput = document.getElementById("diagnostics-output");
  const diagnosticsButton = document.getElementById("run-diagnostics");
  const resetButton = document.getElementById("reset-settings");
  const openOptionsButton = document.getElementById("open-options");
  const refreshTodoButton = document.getElementById("refresh-todo");
  const todoSummary = document.getElementById("todo-summary");
  const todoList = document.getElementById("todo-list");
  const uiLayoutModeField = document.getElementById("uiLayoutMode");
  const uiPhaseSummary = document.getElementById("ui-phase-summary");
  let todoTabId = null;
  let todoTabIsCanvas = false;
  let currentSettings = { ...root.defaults };

  function getPopupEnvironment() {
    return root.popupEnvironment || {};
  }

  function setStatus(message) {
    statusText.textContent = message;
  }

  function applySettingsToFields(settings) {
    root.settingsUi.applySettingsToElements(fields, settings);
  }

  function updateUiPhaseSummary(settings) {
    uiPhaseSummary.textContent = root.settingsUi.summarizeActivePhases(settings);
  }

  async function getActiveTab() {
    const environment = getPopupEnvironment();
    if (typeof environment.getActiveTab === "function") {
      return environment.getActiveTab();
    }

    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    return tabs[0] || null;
  }

  function requestTabMessage(tabId, message) {
    const environment = getPopupEnvironment();
    if (typeof environment.requestTabMessage === "function") {
      return environment.requestTabMessage(tabId, message);
    }

    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tabId, message, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        resolve(response);
      });
    });
  }

  async function syncField(field) {
    const nextValue = field.type === "checkbox" ? field.checked : field.value;
    await root.storage.setSettings({
      [field.name]: nextValue
    });
    currentSettings = root.storage.mergeSettings({
      ...currentSettings,
      [field.name]: nextValue
    });
    root.settingsUi.applyTheme(currentSettings);
    updateUiPhaseSummary(currentSettings);
    setStatus("Settings saved.");
  }

  function createElement(tagName, className, textContent) {
    const element = document.createElement(tagName);
    if (className) {
      element.className = className;
    }
    if (textContent !== undefined) {
      element.textContent = textContent;
    }
    return element;
  }

  function setTodoLoading(message) {
    todoList.replaceChildren();
    todoList.appendChild(createElement("li", "todo-empty", message));
  }

  function buildTodoSurface(item) {
    const surface = createElement(item.url ? "button" : "div", "todo-link");
    if (item.url) {
      surface.type = "button";
      surface.dataset.url = item.url;
    }

    const title = createElement("span", "todo-title", item.primaryTitle || item.title);
    const meta = createElement("span", "todo-meta");
    const course = item.secondaryCourseName
      ? createElement("span", "", item.secondaryCourseName)
      : null;
    const status = item.statusLabel ? createElement("span", "todo-tag", item.statusLabel) : null;
    const sourceTag = item.source === "custom" ? createElement("span", "todo-tag", "Custom") : null;
    const due = createElement(
      "span",
      "todo-due",
      item.dueSummaryText || item.dueDateText || item.dueLabel || "Due date not listed"
    );

    [course, status, sourceTag].filter(Boolean).forEach((part) => meta.appendChild(part));
    surface.appendChild(title);
    if (meta.childElementCount) {
      surface.appendChild(meta);
    }
    surface.appendChild(due);

    return surface;
  }

  function renderTodoItems(items) {
    todoList.replaceChildren();

    if (!items.length) {
      todoList.appendChild(createElement("li", "todo-empty", "No pending assignments found."));
      return;
    }

    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
      const listItem = createElement("li", "todo-item");
      listItem.dataset.source = item.source || "unknown";
      listItem.appendChild(buildTodoSurface(item));
      fragment.appendChild(listItem);
    });
    todoList.appendChild(fragment);
  }

  function renderTodoState(summary, message) {
    todoSummary.textContent = summary;
    setTodoLoading(message);
  }

  async function loadCustomOnlyAssignments() {
    const items = await root.customAssignments.listPendingAssignments({
      courseNames: {}
    });

    todoSummary.textContent = items.length
      ? `${items.length} saved custom assignment${items.length === 1 ? "" : "s"}. Open Canvas to merge posted assignments.`
      : "No custom assignments yet. Open Canvas to load posted assignments too.";
    renderTodoItems(items);
    return items;
  }

  async function loadPendingAssignments() {
    setStatus("Loading pending assignments...");
    renderTodoState("Checking the current Canvas tab.", "Looking for assignments...");

    const activeTab = await getActiveTab();
    if (!activeTab || !activeTab.id) {
      todoTabId = null;
      todoTabIsCanvas = false;
      await loadCustomOnlyAssignments();
      setStatus("Showing saved custom assignments.");
      return;
    }

    todoTabId = activeTab.id;

    try {
      const response = await requestTabMessage(activeTab.id, {
        type: "blank-canvas:pending-assignments"
      });
      const items = Array.isArray(response && response.items) ? response.items : [];
      const sourceCounts = response && response.sourceCounts ? response.sourceCounts : {};
      const customCount = Number(sourceCounts.custom || 0);

      todoTabIsCanvas = true;
      todoSummary.textContent = customCount
        ? `${items.length} pending assignments from the active Canvas tab, including ${customCount} custom item${customCount === 1 ? "" : "s"}.`
        : `${items.length} pending assignment${items.length === 1 ? "" : "s"} from the active Canvas tab.`;
      renderTodoItems(items);
      setStatus("Pending assignments loaded.");
    } catch (error) {
      todoTabIsCanvas = false;
      await loadCustomOnlyAssignments();
      setStatus("Canvas page not available; showing custom assignments only.");
      root.debug.warn("popup", "Pending assignments could not be loaded.", String(error));
    }
  }

  function formatDiagnostics(report) {
    if (!report) {
      return "No diagnostic report returned.";
    }

    const lines = [
      `Canvas-like page: ${report.isCanvasLike}`,
      `Path: ${report.pagePath}`,
      `Preview mode: ${report.previewMode}`,
      `UI layout mode: ${report.uiLayoutLabel} (${report.uiLayoutMode})`,
      `Active UI phases: ${report.uiActivePhases.length ? report.uiActivePhases.join(", ") : "none"}`,
      `Managed elements: ${report.managedElements}`,
      `Mounted surfaces: ${
        Array.isArray(report.mountedSurfaces)
          ? report.mountedSurfaces
              .filter((surface) => surface.mounted)
              .map((surface) => surface.label)
              .join(", ") || "none"
          : "none"
      }`,
      `Pending assignments: ${report.pendingAssignmentsCount || 0}`,
      `Combined assignments: ${report.pendingAssignmentsCombinedCount || report.pendingAssignmentsCount || 0}`,
      `Custom assignments: ${report.pendingAssignmentsCustomCount || 0}`,
      `Source counts: ${
        report.pendingAssignmentsSourceCounts
          ? Object.entries(report.pendingAssignmentsSourceCounts)
              .map(([key, count]) => `${key}:${count}`)
              .join(", ") || "none"
          : "none"
      }`,
      `Assignments updated: ${
        report.pendingAssignmentsLastLoadedAt
          ? new Date(report.pendingAssignmentsLastLoadedAt).toISOString()
          : "not loaded"
      }`,
      `Assignment source: ${report.pendingAssignmentsSource || "none"}`,
      `Assignment status: ${report.pendingAssignmentsStatus || "idle"}`,
      `Assignment error: ${report.pendingAssignmentsError || "none"}`,
      `Dashboard to-do rendered: ${Boolean(report.dashboardTodo && report.dashboardTodo.rendered)}`,
      `Dashboard custom items rendered: ${report.dashboardTodo ? report.dashboardTodo.customItemCount || 0 : 0}`,
      `Custom modal mounted: ${Boolean(report.customAssignmentModal && report.customAssignmentModal.mounted)}`,
      `Custom modal open: ${Boolean(report.customAssignmentModal && report.customAssignmentModal.open)}`,
      `Custom modal course options: ${report.customAssignmentModal ? report.customAssignmentModal.courseOptionCount || 0 : 0}`,
      ""
    ];

    if (report.dashboardHeader) {
      lines.push("Dashboard header:");
      lines.push(`  Heading text: ${report.dashboardHeader.protectedHeadingText || "none"}`);
      lines.push(
        `  Heading matches: ${report.dashboardHeader.heading.matchedCount} (${report.dashboardHeader.heading.visibleCount} visible)`
      );
      lines.push(
        `  Search widget matches: ${report.dashboardHeader.searchWidget.matchedCount} (${report.dashboardHeader.searchWidget.visibleCount} visible)`
      );
      lines.push(
        `  Options button matches: ${report.dashboardHeader.optionsButton.matchedCount} (${report.dashboardHeader.optionsButton.visibleCount} visible)`
      );
      lines.push("");
    }

    if (Array.isArray(report.mountedSurfaces) && report.mountedSurfaces.length) {
      lines.push("Mounted surfaces:");
      report.mountedSurfaces.forEach((surface) => {
        lines.push(`  ${surface.label}: ${surface.mounted ? "mounted" : "not mounted"}`);
      });
      lines.push("");
    }

    if (!report.rules.length) {
      lines.push("No active rules matched this page.");
      return lines.join("\n");
    }

    report.rules.forEach((rule) => {
      lines.push(`${rule.label}: ${rule.matchedCount} matches`);
      if (rule.selectors.length) {
        lines.push(`  ${rule.selectors.slice(0, 3).join(" | ")}`);
      }
    });

    return lines.join("\n");
  }

  async function runDiagnostics() {
    setStatus("Running diagnostics...");
    diagnosticsOutput.textContent = "Collecting data from the current tab...";

    const activeTab = await getActiveTab();
    if (!activeTab || !activeTab.id) {
      diagnosticsOutput.textContent = "No active tab found.";
      setStatus("Could not find an active tab.");
      return;
    }

    try {
      const response = await requestTabMessage(activeTab.id, {
        type: "blank-canvas:diagnostics"
      });
      diagnosticsOutput.textContent = formatDiagnostics(response);
      setStatus("Diagnostics complete.");
    } catch (error) {
      diagnosticsOutput.textContent = "Open an active Canvas page, then run diagnostics again.";
      setStatus("No Blank Canvas content script found on this tab.");
    }
  }

  async function initialize() {
    root.settingsUi.renderLayoutModeOptions(uiLayoutModeField, {
      includeDescription: false
    });

    currentSettings = await root.storage.getSettings();
    root.debug.setFlags(currentSettings);
    root.settingsUi.applyTheme(currentSettings);
    applySettingsToFields(currentSettings);
    updateUiPhaseSummary(currentSettings);

    fields.forEach((field) => {
      field.addEventListener("change", () => {
        syncField(field).catch((error) => {
          setStatus("Failed to save settings.");
          diagnosticsOutput.textContent = String(error);
        });
      });
    });

    diagnosticsButton.addEventListener("click", () => {
      runDiagnostics().catch((error) => {
        setStatus("Diagnostics failed.");
        diagnosticsOutput.textContent = String(error);
      });
    });

    resetButton.addEventListener("click", async () => {
      await root.storage.resetSettings();
      currentSettings = await root.storage.getSettings();
      root.settingsUi.applyTheme(currentSettings);
      applySettingsToFields(currentSettings);
      updateUiPhaseSummary(currentSettings);
      diagnosticsOutput.textContent = "Settings reset to defaults.";
      setStatus("Defaults restored.");
    });

    openOptionsButton.addEventListener("click", () => {
      chrome.runtime.openOptionsPage();
    });

    refreshTodoButton.addEventListener("click", () => {
      loadPendingAssignments().catch((error) => {
        renderTodoState("Assignments failed to load.", String(error));
        setStatus("Pending assignments failed to load.");
      });
    });

    todoList.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      const button = event.target.closest(".todo-link");
      if (!button || !todoTabId || !todoTabIsCanvas || !button.dataset.url) {
        return;
      }

      chrome.tabs.update(todoTabId, {
        url: button.dataset.url
      });
      window.close();
    });

    await loadPendingAssignments();
  }

  initialize().catch((error) => {
    setStatus("Popup failed to load.");
    diagnosticsOutput.textContent = String(error);
  });
})();
