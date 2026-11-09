import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = async (path) => readFile(new URL(path, import.meta.url), "utf8");
const bootstrap = await read("../server/bootstrap.php");
const admin = await read("../admin/index.php");
const draft = await read("../admin/draft.php");

test("dashboard valida estrutura no rascunho e exige quatro vídeos somente ao publicar", () => {
  assert.match(bootstrap, /function nichelle_validate_config\(array \$cfg,bool \$requirePublishable=true\)/);
  assert.match(bootstrap, /if\(\$requirePublishable&&\$g\['enabled'\]&&\(\$active!==4\|\|count\(\$g\['items'\]\)!==4\)\)/);
  assert.match(admin, /nichelle_validate_config\(\$cfg,\$action==='publish'\)/);
  assert.match(admin, /nichelle_validate_config\(\$config,false\)/);
});

test("ações de escrita exigem sessão e CSRF; painel mantém senha apenas no servidor", async () => {
  assert.match(admin, /nichelle_secure_session\(\)/);
  assert.match(admin, /nichelle_csrf_verify\(\)/);
  assert.match(admin, /nichelle_auth_required\(\)/);
  assert.match(admin, /password_verify\(/);
  assert.match(admin, /\$action==='rollback'/);
  assert.match(draft, /nichelle_auth_required\(\)/);
  assert.match(draft, /Cache-Control|nichelle_secure_session/);
  assert.doesNotMatch(await read("../public/nichelle.js"), /NICHELLE_ADMIN_PASSWORD_HASH|NICHELLE_SESSION_SECRET|password_verify/);
});
