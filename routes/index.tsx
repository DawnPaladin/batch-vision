import { useSignal } from "@preact/signals";
import FileDropZone from "../islands/FileDropZone.tsx";
import PromptEditor from "../islands/PromptEditor.tsx";
import Controls from "../islands/Controls.tsx";
import FileProcessor from "../islands/FileProcessor.tsx";

interface ProcessedResult {
	filename: string;
	date: string;
	amount: number;
	error?: string;
}

export default function Home() {
	const prompt = useSignal(
		"Please extract the date and the total amount from this image of a receipt. Totals should include tips where present. Respond only with a JSON object matching this schema: { total_amount, date } Do not respond with markdown."
	);
	const results = useSignal<ProcessedResult[]>([]);
	const isProcessing = useSignal(false);

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
			<PromptEditor prompt={prompt} />
			<Controls 
				isProcessing={isProcessing}
				hasResults={useSignal(results.value.length > 0)}
				onProcess={() => {}}
				onClear={clearResults}
				onDownload={downloadResults}
			/>
			<FileProcessor 
				prompt={prompt}
				results={results}
				isProcessing={isProcessing}
			/>
			
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
