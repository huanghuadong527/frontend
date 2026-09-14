import { Key, useCallback, useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Popconfirm, Select, Space, Table } from 'antd';
import { message } from '@/redux';
import type { TableProps } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { FORM_LAYOUT } from '@/core';
import { addTitle, deleteTitle, getDictTypeByType, getTitleById, getTitleList, updateTitle } from '@/service';

const DICT_TITLE_AREA = 'game_wm_title_area';

const Title = () => {
	const [visible, setVisible] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
	const [dataSource, setDataSource] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [pageNum, setPageNum] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [total, setTotal] = useState(0);
	const [areas, setAreas] = useState<any[]>([]);
	const [searchForm] = Form.useForm();
	const [form] = Form.useForm();

	const getData = useCallback(
		(params: object = {}) => {
			setLoading(true);
			getTitleList({ pageNum, pageSize, ...params }).then((result) => {
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

	useEffect(() => {
		getDictTypeByType(DICT_TITLE_AREA).then((result) => {
			const list = result.data ?? [];
			setAreas(
				list.map((item: any) => ({
					value: item.dictValue,
					label: item.dictLabel
				}))
			);
		});
	}, []);

	const onSearch = (values: any) => {
		getData({
			name: values.name || undefined,
			taskName: values.taskName || undefined,
			area: values.area || undefined
		});
	};

	const onReset = () => {
		searchForm.resetFields();
		getData();
	};

	const onEdit = (id?: string | number) => {
		if (id) {
			setEditId(id);
			getTitleById(id).then((result) => {
				const record = result.data;
				form.setFieldsValue({
					...record,
					sort: record.sort != null ? String(record.sort) : ''
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
			const params = {
				...values,
				sort: values.sort === '' || values.sort == null ? null : Number(values.sort)
			};
			if (editId) {
				updateTitle({ ...params, id: editId }).then(() => {
					message.success('修改成功');
					onCancel();
					getData();
				});
			} else {
				addTitle(params).then(() => {
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
		deleteTitle(id).then(() => {
			message.success('删除成功');
			getData();
		});
	};

	const onBatchDelete = () => {
		if (selectedRowKeys.length === 0) {
			message.warning('请选择要删除的称号');
			return;
		}
		deleteTitle(selectedRowKeys.join(',')).then(() => {
			message.success('删除成功');
			setSelectedRowKeys([]);
			getData();
		});
	};

	const getAreaLabel = (value: unknown) => areas.find((item) => item.value == value)?.label ?? value ?? '--';

	const columns: TableProps<any>['columns'] = [
		{ title: '编号', dataIndex: 'id' },
		{ title: '称号名称', dataIndex: 'name' },
		{ title: '任务名称', dataIndex: 'taskName' },
		{ title: '顺序', dataIndex: 'sort' },
		{ title: '区域', dataIndex: 'area', render: (value) => getAreaLabel(value) },
		{ title: '属性', dataIndex: 'attr' },
		{ title: '流程', dataIndex: 'process' },
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
					<Form.Item name='name' label='称号名称'>
						<Input placeholder='请输入称号名称' />
					</Form.Item>
					<Form.Item name='taskName' label='任务名称'>
						<Input placeholder='请输入任务名称' />
					</Form.Item>
					<Form.Item name='area' label='区域'>
						<Select placeholder='请选择区域' options={areas} allowClear style={{ width: 140 }} />
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
			<Modal title={editId ? '编辑称号' : '新增称号'} open={visible} onOk={onSave} onCancel={onCancel}>
				<Form {...FORM_LAYOUT} form={form}>
					<Form.Item
						name='name'
						label='称号名称'
						rules={[{ required: true, message: '请输入称号名称' }]}
					>
						<Input placeholder='请输入称号名称' />
					</Form.Item>
					<Form.Item name='taskName' label='任务名称'>
						<Input placeholder='请输入任务名称' />
					</Form.Item>
					<Form.Item name='sort' label='顺序'>
						<Input placeholder='请输入顺序' />
					</Form.Item>
					<Form.Item name='area' label='区域'>
						<Select placeholder='请选择区域' options={areas} />
					</Form.Item>
					<Form.Item name='attr' label='属性'>
						<Input placeholder='请输入属性' />
					</Form.Item>
					<Form.Item name='process' label='流程'>
						<Input placeholder='请输入流程' />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export const Component = Title;
