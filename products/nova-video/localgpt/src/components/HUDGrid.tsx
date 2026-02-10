import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

export const HUDGrid: React.FC = () => {
	const frame = useCurrentFrame();
	const move = interpolate(frame % 30, [0, 30], [0, 40]);

	return (
		<AbsoluteFill
			style={{
				perspective: '1000px',
				overflow: 'hidden',
			}}
		>
			<div
				style={{
					position: 'absolute',
					width: '200%',
					height: '200%',
					left: '-50%',
					top: '0%',
					transform: 'rotateX(60deg)',
					backgroundImage: `
            linear-gradient(to right, rgba(0, 242, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 242, 255, 0.1) 1px, transparent 1px)
          `,
					backgroundSize: '40px 40px',
					backgroundPosition: `0px ${move}px`,
				}}
			/>
		</AbsoluteFill>
	);
};
