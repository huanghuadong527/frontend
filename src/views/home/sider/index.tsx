import { useEffect, useState } from 'react';
import { Image, Menu } from 'antd';
import { MenuInfo } from 'rc-menu/lib/interface';
import { findTree } from 'xe-utils';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectable, setTabs, UseStore } from '@/store';

import logo from '@/assets/image/default_logo.png';
import logoMini from '@/assets/image/default_logo_mini.png';

function Sider(props: AppIndexProps) {
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const { tabs, selectable, menus } = useSelector(
		(state: UseStore) => state.common
	);

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
		<div className='mes-sider'>
			<div className='mes-sider--top'>
				<Image
					src={props.collapsed ? logoMini : logo}
					height={50}
					preview={false}
				/>
			</div>
			<div className='mes-sider--body'>{initMenuEle}</div>
		</div>
	);
}

export default Sider;
