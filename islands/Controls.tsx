import { Signal } from "@preact/signals";
import { useState } from "preact/hooks";

interface ControlsProps {
	isProcessing: Signal<boolean>;
	prompt: Signal<string>;
	files: FileStatus[];
	setFiles: (updater: (prev: FileStatus[]) => FileStatus[]) => void;
	results: Signal<ProcessedResult[]>;
	onClear: () => void;
	onDownload: () => void;
}

export interface FileStatus {
	file: File;
	status: 'pending' | 'processing' | 'done' | 'error';
	result?: { date: string; amount: number };
	error?: string;
}

interface ProcessedResult {
	filename: string;
	date: string;
	amount: number;
	error?: string;
}

export default function Controls({ 
	isProcessing, 
	prompt,
	files,
	setFiles,
	results,
	onClear, 
	onDownload 
}: ControlsProps) {
	const processFiles = async () => {
		isProcessing.value = true;
		
		for (const fileStatus of files) {
			if (fileStatus.status === 'done') continue;

			setFiles(prev => prev.map(f => 
				f === fileStatus ? { ...f, status: 'processing' } : f
			));

			try {
				const formData = new FormData();
				formData.append('file', fileStatus.file);
				formData.append('prompt', prompt.value);

				const response = await fetch('/api/process-image', {
					method: 'POST',
					body: formData,
				});

				if (!response.ok) throw new Error('Processing failed');

				const result = await response.json();
				if (result.error) {
					throw new Error(result.error);
				}
				
				setFiles(prev => prev.map(f => 
					f.file.name === fileStatus.file.name ? { 
						...f, 
						status: 'done' as const,
						result: {
							date: result.date,
							amount: result.amount
						}
					} : f
				));

				results.value = [...results.value, {
					filename: fileStatus.file.name,
					date: result.date,
					amount: result.amount
				}];
			} catch (error: unknown) {
				console.error('Processing error:', error);
				const errorMessage = error instanceof Error ? error.message : 'Unknown error';
				setFiles(prev => prev.map(f => 
					f === fileStatus ? { ...f, status: 'error', error: errorMessage } : f
				));
			}
		}

		isProcessing.value = false;
	};

	return (
		<div class="flex justify-center mb-4 gap-2">
			<button
				class="flex-grow px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:bg-gray-400"
				onClick={processFiles}
				disabled={isProcessing.value}
			>
				{isProcessing.value ? 'Processing...' : 'Process files'}
			</button>
			<button
				class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
				onClick={onClear}
			>
				Clear
			</button>
			<button
				class="w-1/4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
				onClick={onDownload}
				disabled={results.value.length == 0}
			>
				Download results
			</button>
		</div>
	);
} 