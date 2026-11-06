<?php
declare(strict_types=1);
require_once __DIR__.'/../server/bootstrap.php';
nichelle_secure_session();
$err='';$ready=nichelle_env_ready();
if($_SERVER['REQUEST_METHOD']==='POST'){
 nichelle_csrf_verify();
 try{
  $action=(string)($_POST['action']??'');
  if($action==='login'){
   if(!$ready)throw new RuntimeException('Configuração da senha pendente.');
   if(nichelle_rate_blocked())throw new RuntimeException('Acesso temporariamente bloqueado; tente em 15 minutos.');
   if(!password_verify((string)($_POST['password']??''),(string)getenv('NICHELLE_ADMIN_PASSWORD_HASH'))){
    nichelle_rate_fail();throw new RuntimeException('Senha inválida.');
   }
   nichelle_rate_clear();session_regenerate_id(true);$_SESSION['nichelle_auth']=true;
   header('Location: index.php');exit;
  }
  nichelle_auth_required();
  if($action==='logout'){$_SESSION=[];session_destroy();header('Location: index.php');exit;}
  if($action==='save'||$action==='publish'){
   $items=[];
   for($i=0;$i<12;$i++){
    $poster=nichelle_https((string)($_POST['poster'][$i]??''));$video=nichelle_https((string)($_POST['video'][$i]??''));
    $alt=trim((string)($_POST['alt'][$i]??''));
    if($poster===''&&$video===''&&$alt==='')continue;
    if(mb_strlen($alt)>180)throw new RuntimeException('Descrição maior que 180 caracteres.');
    $items[]=['id'=>'video-'.str_pad((string)(count($items)+1),2,'0',STR_PAD_LEFT),'enabled'=>isset($_POST['active'][$i]),
      'order'=>count($items)+1,'provider'=>(($_POST['provider'][$i]??'mp4')==='vimeo'?'vimeo':'mp4'),
      'posterUrl'=>$poster,'videoUrl'=>$video,'alt'=>$alt];
   }
   $enabled=isset($_POST['galleryEnabled']);$title=trim((string)($_POST['title']??''));
   if(mb_strlen($title)>90)throw new RuntimeException('Título maior que 90 caracteres.');
   if($action==='publish'&&$enabled){
     if(!$items)throw new RuntimeException('É necessário cadastrar vídeos antes da publicação.');
     foreach($items as $item)if($item['enabled']&&(!$item['posterUrl']||!$item['videoUrl']))throw new RuntimeException('Cada vídeo ativo precisa de capa e vídeo reais HTTPS.');
   }
   $cfg=['schemaVersion'=>1,'project'=>'nichelle-2026','modules'=>['videoGallery'=>[
     'enabled'=>$enabled,'title'=>$title,'placement'=>'after-native-showcase','mobileMode'=>'scroll-snap','openMode'=>'modal','items'=>$items
   ]]];
   nichelle_write(nichelle_draft(),$cfg);
   if($action==='publish'){
     $dest=nichelle_published();$history=nichelle_history();
     if(is_file($dest)){if(!is_dir($history))mkdir($history,0750,true);copy($dest,$history.'/'.gmdate('Ymd-His').'-'.bin2hex(random_bytes(3)).'.json');}
     nichelle_write($dest,$cfg);$err='Publicado: a configuração pública foi atualizada.';
   }else $err='Rascunho salvo sem alterar a configuração pública.';
  }
  if($action==='rollback'){
   $history=glob(nichelle_history().'/*.json')?:[];rsort($history);
   if(!$history)throw new RuntimeException('Não existe versão anterior.');
   $data=nichelle_read($history[0]);nichelle_write(nichelle_published(),$data);nichelle_write(nichelle_draft(),$data);
   $err='Versão anterior restaurada.';
  }
 }catch(Throwable $e){$err=$e->getMessage();}
}
$login=!empty($_SESSION['nichelle_auth']);
$config=nichelle_read(nichelle_draft())?:nichelle_read(nichelle_published());
$gallery=$config['modules']['videoGallery']??[];$items=$gallery['items']??[];
?><!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>FWR Control · Nichelle</title>
<style>*{box-sizing:border-box}body{margin:0;background:#f5f6f9;color:#16263b;font:15px system-ui,sans-serif;padding:28px 16px}.page{max-width:1000px;margin:auto;padding:clamp(16px,3vw,36px);border-radius:18px;background:white;box-shadow:0 12px 35px #21395616}h1{margin:0 0 4px;font-size:24px}h2{font-size:18px;margin:28px 0 14px}.muted{color:#687a91}.notice{margin:18px 0;padding:12px 16px;border-radius:9px;background:#edf3ff}.group{margin:12px 0}label{display:block;font-size:13px;font-weight:650;margin-bottom:5px}input:not([type=checkbox]),select{width:100%;padding:10px;border:1px solid #cdd3df;border-radius:8px;font:inherit}input[type=checkbox]{margin-right:7px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px}.card{border:1px solid #e1e5ec;padding:16px;border-radius:13px}button,.btn{padding:11px 16px;border-radius:9px;background:#1b3654;color:white;border:0;cursor:pointer;font:inherit;text-decoration:none}.secondary{background:#e7ecf4;color:#17283d}.actions{display:flex;flex-wrap:wrap;gap:9px;margin-top:18px}.top{display:flex;align-items:center;justify-content:space-between;gap:10px}</style></head>
<body><main class="page"><div class="top"><div><h1>FWR Control — Nichelle</h1><p class="muted">Seções exclusivas · galeria de vídeos</p></div><?php if($login): ?><form method="post"><input type="hidden" name="csrf" value="<?=nichelle_h(nichelle_csrf())?>"><button class="secondary" name="action" value="logout">Sair</button></form><?php endif;?></div>
<?php if($err):?><p class="notice" role="status"><?=nichelle_h($err)?></p><?php endif;?>
<?php if(!$ready):?><p class="notice">Acesso bloqueado: configure a senha do cliente e o segredo de sessão no servidor.</p><?php endif;?>
<?php if(!$login):?>
<form method="post"><input type="hidden" name="csrf" value="<?=nichelle_h(nichelle_csrf())?>"><input type="hidden" name="action" value="login"><div class="group"><label for="pass">Senha do cliente</label><input id="pass" type="password" name="password" required autocomplete="current-password"></div><button type="submit" <?=!$ready?'disabled':''?>>Entrar</button></form>
<?php else:?>
<p class="notice">Alterações só aparecem para os visitantes após clicar em <strong>Publicar</strong>. A prévia exige autenticação.</p>
<form method="post"><input type="hidden" name="csrf" value="<?=nichelle_h(nichelle_csrf())?>">
<div class="group"><label><input type="checkbox" name="galleryEnabled" <?=!empty($gallery['enabled'])?'checked':''?>>Ativar galeria na loja</label></div>
<div class="group"><label for="title">Título (opcional)</label><input id="title" name="title" maxlength="90" value="<?=nichelle_h($gallery['title']??'')?>"></div>
<h2>Vídeos (até 12)</h2><div class="grid"><?php for($i=0;$i<12;$i++):$it=$items[$i]??[];?><section class="card"><strong>Card <?=($i+1)?></strong><div class="group"><label><input type="checkbox" name="active[<?=$i?>]" <?=!empty($it['enabled'])?'checked':''?>>Ativo</label></div>
<div class="group"><label for="p<?=$i?>">URL da capa HTTPS</label><input id="p<?=$i?>" name="poster[<?=$i?>]" type="url" value="<?=nichelle_h($it['posterUrl']??'')?>"></div>
<div class="group"><label for="v<?=$i?>">URL do vídeo HTTPS</label><input id="v<?=$i?>" name="video[<?=$i?>]" type="url" value="<?=nichelle_h($it['videoUrl']??'')?>"></div>
<div class="group"><label for="o<?=$i?>">Formato</label><select id="o<?=$i?>" name="provider[<?=$i?>]"><option value="mp4">MP4</option><option value="vimeo" <?=(($it['provider']??'')==='vimeo'?'selected':'')?>>Vimeo</option></select></div>
<div class="group"><label for="a<?=$i?>">Descrição</label><input id="a<?=$i?>" name="alt[<?=$i?>]" maxlength="180" value="<?=nichelle_h($it['alt']??'')?>"></div></section><?php endfor;?></div>
<div class="actions"><button name="action" value="save" class="secondary">Salvar rascunho</button><a class="btn secondary" href="preview.php" target="_blank" rel="noopener">Prévia protegida</a><button name="action" value="publish">Publicar</button></div></form>
<form method="post" class="actions" onsubmit="return confirm('Restaurar a versão anterior?')"><input type="hidden" name="csrf" value="<?=nichelle_h(nichelle_csrf())?>"><button class="secondary" name="action" value="rollback">Reverter publicação</button></form>
<?php endif;?></main></body></html>
