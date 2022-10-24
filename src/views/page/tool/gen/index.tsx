import { DynamicSearch, DynamicTable } from '@/components';
import { exportFile, useAntdTable } from '@/core';
import {
	batchGenCode,
	deleteGenTable,
	getDBData,
	importTableSave,
	synchGenTable,
} from '@/service';
import { Button, message, Modal, Popconfirm, Space, Table } from 'antd';
import { Key, useCallback, useEffect, useState } from 'react';
import { CodePreview } from './CodePreview';
import { EditTable } from './EditTable';

const Gen = () => {
	const [importVisible, setImportVisble] = useState(false);
	const [visible, setVisible] = useState(false);
	const [editVisible, setEditVisible] = useState(false);
	const [total, setTotal] = useState(0);
	const [pageNo, setPageNo] = useState(1);
	const [editId, setEditId] = useState('');
	const [previewId, setPreviewId] = useState('');
	const [selectKeys, setSelectKeys] = useState<Key[]>([]);
	const [importColumns, setImportColumns] = useState([]);
	const [selectImportKeys, setSelectImportKeys] = useState<Key[]>([]);
	const { dataSource, tableProps, loading, getTableData } =
		useAntdTable('/tool/gen/list');

	const onSelectChange = (keys: Key[]) => {
		setSelectKeys(keys);
	};

	const onPreview = (id: string) => {
		if (id) {
			setPreviewId(id);
			setVisible(true);
		}
	};

	const onPreviewCancel = () => {
		setPreviewId('');
		setVisible(false);
	};

	const onEdit = (id: string) => {
		if (id) {
			setEditId(id);
			setEditVisible(true);
		}
	};

	const onEditCancel = () => {
		setEditId('');
		setEditVisible(false);
	};

	const onDelete = (id: string) => {
		if (id) {
			deleteGenTable(id).then((result) => {
				if (result.code == 200) {
					getTableData();
					message.success('删除成功');
					setSelectKeys([]);
				}
			});
		}
	};

	const onBatchDelete = () => {
		if (selectKeys.length > 0) {
			onDelete(selectKeys.join(','));
		} else {
			message.warn('请选择');
		}
	};

	const onSynch = (id: string) => {
		Modal.confirm({
			title: '系统提示',
			content: `请确认是否同步[${id}]表结构?`,
			onOk() {
				synchGenTable(id).then((result) => {
					if (result.code == 200) {
						getTableData();
						message.success('同步成功');
						setSelectKeys([]);
					}
				});
			},
		});
	};

	const onGenerate = (tables: string) => {
		console.log(tables)
		Modal.confirm({
			title: '系统提示',
			content: `请确认是否生成代码?`,
			onOk() {
				batchGenCode({
					tables,
				}).then((result) => {
					setSelectKeys([]);
					if (result instanceof Blob) {
						exportFile(result, `${tables}.zip`);
					}
				});
			},
		});
	};

	const onBatchGenerate = () => {
		if (selectKeys.length > 0) {
			onGenerate(
				dataSource
					.filter(
						(item: any) => selectKeys.findIndex((id) => id == item.id) != -1
					)
					.map((item: any) => item.tableName)
					.join(',')
			);
		} else {
			message.warn('请选择');
		}
	};

	const onImportSave = () => {
		if (selectImportKeys.length > 0) {
			importTableSave({
				tables: selectImportKeys.join(','),
			}).then((result) => {
				if (result.code == 200) {
					onImportCancel();
					getTableData();
					message.success('导入成功');
				}
			});
		} else {
			message.warn('请选择要导入的表');
		}
	};

	const onImportCancel = () => {
		setImportVisble(false);
		setPageNo(1);
	};

	const onSelectImportChange = (keys: Key[]) => {
		setSelectImportKeys(keys);
	};

	const onPaginationChange = (current: number) => {
		setPageNo(current);
	};

	const getDBList = useCallback(() => {
		getDBData().then((result) => {
			if (result.code == 200) {
				setImportColumns(result.data.data);
				setTotal(result.data.total);
			}
		});
	}, []);

	useEffect(() => {
		getDBList();
	}, []);

	const headerRender = (
		<div className='flex-row' style={{ justifyContent: 'space-between' }}>
			<DynamicSearch />
			<Space>
				<Button
					type='primary'
					disabled={selectKeys.length == 0}
					onClick={onBatchGenerate}
				>
					生成
				</Button>
				<Button
					className='ant-btn-export'
					type='primary'
					onClick={() => {
						setImportVisble(true);
					}}
				>
					导入
				</Button>
				<Popconfirm
					title='是否确认删除?'
					placement='bottomRight'
					onConfirm={onBatchDelete}
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
				rowSelection={{
					selectedRowKeys: selectKeys,
					onChange: onSelectChange,
				}}
				columns={[
					{
						title: '表名称',
						dataIndex: 'tableName',
						width: '16.7%',
						ellipsis: true,
					},
					{
						title: '表描述',
						dataIndex: 'tableComment',
						width: '16.7%',
						ellipsis: true,
					},
					{
						title: '实体',
						dataIndex: 'className',
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
						title: '更新时间',
						dataIndex: 'updateTime',
						width: '16.7%',
						ellipsis: true,
						render: (value) => {
							if (value) {
								return value;
							}
							return '--';
						},
					},
					{
						title: '操作',
						dataIndex: 'handle',
						width: 300,
						fixed: 'right',
						render: (value, record: any) => {
							return (
								<Space>
									<Button
										size='small'
										type='link'
										className='ant-btn-export'
										onClick={() => onPreview(record.id)}
									>
										预览
									</Button>
									<Button
										size='small'
										type='link'
										onClick={() => onEdit(record.id)}
									>
										编辑
									</Button>
									<Button
										size='small'
										type='link'
										className='ant-btn-update'
										onClick={() => onSynch(record.tableName)}
									>
										同步
									</Button>
									<Button
										size='small'
										type='link'
										className='ant-btn-add'
										onClick={() => onGenerate(record.tableName)}
									>
										生成代码
									</Button>
									<Popconfirm
										title='是否确认删除?'
										placement='bottomRight'
										onConfirm={() => onDelete(record.id)}
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
				{...tableProps}
			/>
			<Modal
				okText='保存'
				title='导入表'
				width={900}
				open={importVisible}
				onOk={onImportSave}
				onCancel={onImportCancel}
			>
				<div className='mb-md'>
					<DynamicSearch />
				</div>
				<Table
					size='small'
					rowKey='tableName'
					scroll={{ y: 320 }}
					pagination={{
						size: 'default',
						showQuickJumper: true,
						showTotal: (total: number) => `共${total}条`,
						current: pageNo,
						total,
						onChange: onPaginationChange,
					}}
					rowSelection={{
						selectedRowKeys: selectImportKeys,
						onChange: onSelectImportChange,
					}}
					columns={[
						{
							title: '表名称',
							dataIndex: 'tableName',
							width: '25%',
						},
						{
							title: '表描述',
							dataIndex: 'tableComment',
							width: '25%',
						},
						{
							title: '创建时间',
							dataIndex: 'createTime',
							width: '25%',
						},
						{
							title: '更新时间',
							dataIndex: 'updateTime',
							width: '25%',
						},
					]}
					dataSource={importColumns}
				/>
			</Modal>
			<CodePreview
				title='代码预览'
				width={900}
				footer={false}
				open={visible}
				id={previewId}
				onCancel={onPreviewCancel}
			/>
			<EditTable
				width={900}
				id={editId}
				open={editVisible}
				onCancel={onEditCancel}
			/>
		</div>
	);
};

export default Gen;
