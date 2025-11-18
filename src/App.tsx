import ProtectedRoute from "@/components/ProtectedRoute";
import AdminPanel from "@/pages/AdminPanel/AdminPanel";
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
							<AdminPanel />
						</ProtectedRoute>
					}
				/>
				<Route path="/login" element={<LoginPage />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
