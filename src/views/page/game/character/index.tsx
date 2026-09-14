import { Key, useCallback, useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Popconfirm, Radio, Select, Space, Table, Tag, Upload } from 'antd';
import { message } from '@/redux';
import type { TableProps, UploadProps } from 'antd';
import {
	DeleteOutlined,
	EditOutlined,
	PlusOutlined,
	SearchOutlined,
	UploadOutlined
} from '@ant-design/icons';
import { FORM_LAYOUT } from '@/core';
import {
	addCharacter,
	deleteCharacter,
	downloadFile,
	getCharacterById,
	getCharacterList,
	updateCharacter,
	uploadFile
} from '@/service';
import { getFileName } from '@/utils';

const ROLE_OPTIONS = [
	{ label: '男武侠', value: '男武侠' },
	{ label: '女武侠', value: '女武侠' },
	{ label: '男法师', value: '男法师' },
	{ label: '女法师', value: '女法师' },
	{ label: '男妖兽', value: '男妖兽' },
	{ label: '女妖兽', value: '女妖兽' },
	{ label: '男羽芒', value: '男羽芒' },
	{ label: '女羽芒', value: '女羽芒' },
	{ label: '男羽毛', value: '男羽毛' },
	{ label: '女羽毛', value: '女羽毛' },
	{ label: '女妖精', value: '女妖精' }
];

