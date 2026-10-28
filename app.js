import { firebaseConfig } from './config.js';
import {initLang, setLang, getLang, tr, tdom, localizedSample, localizedDate, localizedResults, infoHtml, sampleTranslations} from './i18n.js';

const categories = [
  {id:'tile', name:'კაფელი და ფილა', icon:'▦', img:'tile.svg'},
  {id:'block', name:'ბლოკი და აგური', icon:'🧱', img:'block.svg'},
  {id:'pipes', name:'მილები და ფიტინგები', icon:'🔧', img:'pipes.svg'},
  {id:'heating', name:'გათბობა', icon:'♨️', img:'heating.svg'},
  {id:'wood', name:'ხე და ფიცარი', icon:'🪵', img:'wood.svg'},
  {id:'cement', name:'ცემენტი და ნარევები', icon:'🏗️', img:'cement.svg'},
  {id:'metal', name:'ლითონი და არმატურა', icon:'⚙️', img:'metal.svg'},
  {id:'insulation', name:'თბოიზოლაცია', icon:'🧩', img:'insulation.svg'},
  {id:'paint', name:'საღებავი', icon:'🎨', img:'paint.svg'},
  {id:'doors', name:'კარ-ფანჯარა', icon:'🚪', img:'doors.svg'},
  {id:'electrical', name:'ელექტრო მასალა', icon:'💡', img:'electrical.svg'},
  {id:'other', name:'სხვა მასალა', icon:'📦', img:'other.svg'},
];
const cities = ['თბილისი','რუსთავი','მცხეთა','ქუთაისი','ბათუმი','გორი','ზუგდიდი','ფოთი','თელავი','ახალციხე','მარნეული','სხვა ქალაქი'];
const categoryMap = Object.fromEntries(categories.map(c=>[c.id,c]));
const el=id=>document.getElementById(id);
const clean=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const formatMoney=n=>new Intl.NumberFormat(getLang()==='en'?'en-GB':getLang()==='ru'?'ru-RU':'ka-GE',{maximumFractionDigits:2}).format(Number(n)||0);
const now=Date.now();
const samples=[
  {id:'sample1',title:'კედლის კაფელი, ღია ბეჟი — 14 მ²',category:'tile',city:'თბილისი',condition:'new',price:175,amount:'14 მ²',description:'სადემონსტრაციო განცხადება — რეალური შეთავაზება არ არის. მაგალითი: დარჩენილი ახალი კაფელი რემონტიდან.',createdAt:now-2*3600e3},
  {id:'sample2',title:'ბლოკი 20×20×40, 45 ცალი',category:'block',city:'რუსთავი',condition:'new',price:90,amount:'45 ცალი',description:'სადემონსტრაციო განცხადება — რეალური შეთავაზება არ არის. მაგალითი: მშენებლობის შემდეგ დარჩენილი ბლოკები.',createdAt:now-5*3600e3},
  {id:'sample3',title:'თეთრი პანელური რადიატორი',category:'heating',city:'თბილისი',condition:'used',price:80,amount:'1 ცალი',description:'სადემონსტრაციო განცხადება — რეალური შეთავაზება არ არის. მაგალითი: მეორადი რადიატორი.',createdAt:now-12*3600e3},
  {id:'sample4',title:'მეტალოპლასტმასის მილი — 35 მეტრი',category:'pipes',city:'მცხეთა',condition:'new',price:65,amount:'35 მეტრი',description:'სადემონსტრაციო განცხადება — რეალური შეთავაზება არ არის. მაგალითი: დარჩენილი მილი.',createdAt:now-30*3600e3},
  {id:'sample5',title:'გამშრალი ფიცარი 4 მეტრიანი',category:'wood',city:'ქუთაისი',condition:'used',price:110,amount:'18 ცალი',description:'სადემონსტრაციო განცხადება — რეალური შეთავაზება არ არის. მაგალითი: მეორადი ხის მასალა.',createdAt:now-55*3600e3},
  {id:'sample6',title:'ცემენტის 8 ტომარა, გაუხსნელი',category:'cement',city:'ბათუმი',condition:'new',price:96,amount:'8 ტომარა',description:'სადემონსტრაციო განცხადება — რეალური შეთავაზება არ არის. მაგალითი: გაუხსნელი ცემენტი.',createdAt:now-71*3600e3},
  {id:'sample7',title:'არმატურის ნაჭრები სხვადასხვა ზომის',category:'metal',city:'გორი',condition:'used',price:75,amount:'40 კგ',description:'სადემონსტრაციო განცხადება — რეალური შეთავაზება არ არის. მაგალითი: დარჩენილი არმატურა.',createdAt:now-96*3600e3},
  {id:'sample8',title:'ქაფპლასტის ფილები — 16 მ²',category:'insulation',city:'თბილისი',condition:'new',price:54,amount:'16 მ²',description:'სადემონსტრაციო განცხადება — რეალური შეთავაზება არ არის. მაგალითი: თბოიზოლაციის დარჩენილი ფილები.',createdAt:now-110*3600e3},
  {id:'sample9',title:'შიდა საღებავი თეთრი, გაუხსნელი',category:'paint',city:'თელავი',condition:'new',price:40,amount:'1 ვედრო',description:'სადემონსტრაციო განცხადება — რეალური შეთავაზება არ არის. მაგალითი: საღებავის გაუხსნელი ვედრო.',createdAt:now-120*3600e3},
  {id:'sample10',title:'ხის კარი, საკეტით',category:'doors',city:'თბილისი',condition:'used',price:130,amount:'1 ცალი',description:'სადემონსტრაციო განცხადება — რეალური შეთავაზება არ არის. მაგალითი: მეორადი კარი.',createdAt:now-135*3600e3},
  {id:'sample11',title:'ელექტრო კაბელის დარჩენილი ხვეულა',category:'electrical',city:'ზუგდიდი',condition:'new',price:45,amount:'25 მეტრი',description:'სადემონსტრაციო განცხადება — რეალური შეთავაზება არ არის. მაგალითი: დარჩენილი კაბელი.',createdAt:now-154*3600e3},
  {id:'sample12',title:'სახურავის ნაჭრები, ტალღოვანი',category:'other',city:'ფოთი',condition:'used',price:70,amount:'10 ცალი',description:'სადემონსტრაციო განცხადება — რეალური შეთავაზება არ არის. მაგალითი: მეტალის ფურცლები.',createdAt:now-170*3600e3}
].map(s=>({...s,images:[],status:'active',sample:true}));
const storageKey='darcha-listings-v1';
const favKey='darcha-favorites-v1';
function localRead(key,fallback){try{const x=JSON.parse(localStorage.getItem(key));return x??fallback}catch{return fallback}}
const configured=!!(firebaseConfig?.apiKey?.trim()&&firebaseConfig?.projectId?.trim()&&firebaseConfig?.appId?.trim());
const state={live:configured,service:null,user:null,listings:configured?[]:[...samples,...localRead(storageKey,[])],favorites:new Set(localRead(favKey,[])),filterCategory:'all',limit:8,onlyMine:false,authAfter:null,selectedListing:null};
const imageFor=l=>l.images?.[0]||`assets/${categoryMap[l.category]?.img||'other.svg'}`;
function dateAgo(ts){return localizedDate(ts)}
function normalizedPhone(value){const numbers=String(value).replace(/\D/g,'');if(/^5\d{8}$/.test(numbers))return '995'+numbers;if(/^9955\d{8}$/.test(numbers))return numbers;if(/^0?32\d{7}$/.test(numbers))return '995'+numbers.replace(/^0/,'');return null}
function whatsappPhone(value){return normalizedPhone(value)}
function toast(message){const t=el('toast');t.textContent=tr(message);t.classList.add('show');clearTimeout(toast.timeout);toast.timeout=setTimeout(()=>t.classList.remove('show'),3600)}
function saveLocal(){try{localStorage.setItem(storageKey,JSON.stringify(state.listings.filter(l=>!l.sample)))}catch(e){toast('ბრაუზერის მეხსიერება სავსეა. სცადე ნაკლები ან მცირე ფოტო.');throw e}}
function initOptions(){
  const grid=el('categoriesGrid');
  grid.innerHTML=categories.map(c=>`<button type="button" class="category-tile" data-category="${c.id}"><span class="category-icon">${c.icon}</span><span class="category-title">${clean(tr(c.name))}</span><span class="category-arrow">↗</span></button>`).join('');
  for(const [id,items,first] of [
    ['categoryFilter',categories.map(c=>[c.id,tr(c.name)]),tr('ყველა კატეგორია')],
    ['postCategory',categories.map(c=>[c.id,tr(c.name)]),tr('აირჩიე')],
    ['cityFilter',cities.map(c=>[c,tr(c)]),tr('მთელი საქართველო')],
    ['postCity',cities.map(c=>[c,tr(c)]),tr('აირჩიე')]
  ]){
    const select=el(id),value=select.value;
    select.replaceChildren(new Option(first,id.endsWith('Filter')?'all':''));
    for(const [v,label] of items)select.add(new Option(label,v));
    if([...select.options].some(o=>o.value===value))select.value=value;
  }
  el('year').textContent=String(new Date().getFullYear());
}
function selectedItems(){
  const q=el('searchInput').value.trim().toLocaleLowerCase();
  const cat=el('categoryFilter').value,city=el('cityFilter').value,condition=el('conditionFilter').value,sort=el('sortFilter').value;
  let list=state.listings.filter(l=>(l.status||'active')==='active');
  if(state.onlyMine)list=list.filter(l=>!l.sample&&(state.live?l.ownerUid===state.user?.uid:true));
  if(q)list=list.filter(l=>[l.title,l.description,l.amount,categoryMap[l.category]?.name,tr(categoryMap[l.category]?.name),tr(l.city),localizedSample(l,'title'),localizedSample(l,'description')].some(v=>String(v||'').toLocaleLowerCase().includes(q)));
  if(cat!=='all')list=list.filter(l=>l.category===cat);
  if(city!=='all')list=list.filter(l=>l.city===city);
  if(condition!=='all')list=list.filter(l=>l.condition===condition);
  list.sort((a,b)=>sort==='price-asc'?Number(a.price)-Number(b.price):sort==='price-desc'?Number(b.price)-Number(a.price):Number(b.createdAt)-Number(a.createdAt));
  return list;
}
function renderListings(){
  const filtered=selectedItems(),visible=filtered.slice(0,state.limit);
  el('listingCount').textContent=state.listings.filter(l=>(l.status||'active')==='active').length;
  el('resultsLabel').textContent=localizedResults(filtered.length,state.onlyMine);
  el('listingsGrid').innerHTML=visible.map(l=>{
    const c=categoryMap[l.category],fav=state.favorites.has(l.id),title=localizedSample(l,'title');
    return `<article class="listing-card" tabindex="0" role="button" data-id="${clean(l.id)}" aria-label="${clean(title)}"><div class="card-image-wrap"><img src="${clean(imageFor(l))}" alt="${clean(title)}" loading="lazy"/><span class="condition-badge">${tr(l.sample?'საჩვენებელი':l.condition==='new'?'ახალი':'მეორადი')}</span><button type="button" class="favorite-btn" data-favorite="${clean(l.id)}" aria-label="${tr('რჩეულებში დამატება')}" aria-pressed="${fav}">${fav?'♥':'♡'}</button></div><div class="card-content"><div class="card-category">${clean(tr(c?.name||'სხვა'))}</div><h3 class="card-title">${clean(title)}</h3><div class="card-price">${formatMoney(l.price)} ₾</div><div class="card-unit">${clean(tr(l.amount||''))}</div><div class="card-separator"></div><div class="card-foot"><span>⌖ ${clean(tr(l.city))}</span><span>${dateAgo(l.createdAt)}</span></div></div></article>`;
  }).join('');
  el('emptyState').hidden=filtered.length>0;
  el('loadMore').hidden=state.limit>=filtered.length;
}
function resetFilters(){el('searchInput').value='';el('categoryFilter').value='all';el('cityFilter').value='all';el('conditionFilter').value='all';el('sortFilter').value='newest';state.onlyMine=false;state.limit=8;renderListings()}
function openDialog(dialog){if(!dialog.open)dialog.showModal()}
function closeDialog(dialog){if(dialog?.open)dialog.close()}
function getListing(id){return state.listings.find(l=>l.id===id)}
function detail(listing){
  if(!listing)return;
  state.selectedListing=listing;
  const arr=listing.images?.length?listing.images:[imageFor(listing)];
  const title=localizedSample(listing,'title');
  const contact=listing.sample
    ?`<div class="demo-notice"><span>ⓘ</span>${tr('ეს საჩვენებელი განცხადებაა. გამყიდველის ტელეფონი არ არსებობს.')}</div>`
    :`<a class="btn btn-primary" href="tel:+${clean(normalizedPhone(listing.phone)||'')}" ${normalizedPhone(listing.phone)?'':'aria-disabled="true"'}>☎ ${tr('დარეკვა')} — ${clean(listing.phone||'')}</a>${whatsappPhone(listing.phone)?`<a class="btn btn-outline" href="https://wa.me/${whatsappPhone(listing.phone)}" target="_blank" rel="noopener noreferrer">${tr('WhatsApp-ით მიწერა ↗')}</a>`:''}`;
  el('detailContent').innerHTML=`<div class="detail-body"><div><img class="detail-main-img" id="detailMainImg" alt="${clean(title)}" src="${clean(arr[0])}"/><div class="detail-thumbs">${arr.length>1?arr.map((src,i)=>`<button type="button" class="${i===0?'active':''}" data-thumb="${i}" aria-label="${tr('ფოტო')} ${i+1}"><img alt="${tr('ფოტო')} ${i+1}" src="${clean(src)}"></button>`).join(''):''}</div></div><div class="detail-details"><div class="section-kicker">${clean(tr(categoryMap[listing.category]?.name||'სხვა'))} · ${tr(listing.sample?'საჩვენებელი':listing.condition==='new'?'ახალი':'მეორადი')}</div><h2 id="detailTitle">${clean(title)}</h2><div class="detail-price">${formatMoney(listing.price)} ₾</div><div class="detail-meta"><div><small>${tr('რაოდენობა')}</small><strong>${clean(tr(listing.amount))}</strong></div><div><small>${tr('მდებარეობა')}</small><strong>${clean(tr(listing.city))}</strong></div><div><small>${tr('მდგომარეობა')}</small><strong>${tr(listing.condition==='new'?'ახალი':'მეორადი')}</strong></div><div><small>${tr('გამოქვეყნდა')}</small><strong>${dateAgo(listing.createdAt)}</strong></div></div><p class="detail-description">${clean(localizedSample(listing,'description'))}</p><div class="detail-contact">${contact}</div><p class="detail-flag">${tr('უსაფრთხოებისთვის მასალა ნახე და შეამოწმე გადახდამდე. საიტი არ იღებს თანხას და არ უზრუნველყოფს მიწოდებას.')}</p></div></div>`;
  el('detailContent').querySelectorAll('[data-thumb]').forEach(b=>b.addEventListener('click',()=>{const n=Number(b.dataset.thumb);el('detailMainImg').src=arr[n];el('detailContent').querySelectorAll('[data-thumb]').forEach(x=>x.classList.toggle('active',x===b))}));
  openDialog(el('detailDialog'));
}
async function previewFiles(){const input=el('postImages');const files=Array.from(input.files||[]);if(files.length>4){toast('შეიძლება მაქსიმუმ 4 ფოტოს დამატება.');input.value='';el('uploadPreviews').replaceChildren();return}if(files.some(f=>f.size>5*1024*1024||!['image/jpeg','image/png','image/webp'].includes(f.type))){toast('ფოტო უნდა იყოს JPG/PNG/WEBP და მაქს. 5 MB.');input.value='';el('uploadPreviews').replaceChildren();return}el('uploadPreviews').innerHTML='';for(const f of files){const url=URL.createObjectURL(f);const img=document.createElement('img');img.src=url;img.alt=f.name;img.onload=()=>URL.revokeObjectURL(url);el('uploadPreviews').append(img)}}
function shrinkImage(file){return new Promise((resolve,reject)=>{const img=new Image();const u=URL.createObjectURL(file);img.onload=()=>{try{const max=940,ratio=Math.min(1,max/Math.max(img.width,img.height));const can=document.createElement('canvas');can.width=Math.round(img.width*ratio);can.height=Math.round(img.height*ratio);can.getContext('2d').drawImage(img,0,0,can.width,can.height);URL.revokeObjectURL(u);resolve(can.toDataURL('image/jpeg',.70))}catch(e){reject(e)}};img.onerror=()=>{URL.revokeObjectURL(u);reject(new Error('ფოტო ვერ გაიხსნა'))};img.src=u})}
function validForm(){const title=el('postTitle').value.trim(),description=el('postDesc').value.trim(),amount=el('postAmount').value.trim(),phone=el('postPhone').value.trim(),cat=el('postCategory').value,city=el('postCity').value;const price=Number(el('postPrice').value);if(title.length<5||title.length>90){toast('სათაური უნდა შეიცავდეს 5–90 სიმბოლოს.');return null}if(description.length<10||description.length>1400){toast('აღწერა უნდა შეიცავდეს 10–1400 სიმბოლოს.');return null}if(!categoryMap[cat]||!cities.includes(city)||!amount||amount.length>70||!Number.isFinite(price)||price<0||price>1000000){toast('შეავსე ყველა ველი სწორად.');return null}if(!normalizedPhone(phone)){toast('შეიყვანე ქართული ტელეფონის ნომერი, მაგ.: 5XX XX XX XX.');return null}if(!el('postConsent').checked){toast('განცხადებისთვის საჭიროა წესებთან თანხმობა.');return null}return {title,description,amount,phone,category:cat,city,condition:el('postCondition').value,price}}
async function submitPost(evt){evt.preventDefault();const data=validForm();if(!data)return;const files=Array.from(el('postImages').files||[]);if(files.length>4||files.some(f=>f.size>5*1024*1024||!['image/jpeg','image/png','image/webp'].includes(f.type))){toast('ფოტოების რაოდენობა ან ფორმატი არასწორია.');return}const btn=el('submitPostBtn');btn.disabled=true;btn.textContent=tr('ქვეყნდება…');try{if(state.live){if(!state.user){state.authAfter='post';openDialog(el('authDialog'));return}await state.service.createListing(data,files);toast('განცხადება გამოქვეყნდა!')}else{const images=[];for(const f of files)images.push(await shrinkImage(f));const item={...data,id:'local'+Date.now()+'-'+Math.random().toString(36).slice(2,7),createdAt:Date.now(),status:'active',sample:false,images};state.listings.unshift(item);saveLocal();toast('განცხადება დაემატა! ჩანს მხოლოდ ამ მოწყობილობაზე.')}el('postForm').reset();el('uploadPreviews').replaceChildren();closeDialog(el('postDialog'));state.onlyMine=false;state.limit=8;resetFilters();location.hash='listings'}catch(e){console.error(e);toast(e?.message||'გამოქვეყნება ვერ მოხერხდა.')}finally{btn.disabled=false;btn.textContent=tr('განცხადების გამოქვეყნება ↗')}}
function openPost(){if(state.live&&!state.user){state.authAfter='post';openDialog(el('authDialog'));return}openDialog(el('postDialog'))}
async function openMy(){if(state.live&&!state.user){state.authAfter='my';openDialog(el('authDialog'));return}renderMy();openDialog(el('myDialog'))}
function renderMy(){
 const owned=state.listings.filter(l=>!l.sample&&(state.live?l.ownerUid===state.user?.uid:true));
 el('accountInfo').innerHTML=state.live?`${tr('ანგარიში:')} <b>${clean(state.user?.email||state.user?.displayName||tr('მომხმარებელი'))}</b> <button type="button" id="logoutBtn">${tr('გასვლა')}</button>`:tr('დემო რეჟიმი — შენი განცხადებები ინახება მხოლოდ ამ მოწყობილობაზე.');
 const logout=el('logoutBtn');if(logout)logout.onclick=async()=>{await state.service.signOut();closeDialog(el('myDialog'));toast('ანგარიშიდან გამოხვედი')};
 el('myListingContent').innerHTML=owned.length?`<div class="my-list">${owned.map(l=>`<div class="my-item"><img src="${clean(imageFor(l))}" alt=""><div class="my-item-info"><b>${clean(l.title)}</b><span>${formatMoney(l.price)} ₾ · ${clean(tr(l.city))}</span><br><small>${tr(l.status==='sold'?'გაყიდულია':'აქტიურია')}</small></div><div class="my-item-buttons"><button type="button" data-toggle-sold="${clean(l.id)}">${tr(l.status==='sold'?'გააქტიურება':'გაყიდულია')}</button><button type="button" class="delete" data-delete="${clean(l.id)}">${tr('წაშლა')}</button></div></div>`).join('')}</div>`:`<div class="my-empty">${tr('შენ ჯერ არ გაქვს განცხადებები.')}<br><br><button type="button" class="btn btn-primary" id="fromMyPost">${tr('＋ დაამატე')}</button></div>`;
 el('fromMyPost')?.addEventListener('click',()=>{closeDialog(el('myDialog'));openPost()});
}
async function handleMyClick(e){const sold=e.target.closest('[data-toggle-sold]'),del=e.target.closest('[data-delete]');if(!sold&&!del)return;const id=(sold||del).dataset.toggleSold||(sold||del).dataset.delete;const l=getListing(id);if(!l||l.sample)return;if(del&&!confirm(tr('ნამდვილად წავშალოთ განცხადება?')))return;try{if(state.live){if(del)await state.service.deleteListing(l);else await state.service.setStatus(l,sold?'sold':'active')}else{if(del)state.listings=state.listings.filter(x=>x.id!==id);else l.status=l.status==='active'?'sold':'active';saveLocal()}if(del)state.favorites.delete(id);renderMy();renderListings();toast(del?'განცხადება წაიშალა':'სტატუსი შეიცვალა')}catch(err){console.error(err);toast('ოპერაცია ვერ შესრულდა')}}
function toggleFavorite(id){if(state.favorites.has(id))state.favorites.delete(id);else state.favorites.add(id);try{localStorage.setItem(favKey,JSON.stringify([...state.favorites]))}catch{}renderListings()}
function openInfo(kind){
 const privacy=kind==='privacy';
 state.infoKind=privacy?'privacy':'terms';
 el('infoTitle').textContent=tr(privacy?'კონფიდენციალურობა':'სარგებლობის წესები');
 el('infoContent').innerHTML=infoHtml(state.infoKind);
 openDialog(el('infoDialog'));
}
function authErrorText(e){const code=e?.code||'';if(code.includes('popup-closed'))return 'შესვლის ფანჯარა დაიხურა.';if(code.includes('unauthorized-domain'))return 'Firebase-ში GitHub Pages-ის დომენი ავტორიზებული არ არის.';if(code.includes('email-already-in-use'))return 'ეს ელფოსტა უკვე რეგისტრირებულია.';if(code.includes('invalid-credential')||code.includes('wrong-password'))return 'შეამოწმე ელფოსტა და პაროლი.';if(code.includes('weak-password'))return 'პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს.';if(code.includes('operation-not-allowed'))return 'Firebase-ში ჯერ ჩართე ავტორიზაციის მეთოდი.';return 'შესვლა ვერ მოხერხდა. შეამოწმე მონაცემები და კავშირი.'}
async function authAction(kind){if(!state.service)return;el('authError').textContent='';try{let result;if(kind==='google')result=await state.service.signInGoogle();else{const email=el('authEmail').value.trim(),password=el('authPassword').value;if(kind==='register')result=await state.service.register(email,password);else result=await state.service.login(email,password)}if(result?.user)state.user=result.user;closeDialog(el('authDialog'));toast('შესვლა წარმატებით დასრულდა');if(state.authAfter==='post')openPost();else if(state.authAfter==='my')openMy();state.authAfter=null}catch(e){console.error(e);el('authError').textContent=tr(authErrorText(e))}}
async function startLive(){try{const {createFirebaseService}=await import('./firebase-service.js');state.service=await createFirebaseService(firebaseConfig,user=>{state.user=user;if(el('myDialog').open)renderMy()});state.service.watchListings(list=>{state.listings=list;renderListings();if(el('myDialog').open)renderMy()},error=>{console.error(error);toast('განცხადებების ჩამოტვირთვა ვერ მოხერხდა. შეამოწმე Firestore-ის წესები.')});el('demoNotice').hidden=true;el('postFormHelp').textContent=tr('გამოქვეყნებული განცხადება ხელმისაწვდომი იქნება ყველა მომხმარებლისთვის.')}catch(e){console.error(e);state.live=false;state.listings=[...samples,...localRead(storageKey,[])];renderListings();toast('Firebase ვერ ჩაირთო. დროებით დემო რეჟიმია.')}}
function bind(){initOptions();renderListings();el('languageSelect').value=getLang();el('languageSelect').addEventListener('change',e=>setLang(e.target.value));document.addEventListener('darcha:languagechange',()=>{el('languageSelect').value=getLang();initOptions();renderListings();if(el('myDialog').open)renderMy();if(el('detailDialog').open&&state.selectedListing)detail(state.selectedListing);if(el('infoDialog').open)openInfo(state.infoKind||'terms');if(state.live)el('postFormHelp').textContent=tr('გამოქვეყნებული განცხადება ხელმისაწვდომი იქნება ყველა მომხმარებლისთვის.');});el('categoriesGrid').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(!b)return;el('categoryFilter').value=b.dataset.category;state.limit=8;state.onlyMine=false;renderListings();el('listings').scrollIntoView({behavior:'smooth'})});el('searchForm').addEventListener('submit',e=>{e.preventDefault();state.limit=8;renderListings()});for(const id of ['categoryFilter','cityFilter','conditionFilter','sortFilter'])el(id).addEventListener('change',()=>{state.limit=8;renderListings()});el('searchInput').addEventListener('input',()=>{state.limit=8;renderListings()});el('clearFilters').onclick=resetFilters;el('emptyReset').onclick=resetFilters;el('loadMore').onclick=()=>{state.limit+=8;renderListings()};el('listingsGrid').addEventListener('click',e=>{const fav=e.target.closest('[data-favorite]');if(fav){e.stopPropagation();toggleFavorite(fav.dataset.favorite);return}const card=e.target.closest('[data-id]');if(card)detail(getListing(card.dataset.id))});el('listingsGrid').addEventListener('keydown',e=>{if(e.target.matches('.listing-card')&&(e.key==='Enter'||e.key===' ')){e.preventDefault();detail(getListing(e.target.dataset.id))}});document.querySelectorAll('[data-open-post]').forEach(b=>b.addEventListener('click',openPost));document.querySelectorAll('[data-open-info]').forEach(b=>b.addEventListener('click',()=>openInfo(b.dataset.openInfo)));document.querySelectorAll('[data-close-dialog]').forEach(b=>b.addEventListener('click',()=>closeDialog(b.closest('dialog'))));document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d)closeDialog(d)}));el('postForm').addEventListener('submit',submitPost);el('postImages').addEventListener('change',previewFiles);el('myListingsBtn').onclick=()=>openMy();el('mobileMyBtn').onclick=()=>{el('mobileMenu').hidden=true;openMy()};el('myListingContent').addEventListener('click',handleMyClick);el('googleLoginBtn').onclick=()=>authAction('google');el('authForm').onsubmit=e=>{e.preventDefault();authAction('login')};el('registerBtn').onclick=()=>{if(!el('authForm').reportValidity())return;authAction('register')};el('menuBtn').onclick=()=>{const menu=el('mobileMenu');menu.hidden=!menu.hidden;el('menuBtn').setAttribute('aria-expanded',String(!menu.hidden))};el('mobileMenu').querySelectorAll('a').forEach(a=>a.onclick=()=>{el('mobileMenu').hidden=true});el('dismissDemo').onclick=()=>{el('demoNotice').hidden=true};if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./service-worker.js').catch(()=>{})}
initLang();
bind();
if(state.live)startLive();
