(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});

  function applyTheme(settings, target = document.documentElement) {
    root.ui.applyDocumentTheme(target, settings);
  }

  function applySettingsToElements(elements, settings) {
    elements.forEach((element) => {
      if (!element || !element.name) {
        return;
      }

      if (element.type === "checkbox") {
        element.checked = Boolean(settings[element.name]);
        return;
      }

      element.value = settings[element.name] || "";
    });
  }

  function collectSettingsFromElements(elements) {
    return elements.reduce((result, element) => {
      if (!element || !element.name) {
        return result;
      }

      result[element.name] = element.type === "checkbox" ? element.checked : element.value;
      return result;
    }, {});
  }

  function createSettingRow(label, description, input) {
    const wrapper = document.createElement("label");
    wrapper.className = "setting-row";

    const text = document.createElement("span");
    const title = document.createElement("strong");
    const detail = document.createElement("small");

    title.textContent = label;
    detail.textContent = description;
    text.append(title, detail);
    wrapper.append(text, input);

    return wrapper;
  }

  function renderLayoutModeOptions(selectElement, options = {}) {
    if (!selectElement) {
      return;
    }

    const includeDescription = options.includeDescription !== false;
    selectElement.replaceChildren();

    Object.values(root.ui.layoutModes).forEach((layoutMode) => {
      const option = document.createElement("option");
      option.value = layoutMode.id;
      option.textContent = includeDescription
        ? `${layoutMode.label} - ${layoutMode.description}`
        : layoutMode.label;
      selectElement.appendChild(option);
    });
  }

  function renderPhaseControls(container) {
    if (!container) {
      return;
    }

    container.replaceChildren();

    root.ui.getPhaseDefinitions().forEach((phase) => {
      const input = document.createElement("input");
      input.type = "checkbox";
      input.name = phase.id;

      container.appendChild(createSettingRow(phase.label, phase.description, input));
    });
  }

  function summarizeActivePhases(settings) {
    const activePhases = root.ui.getPhaseStates(settings).filter((phase) => phase.enabled);

    if (!activePhases.length) {
      return "No redesign phases are active.";
    }

    return `${activePhases.length} redesign phase${
      activePhases.length === 1 ? "" : "s"
    } active. Use Options to change individual phase flags.`;
  }

  root.settingsUi = {
    applyTheme,
    applySettingsToElements,
    collectSettingsFromElements,
    createSettingRow,
    renderLayoutModeOptions,
    renderPhaseControls,
    summarizeActivePhases
  };
})();
