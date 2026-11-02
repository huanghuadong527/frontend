import { useEffect, useState } from 'react';
import {
	DeleteOutlined,
	EditOutlined,
	MinusCircleOutlined,
	PlusOutlined
} from '@ant-design/icons';
import {
	App,
	Button,
	Col,
	Divider,
	Form,
	Input,
	InputNumber,
	Modal,
	Row,
	Space,
	Switch,
	Table,
	Tag
} from 'antd';
import type { TableColumnsType } from 'antd';
import {
	addTimerBoss,
	addTimerGroup,
	deleteTimerBoss,
	deleteTimerGroup,
	getTimerBossById,
	getTimerBossList,
	getTimerGroupList,
	updateTimerBoss,
	updateTimerGroup
} from '@/service';

type GroupItem = { id?: number; name?: string; sortOrder?: number };
type SkillItem = {
	name?: string;
	cd?: number;
	description?: string;
	voiceEnabled?: boolean;
};

const toNumber = (value: unknown) =>
	value === '' || value == null ? undefined : Number(value);

export const Component = () => {
	const { message, modal } = App.useApp();
	const [groups, setGroups] = useState<GroupItem[]>([]);
	const [activeGroupId, setActiveGroupId] = useState<number | undefined>();
	const [bosses, setBosses] = useState<AnyObject[]>([]);

	const [groupForm] = Form.useForm();
	const [groupModalOpen, setGroupModalOpen] = useState(false);
	const [groupEditId, setGroupEditId] = useState<number | undefined>();

	const [bossForm] = Form.useForm();
	const [bossModalOpen, setBossModalOpen] = useState(false);
	const [bossEditId, setBossEditId] = useState<number | undefined>();
	const [skillList, setSkillList] = useState<SkillItem[]>([]);

	const loadGroups = () => {
		getTimerGroupList().then((res) => {
			const list = (res.data ?? []) as GroupItem[];
			setGroups(list);
			if (list.length && activeGroupId == null) {
				setActiveGroupId(list[0].id);
			}
		});
	};

	const loadBosses = (groupId: number) => {
		getTimerBossList({ groupId }).then((res) => {
			setBosses((res.data ?? []) as AnyObject[]);
		});
	};

	useEffect(() => {
		loadGroups();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (activeGroupId != null) {
			loadBosses(activeGroupId);
		} else {
			setBosses([]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeGroupId]);

	// ================= 分组 =================

	const openGroupModal = (item?: GroupItem) => {
		setGroupEditId(item?.id);
		groupForm.resetFields();
		if (item) {
			groupForm.setFieldsValue({
				name: item.name ?? '',
				sortOrder: item.sortOrder ?? 0
			});
		}
		setGroupModalOpen(true);
	};

	const onGroupFinish = (values: AnyObject) => {
		const params = {
			name: values.name,
			sortOrder: toNumber(values.sortOrder) ?? 0
		};
		if (groupEditId != null) {
			updateTimerGroup({ ...params, id: groupEditId }).then(() => {
				message.success('修改成功');
				setGroupModalOpen(false);
				loadGroups();
			});
		} else {
			addTimerGroup(params).then(() => {
				message.success('新增成功');
				setGroupModalOpen(false);
				loadGroups();
			});
		}
	};

	const onDeleteGroup = (item: GroupItem) => {
		modal.confirm({
			title: '系统提示',
			content: `是否确认删除分组「${item.name}」及其下所有 BOSS 与技能？`,
			onOk() {
				deleteTimerGroup(item.id as number).then(() => {
					message.success('删除成功');
					if (activeGroupId === item.id) {
						setActiveGroupId(undefined);
					}
					loadGroups();
				});
			}
		});
	};

	// ================= BOSS =================

	const openBossModal = (row?: AnyObject) => {
		setBossEditId(row?.id);
		bossForm.resetFields();
		if (row) {
			getTimerBossById(row.id).then((res) => {
				const record = res.data;
				bossForm.setFieldsValue({ name: record.name ?? '' });
				setSkillList(
					(record.skills ?? []).map((s: AnyObject) => ({
						name: s.name ?? '',
						cd: s.cd ?? 0,
						description: s.description ?? '',
						voiceEnabled: s.voiceEnabled === 1
					}))
				);
				setBossModalOpen(true);
			});
		} else {
			setSkillList([]);
			setBossModalOpen(true);
		}
	};

	const onBossFinish = (values: AnyObject) => {
		const skills = skillList
			.filter((s) => s.name && String(s.name).trim())
			.map((s) => ({
				name: s.name,
				cd: toNumber(s.cd) ?? 0,
				description: s.description || undefined,
				voiceEnabled: s.voiceEnabled ? 1 : 0
			}));
		const params = {
			name: values.name,
			groupId: activeGroupId,
			skills
		};
		if (bossEditId != null) {
			updateTimerBoss({ ...params, id: bossEditId }).then(() => {
				message.success('修改成功');
				setBossModalOpen(false);
				if (activeGroupId != null) loadBosses(activeGroupId);
			});
		} else {
			addTimerBoss(params).then(() => {
				message.success('新增成功');
				setBossModalOpen(false);
				if (activeGroupId != null) loadBosses(activeGroupId);
			});
		}
	};

	const onDeleteBoss = (id: number) => {
		modal.confirm({
			title: '系统提示',
			content: '是否确认删除该 BOSS 及其技能？',
			onOk() {
				deleteTimerBoss(id).then(() => {
					message.success('删除成功');
					if (activeGroupId != null) loadBosses(activeGroupId);
				});
			}
		});
	};

	const updateSkill = (index: number, key: keyof SkillItem, value: unknown) => {
		setSkillList((prev) =>
			prev.map((item, i) => (i === index ? { ...item, [key]: value } : item))
		);
	};

	const addSkill = () => {
		setSkillList((prev) => [
			...prev,
			{ name: '', cd: 0, description: '', voiceEnabled: false }
		]);
	};

	const removeSkill = (index: number) => {
		setSkillList((prev) => prev.filter((_, i) => i !== index));
	};

	const columns: TableColumnsType<AnyObject> = [
		{ title: '编号', dataIndex: 'id', width: 70 },
		{ title: 'BOSS 名称', dataIndex: 'name' },
		{
			title: '技能数',
			dataIndex: 'skills',
			width: 90,
			render: (skills) => (
				<Tag color='blue'>{Array.isArray(skills) ? skills.length : 0}</Tag>
			)
		},
		{
			title: '技能',
			dataIndex: 'skills',
			render: (skills) => {
				const list = Array.isArray(skills) ? skills : [];
				if (!list.length) return '--';
				return list
					.map(
						(s: AnyObject) => `${s.name}${s.cd ? `(${s.cd}s)` : '(即时)'}`
					)
					.join('、');
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
						onClick={() => openBossModal(row)}
					/>
					<Button
						type='link'
						size='small'
						danger
						icon={<DeleteOutlined />}
						title='删除'
						onClick={() => onDeleteBoss(row.id)}
					/>
				</>
			)
		}
	];

	return (
		<div className='p-4 flex gap-4'>
			<div className='w-60 shrink-0 flex flex-col gap-3'>
				<div className='flex items-center justify-between'>
					<span className='font-medium'>分组</span>
					<Button
						type='primary'
						size='small'
						icon={<PlusOutlined />}
						onClick={() => openGroupModal()}
					>
						新增
					</Button>
				</div>
				<div className='flex flex-col gap-1'>
					{groups.map((g) => (
						<div
							key={g.id}
							className={`flex items-center justify-between rounded px-3 py-2 cursor-pointer ${
								activeGroupId === g.id
									? 'bg-blue-500 text-white'
									: 'bg-gray-100 hover:bg-gray-200'
							}`}
							onClick={() => setActiveGroupId(g.id)}
						>
							<span>{g.name}</span>
							<Space size={0}>
								<Button
									type='text'
									size='small'
									icon={<EditOutlined />}
									className={
										activeGroupId === g.id ? 'text-white' : ''
									}
									onClick={(e) => {
										e.stopPropagation();
										openGroupModal(g);
									}}
								/>
								<Button
									type='text'
									size='small'
									danger
									icon={<DeleteOutlined />}
									onClick={(e) => {
										e.stopPropagation();
										onDeleteGroup(g);
									}}
								/>
							</Space>
						</div>
					))}
					{!groups.length && (
						<div className='text-gray-400 text-center py-4'>暂无分组</div>
					)}
				</div>
			</div>

			<div className='flex-1 flex flex-col gap-4'>
				<div className='flex items-center justify-between'>
					<div className='text-gray-500'>
						{activeGroupId == null
							? '请先选择分组'
							: `BOSS 列表（${bosses.length}）`}
					</div>
					<Button
						type='primary'
						icon={<PlusOutlined />}
						disabled={activeGroupId == null}
						onClick={() => openBossModal()}
					>
						新建 BOSS
					</Button>
				</div>
				<Table
					rowKey='id'
					dataSource={bosses}
					columns={columns}
					pagination={false}
					scroll={{ x: 800 }}
				/>
			</div>

			<Modal
				title={groupEditId != null ? '编辑分组' : '新增分组'}
				open={groupModalOpen}
				onOk={() => groupForm.submit()}
				onCancel={() => setGroupModalOpen(false)}
				destroyOnHidden
				forceRender
			>
				<Form form={groupForm} labelCol={{ flex: '0 0 80px' }} onFinish={onGroupFinish}>
					<Form.Item
						name='name'
						label='名称'
						rules={[{ required: true, message: '请输入分组名称' }]}
					>
						<Input placeholder='请输入分组名称' />
					</Form.Item>
					<Form.Item name='sortOrder' label='排序'>
						<InputNumber min={0} style={{ width: '100%' }} placeholder='排序值' />
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				title={bossEditId != null ? '编辑 BOSS' : '新增 BOSS'}
				open={bossModalOpen}
				onOk={() => bossForm.submit()}
				onCancel={() => setBossModalOpen(false)}
				width={760}
				destroyOnHidden
				forceRender
				styles={{
					body: { maxHeight: '70vh', overflowY: 'auto', overflowX: 'hidden' }
				}}
			>
				<Form form={bossForm} labelCol={{ flex: '0 0 80px' }} onFinish={onBossFinish}>
					<Form.Item
						name='name'
						label='名称'
						rules={[{ required: true, message: '请输入 BOSS 名称' }]}
					>
						<Input placeholder='请输入 BOSS 名称' />
					</Form.Item>
					<Divider plain>技能</Divider>
					<Form.Item label='技能列表'>
						<div>
							{skillList.map((item, index) => (
								<Row key={index} gutter={[15, 15]} align='middle' className='mb-3'>
									<Col span={6}>
										<Input
											placeholder='技能名称'
											value={item.name}
											onChange={(e) => updateSkill(index, 'name', e.target.value)}
										/>
									</Col>
									<Col span={5}>
										<InputNumber
											placeholder='冷却(秒)'
											min={0}
											style={{ width: '100%' }}
											value={item.cd}
											onChange={(v) => updateSkill(index, 'cd', v)}
										/>
									</Col>
									<Col span={8}>
										<Input
											placeholder='触发说明'
											value={item.description}
											onChange={(e) =>
												updateSkill(index, 'description', e.target.value)
											}
										/>
									</Col>
									<Col span={3}>
										<Space size={4}>
											<span className='text-gray-500'>语音</span>
											<Switch
												size='small'
												checked={!!item.voiceEnabled}
												onChange={(checked) =>
													updateSkill(index, 'voiceEnabled', checked)
												}
											/>
										</Space>
									</Col>
									<Col span={2}>
										<Button
											type='text'
											danger
											icon={<MinusCircleOutlined />}
											onClick={() => removeSkill(index)}
										/>
									</Col>
								</Row>
							))}
							<Button
								type='dashed'
								block
								icon={<PlusOutlined />}
								onClick={addSkill}
								style={{ marginTop: 4 }}
							>
								添加技能
							</Button>
						</div>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};
