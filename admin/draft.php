<?php
declare(strict_types=1);
require_once __DIR__.'/../server/bootstrap.php';
nichelle_secure_session();nichelle_auth_required();
header('Content-Type: application/json; charset=utf-8');
echo json_encode(nichelle_read(nichelle_draft()) ?: nichelle_read(nichelle_published()), JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_THROW_ON_ERROR);
