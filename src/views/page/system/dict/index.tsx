import * as Yup from 'yup';
import {
	useEffect,
	useMemo,
	useState } from 'react';
import { Button,
	Chip,
	IconButton,
	MenuItem,
	RadioGroup,
	Stack } from '@mui/material';
import { useFormik,
	type FormikValues } from 'formik';
import {
	AddRegular,
	EditRegular,
	DeleteRegular,
	DocumentTextRegular,
	FolderOpenRegular,
	FolderRegular,
	SearchRegular
} from '@fluentui/react-icons';
import {
	Form,
	getColumnData,
	PageOverlay,
	Input,
	Modal,
	Radio,
	Select,
	Table,
	confirm,
	message
} from '@/plugins';
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

	const search = useFormik<FormikValues>({
		initialValues: { dictName: '', dictType: '' },
		onSubmit(values) {
			getTypeData({
				dictName: values.dictName || undefined,
				dictType: values.dictType || undefined
			});
		},
		onReset() {
			getTypeData();
		}
	});

	const typeFormik = useFormik<FormikValues>({
		initialValues: {
			dictName: '',
			dictType: '',
			status: '0',
			remark: ''
		},
		validationSchema: Yup.object().shape({
			dictName: Yup.string().required('请输入字典名称'),
			dictType: Yup.string().required('请输入字典类型')
		}),
		onSubmit(values) {
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
		}
	});

	const dataFormik = useFormik<FormikValues>({
		initialValues: {
			dictType: '',
			dictLabel: '',
			dictValue: '',
			dictSort: 0,
			status: '0',
			remark: ''
		},
		validationSchema: Yup.object().shape({
			dictType: Yup.string().required('请选择字典类型'),
			dictLabel: Yup.string().required('请输入字典标签'),
			dictValue: Yup.string().required('请输入字典键值')
		}),
		onSubmit(values) {
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
		}
	});

	const onEditType = (id?: string | number) => {
		if (id) {
			setEditTypeId(id);
			getDictTypeById(id).then((result) => {
				typeFormik.resetForm();
				typeFormik.setValues(result.data);
				setTypeOpen(true);
			});
		} else {
			setEditTypeId('');
			typeFormik.resetForm();
			setTypeOpen(true);
		}
	};

	const onSaveType = () => {
		typeFormik.handleSubmit();
	};

	const onCancelType = () => {
		setTypeOpen(false);
		setEditTypeId('');
		typeFormik.resetForm();
	};

	const onDeleteType = (id: string | number) => {
		confirm({
			type: 'warning',
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
				dataFormik.resetForm();
				dataFormik.setValues(result.data);
				setDataOpen(true);
			});
		} else {
			setEditDataId('');
			dataFormik.resetForm();
			if (dictType) {
				dataFormik.setFieldValue('dictType', dictType);
			}
			setDataOpen(true);
		}
	};

	const onSaveData = () => {
		dataFormik.handleSubmit();
	};

	const onCancelData = () => {
		setDataOpen(false);
		setEditDataId('');
		dataFormik.resetForm();
	};

	const onDeleteData = (record: AnyObject) => {
		confirm({
			type: 'warning',
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

	useEffect(() => {
		getTypeData();
		getTypeOptions();
	}, []);

	return (
		<PageOverlay>
			<div className='flex items-center justify-between'>
				<Form layout='inline' formik={search}>
					<Form.Item name='dictName' label='字典名称'>
						<Input size='small' placeholder='请输入字典名称' />
					</Form.Item>
					<Form.Item name='dictType' label='字典类型'>
						<Input size='small' placeholder='请输入字典类型' />
					</Form.Item>
					<Form.Item>
						<Stack direction='row' spacing={2}>
							<Button variant='contained' type='submit' startIcon={<SearchRegular />}>
								查询
							</Button>
							<Button variant='outlined' type='reset'>
								重置
							</Button>
						</Stack>
					</Form.Item>
				</Form>
				{hasPermi('system:dict:add') && (
					<Button
						variant='contained'
						startIcon={<AddRegular />}
						onClick={() => onEditType()}
					>
						新建
					</Button>
				)}
			</div>
			<Table
				loading={loading}
				rows={rows}
				getRowId={(row) => row.rowKey}
				columns={getColumnData([
					{
						field: 'expand',
						headerName: '',
						flex: 0.3,
						renderCell({ row }) {
							if (row.isData) {
								return <DocumentTextRegular style={{ marginLeft: 20, opacity: 0.5 }} />;
							}
							const expanded = expandedTypes.has(row.dictType);
							return (
								<IconButton
									size='small'
									title={expanded ? '收起' : '展开'}
									onClick={() => toggleExpand(row.dictType)}
								>
									{expanded ? <FolderOpenRegular /> : <FolderRegular />}
								</IconButton>
							);
						}
					},
					{
						field: 'dictName',
						headerName: '字典名称',
						renderCell({ row }) {
							const text = row.isData ? row.dictLabel : row.dictName;
							return <div style={{ paddingLeft: (row.__depth ?? 0) * 24 }}>{text}</div>;
						}
					},
					{
						field: 'dictType',
						headerName: '字典类型',
						renderCell({ row }) {
							return row.isData ? row.dictValue : row.dictType;
						}
					},
					{
						field: 'status',
						headerName: '状态',
						flex: 0.6,
						renderCell({ value }) {
							return (
								<Chip
									size='small'
									color={value == 0 ? 'success' : 'error'}
									label={value == 0 ? '正常' : '停用'}
								/>
							);
						}
					},
					{
						field: 'createTime',
						headerName: '创建时间'
					},
					{
						field: 'remark',
						headerName: '备注'
					},
					{
						field: 'action',
						headerName: '操作',
						flex: 0,
						width: 120,
						renderCell({ row }) {
							return (
								<>
									{hasPermi('system:dict:edit') && (
										<IconButton
											color='primary'
											size='small'
											title='编辑'
											onClick={() => onEdit(row)}
										>
											<EditRegular />
										</IconButton>
									)}
									{hasPermi('system:dict:add') && (
										<IconButton
											color='success'
											size='small'
											title='添加'
											disabled={row.isData}
											onClick={() => onEditData(undefined, row.dictType)}
										>
											<AddRegular />
										</IconButton>
									)}
									{hasPermi('system:dict:remove') && (
										<IconButton
											color='error'
											size='small'
											title='删除'
											onClick={() => onDelete(row)}
										>
											<DeleteRegular />
										</IconButton>
									)}
								</>
							);
						}
					}
				])}
			/>

			<Modal
				title={editTypeId ? '编辑字典类型' : '新增字典类型'}
				open={typeOpen}
				onOk={onSaveType}
				onClose={onCancelType}
			>
				<Form labelCol={{ flex: '0 0 100px' }} formik={typeFormik}>
					<Form.Item required name='dictName' label='字典名称'>
						<Input size='small' placeholder='请输入字典名称' />
					</Form.Item>
					<Form.Item required name='dictType' label='字典类型'>
						<Input size='small' placeholder='请输入字典类型' />
					</Form.Item>
					<Form.Item name='status' label='状态'>
						<RadioGroup row>
							<Radio value='0' label='正常' />
							<Radio value='1' label='停用' />
						</RadioGroup>
					</Form.Item>
					<Form.Item name='remark' label='备注'>
						<Input.TextArea placeholder='请输入备注' />
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				title={editDataId ? '编辑字典数据' : '新增字典数据'}
				open={dataOpen}
				onOk={onSaveData}
				onClose={onCancelData}
			>
				<Form labelCol={{ flex: '0 0 100px' }} formik={dataFormik}>
					<Form.Item required name='dictType' label='字典类型'>
						<Select placeholder='请选择字典类型'>
							{typeOptions.map((item) => (
								<MenuItem key={item.value} value={item.value}>
									{item.label}
								</MenuItem>
							))}
						</Select>
					</Form.Item>
					<Form.Item required name='dictLabel' label='字典标签'>
						<Input size='small' placeholder='请输入字典标签' />
					</Form.Item>
					<Form.Item required name='dictValue' label='字典键值'>
						<Input size='small' placeholder='请输入字典键值' />
					</Form.Item>
					<Form.Item name='dictSort' label='字典排序'>
						<Input size='small' placeholder='请输入字典排序' />
					</Form.Item>
					<Form.Item name='status' label='状态'>
						<RadioGroup row>
							<Radio value='0' label='正常' />
							<Radio value='1' label='停用' />
						</RadioGroup>
					</Form.Item>
					<Form.Item name='remark' label='备注'>
						<Input.TextArea placeholder='请输入备注' />
					</Form.Item>
				</Form>
			</Modal>
		</PageOverlay>
	);
};
