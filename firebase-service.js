// Firebase Spark: Auth + Firestore. Photos go through a Cloudflare Worker to Cloudinary.
// No Firebase Storage / Blaze billing required.
import {initializeApp} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js';
import {getAuth,onAuthStateChanged,GoogleAuthProvider,signInWithPopup,signInWithEmailAndPassword,createUserWithEmailAndPassword,signOut} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js';
import {getFirestore,collection,doc,query,orderBy,limit,onSnapshot,serverTimestamp,setDoc,updateDoc,deleteDoc} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js';
import {mediaConfig} from './config.js';

const photoEndpoint = String(mediaConfig?.photoProxyUrl || '').trim().replace(/\/$/, '');
function photoEnabled(){return /^https:\/\/[a-z\d.-]+\/?$/i.test(photoEndpoint)}

async function workerRequest(path,token,formData){
  if(!photoEnabled()) throw new Error('ფოტოების მომსახურება ჯერ არ არის ჩართული. დაუკავშირე Cloudflare Worker ან ატვირთე განცხადება ფოტოს გარეშე.');
  const res = await fetch(photoEndpoint+path, {
    method:'POST', headers:{Authorization:`Bearer ${token}`},
    body:formData
  });
  let body={};try{body=await res.json()}catch{}
  if(!res.ok)throw new Error(body.error||`ფოტოს სერვერის შეცდომა (${res.status})`);
  return body;
}

export async function createFirebaseService(config,onAuth){
 const app=initializeApp(config),auth=getAuth(app),db=getFirestore(app);
 onAuthStateChanged(auth,onAuth);
 const ensureOwner=listing=>{if(!auth.currentUser||listing.ownerUid!==auth.currentUser.uid)throw new Error('ამ განცხადებაზე უფლება არ გაქვს.')};
 return {
  photoEnabled,
  watchListings(emit,onError){
   return onSnapshot(query(collection(db,'listings'),orderBy('createdAt','desc'),limit(250)), snap=>{
    const records=snap.docs.map(d=>{
     const data=d.data();return {...data,id:d.id,createdAt:data.createdAt?.toMillis?.()||Date.now(),sample:false}
    });emit(records);
   },onError);
  },
  async createListing(data,files){
   if(!auth.currentUser)throw new Error('საჭიროა შესვლა');
   if(files.length&&!photoEnabled())throw new Error('ფოტოებისთვის ჯერ Cloudflare Worker უნდა დავაკავშიროთ. განცხადება ფოტოს გარეშეც შეიძლება.');
   const ownerUid=auth.currentUser.uid;
   const newDoc=doc(collection(db,'listings'));
   const images=[],paths=[];
   for(const file of files){
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024||file.size===0)throw new Error('ფოტოს ფორმატი ან ზომა არასწორია');
    const form=new FormData();form.append('photo',file,file.name);
    const result=await workerRequest('/upload',await auth.currentUser.getIdToken(),form);
    if(typeof result.secure_url!=='string'||!result.secure_url.startsWith('https://res.cloudinary.com/') || typeof result.public_id!=='string'||!result.public_id.startsWith(`darcha/${ownerUid}/`)) throw new Error('ფოტოს სერვერმა არასწორი პასუხი დააბრუნა');
    images.push(result.secure_url);paths.push(result.public_id);
   }
   // If the Firestore write fails, previously uploaded files need manual Cloudinary cleanup.
   await setDoc(newDoc,{...data,images,paths,ownerUid,ownerName:auth.currentUser.displayName||'მომხმარებელი',createdAt:serverTimestamp(),status:'active'});
   return newDoc.id;
  },
  async setStatus(listing,status){ensureOwner(listing);if(!['active','sold'].includes(status))throw new Error('არასწორი სტატუსი');await updateDoc(doc(db,'listings',listing.id),{status})},
  async deleteListing(listing){
   ensureOwner(listing);
   if(!listing.paths?.length){await deleteDoc(doc(db,'listings',listing.id));return}
   // Worker checks listing ownership via Firebase before deleting Cloudinary photos.
   const form=new FormData();form.append('listingId',listing.id);
   await workerRequest('/delete-listing',await auth.currentUser.getIdToken(),form);
  },
  signInGoogle(){return signInWithPopup(auth,new GoogleAuthProvider())},
  login(email,password){return signInWithEmailAndPassword(auth,email,password)},
  register(email,password){return createUserWithEmailAndPassword(auth,email,password)},
  signOut(){return signOut(auth)}
 }
}
