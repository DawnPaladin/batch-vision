export default function Spinner() {
	const ldsGridStyle = {
		display: "inline-block",
		position: "relative",
		width: "20px",
		height: "20px",
		boxSizing: "border-box",
		color: "royalblue"
	};

	const ldsGridDivStyle = {
		position: "absolute",
		width: "4px",
		height: "4px",
		borderRadius: "50%",
		background: "currentColor",
		animation: "ldsGrid 1.2s linear infinite",
		boxSizing: "border-box",
	};

	const childStyles = [
		{ top: "2px", left: "2px", animationDelay: "0s" },
		{ top: "2px", left: "8px", animationDelay: "-0.4s" },
		{ top: "2px", left: "14px", animationDelay: "-0.8s" },
		{ top: "8px", left: "2px", animationDelay: "-0.4s" },
		{ top: "8px", left: "8px", animationDelay: "-0.8s" },
		{ top: "8px", left: "14px", animationDelay: "-1.2s" },
		{ top: "14px", left: "2px", animationDelay: "-0.8s" },
		{ top: "14px", left: "8px", animationDelay: "-1.2s" },
		{ top: "14px", left: "14px", animationDelay: "-1.6s" },
	];

	return (
		<>
			<style>
				{`
					@keyframes ldsGrid {
						0%, 100% {
							opacity: 1;
						}
						50% {
							opacity: 0.5;
						}
					}
				`}
			</style>
			<div style={ldsGridStyle}>
				{childStyles.map((style, index) => (
					<div key={index} style={{ ...ldsGridDivStyle, ...style }}>
					</div>
				))}
			</div>
		</>
	);
}
