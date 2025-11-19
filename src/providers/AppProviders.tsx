import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "@/context/AuthContext";

interface AppProvidersProps {
	children: ReactNode;
}

const queryClient = new QueryClient();

const AppProviders = ({ children }: AppProvidersProps) => {
	return (
		<AuthProvider>
			<QueryClientProvider client={queryClient}>
				{children}
				{import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} /> : null}
			</QueryClientProvider>
		</AuthProvider>
	);
};

export default AppProviders;
