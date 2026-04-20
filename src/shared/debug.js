(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});

  const state = {
    enabled: false,
    entries: []
  };

  function getErrorText(value) {
    if (value === null || value === undefined) {
      return "";
    }

    if (typeof value === "string") {
      return value;
    }

    if (value instanceof Error) {
      return `${value.name || ""} ${value.message || ""} ${value.stack || ""}`;
    }

    if (typeof value === "object") {
      return [value.name, value.message, value.stack, value.error]
        .filter(Boolean)
        .map((part) => String(part))
        .join(" ");
    }

    return String(value);
  }

  function isExtensionContextInvalidatedError(value) {
    return /extension context invalidated/i.test(getErrorText(value));
  }

  function shouldSuppressConsole(level, message, details) {
    return (
      (level === "warn" || level === "error") &&
      (isExtensionContextInvalidatedError(message) || isExtensionContextInvalidatedError(details))
    );
  }

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

    if (shouldSuppressConsole(level, message, details)) {
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
    },
    isExtensionContextInvalidatedError
  };
})();
