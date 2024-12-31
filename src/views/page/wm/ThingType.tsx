import moment from 'moment';
import { DynamicSearch, DynamicTable } from '@/components';
import { FORM_LAYOUT, useAntdTable } from '@/core';
import { App, Button, Form, Input, Modal, Popconfirm, Space } from 'antd';
import { useState } from 'react';
import {
	addThingTypeData,
	getThingTypeDataById,
	updateThingTypeData
} from '@/service';

const ThingType = () => {
	const [visible, setVisible] = useState(false);
	const [editId, setEditId] = useState('');
	const [form] = Form.useForm();
	const { message } = App.useApp();
	const { dataSource, tableProps, loading, getTableData } = useAntdTable(
		'/wm/thing-type/list'
	);

	const onEdit = (id?: string) => {
		if (id) {
			setEditId(id);
			getThingTypeDataById(id).then((result) => {
				form.setFieldsValue(result.data);
				setVisible(true);
			});
		} else {
			setVisible(true);
		}
	};

	const onDelete = (id: string) => {};

	const onSave = () => {
		form.validateFields().then((values) => {
			if (editId) {
				updateThingTypeData({
					...values,
					id: editId
				}).then(() => {
					onCancel();
					getTableData();
					message.success('修改成功!');
				});
			} else {
				addThingTypeData(values).then(() => {
					onCancel();
					getTableData();
					message.success('添加成功!');
				});
			}
		});
	};

	const onCancel = () => {
		setVisible(false);
		setEditId('');
		form.resetFields();
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
						title: '职业名称',
						dataIndex: 'thingName',
						width: '20%'
					},
					{
						title: '显示排序',
						dataIndex: 'orderNum',
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
				<Form {...FORM_LAYOUT} form={form}>
					<Form.Item
						label='物品名称'
						name='thingName'
						rules={[{ required: true }]}
					>
						<Input placeholder='请输入职业名称' />
					</Form.Item>
					<Form.Item label='显示排序' name='orderNum'>
						<Input placeholder='请输入显示排序' />
					</Form.Item>
					<Form.Item label='备注' name='remark'>
						<Input.TextArea placeholder='请输入备注' />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default ThingType;
