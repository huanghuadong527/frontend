import { MouseEvent, useMemo } from 'react';
import { Dropdown, Tabs, theme } from 'antd';
import {
	CloseOutlined,
	ColumnWidthOutlined,
	ReloadOutlined,
	SwapOutlined
} from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { MenuProp, setSelectable, setTabs, useAppSelector } from '@/store';
import { findTree } from 'xe-utils';
import { useNavigate } from 'react-router-dom';
import type { MenuProps } from 'antd';

import style from './index.module.less';

const { useToken } = theme;

function TabsComponent() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { token } = useToken();
	const { tabs, selectable, menus } = useAppSelector((state) => state);

	const $tabs: (MenuProp | null)[] = useMemo(() => {
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

	const onCloseTabsItem = (e: MouseEvent, { key }: MenuProp) => {
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

	const items: MenuProps['items'] = [
		{
			key: '1',
			label: '刷新页面',
			icon: <ReloadOutlined />
		},
		{
			type: 'divider'
		},
		{
			key: '2',
			label: '关闭当前',
			icon: <CloseOutlined />
		},
		{
			key: '3',
			label: '关闭其他',
			icon: <SwapOutlined />
		},
		{
			key: '4',
			label: '关闭所有',
			icon: <ColumnWidthOutlined />
		}
	];

	const tabPane = (item: MenuProp) => (
		<Dropdown menu={{ items }} trigger={['contextMenu']}>
			<div
				className='mes-tabs--item'
				style={{
					borderColor: item.key == selectable ? token.colorPrimary : '',
					backgroundColor: item.key == selectable ? token.colorPrimary : ''
				}}
			>
				<span>{item.label}</span>
				<a onClick={(e) => onCloseTabsItem(e, item)}>
					<CloseOutlined />
				</a>
			</div>
		</Dropdown>
	);

	return (
		<div className={style.layoutTabs}>
			<Tabs
				size='small'
				activeKey={selectable}
				items={[
					{
						key: 'index',
						label: (
							<div
								className='mes-tabs--item'
								style={{
									borderColor:
										'index' == selectable || !selectable
											? token.colorPrimary
											: '',
									backgroundColor:
										'index' == selectable || !selectable
											? token.colorPrimary
											: ''
								}}
							>
								<span>首页</span>
							</div>
						)
					},
					...$tabs.map((item) => ({ key: item!.key, label: tabPane(item!) }))
				]}
				onTabClick={onSelectTabsItem}
			/>
		</div>
	);
}

export default TabsComponent;
