(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});
  const storageArea = chrome.storage.sync || chrome.storage.local;
  const storageAreaName = chrome.storage.sync ? "sync" : "local";

  function mergeSettings(storedValues) {
    const mergedSettings = {
      ...root.defaults,
      ...(storedValues || {}),
      hiddenCourseNavItems: root.courseNavUtils.normalizeHiddenCourseNavItems(
        storedValues && storedValues.hiddenCourseNavItems !== undefined
          ? storedValues.hiddenCourseNavItems
          : root.defaults.hiddenCourseNavItems
      ),
      customHiddenSelectors: String(
        storedValues && storedValues.customHiddenSelectors !== undefined
          ? storedValues.customHiddenSelectors
          : root.defaults.customHiddenSelectors
      )
    };

    mergedSettings.uiLayoutMode = root.ui.normalizeLayoutMode(mergedSettings.uiLayoutMode);

    return {
      ...mergedSettings,
      ...root.ui.normalizePhaseFlags(mergedSettings)
    };
  }

  async function getSettings() {
    const values = await storageArea.get(root.defaults);
    return mergeSettings(values);
  }

  async function setSettings(partialSettings) {
    return storageArea.set(partialSettings);
  }

  async function resetSettings() {
    return storageArea.set({
      ...root.defaults
    });
  }

  function onSettingsChanged(listener) {
    const wrappedListener = async (changes, areaName) => {
      if (areaName !== storageAreaName) {
        return;
      }

      const nextSettings = await getSettings();
      listener(nextSettings, changes);
    };

    chrome.storage.onChanged.addListener(wrappedListener);

    return () => {
      chrome.storage.onChanged.removeListener(wrappedListener);
    };
  }

  root.storage = {
    getSettings,
    setSettings,
    resetSettings,
    mergeSettings,
    normalizeHiddenCourseNavItems: root.courseNavUtils.normalizeHiddenCourseNavItems,
    onSettingsChanged
  };
})();
