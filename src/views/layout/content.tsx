import { Outlet } from 'react-router';

import { Tabs } from './tabs';

export const Content = () => {
	return (
		<div className='min-w-0 flex flex-col flex-1'>
			<Tabs />
			<div className='min-h-0 flex-1 px-4 py-4'>
				<Outlet />
			</div>
		</div>
	);
};
