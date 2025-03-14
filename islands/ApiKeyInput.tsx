import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";

export default function ApiKeyInput() {
	const apiKey = useSignal("");

	useEffect(() => {
		// Access localStorage only in the browser
		const savedApiKey = localStorage.getItem("openai_api_key");
		if (savedApiKey) {
			apiKey.value = savedApiKey;
		}
	}, []);

	const handleApiKeyChange = (e: Event) => {
		const value = (e.target as HTMLInputElement).value;
		apiKey.value = value;
		localStorage.setItem("openai_api_key", value);
	};

	return (
		<div class="mb-4">
			<p class="mb-2 max-w-screen-lg">This tool does not collect any revenue. Instead, you will need to set up an account with OpenAI and <a href="https://platform.openai.com/settings/organization/billing/overview">purchase credit</a> with them. Create an <a href="https://platform.openai.com/api-keys">API key</a> and paste it into the box below; that will charge your usage of this tool to your account with OpenAI.</p>
			<p class="my-2 max-w-screen-lg">LLM used: GPT-4o. Pricing is roughly 2 cents per megabyte of images. You can <a href="https://platform.openai.com/usage">track your usage here</a>.</p>
			<label
				for="api-key"
				class="block text-sm font-medium text-gray-700 mb-1"
			>
				<a
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
				This will only be used for extracting data from the images you upload. We don't keep a copy or use it for anything else.
			</p>
		</div>
	);
}
