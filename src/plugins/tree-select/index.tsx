import xe from 'xe-utils';
import {
	useEffect,
	useMemo,
	useRef,
	useState,
	type ChangeEvent,
	type ChangeEventHandler,
	type MouseEvent,
	type MouseEventHandler
} from 'react';
import {
	ChevronDownRegular,
	DismissRegular
} from '@fluentui/react-icons';
import {
	ClickAwayListener,
	IconButton,
	Paper,
	Popper,
	styled
} from '@mui/material';
import { useWindowSize } from 'react-use';
import { grey } from '@mui/material/colors';
import { Tree } from '../tree';

interface TreeSelectProps<T = AnyObject> {
	value?: string;
	multiple?: boolean;
	showLine?: boolean;
	name?: string;
	treeDefaultExpandAll?: boolean;
	rowKey?: string;
	placeholder?: string;
	treeData?: T[];
	onChange?: ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
}

export const TreeSelect = ({
	placeholder,
	multiple = false,
	showLine = false,
	treeDefaultExpandAll = false,
	rowKey = 'id',
	treeData = [],
	...props
}: TreeSelectProps) => {
	const sRef = useRef<HTMLDivElement>(null);
	const [width, setWidth] = useState(200);
	const [autoValue, setAutoValue] = useState<string>('');
	const [expandKey, setExpandKey] = useState<string[]>([]);
	const [defaultExpandKeys, setDefaultExpandKeys] = useState<string[]>([]);
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

	const getExpandKeys = () => {
		if (treeData) {
			return xe.toTreeArray(treeData).map((item) => item[rowKey]);
		}
		return [];
	};

	const inputLabel = useMemo(() => {
		if (props.value && treeData.length > 0) {
			const menus = xe.toTreeArray(treeData);
			const menu = menus.find((item) => item[rowKey] == props.value);
			if (menu && menu.label) {
				return menu.label;
			}
		}
		return '';
	}, [props.value, treeData]);

	const onChiose = (e: MouseEvent<HTMLElement>) => {
		setWidth(sRef.current!.clientWidth);
		setAnchorEl(anchorEl ? null : e.currentTarget);
	};

	const onClickAway = () => {
		setAnchorEl(null);
	};

	const onClear: MouseEventHandler<HTMLButtonElement> = (e) => {
		e.stopPropagation();
		props.onChange &&
			props.onChange({
				...e,
				target: { name: props.name, value: '' }
			} as ChangeEvent<any>);
	};

	const onSelectedItemsChange = () => {
		setAnchorEl(null);
	};

	useWindowSize({
		onChange() {
			setWidth(sRef.current!.clientWidth);
		}
	});

	useEffect(() => {
		setDefaultExpandKeys(getExpandKeys());
	}, [treeDefaultExpandAll, treeData]);

	useEffect(() => {
		setExpandKey(getExpandKeys());
	}, [treeData]);

	return (
		<ClickAwayListener onClickAway={onClickAway}>
			<CustomSelect
				aria-labelledby='select'
				ref={sRef}
				className={Boolean(anchorEl) ? 'select-open' : ''}
				onClick={onChiose}
			>
				<CustomSelectContent aria-labelledby='select-content'>
					{props.value ? (
						inputLabel
					) : (
						<CustomSelectPlaceholder aria-labelledby='select-placeholder'>
							{placeholder}
						</CustomSelectPlaceholder>
					)}
					<CustomSelectAutoInput
						readOnly
						autoComplete='off'
						aria-autocomplete='list'
						aria-haspopup='listbox'
						aria-expanded={Boolean(anchorEl)}
						role='combobox'
						value={autoValue}
						onChange={(e) => setAutoValue(e.target.value as string)}
					/>
					<CustomSelectInput {...props} />
				</CustomSelectContent>
				{props.value ? (
					<CustomSelectSuffix
						className='select-clear'
						size='small'
						onClick={onClear}
					>
						<DismissRegular style={{ fontSize: 14 }} />
					</CustomSelectSuffix>
				) : (
					<CustomSelectSuffix className='select-suffix' size='small'>
						<ChevronDownRegular style={{ fontSize: 14 }} />
					</CustomSelectSuffix>
				)}
				<CustomPopper
					placement='bottom-start'
					open={Boolean(anchorEl)}
					anchorEl={anchorEl}
					sx={{ width }}
					modifiers={[
						{
							name: 'offset',
							options: {
								offset: [1, 0]
							}
						}
					]}
					onClick={(e) => e.stopPropagation()}
				>
					<Paper
						sx={{
							maxHeight: '300px',
							padding: '4px',
							overflow: 'auto'
						}}
					>
						<Tree
							showLine={showLine}
							defaultExpandedItems={defaultExpandKeys}
							expandedItems={expandKey}
							selectedItems={props.value}
							items={treeData}
							onExpandedItemsChange={(_, keys) => setExpandKey(keys)}
							onSelectedItemsChange={(e, keys) => {
								props.onChange &&
									props.onChange({
										...e,
										target: { name: props.name, value: keys }
									} as ChangeEvent<any>);
								onSelectedItemsChange();
							}}
						/>
					</Paper>
				</CustomPopper>
			</CustomSelect>
		</ClickAwayListener>
	);
};

const CustomPopper = styled(Popper)(({ theme }) => ({
	zIndex: theme.vars!.zIndex.tooltip
}));

const CustomSelect = styled('div')(({ theme }) => ({
	margin: 0,
	padding: 0,
	color: 'initial',
	fontSize: '14px',
	minWidth: '220px',
	lineHeight: 1.5714285714285714,
	listStyle: 'none',
	display: 'flex',
	flexWrap: 'nowrap',
	position: 'relative',
	transition: theme.transitions.create('all', {
		duration: theme.transitions.duration.standard
	}),
	alignItems: 'flex-start',
	outline: 0,
	borderRadius: theme.vars!.shape.borderRadius,
	borderWidth: '1px',
	borderStyle: 'solid',
	paddingInline: '11px',
	paddingBlock: '4px',
	borderColor: theme.palette.border.main,
	'&.select-open': {
		color: grey[500]
	}
}));

const CustomSelectContent = styled('div')({
	flex: 'auto',
	minWidth: 0,
	position: 'relative',
	display: 'flex',
	marginInlineEnd: '6px',
	overflow: 'hidden',
	whiteSpace: 'nowrap',
	textOverflow: 'ellipsis',
	alignSelf: 'center',
	'&::before': {
		content: '" "',
		width: 0,
		overflow: 'hidden'
	}
});

const CustomSelectPlaceholder = styled('div')({
	overflow: 'hidden',
	whiteSpace: 'nowrap',
	textOverflow: 'ellipsis',
	pointerEvents: 'none',
	color: grey[500],
	zIndex: 1
});

const CustomSelectAutoInput = styled('input')(({ theme }) => ({
	position: 'absolute',
	insetInline: 0,
	insetBlock: '-4px',
	lineHeight: '30px',
	outline: 'none',
	background: 'transparent',
	appearance: 'none',
	border: 0,
	margin: 0,
	padding: 0,
	color: theme.palette.text.primary
}));

const CustomSelectInput = styled('input')({
	opacity: 0,
	display: 'none'
});

const CustomSelectSuffix = styled(IconButton)({
	padding: '4px'
});
