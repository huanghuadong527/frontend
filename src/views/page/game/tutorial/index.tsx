import { useEffect, useState } from 'react';
import {
	CheckOutlined,
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
import type { TableColumnsType } from 'antd';
import { MarkdownEditor } from '@/components/markdown-editor';
import { useTable } from '@/core';
import {
	addTutorial,
	deleteTutorial,
	getTutorialById,
	updateTutorial
} from '@/service';

const renderYesNo = (value: unknown) => (value == 1 ? '是' : '否');

const renderContent = (value: unknown) => {
	if (!value) return '--';
	const s = String(value);
	return s.length > 40 ? `${s.slice(0, 40)}…` : s;
};

export const Component = () => {
	const { message, modal } = App.useApp();
	const [searchForm] = Form.useForm();
	const [form] = Form.useForm();
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKeys, setSelectKeys] = useState<(string | number)[]>([]);

	const { tableProps, getData } = useTable('/game/wm/tutorial/list', () => searchForm.getFieldsValue());

	const onSearch = (values: AnyObject) => {
		getData({
			title: values.title || undefined,
			author: values.author || undefined
		});
	};

	const onReset = () => {
		searchForm.resetFields();
		getData();
	};

	const onFinish = (values: AnyObject) => {
		const params = {
			title: values.title,
			author: values.author || undefined,
			content: values.content || undefined,
			publishTime: values.publishTime || undefined,
			isShelf: Number(values.isShelf),
			sort: values.sort === '' ? null : Number(values.sort),
			isAudit: 1
		};
		if (editId) {
			updateTutorial({ ...params, id: editId }).then(() => {
				message.success('修改成功');
				onCancel();
				getData();
			});
		} else {
			addTutorial(params).then(() => {
				message.success('新增成功');
				onCancel();
				getData();
			});
		}
	};

	const onEdit = (id?: string | number) => {
		if (id) {
			setEditId(id);
			getTutorialById(id).then((result) => {
				const record = result.data;
				form.resetFields();
				form.setFieldsValue({
					title: record.title ?? '',
					author: record.author ?? '',
					content: record.content ?? '',
					publishTime: record.publishTime ?? '',
					isShelf: record.isShelf != null ? String(record.isShelf) : '0',
					sort: record.sort != null ? String(record.sort) : ''
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
			content: '是否确认删除该教程?',
			onOk() {
				deleteTutorial(id).then(() => {
					message.success('删除成功');
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的教程');
			return;
		}
		modal.confirm({
			title: '系统提示',
			content: `是否确认删除选中的 ${selectKeys.length} 项数据?`,
			onOk() {
				deleteTutorial(selectKeys.join(',')).then(() => {
					message.success('删除成功');
					setSelectKeys([]);
					getData();
				});
			}
		});
	};

	const onAudit = (row: AnyObject) => {
		modal.confirm({
			title: '审核',
			content: '请选择审核结果',
			okText: '通过',
			cancelText: '拒绝',
			onOk() {
				updateTutorial({ ...row, isAudit: 1 }).then(() => {
					message.success('已通过审核');
					getData();
				});
			},
			onCancel() {
				updateTutorial({ ...row, isAudit: 2 }).then(() => {
					message.success('已拒绝');
					getData();
				});
			}
		});
	};

	useEffect(() => {
		getData();
	}, []);

	const columns: TableColumnsType<AnyObject> = [
		{ title: '编号', dataIndex: 'id' },
		{ title: '教程标题', dataIndex: 'title' },
		{ title: '作者', dataIndex: 'author' },
		{ title: '日期', dataIndex: 'publishTime' },
		{
			title: '是否上架',
			dataIndex: 'isShelf',
			render: (value) => renderYesNo(value)
		},
		{ title: '排序', dataIndex: 'sort' },
		{
			title: '审核状态',
			dataIndex: 'isAudit',
			render: (value) => {
				if (value == 2) return <Tag color='error'>已拒绝</Tag>;
				return value == 1 ? <Tag color='success'>已通过</Tag> : <Tag color='warning'>待审核</Tag>;
			}
		},
		{
			title: '内容',
			dataIndex: 'content',
			render: (value) => renderContent(value)
		},
		{
			title: '操作',
			dataIndex: 'action',
			width: 160,
			render: (_v, row) => (
				<>
					{row.isAudit == 0 && (
						<Button
							type='link'
							size='small'
							icon={<CheckOutlined />}
							title='审核'
							onClick={() => onAudit(row)}
						/>
					)}
					<Button
						type='link'
						size='small'
						icon={<EditOutlined />}
						title='编辑'
						onClick={() => onEdit(row.id)}
					/>
					<Button
						type='link'
						size='small'
						danger
						icon={<DeleteOutlined />}
						title='删除'
						onClick={() => onDelete(row.id)}
					/>
				</>
			)
		}
	];

	return (
		<div className='p-4 flex flex-col gap-4'>
			<div className='flex items-center justify-between'>
				<Form form={searchForm} layout='inline' onFinish={onSearch}>
					<Form.Item name='title' label='教程标题'>
						<Input placeholder='请输入教程标题' />
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
				title={editId ? '编辑教程' : '新增教程'}
				open={isOpen}
				width={900}
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
						title: '',
						author: '',
						content: '',
						publishTime: '',
						isShelf: '1',
						sort: ''
					}}
				>
					<Form.Item
						name='title'
						label='教程标题'
						rules={[{ required: true, message: '请输入教程标题' }]}
					>
						<Input placeholder='请输入教程标题' />
					</Form.Item>
					<Form.Item name='author' label='作者'>
						<Input placeholder='请输入作者' />
					</Form.Item>
					<Form.Item name='publishTime' label='日期'>
						<Input placeholder='请输入日期，如 2026-09-30' />
					</Form.Item>
					<Form.Item name='isShelf' label='是否上架'>
						<Radio.Group>
							<Radio value='1'>是</Radio>
							<Radio value='0'>否</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item name='sort' label='排序'>
						<Input placeholder='请输入排序' />
					</Form.Item>
					<Form.Item name='content' label='教程内容'>
						<MarkdownEditor
							height={360}
							placeholder='请输入教程内容(Markdown)'
						/>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};
