import { cert, getApps, initializeApp, getApp, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';

let app: App | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: Storage | undefined;

function getFirebaseAdminApp(): App {
  if (app) return app;

  if (getApps().length > 0) {
    app = getApp();
    return app;
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!privateKey || !projectId || !clientEmail) {
    throw new Error(
      'Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.'
    );
  }

  app = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });

  return app;
}

export const firebaseAdminAuth = new Proxy({} as Auth, {
  get(_target, prop, receiver) {
    auth ??= getAuth(getFirebaseAdminApp());
    return Reflect.get(auth, prop, receiver);
  },
});

export const firebaseAdminDb = new Proxy({} as Firestore, {
  get(_target, prop, receiver) {
    db ??= getFirestore(getFirebaseAdminApp());
    return Reflect.get(db, prop, receiver);
  },
});

export const firebaseAdminStorage = new Proxy({} as Storage, {
  get(_target, prop, receiver) {
    storage ??= getStorage(getFirebaseAdminApp());
    return Reflect.get(storage, prop, receiver);
  },
});
