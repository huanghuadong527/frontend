import { FORM_LAYOUT, useDictionary } from '@/core';
import { addNoticeData, deleteNoticeData, getNoticeData, getNoticeDataById, updateNoticeData } from '@/service';
import {
	Button,
	Form,
	Input,
	Modal,
	Popconfirm,
	Radio,
	Select,
	Space,
	Table,
	Tag,
} from 'antd';
import { message } from '@/redux';
import { Key, useCallback, useEffect, useState } from 'react';

const dictTypes = ['sys_notice_status', 'sys_notice_type'];

/**
 * 公告 信息操作处理
 */
const Notice = () => {
	const [visible, setVisible] = useState(false);
	const [editId, setEditId] = useState('');
	const [selectKeys, setSelectKeys] = useState<Key[]>([]);
	const { dictionary, getDictLabel } = useDictionary(dictTypes);
	const [dataSource, setDataSource] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [pageNum, setPageNum] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [total, setTotal] = useState(0);
	const [form] = Form.useForm();

	const getData = useCallback(
		(params: object = {}) => {
			setLoading(true);
			getNoticeData({ pageNum, pageSize, ...params }).then((result) => {
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
			getNoticeDataById(id).then((result) => {
				if (result.code == 200) {
					form.setFieldsValue(result.data);
					setVisible(true);
				}
			});
		} else {
			setVisible(true);
		}
	};

	const onSave = () => {
		form.validateFields();
		if (form.isFieldsTouched()) {
			if (editId) {
				updateNoticeData({
					...form.getFieldsValue(),
					id: editId,
				}).then(() => {
					onCancel();
					getData();
					message.success('修改成功!');
				});
			} else {
				addNoticeData(form.getFieldsValue()).then((result) => {
					if (result.code == 200) {
						onCancel();
						getData();
						message.success('添加成功!');
					}
				});
			}
		}
	};

	const onCancel = () => {
		setVisible(false);
		setEditId('');
		form.resetFields();
		form.setFieldsValue({ status: 0 });
	};

	const onDeleteData = (id: string) => {
		if (id) {
			deleteNoticeData(id).then((result) => {
				if (result.code == 200) {
					message.success('删除成功!');
					getData();
				}
			});
		}
	};

	const onBatchDeleteData = () => {
		if (selectKeys.length > 0) {
			onDeleteData(selectKeys.join(','));
			setSelectKeys([]);
		} else {
			message.warning('请选择用户!');
		}
	};

	const onSelectData = (keys: Key[]) => {
		setSelectKeys(keys);
	};

	const headerRender = (
		<div className='flex justify-between mb-4'>
			<Space>
				<Button type='primary' onClick={() => onEdit()}>
					新增
				</Button>
				<Button className='ant-btn-export' type='primary'>
					导出
				</Button>
				<Popconfirm
					title='是否确认删除?'
					placement='bottomRight'
					onConfirm={() => onBatchDeleteData()}
				>
					<Button danger type='primary' disabled={selectKeys.length == 0}>
						批量删除
					</Button>
				</Popconfirm>
			</Space>
		</div>
	);

	return (
		<div className='w-full h-full flex flex-col'>
			{headerRender}
			<Table
				rootClassName='table-fill'
				size='small'
				rowKey='id'
				rowSelection={{
					onChange: (keys: Key[]) => {
						onSelectData(keys);
					},
				}}
				columns={[
					{
						title: '公告标题',
						dataIndex: 'noticeTitle',
						fixed: 'left',
						width: '16.7%',
						ellipsis: true,
					},
					{
						title: '公告类型',
						dataIndex: 'noticeType',
						width: '16.7%',
						ellipsis: true,
						render: (value) => {
							return (
								<Tag color={value == '1' ? 'success' : 'processing'}>
									{getDictLabel('sys_notice_type', value)}
								</Tag>
							);
						},
					},
					{
						title: '状态',
						dataIndex: 'status',
						width: '16.7%',
						ellipsis: true,
						render: (value) => {
							return (
								<Tag color={value == '0' ? 'success' : 'error'}>
									{getDictLabel('sys_notice_status', value)}
								</Tag>
							);
						},
					},
					{
						title: '创建者',
						dataIndex: 'createBy',
						width: '16.7%',
						ellipsis: true,
					},
					{
						title: '创建时间',
						dataIndex: 'createTime',
						width: '16.7%',
						ellipsis: true,
					},
					{
						title: '操作',
						dataIndex: 'handle',
						width: 100,
						fixed: 'right',
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
										onConfirm={() => onDeleteData(record.id)}
									>
										<Button danger size='small' type='link'>
											删除
										</Button>
									</Popconfirm>
								</Space>
							);
						},
					},
				]}
				loading={loading}
				dataSource={dataSource}
				scroll={{ y: '100%' }}
				pagination={{ current: pageNum, pageSize, total, showSizeChanger: true, showQuickJumper: true, showTotal: (t) => `共 ${t} 条`, onChange: (page, size) => { setPageNum(page); setPageSize(size); } }}
			/>
			<Modal
				okText='保存'
				title={editId == '' ? '新增' : '编辑'}
				open={visible}
				onOk={onSave}
				onCancel={onCancel}
			>
				<Form {...FORM_LAYOUT} form={form} initialValues={{ status: 0 }}>
					<Form.Item
						label='公告标题'
						name='noticeTitle'
						rules={[{ required: true }]}
					>
						<Input placeholder='请输入公告标题' />
					</Form.Item>
					<Form.Item
						label='公告类型'
						name='noticeType'
						rules={[{ required: true }]}
					>
						<Select
							options={dictionary['sys_notice_type']}
							placeholder='请选择公告类型'
						/>
					</Form.Item>
					<Form.Item label='公告状态' name='status'>
						<Radio.Group options={dictionary['sys_notice_status']} />
					</Form.Item>
					<Form.Item label='公告内容' name='noticeContent'>
						<Input.TextArea placeholder='请输入备注' />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export const Component = Notice;
