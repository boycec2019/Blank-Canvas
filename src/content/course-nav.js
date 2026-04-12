(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});

  let currentSettings = { ...root.defaults };
  let installed = false;

  function getCourseNavLabel(anchor) {
    return (anchor.textContent || "").replace(/\s+/g, " ").trim() || "this tab";
  }

  function hideCourseNavTab(anchor) {
    const context = root.canvas.getPageContext();
    if (!context.isCourse || !context.courseId) {
      return Promise.resolve(false);
    }

    const key = root.canvas.resolveCourseNavItemKey(anchor, context.courseId);
    if (!key) {
      return Promise.resolve(false);
    }

    const currentCourseHidden = root.courseNavUtils.getHiddenCourseNavKeys(
      currentSettings.hiddenCourseNavItems,
      context.courseId
    );

    if (currentCourseHidden.includes(key)) {
      return Promise.resolve(false);
    }

    const nextHiddenCourseNavItems = root.courseNavUtils.addHiddenCourseNavItem(
      currentSettings.hiddenCourseNavItems,
      context.courseId,
      key
    );

    currentSettings = {
      ...currentSettings,
      hiddenCourseNavItems: nextHiddenCourseNavItems
    };

    return root.storage
      .setSettings({
        hiddenCourseNavItems: nextHiddenCourseNavItems
      })
      .then(() => true);
  }

  function handleContextMenu(event) {
    const context = root.canvas.getPageContext();
    if (!currentSettings.enabled || !context.isCourse) {
      return;
    }

    const anchor = root.canvas.findCourseNavLinkTarget(event.target);
    if (!anchor) {
      return;
    }

    const label = getCourseNavLabel(anchor);
    event.preventDefault();

    const confirmed = window.confirm(
      `Hide "${label}" from this course navigation?\n\nYou can restore hidden course tabs from Blank Canvas settings.`
    );

    if (!confirmed) {
      return;
    }

    hideCourseNavTab(anchor)
      .then((didHide) => {
        if (didHide) {
          root.renderer.render(currentSettings);
        }
      })
      .catch((error) => {
        if (root.debug) {
          root.debug.warn("course-nav", "Course nav tab could not be hidden.", String(error));
        }
      });
  }

  function install() {
    if (installed) {
      return;
    }

    document.addEventListener("contextmenu", handleContextMenu);
    installed = true;
  }

  function sync(settings) {
    currentSettings = {
      ...currentSettings,
      ...settings
    };
  }

  root.courseNav = {
    getCourseNavLabel,
    hideCourseNavTab,
    install,
    sync
  };
})();
