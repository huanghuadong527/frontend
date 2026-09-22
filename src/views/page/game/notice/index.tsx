import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import { Button, IconButton, Stack } from '@mui/material';
import type { GridRowId } from '@mui/x-data-grid';
import { useFormik, type FormikValues } from 'formik';
import {
	AddRegular,
	ArrowSyncRegular,
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
import {
	addWmNotice,
	deleteWmNotice,
	getWmNoticeById,
	syncWmNotice,
	updateWmNotice
} from '@/service';

const renderContent = (value: unknown) => {
	if (!value) return '--';
	const s = String(value);
	return s.length > 40 ? `${s.slice(0, 40)}…` : s;
};

export const Component = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKeys, setSelectKeys] = useState<GridRowId[]>([]);
	const [syncing, setSyncing] = useState(false);

	const { tableProps, getData } = useTable('/game/wm/notice/list');

	const search = useFormik<FormikValues>({
		initialValues: { title: '' },
		onSubmit(values) {
			getData({ title: values.title || undefined });
		},
		onReset() {
			getData();
		}
	});

	const formik = useFormik<FormikValues>({
		initialValues: {
			title: '',
			publishTime: '',
			content: '',
			url: '',
			noticeId: ''
		},
		validationSchema: Yup.object().shape({
			title: Yup.string().required('请输入公告标题')
		}),
		onSubmit(values) {
			const params = {
				title: values.title,
				publishTime: values.publishTime || undefined,
				content: values.content || undefined,
				url: values.url || undefined,
				noticeId: values.noticeId || undefined
			};
			if (editId) {
				updateWmNotice({ ...params, id: editId }).then(() => {
					message.success('修改成功');
					onCancel();
					getData();
				});
			} else {
				addWmNotice(params).then(() => {
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
			getWmNoticeById(id).then((result) => {
				const record = result.data;
				formik.resetForm();
				formik.setValues({
					title: record.title ?? '',
					publishTime: record.publishTime ?? '',
					content: record.content ?? '',
					url: record.url ?? '',
					noticeId: record.noticeId ?? ''
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
			content: '是否确认删除该公告?',
			onOk() {
				deleteWmNotice(id).then(() => {
					message.success('删除成功');
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的公告');
			return;
		}
		confirm({
			type: 'warning',
			title: '系统提示',
			content: `是否确认删除选中的 ${selectKeys.length} 项数据?`,
			onOk() {
				deleteWmNotice(selectKeys.join(',')).then(() => {
					message.success('删除成功');
					setSelectKeys([]);
					getData();
				});
			}
		});
	};

	const onSync = () => {
		setSyncing(true);
		syncWmNotice()
			.then((result) => {
				message.success(`同步完成，新增 ${result.data ?? 0} 条公告`);
				getData();
			})
			.finally(() => setSyncing(false));
	};

	useEffect(() => {
		getData();
	}, []);

	return (
		<PageOverlay>
			<div className='flex items-center justify-between'>
				<Form layout='inline' formik={search}>
					<Form.Item name='title' label='公告标题'>
						<Input size='small' placeholder='请输入公告标题' />
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
					<Button
						variant='contained'
						startIcon={<ArrowSyncRegular />}
						disabled={syncing}
						onClick={onSync}
					>
						同步公告
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
					{ field: 'noticeId', headerName: '公告编号' },
					{ field: 'title', headerName: '公告标题' },
					{ field: 'publishTime', headerName: '发布时间' },
					{
						field: 'url',
						headerName: '内容页地址',
						flex: 1,
						renderCell({ value }) {
							if (!value) return '--';
							return (
								<a href={value} target='_blank' rel='noreferrer' title={value}>
									{renderContent(value)}
								</a>
							);
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
				title={editId ? '编辑公告' : '新增公告'}
				open={isOpen}
				onOk={onSave}
				onClose={onCancel}
			>
				<Form labelCol={{ flex: '0 0 100px' }} formik={formik}>
					<Form.Item required name='title' label='公告标题'>
						<Input size='small' placeholder='请输入公告标题' />
					</Form.Item>
					<Form.Item name='publishTime' label='发布时间'>
						<Input size='small' placeholder='请输入发布时间，如 2026-09-09' />
					</Form.Item>
					<Form.Item name='url' label='内容页地址'>
						<Input size='small' placeholder='请输入内容页地址' />
					</Form.Item>
					<Form.Item name='noticeId' label='公告编号'>
						<Input size='small' placeholder='请输入公告编号' />
					</Form.Item>
					<Form.Item name='content' label='公告内容'>
						<Input.TextArea minRows={8} placeholder='请输入公告内容' />
					</Form.Item>
				</Form>
			</Modal>
		</PageOverlay>
	);
};
