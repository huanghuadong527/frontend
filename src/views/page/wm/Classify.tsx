import moment from 'moment';
import { FORM_LAYOUT } from '@/core';
import { App, Button, Form, Input, Modal, Popconfirm, Space, Table } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import {
	addClassifyData,
	getClassifyData,
	getClassifyDataById,
	updateClassifyData
} from '@/service';

const Classify = () => {
	const [visible, setVisible] = useState(false);
	const [editId, setEditId] = useState('');
	const [form] = Form.useForm();
	const { message } = App.useApp();
	const [dataSource, setDataSource] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [pageNum, setPageNum] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [total, setTotal] = useState(0);

	const getData = useCallback(
		(params: object = {}) => {
			setLoading(true);
			getClassifyData({ pageNum, pageSize, ...params }).then((result) => {
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

	const onEdit = (id?: string) => {
		if (id) {
			setEditId(id);
			getClassifyDataById(id).then((result) => {
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
				updateClassifyData({
					...values,
					id: editId
				}).then(() => {
					onCancel();
					getData();
					message.success('修改成功!');
				});
			} else {
				addClassifyData(values).then(() => {
					onCancel();
					getData();
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
		<div
			className='flex justify-between mb-4'
		>
			<Button type='primary' onClick={() => onEdit()}>
				新增
			</Button>
		</div>
	);

	return (
		<div className='w-full h-full flex flex-col'>
			{headerRender}
			<Table
				rootClassName='table-fill'
				size='small'
				rowKey='id'
				columns={[
					{
						title: '分类名称',
						dataIndex: 'classifyName',
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
			<Modal
				okText='保存'
				title={editId == '' ? '新增' : '编辑'}
				open={visible}
				onOk={onSave}
				onCancel={onCancel}
			>
				<Form {...FORM_LAYOUT} form={form}>
					<Form.Item
						label='分类名称'
						name='classifyName'
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

export const Component = Classify;
