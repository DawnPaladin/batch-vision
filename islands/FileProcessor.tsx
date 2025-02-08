import { Signal } from "@preact/signals";
import FileDropZone from "./FileDropZone.tsx";

interface ProcessedResult {
	filename: string;
	date: string;
	amount: number;
	error?: string;
}

interface FileProcessorProps {
	prompt: Signal<string>;
	results: Signal<ProcessedResult[]>;
	isProcessing: Signal<boolean>;
}

export default function FileProcessor({ prompt, results, isProcessing }: FileProcessorProps) {
	const processFiles = async (files: File[]) => {
		isProcessing.value = true;
		
		try {
			for (const file of files) {
				const formData = new FormData();
				formData.append('file', file);
				formData.append('prompt', prompt.value);

				const response = await fetch('/api/process-image', {
					method: 'POST',
					body: formData,
				});

				const result = await response.json();
				
				results.value = [...results.value, {
					filename: file.name,
					date: result.date,
					amount: result.amount,
					error: result.error,
				}];
			}
		} catch (error) {
			console.error('Error processing files:', error);
		} finally {
			isProcessing.value = false;
		}
	};

	return <FileDropZone onFiles={processFiles} />;
} 