import {
	HTMLAttributes,
	Key,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react';
import { Button, Popover, Table } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import { TooltipPlacement } from 'antd/lib/tooltip';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ColumnsType } from 'antd/lib/table/interface';
import { ColumnsOptions } from '@/types';

interface DataType {}

interface DynamicHeaderProps {
	trigger?: string | string[];
	columns?: ColumnsOptions[];
	placement?: TooltipPlacement;
	draggable?: (dragIndex: number, hoverIndex: number) => void;
}

interface DraggableBodyRowProps extends HTMLAttributes<HTMLTableRowElement> {
	index: number;
	moveRow: (dragIndex: number, hoverIndex: number) => void;
}

const type = 'DraggableBodyRow';

const DraggableBodyRow = ({
	index,
	moveRow,
	className,
	style,
	...restProps
}: DraggableBodyRowProps) => {
	const ref = useRef<HTMLTableRowElement>(null);
	const [{ isOver, dropClassName }, drop] = useDrop({
		accept: type,
		collect: (monitor) => {
			const { index: dragIndex } = monitor.getItem() || {};
			if (dragIndex === index) {
				return {};
			}
			return {
				isOver: monitor.isOver(),
				dropClassName:
					dragIndex < index ? ' drop-over-downward' : ' drop-over-upward',
			};
		},
		drop: (item: { index: number }) => {
			moveRow(item.index, index);
		},
	});
	const [, drag] = useDrag({
		type,
		item: { index },
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
	});
	drop(drag(ref));

	return (
		<tr
			ref={ref}
			className={`${className}${isOver ? dropClassName : ''}`}
			style={{ cursor: 'move', ...style }}
			{...restProps}
		/>
	);
};

const columns: ColumnsType<DataType> = [
	{
		align: 'center',
		dataIndex: 'dataIndex',
		title: '属性',
	},
	{
		align: 'center',
		dataIndex: 'title',
		title: '列名',
	},
];

/**
 * 动态表头
 */
const DynamicHeader = (props: DynamicHeaderProps) => {
	const [visible, setVisible] = useState(false);
	const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

	const onTrigger = () => {
		setVisible(!visible);
	};

	const onTriggerChange = (_visible: boolean) => {
		setVisible(_visible);
	};

	const onSelectChange = (keys: Key[]) => {
		setSelectedRowKeys(keys);
	};

	const moveRow = useCallback(
		(dragIndex: number, hoverIndex: number) => {
			if (props.draggable) {
				props.draggable(dragIndex, hoverIndex);
			}
		},
		[props.columns]
	);

	useEffect(() => {
		setSelectedRowKeys(
			(props.columns ?? []).filter((v) => v.status).map((v) => v.key!!)
		);
	}, [props.columns]);

	const content = props.columns ? (
		<>
			<DndProvider backend={HTML5Backend}>
				<Table
					size='small'
					rowKey='key'
					pagination={false}
					scroll={{ y: 400 }}
					rowSelection={{
						selectedRowKeys,
						onChange: onSelectChange,
					}}
					components={
						props.draggable
							? {
									body: {
										row: DraggableBodyRow,
									},
							  }
							: {}
					}
					onRow={
						props.draggable
							? (_, index) => {
									const attr = {
										index,
										moveRow,
									};
									return attr as HTMLAttributes<any>;
							  }
							: undefined
					}
					columns={columns}
					dataSource={props.columns}
				/>
			</DndProvider>
			<div className='ant-popover-buttons'>
				<Button size='small'>重置</Button>
				<Button size='small'>取消</Button>
				<Button size='small' type='primary'>
					确认
				</Button>
			</div>
		</>
	) : (
		''
	);

	return (
		<Popover
			arrowPointAtCenter
			overlayClassName='mes-dynamic-header'
			open={visible}
			content={content}
			placement={props.placement ?? 'bottomRight'}
			trigger={props.trigger ?? ['click']}
			onVisibleChange={onTriggerChange}
		>
			<Button
				type='primary'
				shape='circle'
				icon={<AppstoreOutlined />}
				onClick={onTrigger}
			></Button>
		</Popover>
	);
};

export { DynamicHeader };
