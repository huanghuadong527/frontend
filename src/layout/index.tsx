import { useCallback, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import { useDispatch } from 'react-redux';
import { FETCH_RESOURCE } from '@/store';

import style from './index.module.less';
import Header from './header';
import Sider from './sider';
import Tabs from './tabs';

function home() {
	const [collapsed, setCollapsed] = useState(false);
	const dispatch = useDispatch();

	const onCollapse = (collapse: boolean) => {
		setCollapsed(collapse);
	}

	const getUserInfo = useCallback(() => {
		// getInfo().then(result => {
		// 	dispatch(setSysConfig(result));
		// });
	}, []);

	useEffect(() => {
		getUserInfo();
		dispatch({ type: FETCH_RESOURCE });
	}, []);

	return (
		<Layout className='container'>
			<Layout.Sider
				className={style.layoutSider}
				collapsible
				trigger={null}
				collapsed={collapsed}>
				<Sider collapsed={collapsed} />
			</Layout.Sider>
			<Layout className={style.layoutBody}>
				<Layout.Header>
					<Header
						collapsed={collapsed}
						onCollapse={onCollapse} />
				</Layout.Header>
				<Tabs />
				<Layout.Content>
					<div className={style.layoutContent}>
						<Outlet />
					</div>
				</Layout.Content>
			</Layout>
		</Layout>
	);
}

export default home;
