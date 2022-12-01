import moment from 'moment';
import {
	Button,
	DatePicker,
	Dropdown,
	Form,
	Input,
	InputNumber,
	Menu,
	MenuProps,
	message,
	Modal,
	Popconfirm,
	Radio,
	Select,
	Space,
	Typography,
} from 'antd';
import {
	addPrivateServerData,
	deletePrivateServerData,
	getDictTypeByType,
	getPrivateServerDataById,
	updatePrivateServerData,
	updatePrivateServerStatus,
} from '@/service';
import { LabeledValue } from 'antd/lib/select';
import { DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { DynamicSearch, DynamicTable } from '@/components';
import { FORM_LAYOUT, useAntdTable } from '@/core';
import { Key, useCallback, useEffect, useState } from 'react';

const PrivateServer = () => {
	const [visible, setVisible] = useState(false);
	const [editId, setEditId] = useState('');
	const [levels, setLevels] = useState<LabeledValue[]>([]);
	const [selectKeys, setSelectKeys] = useState<Key[]>([]);
	const [form] = Form.useForm();
	const { dataSource, tableProps, loading, getTableData } = useAntdTable(
		'/private/server/list'
	);

	const menuShelf = (
		<Menu
			onClick={(e) => onHandleConfirm!(e)}
			items={[
				{
					label: '上架',
					key: 'on',
				},
				{
					label: '下架',
					key: 'off',
				},
			]}
		></Menu>
	);

	const onSelectItem = (keys: Key[]) => {
		setSelectKeys(keys);
	};

	const onEdit = (id?: string) => {
		if (id) {
			setEditId(id);
			getPrivateServerDataById(id).then((result) => {
				if (result && result.data) {
					let startDate = null;
					if (result.data.startDate) {
						startDate = moment(result.data.startDate);
					}
					form.setFieldsValue({
						...result.data,
						startDate,
					});
					setVisible(true);
				}
			});
		} else {
			setVisible(true);
		}
	};

	const onSave = () => {
		form.validateFields().then((values) => {
			if (editId) {
				updatePrivateServerData({
					...values,
					id: editId,
				}).then(() => {
					onCancel();
					message.success('修改成功!');
					getTableData();
				});
			} else {
				addPrivateServerData(values).then(() => {
					onCancel();
					message.success('添加成功!');
					getTableData();
				});
			}
		});
	};

	const onCancel = () => {
		setVisible(false);
		setEditId('');
		form.resetFields();
		form.setFieldsValue({ status: 0 });
	};

	const onDeleteData = (id: string) => {
		deletePrivateServerData(id).then(() => {
			message.success('删除成功!');
			getTableData();
			setSelectKeys([]);
		});
	};

	const onBatchDeleteData = () => {
		if (selectKeys.length > 0) {
			onDeleteData(selectKeys.join(','));
		} else {
			message.warning('请选择删除私服!');
		}
	};

	const onHandleConfirm: MenuProps['onClick'] = ({ key }) => {
		Modal.confirm({
			title: `修改状态`,
			icon: <ExclamationCircleOutlined />,
			content: `请确认是否${key == 'on' ? '上架' : '下架'}私服?`,
			onOk() {
				onBatchShelfData(key == 'on' ? 0 : 1);
			},
		});
	};

	const onShelfData = (ids: Key[], status: number) => {
		if (ids.length > 0) {
			updatePrivateServerStatus({
				id: ids,
				status,
			}).then(() => {
				message.success(status == 0 ? '上架成功!' : '下架成功!');
				getTableData();
			});
		} else {
			message.warning('请选择操作的私服!');
		}
	};

	const onBatchShelfData = (status: number) => {
		onShelfData(selectKeys, status);
	};

	const getPrivateLevelData = useCallback(() => {
		getDictTypeByType('private_level').then((result) => {
			const ls = result.data.map((item: any) => {
				return {
					label: item.dictLabel,
					value: Number(item.dictValue),
				};
			});
			setLevels(ls);
			console.log(ls);
		});
	}, []);

	useEffect(() => {
		getPrivateLevelData();
	}, [getPrivateLevelData]);

	const headerRender = (
		<div className='flex-row' style={{ justifyContent: 'space-between' }}>
			<DynamicSearch />
			<Space>
				<Button type='primary' onClick={() => onEdit()}>
					新增
				</Button>
				<Dropdown overlay={menuShelf} disabled={selectKeys.length == 0}>
					<Button className='ant-btn-update' type='primary'>
						<Space>
							操作
							<DownOutlined />
						</Space>
					</Button>
				</Dropdown>
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
						title: '私服名称',
						dataIndex: 'privateName',
						width: '20%',
						ellipsis: true,
					},
					{
						title: '服务器IP',
						dataIndex: 'privateIp',
						width: '20%',
						ellipsis: true,
					},
					{
						title: '地区线路',
						dataIndex: 'privateRoute',
						width: '20%',
						ellipsis: true,
					},
					{
						title: '客服QQ',
						dataIndex: 'privateQq',
						width: '20%',
						ellipsis: true,
					},
					{
						title: '版本介绍',
						dataIndex: 'privateIntroduce',
						width: '20%',
						ellipsis: true,
					},
					{
						title: '主页地址',
						dataIndex: 'privateUrl',
						width: '20%',
						ellipsis: true,
					},
					{
						title: '推荐等级',
						dataIndex: 'privateLevel',
						width: '20%',
						ellipsis: true,
						render: (value) => {
							const item = levels.find((item) => item.value == value);
							if (item && item.label) {
								return item.label;
							}
							return '-';
						},
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
						title: '开服日期',
						dataIndex: 'startDate',
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
						width: 145,
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
										placement='bottomRight'
										title={`是否确认${record.status == 0 ? '下架' : '上架'}?`}
										onConfirm={() =>
											onShelfData([record.id], record.status == 0 ? 1 : 0)
										}
									>
										<Button size='small' type='link'>
											{record.status == 0 ? '下架' : '上架'}
										</Button>
									</Popconfirm>
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
				<Form {...FORM_LAYOUT} form={form} initialValues={{ status: 0 }}>
					<Form.Item
						label='私服名称'
						name='privateName'
						rules={[{ required: true }]}
					>
						<Input placeholder='请输入私服名称' />
					</Form.Item>
					<Form.Item
						label='开服日期'
						name='startDate'
						rules={[{ required: true }]}
					>
						<DatePicker
							showTime
							placeholder='请选择开服日期'
							format='YYYY-MM-DD HH:mm:ss'
							style={{ width: '100%' }}
						></DatePicker>
					</Form.Item>
					<Form.Item label='服务器IP' name='privateIp'>
						<Input placeholder='请输入服务器IP' />
					</Form.Item>
					<Form.Item label='地区线路' name='privateRoute'>
						<Input placeholder='请输入地区线路' />
					</Form.Item>
					<Form.Item label='客服QQ' name='privateQq'>
						<InputNumber placeholder='请输入客服QQ' style={{ width: '100%' }} />
					</Form.Item>
					<Form.Item label='版本介绍' name='privateIntroduce'>
						<Input placeholder='请输入版本介绍' />
					</Form.Item>
					<Form.Item label='主页地址' name='privateUrl'>
						<Input placeholder='请输入主页地址' />
					</Form.Item>
					<Form.Item label='推荐等级' name='privateLevel'>
						<Select placeholder='请选择推荐等级'>
							{levels.map((item) => (
								<Select.Option key={item.value} value={item.value}>
									{item.label}
								</Select.Option>
							))}
						</Select>
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

export default PrivateServer;
