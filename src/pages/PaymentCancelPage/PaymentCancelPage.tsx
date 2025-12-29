import { useNavigate } from "react-router-dom";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";

/**
 * Payment cancelled page shown when user cancels Stripe checkout
 */
export function PaymentCancelPage() {
	const navigate = useNavigate();

	return (
		<>
			<Navigation showBookNow={false} />
			<main className="flex min-h-screen flex-col items-center justify-center px-6">
				<div className="flex max-w-md flex-col items-center text-center">
					{/* Cancel Icon */}
					<div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20">
						<XCircle className="h-10 w-10 text-red-500" />
					</div>

					{/* Title */}
					<h1 className="mb-3 text-3xl font-bold text-white">Payment Cancelled</h1>

					{/* Description */}
					<p className="mb-8 text-lg text-white/60">
						Your payment was not completed. Don't worry - no charges were made to your account. You can try
						booking again whenever you're ready.
					</p>

					{/* Info Card */}
					<div className="mb-8 w-full rounded-xl border border-white/10 bg-white/5 p-6">
						<div className="text-left">
							<h3 className="mb-2 font-medium text-white">Why was my payment cancelled?</h3>
							<ul className="space-y-1 text-sm text-white/60">
								<li>• You clicked "Back" or closed the payment window</li>
								<li>• The payment session expired (30 minutes)</li>
								<li>• Your bank declined the transaction</li>
							</ul>
						</div>
					</div>

					{/* Actions */}
					<div className="flex w-full flex-col gap-3 sm:flex-row">
						<Button
							onClick={() => navigate("/")}
							variant="outline"
							className="flex-1 gap-2 border-white/20 text-white hover:bg-white/10"
						>
							<ArrowLeft className="h-4 w-4" />
							Back to Home
						</Button>
						<Button
							onClick={() => navigate("/booking")}
							className="flex-1 gap-2 bg-white text-black hover:bg-white/90"
						>
							<RefreshCw className="h-4 w-4" />
							Try Again
						</Button>
					</div>
				</div>
			</main>
		</>
	);
}
