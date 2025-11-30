"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { HelpCircle, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";

export default function FileUpload01() {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
	const [fileProgresses, setFileProgresses] = useState<Record<string, number>>({});

	const handleFileSelect = (files: FileList | null) => {
		if (!files) return;

		const newFiles = Array.from(files);
		setUploadedFiles((prev) => [...prev, ...newFiles]);

		// Simulate upload progress for each file
		newFiles.forEach((file) => {
			let progress = 0;
			const interval = setInterval(() => {
				progress += Math.random() * 10;
				if (progress >= 100) {
					progress = 100;
					clearInterval(interval);
				}
				setFileProgresses((prev) => ({
					...prev,
					[file.name]: Math.min(progress, 100),
				}));
			}, 300);
		});
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

	const removeFile = (filename: string) => {
		setUploadedFiles((prev) => prev.filter((file) => file.name !== filename));
		setFileProgresses((prev) => {
			const newProgresses = { ...prev };
			delete newProgresses[filename];
			return newProgresses;
		});
	};

	return (
		<div className="flex items-center justify-center p-10">
			<Card className="bg-background mx-auto w-full max-w-lg rounded-lg p-0 shadow-md">
				<CardContent className="p-0">
					<div className="p-6 pb-4">
						<div className="flex items-start justify-between">
							<div>
								<h2 className="text-foreground text-lg font-medium">Create a new project</h2>
								<p className="text-muted-foreground mt-1 text-sm">
									Drag and drop files to create a new project.
								</p>
							</div>
						</div>
					</div>

					<div className="mt-2 px-6 pb-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="projectName" className="mb-2">
									Project name
								</Label>
								<Input id="projectName" type="text" defaultValue="Open Source Stripe" />
							</div>

							<div>
								<Label htmlFor="projectLead" className="mb-2">
									Project lead
								</Label>
								<Select defaultValue="1">
									<SelectTrigger id="projectLead" className="w-full ps-2">
										<SelectValue placeholder="Select project lead" />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectItem value="1">
												<img
													className="size-5 rounded"
													src="https://blocks.so/avatar-01.png"
													alt="Ephraim Duncan"
													width={20}
													height={20}
												/>
												<span className="truncate">Ephraim Duncan</span>
											</SelectItem>
											<SelectItem value="2">
												<img
													className="size-5 rounded"
													src="https://blocks.so/avatar-03.png"
													alt="Lucas Smith"
													width={20}
													height={20}
												/>
												<span className="truncate">Lucas Smith</span>
											</SelectItem>
											<SelectItem value="3">
												<img
													className="size-5 rounded"
													src="https://blocks.so/avatar-02.jpg"
													alt="Timur Ercan"
													width={20}
													height={20}
												/>
												<span className="truncate">Timur Ercan</span>
											</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>

					<div className="px-6">
						<div
							className="border-border flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-8 text-center"
							onClick={handleBoxClick}
							onDragOver={handleDragOver}
							onDrop={handleDrop}
						>
							<div className="bg-muted mb-2 rounded-full p-3">
								<Upload className="text-muted-foreground h-5 w-5" />
							</div>
							<p className="text-foreground text-sm font-medium">Upload a project image</p>
							<p className="text-muted-foreground mt-1 text-sm">
								or,{" "}
								<label
									htmlFor="fileUpload"
									className="text-primary hover:text-primary/90 cursor-pointer font-medium"
									onClick={(e) => e.stopPropagation()}
								>
									click to browse
								</label>{" "}
								(4MB max)
							</p>
							<input
								type="file"
								id="fileUpload"
								ref={fileInputRef}
								className="hidden"
								accept="image/*"
								onChange={(e) => handleFileSelect(e.target.files)}
							/>
						</div>
					</div>

					<div className={cn("space-y-3 px-6 pb-5", uploadedFiles.length > 0 ? "mt-4" : "")}>
						{uploadedFiles.map((file, index) => {
							const imageUrl = URL.createObjectURL(file);

							return (
								<div
									className="border-border flex flex-col rounded-lg border p-2"
									key={file.name + index}
									onLoad={() => {
										return () => URL.revokeObjectURL(imageUrl);
									}}
								>
									<div className="flex items-center gap-2">
										<div className="bg-muted row-span-2 flex h-14 w-18 items-center justify-center self-start overflow-hidden rounded-sm">
											<img
												src={imageUrl}
												alt={file.name}
												className="h-full w-full object-cover"
											/>
										</div>

										<div className="flex-1 pr-1">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<span className="text-foreground max-w-[250px] truncate text-sm">
														{file.name}
													</span>
													<span className="text-muted-foreground text-sm whitespace-nowrap">
														{Math.round(file.size / 1024)} KB
													</span>
												</div>
												<Button
													variant="ghost"
													size="sm"
													className="h-8 w-8 bg-transparent! hover:text-red-500"
													onClick={() => removeFile(file.name)}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>

											<div className="flex items-center gap-2">
												<div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
													<div
														className="bg-primary h-full"
														style={{
															width: `${fileProgresses[file.name] || 0}%`,
														}}
													></div>
												</div>
												<span className="text-muted-foreground text-xs whitespace-nowrap">
													{Math.round(fileProgresses[file.name] || 0)}%
												</span>
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>

					<div className="border-border bg-muted flex items-center justify-between rounded-b-lg border-t px-6 py-3">
						<TooltipProvider delayDuration={0}>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="sm"
										className="text-muted-foreground hover:text-foreground flex items-center"
									>
										<HelpCircle className="mr-1 h-4 w-4" />
										Need help?
									</Button>
								</TooltipTrigger>
								<TooltipContent className="bg-background text-foreground border py-3">
									<div className="space-y-1">
										<p className="text-[13px] font-medium">Need assistance?</p>
										<p className="text-muted-foreground dark:text-muted-background max-w-[200px] text-xs">
											Upload project images by dragging and dropping files or using the file
											browser. Supported formats: JPG, PNG, SVG. Maximum file size: 4MB.
										</p>
									</div>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>

						<div className="flex gap-2">
							<Button variant="outline" className="h-9 px-4 text-sm font-medium">
								Cancel
							</Button>
							<Button className="h-9 px-4 text-sm font-medium">Continue</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
