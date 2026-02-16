import { getFirebaseDb } from "@/lib/firebase";
import { Announcement } from "@/types/announcement";

const COLLECTION_NAME = "announcements";

// Create Announcement (Auto-generated ID)
export const createAnnouncement = async (
  data: Omit<Announcement, "id" | "createdAt">,
) => {
  try {
    const db = await getFirebaseDb();
    const { addDoc, collection, serverTimestamp } =
      await import("firebase/firestore");
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating announcement:", error);
    throw error;
  }
};

// Create Announcement with specific ID (for when we need ID before creation, e.g. for Storage path)
export const createAnnouncementWithId = async (
  id: string,
  data: Omit<Announcement, "id" | "createdAt">,
) => {
  try {
    const db = await getFirebaseDb();
    const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
    const docRef = doc(db, COLLECTION_NAME, id);
    await setDoc(docRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    console.error("Error creating announcement with ID:", error);
    throw error;
  }
};

// Get All Announcements
export const getAnnouncements = async () => {
  try {
    const db = await getFirebaseDb();
    const { collection, getDocs, orderBy, query } =
      await import("firebase/firestore");
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy("createdAt", "desc"),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Announcement[];
  } catch (error) {
    console.error("Error fetching announcements:", error);
    throw error;
  }
};

// Update Announcement
export const updateAnnouncement = async (
  id: string,
  data: Partial<Announcement>,
) => {
  try {
    const db = await getFirebaseDb();
    const { doc, updateDoc, serverTimestamp } =
      await import("firebase/firestore");
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating announcement:", error);
    throw error;
  }
};

// Delete Announcement
export const deleteAnnouncement = async (id: string) => {
  try {
    const db = await getFirebaseDb();
    const { doc, deleteDoc } = await import("firebase/firestore");
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting announcement:", error);
    throw error;
  }
};

// Get Latest Announcement (For Dashboard) — single query
export const getLatestAnnouncement = async () => {
  try {
    const db = await getFirebaseDb();
    const { collection, getDocs, limit, orderBy, query } =
      await import("firebase/firestore");
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy("createdAt", "desc"),
      limit(1),
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      return {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data(),
      } as Announcement;
    }

    return null;
  } catch (error) {
    console.error("Error fetching latest announcement:", error);
    return null;
  }
};
