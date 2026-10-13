import { useEffect, useState } from 'react';
import {
	DeleteOutlined,
	EditOutlined,
	PlusOutlined,
	SearchOutlined
} from '@ant-design/icons';
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
import { useTable } from '@/core';
import {
	addMaterial,
	deleteMaterial,
	getMaterialById,
	updateMaterial
} from '@/service';

export const Component = () => {
	const { message, modal } = App.useApp();
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKeys, setSelectKeys] = useState<(string | number)[]>([]);
	const [searchForm] = Form.useForm();
	const [form] = Form.useForm();

	const { tableProps, getData } = useTable('/shop/material/list', () => searchForm.getFieldsValue());

	const onSearch = (values: AnyObject) => {
		getData(values);
	};

	const onReset = () => {
		searchForm.resetFields();
		getData();
	};

	const onFinish = (values: AnyObject) => {
		if (editId) {
			updateMaterial({ ...values, id: editId }).then(() => {
				message.success('修改成功');
				onCancel();
				getData();
			});
		} else {
			addMaterial(values).then(() => {
				message.success('新增成功');
				onCancel();
				getData();
			});
		}
	};

	const onEdit = (id?: string | number) => {
		if (id) {
			setEditId(id);
			getMaterialById(id).then((result) => {
				const record = result.data;
				form.resetFields();
				form.setFieldsValue({
					materialName: record.materialName,
					materialUrl: record.materialUrl,
					status: String(record.status ?? '0')
				});
				setIsOpen(true);
			});
		} else {
			setEditId('');
			form.resetFields();
			setIsOpen(true);
		}
	};

	const onSave = () => {
		form.submit();
	};

	const onCancel = () => {
		setIsOpen(false);
		setEditId('');
		form.resetFields();
	};

	const onDelete = (id: string | number) => {
		modal.confirm({
			title: '系统提示',
			content: '是否确认删除该材质?',
			onOk() {
				deleteMaterial(id).then(() => {
					message.success('删除成功');
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的材质');
			return;
		}
		modal.confirm({
			title: '系统提示',
			content: `是否确认删除选中的 ${selectKeys.length} 项数据?`,
			onOk() {
				Promise.all(selectKeys.map((id) => deleteMaterial(id))).then(() => {
					message.success('删除成功');
					setSelectKeys([]);
					getData();
				});
			}
		});
	};

	const columns = [
		{ title: '材质编号', dataIndex: 'id' },
		{ title: '材质名称', dataIndex: 'materialName' },
		{ title: '材质贴图', dataIndex: 'materialUrl' },
		{
			title: '状态',
			dataIndex: 'status',
			render: (value: any) => (
				<Tag color={value == 0 ? 'success' : 'error'}>
					{value == 0 ? '正常' : '停用'}
				</Tag>
			)
		},
		{ title: '创建时间', dataIndex: 'createTime' },
		{
			title: '操作',
			dataIndex: 'action',
			width: 100,
			render: (_: any, row: AnyObject) => (
				<>
					<Button
						type='link'
						size='small'
						icon={<EditOutlined />}
						title='编辑'
						onClick={() => onEdit(row.id)}
					/>
					<Button
						type='link'
						danger
						size='small'
						icon={<DeleteOutlined />}
						title='删除'
						onClick={() => onDelete(row.id)}
					/>
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
					<Form.Item name='materialName' label='材质名称'>
						<Input placeholder='请输入材质名称' />
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
					<Button type='primary' icon={<PlusOutlined />} onClick={() => onEdit()}>
						新建
					</Button>
					<Button
						type='primary'
						danger
						icon={<DeleteOutlined />}
						disabled={selectKeys.length == 0}
						onClick={onBatchDelete}
					>
						批量删除
					</Button>
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
				title={editId ? '编辑材质' : '新增材质'}
				open={isOpen}
				onOk={onSave}
				onCancel={onCancel}
				destroyOnHidden
				forceRender
			>
				<Form
					form={form}
					labelCol={{ flex: '0 0 100px' }}
					onFinish={onFinish}
					initialValues={{
						materialName: '',
						materialUrl: '',
						status: '0'
					}}
				>
					<Form.Item
						name='materialName'
						label='材质名称'
						rules={[{ required: true, message: '请输入材质名称' }]}
					>
						<Input placeholder='请输入材质名称' />
					</Form.Item>
					<Form.Item name='materialUrl' label='材质贴图'>
						<Input placeholder='请输入材质贴图地址' />
					</Form.Item>
					<Form.Item name='status' label='状态'>
						<Radio.Group>
							<Radio value='0'>正常</Radio>
							<Radio value='1'>停用</Radio>
						</Radio.Group>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};
