import { Signal } from "@preact/signals";
import FileDropZone from "./FileDropZone.tsx";
import Spinner from "../components/spinner.tsx";

export interface FileStatus {
    file: File;
    status: 'ready' | 'processing' | 'done' | 'error';
    result?: { date: string; amount: number };
    error?: string;
}

interface FileTableProps {
    files: FileStatus[];
    onFilesDrop: (files: File[]) => void;
}

function displayStatus(fileStatus: FileStatus) {
	switch (fileStatus.status) {
		case 'ready': return 'Ready';
		case 'processing': return <Spinner/>;
		case 'done': return 'Done';
		case 'error': return <span class="text-red-600">Error</span>
		default: break;
	}
}

export default function FileTable({ files, onFilesDrop }: FileTableProps) {
    return (
        <div class="space-y-4">
            <FileDropZone onFilesDrop={onFilesDrop} />

            <div class="mt-4">
                <table class="w-full border-collapse border">
                    <thead>
                        <tr class="bg-gray-100">
                            <th class="p-2 text-left">File Name</th>
                            <th class="p-2 text-left">Status</th>
                            <th class="p-2 text-left">Date</th>
                            <th class="p-2 text-left">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {files.map((fileStatus, index) => (
                            <tr key={index} class="border-t">
                                <td class="p-2">{fileStatus.file.name}</td>
                                <td class="p-2">{displayStatus(fileStatus)}</td>
                                <td class="p-2">
                                    {fileStatus.result?.date || (
                                        fileStatus.error && <span class="text-red-500">{fileStatus.error}</span>
                                    )}
                                </td>
                                <td class="p-2">
                                    {fileStatus.result && (
                                        <span>${fileStatus.result.amount.toFixed(2)}</span>
                                    )}
                                    {fileStatus.error && (
                                        <span class="text-red-500">{fileStatus.error}</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
} 