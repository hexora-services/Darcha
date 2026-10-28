// DARCHA V3 — public browser-safe Firebase settings only.
// Firebase Console > Project settings > Your apps > Web app.
// Never put Cloudinary API secret, service-account JSON, or private keys here.
export const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  appId: ""
};
// Public HTTPS address of the Cloudflare Worker after deployment, without trailing slash.
// Example: https://darcha-photos.YOURNAME.workers.dev
// Leave blank for text-only posts until the photo service is configured.
export const mediaConfig = {
  photoProxyUrl: ""
};
