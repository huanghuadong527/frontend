import * as Yup from 'yup';
import xe from 'xe-utils';
import {
	useEffect,
	useState } from 'react';
import { Button,
	Chip,
	IconButton,
	RadioGroup,
	Stack } from '@mui/material';
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
	addMenu,
	deleteMenu,
	getMenuById,
	getMenuList,
	getMenuTreeSelect,
	updateMenu
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
		getMenuList()
			.then((result) => {
				setLoading(false);
				const tree = xe.toArrayTree(result.data || []);
				setRows(flattenTree(tree));
			})
			.catch(() => setLoading(false));
	};

	const getParentData = () => {
		getMenuTreeSelect().then((result) => {
			setParentTree(result.data || []);
		});
	};

	const formik = useFormik<FormikValues>({
		initialValues: {
			parentId: '',
			menuName: '',
			orderNum: 0,
			menuType: 'M',
			path: '',
			perms: '',
			icon: '',
			status: '0',
			isFrame: '1'
		},
		validationSchema: Yup.object().shape({
			menuName: Yup.string().required('请输入菜单名称')
		}),
		onSubmit(values) {
			const params = { ...values, parentId: values.parentId || 0 };
			if (editId) {
				updateMenu({ ...params, id: editId }).then(() => {
					message.success('修改成功');
					onCancel();
					getData();
					getParentData();
				});
			} else {
				addMenu(params).then(() => {
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
			getMenuById(id).then((result) => {
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
			content: '是否确认删除该菜单?',
			onOk() {
				deleteMenu(id).then(() => {
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

	const menuType = formik.values.menuType;

	return (
		<PageOverlay>
			<div className='flex items-center justify-end'>
				<Stack direction='row' spacing={2}>
					{hasPermi('system:menu:add') && (
						<Button
							variant='contained'
							startIcon={<AddRegular />}
							onClick={() => onEdit()}
						>
							新建
						</Button>
					)}
				</Stack>
			</div>
			<Table
				loading={loading}
				rows={rows}
				columns={getColumnData([
					{
						field: 'menuName',
						headerName: '菜单名称',
						renderCell({ row }) {
							return (
								<div style={{ paddingLeft: (row.__depth ?? 0) * 24 }}>
									{row.menuName}
								</div>
							);
						}
					},
					{
						field: 'menuType',
						headerName: '类型',
						flex: 0.5,
						renderCell({ value }) {
							return value == 'M' ? '目录' : value == 'C' ? '菜单' : '按钮';
						}
					},
					{
						field: 'path',
						headerName: '菜单地址'
					},
					{
						field: 'icon',
						headerName: '图标',
						flex: 0.5
					},
					{
						field: 'orderNum',
						headerName: '排序',
						flex: 0.4
					},
					{
						field: 'perms',
						headerName: '权限标识',
						renderCell({ value }) {
							return value || '--';
						}
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
									{hasPermi('system:menu:edit') && (
										<IconButton
											color='primary'
											size='small'
											title='编辑'
											onClick={() => onEdit(row.id)}
										>
											<EditRegular />
										</IconButton>
									)}
									{hasPermi('system:menu:add') && (
										<IconButton
											color='success'
											size='small'
											title='添加'
											disabled={row.menuType == 'F'}
											onClick={() => onEdit(undefined, row.id)}
										>
											<AddRegular />
										</IconButton>
									)}
									{hasPermi('system:menu:remove') && (
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
				title={editId ? '编辑菜单' : '新增菜单'}
				open={isOpen}
				onOk={onSave}
				onClose={onCancel}
			>
				<Form labelCol={{ flex: '0 0 100px' }} formik={formik}>
					<Form.Item name='parentId' label='上级菜单'>
						<TreeSelect placeholder='请选择上级菜单' treeData={parentTree} />
					</Form.Item>
					<Form.Item required name='menuName' label='菜单名称'>
						<Input size='small' placeholder='请输入菜单名称' />
					</Form.Item>
					<Form.Item name='orderNum' label='显示排序'>
						<Input size='small' placeholder='请输入显示排序' />
					</Form.Item>
					<Form.Item name='menuType' label='菜单类型'>
						<RadioGroup row>
							<Radio value='M' label='目录' />
							<Radio value='C' label='菜单' />
							<Radio value='F' label='按钮' />
						</RadioGroup>
					</Form.Item>
					{menuType == 'C' && (
						<Form.Item name='path' label='菜单地址'>
							<Input size='small' placeholder='请输入菜单地址' />
						</Form.Item>
					)}
					{menuType == 'F' && (
						<Form.Item name='perms' label='权限字符'>
							<Input size='small' placeholder='请输入权限字符' />
						</Form.Item>
					)}
					{menuType == 'M' && (
						<Form.Item name='icon' label='菜单图标'>
							<Input size='small' placeholder='请输入图标名称' />
						</Form.Item>
					)}
					<Form.Item name='status' label='菜单状态'>
						<RadioGroup row>
							<Radio value='0' label='正常' />
							<Radio value='1' label='停用' />
						</RadioGroup>
					</Form.Item>
					<Form.Item name='isFrame' label='是否外链'>
						<RadioGroup row>
							<Radio value='0' label='是' />
							<Radio value='1' label='否' />
						</RadioGroup>
					</Form.Item>
				</Form>
			</Modal>
		</PageOverlay>
	);
};
