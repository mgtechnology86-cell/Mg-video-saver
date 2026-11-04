"use strict";
const CONFIG={contactEmail:""}; // put your contact email here
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const KEY="mgvs_library";
let lib=[];try{lib=JSON.parse(localStorage.getItem(KEY)||"[]")}catch{lib=[]}
const saveLib=()=>{try{localStorage.setItem(KEY,JSON.stringify(lib))}catch{toast("Storage is full or blocked by your browser. Delete saved videos or allow site storage.","err")}$("#count").textContent=lib.length};
function toast(m,t){[...$("#toasts").children].forEach(c=>{if(c.textContent===m)c.remove()});while($("#toasts").children.length>=2)$("#toasts").firstChild.remove();const d=document.createElement("div");d.className="toast "+(t||"");d.textContent=m;$("#toasts").append(d);setTimeout(()=>d.remove(),4500)}
const fmt=s=>{s=Math.floor(s||0);const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=String(s%60).padStart(2,"0");return h?`${h}:${String(m).padStart(2,"0")}:${x}`:`${m}:${x}`};
const mb=b=>(b/1048576).toFixed(1)+" MB";
function go(id){$$(".page").forEach(p=>p.classList.toggle("on",p.id===id));$$("nav [data-go]").forEach(b=>b.classList.toggle("act",b.dataset.go===id));$("#nav").classList.remove("open");$("#burger").setAttribute("aria-expanded","false");scrollTo(0,0);if(id==="library")renderLib();history.replaceState(null,"","#"+id)}
$$("[data-go]").forEach(b=>b.addEventListener("click",e=>{e.preventDefault();go(b.dataset.go)}));
$("#burger").onclick=()=>{const o=$("#nav").classList.toggle("open");$("#burger").setAttribute("aria-expanded",o)};

/* ---------- YouTube ---------- */
function ytId(u){try{const x=new URL(u.trim()),h=x.hostname.replace(/^(www|m|music)\./,"");let id=null;
if(h==="youtu.be")id=x.pathname.slice(1).split("/")[0];
else if(h==="youtube.com"||h==="youtube-nocookie.com"){if(x.pathname==="/watch")id=x.searchParams.get("v");else{const m=x.pathname.match(/^\/(shorts|embed|live|v)\/([^/?]+)/);if(m)id=m[2]}}
return id&&/^[\w-]{11}$/.test(id)?id:null}catch{return null}}
let ytp=null,cur=null;
const loadYT=()=>window.YT&&YT.Player?Promise.resolve():new Promise(res=>{window.onYouTubeIframeAPIReady=res;const s=document.createElement("script");s.src="https://www.youtube.com/iframe_api";s.onerror=()=>res();document.head.append(s)});
async function processLink(){
 const v=$("#ytUrl").value;if(!v.trim())return toast("Paste a YouTube link first.","err");
 const id=ytId(v);if(!id)return toast("That is not a valid YouTube video link. Use a youtube.com/watch, youtu.be or Shorts link.","err");
 if(!navigator.onLine)return toast("You are offline. Check your internet connection.","err");
 $("#ytLoad").hidden=false;$("#ytCard").hidden=true;
 try{
  const r=await fetch("https://www.youtube.com/oembed?format=json&url="+encodeURIComponent("https://www.youtube.com/watch?v="+id));
  if(!r.ok)throw new Error(r.status===401||r.status===403?"This video is private or does not allow embedding.":"This video is unavailable or was not found.");
  const d=await r.json();
  cur={type:"yt",id,url:v.trim(),title:d.title,channel:d.author_name,thumb:"https://i.ytimg.com/vi/"+id+"/hqdefault.jpg"};
  $("#ytTitle").textContent=cur.title;$("#ytChan").textContent=cur.channel;$("#ytDur").textContent="—";$("#ytThumb").src=cur.thumb;$("#ytOpen").href="https://www.youtube.com/watch?v="+id;
  $("#ytCard").hidden=false;
  await loadYT();
  if(window.YT&&YT.Player){if(ytp&&ytp.destroy)ytp.destroy();$("#ytPlayerWrap").innerHTML='<div id="ytPlayer"></div>';
   ytp=new YT.Player("ytPlayer",{videoId:id,playerVars:{rel:0,playsinline:1},events:{onReady:e=>{const d=e.target.getDuration();if(d){cur.dur=d;$("#ytDur").textContent=fmt(d)}},onError:()=>toast("YouTube cannot play this video here.","err")}})}
 }catch(e){toast(e instanceof TypeError?"Could not reach YouTube. Check your connection.":e.message,"err")}
 finally{$("#ytLoad").hidden=true}
}
$("#processBtn").onclick=processLink;
$("#ytUrl").addEventListener("keydown",e=>{if(e.key==="Enter")processLink()});
$("#clearBtn").onclick=()=>{$("#ytUrl").value="";$("#ytCard").hidden=true;if(ytp&&ytp.destroy){ytp.destroy();ytp=null}};
$("#pasteBtn").onclick=async()=>{try{$("#ytUrl").value=await navigator.clipboard.readText()}catch{toast("Your browser blocked clipboard access. Long-press the box and choose Paste.","err")}};
$("#ytSave").onclick=()=>cur&&addLib({type:"yt",url:cur.url,title:cur.title,channel:cur.channel,thumb:cur.thumb});

