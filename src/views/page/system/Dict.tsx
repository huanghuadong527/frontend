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
			message.success('删除成功!');
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
					message.success('修改成功!');
					onCancelType();
					getDictTypeData();
				});
			} else {
				addDictType(values).then(() => {
					message.success('添加成功!');
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
					message.success('修改成功!');
					onCancelData();
					getDictTypeData();
				});
			} else {
				addDictData(values).then(() => {
					message.success('添加成功!');
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
			message.success('删除成功!');
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
								新增
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
									title: '字典名称',
									dataIndex: 'dictName',
									width: '14.3%',
								},
								{
									title: '字典类型',
									dataIndex: 'dictType',
									width: '14.3%',
								},
								{
									title: '状态',
									dataIndex: 'status',
									width: '14.3%',
									render: (value) => {
										return (
											<Tag color={value == 0 ? 'success' : 'error'}>
												{value == 0 ? '启用' : '停用'}
											</Tag>
										);
									},
								},
								{
									title: '创建时间',
									dataIndex: 'createTime',
									width: '14.3%',
								},
								{
									title: '备注',
									dataIndex: 'remark',
									width: '14.3%',
								},
								{
									title: '操作',
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
													编辑
												</Button>
												<Button
													size='small'
													type='link'
													className='ant-btn-add'
													disabled={isData}
													onClick={() => onEditData(undefined, record.dictType)}
												>
													添加
												</Button>
												<Popconfirm
													title='是否确认删除?'
													placement='bottomRight'
													onConfirm={() => onDelete(record)}
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
								showTotal: (total: number) => `共${total}条`,
							}}
							loading={typeLoading}
							dataSource={typeSource}
						/>
					</div>
				</div>
			</div>
			<Modal
				okText='保存'
				title={editTypeId == '' ? '新增字典类型' : '编辑字典类型'}
				open={visibleType}
				onOk={onSaveType}
				onCancel={onCancelType}
			>
				<Form {...FORM_LAYOUT} form={formType} initialValues={{ status: 0 }}>
					<Form.Item
						label='字典名称'
						name='dictName'
						rules={[{ required: true }]}
					>
						<Input placeholder='请输入字典名称' />
					</Form.Item>
					<Form.Item
						label='字典类型'
						name='dictType'
						rules={[{ required: true }]}
					>
						<Input placeholder='请输入字典类型' />
					</Form.Item>
					<Form.Item label='字典状态' name='status'>
						<Radio.Group>
							<Radio value={0}>启用</Radio>
							<Radio value={1}>停用</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item label='备注' name='remark'>
						<Input.TextArea placeholder='请输入备注' />
					</Form.Item>
				</Form>
			</Modal>
			<Modal
				okText='保存'
				title={editDataId == '' ? '新增字典信息' : '编辑字典信息'}
				open={visibleData}
				onOk={onSaveData}
				onCancel={onCancelData}
			>
				<Form {...FORM_LAYOUT} form={formData} initialValues={{ status: 0 }}>
					<Form.Item
						label='字典类型'
						name='dictType'
						rules={[{ required: true }]}
					>
						<Select
							placeholder='请选择字典类型'
							options={dictTypeOpts}
						></Select>
					</Form.Item>
					<Form.Item
						label='字典标签'
						name='dictLabel'
						rules={[{ required: true }]}
					>
						<Input placeholder='请输入字典标签' />
					</Form.Item>
					<Form.Item
						label='字典键值'
						name='dictValue'
						rules={[{ required: true }]}
					>
						<Input placeholder='请输入字典键值' />
					</Form.Item>
					<Form.Item
						label='字典序号'
						name='dictSort'
						rules={[{ required: true }]}
					>
						<InputNumber
							placeholder='请输入字典序号'
							style={{ width: '100%' }}
						/>
					</Form.Item>
					<Form.Item label='字典状态' name='status'>
						<Radio.Group>
							<Radio value={0}>启用</Radio>
							<Radio value={1}>停用</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item label='备注' name='remark'>
						<Input.TextArea placeholder='请输入备注' />
					</Form.Item>
				</Form>
			</Modal>
		</>
	);
};

export default DictComponent;
