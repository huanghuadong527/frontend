import moment from 'moment';
import { DynamicSearch, DynamicTable } from '@/components';
import {
	Button,
	Form,
	Input,
	message,
	Modal,
	Popconfirm,
	Radio,
	Space,
	Tag,
	Typography,
} from 'antd';
import { Key, useState } from 'react';
import {
	addSyNoticeData,
	deleteSyNoticeData,
	getSyNoticeDataById,
	updateSyNoticeData,
} from '@/service';
import { FORM_LAYOUT, useAntdTable } from '@/core';

const SyNotice = () => {
	const [visible, setVisible] = useState(false);
	const [editId, setEditId] = useState('');
	const [selectKeys, setSelectKeys] = useState<Key[]>([]);
	const [form] = Form.useForm();
	const { dataSource, tableProps, loading, getTableData } =
		useAntdTable('/notice/list');

	const onEdit = (id?: string) => {
		if (id) {
			getSyNoticeDataById(id).then((result) => {
				form.setFieldsValue(result.data);
				setEditId(id);
				setVisible(true);
			});
		} else {
			setVisible(true);
		}
	};

	const onCancel = () => {
		setVisible(false);
		setEditId('');
		form.resetFields();
		form.setFieldsValue({ status: 0, noticeIsTop: 0, type: 0 });
	};

	const onSave = () => {
		form.validateFields().then((values) => {
			if (editId) {
				updateSyNoticeData({
					...values,
					id: editId,
				}).then(() => {
					message.success('更新成功!');
					onCancel();
					getTableData();
				});
			} else {
				addSyNoticeData(values).then(() => {
					message.success('添加成功!');
					onCancel();
					getTableData();
				});
			}
		});
	};

	const onSelectItem = (ids: Key[]) => {
		setSelectKeys(ids);
	};

	const onDeleteData = (id: string) => {
		if (id) {
			deleteSyNoticeData(id).then(() => {
				message.success('删除成功!');
				getTableData();
			});
		} else {
			message.warning('请选择布告');
		}
	};

	const onBatchDeleteData = () => {
		if (selectKeys.length > 0) {
			onDeleteData(selectKeys.join(','));
		}
	};

	const headerRender = (
		<div className='flex-row' style={{ justifyContent: 'space-between' }}>
			<DynamicSearch />
			<Space>
				<Button type='primary' onClick={() => onEdit()}>
					新增
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
		<div className='container flex-column'>
			<DynamicTable
				size='small'
				rowKey='id'
				headerRender={headerRender}
				columns={[
					{
						title: '布告名称',
						dataIndex: 'noticeName',
						width: '20%',
						ellipsis: true,
					},
					{
						title: '布告价格',
						dataIndex: 'noticePrice',
						width: '20%',
						ellipsis: true,
					},
					{
						title: '是否置顶',
						dataIndex: 'noticeIsTop',
						width: 80,
						align: 'center',
						ellipsis: true,
						render: (value) => {
							switch (value) {
								case 1:
									return (
										<Tag color='#f50' style={{ margin: 0 }}>
											置顶
										</Tag>
									);
								default:
									return <Tag style={{ margin: 0 }}>普通</Tag>;
							}
						},
					},
					{
						title: '布告类型',
						dataIndex: 'type',
						width: '20%',
						ellipsis: true,
					},
					{
						title: '布告发布人',
						dataIndex: 'noticeIssuer',
						width: '20%',
						ellipsis: true,
					},
					{
						title: '状态',
						dataIndex: 'status',
						width: 60,
						align: 'center',
						render: (value) => {
							switch (value) {
								case 0:
									return <Typography.Text type='success'>启用</Typography.Text>;
								default:
									return <Typography.Text type='danger'>停用</Typography.Text>;
							}
						},
					},
					{
						title: '创建日期',
						dataIndex: 'createDate',
						width: '20%',
						ellipsis: true,
						render: (date) => {
							if (date) {
								return moment(new Date(date)).format('YYYY-MM-DD HH:mm:ss');
							}
							return '-';
						},
					},
					{
						title: '更新日期',
						dataIndex: 'createDate',
						width: '20%',
						ellipsis: true,
						render: (date) => {
							if (date) {
								return moment(new Date(date)).format('YYYY-MM-DD HH:mm:ss');
							}
							return '-';
						},
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
				rowSelection={{
					onChange: (keys: Key[]) => {
						onSelectItem(keys);
					},
				}}
				loading={loading}
				dataSource={dataSource}
				scroll={{ y: '100%' }}
				{...tableProps}
			/>
			<Modal
				okText='保存'
				title={editId == '' ? '新增' : '编辑'}
				open={visible}
				onOk={onSave}
				onCancel={onCancel}
			>
				<Form
					{...FORM_LAYOUT}
					form={form}
					initialValues={{ status: 0, noticeIsTop: 0, type: 0 }}
				>
					<Form.Item
						label='布告名称'
						name='noticeName'
						rules={[{ required: true }]}
					>
						<Input placeholder='请输入布告名称' />
					</Form.Item>
					<Form.Item label='布告价格' name='noticePrice'>
						<Input placeholder='请输入布告价格' />
					</Form.Item>
					<Form.Item label='是否置顶' name='noticeIsTop'>
						<Radio.Group>
							<Radio value={1}>是</Radio>
							<Radio value={0}>否</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item label='布告类型' name='type'>
						<Radio.Group>
							<Radio value={0}>出售</Radio>
							<Radio value={1}>求购</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item label='状态' name='status'>
						<Radio.Group>
							<Radio value={0}>启用</Radio>
							<Radio value={1}>停用</Radio>
						</Radio.Group>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default SyNotice;
