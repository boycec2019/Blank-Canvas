(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});

  function parseRgbComponents(colorValue) {
    const match = String(colorValue || "").match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (!match) {
      return null;
    }

    return {
      r: Number(match[1]),
      g: Number(match[2]),
      b: Number(match[3])
    };
  }

  function getAccentNode(card) {
    if (!card) {
      return null;
    }

    return card.querySelector(
      ".ic-DashboardCard__header-title span[style*='color'], " +
      ".ic-DashboardCard__link span[style*='color'], " +
      ".ic-DashboardCard__header-title span, " +
      ".ic-DashboardCard__link span"
    );
  }

  function getStableAccentColor(card) {
    if (!card) {
      return "";
    }

    const titleAccent = card.querySelector(".ic-DashboardCard__header-title span[style*='color']");
    if (titleAccent && titleAccent.style && titleAccent.style.color) {
      return titleAccent.style.color;
    }

    const heroAccent = card.querySelector(".ic-DashboardCard__header_hero[style*='background-color']");
    if (heroAccent && heroAccent.style && heroAccent.style.backgroundColor) {
      return heroAccent.style.backgroundColor;
    }

    const buttonAccent = card.querySelector(
      ".ic-DashboardCard__header-button-bg[style*='background-color']"
    );
    if (buttonAccent && buttonAccent.style && buttonAccent.style.backgroundColor) {
      return buttonAccent.style.backgroundColor;
    }

    const accentNode = getAccentNode(card);
    return accentNode ? window.getComputedStyle(accentNode).color : "";
  }

  function sync(scope = document) {
    const cards = scope.querySelectorAll("#DashboardCard_Container .ic-DashboardCard");
    cards.forEach((card) => {
      const accentColor = getStableAccentColor(card);
      const rgb = parseRgbComponents(accentColor);

      if (!accentColor || !rgb) {
        card.style.removeProperty("--blank-canvas-class-accent");
        card.style.removeProperty("--blank-canvas-class-accent-soft");
        card.style.removeProperty("--blank-canvas-class-accent-border");
        return;
      }

      card.style.setProperty("--blank-canvas-class-accent", accentColor);
      card.style.setProperty(
        "--blank-canvas-class-accent-soft",
        `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`
      );
      card.style.setProperty(
        "--blank-canvas-class-accent-border",
        `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.34)`
      );
    });
  }

  root.classCardAccents = {
    getAccentNode,
    getStableAccentColor,
    parseRgbComponents,
    sync
  };
})();
