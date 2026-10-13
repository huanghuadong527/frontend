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
	addSkill,
	deleteSkill,
	getSkillById,
	updateSkill
} from '@/service';

const PROFESSION_OPTIONS = [
	{ value: '武侠', label: '武侠' },
	{ value: '法师', label: '法师' },
	{ value: '羽芒', label: '羽芒' },
	{ value: '羽灵', label: '羽灵' },
	{ value: '妖兽', label: '妖兽' },
	{ value: '妖精', label: '妖精' }
];

const CATEGORY_OPTIONS = [
	{ value: '普通技能', label: '普通技能' },
	{ value: '仙技能', label: '仙技能' },
	{ value: '魔技能', label: '魔技能' }
];

export const Component = () => {
	const { message, modal } = App.useApp();
	const [searchForm] = Form.useForm();
	const [form] = Form.useForm();
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKeys, setSelectKeys] = useState<(string | number)[]>([]);

	const { tableProps, getData } = useTable('/game/wm/skill/list', () => searchForm.getFieldsValue());

	const onSearch = (values: AnyObject) => {
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

	const onFinish = (values: AnyObject) => {
		const params = {
			...values,
			maxLevel: values.maxLevel === '' ? null : Number(values.maxLevel),
			isAudit: 1
		};
		if (editId) {
			updateSkill({ ...params, id: editId }).then(() => {
				message.success('修改成功');
				onCancel();
				getData();
			});
		} else {
			addSkill({ ...params, isShelf: 1 }).then(() => {
				message.success('新增成功');
				onCancel();
				getData();
			});
		}
	};

	const onEdit = (id?: string | number) => {
		if (id) {
			setEditId(id);
			getSkillById(id).then((result) => {
				const record = result.data;
				form.resetFields();
				form.setFieldsValue({
					profession: record.profession ?? '',
					category: record.category ?? '',
					name: record.name ?? '',
					description: record.description ?? '',
					weapon: record.weapon ?? '',
					prerequisite: record.prerequisite ?? '',
					xiudaoLevel: record.xiudaoLevel ?? '',
					skillType: record.skillType ?? '',
					maxLevel: record.maxLevel != null ? String(record.maxLevel) : '',
					learnLevel: record.learnLevel ?? '',
					upgradeLevels: record.upgradeLevels ?? '',
					brief: record.brief ?? '',
					icon: record.icon ?? ''
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
			content: '是否确认删除该技能?',
			onOk() {
				deleteSkill(id).then(() => {
					message.success('删除成功');
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的技能');
			return;
		}
		modal.confirm({
			title: '系统提示',
			content: `是否确认删除选中的 ${selectKeys.length} 项数据?`,
			onOk() {
				deleteSkill(selectKeys.join(',')).then(() => {
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
				updateSkill({ ...row, isAudit: 1 }).then(() => {
					message.success('已通过审核');
					getData();
				});
			},
			onCancel() {
				updateSkill({ ...row, isAudit: 2 }).then(() => {
					message.success('已拒绝');
					getData();
				});
			}
		});
	};

	const onShelf = (row: AnyObject) => {
		const next = row.isShelf == 1 ? 0 : 1;
		updateSkill({ ...row, isShelf: next }).then(() => {
			message.success(next == 1 ? '已上架' : '已下架');
			getData();
		});
	};

	useEffect(() => {
		getData();
	}, []);

	const columns: TableColumnsType<AnyObject> = [
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
					<Form.Item name='profession' label='职业'>
						<Select
							placeholder='请选择职业'
							options={PROFESSION_OPTIONS.map((item) => ({
								value: item.value,
								label: item.label
							}))}
						/>
					</Form.Item>
					<Form.Item name='category' label='技能分类'>
						<Select
							placeholder='请选择技能分类'
							options={CATEGORY_OPTIONS.map((item) => ({
								value: item.value,
								label: item.label
							}))}
						/>
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
				title={editId ? '编辑技能' : '新增技能'}
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
						profession: '',
						category: '',
						name: '',
						description: '',
						weapon: '',
						prerequisite: '',
						xiudaoLevel: '',
						skillType: '',
						maxLevel: '',
						learnLevel: '',
						upgradeLevels: '',
						brief: '',
						icon: ''
					}}
				>
					<Form.Item required name='profession' label='职业'>
						<Select
							placeholder='请选择职业'
							options={PROFESSION_OPTIONS.map((item) => ({
								value: item.value,
								label: item.label
							}))}
						/>
					</Form.Item>
					<Form.Item required name='category' label='技能分类'>
						<Select
							placeholder='请选择技能分类'
							options={CATEGORY_OPTIONS.map((item) => ({
								value: item.value,
								label: item.label
							}))}
						/>
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
