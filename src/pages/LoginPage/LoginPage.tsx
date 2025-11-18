import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Location } from "react-router-dom";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const loginSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	password: z.string().min(6, "Password must have at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
	const { login, user } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [authError, setAuthError] = useState<string | null>(null);
	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: { email: "", password: "" },
	});

	if (user) {
		return <Navigate to="/admin" replace />;
	}

	const onSubmit = async (values: LoginFormValues) => {
		setAuthError(null);

		try {
			await login(values.email, values.password);
			const fromPath = (location.state as { from?: Location } | undefined)?.from?.pathname ?? "/admin";
			navigate(fromPath, { replace: true });
		} catch (error) {
			setAuthError("Invalid credentials. Please try again.");
			console.error(error);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-[#171212] px-4 py-12 text-white">
			<div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#1f1818] p-8 shadow-2xl">
				<div className="mb-8 space-y-2 text-center">
					<h1 className="text-3xl font-semibold tracking-tight">Admin Access</h1>
					<p className="text-sm text-white/60">Sign in to manage appointments and studio updates.</p>
				</div>
				<Form {...form}>
					<form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input type="email" placeholder="admin@tattcentral.com" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<Input type="password" placeholder="••••••••" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{authError ? <p className="text-sm text-red-400">{authError}</p> : null}
						<Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
							{form.formState.isSubmitting ? "Signing in..." : "Sign in"}
						</Button>
					</form>
				</Form>
				<div className="mt-6 text-center text-xs text-white/50">
					Need access?{" "}
					<Link className="text-white" to="/">
						Contact the studio
					</Link>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
