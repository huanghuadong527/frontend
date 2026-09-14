import { createElement, useEffect, useMemo, useState } from 'react';
import { Flex, Image, Menu, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { findTree } from 'xe-utils';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { MenuProp, setSelectable, setTabs, useAppSelector } from '@/store';
import { SY_CONFIG } from '@/core';
import * as Icon from '@ant-design/icons';

import logo from '@/assets/image/default_logo.png';
import logoMini from '@/assets/image/logo.png';

const getIconNode = (name?: string) => {
	const Cmp = name ? (Icon as any)[name] : undefined;
	return typeof Cmp === 'function' ||
		(Cmp && typeof Cmp.render === 'function')
		? createElement(Cmp)
		: undefined;
};

function Sider(props: AppIndexProps) {
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const tabs = useAppSelector((state) => state.system.tabs);
	const selectable = useAppSelector((state) => state.system.selectable);
	const menus = useAppSelector((state) => state.core.menus);
	const config = useAppSelector((state) => state.system.config);

	const [openKeys, setOpenKeys] = useState([selectable ?? '']);

	const onSelectItem: MenuProps['onClick'] = ({ key }) => {
		const mi = findTree(menus, (item) => item.key == key);
		if (mi && mi.item && mi.item.path) {
			navigate(mi.item.path, { replace: true });
			const index = tabs.findIndex((v) => v.key == mi.item.key);
			if (index == -1) {
				dispatch(setTabs([...tabs, { key: mi.item.key }]));
			}
			dispatch(setSelectable(mi.item.key));
		}
	};

	const onOpenChange = (keys: string[]) => {
		const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
		const index = menus.findIndex((item) => item.key == latestOpenKey);
		if (index === -1) {
			setOpenKeys(keys);
		} else {
			setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
		}
	};

	const menuItems = useMemo(() => {
		const format = (item: MenuProp): any => ({
			key: item.key,
			label: item.label,
			icon: getIconNode(item.icon),
			children: item.children ? item.children.map(format) : undefined,
		});
		return menus.map(format);
	}, [menus]);

	const initMenuEle = (
		<Menu
			mode='inline'
			openKeys={openKeys}
			selectedKeys={[selectable ?? '']}
			items={menuItems}
			onClick={onSelectItem}
			onOpenChange={onOpenChange}
		/>
	);

	useEffect(() => {
		if (menus) {
			for (let i = 0; i < menus.length; i++) {
				const sub = menus[i];
				if (sub.children && sub.children.length > 0) {
					const item = sub.children.find((v) => v.key == selectable);
					if (item && sub.key) {
						setOpenKeys([sub.key]);
					}

					for (let j = 0; j < sub.children.length; j++) {
						const child = sub.children[j];
						if (child.children && child.children.length > 0) {
							const v = child.children.find((v) => v.key == selectable);
							if (v && v.key) {
								setOpenKeys([sub.key, child.key]);
							}
						}
					}
				}
			}
		}
	}, [selectable, menus]);

	return (
		<div className='w-full h-full flex flex-col'>
			{/* <Flex align='center' gap={8} className={style.layoutSiderTop}>
				<Image
					src={
						props.collapsed
							? config
								? `${SY_CONFIG.upload}${config.logo}`
								: logo
							: config
							? `${SY_CONFIG.upload}${config.miniLogo}`
							: logoMini
					}
					height={50}
					preview={false}
				/>
				{!props.collapsed ? (
					<Typography.Title level={4} style={{ margin: 0 }}>
						管理系统
					</Typography.Title>
				) : null}
			</Flex> */}
			<div className='layoutSiderBody flex-1 h-0 overflow-x-hidden overflow-y-auto'>{initMenuEle}</div>
		</div>
	);
}

export default Sider;
