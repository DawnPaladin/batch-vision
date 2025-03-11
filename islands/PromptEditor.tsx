import { Signal } from "@preact/signals";
import { useState } from "preact/hooks";
import { JsonSchema } from "../types/schema.ts";

interface PromptEditorProps {
	prompt: Signal<string>;
	schema?: Signal<JsonSchema>;
}

export default function PromptEditor({ prompt, schema }: PromptEditorProps) {
	// If no schema is provided, only render the prompt editor
	if (!schema) {
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

	const [imagesOf, setImagesOf] = useState("");
	const [schemaDescription, setSchemaDescription] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState("");

	// Generate schema and prompt from natural language description
	const generateSchema = async () => {
		if (!imagesOf.trim() || !schemaDescription.trim()) {
			setError("Please fill in both fields");
			return;
		}

		const apiKey = localStorage.getItem("openai_api_key");
		if (!apiKey) {
			setError("Please enter your OpenAI API key in the API Key Configuration section");
			return;
		}

		setIsGenerating(true);
		setError("");

		try {
			const response = await fetch("/api/generate-schema", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					imagesOf: imagesOf.trim(),
					schemaDescription: schemaDescription.trim(),
					apiKey,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to generate schema");
			}

			const data = await response.json();
			
			// Update the schema and prompt with generated values
			schema.value = data.schema;
			prompt.value = data.promptText;
		} catch (error: unknown) {
			console.error("Error generating schema:", error);
			setError(error instanceof Error ? error.message : "An error occurred while generating the schema");
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<div>
			<div class="mb-6">
				<label htmlFor="imagesOf" class="block text-sm font-medium mb-1">What are you uploading images of?</label>
				<input 
					type="text" 
					id="imagesOf" 
					class="border border-blue-500 rounded px-3 py-2 w-full" 
					value={imagesOf}
					onChange={(e) => setImagesOf(e.currentTarget.value)}
					placeholder="e.g., receipts, product labels, business cards"
				/>
			</div>
			<div class="mb-6">
				<label htmlFor="schemaDescription" class="block text-sm font-medium mb-1">What information do you need out of each image?</label>
				<textarea 
					id="schemaDescription" 
					class="block border border-blue-500 rounded px-3 py-2 w-full h-32" 
					value={schemaDescription}
					onChange={(e) => setSchemaDescription(e.currentTarget.value)}
					placeholder="e.g., store name, date of purchase, total amount, list of items with their prices"
				/>
			</div>
			
			{error && (
				<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
					<div class="flex items-center">
						<img src="alert-triangle.svg" alt="Warning" class="m-3" />
						<span class="text-red-700 font-medium">Error</span>
					</div>
					<p class="text-red-600 mt-1">{error}</p>
				</div>
			)}
			
			<button 
				onClick={generateSchema}
				disabled={isGenerating}
				class={`px-4 py-2 rounded font-medium ${
					isGenerating 
					? "bg-gray-400 cursor-not-allowed" 
					: "bg-blue-500 text-white hover:bg-blue-600"
				}`}
			>
				{isGenerating ? "Generating..." : "Generate prompt"}
			</button>

			{schema.value && Object.keys(schema.value.properties).length > 0 && (
				<div class="mt-8">
					<h2 class="text-lg font-semibold mb-2">Generated Schema</h2>
					<div class="bg-gray-100 p-4 rounded-lg mb-6 overflow-x-auto">
						<pre class="whitespace-pre-wrap">
							{JSON.stringify(schema.value, null, 2)}
						</pre>
					</div>
					
					<h2 class="text-lg font-semibold mb-2">Generated Prompt</h2>
					<textarea
						class="w-full p-3 border rounded-lg mb-4 min-h-[120px]"
						value={prompt.value}
						onChange={(e) => prompt.value = e.currentTarget.value}
					/>
				</div>
			)}
		</div>
	);
} 