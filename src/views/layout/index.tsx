import { useState } from 'react';
import { Drawer, Grid, Layout } from 'antd';
import { PermisProvider } from '@/authority';

import { Header } from './header';
import { Sider } from './sider';
import { Content } from './content';

export const Index = () => {
	const screens = Grid.useBreakpoint();
	const isMobile = screens.lg === false;
	const [drawerOpen, setDrawerOpen] = useState(false);

	return (
		<PermisProvider>
			<Layout className='h-screen min-h-0 flex flex-col'>
				<Header isMobile={isMobile} onOpenMenu={() => setDrawerOpen(true)} />
				<div className='min-h-0 flex flex-1'>
					{isMobile ? null : <Sider />}
					<Content />
				</div>
			</Layout>
			{isMobile ? (
				<Drawer
					placement='left'
					size={220}
					open={drawerOpen}
					onClose={() => setDrawerOpen(false)}
					styles={{ body: { padding: 0 } }}
				>
					<Sider onNavigate={() => setDrawerOpen(false)} />
				</Drawer>
			) : null}
		</PermisProvider>
	);
};
