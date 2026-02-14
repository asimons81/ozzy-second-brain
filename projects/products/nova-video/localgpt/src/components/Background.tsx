import React from 'react';
import { AbsoluteFill } from 'remotion';

export const Background: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#000000',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				overflow: 'hidden',
			}}
		>
			{/* Noise Overlay */}
			<div
				style={{
					position: 'absolute',
					top: -100,
					left: -100,
					right: -100,
					bottom: -100,
					opacity: 0.05,
					pointerEvents: 'none',
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
				}}
			/>
		</AbsoluteFill>
	);
};
