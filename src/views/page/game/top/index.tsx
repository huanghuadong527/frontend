import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import { Button, IconButton, MenuItem, RadioGroup, Stack } from '@mui/material';
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
	Select,
	Table,
	Upload,
	confirm,
	message
} from '@/plugins';
import { DICT_TOP_MODULE, useTable } from '@/core';
import { usePermission } from '@/authority';
import {
	addTop,
	deleteTop,
	getDictDataByType,
	getTopById,
	updateTop
} from '@/service';

const renderYesNo = (value: unknown) => (value == 1 ? '是' : '否');

export const Component = () => {
	const { hasPermi } = usePermission();
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKeys, setSelectKeys] = useState<GridRowId[]>([]);
	const [modules, setModules] = useState<AnyObject[]>([]);

	const { tableProps, getData } = useTable('/game/wm/top/list');

	const search = useFormik<FormikValues>({
		initialValues: { name: '', module: '' },
		onSubmit(values) {
			getData({
				name: values.name || undefined,
				module: values.module || undefined
			});
		},
		onReset() {
			getData();
		}
	});

	const formik = useFormik<FormikValues>({
		initialValues: {
			name: '',
			module: '0',
			image: '',
			isShow: '1',
			isTop: '0',
			sort: '0',
			description: ''
		},
		validationSchema: Yup.object().shape({
			name: Yup.string().required('请输入名称')
		}),
		onSubmit(values) {
			const params = {
				name: values.name,
				module: values.module || undefined,
				image: values.image || undefined,
				isShow: Number(values.isShow),
				isTop: Number(values.isTop),
				sort: Number(values.sort) || 0,
				description: values.description || undefined
			};
			if (editId) {
				updateTop({ ...params, id: editId }).then(() => {
					message.success('修改成功');
					onCancel();
					getData();
				});
			} else {
				addTop(params).then(() => {
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
			getTopById(id).then((result) => {
				const record = result.data;
				formik.resetForm();
				formik.setValues({
					name: record.name ?? '',
					module: record.module ?? '0',
					image: record.image ?? '',
					isShow: record.isShow != null ? String(record.isShow) : '1',
					isTop: record.isTop != null ? String(record.isTop) : '0',
					sort: record.sort != null ? String(record.sort) : '0',
					description: record.description ?? ''
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
			content: '是否确认删除该置顶记录?',
			onOk() {
				deleteTop(id).then(() => {
					message.success('删除成功');
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的置顶记录');
			return;
		}
		confirm({
			type: 'warning',
			title: '系统提示',
			content: `是否确认删除选中的 ${selectKeys.length} 项数据?`,
			onOk() {
				deleteTop(selectKeys.join(',')).then(() => {
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
		getDictDataByType(DICT_TOP_MODULE).then((result) => {
			const list = result.data ?? [];
			setModules(
				list.map((item: AnyObject) => ({
					value: item.dictValue,
					label: item.dictLabel
				}))
			);
		});
	}, []);

	const getModuleLabel = (value: unknown) =>
		modules.find((item) => item.value == value)?.label ?? value ?? '--';

	return (
		<PageOverlay>
			<div className='flex items-center justify-between'>
				<Form layout='inline' formik={search}>
					<Form.Item name='name' label='名称'>
						<Input size='small' placeholder='请输入名称' />
					</Form.Item>
					<Form.Item name='module' label='所属模块'>
						<Select placeholder='请选择所属模块'>
							{modules.map((item) => (
								<MenuItem key={item.value} value={item.value}>
									{item.label}
								</MenuItem>
							))}
						</Select>
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
					{hasPermi('game:top:add') && (
						<Button
							variant='contained'
							startIcon={<AddRegular />}
							onClick={() => onEdit()}
						>
							新建
						</Button>
					)}
					{hasPermi('game:top:remove') && (
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
						headerName: '名称'
					},
					{
						field: 'module',
						headerName: '所属模块',
						renderCell({ value }) {
							return getModuleLabel(value);
						}
					},
					{
						field: 'isShow',
						headerName: '是否显示',
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
						field: 'sort',
						headerName: '排序'
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
									{hasPermi('game:top:edit') && (
										<IconButton
											color='primary'
											size='small'
											title='编辑'
											onClick={() => onEdit(row.id)}
										>
											<EditRegular />
										</IconButton>
									)}
									{hasPermi('game:top:remove') && (
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
				title={editId ? '编辑置顶' : '新增置顶'}
				open={isOpen}
				onOk={onSave}
				onClose={onCancel}
			>
				<Form labelCol={{ flex: '0 0 100px' }} formik={formik}>
					<Form.Item required name='name' label='名称'>
						<Input size='small' placeholder='请输入名称' />
					</Form.Item>
					<Form.Item name='module' label='所属模块'>
						<Select placeholder='请选择所属模块'>
							{modules.map((item) => (
								<MenuItem key={item.value} value={item.value}>
									{item.label}
								</MenuItem>
							))}
						</Select>
					</Form.Item>
					<Form.Item name='image' label='置顶图片'>
						<Upload />
					</Form.Item>
					<Form.Item name='isShow' label='是否显示'>
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
					<Form.Item name='sort' label='排序'>
						<Input size='small' placeholder='请输入排序值(升序)' />
					</Form.Item>
					<Form.Item name='description' label='描述'>
						<Input.TextArea minRows={3} placeholder='请输入描述' />
					</Form.Item>
				</Form>
			</Modal>
		</PageOverlay>
	);
};
