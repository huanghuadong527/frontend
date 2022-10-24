import {
	Button,
	Form,
	Input,
	InputNumber,
	message,
	Modal,
	Popconfirm,
	Radio,
	Space,
	Tag,
} from 'antd';
import { FORM_LAYOUT, useAntdTable } from '@/core';
import {
	addPostData,
	deletePostData,
	getPostDataById,
	updatePostData,
} from '@/service';
import { useState } from 'react';
import { DynamicSearch, DynamicTable } from '@/components';

const Post = () => {
	const [visible, setVisible] = useState(false);
	const [editId, setEditId] = useState('');
	const [form] = Form.useForm();
	const { dataSource, tableProps, loading, getTableData } = useAntdTable(
		'/system/post/list'
	);

	const onEdit = (id?: string | null, parentId?: string) => {
		if (id) {
			getPostDataById(id).then((result) => {
				setEditId(id);
				setVisible(true);
				form.setFieldsValue(result.data);
			});
		} else {
			if (parentId) {
				form.setFieldsValue({ parentId });
			}
			setVisible(true);
		}
	};

	const onSave = () => {
		form.validateFields().then((values) => {
			if (editId) {
				updatePostData({
					...values,
					id: editId,
				}).then(() => {
					onCancel();
					message.success('修改成功!');
					getTableData();
				});
			} else {
				addPostData(values).then(() => {
					onCancel();
					message.success('新增成功!');
					getTableData();
				});
			}
		});
	};

	const onCancel = () => {
		setEditId('');
		setVisible(false);
		form.resetFields();
	};

	const onDelete = (id: string) => {
		if (id) {
			deletePostData(id).then(() => {
				message.success('删除成功!');
				getTableData();
			});
		}
	};

	const headerRender = (
		<div className='flex-row' style={{ justifyContent: 'space-between' }}>
			<DynamicSearch />
			<Button type='primary' onClick={() => onEdit()}>
				新增
			</Button>
		</div>
	);

	return (
		<div className='container flex-column'>
			<DynamicTable
				size='small'
				rowKey='id'
				headerRender={headerRender}
				columns={[
					{
						title: '岗位名称',
						dataIndex: 'postName',
						width: '20%',
						ellipsis: true,
					},
					{
						title: '岗位编码',
						dataIndex: 'postCode',
						width: '20%',
					},
					{
						title: '岗位排序',
						dataIndex: 'postSort',
						width: '20%',
					},
					{
						title: '状态',
						dataIndex: 'status',
						width: '20%',
						render: (value) => {
							return (
								<Tag color={value == 0 ? 'success' : 'error'}>
									{value == 0 ? '正常' : '停用'}
								</Tag>
							);
						},
					},
					{
						title: '创建时间',
						dataIndex: 'createTime',
						width: '20%',
						ellipsis: true,
					},
					{
						title: '操作',
						dataIndex: 'handle',
						width: '100px',
						render: (value, record: any) => {
							return (
								<Space>
									<Button
										size='small'
										type='link'
										onClick={() => onEdit(record.id)}
									>
										编辑
									</Button>
									<Popconfirm
										title='是否确认删除?'
										placement='bottomRight'
										onConfirm={() => onDelete(record.id)}
									>
										<Button danger size='small' type='link'>
											删除
										</Button>
									</Popconfirm>
								</Space>
							);
						},
					},
				]}
				loading={loading}
				dataSource={dataSource}
				scroll={{ y: '100%' }}
				{...tableProps}
			/>
			<Modal
				okText='保存'
				title={editId == '' ? '新增' : '编辑'}
				open={visible}
				onOk={onSave}
				onCancel={onCancel}
			>
				<Form {...FORM_LAYOUT} form={form} initialValues={{ status: 0 }}>
					<Form.Item
						label='岗位名称'
						name='postName'
						rules={[{ required: true }]}
					>
						<Input placeholder='请输入岗位名称' />
					</Form.Item>
					<Form.Item
						label='岗位编码'
						name='postCode'
						rules={[{ required: true }]}
					>
						<Input placeholder='请输入岗位编码' />
					</Form.Item>
					<Form.Item
						label='岗位序号'
						name='postSort'
						rules={[{ required: true }]}
					>
						<InputNumber
							placeholder='请输入岗位序号'
							style={{ width: '100%' }}
						/>
					</Form.Item>
					<Form.Item label='岗位状态' name='status'>
						<Radio.Group>
							<Radio value={0}>启用</Radio>
							<Radio value={1}>停用</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item label='备注' name='remark'>
						<Input.TextArea placeholder='请输入备注' />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default Post;