const Character = () => {
	const [visible, setVisible] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
	const [dataSource, setDataSource] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [pageNum, setPageNum] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [total, setTotal] = useState(0);
	const [fileList, setFileList] = useState<any[]>([]);
	const [searchForm] = Form.useForm();
	const [form] = Form.useForm();

	const getData = useCallback(
		(params: object = {}) => {
			setLoading(true);
			getCharacterList({ pageNum, pageSize, ...params }).then((result) => {
				setLoading(false);
				setTotal(result.data?.total ?? 0);
				setDataSource(result.data?.data ?? []);
			});
		},
		[pageNum, pageSize]
	);

	useEffect(() => {
		getData();
	}, [getData]);

	const onSearch = (values: any) => {
		getData({
			name: values.name || undefined,
			sharer: values.sharer || undefined
		});
	};

	const onReset = () => {
		searchForm.resetFields();
		getData();
	};

	const uploadProps: UploadProps = {
		name: 'file',
		maxCount: 1,
		fileList,
		onRemove: () => {
			form.setFieldValue('downloadUrl', null);
			setFileList([]);
		},
		customRequest: ({ file }: any) => {
			const formData = new FormData();
			formData.append('file', file);
			setFileList([{ ...file, status: 'uploading' }]);
			uploadFile(formData).then((result) => {
				form.setFieldValue('downloadUrl', result.data);
				setFileList([{ ...file, status: 'done', name: file.name }]);
			});
		}
	};

	const onEdit = (id?: string | number) => {
		if (id) {
			setEditId(id);
			getCharacterById(id).then((result) => {
				const record = result.data;
				form.setFieldsValue({
					...record,
					roles: record.roles ? record.roles.split(',') : [],
					tags: record.tags ? record.tags.split(',') : []
				});
				if (record.downloadUrl) {
					setFileList([
						{
							uid: record.id,
							name: getFileName(record.downloadUrl) || '下载文件',
							status: 'done'
						}
					]);
				} else {
					setFileList([]);
				}
				setVisible(true);
			});
		} else {
			setEditId('');
			form.resetFields();
			form.setFieldsValue({ isTop: 0, isVisible: 1 });
			setFileList([]);
			setVisible(true);
		}
	};

	const onSave = () => {
		form.validateFields().then((values) => {
			const params = {
				...values,
				roles: Array.isArray(values.roles) ? values.roles.join(',') : values.roles,
				tags: Array.isArray(values.tags) ? values.tags.join(',') : values.tags
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
		});
	};

	const onCancel = () => {
		setVisible(false);
		setEditId('');
		form.resetFields();
		setFileList([]);
	};

	const onDelete = (id: string | number) => {
		deleteCharacter(id).then(() => {
			message.success('删除成功');
			getData();
		});
	};

	const onBatchDelete = () => {
		if (selectedRowKeys.length === 0) {
			message.warning('请选择要删除的代码');
			return;
		}
		deleteCharacter(selectedRowKeys.join(',')).then(() => {
			message.success('删除成功');
			setSelectedRowKeys([]);
			getData();
		});
	};

	const onDownload = (record: any) => {
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

	const renderTags = (value: unknown) => {
		if (!value) return '--';
		const list = String(value)
			.split(',')
			.map((item) => item.trim())
			.filter(Boolean);
		if (list.length === 0) return '--';
		return list.map((item) => <Tag key={item}>{item}</Tag>);
	};

	const renderYesNo = (value: unknown) =>
		value == 1 ? <Tag color='green'>是</Tag> : <Tag>否</Tag>;

	const columns: TableProps<any>['columns'] = [
		{ title: '编号', dataIndex: 'id', width: 70 },
		{ title: '代码名称', dataIndex: 'name' },
		{ title: '可用角色', dataIndex: 'roles', render: renderTags },
		{ title: '标签', dataIndex: 'tags', render: renderTags },
		{ title: '分享人', dataIndex: 'sharer' },
		{ title: '是否置顶', dataIndex: 'isTop', render: renderYesNo },
		{ title: '是否可见', dataIndex: 'isVisible', render: renderYesNo },
		{
			title: '下载地址',
			dataIndex: 'downloadUrl',
			render: (value, record) =>
				value ? (
					<Button type='link' size='small' onClick={() => onDownload(record)}>
						{getFileName(value)}
					</Button>
				) : (
					'--'
				)
		},
		{
			title: '操作',
			width: 120,
			render: (_, record) => (
				<Space>
					<Button
						type='link'
						size='small'
						icon={<EditOutlined />}
						onClick={() => onEdit(record.id)}
					>
						编辑
					</Button>
					<Popconfirm title='是否确认删除?' onConfirm={() => onDelete(record.id)}>
						<Button type='link' size='small' danger icon={<DeleteOutlined />}>
							删除
						</Button>
					</Popconfirm>
				</Space>
			)
		}
	];

	return (
		<div className='w-full h-full flex flex-col'>
			<div className='flex justify-between mb-4'>
				<Form layout='inline' form={searchForm} onFinish={onSearch}>
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
					<Popconfirm title='是否确认删除?' onConfirm={onBatchDelete}>
						<Button danger icon={<DeleteOutlined />} disabled={selectedRowKeys.length === 0}>
							批量删除
						</Button>
					</Popconfirm>
				</Space>
			</div>
			<Table
				rootClassName='table-fill'
				size='small'
				rowKey='id'
				loading={loading}
				dataSource={dataSource}
				columns={columns}
				scroll={{ x: 1200, y: '100%' }}
				rowSelection={{ selectedRowKeys, onChange: (keys) => setSelectedRowKeys(keys) }}
				pagination={{
					current: pageNum,
					pageSize,
					total,
					showSizeChanger: true,
					showQuickJumper: true,
					showTotal: (t) => `共 ${t} 条`,
					onChange: (page, size) => {
						setPageNum(page);
						setPageSize(size);
					}
				}}
			/>
			<Modal title={editId ? '编辑代码' : '新增代码'} open={visible} onOk={onSave} onCancel={onCancel}>
				<Form {...FORM_LAYOUT} form={form}>
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
							options={ROLE_OPTIONS}
							allowClear
						/>
					</Form.Item>
					<Form.Item name='tags' label='标签'>
						<Select mode='tags' placeholder='请输入标签' allowClear />
					</Form.Item>
					<Form.Item name='sharer' label='分享人'>
						<Input placeholder='请输入分享人' />
					</Form.Item>
					<Form.Item name='isTop' label='是否置顶'>
						<Radio.Group>
							<Radio value={1}>是</Radio>
							<Radio value={0}>否</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item name='isVisible' label='是否可见'>
						<Radio.Group>
							<Radio value={1}>是</Radio>
							<Radio value={0}>否</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item name='downloadUrl' label='下载地址'>
						<Upload {...uploadProps}>
							<Button icon={<UploadOutlined />}>上传文件</Button>
						</Upload>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export const Component = Character;
