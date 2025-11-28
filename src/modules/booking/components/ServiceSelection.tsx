import { cn } from "@/lib/utils";
import { SERVICE_OPTIONS, type ServiceOption } from "../types";

interface ServiceSelectionProps {
	selectedServiceId: string | null;
	onSelect: (service: ServiceOption) => void;
}

export const ServiceSelection = ({ selectedServiceId, onSelect }: ServiceSelectionProps) => {
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
			{SERVICE_OPTIONS.map((service) => (
				<button
					key={service.id}
					type="button"
					onClick={() => onSelect(service)}
					className={cn(
						"flex flex-col items-start rounded-xl border px-6 py-4 text-left transition-all",
						selectedServiceId === service.id
							? "border-fire-sunset bg-fire-sunset/10 ring-fire-sunset ring-1"
							: "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10",
					)}
				>
					<span className="text-soft-white font-medium">{service.label}</span>
					<span className="text-soft-white/60 mt-1 text-sm">{service.description}</span>
				</button>
			))}
		</div>
	);
};
