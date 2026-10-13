import { useEffect, useState } from 'react';
import {
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
	Radio,
	Space,
	Table,
	Tag
} from 'antd';
import type { TableColumnsType } from 'antd';
import { ImageUpload } from '@/components/image-upload';
import { API_UPLOAD, useTable } from '@/core';
import {
	addGallery,
	deleteGallery,
	getGalleryById,
	updateGallery
} from '@/service';

const renderYesNo = (value: unknown) => (value == 1 ? '是' : '否');

export const Component = () => {
	const { message, modal } = App.useApp();
	const [searchForm] = Form.useForm();
	const [form] = Form.useForm();
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKeys, setSelectKeys] = useState<(string | number)[]>([]);

	const { tableProps, getData } = useTable('/game/wm/gallery/list', () => searchForm.getFieldsValue());

	const onSearch = (values: AnyObject) => {
		getData({ name: values.name || undefined });
	};

	const onReset = () => {
		searchForm.resetFields();
		getData();
	};

	const onFinish = (values: AnyObject) => {
		const params = {
			name: values.name,
			image: values.image || undefined,
			description: values.description || undefined,
			isOnSale: Number(values.isOnSale),
			isRecommend: Number(values.isRecommend),
			isAudit: 1
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
	};

	const onEdit = (id?: string | number) => {
		if (id) {
			setEditId(id);
			getGalleryById(id).then((result) => {
				const record = result.data;
				form.resetFields();
				form.setFieldsValue({
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
			form.resetFields();
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
	};

	const onDelete = (id: string | number) => {
		modal.confirm({
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
		modal.confirm({
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

	const onAudit = (row: AnyObject) => {
		modal.confirm({
			title: '审核',
			content: '请选择审核结果',
			okText: '通过',
			cancelText: '拒绝',
			onOk() {
				updateGallery({ ...row, isAudit: 1 }).then(() => {
					message.success('已通过审核');
					getData();
				});
			},
			onCancel() {
				updateGallery({ ...row, isAudit: 2 }).then(() => {
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
		{
			title: '图片',
			dataIndex: 'image',
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
		{ title: '画廊名称', dataIndex: 'name' },
		{ title: '描述', dataIndex: 'description' },
		{
			title: '是否上架',
			dataIndex: 'isOnSale',
			render: (value) => renderYesNo(value)
		},
		{
			title: '主页推荐',
			dataIndex: 'isRecommend',
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
					<Form.Item name='name' label='画廊名称'>
						<Input placeholder='请输入画廊名称' />
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
				title={editId ? '编辑画廊' : '新增画廊'}
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
						image: '',
						description: '',
						isOnSale: '1',
						isRecommend: '0'
					}}
				>
					<Form.Item
						name='name'
						label='画廊名称'
						rules={[{ required: true, message: '请输入画廊名称' }]}
					>
						<Input placeholder='请输入画廊名称' />
					</Form.Item>
					<Form.Item name='image' label='图片'>
						<ImageUpload />
					</Form.Item>
					<Form.Item name='description' label='描述'>
						<Input.TextArea rows={3} placeholder='请输入描述' />
					</Form.Item>
					<Form.Item name='isOnSale' label='是否上架'>
						<Radio.Group>
							<Radio value='1'>是</Radio>
							<Radio value='0'>否</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item name='isRecommend' label='主页推荐'>
						<Radio.Group>
							<Radio value='1'>是</Radio>
							<Radio value='0'>否</Radio>
						</Radio.Group>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};
