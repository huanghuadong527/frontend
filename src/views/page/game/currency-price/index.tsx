import { useEffect, useRef, useState } from 'react';
import {
	DeleteOutlined,
	EditOutlined,
	PlusOutlined,
	SearchOutlined
} from '@ant-design/icons';
import {
	App,
	Button,
	DatePicker,
	Form,
	Input,
	InputNumber,
	Modal,
	Select,
	Space,
	Table
} from 'antd';
import type { TableColumnsType } from 'antd';
import dayjs from 'dayjs';
import { DICT_WM_SERVER, useTable } from '@/core';
import {
	addCurrencyPrice,
	deleteCurrencyPrice,
	getCurrencyPriceById,
	getDictDataByType,
	updateCurrencyPrice
} from '@/service';

const formatNumber = (value: unknown) => {
	if (value == null || value === '') return '--';
	const n = Number(value);
	if (Number.isNaN(n)) return String(value);
	return n.toLocaleString('zh-CN');
};

const TRADE_TYPE_OPTIONS = [
	{ value: 1, label: '收购' },
	{ value: 2, label: '出售' }
];

const getTradeTypeLabel = (value: unknown) =>
	TRADE_TYPE_OPTIONS.find((o) => o.value == value)?.label ?? '--';

export const Component = () => {
	const { message, modal } = App.useApp();
	const [searchForm] = Form.useForm();
	const [form] = Form.useForm();
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKeys, setSelectKeys] = useState<(string | number)[]>([]);
	const [servers, setServers] = useState<AnyObject[]>([]);
	const searchParamsRef = useRef<AnyObject>({});

	const { tableProps, getData } = useTable(
		'/game/wm/currency-price/list',
		() => searchParamsRef.current
	);

	const onSearch = (values: AnyObject) => {
		const range = values.dateRange ?? [];
		const params = {
			startDate: range[0] ? range[0].format('YYYY-MM-DD') : undefined,
			endDate: range[1] ? range[1].format('YYYY-MM-DD') : undefined,
			server: values.server?.trim() || undefined,
			tradeType: values.tradeType ?? undefined
		};
		searchParamsRef.current = params;
		getData(params);
	};

	const onReset = () => {
		searchForm.resetFields();
		searchParamsRef.current = {};
		getData({});
	};

	const onFinish = (values: AnyObject) => {
		const params = {
			priceDate: values.priceDate
				? values.priceDate.format('YYYY-MM-DD')
				: undefined,
			server: values.server?.trim() || undefined,
			ratio: values.ratio ?? undefined,
			tradeType: values.tradeType ?? undefined,
			remark: values.remark?.trim() || undefined
		};
		if (editId) {
			updateCurrencyPrice({ ...params, id: editId }).then(() => {
				message.success('修改成功');
				onCancel();
				getData();
			});
		} else {
			addCurrencyPrice(params).then(() => {
				message.success('新增成功');
				onCancel();
				getData();
			});
		}
	};

	const onEdit = (id?: string | number) => {
		if (id) {
			setEditId(id);
			getCurrencyPriceById(id).then((result) => {
				const record = result.data;
				form.resetFields();
				form.setFieldsValue({
					priceDate: record.priceDate ? dayjs(record.priceDate) : null,
					server: record.server ?? '',
					ratio: record.ratio ?? null,
					tradeType: record.tradeType ?? 1,
					remark: record.remark ?? ''
				});
				setIsOpen(true);
			});
		} else {
			setEditId('');
			form.resetFields();
			form.setFieldsValue({ priceDate: dayjs(), tradeType: 1 });
			setIsOpen(true);
		}
	};

	const onSave = () => {
		form.submit();
	};

	const onCancel = () => {
		setIsOpen(false);
		setEditId('');
		form.resetFields();
	};

	const onDelete = (id: string | number) => {
		modal.confirm({
			title: '系统提示',
			content: '是否确认删除该币价记录?',
			onOk() {
				deleteCurrencyPrice(id).then(() => {
					message.success('删除成功');
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的币价记录');
			return;
		}
		modal.confirm({
			title: '系统提示',
			content: `是否确认删除选中的 ${selectKeys.length} 项数据?`,
			onOk() {
				deleteCurrencyPrice(selectKeys.join(',')).then(() => {
					message.success('删除成功');
					setSelectKeys([]);
					getData();
				});
			}
		});
	};

	useEffect(() => {
		getData();
	}, []);

	useEffect(() => {
		getDictDataByType(DICT_WM_SERVER).then((result) => {
			const list = result.data ?? [];
			setServers(
				list
					.slice()
					.sort((a: AnyObject, b: AnyObject) =>
						String(a.dictValue).localeCompare(String(b.dictValue), 'zh-CN', {
							numeric: true
						})
					)
					.map((item: AnyObject) => ({
						value: item.dictValue,
						label: item.dictLabel
					}))
			);
		});
	}, []);

	const getServerLabel = (value: unknown) =>
		servers.find((item) => item.value == value)?.label ?? value ?? '--';

	const columns: TableColumnsType<AnyObject> = [
		{ title: '编号', dataIndex: 'id', width: 70 },
		{ title: '日期', dataIndex: 'priceDate' },
		{
			title: '区服',
			dataIndex: 'server',
			render: (value) => getServerLabel(value)
		},
		{
			title: '交易类型',
			dataIndex: 'tradeType',
			width: 100,
			render: (value) => getTradeTypeLabel(value)
		},
		{
			title: '比例(万/100元)',
			dataIndex: 'ratio',
			render: (value) =>
				value == null || value === '' ? '--' : `${formatNumber(value)} 万`
		},
		{
			title: '录入人',
			dataIndex: 'createBy',
			render: (value) => value || '--'
		},
		{
			title: '创建日期',
			dataIndex: 'createTime',
			render: (value) => value || '--'
		},
		{ title: '备注', dataIndex: 'remark', render: (value) => value || '--' },
		{
			title: '操作',
			dataIndex: 'action',
			render: (_v, row) => (
				<>
					<Button
						type='link'
						size='small'
						icon={<EditOutlined />}
						title='编辑'
						onClick={() => onEdit(row.id)}
					/>
					<Button
						type='link'
						size='small'
						danger
						icon={<DeleteOutlined />}
						title='删除'
						onClick={() => onDelete(row.id)}
					/>
				</>
			)
		}
	];

	return (
		<div className='p-4 flex flex-col gap-4'>
			<div className='flex items-center justify-between'>
				<Form form={searchForm} layout='inline' onFinish={onSearch}>
					<Form.Item name='dateRange' label='日期'>
						<DatePicker.RangePicker allowEmpty={[true, true]} />
					</Form.Item>
					<Form.Item name='server' label='区服'>
						<Select placeholder='请选择区服' options={servers} allowClear />
					</Form.Item>
					<Form.Item name='tradeType' label='交易类型'>
						<Select
							placeholder='请选择交易类型'
							options={TRADE_TYPE_OPTIONS}
							allowClear
						/>
					</Form.Item>
					<Form.Item>
						<Space>
							<Button
								type='primary'
								htmlType='submit'
								icon={<SearchOutlined />}
							>
								查询
							</Button>
							<Button onClick={onReset}>重置</Button>
						</Space>
					</Form.Item>
				</Form>
				<Space>
					<Button
						type='primary'
						icon={<PlusOutlined />}
						onClick={() => onEdit()}
					>
						新建
					</Button>
					<Button
						type='primary'
						danger
						icon={<DeleteOutlined />}
						disabled={selectKeys.length == 0}
						onClick={onBatchDelete}
					>
						批量删除
					</Button>
				</Space>
			</div>
			<Table
				{...tableProps}
				rowSelection={{
					selectedRowKeys: selectKeys,
					onChange: (keys) => setSelectKeys(keys as (string | number)[])
				}}
				columns={columns}
				scroll={{ x: 900 }}
			/>
			<Modal
				title={editId ? '编辑币价' : '新增币价'}
				open={isOpen}
				onOk={onSave}
				onCancel={onCancel}
				destroyOnHidden
				forceRender
			>
				<Form form={form} labelCol={{ flex: '0 0 140px' }} onFinish={onFinish}>
					<Form.Item
						name='priceDate'
						label='日期'
						rules={[{ required: true, message: '请选择日期' }]}
					>
						<DatePicker style={{ width: '100%' }} />
					</Form.Item>
					<Form.Item
						name='server'
						label='区服'
						rules={[{ required: true, message: '请选择区服' }]}
					>
						<Select placeholder='请选择区服' options={servers} />
					</Form.Item>
					<Form.Item
						name='tradeType'
						label='交易类型'
						rules={[{ required: true, message: '请选择交易类型' }]}
					>
						<Select placeholder='请选择交易类型' options={TRADE_TYPE_OPTIONS} />
					</Form.Item>
					<Form.Item
						name='ratio'
						label='比例(万/100元)'
						rules={[{ required: true, message: '请输入比例' }]}
					>
						<InputNumber
							min={0}
							precision={0}
							style={{ width: '100%' }}
							placeholder='100元可兑换的游戏币数量(万)，如 7200'
						/>
					</Form.Item>
					<Form.Item name='remark' label='备注'>
						<Input.TextArea rows={3} placeholder='请输入备注(如波动原因)' />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};
