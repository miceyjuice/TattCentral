import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";

/**
 * Payment success page shown after successful Stripe checkout
 * The actual appointment is created by the Stripe webhook
 */
export function PaymentSuccessPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const sessionId = searchParams.get("session_id");

	// Log session ID for debugging (in production, you might verify with backend)
	useEffect(() => {
		if (sessionId) {
			console.log("Payment successful, session:", sessionId);
		}
	}, [sessionId]);

	return (
		<>
			<Navigation showBookNow={false} />
			<main className="flex min-h-screen flex-col items-center justify-center px-6">
				<div className="flex max-w-md flex-col items-center text-center">
					{/* Success Icon */}
					<div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
						<CheckCircle className="h-10 w-10 text-green-500" />
					</div>

					{/* Title */}
					<h1 className="mb-3 text-3xl font-bold text-white">Payment Successful!</h1>

					{/* Description */}
					<p className="mb-8 text-lg text-white/60">
						Thank you for your deposit. Your booking request has been submitted and is awaiting confirmation
						from our team. You'll receive an email once your appointment is confirmed.
					</p>

					{/* Info Card */}
					<div className="mb-8 w-full rounded-xl border border-white/10 bg-white/5 p-6">
						<div className="flex items-start gap-4">
							<Calendar className="mt-0.5 h-5 w-5 flex-shrink-0 text-white/40" />
							<div className="text-left">
								<h3 className="font-medium text-white">What happens next?</h3>
								<ul className="mt-2 space-y-1 text-sm text-white/60">
									<li>• Our team will review your booking request</li>
									<li>• You'll receive a confirmation email within 24 hours</li>
									<li>• Your deposit is refundable if cancelled 24h+ before</li>
								</ul>
							</div>
						</div>
					</div>

					{/* Actions */}
					<div className="flex w-full flex-col gap-3 sm:flex-row">
						<Button
							onClick={() => navigate("/")}
							variant="outline"
							className="flex-1 border-white/20 text-white hover:bg-white/10"
						>
							Back to Home
						</Button>
						<Button
							onClick={() => navigate("/artists")}
							className="flex-1 gap-2 bg-white text-black hover:bg-white/90"
						>
							View Artists
							<ArrowRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</main>
		</>
	);
}
