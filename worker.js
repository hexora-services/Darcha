/**
 * DARCHA PHOTO PROXY — Cloudflare Workers Free
 *
 * Worker secrets/variables (Settings > Variables and Secrets):
 * FIREBASE_PROJECT_ID  — text      (same projectId as public Firebase config)
 * FRONTEND_ORIGIN      — text      e.g. https://USERNAME.github.io
 * CLOUDINARY_CLOUD_NAME — text     (from Cloudinary Dashboard)
 * CLOUDINARY_API_KEY   — secret    (from Cloudinary Dashboard)
 * CLOUDINARY_API_SECRET — secret   (from Cloudinary Dashboard)
 *
 * Never put Cloudinary API_SECRET into public GitHub Pages files.
 * This Worker verifies Firebase JWTs, restricts uploads to JPG/PNG/WEBP <=5MB,
 * and keeps the Cloudinary secret only on the Cloudflare server.
 * Deploy to Cloudflare Workers, NOT as a GitHub Pages JavaScript module.
 */

const JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

function b64urlBytes(raw) {
 const clean=raw.replace(/-/g,'+').replace(/_/g,'/');
 const bin=atob(clean+'='.repeat((4-clean.length%4)%4));
 return Uint8Array.from(bin,c=>c.charCodeAt(0));
}
function decodeJwtPart(raw){return JSON.parse(new TextDecoder().decode(b64urlBytes(raw)))}
async function verifyFirebaseToken(bearer,projectId){
 if(!/^[-a-z0-9_]{5,40}$/i.test(projectId||''))throw Error('Firebase project is not configured');
 const token=(bearer||'').match(/^Bearer ([A-Za-z0-9._-]+)$/i)?.[1];
 if(!token)throw Error('Authentication required');
 const parts=token.split('.');if(parts.length!==3)throw Error('Invalid token');
 const header=decodeJwtPart(parts[0]),payload=decodeJwtPart(parts[1]);
 if(header.alg!=='RS256'||typeof header.kid!=='string'||!header.kid)throw Error('Invalid token header');
 const now=Math.floor(Date.now()/1000);
 if(payload.aud!==projectId||payload.iss!==`https://securetoken.google.com/${projectId}`||
    typeof payload.sub!=='string'||!payload.sub||payload.sub.length>128||
    !Number.isFinite(payload.exp)||payload.exp<=now||
    !Number.isFinite(payload.iat)||payload.iat>now||
    !Number.isFinite(payload.auth_time)||payload.auth_time>now)throw Error('Expired or wrong-project token');
 // Google rotates signing keys. Workers fetches current public JWKS; no private key required.
 const response=await fetch(JWKS_URL,{cf:{cacheTtl:3600,cacheEverything:true}});
 if(!response.ok)throw Error('Unable to load public signing keys');
 const jwks=await response.json();
 const jwk=(jwks.keys||[]).find(k=>k.kid===header.kid&&k.kty==='RSA');
 if(!jwk)throw Error('Unknown signing key');
 const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
 const ok=await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,b64urlBytes(parts[2]),new TextEncoder().encode(parts[0]+'.'+parts[1]));
 if(!ok)throw Error('Invalid token signature');
 return {uid:payload.sub,token};
}
async function sha1(value){
 const digest=await crypto.subtle.digest('SHA-1',new TextEncoder().encode(value));
 return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
function json(obj,status=200,headers={}){
 return new Response(JSON.stringify(obj),{status,headers:{...headers,'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
}
function validateImageHeader(bytes,type){
 if(type==='image/jpeg')return bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
 if(type==='image/png')return bytes.slice(0,8).join(',')==='137,80,78,71,13,10,26,10';
 if(type==='image/webp')return String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';
 return false;
}
function requiredConfig(env){
 for(const k of ['FIREBASE_PROJECT_ID','FRONTEND_ORIGIN','CLOUDINARY_CLOUD_NAME','CLOUDINARY_API_KEY','CLOUDINARY_API_SECRET']){
  if(!env[k])throw Error(`Missing Worker variable: ${k}`);
 }
 if(!/^https:\/\/[\w.-]+$/.test(env.FRONTEND_ORIGIN))throw Error('FRONTEND_ORIGIN must be an https origin');
 if(!/^[a-zA-Z0-9_-]+$/.test(env.CLOUDINARY_CLOUD_NAME))throw Error('Invalid cloud name');
}
async function uploadPhoto(request,env,user){
 const len=Number(request.headers.get('content-length'));
 if(len>MAX_PHOTO_BYTES+15000)return json({error:'ფოტო მეტისმეტად დიდია (მაქს. 5 MB).'},413);
 const body=await request.formData();
 const file=body.get('photo');
 if(!file||typeof file.arrayBuffer!=='function'||!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size===0||file.size>MAX_PHOTO_BYTES)return json({error:'მხოლოდ JPG, PNG და WEBP ფოტოები, მაქს. 5 MB.'},400);
 const bytes=new Uint8Array(await file.slice(0,12).arrayBuffer());
 if(!validateImageHeader(bytes,file.type))return json({error:'ფოტოს ფორმატი არასწორია.'},400);
 const folder=`darcha/${user.uid}`;
 const timestamp=Math.floor(Date.now()/1000).toString();
 const signature=await sha1(`folder=${folder}&timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`);
 const upload=new FormData();
 upload.append('file',file,'photo');upload.append('folder',folder);upload.append('timestamp',timestamp);
 upload.append('api_key',env.CLOUDINARY_API_KEY);upload.append('signature',signature);
 const response=await fetch(`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`,{method:'POST',body:upload});
 const result=await response.json();
 if(!response.ok)return json({error:'Cloudinary-ში ფოტოს ატვირთვა ვერ მოხერხდა.'},502);
 if(result.resource_type!=='image'||typeof result.secure_url!=='string'||typeof result.public_id!=='string'||!result.public_id.startsWith(folder+'/'))return json({error:'ფოტოს სერვერის არასწორი პასუხი.'},502);
 return json({secure_url:result.secure_url,public_id:result.public_id});
}
async function deleteListing(request,env,user){
 const form=await request.formData();
 const id=String(form.get('listingId')||'');
 if(!/^[\w-]{8,60}$/.test(id))return json({error:'განცხადების ID არასწორია.'},400);
 const url=`https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/listings/${id}`;
 const headers={Authorization:`Bearer ${user.token}`};
 const found=await fetch(url,{headers});
 if(!found.ok)return json({error:'განცხადება არ მოიძებნა ან წვდომა აკრძალულია.'},found.status===404?404:403);
 const doc=await found.json();
 if(doc.fields?.ownerUid?.stringValue!==user.uid)return json({error:'ეს განცხადება არ გეკუთვნის.'},403);
 const paths=(doc.fields.paths?.arrayValue?.values||[]).map(v=>v.stringValue).filter(Boolean);
 if(paths.length>4||paths.some(p=>!p.startsWith(`darcha/${user.uid}/`)||!/^[A-Za-z0-9_/-]+$/.test(p)))return json({error:'ფოტოების სია არასწორია.'},400);
 // Remove the Firestore document under the user's own ID token and security rules first.
 const removed=await fetch(url,{method:'DELETE',headers});
 if(!removed.ok)return json({error:'განცხადების წაშლა ვერ მოხერხდა.'},502);
 let failed=0;
 for(const publicId of paths){
  const timestamp=Math.floor(Date.now()/1000).toString();
  const signature=await sha1(`public_id=${publicId}&timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`);
  const body=new URLSearchParams({public_id:publicId,timestamp,api_key:env.CLOUDINARY_API_KEY,signature});
  try{
   const response=await fetch(`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/destroy`,{method:'POST',body});
   const result=await response.json();
   if(!response.ok||!['ok','not found'].includes(result.result))failed++;
  }catch{failed++}
 }
 return json({ok:true,removedPhotos:paths.length-failed,failedPhotos:failed});
}

export default {
 async fetch(request,env){
  const origin=request.headers.get('origin');
  const cors=origin===env.FRONTEND_ORIGIN?{'access-control-allow-origin':origin,'vary':'Origin','access-control-allow-methods':'POST, OPTIONS','access-control-allow-headers':'Authorization, Content-Type','access-control-max-age':'600'}:{};
  if(request.method==='OPTIONS')return new Response(null,{status:origin===env.FRONTEND_ORIGIN?204:403,headers:cors});
  if(request.method!=='POST')return json({error:'Method not allowed'},405,cors);
  if(origin!==env.FRONTEND_ORIGIN)return json({error:'Origin not allowed'},403,cors);
  try{
   requiredConfig(env);
   const user=await verifyFirebaseToken(request.headers.get('authorization'),env.FIREBASE_PROJECT_ID);
   const pathname=new URL(request.url).pathname;
   const response=pathname==='/upload'?await uploadPhoto(request,env,user):pathname==='/delete-listing'?await deleteListing(request,env,user):json({error:'Not found'},404);
   const headers=new Headers(response.headers);for(const [k,v] of Object.entries(cors))headers.set(k,v);
   return new Response(response.body,{status:response.status,headers});
  }catch(e){
   const message=String(e.message||'Unexpected error');
   const authErrors=/token|authentication|signing key/i.test(message);
   return json({error:authErrors?'შესვლა არასწორია ან ვადა გავიდა.':'ფოტოს სერვერი დროებით მიუწვდომელია.'},authErrors?401:500,cors);
  }
 }
};
