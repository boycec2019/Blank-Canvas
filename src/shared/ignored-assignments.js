(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});
  const STORAGE_KEY = "ignoredAssignmentKeys";

  function getStorageArea() {
    return chrome.storage.sync || chrome.storage.local;
  }

  async function readIgnoredAssignmentKeys() {
    const values = await getStorageArea().get({
      [STORAGE_KEY]: []
    });
    return Array.isArray(values[STORAGE_KEY]) ? values[STORAGE_KEY] : [];
  }

  async function writeIgnoredAssignmentKeys(keys) {
    const normalizedKeys = Array.from(
      new Set(
        (keys || [])
          .map((key) => String(key || "").trim())
          .filter(Boolean)
      )
    );

    await getStorageArea().set({
      [STORAGE_KEY]: normalizedKeys
    });

    return normalizedKeys;
  }

  async function listIgnoredAssignmentKeys() {
    return readIgnoredAssignmentKeys();
  }

  async function ignoreAssignmentKey(key) {
    const normalizedKey = String(key || "").trim();
    if (!normalizedKey) {
      return listIgnoredAssignmentKeys();
    }

    const keys = await listIgnoredAssignmentKeys();
    if (keys.includes(normalizedKey)) {
      return keys;
    }

    return writeIgnoredAssignmentKeys([...keys, normalizedKey]);
  }

  async function unignoreAssignmentKey(key) {
    const normalizedKey = String(key || "").trim();
    const keys = await listIgnoredAssignmentKeys();
    return writeIgnoredAssignmentKeys(keys.filter((value) => value !== normalizedKey));
  }

  async function clearIgnoredAssignmentKeys() {
    return writeIgnoredAssignmentKeys([]);
  }

  function onChanged(listener) {
    const handler = (changes, areaName) => {
      const expectedArea = chrome.storage.sync ? "sync" : "local";
      if (areaName !== expectedArea || !changes[STORAGE_KEY]) {
        return;
      }

      listener(changes[STORAGE_KEY]);
    };

    chrome.storage.onChanged.addListener(handler);

    return () => {
      chrome.storage.onChanged.removeListener(handler);
    };
  }

  root.ignoredAssignments = {
    clearIgnoredAssignmentKeys,
    STORAGE_KEY,
    ignoreAssignmentKey,
    listIgnoredAssignmentKeys,
    onChanged,
    unignoreAssignmentKey
  };
})();
