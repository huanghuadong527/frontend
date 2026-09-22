import xe from 'xe-utils';
import {
	useEffect,
	useState,
	type MouseEvent,
	type ReactNode,
	type SyntheticEvent
} from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { Collapse, Paper, styled, Typography } from '@mui/material';
import {
	RichTreeView,
	TreeItemCheckbox,
	TreeItemContent,
	TreeItemDragAndDropOverlay,
	TreeItemIcon,
	TreeItemIconContainer,
	TreeItemLabel,
	TreeItemProvider,
	TreeItemRoot,
	useTreeItem,
	useTreeItemModel,
	type TreeItemProps
} from '@mui/x-tree-view';
import { animated, useSpring } from '@react-spring/web';
import type { TransitionProps } from '@mui/material/transitions';
import { MenuIcon } from '@/plugins/menu-icon';
import { usePermis } from '@/authority';
import { setTabs, useStore } from '@/store';

export const Sider = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useDispatch();
	const state = useStore((state) => state.root);
	const { menus, menuTree } = usePermis();
	const [selectKey, setSelectKey] = useState<string>('');
	const [expandKey, setExpandKey] = useState<string[]>([]);

	const getItem = (key: string, value: any) => {
		return menus.find((item: CObject) => item[key] == value);
	};

	const getExpendKey = (id: string, ids: string[] = []) => {
		ids.push(id);
		const menu = getItem('id', id);
		if (menu && menu.parentId) {
			return getExpendKey(menu.parentId, ids);
		}
		return ids;
	};

	const getDefaultSelect = () => {
		if (location.pathname == '/index') {
			setSelectKey('');
		} else {
			const menu = getItem('path', location.pathname);
			if (menu && menu.id) {
				setSelectKey(menu.id);
			}
		}
	};

	const getDefaultExpend = () => {
		if (location.pathname == '/index') {
			setExpandKey([]);
		} else {
			const menu = getItem('path', location.pathname);
			if (menu && menu.parentId) {
				setExpandKey(getExpendKey(menu.parentId));
			}
		}
	};

	const onPicker = (_: MouseEvent, itemId: string) => {
		const menu = getItem('id', itemId);
		if (menu && menu.menuType == 'C') {
			if (menu.path) {
				navigate(menu.path);
				if (!state.tabs.includes(itemId)) {
					dispatch(setTabs([...state.tabs, itemId]));
				}
			}
		}
	};

	const onSelection = (_: SyntheticEvent | null, itemId: string) => {
		setSelectKey(itemId);
	};

	const onExpansion = (
		_: SyntheticEvent | null,
		itemId: string,
		isExpand: boolean
	) => {
		if (isExpand) {
			setExpandKey(getExpendKey(itemId));
		} else {
			const menu = getItem('id', itemId);
			let ids: string[] = [];
			if (menu && menu.parentId) {
				ids = getExpendKey(menu.parentId);
			}
			setExpandKey(ids);
		}
	};

	useEffect(() => {
		getDefaultSelect();
		getDefaultExpend();
	}, [location.pathname]);

	return (
		<Paper
			square
			elevation={3}
			sx={{ width: 200, borderRadius: 0, overflow: 'auto' }}
		>
			<RichTreeView
				itemChildrenIndentation={24}
				selectedItems={selectKey}
				expandedItems={expandKey}
				items={xe.mapTree(menuTree, (item) => ({
					id: item.id,
					label: item.menuName,
					icon: item.icon,
					url: item.path
				}))}
				slots={{ item: MenuTreeItem }}
				onItemClick={onPicker}
				onItemSelectionToggle={onSelection}
				onItemExpansionToggle={onExpansion}
			/>
		</Paper>
	);
};

const CustomCollapse = styled(Collapse)({
	padding: 0
});

const AnimatedCollapse = animated(CustomCollapse);

const TransitionComponent = (props: TransitionProps) => {
	const style = useSpring({
		to: {
			opacity: props.in ? 1 : 0
		}
	});

	return <AnimatedCollapse {...props} style={style} />;
};

const TreeItemLabelText = styled(Typography)({
	color: 'inherit',
	fontFamily: 'General Sans',
	fontWeight: 500
});

interface MenuTreeLabelProps {
	children: ReactNode;
	icon?: string;
	expandable?: boolean;
}

const MenuTreeLabel = ({
	icon,
	expandable,
	children,
	...params
}: MenuTreeLabelProps) => {
	return (
		<TreeItemLabel
			{...params}
			sx={{
				display: 'flex',
				alignItems: 'center',
				gap: '8px'
			}}
		>
			{icon ? <MenuIcon name={icon} /> : null}
			<TreeItemLabelText variant='body2'>{children}</TreeItemLabelText>
		</TreeItemLabel>
	);
};

const MenuTreeItem = ({
	id,
	itemId,
	label,
	disabled,
	children,
	...params
}: TreeItemProps) => {
	const {
		getContextProviderProps,
		getRootProps,
		getContentProps,
		getCheckboxProps,
		getLabelProps,
		getGroupTransitionProps,
		getDragAndDropOverlayProps,
		getIconContainerProps,
		status
	} = useTreeItem({ id, itemId, label, children, disabled });

	const item = useTreeItemModel<MenuProps>(itemId)!;

	const icon = item.icon;

	return (
		<TreeItemProvider {...getContextProviderProps()}>
			<TreeItemRoot {...(getRootProps(params) as any)}>
				<TreeItemContent
					{...getContentProps()}
					sx={{
						paddingRight: '12px',
						paddingBlock: '10px',
						flexDirection: 'row-reverse'
					}}
				>
					<TreeItemIconContainer {...getIconContainerProps()}>
						<TreeItemIcon status={status} />
					</TreeItemIconContainer>
					<TreeItemCheckbox {...getCheckboxProps()} />
					<MenuTreeLabel
						{...getLabelProps({
							icon,
							expandable: status.expandable && status.expanded
						})}
					/>
					<TreeItemDragAndDropOverlay {...getDragAndDropOverlayProps()} />
				</TreeItemContent>
				{children && <TransitionComponent {...getGroupTransitionProps()} />}
			</TreeItemRoot>
		</TreeItemProvider>
	);
};
