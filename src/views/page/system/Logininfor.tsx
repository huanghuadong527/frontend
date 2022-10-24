import { DynamicSearch, DynamicTable } from '@/components';
import { exportFile, useAntdTable } from '@/core';
import { cleanLogininforData, deleteLogininforData, exportLogininforData } from '@/service';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, message, Modal, Popconfirm, Space } from 'antd';
import { Key, useState } from 'react';

const Logininfor = () => {
	const [selectKeys, setSelectKeys] = useState<Key[]>([]);
	const { dataSource, tableProps, loading, getTableData } = useAntdTable(
		'/monitor/logininfor/list'
	);

	const onDeleteData = (id: string) => {
		if (id) {
			deleteLogininforData(id).then((result) => {
				if (result.code == 200) {
					message.success('删除成功!');
					getTableData();
				}
			});
		}
	};

	const onCleanData = () => {
		cleanLogininforData().then((result) => {
			if (result.code == 200) {
				message.success('清空成功!');
				setSelectKeys([]);
				getTableData();
			}
		});
	};

	const onExport = () => {
		Modal.confirm({
			icon: <ExclamationCircleOutlined />,
			content: '请确认是否导出数据',
			onOk() {
				exportLogininforData({}).then(result => {
					if (result instanceof Blob) {
						exportFile(result, '登录日志.xlsx');
					}
				});
			},
		});
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
		<div className='flex-row' style={{ justifyContent: 'space-between' }}>
			<DynamicSearch />
			<Space>
				<Button className='ant-btn-export' type='primary' onClick={onExport}>
					导出
				</Button>
				<Popconfirm
					title='是否确认清空所有登录日志数据项?'
					placement='bottomRight'
					onConfirm={() => onCleanData()}
				>
					<Button danger type='primary'>
						清空
					</Button>
				</Popconfirm>
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
				rowSelection={{
					onChange: (keys: Key[]) => {
						onSelectData(keys);
					},
				}}
				headerRender={headerRender}
				columns={[
					{
						title: '访问编号',
						dataIndex: 'id',
						fixed: 'left',
						width: '16.7%',
						ellipsis: true,
					},
					{
						title: '用户名称',
						dataIndex: 'userName',
						width: '16.7%',
						ellipsis: true,
					},
					{
						title: '登录地址',
						dataIndex: 'ipaddr',
						width: '16.7%',
						ellipsis: true,
					},
					{
						title: '登录地点',
						dataIndex: 'loginLocation',
						width: '16.7%',
						ellipsis: true,
					},
					{
						title: '浏览器',
						dataIndex: 'browser',
						width: '16.7%',
						ellipsis: true,
					},
					{
						title: '操作系统',
						dataIndex: 'os',
						width: '16.7%',
						ellipsis: true,
					},
					{
						title: '登录状态',
						dataIndex: 'status',
						width: '16.7%',
						ellipsis: true,
					},
					{
						title: '操作信息',
						dataIndex: 'msg',
						width: '16.7%',
						ellipsis: true,
					},
					{
						title: '登录日期',
						dataIndex: 'loginTime',
						width: 150,
						ellipsis: true,
					},
				]}
				loading={loading}
				dataSource={dataSource}
				scroll={{ y: '100%' }}
				{...tableProps}
			/>
		</div>
	);
};

export default Logininfor;
