import { useSignal } from "@preact/signals";
import PromptEditor from "./PromptEditor.tsx";
import Controls, { FileStatus } from "./Controls.tsx";
import { useState } from "preact/hooks";
import FileTable from "./FileTable.tsx";

interface ProcessedResult {
	filename: string;
	date: string;
	amount: number;
	error?: string;
}

export default function Home() {
	const prompt = useSignal(
		"Please extract the date and the total amount from this image of a receipt. " +
		"Totals should include tips where present. If you cannot find a total amount, respond with an error message. " +
		"Respond only with a JSON object matching this schema: { total_amount: string, date: string }. " +
		"The total_amount should never be null. Do not include markdown formatting in your response."
	);
	const results = useSignal<ProcessedResult[]>([]);
	const isProcessing = useSignal(false);
	const [files, setFiles] = useState<FileStatus[]>([]);

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
				prompt={prompt}
				files={files}
				setFiles={setFiles}
				results={results}
				onClear={clearResults}
				onDownload={downloadResults}
			/>
			<FileTable 
				files={files}
				onFilesDrop={(newFiles) => setFiles(prev => [...prev, ...newFiles.map(file => ({
					file,
					status: 'pending' as const
				}))])}
			/>
		</main>
	);
} 