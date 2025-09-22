// src/config/firebase.ts
import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config(); // Tải biến môi trường từ .env

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || path.resolve(process.cwd(), 'src/config/firebase-service-account.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const auth = admin.auth();
export const firestore = admin.firestore();