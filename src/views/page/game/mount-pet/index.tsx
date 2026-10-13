import { useEffect, useState } from 'react';
import {
	ArrowDownOutlined,
	ArrowUpOutlined,
	CheckOutlined,
	DeleteOutlined,
	EditOutlined,
	PlusOutlined,
	SearchOutlined
} from '@ant-design/icons';
import {
	App,
	Button,
	Form,
	Image,
	Input,
	Modal,
	Select,
	Space,
	Table,
	Tag
} from 'antd';
import type { TableColumnsType } from 'antd';
import { ImageUpload } from '@/components/image-upload';
import { API_UPLOAD, useTable } from '@/core';
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

type ImageItem = {
	image: string;
	server: string;
	playerName: string;
	description: string;
};

const getOptionLabel = (options: typeof TYPE_OPTIONS, value: unknown) =>
	options.find((item) => item.value == value)?.label ?? '--';

const renderContent = (value: unknown) => {
	if (!value) return '--';
	const s = String(value);
	return s.length > 40 ? `${s.slice(0, 40)}…` : s;
};

export const Component = () => {
	const { message, modal } = App.useApp();
	const [searchForm] = Form.useForm();
	const [form] = Form.useForm();
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKeys, setSelectKeys] = useState<(string | number)[]>([]);
	const [imageList, setImageList] = useState<ImageItem[]>([]);
	const [previewOpen, setPreviewOpen] = useState(false);
	const [previewImage, setPreviewImage] = useState('');

	const { tableProps, getData } = useTable('/game/wm/mount-pet/list', () => searchForm.getFieldsValue());

	const onSearch = (values: AnyObject) => {
		getData({
			name: values.name || undefined,
			type: values.type === '' || values.type == null ? undefined : Number(values.type)
		});
	};

	const onReset = () => {
		searchForm.resetFields();
		getData();
	};

	const onFinish = (values: AnyObject) => {
		const images = imageList
			.filter((item) => item.image)
			.map((item) => ({
				image: item.image,
				server: item.server || undefined,
				playerName: item.playerName || undefined,
				description: item.description || undefined
			}));
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
	};

	const onEdit = (id?: string | number) => {
		if (id) {
			setEditId(id);
			getMountPetById(id).then((result) => {
				const record = result.data;
				form.resetFields();
				form.setFieldsValue({
					name: record.name ?? '',
					type: record.type != null ? String(record.type) : '',
					petType: record.petType != null ? String(record.petType) : '',
					race: record.race != null ? String(record.race) : '',
					sort: record.sort != null ? String(record.sort) : '',
					description: record.description ?? ''
				});
				setImageList(
					(record.images ?? []).map((img: AnyObject) => ({
						image: img.image ?? '',
						server: img.server ?? '',
						playerName: img.playerName ?? '',
						description: img.description ?? ''
					}))
				);
				setIsOpen(true);
			});
		} else {
			setEditId('');
			form.resetFields();
			setImageList([]);
			setIsOpen(true);
		}
	};

	const onSave = () => {
		form.submit();
	};

	const onCancel = () => {
		setIsOpen(false);
		setEditId('');
		form.resetFields();
		setImageList([]);
	};

	const onDelete = (id: string | number) => {
		modal.confirm({
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
		modal.confirm({
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
		modal.confirm({
			title: '审核',
			content: '请选择审核结果',
			okText: '通过',
			cancelText: '拒绝',
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

	const updateImageItem = (index: number, key: keyof ImageItem, value: string) => {
		setImageList((prev) =>
			prev.map((item, i) => (i === index ? { ...item, [key]: value } : item))
		);
	};

	const addImageItem = () => {
		setImageList((prev) => [
			...prev,
			{ image: '', server: '', playerName: '', description: '' }
		]);
	};

	const removeImageItem = (index: number) => {
		setImageList((prev) => prev.filter((_, i) => i !== index));
	};

	const handlePreview = (image: string) => {
		setPreviewImage(API_UPLOAD + image);
		setPreviewOpen(true);
	};

	useEffect(() => {
		getData();
	}, []);

	const columns: TableColumnsType<AnyObject> = [
		{ title: '编号', dataIndex: 'id' },
		{
			title: '图片',
			dataIndex: 'image',
			width: 130,
			render: (_v, row) => {
				const images = Array.isArray(row.images) ? row.images : [];
				if (!images.length) return '--';
				const urls = images
					.map((img: AnyObject) => (img.image ? API_UPLOAD + img.image : ''))
					.filter(Boolean);
				return (
					<Space size={4} align='center'>
						<Image.PreviewGroup items={urls}>
							{images.slice(0, 3).map((img: AnyObject) => (
								<Image
									key={img.id ?? img.image}
									src={img.image ? API_UPLOAD + img.image : ''}
									width={30}
									height={30}
									style={{ objectFit: 'cover' }}
								/>
							))}
						</Image.PreviewGroup>
						{images.length > 3 ? (
							<span className='text-xs'>+{images.length - 3}</span>
						) : null}
					</Space>
				);
			}
		},
		{ title: '名称', dataIndex: 'name' },
		{
			title: '类型',
			dataIndex: 'type',
			render: (value) => getOptionLabel(TYPE_OPTIONS, value)
		},
		{
			title: '宠物类型',
			dataIndex: 'petType',
			render: (value) => getOptionLabel(PET_TYPE_OPTIONS, value)
		},
		{
			title: '种族',
			dataIndex: 'race',
			render: (value) => getOptionLabel(RACE_OPTIONS, value)
		},
		{ title: '顺序', dataIndex: 'sort' },
		{
			title: '描述',
			dataIndex: 'description',
			render: (value) => renderContent(value)
		},
		{
			title: '审核状态',
			dataIndex: 'isAudit',
			render: (value) => {
				if (value == 2) return <Tag color='error'>已拒绝</Tag>;
				return value == 1 ? <Tag color='success'>已通过</Tag> : <Tag color='warning'>待审核</Tag>;
			}
		},
		{
			title: '是否上架',
			dataIndex: 'isShelf',
			render: (value) => (value == 1 ? <Tag color='success'>已上架</Tag> : <Tag color='default'>已下架</Tag>)
		},
		{
			title: '操作',
			dataIndex: 'action',
			width: 220,
			render: (_v, row) => (
				<>
					{row.isAudit == 0 && (
						<Button
							type='link'
							size='small'
							icon={<CheckOutlined />}
							title='审核'
							onClick={() => onAudit(row)}
						/>
					)}
					<Button
						type='link'
						size='small'
						danger={row.isShelf == 1}
						icon={row.isShelf == 1 ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
						title={row.isShelf == 1 ? '下架' : '上架'}
						onClick={() => onShelf(row)}
					/>
					<Button
						type='link'
						size='small'
						icon={<EditOutlined />}
						title='编辑'
						onClick={() => onEdit(row.id)}
					/>
					<Button
						type='link'
						size='small'
						danger
						icon={<DeleteOutlined />}
						title='删除'
						onClick={() => onDelete(row.id)}
					/>
				</>
			)
		}
	];

	return (
		<div className='p-4 flex flex-col gap-4'>
			<div className='flex items-center justify-between'>
				<Form form={searchForm} layout='inline' onFinish={onSearch}>
					<Form.Item name='name' label='名称'>
						<Input placeholder='请输入名称' />
					</Form.Item>
					<Form.Item name='type' label='类型'>
						<Select
							placeholder='请选择类型'
							options={TYPE_OPTIONS.map((item) => ({
								value: String(item.value),
								label: item.label
							}))}
						/>
					</Form.Item>
					<Form.Item>
						<Space>
							<Button type='primary' htmlType='submit' icon={<SearchOutlined />}>
								查询
							</Button>
							<Button onClick={onReset}>重置</Button>
						</Space>
					</Form.Item>
				</Form>
				<Space>
					<Button type='primary' icon={<PlusOutlined />} onClick={() => onEdit()}>
						新建
					</Button>
					<Button
						type='primary'
						danger
						icon={<DeleteOutlined />}
						disabled={selectKeys.length == 0}
						onClick={onBatchDelete}
					>
						批量删除
					</Button>
				</Space>
			</div>
			<Table
				{...tableProps}
				rowSelection={{
					selectedRowKeys: selectKeys,
					onChange: (keys) => setSelectKeys(keys as (string | number)[])
				}}
				columns={columns}
			/>
			<Modal
				title={editId ? '编辑骑宠' : '新增骑宠'}
				open={isOpen}
				onOk={onSave}
				onCancel={onCancel}
				destroyOnHidden
				forceRender
			>
				<Form
					form={form}
					labelCol={{ flex: '0 0 100px' }}
					onFinish={onFinish}
					initialValues={{
						name: '',
						type: '',
						petType: '',
						race: '',
						sort: '',
						description: ''
					}}
				>
					<Form.Item
						name='name'
						label='名称'
						rules={[{ required: true, message: '请输入名称' }]}
					>
						<Input placeholder='请输入名称' />
					</Form.Item>
					<Form.Item name='type' label='类型'>
						<Select
							placeholder='请选择类型'
							options={TYPE_OPTIONS.map((item) => ({
								value: String(item.value),
								label: item.label
							}))}
						/>
					</Form.Item>
					<Form.Item name='petType' label='宠物类型'>
						<Select
							placeholder='请选择宠物类型'
							options={PET_TYPE_OPTIONS.map((item) => ({
								value: String(item.value),
								label: item.label
							}))}
						/>
					</Form.Item>
					<Form.Item name='race' label='种族'>
						<Select
							placeholder='请选择种族'
							options={RACE_OPTIONS.map((item) => ({
								value: String(item.value),
								label: item.label
							}))}
						/>
					</Form.Item>
					<Form.Item name='sort' label='顺序'>
						<Input placeholder='请输入顺序' />
					</Form.Item>
					<Form.Item name='description' label='描述'>
						<Input.TextArea rows={3} placeholder='请输入描述' />
					</Form.Item>
					<Form.Item label='图片'>
						<div className='flex flex-wrap gap-3'>
							{imageList.map((item, index) => (
								<div key={index} className='relative'>
									<ImageUpload
										value={item.image}
										maxSize={MAX_IMAGE_SIZE}
										onPreview={() => handlePreview(item.image)}
										onChange={(value) => {
											if (value) {
												updateImageItem(index, 'image', value);
											} else {
												removeImageItem(index);
											}
										}}
									/>
								</div>
							))}
							<div
								style={{ width: 102, height: 102 }}
								className='flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 text-gray-400 cursor-pointer hover:border-blue-500 hover:text-blue-500'
								onClick={addImageItem}
							>
								<PlusOutlined />
								<span className='text-xs'>上传</span>
							</div>
						</div>
					</Form.Item>
				</Form>
			</Modal>
			<Image
				styles={{ root: { display: 'none' } }}
				preview={{
					open: previewOpen,
					onOpenChange: (open) => setPreviewOpen(open),
					afterOpenChange: (open) => !open && setPreviewImage('')
				}}
				src={previewImage || undefined}
			/>
		</div>
	);
};
