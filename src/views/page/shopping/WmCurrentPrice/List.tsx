import moment from 'moment';
import { DynamicTable } from '@/components';
import { FORM_LAYOUT, useAntdTable } from '@/core';
import {
	Button,
	DatePicker,
	Form,
	InputNumber,
	message,
	Modal,
	Popconfirm,
	Select,
	Space,
} from 'antd';
import { Key, useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
	addWmCurrentPriceData,
	deleteWmCurrentPriceData,
	getGameServerDataByType,
	getWmCurrentPriceDataById,
	getWmCurrentPriceServerByDate,
	getWmCurrentPriceShare,
	getWmCurrentPriceTypeData,
	updateWmCurrentPriceData,
} from '@/service';
import { SearchOutlined, SyncOutlined } from '@ant-design/icons';

interface SelectOptionInterface {
	id: string;
	name: string;
}

const List = () => {
	const params = useParams();
	const navigate = useNavigate();
	const [visible, setVisible] = useState(false);
	const [editId, setEditId] = useState<null | string>();
	const [selectKeys, setSelectKeys] = useState<Key[]>([]);
	const [existServerId, setExistServerId] = useState<string[]>([]);
	const [typeId, setTypeId] = useState<string | null>(null);
	const [types, setTypes] = useState<SelectOptionInterface[]>([]);
	const [servers, setServers] = useState<SelectOptionInterface[]>([]);
	const [form] = Form.useForm();
	const [formSearch] = Form.useForm();
	const { dataSource, tableProps, loading, getTableData } = useAntdTable(
		'/wm/current/price/list',
		{ typeId: params.id }
	);
	const dateValue = Form.useWatch('date', form);

	const getCurrentPriceTypeData = useCallback(() => {
		getWmCurrentPriceTypeData().then((result) => {
			if (result.code == 200) {
				setTypes(result.data);
			}
		});
	}, []);

	const getGameServerData = useCallback(() => {
		getGameServerDataByType(2).then((result) => {
			if (result.code == 200) {
				setServers(result.data);
			}
		});
	}, []);

	const onEdit = (id?: string) => {
		if (id) {
			getWmCurrentPriceDataById(id).then((result) => {
				if (result.code == 200) {
					setEditId(id);
					setVisible(true);
					if (result.data.date) {
						result.data.date = moment(result.data.date);
					}
					form.setFieldsValue(result.data);
				}
			});
		} else {
			setVisible(true);
		}
	};

	const onSave = () => {
		form.validateFields().then((values) => {
			if (editId) {
				updateWmCurrentPriceData({
					...values,
					id: editId,
					date: moment(values.date).format('YYYY-MM-DD'),
				}).then((result) => {
					if (result.code == 200) {
						getTableData();
						message.success('修改成功');
						onCancel();
					}
				});
			} else {
				addWmCurrentPriceData({
					...values,
					date: moment(values.date).format('YYYY-MM-DD'),
				}).then((result) => {
					if (result.code == 200) {
						getTableData();
						message.success('添加成功');
						onCancel();
					}
				});
			}
		});
	};

	const onCancel = () => {
		setVisible(false);
		setEditId(null);
		form.resetFields();
		form.setFieldsValue({ typeId });
	};

	const onBack = () => {
		navigate('/index/wm-current-price');
	};

	const onDeleteData = (id: string) => {
		deleteWmCurrentPriceData(id).then((result) => {
			if (result.code == 200) {
				getTableData();
				message.success('删除成功');
			}
		});
	};

	const onBatchDeleteData = () => {
		if (selectKeys.length > 0) {
			onDeleteData(selectKeys.join(','));
		}
	};

	const onSelectItem = (keys: Key[]) => {
		setSelectKeys(keys);
	};

	const onChangeDate = (e: moment.Moment | null) => {
		getWmCurrentPriceServerByDate({
			typeId,
			date: moment(e).format('YYYY-MM-DD'),
		}).then((result) => {
			if (result.code == 200) {
				setExistServerId(result.data);
			}
		});
	};

	const onSearch = () => {
		const fields = formSearch.getFieldsValue();
		if (fields.date) {
			fields.date = moment(fields.date).format('YYYY-MM-DD');
		}
		getTableData(fields);
	};

	const onReset = () => {
		formSearch.resetFields();
		getTableData();
	};

	useEffect(() => {
		getCurrentPriceTypeData();
		getGameServerData();
	}, [getCurrentPriceTypeData, getGameServerData]);

	useEffect(() => {
		if (params && params.id) {
			setTypeId(params.id);
		}
	}, [params]);

	const headerRender = (
		<div className='flex-row' style={{ justifyContent: 'space-between' }}>
			<Form layout='inline' form={formSearch}>
				<Form.Item label='区服' name='serverId'>
					<Select placeholder='请选择区服' style={{ width: '180px' }}>
						{servers.map((item) => (
							<Select.Option key={item.id} value={item.id}>
								{item.name}
							</Select.Option>
						))}
					</Select>
				</Form.Item>
				<Form.Item label='时间' name='date'>
					<DatePicker
						placeholder='请选择日期'
						format='YYYY-MM-DD'
						style={{ width: '180px' }}
					/>
				</Form.Item>
				<Form.Item>
					<Space>
						<Button type='primary' icon={<SearchOutlined />} onClick={onSearch}>
							搜索
						</Button>
						<Button icon={<SyncOutlined />} onClick={onReset}>
							重置
						</Button>
					</Space>
				</Form.Item>
			</Form>
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
				<Button type='default' onClick={() => onBack()}>
					返回
				</Button>
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
						title: '类型',
						dataIndex: 'name',
						width: '20%',
						ellipsis: true,
					},
					{
						title: '服务器',
						dataIndex: 'serverName',
						width: '20%',
						ellipsis: true,
					},
					{
						title: '价格',
						dataIndex: 'price',
						width: '20%',
						ellipsis: true,
					},
					{
						title: '日期',
						dataIndex: 'date',
						width: '20%',
						ellipsis: true,
						render: (date) => {
							if (date) {
								return moment(new Date(date)).format('YYYY-MM-DD');
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
				<Form {...FORM_LAYOUT} form={form} initialValues={{ typeId }}>
					<Form.Item
						label='时价类型'
						name='typeId'
						rules={[{ required: true }]}
					>
						<Select disabled placeholder='请选择时价类型'>
							{types.map((item) => (
								<Select.Option key={item.id} value={item.id}>
									{item.name}
								</Select.Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item label='日期' name='date' rules={[{ required: true }]}>
						<DatePicker
							placeholder='请选择日期'
							format='YYYY-MM-DD'
							style={{ width: '100%' }}
							onChange={(e) => onChangeDate(e)}
						/>
					</Form.Item>
					<Form.Item label='区服' name='serverId' rules={[{ required: true }]}>
						<Select
							placeholder='请选择区服'
							mode={editId ? undefined : 'multiple'}
							disabled={!dateValue}
						>
							{servers.map((item) => (
								<Select.Option
									key={item.id}
									value={item.id}
									disabled={existServerId.findIndex((v) => v == item.id) != -1}
								>
									{item.name}
								</Select.Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item label='价格' name='price' rules={[{ required: true }]}>
						<InputNumber
							step='0.01'
							placeholder='请输入价格'
							style={{ width: '100%' }}
						/>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default List;
