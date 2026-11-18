/*
 * Nichelle Imports | Bloqueio da assinatura Groomb inserida dinamicamente.
 * Independente dos modulos do footer e das configuracoes de preview.
 * Preserva o credito da plataforma e os demais links do rodape.
 */
(function () {
  "use strict";
  if (window.__N27_GROOMB_CREDIT_GUARD__) return;

  const selector = 'a[href*="groomb.com.br" i], a:has(img[src*="groomb-logo.png" i]), img[src*="groomb-logo.png" i]';
  const guard = window.__N27_GROOMB_CREDIT_GUARD__ = { version: "1.1.0", hidden: 0 };

  function hide(element) {
    if (!element || element.nodeType !== 1) return;
    const target = element.matches("img") ? element.closest("a") || element : element;
    if (target.dataset.n27GroomHidden === "1") return;
    target.dataset.n27GroomHidden = "1";
    target.hidden = true;
    target.style.setProperty("display", "none", "important");
    guard.hidden++;
  }

  function scan(root) {
    if (!root || root.nodeType !== 1) return;
    if (root.matches(selector)) hide(root);
    root.querySelectorAll(selector).forEach(hide);
  }

  scan(document.documentElement);

  const observer = new MutationObserver(function (changes) {
    for (const change of changes) {
      if (change.type === "attributes") {
        scan(change.target);
      } else {
        change.addedNodes.forEach(scan);
      }
    }
  });

  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["href", "src"]
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      scan(document.documentElement);
    }, { once: true });
  }
  window.addEventListener("load", function () {
    scan(document.documentElement);
  }, { once: true });

  guard.scan = function () { scan(document.documentElement); return guard.hidden; };
})();
