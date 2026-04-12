(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});

  let currentSettings = { ...root.defaults };
  let lastUrl = window.location.href;
  let unsubscribeAssignments = null;

  if (!chrome.runtime || !chrome.runtime.onMessage) {
    return;
  }

  const rerender = root.utils.debounce(() => {
    root.renderer.render(currentSettings);
  }, 175);

  function installMessageHandlers() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (!message || typeof message.type !== "string") {
        return;
      }

      if (message.type === "blank-canvas:ping") {
        sendResponse({
          ok: true,
          isCanvasLike: root.canvas.isCanvasLikePage(),
          pagePath: root.canvas.getPageContext().path
        });
        return;
      }

      if (message.type === "blank-canvas:diagnostics") {
        sendResponse(root.diagnostics.buildReport(currentSettings));
        return;
      }

      if (message.type === "blank-canvas:pending-assignments") {
        root.assignments
          .refreshPendingAssignments({
            force: true
          })
          .then((snapshot) => {
            sendResponse({
              items: snapshot.items,
              pagePath: root.canvas.getPageContext().path,
              generatedAt: new Date().toISOString(),
              source: snapshot.source,
              status: snapshot.status
            });
          });
        return true;
      }

      if (message.type === "blank-canvas:rerender") {
        sendResponse(root.renderer.render(currentSettings));
      }
    });
  }

  function watchDom() {
    const observer = new MutationObserver((mutations) => {
      const changed = mutations.some(
        (mutation) => mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0
      );

      if (changed) {
        rerender();
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  function watchLocation() {
    window.setInterval(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        root.assignments.invalidate();
      }
    }, 1000);
  }

  async function initialize() {
    currentSettings = await root.storage.getSettings();
    root.debug.setFlags(currentSettings);

    if (!root.canvas.isCanvasLikePage()) {
      if (root.bootstrap) {
        root.bootstrap.clear();
      }
      root.debug.log("main", "Page ignored because it does not look like Canvas.");
      return;
    }

    if (root.courseNav) {
      root.courseNav.sync(currentSettings);
      root.courseNav.install();
    }

    root.renderer.render(currentSettings);
    if (root.bootstrap) {
      root.bootstrap.clear();
    }
    installMessageHandlers();
    watchDom();
    watchLocation();

    unsubscribeAssignments = root.assignments.subscribe(() => {
      rerender();
    });

    root.storage.onSettingsChanged((nextSettings) => {
      currentSettings = nextSettings;
      root.debug.setFlags(nextSettings);
      if (root.courseNav) {
        root.courseNav.sync(nextSettings);
      }
      rerender();
    });
  }

  initialize().catch((error) => {
    if (unsubscribeAssignments) {
      unsubscribeAssignments();
    }
    root.debug.error("main", "Initialization failed.", String(error));
  });
})();
