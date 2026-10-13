import { useEffect, useState } from 'react';
import {
	App,
	Button,
	Form,
	Input,
	Modal,
	Radio,
	Space,
	Table,
	Tag
} from 'antd';
import {
	DeleteOutlined,
	EditOutlined,
	PlusOutlined,
	SearchOutlined
} from '@ant-design/icons';
import { useTable } from '@/core';
import { usePermission } from '@/authority';
import { addPost, deletePost, getPostById, updatePost } from '@/service';

export const Component = () => {
	const { message, modal } = App.useApp();
	const { hasPermi } = usePermission();
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKeys, setSelectKeys] = useState<(string | number)[]>([]);

	const { tableProps, getData } = useTable('/system/post/list', () => searchForm.getFieldsValue());

	const [searchForm] = Form.useForm();
	const [form] = Form.useForm();

	const onSearch = (values: AnyObject) => {
		getData(values);
	};

	const onReset = () => {
		searchForm.resetFields();
		getData();
	};

	const onFinish = (values: AnyObject) => {
		if (editId) {
			updatePost({ ...values, id: editId }).then(() => {
				message.success('修改成功');
				onCancel();
				getData();
			});
		} else {
			addPost(values).then(() => {
				message.success('新增成功');
				onCancel();
				getData();
			});
		}
	};

	const onEdit = (id?: string | number) => {
		if (id) {
			setEditId(id);
			getPostById(id).then((result) => {
				form.setFieldsValue(result.data);
				setIsOpen(true);
			});
		} else {
			setEditId('');
			form.resetFields();
			setIsOpen(true);
		}
	};

	const onCancel = () => {
		setIsOpen(false);
		setEditId('');
		form.resetFields();
	};

	const onDelete = (id: string | number) => {
		modal.confirm({
			title: '系统提示',
			content: '是否确认删除该岗位?',
			onOk() {
				deletePost(id).then(() => {
					message.success('删除成功');
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的岗位');
			return;
		}
		modal.confirm({
			title: '系统提示',
			content: `是否确认删除选中的 ${selectKeys.length} 项数据?`,
			onOk() {
				deletePost(selectKeys.join(',')).then(() => {
					message.success('删除成功');
					setSelectKeys([]);
					getData();
				});
			}
		});
	};

	const columns = [
		{
			title: '岗位名称',
			dataIndex: 'postName'
		},
		{
			title: '岗位编码',
			dataIndex: 'postCode'
		},
		{
			title: '岗位排序',
			dataIndex: 'postSort'
		},
		{
			title: '状态',
			dataIndex: 'status',
			render: (value: any) => (
				<Tag color={value == 0 ? 'success' : 'error'}>
					{value == 0 ? '正常' : '停用'}
				</Tag>
			)
		},
		{
			title: '创建时间',
			dataIndex: 'createTime'
		},
		{
			title: '操作',
			dataIndex: 'action',
			width: 130,
			render: (_: any, row: AnyObject) => (
				<>
					{hasPermi('system:post:edit') && (
						<Button
							type='link'
							size='small'
							icon={<EditOutlined />}
							title='编辑'
							onClick={() => onEdit(row.id)}
						/>
					)}
					{hasPermi('system:post:remove') && (
						<Button
							type='link'
							size='small'
							danger
							icon={<DeleteOutlined />}
							title='删除'
							onClick={() => onDelete(row.id)}
						/>
					)}
				</>
			)
		}
	];

	useEffect(() => {
		getData();
	}, []);

	return (
		<div className='p-4 flex flex-col gap-4'>
			<div className='flex items-center justify-between'>
				<Form form={searchForm} layout='inline' onFinish={onSearch}>
					<Form.Item name='postName' label='岗位名称'>
						<Input placeholder='请输入岗位名称' />
					</Form.Item>
					<Form.Item name='postCode' label='岗位编码'>
						<Input placeholder='请输入岗位编码' />
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
					{hasPermi('system:post:add') && (
						<Button type='primary' icon={<PlusOutlined />} onClick={() => onEdit()}>
							新建
						</Button>
					)}
					{hasPermi('system:post:remove') && (
						<Button
							danger
							type='primary'
							icon={<DeleteOutlined />}
							disabled={selectKeys.length == 0}
							onClick={onBatchDelete}
						>
							批量删除
						</Button>
					)}
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
				title={editId ? '编辑岗位' : '新增岗位'}
				open={isOpen}
				destroyOnHidden
				forceRender
				onOk={() => form.submit()}
				onCancel={onCancel}
			>
				<Form
					form={form}
					labelCol={{ flex: '0 0 100px' }}
					initialValues={{
						postName: '',
						postCode: '',
						postSort: 0,
						status: '0',
						remark: ''
					}}
					onFinish={onFinish}
				>
					<Form.Item
						name='postName'
						label='岗位名称'
						rules={[{ required: true, message: '请输入岗位名称' }]}
					>
						<Input placeholder='请输入岗位名称' />
					</Form.Item>
					<Form.Item
						name='postCode'
						label='岗位编码'
						rules={[{ required: true, message: '请输入岗位编码' }]}
					>
						<Input placeholder='请输入岗位编码' />
					</Form.Item>
					<Form.Item name='postSort' label='岗位排序'>
						<Input placeholder='请输入岗位排序' />
					</Form.Item>
					<Form.Item name='status' label='状态'>
						<Radio.Group>
							<Radio value='0'>正常</Radio>
							<Radio value='1'>停用</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item name='remark' label='备注'>
						<Input.TextArea placeholder='请输入备注' />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};
