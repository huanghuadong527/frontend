import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import { Button, IconButton, MenuItem, Stack, Typography } from '@mui/material';
import type { GridRowId } from '@mui/x-data-grid';
import { useFormik, type FormikValues } from 'formik';
import {
	AddRegular,
	EditRegular,
	DeleteRegular,
	SearchRegular,
	CheckmarkRegular,
	ArrowUpRegular,
	ArrowDownRegular
} from '@fluentui/react-icons';
import {
	Form,
	getColumnData,
	PageOverlay,
	ImagePreview,
	Input,
	Modal,
	Select,
	Table,
	Upload,
	confirm,
	message
} from '@/plugins';
import { useTable } from '@/core';
import {
	addMountPet,
	deleteMountPet,
	getMountPetById,
	updateMountPet
} from '@/service';

const TYPE_OPTIONS = [
	{ value: 0, label: '宠物' },
	{ value: 1, label: '飞行器' },
	{ value: 2, label: '坐骑' }
];

const PET_TYPE_OPTIONS = [
	{ value: 0, label: '观赏宠物' },
	{ value: 1, label: '战斗宠物' }
];

const RACE_OPTIONS = [
	{ value: 0, label: '人族' },
	{ value: 1, label: '羽族' },
	{ value: 2, label: '妖族' }
];

const MAX_IMAGE_SIZE = 1024 * 1024;

const getOptionLabel = (options: typeof TYPE_OPTIONS, value: unknown) =>
	options.find((item) => item.value == value)?.label ?? '--';

const renderContent = (value: unknown) => {
	if (!value) return '--';
	const s = String(value);
	return s.length > 40 ? `${s.slice(0, 40)}…` : s;
};

