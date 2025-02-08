import { useSignal } from "@preact/signals";
import FileDropZone from "../islands/FileDropZone.tsx";

interface ProcessedResult {
	filename: string;
	date: string;
	amount: number;
	error?: string;
}

export default function Home() {
	const prompt = useSignal(
		"Please extract the date and the total amount from this image of a receipt. Totals should include tips where present. Respond with only a CSV containing two columns: Date and Amount."
	);
	const results = useSignal<ProcessedResult[]>([]);
	const isProcessing = useSignal(false);

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

	const clearResults = () => {
		results.value = [];
	};

	const downloadResults = () => {
		const csv = [
			'Filename,Date,Amount',
			...results.value.map(r => `${r.filename},${r.date},${r.amount}`),
		].join('\n');

		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'receipt-results.csv';
		a.click();
		URL.revokeObjectURL(url);
	};

	return (
		<main class="p-4 mx-auto max-w-screen-md">
			<h1 class="text-xl mb-4">Batch Vision</h1>
			<div class="mb-2">Prompt:</div>
			<textarea
				class="w-full p-2 border rounded-lg mb-4 min-h-[100px]"
				value={prompt.value}
				onChange={(e) => prompt.value = e.currentTarget.value}
			/>
			<div class="flex justify-center mb-4 gap-2">
				<button
					class="flex-grow px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:bg-gray-400"
					onClick={() => processFiles([])}
					disabled={isProcessing.value}
				>
					{isProcessing.value ? 'Processing...' : 'Process files'}
				</button>
				<button
					class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
					onClick={clearResults}
				>
					Clear
				</button>
				<button
					class="w-1/4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
					onClick={downloadResults}
					disabled={results.value.length === 0}
				>
					Download results
				</button>
			</div>
			<FileDropZone onFiles={processFiles} />
			
			{results.value.length > 0 && (
				<div class="mt-4">
					<table class="w-full border-collapse border">
						<thead>
							<tr class="bg-gray-100">
								<th class="border p-2">Filename</th>
								<th class="border p-2">Date</th>
								<th class="border p-2">Amount</th>
							</tr>
						</thead>
						<tbody>
							{results.value.map((result) => (
								<tr key={result.filename} class={result.error ? "bg-red-50" : ""}>
									<td class="border p-2">{result.filename}</td>
									<td class="border p-2">{result.error ?? result.date}</td>
									<td class="border p-2">{result.error ?? result.amount}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</main>
	);
}
