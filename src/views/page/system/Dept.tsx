import { FORM_LAYOUT } from '@/core';
import {
	Button,
	Form,
	Input,
	InputNumber,
	Modal,
	Popconfirm,
	Radio,
	Space,
	Table,
	Tag,
	TreeSelect,
} from 'antd';
import { message } from '@/redux';
import { useEffect, useState } from 'react';
import {
	addDeptData,
	deleteDeptData,
	getDeptDataById,
	getDeptListData,
	getDeptTreeSelectData,
	updateDeptData,
} from '@/service';
import { mapTree, toArrayTree } from 'xe-utils';

const Dept = () => {
	const [visible, setVisible] = useState(false);
	const [editId, setEditId] = useState('');
	const [deptTree, setDeptTree] = useState<any[]>([]);
	const [dataSource, setDataSource] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [form] = Form.useForm();

	const getData = () => {
		setLoading(true);
		getDeptListData({}).then((result) => {
			setLoading(false);
			setDataSource(toArrayTree(result.data ?? []) as any);
		});
	};

	useEffect(() => {
		getData();
	}, []);

	const onEdit = (id?: string | null, parentId?: string) => {
		if (id) {
			getDeptDataById(id).then((result) => {
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
				updateDeptData({
					...values,
					id: editId,
				}).then(() => {
					onCancel();
					message.success('修改成功!');
					getData();
				});
			} else {
				addDeptData(values).then(() => {
					onCancel();
					message.success('添加成功!');
					getData();
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
			deleteDeptData(id).then(() => {
				message.success('删除成功!');
				getData();
			});
		}
	};

	const getDeptData = () => {
		getDeptTreeSelectData().then((result) => {
			setDeptTree(
				mapTree(result.data, (item) => {
					return {
						value: item.id,
						label: item.label,
					};
				})
			);
		});
	};

	useEffect(() => {
		getDeptData();
	}, []);

	const headerRender = (
		<div className='flex justify-between mb-4'>
			<Button type='primary' onClick={() => onEdit()}>
				新增
			</Button>
		</div>
	);

	return (
		<div className='w-full h-full flex flex-col'>
			{headerRender}
			<Table
				rootClassName='table-fill'
				size='small'
				rowKey='id'
				columns={[
					{
						title: '部门名称',
						dataIndex: 'deptName',
						width: '20%',
						ellipsis: true,
					},
					{
						title: '部门排序',
						dataIndex: 'orderNum',
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
									<Button
										size='small'
										type='link'
										className='ant-btn-add'
										onClick={() => onEdit(null, record.id)}
									>
										添加
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
				pagination={false}
			/>
			<Modal
				okText='保存'
				title={editId == '' ? '新增' : '编辑'}
				open={visible}
				onOk={onSave}
				onCancel={onCancel}
			>
				<Form {...FORM_LAYOUT} form={form} initialValues={{ status: 0 }}>
					<Form.Item label='上级部门' name='parentId'>
						<TreeSelect
							allowClear
							treeDefaultExpandAll
							placeholder='请选择上级部门'
							style={{ width: '100%' }}
							treeData={deptTree}
						/>
					</Form.Item>
					<Form.Item
						label='部门名称'
						name='deptName'
						rules={[{ required: true }]}
					>
						<Input placeholder='请输入部门名称' />
					</Form.Item>
					<Form.Item
						label='部门序号'
						name='orderNum'
						rules={[{ required: true }]}
					>
						<InputNumber
							placeholder='请输入部门序号'
							style={{ width: '100%' }}
						/>
					</Form.Item>
					<Form.Item label='菜单状态' name='status'>
						<Radio.Group>
							<Radio value={0}>启用</Radio>
							<Radio value={1}>停用</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item label='负责人' name='leader'>
						<Input placeholder='请输入部门负责人' />
					</Form.Item>
					<Form.Item label='邮箱' name='email'>
						<Input placeholder='请输入邮箱' />
					</Form.Item>
					<Form.Item label='联系电话' name='phone'>
						<Input placeholder='请输入联系电话' />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export const Component = Dept;
