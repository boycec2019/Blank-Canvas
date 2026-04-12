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
  let currentSettings = { ...root.defaults };

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
    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    return tabs[0] || null;
  }

  function requestTabMessage(tabId, message) {
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

  function setTodoLoading(message) {
    todoList.replaceChildren();
    const item = document.createElement("li");
    item.className = "todo-empty";
    item.textContent = message;
    todoList.appendChild(item);
  }

  function buildTodoItem(item) {
    const listItem = document.createElement("li");
    listItem.className = "todo-item";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "todo-link";
    button.dataset.url = item.url;

    const title = document.createElement("span");
    title.className = "todo-title";
    title.textContent = item.displayTitle || item.title;

    const dueSummary = document.createElement("span");
    dueSummary.className = "todo-due";
    dueSummary.textContent = item.dueSummaryText || item.dueDateText || item.dueLabel || "Due date not listed";

    button.append(title, dueSummary);
    listItem.appendChild(button);

    return listItem;
  }

  function renderTodoItems(items) {
    todoList.replaceChildren();

    if (!items.length) {
      const item = document.createElement("li");
      item.className = "todo-empty";
      item.textContent = "No pending assignments found on this page.";
      todoList.appendChild(item);
      return;
    }

    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
      fragment.appendChild(buildTodoItem(item));
    });
    todoList.appendChild(fragment);
  }

  function renderTodoState(summary, message) {
    todoSummary.textContent = summary;
    setTodoLoading(message);
  }

  async function loadPendingAssignments() {
    setStatus("Loading pending assignments...");
    renderTodoState("Checking the current Canvas tab.", "Looking for assignments...");

    const activeTab = await getActiveTab();
    if (!activeTab || !activeTab.id) {
      todoTabId = null;
      renderTodoState("No active tab found.", "Open Canvas and try again.");
      setStatus("Could not find an active tab.");
      return;
    }

    todoTabId = activeTab.id;

    try {
      const response = await requestTabMessage(activeTab.id, {
        type: "blank-canvas:pending-assignments"
      });
      const items = Array.isArray(response && response.items) ? response.items : [];
      todoSummary.textContent = `${items.length} pending assignment${items.length === 1 ? "" : "s"} from the active Canvas tab.`;
      renderTodoItems(items);
      setStatus("Pending assignments loaded.");
    } catch (error) {
      todoTabId = null;
      renderTodoState(
        "Canvas page not available.",
        "Open a Canvas page in the active tab, then refresh."
      );
      setStatus("Could not read assignments from this tab.");
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
      `Assignments updated: ${
        report.pendingAssignmentsLastLoadedAt
          ? new Date(report.pendingAssignmentsLastLoadedAt).toISOString()
          : "not loaded"
      }`,
      `Assignment source: ${report.pendingAssignmentsSource || "none"}`,
      `Assignment status: ${report.pendingAssignmentsStatus || "idle"}`,
      `Assignment error: ${report.pendingAssignmentsError || "none"}`,
      `Dashboard to-do rendered: ${Boolean(report.dashboardTodo && report.dashboardTodo.rendered)}`,
      ""
    ];

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

    chrome.tabs.sendMessage(
      activeTab.id,
      {
        type: "blank-canvas:diagnostics"
      },
      (response) => {
        if (chrome.runtime.lastError) {
          diagnosticsOutput.textContent =
            "Open an active Canvas page, then run diagnostics again.";
          setStatus("No Blank Canvas content script found on this tab.");
          return;
        }

        diagnosticsOutput.textContent = formatDiagnostics(response);
        setStatus("Diagnostics complete.");
      }
    );
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
      if (!button || !todoTabId) {
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
