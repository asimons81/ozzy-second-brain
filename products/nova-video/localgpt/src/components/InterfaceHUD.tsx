import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const InterfaceHUD: React.FC = () => {
	const frame = useCurrentFrame();
	const opacity = interpolate(Math.sin(frame / 10), [-1, 1], [0.3, 0.7]);

	return (
		<AbsoluteFill style={{ pointerEvents: 'none' }}>
			{/* Scanlines */}
			<div
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
					backgroundSize: '100% 4px, 3px 100%',
					zIndex: 10,
					opacity: 0.1,
				}}
			/>

			{/* Corner Brackets */}
			<div style={{ position: 'absolute', top: 40, left: 40, width: 40, height: 40, borderTop: '2px solid #00F2FF', borderLeft: '2px solid #00F2FF', opacity }} />
			<div style={{ position: 'absolute', top: 40, right: 40, width: 40, height: 40, borderTop: '2px solid #00F2FF', borderRight: '2px solid #00F2FF', opacity }} />
			<div style={{ position: 'absolute', bottom: 40, left: 40, width: 40, height: 40, borderBottom: '2px solid #00F2FF', borderLeft: '2px solid #00F2FF', opacity }} />
			<div style={{ position: 'absolute', bottom: 40, right: 40, width: 40, height: 40, borderBottom: '2px solid #00F2FF', borderRight: '2px solid #00F2FF', opacity }} />

			{/* Center Crosshair (Subtle) */}
			<div
				style={{
					position: 'absolute',
					top: '50%',
					left: '50%',
					transform: 'translate(-50%, -50%)',
					width: 20,
					height: 20,
					border: '1px solid rgba(0, 242, 255, 0.2)',
					borderRadius: '50%',
				}}
			/>
		</AbsoluteFill>
	);
};
