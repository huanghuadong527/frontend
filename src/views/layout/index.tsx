import { Container } from '@mui/material';
import { PermisProvider } from '@/authority';

import { Header } from './header';
import { Sider } from './sider';
import { Content } from './content';

export const Index = () => {
	return (
		<PermisProvider>
			<Container
				disableGutters
				className='h-screen min-h-0 flex flex-col'
				maxWidth={false}
				sx={{ backgroundColor: 'background.default' }}
			>
				<Header></Header>
				<Container
					disableGutters
					className='min-h-0 flex flex-1'
					maxWidth={false}
				>
					<Sider></Sider>
					<Content></Content>
				</Container>
			</Container>
		</PermisProvider>
	);
};
