import { Signal } from "@preact/signals";
import FileDropZone from "./FileDropZone.tsx";
import { useState, useRef, useImperativeHandle } from "preact/hooks";
import { forwardRef, ForwardedRef } from "preact/compat";

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

interface FileStatus {
	file: File;
	status: 'pending' | 'processing' | 'done' | 'error';
	result?: { date: string; amount: number };
	error?: string;
}

export default forwardRef(function FileProcessor(
	{ prompt, results, isProcessing }: FileProcessorProps,
	ref: ForwardedRef<{ processFiles: () => Promise<void> }>
) {
	const [files, setFiles] = useState<FileStatus[]>([]);
	const promptRef = useRef<HTMLTextAreaElement>(null);

	// Expose processFiles to parent
	useImperativeHandle(ref, () => ({
		processFiles: async () => {
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
					
					// Update files state using filename to identify the correct file
					setFiles(prev => {
						const newFiles = prev.map(f => 
							f.file.name === fileStatus.file.name ? { 
								...f, 
								status: 'done' as const,
								result: {
									date: result.date,
									amount: result.amount
								}
							} : f
						);
						return newFiles;
					});

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
		}
	}));

	const handleFilesDrop = (newFiles: File[]) => {
		const newFileStatuses = newFiles.map(file => ({
			file,
			status: 'pending' as const
		}));
		setFiles(prev => [...prev, ...newFileStatuses]);
	};

	const removeFile = (fileToRemove: FileStatus) => {
		setFiles(prev => prev.filter(f => f !== fileToRemove));
	};

	return (
		<div class="space-y-4">
			<div>
				<textarea
					ref={promptRef}
					placeholder="Enter your prompt here..."
					class="w-full p-2 border rounded"
					rows={3}
				/>
			</div>

			<FileDropZone onFilesDrop={handleFilesDrop} />

			<div class="mt-4">
				<table class="w-full border-collapse border">
					<thead>
						<tr class="bg-gray-100">
							<th class="p-2 text-left">File Name</th>
							<th class="p-2 text-left">Status</th>
							<th class="p-2 text-left">Date</th>
							<th class="p-2 text-left">Amount</th>
						</tr>
					</thead>
					<tbody>
						{files.map((fileStatus, index) => (
							<tr key={index} class="border-t">
								<td class="p-2">{fileStatus.file.name}</td>
								<td class="p-2">{fileStatus.status}</td>
								<td class="p-2">
									{fileStatus.result?.date || (
										fileStatus.error && <span class="text-red-500">{fileStatus.error}</span>
									)}
								</td>
								<td class="p-2">
									{fileStatus.result && (
										<span>${fileStatus.result.amount.toFixed(2)}</span>
									)}
									{fileStatus.error && (
										<span class="text-red-500">{fileStatus.error}</span>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>

				<div class="mt-4">
					<button
						onClick={() => {
							if (typeof ref === 'function') return;
							ref?.current?.processFiles();
						}}
						disabled={isProcessing.value}
						class={`px-4 py-2 rounded text-white ${
							isProcessing.value 
								? 'bg-gray-400' 
								: 'bg-blue-500 hover:bg-blue-600'
						}`}
					>
						{isProcessing.value ? 'Processing...' : 'Process Files'}
					</button>
				</div>
			</div>
		</div>
	);
});