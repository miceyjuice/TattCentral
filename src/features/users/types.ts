export type UserRole = "admin" | "artist" | "client" | "receptionist";

export type UserDocument = {
	email: string;
	firstName: string;
	lastName: string;
	role: UserRole;
};
