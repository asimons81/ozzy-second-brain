import React, { useEffect, useState } from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, delayRender, continueRender } from 'remotion';
import { codeToHtml } from 'shiki';

const rustCode = `pub fn main() {
    let memory = LocalGPT::new();
    match memory.ask("Who am I?") {
        Ok(ans) => println!("Self: {}", ans),
        Err(_) => panic!("Identity loss!"),
    }
}`;

export const CodeDisplay: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const [html, setHtml] = useState('');
	const [handle] = useState(() => delayRender('Shiki loading'));

	useEffect(() => {
		codeToHtml(rustCode, {
			lang: 'rust',
			theme: 'vitesse-dark',
		}).then((h) => {
			setHtml(h);
			continueRender(handle);
		});
	}, [handle]);

	const opacity = interpolate(frame, [0, 20], [0, 1]);
	const pulse = interpolate(Math.sin(frame / 5), [-1, 1], [0.8, 1.2]);

	if (!html) return null;

	return (
		<AbsoluteFill
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				opacity,
			}}
		>
			<div
				style={{
					fontSize: 40,
					fontFamily: 'monospace',
					padding: 40,
					borderRadius: 20,
					backgroundColor: 'rgba(0,0,0,0.8)',
					border: '1px solid #00F2FF',
					transform: `scale(${pulse})`,
					boxShadow: '0 0 20px rgba(0, 242, 255, 0.2)',
				}}
				dangerouslySetInnerHTML={{ __html: html }}
			/>
		</AbsoluteFill>
	);
};
