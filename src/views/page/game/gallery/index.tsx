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
import { API_UPLOAD, useTable } from '@/core';
import {
	addGallery,
	deleteGallery,
	getGalleryById,
	updateGallery
} from '@/service';

const renderYesNo = (value: unknown) => (value == 1 ? '是' : '否');

const renderImage = (value: unknown) => {
	if (!value) return '--';
	const src = String(value);
	const url = src.startsWith('http') ? src : API_UPLOAD + src;
	return (
		<img
			src={url}
			alt=''
			style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 4 }}
		/>
	);
};

export const Component = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKeys, setSelectKeys] = useState<GridRowId[]>([]);

	const { tableProps, getData } = useTable('/game/wm/gallery/list');

	const search = useFormik<FormikValues>({
		initialValues: { name: '' },
		onSubmit(values) {
			getData({ name: values.name || undefined });
		},
		onReset() {
			getData();
		}
	});

	const formik = useFormik<FormikValues>({
		initialValues: {
			name: '',
			image: '',
			description: '',
			isOnSale: '1',
			isRecommend: '0'
		},
		validationSchema: Yup.object().shape({
			name: Yup.string().required('请输入画廊名称')
		}),
		onSubmit(values) {
			const params = {
				name: values.name,
				image: values.image || undefined,
				description: values.description || undefined,
				isOnSale: Number(values.isOnSale),
				isRecommend: Number(values.isRecommend)
			};
			if (editId) {
				updateGallery({ ...params, id: editId }).then(() => {
					message.success('修改成功');
					onCancel();
					getData();
				});
			} else {
				addGallery(params).then(() => {
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
			getGalleryById(id).then((result) => {
				const record = result.data;
				formik.resetForm();
				formik.setValues({
					name: record.name ?? '',
					image: record.image ?? '',
					description: record.description ?? '',
					isOnSale: record.isOnSale != null ? String(record.isOnSale) : '1',
					isRecommend: record.isRecommend != null ? String(record.isRecommend) : '0'
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
			content: '是否确认删除该画廊?',
			onOk() {
				deleteGallery(id).then(() => {
					message.success('删除成功');
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的画廊');
			return;
		}
		confirm({
			type: 'warning',
			title: '系统提示',
			content: `是否确认删除选中的 ${selectKeys.length} 项数据?`,
			onOk() {
				deleteGallery(selectKeys.join(',')).then(() => {
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
					<Form.Item name='name' label='画廊名称'>
						<Input size='small' placeholder='请输入画廊名称' />
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
					{ field: 'id', headerName: '编号' },
					{
						field: 'image',
						headerName: '图片',
						flex: 0,
						width: 80,
						renderCell({ value }) {
							return renderImage(value);
						}
					},
					{ field: 'name', headerName: '画廊名称' },
					{ field: 'description', headerName: '描述' },
					{
						field: 'isOnSale',
						headerName: '是否上架',
						renderCell({ value }) {
							return renderYesNo(value);
						}
					},
					{
						field: 'isRecommend',
						headerName: '主页推荐',
						renderCell({ value }) {
							return renderYesNo(value);
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
				title={editId ? '编辑画廊' : '新增画廊'}
				open={isOpen}
				onOk={onSave}
				onClose={onCancel}
			>
				<Form labelCol={{ flex: '0 0 100px' }} formik={formik}>
					<Form.Item required name='name' label='画廊名称'>
						<Input size='small' placeholder='请输入画廊名称' />
					</Form.Item>
					<Form.Item name='image' label='图片'>
						<Upload />
					</Form.Item>
					<Form.Item name='description' label='描述'>
						<Input.TextArea minRows={3} placeholder='请输入描述' />
					</Form.Item>
					<Form.Item name='isOnSale' label='是否上架'>
						<RadioGroup row>
							<Radio value='1' label='是' />
							<Radio value='0' label='否' />
						</RadioGroup>
					</Form.Item>
					<Form.Item name='isRecommend' label='主页推荐'>
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
