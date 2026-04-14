export async function getExtensionId(context) {
  const worker = context.serviceWorkers()[0] || await context.waitForEvent("serviceworker");
  return new URL(worker.url()).host;
}

export async function openPopupPage(context, options = {}) {
  const extensionId = await getExtensionId(context);
  const popup = await context.newPage();

  await popup.addInitScript(({ canvasBaseURL }) => {
    globalThis.BlankCanvas = globalThis.BlankCanvas || {};
    globalThis.BlankCanvas.popupEnvironment = {
      async getActiveTab() {
        const tabs = await chrome.tabs.query({});
        return tabs.find(
          (tab) => typeof tab.url === "string" && tab.url.startsWith(canvasBaseURL)
        ) || null;
      }
    };
  }, {
    canvasBaseURL: options.canvasBaseURL || ""
  });

  await popup.goto(`chrome-extension://${extensionId}/src/popup/popup.html`, {
    waitUntil: "domcontentloaded"
  });

  return popup;
}
