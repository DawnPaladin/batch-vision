import { ComponentChildren } from "preact";
import { useState } from "preact/hooks";

interface AccordionSectionProps {
	title: string;
	children: ComponentChildren;
	isOpen: boolean;
	onToggle: () => void;
}

function AccordionSection({ title, children, isOpen, onToggle }: AccordionSectionProps) {
	return (
		<div class="border rounded-lg mb-2 overflow-hidden">
			<button
				class={`w-full px-4 py-2 text-left transition-colors duration-200 flex justify-between items-center ${isOpen ? 'bg-gray-200' : 'bg-gray-100 hover:bg-gray-200'}`}
				onClick={onToggle}
			>
				<span>{title}</span>
			</button>
			<div
				class="transition-all duration-200 overflow-hidden"
				style={{ maxHeight: isOpen ? '1000px' : '0', opacity: isOpen ? 1 : 0 }}
			>
				<div class="p-4">
					{children}
				</div>
			</div>
		</div>
	);
}

interface AccordionProps {
	sections: {
		title: string;
		content: ComponentChildren;
	}[];
	defaultOpenIndex?: number;
}

export default function Accordion({ sections, defaultOpenIndex = 0 }: AccordionProps) {
	const [openSectionIndex, setOpenSectionIndex] = useState(defaultOpenIndex);

	return (
		<div>
			{sections.map((section, index) => (
				<AccordionSection
					key={index}
					title={section.title}
					isOpen={index === openSectionIndex}
					onToggle={() => setOpenSectionIndex(index)}
				>
					{section.content}
				</AccordionSection>
			))}
		</div>
	);
} 