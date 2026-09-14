import { Key, useCallback, useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Popconfirm, Select, Space, Table } from 'antd';
import { message } from '@/redux';
import type { TableProps } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { FORM_LAYOUT } from '@/core';
import { addMonster, deleteMonster, getMonsterById, getMonsterList, updateMonster } from '@/service';

const METHOD_OPTIONS = [
	{ value: 0, label: '混合攻击' },
	{ value: 1, label: '远程攻击' },
	{ value: 2, label: '物理攻击' },
	{ value: 3, label: '法术攻击' }
];

const ATTRIBUTE_OPTIONS = [
	{ value: 0, label: '无属性' },
	{ value: 1, label: '金' },
	{ value: 2, label: '木' },
	{ value: 3, label: '水' },
	{ value: 4, label: '火' },
	{ value: 5, label: '土' }
];

const getOptionLabel = (options: { value: number; label: string }[], value: unknown) =>
	options.find((item) => item.value == value)?.label ?? '--';

const Monster = () => {
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
			getMonsterList({ pageNum, pageSize, ...params }).then((result) => {
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
			name: values.name || undefined,
			fall: values.fall || undefined
		});
	};

	const onReset = () => {
		searchForm.resetFields();
		getData();
	};

	const onEdit = (id?: string | number) => {
		if (id) {
			setEditId(id);
			getMonsterById(id).then((result) => {
				const record = result.data;
				form.setFieldsValue({
					...record,
					level: record.level != null ? String(record.level) : '',
					method: record.method != null ? String(record.method) : '',
					attribute: record.attribute != null ? String(record.attribute) : ''
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
				level: values.level === '' || values.level == null ? null : Number(values.level),
				method: values.method === '' || values.method == null ? null : Number(values.method),
				attribute:
					values.attribute === '' || values.attribute == null ? null : Number(values.attribute)
			};
			if (editId) {
				updateMonster({ ...params, id: editId }).then(() => {
					message.success('修改成功');
					onCancel();
					getData();
				});
			} else {
				addMonster(params).then(() => {
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
		deleteMonster(id).then(() => {
			message.success('删除成功');
			getData();
		});
	};

	const onBatchDelete = () => {
		if (selectedRowKeys.length === 0) {
			message.warning('请选择要删除的怪物');
			return;
		}
		deleteMonster(selectedRowKeys.join(',')).then(() => {
			message.success('删除成功');
			setSelectedRowKeys([]);
			getData();
		});
	};

	const columns: TableProps<any>['columns'] = [
		{ title: '编号', dataIndex: 'id' },
		{ title: '怪物名称', dataIndex: 'name' },
		{ title: '等级', dataIndex: 'level' },
		{ title: '攻击方式', dataIndex: 'method', render: (value) => getOptionLabel(METHOD_OPTIONS, value) },
		{ title: '属性', dataIndex: 'attribute', render: (value) => getOptionLabel(ATTRIBUTE_OPTIONS, value) },
		{ title: '掉落物品', dataIndex: 'fall' },
		{ title: '创建时间', dataIndex: 'createTime' },
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
					<Form.Item name='name' label='怪物名称'>
						<Input placeholder='请输入怪物名称' />
					</Form.Item>
					<Form.Item name='fall' label='掉落物品'>
						<Input placeholder='请输入掉落物品' />
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
			<Modal title={editId ? '编辑怪物' : '新增怪物'} open={visible} onOk={onSave} onCancel={onCancel}>
				<Form {...FORM_LAYOUT} form={form}>
					<Form.Item
						name='name'
						label='怪物名称'
						rules={[{ required: true, message: '请输入怪物名称' }]}
					>
						<Input placeholder='请输入怪物名称' />
					</Form.Item>
					<Form.Item name='level' label='怪物等级'>
						<Input placeholder='请输入怪物等级' />
					</Form.Item>
					<Form.Item name='method' label='攻击方式'>
						<Select
							placeholder='请选择攻击方式'
							options={METHOD_OPTIONS.map((item) => ({ value: String(item.value), label: item.label }))}
						/>
					</Form.Item>
					<Form.Item name='attribute' label='怪物属性'>
						<Select
							placeholder='请选择怪物属性'
							options={ATTRIBUTE_OPTIONS.map((item) => ({ value: String(item.value), label: item.label }))}
						/>
					</Form.Item>
					<Form.Item name='fall' label='掉落物品'>
						<Input placeholder='请输入掉落物品' />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export const Component = Monster;
