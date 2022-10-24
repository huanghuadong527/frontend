import { MouseEvent, useMemo } from 'react';
import { Dropdown, Menu, Tabs } from 'antd';
import {
	CloseOutlined,
	ColumnWidthOutlined,
	ReloadOutlined,
	SwapOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { MenuProps, setSelectable, setTabs, UseStore } from '@/store';
import { findTree } from 'xe-utils';
import { useNavigate } from 'react-router-dom';

function TabsComponent() {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const { tabs, selectable, menus } = useSelector(
		(state: UseStore) => state.common
	);

	const $tabs: (MenuProps | null)[] = useMemo(() => {
		if (tabs && menus && menus.length > 0) {
			const t = tabs.map((tab) => {
				const mi = findTree(menus, (v) => v.key == tab.key);
				if (mi && mi.item && mi.item.key) {
					return mi.item;
				}
				return null;
			});
			return t.filter((item) => item != null);
		}
		return [];
	}, [tabs, menus]);

	const onCloseTabsItem = (e: MouseEvent, { key }: MenuProps) => {
		e.stopPropagation();
		let activeKey = selectable;
		if (key === selectable) {
			const index = $tabs.findIndex((v) => v && v.key == key);
			if ($tabs.length == 1) {
				activeKey = 'index';
				navigate('/index');
			} else {
				if (index === 0) {
					activeKey = $tabs[$tabs.length - 1]?.key;
				} else {
					activeKey = $tabs[index - 1]?.key;
				}
				const item = $tabs.find((v) => v && v.key == activeKey);
				if (item && item.path) {
					navigate(item.path);
				}
			}
		}

		dispatch(setTabs(tabs.filter((item) => item.key != key)));
		dispatch(setSelectable(activeKey));
	};

	const onSelectTabsItem = (key: string) => {
		dispatch(setSelectable(key));

		const item = $tabs.find((v) => v && v.key == key);
		if (item && item.path) {
			navigate(item.path);
		} else {
			if (key == 'index') {
				navigate('/index');
			}
		}
	};

	const menu = (
		<Menu
			items={[
				{
					label: '刷新页面',
					key: '1',
					icon: <ReloadOutlined />,
				},
				{
					type: 'divider',
				},
				{
					label: '关闭当前',
					key: '2',
					icon: <CloseOutlined />,
				},
				{
					label: '关闭其他',
					key: '3',
					icon: <SwapOutlined />,
				},
				{
					label: '关闭所有',
					key: '4',
					icon: <ColumnWidthOutlined />,
				},
			]}
		/>
	);

	const tabPane = (item: MenuProps) => (
		<Dropdown overlay={menu} trigger={['contextMenu']}>
			<div className='mes-tabs--item'>
				<span>{item.label}</span>
				<a onClick={(e) => onCloseTabsItem(e, item)}>
					<CloseOutlined />
				</a>
			</div>
		</Dropdown>
	);

	return (
		<div className='mes-tabs'>
			<Tabs
				size='small'
				activeKey={selectable}
				items={[
					{
						key: 'index',
						label: (
							<div className='mes-tabs--item'>
								<span>首页</span>
							</div>
						),
					},
					...$tabs.map((item) => ({ key: item!.key, label: tabPane(item!) })),
				]}
				onTabClick={onSelectTabsItem}
			/>
		</div>
	);
}

export default TabsComponent;
