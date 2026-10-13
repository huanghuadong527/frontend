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
	Tag,
	Tree
} from 'antd';
import {
	DeleteOutlined,
	EditOutlined,
	KeyOutlined,
	PlusOutlined,
	SearchOutlined
} from '@ant-design/icons';
import { useTable } from '@/core';
import { usePermission } from '@/authority';
import {
	addRole,
	deleteRole,
	getRoleById,
	getRoleMenuTree,
	updateRole
} from '@/service';

const normalizeTree = (nodes: AnyObject[]): AnyObject[] =>
	nodes.map((node) => ({
		id: String(node.id),
		label: node.label,
		children: node.children ? normalizeTree(node.children) : undefined
	}));

export const Component = () => {
	const { message, modal } = App.useApp();
	const { hasPermi } = usePermission();
	const [isOpen, setIsOpen] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [menuRoleId, setMenuRoleId] = useState<string | number>('');
	const [menuTree, setMenuTree] = useState<AnyObject[]>([]);
	const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
	const [selectKeys, setSelectKeys] = useState<(string | number)[]>([]);

	const { tableProps, getData } = useTable('/system/role/list', () => searchForm.getFieldsValue());

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
			updateRole({ ...values, id: editId }).then(() => {
				message.success('修改成功');
				onCancel();
				getData();
			});
		} else {
			addRole(values).then(() => {
				message.success('新增成功');
				onCancel();
				getData();
			});
		}
	};

	const onEdit = (id?: string | number) => {
		if (id) {
			setEditId(id);
			getRoleById(id).then((result) => {
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
			content: '是否确认删除该角色?',
			onOk() {
				deleteRole(id).then(() => {
					message.success('删除成功');
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的角色');
			return;
		}
		modal.confirm({
			title: '系统提示',
			content: `是否确认删除选中的 ${selectKeys.length} 项数据?`,
			onOk() {
				deleteRole(selectKeys.join(',')).then(() => {
					message.success('删除成功');
					setSelectKeys([]);
					getData();
				});
			}
		});
	};

	const onEditMenu = (record: AnyObject) => {
		setMenuRoleId(record.id);
		getRoleMenuTree(record.id).then((result) => {
			setCheckedKeys((result.data?.checkedKeys ?? []).map(String));
			setMenuTree(normalizeTree(result.data?.menus ?? []));
			setMenuOpen(true);
		});
	};

	const onSaveMenu = () => {
		if (!menuRoleId) {
			message.warning('请选择角色');
			return;
		}
		getRoleById(menuRoleId).then((result) => {
			updateRole({
				...result.data,
				id: menuRoleId,
				menuIds: checkedKeys.map(Number)
			}).then(() => {
				message.success('分配成功');
				onCancelMenu();
			});
		});
	};

	const onCancelMenu = () => {
		setMenuOpen(false);
		setMenuRoleId('');
		setCheckedKeys([]);
		setMenuTree([]);
	};

	const columns = [
		{
			title: '角色名称',
			dataIndex: 'roleName'
		},
		{
			title: '权限字符',
			dataIndex: 'roleKey'
		},
		{
			title: '显示顺序',
			dataIndex: 'roleSort'
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
			width: 200,
			render: (_: any, row: AnyObject) => (
				<>
					{hasPermi('system:role:edit') && (
						<Button
							type='link'
							size='small'
							icon={<EditOutlined />}
							title='编辑'
							onClick={() => onEdit(row.id)}
						/>
					)}
					{row.roleKey != 'admin' && hasPermi('system:role:edit') && (
						<Button
							type='link'
							size='small'
							icon={<KeyOutlined />}
							title='权限菜单'
							onClick={() => onEditMenu(row)}
						/>
					)}
					{hasPermi('system:role:remove') && (
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
					<Form.Item name='roleName' label='角色名称'>
						<Input placeholder='请输入角色名称' />
					</Form.Item>
					<Form.Item name='roleKey' label='权限字符'>
						<Input placeholder='请输入权限字符' />
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
					{hasPermi('system:role:add') && (
						<Button type='primary' icon={<PlusOutlined />} onClick={() => onEdit()}>
							新建
						</Button>
					)}
					{hasPermi('system:role:remove') && (
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
				title={editId ? '编辑角色' : '新增角色'}
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
						roleName: '',
						roleKey: '',
						roleSort: 0,
						status: '0',
						remark: ''
					}}
					onFinish={onFinish}
				>
					<Form.Item
						name='roleName'
						label='角色名称'
						rules={[{ required: true, message: '请输入角色名称' }]}
					>
						<Input placeholder='请输入角色名称' />
					</Form.Item>
					<Form.Item
						name='roleKey'
						label='权限字符'
						rules={[{ required: true, message: '请输入权限字符' }]}
					>
						<Input placeholder='请输入权限字符' />
					</Form.Item>
					<Form.Item name='roleSort' label='显示顺序'>
						<Input placeholder='请输入显示顺序' />
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
			<Modal
				title='分配菜单'
				open={menuOpen}
				destroyOnHidden
				forceRender
				onOk={onSaveMenu}
				onCancel={onCancelMenu}
			>
				<div style={{ maxHeight: 400, overflow: 'auto' }}>
					<Tree
						checkable
						treeData={menuTree}
						checkedKeys={checkedKeys}
						onCheck={(keys) =>
							setCheckedKeys(
								(Array.isArray(keys) ? keys : keys.checked).map(String)
							)
						}
						fieldNames={{ title: 'label', key: 'id', children: 'children' }}
					/>
				</div>
			</Modal>
		</div>
	);
};
