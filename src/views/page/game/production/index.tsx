import { useEffect, useState } from 'react';
import {
	DeleteOutlined,
	EditOutlined,
	MinusCircleOutlined,
	PlusOutlined,
	SearchOutlined
} from '@ant-design/icons';
import {
	App,
	Button,
	Col,
	Divider,
	Form,
	Input,
	Modal,
	Row,
	Select,
	Space,
	Table,
	Tag
} from 'antd';
import type { TableColumnsType } from 'antd';
import { useTable } from '@/core';
import {
	addProduction,
	deleteProduction,
	getProductionById,
	updateProduction
} from '@/service';

const PROFESSION_OPTIONS = ['巧匠', '铁匠', '裁缝', '药师'].map((v) => ({
	value: v,
	label: v
}));

type MaterialItem = {
	materialName?: string;
	quantity?: string;
};

const renderContent = (value: unknown) => {
	if (value == null || value === '') return '--';
	const s = String(value);
	return s.length > 40 ? `${s.slice(0, 40)}…` : s;
};

const toNumber = (value: unknown) =>
	value === '' || value == null ? undefined : Number(value);

export const Component = () => {
	const { message, modal } = App.useApp();
	const [searchForm] = Form.useForm();
	const [form] = Form.useForm();
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKeys, setSelectKeys] = useState<(string | number)[]>([]);
	const [materialList, setMaterialList] = useState<MaterialItem[]>([]);

	const { tableProps, getData } = useTable('/game/wm/production/list', () =>
		searchForm.getFieldsValue()
	);

	const onSearch = (values: AnyObject) => {
		getData({
			name: values.name || undefined,
			profession: values.profession || undefined
		});
	};

	const onReset = () => {
		searchForm.resetFields();
		getData();
	};

	const onFinish = (values: AnyObject) => {
		const materials = materialList
			.filter((m) => m.materialName)
			.map((m) => ({
				materialName: m.materialName,
				quantity: toNumber(m.quantity)
			}));
		const params = {
			name: values.name,
			profession: values.profession,
			itemType: values.itemType || undefined,
			levelReq: values.levelReq || undefined,
			useReq: values.useReq || undefined,
			effect: values.effect || undefined,
			source: values.source || undefined,
			rawText: values.rawText || undefined,
			materials
		};
		if (editId) {
			updateProduction({ ...params, id: editId }).then(() => {
				message.success('修改成功');
				onCancel();
				getData();
			});
		} else {
			addProduction(params).then(() => {
				message.success('新增成功');
				onCancel();
				getData();
			});
		}
	};

	const onEdit = (id?: string | number) => {
		if (id) {
			setEditId(id);
			getProductionById(id).then((result) => {
				const record = result.data;
				form.resetFields();
				form.setFieldsValue({
					name: record.name ?? '',
					profession: record.profession ?? undefined,
					itemType: record.itemType ?? '',
					levelReq: record.levelReq ?? '',
					useReq: record.useReq ?? '',
					effect: record.effect ?? '',
					source: record.source ?? '',
					rawText: record.rawText ?? ''
				});
				setMaterialList(
					(record.materials ?? []).map((m: AnyObject) => ({
						materialName: m.materialName ?? '',
						quantity: m.quantity != null ? String(m.quantity) : ''
					}))
				);
				setIsOpen(true);
			});
		} else {
			setEditId('');
			form.resetFields();
			setMaterialList([]);
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
		setMaterialList([]);
	};

	const onDelete = (id: string | number) => {
		modal.confirm({
			title: '系统提示',
			content: '是否确认删除该生产?',
			onOk() {
				deleteProduction(id).then(() => {
					message.success('删除成功');
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的生产');
			return;
		}
		modal.confirm({
			title: '系统提示',
			content: `是否确认删除选中的 ${selectKeys.length} 项数据?`,
			onOk() {
				deleteProduction(selectKeys.join(',')).then(() => {
					message.success('删除成功');
					setSelectKeys([]);
					getData();
				});
			}
		});
	};

	const updateMaterialItem = (
		index: number,
		key: keyof MaterialItem,
		value: string | number
	) => {
		setMaterialList((prev) =>
			prev.map((item, i) => (i === index ? { ...item, [key]: value } : item))
		);
	};

	const addMaterialItem = () => {
		setMaterialList((prev) => [...prev, { materialName: '', quantity: '' }]);
	};

	const removeMaterialItem = (index: number) => {
		setMaterialList((prev) => prev.filter((_, i) => i !== index));
	};

	useEffect(() => {
		getData();
	}, []);

	const columns: TableColumnsType<AnyObject> = [
		{ title: '编号', dataIndex: 'id', width: 70 },
		{ title: '名称', dataIndex: 'name' },
		{
			title: '工匠',
			dataIndex: 'profession',
			width: 90,
			render: (value) => <Tag color='blue'>{value}</Tag>
		},
		{ title: '类型', dataIndex: 'itemType', width: 90 },
		{ title: '等级要求', dataIndex: 'levelReq', width: 90 },
		{ title: '使用要求', dataIndex: 'useReq', render: (v) => renderContent(v) },
		{ title: '效果', dataIndex: 'effect', render: (v) => renderContent(v) },
		{ title: '产地', dataIndex: 'source', width: 120, render: (v) => renderContent(v) },
		{
			title: '材料',
			dataIndex: 'materials',
			width: 200,
			render: (_v, row) => {
				const materials = Array.isArray(row.materials) ? row.materials : [];
				if (!materials.length) return '--';
				const text = materials
					.map((m: AnyObject) => `${m.materialName}×${m.quantity ?? 1}`)
					.join('、');
				return renderContent(text);
			}
		},
		{
			title: '操作',
			dataIndex: 'action',
			width: 120,
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
					<Form.Item name='name' label='名称'>
						<Input placeholder='请输入名称' allowClear />
					</Form.Item>
					<Form.Item name='profession' label='工匠'>
						<Select
							placeholder='请选择工匠'
							allowClear
							style={{ width: 140 }}
							options={PROFESSION_OPTIONS}
						/>
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
				scroll={{ x: 1200 }}
			/>
			<Modal
				title={editId ? '编辑生产' : '新增生产'}
				open={isOpen}
				onOk={onSave}
				onCancel={onCancel}
				width={760}
				destroyOnHidden
				forceRender
				styles={{
					body: { maxHeight: '70vh', overflowY: 'auto', overflowX: 'hidden' }
				}}
			>
				<Form form={form} labelCol={{ flex: '0 0 100px' }} onFinish={onFinish}>
					<Row gutter={16}>
						<Col span={12}>
							<Form.Item
								name='name'
								label='名称'
								rules={[{ required: true, message: '请输入名称' }]}
							>
								<Input placeholder='请输入名称' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item
								name='profession'
								label='工匠'
								rules={[{ required: true, message: '请选择工匠' }]}
							>
								<Select placeholder='请选择工匠' options={PROFESSION_OPTIONS} />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='itemType' label='类型'>
								<Input placeholder='请输入类型' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='levelReq' label='等级要求'>
								<Input placeholder='请输入等级要求' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='useReq' label='使用要求'>
								<Input placeholder='请输入使用要求' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='source' label='产地'>
								<Input placeholder='请输入产地' />
							</Form.Item>
						</Col>
						<Col span={24}>
							<Form.Item name='effect' label='效果'>
								<Input.TextArea rows={3} placeholder='请输入效果' />
							</Form.Item>
						</Col>
						<Col span={24}>
							<Form.Item name='rawText' label='原始文本'>
								<Input.TextArea rows={3} placeholder='请输入原始文本' />
							</Form.Item>
						</Col>
					</Row>
					<Divider plain>材料</Divider>
					<Form.Item label='材料列表'>
						<div>
							{materialList.map((item, index) => (
								<Row key={index} gutter={[15, 15]} align='middle' className='mb-3'>
									<Col span={13}>
										<Input
											placeholder='材料名称'
											value={item.materialName}
											onChange={(e) =>
												updateMaterialItem(index, 'materialName', e.target.value)
											}
										/>
									</Col>
									<Col span={9}>
										<Input
											placeholder='数量'
											value={item.quantity}
											onChange={(e) =>
												updateMaterialItem(index, 'quantity', e.target.value)
											}
										/>
									</Col>
									<Col span={2}>
										<Button
											type='text'
											danger
											icon={<MinusCircleOutlined />}
											onClick={() => removeMaterialItem(index)}
										/>
									</Col>
								</Row>
							))}
							<Button
								type='dashed'
								block
								icon={<PlusOutlined />}
								onClick={addMaterialItem}
								style={{ marginTop: 4 }}
							>
								添加材料
							</Button>
						</div>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};
