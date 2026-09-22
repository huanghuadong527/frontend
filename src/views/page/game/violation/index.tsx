import * as Yup from 'yup';
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
	Upload,
	confirm,
	message
} from '@/plugins';
import { useTable } from '@/core';
import {
	addViolation,
	deleteViolation,
	getViolationById,
	updateViolation
} from '@/service';

const renderYesNo = (value: unknown) => (value == 1 ? '是' : '否');

export const Component = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKeys, setSelectKeys] = useState<GridRowId[]>([]);

	const { tableProps, getData } = useTable('/game/wm/violation/list');

	const search = useFormik<FormikValues>({
		initialValues: { violator: '', behavior: '' },
		onSubmit(values) {
			getData({
				violator: values.violator || undefined,
				behavior: values.behavior || undefined
			});
		},
		onReset() {
			getData();
		}
	});

	const formik = useFormik<FormikValues>({
		initialValues: {
			violator: '',
			behavior: '',
			url: '',
			isShow: '1',
			isTop: '0',
			isNewZone: '0'
		},
		validationSchema: Yup.object().shape({
			violator: Yup.string().required('请输入违规人')
		}),
		onSubmit(values) {
			const params = {
				violator: values.violator,
				behavior: values.behavior || undefined,
				url: values.url || undefined,
				isShow: Number(values.isShow),
				isTop: Number(values.isTop),
				isNewZone: Number(values.isNewZone)
			};
			if (editId) {
				updateViolation({ ...params, id: editId }).then(() => {
					message.success('修改成功');
					onCancel();
					getData();
				});
			} else {
				addViolation(params).then(() => {
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
			getViolationById(id).then((result) => {
				const record = result.data;
				formik.resetForm();
				formik.setValues({
					violator: record.violator ?? '',
					behavior: record.behavior ?? '',
					url: record.url ?? '',
					isShow: record.isShow != null ? String(record.isShow) : '1',
					isTop: record.isTop != null ? String(record.isTop) : '0',
					isNewZone: record.isNewZone != null ? String(record.isNewZone) : '0'
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
			content: '是否确认删除该违规记录?',
			onOk() {
				deleteViolation(id).then(() => {
					message.success('删除成功');
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的违规记录');
			return;
		}
		confirm({
			type: 'warning',
			title: '系统提示',
			content: `是否确认删除选中的 ${selectKeys.length} 项数据?`,
			onOk() {
				deleteViolation(selectKeys.join(',')).then(() => {
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
					<Form.Item name='violator' label='违规人'>
						<Input size='small' placeholder='请输入违规人' />
					</Form.Item>
					<Form.Item name='behavior' label='违规行为'>
						<Input size='small' placeholder='请输入违规行为' />
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
						field: 'violator',
						headerName: '违规人'
					},
					{
						field: 'behavior',
						headerName: '违规行为'
					},
					{
						field: 'isShow',
						headerName: '是否展示',
						renderCell({ value }) {
							return renderYesNo(value);
						}
					},
					{
						field: 'isTop',
						headerName: '是否置顶',
						renderCell({ value }) {
							return renderYesNo(value);
						}
					},
					{
						field: 'isNewZone',
						headerName: '是否新区',
						renderCell({ value }) {
							return renderYesNo(value);
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
				title={editId ? '编辑违规' : '新增违规'}
				open={isOpen}
				onOk={onSave}
				onClose={onCancel}
			>
				<Form labelCol={{ flex: '0 0 100px' }} formik={formik}>
					<Form.Item required name='violator' label='违规人'>
						<Input size='small' placeholder='请输入违规人' />
					</Form.Item>
					<Form.Item name='behavior' label='违规行为'>
						<Input.TextArea minRows={3} placeholder='请输入违规行为' />
					</Form.Item>
					<Form.Item name='url' label='违规图片'>
						<Upload multiple />
					</Form.Item>
					<Form.Item name='isShow' label='是否展示'>
						<RadioGroup row>
							<Radio value='1' label='是' />
							<Radio value='0' label='否' />
						</RadioGroup>
					</Form.Item>
					<Form.Item name='isTop' label='是否置顶'>
						<RadioGroup row>
							<Radio value='1' label='是' />
							<Radio value='0' label='否' />
						</RadioGroup>
					</Form.Item>
					<Form.Item name='isNewZone' label='是否新区'>
						<RadioGroup row>
							<Radio value='1' label='是' />
							<Radio value='0' label='否' />
						</RadioGroup>
					</Form.Item>
				</Form>
			</Modal>
		</PageOverlay>
	);
};
