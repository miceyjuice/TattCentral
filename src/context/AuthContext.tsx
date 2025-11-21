import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, type User, type UserCredential } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile, type UserDocument } from "@/features/users";

interface AuthContextValue {
	user: User | null;
	userProfile: UserDocument | null;
	loading: boolean;
	login: (email: string, password: string) => Promise<UserCredential>;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [userProfile, setUserProfile] = useState<UserDocument | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (currentUser: User | null) => {
			setUser(currentUser);

			if (currentUser) {
				try {
					const profile = await getUserProfile(currentUser.uid);
					setUserProfile(profile);
				} catch (error) {
					console.error("Failed to fetch user profile:", error);
					setUserProfile(null);
				}
			} else {
				setUserProfile(null);
			}

			setLoading(false);
		});

		return unsubscribe;
	}, []);

	const value = useMemo(() => {
		const login = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password);
		const logout = () => signOut(auth);

		return { user, userProfile, loading, login, logout } satisfies AuthContextValue;
	}, [user, userProfile, loading]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}

	return context;
};
