import { useEffect, useMemo, useState } from 'react';
import {
	App,
	Button,
	Form,
	Input,
	Modal,
	Radio,
	Select,
	Space,
	Table,
	Tag
} from 'antd';
import {
	DeleteOutlined,
	EditOutlined,
	FileTextOutlined,
	FolderOpenOutlined,
	FolderOutlined,
	PlusOutlined,
	SearchOutlined
} from '@ant-design/icons';
import {
	addDictData,
	addDictType,
	deleteDictData,
	deleteDictType,
	getDictDataById,
	getDictDataList,
	getDictTypeById,
	getDictTypeList,
	getDictTypeOptionSelect,
	updateDictData,
	updateDictType
} from '@/service';
import { usePermission } from '@/authority';

type Option = { value: string; label: string };

export const Component = () => {
	const { message, modal } = App.useApp();
	const { hasPermi } = usePermission();
	const [typeOpen, setTypeOpen] = useState(false);
	const [dataOpen, setDataOpen] = useState(false);
	const [editTypeId, setEditTypeId] = useState<string | number>('');
	const [editDataId, setEditDataId] = useState<string | number>('');
	const [typeOptions, setTypeOptions] = useState<Option[]>([]);
	const [typeRows, setTypeRows] = useState<AnyObject[]>([]);
	const [loading, setLoading] = useState(false);
	const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());
	const [childrenMap, setChildrenMap] = useState<Record<string, AnyObject[]>>({});

	const [searchForm] = Form.useForm();
	const [typeForm] = Form.useForm();
	const [dataForm] = Form.useForm();

	const getTypeData = (params: AnyObject = {}) => {
		setLoading(true);
		setExpandedTypes(new Set());
		setChildrenMap({});
		getDictTypeList({ pageSize: 1000, ...params })
			.then((result) => {
				setLoading(false);
				setTypeRows(result.data?.data ?? []);
			})
			.catch(() => setLoading(false));
	};

	const getTypeOptions = () => {
		getDictTypeOptionSelect().then((result) => {
			setTypeOptions(
				(result.data || []).map((item: AnyObject) => ({
					value: item.dictType,
					label: item.dictName
				}))
			);
		});
	};

	const reloadChildren = (dictType: string) => {
		getDictDataList({ dictType, pageNum: 1, pageSize: 1000 }).then((result) => {
			setChildrenMap((prev) => ({ ...prev, [dictType]: result.data?.data ?? [] }));
		});
	};

	const toggleExpand = (dictType: string) => {
		const next = new Set(expandedTypes);
		if (next.has(dictType)) {
			next.delete(dictType);
			setExpandedTypes(next);
			return;
		}
		next.add(dictType);
		setExpandedTypes(next);
		if (!childrenMap[dictType]) {
			reloadChildren(dictType);
		}
	};

	const onSearch = (values: AnyObject) => {
		getTypeData({
			dictName: values.dictName || undefined,
			dictType: values.dictType || undefined
		});
	};

	const onReset = () => {
		searchForm.resetFields();
		getTypeData();
	};

	const onFinishType = (values: AnyObject) => {
		if (editTypeId) {
			updateDictType({ ...values, id: editTypeId }).then(() => {
				message.success('修改成功');
				onCancelType();
				getTypeData();
				getTypeOptions();
			});
		} else {
			addDictType(values).then(() => {
				message.success('新增成功');
				onCancelType();
				getTypeData();
				getTypeOptions();
			});
		}
	};

	const onFinishData = (values: AnyObject) => {
		if (editDataId) {
			updateDictData({ ...values, id: editDataId }).then(() => {
				message.success('修改成功');
				onCancelData();
				reloadChildren(values.dictType);
			});
		} else {
			addDictData(values).then(() => {
				message.success('新增成功');
				onCancelData();
				reloadChildren(values.dictType);
			});
		}
	};

	const onEditType = (id?: string | number) => {
		if (id) {
			setEditTypeId(id);
			getDictTypeById(id).then((result) => {
				typeForm.setFieldsValue(result.data);
				setTypeOpen(true);
			});
		} else {
			setEditTypeId('');
			typeForm.resetFields();
			setTypeOpen(true);
		}
	};

	const onCancelType = () => {
		setTypeOpen(false);
		setEditTypeId('');
		typeForm.resetFields();
	};

	const onDeleteType = (id: string | number) => {
		modal.confirm({
			title: '系统提示',
			content: '是否确认删除该字典类型?',
			onOk() {
				deleteDictType(id).then(() => {
					message.success('删除成功');
					getTypeData();
					getTypeOptions();
				});
			}
		});
	};

	const onEditData = (id?: string | number, dictType?: string) => {
		if (id) {
			setEditDataId(id);
			getDictDataById(id).then((result) => {
				dataForm.setFieldsValue(result.data);
				setDataOpen(true);
			});
		} else {
			setEditDataId('');
			dataForm.resetFields();
			if (dictType) {
				dataForm.setFieldValue('dictType', dictType);
			}
			setDataOpen(true);
		}
	};

	const onCancelData = () => {
		setDataOpen(false);
		setEditDataId('');
		dataForm.resetFields();
	};

	const onDeleteData = (record: AnyObject) => {
		modal.confirm({
			title: '系统提示',
			content: '是否确认删除该字典数据?',
			onOk() {
				deleteDictData(record.id).then(() => {
					message.success('删除成功');
					reloadChildren(record.dictType);
				});
			}
		});
	};

	const onEdit = (record: AnyObject) => {
		if (record.isData) {
			onEditData(record.id);
		} else {
			onEditType(record.id);
		}
	};

	const onDelete = (record: AnyObject) => {
		if (record.isData) {
			onDeleteData(record);
		} else {
			onDeleteType(record.id);
		}
	};

	const rows = useMemo(() => {
		const list: AnyObject[] = [];
		typeRows.forEach((item) => {
			list.push({ ...item, rowKey: `type-${item.id}`, __depth: 0, isData: false });
			if (expandedTypes.has(item.dictType)) {
				(childrenMap[item.dictType] || []).forEach((data) => {
					list.push({ ...data, rowKey: `data-${data.id}`, __depth: 1, isData: true });
				});
			}
		});
		return list;
	}, [typeRows, expandedTypes, childrenMap]);

	const columns = [
		{
			title: '',
			dataIndex: 'expand',
			width: 60,
			render: (_: any, row: AnyObject) => {
				if (row.isData) {
					return <FileTextOutlined style={{ marginLeft: 20, opacity: 0.5 }} />;
				}
				const expanded = expandedTypes.has(row.dictType);
				return (
					<Button
						type='link'
						size='small'
						icon={expanded ? <FolderOpenOutlined /> : <FolderOutlined />}
						title={expanded ? '收起' : '展开'}
						onClick={() => toggleExpand(row.dictType)}
					/>
				);
			}
		},
		{
			title: '字典名称',
			dataIndex: 'dictName',
			render: (_: any, row: AnyObject) => {
				const text = row.isData ? row.dictLabel : row.dictName;
				return <div style={{ paddingLeft: (row.__depth ?? 0) * 24 }}>{text}</div>;
			}
		},
		{
			title: '字典类型',
			dataIndex: 'dictType',
			render: (_: any, row: AnyObject) => {
				return row.isData ? row.dictValue : row.dictType;
			}
		},
		{
			title: '状态',
			dataIndex: 'status',
			render: (value: any) => (
				<Tag color={value == 0 ? 'success' : 'error'}>
					{value == 0 ? '正常' : '停用'}
				</Tag>
			)
		},
		{
			title: '创建时间',
			dataIndex: 'createTime'
		},
		{
			title: '备注',
			dataIndex: 'remark'
		},
		{
			title: '操作',
			dataIndex: 'action',
			width: 120,
			render: (_: any, row: AnyObject) => (
				<>
					{hasPermi('system:dict:edit') && (
						<Button
							type='link'
							size='small'
							icon={<EditOutlined />}
							title='编辑'
							onClick={() => onEdit(row)}
						/>
					)}
					{hasPermi('system:dict:add') && (
						<Button
							type='link'
							size='small'
							icon={<PlusOutlined />}
							title='添加'
							disabled={row.isData}
							onClick={() => onEditData(undefined, row.dictType)}
						/>
					)}
					{hasPermi('system:dict:remove') && (
						<Button
							type='link'
							size='small'
							danger
							icon={<DeleteOutlined />}
							title='删除'
							onClick={() => onDelete(row)}
						/>
					)}
				</>
			)
		}
	];

	useEffect(() => {
		getTypeData();
		getTypeOptions();
	}, []);

	return (
		<div className='p-4 flex flex-col gap-4'>
			<div className='flex items-center justify-between'>
				<Form form={searchForm} layout='inline' onFinish={onSearch}>
					<Form.Item name='dictName' label='字典名称'>
						<Input placeholder='请输入字典名称' />
					</Form.Item>
					<Form.Item name='dictType' label='字典类型'>
						<Input placeholder='请输入字典类型' />
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
				{hasPermi('system:dict:add') && (
					<Button
						type='primary'
						icon={<PlusOutlined />}
						onClick={() => onEditType()}
					>
						新建
					</Button>
				)}
			</div>
			<Table
				loading={loading}
				dataSource={rows}
				rowKey='rowKey'
				pagination={false}
				columns={columns}
			/>

			<Modal
				title={editTypeId ? '编辑字典类型' : '新增字典类型'}
				open={typeOpen}
				destroyOnHidden
				forceRender
				onOk={() => typeForm.submit()}
				onCancel={onCancelType}
			>
				<Form
					form={typeForm}
					labelCol={{ flex: '0 0 100px' }}
					initialValues={{ dictName: '', dictType: '', status: '0', remark: '' }}
					onFinish={onFinishType}
				>
					<Form.Item
						name='dictName'
						label='字典名称'
						rules={[{ required: true, message: '请输入字典名称' }]}
					>
						<Input placeholder='请输入字典名称' />
					</Form.Item>
					<Form.Item
						name='dictType'
						label='字典类型'
						rules={[{ required: true, message: '请输入字典类型' }]}
					>
						<Input placeholder='请输入字典类型' />
					</Form.Item>
					<Form.Item name='status' label='状态'>
						<Radio.Group>
							<Radio value='0'>正常</Radio>
							<Radio value='1'>停用</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item name='remark' label='备注'>
						<Input.TextArea placeholder='请输入备注' />
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				title={editDataId ? '编辑字典数据' : '新增字典数据'}
				open={dataOpen}
				destroyOnHidden
				forceRender
				onOk={() => dataForm.submit()}
				onCancel={onCancelData}
			>
				<Form
					form={dataForm}
					labelCol={{ flex: '0 0 100px' }}
					initialValues={{
						dictType: '',
						dictLabel: '',
						dictValue: '',
						dictSort: 0,
						status: '0',
						remark: ''
					}}
					onFinish={onFinishData}
				>
					<Form.Item
						name='dictType'
						label='字典类型'
						rules={[{ required: true, message: '请选择字典类型' }]}
					>
						<Select placeholder='请选择字典类型' options={typeOptions} />
					</Form.Item>
					<Form.Item
						name='dictLabel'
						label='字典标签'
						rules={[{ required: true, message: '请输入字典标签' }]}
					>
						<Input placeholder='请输入字典标签' />
					</Form.Item>
					<Form.Item
						name='dictValue'
						label='字典键值'
						rules={[{ required: true, message: '请输入字典键值' }]}
					>
						<Input placeholder='请输入字典键值' />
					</Form.Item>
					<Form.Item name='dictSort' label='字典排序'>
						<Input placeholder='请输入字典排序' />
					</Form.Item>
					<Form.Item name='status' label='状态'>
						<Radio.Group>
							<Radio value='0'>正常</Radio>
							<Radio value='1'>停用</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item name='remark' label='备注'>
						<Input.TextArea placeholder='请输入备注' />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};
