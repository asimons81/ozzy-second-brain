import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, random } from 'remotion';

export const Glitch: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const frame = useCurrentFrame();

	const glitchChance = random(frame) > 0.8;
	const offsetX = glitchChance ? (random(frame + 1) - 0.5) * 40 : 0;
	const offsetY = glitchChance ? (random(frame + 2) - 0.5) * 10 : 0;

	const redOffset = glitchChance ? (random(frame + 3) - 0.5) * 20 : 0;
	const blueOffset = glitchChance ? (random(frame + 4) - 0.5) * 20 : 0;

	return (
		<AbsoluteFill style={{ transform: `translate(${offsetX}px, ${offsetY}px)` }}>
			{/* Red Channel */}
			<AbsoluteFill
				style={{
					left: redOffset,
					filter: 'drop-shadow(0 0 0 red)',
					opacity: glitchChance ? 0.7 : 1,
				}}
			>
				{children}
			</AbsoluteFill>
			{/* Blue Channel */}
			<AbsoluteFill
				style={{
					left: blueOffset,
					filter: 'drop-shadow(0 0 0 blue)',
					opacity: glitchChance ? 0.7 : 0,
					mixMode: 'screen',
				}}
			>
				{children}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
