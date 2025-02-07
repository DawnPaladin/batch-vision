import { useCallback, useState } from "preact/hooks";
import ReceiptTable from "./ReceiptTable.tsx";

interface FileRecord {
	filename: string;
	date: string;
	amount: string;
	status: string;
}

export default function FileDropZone() {
	const [files, setFiles] = useState<FileRecord[]>([]);

	const onDrop = useCallback((e: DragEvent) => {
		e.preventDefault();
		
		const droppedFiles = Array.from(e.dataTransfer?.files || []);
		const newFileRecords: FileRecord[] = droppedFiles.map(file => ({
			filename: file.name,
			date: "",
			amount: "",
			status: "Unprocessed"
		}));
		
		setFiles(prev => [...prev, ...newFileRecords]);
	}, []);

	const onDragOver = useCallback((e: DragEvent) => {
		e.preventDefault();
	}, []);

	return (
		<div>
			<div
				onDrop={onDrop}
				onDragOver={onDragOver}
				class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
			>
				Drop receipt images here
			</div>

			{files.length > 0 && <ReceiptTable files={files} />}
		</div>
	);
}
