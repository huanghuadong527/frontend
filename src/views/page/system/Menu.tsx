import {
	ANTD_ICONS,
	CustomIcon,
	DynamicSearch,
	DynamicTable,
} from '@/components';
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
	Select,
	Space,
	Tag,
	TreeSelect,
} from 'antd';
import {
	addMenuData,
	deleteMenuData,
	getMenuById,
	getMenuTreeSelectData,
	updateMenuData,
} from '@/service';
import { createElement, useCallback, useEffect, useState } from 'react';
import { DefaultOptionType } from 'antd/lib/select';
import { mapTree } from 'xe-utils';
import * as Icon from '@ant-design/icons';

const Menu = () => {
	const [visible, setVisible] = useState(false);
	const [editId, setEditId] = useState('');
	const [menuTree, setMenuTree] = useState<DefaultOptionType[]>([]);
	const [form] = Form.useForm();
	const { dataSource, tableProps, loading, getTableData } = useAntdTable(
		'/system/menu/list', {isTreeData: true}
	);

	const getIconComponent = (iconName: string) => {
		return createElement((Icon as any)[iconName]);
	};

	const onEdit = (id?: string | null, parentId?: string) => {
		if (id) {
			setEditId(id);
			getMenuById(id).then((result) => {
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

	const menuType = Form.useWatch('menuType', form);

	const onSave = () => {
		form.validateFields().then((values) => {
			if (editId) {
				updateMenuData({
					...values,
					id: editId,
					parentId: values.parentId ? values.parentId : 0,
				}).then(() => {
					onCancel();
					getTableData();
					getMenuData();
					message.success('修改成功!');
				});
			} else {
				addMenuData({
					...values,
					parentId: values.parentId ? values.parentId : 0,
				}).then(() => {
					onCancel();
					getTableData();
					getMenuData();
					message.success('添加成功!');
				});
			}
		});
	};

	const onCancel = () => {
		setVisible(false);
		setEditId('');
		form.resetFields();
		form.setFieldsValue({ menuType: 'M', status: 0, isFrame: 1 });
	};

	const onDelete = (id: string) => {
		if (id) {
			deleteMenuData(id).then(() => {
				message.success('删除成功!');
				getTableData();
			});
		}
	};

	const getMenuData = useCallback(() => {
		getMenuTreeSelectData().then((result) => {
			setMenuTree(
				mapTree(result.data, (item) => {
					return {
						value: item.id,
						label: item.label,
					};
				})
			);
		});
	}, []);

	useEffect(() => {
		getMenuData();
	}, [getMenuData]);

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
						title: '菜单名称',
						dataIndex: 'menuName',
						width: '20%',
						ellipsis: true,
					},
					{
						title: '菜单类型',
						dataIndex: 'menuType',
						width: '20%',
						render: (value) => {
							switch (value) {
								case 'M':
									return '目录';
								case 'C':
									return '菜单';
								case 'F':
									return '按钮';
								default:
									break;
							}
						},
					},
					{
						title: '菜单地址',
						dataIndex: 'path',
						width: '20%',
					},
					{
						title: '图标',
						dataIndex: 'icon',
						width: '20%',
						render: (value) => {
							if (value) {
								return getIconComponent(value);
							}
							return <></>;
						},
					},
					{
						title: '权限标识',
						dataIndex: 'perms',
						width: '20%',
						ellipsis: true,
						render: (value) => {
							if (value) {
								return value;
							}
							return '--';
						},
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
						width: '150px',
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
										disabled={record.menuType == 'F'}
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
				{...tableProps}
			/>
			<Modal
				okText='保存'
				title={editId == '' ? '新增' : '编辑'}
				open={visible}
				onOk={onSave}
				onCancel={onCancel}
			>
				<Form
					{...FORM_LAYOUT}
					form={form}
					initialValues={{ menuType: 'M', status: 0, isFrame: 1 }}
				>
					<Form.Item label='上级菜单' name='parentId'>
						<TreeSelect
							allowClear
							treeDefaultExpandAll
							placeholder='请选择上级菜单'
							style={{ width: '100%' }}
							treeData={menuTree}
						/>
					</Form.Item>
					<Form.Item
						label='菜单名称'
						name='menuName'
						rules={[{ required: true }]}
					>
						<Input placeholder='请输入菜单名称' />
					</Form.Item>
					<Form.Item
						label='菜单序号'
						name='orderNum'
						rules={[{ required: true }]}
					>
						<InputNumber
							placeholder='请输入菜单序号'
							style={{ width: '100%' }}
						/>
					</Form.Item>
					<Form.Item
						label='菜单类型'
						name='menuType'
						rules={[{ required: true }]}
					>
						<Radio.Group>
							<Radio value='M'>目录</Radio>
							<Radio value='C'>菜单</Radio>
							<Radio value='F'>按钮</Radio>
						</Radio.Group>
					</Form.Item>
					{menuType == 'C' ? (
						<Form.Item label='菜单地址' name='path'>
							<Input placeholder='请输入菜单地址' />
						</Form.Item>
					) : (
						''
					)}
					{menuType == 'F' ? (
						<Form.Item label='权限字符' name='perms'>
							<Input placeholder='请输入权限字符' />
						</Form.Item>
					) : (
						''
					)}
					{menuType == 'M' ? (
						<Form.Item label='菜单图标' name='icon'>
							<Select placeholder='请选择菜单图标'>
								{Object.keys(ANTD_ICONS).map((name) => {
									return (
										<Select.Option key={name} value={name}>
											<CustomIcon
												name={name}
												style={{ fontSize: '16px', marginRight: '10px' }}
											></CustomIcon>
											{name}
										</Select.Option>
									);
								})}
							</Select>
						</Form.Item>
					) : (
						''
					)}
					<Form.Item label='菜单状态' name='status'>
						<Radio.Group>
							<Radio value={0}>启用</Radio>
							<Radio value={1}>停用</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item
						label='是否外链'
						name='isFrame'
						tooltip='选择外链则路由地址需要以`http(s)://`开头'
					>
						<Radio.Group>
							<Radio value={0}>是</Radio>
							<Radio value={1}>否</Radio>
						</Radio.Group>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default Menu;
