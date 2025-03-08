import { useSignal } from "@preact/signals";
import PromptEditor from "./PromptEditor.tsx";
import Controls from "./Controls.tsx";
import { useState } from "preact/hooks";
import FileTable, { FileStatus } from "./FileTable.tsx";
import ApiKeyInput from "./ApiKeyInput.tsx";
import Accordion from "../components/Accordion.tsx";

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
	const [openSectionIndex, setOpenSectionIndex] = useState(0);

	const clearResults = () => {
		results.value = [];
		setFiles([]);
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

	const handleNext = () => {
		if (openSectionIndex < accordionSections.length - 1) {
			setOpenSectionIndex(openSectionIndex + 1);
		}
	};

	const handlePrev = () => {
		if (openSectionIndex > 0) {
			setOpenSectionIndex(openSectionIndex - 1);
		}
	};

	const nextButton = <button onClick={handleNext} class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors float-right mb-2">Next</button>
	const prevButton = <button onClick={handlePrev} class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors">Previous</button>

	const accordionSections = [
		{
			title: "API Key Configuration",
			content: (
				<>
					<ApiKeyInput />
					{ nextButton }
				</>
			)
		},
		{
			title: "Prompt Configuration",
			content: (
				<>
					<PromptEditor prompt={prompt} />
					<div class="flex flex-row justify-between">
						{ prevButton }
						{ nextButton }
					</div>
				</>
			)
		},
		{
			title: "File Processing",
			content: (
				<>
					<Controls
						prevButton={prevButton}
						isProcessing={isProcessing}
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
							status: 'ready' as const
						}))])}
					/>
				</>
			)
		}
	];

	return (
		<main class="p-4 mx-auto max-w-screen-md">
			<h1 class="text-xl mb-4">Batch Vision</h1>
			<Accordion 
				sections={accordionSections}
				openIndex={openSectionIndex}
				onSectionChange={setOpenSectionIndex}
			/>
		</main>
	);
} 