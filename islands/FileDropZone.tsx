import { Signal, useSignal } from "@preact/signals";

interface FileDropZoneProps {
	onFilesDropped?: (files: File[]) => void;
}

export default function FileDropZone({ onFilesDropped }: FileDropZoneProps) {
	const isDragging = useSignal(false);

	const handleDragOver = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		isDragging.value = true;
	};

	const handleDragEnter = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		isDragging.value = true;
	};

	const handleDragLeave = (e: DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		isDragging.value = false;
	};

	const handleDrop = (e: DragEvent) => {
		console.log("Drop event triggered");
		e.preventDefault();
		e.stopPropagation();
		isDragging.value = false;

		const files = Array.from(e.dataTransfer?.files || []);
		console.log("Dropped files:", files);
		if (files.length > 0 && onFilesDropped) {
			onFilesDropped(files);
		}
	};

	return (
		<div
			class={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
				isDragging.value
					? "border-blue-500 bg-blue-50"
					: "border-gray-300"
			}`}
			onDragOver={handleDragOver}
			onDragEnter={handleDragEnter}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
		>
			<p class="text-gray-600">
				{isDragging.value
					? "Drop files here"
					: "Drag and drop files here or click to select"}
			</p>
		</div>
	);
}
