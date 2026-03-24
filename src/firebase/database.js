import { getFirestore, collection } from "firebase/firestore";
import { app } from "./config";

export const db = getFirestore(app);

export const collections = {
    lifeAreas: collection(db, "lifeAreas"),
    projects: collection(db, "projects"),
    tasks: collection(db, "tasks"),
    actions: collection(db, "actions"),
    brainDump: collection(db, "brainDump"),
    followups: collection(db, "followups"),
    settings: collection(db, "settings")
};