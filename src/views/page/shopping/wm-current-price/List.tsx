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
						message.success('????????????');
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
						message.success('????????????');
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
				message.success('????????????');
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
				<Form.Item label='??????' name='serverId'>
					<Select placeholder='???????????????' style={{ width: '180px' }}>
						{servers.map((item) => (
							<Select.Option key={item.id} value={item.id}>
								{item.name}
							</Select.Option>
						))}
					</Select>
				</Form.Item>
				<Form.Item label='??????' name='date'>
					<DatePicker
						placeholder='???????????????'
						format='YYYY-MM-DD'
						style={{ width: '180px' }}
					/>
				</Form.Item>
				<Form.Item>
					<Space>
						<Button type='primary' icon={<SearchOutlined />} onClick={onSearch}>
							??????
						</Button>
						<Button icon={<SyncOutlined />} onClick={onReset}>
							??????
						</Button>
					</Space>
				</Form.Item>
			</Form>
			<Space>
				<Button type='primary' onClick={() => onEdit()}>
					??????
				</Button>
				<Popconfirm
					title='???????????????????'
					placement='bottomRight'
					onConfirm={() => onBatchDeleteData()}
				>
					<Button danger type='primary' disabled={selectKeys.length == 0}>
						????????????
					</Button>
				</Popconfirm>
				<Button type='default' onClick={() => onBack()}>
					??????
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
						title: '??????',
						dataIndex: 'name',
						width: '20%',
						ellipsis: true,
					},
					{
						title: '?????????',
						dataIndex: 'serverName',
						width: '20%',
						ellipsis: true,
					},
					{
						title: '??????',
						dataIndex: 'price',
						width: '20%',
						ellipsis: true,
					},
					{
						title: '??????',
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
						title: '??????',
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
										??????
									</Button>
									<Popconfirm
										title='???????????????????'
										placement='bottomRight'
										onConfirm={() => onDeleteData(record.id)}
									>
										<Button danger size='small' type='link'>
											??????
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
				okText='??????'
				title={editId == '' ? '??????' : '??????'}
				open={visible}
				onOk={onSave}
				onCancel={onCancel}
			>
				<Form {...FORM_LAYOUT} form={form} initialValues={{ typeId }}>
					<Form.Item
						label='????????????'
						name='typeId'
						rules={[{ required: true }]}
					>
						<Select disabled placeholder='?????????????????????'>
							{types.map((item) => (
								<Select.Option key={item.id} value={item.id}>
									{item.name}
								</Select.Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item label='??????' name='date' rules={[{ required: true }]}>
						<DatePicker
							placeholder='???????????????'
							format='YYYY-MM-DD'
							style={{ width: '100%' }}
							onChange={(e) => onChangeDate(e)}
						/>
					</Form.Item>
					<Form.Item label='??????' name='serverId' rules={[{ required: true }]}>
						<Select
							placeholder='???????????????'
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
					<Form.Item label='??????' name='price' rules={[{ required: true }]}>
						<InputNumber
							step='0.01'
							placeholder='???????????????'
							style={{ width: '100%' }}
						/>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default List;
