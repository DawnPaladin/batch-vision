import OpenAI from "@openai/openai";
import { encodeBase64 } from "@std/encoding";

const client = new OpenAI({
	apiKey: Deno.env.get("OPENAI_API_KEY"),
});

async function imageToBase64(filePath: string): Promise<string> {
	const imageData = await Deno.readFile(filePath);
	return `data:image/jpeg;base64,${encodeBase64(imageData)}`;
}

async function analyzeImage(filePath: string): Promise<string> {
	try {
		const base64Image = await imageToBase64(filePath);

		const response = await client.chat.completions.create({
			model: "gpt-4-vision-preview",
			messages: [
				{
					role: "user",
					content: [
						{
							type: "text",
							text: "What text do you see in this image?",
						},
						{
							type: "image_url",
							image_url: {
								url: base64Image,
							},
						},
					],
				},
			],
			max_tokens: 300,
		});

		return response.choices[0]?.message?.content || "No text found";
	} catch (error) {
		console.error("Error analyzing image:", error);
		throw error;
	}
}

// Example usage
async function test() {
	const result = await analyzeImage("./path/to/your/image.jpg");
	console.log("Found text:", result);
}
