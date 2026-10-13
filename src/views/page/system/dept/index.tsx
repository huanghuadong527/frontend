import xe from 'xe-utils';
import { useEffect, useState } from 'react';
import {
	App,
	Button,
	Form,
	Input,
	Modal,
	Radio,
	Table,
	Tag,
	TreeSelect
} from 'antd';
import {
	DeleteOutlined,
	EditOutlined,
	PlusOutlined
} from '@ant-design/icons';
import {
	addDept,
	deleteDept,
	getDeptById,
	getDeptList,
	getDeptTreeSelect,
	updateDept
} from '@/service';
import { usePermission } from '@/authority';

const flattenTree = (tree: AnyObject[], depth = 0, result: AnyObject[] = []) => {
	tree.forEach((node) => {
		result.push({ ...node, __depth: depth });
		if (node.children?.length) {
			flattenTree(node.children, depth + 1, result);
		}
	});
	return result;
};

export const Component = () => {
	const { message, modal } = App.useApp();
	const { hasPermi } = usePermission();
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [rows, setRows] = useState<AnyObject[]>([]);
	const [loading, setLoading] = useState(false);
	const [parentTree, setParentTree] = useState<AnyObject[]>([]);

	const [form] = Form.useForm();

	const getData = () => {
		setLoading(true);
		getDeptList()
			.then((result) => {
				setLoading(false);
				const tree = xe.toArrayTree(result.data || []);
				setRows(flattenTree(tree));
			})
			.catch(() => setLoading(false));
	};

	const getParentData = () => {
		getDeptTreeSelect().then((result) => {
			setParentTree(result.data || []);
		});
	};

	const onFinish = (values: AnyObject) => {
		const params = { ...values, parentId: values.parentId || 0 };
		if (editId) {
			updateDept({ ...params, id: editId }).then(() => {
				message.success('修改成功');
				onCancel();
				getData();
				getParentData();
			});
		} else {
			addDept(params).then(() => {
				message.success('新增成功');
				onCancel();
				getData();
				getParentData();
			});
		}
	};

	const onEdit = (id?: string | number, parentId?: string | number) => {
		if (id) {
			setEditId(id);
			getDeptById(id).then((result) => {
				form.setFieldsValue(result.data);
				setIsOpen(true);
			});
		} else {
			setEditId('');
			form.resetFields();
			if (parentId) {
				form.setFieldValue('parentId', parentId);
			}
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
			content: '是否确认删除该部门?',
			onOk() {
				deleteDept(id).then(() => {
					message.success('删除成功');
					getData();
					getParentData();
				});
			}
		});
	};

	const columns = [
		{
			title: '部门名称',
			dataIndex: 'deptName',
			render: (_: any, row: AnyObject) => {
				return (
					<div style={{ paddingLeft: (row.__depth ?? 0) * 24 }}>
						{row.deptName}
					</div>
				);
			}
		},
		{
			title: '排序',
			dataIndex: 'orderNum'
		},
		{
			title: '状态',
			dataIndex: 'status',
			render: (value: any) => {
				return (
					<Tag color={value == 0 ? 'success' : 'error'}>
						{value == 0 ? '正常' : '停用'}
					</Tag>
				);
			}
		},
		{
			title: '创建时间',
			dataIndex: 'createTime'
		},
		{
			title: '操作',
			dataIndex: 'action',
			width: 160,
			render: (_: any, row: AnyObject) => {
				return (
					<>
						{hasPermi('system:dept:edit') && (
							<Button
								type='link'
								size='small'
								icon={<EditOutlined />}
								title='编辑'
								onClick={() => onEdit(row.id)}
							/>
						)}
						{hasPermi('system:dept:add') && (
							<Button
								type='link'
								size='small'
								icon={<PlusOutlined />}
								title='添加'
								onClick={() => onEdit(undefined, row.id)}
							/>
						)}
						{hasPermi('system:dept:remove') && (
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
				);
			}
		}
	];

	useEffect(() => {
		getData();
		getParentData();
	}, []);

	return (
		<div className='p-4 flex flex-col gap-4'>
			<div className='flex items-center justify-end'>
				{hasPermi('system:dept:add') && (
					<Button
						type='primary'
						icon={<PlusOutlined />}
						onClick={() => onEdit()}
					>
						新建
					</Button>
				)}
			</div>
			<Table
				loading={loading}
				dataSource={rows}
				rowKey='id'
				pagination={false}
				columns={columns}
			/>
			<Modal
				title={editId ? '编辑部门' : '新增部门'}
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
						parentId: '',
						deptName: '',
						orderNum: 0,
						status: '0',
						leader: '',
						email: '',
						phone: ''
					}}
					onFinish={onFinish}
				>
					<Form.Item name='parentId' label='上级部门'>
						<TreeSelect
							placeholder='请选择上级部门'
							treeData={parentTree}
							fieldNames={{ value: 'id' }}
						/>
					</Form.Item>
					<Form.Item
						name='deptName'
						label='部门名称'
						rules={[{ required: true, message: '请输入部门名称' }]}
					>
						<Input placeholder='请输入部门名称' />
					</Form.Item>
					<Form.Item name='orderNum' label='显示排序'>
						<Input placeholder='请输入显示排序' />
					</Form.Item>
					<Form.Item name='status' label='状态'>
						<Radio.Group>
							<Radio value='0'>正常</Radio>
							<Radio value='1'>停用</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item name='leader' label='负责人'>
						<Input placeholder='请输入负责人' />
					</Form.Item>
					<Form.Item name='email' label='邮箱'>
						<Input placeholder='请输入邮箱' />
					</Form.Item>
					<Form.Item name='phone' label='联系电话'>
						<Input placeholder='请输入联系电话' />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};
