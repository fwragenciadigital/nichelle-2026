/* Interações exclusivamente visuais da fixture local/de preview. */
(function () {
  "use strict";
  if (document.body.dataset.nichellePreviewFixture !== "true") return;
  const note = document.createElement("span");
  note.className = "preview-only-badge";
  note.textContent = "CONTEÚDO DE PRÉVIA";
  document.body.appendChild(note);
  requestAnimationFrame(function () { document.body.removeAttribute("data-preview-pending"); });
})();
