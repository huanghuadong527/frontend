import { useEffect, useState } from 'react';
import {
	ArrowDownOutlined,
	ArrowUpOutlined,
	CheckOutlined,
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
	Select,
	Space,
	Table,
	Tag
} from 'antd';
import type { TableColumnsType } from 'antd';
import { useTable } from '@/core';
import {
	addMonster,
	deleteMonster,
	getMonsterById,
	updateMonster
} from '@/service';

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

const getOptionLabel = (options: typeof METHOD_OPTIONS, value: unknown) =>
	options.find((item) => item.value == value)?.label ?? '--';

export const Component = () => {
	const { message, modal } = App.useApp();
	const [searchForm] = Form.useForm();
	const [form] = Form.useForm();
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKeys, setSelectKeys] = useState<(string | number)[]>([]);

	const { tableProps, getData } = useTable('/game/wm/monster/list', () => searchForm.getFieldsValue());

	const onSearch = (values: AnyObject) => {
		getData(values);
	};

	const onReset = () => {
		searchForm.resetFields();
		getData();
	};

	const onFinish = (values: AnyObject) => {
		const params = {
			...values,
			level: values.level === '' ? null : Number(values.level),
			method: values.method === '' ? null : Number(values.method),
			attribute: values.attribute === '' ? null : Number(values.attribute),
			isAudit: 1
		};
		if (editId) {
			updateMonster({ ...params, id: editId }).then(() => {
				message.success('修改成功');
				onCancel();
				getData();
			});
		} else {
			addMonster({ ...params, isShelf: 1 }).then(() => {
				message.success('新增成功');
				onCancel();
				getData();
			});
		}
	};

	const onEdit = (id?: string | number) => {
		if (id) {
			setEditId(id);
			getMonsterById(id).then((result) => {
				const record = result.data;
				form.resetFields();
				form.setFieldsValue({
					name: record.name ?? '',
					level: record.level != null ? String(record.level) : '',
					method: record.method != null ? String(record.method) : '',
					attribute: record.attribute != null ? String(record.attribute) : '',
					fall: record.fall ?? ''
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
			content: '是否确认删除该怪物?',
			onOk() {
				deleteMonster(id).then(() => {
					message.success('删除成功');
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的怪物');
			return;
		}
		modal.confirm({
			title: '系统提示',
			content: `是否确认删除选中的 ${selectKeys.length} 项数据?`,
			onOk() {
				deleteMonster(selectKeys.join(',')).then(() => {
					message.success('删除成功');
					setSelectKeys([]);
					getData();
				});
			}
		});
	};

	const onAudit = (row: AnyObject) => {
		modal.confirm({
			title: '审核',
			content: '请选择审核结果',
			okText: '通过',
			cancelText: '拒绝',
			onOk() {
				updateMonster({ ...row, isAudit: 1 }).then(() => {
					message.success('已通过审核');
					getData();
				});
			},
			onCancel() {
				updateMonster({ ...row, isAudit: 2 }).then(() => {
					message.success('已拒绝');
					getData();
				});
			}
		});
	};

	const onShelf = (row: AnyObject) => {
		const next = row.isShelf == 1 ? 0 : 1;
		updateMonster({ ...row, isShelf: next }).then(() => {
			message.success(next == 1 ? '已上架' : '已下架');
			getData();
		});
	};

	useEffect(() => {
		getData();
	}, []);

	const columns: TableColumnsType<AnyObject> = [
		{ title: '编号', dataIndex: 'id' },
		{ title: '怪物名称', dataIndex: 'name' },
		{ title: '等级', dataIndex: 'level' },
		{
			title: '攻击方式',
			dataIndex: 'method',
			render: (value) => getOptionLabel(METHOD_OPTIONS, value)
		},
		{
			title: '属性',
			dataIndex: 'attribute',
			render: (value) => getOptionLabel(ATTRIBUTE_OPTIONS, value)
		},
		{ title: '掉落物品', dataIndex: 'fall' },
		{
			title: '审核状态',
			dataIndex: 'isAudit',
			render: (value) => {
				if (value == 2) return <Tag color='error'>已拒绝</Tag>;
				return value == 1 ? <Tag color='success'>已通过</Tag> : <Tag color='warning'>待审核</Tag>;
			}
		},
		{
			title: '是否上架',
			dataIndex: 'isShelf',
			render: (value) => (value == 1 ? <Tag color='success'>已上架</Tag> : <Tag color='default'>已下架</Tag>)
		},
		{ title: '创建时间', dataIndex: 'createTime' },
		{
			title: '操作',
			dataIndex: 'action',
			width: 220,
			render: (_v, row) => (
				<>
					{row.isAudit == 0 && (
						<Button
							type='link'
							size='small'
							icon={<CheckOutlined />}
							title='审核'
							onClick={() => onAudit(row)}
						/>
					)}
					<Button
						type='link'
						size='small'
						danger={row.isShelf == 1}
						icon={row.isShelf == 1 ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
						title={row.isShelf == 1 ? '下架' : '上架'}
						onClick={() => onShelf(row)}
					/>
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
				title={editId ? '编辑怪物' : '新增怪物'}
				open={isOpen}
				onOk={onSave}
				onCancel={onCancel}
				destroyOnHidden
				forceRender
			>
				<Form
					form={form}
					labelCol={{ flex: '0 0 100px' }}
					onFinish={onFinish}
					initialValues={{
						name: '',
						level: '',
						method: '',
						attribute: '',
						fall: ''
					}}
				>
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
							options={METHOD_OPTIONS.map((item) => ({
								value: String(item.value),
								label: item.label
							}))}
						/>
					</Form.Item>
					<Form.Item name='attribute' label='怪物属性'>
						<Select
							placeholder='请选择怪物属性'
							options={ATTRIBUTE_OPTIONS.map((item) => ({
								value: String(item.value),
								label: item.label
							}))}
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
