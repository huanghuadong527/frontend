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

const CATEGORY_OPTIONS = [
	{ value: 'weapon', label: '武器' },
	{ value: 'armor', label: '防具' },
	{ value: 'jewelry', label: '饰品' }
];

type MaterialItem = {
	materialName?: string;
	quantity?: string;
	isCore?: number;
};

type AttributeItem = {
	attrGroup?: string;
	attrName?: string;
	value?: string;
	minValue?: string;
	maxValue?: string;
	refineValue?: string;
	unit?: string;
	isPercent?: number;
	description?: string;
};

const getCategoryLabel = (value: unknown) =>
	CATEGORY_OPTIONS.find((item) => item.value === value)?.label ??
	(value || '--');

const renderContent = (value: unknown) => {
	if (value == null || value === '') return '--';
	const s = String(value);
	return s.length > 40 ? `${s.slice(0, 40)}…` : s;
};

const toNumber = (value: unknown) =>
	value === '' || value == null ? undefined : Number(value);

const parseJson = (value: unknown) =>
	value === '' || value == null ? undefined : String(value);

export const Component = () => {
	const { message, modal } = App.useApp();
	const [searchForm] = Form.useForm();
	const [form] = Form.useForm();
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKeys, setSelectKeys] = useState<(string | number)[]>([]);
	const [materialList, setMaterialList] = useState<MaterialItem[]>([]);
	const [attributeList, setAttributeList] = useState<AttributeItem[]>([]);

	const { tableProps, getData } = useTable('/game/wm/equipment/list', () =>
		searchForm.getFieldsValue()
	);

	const onSearch = (values: AnyObject) => {
		getData({
			name: values.name || undefined,
			category: values.category || undefined,
			subType: values.subType || undefined,
			grade:
				values.grade === '' || values.grade == null
					? undefined
					: Number(values.grade)
		});
	};

	const onReset = () => {
		searchForm.resetFields();
		getData();
	};

	const validateJson = (value: unknown) => {
		if (value == null || value === '') return true;
		try {
			JSON.parse(String(value));
			return true;
		} catch {
			return false;
		}
	};

	const onFinish = (values: AnyObject) => {
		const jsonFields = ['requirements', 'attributes', 'bonuses', 'setBonuses'];
		for (const key of jsonFields) {
			if (!validateJson(values[key])) {
				message.error(`${key} 不是合法的 JSON 格式`);
				return;
			}
		}
		const materials = materialList
			.filter((m) => m.materialName)
			.map((m) => ({
				materialName: m.materialName,
				quantity: toNumber(m.quantity),
				isCore: m.isCore == 1 ? 1 : 0
			}));
		const attacks = [
			{
				attackType: 'physical',
				atkMin: toNumber(values.physAtkMin),
				atkMaxMin: toNumber(values.physAtkMaxMin),
				atkMaxMax: toNumber(values.physAtkMaxMax)
			},
			{
				attackType: 'magic',
				atkMin: toNumber(values.magicAtkMin),
				atkMaxMin: toNumber(values.magicAtkMaxMin),
				atkMaxMax: toNumber(values.magicAtkMaxMax)
			}
		].filter(
			(a) => a.atkMin != null || a.atkMaxMin != null || a.atkMaxMax != null
		);
		const attributeItems = attributeList
			.filter((a) => a.attrName)
			.map((a) => ({
				attrGroup: a.attrGroup || undefined,
				attrName: a.attrName,
				value: toNumber(a.value),
				minValue: toNumber(a.minValue),
				maxValue: toNumber(a.maxValue),
				refineValue: toNumber(a.refineValue),
				unit: a.unit || undefined,
				isPercent: a.isPercent == 1 ? 1 : 0,
				description: a.description || undefined
			}));
		const params = {
			name: values.name,
			category: values.category,
			subType: values.subType || undefined,
			grade: toNumber(values.grade),
			classReq: values.classReq || undefined,
			levelReq: toNumber(values.levelReq),
			strReq: toNumber(values.strReq),
			agiReq: toNumber(values.agiReq),
			intReq: toNumber(values.intReq),
			vitReq: toNumber(values.vitReq),
			agiOrIntReq: toNumber(values.agiOrIntReq),
			attackRate: toNumber(values.attackRate),
			attackRange: toNumber(values.attackRange),
			weakRange: toNumber(values.weakRange),
			ammo: values.ammo || undefined,
			durabilityMin: toNumber(values.durabilityMin),
			durabilityMax: toNumber(values.durabilityMax),
			durability: values.durability || undefined,
			price: toNumber(values.price),
			refineAttr: values.refineAttr || undefined,
			refineValue: toNumber(values.refineValue),
			specialRule: values.specialRule || undefined,
			source: values.source || undefined,
			description: values.description || undefined,
			rawText: values.rawText || undefined,
			requirements: parseJson(values.requirements),
			attributes: parseJson(values.attributes),
			bonuses: parseJson(values.bonuses),
			setName: values.setName || undefined,
			setCount: toNumber(values.setCount),
			setBonuses: parseJson(values.setBonuses),
			attacks,
			materials,
			attributeList: attributeItems
		};
		if (editId) {
			updateEquipment({ ...params, id: editId }).then(() => {
				message.success('修改成功');
				onCancel();
				getData();
			});
		} else {
			addEquipment(params).then(() => {
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
				const attacks = Array.isArray(record.attacks) ? record.attacks : [];
				const phys = attacks.find((a: AnyObject) => a.attackType === 'physical');
				const magic = attacks.find((a: AnyObject) => a.attackType === 'magic');
				form.setFieldsValue({
					name: record.name ?? '',
					category: record.category ?? undefined,
					subType: record.subType ?? '',
					grade: record.grade != null ? String(record.grade) : '',
					classReq: record.classReq ?? '',
					levelReq: record.levelReq != null ? String(record.levelReq) : '',
					strReq: record.strReq != null ? String(record.strReq) : '',
					agiReq: record.agiReq != null ? String(record.agiReq) : '',
					intReq: record.intReq != null ? String(record.intReq) : '',
					vitReq: record.vitReq != null ? String(record.vitReq) : '',
					agiOrIntReq:
						record.agiOrIntReq != null ? String(record.agiOrIntReq) : '',
					attackRate:
						record.attackRate != null ? String(record.attackRate) : '',
					attackRange:
						record.attackRange != null ? String(record.attackRange) : '',
					weakRange: record.weakRange != null ? String(record.weakRange) : '',
					ammo: record.ammo ?? '',
					durabilityMin:
						record.durabilityMin != null ? String(record.durabilityMin) : '',
					durabilityMax:
						record.durabilityMax != null ? String(record.durabilityMax) : '',
					durability: record.durability ?? '',
					price: record.price != null ? String(record.price) : '',
					refineAttr: record.refineAttr ?? '',
					refineValue:
						record.refineValue != null ? String(record.refineValue) : '',
					specialRule: record.specialRule ?? '',
					source: record.source ?? '',
					description: record.description ?? '',
					rawText: record.rawText ?? '',
					requirements: record.requirements ?? '',
					attributes: record.attributes ?? '',
					bonuses: record.bonuses ?? '',
					setName: record.setName ?? '',
					setCount: record.setCount != null ? String(record.setCount) : '',
					setBonuses: record.setBonuses ?? '',
					physAtkMin: phys?.atkMin != null ? String(phys.atkMin) : '',
					physAtkMaxMin: phys?.atkMaxMin != null ? String(phys.atkMaxMin) : '',
					physAtkMaxMax: phys?.atkMaxMax != null ? String(phys.atkMaxMax) : '',
					magicAtkMin: magic?.atkMin != null ? String(magic.atkMin) : '',
					magicAtkMaxMin: magic?.atkMaxMin != null ? String(magic.atkMaxMin) : '',
					magicAtkMaxMax: magic?.atkMaxMax != null ? String(magic.atkMaxMax) : ''
				});
				setMaterialList(
					(record.materials ?? []).map((m: AnyObject) => ({
						materialName: m.materialName ?? '',
						quantity: m.quantity != null ? String(m.quantity) : '',
						isCore: m.isCore == 1 ? 1 : 0
					}))
				);
				setAttributeList(
					(record.attributeList ?? []).map((a: AnyObject) => ({
						attrGroup: a.attrGroup ?? 'basic',
						attrName: a.attrName ?? '',
						value: a.value != null ? String(a.value) : '',
						minValue: a.minValue != null ? String(a.minValue) : '',
						maxValue: a.maxValue != null ? String(a.maxValue) : '',
						refineValue: a.refineValue != null ? String(a.refineValue) : '',
						unit: a.unit ?? '',
						isPercent: a.isPercent == 1 ? 1 : 0,
						description: a.description ?? ''
					}))
				);
				setIsOpen(true);
			});
		} else {
			setEditId('');
			form.resetFields();
			setMaterialList([]);
			setAttributeList([]);
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
		setAttributeList([]);
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
		setMaterialList((prev) => [
			...prev,
			{ materialName: '', quantity: '', isCore: 0 }
		]);
	};

	const removeMaterialItem = (index: number) => {
		setMaterialList((prev) => prev.filter((_, i) => i !== index));
	};

	const updateAttributeItem = (
		index: number,
		key: keyof AttributeItem,
		value: string | number
	) => {
		setAttributeList((prev) =>
			prev.map((item, i) => (i === index ? { ...item, [key]: value } : item))
		);
	};

	const addAttributeItem = () => {
		setAttributeList((prev) => [
			...prev,
			{
				attrGroup: 'basic',
				attrName: '',
				value: '',
				minValue: '',
				maxValue: '',
				refineValue: '',
				unit: '',
				isPercent: 0,
				description: ''
			}
		]);
	};

	const removeAttributeItem = (index: number) => {
		setAttributeList((prev) => prev.filter((_, i) => i !== index));
	};

	useEffect(() => {
		getData();
	}, []);

	const columns: TableColumnsType<AnyObject> = [
		{ title: '编号', dataIndex: 'id', width: 70 },
		{ title: '装备名称', dataIndex: 'name' },
		{
			title: '类型',
			dataIndex: 'category',
			width: 80,
			render: (value) => getCategoryLabel(value)
		},
		{ title: '具体类型', dataIndex: 'subType' },
		{ title: '品阶', dataIndex: 'grade', width: 70 },
		{
			title: '职业限制',
			dataIndex: 'classReq',
			render: (value) => renderContent(value)
		},
		{ title: '等级要求', dataIndex: 'levelReq', width: 90 },
		{ title: '价格', dataIndex: 'price', width: 90 },
		{
			title: '套装名称',
			dataIndex: 'setName',
			render: (value) => renderContent(value)
		},
		{
			title: '攻击',
			dataIndex: 'attacks',
			width: 160,
			render: (_v, row) => {
				const attacks = Array.isArray(row.attacks) ? row.attacks : [];
				if (!attacks.length) return '--';
				return attacks.map((a: AnyObject) => {
					const label = a.attackType === 'magic' ? '法术' : '物理';
					const range =
						a.atkMin != null && a.atkMaxMin != null
							? `${a.atkMin}-${a.atkMaxMin}`
							: '--';
					return (
						<Tag
							key={a.id ?? `${a.attackType}-${a.atkMin}`}
							style={{ marginBottom: 2 }}
						>
							{label} {range}
						</Tag>
					);
				});
			}
		},
		{
			title: '材料',
			dataIndex: 'materials',
			width: 200,
			render: (_v, row) => {
				const materials = Array.isArray(row.materials) ? row.materials : [];
				if (!materials.length) return '--';
				const text = materials
					.map((m: AnyObject) => `${m.materialName}×${m.quantity ?? 1}`)
					.join('、');
				return renderContent(text);
			}
		},
		{
			title: '属性',
			dataIndex: 'attributeList',
			width: 200,
			render: (_v, row) => {
				const attributes = Array.isArray(row.attributeList)
					? row.attributeList
					: [];
				if (!attributes.length) return '--';
				const text = attributes
					.map((a: AnyObject) => a.attrName ?? '')
					.filter(Boolean)
					.join('、');
				return renderContent(text);
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

	const textAreaProps = {
		rows: 3
	};

	return (
		<div className='p-4 flex flex-col gap-4'>
			<div className='flex items-center justify-between'>
				<Form form={searchForm} layout='inline' onFinish={onSearch}>
					<Form.Item name='name' label='装备名称'>
						<Input placeholder='请输入装备名称' allowClear />
					</Form.Item>
					<Form.Item name='category' label='类型'>
						<Select
							placeholder='请选择类型'
							allowClear
							style={{ width: 140 }}
							options={CATEGORY_OPTIONS}
						/>
					</Form.Item>
					<Form.Item name='subType' label='具体类型'>
						<Input placeholder='请输入具体类型' allowClear />
					</Form.Item>
					<Form.Item name='grade' label='品阶'>
						<Input placeholder='请输入品阶' allowClear />
					</Form.Item>
					<Form.Item>
						<Space>
							<Button
								type='primary'
								htmlType='submit'
								icon={<SearchOutlined />}
							>
								查询
							</Button>
							<Button onClick={onReset}>重置</Button>
						</Space>
					</Form.Item>
				</Form>
				<Space>
					<Button
						type='primary'
						icon={<PlusOutlined />}
						onClick={() => onEdit()}
					>
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
				scroll={{ x: 1400 }}
			/>
			<Modal
				title={editId ? '编辑装备' : '新增装备'}
				open={isOpen}
				onOk={onSave}
				onCancel={onCancel}
				width={960}
				destroyOnHidden
				forceRender
				styles={{
					body: { maxHeight: '70vh', overflowY: 'auto', overflowX: 'hidden' }
				}}
			>
				<Form form={form} labelCol={{ flex: '0 0 110px' }} onFinish={onFinish}>
					<Divider titlePlacement='left' plain>
						基本信息
					</Divider>
					<Row gutter={16}>
						<Col span={12}>
							<Form.Item
								name='name'
								label='装备名称'
								rules={[{ required: true, message: '请输入装备名称' }]}
							>
								<Input placeholder='请输入装备名称' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item
								name='category'
								label='类型'
								rules={[{ required: true, message: '请选择类型' }]}
							>
								<Select placeholder='请选择类型' options={CATEGORY_OPTIONS} />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='subType' label='具体类型'>
								<Input placeholder='请输入具体类型' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='grade' label='品阶'>
								<Input placeholder='请输入品阶' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='classReq' label='职业限制'>
								<Input placeholder='请输入职业限制' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='levelReq' label='等级要求'>
								<Input placeholder='请输入等级要求' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='price' label='价格'>
								<Input placeholder='请输入价格' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='source' label='数据来源'>
								<Input placeholder='请输入数据来源键' />
							</Form.Item>
						</Col>
					</Row>

					<Divider titlePlacement='left' plain>
						属性需求
					</Divider>
					<Row gutter={16}>
						<Col span={12}>
							<Form.Item name='strReq' label='力量要求'>
								<Input placeholder='请输入力量要求' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='agiReq' label='敏捷要求'>
								<Input placeholder='请输入敏捷要求' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='intReq' label='灵力要求'>
								<Input placeholder='请输入灵力要求' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='vitReq' label='体质要求'>
								<Input placeholder='请输入体质要求' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='agiOrIntReq' label='敏捷或灵力'>
								<Input placeholder='请输入敏捷或灵力要求' />
							</Form.Item>
						</Col>
						<Col span={24}>
							<Form.Item name='requirements' label='属性要求'>
								<Input.TextArea
									{...textAreaProps}
									placeholder='JSON 格式，如 {"力量":174,"敏捷":147}'
								/>
							</Form.Item>
						</Col>
					</Row>

					<Divider titlePlacement='left' plain>
						攻击与耐久
					</Divider>
					<Row gutter={16}>
						<Col span={12}>
							<Form.Item name='attackRate' label='攻击频率'>
								<Input placeholder='请输入攻击频率(次/秒)' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='attackRange' label='攻击距离'>
								<Input placeholder='请输入攻击距离' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='ammo' label='弹药类型'>
								<Input placeholder='请输入弹药类型' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='durabilityMin' label='耐久下限'>
								<Input placeholder='请输入耐久下限' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='durabilityMax' label='耐久上限'>
								<Input placeholder='请输入耐久上限' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='durability' label='耐久度'>
								<Input placeholder='请输入耐久度(下限/上限)' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='refineAttr' label='精炼属性名'>
								<Input placeholder='请输入精炼属性名' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='refineValue' label='精炼属性值'>
								<Input placeholder='请输入精炼属性值' />
							</Form.Item>
						</Col>
					</Row>

					<Divider titlePlacement='left' plain>
						物理攻击
					</Divider>
					<Row gutter={16}>
						<Col span={12}>
							<Form.Item name='physAtkMin' label='攻击下限'>
								<Input placeholder='请输入攻击下限' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='physAtkMaxMin' label='攻击上限最小值'>
								<Input placeholder='请输入攻击上限最小值' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='physAtkMaxMax' label='攻击上限最大值'>
								<Input placeholder='请输入攻击上限最大值' />
							</Form.Item>
						</Col>
					</Row>

					<Divider titlePlacement='left' plain>
						法术攻击
					</Divider>
					<Row gutter={16}>
						<Col span={12}>
							<Form.Item name='magicAtkMin' label='攻击下限'>
								<Input placeholder='请输入攻击下限' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='magicAtkMaxMin' label='攻击上限最小值'>
								<Input placeholder='请输入攻击上限最小值' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='magicAtkMaxMax' label='攻击上限最大值'>
								<Input placeholder='请输入攻击上限最大值' />
							</Form.Item>
						</Col>
					</Row>

					<Divider titlePlacement='left' plain>
						材料
					</Divider>
					<Form.Item label='材料列表'>
						<div>
							{materialList.map((item, index) => (
								<Row
									key={index}
									gutter={[15, 15]}
									align='middle'
									className='mb-3'
								>
									<Col span={4}>
										<Select
											placeholder='材料类型'
											style={{ width: '100%' }}
											value={item.isCore}
											options={[
												{ value: 0, label: '普通材料' },
												{ value: 1, label: '核心材料' }
											]}
											onChange={(value) =>
												updateMaterialItem(index, 'isCore', value)
											}
										/>
									</Col>
									<Col span={10}>
										<Input
											placeholder='材料名称'
											value={item.materialName}
											onChange={(e) =>
												updateMaterialItem(
													index,
													'materialName',
													e.target.value
												)
											}
										/>
									</Col>
									<Col span={8}>
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
					<Divider titlePlacement='left' plain>
						属性列表
					</Divider>
					<Form.Item label='属性列表'>
						<div>
							{attributeList.map((item, index) => (
								<div
									key={index}
									style={{
										border: '1px solid #f0f0f0',
										borderRadius: 6,
										padding: 12,
										marginBottom: 12
									}}
								>
									<Row gutter={[15, 15]} align='middle'>
										<Col span={5}>
											<Select
												placeholder='属性分组'
												style={{ width: '100%' }}
												value={item.attrGroup}
												options={[
													{ value: 'basic', label: '基础属性' },
													{ value: 'bonus', label: '附加属性' },
													{ value: 'set', label: '套装属性' }
												]}
												onChange={(value) =>
													updateAttributeItem(index, 'attrGroup', value)
												}
											/>
										</Col>
										<Col span={8}>
											<Input
												placeholder='属性名称'
												value={item.attrName}
												onChange={(e) =>
													updateAttributeItem(index, 'attrName', e.target.value)
												}
											/>
										</Col>
										<Col span={4}>
											<Select
												placeholder='百分比'
												style={{ width: '100%' }}
												value={item.isPercent}
												options={[
													{ value: 0, label: '数值' },
													{ value: 1, label: '百分比' }
												]}
												onChange={(value) =>
													updateAttributeItem(index, 'isPercent', value)
												}
											/>
										</Col>
										<Col span={5}>
											<Input
												placeholder='单位'
												value={item.unit}
												onChange={(e) =>
													updateAttributeItem(index, 'unit', e.target.value)
												}
											/>
										</Col>
										<Col span={2}>
											<Button
												type='text'
												danger
												icon={<MinusCircleOutlined />}
												onClick={() => removeAttributeItem(index)}
											/>
										</Col>
									</Row>
									<Row gutter={[15, 15]} align='middle' style={{ marginTop: 12 }}>
										<Col span={5}>
											<Input
												placeholder='值'
												value={item.value}
												onChange={(e) =>
													updateAttributeItem(index, 'value', e.target.value)
												}
											/>
										</Col>
										<Col span={5}>
											<Input
												placeholder='最小值'
												value={item.minValue}
												onChange={(e) =>
													updateAttributeItem(index, 'minValue', e.target.value)
												}
											/>
										</Col>
										<Col span={5}>
											<Input
												placeholder='最大值'
												value={item.maxValue}
												onChange={(e) =>
													updateAttributeItem(index, 'maxValue', e.target.value)
												}
											/>
										</Col>
										<Col span={9}>
											<Input
												placeholder='精炼附加值'
												value={item.refineValue}
												onChange={(e) =>
													updateAttributeItem(index, 'refineValue', e.target.value)
												}
											/>
										</Col>
									</Row>
									<Row gutter={[15, 15]} style={{ marginTop: 12 }}>
										<Col span={24}>
											<Input
												placeholder='描述'
												value={item.description}
												onChange={(e) =>
													updateAttributeItem(index, 'description', e.target.value)
												}
											/>
										</Col>
									</Row>
								</div>
							))}
							<Button
								type='dashed'
								block
								icon={<PlusOutlined />}
								onClick={addAttributeItem}
								style={{ marginTop: 4 }}
							>
								添加属性
							</Button>
						</div>
					</Form.Item>
					<Divider titlePlacement='left' plain>
						属性与描述
					</Divider>
					<Row gutter={16}>
						<Col span={24}>
							<Form.Item name='attributes' label='基础属性'>
								<Input.TextArea
									{...textAreaProps}
									placeholder='JSON 格式，如 [{"k":"物理攻击","v":"434-484"}]'
								/>
							</Form.Item>
						</Col>
						<Col span={24}>
							<Form.Item name='bonuses' label='附加属性'>
								<Input.TextArea
									{...textAreaProps}
									placeholder='JSON 格式，如 [{"k":"致命一击机率","v":"+2%"}]'
								/>
							</Form.Item>
						</Col>
						<Col span={24}>
							<Form.Item name='description' label='描述文本'>
								<Input.TextArea
									{...textAreaProps}
									placeholder='请输入描述文本(特效/说明等)'
								/>
							</Form.Item>
						</Col>
						<Col span={24}>
							<Form.Item name='specialRule' label='特殊规则'>
								<Input.TextArea
									{...textAreaProps}
									placeholder='请输入特殊规则(死亡保护/不可交易等)'
								/>
							</Form.Item>
						</Col>
						<Col span={24}>
							<Form.Item name='rawText' label='原始文本'>
								<Input.TextArea
									{...textAreaProps}
									placeholder='请输入原始文本'
								/>
							</Form.Item>
						</Col>
					</Row>

					<Divider titlePlacement='left' plain>
						套装属性
					</Divider>
					<Row gutter={16}>
						<Col span={12}>
							<Form.Item name='setName' label='套装名称'>
								<Input placeholder='请输入套装名称' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='setCount' label='套装件数'>
								<Input placeholder='请输入套装件数' />
							</Form.Item>
						</Col>
						<Col span={24}>
							<Form.Item name='setBonuses' label='套装加成'>
								<Input.TextArea
									{...textAreaProps}
									placeholder='JSON 格式，如 ["(2) 体质+10"]'
								/>
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Modal>
		</div>
	);
};
