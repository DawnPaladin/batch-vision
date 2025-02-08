import OpenAI from "jsr:@openai/openai@^4.83.0";

export async function handler(req: Request) {
	if (req.method !== "POST") {
		return new Response("Method not allowed", { status: 405 });
	}

	try {
		const formData = await req.formData();
		const file = formData.get("file") as File;
		const prompt = formData.get("prompt") as string;

		if (!file || !prompt) {
			return new Response(
				JSON.stringify({ error: "Missing file or prompt" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Convert File to base64
		const buffer = await file.arrayBuffer();
		const base64Image = btoa(
			new Uint8Array(buffer).reduce(
				(data, byte) => data + String.fromCharCode(byte),
				"",
			),
		);

		const openai = new OpenAI({
			apiKey: Deno.env.get("OPENAI_API_KEY"),
		});

		const response = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: [
				{
					role: "user",
					content: [
						{ type: "text", text: prompt },
						{
							type: "image_url",
							image_url: {
								url: `data:${file.type};base64,${base64Image}`,
							},
						},
					],
				},
			],
			"response_format": {
				"type": "json_schema",
				"json_schema": {
					"name": "receipt_data",
					"schema": {
						"type": "object",
						"properties": {
							"date": {
								"type": "string",
								"description":
									"The date of the receipt in mm/dd/yyyy format.",
							},
							"amount": {
								"type": "number",
								"description": "The amount, including tips, in monetary format.",
							},
						},
						"required": [
							"date",
							"amount",
						],
						"additionalProperties": false,
					},
					"strict": true,
				},
			},
			max_tokens: 100,
		});

		const result = response.choices[0]?.message?.content;
		console.log("OpenAI response:", result);

		if (!result) {
			throw new Error("No response from OpenAI");
		}

		// Parse JSON response
		let processedResult;
		try {
			// Clean up markdown code blocks if present
			const cleanResult = result.replace(/```json\s*|\s*```/g, "");
			const parsedJson = JSON.parse(cleanResult);

			// Handle both amount or total_amount fields
			const amount = parsedJson.amount || parsedJson.total_amount;

			// Validate the expected structure
			if (!parsedJson.date) {
				throw new Error("Missing date in response");
			}

			// Handle null/missing amount more gracefully
			if (!amount) {
				throw new Error("No amount found in receipt");
			}

			// Clean up amount string and convert to number
			const cleanAmount = amount.toString().replace(/[^0-9.-]/g, "");
			const numericAmount = parseFloat(cleanAmount);
			if (isNaN(numericAmount)) {
				throw new Error("Invalid amount format");
			}

			// Transform to our expected format
			processedResult = {
				date: parsedJson.date,
				amount: numericAmount,
			};
		} catch (error: unknown) {
			const errorMessage = error instanceof Error
				? error.message
				: "Unknown error";
			console.error("Failed to parse response:", errorMessage);
			console.error("Raw response:", result);
			throw new Error(errorMessage);
		}

		console.log("Processed result:", processedResult);

		return new Response(
			JSON.stringify(processedResult),
			{ headers: { "Content-Type": "application/json" } },
		);
	} catch (error) {
		console.error("Error processing image:", error);
		return new Response(
			JSON.stringify({ error: "Failed to process image" }),
			{ status: 500, headers: { "Content-Type": "application/json" } },
		);
	}
}
