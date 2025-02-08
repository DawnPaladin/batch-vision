export default function Spinner() {
	const ldsGridStyle = {
		display: 'inline-block',
		position: 'relative',
		width: '80px',
		height: '80px',
		boxSizing: 'border-box',
	  };
	  
	  const ldsGridDivStyle = {
		position: 'absolute',
		width: '16px',
		height: '16px',
		borderRadius: '50%',
		background: 'currentColor',
		animation: 'ldsGrid 1.2s linear infinite',
		boxSizing: 'border-box',
	  };
	  
	  const childStyles = [
		{ top: '8px', left: '8px', animationDelay: '0s' },
		{ top: '8px', left: '32px', animationDelay: '-0.4s' },
		{ top: '8px', left: '56px', animationDelay: '-0.8s' },
		{ top: '32px', left: '8px', animationDelay: '-0.4s' },
		{ top: '32px', left: '32px', animationDelay: '-0.8s' },
		{ top: '32px', left: '56px', animationDelay: '-1.2s' },
		{ top: '56px', left: '8px', animationDelay: '-0.8s' },
		{ top: '56px', left: '32px', animationDelay: '-1.2s' },
		{ top: '56px', left: '56px', animationDelay: '-1.6s' },
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
          <div key={index} style={{ ...ldsGridDivStyle, ...style }}></div>
        ))}
      a</div>
    </>
	  );
}