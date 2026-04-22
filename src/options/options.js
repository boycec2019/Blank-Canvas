(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});
  const form = document.getElementById("settings-form");
  const saveButton = document.getElementById("save-settings");
  const resetButton = document.getElementById("reset-settings");
  const resetHiddenCourseTabsButton = document.getElementById("reset-hidden-course-tabs");
  const resetHiddenAssignmentsButton = document.getElementById("reset-hidden-assignments");
  const saveStatus = document.getElementById("save-status");

  function setStatus(message) {
    saveStatus.textContent = message;
  }

  function applySettings(settings) {
    root.settingsUi.applySettingsToElements(Array.from(form.elements), settings);
  }

  function collectSettingsFromForm() {
    return root.settingsUi.collectSettingsFromElements(Array.from(form.elements));
  }

  async function saveSettings() {
    const nextSettings = collectSettingsFromForm();
    await root.storage.setSettings(nextSettings);
    root.settingsUi.applyTheme(root.storage.mergeSettings(nextSettings));
    setStatus("Changes saved.");
  }

  async function initialize() {
    const settings = await root.storage.getSettings();
    root.debug.setFlags(settings);
    root.settingsUi.applyTheme(settings);
    applySettings(settings);

    saveButton.addEventListener("click", () => {
      saveSettings().catch((error) => {
        setStatus(`Save failed: ${String(error)}`);
      });
    });

    resetButton.addEventListener("click", async () => {
      await root.storage.resetSettings();
      const nextSettings = await root.storage.getSettings();
      root.settingsUi.applyTheme(nextSettings);
      applySettings(nextSettings);
      setStatus("Defaults restored.");
    });

    if (resetHiddenCourseTabsButton) {
      resetHiddenCourseTabsButton.addEventListener("click", async () => {
        await root.storage.setSettings({
          hiddenCourseNavItems: {}
        });
        setStatus("Hidden course tabs restored.");
      });
    }

    if (resetHiddenAssignmentsButton) {
      resetHiddenAssignmentsButton.addEventListener("click", async () => {
        if (!root.ignoredAssignments || typeof root.ignoredAssignments.clearIgnoredAssignmentKeys !== "function") {
          setStatus("Hidden assignment restore is unavailable.");
          return;
        }

        await root.ignoredAssignments.clearIgnoredAssignmentKeys();
        setStatus("Hidden assignments restored.");
      });
    }
  }

  initialize().catch((error) => {
    setStatus(`Options failed to load: ${String(error)}`);
  });
})();
