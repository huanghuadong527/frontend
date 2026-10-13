import { useEffect, useState } from 'react';
import {
	DeleteOutlined,
	EditOutlined,
	PlusOutlined,
	SearchOutlined
} from '@ant-design/icons';
import { App, Button, Form, Input, Modal, Space, Table } from 'antd';
import { useTable } from '@/core';
import { addPoem, deletePoem, getPoemById, updatePoem } from '@/service';

export const Component = () => {
	const { message, modal } = App.useApp();
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKeys, setSelectKeys] = useState<(string | number)[]>([]);
	const [searchForm] = Form.useForm();
	const [form] = Form.useForm();

	const { tableProps, getData } = useTable('/study/poem/list', () => searchForm.getFieldsValue());

	const onSearch = (values: AnyObject) => {
		getData(values);
	};

	const onReset = () => {
		searchForm.resetFields();
		getData();
	};

	const onFinish = (values: AnyObject) => {
		if (editId) {
			updatePoem({ ...values, id: editId }).then(() => {
				message.success('修改成功');
				onCancel();
				getData();
			});
		} else {
			addPoem(values).then(() => {
				message.success('新增成功');
				onCancel();
				getData();
			});
		}
	};

	const onEdit = (id?: string | number) => {
		if (id) {
			setEditId(id);
			getPoemById(id).then((result) => {
				const record = result.data;
				form.resetFields();
				form.setFieldsValue({
					name: record.name ?? '',
					author: record.author ?? '',
					dynasty: record.dynasty ?? '',
					tags: record.tags ?? '',
					poemLine: record.poemLine ?? ''
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
			content: '是否确认删除该诗词?',
			onOk() {
				deletePoem(id).then(() => {
					message.success('删除成功');
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的诗词');
			return;
		}
		modal.confirm({
			title: '系统提示',
			content: `是否确认删除选中的 ${selectKeys.length} 项数据?`,
			onOk() {
				deletePoem(selectKeys.join(',')).then(() => {
					message.success('删除成功');
					setSelectKeys([]);
					getData();
				});
			}
		});
	};

	const columns = [
		{ title: '编号', dataIndex: 'id' },
		{ title: '诗词名称', dataIndex: 'name' },
		{ title: '作者', dataIndex: 'author' },
		{ title: '朝代', dataIndex: 'dynasty' },
		{ title: '标签', dataIndex: 'tags' },
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
					<Form.Item name='name' label='诗词名称'>
						<Input placeholder='请输入诗词名称' />
					</Form.Item>
					<Form.Item name='author' label='作者'>
						<Input placeholder='请输入作者' />
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
				title={editId ? '编辑诗词' : '新增诗词'}
				open={isOpen}
				onOk={onSave}
				onCancel={onCancel}
				destroyOnHidden
				forceRender
			>
				<Form
					form={form}
					labelCol={{ flex: '0 0 90px' }}
					onFinish={onFinish}
					initialValues={{
						name: '',
						author: '',
						dynasty: '',
						tags: '',
						poemLine: ''
					}}
				>
					<Form.Item
						name='name'
						label='诗词名称'
						rules={[{ required: true, message: '请输入诗词名称' }]}
					>
						<Input placeholder='请输入诗词名称' />
					</Form.Item>
					<Form.Item name='author' label='作者'>
						<Input placeholder='请输入作者' />
					</Form.Item>
					<Form.Item name='dynasty' label='朝代'>
						<Input placeholder='请输入朝代' />
					</Form.Item>
					<Form.Item name='tags' label='标签'>
						<Input placeholder='请输入标签' />
					</Form.Item>
					<Form.Item name='poemLine' label='内容'>
						<Input.TextArea rows={3} placeholder='请输入诗词内容' />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};
