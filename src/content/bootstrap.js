(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});
  const STYLE_ID = "blank-canvas-bootstrap-style";
  const ROOT_ATTRIBUTE = "data-blank-canvas-preload";
  const hasChromeStorage =
    typeof chrome !== "undefined" && chrome.storage && (chrome.storage.sync || chrome.storage.local);
  const storageArea = hasChromeStorage ? chrome.storage.sync || chrome.storage.local : null;

  function isCanvasHostname(hostname = window.location.hostname) {
    const normalizedHostname = String(hostname || "").trim().toLowerCase();
    if (!normalizedHostname) {
      return false;
    }

    return (
      normalizedHostname === "canvas" ||
      normalizedHostname.startsWith("canvas.") ||
      normalizedHostname.includes(".canvas.") ||
      normalizedHostname.endsWith(".instructure.com")
    );
  }
  
  function getBootstrapContext() {
    return {
      hostname: window.location.hostname,
      courseId: root.courseNavUtils ? root.courseNavUtils.getCourseIdFromPath() : ""
    };
  }

  function buildThemePreloadCss(settings) {
    if (
      !root.ui ||
      !root.ui.isEditorialPhaseActive(settings, root.ui.PHASE_TYPOGRAPHY_RESET)
    ) {
      return "";
    }

    return `
      html[${ROOT_ATTRIBUTE}="true"] {
${root.ui.buildTokenCss(settings)}
      }

      html[${ROOT_ATTRIBUTE}="true"],
      html[${ROOT_ATTRIBUTE}="true"] body {
        background: var(--blank-canvas-page-background) !important;
        background-attachment: fixed !important;
        color: var(--blank-canvas-color-text) !important;
      }

      html[${ROOT_ATTRIBUTE}="true"] #application,
      html[${ROOT_ATTRIBUTE}="true"] #dashboard_container,
      html[${ROOT_ATTRIBUTE}="true"] .ic-DashboardLayout,
      html[${ROOT_ATTRIBUTE}="true"] .ic-DashboardLayout__Main,
      html[${ROOT_ATTRIBUTE}="true"] .ic-Layout-wrapper,
      html[${ROOT_ATTRIBUTE}="true"] .ic-Layout-contentMain,
      html[${ROOT_ATTRIBUTE}="true"] #dashboard,
      html[${ROOT_ATTRIBUTE}="true"] #DashboardCard_Container {
        background: transparent !important;
      }

      html[${ROOT_ATTRIBUTE}="true"] #menu,
      html[${ROOT_ATTRIBUTE}="true"] .ic-app-header,
      html[${ROOT_ATTRIBUTE}="true"] .ic-app-header__main-navigation,
      html[${ROOT_ATTRIBUTE}="true"] .ic-app-header__menu-list {
        background: #fffaf7 !important;
        background-color: #fffaf7 !important;
        background-image: none !important;
        border: none !important;
        box-shadow: none !important;
      }

      html[${ROOT_ATTRIBUTE}="true"] #menu,
      html[${ROOT_ATTRIBUTE}="true"] .ic-app-header {
        border-right: 1px solid rgba(18, 60, 47, 0.12) !important;
      }
    `;
  }

  function buildCriticalCss(settings, context = getBootstrapContext()) {
    const hostname = context && context.hostname ? context.hostname : window.location.hostname;
    if (!settings || !settings.enabled || settings.previewMode || !isCanvasHostname(hostname)) {
      return "";
    }

    const blocks = [buildThemePreloadCss(settings)];

    if (settings.hideRightSidebar) {
      blocks.push(`
        html[${ROOT_ATTRIBUTE}="true"] #dashboard #right-side-wrapper,
        html[${ROOT_ATTRIBUTE}="true"] #dashboard #right-side,
        html[${ROOT_ATTRIBUTE}="true"] .ic-DashboardLayout #right-side-wrapper,
        html[${ROOT_ATTRIBUTE}="true"] .ic-DashboardLayout #right-side {
          display: none !important;
        }
      `);
    }

    if (settings.hideCourseCardImages) {
      blocks.push(`
        html[${ROOT_ATTRIBUTE}="true"] .ic-DashboardCard__header_image,
        html[${ROOT_ATTRIBUTE}="true"] .ic-DashboardCard__header_hero,
        html[${ROOT_ATTRIBUTE}="true"] .ic-DashboardCard__hero,
        html[${ROOT_ATTRIBUTE}="true"] .ic-DashboardCard__cover-image {
          display: none !important;
        }
      `);
    }

    if (settings.hideCourseCardActions) {
      blocks.push(`
        html[${ROOT_ATTRIBUTE}="true"] .ic-DashboardCard__action-container,
        html[${ROOT_ATTRIBUTE}="true"] .ic-DashboardCard__action-layout,
        html[${ROOT_ATTRIBUTE}="true"] .ic-DashboardCard__actions {
          display: none !important;
        }
      `);
    }

    if (settings.hideCourseCardMeta) {
      blocks.push(`
        html[${ROOT_ATTRIBUTE}="true"] .ic-DashboardCard__header-subtitle,
        html[${ROOT_ATTRIBUTE}="true"] .ic-DashboardCard__header-term {
          display: none !important;
        }
      `);
    }

    if (settings.hideCourseCardMenu) {
      blocks.push(`
        html[${ROOT_ATTRIBUTE}="true"] .ic-DashboardCard__header-button-bg,
        html[${ROOT_ATTRIBUTE}="true"] .ic-DashboardCard__header-button,
        html[${ROOT_ATTRIBUTE}="true"] .ic-DashboardCard__header_hero button[aria-haspopup="menu"] {
          display: none !important;
        }
      `);
    }

    if (context.courseId && root.courseNavUtils) {
      const courseNavCss = root.courseNavUtils.buildCriticalCourseNavCss(
        settings.hiddenCourseNavItems,
        context.courseId,
        ROOT_ATTRIBUTE
      );

      if (courseNavCss.trim()) {
        blocks.push(courseNavCss);
      }
    }

    return blocks.join("\n");
  }

  function ensureStyle(cssText) {
    let styleElement = document.getElementById(STYLE_ID);

    if (!cssText) {
      if (styleElement) {
        styleElement.remove();
      }
      return;
    }

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = STYLE_ID;
      document.documentElement.appendChild(styleElement);
    }

    styleElement.textContent = cssText;
  }

  function clear() {
    document.documentElement.removeAttribute(ROOT_ATTRIBUTE);
    ensureStyle("");
  }

  if (isCanvasHostname()) {
    document.documentElement.setAttribute(ROOT_ATTRIBUTE, "true");
    ensureStyle(buildCriticalCss(root.defaults));

    if (storageArea) {
      storageArea
        .get(root.defaults)
        .then((storedValues) => {
          const settings = root.storage
            ? root.storage.mergeSettings(storedValues)
            : { ...root.defaults, ...storedValues };
          ensureStyle(buildCriticalCss(settings));
        })
        .catch(() => {
          ensureStyle(buildCriticalCss(root.defaults));
        });
    }
  }

  root.bootstrap = {
    buildCriticalCss,
    clear
  };
})();
