import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "./database";
import { initialData } from "./schema";

export async function initializeDatabase(reset = false) {
    console.log("Starting database initialization...");

    for (const [collectionName, data] of Object.entries(initialData)) {
        const colRef = collection(db, collectionName);
        
        if (reset) {
            console.log(`Resetting collection: ${collectionName}`);
            const snapshot = await getDocs(colRef);
            for (const docSnap of snapshot.docs) {
                await deleteDoc(doc(db, collectionName, docSnap.id));
            }
        }

        // Check if collection is empty
        const snapshot = await getDocs(colRef);
        if (snapshot.empty) {
            console.log(`Initializing collection: ${collectionName}`);
            for (const item of data) {
                await addDoc(colRef, {
                    ...item,
                    createdAt: serverTimestamp()
                });
            }
        } else {
            console.log(`Collection ${collectionName} already has data. Skipping.`);
        }
    }

    console.log("Database initialization complete.");
}
