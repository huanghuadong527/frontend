import * as Yup from 'yup';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import {
	Button,
	Dialog,
	IconButton,
	MenuItem,
	RadioGroup,
	Stack,
	Typography
} from '@mui/material';
import type { GridRowId } from '@mui/x-data-grid';
import { useFormik, type FormikValues } from 'formik';
import {
	AddRegular,
	ArrowDownloadRegular,
	EditRegular,
	DeleteRegular,
	SearchRegular,
	CloudArrowUpRegular
} from '@fluentui/react-icons';
import {
	Autocomplete,
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
import { API_UPLOAD, useTable } from '@/core';
import {
	addCharacter,
	deleteCharacter,
	downloadFile,
	getCharacterById,
	updateCharacter,
	uploadFile
} from '@/service';
import { getFileName } from '@/utils';

const ROLE_OPTIONS = [
	'男武侠',
	'女武侠',
	'男法师',
	'女法师',
	'男妖兽',
	'女妖兽',
	'男羽芒',
	'女羽芒',
	'男羽毛',
	'女羽毛',
	'女妖精'
];

const renderYesNo = (value: unknown) => (value == 1 ? '是' : '否');

const getImageUrl = (value: unknown) => {
	const src = String(value);
	return src.startsWith('http') ? src : API_UPLOAD + src;
};

const renderImage = (value: unknown, onClick?: () => void) => {
	if (!value) return '--';
	return (
		<Stack
			className='h-full'
			sx={{
				justifyContent: 'center',
				alignItems: 'center'
			}}
		>
			<img
				src={getImageUrl(value)}
				alt=''
				onClick={onClick}
				style={{
					width: 28,
					height: 28,
					objectFit: 'cover',
					borderRadius: 4,
					cursor: 'pointer'
				}}
			/>
		</Stack>
	);
};

export const Component = () => {
	const fileRef = useRef<HTMLInputElement>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKeys, setSelectKeys] = useState<GridRowId[]>([]);
	const [fileName, setFileName] = useState('');
	const [previewUrl, setPreviewUrl] = useState('');

	const { tableProps, getData } = useTable('/game/wm/character/list');

	const search = useFormik<FormikValues>({
		initialValues: { name: '', sharer: '' },
		onSubmit(values) {
			getData({
				name: values.name || undefined,
				sharer: values.sharer || undefined
			});
		},
		onReset() {
			getData();
		}
	});

	const formik = useFormik<FormikValues>({
		initialValues: {
			name: '',
			roles: [],
			tags: [],
			sharer: '',
			isTop: '0',
			isVisible: '1',
			isRecommend: '0',
			downloadUrl: '',
			url: '',
			sort: ''
		},
		validationSchema: Yup.object().shape({
			name: Yup.string().required('请输入代码名称')
		}),
		onSubmit(values) {
			const params = {
				name: values.name,
				roles: Array.isArray(values.roles)
					? values.roles.join(',')
					: values.roles,
				tags: Array.isArray(values.tags) ? values.tags.join(',') : values.tags,
				sharer: values.sharer || undefined,
				isTop: Number(values.isTop),
				isVisible: Number(values.isVisible),
				isRecommend: Number(values.isRecommend),
				downloadUrl: values.downloadUrl || undefined,
				url: values.url || undefined,
				sort: values.sort === '' ? null : Number(values.sort)
			};
			if (editId) {
				updateCharacter({ ...params, id: editId }).then(() => {
					message.success('修改成功');
					onCancel();
					getData();
				});
			} else {
				addCharacter(params).then(() => {
					message.success('新增成功');
					onCancel();
					getData();
				});
			}
		}
	});

	const onUpload = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		e.target.value = '';
		if (!file) return;
		const formData = new FormData();
		formData.append('file', file);
		uploadFile(formData).then((result) => {
			formik.setFieldValue('downloadUrl', result.data);
			setFileName(file.name);
		});
	};

	const onEdit = (id?: string | number) => {
		if (id) {
			setEditId(id);
			getCharacterById(id).then((result) => {
				const record = result.data;
				formik.resetForm();
				formik.setValues({
					name: record.name ?? '',
					roles: record.roles ? record.roles.split(',') : [],
					tags: record.tags ? record.tags.split(',') : [],
					sharer: record.sharer ?? '',
					isTop: record.isTop != null ? String(record.isTop) : '0',
					isVisible: record.isVisible != null ? String(record.isVisible) : '1',
					isRecommend:
						record.isRecommend != null ? String(record.isRecommend) : '0',
					downloadUrl: record.downloadUrl ?? '',
					url: record.url ?? '',
					sort: record.sort != null ? String(record.sort) : ''
				});
				setFileName(record.downloadUrl ? getFileName(record.downloadUrl) : '');
				setIsOpen(true);
			});
		} else {
			setEditId('');
			formik.resetForm();
			setFileName('');
			setIsOpen(true);
		}
	};

	const onSave = () => {
		formik.handleSubmit();
	};

	const onCancel = () => {
		setIsOpen(false);
		setEditId('');
		setFileName('');
		formik.resetForm();
	};

	const onDelete = (id: string | number) => {
		confirm({
			type: 'warning',
			title: '系统提示',
			content: '是否确认删除该代码?',
			onOk() {
				deleteCharacter(id).then(() => {
					message.success('删除成功');
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的代码');
			return;
		}
		confirm({
			type: 'warning',
			title: '系统提示',
			content: `是否确认删除选中的 ${selectKeys.length} 项数据?`,
			onOk() {
				deleteCharacter(selectKeys.join(',')).then(() => {
					message.success('删除成功');
					setSelectKeys([]);
					getData();
				});
			}
		});
	};

	const onDownload = (record: AnyObject) => {
		downloadFile(record.downloadUrl).then((result) => {
			const blob = result as unknown as Blob;
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = getFileName(record.downloadUrl) || '下载文件';
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		});
	};

	useEffect(() => {
		getData();
	}, []);

	return (
		<PageOverlay>
			<div className='flex items-center justify-between'>
				<Form layout='inline' formik={search}>
					<Form.Item name='name' label='代码名称'>
						<Input size='small' placeholder='请输入代码名称' />
					</Form.Item>
					<Form.Item name='sharer' label='分享人'>
						<Input size='small' placeholder='请输入分享人' />
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
						headerName: '代码名称'
					},
					{
						field: 'sort',
						headerName: '排序'
					},
					{
						field: 'roles',
						headerName: '可用角色'
					},
					{
						field: 'tags',
						headerName: '标签'
					},
					{
						field: 'sharer',
						headerName: '分享人'
					},
					{
						field: 'isTop',
						headerName: '是否置顶',
						renderCell({ value }) {
							return renderYesNo(value);
						}
					},
					{
						field: 'isVisible',
						headerName: '是否可见',
						renderCell({ value }) {
							return renderYesNo(value);
						}
					},
					{
						field: 'isRecommend',
						headerName: '是否推荐',
						renderCell({ value }) {
							return renderYesNo(value);
						}
					},
					{
						field: 'url',
						headerName: '预览图片',
						flex: 0,
						width: 80,
						renderCell({ value }) {
							return renderImage(
								value,
								() => {
									(document.activeElement as HTMLElement | null)?.blur();
									setPreviewUrl(getImageUrl(value));
								}
							);
						}
					},
					{
						field: 'downloadUrl',
						headerName: '下载地址',
						flex: 1,
						renderCell({ value, row }) {
							if (!value) return '--';
							return (
								<Button
									size='small'
									startIcon={<ArrowDownloadRegular />}
									onClick={() => onDownload(row)}
								>
									{getFileName(value)}
								</Button>
							);
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
				title={editId ? '编辑代码' : '新增代码'}
				open={isOpen}
				onOk={onSave}
				onClose={onCancel}
			>
				<Form labelCol={{ flex: '0 0 100px' }} formik={formik}>
					<Form.Item required name='name' label='代码名称'>
						<Input size='small' placeholder='请输入代码名称' />
					</Form.Item>
					<Form.Item name='roles' label='可用角色'>
						<Select multiple placeholder='请选择可用角色'>
							{ROLE_OPTIONS.map((item) => (
								<MenuItem key={item} value={item}>
									{item}
								</MenuItem>
							))}
						</Select>
					</Form.Item>
					<Form.Item name='sort' label='排序'>
						<Input size='small' placeholder='请输入排序' />
					</Form.Item>
					<Form.Item name='tags' label='标签'>
						<Autocomplete
							multiple
							freeSolo
							size='small'
							options={[]}
							placeholder='请输入标签'
						/>
					</Form.Item>
					<Form.Item name='sharer' label='分享人'>
						<Input size='small' placeholder='请输入分享人' />
					</Form.Item>
					<Form.Item name='isTop' label='是否置顶'>
						<RadioGroup row>
							<Radio value='1' label='是' />
							<Radio value='0' label='否' />
						</RadioGroup>
					</Form.Item>
					<Form.Item name='isVisible' label='是否可见'>
						<RadioGroup row>
							<Radio value='1' label='是' />
							<Radio value='0' label='否' />
						</RadioGroup>
					</Form.Item>
					<Form.Item name='isRecommend' label='是否推荐'>
						<RadioGroup row>
							<Radio value='1' label='是' />
							<Radio value='0' label='否' />
						</RadioGroup>
					</Form.Item>
					<Form.Item name='url' label='预览图片'>
						<Upload />
					</Form.Item>
					<Form.Item label='下载地址'>
						<Stack direction='row' spacing={1} alignItems='center'>
							<Button
								variant='contained'
								startIcon={<CloudArrowUpRegular />}
								onClick={() => fileRef.current?.click()}
							>
								上传文件
							</Button>
							<Typography variant='body2'>{fileName || '--'}</Typography>
							<input ref={fileRef} type='file' hidden onChange={onUpload} />
						</Stack>
					</Form.Item>
				</Form>
			</Modal>
			<Dialog
				open={!!previewUrl}
				onClose={() => setPreviewUrl('')}
				maxWidth='md'
				PaperProps={{
					sx: { backgroundColor: 'transparent', boxShadow: 'none' }
				}}
			>
				{previewUrl ? (
					<img
						src={previewUrl}
						alt='预览大图'
						onClick={() => setPreviewUrl('')}
						style={{
							maxWidth: '90vw',
							maxHeight: '90vh',
							objectFit: 'contain',
							display: 'block',
							margin: '0 auto',
							cursor: 'zoom-out'
						}}
					/>
				) : null}
			</Dialog>
		</PageOverlay>
	);
};
