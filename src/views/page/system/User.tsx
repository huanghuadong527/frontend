import { Key, useState } from 'react';
import { DynamicSearch, DynamicTable } from '@/components';
import { FORM_LAYOUT, useAntdTable } from '@/core';
import {
	Button,
	Form,
	Input,
	message,
	Modal,
	Popconfirm,
	Radio,
	Space,
} from 'antd';
import {
	addUserData,
	deleteUserData,
	getUserDataById,
	updateUserData,
} from '@/service';

const User = () => {
	const [visible, setVisible] = useState(false);
	const [editId, setEditId] = useState('');
	const [selectKeys, setSelectKeys] = useState<Key[]>([]);
	const { dataSource, tableProps, loading, getTableData } = useAntdTable(
		'/system/user/list'
	);
	const [form] = Form.useForm();

	const onEdit = (id?: string) => {
		if (id) {
			setEditId(id);
			getUserDataById(id).then((result) => {
				if (result.code == 200) {
					form.setFieldsValue(result.data);
					setVisible(true);
				}
			});
		} else {
			setVisible(true);
		}
	};

	const onSave = () => {
		form.validateFields();
		if (form.isFieldsTouched()) {
			if (editId) {
				updateUserData({
					...form.getFieldsValue(),
					id: editId,
				}).then(() => {
					onCancel();
					getTableData();
					message.success('修改成功!');
				});
			} else {
				addUserData(form.getFieldsValue()).then((result) => {
					if (result.code == 200) {
						onCancel();
						getTableData();
						message.success('添加成功!');
					}
				});
			}
		}
	};

	const onCancel = () => {
		setVisible(false);
		setEditId('');
		form.resetFields();
	};

	const onDeleteData = (id: string) => {
		if (id) {
			deleteUserData(id).then((result) => {
				if (result.code == 200) {
					message.success('删除成功!');
					getTableData();
				}
			});
		}
	};

	const onBatchDeleteData = () => {
		if (selectKeys.length > 0) {
			onDeleteData(selectKeys.join(','));
			setSelectKeys([]);
		} else {
			message.warning('请选择用户!');
		}
	};

	const headerRender = (
		<div className='flex-row' style={{ justifyContent: 'space-between' }}>
			<DynamicSearch />
			<Space>
				<Button type='primary' onClick={() => onEdit()}>
					新增
				</Button>
				<Button className='ant-btn-export' type='primary'>
					导出
				</Button>
				<Popconfirm
					title='是否确认删除?'
					placement='bottomRight'
					onConfirm={() => onBatchDeleteData()}
				>
					<Button danger type='primary'>
						批量删除
					</Button>
				</Popconfirm>
			</Space>
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
						title: '用户名',
						dataIndex: 'userName',
						fixed: 'left',
						width: '16.7%',
						ellipsis: true,
					},
					{
						title: '用户昵称',
						dataIndex: 'nickName',
						width: '16.7%',
						ellipsis: true,
					},
					{
						title: '部门',
						dataIndex: 'deptId',
						width: '16.7%',
						ellipsis: true,
					},
					{
						title: '手机号',
						dataIndex: 'phonenumber',
						width: '16.7%',
						ellipsis: true,
					},
					{
						title: '状态',
						dataIndex: 'status',
						width: '16.7%',
					},
					{
						title: '创建时间',
						dataIndex: 'createTime',
						width: '16.7%',
						ellipsis: true,
					},
					{
						title: '操作',
						dataIndex: 'handle',
						width: 100,
						fixed: 'right',
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
										onConfirm={() => onDeleteData(record.id)}
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
				<Form {...FORM_LAYOUT} form={form} initialValues={{ sex: 0 }}>
					<Form.Item
						label='用户名称'
						name='userName'
						rules={[{ required: true }]}
					>
						<Input placeholder='请输入用户名称' />
					</Form.Item>
					{editId == '' ? (
						<Form.Item
							label='密码'
							name='password'
							rules={[{ required: editId == '', min: 6 }]}
						>
							<Input type='password' placeholder='请输入密码' />
						</Form.Item>
					) : (
						''
					)}
					<Form.Item
						label='用户昵称'
						name='nickName'
						rules={[{ required: true }]}
					>
						<Input placeholder='请输入用户昵称' />
					</Form.Item>
					<Form.Item label='手机号码' name='phonenumber'>
						<Input placeholder='请输入手机号码' />
					</Form.Item>
					<Form.Item label='邮箱' name='email' rules={[{ type: 'email' }]}>
						<Input placeholder='请输入邮箱' />
					</Form.Item>
					<Form.Item label='性别' name='sex'>
						<Radio.Group>
							<Radio value={0}>男</Radio>
							<Radio value={1}>女</Radio>
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

export default User;
