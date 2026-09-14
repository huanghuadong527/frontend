import { Key, useCallback, useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Popconfirm, Radio, Select, Space, Table, Tag } from 'antd';
import { message } from '@/redux';
import type { TableProps } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { FORM_LAYOUT } from '@/core';
import { addGoods, deleteGoods, getGoodsById, getGoodsList, getMaterialOption, updateGoods } from '@/service';

const Goods = () => {
	const [visible, setVisible] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
	const [dataSource, setDataSource] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [pageNum, setPageNum] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [total, setTotal] = useState(0);
	const [materials, setMaterials] = useState<any[]>([]);
	const [searchForm] = Form.useForm();
	const [form] = Form.useForm();

	const getData = useCallback(
		(params: object = {}) => {
			setLoading(true);
			getGoodsList({ pageNum, pageSize, ...params }).then((result) => {
				setLoading(false);
				setTotal(result.data?.total ?? 0);
				setDataSource(result.data?.data ?? []);
			});
		},
		[pageNum, pageSize]
	);

	useEffect(() => {
		getData();
	}, [getData]);

	useEffect(() => {
		getMaterialOption().then((result) => {
			const list = result.data ?? [];
			setMaterials(
				list.map((item: any) => ({
					value: String(item.id),
					label: item.materialName
				}))
			);
		});
	}, []);

	const onSearch = (values: any) => {
		getData({
			goodsName: values.goodsName || undefined,
			goodsCode: values.goodsCode || undefined
		});
	};

	const onReset = () => {
		searchForm.resetFields();
		getData();
	};

	const onEdit = (id?: string | number) => {
		if (id) {
			setEditId(id);
			getGoodsById(id).then((result) => {
				const record = result.data;
				form.setFieldsValue({
					...record,
					goodsMaterialId: record.goodsMaterialId != null ? String(record.goodsMaterialId) : '',
					status: String(record.status ?? '0')
				});
				setVisible(true);
			});
		} else {
			setEditId('');
			form.resetFields();
			setVisible(true);
		}
	};

	const onSave = () => {
		form.validateFields().then((values) => {
			const params = { ...values };
			if (editId) {
				updateGoods({ ...params, id: editId }).then(() => {
					message.success('修改成功');
					onCancel();
					getData();
				});
			} else {
				addGoods(params).then(() => {
					message.success('新增成功');
					onCancel();
					getData();
				});
			}
		});
	};

	const onCancel = () => {
		setVisible(false);
		setEditId('');
		form.resetFields();
	};

	const onDelete = (id: string | number) => {
		deleteGoods(id).then(() => {
			message.success('删除成功');
			getData();
		});
	};

	const onBatchDelete = () => {
		if (selectedRowKeys.length === 0) {
			message.warning('请选择要删除的商品');
			return;
		}
		deleteGoods(selectedRowKeys.join(',')).then(() => {
			message.success('删除成功');
			setSelectedRowKeys([]);
			getData();
		});
	};

	const columns: TableProps<any>['columns'] = [
		{ title: '编号', dataIndex: 'id' },
		{ title: '商品编码', dataIndex: 'goodsCode' },
		{ title: '商品名称', dataIndex: 'goodsName' },
		{ title: '材质', dataIndex: 'materialName' },
		{ title: '条码', dataIndex: 'goodsBarcode' },
		{ title: '零售价', dataIndex: 'goodsRetailPrice' },
		{ title: '建议零售价', dataIndex: 'goodsSuggestedPrice' },
		{
			title: '状态',
			dataIndex: 'status',
			render: (value) => (
				<Tag color={value == 0 ? 'success' : 'error'}>{value == 0 ? '正常' : '停用'}</Tag>
			)
		},
		{
			title: '操作',
			width: 120,
			render: (_, record) => (
				<Space>
					<Button
						type='link'
						size='small'
						icon={<EditOutlined />}
						onClick={() => onEdit(record.id)}
					>
						编辑
					</Button>
					<Popconfirm title='是否确认删除?' onConfirm={() => onDelete(record.id)}>
						<Button type='link' size='small' danger icon={<DeleteOutlined />}>
							删除
						</Button>
					</Popconfirm>
				</Space>
			)
		}
	];

	return (
		<div className='w-full h-full flex flex-col'>
			<div className='flex justify-between mb-4'>
				<Form layout='inline' form={searchForm} onFinish={onSearch}>
					<Form.Item name='goodsName' label='商品名称'>
						<Input placeholder='请输入商品名称' />
					</Form.Item>
					<Form.Item name='goodsCode' label='商品编码'>
						<Input placeholder='请输入商品编码' />
					</Form.Item>
					<Form.Item>
						<Space>
							<Button type='primary' htmlType='submit' icon={<SearchOutlined />}>
								查询
							</Button>
							<Button onClick={onReset}>重置</Button>
						</Space>
					</Form.Item>
				</Form>
				<Space>
					<Button type='primary' icon={<PlusOutlined />} onClick={() => onEdit()}>
						新建
					</Button>
					<Popconfirm title='是否确认删除?' onConfirm={onBatchDelete}>
						<Button danger icon={<DeleteOutlined />} disabled={selectedRowKeys.length === 0}>
							批量删除
						</Button>
					</Popconfirm>
				</Space>
			</div>
			<Table
				rootClassName='table-fill'
				size='small'
				rowKey='id'
				loading={loading}
				dataSource={dataSource}
				columns={columns}
				scroll={{ y: '100%' }}
				rowSelection={{ selectedRowKeys, onChange: (keys) => setSelectedRowKeys(keys) }}
				pagination={{
					current: pageNum,
					pageSize,
					total,
					showSizeChanger: true,
					showQuickJumper: true,
					showTotal: (t) => `共 ${t} 条`,
					onChange: (page, size) => {
						setPageNum(page);
						setPageSize(size);
					}
				}}
			/>
			<Modal
				title={editId ? '编辑商品' : '新增商品'}
				width={640}
				open={visible}
				onOk={onSave}
				onCancel={onCancel}
			>
				<Form {...FORM_LAYOUT} form={form}>
					<Form.Item
						name='goodsCode'
						label='商品编码'
						rules={[{ required: true, message: '请输入商品编码' }]}
					>
						<Input placeholder='请输入商品编码' />
					</Form.Item>
					<Form.Item
						name='goodsName'
						label='商品名称'
						rules={[{ required: true, message: '请输入商品名称' }]}
					>
						<Input placeholder='请输入商品名称' />
					</Form.Item>
					<Form.Item name='goodsMaterialId' label='材质'>
						<Select placeholder='请选择材质' options={materials} />
					</Form.Item>
					<Form.Item name='goodsBarcode' label='条码'>
						<Input placeholder='请输入条码' />
					</Form.Item>
					<Form.Item name='goodsBarcodeUnit' label='条码单位'>
						<Input placeholder='请输入条码单位' />
					</Form.Item>
					<Form.Item name='goodsPurchasePrice' label='核算进价'>
						<Input placeholder='请输入核算进价' />
					</Form.Item>
					<Form.Item name='goodsRetailPrice' label='零售价'>
						<Input placeholder='请输入零售价' />
					</Form.Item>
					<Form.Item name='goodsSuggestedPrice' label='建议零售价'>
						<Input placeholder='请输入建议零售价' />
					</Form.Item>
					<Form.Item name='goodsInputTaxRate' label='进项税率(%)'>
						<Input placeholder='请输入进项税率' />
					</Form.Item>
					<Form.Item name='goodsOrigin' label='产地'>
						<Input placeholder='请输入产地' />
					</Form.Item>
					<Form.Item name='goodsProducer' label='生产商'>
						<Input placeholder='请输入生产商' />
					</Form.Item>
					<Form.Item name='goodsExecutionStandards' label='执行标准'>
						<Input placeholder='请输入执行标准' />
					</Form.Item>
					<Form.Item name='status' label='状态'>
						<Radio.Group>
							<Radio value='0'>正常</Radio>
							<Radio value='1'>停用</Radio>
						</Radio.Group>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export const Component = Goods;
