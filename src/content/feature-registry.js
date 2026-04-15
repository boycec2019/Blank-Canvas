(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});

  function createRegistry() {
    const featureDefinitions = [];
    const mountedFeatureIds = new Set();
    let lastSnapshots = {};
    let lastMountedIds = [];

    function findFeatureIndex(id) {
      return featureDefinitions.findIndex((feature) => feature.id === id);
    }

    function register(feature) {
      if (!feature || !feature.id || typeof feature.isEnabled !== "function") {
        return;
      }

      const existingIndex = findFeatureIndex(feature.id);
      if (existingIndex >= 0) {
        teardownFeature(featureDefinitions[existingIndex]);
        lastMountedIds = lastMountedIds.filter((id) => id !== feature.id);
        lastSnapshots = {
          ...lastSnapshots,
          [feature.id]: {
            mounted: false,
            enabled: false,
            replaced: true
          }
        };
        featureDefinitions[existingIndex] = feature;
        return;
      }

      featureDefinitions.push(feature);
    }

    function getDefinitions() {
      return featureDefinitions.slice();
    }

    function getStyles(settings) {
      return featureDefinitions
        .map((feature) =>
          typeof feature.getStyles === "function" ? feature.getStyles(settings) : ""
        )
        .filter(Boolean)
        .join("\n\n");
    }

    function teardownFeature(feature, settings, context, options) {
      if (mountedFeatureIds.has(feature.id) && typeof feature.teardown === "function") {
        feature.teardown(settings, context, options);
      }
      mountedFeatureIds.delete(feature.id);
    }

    function sync(options = {}) {
      const settings = options.settings || {};
      const context = options.context || root.canvas.getPageContext();
      const snapshots = {};
      const nextMountedIds = [];

      featureDefinitions.forEach((feature) => {
        const enabled = Boolean(settings.enabled && feature.isEnabled(settings, context, options));
        if (!enabled) {
          teardownFeature(feature, settings, context, options);
          snapshots[feature.id] = {
            mounted: false,
            enabled: false
          };
          return;
        }

        nextMountedIds.push(feature.id);
        mountedFeatureIds.add(feature.id);
        const result = typeof feature.mount === "function"
          ? feature.mount(settings, context, options)
          : null;
        const snapshot = typeof feature.getSnapshot === "function"
          ? feature.getSnapshot(settings, context, options)
          : null;

        snapshots[feature.id] = {
          mounted: true,
          enabled: true,
          ...(result || {}),
          ...(snapshot || {})
        };
      });

      lastSnapshots = snapshots;
      lastMountedIds = nextMountedIds;

      return {
        mountedFeatureIds: nextMountedIds.slice(),
        featureSnapshots: {
          ...snapshots
        }
      };
    }

    function teardown() {
      featureDefinitions.forEach((feature) => {
        teardownFeature(feature);
      });
      lastSnapshots = {};
      lastMountedIds = [];
    }

    function getSnapshot() {
      return {
        registeredFeatureIds: featureDefinitions.map((feature) => feature.id),
        mountedFeatureIds: lastMountedIds.slice(),
        featureSnapshots: {
          ...lastSnapshots
        }
      };
    }

    return {
      getDefinitions,
      getSnapshot,
      getStyles,
      register,
      sync,
      teardown
    };
  }

  root.featureRegistry = {
    ...createRegistry(),
    createRegistry
  };
})();
