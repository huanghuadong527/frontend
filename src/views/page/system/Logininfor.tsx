import { exportFile } from '@/core';
import { cleanLogininforData, deleteLogininforData, exportLogininforData, getLogininforData } from '@/service';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Space, Table } from 'antd';
import { message, modal } from '@/redux';
import { Key, useCallback, useEffect, useState } from 'react';

const Logininfor = () => {
	const [selectKeys, setSelectKeys] = useState<Key[]>([]);
	const [dataSource, setDataSource] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [pageNum, setPageNum] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [total, setTotal] = useState(0);

	const getData = useCallback(
		(params: object = {}) => {
			setLoading(true);
			getLogininforData({ pageNum, pageSize, ...params }).then((result) => {
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

	const onDeleteData = (id: string) => {
		if (id) {
			deleteLogininforData(id).then((result) => {
				if (result.code == 200) {
					message.success('删除成功!');
					getData();
				}
			});
		}
	};

	const onCleanData = () => {
		cleanLogininforData().then((result) => {
			if (result.code == 200) {
				message.success('清空成功!');
				setSelectKeys([]);
				getData();
			}
		});
	};

	const onExport = () => {
		modal.confirm({
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
		<div className='flex justify-between mb-4'>
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
				pagination={{ current: pageNum, pageSize, total, showSizeChanger: true, showQuickJumper: true, showTotal: (t) => `共 ${t} 条`, onChange: (page, size) => { setPageNum(page); setPageSize(size); } }}
			/>
		</div>
	);
};

export const Component = Logininfor;
