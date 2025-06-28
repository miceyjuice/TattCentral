import { BookingPage } from "@/pages/BookingPage/BookingPage";
import LandingPage from "@/pages/LandingPage/LandingPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<LandingPage />} />
				<Route path="/booking" element={<BookingPage />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
