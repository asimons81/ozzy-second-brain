import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { Background } from './components/Background';
import { HUDGrid } from './components/HUDGrid';
import { InterfaceHUD } from './components/InterfaceHUD';
import { CodeDisplay } from './components/CodeDisplay';
import { Glitch } from './components/Glitch';
import { Logo } from './components/Logo';

export const Main: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps, width, height } = useVideoConfig();

	return (
		<AbsoluteFill style={{ backgroundColor: 'black' }}>
			<Background />
			<HUDGrid />
			
			{/* [00:00 - 00:03] SCROLL STOPPER */}
			<Sequence from={0} durationInFrames={90}>
				<Glitch>
					<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
						{frame < 15 ? (
							<div style={{ color: '#00F2FF', fontSize: 100, fontFamily: 'monospace' }}>_</div>
						) : (
							<>
								<Logo />
								<div
									style={{
										position: 'absolute',
										bottom: 400,
										color: '#00F2FF',
										fontSize: 80,
										fontWeight: 'bold',
										textAlign: 'center',
										fontFamily: 'sans-serif',
										textShadow: '0 0 10px #00F2FF',
									}}
								>
									LOCAL-FIRST RUST
								</div>
							</>
						)}
					</AbsoluteFill>
				</Glitch>
			</Sequence>

			{/* [00:03 - 00:08] THE HOOK */}
			<Sequence from={90} durationInFrames={150}>
				<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
					<div style={{ color: 'white', fontSize: 40, fontFamily: 'monospace', opacity: 0.5 }}>
						{Array.from({ length: 20 }).map((_, i) => (
							<div key={i}>0x{Math.random().toString(16).slice(2, 10)}...OK</div>
						))}
					</div>
					<div
						style={{
							position: 'absolute',
							backgroundColor: '#00F2FF',
							color: 'black',
							padding: '20px 40px',
							fontSize: 120,
							fontWeight: 'black',
							transform: `scale(${spring({ frame: frame - 90, fps, config: { damping: 10 } })})`,
						}}
					>
						27MB
					</div>
				</AbsoluteFill>
			</Sequence>

			{/* [00:08 - 00:15] CORE VALUE */}
			<Sequence from={240} durationInFrames={210}>
				<AbsoluteFill>
					<CodeDisplay />
					<div
						style={{
							position: 'absolute',
							top: 200,
							left: 100,
							padding: '10px 20px',
							border: '2px solid #00F2FF',
							color: '#00F2FF',
							fontSize: 40,
							fontWeight: 'bold',
							transform: `rotate(-10deg) translateY(${Math.sin(frame / 10) * 20}px)`,
						}}
					>
						MEMORY.md
					</div>
				</AbsoluteFill>
			</Sequence>

			{/* [00:15 - 00:22] DIFFERENTIATOR */}
			<Sequence from={450} durationInFrames={210}>
				<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
					<div style={{ color: '#00F2FF', fontSize: 60, fontWeight: 'bold' }}>HEARTBEAT ACTIVE</div>
					<svg width="600" height="200" viewBox="0 0 600 200">
						<path
							d={`M 0 100 L 100 100 L 120 40 L 140 160 L 160 100 L 600 100`}
							stroke="#00F2FF"
							strokeWidth="4"
							fill="none"
							strokeDasharray="600"
							strokeDashoffset={interpolate(frame % 30, [0, 30], [600, 0])}
						/>
					</svg>
				</AbsoluteFill>
			</Sequence>

			{/* [00:22 - 00:25] CALL TO ACTION */}
			<Sequence from={660} durationInFrames={90}>
				<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
					<div
						style={{
							color: '#00F2FF',
							fontSize: 50,
							fontFamily: 'monospace',
							borderRight: '4px solid #00F2FF',
							paddingRight: 10,
							opacity: interpolate(frame - 660, [0, 15], [0, 1]),
						}}
					>
						cargo install localgpt
					</div>
					<div
						style={{
							marginTop: 40,
							opacity: interpolate(frame - 660, [30, 45], [0, 1]),
						}}
					>
						<Logo />
					</div>
				</AbsoluteFill>
			</Sequence>

			<InterfaceHUD />
		</AbsoluteFill>
	);
};
