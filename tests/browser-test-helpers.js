(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});

  function assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  function equal(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(`${message} Expected "${expected}", got "${actual}".`);
    }
  }

  function createFixture(html) {
    const fixture = document.createElement("div");
    fixture.innerHTML = html.trim();
    return fixture;
  }

  function resetDocumentUiState() {
    root.themeStyles.clearRootUiState();
    document.documentElement.classList.remove(
      "blank-canvas--enabled",
      "blank-canvas--dashboard",
      "blank-canvas--hide-right-sidebar",
      "blank-canvas--quiet-cards"
    );
  }

  function mountStyledFixture(settings, html) {
    const nextSettings = {
      ...root.defaults,
      enabled: true,
      ...settings
    };
    const fixture = createFixture(html);
    const style = document.createElement("style");
    style.textContent = root.themeStyles.buildBaseCss(nextSettings);

    resetDocumentUiState();
    root.themeStyles.setRootClasses(nextSettings);
    document.head.appendChild(style);
    document.body.appendChild(fixture);

    return {
      fixture,
      cleanup() {
        fixture.remove();
        style.remove();
        resetDocumentUiState();
      }
    };
  }

  function normalizeColor(value) {
    return String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function isTransparentColor(value) {
    const normalized = normalizeColor(value);
    return (
      normalized === "transparent" ||
      normalized === "rgba(0, 0, 0, 0)" ||
      normalized === "rgba(0,0,0,0)"
    );
  }

  function hasOverlayBackground(style) {
    const image = String(style.backgroundImage || "");
    return image !== "none" && image.includes("gradient");
  }

  function resetStorageRecords(key, value) {
    return chrome.storage.sync.set({
      [key]: value
    });
  }

  function resetCustomAssignments() {
    return resetStorageRecords("customAssignments", []);
  }

  function resetIgnoredAssignments() {
    return resetStorageRecords("ignoredAssignmentKeys", []);
  }

  function resetCompletedAssignments() {
    return resetStorageRecords("completedAssignmentStates", []);
  }

  function createHarness(summaryElement, resultsElement) {
    const tests = [];

    function addTest(name, run) {
      tests.push({
        name,
        run
      });
    }

    function renderResults(results) {
      const passed = results.filter((result) => result.ok).length;
      const failed = results.length - passed;

      document.body.dataset.testStatus = failed ? "failed" : "passed";
      summaryElement.textContent = failed
        ? `${failed} test${failed === 1 ? "" : "s"} failed, ${passed} passed.`
        : `All ${passed} tests passed.`;
      summaryElement.className = `summary ${failed ? "fail" : "pass"}`;

      resultsElement.replaceChildren();
      results.forEach((result) => {
        const item = document.createElement("li");
        item.className = result.ok ? "pass" : "fail";
        item.textContent = result.ok
          ? `PASS: ${result.name}`
          : `FAIL: ${result.name} - ${result.error}`;
        resultsElement.appendChild(item);
      });
    }

    async function run() {
      const results = [];

      for (const test of tests) {
        try {
          await test.run();
          results.push({
            name: test.name,
            ok: true
          });
        } catch (error) {
          results.push({
            name: test.name,
            ok: false,
            error: String(error && error.message ? error.message : error)
          });
        }
      }

      renderResults(results);
    }

    return {
      addTest,
      run,
      tests
    };
  }

  root.browserTestHelpers = {
    assert,
    createFixture,
    createHarness,
    equal,
    hasOverlayBackground,
    isTransparentColor,
    mountStyledFixture,
    normalizeColor,
    resetCompletedAssignments,
    resetCustomAssignments,
    resetDocumentUiState,
    resetIgnoredAssignments
  };
})();
