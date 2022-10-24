import { DynamicSearch, DynamicTable } from '@/components';
import {
	Button,
	Form,
	Input,
	message,
	Modal,
	Popconfirm,
	Radio,
	Space,
	Tag,
} from 'antd';
import {
	addConfigData,
	deleteConfigData,
	getConfigDataById,
	updateConfigData,
} from '@/service';
import { useState } from 'react';
import { FORM_LAYOUT, useAntdTable } from '@/core';

const Config = () => {
	const [visible, setVisible] = useState(false);
	const [editId, setEditId] = useState('');
	const [form] = Form.useForm();
	const { dataSource, tableProps, loading, getTableData } = useAntdTable(
		'/system/config/list'
	);

	const onEdit = (id?: string) => {
		if (id) {
			getConfigDataById(id).then((result) => {
				setEditId(id);
				setVisible(true);
				form.setFieldsValue(result.data);
			});
		} else {
			setVisible(true);
		}
	};

	const onSave = () => {
		form.validateFields().then((values) => {
			if (editId) {
				updateConfigData({
					...values,
					id: editId,
				}).then(() => {
					message.success('修改成功!');
					onCancel();
					getTableData();
				});
			} else {
				addConfigData(values).then(() => {
					message.success('新增成功!');
					onCancel();
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

	const onDelete = (id?: string) => {
		if (id) {
			deleteConfigData(id).then(() => {
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
						title: '参数名称',
						dataIndex: 'configName',
						ellipsis: true,
					},
					{
						title: '参数键名',
						dataIndex: 'configKey',
					},
					{
						title: '参数键值',
						dataIndex: 'configValue',
					},
					{
						title: '系统内置',
						dataIndex: 'configType',
						render: (value) => {
							return (
								<Tag color={value == 'Y' ? 'success' : 'error'}>
									{value == 'Y' ? '是' : '否'}
								</Tag>
							);
						},
					},
					{
						title: '备注',
						dataIndex: 'remark',
						ellipsis: true,
					},
					{
						title: '创建时间',
						dataIndex: 'createTime',
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
				<Form {...FORM_LAYOUT} form={form} initialValues={{ configType: 'Y' }}>
					<Form.Item
						label='参数名称'
						name='configName'
						rules={[{ required: true }]}
					>
						<Input placeholder='请输入参数名称' />
					</Form.Item>
					<Form.Item
						label='参数键名'
						name='configKey'
						rules={[{ required: true }]}
					>
						<Input placeholder='请输入参数键名' />
					</Form.Item>
					<Form.Item
						label='参数键值'
						name='configValue'
						rules={[{ required: true }]}
					>
						<Input placeholder='请输入参数键值' />
					</Form.Item>
					<Form.Item label='系统内置' name='configType'>
						<Radio.Group>
							<Radio value='Y'>是</Radio>
							<Radio value='N'>否</Radio>
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

export default Config;
