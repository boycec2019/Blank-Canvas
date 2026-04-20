(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});

  function createElement(tagName, className, textContent) {
    const element = document.createElement(tagName);
    if (className) {
      element.className = className;
    }
    if (textContent !== undefined) {
      element.textContent = textContent;
    }
    return element;
  }

  root.dom = {
    createElement
  };
})();
