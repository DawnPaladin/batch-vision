import { Signal } from "@preact/signals";

interface ControlsProps {
	isProcessing: Signal<boolean>;
	hasResults: Signal<boolean>;
	onProcess: (files: File[]) => void;
	onClear: () => void;
	onDownload: () => void;
}

export default function Controls({ isProcessing, hasResults, onProcess, onClear, onDownload }: ControlsProps) {
	return (
		<div class="flex justify-center mb-4 gap-2">
			<button
				class="flex-grow px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:bg-gray-400"
				onClick={() => onProcess([])}
				disabled={isProcessing.value}
			>
				{isProcessing.value ? 'Processing...' : 'Process files'}
			</button>
			<button
				class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
				onClick={onClear}
			>
				Clear
			</button>
			<button
				class="w-1/4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
				onClick={onDownload}
				disabled={!hasResults.value}
			>
				Download results
			</button>
		</div>
	);
} 