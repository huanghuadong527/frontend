import { Key, useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Popconfirm, Space, Table, TreeSelect } from 'antd';
import { message } from '@/redux';
import type { TableProps } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { toArrayTree } from 'xe-utils';
import { FORM_LAYOUT } from '@/core';
import { addTask, deleteTask, getTaskById, getTaskList, getTaskTree, updateTask } from '@/service';

const toNumberOrNull = (value: any) => (value === '' || value == null ? null : Number(value));

const Task = () => {
	const [visible, setVisible] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
	const [rows, setRows] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [parentTree, setParentTree] = useState<any[]>([]);
	const [nameMap, setNameMap] = useState<Record<string, string>>({});
	const [searchForm] = Form.useForm();
	const [form] = Form.useForm();

	const getData = (params: object = {}) => {
		setLoading(true);
		getTaskList(params).then((result) => {
			setLoading(false);
			const list: any[] = result.data ?? [];
			setRows(list);
			setNameMap(
				list.reduce((acc: Record<string, string>, item) => {
					acc[item.id] = item.name;
					return acc;
				}, {})
			);
		});
	};

	const getParentData = () => {
		getTaskTree().then((result) => {
			const list: any[] = result.data ?? [];
			setParentTree(
				toArrayTree(
					list.map((item) => ({
						id: item.id,
						label: item.name,
						parentId: item.parentId ?? 0
					}))
				)
			);
		});
	};

	useEffect(() => {
		getData();
		getParentData();
	}, []);

	const onSearch = (values: any) => {
		getData({
			name: values.name || undefined,
			level: values.level === '' || values.level == null ? undefined : values.level
		});
	};

	const onReset = () => {
		searchForm.resetFields();
		getData();
	};

	const onEdit = (id?: string | number) => {
		if (id) {
			setEditId(id);
			getTaskById(id).then((result) => {
				const record = result.data;
				form.setFieldsValue({
					...record,
					level: record.level != null ? String(record.level) : '',
					goldCoin: record.goldCoin != null ? String(record.goldCoin) : '',
					exp: record.exp != null ? String(record.exp) : '',
					spirit: record.spirit != null ? String(record.spirit) : '',
					prestige: record.prestige != null ? String(record.prestige) : ''
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
				parentId: values.parentId || null,
				level: toNumberOrNull(values.level),
				goldCoin: toNumberOrNull(values.goldCoin),
				exp: toNumberOrNull(values.exp),
				spirit: toNumberOrNull(values.spirit),
				prestige: toNumberOrNull(values.prestige)
			};
			if (editId) {
				updateTask({ ...params, id: editId }).then(() => {
					message.success('修改成功');
					onCancel();
					getData();
					getParentData();
				});
			} else {
				addTask(params).then(() => {
					message.success('新增成功');
					onCancel();
					getData();
					getParentData();
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
		deleteTask(id).then(() => {
			message.success('删除成功');
			getData();
			getParentData();
		});
	};

	const onBatchDelete = () => {
		if (selectedRowKeys.length === 0) {
			message.warning('请选择要删除的任务');
			return;
		}
		deleteTask(selectedRowKeys.join(',')).then(() => {
			message.success('删除成功');
			setSelectedRowKeys([]);
			getData();
			getParentData();
		});
	};

	const columns: TableProps<any>['columns'] = [
		{ title: '编号', dataIndex: 'id' },
		{ title: '任务名称', dataIndex: 'name' },
		{
			title: '前置任务',
			dataIndex: 'parentId',
			render: (value) => (value ? nameMap[value] ?? value : '--')
		},
		{ title: '接取等级', dataIndex: 'level' },
		{ title: '领取NPC', dataIndex: 'npcClaim' },
		{ title: '完成NPC', dataIndex: 'npcComplete' },
		{ title: '金币', dataIndex: 'goldCoin' },
		{ title: '经验', dataIndex: 'exp' },
		{ title: '元神', dataIndex: 'spirit' },
		{ title: '声望', dataIndex: 'prestige' },
		{ title: '奖励', dataIndex: 'reward' },
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
					<Form.Item name='name' label='任务名称'>
						<Input placeholder='请输入任务名称' />
					</Form.Item>
					<Form.Item name='level' label='接取等级'>
						<Input placeholder='请输入接取等级' />
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
				dataSource={rows}
				columns={columns}
				scroll={{ x: 1200, y: '100%' }}
				pagination={false}
				rowSelection={{ selectedRowKeys, onChange: (keys) => setSelectedRowKeys(keys) }}
			/>
			<Modal title={editId ? '编辑任务' : '新增任务'} open={visible} onOk={onSave} onCancel={onCancel}>
				<Form {...FORM_LAYOUT} form={form}>
					<Form.Item
						name='name'
						label='任务名称'
						rules={[{ required: true, message: '请输入任务名称' }]}
					>
						<Input placeholder='请输入任务名称' />
					</Form.Item>
					<Form.Item name='parentId' label='前置任务'>
						<TreeSelect
							placeholder='请选择前置任务'
							treeData={parentTree}
							fieldNames={{ label: 'label', value: 'id', children: 'children' }}
							allowClear
						/>
					</Form.Item>
					<Form.Item name='level' label='接取等级'>
						<Input placeholder='请输入接取等级' />
					</Form.Item>
					<Form.Item name='npcClaim' label='领取NPC'>
						<Input placeholder='请输入领取NPC' />
					</Form.Item>
					<Form.Item name='npcComplete' label='完成NPC'>
						<Input placeholder='请输入完成NPC' />
					</Form.Item>
					<Form.Item name='goldCoin' label='金币'>
						<Input placeholder='请输入金币' />
					</Form.Item>
					<Form.Item name='exp' label='经验'>
						<Input placeholder='请输入经验' />
					</Form.Item>
					<Form.Item name='spirit' label='元神'>
						<Input placeholder='请输入元神' />
					</Form.Item>
					<Form.Item name='prestige' label='声望'>
						<Input placeholder='请输入声望' />
					</Form.Item>
					<Form.Item name='reward' label='奖励'>
						<Input placeholder='请输入奖励' />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export const Component = Task;
