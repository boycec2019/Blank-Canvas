(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});

  function getSettings() {
    if (!root.storage || typeof root.storage.getSettings !== "function") {
      return Promise.resolve({ ...root.defaults });
    }

    return root.storage.getSettings();
  }

  async function refresh(options = {}) {
    const forceAssignments = options.forceAssignments !== false;

    if (
      forceAssignments &&
      root.assignments &&
      typeof root.assignments.refreshPendingAssignments === "function"
    ) {
      await root.assignments.refreshPendingAssignments({
        force: true
      });
    }

    if (!root.renderer || typeof root.renderer.render !== "function") {
      return getSettings();
    }

    const settings = await getSettings();
    root.renderer.render(settings);
    return settings;
  }

  root.dashboardRefresh = {
    getSettings,
    refresh
  };
})();
