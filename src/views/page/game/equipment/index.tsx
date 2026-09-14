import { Key, useCallback, useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Popconfirm, Select, Space, Table } from 'antd';
import { message } from '@/redux';
import type { TableProps } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { FORM_LAYOUT } from '@/core';
import { addEquipment, deleteEquipment, getEquipmentById, getEquipmentList, updateEquipment } from '@/service';

const GROUP_OPTIONS = [
	{ label: '神月谷', value: '神月谷' },
	{ label: '99（天狱套装）', value: '99（天狱套装）' },
	{ label: '黄昏圣殿 · 90', value: '黄昏圣殿 · 90' },
	{ label: '黄昏圣殿 · 100', value: '黄昏圣殿 · 100' },
	{ label: '覆霜城', value: '覆霜城' },
	{ label: '职业装', value: '职业装' }
];

const toNumberOrNull = (value: any) => (value === '' || value == null ? null : Number(value));

const Equipment = () => {
	const [visible, setVisible] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
	const [dataSource, setDataSource] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [pageNum, setPageNum] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [total, setTotal] = useState(0);
	const [searchForm] = Form.useForm();
	const [form] = Form.useForm();

	const getData = useCallback(
		(params: object = {}) => {
			setLoading(true);
			getEquipmentList({ pageNum, pageSize, ...params }).then((result) => {
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

	const onSearch = (values: any) => {
		getData({
			groupName: values.groupName || undefined,
			slot: values.slot || undefined,
			name: values.name || undefined
		});
	};

	const onReset = () => {
		searchForm.resetFields();
		getData();
	};

	const onEdit = (id?: string | number) => {
		if (id) {
			setEditId(id);
			getEquipmentById(id).then((result) => {
				const record = result.data;
				form.setFieldsValue({
					...record,
					holes: record.holes != null ? String(record.holes) : '',
					grade: record.grade != null ? String(record.grade) : '',
					level: record.level != null ? String(record.level) : '',
					price: record.price != null ? String(record.price) : '',
					setCount: record.setCount != null ? String(record.setCount) : ''
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
			const params = {
				...values,
				holes: toNumberOrNull(values.holes),
				grade: toNumberOrNull(values.grade),
				level: toNumberOrNull(values.level),
				price: toNumberOrNull(values.price),
				setCount: toNumberOrNull(values.setCount)
			};
			if (editId) {
				updateEquipment({ ...params, id: editId }).then(() => {
					message.success('修改成功');
					onCancel();
					getData();
				});
			} else {
				addEquipment(params).then(() => {
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
		deleteEquipment(id).then(() => {
			message.success('删除成功');
			getData();
		});
	};

	const onBatchDelete = () => {
		if (selectedRowKeys.length === 0) {
			message.warning('请选择要删除的装备');
			return;
		}
		deleteEquipment(selectedRowKeys.join(',')).then(() => {
			message.success('删除成功');
			setSelectedRowKeys([]);
			getData();
		});
	};

	const columns: TableProps<any>['columns'] = [
		{ title: '编号', dataIndex: 'id' },
		{ title: '分组', dataIndex: 'groupName' },
		{ title: '装备名称', dataIndex: 'name' },
		{ title: '孔数', dataIndex: 'holes' },
		{ title: '部位', dataIndex: 'slot' },
		{ title: '品阶', dataIndex: 'grade' },
		{ title: '等级', dataIndex: 'level' },
		{ title: '耐久', dataIndex: 'durability' },
		{ title: '价格', dataIndex: 'price' },
		{ title: '职业限制', dataIndex: 'className' },
		{ title: '套装名称', dataIndex: 'setName' },
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
					<Form.Item name='groupName' label='分组'>
						<Select placeholder='请选择分组' options={GROUP_OPTIONS} allowClear style={{ width: 160 }} />
					</Form.Item>
					<Form.Item name='slot' label='部位'>
						<Input placeholder='请输入装备部位' />
					</Form.Item>
					<Form.Item name='name' label='装备名称'>
						<Input placeholder='请输入装备名称' />
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
				scroll={{ x: 1200, y: '100%' }}
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
				title={editId ? '编辑装备' : '新增装备'}
				width={640}
				open={visible}
				onOk={onSave}
				onCancel={onCancel}
			>
				<Form {...FORM_LAYOUT} form={form}>
					<Form.Item name='groupName' label='分组' rules={[{ required: true, message: '请选择分组' }]}>
						<Select placeholder='请选择分组' options={GROUP_OPTIONS} />
					</Form.Item>
					<Form.Item
						name='name'
						label='装备名称'
						rules={[{ required: true, message: '请输入装备名称' }]}
					>
						<Input placeholder='请输入装备名称' />
					</Form.Item>
					<Form.Item name='holes' label='孔数'>
						<Input placeholder='请输入孔数' />
					</Form.Item>
					<Form.Item name='slot' label='部位'>
						<Input placeholder='请输入装备部位' />
					</Form.Item>
					<Form.Item name='grade' label='品阶'>
						<Input placeholder='请输入品阶' />
					</Form.Item>
					<Form.Item name='level' label='等级'>
						<Input placeholder='请输入装备等级' />
					</Form.Item>
					<Form.Item name='durability' label='耐久'>
						<Input placeholder='请输入耐久' />
					</Form.Item>
					<Form.Item name='price' label='价格'>
						<Input placeholder='请输入价格' />
					</Form.Item>
					<Form.Item name='className' label='职业限制'>
						<Input placeholder='请输入职业限制' />
					</Form.Item>
					<Form.Item name='ammo' label='弹药'>
						<Input placeholder='请输入弹药' />
					</Form.Item>
					<Form.Item name='setName' label='套装名称'>
						<Input placeholder='请输入套装名称' />
					</Form.Item>
					<Form.Item name='setCount' label='套装件数'>
						<Input placeholder='请输入套装件数' />
					</Form.Item>
					<Form.Item name='requirements' label='需求'>
						<Input.TextArea rows={3} placeholder='JSON 格式，如 {"力量":55}' />
					</Form.Item>
					<Form.Item name='attributes' label='属性'>
						<Input.TextArea rows={3} placeholder='JSON 格式，如 [{"k":"物理防御","v":"+158"}]' />
					</Form.Item>
					<Form.Item name='bonuses' label='加成'>
						<Input.TextArea rows={3} placeholder='JSON 格式，如 [{"k":"走跑速度","v":"+0.30"}]' />
					</Form.Item>
					<Form.Item name='setBonuses' label='套装加成'>
						<Input.TextArea rows={3} placeholder='JSON 格式，如 ["(2) 体质+10"]' />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export const Component = Equipment;
