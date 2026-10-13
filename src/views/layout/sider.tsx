import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { Menu } from 'antd';
import type { MenuProps as AntdMenuProps } from 'antd';
import * as AntdIcons from '@ant-design/icons';
import { usePermis } from '@/authority';
import { setTabs, useStore } from '@/store';

type AntdMenuItem = Required<AntdMenuProps>['items'][number];

const renderIcon = (name?: string) => {
	if (!name) return undefined;
	const Icon = (AntdIcons as CObject)[name];
	return Icon ? <Icon /> : undefined;
};

export const Sider = ({ onNavigate }: { onNavigate?: () => void }) => {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useDispatch();
	const state = useStore((state) => state.root);
	const { menus, menuTree } = usePermis();
	const [selectKey, setSelectKey] = useState<string[]>([]);
	const [expandKey, setExpandKey] = useState<string[]>([]);

	const getItem = (key: string, value: any) => {
		return menus.find((item: CObject) => item[key] == value);
	};

	const getExpendKey = (id: string, ids: string[] = []) => {
		ids.unshift(id);
		const menu = getItem('id', id);
		if (menu && menu.parentId) {
			return getExpendKey(menu.parentId, ids);
		}
		return ids;
	};

	const toMenuItems = (tree: MenuProps[]): AntdMenuItem[] => {
		return tree
			.filter((item) => item.menuType !== 'F')
			.map((item) => ({
				key: item.id,
				icon: renderIcon(item.icon),
				label: item.menuName,
				children: item.children?.length ? toMenuItems(item.children) : undefined
			}));
	};

	useEffect(() => {
		if (location.pathname == '/index') {
			setSelectKey([]);
			setExpandKey([]);
		} else {
			const menu = getItem('path', location.pathname);
			if (menu && menu.id) {
				setSelectKey([menu.id]);
				if (menu.parentId) {
					setExpandKey(getExpendKey(menu.parentId));
				}
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.pathname]);

	const onClick: AntdMenuProps['onClick'] = ({ key }) => {
		const menu = getItem('id', key);
		if (menu && menu.menuType == 'C' && menu.path) {
			navigate(menu.path);
			if (!state.tabs.includes(key)) {
				dispatch(setTabs([...state.tabs, key]));
			}
			onNavigate?.();
		}
	};

	return (
		<div
			className='overflow-auto shrink-0 bg-white h-full'
			style={{ width: 220 }}
		>
			<Menu
				mode='inline'
				style={{ height: '100%', borderRight: 0 }}
				items={toMenuItems(menuTree)}
				selectedKeys={selectKey}
				openKeys={expandKey}
				onOpenChange={(keys) => setExpandKey(keys as string[])}
				onClick={onClick}
			/>
		</div>
	);
};
