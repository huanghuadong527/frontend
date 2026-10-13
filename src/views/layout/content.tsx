import { Outlet } from 'react-router';

import { Tabs } from './tabs';

export const Content = () => {
	return (
		<div className='min-w-0 flex flex-col flex-1'>
			<Tabs />
			<div className='min-h-0 flex-1 p-2 md:p-4'>
				<div className='page-card h-full bg-white rounded-sm overflow-auto'>
					<Outlet />
				</div>
			</div>
		</div>
	);
};