export const Component = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKeys, setSelectKeys] = useState<GridRowId[]>([]);

	const { tableProps, getData } = useTable('/game/wm/mount-pet/list');

	const search = useFormik<FormikValues>({
		initialValues: { name: '', type: '' },
		onSubmit(values) {
			getData({
				name: values.name || undefined,
				type: values.type === '' ? undefined : Number(values.type)
			});
		},
		onReset() {
			getData();
		}
	});

	const formik = useFormik<FormikValues>({
		initialValues: {
			name: '',
			type: '',
			petType: '',
			race: '',
			sort: '',
			description: '',
			image: ''
		},
		validationSchema: Yup.object().shape({
			name: Yup.string().required('请输入名称')
		}),
		onSubmit(values) {
			const images = (values.image || '')
				.split(',')
				.filter(Boolean)
				.map((image: string) => ({ image }));
			const params = {
				name: values.name,
				type: values.type === '' ? null : Number(values.type),
				petType: values.petType === '' ? null : Number(values.petType),
				race: values.race === '' ? null : Number(values.race),
				sort: values.sort === '' ? null : Number(values.sort),
				description: values.description || undefined,
				images,
				isAudit: 1
			};
			if (editId) {
				updateMountPet({ ...params, id: editId }).then(() => {
					message.success('修改成功');
					onCancel();
					getData();
				});
			} else {
				addMountPet({ ...params, isShelf: 1 }).then(() => {
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
			getMountPetById(id).then((result) => {
				const record = result.data;
				formik.resetForm();
				formik.setValues({
					name: record.name ?? '',
					type: record.type != null ? String(record.type) : '',
					petType: record.petType != null ? String(record.petType) : '',
					race: record.race != null ? String(record.race) : '',
					sort: record.sort != null ? String(record.sort) : '',
					description: record.description ?? '',
					image: (record.images ?? [])
						.map((img: AnyObject) => img.image)
						.filter(Boolean)
						.join(',')
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
			content: '是否确认删除该骑宠?',
			onOk() {
				deleteMountPet(id).then(() => {
					message.success('删除成功');
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的骑宠');
			return;
		}
		confirm({
			type: 'warning',
			title: '系统提示',
			content: `是否确认删除选中的 ${selectKeys.length} 项数据?`,
			onOk() {
				deleteMountPet(selectKeys.join(',')).then(() => {
					message.success('删除成功');
					setSelectKeys([]);
					getData();
				});
			}
		});
	};

	const onAudit = (row: AnyObject) => {
		const doAudit = (isAudit: number) => {
			const payload: AnyObject = { ...row, isAudit };
			delete payload.images;
			updateMountPet(payload).then(() => {
				message.success(isAudit == 1 ? '已通过审核' : '已拒绝');
				getData();
			});
		};
		confirm({
			type: 'warning',
			title: '审核',
			content: '请选择审核结果',
			confirmationText: '通过',
			cancellationText: '拒绝',
			onOk() {
				doAudit(1);
			},
			onCancel() {
				doAudit(2);
			}
		});
	};

	const onShelf = (row: AnyObject) => {
		const next = row.isShelf == 1 ? 0 : 1;
		const payload: AnyObject = { ...row, isShelf: next };
		delete payload.images;
		updateMountPet(payload).then(() => {
			message.success(next == 1 ? '已上架' : '已下架');
			getData();
		});
	};

	useEffect(() => {
		getData();
	}, []);

	return (
		<PageOverlay>
			<div className='flex items-center justify-between'>
				<Form layout='inline' formik={search}>
					<Form.Item name='name' label='名称'>
						<Input size='small' placeholder='请输入名称' />
					</Form.Item>
					<Form.Item name='type' label='类型'>
						<Select placeholder='请选择类型'>
							{TYPE_OPTIONS.map((item) => (
								<MenuItem key={item.value} value={String(item.value)}>
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
					{
						field: 'image',
						headerName: '图片',
						flex: 0,
						width: 130,
						renderCell({ row }) {
							const images = Array.isArray(row.images) ? row.images : [];
							if (!images.length) return '--';
							const urls = images
								.map((img: AnyObject) => img.image)
								.filter(Boolean);
							return (
								<Stack direction='row' spacing={0.5} alignItems='center'>
									{images.slice(0, 3).map((img: AnyObject) => (
										<ImagePreview
											key={img.id ?? img.image}
											value={img.image}
											images={urls}
										/>
									))}
									{images.length > 3 ? (
										<Typography variant='caption'>+{images.length - 3}</Typography>
									) : null}
								</Stack>
							);
						}
					},
					{ field: 'name', headerName: '名称' },
					{
						field: 'type',
						headerName: '类型',
						renderCell({ value }) {
							return getOptionLabel(TYPE_OPTIONS, value);
						}
					},
					{
						field: 'petType',
						headerName: '宠物类型',
						renderCell({ value }) {
							return getOptionLabel(PET_TYPE_OPTIONS, value);
						}
					},
					{
						field: 'race',
						headerName: '种族',
						renderCell({ value }) {
							return getOptionLabel(RACE_OPTIONS, value);
						}
					},
					{ field: 'sort', headerName: '顺序' },
					{
						field: 'description',
						headerName: '描述',
						flex: 1,
						renderCell({ value }) {
							return renderContent(value);
						}
					},
					{
						field: 'isAudit',
						headerName: '审核状态',
						renderCell({ value }) {
							if (value == 2) return '已拒绝';
							return value == 1 ? '已通过' : '待审核';
						}
					},
					{
						field: 'isShelf',
						headerName: '是否上架',
						renderCell({ value }) {
							return value == 1 ? '上架' : '下架';
						}
					},
					{
						field: 'action',
						headerName: '操作',
						flex: 0,
						width: 220,
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
										color={row.isShelf == 1 ? 'warning' : 'success'}
										size='small'
										title={row.isShelf == 1 ? '下架' : '上架'}
										onClick={() => onShelf(row)}
									>
										{row.isShelf == 1 ? <ArrowDownRegular /> : <ArrowUpRegular />}
									</IconButton>
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
				title={editId ? '编辑骑宠' : '新增骑宠'}
				open={isOpen}
				onOk={onSave}
				onClose={onCancel}
			>
				<Form labelCol={{ flex: '0 0 100px' }} formik={formik}>
					<Form.Item required name='name' label='名称'>
						<Input size='small' placeholder='请输入名称' />
					</Form.Item>
					<Form.Item name='type' label='类型'>
						<Select placeholder='请选择类型'>
							{TYPE_OPTIONS.map((item) => (
								<MenuItem key={item.value} value={String(item.value)}>
									{item.label}
								</MenuItem>
							))}
						</Select>
					</Form.Item>
					<Form.Item name='petType' label='宠物类型'>
						<Select placeholder='请选择宠物类型'>
							{PET_TYPE_OPTIONS.map((item) => (
								<MenuItem key={item.value} value={String(item.value)}>
									{item.label}
								</MenuItem>
							))}
						</Select>
					</Form.Item>
					<Form.Item name='race' label='种族'>
						<Select placeholder='请选择种族'>
							{RACE_OPTIONS.map((item) => (
								<MenuItem key={item.value} value={String(item.value)}>
									{item.label}
								</MenuItem>
							))}
						</Select>
					</Form.Item>
					<Form.Item name='sort' label='顺序'>
						<Input size='small' placeholder='请输入顺序' />
					</Form.Item>
					<Form.Item name='image' label='图片'>
						<Upload multiple maxSize={MAX_IMAGE_SIZE} />
					</Form.Item>
					<Form.Item name='description' label='描述'>
						<Input.TextArea minRows={3} placeholder='请输入描述' />
					</Form.Item>
				</Form>
			</Modal>
		</PageOverlay>
	);
};
