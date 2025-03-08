import OpenAI from "jsr:@openai/openai@^4.83.0";

export async function handler(req: Request) {
	if (req.method !== "POST") {
		return new Response("Method not allowed", { status: 405 });
	}

	try {
		const formData = await req.formData();
		const file = formData.get("file") as File;
		const prompt = formData.get("prompt") as string;
		const apiKey = formData.get("apiKey") as string;
		const schemaString = formData.get("schema") as string;

		if (!file || !prompt) {
			return new Response(
				JSON.stringify({ error: "Missing file or prompt" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		if (!apiKey) {
			return new Response(
				JSON.stringify({ error: "Missing API key" }),
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

		const openai = new OpenAI({	apiKey });

		const defaultSchema = {
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
		};

		// Use custom schema if provided, otherwise use default
		let jsonSchema;
		if (schemaString) {
			try {
				jsonSchema = JSON.parse(schemaString);
			} catch (error) {
				console.error("Error parsing custom schema:", error);
				// Fall back to default schema if parsing fails
				jsonSchema = defaultSchema;
			}
		} else {
			// Default schema
			jsonSchema = defaultSchema;
		}

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
					"schema": jsonSchema,
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
			
			// Make a copy of parsed JSON for our result
			processedResult = { ...parsedJson };
			
			// Validate required fields based on schema
			for (const requiredField of jsonSchema.required) {
				if (parsedJson[requiredField] === undefined || parsedJson[requiredField] === null) {
					throw new Error(`Missing required field: ${requiredField}`);
				}
			}
			
			// Validate and convert types for each field according to schema
			for (const [fieldName, fieldValue] of Object.entries(parsedJson)) {
				if (jsonSchema.properties[fieldName]) {
					const expectedType = jsonSchema.properties[fieldName].type;
					
					// Handle type conversion or validation
					try {
						switch (expectedType) {
							case 'number':
								// Convert string numbers to actual numbers
								if (typeof fieldValue === 'string') {
									const cleanValue = fieldValue.replace(/[^0-9.-]/g, "");
									const numericValue = parseFloat(cleanValue);
									if (isNaN(numericValue)) {
										throw new Error(`Invalid number format for field: ${fieldName}`);
									}
									processedResult[fieldName] = numericValue;
								} else if (typeof fieldValue !== 'number') {
									throw new Error(`Field ${fieldName} should be a number`);
								}
								break;
							
							case 'string':
								// Ensure value is a string
								if (typeof fieldValue !== 'string') {
									processedResult[fieldName] = String(fieldValue);
								}
								break;
								
							case 'boolean':
								// Convert string 'true'/'false' to actual booleans
								if (typeof fieldValue === 'string') {
									if (fieldValue.toLowerCase() === 'true') {
										processedResult[fieldName] = true;
									} else if (fieldValue.toLowerCase() === 'false') {
										processedResult[fieldName] = false;
									} else {
										throw new Error(`Invalid boolean value for field: ${fieldName}`);
									}
								} else if (typeof fieldValue !== 'boolean') {
									throw new Error(`Field ${fieldName} should be a boolean`);
								}
								break;
								
							default:
								// For unsupported types, just keep as is
								console.warn(`Unsupported type ${expectedType} for field ${fieldName}`);
								break;
						}
					} catch (error) {
						// If type conversion fails, include the error in the result
						if (error instanceof Error) {
							processedResult[`${fieldName}_error`] = error.message;
						}
					}
				}
			}
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
