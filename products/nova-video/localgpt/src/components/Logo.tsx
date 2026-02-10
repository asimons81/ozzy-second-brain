import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

export const Logo: React.FC = () => {
	const frame = useCurrentFrame();
	const rotate = interpolate(frame, [0, 90], [0, 360]);
	const pulse = interpolate(Math.sin(frame / 10), [-1, 1], [0.2, 1]);

	return (
		<svg
			width="400"
			height="400"
			viewBox="0 0 200 200"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			style={{ transform: `rotate(${rotate}deg)` }}
		>
			<path
				d="M100 20L130 50H170L180 90L160 130L100 180L40 130L20 90L30 50H70L100 20Z"
				stroke="#00F2FF"
				strokeWidth="2"
				strokeDasharray="4 4"
			/>
			<circle cx="100" cy="100" r="40" stroke="#00F2FF" strokeWidth="1" />
			<path d="M100 60V140M60 100H140" stroke="#00F2FF" strokeWidth="1" opacity="0.5" />
			<circle cx="100" cy="100" r="10" fill="#00F2FF" opacity={pulse} />
		</svg>
	);
};
};
