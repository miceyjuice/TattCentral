import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/modules/admin/routes/AdminLayout";
import AdminArtists from "@/modules/admin/routes/AdminArtists";
import AdminDashboard from "@/modules/admin/routes/AdminDashboard";
import AdminHistory from "@/modules/admin/routes/AdminHistory";
import AdminSettings from "@/modules/admin/routes/AdminSettings";
import { BookingRoute } from "@/modules/booking/routes/BookingRoute";
import { BookingConfirmation } from "@/modules/booking/routes/BookingConfirmation";
import { CancelAppointmentPage } from "@/pages/CancelAppointmentPage/CancelAppointmentPage";
import LoginPage from "@/pages/LoginPage/LoginPage";
import LandingPage from "@/pages/LandingPage/LandingPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<LandingPage />} />
				<Route path="/booking" element={<BookingRoute />} />
				<Route path="/booking/confirmation" element={<BookingConfirmation />} />
				<Route path="/cancel/:appointmentId" element={<CancelAppointmentPage />} />
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
			<Toaster />
		</BrowserRouter>
	);
}

export default App;
