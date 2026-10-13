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
	Tag
} from 'antd';
import {
	DeleteOutlined,
	EditOutlined,
	PlusOutlined,
	SearchOutlined
} from '@ant-design/icons';
import { useTable } from '@/core';
import { usePermission } from '@/authority';
import { addConfig, deleteConfig, getConfigById, updateConfig } from '@/service';

export const Component = () => {
	const { message, modal } = App.useApp();
	const { hasPermi } = usePermission();
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');

	const { tableProps, getData } = useTable('/system/config/list', () => searchForm.getFieldsValue());

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
			updateConfig({ ...values, id: editId }).then(() => {
				message.success('修改成功');
				onCancel();
				getData();
			});
		} else {
			addConfig(values).then(() => {
				message.success('新增成功');
				onCancel();
				getData();
			});
		}
	};

	const onEdit = (id?: string | number) => {
		if (id) {
			setEditId(id);
			getConfigById(id).then((result) => {
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
			content: '是否确认删除该参数?',
			onOk() {
				deleteConfig(id).then(() => {
					message.success('删除成功');
					getData();
				});
			}
		});
	};

	const columns = [
		{
			title: '参数名称',
			dataIndex: 'configName'
		},
		{
			title: '参数键名',
			dataIndex: 'configKey'
		},
		{
			title: '参数键值',
			dataIndex: 'configValue'
		},
		{
			title: '系统内置',
			dataIndex: 'configType',
			render: (value: any) => (
				<Tag color={value == 'Y' ? 'success' : 'default'}>
					{value == 'Y' ? '是' : '否'}
				</Tag>
			)
		},
		{
			title: '备注',
			dataIndex: 'remark'
		},
		{
			title: '创建时间',
			dataIndex: 'createTime'
		},
		{
			title: '操作',
			dataIndex: 'action',
			width: 100,
			render: (_: any, row: AnyObject) => (
				<>
					{hasPermi('system:config:edit') && (
						<Button
							type='link'
							size='small'
							icon={<EditOutlined />}
							title='编辑'
							onClick={() => onEdit(row.id)}
						/>
					)}
					{hasPermi('system:config:remove') && (
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
					<Form.Item name='configName' label='参数名称'>
						<Input placeholder='请输入参数名称' />
					</Form.Item>
					<Form.Item name='configKey' label='参数键名'>
						<Input placeholder='请输入参数键名' />
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
				{hasPermi('system:config:add') && (
					<Button type='primary' icon={<PlusOutlined />} onClick={() => onEdit()}>
						新建
					</Button>
				)}
			</div>
			<Table {...tableProps} columns={columns} />
			<Modal
				title={editId ? '编辑参数' : '新增参数'}
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
						configName: '',
						configKey: '',
						configValue: '',
						configType: 'Y',
						remark: ''
					}}
					onFinish={onFinish}
				>
					<Form.Item
						name='configName'
						label='参数名称'
						rules={[{ required: true, message: '请输入参数名称' }]}
					>
						<Input placeholder='请输入参数名称' />
					</Form.Item>
					<Form.Item
						name='configKey'
						label='参数键名'
						rules={[{ required: true, message: '请输入参数键名' }]}
					>
						<Input placeholder='请输入参数键名' />
					</Form.Item>
					<Form.Item
						name='configValue'
						label='参数键值'
						rules={[{ required: true, message: '请输入参数键值' }]}
					>
						<Input placeholder='请输入参数键值' />
					</Form.Item>
					<Form.Item name='configType' label='系统内置'>
						<Radio.Group>
							<Radio value='Y'>是</Radio>
							<Radio value='N'>否</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item name='remark' label='备注'>
						<Input.TextArea placeholder='请输入备注' />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};
