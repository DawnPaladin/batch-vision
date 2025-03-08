import { Signal } from "@preact/signals";
import { useState } from "preact/hooks";
import { SchemaProperty, JsonSchema } from "../types/schema.ts";

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

	// Convert schema to array of properties for editing
	const [properties, setProperties] = useState<SchemaProperty[]>(() => {
		const currentSchema = schema.value;
		return Object.entries(currentSchema.properties).map(([name, prop]) => ({
			name,
			type: prop.type,
			description: prop.description,
			required: currentSchema.required.includes(name),
		}));
	});

	// Types available for properties
	const availableTypes = ["string", "number", "boolean"];

	// Add a new property
	const addProperty = () => {
		setProperties([
			...properties,
			{ name: "", type: "string", description: "", required: false },
		]);
	};

	// Remove a property
	const removeProperty = (index: number) => {
		const newProperties = [...properties];
		newProperties.splice(index, 1);
		setProperties(newProperties);
	};

	// Update a property
	const updateProperty = (index: number, field: keyof SchemaProperty, value: string | boolean) => {
		const newProperties = [...properties];
		newProperties[index] = { ...newProperties[index], [field]: value };
		setProperties(newProperties);
	};

	// Save changes to the schema
	const saveSchema = () => {
		const newSchema: JsonSchema = {
			type: "object",
			properties: {},
			required: [],
			additionalProperties: false,
		};

		properties.forEach((prop) => {
			if (prop.name) {
				newSchema.properties[prop.name] = {
					type: prop.type,
					description: prop.description,
				};
				
				if (prop.required) {
					newSchema.required.push(prop.name);
				}
			}
		});

		schema.value = newSchema;
	};

	return (
		<div class="space-y-6">
			<div>
				<div class="mb-2">Prompt:</div>
				<textarea
					class="w-full p-2 border rounded-lg mb-4 min-h-[100px]"
					value={prompt.value}
					onChange={(e) => prompt.value = e.currentTarget.value}
				/>
			</div>

			<div>
				<div class="flex justify-between items-center mb-2">
					<h2 class="text-lg font-semibold">JSON Schema Properties</h2>
					<button 
						onClick={saveSchema}
						class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
					>
						Save Schema
					</button>
				</div>

				<div class="overflow-x-auto">
					<table class="min-w-full bg-white border rounded-lg">
						<thead>
							<tr class="bg-gray-100">
								<th class="py-2 px-4 border-b text-left">Property Name</th>
								<th class="py-2 px-4 border-b text-left">Type</th>
								<th class="py-2 px-4 border-b text-left">Description</th>
								<th class="py-2 px-4 border-b text-center">Required</th>
								<th class="py-2 px-4 border-b text-center">Actions</th>
							</tr>
						</thead>
						<tbody>
							{properties.map((property, index) => (
								<tr key={index} class="border-b hover:bg-gray-50">
									<td class="py-2 px-4">
										<input
											type="text"
											class="w-full p-1 border rounded"
											value={property.name}
											onChange={(e) => updateProperty(index, "name", e.currentTarget.value)}
										/>
									</td>
									<td class="py-2 px-4">
										<select
											class="w-full p-1 border rounded"
											value={property.type}
											onChange={(e) => updateProperty(index, "type", e.currentTarget.value)}
										>
											{availableTypes.map(type => (
												<option key={type} value={type}>{type}</option>
											))}
										</select>
									</td>
									<td class="py-2 px-4">
										<input
											type="text"
											class="w-full p-1 border rounded"
											value={property.description}
											onChange={(e) => updateProperty(index, "description", e.currentTarget.value)}
										/>
									</td>
									<td class="py-2 px-4 text-center">
										<input
											type="checkbox"
											checked={property.required}
											onChange={(e) => updateProperty(index, "required", e.currentTarget.checked)}
										/>
									</td>
									<td class="py-2 px-4 text-center">
										<button
											onClick={() => removeProperty(index)}
											class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
										>
											Remove
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				<button
					onClick={addProperty}
					class="mt-4 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
				>
					Add Property
				</button>
			</div>
		</div>
	);
} 