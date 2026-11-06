<?php
declare(strict_types=1);
require_once __DIR__.'/../server/bootstrap.php';
nichelle_secure_session();nichelle_auth_required();
?><!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Prévia protegida — Nichelle</title>
<link rel="stylesheet" href="../public/galeria-videos.css">
<style>body{margin:0;font-family:system-ui,sans-serif}header{background:#f4f6fa;padding:24px}header a{color:#17467b}</style>
</head><body class="pagina-inicial"><header><a href="index.php">Voltar ao painel</a><h1>Prévia do rascunho · Galeria editorial</h1></header>
<main id="fwr-nichelle-video-slot" class="fwr-nichelle-video-slot"></main><script defer src="../public/galeria-videos.js" data-config-url="draft.php"></script>
</body></html>
