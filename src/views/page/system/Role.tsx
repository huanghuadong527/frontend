import { DynamicSearch, DynamicTable } from '@/components';
import { FORM_LAYOUT, useAntdTable } from '@/core';
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
	Switch,
	Transfer,
} from 'antd';
import { Key, useState } from 'react';
import {
	addRoleData,
	deleteRoleData,
	getMenuByRoleId,
	getRoleDataById,
	updateRoleData,
} from '@/service';
import Tree, { DataNode } from 'antd/lib/tree';
import { mapTree } from 'xe-utils';

const Role = () => {
	const [visible, setVisible] = useState(false);
	const [menuVisible, setMenuVisible] = useState(false);
	const [editId, setEditId] = useState('');
	const [selectKeys, setSelectKeys] = useState<Key[]>([]);
	const [targetKeys, setTargetKeys] = useState<string[]>([]);
	const [menuData, setMenuData] = useState<DataNode[]>([]);
	const [roleDesc, setRoleDesc] = useState<any>(null);
	const { dataSource, tableProps, loading, getTableData } = useAntdTable(
		'/system/role/list'
	);
	const [form] = Form.useForm();

	const onEdit = (id?: string) => {
		if (id) {
			getRoleDataById(id).then((result) => {
				setEditId(id);
				setVisible(true);
				form.setFieldsValue(result.data);
			});
		} else {
			setVisible(true);
		}
	};

	const onSave = () => {
		form.validateFields();
		if (form.isFieldsTouched()) {
			if (editId) {
				updateRoleData({
					...form.getFieldsValue(),
					id: editId,
					menuIds: [],
				}).then(() => {
					onCancel();
					getTableData();
					message.success('修改成功!');
				});
			} else {
				addRoleData({
					...form.getFieldsValue(),
					menuIds: [],
				}).then(() => {
					onCancel();
					getTableData();
					message.success('添加成功!');
				});
			}
		}
	};

	const onCancel = () => {
		setEditId('');
		setVisible(false);
		form.resetFields();
	};

	const onEditMenu = (id: string) => {
		if (id) {
			setEditId(id);
			getRoleDataById(id).then((result) => {
				setRoleDesc(result.data);
			});
			getMenuByRoleId(id).then((result) => {
				setMenuVisible(true);
				if (result.data) {
					if (result.data.checkedKeys) {
						setTargetKeys(result.data.checkedKeys);
					}
					if (result.data.menus) {
						setMenuData(
							mapTree(result.data.menus, (item) => {
								return {
									key: item.id,
									title: item.label,
									checked: targetKeys?.includes(item.id),
								};
							})
						);
					}
				}
			});
		}
	};

	const onDelete = (id: string) => {
		if (id) {
			deleteRoleData(id).then((result) => {
				if (result.code == 200) {
					message.success('删除成功!');
					getTableData();
				}
			});
		}
	};

	const onBatchDeleteData = () => {
		if (selectKeys.length > 0) {
			onDelete(selectKeys.join(','));
			setSelectKeys([]);
		} else {
			message.warning('请选择用户!');
		}
	};

	const onSaveMenu = () => {
		if (editId) {
			updateRoleData({
				...roleDesc,
				id: editId,
				menuIds: targetKeys,
			}).then(() => {
				message.success('成功修改权限菜单!');
				onCancelMenu();
			});
		} else {
			message.warning('请选择角色!');
		}
	};

	const onCancelMenu = () => {
		setMenuVisible(false);
		setEditId('');
		setRoleDesc(null);
		setTargetKeys([]);
	};

	const onChangeTargetKeys = (keys: string[]) => {
		setTargetKeys(keys);
	};

  const onSelectUser = (keys: Key[]) => {
		setSelectKeys(keys);
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
        rowSelection={{
          onChange: (keys: Key[]) => {
            onSelectUser(keys);
          }
        }}
				headerRender={headerRender}
				columns={[
					{
						title: '角色名称',
						dataIndex: 'roleName',
						fixed: 'left',
						width: '16.7%',
						ellipsis: true,
					},
					{
						title: '权限字符',
						dataIndex: 'roleKey',
						width: '16.7%',
						ellipsis: true,
					},
					{
						title: '显示顺序',
						dataIndex: 'roleSort',
						width: '16.7%',
						ellipsis: true,
					},
					{
						title: '状态',
						dataIndex: 'status',
						width: '16.7%',
						ellipsis: true,
						render: (status) => {
							return (
								<Switch
									checkedChildren='启用'
									unCheckedChildren='停用'
									checked={status == '1'}
								></Switch>
							);
						},
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
						width: 200,
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
									{record.roleKey != 'admin' ? (
										<Button
											size='small'
											type='link'
											className='ant-btn-update'
											onClick={() => onEditMenu(record.id)}
										>
											权限菜单
										</Button>
									) : null}
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
						label='角色名称'
						name='roleName'
						rules={[{ required: true }]}
					>
						<Input placeholder='请输入角色名称' />
					</Form.Item>
					<Form.Item
						label='权限字符'
						name='roleKey'
						rules={[{ required: true }]}
					>
						<Input placeholder='请输入权限字符' />
					</Form.Item>
					<Form.Item
						label='权限排序'
						name='roleSort'
						rules={[{ required: true }]}
					>
						<InputNumber
							placeholder='请输入权限排序!'
							style={{ width: '100%' }}
						/>
					</Form.Item>
					<Form.Item label='状态' name='status' rules={[{ required: true }]}>
						<Radio.Group>
							<Radio value={0}>正常</Radio>
							<Radio value={1}>停用</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item label='备注' name='remark'>
						<Input.TextArea placeholder='请输入备注' />
					</Form.Item>
				</Form>
			</Modal>
			<Modal
				title='分配菜单'
				okText='保存'
				width={650}
				open={menuVisible}
				onOk={onSaveMenu}
				onCancel={onCancelMenu}
			>
				<Transfer
					className='ant-tree-transfer'
					titles={['系统菜单', roleDesc ? roleDesc['roleName'] : '角色权限']}
					targetKeys={targetKeys}
					dataSource={dataSource}
					render={(item) => item.title as any}
					onChange={onChangeTargetKeys}
				>
					{({ direction, onItemSelect, selectedKeys }) => {
						if (direction == 'left') {
							const checkedKeys: Key[] = [...selectedKeys, ...targetKeys];
							return (
								<Tree
									blockNode
									checkable
									checkStrictly
									defaultExpandAll
									checkedKeys={checkedKeys}
									treeData={menuData}
									onCheck={(_, { node: { key } }) => {
										onItemSelect(key as string, checkedKeys.indexOf(key) == -1);
									}}
									onSelect={(_, { node: { key } }) => {
										onItemSelect(key as string, checkedKeys.indexOf(key) == -1);
									}}
								/>
							);
						}
					}}
				</Transfer>
			</Modal>
		</div>
	);
};

export default Role;
