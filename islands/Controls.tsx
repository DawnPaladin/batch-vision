import { Signal } from "@preact/signals";
import { FileStatus } from './FileTable.tsx';
import { JSX } from "preact/jsx-runtime";
import { JsonSchema, ProcessedResult } from "../types/schema.ts";

interface ControlsProps {
	prevButton: JSX.Element,
	isProcessing: Signal<boolean>;
	prompt: Signal<string>;
	files: FileStatus[];
	setFiles: (updater: (prev: FileStatus[]) => FileStatus[]) => void;
	results: Signal<ProcessedResult[]>;
	onClear: () => void;
	onDownload: () => void;
	schema: Signal<JsonSchema>;
}

export default function Controls({
	prevButton,
	isProcessing, 
	prompt,
	files,
	setFiles,
	results,
	onClear, 
	onDownload,
	schema
}: ControlsProps) {
	const MAX_CONCURRENT = 5;

	const processFile = async (fileStatus: FileStatus) => {
		setFiles(prev => prev.map(f => 
			f === fileStatus ? { ...f, status: 'processing' } : f
		));

		try {
			const formData = new FormData();
			formData.append('file', fileStatus.file);
			formData.append('prompt', prompt.value);
			formData.append('apiKey', localStorage.getItem('openai_api_key') || '');
			formData.append('schema', JSON.stringify(schema.value));

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
					result: result
				} : f
			));

			results.value = [...results.value, {
				filename: fileStatus.file.name,
				...result
			}];
		} catch (error: unknown) {
			console.error('Processing error:', error);
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			setFiles(prev => prev.map(f => 
				f === fileStatus ? { ...f, status: 'error', error: errorMessage } : f
			));
		}
	};

	const processFiles = async () => {
		isProcessing.value = true;
		
		const pendingFiles = files.filter(f => f.status !== 'done');
		const activeProcesses = new Set<Promise<void>>();

		const processNext = () => {
			const nextFile = pendingFiles.shift();
			if (nextFile) {
				const process = processFile(nextFile)
					.finally(() => {
						activeProcesses.delete(process);
						processNext();
					});
				activeProcesses.add(process);
			}
		};

		// Start initial batch of processes
		for (let i = 0; i < MAX_CONCURRENT && pendingFiles.length > 0; i++) {
			processNext();
		}

		// Wait for all processes to complete
		while (activeProcesses.size > 0) {
			await Promise.race(activeProcesses);
		}

		isProcessing.value = false;
	};

	return (
		<div class="flex justify-center mb-4 gap-2">
			{ prevButton }
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