import { useEffect, useState } from 'react';
import {
	DeleteOutlined,
	EditOutlined,
	PlusOutlined,
	SearchOutlined
} from '@ant-design/icons';
import {
	App,
	Button,
	Form,
	Input,
	Modal,
	Radio,
	Select,
	Space,
	Table,
	Tag
} from 'antd';
import { useTable } from '@/core';
import {
	addGoods,
	deleteGoods,
	getGoodsById,
	getMaterialOption,
	updateGoods
} from '@/service';

export const Component = () => {
	const { message, modal } = App.useApp();
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKeys, setSelectKeys] = useState<(string | number)[]>([]);
	const [materials, setMaterials] = useState<AnyObject[]>([]);
	const [searchForm] = Form.useForm();
	const [form] = Form.useForm();

	const { tableProps, getData } = useTable('/shop/goods/list', () => searchForm.getFieldsValue());

	const onSearch = (values: AnyObject) => {
		getData(values);
	};

	const onReset = () => {
		searchForm.resetFields();
		getData();
	};

	const onFinish = (values: AnyObject) => {
		if (editId) {
			updateGoods({ ...values, id: editId }).then(() => {
				message.success('修改成功');
				onCancel();
				getData();
			});
		} else {
			addGoods(values).then(() => {
				message.success('新增成功');
				onCancel();
				getData();
			});
		}
	};

	const onEdit = (id?: string | number) => {
		if (id) {
			setEditId(id);
			getGoodsById(id).then((result) => {
				const record = result.data;
				form.resetFields();
				form.setFieldsValue({
					goodsCode: record.goodsCode ?? '',
					goodsName: record.goodsName ?? '',
					goodsMaterialId:
						record.goodsMaterialId != null ? String(record.goodsMaterialId) : '',
					goodsBarcode: record.goodsBarcode ?? '',
					goodsBarcodeUnit: record.goodsBarcodeUnit ?? '',
					goodsPurchasePrice: record.goodsPurchasePrice ?? '',
					goodsRetailPrice: record.goodsRetailPrice ?? '',
					goodsSuggestedPrice: record.goodsSuggestedPrice ?? '',
					goodsInputTaxRate: record.goodsInputTaxRate ?? '',
					goodsOrigin: record.goodsOrigin ?? '',
					goodsProducer: record.goodsProducer ?? '',
					goodsExecutionStandards: record.goodsExecutionStandards ?? '',
					status: String(record.status ?? '0')
				});
				setIsOpen(true);
			});
		} else {
			setEditId('');
			form.resetFields();
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
			content: '是否确认删除该商品?',
			onOk() {
				deleteGoods(id).then(() => {
					message.success('删除成功');
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的商品');
			return;
		}
		modal.confirm({
			title: '系统提示',
			content: `是否确认删除选中的 ${selectKeys.length} 项数据?`,
			onOk() {
				deleteGoods(selectKeys.join(',')).then(() => {
					message.success('删除成功');
					setSelectKeys([]);
					getData();
				});
			}
		});
	};

	const columns = [
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
			render: (value: any) => (
				<Tag color={value == 0 ? 'success' : 'error'}>
					{value == 0 ? '正常' : '停用'}
				</Tag>
			)
		},
		{
			title: '操作',
			dataIndex: 'action',
			width: 100,
			render: (_: any, row: AnyObject) => (
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
						danger
						size='small'
						icon={<DeleteOutlined />}
						title='删除'
						onClick={() => onDelete(row.id)}
					/>
				</>
			)
		}
	];

	useEffect(() => {
		getData();
	}, []);

	useEffect(() => {
		getMaterialOption().then((result) => {
			setMaterials(result.data ?? []);
		});
	}, []);

	return (
		<div className='p-4 flex flex-col gap-4'>
			<div className='flex items-center justify-between'>
				<Form form={searchForm} layout='inline' onFinish={onSearch}>
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
			/>
			<Modal
				title={editId ? '编辑商品' : '新增商品'}
				open={isOpen}
				onOk={onSave}
				onCancel={onCancel}
				destroyOnHidden
				forceRender
			>
				<Form
					form={form}
					labelCol={{ flex: '0 0 110px' }}
					onFinish={onFinish}
					initialValues={{
						goodsCode: '',
						goodsName: '',
						goodsMaterialId: '',
						goodsBarcode: '',
						goodsBarcodeUnit: '',
						goodsPurchasePrice: '',
						goodsRetailPrice: '',
						goodsSuggestedPrice: '',
						goodsInputTaxRate: '',
						goodsOrigin: '',
						goodsProducer: '',
						goodsExecutionStandards: '',
						status: '0'
					}}
				>
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
						<Select
							placeholder='请选择材质'
							options={materials.map((item) => ({
								value: String(item.id),
								label: item.materialName
							}))}
						/>
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
