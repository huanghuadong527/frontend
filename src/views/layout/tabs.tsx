import {
	useEffect,
	useState,
	type DOMAttributes,
	type MouseEvent,
	type SyntheticEvent
} from 'react';
import { useDispatch } from 'react-redux';
import {
	alpha,
	Menu,
	MenuItem,
	Paper,
	styled,
	Tabs as MuiTabs,
	Tab,
	Typography,
	type MenuItemProps,
	type TabOwnProps,
	tabClasses
} from '@mui/material';
import {
	ArrowSyncRegular,
	DismissRegular,
	StopRegular
} from '@fluentui/react-icons';
import { useLocation, useNavigate } from 'react-router';
import { usePermis } from '@/authority';
import { delTabs, removeTabs, useStore } from '@/store';

export const Tabs = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const store = useStore((state) => state.root);
	const { menus } = usePermis();
	const [selected, setSelected] = useState<string | boolean>(false);

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

	const onChange = (_: SyntheticEvent, newValue: string) => {
		setSelected(newValue);
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

	useEffect(() => {
		getDefaultSelect();
	}, [location.pathname]);

	return (
		<TabsPanel square className='flex items-center gap-2' elevation={3}>
			<AntTabs
				value={selected}
				indicatorColor={'transparent' as any}
				onChange={onChange}
			>
				<AntTab
					value='index'
					label='首页'
					onClick={() => onSelection('index')}
					onRemoveAll={onRemoveAll}
				/>
				{store.tabs.map((tab) => {
					const menu = menus.find((m) => m.id == tab);
					return menu ? (
						<AntTab
							key={menu.id}
							value={menu.id}
							label={menu.menuName}
							onClick={() => onSelection(menu.id)}
							onRemove={(e) => {
								e.stopPropagation();
								onRemove(menu.id);
							}}
							onRemoveAll={onRemoveAll}
						/>
					) : null;
				})}
			</AntTabs>
		</TabsPanel>
	);
};

const AntTabs = styled(MuiTabs)({ minHeight: 'initial' });

const TabsPanel = styled(Paper)(({ theme }) => ({
	paddingBlock: '6px',
	paddingInline: '10px',
	boxShadow: `0 5px 6px -5px ${alpha(theme.palette.common.black, 0.3)}`
}));

const ContextItem = styled((props: MenuItemProps) => (
	<MenuItem disableRipple {...props} />
))(() => ({
	paddingInline: 12,
	paddingBlock: 5,
	fontSize: 14,
	gap: '8px'
}));

interface TabAttachProps extends TabOwnProps {
	onRemove?: (e: MouseEvent) => void;
	onRemoveAll?: () => void;
}

type TabsProps = TabAttachProps & DOMAttributes<HTMLDivElement>;

const AntTab = styled(({ onRemove, onRemoveAll, ...props }: TabsProps) => {
	const [offset, setOffset] = useState<Coordinate | null>(null);

	const onContextMenu = (e: MouseEvent) => {
		e.preventDefault();

		setOffset(offset === null ? { x: e.clientX, y: e.clientY } : null);
	};

	const onRefresh = () => {
		location.reload();
	};

	const onClose = () => {
		setOffset(null);
	};

	return (
		<>
			<Tab
				{...props}
				label={
					<>
						{props.label}
						{props.value != 'index' ? (
							<a onClick={onRemove}>
								<DismissRegular />
							</a>
						) : null}
					</>
				}
				onContextMenu={onContextMenu}
			/>
			<Menu
				anchorReference='anchorPosition'
				open={offset !== null}
				anchorPosition={
					offset !== null
						? {
								left: offset.x,
								top: offset.y
							}
						: undefined
				}
				slotProps={{
					list: {
						sx: {
							p: '4px'
						}
					}
				}}
				onClose={onClose}
			>
				<ContextItem onClick={onRefresh}>
					<ArrowSyncRegular style={{ fontSize: 16 }} />
					<Typography variant='body2'>刷新页面</Typography>
				</ContextItem>
				<ContextItem onClick={onRemoveAll}>
					<StopRegular style={{ fontSize: 16 }} />
					<Typography variant='body2'>关闭所有</Typography>
				</ContextItem>
			</Menu>
		</>
	);
})(({ theme }) => ({
	minWidth: 0,
	minHeight: 0,
	padding: '5px 10px',
	textTransform: 'none',
	flexDirection: 'row',
	marginRight: theme.spacing(1),
	transition: theme.transitions.create(['background-color', 'color'], {
		duration: theme.transitions.duration.standard
	}),
	'&:hover': {
		color: theme.palette.primary.light
	},
	[`&.${tabClasses.selected}`]: {
		color: theme.palette.common.white,
		backgroundColor: theme.palette.primary.main,
		'&:hover': {
			backgroundColor: theme.palette.primary.light
		}
	},
	'& > a': {
		marginLeft: 5
	}
}));
