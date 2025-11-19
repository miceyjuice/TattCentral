import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { UserDocument } from "./types";

export const getUserProfile = async (userId: string): Promise<UserDocument | null> => {
	const docRef = doc(db, "users", userId);
	const docSnap = await getDoc(docRef);

	if (docSnap.exists()) {
		return docSnap.data() as UserDocument;
	} else {
		return null;
	}
};
