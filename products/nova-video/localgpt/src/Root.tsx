import { Composition } from 'remotion';
import { Main } from './Composition';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="LocalGPT"
				component={Main}
				durationInFrames={750}
				fps={30}
				width={1080}
				height={1920}
			/>
		</>
	);
};
