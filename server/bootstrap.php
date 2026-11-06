<?php
/** Private authentication and config management. Never put secrets in HTML/JS/GitHub. */
declare(strict_types=1);
function nichelle_env_ready(): bool {
 return strlen((string)getenv('NICHELLE_ADMIN_PASSWORD_HASH'))>20
     && strlen((string)getenv('NICHELLE_SESSION_SECRET'))>=32;
}
function nichelle_secure_session(): void {
 if(session_status()===PHP_SESSION_ACTIVE)return;
 if(PHP_SAPI!=='cli' && (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS']==='off')){
  http_response_code(403);exit('Este painel exige HTTPS.');
 }
 session_name('FWRNICHELLE');
 session_set_cookie_params(['lifetime'=>0,'path'=>'/','secure'=>PHP_SAPI!=='cli','httponly'=>true,'samesite'=>'Strict']);
 session_start();
 header('X-Frame-Options: DENY');
 header('X-Content-Type-Options: nosniff');
 header('Referrer-Policy: no-referrer');
 header('Cache-Control: private, no-store');
}
function nichelle_h(mixed $str): string {return htmlspecialchars((string)$str,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8');}
function nichelle_csrf(): string {
 if(empty($_SESSION['csrf']))$_SESSION['csrf']=bin2hex(random_bytes(24));
 return $_SESSION['csrf'];
}
function nichelle_csrf_verify(): void {
 if(!hash_equals(nichelle_csrf(),(string)($_POST['csrf']??''))){http_response_code(403);exit('CSRF inválido.');}
}
function nichelle_auth_required(): void {
 if(empty($_SESSION['nichelle_auth'])){http_response_code(403);exit('Acesso negado.');}
}
function nichelle_data(): string {
 return (string)(getenv('NICHELLE_DATA_DIR')?:__DIR__.'/data');
}
function nichelle_draft(): string {return nichelle_data().'/draft.json';}
function nichelle_history(): string {return nichelle_data().'/history';}
function nichelle_published(): string {return dirname(__DIR__).'/public/galeria-publicada.json';}
function nichelle_read(string $path): array {
 if(!is_file($path))return [];
 $decoded=json_decode((string)file_get_contents($path),true);
 return is_array($decoded)?$decoded:[];
}
function nichelle_write(string $path,array $data): void {
 $dir=dirname($path);
 if(!is_dir($dir)&&!mkdir($dir,0750,true)&&!is_dir($dir))throw new RuntimeException('Diretório não gravável.');
 $payload=json_encode($data,JSON_THROW_ON_ERROR|JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT)."\n";
 $tmp=tempnam($dir,'nichelle-');if($tmp===false)throw new RuntimeException('Erro ao criar arquivo.');
 try{
  if(file_put_contents($tmp,$payload,LOCK_EX)===false)throw new RuntimeException('Erro ao salvar JSON.');
  chmod($tmp,0640);
  if(!rename($tmp,$path))throw new RuntimeException('Erro ao publicar JSON.');
 }finally{if(is_file($tmp))@unlink($tmp);}
}
function nichelle_https(string $url): string {
 $url=trim($url);if($url==='')return '';
 if(strlen($url)>1500 || filter_var($url,FILTER_VALIDATE_URL)===false || parse_url($url,PHP_URL_SCHEME)!=='https'
  || parse_url($url,PHP_URL_USER)!==null || parse_url($url,PHP_URL_PASS)!==null)
  throw new InvalidArgumentException('As URLs precisam ser HTTPS, válidas e sem credenciais.');
 return $url;
}
/**
 * Valida o ID de Shorts/watch/links curtos do YouTube sem consultar APIs externas.
 * Retorna vazio para hosts não oficiais ou IDs malformados.
 */
function nichelle_youtube_id(string $raw): string {
 $url=parse_url(trim($raw));
 if(!is_array($url)||strtolower((string)($url['scheme']??''))!=='https')return '';
 $host=strtolower((string)($url['host']??''));
 $path=(string)($url['path']??'');
 $id='';
 if(in_array($host,['youtu.be','www.youtu.be'],true)){
  if(preg_match('~^/([A-Za-z0-9_-]{11})(?:/|$)~',$path,$m))$id=$m[1];
 }elseif(in_array($host,['youtube.com','www.youtube.com','m.youtube.com','youtube-nocookie.com','www.youtube-nocookie.com'],true)){
  if($path==='/watch'){
   parse_str((string)($url['query']??''),$q);
   if(is_string($q['v']??null))$id=$q['v'];
  }elseif(preg_match('~^/(?:shorts|embed|live)/([A-Za-z0-9_-]{11})(?:/|$)~',$path,$m))$id=$m[1];
 }
 return preg_match('/^[A-Za-z0-9_-]{11}$/D',$id)===1?$id:'';
}
function nichelle_rate_file(): string {
 $secret=(string)getenv('NICHELLE_SESSION_SECRET');
 $ip=(string)($_SERVER['REMOTE_ADDR']??'unknown');
 return nichelle_data().'/rate-'.hash_hmac('sha256',$ip,$secret).'.json';
}
function nichelle_rate_blocked(): bool {
 $data=nichelle_read(nichelle_rate_file());
 return time()-(int)($data['start']??0)<900 && (int)($data['count']??0)>=5;
}
function nichelle_rate_fail(): void {
 $path=nichelle_rate_file();$data=nichelle_read($path);
 if(time()-(int)($data['start']??0)>=900)$data=['start'=>time(),'count'=>0];
 $data['count']=((int)($data['count']??0))+1;
 nichelle_write($path,$data);
}
function nichelle_rate_clear(): void {
 $path=nichelle_rate_file();if(is_file($path))@unlink($path);
}
