(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});
  const form = document.getElementById("settings-form");
  const saveButton = document.getElementById("save-settings");
  const resetButton = document.getElementById("reset-settings");
  const resetHiddenCourseTabsButton = document.getElementById("reset-hidden-course-tabs");
  const saveStatus = document.getElementById("save-status");

  function setStatus(message) {
    saveStatus.textContent = message;
  }

  function applySettings(settings) {
    Array.from(form.elements).forEach((element) => {
      if (!element.name) {
        return;
      }

      if (element.type === "checkbox") {
        element.checked = Boolean(settings[element.name]);
        return;
      }

      element.value = settings[element.name] || "";
    });
  }

  function collectSettingsFromForm() {
    const nextSettings = {};

    Array.from(form.elements).forEach((element) => {
      if (!element.name) {
        return;
      }

      if (element.type === "checkbox") {
        nextSettings[element.name] = element.checked;
        return;
      }

      nextSettings[element.name] = element.value;
    });

    return nextSettings;
  }

  async function saveSettings() {
    const nextSettings = collectSettingsFromForm();
    await root.storage.setSettings(nextSettings);
    setStatus("Changes saved.");
  }

  async function initialize() {
    const settings = await root.storage.getSettings();
    root.debug.setFlags(settings);
    applySettings(settings);

    saveButton.addEventListener("click", () => {
      saveSettings().catch((error) => {
        setStatus(`Save failed: ${String(error)}`);
      });
    });

    resetButton.addEventListener("click", async () => {
      await root.storage.resetSettings();
      const nextSettings = await root.storage.getSettings();
      applySettings(nextSettings);
      setStatus("Defaults restored.");
    });

    resetHiddenCourseTabsButton.addEventListener("click", async () => {
      await root.storage.setSettings({
        hiddenCourseNavItems: {}
      });
      setStatus("Hidden course tabs restored.");
    });
  }

  initialize().catch((error) => {
    setStatus(`Options failed to load: ${String(error)}`);
  });
})();
