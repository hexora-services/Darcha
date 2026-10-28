// This module is loaded only when the user fills config.js.
import {initializeApp} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js';
import {getAuth,onAuthStateChanged,GoogleAuthProvider,signInWithPopup,signInWithEmailAndPassword,createUserWithEmailAndPassword,signOut} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js';
import {getFirestore,collection,doc,query,orderBy,limit,onSnapshot,serverTimestamp,setDoc,updateDoc,deleteDoc} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js';
import {getStorage,ref,uploadBytes,getDownloadURL,deleteObject} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-storage.js';

export async function createFirebaseService(config,onAuth){
 const app=initializeApp(config),auth=getAuth(app),db=getFirestore(app),storage=getStorage(app);
 onAuthStateChanged(auth,onAuth);
 const ensureOwner=listing=>{if(!auth.currentUser||listing.ownerUid!==auth.currentUser.uid)throw new Error('ამ განცხადებაზე უფლება არ გაქვს.')};
 return {
  watchListings(emit,onError){return onSnapshot(query(collection(db,'listings'),orderBy('createdAt','desc'),limit(250)),snap=>{const records=snap.docs.map(d=>{const data=d.data();return {...data,id:d.id,createdAt:data.createdAt?.toMillis?.()||Date.now(),sample:false}});emit(records)},onError)},
  async createListing(data,files){if(!auth.currentUser)throw new Error('საჭიროა შესვლა');const ownerUid=auth.currentUser.uid;const newDoc=doc(collection(db,'listings'));const paths=[],images=[];try{for(let i=0;i<files.length;i++){const f=files[i];const ext=f.type==='image/png'?'png':f.type==='image/webp'?'webp':'jpg';const filePath=`users/${ownerUid}/listings/${newDoc.id}/${i}-${Date.now()}.${ext}`;const storageRef=ref(storage,filePath);await uploadBytes(storageRef,f,{contentType:f.type});paths.push(filePath);images.push(await getDownloadURL(storageRef))}await setDoc(newDoc,{...data,images,paths,ownerUid,ownerName:auth.currentUser.displayName||'მომხმარებელი',createdAt:serverTimestamp(),status:'active'});return newDoc.id}catch(err){for(const path of paths){try{await deleteObject(ref(storage,path))}catch{}}throw err}},
  async setStatus(listing,status){ensureOwner(listing);if(!['active','sold'].includes(status))throw new Error('არასწორი სტატუსი');await updateDoc(doc(db,'listings',listing.id),{status})},
  async deleteListing(listing){ensureOwner(listing);await deleteDoc(doc(db,'listings',listing.id));for(const path of listing.paths||[]){try{await deleteObject(ref(storage,path))}catch(e){console.warn('Unremoved photo',e)}}},
  signInGoogle(){return signInWithPopup(auth,new GoogleAuthProvider())},
  login(email,password){return signInWithEmailAndPassword(auth,email,password)},
  register(email,password){return createUserWithEmailAndPassword(auth,email,password)},
  signOut(){return signOut(auth)}
 }
}
