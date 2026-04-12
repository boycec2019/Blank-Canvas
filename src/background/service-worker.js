importScripts("../shared/core.js", "../shared/defaults.js");

const root = globalThis.BlankCanvas || {};

chrome.runtime.onInstalled.addListener(async () => {
  const storageArea = chrome.storage.sync || chrome.storage.local;
  const existing = await storageArea.get(root.defaults);
  const nextValues = {
    ...root.defaults,
    ...existing
  };

  await storageArea.set(nextValues);
});
