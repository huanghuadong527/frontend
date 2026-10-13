import { useEffect, useState } from 'react';
import {
	DeleteOutlined,
	EditOutlined,
	PlusOutlined,
	SearchOutlined
} from '@ant-design/icons';
import { App, Button, Form, Input, Modal, Space, Table } from 'antd';
import { useTable } from '@/core';
import { addWord, deleteWord, getWordById, updateWord } from '@/service';

export const Component = () => {
	const { message, modal } = App.useApp();
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKeys, setSelectKeys] = useState<(string | number)[]>([]);
	const [searchForm] = Form.useForm();
	const [form] = Form.useForm();

	const { tableProps, getData } = useTable('/study/word/list', () => searchForm.getFieldsValue());

	const onSearch = (values: AnyObject) => {
		getData(values);
	};

	const onReset = () => {
		searchForm.resetFields();
		getData();
	};

	const onFinish = (values: AnyObject) => {
		if (editId) {
			updateWord({ ...values, id: editId }).then(() => {
				message.success('修改成功');
				onCancel();
				getData();
			});
		} else {
			addWord(values).then(() => {
				message.success('新增成功');
				onCancel();
				getData();
			});
		}
	};

	const onEdit = (id?: string | number) => {
		if (id) {
			setEditId(id);
			getWordById(id).then((result) => {
				const record = result.data;
				form.resetFields();
				form.setFieldsValue({
					name: record.name ?? '',
					type: record.type ?? '',
					trans: record.trans ?? '',
					ukphone: record.ukphone ?? '',
					usphone: record.usphone ?? '',
					count: record.count ?? ''
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
			content: '是否确认删除该单词?',
			onOk() {
				deleteWord(id).then(() => {
					message.success('删除成功');
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的单词');
			return;
		}
		modal.confirm({
			title: '系统提示',
			content: `是否确认删除选中的 ${selectKeys.length} 项数据?`,
			onOk() {
				deleteWord(selectKeys.join(',')).then(() => {
					message.success('删除成功');
					setSelectKeys([]);
					getData();
				});
			}
		});
	};

	const columns = [
		{ title: '编号', dataIndex: 'id' },
		{ title: '单词', dataIndex: 'name' },
		{ title: '类型', dataIndex: 'type' },
		{ title: '翻译', dataIndex: 'trans' },
		{ title: '英音', dataIndex: 'ukphone' },
		{ title: '美音', dataIndex: 'usphone' },
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
					<Form.Item name='name' label='单词'>
						<Input placeholder='请输入单词' />
					</Form.Item>
					<Form.Item name='type' label='类型'>
						<Input placeholder='请输入类型' />
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
				title={editId ? '编辑单词' : '新增单词'}
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
						type: '',
						trans: '',
						ukphone: '',
						usphone: '',
						count: ''
					}}
				>
					<Form.Item
						name='name'
						label='单词'
						rules={[{ required: true, message: '请输入单词' }]}
					>
						<Input placeholder='请输入单词' />
					</Form.Item>
					<Form.Item name='type' label='类型'>
						<Input placeholder='请输入类型' />
					</Form.Item>
					<Form.Item name='trans' label='翻译'>
						<Input.TextArea rows={3} placeholder='请输入翻译' />
					</Form.Item>
					<Form.Item name='ukphone' label='英音'>
						<Input placeholder='请输入英音' />
					</Form.Item>
					<Form.Item name='usphone' label='美音'>
						<Input placeholder='请输入美音' />
					</Form.Item>
					<Form.Item name='count' label='出现次数'>
						<Input placeholder='请输入出现次数' />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};
