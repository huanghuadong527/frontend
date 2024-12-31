import moment from 'moment';
import {
	Button,
	Form,
	Input,
	message,
	Modal,
	Popconfirm,
	Radio,
	Space,
	TreeSelect
} from 'antd';
import {
	addGameServerData,
	deleteGameServerData,
	getGameServerDataById,
	getGameServerTreeData,
	updateGameServerData
} from '@/service';
import { FORM_LAYOUT, useAntdTable } from '@/core';
import { DynamicSearch, DynamicTable } from '@/components';
import { useEffect, useState } from 'react';
import { mapTree } from 'xe-utils';

const GameServer = () => {
	const [visible, setVisible] = useState(false);
	const [editId, setEditId] = useState('');
	const [serverTree, setServerTree] = useState<any[]>([]);
	const [form] = Form.useForm();
	const { dataSource, tableProps, loading, getTableData } = useAntdTable(
		'/game/server/list',
		{ isTreeData: true }
	);

	const onEdit = (id?: string | null, parentId?: string) => {
		if (id) {
			setEditId(id);
			getGameServerDataById(id).then((result) => {
				form.setFieldsValue(result.data);
				setVisible(true);
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
				updateGameServerData({
					...values,
					id: editId
				}).then(() => {
					onCancel();
					getTableData();
					getGameServerTreeSelectData();
					message.success('修改成功!');
				});
			} else {
				addGameServerData(values).then(() => {
					onCancel();
					getTableData();
					getGameServerTreeSelectData();
					message.success('添加成功!');
				});
			}
		});
	};

	const onCancel = () => {
		setVisible(false);
		setEditId('');
		form.resetFields();
		form.setFieldsValue({ status: 0, type: 0 });
	};

	const onDelete = (id: string) => {
		deleteGameServerData(id).then(() => {
			message.success('删除成功!');
			getTableData();
		});
	};

	const getGameServerTreeSelectData = () => {
		getGameServerTreeData().then((result) => {
			if (result.data) {
				setServerTree(
					mapTree(result.data, (item) => {
						return {
							value: item.id,
							label: item.label
						};
					})
				);
			}
		});
	};

	useEffect(() => {
		getGameServerTreeSelectData();
	}, []);

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
						title: '服务器名称',
						dataIndex: 'name',
						width: '20%',
						ellipsis: true
					},
					{
						title: '服务器类型',
						dataIndex: 'type',
						width: '20%',
						render: (value) => {
							switch (value) {
								case 0:
									return '游戏';
								case 1:
									return '服务器';
								case 2:
									return '区服';
								default:
									return '未知';
							}
						}
					},
					{
						title: '状态',
						dataIndex: 'status',
						width: '20%'
					},
					{
						title: '创建时间',
						dataIndex: 'createDate',
						width: '20%',
						render: (date) => {
							if (date) {
								return moment(new Date(date)).format('YYYY-MM-DD HH:mm:ss');
							}
							return '-';
						}
					},
					{
						title: '更新时间',
						dataIndex: 'updateDate',
						width: '20%',
						render: (date) => {
							if (date) {
								return moment(new Date(date)).format('YYYY-MM-DD HH:mm:ss');
							}
							return '-';
						}
					},
					{
						title: '备注',
						dataIndex: 'remark',
						width: '20%'
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
										disabled={record.type >= 2}
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
						}
					}
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
					initialValues={{ type: 0, status: 0 }}
				>
					<Form.Item label='上级服务器' name='parentId'>
						<TreeSelect
							allowClear
							treeDefaultExpandAll
							placeholder='请选择上级服务器'
							style={{ width: '100%' }}
							treeData={serverTree}
						/>
					</Form.Item>
					<Form.Item
						label='服务器名称'
						name='name'
						rules={[{ required: true }]}
					>
						<Input placeholder='请输入服务器名称' />
					</Form.Item>
					<Form.Item
						label='服务器类型'
						name='type'
						rules={[{ required: true }]}
					>
						<Radio.Group>
							<Radio value={0}>游戏</Radio>
							<Radio value={1}>服务器</Radio>
							<Radio value={2}>区服</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item label='服务器状态' name='status'>
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

export default GameServer;
