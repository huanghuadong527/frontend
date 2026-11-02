import { useEffect, useState } from 'react';
import {
	DeleteOutlined,
	EditOutlined,
	MinusCircleOutlined,
	PlusOutlined,
	SearchOutlined
} from '@ant-design/icons';
import {
	App,
	Button,
	Col,
	Divider,
	Form,
	Input,
	Modal,
	Row,
	Select,
	Space,
	Table,
	Tabs,
	Tag
} from 'antd';
import type { TableColumnsType } from 'antd';
import { useTable } from '@/core';
import {
	addHome,
	deleteHome,
	getHomeById,
	updateHome
} from '@/service';

const HOME_TYPES = ['古董', '宝图', '建筑', '神器'];

const ANTIQUE_TYPE_OPTIONS = ['书籍', '字画', '古玩', '文具', '玉器', '珠宝'].map(
	(v) => ({ value: v, label: v })
);

const STAGE_OPTIONS = [
	{ value: '制作', label: '制作' },
	{ value: '升级', label: '升级' }
];

type MaterialItem = {
	stage?: string;
	materialName?: string;
	quantity?: string;
};

type OutputItem = {
	tag?: string;
	unlockLevel?: string;
	items?: string;
};

const renderContent = (value: unknown) => {
	if (value == null || value === '') return '--';
	const s = String(value);
	return s.length > 40 ? `${s.slice(0, 40)}…` : s;
};

const toNumber = (value: unknown) =>
	value === '' || value == null ? undefined : Number(value);

const TYPE_LABEL: Record<string, string> = {
	古董: '古董',
	宝图: '宝图',
	建筑: '建筑',
	神器: '神器'
};

