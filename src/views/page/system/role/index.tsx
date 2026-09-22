import * as Yup from 'yup';
import {
	useEffect,
	useState } from 'react';
import { Button,
	Chip,
	IconButton,
	RadioGroup,
	Stack } from '@mui/material';
import type { GridRowId } from '@mui/x-data-grid';
import { useFormik,
	type FormikValues } from 'formik';
import { RichTreeView } from '@mui/x-tree-view';
import {
	AddRegular,
	EditRegular,
	DeleteRegular,
	KeyRegular,
	SearchRegular
} from '@fluentui/react-icons';
import {
	Form,
	getColumnData,
	PageOverlay,
	Input,
	Modal,
	Radio,
	Table,
	confirm,
	message
} from '@/plugins';
import { useTable } from '@/core';
import { usePermission } from '@/authority';
import {
	addRole,
	deleteRole,
	getRoleById,
	getRoleMenuTree,
	updateRole
} from '@/service';

const normalizeTree = (nodes: AnyObject[]): AnyObject[] =>
	nodes.map((node) => ({
		id: String(node.id),
		label: node.label,
		children: node.children ? normalizeTree(node.children) : undefined
	}));

export const Component = () => {
	const { hasPermi } = usePermission();
	const [isOpen, setIsOpen] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [menuRoleId, setMenuRoleId] = useState<string | number>('');
	const [menuTree, setMenuTree] = useState<AnyObject[]>([]);
	const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
	const [selectKeys, setSelectKeys] = useState<GridRowId[]>([]);

	const { tableProps, getData } = useTable('/system/role/list');

	const search = useFormik<FormikValues>({
		initialValues: { roleName: '', roleKey: '' },
		onSubmit(values) {
			getData(values);
		},
		onReset() {
			getData();
		}
	});

	const formik = useFormik<FormikValues>({
		initialValues: {
			roleName: '',
			roleKey: '',
			roleSort: 0,
			status: '0',
			remark: ''
		},
		validationSchema: Yup.object().shape({
			roleName: Yup.string().required('请输入角色名称'),
			roleKey: Yup.string().required('请输入权限字符')
		}),
		onSubmit(values) {
			if (editId) {
				updateRole({ ...values, id: editId }).then(() => {
					message.success('修改成功');
					onCancel();
					getData();
				});
			} else {
				addRole(values).then(() => {
					message.success('新增成功');
					onCancel();
					getData();
				});
			}
		}
	});

	const onEdit = (id?: string | number) => {
		if (id) {
			setEditId(id);
			getRoleById(id).then((result) => {
				formik.resetForm();
				formik.setValues(result.data);
				setIsOpen(true);
			});
		} else {
			setEditId('');
			formik.resetForm();
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
			content: '是否确认删除该角色?',
			onOk() {
				deleteRole(id).then(() => {
					message.success('删除成功');
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的角色');
			return;
		}
		confirm({
			type: 'warning',
			title: '系统提示',
			content: `是否确认删除选中的 ${selectKeys.length} 项数据?`,
			onOk() {
				deleteRole(selectKeys.join(',')).then(() => {
					message.success('删除成功');
					setSelectKeys([]);
					getData();
				});
			}
		});
	};

	const onEditMenu = (record: AnyObject) => {
		setMenuRoleId(record.id);
		getRoleMenuTree(record.id).then((result) => {
			setCheckedKeys((result.data?.checkedKeys ?? []).map(String));
			setMenuTree(normalizeTree(result.data?.menus ?? []));
			setMenuOpen(true);
		});
	};

	const onSaveMenu = () => {
		if (!menuRoleId) {
			message.warning('请选择角色');
			return;
		}
		getRoleById(menuRoleId).then((result) => {
			updateRole({
				...result.data,
				id: menuRoleId,
				menuIds: checkedKeys.map(Number)
			}).then(() => {
				message.success('分配成功');
				onCancelMenu();
			});
		});
	};

	const onCancelMenu = () => {
		setMenuOpen(false);
		setMenuRoleId('');
		setCheckedKeys([]);
		setMenuTree([]);
	};

	useEffect(() => {
		getData();
	}, []);

	return (
		<PageOverlay>
			<div className='flex items-center justify-between'>
				<Form layout='inline' formik={search}>
					<Form.Item name='roleName' label='角色名称'>
						<Input size='small' placeholder='请输入角色名称' />
					</Form.Item>
					<Form.Item name='roleKey' label='权限字符'>
						<Input size='small' placeholder='请输入权限字符' />
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
				<Stack direction='row' spacing={2}>
					{hasPermi('system:role:add') && (
						<Button
							variant='contained'
							startIcon={<AddRegular />}
							onClick={() => onEdit()}
						>
							新建
						</Button>
					)}
					{hasPermi('system:role:remove') && (
						<Button
							color='error'
							variant='contained'
							startIcon={<DeleteRegular />}
							disabled={selectKeys.length == 0}
							onClick={onBatchDelete}
						>
							批量删除
						</Button>
					)}
				</Stack>
			</div>
			<Table
				{...tableProps}
				checkboxSelection
				onRowSelectionModelChange={(model) => setSelectKeys(Array.from(model.ids))}
				columns={getColumnData([
					{
						field: 'roleName',
						headerName: '角色名称'
					},
					{
						field: 'roleKey',
						headerName: '权限字符'
					},
					{
						field: 'roleSort',
						headerName: '显示顺序'
					},
					{
						field: 'status',
						headerName: '状态',
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
						width: 200,
						renderCell({ row }) {
							return (
								<>
									{hasPermi('system:role:edit') && (
										<IconButton
											color='primary'
											size='small'
											title='编辑'
											onClick={() => onEdit(row.id)}
										>
											<EditRegular />
										</IconButton>
									)}
									{row.roleKey != 'admin' &&
										hasPermi('system:role:edit') && (
											<IconButton
												color='info'
												size='small'
												title='权限菜单'
												onClick={() => onEditMenu(row)}
											>
												<KeyRegular />
											</IconButton>
										)}
									{hasPermi('system:role:remove') && (
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
				title={editId ? '编辑角色' : '新增角色'}
				open={isOpen}
				onOk={onSave}
				onClose={onCancel}
			>
				<Form labelCol={{ flex: '0 0 100px' }} formik={formik}>
					<Form.Item required name='roleName' label='角色名称'>
						<Input size='small' placeholder='请输入角色名称' />
					</Form.Item>
					<Form.Item required name='roleKey' label='权限字符'>
						<Input size='small' placeholder='请输入权限字符' />
					</Form.Item>
					<Form.Item name='roleSort' label='显示顺序'>
						<Input size='small' placeholder='请输入显示顺序' />
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
			<Modal title='分配菜单' open={menuOpen} onOk={onSaveMenu} onClose={onCancelMenu}>
				<RichTreeView
					multiSelect
					checkboxSelection
					items={menuTree}
					selectedItems={checkedKeys}
					onSelectedItemsChange={(_, keys) => setCheckedKeys(keys as string[])}
					sx={{ maxHeight: 400, overflow: 'auto' }}
				/>
			</Modal>
		</PageOverlay>
	);
};
