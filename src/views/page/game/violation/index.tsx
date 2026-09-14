import { Key, useCallback, useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Popconfirm, Radio, Space, Table, Tag } from 'antd';
import { message } from '@/redux';
import type { TableProps } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { FORM_LAYOUT } from '@/core';
import {
	addViolation,
	deleteViolation,
	getViolationById,
	getViolationList,
	updateViolation
} from '@/service';

const Violation = () => {
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
			getViolationList({ pageNum, pageSize, ...params }).then((result) => {
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
			violator: values.violator || undefined,
			behavior: values.behavior || undefined
		});
	};

	const onReset = () => {
		searchForm.resetFields();
		getData();
	};

	const onEdit = (id?: string | number) => {
		if (id) {
			setEditId(id);
			getViolationById(id).then((result) => {
				form.setFieldsValue(result.data);
				setVisible(true);
			});
		} else {
			setEditId('');
			form.resetFields();
			form.setFieldsValue({ isShow: 1, isTop: 0, isNewZone: 0 });
			setVisible(true);
		}
	};

	const onSave = () => {
		form.validateFields().then((values) => {
			if (editId) {
				updateViolation({ ...values, id: editId }).then(() => {
					message.success('修改成功');
					onCancel();
					getData();
				});
			} else {
				addViolation(values).then(() => {
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
		deleteViolation(id).then(() => {
			message.success('删除成功');
			getData();
		});
	};

	const onBatchDelete = () => {
		if (selectedRowKeys.length === 0) {
			message.warning('请选择要删除的违规记录');
			return;
		}
		deleteViolation(selectedRowKeys.join(',')).then(() => {
			message.success('删除成功');
			setSelectedRowKeys([]);
			getData();
		});
	};

	const renderYesNo = (value: unknown) =>
		value == 1 ? <Tag color='green'>是</Tag> : <Tag>否</Tag>;

	const columns: TableProps<any>['columns'] = [
		{ title: '编号', dataIndex: 'id', width: 70 },
		{ title: '违规人', dataIndex: 'violator' },
		{ title: '违规行为', dataIndex: 'behavior' },
		{ title: '是否展示', dataIndex: 'isShow', render: renderYesNo },
		{ title: '是否置顶', dataIndex: 'isTop', render: renderYesNo },
		{ title: '是否新区', dataIndex: 'isNewZone', render: renderYesNo },
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
					<Form.Item name='violator' label='违规人'>
						<Input placeholder='请输入违规人' />
					</Form.Item>
					<Form.Item name='behavior' label='违规行为'>
						<Input placeholder='请输入违规行为' />
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
			<Modal title={editId ? '编辑违规' : '新增违规'} open={visible} onOk={onSave} onCancel={onCancel}>
				<Form {...FORM_LAYOUT} form={form}>
					<Form.Item
						name='violator'
						label='违规人'
						rules={[{ required: true, message: '请输入违规人' }]}
					>
						<Input placeholder='请输入违规人' />
					</Form.Item>
					<Form.Item name='behavior' label='违规行为'>
						<Input.TextArea rows={3} placeholder='请输入违规行为' />
					</Form.Item>
					<Form.Item name='isShow' label='是否展示'>
						<Radio.Group>
							<Radio value={1}>是</Radio>
							<Radio value={0}>否</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item name='isTop' label='是否置顶'>
						<Radio.Group>
							<Radio value={1}>是</Radio>
							<Radio value={0}>否</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item name='isNewZone' label='是否新区'>
						<Radio.Group>
							<Radio value={1}>是</Radio>
							<Radio value={0}>否</Radio>
						</Radio.Group>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export const Component = Violation;
