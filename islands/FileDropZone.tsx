import { useCallback, useState } from "preact/hooks";

interface FileRecord {
	filename: string;
	date: string;
	amount: string;
	status: string;
}

interface FileDropZoneProps {
	onFilesDrop: (files: File[]) => void;
}

export default function FileDropZone({ onFilesDrop }: FileDropZoneProps) {
	const [files, setFiles] = useState<FileRecord[]>([]);
	const [isDragging, setIsDragging] = useState(false);

	const handleDragOver = (e: DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = () => {
		setIsDragging(false);
	};

	const handleDrop = (e: DragEvent) => {
		e.preventDefault();
		setIsDragging(false);

		const droppedFiles = Array.from(e.dataTransfer?.files || []);
		onFilesDrop(droppedFiles);
	};

	return (
		<div>
			<div
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				class={`border-2 border-dashed p-8 text-center rounded-lg ${
					isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
				}`}
			>
				<p>Drag and drop files here</p>
			</div>
		</div>
	);
}
