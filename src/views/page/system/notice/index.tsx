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
import { useTable, DICT_NOTICE_STATUS, DICT_NOTICE_TYPE } from '@/core';
import { usePermission } from '@/authority';
import {
	addNotice,
	deleteNotice,
	getDictDataByTypes,
	getNoticeById,
	updateNotice
} from '@/service';

export const Component = () => {
	const { hasPermi } = usePermission();
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [dicts, setDicts] = useState<AnyObject>();
	const [selectKeys, setSelectKeys] = useState<GridRowId[]>([]);

	const { tableProps, getData } = useTable('/system/notice/list');

	const search = useFormik<FormikValues>({
		initialValues: { noticeTitle: '', noticeType: '' },
		onSubmit(values) {
			getData(values);
		},
		onReset() {
			getData();
		}
	});

	const formik = useFormik<FormikValues>({
		initialValues: {
			noticeTitle: '',
			noticeType: '1',
			status: '0',
			noticeContent: ''
		},
		validationSchema: Yup.object().shape({
			noticeTitle: Yup.string().required('请输入公告标题')
		}),
		onSubmit(values) {
			if (editId) {
				updateNotice({ ...values, id: editId }).then(() => {
					message.success('修改成功');
					onCancel();
					getData();
				});
			} else {
				addNotice(values).then(() => {
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

	const onEdit = (id?: string | number) => {
		if (id) {
			setEditId(id);
			getNoticeById(id).then((result) => {
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
			content: '是否确认删除该公告?',
			onOk() {
				deleteNotice(id).then(() => {
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
				deleteNotice(selectKeys.join(',')).then(() => {
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

	useEffect(() => {
		getDictDataByTypes([DICT_NOTICE_TYPE, DICT_NOTICE_STATUS].join(',')).then(
			(result) => {
				setDicts(result.data);
			}
		);
	}, []);

	return (
		<PageOverlay>
			<div className='flex items-center justify-between'>
				<Form layout='inline' formik={search}>
					<Form.Item name='noticeTitle' label='公告标题'>
						<Input size='small' placeholder='请输入公告标题' />
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
					{hasPermi('system:notice:add') && (
						<Button
							variant='contained'
							startIcon={<AddRegular />}
							onClick={() => onEdit()}
						>
							新建
						</Button>
					)}
					{hasPermi('system:notice:remove') && (
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
						field: 'noticeTitle',
						headerName: '公告标题'
					},
					{
						field: 'noticeType',
						headerName: '公告类型',
						renderCell({ value }) {
							return (
								<Chip
									size='small'
									color={value == '1' ? 'success' : 'info'}
									label={getDictLabel(DICT_NOTICE_TYPE, value)}
								/>
							);
						}
					},
					{
						field: 'status',
						headerName: '状态',
						renderCell({ value }) {
							return (
								<Chip
									size='small'
									color={value == '0' ? 'success' : 'error'}
									label={getDictLabel(DICT_NOTICE_STATUS, value)}
								/>
							);
						}
					},
					{
						field: 'createBy',
						headerName: '创建者'
					},
					{
						field: 'createTime',
						headerName: '创建时间'
					},
					{
						field: 'id',
						headerName: '操作',
						flex: 0,
						width: 100,
						renderCell({ row }) {
							return (
								<>
									{hasPermi('system:notice:edit') && (
										<IconButton
											color='primary'
											size='small'
											title='编辑'
											onClick={() => onEdit(row.id)}
										>
											<EditRegular />
										</IconButton>
									)}
									{hasPermi('system:notice:remove') && (
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
				title={editId ? '编辑公告' : '新增公告'}
				open={isOpen}
				onOk={onSave}
				onClose={onCancel}
			>
				<Form labelCol={{ flex: '0 0 100px' }} formik={formik}>
					<Form.Item required name='noticeTitle' label='公告标题'>
						<Input size='small' placeholder='请输入公告标题' />
					</Form.Item>
					<Form.Item name='noticeType' label='公告类型'>
						<RadioGroup row>
							{dicts &&
								dicts[DICT_NOTICE_TYPE].map((item: any) => (
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
								dicts[DICT_NOTICE_STATUS].map((item: any) => (
									<Radio
										key={item.id}
										value={item.dictValue}
										label={item.dictLabel}
									/>
								))}
						</RadioGroup>
					</Form.Item>
					<Form.Item name='noticeContent' label='公告内容'>
						<Input.TextArea placeholder='请输入公告内容' />
					</Form.Item>
				</Form>
			</Modal>
		</PageOverlay>
	);
};
