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
  if($action==='logout'){$_SESSION=[];setcookie(session_name(),'',['expires'=>time()-42000,'path'=>'/','secure'=>PHP_SAPI!=='cli','httponly'=>true,'samesite'=>'Strict']);session_destroy();header('Location: index.php');exit;}
  if($action==='save'||$action==='publish'){
   $items=[];$entries=[];
   for($i=0;$i<4;$i++){
    $poster=nichelle_safe_public_url((string)($_POST['poster'][$i]??''),nichelle_poster_hosts());$rawVideo=nichelle_https((string)($_POST['video'][$i]??''));
    $alt=trim((string)($_POST['alt'][$i]??''));
    $videoId=$rawVideo!==''?nichelle_youtube_id($rawVideo):'';
    if($rawVideo!==''&&$videoId==='')throw new RuntimeException('Cole um link válido de Shorts, watch ou youtu.be.');
    if($videoId==='')continue;
    $video='https://www.youtube.com/shorts/'.$videoId;
    if($alt==='')$alt='Vídeo de produto Nichelle '.($i+1);
    if(mb_strlen($alt)<5||mb_strlen($alt)>180)throw new RuntimeException('A descrição deve ter entre 5 e 180 caracteres.');
    $entries[]=['position'=>max(1,min(4,(int)($_POST['order'][$i]??($i+1)))),
      'item'=>['id'=>'video-'.str_pad((string)(count($entries)+1),2,'0',STR_PAD_LEFT),'enabled'=>isset($_POST['active'][$i]),
      'order'=>0,'provider'=>'youtube','posterUrl'=>$poster,'videoUrl'=>$video,'alt'=>$alt]];
   }
   usort($entries,static fn($a,$b)=>$a['position']<=>$b['position']);
   foreach($entries as $entry){$entry['item']['order']=count($items)+1;$items[]=$entry['item'];}
   $enabled=isset($_POST['galleryEnabled']);
   if($action==='publish'&&$enabled){
     if(!$items)throw new RuntimeException('É necessário cadastrar vídeos antes da publicação.');
     $active=array_values(array_filter($items,static fn($item)=>$item['enabled']));
     if(count($active)!==4)throw new RuntimeException('Esta seção usa quatro vídeos ativos.');
   }
   $cfg=['schemaVersion'=>1,'project'=>'nichelle-2026','modules'=>['videoGallery'=>[
     'enabled'=>$enabled,'placement'=>'after-brand-strip','mobileMode'=>'scroll-snap','openMode'=>'modal','items'=>$items
   ]]];
   nichelle_validate_config($cfg,$action==='publish');
   nichelle_write(nichelle_draft(),$cfg);
   if($action==='publish'){
     $dest=nichelle_published();$history=nichelle_history();
     if(is_file($dest)){
      $current=nichelle_read($dest);nichelle_validate_config($current);
      if(!is_dir($history)&&!mkdir($history,0750,true)&&!is_dir($history))throw new RuntimeException('Não foi possível criar o histórico.');
      nichelle_write($history.'/'.gmdate('Ymd-His').'-'.bin2hex(random_bytes(3)).'.json',$current);
     }
     nichelle_write($dest,$cfg);$err='Publicado: a configuração pública foi atualizada.';
   }else $err='Rascunho salvo sem alterar a configuração pública.';
  }
  if($action==='rollback'){
   $history=glob(nichelle_history().'/*.json')?:[];rsort($history);
   if(!$history)throw new RuntimeException('Não existe versão anterior.');
   $data=nichelle_read($history[0]);nichelle_validate_config($data);
   $current=nichelle_read(nichelle_published());if($current){nichelle_validate_config($current);nichelle_write($history.'/'.gmdate('Ymd-His').'-'.bin2hex(random_bytes(3)).'.json',$current);}
   nichelle_write(nichelle_published(),$data);nichelle_write(nichelle_draft(),$data);
   $err='Versão anterior restaurada.';
  }
 }catch(Throwable $e){$err=$e->getMessage();}
}
$login=!empty($_SESSION['nichelle_auth']);
$config=nichelle_read(nichelle_draft())?:nichelle_read(nichelle_published());
try{if($config)nichelle_validate_config($config,false);}catch(Throwable $invalid){$config=[];$err='A configuração armazenada não é válida. Salve um rascunho corrigido antes de publicar.';}
$posterHostsJson=json_encode(nichelle_poster_hosts(),JSON_HEX_TAG|JSON_HEX_APOS|JSON_HEX_AMP|JSON_HEX_QUOT|JSON_THROW_ON_ERROR);
$gallery=$config['modules']['videoGallery']??[];$items=$gallery['items']??[];
?><!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>FWR Control · Nichelle</title>
<style>*{box-sizing:border-box}body{margin:0;background:#f5f6f9;color:#16263b;font:15px system-ui,sans-serif;padding:28px 16px}.page{max-width:1000px;margin:auto;padding:clamp(16px,3vw,36px);border-radius:18px;background:white;box-shadow:0 12px 35px #21395616}h1{margin:0 0 4px;font-size:24px}h2{font-size:18px;margin:28px 0 14px}.muted{color:#687a91}.notice{margin:18px 0;padding:12px 16px;border-radius:9px;background:#edf3ff}.group{margin:12px 0}label{display:block;font-size:13px;font-weight:650;margin-bottom:5px}input:not([type=checkbox]),select{width:100%;padding:10px;border:1px solid #cdd3df;border-radius:8px;font:inherit}input[type=checkbox]{margin-right:7px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px}.card{border:1px solid #e1e5ec;padding:16px;border-radius:13px}.card[hidden]{display:none}.card-head,.card-order{display:flex;align-items:center;justify-content:space-between;gap:6px}.card-order button{padding:6px 10px}.cover-preview{position:relative;aspect-ratio:9/16;max-width:180px;margin:10px auto;background:linear-gradient(145deg,#eee8ea,#d7d9df);border-radius:12px;display:grid;place-items:center;overflow:hidden;color:#667;font-size:12px;text-align:center;padding:12px}.cover-preview img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.cover-preview img[hidden]{display:none}button,.btn{padding:11px 16px;border-radius:9px;background:#1b3654;color:white;border:0;cursor:pointer;font:inherit;text-decoration:none}.secondary{background:#e7ecf4;color:#17283d}.actions{display:flex;flex-wrap:wrap;gap:9px;margin-top:18px}.top{display:flex;align-items:center;justify-content:space-between;gap:10px}</style></head>
<body><main class="page"><div class="top"><div><h1>FWR Control — Nichelle</h1><p class="muted">Seções exclusivas · galeria de vídeos</p></div><?php if($login): ?><form method="post"><input type="hidden" name="csrf" value="<?=nichelle_h(nichelle_csrf())?>"><button class="secondary" name="action" value="logout">Sair</button></form><?php endif;?></div>
<?php if($err):?><p class="notice" role="status"><?=nichelle_h($err)?></p><?php endif;?>
<?php if(!$ready):?><p class="notice">Acesso bloqueado: configure a senha do cliente e o segredo de sessão no servidor.</p><?php endif;?>
<?php if(!$login):?>
<form method="post"><input type="hidden" name="csrf" value="<?=nichelle_h(nichelle_csrf())?>"><input type="hidden" name="action" value="login"><div class="group"><label for="pass">Senha do cliente</label><input id="pass" type="password" name="password" required autocomplete="current-password"></div><button type="submit" <?=!$ready?'disabled':''?>>Entrar</button></form>
<?php else:?>
<p class="notice">Alterações só aparecem para os visitantes após clicar em <strong>Publicar</strong>. A prévia exige autenticação.</p>
<form method="post"><input type="hidden" name="csrf" value="<?=nichelle_h(nichelle_csrf())?>">
<div class="group"><label><input type="checkbox" name="galleryEnabled" <?=!empty($gallery['enabled'])?'checked':''?>>Ativar galeria na loja</label></div>
<h2>Vídeos (até 4 cards)</h2><p class="muted">Cole um link real de YouTube Shorts, watch ou youtu.be. A thumbnail é detectada automaticamente. Capas personalizadas precisam estar em HTTPS e em domínio previamente aprovado pela FWR.</p><div class="grid" id="video-cards"><?php for($i=0;$i<4;$i++):$it=$items[$i]??[];$empty=empty($it['videoUrl']);?><section class="card" data-video-card <?=$empty?'hidden':''?>><div class="card-head"><strong>Vídeo <span data-card-number><?=($i+1)?></span></strong><div class="card-order"><button type="button" class="secondary" data-move="up" aria-label="Mover vídeo para cima">↑</button><button type="button" class="secondary" data-move="down" aria-label="Mover vídeo para baixo">↓</button><button type="button" class="secondary" data-remove>Remover</button></div></div><input type="hidden" name="order[<?=$i?>]" value="<?=nichelle_h($it['order']??($i+1))?>"><div class="group"><label><input type="checkbox" name="active[<?=$i?>]" <?=!empty($it['enabled'])?'checked':''?>>Ativo</label></div>
<div class="group"><label for="p<?=$i?>">Capa personalizada (opcional)</label><input id="p<?=$i?>" name="poster[<?=$i?>]" type="url" data-poster value="<?=nichelle_h($it['posterUrl']??'')?>"></div>
<div class="group"><label for="v<?=$i?>">URL do vídeo YouTube</label><input id="v<?=$i?>" name="video[<?=$i?>]" type="url" data-video value="<?=nichelle_h($it['videoUrl']??'')?>" placeholder="https://www.youtube.com/shorts/…"></div>
<div class="group"><label for="a<?=$i?>">Descrição da capa</label><input id="a<?=$i?>" name="alt[<?=$i?>]" maxlength="180" value="<?=nichelle_h($it['alt']??'')?>"></div><div class="cover-preview" aria-live="polite"><img data-preview alt="Prévia da capa" hidden><span data-cover-fallback>Insira a URL do vídeo para ver a thumbnail</span></div></section><?php endfor;?></div><button type="button" id="add-video" class="secondary">Adicionar vídeo</button>
<div class="actions"><button name="action" value="save" class="secondary">Salvar rascunho</button><a class="btn secondary" href="preview.php" target="_blank" rel="noopener">Prévia protegida</a><button name="action" value="publish">Publicar</button></div></form>
<form method="post" class="actions" onsubmit="return confirm('Restaurar a versão anterior?')"><input type="hidden" name="csrf" value="<?=nichelle_h(nichelle_csrf())?>"><button class="secondary" name="action" value="rollback">Reverter publicação</button></form>
<?php endif;?></main><?php if($login):?><script>
(()=>{const cards=document.querySelector('#video-cards'),add=document.querySelector('#add-video'),allowedHosts=<?=$posterHostsJson?>;if(!cards||!add)return;
const idOf=raw=>{try{const u=new URL(raw);if(u.protocol!=='https:')return '';let id='';if(['youtu.be','www.youtu.be'].includes(u.hostname))id=u.pathname.split('/')[1]||'';else if(['youtube.com','www.youtube.com','m.youtube.com'].includes(u.hostname)){if(u.pathname==='/watch')id=u.searchParams.get('v')||'';else id=(u.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{11})(?:\/|$)/)||[])[1]||'';}return /^[\w-]{11}$/.test(id)?id:'';}catch{return '';}};
const visible=()=>[...cards.querySelectorAll('[data-video-card]:not([hidden])')];
const sync=()=>{const rows=visible();rows.forEach((card,index)=>{card.querySelector('[data-card-number]').textContent=String(index+1);card.querySelector('[name^="order["]').value=String(index+1);card.querySelector('[data-move="up"]').disabled=index===0;card.querySelector('[data-move="down"]').disabled=index===rows.length-1;});add.disabled=rows.length>=4;};
const preview=card=>{const id=idOf(card.querySelector('[data-video]').value.trim()),custom=card.querySelector('[data-poster]').value.trim(),img=card.querySelector('[data-preview]'),fallback=card.querySelector('[data-cover-fallback]');let src=id?'https://i.ytimg.com/vi/'+id+'/oar2.jpg':'';if(custom){try{const u=new URL(custom);if(u.protocol==='https:'&&allowedHosts.includes(u.hostname.toLowerCase()))src=u.href;else fallback.textContent='Domínio da capa não aprovado; será usada a thumbnail do vídeo.';}catch{fallback.textContent='URL da capa inválida; será usada a thumbnail do vídeo.';}}img.onerror=()=>{img.hidden=true;fallback.textContent='Thumbnail indisponível; será exibida uma capa de fallback.';};img.onload=()=>{img.hidden=false;fallback.textContent='';};img.src=src;if(!src){img.hidden=true;fallback.textContent='Insira a URL do vídeo para ver a thumbnail';}};
cards.addEventListener('input',e=>{if(e.target.matches('[data-video],[data-poster]'))preview(e.target.closest('[data-video-card]'));});
cards.addEventListener('click',e=>{const card=e.target.closest('[data-video-card]');if(!card)return;if(e.target.closest('[data-remove]')){card.querySelector('[data-video]').value='';card.querySelector('[data-poster]').value='';card.querySelector('[name^="alt["]').value='';card.querySelector('[name^="active["]').checked=false;card.hidden=true;preview(card);sync();}else if(e.target.closest('[data-move]')){const dir=e.target.closest('[data-move]').dataset.move,rows=visible(),index=rows.indexOf(card),other=rows[index+(dir==='up'?-1:1)];if(other){if(dir==='up')cards.insertBefore(card,other);else cards.insertBefore(other,card);sync();}}});
add.addEventListener('click',()=>{const card=cards.querySelector('[data-video-card][hidden]');if(card){card.hidden=false;sync();card.querySelector('[data-video]').focus();}});
cards.querySelectorAll('[data-video-card]').forEach(card=>{if(!card.hidden)preview(card);});sync();})();
</script><?php endif;?></body></html>
