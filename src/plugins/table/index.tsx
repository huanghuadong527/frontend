import src_empty from '@/assets/image/error/data_grid_empty.png';
import {
	Button,
	CircularProgress,
	Pagination,
	paginationClasses,
	Stack,
	styled,
	Typography,
	type TablePaginationProps
} from '@mui/material';
import { tablePaginationClasses } from '@mui/material/TablePagination';
import {
	DataGrid,
	gridClasses,
	gridPageCountSelector,
	useGridApiContext,
	useGridSelector,
	type DataGridProps,
	type GridColDef
} from '@mui/x-data-grid';
import { StyledGridOverlay } from '../common';

const CustomStatusOverlay = (props: StatusOverlayProps) => {
	return (
		<StyledGridOverlay>
			<Stack alignItems='center' spacing={2}>
				{props.image ?? <img width={255} height={255} src={src_empty} />}
				<div className='space-y-4'>
					<div className='text-center'>
						<Typography variant='button'>{props.description}</Typography>
					</div>
					{props.children}
				</div>
			</Stack>
		</StyledGridOverlay>
	);
};

const NoColumnsOverlay = () => {
	return (
		<CustomStatusOverlay description='暂无表头'>
			<Button variant='contained' onClick={() => location.reload()}>
				尝试刷新
			</Button>
		</CustomStatusOverlay>
	);
};

const NoRowsOverlay = () => {
	return (
		<CustomStatusOverlay description='暂无数据'>
			<Button variant='contained' onClick={() => location.reload()}>
				尝试刷新
			</Button>
		</CustomStatusOverlay>
	);
};

const CustomLoadingOverlay = () => {
	return (
		<CustomStatusOverlay
			description='数据加载中'
			image={<CircularProgress enableTrackSlot size='3rem' />}
		/>
	);
};

export const TablePagination = ({
	page,
	onPageChange,
	className
}: Pick<TablePaginationProps, 'page' | 'onPageChange' | 'className'>) => {
	const apiRef = useGridApiContext();
	const pageCount = useGridSelector(apiRef, gridPageCountSelector);

	return (
		<Pagination
			className={className}
			page={page + 1}
			count={pageCount}
			variant='outlined'
			shape='rounded'
			sx={{
				[`& .${paginationClasses.ul}`]: {
					flexWrap: 'nowrap'
				}
			}}
			onChange={(event, newPage) => {
				onPageChange(event as any, newPage - 1);
			}}
		/>
	);
};

export const BASIC_COLUMN = {
	flex: 1,
	sortable: false,
	resizable: false,
	disableColumnMenu: true
};

export const getColumnData = (columns: GridColDef<AnyObject>[]) => {
	return columns.map((column) => ({
		...BASIC_COLUMN,
		...column
	}));
};

export const Table = styled((props: DataGridProps) => (
	<DataGrid<AnyObject>
		disableRowSelectionOnClick
		disableRowSelectionExcludeModel
		columnHeaderHeight={40}
		rowHeight={40}
		pageSizeOptions={[10, 20, 50, 100]}
		initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
		slots={{
			noColumnsOverlay: NoColumnsOverlay,
			noRowsOverlay: NoRowsOverlay,
			loadingOverlay: CustomLoadingOverlay
		}}
		slotProps={{
			basePagination: {
				material: {
					ActionsComponent: TablePagination
				}
			},
			baseCheckbox: {
				size: 'small'
			}
		}}
		sx={{
			[`& .${tablePaginationClasses.root}`]: {
				maxHeight: 'none'
			},
			[`& .${gridClasses.columnHeader}`]: {
				background: '#FAFAFA'
			},
			[`& .${gridClasses.cell}:focus,
				& .${gridClasses.cell}:focus-within`]: {
				outline: 'none'
			},
			[`& .${gridClasses['columnHeader--siblingFocused']},
				& .${gridClasses['columnHeader--withLeftBorder']},
				& .${gridClasses['columnHeader--withRightBorder']}`]: {
				[`& .${gridClasses.columnSeparator}`]: {
					opacity: 1
				}
			},
			[`& .${gridClasses.columnHeader}:focus,
				& .${gridClasses.columnHeader}:focus-within`]: {
				outline: 'none',
				[`& .${gridClasses.columnSeparator}`]: {
					opacity: 1
				}
			}
		}}
		{...props}
	/>
))(() => {
	return {};
});
