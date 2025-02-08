import { useSignal } from "@preact/signals";
import FileDropZone from "../islands/FileDropZone.tsx";

export default function Home() {
	const prompt =
		"Please extract the date and the total amount from this image of a receipt. Totals should include tips where present. Respond with only a CSV containing two columns: Date and Amount.";

	return (
		<main class="p-4 mx-auto max-w-screen-md">
			<h1 class="text-xl mb-4">Batch Vision</h1>
			<div class="mb-2">Prompt:</div>
			<textarea
				class="w-full p-2 border rounded-lg mb-4 min-h-[100px]"
				value={prompt}
			/>
			<div class="flex justify-center mb-4 gap-2">
				<button class="flex-grow px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
					Process files
				</button>
				<button class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
					Clear
				</button>
				<button class="w-1/4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
					Download results
				</button>
			</div>
			<FileDropZone />
		</main>
	);
}
