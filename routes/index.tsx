import { useSignal } from "@preact/signals";
import Counter from "../islands/Counter.tsx";

export default function Home() {
	const prompt = "Please extract the date and the total amount from each of these receipt images. Totals should include tips where present. Respond with only a CSV containing two columns: Date and Amount."
	return (
		<main>
			<h1 class="text-xl">Batch Vision</h1>
			<div>Prompt:</div>
			<textarea class="w-1/2">
			Please extract the date and the total amount from each of these receipt images. Totals should include tips where present. Respond with only a CSV containing two columns: Date and Amount.
			</textarea>
		</main>
	);
}
