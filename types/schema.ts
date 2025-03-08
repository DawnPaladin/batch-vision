// Shared type definitions for JSON Schema

// Property in the schema editor
export interface SchemaProperty {
	name: string;
	type: string;
	description: string;
	required: boolean;
}

// Schema of the data we will require from the LLM
export interface JsonSchema {
	type: string;
	properties: Record<string, {
		type: string;
		description: string;
	}>;
	required: string[]; // List of required properties
	additionalProperties: false;
}

// Dynamic result from processing
export interface DynamicResult {
    [key: string]: any;
}

// Processed result with filename
export interface ProcessedResult {
	filename: string;
	[key: string]: any;
} 