import { useSignal } from "@preact/signals";
import PromptEditor from "./PromptEditor.tsx";
import Controls from "./Controls.tsx";
import { useState } from "preact/hooks";
import FileTable, { FileStatus } from "./FileTable.tsx";
import ApiKeyInput from "./ApiKeyInput.tsx";
import Accordion from "../components/Accordion.tsx";
import { ProcessedResult, JsonSchema } from "../types/schema.ts";
import { generateCsv, downloadCsv } from "../utils/csv.ts";

export default function Home() {
	const prompt = useSignal(
		"Please extract the date and the total amount from this image. " +
		"Totals should include tips where present. If you cannot find a total amount, respond with an error message. " +
		"Respond only with a JSON object matching this schema: { total_amount: string, date: string }. " +
		"The total_amount should never be null. Do not include markdown formatting in your response."
	);
	
	// Add schema signal with the default schema
	const schema = useSignal<JsonSchema>({
		type: "object",
		properties: {
			date: {
				type: "string",
				description: "The date of the receipt in mm/dd/yyyy format.",
			},
			amount: {
				type: "number",
				description: "The amount, including tips, in monetary format.",
			},
		},
		required: ["date", "amount"],
		additionalProperties: false,
	});
	
	const results = useSignal<ProcessedResult[]>([]);
	const isProcessing = useSignal(false);
	const [files, setFiles] = useState<FileStatus[]>([]);
	const [openSectionIndex, setOpenSectionIndex] = useState(0);

	const clearResults = () => {
		results.value = [];
		setFiles([]);
	};

	const downloadResults = () => {
		const csvContent = generateCsv(results.value, schema.value);
		downloadCsv(csvContent);
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

	const nextButton = <button onClick={handleNext} class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors">Next</button>
	const prevButton = <button onClick={handlePrev} class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors">Previous</button>

	const accordionSections = [
		{
			title: "API Key Configuration",
			content: (
				<>
					<ApiKeyInput />
					<div class="flex flex-row justify-end">{ nextButton }</div>
				</>
			)
		},
		{
			title: "Prompt Configuration",
			content: (
				<>
					<PromptEditor prompt={prompt} schema={schema} />
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
						schema={schema}
					/>
					<FileTable 
						files={files}
						onFilesDrop={(newFiles) => setFiles(prev => [...prev, ...newFiles.map(file => ({
							file,
							status: 'ready' as const
						}))])}
						schema={schema}
					/>
				</>
			)
		}
	];

	return (
		<main class="p-4">
			<div className="max-w-screen-lg">
				<h1 class="text-xl mb-4">Batch Vision</h1>
				<p class="my-2">This is a tool for taking a bunch of images and getting specific pieces of data out of each one. I used it to take hundreds of receipts and get the date and total from each. LLMs are quite good at reading handwriting and figuring out which number in the image is the one you want.</p>
				<p class="mt-2 mb-4">If you notice any bugs or have any feature requests, please <a href="https://github.com/DawnPaladin/batch-vision/issues">open an issue on GitHub</a>.</p>
				<div class="flex flex-row items-center bg-yellow-100 border-yellow-400 rounded-xl border-2 my-2 py-2 pr-2">
					<img src="alert-triangle.svg" alt="Warning" class="m-3" />
					LLMs don't always get it right. I was able to get my error rate down to 3% by running my data twice and checking differences between the runs, but your results may vary. Exercise an amount of caution appropriate to the seriousness of any mistakes.
				</div>
			</div>
			<Accordion 
				sections={accordionSections}
				openIndex={openSectionIndex}
				onSectionChange={setOpenSectionIndex}
			/>
		</main>
	);
} 