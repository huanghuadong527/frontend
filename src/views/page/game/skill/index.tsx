import { Key, useCallback, useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Popconfirm, Select, Space, Table } from 'antd';
import { message } from '@/redux';
import type { TableProps } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { FORM_LAYOUT } from '@/core';
import { addSkill, deleteSkill, getSkillById, getSkillList, updateSkill } from '@/service';

const PROFESSION_OPTIONS = ['武侠', '法师', '羽芒', '羽灵', '妖兽', '妖精'].map((item) => ({
	label: item,
	value: item
}));

const CATEGORY_OPTIONS = ['普通技能', '仙技能', '魔技能'].map((item) => ({ label: item, value: item }));

const Skill = () => {
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
			getSkillList({ pageNum, pageSize, ...params }).then((result) => {
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
			profession: values.profession || undefined,
			category: values.category || undefined,
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
			getSkillById(id).then((result) => {
				const record = result.data;
				form.setFieldsValue({
					...record,
					maxLevel: record.maxLevel != null ? String(record.maxLevel) : ''
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
				maxLevel: values.maxLevel === '' || values.maxLevel == null ? null : Number(values.maxLevel)
			};
			if (editId) {
				updateSkill({ ...params, id: editId }).then(() => {
					message.success('修改成功');
					onCancel();
					getData();
				});
			} else {
				addSkill(params).then(() => {
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
		deleteSkill(id).then(() => {
			message.success('删除成功');
			getData();
		});
	};

	const onBatchDelete = () => {
		if (selectedRowKeys.length === 0) {
			message.warning('请选择要删除的技能');
			return;
		}
		deleteSkill(selectedRowKeys.join(',')).then(() => {
			message.success('删除成功');
			setSelectedRowKeys([]);
			getData();
		});
	};

	const columns: TableProps<any>['columns'] = [
		{ title: '编号', dataIndex: 'id' },
		{ title: '职业', dataIndex: 'profession' },
		{ title: '技能分类', dataIndex: 'category' },
		{ title: '技能名称', dataIndex: 'name' },
		{ title: '技能类型', dataIndex: 'skillType' },
		{ title: '最高等级', dataIndex: 'maxLevel' },
		{ title: '学习等级', dataIndex: 'learnLevel' },
		{ title: '修真期', dataIndex: 'xiudaoLevel' },
		{ title: '武器限制', dataIndex: 'weapon' },
		{ title: '技能简介', dataIndex: 'brief' },
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
					<Form.Item name='profession' label='职业'>
						<Select placeholder='请选择职业' options={PROFESSION_OPTIONS} allowClear style={{ width: 140 }} />
					</Form.Item>
					<Form.Item name='category' label='技能分类'>
						<Select placeholder='请选择技能分类' options={CATEGORY_OPTIONS} allowClear style={{ width: 140 }} />
					</Form.Item>
					<Form.Item name='name' label='技能名称'>
						<Input placeholder='请输入技能名称' />
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
				scroll={{ x: 1100, y: '100%' }}
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
				title={editId ? '编辑技能' : '新增技能'}
				width={640}
				open={visible}
				onOk={onSave}
				onCancel={onCancel}
			>
				<Form {...FORM_LAYOUT} form={form}>
					<Form.Item name='profession' label='职业' rules={[{ required: true, message: '请选择职业' }]}>
						<Select placeholder='请选择职业' options={PROFESSION_OPTIONS} />
					</Form.Item>
					<Form.Item name='category' label='技能分类' rules={[{ required: true, message: '请选择技能分类' }]}>
						<Select placeholder='请选择技能分类' options={CATEGORY_OPTIONS} />
					</Form.Item>
					<Form.Item
						name='name'
						label='技能名称'
						rules={[{ required: true, message: '请输入技能名称' }]}
					>
						<Input placeholder='请输入技能名称' />
					</Form.Item>
					<Form.Item name='description' label='技能描述'>
						<Input.TextArea rows={6} placeholder='请输入技能描述' />
					</Form.Item>
					<Form.Item name='weapon' label='武器限制'>
						<Input placeholder='请输入武器限制' />
					</Form.Item>
					<Form.Item name='prerequisite' label='前置技能'>
						<Input placeholder='请输入前置技能' />
					</Form.Item>
					<Form.Item name='xiudaoLevel' label='修真期'>
						<Input placeholder='请输入修真期要求' />
					</Form.Item>
					<Form.Item name='skillType' label='技能类型'>
						<Input placeholder='请输入技能类型' />
					</Form.Item>
					<Form.Item name='maxLevel' label='最高等级'>
						<Input placeholder='请输入最高等级' />
					</Form.Item>
					<Form.Item name='learnLevel' label='学习等级'>
						<Input placeholder='请输入学习等级' />
					</Form.Item>
					<Form.Item name='upgradeLevels' label='升级等级'>
						<Input placeholder='请输入升级等级' />
					</Form.Item>
					<Form.Item name='brief' label='技能简介'>
						<Input placeholder='请输入技能简介' />
					</Form.Item>
					<Form.Item name='icon' label='技能图标'>
						<Input placeholder='请输入技能图标' />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export const Component = Skill;