export const Component = () => {
	const { message, modal } = App.useApp();
	const [searchForm] = Form.useForm();
	const [form] = Form.useForm();
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKeys, setSelectKeys] = useState<(string | number)[]>([]);
	const [materialList, setMaterialList] = useState<MaterialItem[]>([]);
	const [outputList, setOutputList] = useState<OutputItem[]>([]);
	const [activeType, setActiveType] = useState('古董');

	const { tableProps, getData } = useTable('/game/wm/home/list', () => ({
		...searchForm.getFieldsValue(),
		type: activeType
	}));

	const onSearch = (values: AnyObject) => {
		getData({
			name: values.name || undefined,
			type: activeType
		});
	};

	const onReset = () => {
		searchForm.resetFields();
		getData({ type: activeType });
	};

	const onTabChange = (type: string) => {
		setActiveType(type);
		setSelectKeys([]);
		getData({ type });
	};

	const onFinish = (values: AnyObject) => {
		const materials = materialList
			.filter((m) => m.materialName)
			.map((m) => ({
				stage: m.stage || undefined,
				materialName: m.materialName,
				quantity: toNumber(m.quantity)
			}));
		const outputs = outputList
			.filter((o) => o.items || o.tag)
			.map((o) => ({
				tag: o.tag || undefined,
				unlockLevel: toNumber(o.unlockLevel),
				items: o.items || undefined
			}));
		const params = {
			type: activeType,
			name: values.name,
			antiqueType: values.antiqueType || undefined,
			antiqueLevel: toNumber(values.antiqueLevel),
			specialEffect: values.specialEffect || undefined,
			fengshui: toNumber(values.fengshui),
			wealth: toNumber(values.wealth),
			population: toNumber(values.population),
			environment: toNumber(values.environment),
			price: toNumber(values.price),
			lanterns: toNumber(values.lanterns),
			paintings: toNumber(values.paintings),
			craftSite: values.craftSite || undefined,
			fixedOutput: values.fixedOutput || undefined,
			coreFunction: values.coreFunction || undefined,
			description: values.description || undefined,
			note: values.note || undefined,
			rawText: values.rawText || undefined,
			materials,
			outputs
		};
		if (editId) {
			updateHome({ ...params, id: editId }).then(() => {
				message.success('修改成功');
				onCancel();
				getData();
			});
		} else {
			addHome(params).then(() => {
				message.success('新增成功');
				onCancel();
				getData();
			});
		}
	};

	const onEdit = (id?: string | number) => {
		if (id) {
			setEditId(id);
			getHomeById(id).then((result) => {
				const record = result.data;
				form.resetFields();
				form.setFieldsValue({
					name: record.name ?? '',
					antiqueType: record.antiqueType ?? undefined,
					antiqueLevel: record.antiqueLevel != null ? String(record.antiqueLevel) : '',
					specialEffect: record.specialEffect ?? '',
					fengshui: record.fengshui != null ? String(record.fengshui) : '',
					wealth: record.wealth != null ? String(record.wealth) : '',
					population: record.population != null ? String(record.population) : '',
					environment: record.environment != null ? String(record.environment) : '',
					price: record.price != null ? String(record.price) : '',
					lanterns: record.lanterns != null ? String(record.lanterns) : '',
					paintings: record.paintings != null ? String(record.paintings) : '',
					craftSite: record.craftSite ?? '',
					fixedOutput: record.fixedOutput ?? '',
					coreFunction: record.coreFunction ?? '',
					description: record.description ?? '',
					note: record.note ?? '',
					rawText: record.rawText ?? ''
				});
				setMaterialList(
					(record.materials ?? []).map((m: AnyObject) => ({
						stage: m.stage ?? '',
						materialName: m.materialName ?? '',
						quantity: m.quantity != null ? String(m.quantity) : ''
					}))
				);
				setOutputList(
					(record.outputs ?? []).map((o: AnyObject) => ({
						tag: o.tag ?? '',
						unlockLevel: o.unlockLevel != null ? String(o.unlockLevel) : '',
						items: o.items ?? ''
					}))
				);
				setIsOpen(true);
			});
		} else {
			setEditId('');
			form.resetFields();
			setMaterialList([]);
			setOutputList([]);
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
		setMaterialList([]);
		setOutputList([]);
	};

	const onDelete = (id: string | number) => {
		modal.confirm({
			title: '系统提示',
			content: `是否确认删除该${TYPE_LABEL[activeType] ?? '家园'}?`,
			onOk() {
				deleteHome(id).then(() => {
					message.success('删除成功');
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的数据');
			return;
		}
		modal.confirm({
			title: '系统提示',
			content: `是否确认删除选中的 ${selectKeys.length} 项数据?`,
			onOk() {
				deleteHome(selectKeys.join(',')).then(() => {
					message.success('删除成功');
					setSelectKeys([]);
					getData();
				});
			}
		});
	};

	const updateMaterialItem = (
		index: number,
		key: keyof MaterialItem,
		value: string | number
	) => {
		setMaterialList((prev) =>
			prev.map((item, i) => (i === index ? { ...item, [key]: value } : item))
		);
	};

	const addMaterialItem = () => {
		setMaterialList((prev) => [...prev, { stage: '制作', materialName: '', quantity: '' }]);
	};

	const removeMaterialItem = (index: number) => {
		setMaterialList((prev) => prev.filter((_, i) => i !== index));
	};

	const updateOutputItem = (
		index: number,
		key: keyof OutputItem,
		value: string | number
	) => {
		setOutputList((prev) =>
			prev.map((item, i) => (i === index ? { ...item, [key]: value } : item))
		);
	};

	const addOutputItem = () => {
		setOutputList((prev) => [...prev, { tag: '', unlockLevel: '', items: '' }]);
	};

	const removeOutputItem = (index: number) => {
		setOutputList((prev) => prev.filter((_, i) => i !== index));
	};

	useEffect(() => {
		getData({ type: activeType });
	}, []);

	const renderMaterials = (_v: unknown, row: AnyObject) => {
		const materials = Array.isArray(row.materials) ? row.materials : [];
		if (!materials.length) return '--';
		const text = materials
			.map((m: AnyObject) => `${m.materialName}×${m.quantity ?? 1}`)
			.join('、');
		return renderContent(text);
	};

	const renderOutputs = (_v: unknown, row: AnyObject) => {
		const outputs = Array.isArray(row.outputs) ? row.outputs : [];
		if (!outputs.length) return '--';
		return outputs.map((o: AnyObject, i: number) => (
			<Tag key={i} style={{ marginBottom: 2 }}>
				{o.tag ? `${o.tag}:` : ''}
				{o.unlockLevel != null ? `富贵度${o.unlockLevel}:` : ''}
				{o.items ?? ''}
			</Tag>
		));
	};

	const buildColumns = (): TableColumnsType<AnyObject> => {
		const base: TableColumnsType<AnyObject> = [
			{ title: '编号', dataIndex: 'id', width: 70 },
			{ title: '名称', dataIndex: 'name' }
		];
		switch (activeType) {
			case '古董':
				base.push(
					{
						title: '古董类型',
						dataIndex: 'antiqueType',
						width: 100,
						render: (v) => (v ? <Tag color='purple'>{v}</Tag> : '--')
					},
					{ title: '等级', dataIndex: 'antiqueLevel', width: 70 },
					{ title: '特殊效果', dataIndex: 'specialEffect', render: (v) => renderContent(v) },
					{ title: '风水值', dataIndex: 'fengshui', width: 80 },
					{ title: '富贵度', dataIndex: 'wealth', width: 80 },
					{ title: '人口', dataIndex: 'population', width: 70 },
					{ title: '环境值', dataIndex: 'environment', width: 80 },
					{ title: '价格', dataIndex: 'price', width: 80 },
					{ title: '材料', dataIndex: 'materials', width: 200, render: renderMaterials }
				);
				break;
			case '宝图':
				base.push(
					{ title: '固定产出', dataIndex: 'fixedOutput', render: (v) => renderContent(v) },
					{ title: '备注', dataIndex: 'note', render: (v) => renderContent(v) },
					{ title: '产出', dataIndex: 'outputs', width: 240, render: renderOutputs }
				);
				break;
			case '建筑':
				base.push(
					{ title: '风水值', dataIndex: 'fengshui', width: 80 },
					{ title: '富贵度', dataIndex: 'wealth', width: 80 },
					{ title: '人口', dataIndex: 'population', width: 70 },
					{ title: '可悬挂灯笼', dataIndex: 'lanterns', width: 100 },
					{ title: '可悬挂字画', dataIndex: 'paintings', width: 100 },
					{ title: '可制作产地', dataIndex: 'craftSite', render: (v) => renderContent(v) },
					{ title: '材料', dataIndex: 'materials', width: 200, render: renderMaterials }
				);
				break;
			case '神器':
				base.push(
					{ title: '核心功能', dataIndex: 'coreFunction', render: (v) => renderContent(v) },
					{ title: '补充说明', dataIndex: 'note', render: (v) => renderContent(v) },
					{ title: '材料', dataIndex: 'materials', width: 200, render: renderMaterials },
					{ title: '产出', dataIndex: 'outputs', width: 240, render: renderOutputs }
				);
				break;
			default:
				break;
		}
		base.push({
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
		});
		return base;
	};

	const hasMaterials = activeType === '古董' || activeType === '建筑' || activeType === '神器';
	const hasOutputs = activeType === '宝图' || activeType === '神器';

	return (
		<div className='p-4 flex flex-col gap-4'>
			<Tabs
				activeKey={activeType}
				onChange={onTabChange}
				items={HOME_TYPES.map((t) => ({ key: t, label: t }))}
			/>
			<div className='flex items-center justify-between'>
				<Form form={searchForm} layout='inline' onFinish={onSearch}>
					<Form.Item name='name' label='名称'>
						<Input placeholder='请输入名称' allowClear />
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
				columns={buildColumns()}
				scroll={{ x: 1300 }}
			/>
			<Modal
				title={editId ? `编辑${TYPE_LABEL[activeType] ?? '家园'}` : `新增${TYPE_LABEL[activeType] ?? '家园'}`}
				open={isOpen}
				onOk={onSave}
				onCancel={onCancel}
				width={760}
				destroyOnHidden
				forceRender
				styles={{
					body: { maxHeight: '70vh', overflowY: 'auto', overflowX: 'hidden' }
				}}
			>
				<Form form={form} labelCol={{ flex: '0 0 100px' }} onFinish={onFinish}>
					<Row gutter={16}>
						<Col span={12}>
							<Form.Item
								name='name'
								label='名称'
								rules={[{ required: true, message: '请输入名称' }]}
							>
								<Input placeholder='请输入名称' />
							</Form.Item>
						</Col>
						{activeType === '古董' && (
							<>
								<Col span={12}>
									<Form.Item name='antiqueType' label='古董类型'>
										<Select placeholder='请选择古董类型' options={ANTIQUE_TYPE_OPTIONS} />
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item name='antiqueLevel' label='古董等级'>
										<Input placeholder='请输入古董等级' />
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item name='specialEffect' label='特殊效果'>
										<Input placeholder='请输入特殊效果' />
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item name='fengshui' label='风水值'>
										<Input placeholder='请输入风水值' />
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item name='wealth' label='富贵度'>
										<Input placeholder='请输入富贵度' />
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item name='population' label='人口'>
										<Input placeholder='请输入人口' />
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item name='environment' label='环境值'>
										<Input placeholder='请输入环境值' />
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item name='price' label='价格'>
										<Input placeholder='请输入价格' />
									</Form.Item>
								</Col>
								<Col span={24}>
									<Form.Item name='description' label='物品描述'>
										<Input.TextArea rows={3} placeholder='请输入物品描述' />
									</Form.Item>
								</Col>
							</>
						)}
						{activeType === '宝图' && (
							<Col span={12}>
								<Form.Item name='fixedOutput' label='固定产出'>
									<Input placeholder='请输入固定产出' />
								</Form.Item>
							</Col>
						)}
						{activeType === '建筑' && (
							<>
								<Col span={12}>
									<Form.Item name='craftSite' label='可制作产地'>
										<Input placeholder='请输入可制作产地' />
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item name='fengshui' label='风水值'>
										<Input placeholder='请输入风水值' />
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item name='wealth' label='富贵度'>
										<Input placeholder='请输入富贵度' />
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item name='population' label='人口'>
										<Input placeholder='请输入人口' />
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item name='lanterns' label='可悬挂灯笼'>
										<Input placeholder='请输入可悬挂灯笼' />
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item name='paintings' label='可悬挂字画'>
										<Input placeholder='请输入可悬挂字画' />
									</Form.Item>
								</Col>
								<Col span={24}>
									<Form.Item name='description' label='物品描述'>
										<Input.TextArea rows={3} placeholder='请输入物品描述' />
									</Form.Item>
								</Col>
							</>
						)}
						{activeType === '神器' && (
							<Col span={24}>
								<Form.Item name='coreFunction' label='核心功能'>
									<Input.TextArea rows={3} placeholder='请输入核心功能' />
								</Form.Item>
							</Col>
						)}
						{(activeType === '宝图' || activeType === '神器') && (
							<Col span={24}>
								<Form.Item name='note' label='备注'>
									<Input.TextArea rows={3} placeholder='请输入备注' />
								</Form.Item>
							</Col>
						)}
						<Col span={24}>
							<Form.Item name='rawText' label='原始文本'>
								<Input.TextArea rows={3} placeholder='请输入原始文本' />
							</Form.Item>
						</Col>
					</Row>
					{hasMaterials && (
						<>
							<Divider plain>材料</Divider>
							<Form.Item label='材料列表'>
								<div>
									{materialList.map((item, index) => (
										<Row key={index} gutter={[15, 15]} align='middle' className='mb-3'>
											{activeType === '古董' && (
												<Col span={5}>
													<Select
														placeholder='阶段'
														style={{ width: '100%' }}
														value={item.stage}
														options={STAGE_OPTIONS}
														onChange={(value) =>
															updateMaterialItem(index, 'stage', value)
														}
													/>
												</Col>
											)}
											<Col span={activeType === '古董' ? 10 : 13}>
												<Input
													placeholder='材料名称'
													value={item.materialName}
													onChange={(e) =>
														updateMaterialItem(index, 'materialName', e.target.value)
													}
												/>
											</Col>
											<Col span={activeType === '古董' ? 7 : 9}>
												<Input
													placeholder='数量'
													value={item.quantity}
													onChange={(e) =>
														updateMaterialItem(index, 'quantity', e.target.value)
													}
												/>
											</Col>
											<Col span={2}>
												<Button
													type='text'
													danger
													icon={<MinusCircleOutlined />}
													onClick={() => removeMaterialItem(index)}
												/>
											</Col>
										</Row>
									))}
									<Button
										type='dashed'
										block
										icon={<PlusOutlined />}
										onClick={addMaterialItem}
										style={{ marginTop: 4 }}
									>
										添加材料
									</Button>
								</div>
							</Form.Item>
						</>
					)}
					{hasOutputs && (
						<>
							<Divider plain>产出</Divider>
							<Form.Item label='产出列表'>
								<div>
									{outputList.map((item, index) => (
										<Row key={index} gutter={[15, 15]} align='middle' className='mb-3'>
											{activeType === '宝图' && (
												<Col span={8}>
													<Input
														placeholder='产出标签'
														value={item.tag}
														onChange={(e) =>
															updateOutputItem(index, 'tag', e.target.value)
														}
													/>
												</Col>
											)}
											{activeType === '神器' && (
												<Col span={8}>
													<Input
														placeholder='解锁富贵度'
														value={item.unlockLevel}
														onChange={(e) =>
															updateOutputItem(index, 'unlockLevel', e.target.value)
														}
													/>
												</Col>
											)}
											<Col span={14}>
												<Input
													placeholder='产出物品'
													value={item.items}
													onChange={(e) =>
														updateOutputItem(index, 'items', e.target.value)
													}
												/>
											</Col>
											<Col span={2}>
												<Button
													type='text'
													danger
													icon={<MinusCircleOutlined />}
													onClick={() => removeOutputItem(index)}
												/>
											</Col>
										</Row>
									))}
									<Button
										type='dashed'
										block
										icon={<PlusOutlined />}
										onClick={addOutputItem}
										style={{ marginTop: 4 }}
									>
										添加产出
									</Button>
								</div>
							</Form.Item>
						</>
					)}
				</Form>
			</Modal>
		</div>
	);
};
