import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

import { db } from '@/src/config/firebase';

export type LocationPayload = {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
};

export async function saveLocation(payload: LocationPayload): Promise<void> {
  await addDoc(collection(db, 'locations'), {
    ...payload,
    createdAt: serverTimestamp(),
  });
}

