import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";

export default function ApiKeyInput() {
	const apiKey = useSignal(localStorage.getItem("openai_api_key") || "");

	const handleApiKeyChange = (e: Event) => {
		const value = (e.target as HTMLInputElement).value;
		apiKey.value = value;
		localStorage.setItem("openai_api_key", value);
	};

	return (
		<div class="mb-4">
			<label
				for="api-key"
				class="block text-sm font-medium text-gray-700 mb-1"
			>
				<a
					class="text-blue-500 underline"
					href="https://platform.openai.com/api-keys"
					target="_blank"
				>
					OpenAI API key
				</a>
			</label>
			<input
				type="text"
				id="api-key"
				value={apiKey}
				onInput={handleApiKeyChange}
				placeholder="Enter OpenAI API key"
				class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
			/>
			<p class="text-sm">
				This will only be used for extracting data from the images you upload. We don't keep a copy or use it for anything else. If you like, you can restrict the key to only grant access to "Model capabilities".
			</p>
		</div>
	);
}
