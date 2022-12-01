import { useCallback, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import { useDispatch } from 'react-redux';
import { FETCH_RESOURCE, setConfigInfo, setConfig } from '@/store';
import { getSystemConfig, getSystemUserInfo } from '@/service';
import { useCommon } from '@/core';

import style from './index.module.less';
import Header from './header';
import Sider from './sider';
import Tabs from './tabs';

function home() {
	const dispatch = useDispatch();
	const [collapsed, setCollapsed] = useState(false);
	const { updateSysConfig } = useCommon();

	const onCollapse = (collapse: boolean) => {
		setCollapsed(collapse);
	};

	const getUserInfo = useCallback(() => {
		getSystemUserInfo().then((payload) => {
			if (payload.code == 200) {
				dispatch(setConfigInfo(payload));
			}
		});
	}, []);

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
		getUserInfo();
		getConfigInfo();
		dispatch({ type: FETCH_RESOURCE });
	}, []);

	return (
		<Layout className='container'>
			<Layout.Sider
				collapsible
				className={style.layoutSider}
				trigger={null}
				style={{ backgroundColor: '#FFFFFF' }}
				collapsed={collapsed}
			>
				<Sider collapsed={collapsed} />
			</Layout.Sider>
			<Layout className={style.layoutBody}>
				<Layout.Header
					style={{ height: '50px', lineHeight: '50px', paddingInline: '20px' }}
				>
					<Header collapsed={collapsed} onCollapse={onCollapse} />
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
