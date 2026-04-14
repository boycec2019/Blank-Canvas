const LOGIN_TEXT_PATTERNS = [
  /login with your ucinetid/i,
  /\bsign in\b/i,
  /\blog in\b/i
];

function buildAuthFailureMessage(state, canvasBaseURL) {
  return [
    "Canvas auth required: the real-page test opened a login page or auth redirect instead of a logged-in Canvas view.",
    `Expected Canvas host: ${new URL(canvasBaseURL).host}`,
    `Current URL: ${state.url}`,
    `Current title: ${state.title || "(empty)"}`,
    "",
    "This usually means BLANK_CANVAS_STORAGE_STATE has expired.",
    "Regenerate it with:",
    "  node tests\\real-canvas\\save-storage-state.mjs"
  ].join("\n");
}

export async function collectCanvasAuthState(page, canvasBaseURL) {
  const currentUrl = page.url();
  const expectedHost = new URL(canvasBaseURL).host;

  let currentHost = "";
  let currentPath = "";
  try {
    const parsedUrl = new URL(currentUrl);
    currentHost = parsedUrl.host;
    currentPath = parsedUrl.pathname;
  } catch {
    currentHost = "";
    currentPath = "";
  }

  const title = await page.title().catch(() => "");
  const bodyText = await page.locator("body").textContent().catch(() => "");
  const normalizedBodyText = String(bodyText || "").replace(/\s+/g, " ").trim();

  const hasPasswordField = (await page.locator("input[type='password']").count().catch(() => 0)) > 0;
  const hasLoginForm = (
    await page
      .locator("form[action*='login'], form[id*='login'], form[name*='login']")
      .count()
      .catch(() => 0)
  ) > 0;
  const hasLoginCopy = LOGIN_TEXT_PATTERNS.some(
    (pattern) => pattern.test(title) || pattern.test(normalizedBodyText)
  );

  const isExpectedHost = currentHost === expectedHost;
  const isLoginPath = /^\/login(\/|$)/i.test(currentPath);
  const looksLoggedOut = !isExpectedHost || isLoginPath || hasPasswordField || hasLoginForm || hasLoginCopy;

  return {
    url: currentUrl,
    title,
    expectedHost,
    currentHost,
    currentPath,
    hasPasswordField,
    hasLoginForm,
    hasLoginCopy,
    looksLoggedOut
  };
}

export async function assertCanvasAuthenticated(page, canvasBaseURL) {
  const state = await collectCanvasAuthState(page, canvasBaseURL);
  if (state.looksLoggedOut) {
    throw new Error(buildAuthFailureMessage(state, canvasBaseURL));
  }

  return state;
}
