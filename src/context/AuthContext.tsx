import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, type User, type UserCredential } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextValue {
	user: User | null;
	loading: boolean;
	login: (email: string, password: string) => Promise<UserCredential>;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (currentUser: User | null) => {
			setUser(currentUser);
			setLoading(false);
		});

		return unsubscribe;
	}, []);

	const value = useMemo(() => {
		const login = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password);
		const logout = () => signOut(auth);

		return { user, loading, login, logout } satisfies AuthContextValue;
	}, [user, loading]);

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
