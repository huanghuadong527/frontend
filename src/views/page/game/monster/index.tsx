import { useEffect, useState } from 'react';
import {
	ArrowDownOutlined,
	ArrowUpOutlined,
	CheckOutlined,
	DeleteOutlined,
	EditOutlined,
	MinusCircleOutlined,
	PlusOutlined,
	SearchOutlined
} from '@ant-design/icons';
import {
	App,
	Button,
	Divider,
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

const CATEGORY_OPTIONS = [
	{ value: '技能书', label: '技能书' },
	{ value: '野怪', label: '野怪' },
	{ value: '黄金', label: '黄金' }
];

const ZONE_OPTIONS = [
	'仙界炼狱',
	'封神',
	'神月谷',
	'覆霜',
	'魔域桃源',
	'1-40',
	'41-50',
	'51-60',
	'61-70',
	'71-80',
	'81-90',
	'91-100',
	'仙魔界',
	'仙幻天',
	'天界炼狱99',
	'神月',
	'魔域桃花99',
	'魔幻天'
].map((value) => ({ value, label: value }));

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

type DropItem = {
	itemName?: string;
	sort?: number;
};

const getOptionLabel = (options: typeof METHOD_OPTIONS, value: unknown) =>
	options.find((item) => item.value == value)?.label ?? '--';

const getCategoryTag = (value: unknown) => {
	if (value === '技能书') return <Tag color='gold'>技能书</Tag>;
	if (value === '野怪') return <Tag color='green'>野怪</Tag>;
	if (value === '黄金') return <Tag color='orange'>黄金</Tag>;
	return value ? <Tag>{String(value)}</Tag> : '--';
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
	const [dropItems, setDropItems] = useState<DropItem[]>([]);

	const { tableProps, getData } = useTable('/game/wm/monster/list', () =>
		searchForm.getFieldsValue()
	);

	const onSearch = (values: AnyObject) => {
		getData({
			name: values.name || undefined,
			category: values.category || undefined,
			zone: values.zone || undefined,
			location: values.location || undefined
		});
	};

	const onReset = () => {
		searchForm.resetFields();
		getData();
	};

	const onFinish = (values: AnyObject) => {
		const params = {
			name: values.name,
			category: values.category || undefined,
			zone: values.zone || undefined,
			location: values.location || undefined,
			level: toNumber(values.level),
			method: values.method === '' || values.method == null ? undefined : Number(values.method),
			attribute:
				values.attribute === '' || values.attribute == null
					? undefined
					: Number(values.attribute),
			rawText: values.rawText || undefined,
			isAudit: 1,
			dropItems: dropItems
				.filter((d) => d.itemName && d.itemName.trim())
				.map((d, idx) => ({ itemName: d.itemName!.trim(), sort: idx + 1 }))
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
					category: record.category ?? undefined,
					zone: record.zone ?? '',
					location: record.location ?? '',
					level: record.level != null ? String(record.level) : '',
					method: record.method != null ? String(record.method) : '',
					attribute: record.attribute != null ? String(record.attribute) : '',
					rawText: record.rawText ?? ''
				});
				setDropItems(
					(record.dropItems ?? []).map((d: AnyObject) => ({
						itemName: d.itemName ?? '',
						sort: d.sort
					}))
				);
				setIsOpen(true);
			});
		} else {
			setEditId('');
			form.resetFields();
			setDropItems([]);
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
		setDropItems([]);
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

	const updateDropItem = (index: number, value: string) => {
		setDropItems((prev) =>
			prev.map((item, i) => (i === index ? { ...item, itemName: value } : item))
		);
	};

	const addDropItem = () => {
		setDropItems((prev) => [...prev, { itemName: '' }]);
	};

	const removeDropItem = (index: number) => {
		setDropItems((prev) => prev.filter((_, i) => i !== index));
	};

	useEffect(() => {
		getData();
	}, []);

	const columns: TableColumnsType<AnyObject> = [
		{ title: '编号', dataIndex: 'id', width: 70 },
		{ title: '怪物名称', dataIndex: 'name' },
		{
			title: '分类',
			dataIndex: 'category',
			width: 90,
			render: (value) => getCategoryTag(value)
		},
		{ title: '区域', dataIndex: 'zone', width: 110 },
		{ title: '出现地点', dataIndex: 'location', width: 110 },
		{ title: '等级', dataIndex: 'level', width: 70 },
		{
			title: '攻击方式',
			dataIndex: 'method',
			width: 100,
			render: (value) => getOptionLabel(METHOD_OPTIONS, value)
		},
		{
			title: '属性',
			dataIndex: 'attribute',
			width: 90,
			render: (value) => getOptionLabel(ATTRIBUTE_OPTIONS, value)
		},
		{
			title: '掉落物品',
			dataIndex: 'dropItems',
			width: 220,
			render: (_v, row) => {
				const items = Array.isArray(row.dropItems) ? row.dropItems : [];
				if (!items.length) return '--';
				const shown = items.slice(0, 5).map((d: AnyObject) => d.itemName ?? '');
				const rest = items.length - shown.length;
				return (
					<>
						{shown.map((name: string) => (
							<Tag key={name} style={{ marginBottom: 2 }}>
								{name}
							</Tag>
						))}
						{rest > 0 && <Tag>+{rest}</Tag>}
					</>
				);
			}
		},
		{
			title: '审核状态',
			dataIndex: 'isAudit',
			width: 90,
			render: (value) => {
				if (value == 2) return <Tag color='error'>已拒绝</Tag>;
				return value == 1 ? <Tag color='success'>已通过</Tag> : <Tag color='warning'>待审核</Tag>;
			}
		},
		{
			title: '是否上架',
			dataIndex: 'isShelf',
			width: 90,
			render: (value) => (value == 1 ? <Tag color='success'>已上架</Tag> : <Tag color='default'>已下架</Tag>)
		},
		{ title: '创建时间', dataIndex: 'createTime', width: 170 },
		{
			title: '操作',
			dataIndex: 'action',
			width: 220,
			fixed: 'right',
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
						<Input placeholder='请输入怪物名称' allowClear />
					</Form.Item>
					<Form.Item name='category' label='分类'>
						<Select
							placeholder='请选择分类'
							allowClear
							style={{ width: 120 }}
							options={CATEGORY_OPTIONS}
						/>
					</Form.Item>
					<Form.Item name='zone' label='区域'>
						<Select
							placeholder='请选择区域'
							allowClear
							showSearch
							style={{ width: 150 }}
							options={ZONE_OPTIONS}
						/>
					</Form.Item>
					<Form.Item name='location' label='出现地点'>
						<Input placeholder='请输入出现地点' allowClear />
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
				scroll={{ x: 1500 }}
			/>
			<Modal
				title={editId ? '编辑怪物' : '新增怪物'}
				open={isOpen}
				onOk={onSave}
				onCancel={onCancel}
				width={720}
				destroyOnHidden
				forceRender
				styles={{
					body: { maxHeight: '70vh', overflowY: 'auto', overflowX: 'hidden' }
				}}
			>
				<Form
					form={form}
					labelCol={{ flex: '0 0 100px' }}
					onFinish={onFinish}
					initialValues={{
						name: '',
						category: undefined,
						zone: '',
						location: '',
						level: '',
						method: '',
						attribute: '',
						rawText: ''
					}}
				>
					<Divider titlePlacement='left' plain>
						基本信息
					</Divider>
					<Form.Item
						name='name'
						label='怪物名称'
						rules={[{ required: true, message: '请输入怪物名称' }]}
					>
						<Input placeholder='请输入怪物名称' />
					</Form.Item>
					<Form.Item name='category' label='分类'>
						<Select placeholder='请选择分类' allowClear options={CATEGORY_OPTIONS} />
					</Form.Item>
					<Form.Item name='zone' label='区域'>
						<Input placeholder='请输入区域/等级段' />
					</Form.Item>
					<Form.Item name='location' label='出现地点'>
						<Input placeholder='请输入出现地点' />
					</Form.Item>
					<Form.Item name='level' label='怪物等级'>
						<Input placeholder='请输入怪物等级' />
					</Form.Item>
					<Form.Item name='method' label='攻击方式'>
						<Select
							placeholder='请选择攻击方式'
							allowClear
							options={METHOD_OPTIONS.map((item) => ({
								value: String(item.value),
								label: item.label
							}))}
						/>
					</Form.Item>
					<Form.Item name='attribute' label='怪物属性'>
						<Select
							placeholder='请选择怪物属性'
							allowClear
							options={ATTRIBUTE_OPTIONS.map((item) => ({
								value: String(item.value),
								label: item.label
							}))}
						/>
					</Form.Item>
					<Form.Item name='rawText' label='原始文本'>
						<Input.TextArea rows={3} placeholder='请输入原始文本' />
					</Form.Item>

					<Divider titlePlacement='left' plain>
						掉落物品
					</Divider>
					<Form.Item label='掉落物品列表'>
						<div>
							{dropItems.map((item, index) => (
								<Space
									key={index}
									align='baseline'
									style={{ display: 'flex', marginBottom: 8 }}
								>
									<Input
										placeholder='物品名称'
										value={item.itemName}
										style={{ width: 420 }}
										onChange={(e) => updateDropItem(index, e.target.value)}
									/>
									<Button
										type='text'
										danger
										icon={<MinusCircleOutlined />}
										onClick={() => removeDropItem(index)}
									/>
								</Space>
							))}
							<Button type='dashed' block icon={<PlusOutlined />} onClick={addDropItem}>
								添加掉落物品
							</Button>
						</div>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};
