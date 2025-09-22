// src/config/firebase.ts
import * as admin from 'firebase-admin';
import path from 'path';

const serviceAccount = path.resolve(__dirname, '../config/firebase-service-account.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const auth = admin.auth();
export const firestore = admin.firestore();