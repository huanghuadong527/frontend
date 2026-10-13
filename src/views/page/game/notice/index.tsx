import { useEffect, useState } from 'react';
import {
	ArrowDownOutlined,
	ArrowUpOutlined,
	CheckOutlined,
	DeleteOutlined,
	EditOutlined,
	PlusOutlined,
	SearchOutlined,
	SyncOutlined
} from '@ant-design/icons';
import {
	App,
	Button,
	Form,
	Input,
	Modal,
	Space,
	Table,
	Tag
} from 'antd';
import type { TableColumnsType } from 'antd';
import { useTable } from '@/core';
import {
	addWmNotice,
	deleteWmNotice,
	getWmNoticeById,
	syncWmNotice,
	updateWmNotice
} from '@/service';

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
	const [syncing, setSyncing] = useState(false);

	const { tableProps, getData } = useTable('/game/wm/notice/list', () => searchForm.getFieldsValue());

	const onSearch = (values: AnyObject) => {
		getData({ title: values.title || undefined });
	};

	const onReset = () => {
		searchForm.resetFields();
		getData();
	};

	const onFinish = (values: AnyObject) => {
		const params = {
			title: values.title,
			publishTime: values.publishTime || undefined,
			content: values.content || undefined,
			url: values.url || undefined,
			noticeId: values.noticeId || undefined,
			isAudit: 1
		};
		if (editId) {
			updateWmNotice({ ...params, id: editId }).then(() => {
				message.success('修改成功');
				onCancel();
				getData();
			});
		} else {
			addWmNotice({ ...params, isShelf: 1 }).then(() => {
				message.success('新增成功');
				onCancel();
				getData();
			});
		}
	};

	const onEdit = (id?: string | number) => {
		if (id) {
			setEditId(id);
			getWmNoticeById(id).then((result) => {
				const record = result.data;
				form.resetFields();
				form.setFieldsValue({
					title: record.title ?? '',
					publishTime: record.publishTime ?? '',
					content: record.content ?? '',
					url: record.url ?? '',
					noticeId: record.noticeId ?? ''
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
			content: '是否确认删除该公告?',
			onOk() {
				deleteWmNotice(id).then(() => {
					message.success('删除成功');
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的公告');
			return;
		}
		modal.confirm({
			title: '系统提示',
			content: `是否确认删除选中的 ${selectKeys.length} 项数据?`,
			onOk() {
				deleteWmNotice(selectKeys.join(',')).then(() => {
					message.success('删除成功');
					setSelectKeys([]);
					getData();
				});
			}
		});
	};

	const onSync = () => {
		setSyncing(true);
		syncWmNotice()
			.then((result) => {
				message.success(`同步完成，新增 ${result.data ?? 0} 条公告`);
				getData();
			})
			.finally(() => setSyncing(false));
	};

	const onAudit = (row: AnyObject) => {
		modal.confirm({
			title: '审核',
			content: '请选择审核结果',
			okText: '通过',
			cancelText: '拒绝',
			onOk() {
				updateWmNotice({ ...row, isAudit: 1 }).then(() => {
					message.success('已通过审核');
					getData();
				});
			},
			onCancel() {
				updateWmNotice({ ...row, isAudit: 2 }).then(() => {
					message.success('已拒绝');
					getData();
				});
			}
		});
	};

	const onShelf = (row: AnyObject) => {
		const next = row.isShelf == 1 ? 0 : 1;
		updateWmNotice({ ...row, isShelf: next }).then(() => {
			message.success(next == 1 ? '已上架' : '已下架');
			getData();
		});
	};

	useEffect(() => {
		getData();
	}, []);

	const columns: TableColumnsType<AnyObject> = [
		{ title: '编号', dataIndex: 'id' },
		{ title: '公告编号', dataIndex: 'noticeId' },
		{ title: '公告标题', dataIndex: 'title' },
		{ title: '发布时间', dataIndex: 'publishTime' },
		{
			title: '内容页地址',
			dataIndex: 'url',
			render: (value) => {
				if (!value) return '--';
				return (
					<a href={value} target='_blank' rel='noreferrer' title={value}>
						{renderContent(value)}
					</a>
				);
			}
		},
		{
			title: '内容',
			dataIndex: 'content',
			render: (value) => renderContent(value)
		},
		{
			title: '审核状态',
			dataIndex: 'isAudit',
			render: (value) => {
				if (value == 2) return <Tag color='error'>已拒绝</Tag>;
				return value == 1 ? <Tag color='success'>已通过</Tag> : <Tag color='warning'>待审核</Tag>;
			}
		},
		{
			title: '是否上架',
			dataIndex: 'isShelf',
			render: (value) => (value == 1 ? <Tag color='success'>已上架</Tag> : <Tag color='default'>已下架</Tag>)
		},
		{
			title: '操作',
			dataIndex: 'action',
			width: 220,
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
						danger={row.isShelf == 1}
						icon={row.isShelf == 1 ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
						title={row.isShelf == 1 ? '下架' : '上架'}
						onClick={() => onShelf(row)}
					/>
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
					<Form.Item name='title' label='公告标题'>
						<Input placeholder='请输入公告标题' />
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
					<Button
						type='primary'
						icon={<SyncOutlined />}
						disabled={syncing}
						onClick={onSync}
					>
						同步公告
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
				title={editId ? '编辑公告' : '新增公告'}
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
						title: '',
						publishTime: '',
						content: '',
						url: '',
						noticeId: ''
					}}
				>
					<Form.Item
						name='title'
						label='公告标题'
						rules={[{ required: true, message: '请输入公告标题' }]}
					>
						<Input placeholder='请输入公告标题' />
					</Form.Item>
					<Form.Item name='publishTime' label='发布时间'>
						<Input placeholder='请输入发布时间，如 2026-09-09' />
					</Form.Item>
					<Form.Item name='url' label='内容页地址'>
						<Input placeholder='请输入内容页地址' />
					</Form.Item>
					<Form.Item name='noticeId' label='公告编号'>
						<Input placeholder='请输入公告编号' />
					</Form.Item>
					<Form.Item name='content' label='公告内容'>
						<Input.TextArea rows={8} placeholder='请输入公告内容' />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};
