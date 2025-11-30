import { Button } from "@/components/ui/button";
import { Dropzone } from "@/components/ui/dropzone";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import parsePhoneNumber from "libphonenumber-js";
import { useForm } from "react-hook-form";
import z from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const zPhoneNumber = z.string().transform((value, ctx) => {
	const phoneNumber = parsePhoneNumber(value, {
		defaultCountry: "PL",
		defaultCallingCode: "+48",
	});

	if (!phoneNumber?.isValid()) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "Invalid phone number",
		});
		return z.NEVER;
	}

	return phoneNumber.formatInternational();
});

const createFormSchema = (isConsultation: boolean) =>
	z.object({
		name: z.string().min(2, {
			message: "Name must be at least 2 characters.",
		}),
		email: z.string().email({
			message: "Please enter a valid email address.",
		}),
		phone: zPhoneNumber,
		tattooDescription: isConsultation
			? z.string().optional()
			: z.string().min(10, {
					message: "Tattoo description must be at least 10 characters.",
				}),
		referenceImages: z
			.array(z.instanceof(File))
			.optional()
			.refine((files) => !files || files.length <= 3, "Max 3 images allowed.")
			.refine((files) => !files || files.every((file) => file.size <= MAX_FILE_SIZE), `Max file size is 5MB.`)
			.refine(
				(files) => !files || files.every((file) => ACCEPTED_IMAGE_TYPES.includes(file.type)),
				"Only .jpg, .jpeg, .png and .webp formats are supported.",
			),
	});

export type BookingFormData = {
	name: string;
	email: string;
	phone: string;
	tattooDescription?: string;
	referenceImages?: File[];
};

interface BookingFormProps {
	onSubmit: (data: BookingFormData) => void;
	isSubmitting?: boolean;
	isConsultation?: boolean;
}

export const BookingForm = ({ onSubmit, isSubmitting = false, isConsultation = false }: BookingFormProps) => {
	const FormSchema = createFormSchema(isConsultation);
	const form = useForm<BookingFormData>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			name: "",
			email: "",
			phone: "",
			tattooDescription: "",
			referenceImages: [],
		},
	});

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-soft-white">Name</FormLabel>
							<FormControl className="border-none bg-gray-700/25">
								<Input className="text-soft-white py-6" placeholder="John Doe" {...field} required />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-soft-white">Email</FormLabel>
							<FormControl className="border-none bg-gray-700/25">
								<Input
									className="text-soft-white py-6"
									placeholder="john.doe@gmail.com"
									{...field}
									required
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="phone"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-soft-white">Phone</FormLabel>
							<FormControl className="border-none bg-gray-700/25">
								<Input className="text-soft-white py-6" placeholder="111 222 333" {...field} required />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="tattooDescription"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-soft-white">
								{isConsultation ? "Topic of consultation (optional)" : "Tattoo description"}
							</FormLabel>
							<FormControl className="border-none bg-gray-700/25">
								<Textarea
									className="text-soft-white max-h-40 py-3"
									placeholder={
										isConsultation
											? "Briefly describe what you'd like to discuss..."
											: "Describe your tattoo idea, size, and placement"
									}
									{...field}
									required={!isConsultation}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				{!isConsultation && (
					<FormField
						control={form.control}
						name="referenceImages"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-soft-white">Reference Images (Optional)</FormLabel>
								<FormControl>
									<Dropzone
										value={field.value}
										onChange={field.onChange}
										maxFiles={3}
										maxSize={MAX_FILE_SIZE}
										accept={ACCEPTED_IMAGE_TYPES}
									/>
								</FormControl>
								<FormDescription className="text-gray-400">
									Upload up to 3 images (max 5MB each).
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}
				<Button
					type="submit"
					disabled={isSubmitting}
					className="bg-fire-sunset hover:bg-fire-sunset/75 text-soft-white w-full py-6 text-base font-medium transition-colors"
				>
					{isSubmitting ? "Submitting..." : "Submit"}
				</Button>
			</form>
		</Form>
	);
};
