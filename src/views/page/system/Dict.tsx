import React, { Key, useEffect, useState } from 'react';
import {
	Button,
	Form,
	Input,
	InputNumber,
	message,
	Modal,
	Pagination,
	Popconfirm,
	Radio,
	Select,
	Space,
	Table,
	Tag,
} from 'antd';
import { DynamicSearch } from '@/components';
import {
	addDictType,
	getDictTypeById,
	getDictTypes,
	updateDictType,
	deleteDictType,
	updateDictData,
	addDictData,
	deleteDictData,
	getDictDataById,
	getDictDataByType,
} from '@/service';
import {
	FileOutlined,
	FolderOpenOutlined,
	FolderOutlined,
} from '@ant-design/icons';
import { clone } from 'xe-utils';
import { FORM_LAYOUT } from '@/core';
import { DefaultOptionType } from 'antd/lib/select';

const DictComponent = () => {
	const [pageNum, setPageNum] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [total, setTotal] = useState(0);
	const [typeLoading, setTypeLoading] = useState(false);
	const [visibleType, setVisibleType] = useState(false);
	const [visibleData, setVisibleData] = useState(false);
	const [editTypeId, setEditTypeId] = useState('');
	const [editDataId, setEditDataId] = useState('');
	const [params, setParams] = useState({});
	const [typeSource, setTypeSource] = useState<any[]>([]);
	const [expandedRowKeys, setExpandedRowKey] = useState<readonly Key[]>([]);
	const [dictTypeOpts, setDictTypeOpts] = useState<DefaultOptionType[]>([]);
	const [formType] = Form.useForm();
	const [formData] = Form.useForm();

	const onPageChange = (index: number, size: number) => {
		setPageNum(index);
		setPageSize(size);
	};

	const onSearchChange = (values: object) => {
		setParams(values);
	};

	const onExpandDictType = (expanded: boolean, record: any) => {
		if (expanded) {
			if (!('children' in record)) {
				const dictTypes = clone(typeSource, true);
				getDictDataByType({
					pageNum: 1,
					pageSize: 10,
					dictType: record.dictType,
				}).then((result) => {
					dictTypes.forEach((item) => {
						if (item.dictType == record.dictType) {
							item.children = result.data.data.map((item: any) => {
								return {
									...item,
									key: `data-${item.id}`,
									dictName: item.dictLabel,
									dictType: item.dictValue,
								};
							});
							setTypeSource(dictTypes);
						}
					});
				});
			}
		}
	};

	const onEdit = (record: any) => {
		if (!record.id) return;
		if ('dictLabel' in record && 'dictValue' in record) {
			onEditData(record.id);
		} else {
			onEditType(record.id);
		}
	};

	const onEditType = (id?: string) => {
		if (id) {
			getDictTypeById(id).then((result) => {
				setEditTypeId(id);
				setVisibleType(true);
				formType.setFieldsValue(result.data);
			});
		} else {
			setVisibleType(true);
		}
	};

	const onEditData = (id?: string, type?: string) => {
		if (id) {
			getDictDataById(id).then((result) => {
				setEditDataId(id);
				formData.setFieldsValue(result.data);
				setVisibleData(true);
			});
		} else {
			if (type) {
				formData.setFieldsValue({ dictType: type });
				setVisibleData(true);
			}
		}
	};

	const onDelete = (record: any) => {
		if ('dictLabel' in record && 'dictValue' in record) {
			onDeleteData(record.id);
		} else {
			onDeleteType(record.id);
		}
	};

	const onDeleteType = (id: string) => {
		deleteDictType(id).then(() => {
			message.success('????????????!');
			getDictTypeData();
		});
	};

	const onSaveType = () => {
		formType.validateFields().then((values) => {
			if (editTypeId) {
				updateDictType({
					...values,
					id: editTypeId,
				}).then(() => {
					message.success('????????????!');
					onCancelType();
					getDictTypeData();
				});
			} else {
				addDictType(values).then(() => {
					message.success('????????????!');
					onCancelType();
					getDictTypeData();
				});
			}
		});
	};

	const onCancelType = () => {
		setEditTypeId('');
		setVisibleType(false);
		formType.resetFields();
	};

	const onSaveData = () => {
		formData.validateFields().then((values) => {
			if (editDataId) {
				updateDictData({
					...values,
					id: editDataId,
				}).then(() => {
					message.success('????????????!');
					onCancelData();
					getDictTypeData();
				});
			} else {
				addDictData(values).then(() => {
					message.success('????????????!');
					onCancelData();
					getDictTypeData();
				});
			}
		});
	};

	const onCancelData = () => {
		setEditDataId('');
		setVisibleData(false);
		formData.resetFields();
	};

	const onDeleteData = (id: string) => {
		deleteDictData(id).then(() => {
			message.success('????????????!');
			getDictTypeData();
		});
	};

	const getDictTypeData = () => {
		setTypeLoading(true);
		setTypeSource([]);
		setDictTypeOpts([]);
		setExpandedRowKey([]);
		getDictTypes({
			pageNum,
			pageSize,
			...params,
		}).then((result) => {
			if (result.data) {
				setTypeLoading(false);
				setTotal(result.data.total);
				setTypeSource(
					clone(result.data.data, true).map((item: any) => {
						return {
							...item,
							key: `type-${item.id}`,
						};
					})
				);
				setDictTypeOpts(
					result.data.data.map((item: any) => {
						return {
							value: item.dictType,
							label: item.dictName,
						};
					})
				);
			}
		});
	};

	useEffect(() => {
		getDictTypeData();
	}, [pageNum, pageSize, params]);

	return (
		<>
			<div className='container flex-column'>
				<div className='dynamic-table'>
					<div className='dynamic-table--header'>
						<div
							className='flex-row'
							style={{ justifyContent: 'space-between' }}
						>
							<DynamicSearch />
							<Button type='primary' onClick={() => onEditType()}>
								??????
							</Button>
						</div>
					</div>
					<div className='dynamic-table--content'>
						<Table
							size='small'
							rowKey='key'
							scroll={{ x: '100%', y: '100%' }}
							columns={[
								{
									title: '????????????',
									dataIndex: 'dictName',
									width: '14.3%',
								},
								{
									title: '????????????',
									dataIndex: 'dictType',
									width: '14.3%',
								},
								{
									title: '??????',
									dataIndex: 'status',
									width: '14.3%',
									render: (value) => {
										return (
											<Tag color={value == 0 ? 'success' : 'error'}>
												{value == 0 ? '??????' : '??????'}
											</Tag>
										);
									},
								},
								{
									title: '????????????',
									dataIndex: 'createTime',
									width: '14.3%',
								},
								{
									title: '??????',
									dataIndex: 'remark',
									width: '14.3%',
								},
								{
									title: '??????',
									dataIndex: 'handle',
									width: '120px',
									render: (value, record: any) => {
										const isData =
											'dictValue' in record && 'dictLabel' in record;
										return (
											<Space>
												<Button
													size='small'
													type='link'
													onClick={() => onEdit(record)}
												>
													??????
												</Button>
												<Button
													size='small'
													type='link'
													className='ant-btn-add'
													disabled={isData}
													onClick={() => onEditData(undefined, record.dictType)}
												>
													??????
												</Button>
												<Popconfirm
													title='???????????????????'
													placement='bottomRight'
													onConfirm={() => onDelete(record)}
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
							expandable={{
								expandedRowKeys,
								expandIcon: ({ expanded, onExpand, record }) => {
									if ('dictLabel' in record && 'dictValue' in record) {
										return (
											<FileOutlined className='dynamic-table--expand' />
										);
									}
									return !expanded ? (
										<FolderOutlined
											className='dynamic-table--expand'
											onClick={(e) => onExpand(record, e)}
										/>
									) : (
										<FolderOpenOutlined
											className='dynamic-table--expand'
											onClick={(e) => onExpand(record, e)}
										/>
									);
								},
								onExpand: onExpandDictType,
								onExpandedRowsChange: (keys: readonly Key[]) => {
									setExpandedRowKey(keys);
								},
							}}
							pagination={{
								current: pageNum,
								pageSize: pageSize,
								total,
								size: 'default',
								showSizeChanger: true,
								showQuickJumper: true,
								onChange: onPageChange,
								showTotal: (total: number) => `???${total}???`,
							}}
							loading={typeLoading}
							dataSource={typeSource}
						/>
					</div>
				</div>
			</div>
			<Modal
				okText='??????'
				title={editTypeId == '' ? '??????????????????' : '??????????????????'}
				open={visibleType}
				onOk={onSaveType}
				onCancel={onCancelType}
			>
				<Form {...FORM_LAYOUT} form={formType} initialValues={{ status: 0 }}>
					<Form.Item
						label='????????????'
						name='dictName'
						rules={[{ required: true }]}
					>
						<Input placeholder='?????????????????????' />
					</Form.Item>
					<Form.Item
						label='????????????'
						name='dictType'
						rules={[{ required: true }]}
					>
						<Input placeholder='?????????????????????' />
					</Form.Item>
					<Form.Item label='????????????' name='status'>
						<Radio.Group>
							<Radio value={0}>??????</Radio>
							<Radio value={1}>??????</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item label='??????' name='remark'>
						<Input.TextArea placeholder='???????????????' />
					</Form.Item>
				</Form>
			</Modal>
			<Modal
				okText='??????'
				title={editDataId == '' ? '??????????????????' : '??????????????????'}
				open={visibleData}
				onOk={onSaveData}
				onCancel={onCancelData}
			>
				<Form {...FORM_LAYOUT} form={formData} initialValues={{ status: 0 }}>
					<Form.Item
						label='????????????'
						name='dictType'
						rules={[{ required: true }]}
					>
						<Select
							placeholder='?????????????????????'
							options={dictTypeOpts}
						></Select>
					</Form.Item>
					<Form.Item
						label='????????????'
						name='dictLabel'
						rules={[{ required: true }]}
					>
						<Input placeholder='?????????????????????' />
					</Form.Item>
					<Form.Item
						label='????????????'
						name='dictValue'
						rules={[{ required: true }]}
					>
						<Input placeholder='?????????????????????' />
					</Form.Item>
					<Form.Item
						label='????????????'
						name='dictSort'
						rules={[{ required: true }]}
					>
						<InputNumber
							placeholder='?????????????????????'
							style={{ width: '100%' }}
						/>
					</Form.Item>
					<Form.Item label='????????????' name='status'>
						<Radio.Group>
							<Radio value={0}>??????</Radio>
							<Radio value={1}>??????</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item label='??????' name='remark'>
						<Input.TextArea placeholder='???????????????' />
					</Form.Item>
				</Form>
			</Modal>
		</>
	);
};

export default DictComponent;
