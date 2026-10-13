import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Dropdown, Tabs as AntdTabs } from 'antd';
import type { MenuProps as AntdMenuProps, TabsProps } from 'antd';
import {
	ReloadOutlined,
	CloseCircleOutlined,
	CloseOutlined
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router';
import { usePermis } from '@/authority';
import { delTabs, removeTabs, useStore } from '@/store';

export const Tabs = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const store = useStore((state) => state.root);
	const { menus } = usePermis();
	const [selected, setSelected] = useState('index');

	const getItem = (key: string, value: any) => {
		return menus.find((item: CObject) => item[key] == value);
	};

	const goIndex = () => {
		setSelected('index');
		navigate('/index');
	};

	const getDefaultSelect = () => {
		if (location.pathname == '/index') {
			setSelected('index');
		} else {
			const menu = getItem('path', location.pathname);
			if (menu && menu.id) {
				if (store.tabs.includes(menu.id)) {
					setSelected(menu.id);
				}
			}
		}
	};

	const onSelection = (id: string) => {
		if (id == 'index') {
			navigate('/index');
		} else {
			const menu = getItem('id', id);
			if (menu && menu.menuType == 'C') {
				if (menu.path) {
					navigate(menu.path);
				}
			}
		}
	};

	const onRemove = (id: string) => {
		const menu = getItem('path', location.pathname);
		if (menu && menu.id == id) {
			const idx = store.tabs.findIndex((tab) => tab == id);
			if (idx - 1 == -1) {
				goIndex();
			} else {
				const nextId = store.tabs[idx - 1];
				if (nextId) {
					const nmenu = getItem('id', nextId);
					if (nmenu && nmenu.path) {
						setSelected(nextId);
						navigate(nmenu.path);
					}
				} else {
					goIndex();
				}
			}
		}
		dispatch(delTabs(id));
	};

	const onRemoveAll = () => {
		goIndex();
		dispatch(removeTabs());
	};

	const contextItems: AntdMenuProps['items'] = [
		{ key: 'refresh', icon: <ReloadOutlined />, label: '刷新页面' },
		{ key: 'closeAll', icon: <CloseCircleOutlined />, label: '关闭所有' }
	];

	const renderTabLabel = (menu: MenuProps) => (
		<Dropdown
			trigger={['contextMenu']}
			menu={{
				items: contextItems,
				onClick: ({ key }) => {
					if (key === 'refresh') {
						window.location.reload();
					} else if (key === 'closeAll') {
						onRemoveAll();
					}
				}
			}}
		>
			<span>
				{menu.menuName}
				<CloseOutlined
					style={{ marginLeft: 6, fontSize: 12 }}
					onClick={(e) => {
						e.stopPropagation();
						onRemove(menu.id);
					}}
				/>
			</span>
		</Dropdown>
	);

	const items: TabsProps['items'] = [
		{ key: 'index', label: '首页', closable: false },
		...store.tabs
			.map((tab) => {
				const menu = menus.find((m) => m.id == tab);
				return menu
					? {
							key: menu.id,
							label: renderTabLabel(menu),
							closable: false
						}
					: null;
			})
			.filter((item): item is NonNullable<typeof item> => item != null)
	];

	useEffect(() => {
		getDefaultSelect();
	}, [location.pathname]);

	return (
		<div
			className='flex items-center gap-2 px-2.5 bg-white'
			style={{
				paddingBlock: 6,
				boxShadow: '0 5px 6px -5px rgba(0,0,0,0.3)'
			}}
		>
			<AntdTabs
				className='layout-tabs'
				type='editable-card'
				hideAdd
				size='small'
				styles={{ header: { margin: 0 } }}
				activeKey={selected}
				items={items}
				onChange={onSelection}
				onEdit={(targetKey, action) => {
					if (action === 'remove') {
						onRemove(targetKey as string);
					}
				}}
			/>
		</div>
	);
};
