import { useEffect, useState } from 'react';
import { Image, Menu } from 'antd';
import { MenuInfo } from 'rc-menu/lib/interface';
import { findTree } from 'xe-utils';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setSelectable, setTabs, useAppSelector } from '@/store';
import { SY_CONFIG } from '@/core';

import style from './index.module.less';

import logo from '@/assets/image/default_logo.png';
import logoMini from '@/assets/image/default_logo_mini.png';

function Sider(props: AppIndexProps) {
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const { tabs, selectable, menus, config } = useAppSelector((state) => state);

	const [openKeys, setOpenKeys] = useState([selectable ?? '']);

	const onSelectItem = ({ key }: MenuInfo) => {
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

	const initMenuEle = (
		<Menu
			mode='inline'
			openKeys={openKeys}
			selectedKeys={[selectable ?? '']}
			items={menus}
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
		<div className={style.layoutSider}>
			<div className={style.layoutSiderTop}>
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
			</div>
			<div className={style.layoutSiderBody}>{initMenuEle}</div>
		</div>
	);
}

export default Sider;
