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
import { addWord, deleteWord, getWordById, updateWord } from '@/service';

export const Component = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKeys, setSelectKeys] = useState<GridRowId[]>([]);

	const { tableProps, getData } = useTable('/study/word/list');

	const search = useFormik<FormikValues>({
		initialValues: { name: '', type: '' },
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
			type: '',
			trans: '',
			ukphone: '',
			usphone: '',
			count: ''
		},
		validationSchema: Yup.object().shape({
			name: Yup.string().required('请输入单词')
		}),
		onSubmit(values) {
			if (editId) {
				updateWord({ ...values, id: editId }).then(() => {
					message.success('修改成功');
					onCancel();
					getData();
				});
			} else {
				addWord(values).then(() => {
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
			getWordById(id).then((result) => {
				const record = result.data;
				formik.resetForm();
				formik.setValues({
					name: record.name ?? '',
					type: record.type ?? '',
					trans: record.trans ?? '',
					ukphone: record.ukphone ?? '',
					usphone: record.usphone ?? '',
					count: record.count ?? ''
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
			content: '是否确认删除该单词?',
			onOk() {
				deleteWord(id).then(() => {
					message.success('删除成功');
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的单词');
			return;
		}
		confirm({
			type: 'warning',
			title: '系统提示',
			content: `是否确认删除选中的 ${selectKeys.length} 项数据?`,
			onOk() {
				deleteWord(selectKeys.join(',')).then(() => {
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
					<Form.Item name='name' label='单词'>
						<Input size='small' placeholder='请输入单词' />
					</Form.Item>
					<Form.Item name='type' label='类型'>
						<Input size='small' placeholder='请输入类型' />
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
					<Button variant='contained' startIcon={<AddRegular />} onClick={() => onEdit()}>
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
				onRowSelectionModelChange={(model) => setSelectKeys(Array.from(model.ids))}
				columns={getColumnData([
					{
						field: 'id',
						headerName: '编号'
					},
					{
						field: 'name',
						headerName: '单词'
					},
					{
						field: 'type',
						headerName: '类型'
					},
					{
						field: 'trans',
						headerName: '翻译'
					},
					{
						field: 'ukphone',
						headerName: '英音'
					},
					{
						field: 'usphone',
						headerName: '美音'
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
				title={editId ? '编辑单词' : '新增单词'}
				open={isOpen}
				onOk={onSave}
				onClose={onCancel}
			>
				<Form labelCol={{ flex: '0 0 90px' }} formik={formik}>
					<Form.Item required name='name' label='单词'>
						<Input size='small' placeholder='请输入单词' />
					</Form.Item>
					<Form.Item name='type' label='类型'>
						<Input size='small' placeholder='请输入类型' />
					</Form.Item>
					<Form.Item name='trans' label='翻译'>
						<Input.TextArea placeholder='请输入翻译' />
					</Form.Item>
					<Form.Item name='ukphone' label='英音'>
						<Input size='small' placeholder='请输入英音' />
					</Form.Item>
					<Form.Item name='usphone' label='美音'>
						<Input size='small' placeholder='请输入美音' />
					</Form.Item>
					<Form.Item name='count' label='出现次数'>
						<Input size='small' placeholder='请输入出现次数' />
					</Form.Item>
				</Form>
			</Modal>
		</PageOverlay>
	);
};
