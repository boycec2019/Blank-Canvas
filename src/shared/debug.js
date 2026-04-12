(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});

  const state = {
    enabled: false,
    entries: []
  };

  function record(level, scope, message, details) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      scope,
      message,
      details: details === undefined ? null : details
    };

    state.entries.push(entry);
    if (state.entries.length > 150) {
      state.entries.shift();
    }

    if (!state.enabled && level === "log") {
      return;
    }

    const method = console[level] || console.log;
    if (details === undefined) {
      method(`[Blank Canvas] ${scope}: ${message}`);
      return;
    }

    method(`[Blank Canvas] ${scope}: ${message}`, details);
  }

  root.debug = {
    setFlags(settings) {
      state.enabled = Boolean(settings && settings.debugMode);
    },
    log(scope, message, details) {
      record("log", scope, message, details);
    },
    warn(scope, message, details) {
      record("warn", scope, message, details);
    },
    error(scope, message, details) {
      record("error", scope, message, details);
    },
    snapshot() {
      return state.entries.slice();
    },
    clear() {
      state.entries.length = 0;
    }
  };
})();
