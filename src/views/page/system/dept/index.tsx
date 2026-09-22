import * as Yup from 'yup';
import xe from 'xe-utils';
import {
	useEffect,
	useState } from 'react';
import { Button,
	Chip,
	IconButton,
	RadioGroup } from '@mui/material';
import { useFormik,
	type FormikValues } from 'formik';
import {
	AddRegular,
	EditRegular,
	DeleteRegular
} from '@fluentui/react-icons';
import {
	Form,
	getColumnData,
	PageOverlay,
	Input,
	Modal,
	Radio,
	Table,
	TreeSelect,
	confirm,
	message
} from '@/plugins';
import {
	addDept,
	deleteDept,
	getDeptById,
	getDeptList,
	getDeptTreeSelect,
	updateDept
} from '@/service';
import { usePermission } from '@/authority';

const flattenTree = (tree: AnyObject[], depth = 0, result: AnyObject[] = []) => {
	tree.forEach((node) => {
		result.push({ ...node, __depth: depth });
		if (node.children?.length) {
			flattenTree(node.children, depth + 1, result);
		}
	});
	return result;
};

export const Component = () => {
	const { hasPermi } = usePermission();
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [rows, setRows] = useState<AnyObject[]>([]);
	const [loading, setLoading] = useState(false);
	const [parentTree, setParentTree] = useState<AnyObject[]>([]);

	const getData = () => {
		setLoading(true);
		getDeptList()
			.then((result) => {
				setLoading(false);
				const tree = xe.toArrayTree(result.data || []);
				setRows(flattenTree(tree));
			})
			.catch(() => setLoading(false));
	};

	const getParentData = () => {
		getDeptTreeSelect().then((result) => {
			setParentTree(result.data || []);
		});
	};

	const formik = useFormik<FormikValues>({
		initialValues: {
			parentId: '',
			deptName: '',
			orderNum: 0,
			status: '0',
			leader: '',
			email: '',
			phone: ''
		},
		validationSchema: Yup.object().shape({
			deptName: Yup.string().required('请输入部门名称')
		}),
		onSubmit(values) {
			const params = { ...values, parentId: values.parentId || 0 };
			if (editId) {
				updateDept({ ...params, id: editId }).then(() => {
					message.success('修改成功');
					onCancel();
					getData();
					getParentData();
				});
			} else {
				addDept(params).then(() => {
					message.success('新增成功');
					onCancel();
					getData();
					getParentData();
				});
			}
		}
	});

	const onEdit = (id?: string | number, parentId?: string | number) => {
		if (id) {
			setEditId(id);
			getDeptById(id).then((result) => {
				formik.resetForm();
				formik.setValues(result.data);
				setIsOpen(true);
			});
		} else {
			setEditId('');
			formik.resetForm();
			if (parentId) {
				formik.setFieldValue('parentId', parentId);
			}
			setIsOpen(true);
		}
	};

	const onSave = () => {
		formik.handleSubmit();
	};

	const onCancel = () => {
		setIsOpen(false);
		setEditId('');
		formik.resetForm();
	};

	const onDelete = (id: string | number) => {
		confirm({
			type: 'warning',
			title: '系统提示',
			content: '是否确认删除该部门?',
			onOk() {
				deleteDept(id).then(() => {
					message.success('删除成功');
					getData();
					getParentData();
				});
			}
		});
	};

	useEffect(() => {
		getData();
		getParentData();
	}, []);

	return (
		<PageOverlay>
			<div className='flex items-center justify-end'>
				{hasPermi('system:dept:add') && (
					<Button
						variant='contained'
						startIcon={<AddRegular />}
						onClick={() => onEdit()}
					>
						新建
					</Button>
				)}
			</div>
			<Table
				loading={loading}
				rows={rows}
				columns={getColumnData([
					{
						field: 'deptName',
						headerName: '部门名称',
						renderCell({ row }) {
							return (
								<div style={{ paddingLeft: (row.__depth ?? 0) * 24 }}>
									{row.deptName}
								</div>
							);
						}
					},
					{
						field: 'orderNum',
						headerName: '排序',
						flex: 0.4
					},
					{
						field: 'status',
						headerName: '状态',
						flex: 0.5,
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
						field: 'id',
						headerName: '操作',
						flex: 0,
						width: 160,
						renderCell({ row }) {
							return (
								<>
									{hasPermi('system:dept:edit') && (
										<IconButton
											color='primary'
											size='small'
											title='编辑'
											onClick={() => onEdit(row.id)}
										>
											<EditRegular />
										</IconButton>
									)}
									{hasPermi('system:dept:add') && (
										<IconButton
											color='success'
											size='small'
											title='添加'
											onClick={() => onEdit(undefined, row.id)}
										>
											<AddRegular />
										</IconButton>
									)}
									{hasPermi('system:dept:remove') && (
										<IconButton
											color='error'
											size='small'
											title='删除'
											onClick={() => onDelete(row.id)}
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
				title={editId ? '编辑部门' : '新增部门'}
				open={isOpen}
				onOk={onSave}
				onClose={onCancel}
			>
				<Form labelCol={{ flex: '0 0 100px' }} formik={formik}>
					<Form.Item name='parentId' label='上级部门'>
						<TreeSelect placeholder='请选择上级部门' treeData={parentTree} />
					</Form.Item>
					<Form.Item required name='deptName' label='部门名称'>
						<Input size='small' placeholder='请输入部门名称' />
					</Form.Item>
					<Form.Item name='orderNum' label='显示排序'>
						<Input size='small' placeholder='请输入显示排序' />
					</Form.Item>
					<Form.Item name='status' label='状态'>
						<RadioGroup row>
							<Radio value='0' label='正常' />
							<Radio value='1' label='停用' />
						</RadioGroup>
					</Form.Item>
					<Form.Item name='leader' label='负责人'>
						<Input size='small' placeholder='请输入负责人' />
					</Form.Item>
					<Form.Item name='email' label='邮箱'>
						<Input size='small' placeholder='请输入邮箱' />
					</Form.Item>
					<Form.Item name='phone' label='联系电话'>
						<Input size='small' placeholder='请输入联系电话' />
					</Form.Item>
				</Form>
			</Modal>
		</PageOverlay>
	);
};
