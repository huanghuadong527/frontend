import { useCallback, useEffect, useState } from 'react';
import { Outlet } from 'react-router';
import { Layout } from 'antd';
import { getUserData, getMenusData, setConfig, useAppDispatch } from '@/store';
import { getSystemConfig } from '@/service';
import { useCommon } from '@/core';

import Header from './header';
import Sider from './sider';
import Tabs from './tabs';

function home() {
	const dispatch = useAppDispatch();
	const [collapsed, setCollapsed] = useState(false);
	const { updateSysConfig } = useCommon();

	const onCollapse = (collapse: boolean) => {
		setCollapsed(collapse);
	};

	const getConfigInfo = useCallback(() => {
		getSystemConfig().then((result) => {
			if (result.code == 200) {
				if (result.data && Array.isArray(result.data)) {
					result.data.forEach((item) => {
						updateSysConfig(item);
					});
				}
				dispatch(setConfig(result.data));
			}
		});
	}, []);

	useEffect(() => {
		dispatch(getUserData());
		getConfigInfo();
		dispatch(getMenusData());
	}, []);

	return (
		<Layout className='relative h-screen overflow-hidden'>
			<Layout.Header
				style={{ height: '50px', lineHeight: '50px', paddingInline: '20px' }}
			>
				<Header collapsed={collapsed} onCollapse={onCollapse} />
			</Layout.Header>
			<Layout>
				<Layout.Sider
					collapsible
					className='relative z-10 shadow-[2px_0_8px_0_rgba(29,35,41,0.05)]'
					trigger={null}
					style={{ backgroundColor: '#FFFFFF' }}
					collapsed={collapsed}
				>
					<Sider collapsed={collapsed} />
				</Layout.Sider>
				<Layout.Content className='flex flex-col'>
					<Tabs />
					<div className='flex-1 h-0 p-[15px] bg-[#F0F2F5]'>
						<Outlet />
					</div>
				</Layout.Content>
			</Layout>
		</Layout>
	);
}

export const Component = home;
