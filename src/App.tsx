import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/modules/admin/routes/AdminLayout";
import AdminArtists from "@/modules/admin/routes/AdminArtists";
import AdminDashboard from "@/modules/admin/routes/AdminDashboard";
import AdminHistory from "@/modules/admin/routes/AdminHistory";
import AdminSettings from "@/modules/admin/routes/AdminSettings";
import { BookingPage } from "@/pages/BookingPage/BookingPage";
import LoginPage from "@/pages/LoginPage/LoginPage";
import LandingPage from "@/pages/LandingPage/LandingPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<LandingPage />} />
				<Route path="/booking" element={<BookingPage />} />
				<Route
					path="/admin"
					element={
						<ProtectedRoute>
							<AdminLayout />
						</ProtectedRoute>
					}
				>
					<Route index element={<AdminDashboard />} />
					<Route path="history" element={<AdminHistory />} />
					<Route path="artists" element={<AdminArtists />} />
					<Route path="settings" element={<AdminSettings />} />
				</Route>
				<Route path="/login" element={<LoginPage />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
