/**
 * Firebase Configuration
 * Initializes Firebase app and exports auth, db instances
 */

import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// getReactNativePersistence is available at runtime but not typed correctly
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getReactNativePersistence } = require('firebase/auth');
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

let appInstance: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (appInstance) {
    return appInstance;
  }

  if (!getApps().length) {
    appInstance = initializeApp(firebaseConfig);
  } else {
    appInstance = getApps()[0]!;
  }

  return appInstance;
}

// Use persistent auth on native (AsyncStorage), default auth on web
export const auth =
  Platform.OS === 'web'
    ? getAuth(getFirebaseApp())
    : initializeAuth(getFirebaseApp(), {
        persistence: getReactNativePersistence(AsyncStorage),
      });
export const db = getFirestore(getFirebaseApp());
