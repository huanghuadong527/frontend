import xe from 'xe-utils';
import { useEffect, useMemo, useState, type Key } from 'react';
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
	TreeSelect
} from 'antd';
import {
	DeleteOutlined,
	EditOutlined,
	PlusOutlined
} from '@ant-design/icons';
import {
	addMenu,
	deleteMenu,
	getMenuById,
	getMenuList,
	getMenuTreeSelect,
	updateMenu
} from '@/service';
import { usePermission } from '@/authority';

const collectExpandableIds = (tree: AnyObject[], ids: Key[] = []) => {
	tree.forEach((node) => {
		if (node.children?.length) {
			ids.push(node.id);
			collectExpandableIds(node.children, ids);
		}
	});
	return ids;
};

export const Component = () => {
	const { message, modal } = App.useApp();
	const { hasPermi } = usePermission();
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [rows, setRows] = useState<AnyObject[]>([]);
	const [loading, setLoading] = useState(false);
	const [parentTree, setParentTree] = useState<AnyObject[]>([]);
	const [expandedRowKeys, setExpandedRowKeys] = useState<readonly Key[]>([]);

	const expandableIds = useMemo(() => collectExpandableIds(rows), [rows]);
	const allExpanded =
		expandableIds.length > 0 && expandedRowKeys.length >= expandableIds.length;

	const toggleExpandAll = () => {
		setExpandedRowKeys(allExpanded ? [] : expandableIds);
	};

	const [form] = Form.useForm();
	const menuType = Form.useWatch('menuType', form);

	const getData = () => {
		setLoading(true);
		getMenuList()
			.then((result) => {
				setLoading(false);
				const tree = xe.toArrayTree(result.data || []);
				setRows(tree);
			})
			.catch(() => setLoading(false));
	};

	const getParentData = () => {
		getMenuTreeSelect().then((result) => {
			setParentTree(result.data || []);
		});
	};

	const onFinish = (values: AnyObject) => {
		const params = { ...values, parentId: values.parentId || 0 };
		if (editId) {
			updateMenu({ ...params, id: editId }).then(() => {
				message.success('修改成功');
				onCancel();
				getData();
				getParentData();
			});
		} else {
			addMenu(params).then(() => {
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
			getMenuById(id).then((result) => {
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
			content: '是否确认删除该菜单?',
			onOk() {
				deleteMenu(id).then(() => {
					message.success('删除成功');
					getData();
					getParentData();
				});
			}
		});
	};

	const columns = [
		{
			title: '菜单名称',
			dataIndex: 'menuName'
		},
		{
			title: '类型',
			dataIndex: 'menuType',
			render: (value: any) => {
				return value == 'M' ? '目录' : value == 'C' ? '菜单' : '按钮';
			}
		},
		{
			title: '菜单地址',
			dataIndex: 'path'
		},
		{
			title: '图标',
			dataIndex: 'icon'
		},
		{
			title: '排序',
			dataIndex: 'orderNum'
		},
		{
			title: '权限标识',
			dataIndex: 'perms',
			render: (value: any) => {
				return value || '--';
			}
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
						{hasPermi('system:menu:edit') && (
							<Button
								type='link'
								size='small'
								icon={<EditOutlined />}
								title='编辑'
								onClick={() => onEdit(row.id)}
							/>
						)}
						{hasPermi('system:menu:add') && (
							<Button
								type='link'
								size='small'
								icon={<PlusOutlined />}
								title='添加'
								disabled={row.menuType == 'F'}
								onClick={() => onEdit(undefined, row.id)}
							/>
						)}
						{hasPermi('system:menu:remove') && (
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
				<Space>
					{hasPermi('system:menu:add') && (
						<Button
							type='primary'
							icon={<PlusOutlined />}
							onClick={() => onEdit()}
						>
							新建
						</Button>
					)}
					<Button onClick={toggleExpandAll}>
						{allExpanded ? '折叠' : '展开'}
					</Button>
				</Space>
			</div>
			<Table
				loading={loading}
				dataSource={rows}
				rowKey='id'
				pagination={false}
				columns={columns}
				expandable={{
					expandedRowKeys,
					onExpandedRowsChange: setExpandedRowKeys
				}}
			/>
			<Modal
				title={editId ? '编辑菜单' : '新增菜单'}
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
						menuName: '',
						orderNum: 0,
						menuType: 'M',
						path: '',
						perms: '',
						icon: '',
						status: '0',
						isFrame: '1'
					}}
					onFinish={onFinish}
				>
					<Form.Item name='parentId' label='上级菜单'>
						<TreeSelect
							placeholder='请选择上级菜单'
							treeData={parentTree}
							fieldNames={{ value: 'id' }}
						/>
					</Form.Item>
					<Form.Item
						name='menuName'
						label='菜单名称'
						rules={[{ required: true, message: '请输入菜单名称' }]}
					>
						<Input placeholder='请输入菜单名称' />
					</Form.Item>
					<Form.Item name='orderNum' label='显示排序'>
						<Input placeholder='请输入显示排序' />
					</Form.Item>
					<Form.Item name='menuType' label='菜单类型'>
						<Radio.Group>
							<Radio value='M'>目录</Radio>
							<Radio value='C'>菜单</Radio>
							<Radio value='F'>按钮</Radio>
						</Radio.Group>
					</Form.Item>
					{menuType == 'C' && (
						<Form.Item name='path' label='菜单地址'>
							<Input placeholder='请输入菜单地址' />
						</Form.Item>
					)}
					{menuType == 'F' && (
						<Form.Item name='perms' label='权限字符'>
							<Input placeholder='请输入权限字符' />
						</Form.Item>
					)}
					{menuType == 'M' && (
						<Form.Item name='icon' label='菜单图标'>
							<Input placeholder='请输入图标名称' />
						</Form.Item>
					)}
					<Form.Item name='status' label='菜单状态'>
						<Radio.Group>
							<Radio value='0'>正常</Radio>
							<Radio value='1'>停用</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item name='isFrame' label='是否外链'>
						<Radio.Group>
							<Radio value='0'>是</Radio>
							<Radio value='1'>否</Radio>
						</Radio.Group>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};
