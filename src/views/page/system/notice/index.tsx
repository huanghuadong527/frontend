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
import { useTable, DICT_NOTICE_STATUS, DICT_NOTICE_TYPE } from '@/core';
import { usePermission } from '@/authority';
import {
	addNotice,
	deleteNotice,
	getDictDataByTypes,
	getNoticeById,
	updateNotice
} from '@/service';

export const Component = () => {
	const { message, modal } = App.useApp();
	const { hasPermi } = usePermission();
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [dicts, setDicts] = useState<AnyObject>();
	const [selectKeys, setSelectKeys] = useState<(string | number)[]>([]);

	const { tableProps, getData } = useTable('/system/notice/list', () => searchForm.getFieldsValue());

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
			updateNotice({ ...values, id: editId }).then(() => {
				message.success('修改成功');
				onCancel();
				getData();
			});
		} else {
			addNotice(values).then(() => {
				message.success('新增成功');
				onCancel();
				getData();
			});
		}
	};

	const getDictLabel = (type: string, value: any) => {
		if (dicts && dicts[type]) {
			const dict = dicts[type].find((item: any) => item.dictValue == value);
			if (dict && dict.dictLabel) {
				return dict.dictLabel;
			}
		}
		return '';
	};

	const onEdit = (id?: string | number) => {
		if (id) {
			setEditId(id);
			getNoticeById(id).then((result) => {
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
			content: '是否确认删除该公告?',
			onOk() {
				deleteNotice(id).then(() => {
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
				deleteNotice(selectKeys.join(',')).then(() => {
					message.success('删除成功');
					setSelectKeys([]);
					getData();
				});
			}
		});
	};

	const columns = [
		{
			title: '公告标题',
			dataIndex: 'noticeTitle'
		},
		{
			title: '公告类型',
			dataIndex: 'noticeType',
			render: (value: any) => (
				<Tag color={value == '1' ? 'success' : 'blue'}>
					{getDictLabel(DICT_NOTICE_TYPE, value)}
				</Tag>
			)
		},
		{
			title: '状态',
			dataIndex: 'status',
			render: (value: any) => (
				<Tag color={value == '0' ? 'success' : 'error'}>
					{getDictLabel(DICT_NOTICE_STATUS, value)}
				</Tag>
			)
		},
		{
			title: '创建者',
			dataIndex: 'createBy'
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
					{hasPermi('system:notice:edit') && (
						<Button
							type='link'
							size='small'
							icon={<EditOutlined />}
							title='编辑'
							onClick={() => onEdit(row.id)}
						/>
					)}
					{hasPermi('system:notice:remove') && (
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

	useEffect(() => {
		getDictDataByTypes([DICT_NOTICE_TYPE, DICT_NOTICE_STATUS].join(',')).then(
			(result) => {
				setDicts(result.data);
			}
		);
	}, []);

	return (
		<div className='p-4 flex flex-col gap-4'>
			<div className='flex items-center justify-between'>
				<Form form={searchForm} layout='inline' onFinish={onSearch}>
					<Form.Item name='noticeTitle' label='公告标题'>
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
					{hasPermi('system:notice:add') && (
						<Button
							type='primary'
							icon={<PlusOutlined />}
							onClick={() => onEdit()}
						>
							新建
						</Button>
					)}
					{hasPermi('system:notice:remove') && (
						<Button
							danger
							type='primary'
							icon={<DeleteOutlined />}
							disabled={selectKeys.length == 0}
							onClick={onBatchDelete}
						>
							批量删除
						</Button>
					)}
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
				destroyOnHidden
				forceRender
				onOk={() => form.submit()}
				onCancel={onCancel}
			>
				<Form
					form={form}
					labelCol={{ flex: '0 0 100px' }}
					initialValues={{
						noticeTitle: '',
						noticeType: '1',
						status: '0',
						noticeContent: ''
					}}
					onFinish={onFinish}
				>
					<Form.Item
						name='noticeTitle'
						label='公告标题'
						rules={[{ required: true, message: '请输入公告标题' }]}
					>
						<Input placeholder='请输入公告标题' />
					</Form.Item>
					<Form.Item name='noticeType' label='公告类型'>
						<Radio.Group>
							{dicts &&
								dicts[DICT_NOTICE_TYPE].map((item: any) => (
									<Radio key={item.id} value={item.dictValue}>
										{item.dictLabel}
									</Radio>
								))}
						</Radio.Group>
					</Form.Item>
					<Form.Item name='status' label='状态'>
						<Radio.Group>
							{dicts &&
								dicts[DICT_NOTICE_STATUS].map((item: any) => (
									<Radio key={item.id} value={item.dictValue}>
										{item.dictLabel}
									</Radio>
								))}
						</Radio.Group>
					</Form.Item>
					<Form.Item name='noticeContent' label='公告内容'>
						<Input.TextArea placeholder='请输入公告内容' />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};
