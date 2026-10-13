import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import {
	CheckOutlined,
	CloudUploadOutlined,
	DeleteOutlined,
	DownloadOutlined,
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
	Radio,
	Select,
	Space,
	Table,
	Tag
} from 'antd';
import type { TableColumnsType } from 'antd';
import { ImageUpload } from '@/components/image-upload';
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

export const Component = () => {
	const { message, modal } = App.useApp();
	const fileRef = useRef<HTMLInputElement>(null);
	const [searchForm] = Form.useForm();
	const [form] = Form.useForm();
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKeys, setSelectKeys] = useState<(string | number)[]>([]);
	const [fileName, setFileName] = useState('');

	const { tableProps, getData } = useTable('/game/wm/character/list', () => searchForm.getFieldsValue());

	const onSearch = (values: AnyObject) => {
		getData({
			name: values.name || undefined,
			sharer: values.sharer || undefined
		});
	};

	const onReset = () => {
		searchForm.resetFields();
		getData();
	};

	const onFinish = (values: AnyObject) => {
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
			isMemberOnly: Number(values.isMemberOnly),
			isAudit: 1,
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
	};

	const onUpload = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		e.target.value = '';
		if (!file) return;
		const formData = new FormData();
		formData.append('file', file);
		uploadFile(formData).then((result) => {
			form.setFieldsValue({ downloadUrl: result.data });
			setFileName(file.name);
		});
	};

	const onEdit = (id?: string | number) => {
		if (id) {
			setEditId(id);
			getCharacterById(id).then((result) => {
				const record = result.data;
				form.resetFields();
				form.setFieldsValue({
					name: record.name ?? '',
					roles: record.roles ? record.roles.split(',') : [],
					tags: record.tags ? record.tags.split(',') : [],
					sharer: record.sharer ?? '',
					isTop: record.isTop != null ? String(record.isTop) : '0',
					isVisible: record.isVisible != null ? String(record.isVisible) : '1',
					isRecommend:
						record.isRecommend != null ? String(record.isRecommend) : '0',
					isMemberOnly:
						record.isMemberOnly != null ? String(record.isMemberOnly) : '0',
					downloadUrl: record.downloadUrl ?? '',
					url: record.url ?? '',
					sort: record.sort != null ? String(record.sort) : ''
				});
				setFileName(record.downloadUrl ? getFileName(record.downloadUrl) : '');
				setIsOpen(true);
			});
		} else {
			setEditId('');
			form.resetFields();
			setFileName('');
			setIsOpen(true);
		}
	};

	const onSave = () => {
		form.submit();
	};

	const onCancel = () => {
		setIsOpen(false);
		setEditId('');
		setFileName('');
		form.resetFields();
	};

	const onDelete = (id: string | number) => {
		modal.confirm({
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
		modal.confirm({
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

	const onAudit = (row: AnyObject) => {
		modal.confirm({
			title: '审核',
			content: '请选择审核结果',
			okText: '通过',
			cancelText: '拒绝',
			onOk() {
				updateCharacter({ ...row, isAudit: 1 }).then(() => {
					message.success('已通过审核');
					getData();
				});
			},
			onCancel() {
				updateCharacter({ ...row, isAudit: 2 }).then(() => {
					message.success('已拒绝');
					getData();
				});
			}
		});
	};

	useEffect(() => {
		getData();
	}, []);

	const columns: TableColumnsType<AnyObject> = [
		{ title: '编号', dataIndex: 'id' },
		{ title: '代码名称', dataIndex: 'name' },
		{ title: '排序', dataIndex: 'sort' },
		{ title: '可用角色', dataIndex: 'roles' },
		{ title: '标签', dataIndex: 'tags' },
		{ title: '分享人', dataIndex: 'sharer' },
		{
			title: '是否置顶',
			dataIndex: 'isTop',
			render: (value) => renderYesNo(value)
		},
		{
			title: '是否可见',
			dataIndex: 'isVisible',
			render: (value) => renderYesNo(value)
		},
		{
			title: '是否推荐',
			dataIndex: 'isRecommend',
			render: (value) => renderYesNo(value)
		},
		{
			title: '会员专属',
			dataIndex: 'isMemberOnly',
			render: (value) => renderYesNo(value)
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
			title: '预览图片',
			dataIndex: 'url',
			width: 80,
			render: (value) => (
				<Image
					src={value ? API_UPLOAD + value : ''}
					width={40}
					height={40}
					style={{ objectFit: 'cover' }}
				/>
			)
		},
		{
			title: '下载地址',
			dataIndex: 'downloadUrl',
			render: (value, row) => {
				if (!value) return '--';
				return (
					<Button
						size='small'
						icon={<DownloadOutlined />}
						onClick={() => onDownload(row)}
					>
						{getFileName(value)}
					</Button>
				);
			}
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
					<Form.Item name='name' label='代码名称'>
						<Input placeholder='请输入代码名称' />
					</Form.Item>
					<Form.Item name='sharer' label='分享人'>
						<Input placeholder='请输入分享人' />
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
				title={editId ? '编辑代码' : '新增代码'}
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
						roles: [],
						tags: [],
						sharer: '',
						isTop: '0',
						isVisible: '1',
						isRecommend: '0',
						isMemberOnly: '0',
						downloadUrl: '',
						url: '',
						sort: ''
					}}
				>
					<Form.Item
						name='name'
						label='代码名称'
						rules={[{ required: true, message: '请输入代码名称' }]}
					>
						<Input placeholder='请输入代码名称' />
					</Form.Item>
					<Form.Item name='roles' label='可用角色'>
						<Select
							mode='multiple'
							placeholder='请选择可用角色'
							options={ROLE_OPTIONS.map((item) => ({
								value: item,
								label: item
							}))}
						/>
					</Form.Item>
					<Form.Item name='sort' label='排序'>
						<Input placeholder='请输入排序' />
					</Form.Item>
					<Form.Item name='tags' label='标签'>
						<Select mode='tags' placeholder='请输入标签' />
					</Form.Item>
					<Form.Item name='sharer' label='分享人'>
						<Input placeholder='请输入分享人' />
					</Form.Item>
					<Form.Item name='isTop' label='是否置顶'>
						<Radio.Group>
							<Radio value='1'>是</Radio>
							<Radio value='0'>否</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item name='isVisible' label='是否可见'>
						<Radio.Group>
							<Radio value='1'>是</Radio>
							<Radio value='0'>否</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item name='isRecommend' label='是否推荐'>
						<Radio.Group>
							<Radio value='1'>是</Radio>
							<Radio value='0'>否</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item name='isMemberOnly' label='会员专属'>
						<Radio.Group>
							<Radio value='1'>是</Radio>
							<Radio value='0'>否</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item name='url' label='预览图片'>
						<ImageUpload />
					</Form.Item>
					<Form.Item label='下载地址'>
						<Space align='center'>
							<Button
								type='primary'
								icon={<CloudUploadOutlined />}
								onClick={() => fileRef.current?.click()}
							>
								上传文件
							</Button>
							<span>{fileName || '--'}</span>
							<input ref={fileRef} type='file' hidden onChange={onUpload} />
						</Space>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};
