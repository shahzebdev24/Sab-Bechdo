import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import type { LocationPayload } from '@/lib/location-service';

export type AdInput = {
  title: string;
  price: number;
  category: string | null;
  condition: 'new' | 'used';
  description: string;
  photoUrls: string[];
  videoUrl?: string;
  location?: LocationPayload & { address?: string };
};

export type AdRecord = {
  id: string;
  title: string;
  price: number;
  category: string | null;
  condition: 'new' | 'used';
  description: string;
  photoUrls: string[];
  videoUrl?: string;
  location?: LocationPayload & { address?: string };
  createdAt?: Date | null;
};

export async function createAd(input: AdInput): Promise<string> {
  const docRef = await addDoc(collection(db, 'ads'), {
    title: input.title.trim(),
    price: input.price,
    category: input.category,
    condition: input.condition,
    description: input.description.trim(),
    photoUrls: input.photoUrls,
    videoUrl: input.videoUrl ?? null,
    location: input.location ?? null,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export function subscribeToAds(callback: (ads: AdRecord[]) => void): Unsubscribe {
  const q = query(collection(db, 'ads'), orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const items: AdRecord[] = snapshot.docs.map((doc) => {
      const data = doc.data() as any;

      return {
        id: doc.id,
        title: data.title ?? '',
        price: typeof data.price === 'number' ? data.price : Number(data.price ?? 0),
        category: data.category ?? null,
        condition: data.condition === 'used' ? 'used' : 'new',
        description: data.description ?? '',
        photoUrls: Array.isArray(data.photoUrls) ? data.photoUrls : [],
        videoUrl: data.videoUrl ?? undefined,
        location: data.location ?? undefined,
        createdAt: data.createdAt?.toDate?.() ?? null,
      };
    });

    callback(items);
  });
}

