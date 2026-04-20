import React from "react";
import * as ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";

(() => {
  const root = globalThis.BlankCanvas || (globalThis.BlankCanvas = {});
  const mountedRoots = new Map();

  function resolveMountKey(container) {
    if (!container) {
      return null;
    }

    if (container.id) {
      return container.id;
    }

    return `react-mount-${mountedRoots.size + 1}`;
  }

  function resolveContainer(target) {
    if (!target) {
      return null;
    }

    if (target instanceof Element) {
      return target;
    }

    if (typeof target === "string") {
      return document.querySelector(target);
    }

    return null;
  }

  function getEntry(container) {
    return mountedRoots.get(container) || null;
  }

  function ensureEntry(container, id) {
    const existing = getEntry(container);
    if (existing) {
      return existing;
    }

    const entry = {
      id: id || resolveMountKey(container),
      root: createRoot(container)
    };
    mountedRoots.set(container, entry);
    container.dataset.blankCanvasReactMounted = "true";
    container.dataset.blankCanvasReactMountId = entry.id;
    return entry;
  }

  function renderIntoContainer(container, node, options = {}) {
    const entry = ensureEntry(container, options.id);
    const nextNode = options.strict === false
      ? node
      : React.createElement(React.StrictMode, null, node);
    if (typeof ReactDOM.flushSync === "function") {
      ReactDOM.flushSync(() => {
        entry.root.render(nextNode);
      });
    } else {
      entry.root.render(nextNode);
    }
    return {
      container,
      id: entry.id
    };
  }

  function createMountHost(options = {}) {
    const host = document.createElement(options.tagName || "div");
    if (options.id) {
      host.id = options.id;
    }
    if (options.className) {
      host.className = options.className;
    }
    if (options.attributes) {
      Object.entries(options.attributes).forEach(([name, value]) => {
        host.setAttribute(name, value);
      });
    }

    const parent = resolveContainer(options.parent) || document.body;
    parent.appendChild(host);
    return host;
  }

  function mountNode(node, options = {}) {
    const container = resolveContainer(options.container);
    if (!container) {
      throw new Error("React mount requires a valid container.");
    }

    return renderIntoContainer(container, node, options);
  }

  function mountComponent(Component, options = {}) {
    if (typeof Component !== "function") {
      throw new Error("React mount requires a component function.");
    }

    const props = options.props || {};
    return mountNode(React.createElement(Component, props), options);
  }

  function unmount(target) {
    const container = resolveContainer(target);
    if (!container) {
      return false;
    }

    const entry = getEntry(container);
    if (!entry) {
      return false;
    }

    entry.root.unmount();
    mountedRoots.delete(container);
    delete container.dataset.blankCanvasReactMounted;
    delete container.dataset.blankCanvasReactMountId;
    return true;
  }

  function getSnapshot() {
    return {
      available: true,
      version: React.version,
      mountedCount: mountedRoots.size,
      mountIds: Array.from(mountedRoots.values()).map((entry) => entry.id)
    };
  }

  root.react = {
    available: true,
    version: React.version,
    createElement: React.createElement,
    createMountHost,
    createPortal: ReactDOM.createPortal,
    getSnapshot,
    mountComponent,
    mountNode,
    unmount
  };
})();
