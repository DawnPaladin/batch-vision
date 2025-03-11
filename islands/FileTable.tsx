import { Signal } from "@preact/signals";
import FileDropZone from "./FileDropZone.tsx";
import Spinner from "../components/spinner.tsx";
import { JSX } from "preact/jsx-runtime";
import { DynamicResult, JsonSchema } from "../types/schema.ts";

export interface FileStatus {
    file: File;
    status: 'ready' | 'processing' | 'done' | 'error';
    result?: DynamicResult;
    error?: string;
}

interface FileTableProps {
    files: FileStatus[];
    onFilesDrop: (files: File[]) => void;
    schema?: Signal<JsonSchema>;
}

function displayStatus(fileStatus: FileStatus) {
	switch (fileStatus.status) {
		case 'ready': return 'Ready';
		case 'processing': return <Spinner/>;
		case 'done': return 'Done';
		case 'error': return (
			<div class="flex items-center">
				<span class="text-red-600 mr-1">Error</span>
				{fileStatus.error && (
					<span class="text-sm text-red-500" title={fileStatus.error}>
						<img src="alert-triangle.svg" alt="Warning" class="m-3 inline-block" />
					</span>
				)}
			</div>
		);
		default: break;
	}
}

// Format the value based on its type
function formatValue(key: string, value: any, errors?: Record<string, string>): JSX.Element {
    // Check if there's an error for this field
    const errorKey = `${key}_error`;
    if (errors && errors[errorKey]) {
        return (
            <div class="text-red-500">
                <img src="alert-triangle.svg" alt="Warning" class="m-3 inline-block" />
                <span title={errors[errorKey]}>Failed to extract</span>
            </div>
        );
    }
    
    if (value === undefined || value === null) {
        return <span class="text-gray-400">--</span>;
    }
    
    if (typeof value === 'number') {
        // Format numbers with up to 2 decimal places
        return <span>{key === 'amount' ? '$' : ''}{value.toFixed(value % 1 === 0 ? 0 : 2)}</span>;
    }
    
    if (typeof value === 'boolean') {
        return <span class={value ? "text-green-600" : "text-red-600"}>{value ? "Yes" : "No"}</span>;
    }
    
    // Default - treat as string
    return <span>{String(value)}</span>;
}

export default function FileTable({ files, onFilesDrop, schema }: FileTableProps) {
    // Get property names from schema or use defaults
    const propertyNames = schema 
        ? Object.keys(schema.value.properties) 
        : ['date', 'amount'];
    
    // Find potential error fields in the results
    const getErrors = (result: DynamicResult) => {
        const errors: Record<string, string> = {};
        for (const key in result) {
            if (key.endsWith('_error')) {
                errors[key] = result[key];
            }
        }
        return errors;
    };
    
    return (
        <div class="space-y-4">
            <FileDropZone onFilesDrop={onFilesDrop} />

            <div class="mt-4">
                <table class="w-full border-collapse border">
                    <thead>
                        <tr class="bg-gray-100">
                            <th class="p-2 text-left">File Name</th>
                            <th class="p-2 text-left">Status</th>
                            {propertyNames.map(prop => (
                                <th key={prop} class="p-2 text-left capitalize">{prop}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {files.map((fileStatus, index) => {
                            // Extract any field errors
                            const errors = fileStatus.result ? getErrors(fileStatus.result) : {};
                            
                            return (
                                <tr key={index} class="border-t">
                                    <td class="p-2">{fileStatus.file.name}</td>
                                    <td class="p-2">
                                        {displayStatus(fileStatus)}
                                        {fileStatus.error && (
                                            <div class="text-xs text-red-500 mt-1">
                                                {fileStatus.error}
                                            </div>
                                        )}
                                    </td>
                                    {propertyNames.map(prop => (
                                        <td key={prop} class="p-2">
                                            {fileStatus.result 
                                                ? formatValue(prop, fileStatus.result[prop], errors)
                                                : fileStatus.status === 'error' && (
                                                    <div class="text-red-500">
                                                        <img src="alert-triangle.svg" alt="Warning" class="m-3 inline-block" />
                                                        <span>Failed to process</span>
                                                    </div>
                                                )
                                            }
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
} 