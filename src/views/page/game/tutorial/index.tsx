import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import { Button, IconButton, RadioGroup, Stack } from '@mui/material';
import type { GridRowId } from '@mui/x-data-grid';
import { useFormik, type FormikValues } from 'formik';
import {
	AddRegular,
	EditRegular,
	DeleteRegular,
	SearchRegular,
	CheckmarkRegular
} from '@fluentui/react-icons';
import {
	Form,
	getColumnData,
	PageOverlay,
	Input,
	Modal,
	Radio,
	Table,
	MarkdownEditor,
	confirm,
	message
} from '@/plugins';
import { useTable } from '@/core';
import {
	addTutorial,
	deleteTutorial,
	getTutorialById,
	updateTutorial
} from '@/service';

const renderYesNo = (value: unknown) => (value == 1 ? '是' : '否');

const renderContent = (value: unknown) => {
	if (!value) return '--';
	const s = String(value);
	return s.length > 40 ? `${s.slice(0, 40)}…` : s;
};

export const Component = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKeys, setSelectKeys] = useState<GridRowId[]>([]);

	const { tableProps, getData } = useTable('/game/wm/tutorial/list');

	const search = useFormik<FormikValues>({
		initialValues: { title: '', author: '' },
		onSubmit(values) {
			getData({
				title: values.title || undefined,
				author: values.author || undefined
			});
		},
		onReset() {
			getData();
		}
	});

	const formik = useFormik<FormikValues>({
		initialValues: {
			title: '',
			author: '',
			content: '',
			publishTime: '',
			isShelf: '1',
			sort: ''
		},
		validationSchema: Yup.object().shape({
			title: Yup.string().required('请输入教程标题')
		}),
		onSubmit(values) {
			const params = {
				title: values.title,
				author: values.author || undefined,
				content: values.content || undefined,
				publishTime: values.publishTime || undefined,
				isShelf: Number(values.isShelf),
				sort: values.sort === '' ? null : Number(values.sort),
				isAudit: 1
			};
			if (editId) {
				updateTutorial({ ...params, id: editId }).then(() => {
					message.success('修改成功');
					onCancel();
					getData();
				});
			} else {
				addTutorial(params).then(() => {
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
			getTutorialById(id).then((result) => {
				const record = result.data;
				formik.resetForm();
				formik.setValues({
					title: record.title ?? '',
					author: record.author ?? '',
					content: record.content ?? '',
					publishTime: record.publishTime ?? '',
					isShelf: record.isShelf != null ? String(record.isShelf) : '0',
					sort: record.sort != null ? String(record.sort) : ''
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
			content: '是否确认删除该教程?',
			onOk() {
				deleteTutorial(id).then(() => {
					message.success('删除成功');
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的教程');
			return;
		}
		confirm({
			type: 'warning',
			title: '系统提示',
			content: `是否确认删除选中的 ${selectKeys.length} 项数据?`,
			onOk() {
				deleteTutorial(selectKeys.join(',')).then(() => {
					message.success('删除成功');
					setSelectKeys([]);
					getData();
				});
			}
		});
	};

	const onAudit = (row: AnyObject) => {
		confirm({
			type: 'warning',
			title: '审核',
			content: '请选择审核结果',
			confirmationText: '通过',
			cancellationText: '拒绝',
			onOk() {
				updateTutorial({ ...row, isAudit: 1 }).then(() => {
					message.success('已通过审核');
					getData();
				});
			},
			onCancel() {
				updateTutorial({ ...row, isAudit: 2 }).then(() => {
					message.success('已拒绝');
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
					<Form.Item name='title' label='教程标题'>
						<Input size='small' placeholder='请输入教程标题' />
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
					{ field: 'id', headerName: '编号' },
					{ field: 'title', headerName: '教程标题', flex: 1 },
					{ field: 'author', headerName: '作者' },
					{ field: 'publishTime', headerName: '日期' },
					{
						field: 'isShelf',
						headerName: '是否上架',
						renderCell({ value }) {
							return renderYesNo(value);
						}
					},
					{ field: 'sort', headerName: '排序' },
					{
						field: 'isAudit',
						headerName: '审核状态',
						renderCell({ value }) {
							if (value == 2) return '已拒绝';
							return value == 1 ? '已通过' : '待审核';
						}
					},
					{
						field: 'content',
						headerName: '内容',
						flex: 2,
						renderCell({ value }) {
							return renderContent(value);
						}
					},
					{
						field: 'action',
						headerName: '操作',
						flex: 0,
						width: 160,
						renderCell({ row }) {
							return (
								<>
									{row.isAudit == 0 && (
										<IconButton
											color='primary'
											size='small'
											title='审核'
											onClick={() => onAudit(row)}
										>
											<CheckmarkRegular />
										</IconButton>
									)}
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
				title={editId ? '编辑教程' : '新增教程'}
				open={isOpen}
				width='lg'
				onOk={onSave}
				onClose={onCancel}
			>
				<Form labelCol={{ flex: '0 0 100px' }} formik={formik}>
					<Form.Item required name='title' label='教程标题'>
						<Input size='small' placeholder='请输入教程标题' />
					</Form.Item>
					<Form.Item name='author' label='作者'>
						<Input size='small' placeholder='请输入作者' />
					</Form.Item>
					<Form.Item name='publishTime' label='日期'>
						<Input size='small' placeholder='请输入日期，如 2026-09-30' />
					</Form.Item>
					<Form.Item name='isShelf' label='是否上架'>
						<RadioGroup row>
							<Radio value='1' label='是' />
							<Radio value='0' label='否' />
						</RadioGroup>
					</Form.Item>
					<Form.Item name='sort' label='排序'>
						<Input size='small' placeholder='请输入排序' />
					</Form.Item>
					<Form.Item name='content' label='教程内容'>
						<MarkdownEditor
							height={360}
							placeholder='请输入教程内容(Markdown)'
						/>
					</Form.Item>
				</Form>
			</Modal>
		</PageOverlay>
	);
};
