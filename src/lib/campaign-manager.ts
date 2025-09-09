
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp, orderBy } from 'firebase/firestore';
import type { User } from 'firebase/auth';

export interface Campaign {
  id?: string;
  userId: string;
  name: string;
  gameId: string;
  system: string;
  campaignPrompt: string;
  characterPrompt: string;
  isLocal: boolean;
  createdAt: any; // Firestore timestamp
}

/**
 * Saves a new campaign to Firestore for the given user.
 * @param campaignData The campaign data to save.
 */
export async function saveCampaign(campaignData: Omit<Campaign, 'id' | 'createdAt'>): Promise<void> {
  try {
    const campaignsCollection = collection(db, 'campaigns');
    await addDoc(campaignsCollection, {
      ...campaignData,
      createdAt: serverTimestamp(),
    });
    console.log(`Campaign ${campaignData.name} saved for user ${campaignData.userId}`);
  } catch (error) {
    console.error("Error saving campaign:", error);
    throw new Error("Failed to save the campaign.");
  }
}

/**
 * Fetches all campaigns for a given user.
 * @param user The authenticated user object.
 * @returns A promise that resolves to an array of campaigns.
 */
export async function getCampaignsForUser(user: User): Promise<Campaign[]> {
  try {
    const campaignsCollection = collection(db, 'campaigns');
    const q = query(
      campaignsCollection, 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return [];
    }
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Campaign));

  } catch (error) {
    console.error("Error fetching campaigns for user:", error);
    // Return an empty array or re-throw, depending on desired error handling.
    return [];
  }
}
