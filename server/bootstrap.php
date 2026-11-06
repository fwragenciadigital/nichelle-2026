<?php
/** Private authentication and config management. Never put secrets in HTML/JS/GitHub. */
declare(strict_types=1);
function nichelle_env_ready(): bool {
 return strlen((string)getenv('NICHELLE_ADMIN_PASSWORD_HASH'))>20
     && strlen((string)getenv('NICHELLE_SESSION_SECRET'))>=32
     && nichelle_private_data_dir_ready();
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
 if(!nichelle_env_ready()){http_response_code(503);exit('Painel indisponível: configuração privada do servidor pendente.');}
 if(empty($_SESSION['nichelle_auth'])){http_response_code(403);exit('Acesso negado.');}
}
function nichelle_data(): string {
 $path=trim((string)getenv('NICHELLE_DATA_DIR'));
 if($path==='')throw new RuntimeException('Configure NICHELLE_DATA_DIR fora da pasta pública do site.');
 return rtrim($path,"/\\");
}
function nichelle_private_data_dir_ready(): bool {
 $path=trim((string)getenv('NICHELLE_DATA_DIR'));
 if($path===''||!str_starts_with($path,DIRECTORY_SEPARATOR))return false;
 $root=realpath((string)($_SERVER['DOCUMENT_ROOT']??''));
 $real=realpath($path);
 if($real===false||$real===DIRECTORY_SEPARATOR||!is_dir($real)||!is_writable($real))return false;
 if(PHP_SAPI!=='cli'&&$root===false)return false;
 if($root!==false){
  $root=rtrim(strtolower($root),"/\\");$real=strtolower($real);
  if($real===$root||str_starts_with($real,$root.DIRECTORY_SEPARATOR))return false;
 }
 return true;
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
  chmod($tmp,$path===nichelle_published()?0644:0640);
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
function nichelle_safe_public_url(string $raw,array $allowedHosts): string {
 $url=nichelle_https($raw);
 if($url==='')return '';
 $parts=parse_url($url);$host=strtolower((string)($parts['host']??''));
 if(!in_array($host,$allowedHosts,true))throw new InvalidArgumentException('A imagem precisa estar em um domínio HTTPS aprovado pela FWR.');
 parse_str((string)($parts['query']??''),$query);
 foreach(array_keys($query) as $key){
  if(preg_match('/token|auth|signature|credential|api[_-]?key|^sig$|^key$|^x-(?:amz|goog)-|^awsaccesskeyid$|^expires$/i',(string)$key))
   throw new InvalidArgumentException('Remova credenciais e parâmetros assinados da URL pública da imagem.');
 }
 return $url;
}
function nichelle_poster_hosts(): array {
 $configured=array_filter(array_map(static fn($host)=>strtolower(trim($host)),explode(',',(string)getenv('NICHELLE_POSTER_HOSTS'))));
 return array_values(array_unique(array_merge(['i.ytimg.com'],$configured)));
}
function nichelle_validate_config(array $cfg): void {
 $g=$cfg['modules']['videoGallery']??null;
 if(array_diff(array_keys($cfg),['schemaVersion','project','modules'])||!is_array($cfg['modules']??null)
  ||array_diff(array_keys($cfg['modules']),['videoGallery'])||($cfg['schemaVersion']??null)!==1||($cfg['project']??null)!=='nichelle-2026'||!is_array($g))
  throw new InvalidArgumentException('Configuração incompatível com o schema da galeria.');
 if(array_diff(array_keys($g),['enabled','placement','mobileMode','openMode','items']))
  throw new InvalidArgumentException('A galeria contém campos não permitidos.');
 if(!is_bool($g['enabled']??null)
  ||!in_array($g['placement']??null,['pending','after-brand-strip'],true)
  ||!in_array($g['mobileMode']??null,['pending','scroll-snap','grid'],true)
  ||!in_array($g['openMode']??null,['pending','modal','inline'],true)
  ||!is_array($g['items']??null)||count($g['items'])>4)
  throw new InvalidArgumentException('Configuração inválida para a galeria.');
 if($g['enabled']&&$g['placement']!=='after-brand-strip')
  throw new InvalidArgumentException('A galeria ativa exige o slot aprovado após a faixa de marcas.');
 if($g['items']!==[]&&array_keys($g['items'])!==range(0,count($g['items'])-1))
  throw new InvalidArgumentException('A lista de vídeos deve ser sequencial.');
 $ids=[];$active=0;
 foreach($g['items'] as $item){
  $allowedItemKeys=['id','enabled','order','provider','posterUrl','videoUrl','alt'];
  if(!is_array($item)||array_diff(array_keys($item),$allowedItemKeys))
   throw new InvalidArgumentException('Um dos cards contém campos não permitidos.');
  if(!is_array($item)||!preg_match('/^[a-z0-9][a-z0-9_-]{0,40}$/',(string)($item['id']??''))
   ||isset($ids[$item['id']])||!is_bool($item['enabled']??null)||!is_int($item['order']??null)
   ||!in_array($item['provider']??null,['youtube'],true)||!is_string($item['videoUrl']??null)
   ||!is_string($item['alt']??null)||mb_strlen($item['alt'])<5||mb_strlen($item['alt'])>180)
   throw new InvalidArgumentException('Um dos cards não atende ao schema da galeria.');
  if($item['order']<0||$item['order']>100)
   throw new InvalidArgumentException('A ordem do card está inválida.');
  $ids[$item['id']]=true;
  $id=nichelle_youtube_id($item['videoUrl']);
  if($id===''||$item['videoUrl']!=='https://www.youtube.com/shorts/'.$id)
   throw new InvalidArgumentException('Cada vídeo deve usar uma URL canônica válida do YouTube.');
  if(array_key_exists('posterUrl',$item)&&!is_string($item['posterUrl']))throw new InvalidArgumentException('A capa deve ser uma URL em texto.');
  $poster=(string)($item['posterUrl']??'');
  if($poster!=='')nichelle_safe_public_url($poster,nichelle_poster_hosts());
  if($item['enabled'])$active++;
 }
 if($g['enabled']&&($active!==4||count($g['items'])!==4))
  throw new InvalidArgumentException('A galeria ativa exige quatro vídeos ativos.');
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
 return nichelle_rate_locked(static function($path){
  $data=nichelle_read($path);
  return time()-(int)($data['start']??0)<900 && (int)($data['count']??0)>=5;
 });
}
function nichelle_rate_fail(): void {
 nichelle_rate_locked(static function($path){
  $data=nichelle_read($path);
  if(time()-(int)($data['start']??0)>=900)$data=['start'=>time(),'count'=>0];
  $data['count']=((int)($data['count']??0))+1;
  nichelle_write($path,$data);
 });
}
function nichelle_rate_clear(): void {
 nichelle_rate_locked(static function($path){if(is_file($path))@unlink($path);});
}
function nichelle_rate_locked(callable $callback): mixed {
 $path=nichelle_rate_file();$lock=fopen($path.'.lock','c');
 if($lock===false)throw new RuntimeException('Não foi possível acessar o controle de tentativas.');
 try{if(!flock($lock,LOCK_EX))throw new RuntimeException('Não foi possível bloquear o controle de tentativas.');return $callback($path);}
 finally{flock($lock,LOCK_UN);fclose($lock);}
}
