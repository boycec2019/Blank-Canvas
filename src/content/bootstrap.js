(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});
  const STYLE_ID = "blank-canvas-bootstrap-style";
  const ROOT_ATTRIBUTE = "data-blank-canvas-preload";
  const hasChromeStorage =
    typeof chrome !== "undefined" && chrome.storage && (chrome.storage.sync || chrome.storage.local);
  const storageArea = hasChromeStorage ? chrome.storage.sync || chrome.storage.local : null;
  
  function getBootstrapContext() {
    return {
      courseId: root.courseNavUtils ? root.courseNavUtils.getCourseIdFromPath() : ""
    };
  }

  function buildCriticalCss(settings, context = getBootstrapContext()) {
    if (!settings || !settings.enabled || settings.previewMode) {
      return "";
    }

    const blocks = [];

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

  root.bootstrap = {
    buildCriticalCss,
    clear
  };
})();
