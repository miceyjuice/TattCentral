import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, Loader2, Save, User, X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
	type Artist,
	type TattooStyle,
	type PortfolioImage,
	useUpdateArtistProfile,
	useUploadProfileImage,
	useUploadPortfolioImage,
	useDeletePortfolioImage,
} from "@/features/artists";

const TATTOO_STYLES: TattooStyle[] = [
	"Traditional",
	"Neo-Traditional",
	"Realism",
	"Blackwork",
	"Watercolor",
	"Japanese",
	"Tribal",
	"Geometric",
	"Minimalist",
	"Portrait",
	"Lettering",
	"Other",
];

const profileSchema = z.object({
	bio: z.string().max(500, "Bio must be under 500 characters").optional(),
	specialties: z.array(z.string()).max(5, "Maximum 5 specialties"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ArtistEditSheetProps {
	artist: Artist | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

/**
 * Specialty toggle button
 */
function SpecialtyToggle({
	specialty,
	selected,
	onToggle,
	disabled,
}: {
	specialty: TattooStyle;
	selected: boolean;
	onToggle: (specialty: TattooStyle) => void;
	disabled: boolean;
}) {
	return (
		<button
			type="button"
			onClick={() => onToggle(specialty)}
			disabled={disabled && !selected}
			className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
				selected
					? "bg-white text-black"
					: disabled
						? "cursor-not-allowed bg-white/5 text-white/30"
						: "bg-white/10 text-white/70 hover:bg-white/20"
			}`}
		>
			{specialty}
		</button>
	);
}

/**
 * Portfolio image with delete button
 */
function PortfolioImageItem({
	image,
	onDelete,
	isDeleting,
}: {
	image: PortfolioImage;
	onDelete: () => void;
	isDeleting: boolean;
}) {
	return (
		<div className="group relative aspect-square overflow-hidden rounded-lg bg-[#2a2a2a]">
			<img src={image.url} alt={image.caption ?? "Portfolio"} className="h-full w-full object-cover" />
			<button
				type="button"
				onClick={onDelete}
				disabled={isDeleting}
				className="absolute top-2 right-2 rounded-full bg-red-500/80 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600 disabled:opacity-50"
				aria-label="Delete image"
			>
				{isDeleting ? (
					<Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
				) : (
					<Trash2 className="h-4 w-4" aria-hidden="true" />
				)}
			</button>
			{image.caption && (
				<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
					<p className="truncate text-xs text-white">{image.caption}</p>
				</div>
			)}
		</div>
	);
}

/**
 * Artist edit sheet with profile and portfolio management
 */
export function ArtistEditSheet({ artist, open, onOpenChange }: ArtistEditSheetProps) {
	const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
	const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
	const [deletingImageId, setDeletingImageId] = useState<string | null>(null);

	const updateProfile = useUpdateArtistProfile();
	const uploadProfileImage = useUploadProfileImage();
	const uploadPortfolioImage = useUploadPortfolioImage();
	const deletePortfolioImage = useDeletePortfolioImage();

	const form = useForm<ProfileFormValues>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			bio: "",
			specialties: [],
		},
	});

	// Reset form when artist changes
	useEffect(() => {
		if (artist) {
			form.reset({
				bio: artist.bio ?? "",
				specialties: artist.specialties ?? [],
			});
			setProfileImagePreview(null);
			setProfileImageFile(null);
		}
	}, [artist, form]);

	const fullName = artist ? `${artist.firstName} ${artist.lastName}` : "";
	const currentSpecialties = form.watch("specialties");

	const handleSpecialtyToggle = useCallback(
		(specialty: TattooStyle) => {
			const current = form.getValues("specialties");
			if (current.includes(specialty)) {
				form.setValue(
					"specialties",
					current.filter((s) => s !== specialty),
				);
			} else if (current.length < 5) {
				form.setValue("specialties", [...current, specialty]);
			}
		},
		[form],
	);

	const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setProfileImageFile(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setProfileImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handlePortfolioImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file && artist) {
			await uploadPortfolioImage.mutateAsync({
				artistId: artist.id,
				file,
			});
			// Reset input
			event.target.value = "";
		}
	};

	const handleDeletePortfolioImage = async (image: PortfolioImage) => {
		if (!artist) return;
		setDeletingImageId(image.id);
		try {
			await deletePortfolioImage.mutateAsync({
				artistId: artist.id,
				image,
			});
		} finally {
			setDeletingImageId(null);
		}
	};

	const onSubmit = async (values: ProfileFormValues) => {
		if (!artist) return;

		// Upload profile image if changed
		if (profileImageFile) {
			await uploadProfileImage.mutateAsync({
				artistId: artist.id,
				file: profileImageFile,
			});
			setProfileImageFile(null);
			setProfileImagePreview(null);
		}

		// Update profile data
		await updateProfile.mutateAsync({
			artistId: artist.id,
			data: {
				bio: values.bio,
				specialties: values.specialties as TattooStyle[],
			},
		});
	};

	const isSaving = updateProfile.isPending || uploadProfileImage.isPending;
	const isUploadingPortfolio = uploadPortfolioImage.isPending;

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				side="right"
				className="w-full overflow-y-auto border-white/10 bg-[#1a1a1a] text-white sm:max-w-lg"
			>
				<SheetHeader className="border-b border-white/10 pb-4">
					<SheetTitle className="text-white">Edit Artist Profile</SheetTitle>
					<SheetDescription className="text-white/60">
						Update {fullName}'s profile and portfolio
					</SheetDescription>
				</SheetHeader>

				{artist && (
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6 py-6">
							{/* Profile Image */}
							<div className="flex flex-col items-center gap-4">
								<div className="relative">
									<div className="h-24 w-24 overflow-hidden rounded-full bg-[#2a2a2a]">
										{(profileImagePreview ?? artist.profileImageUrl) ? (
											<img
												src={profileImagePreview ?? artist.profileImageUrl}
												alt={fullName}
												className="h-full w-full object-cover"
											/>
										) : (
											<div className="flex h-full w-full items-center justify-center">
												<User className="h-10 w-10 text-white/20" aria-hidden="true" />
											</div>
										)}
									</div>
									<label
										htmlFor="profile-image-upload"
										className="absolute -right-1 -bottom-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-black hover:bg-white/90"
									>
										<Camera className="h-4 w-4" aria-hidden="true" />
										<span className="sr-only">Change profile picture</span>
									</label>
									<input
										id="profile-image-upload"
										type="file"
										accept="image/*"
										onChange={handleProfileImageChange}
										className="hidden"
									/>
								</div>
								{profileImageFile && (
									<div className="flex items-center gap-2 text-xs text-white/60">
										<span>New image selected</span>
										<button
											type="button"
											onClick={() => {
												setProfileImageFile(null);
												setProfileImagePreview(null);
											}}
											className="text-red-400 hover:text-red-300"
										>
											<X className="h-4 w-4" aria-hidden="true" />
											<span className="sr-only">Remove selected image</span>
										</button>
									</div>
								)}
							</div>

							{/* Bio */}
							<FormField
								control={form.control}
								name="bio"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-white">Bio</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Write a short bio about the artist..."
												className="min-h-[100px] resize-none border-white/10 bg-white/5 text-white placeholder:text-white/40"
												{...field}
											/>
										</FormControl>
										<div className="text-xs text-white/40">
											{field.value?.length ?? 0}/500 characters
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Specialties */}
							<div className="space-y-3">
								<Label className="text-white">
									Specialties <span className="text-white/40">({currentSpecialties.length}/5)</span>
								</Label>
								<div className="flex flex-wrap gap-2">
									{TATTOO_STYLES.map((style) => (
										<SpecialtyToggle
											key={style}
											specialty={style}
											selected={currentSpecialties.includes(style)}
											onToggle={handleSpecialtyToggle}
											disabled={currentSpecialties.length >= 5}
										/>
									))}
								</div>
								{form.formState.errors.specialties && (
									<p className="text-sm text-red-400">{form.formState.errors.specialties.message}</p>
								)}
							</div>

							{/* Portfolio Images */}
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<Label className="text-white">
										Portfolio Images{" "}
										<span className="text-white/40">({artist.portfolioImages?.length ?? 0})</span>
									</Label>
									<label
										htmlFor="portfolio-image-upload"
										className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
											isUploadingPortfolio
												? "cursor-not-allowed bg-white/10 text-white/40"
												: "bg-white/10 text-white hover:bg-white/20"
										}`}
									>
										{isUploadingPortfolio ? (
											<Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
										) : (
											<Plus className="h-3 w-3" aria-hidden="true" />
										)}
										Add Image
									</label>
									<input
										id="portfolio-image-upload"
										type="file"
										accept="image/*"
										onChange={handlePortfolioImageUpload}
										disabled={isUploadingPortfolio}
										className="hidden"
									/>
								</div>

								{artist.portfolioImages && artist.portfolioImages.length > 0 ? (
									<div className="grid grid-cols-3 gap-2">
										{artist.portfolioImages.map((image) => (
											<PortfolioImageItem
												key={image.id}
												image={image}
												onDelete={() => handleDeletePortfolioImage(image)}
												isDeleting={deletingImageId === image.id}
											/>
										))}
									</div>
								) : (
									<div className="rounded-lg border border-dashed border-white/10 p-6 text-center">
										<p className="text-sm text-white/40">No portfolio images yet</p>
									</div>
								)}
							</div>

							{/* Save Button */}
							<SheetFooter className="border-t border-white/10 pt-4">
								<Button
									type="submit"
									disabled={isSaving}
									className="w-full gap-2 bg-white text-black hover:bg-white/90"
								>
									{isSaving ? (
										<Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
									) : (
										<Save className="h-4 w-4" aria-hidden="true" />
									)}
									Save Changes
								</Button>
							</SheetFooter>
						</form>
					</Form>
				)}
			</SheetContent>
		</Sheet>
	);
}
