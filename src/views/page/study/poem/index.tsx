import * as Yup from 'yup';
import {
	useEffect,
	useState } from 'react';
import { Button,
	IconButton,
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
	Table,
	confirm,
	message
} from '@/plugins';
import { useTable } from '@/core';
import { addPoem, deletePoem, getPoemById, updatePoem } from '@/service';

export const Component = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKeys, setSelectKeys] = useState<GridRowId[]>([]);

	const { tableProps, getData } = useTable('/study/poem/list');

	const search = useFormik<FormikValues>({
		initialValues: { name: '', author: '' },
		onSubmit(values) {
			getData(values);
		},
		onReset() {
			getData();
		}
	});

	const formik = useFormik<FormikValues>({
		initialValues: {
			name: '',
			author: '',
			dynasty: '',
			tags: '',
			poemLine: ''
		},
		validationSchema: Yup.object().shape({
			name: Yup.string().required('请输入诗词名称')
		}),
		onSubmit(values) {
			if (editId) {
				updatePoem({ ...values, id: editId }).then(() => {
					message.success('修改成功');
					onCancel();
					getData();
				});
			} else {
				addPoem(values).then(() => {
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
			getPoemById(id).then((result) => {
				const record = result.data;
				formik.resetForm();
				formik.setValues({
					name: record.name ?? '',
					author: record.author ?? '',
					dynasty: record.dynasty ?? '',
					tags: record.tags ?? '',
					poemLine: record.poemLine ?? ''
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
			content: '是否确认删除该诗词?',
			onOk() {
				deletePoem(id).then(() => {
					message.success('删除成功');
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的诗词');
			return;
		}
		confirm({
			type: 'warning',
			title: '系统提示',
			content: `是否确认删除选中的 ${selectKeys.length} 项数据?`,
			onOk() {
				deletePoem(selectKeys.join(',')).then(() => {
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
					<Form.Item name='name' label='诗词名称'>
						<Input size='small' placeholder='请输入诗词名称' />
					</Form.Item>
					<Form.Item name='author' label='作者'>
						<Input size='small' placeholder='请输入作者' />
					</Form.Item>
					<Form.Item>
						<Stack direction='row' spacing={2}>
							<Button
								variant='contained'
								type='submit'
								startIcon={<SearchRegular />}
							>
								查询
							</Button>
							<Button variant='outlined' type='reset'>
								重置
							</Button>
						</Stack>
					</Form.Item>
				</Form>
				<Stack direction='row' spacing={2}>
					<Button
						variant='contained'
						startIcon={<AddRegular />}
						onClick={() => onEdit()}
					>
						新建
					</Button>
					<Button
						color='error'
						variant='contained'
						startIcon={<DeleteRegular />}
						disabled={selectKeys.length == 0}
						onClick={onBatchDelete}
					>
						批量删除
					</Button>
				</Stack>
			</div>
			<Table
				{...tableProps}
				checkboxSelection
				onRowSelectionModelChange={(model) =>
					setSelectKeys(Array.from(model.ids))
				}
				columns={getColumnData([
					{
						field: 'id',
						headerName: '编号'
					},
					{
						field: 'name',
						headerName: '诗词名称'
					},
					{
						field: 'author',
						headerName: '作者'
					},
					{
						field: 'dynasty',
						headerName: '朝代'
					},
					{
						field: 'tags',
						headerName: '标签'
					},
					{
						field: 'action',
						headerName: '操作',
						flex: 0,
						width: 100,
						renderCell({ row }) {
							return (
								<>
									<IconButton
										color='primary'
										size='small'
										title='编辑'
										onClick={() => onEdit(row.id)}
									>
										<EditRegular />
									</IconButton>
									<IconButton
										color='error'
										size='small'
										title='删除'
										onClick={() => onDelete(row.id)}
									>
										<DeleteRegular />
									</IconButton>
								</>
							);
						}
					}
				])}
			/>
			<Modal
				title={editId ? '编辑诗词' : '新增诗词'}
				open={isOpen}
				onOk={onSave}
				onClose={onCancel}
			>
				<Form labelCol={{ flex: '0 0 90px' }} formik={formik}>
					<Form.Item required name='name' label='诗词名称'>
						<Input size='small' placeholder='请输入诗词名称' />
					</Form.Item>
					<Form.Item name='author' label='作者'>
						<Input size='small' placeholder='请输入作者' />
					</Form.Item>
					<Form.Item name='dynasty' label='朝代'>
						<Input size='small' placeholder='请输入朝代' />
					</Form.Item>
					<Form.Item name='tags' label='标签'>
						<Input size='small' placeholder='请输入标签' />
					</Form.Item>
					<Form.Item name='poemLine' label='内容'>
						<Input.TextArea placeholder='请输入诗词内容' />
					</Form.Item>
				</Form>
			</Modal>
		</PageOverlay>
	);
};
