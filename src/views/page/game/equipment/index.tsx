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
	addEquipment,
	deleteEquipment,
	getEquipmentById,
	updateEquipment
} from '@/service';

const GROUP_OPTIONS = [
	{ value: '神月谷', label: '神月谷' },
	{ value: '99（天狱套装）', label: '99（天狱套装）' },
	{ value: '黄昏圣殿 · 90', label: '黄昏圣殿 · 90' },
	{ value: '黄昏圣殿 · 100', label: '黄昏圣殿 · 100' },
	{ value: '覆霜城', label: '覆霜城' },
	{ value: '职业装', label: '职业装' }
];

export const Component = () => {
	const { message, modal } = App.useApp();
	const [searchForm] = Form.useForm();
	const [form] = Form.useForm();
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKeys, setSelectKeys] = useState<(string | number)[]>([]);

	const { tableProps, getData } = useTable('/game/wm/equipment/list', () => searchForm.getFieldsValue());

	const onSearch = (values: AnyObject) => {
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

	const onFinish = (values: AnyObject) => {
		const params = {
			...values,
			holes: values.holes === '' ? null : Number(values.holes),
			grade: values.grade === '' ? null : Number(values.grade),
			level: values.level === '' ? null : Number(values.level),
			price: values.price === '' ? null : Number(values.price),
			setCount: values.setCount === '' ? null : Number(values.setCount),
			isAudit: 1
		};
		if (editId) {
			updateEquipment({ ...params, id: editId }).then(() => {
				message.success('修改成功');
				onCancel();
				getData();
			});
		} else {
			addEquipment({ ...params, isShelf: 1 }).then(() => {
				message.success('新增成功');
				onCancel();
				getData();
			});
		}
	};

	const onEdit = (id?: string | number) => {
		if (id) {
			setEditId(id);
			getEquipmentById(id).then((result) => {
				const record = result.data;
				form.resetFields();
				form.setFieldsValue({
					groupName: record.groupName ?? '',
					name: record.name ?? '',
					holes: record.holes != null ? String(record.holes) : '',
					slot: record.slot ?? '',
					grade: record.grade != null ? String(record.grade) : '',
					level: record.level != null ? String(record.level) : '',
					durability: record.durability ?? '',
					price: record.price != null ? String(record.price) : '',
					className: record.className ?? '',
					ammo: record.ammo ?? '',
					requirements: record.requirements ?? '',
					attributes: record.attributes ?? '',
					bonuses: record.bonuses ?? '',
					setName: record.setName ?? '',
					setCount: record.setCount != null ? String(record.setCount) : '',
					setBonuses: record.setBonuses ?? ''
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
			content: '是否确认删除该装备?',
			onOk() {
				deleteEquipment(id).then(() => {
					message.success('删除成功');
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的装备');
			return;
		}
		modal.confirm({
			title: '系统提示',
			content: `是否确认删除选中的 ${selectKeys.length} 项数据?`,
			onOk() {
				deleteEquipment(selectKeys.join(',')).then(() => {
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
				updateEquipment({ ...row, isAudit: 1 }).then(() => {
					message.success('已通过审核');
					getData();
				});
			},
			onCancel() {
				updateEquipment({ ...row, isAudit: 2 }).then(() => {
					message.success('已拒绝');
					getData();
				});
			}
		});
	};

	const onShelf = (row: AnyObject) => {
		const next = row.isShelf == 1 ? 0 : 1;
		updateEquipment({ ...row, isShelf: next }).then(() => {
			message.success(next == 1 ? '已上架' : '已下架');
			getData();
		});
	};

	useEffect(() => {
		getData();
	}, []);

	const columns: TableColumnsType<AnyObject> = [
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
					<Form.Item name='groupName' label='分组'>
						<Select
							placeholder='请选择分组'
							options={GROUP_OPTIONS.map((item) => ({
								value: item.value,
								label: item.label
							}))}
						/>
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
				title={editId ? '编辑装备' : '新增装备'}
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
						groupName: '',
						name: '',
						holes: '',
						slot: '',
						grade: '',
						level: '',
						durability: '',
						price: '',
						className: '',
						ammo: '',
						requirements: '',
						attributes: '',
						bonuses: '',
						setName: '',
						setCount: '',
						setBonuses: ''
					}}
				>
					<Form.Item required name='groupName' label='分组'>
						<Select
							placeholder='请选择分组'
							options={GROUP_OPTIONS.map((item) => ({
								value: item.value,
								label: item.label
							}))}
						/>
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
