import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Trash2, Upload } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";

interface DropzoneProps {
	value?: File[];
	onChange?: (files: File[]) => void;
	maxFiles?: number;
	maxSize?: number; // in bytes
	accept?: string[]; // e.g. ['image/jpeg', 'image/png']
	className?: string;
	id?: string;
}

export function Dropzone({
	value,
	onChange,
	maxFiles = 3,
	maxSize = 5 * 1024 * 1024,
	accept,
	className,
	id,
}: DropzoneProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [files, setFiles] = useState<File[]>(value ?? []);

	// Sync internal state when a controlled value is provided
	useEffect(() => {
		if (value === undefined) return;
		setFiles(value);
	}, [value]);

	const handleFileSelect = (fileList: FileList | null) => {
		if (!fileList || fileList.length === 0) return;

		const newFiles = Array.from(fileList);
		const validFiles: File[] = [];
		const errors: string[] = [];

		newFiles.forEach((file) => {
			if (file.size > maxSize) {
				errors.push(`${file.name} is too large (max ${Math.round(maxSize / 1024 / 1024)}MB)`);
			} else if (accept && !accept.includes(file.type)) {
				errors.push(`${file.name} has an invalid type`);
			} else {
				validFiles.push(file);
			}
		});

		if (errors.length > 0) {
			errors.forEach((error) => toast.error(error));
		}

		const remainingSlots = maxFiles - files.length;
		if (remainingSlots <= 0) {
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
			return;
		}

		const filesToAdd = validFiles.slice(0, remainingSlots);
		if (validFiles.length > remainingSlots) {
			toast.warning(`You can only add ${remainingSlots} more file(s).`);
		}

		if (filesToAdd.length > 0) {
			const updatedFiles = [...files, ...filesToAdd];
			setFiles(updatedFiles);
			onChange?.(updatedFiles);
		}

		// Clear the input value to allow re-selecting the same file
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleBoxClick = () => {
		fileInputRef.current?.click();
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		handleFileSelect(e.dataTransfer.files);
	};

	const removeFile = (indexToRemove: number) => {
		const updatedFiles = files.filter((_, index) => index !== indexToRemove);
		setFiles(updatedFiles);
		onChange?.(updatedFiles);
	};

	const isFull = files.length >= maxFiles;

	return (
		<div className={cn("w-full", className)}>
			<div
				className={cn(
					"flex flex-col items-center justify-center rounded-md border-2 border-dashed border-white/10 bg-gray-700/25 p-8 text-center transition-colors",
					isFull ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-gray-700/40",
				)}
				onClick={!isFull ? handleBoxClick : undefined}
				onDragOver={!isFull ? handleDragOver : undefined}
				onDrop={!isFull ? handleDrop : undefined}
			>
				<div className="mb-2 rounded-full bg-white/5 p-3">
					<Upload className="text-soft-white/60 h-5 w-5" />
				</div>
				<p className="text-soft-white text-sm font-medium">
					{isFull ? "Limit reached" : "Upload reference images"}
				</p>
				<p className="text-soft-white/60 mt-1 text-sm">
					{isFull ? (
						<span>Max {maxFiles} files uploaded</span>
					) : (
						<>
							or,{" "}
							<span className="text-fire-sunset hover:text-fire-sunset/90 cursor-pointer font-medium">
								click to browse
							</span>{" "}
							(Max {maxFiles} files, {Math.round(maxSize / 1024 / 1024)}
							MB each)
						</>
					)}
				</p>
				<input
					type="file"
					id={id}
					ref={fileInputRef}
					className="hidden"
					accept={accept?.join(",")}
					multiple
					disabled={isFull}
					onChange={(e) => handleFileSelect(e.target.files)}
					data-testid="dropzone-input"
				/>
			</div>

			{files.length > 0 && (
				<div className="mt-4 space-y-3">
					{files.map((file, index) => {
						const imageUrl = URL.createObjectURL(file);

						return (
							<div
								className="flex items-center gap-3 rounded-lg border border-white/10 bg-gray-700/25 p-2"
								key={`${file.name}-${index}`}
							>
								<div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-white/5">
									{file.type.startsWith("image/") ? (
										<img
											src={imageUrl}
											alt={file.name}
											className="h-full w-full object-cover"
											onLoad={() => URL.revokeObjectURL(imageUrl)}
										/>
									) : (
										<div className="text-soft-white/60 text-xs">File</div>
									)}
								</div>

								<div className="flex flex-1 flex-col overflow-hidden">
									<span className="text-soft-white truncate text-sm font-medium">{file.name}</span>
									<span className="text-soft-white/60 text-xs">
										{Math.round(file.size / 1024)} KB
									</span>
								</div>

								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="text-soft-white/60 h-8 w-8 hover:bg-transparent hover:text-red-400"
									onClick={(e) => {
										e.stopPropagation();
										removeFile(index);
									}}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
