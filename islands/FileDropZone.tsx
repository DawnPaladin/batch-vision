import { useCallback, useState } from "preact/hooks";
import ReceiptTable from "./ReceiptTable.tsx";

interface FileRecord {
	filename: string;
	date: string;
	amount: string;
	status: string;
}

interface FileDropZoneProps {
	onFiles: (files: File[]) => void;
}

export default function FileDropZone({ onFiles }: FileDropZoneProps) {
	const [files, setFiles] = useState<FileRecord[]>([]);
	const [isDragging, setIsDragging] = useState(false);

	const handleDrop = (e: DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		
		const files = Array.from(e.dataTransfer?.files || []);
		const imageFiles = files.filter(file => file.type.startsWith('image/'));
		onFiles(imageFiles);
	};

	const onDragOver = useCallback((e: DragEvent) => {
		e.preventDefault();
	}, []);

	return (
		<div>
			<div
				onDrop={handleDrop}
				onDragOver={onDragOver}
				class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
			>
				Drop receipt images here
			</div>

			{files.length > 0 && <ReceiptTable files={files} />}
		</div>
	);
}