/* ---------- Library ---------- */
function addLib(o){if(lib.some(x=>x.url===o.url))return toast("Already in your library.");lib.unshift({id:Date.now().toString(36),cat:"General",...o});saveLib();toast("Saved to My Library.")}
function renderLib(){
 const q=$("#q").value.toLowerCase(),c=$("#catF").value,L=$("#list");L.textContent="";
 const items=lib.filter(x=>(!c||x.cat===c)&&(x.title+" "+(x.channel||"")+" "+x.url).toLowerCase().includes(q));
 if(!items.length){L.innerHTML='<p class="empty">'+(lib.length?"No videos match your search.":"Nothing saved yet. Process a link or download a video, then choose “Save link to library”.")+"</p>";return}
 items.forEach(x=>{const d=document.createElement("div");d.className="item";
  const m=x.thumb?Object.assign(document.createElement("img"),{src:x.thumb,alt:"",loading:"lazy"}):Object.assign(document.createElement("div"),{className:"ph",textContent:"▶"});
  const b=document.createElement("div");b.className="b";
  const h=document.createElement("h3");h.textContent=x.title;const p=document.createElement("p");p.textContent=x.channel||x.url;
  const row=document.createElement("div");row.className="row";
  const mk=(t,f)=>{const e=document.createElement("button");e.className="btn ghost";e.textContent=t;e.onclick=f;row.append(e)};
  mk("Play",()=>playLib(x));
  mk("Copy link",async()=>{try{await navigator.clipboard.writeText(x.url);toast("Link copied.")}catch{toast("Could not copy. Copy it manually: "+x.url,"err")}});
  mk("Delete",()=>{lib=lib.filter(y=>y.id!==x.id);saveLib();renderLib()});
  const s=document.createElement("select");["General","Music","Learning","Favorites"].forEach(o=>s.add(new Option(o,o,0,o===x.cat)));
  s.onchange=()=>{x.cat=s.value;saveLib()};
  b.append(h,p,row,s);d.append(m,b);L.append(d)});
}
$("#q").oninput=renderLib;$("#catF").onchange=renderLib;
function playLib(x){if(x.type==="yt"){go("home");$("#ytUrl").value=x.url;processLink()}else{go("downloader");$("#dlUrl").value=x.url;loadPlayer(x.url,x.title)}}

