import { useSignal } from "@preact/signals";
import FileDropZone from "../islands/FileDropZone.tsx";

export default function Home() {
	const prompt =
		"Please extract the date and the total amount from each of these receipt images. Totals should include tips where present. Respond with only a CSV containing two columns: Date and Amount.";

	return (
		<main class="p-4 mx-auto max-w-screen-md">
			<h1 class="text-xl mb-4">Batch Vision</h1>
			<div class="mb-2">Prompt:</div>
			<textarea
				class="w-full p-2 border rounded-lg mb-4 min-h-[100px]"
				value={prompt}
			/>

			<FileDropZone
				onFilesDropped={(files) => {
					console.log("Files dropped:", files);
					// Handle the dropped files here
				}}
			/>
		</main>
	);
}
