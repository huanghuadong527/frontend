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
	confirm,
	message
} from '@/plugins';
import { useTable } from '@/core';
import { usePermission } from '@/authority';
import { addPost, deletePost, getPostById, updatePost } from '@/service';

export const Component = () => {
	const { hasPermi } = usePermission();
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKeys, setSelectKeys] = useState<GridRowId[]>([]);

	const { tableProps, getData } = useTable('/system/post/list');

	const search = useFormik<FormikValues>({
		initialValues: { postName: '', postCode: '' },
		onSubmit(values) {
			getData(values);
		},
		onReset() {
			getData();
		}
	});

	const formik = useFormik<FormikValues>({
		initialValues: {
			postName: '',
			postCode: '',
			postSort: 0,
			status: '0',
			remark: ''
		},
		validationSchema: Yup.object().shape({
			postName: Yup.string().required('请输入岗位名称'),
			postCode: Yup.string().required('请输入岗位编码')
		}),
		onSubmit(values) {
			if (editId) {
				updatePost({ ...values, id: editId }).then(() => {
					message.success('修改成功');
					onCancel();
					getData();
				});
			} else {
				addPost(values).then(() => {
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
			getPostById(id).then((result) => {
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
			content: '是否确认删除该岗位?',
			onOk() {
				deletePost(id).then(() => {
					message.success('删除成功');
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的岗位');
			return;
		}
		confirm({
			type: 'warning',
			title: '系统提示',
			content: `是否确认删除选中的 ${selectKeys.length} 项数据?`,
			onOk() {
				deletePost(selectKeys.join(',')).then(() => {
					message.success('删除成功');
					setSelectKeys([]);
					getData();
				});
			}
		});
	};

	useEffect(() => {
		getData();
	}, []);

	return (
		<PageOverlay>
			<div className='flex items-center justify-between'>
				<Form layout='inline' formik={search}>
					<Form.Item name='postName' label='岗位名称'>
						<Input size='small' placeholder='请输入岗位名称' />
					</Form.Item>
					<Form.Item name='postCode' label='岗位编码'>
						<Input size='small' placeholder='请输入岗位编码' />
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
					{hasPermi('system:post:add') && (
						<Button
							variant='contained'
							startIcon={<AddRegular />}
							onClick={() => onEdit()}
						>
							新建
						</Button>
					)}
					{hasPermi('system:post:remove') && (
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
						field: 'postName',
						headerName: '岗位名称'
					},
					{
						field: 'postCode',
						headerName: '岗位编码'
					},
					{
						field: 'postSort',
						headerName: '岗位排序'
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
						width: 130,
						renderCell({ row }) {
							return (
								<>
									{hasPermi('system:post:edit') && (
										<IconButton
											color='primary'
											size='small'
											title='编辑'
											onClick={() => onEdit(row.id)}
										>
											<EditRegular />
										</IconButton>
									)}
									{hasPermi('system:post:remove') && (
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
				title={editId ? '编辑岗位' : '新增岗位'}
				open={isOpen}
				onOk={onSave}
				onClose={onCancel}
			>
				<Form labelCol={{ flex: '0 0 100px' }} formik={formik}>
					<Form.Item required name='postName' label='岗位名称'>
						<Input size='small' placeholder='请输入岗位名称' />
					</Form.Item>
					<Form.Item required name='postCode' label='岗位编码'>
						<Input size='small' placeholder='请输入岗位编码' />
					</Form.Item>
					<Form.Item name='postSort' label='岗位排序'>
						<Input size='small' placeholder='请输入岗位排序' />
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
