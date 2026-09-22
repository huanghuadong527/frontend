import * as Yup from 'yup';
import {
	useEffect,
	useState } from 'react';
import { Button,
	IconButton,
	MenuItem,
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
	Select,
	Table,
	confirm,
	message
} from '@/plugins';
import { DICT_TITLE_AREA, useTable } from '@/core';
import {
	addTitle,
	deleteTitle,
	getDictDataByType,
	getTitleById,
	updateTitle
} from '@/service';

export const Component = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKeys, setSelectKeys] = useState<GridRowId[]>([]);
	const [areas, setAreas] = useState<AnyObject[]>([]);

	const { tableProps, getData } = useTable('/game/wm/title/list');

	const search = useFormik<FormikValues>({
		initialValues: { name: '', taskName: '', area: '' },
		onSubmit(values) {
			getData({
				name: values.name || undefined,
				taskName: values.taskName || undefined,
				area: values.area || undefined
			});
		},
		onReset() {
			getData();
		}
	});

	const formik = useFormik<FormikValues>({
		initialValues: {
			name: '',
			taskName: '',
			sort: '',
			area: '',
			attr: '',
			process: ''
		},
		validationSchema: Yup.object().shape({
			name: Yup.string().required('请输入称号名称')
		}),
		onSubmit(values) {
			const params = {
				...values,
				sort: values.sort === '' ? null : Number(values.sort)
			};
			if (editId) {
				updateTitle({ ...params, id: editId }).then(() => {
					message.success('修改成功');
					onCancel();
					getData();
				});
			} else {
				addTitle(params).then(() => {
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
			getTitleById(id).then((result) => {
				const record = result.data;
				formik.resetForm();
				formik.setValues({
					name: record.name ?? '',
					taskName: record.taskName ?? '',
					sort: record.sort != null ? String(record.sort) : '',
					area: record.area ?? '',
					attr: record.attr ?? '',
					process: record.process ?? ''
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
			content: '是否确认删除该称号?',
			onOk() {
				deleteTitle(id).then(() => {
					message.success('删除成功');
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的称号');
			return;
		}
		confirm({
			type: 'warning',
			title: '系统提示',
			content: `是否确认删除选中的 ${selectKeys.length} 项数据?`,
			onOk() {
				deleteTitle(selectKeys.join(',')).then(() => {
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
		getDictDataByType(DICT_TITLE_AREA).then((result) => {
			const list = result.data ?? [];
			setAreas(
				list.map((item: AnyObject) => ({
					value: item.dictValue,
					label: item.dictLabel
				}))
			);
		});
	}, []);

	const getAreaLabel = (value: unknown) =>
		areas.find((item) => item.value == value)?.label ?? value ?? '--';

	return (
		<PageOverlay>
			<div className='flex items-center justify-between'>
				<Form layout='inline' formik={search}>
					<Form.Item name='name' label='称号名称'>
						<Input size='small' placeholder='请输入称号名称' />
					</Form.Item>
					<Form.Item name='taskName' label='任务名称'>
						<Input size='small' placeholder='请输入任务名称' />
					</Form.Item>
					<Form.Item name='area' label='区域'>
						<Select placeholder='请选择区域'>
							{areas.map((item) => (
								<MenuItem key={item.value} value={item.value}>
									{item.label}
								</MenuItem>
							))}
						</Select>
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
						headerName: '称号名称'
					},
					{
						field: 'taskName',
						headerName: '任务名称'
					},
					{
						field: 'sort',
						headerName: '顺序'
					},
					{
						field: 'area',
						headerName: '区域',
						renderCell({ value }) {
							return getAreaLabel(value);
						}
					},
					{
						field: 'attr',
						headerName: '属性'
					},
					{
						field: 'process',
						headerName: '流程'
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
				title={editId ? '编辑称号' : '新增称号'}
				open={isOpen}
				onOk={onSave}
				onClose={onCancel}
			>
				<Form labelCol={{ flex: '0 0 100px' }} formik={formik}>
					<Form.Item required name='name' label='称号名称'>
						<Input size='small' placeholder='请输入称号名称' />
					</Form.Item>
					<Form.Item name='taskName' label='任务名称'>
						<Input size='small' placeholder='请输入任务名称' />
					</Form.Item>
					<Form.Item name='sort' label='顺序'>
						<Input size='small' placeholder='请输入顺序' />
					</Form.Item>
					<Form.Item name='area' label='区域'>
						<Select placeholder='请选择区域'>
							{areas.map((item) => (
								<MenuItem key={item.value} value={item.value}>
									{item.label}
								</MenuItem>
							))}
						</Select>
					</Form.Item>
					<Form.Item name='attr' label='属性'>
						<Input size='small' placeholder='请输入属性' />
					</Form.Item>
					<Form.Item name='process' label='流程'>
						<Input size='small' placeholder='请输入流程' />
					</Form.Item>
				</Form>
			</Modal>
		</PageOverlay>
	);
};
