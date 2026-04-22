(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});
  const NOTICE_ID = "blank-canvas-auth-notice";
  const state = {
    active: false,
    detectedAt: 0,
    message: "",
    source: "",
    status: 0,
    url: ""
  };

  function getMessage(details = {}) {
    if (details && details.message) {
      return details.message;
    }

    return "Canvas session required. Blank Canvas could not refresh assignments. Refresh this page or sign in to Canvas again.";
  }

  function ensureNoticeElement() {
    let element = document.getElementById(NOTICE_ID);
    if (element) {
      return element;
    }

    if (!document.body) {
      return null;
    }

    element = document.createElement("aside");
    element.id = NOTICE_ID;
    element.className = "blank-canvas__auth-notice";
    element.setAttribute("role", "status");
    element.setAttribute("aria-live", "polite");

    const title = document.createElement("strong");
    title.className = "blank-canvas__auth-notice-title";
    title.textContent = "Canvas sign-in required";

    const body = document.createElement("p");
    body.className = "blank-canvas__auth-notice-copy";

    element.append(title, body);
    document.body.appendChild(element);
    return element;
  }

  function render() {
    const existing = document.getElementById(NOTICE_ID);
    if (!state.active) {
      if (existing) {
        existing.remove();
      }
      return null;
    }

    const element = ensureNoticeElement();
    if (!element) {
      return null;
    }

    const copy = element.querySelector(".blank-canvas__auth-notice-copy");
    if (copy) {
      copy.textContent = state.message;
    }

    return element;
  }

  function sync() {
    render();
    return getSnapshot();
  }

  function reportAuthIssue(details = {}) {
    state.active = true;
    state.detectedAt = Date.now();
    state.message = getMessage(details);
    state.source = details.source || "";
    state.status = Number(details.status || 0);
    state.url = details.url || "";
    render();
    return getSnapshot();
  }

  function clearAuthIssue() {
    if (!state.active) {
      return getSnapshot();
    }

    state.active = false;
    state.message = "";
    state.source = "";
    state.status = 0;
    state.url = "";
    render();
    return getSnapshot();
  }

  function teardown() {
    const element = document.getElementById(NOTICE_ID);
    if (element) {
      element.remove();
    }
  }

  function getSnapshot() {
    return {
      active: state.active,
      detectedAt: state.detectedAt,
      message: state.message,
      mounted: Boolean(document.getElementById(NOTICE_ID)),
      source: state.source,
      status: state.status,
      url: state.url
    };
  }

  function getStyles() {
    return `
      #${NOTICE_ID} {
        position: fixed;
        top: 18px;
        right: 22px;
        z-index: 2147483646;
        width: min(360px, calc(100vw - 36px));
        padding: 14px 16px;
        border: 1px solid rgba(176, 56, 23, 0.18);
        border-radius: 14px;
        background: rgba(255, 251, 248, 0.98);
        box-shadow: 0 18px 36px rgba(26, 33, 39, 0.12);
        color: #111111;
        font-family: var(--blank-canvas-font-body, "Helvetica Neue", Arial, sans-serif);
      }

      #${NOTICE_ID} .blank-canvas__auth-notice-title {
        display: block;
        margin-bottom: 6px;
        font-size: 0.94rem;
        font-weight: 700;
        letter-spacing: -0.01em;
      }

      #${NOTICE_ID} .blank-canvas__auth-notice-copy {
        margin: 0;
        font-size: 0.88rem;
        line-height: 1.4;
        color: rgba(17, 17, 17, 0.78);
      }

      @media (max-width: 720px) {
        #${NOTICE_ID} {
          top: 12px;
          right: 12px;
          width: min(320px, calc(100vw - 24px));
        }
      }
    `;
  }

  root.authNotice = {
    NOTICE_ID,
    clearAuthIssue,
    getSnapshot,
    getStyles,
    reportAuthIssue,
    sync,
    teardown
  };
})();
