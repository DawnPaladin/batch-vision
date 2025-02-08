import { Signal } from "@preact/signals";
import FileDropZone from "./FileDropZone.tsx";
import { useState, useRef } from "preact/hooks";

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
	status: 'pending' | 'processing' | 'completed' | 'error';
	result?: { date: string; amount: number };
	error?: string;
}

export default function FileProcessor({ prompt, results, isProcessing }: FileProcessorProps) {
	const [files, setFiles] = useState<FileStatus[]>([]);
	const promptRef = useRef<HTMLTextAreaElement>(null);

	const handleFilesDrop = (newFiles: File[]) => {
		const newFileStatuses = newFiles.map(file => ({
			file,
			status: 'pending' as const
		}));
		setFiles(prev => [...prev, ...newFileStatuses]);
	};

	const processFiles = async () => {
		isProcessing.value = true;
		
		for (const fileStatus of files) {
			if (fileStatus.status === 'completed') continue;

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
				results.value = [...results.value, {
					filename: fileStatus.file.name,
					date: result.date,
					amount: result.amount
				}];
				setFiles(prev => prev.map(f => 
					f === fileStatus ? { ...f, status: 'completed', result } : f
				));
			} catch (error: unknown) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error';
				setFiles(prev => prev.map(f => 
					f === fileStatus ? { ...f, status: 'error', error: errorMessage } : f
				));
			}
		}

		isProcessing.value = false;
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

			{files.length > 0 && (
				<div class="mt-4">
					<table class="w-full border-collapse border">
						<thead>
							<tr class="bg-gray-100">
								<th class="p-2 text-left">File Name</th>
								<th class="p-2 text-left">Status</th>
								<th class="p-2 text-left">Result</th>
								<th class="p-2 text-left">Actions</th>
							</tr>
						</thead>
						<tbody>
							{files.map((fileStatus, index) => (
								<tr key={index} class="border-t">
									<td class="p-2">{fileStatus.file.name}</td>
									<td class="p-2">{fileStatus.status}</td>
									<td class="p-2">
										{fileStatus.result && (
											<span>
												{fileStatus.result.date}: ${fileStatus.result.amount}
											</span>
										)}
										{fileStatus.error && (
											<span class="text-red-500">{fileStatus.error}</span>
										)}
									</td>
									<td class="p-2">
										<button
											onClick={() => removeFile(fileStatus)}
											class="text-red-500 hover:text-red-700"
										>
											Remove
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>

					<div class="mt-4">
						<button
							onClick={processFiles}
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
			)}
		</div>
	);
} 