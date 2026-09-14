import { Key, useCallback, useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Popconfirm, Radio, Space, Table, Tag } from 'antd';
import { message } from '@/redux';
import type { TableProps } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { FORM_LAYOUT } from '@/core';
import { addMaterial, deleteMaterial, getMaterialById, getMaterialList, updateMaterial } from '@/service';

const Material = () => {
	const [visible, setVisible] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
	const [dataSource, setDataSource] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [pageNum, setPageNum] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [total, setTotal] = useState(0);
	const [searchForm] = Form.useForm();
	const [form] = Form.useForm();

	const getData = useCallback(
		(params: object = {}) => {
			setLoading(true);
			getMaterialList({ pageNum, pageSize, ...params }).then((result) => {
				setLoading(false);
				setTotal(result.data?.total ?? 0);
				setDataSource(result.data?.data ?? []);
			});
		},
		[pageNum, pageSize]
	);

	useEffect(() => {
		getData();
	}, [getData]);

	const onSearch = (values: any) => {
		getData({
			materialName: values.materialName || undefined
		});
	};

	const onReset = () => {
		searchForm.resetFields();
		getData();
	};

	const onEdit = (id?: string | number) => {
		if (id) {
			setEditId(id);
			getMaterialById(id).then((result) => {
				const record = result.data;
				form.setFieldsValue({
					...record,
					status: String(record.status ?? '0')
				});
				setVisible(true);
			});
		} else {
			setEditId('');
			form.resetFields();
			setVisible(true);
		}
	};

	const onSave = () => {
		form.validateFields().then((values) => {
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
		});
	};

	const onCancel = () => {
		setVisible(false);
		setEditId('');
		form.resetFields();
	};

	const onDelete = (id: string | number) => {
		deleteMaterial(id).then(() => {
			message.success('删除成功');
			getData();
		});
	};

	const onBatchDelete = () => {
		if (selectedRowKeys.length === 0) {
			message.warning('请选择要删除的材质');
			return;
		}
		Promise.all(selectedRowKeys.map((id) => deleteMaterial(id as string | number))).then(() => {
			message.success('删除成功');
			setSelectedRowKeys([]);
			getData();
		});
	};

	const columns: TableProps<any>['columns'] = [
		{ title: '材质编号', dataIndex: 'id' },
		{ title: '材质名称', dataIndex: 'materialName' },
		{ title: '材质贴图', dataIndex: 'materialUrl' },
		{
			title: '状态',
			dataIndex: 'status',
			render: (value) => (
				<Tag color={value == 0 ? 'success' : 'error'}>{value == 0 ? '正常' : '停用'}</Tag>
			)
		},
		{ title: '创建时间', dataIndex: 'createTime' },
		{
			title: '操作',
			width: 120,
			render: (_, record) => (
				<Space>
					<Button
						type='link'
						size='small'
						icon={<EditOutlined />}
						onClick={() => onEdit(record.id)}
					>
						编辑
					</Button>
					<Popconfirm title='是否确认删除?' onConfirm={() => onDelete(record.id)}>
						<Button type='link' size='small' danger icon={<DeleteOutlined />}>
							删除
						</Button>
					</Popconfirm>
				</Space>
			)
		}
	];

	return (
		<div className='w-full h-full flex flex-col'>
			<div className='flex justify-between mb-4'>
				<Form layout='inline' form={searchForm} onFinish={onSearch}>
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
					<Popconfirm title='是否确认删除?' onConfirm={onBatchDelete}>
						<Button danger icon={<DeleteOutlined />} disabled={selectedRowKeys.length === 0}>
							批量删除
						</Button>
					</Popconfirm>
				</Space>
			</div>
			<Table
				rootClassName='table-fill'
				size='small'
				rowKey='id'
				loading={loading}
				dataSource={dataSource}
				columns={columns}
				scroll={{ y: '100%' }}
				rowSelection={{ selectedRowKeys, onChange: (keys) => setSelectedRowKeys(keys) }}
				pagination={{
					current: pageNum,
					pageSize,
					total,
					showSizeChanger: true,
					showQuickJumper: true,
					showTotal: (t) => `共 ${t} 条`,
					onChange: (page, size) => {
						setPageNum(page);
						setPageSize(size);
					}
				}}
			/>
			<Modal title={editId ? '编辑材质' : '新增材质'} open={visible} onOk={onSave} onCancel={onCancel}>
				<Form {...FORM_LAYOUT} form={form}>
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

export const Component = Material;
