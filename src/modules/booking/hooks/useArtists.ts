import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { type UserDocument } from "@/features/users/types";
import { useQuery } from "@tanstack/react-query";

export interface Artist extends UserDocument {
	id: string;
}

export const useArtists = () => {
	return useQuery({
		queryKey: ["artists"],
		queryFn: async () => {
			const q = query(collection(db, "users"), where("role", "==", "artist"));
			const snapshot = await getDocs(q);
			return snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as Artist[];
		},
	});
};
