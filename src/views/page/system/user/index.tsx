import * as Yup from 'yup';
import xe from 'xe-utils';
import { useEffect, useState } from 'react';
import { Button, IconButton, RadioGroup, Stack } from '@mui/material';
import type { GridRowId } from '@mui/x-data-grid';
import { useFormik, type FormikValues } from 'formik';
import {
	AddRegular,
	EditRegular,
	DeleteRegular,
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
	Tree,
	TreeSelect,
	confirm,
	message
} from '@/plugins';
import {
	addUser,
	deleteUser,
	getDictDataByTypes,
	getUserById,
	getUserDeptTree,
	updateUser
} from '@/service';
import { DICT_STATUS, DICT_USER_SEX, useTable } from '@/core';
import { usePermission } from '@/authority';

export const Component = () => {
	const { hasPermi } = usePermission();
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKey, setSelectKey] = useState<string>();
	const [selectKeys, setSelectKeys] = useState<GridRowId[]>([]);
	const [dicts, setDicts] = useState<AnyObject>();
	const [expanedKey, setExpandKey] = useState<string[]>([]);
	const [deptTree, setDeptTree] = useState<TreeItemsType[]>([]);

	const { tableProps, getData } = useTable('/system/user/list');

	const search = useFormik<FormikValues>({
		initialValues: {
			userName: ''
		},
		onSubmit(values) {
			getData({ deptId: selectKey, ...values });
		},
		onReset() {
			getData({ deptId: selectKey });
		}
	});

	const formik = useFormik<FormikValues>({
		initialValues: {
			userName: '',
			nickName: '',
			deptId: '',
			password: '',
			email: '',
			phonenumber: '',
			sex: '0',
			status: '0',
			remark: ''
		},
		validationSchema: Yup.object().shape({
			userName: Yup.string().required('请输入用户名称'),
			nickName: Yup.string().required('请输入用户昵称')
		}),
		onSubmit(values) {
			const params: AnyObject = {
				userName: values.userName,
				nickName: values.nickName,
				deptId:
					values.deptId === '' || values.deptId == null
						? null
						: Number(values.deptId),
				email: values.email || undefined,
				phonenumber: values.phonenumber || undefined,
				sex: Number(values.sex),
				status: Number(values.status),
				remark: values.remark || undefined
			};
			if (editId) {
				updateUser({ ...params, id: editId }).then(() => {
					message.success('修改成功');
					onCancel();
					getData();
				});
			} else {
				if (!values.password) {
					message.warning('请输入密码');
					return;
				}
				if (values.password.length < 6) {
					message.warning('密码不能少于6个字符');
					return;
				}
				addUser({ ...params, password: values.password }).then(() => {
					message.success('新增成功');
					onCancel();
					getData();
				});
			}
		}
	});

	const getDictLabel = (type: string, value: any) => {
		if (dicts && dicts[type]) {
			const dict = dicts[type].find((item: any) => item.dictValue == value);
			if (dict && dict.dictLabel) {
				return dict.dictLabel;
			}
		}
		return '';
	};

	const getUserDeptTreeData = () => {
		getUserDeptTree({}).then((result) => {
			setExpandKey(xe.toTreeArray(result.data).map((item) => item.id));
			setDeptTree(result.data);
		});
	};

	const getDictTypesData = () => {
		getDictDataByTypes([DICT_USER_SEX, DICT_STATUS].join(',')).then(
			(result) => {
				setDicts(result.data);
			}
		);
	};

	const onSelectedChange = (key: string) => {
		setSelectKey(key);
	};

	const onEdit = (id?: string | number) => {
		if (id) {
			setEditId(id);
			getUserById(id).then((result) => {
				const record = result.data;
				formik.resetForm();
				formik.setValues({
					userName: record.userName ?? '',
					nickName: record.nickName ?? '',
					deptId: record.deptId != null ? String(record.deptId) : '',
					password: '',
					email: record.email ?? '',
					phonenumber: record.phonenumber ?? '',
					sex: record.sex != null ? String(record.sex) : '0',
					status: record.status != null ? String(record.status) : '0',
					remark: record.remark ?? ''
				});
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
			content: '是否确认删除该用户?',
			onOk() {
				deleteUser(id).then(() => {
					message.success('删除成功');
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的用户');
			return;
		}
		confirm({
			type: 'warning',
			title: '系统提示',
			content: `是否确认删除选中的 ${selectKeys.length} 项数据?`,
			onOk() {
				deleteUser(selectKeys.join(',')).then(() => {
					message.success('删除成功');
					setSelectKeys([]);
					getData();
				});
			}
		});
	};

	useEffect(() => {
		getData({ deptId: selectKey, ...search.values });
	}, [selectKey]);

	useEffect(() => {
		getDictTypesData();
		getUserDeptTreeData();
	}, []);

	return (
		<PageOverlay direction='row'>
			<div className='w-3xs flex flex-col gap-4'>
				<Input
					fullWidth
					size='small'
					placeholder='请输入部门名称'
					startAdornment={<SearchRegular />}
				/>
				<div className='flex-1 overflow-y-auto'>
					<Tree
						showLine
						expandedItems={expanedKey}
						items={deptTree}
						onItemSelectionToggle={(_, id, isSelected) =>
							isSelected && onSelectedChange(id)
						}
						onExpandedItemsChange={(_, keys) => setExpandKey(keys)}
					/>
				</div>
			</div>
			<PageOverlay sx={{ flex: 1 }}>
				<div className='flex items-center justify-between'>
					<Form layout='inline' formik={search}>
						<Form.Item name='userName' label='用户名'>
							<Input size='small' placeholder='请输入' />
						</Form.Item>
						<Form.Item>
							<Stack direction='row' spacing={2}>
								<Button variant='contained' type='submit'>
									查询
								</Button>
								<Button variant='outlined' type='reset'>
									重置
								</Button>
							</Stack>
						</Form.Item>
					</Form>
					<Stack direction='row' spacing={2}>
						{hasPermi('system:user:add') && (
							<Button
								variant='contained'
								startIcon={<AddRegular />}
								onClick={() => onEdit()}
							>
								新建
							</Button>
						)}
						{hasPermi('system:user:remove') && (
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
					getRowId={(row) => row.id}
					onRowSelectionModelChange={(model) =>
						setSelectKeys(Array.from(model.ids))
					}
					columns={getColumnData([
						{
							field: 'userName',
							headerName: '用户名'
						},
						{
							field: 'nickName',
							headerName: '用户昵称'
						},
						{
							field: 'deptId',
							headerName: '部门',
							renderCell({ value }) {
								if (deptTree) {
									const mi = xe.findTree(deptTree, (item) => item.id == value);
									if (mi && mi.item) {
										return mi.item.label;
									}
								}
								return '';
							}
						},
						{
							field: 'sex',
							headerName: '性别',
							renderCell({ value }) {
								return getDictLabel(DICT_USER_SEX, value);
							}
						},
						{
							field: 'phonenumber',
							headerName: '手机号'
						},
						{
							field: 'status',
							headerName: '状态',
							renderCell({ value }) {
								return getDictLabel(DICT_STATUS, value);
							}
						},
						{
							field: 'createTime',
							headerName: '创建时间'
						},
						{
							field: 'action',
							headerName: '操作',
							flex: 0,
							width: 100,
							renderCell({ row }) {
								return (
									<>
										{hasPermi('system:user:edit') && (
											<IconButton
												color='primary'
												size='small'
												title='编辑'
												onClick={() => onEdit(row.id)}
											>
												<EditRegular />
											</IconButton>
										)}
										{hasPermi('system:user:remove') && (
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
			</PageOverlay>
			<Modal
				title={editId ? '编辑用户' : '新增用户'}
				open={isOpen}
				onOk={onSave}
				onClose={onCancel}
			>
				<Form labelCol={{ flex: '0 0 100px' }} formik={formik}>
					<Form.Item required name='userName' label='用户名称'>
						<Input size='small' placeholder='请输入名称' />
					</Form.Item>
					<Form.Item required name='nickName' label='用户昵称'>
						<Input size='small' placeholder='请输入昵称' />
					</Form.Item>
					{!editId && (
						<Form.Item required name='password' label='密码'>
							<Input size='small' type='password' placeholder='请输入密码' />
						</Form.Item>
					)}
					<Form.Item name='deptId' label='部门'>
						<TreeSelect placeholder='请选择部门' treeData={deptTree} />
					</Form.Item>
					<Form.Item name='email' label='邮箱'>
						<Input size='small' placeholder='请输入邮箱' />
					</Form.Item>
					<Form.Item name='phonenumber' label='手机号码'>
						<Input size='small' placeholder='请输入手机号码' />
					</Form.Item>
					<Form.Item name='sex' label='性别'>
						<RadioGroup row>
							{dicts &&
								dicts[DICT_USER_SEX].map((item: any) => (
									<Radio
										key={item.id}
										value={item.dictValue}
										label={item.dictLabel}
									/>
								))}
						</RadioGroup>
					</Form.Item>
					<Form.Item name='status' label='状态'>
						<RadioGroup row>
							{dicts &&
								dicts[DICT_STATUS].map((item: any) => (
									<Radio
										key={item.id}
										value={item.dictValue}
										label={item.dictLabel}
									/>
								))}
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
