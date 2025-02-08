import { Signal } from "@preact/signals";

interface PromptEditorProps {
	prompt: Signal<string>;
}

export default function PromptEditor({ prompt }: PromptEditorProps) {
	return (
		<>
			<div class="mb-2">Prompt:</div>
			<textarea
				class="w-full p-2 border rounded-lg mb-4 min-h-[100px]"
				value={prompt.value}
				onChange={(e) => prompt.value = e.currentTarget.value}
			/>
		</>
	);
} 