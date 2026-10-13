import xe from 'xe-utils';
import { useEffect, useMemo, useRef, useState } from 'react';
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
	Space,
	Table,
	Tag,
	Tree,
	TreeSelect
} from 'antd';
import type { TableColumnsType } from 'antd';
import {
	addTask,
	deleteTask,
	getTaskById,
	getTaskCategoryList,
	getTaskTree,
	updateTask
} from '@/service';
import { useTable } from '@/core';

export const Component = () => {
	const { message, modal } = App.useApp();
	const [searchForm] = Form.useForm();
	const [form] = Form.useForm();
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKeys, setSelectKeys] = useState<(string | number)[]>([]);
	const [parentTree, setParentTree] = useState<AnyObject[]>([]);
	const [nameMap, setNameMap] = useState<CObject>({});
	const [categories, setCategories] = useState<AnyObject[]>([]);
	const selectKeyRef = useRef('');
	const { tableProps, getData } = useTable('/game/wm/task/list', () => searchForm.getFieldsValue());
	const categoryMap: CObject = categories.reduce((acc: CObject, c) => {
		acc[c.id] = c.name;
		return acc;
	}, {});
	const categorySelectTree = useMemo<AnyObject[]>(
		() => categories.map((c) => ({ id: c.id, label: c.name })),
		[categories]
	);
	const categoryTree = useMemo<AnyObject[]>(
		() => [
			{ id: 0, label: '全部任务' },
			...categories.map((c) => ({ id: c.id, label: `[${c.type}]${c.name}` }))
		],
		[categories]
	);

	const loadData = (params: AnyObject = {}) => {
		getData({
			...params,
			categoryId: selectKeyRef.current
				? Number(selectKeyRef.current)
				: undefined
		});
	};

	const getCategoryData = () => {
		getTaskCategoryList().then((result) => {
			setCategories(result.data ?? []);
		});
	};

	const onSelectedChange = (key: string) => {
		selectKeyRef.current = key !== '0' ? key : '';
		loadData();
	};

	const getParentData = () => {
		getTaskTree().then((result) => {
			const list: AnyObject[] = result.data ?? [];
			setNameMap(
				list.reduce((acc: CObject, item) => {
					acc[item.id] = item.name;
					return acc;
				}, {})
			);
			const tree = xe.toArrayTree(
				list.map((item) => ({
					id: item.id,
					label: item.name,
					parentId: item.parentId ?? 0
				}))
			);
			setParentTree(tree);
		});
	};

	const onSearch = (values: AnyObject) => {
		loadData({
			name: values.name || undefined,
			level: values.level === '' ? undefined : values.level
		});
	};

	const onReset = () => {
		searchForm.resetFields();
		loadData();
	};

	const onFinish = (values: AnyObject) => {
		const toNumber = (v: string) => (v === '' ? null : Number(v));
		const params = {
			...values,
			parentId: values.parentId || null,
			categoryId: toNumber(values.categoryId),
			level: toNumber(values.level),
			goldCoin: toNumber(values.goldCoin),
			exp: toNumber(values.exp),
			spirit: toNumber(values.spirit),
			prestige: toNumber(values.prestige),
			isAudit: 1
		};
		if (editId) {
			updateTask({ ...params, id: editId }).then(() => {
				message.success('修改成功');
				onCancel();
				loadData();
				getParentData();
			});
		} else {
			addTask({ ...params, isShelf: 1 }).then(() => {
				message.success('新增成功');
				onCancel();
				loadData();
				getParentData();
			});
		}
	};

	const onEdit = (id?: string | number) => {
		if (id) {
			setEditId(id);
			getTaskById(id).then((result) => {
				const record = result.data;
				form.resetFields();
				form.setFieldsValue({
					name: record.name ?? '',
					categoryId:
						record.categoryId != null ? String(record.categoryId) : '',
					parentId: record.parentId != null ? record.parentId : '',
					level: record.level != null ? String(record.level) : '',
					npcClaim: record.npcClaim ?? '',
					npcComplete: record.npcComplete ?? '',
					content: record.content ?? '',
					goldCoin: record.goldCoin != null ? String(record.goldCoin) : '',
					exp: record.exp != null ? String(record.exp) : '',
					spirit: record.spirit != null ? String(record.spirit) : '',
					prestige: record.prestige != null ? String(record.prestige) : '',
					reward: record.reward ?? '',
					remark: record.remark ?? ''
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
			content: '是否确认删除该任务?',
			onOk() {
				deleteTask(id).then(() => {
					message.success('删除成功');
					loadData();
					getParentData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的任务');
			return;
		}
		modal.confirm({
			title: '系统提示',
			content: `是否确认删除选中的 ${selectKeys.length} 项数据?`,
			onOk() {
				deleteTask(selectKeys.join(',')).then(() => {
					message.success('删除成功');
					setSelectKeys([]);
					loadData();
					getParentData();
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
				updateTask({ ...row, isAudit: 1 }).then(() => {
					message.success('已通过审核');
					loadData();
				});
			},
			onCancel() {
				updateTask({ ...row, isAudit: 2 }).then(() => {
					message.success('已拒绝');
					loadData();
				});
			}
		});
	};

	const onShelf = (row: AnyObject) => {
		const next = row.isShelf == 1 ? 0 : 1;
		updateTask({ ...row, isShelf: next }).then(() => {
			message.success(next == 1 ? '已上架' : '已下架');
			loadData();
		});
	};

	useEffect(() => {
		loadData();
		getParentData();
		getCategoryData();
	}, []);

	const columns: TableColumnsType<AnyObject> = [
		{ title: '编号', dataIndex: 'id', width: 70 },
		{ title: '任务名称', dataIndex: 'name', width: 160 },
		{
			title: '分类',
			dataIndex: 'categoryId',
			width: 180,
			render: (value) => (value ? (categoryMap[value] ?? '--') : '--')
		},
		{
			title: '前置任务',
			dataIndex: 'parentId',
			width: 160,
			render: (value) => (value ? (nameMap[value] ?? value) : '--')
		},
		{ title: '接取等级', dataIndex: 'level', width: 90 },
		{ title: '区域', dataIndex: 'area', width: 90 },
		{ title: '领取NPC', dataIndex: 'npcClaim', width: 150 },
		{ title: '完成NPC', dataIndex: 'npcComplete', width: 150 },
		{ title: '任务内容', dataIndex: 'content', width: 220 },
		{ title: '子任务', dataIndex: 'subTask', width: 120 },
		{ title: '概要', dataIndex: 'summary', width: 120 },
		{ title: '击杀怪物', dataIndex: 'killMonster', width: 130 },
		{ title: '怪物位置', dataIndex: 'monsterLocation', width: 150 },
		{ title: '金币', dataIndex: 'goldCoin', width: 90 },
		{ title: '经验', dataIndex: 'exp', width: 110 },
		{ title: '元神', dataIndex: 'spirit', width: 90 },
		{ title: '声望', dataIndex: 'prestige', width: 90 },
		{ title: 'SP', dataIndex: 'sp', width: 110 },
		{ title: '奖励', dataIndex: 'reward', width: 150 },
		{ title: '子来源', dataIndex: 'subSource', width: 90 },
		{
			title: '审核状态',
			dataIndex: 'isAudit',
			width: 110,
			render: (value) => {
				if (value == 2) return <Tag color='error'>已拒绝</Tag>;
				return value == 1 ? <Tag color='success'>已通过</Tag> : <Tag color='warning'>待审核</Tag>;
			}
		},
		{
			title: '是否上架',
			dataIndex: 'isShelf',
			width: 110,
			render: (value) => (value == 1 ? <Tag color='success'>已上架</Tag> : <Tag color='default'>已下架</Tag>)
		},
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
		<div className='flex'>
			<div className='w-3xs p-4 flex flex-col gap-4'>
				<div className='flex-1 overflow-y-auto'>
					<Tree
						treeData={categoryTree.map((item) => ({
							key: String(item.id),
							title: item.label
						}))}
						onSelect={(keys) => {
							if (keys.length) onSelectedChange(String(keys[0]));
						}}
					/>
				</div>
			</div>
			<div className='flex-1 p-4 flex flex-col gap-4'>
				<div className='flex items-center justify-between'>
					<Form form={searchForm} layout='inline' onFinish={onSearch}>
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
			</div>
			<Modal
				title={editId ? '编辑任务' : '新增任务'}
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
						categoryId: '',
						parentId: '',
						level: '',
						npcClaim: '',
						npcComplete: '',
						content: '',
						goldCoin: '',
						exp: '',
						spirit: '',
						prestige: '',
						reward: '',
						remark: ''
					}}
				>
					<Form.Item
						name='name'
						label='任务名称'
						rules={[{ required: true, message: '请输入任务名称' }]}
					>
						<Input placeholder='请输入任务名称' />
					</Form.Item>
					<Form.Item name='categoryId' label='分类'>
						<TreeSelect
							placeholder='请选择分类'
							treeData={categorySelectTree}
							fieldNames={{ label: 'label', value: 'id', children: 'children' }}
						/>
					</Form.Item>
					<Form.Item name='parentId' label='前置任务'>
						<TreeSelect
							placeholder='请选择前置任务'
							treeData={parentTree}
							fieldNames={{ label: 'label', value: 'id', children: 'children' }}
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
					<Form.Item name='content' label='任务内容'>
						<Input.TextArea rows={3} placeholder='请输入任务内容' />
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
					<Form.Item name='remark' label='备注'>
						<Input.TextArea placeholder='请输入备注' />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};