/* ---------- Downloader ---------- */
let blobUrl=null,lastBlob=null,lastName="video.mp4",lastUrl="";
function setProg(pct,msg){const bar=$(".bar");bar.classList.toggle("ind",pct==null);$("#bar").style.width=(pct||0)+"%";$("#dlStatus").textContent=msg}
function fname(u){let n="video";try{n=decodeURIComponent(new URL(u).pathname.split("/").pop())||n}catch{}n=n.replace(/[\\/:*?"<>|]+/g,"_");return /\.(mp4|m4v|mov|webm)$/i.test(n)?n:n+".mp4"}
function showResult(blob,name,url){
 if(blobUrl)URL.revokeObjectURL(blobUrl);blobUrl=URL.createObjectURL(blob);lastBlob=blob;lastName=name;lastUrl=url||"";
 $("#dlBox").hidden=false;$("#dlOpen").href=blobUrl;$("#dlOpen").hidden=false;$("#dlHelp").hidden=false;$("#dlSave").hidden=!url;$("#dlCopy").hidden=false;
 const f=new File([blob],name,{type:blob.type||"video/mp4"});$("#dlShare").hidden=!(navigator.canShare&&navigator.canShare({files:[f]}));
 loadPlayer(blobUrl,name);
}
function saveToDevice(){const a=document.createElement("a");a.href=blobUrl;a.download=lastName;document.body.append(a);a.click();a.remove()}
async function download(){
 const url=$("#dlUrl").value.trim();
 if(!/^https?:\/\//i.test(url))return toast("Enter a valid link starting with http:// or https://","err");
 if(ytId(url))return toast("YouTube videos can’t be downloaded here. Paste a direct link to a file you own, or upload one.","err");
 if(!navigator.onLine)return toast("You are offline. Check your internet connection.","err");
 $("#dlBox").hidden=false;["#dlRetry","#dlFallback","#dlOpen","#dlShare","#dlSave","#dlCopy","#dlHelp"].forEach(s=>$(s).hidden=true);setProg(0,"Starting…");
 try{
  const r=await fetch(url);if(!r.ok)throw new Error("The server replied with error "+r.status+".");
  const type=(r.headers.get("content-type")||"").split(";")[0].trim();
  if(type&&!type.startsWith("video/")&&type!=="application/octet-stream")throw new Error("This link is not a video file (it is "+type+").");
  const total=+r.headers.get("content-length")||0,rd=r.body.getReader(),parts=[];let got=0;
  for(;;){const{done,value}=await rd.read();if(done)break;parts.push(value);got+=value.length;
   setProg(total?got/total*100:null,total?Math.round(got/total*100)+"% · "+mb(got)+" of "+mb(total):mb(got)+" downloaded")}
  const blob=new Blob(parts,{type:type.startsWith("video/")?type:"video/mp4"});
  setProg(100,"Download complete · "+mb(blob.size));toast("Download complete. Tap “Save to Gallery / Photos” if it is not in your Gallery.");
  showResult(blob,fname(url),url);saveToDevice();
 }catch(e){
  setProg(0,"Download failed.");$("#dlRetry").hidden=false;$("#dlFallback").hidden=false;$("#dlFallback").href=url;
  toast(e instanceof TypeError?"Download failed. The host blocks in-page downloads (CORS) or your connection dropped. Try “Open link directly”.":e.message,"err");
 }
}
$("#dlBtn").onclick=download;$("#dlRetry").onclick=download;
$("#dlUrl").addEventListener("keydown",e=>{if(e.key==="Enter")download()});
$("#dlFile").onchange=e=>{const f=e.target.files[0];if(!f)return;if(!f.type.startsWith("video/"))return toast("That file is not a supported video format.","err");
 ["#dlRetry","#dlFallback"].forEach(s=>$(s).hidden=true);setProg(100,"Loaded "+f.name+" · "+mb(f.size));showResult(f,f.name,"")};
$("#dlCopy").onclick=saveToDevice;
$("#dlShare").onclick=async()=>{try{await navigator.share({files:[new File([lastBlob],lastName,{type:lastBlob.type||"video/mp4"})]})}catch(e){if(e.name!=="AbortError")toast("Sharing failed. Open the file and use your browser’s share menu.","err")}};
$("#dlSave").onclick=()=>lastUrl&&addLib({type:"file",url:lastUrl,title:lastName});

/* ---------- Player ---------- */
const v=$("#vid");
function loadPlayer(src,title){v.src=src;v.load();$("#vidTitle").textContent=title||"";v.onerror=()=>toast("This video format can’t be played in your browser.","err")}
$("#pp").onclick=()=>v.paused?v.play().catch(()=>toast("Load a video first.","err")):v.pause();
v.onplay=()=>$("#pp").textContent="❚❚";v.onpause=()=>$("#pp").textContent="▶";
v.ontimeupdate=()=>{$("#seek").value=v.duration?v.currentTime/v.duration*1000:0;$("#time").textContent=fmt(v.currentTime)+" / "+fmt(v.duration)};
v.onloadedmetadata=v.ontimeupdate;
$("#seek").oninput=e=>{if(v.duration)v.currentTime=e.target.value/1000*v.duration};
$("#vol").oninput=e=>{v.volume=e.target.value;v.muted=false};
$("#mute").onclick=()=>{v.muted=!v.muted;$("#mute").textContent=v.muted?"🔇":"🔊"};
$("#rate").onchange=e=>v.playbackRate=+e.target.value;
$("#fs").onclick=()=>{const p=$("#player");if(document.fullscreenElement)document.exitFullscreen();else if(p.requestFullscreen)p.requestFullscreen();else if(v.webkitEnterFullscreen)v.webkitEnterFullscreen();else toast("Fullscreen isn’t supported here.","err")};

/* ---------- Init ---------- */
const mail=$("#mail");
if(CONFIG.contactEmail)mail.href="mailto:"+CONFIG.contactEmail;else{mail.removeAttribute("href");mail.textContent="Contact email not set yet";mail.style.opacity=.6}
addEventListener("offline",()=>toast("You are offline.","err"));addEventListener("online",()=>toast("Back online."));
$("#count").textContent=lib.length;
const h=location.hash.slice(1),hp=h&&document.getElementById(h);go(hp&&hp.classList.contains("page")?h:"home");
