import { ProcessedResult, JsonSchema } from "../types/schema.ts";

/**
 * Formats a value for CSV output based on its type
 */
function formatCsvValue(value: unknown): string {
	if (value === null || value === undefined) {
		return '';
	}
	if (typeof value === 'number') {
		return value.toString();
	}
	if (typeof value === 'boolean') {
		return value ? 'Yes' : 'No';
	}
	// Escape quotes and handle commas for string values
	const stringValue = String(value).replace(/"/g, '""');
	return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
}

/**
 * Generates a CSV string from the results and schema
 */
export function generateCsv(results: ProcessedResult[], schema: JsonSchema): string {
	// Get the property names from the schema
	const propertyNames = Object.keys(schema.properties);
	
	// Create the CSV header with filename and all schema properties
	const header = ['Filename', ...propertyNames.map(name => name.charAt(0).toUpperCase() + name.slice(1))];
	
	// Create the CSV rows
	const rows = results.map(result => {
		// Start with the filename
		const values = [result.filename];
		
		// Add each property value
		propertyNames.forEach(prop => {
			values.push(formatCsvValue(result[prop]));
		});
		
		return values.join(',');
	});
	
	// Combine header and rows
	return [header.join(','), ...rows].join('\n');
}

/**
 * Downloads data as a CSV file
 */
export function downloadCsv(csvContent: string, filename = 'extracted-data.csv'): void {
	const blob = new Blob([csvContent], { type: 'text/csv' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
} 