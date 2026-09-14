import moment from 'moment';
import { LogoutOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Space, Table } from 'antd';
import { message } from '@/redux';
import { forceLogout, getOnlineData } from '@/service';
import { useCallback, useEffect, useState } from 'react';

const Online = () => {
	const [dataSource, setDataSource] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [pageNum, setPageNum] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [total, setTotal] = useState(0);

	const getData = useCallback(
		(params: object = {}) => {
			setLoading(true);
			getOnlineData({ pageNum, pageSize, ...params }).then((result) => {
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

	const onForcedRetreat = (id: string) => {
		forceLogout(id).then((result) => {
			if (result.code == 200) {
				message.success('强退成功!');
				getData();
			}
		});
	};

	return (
		<div className='w-full h-full flex flex-col'>
			<Table
				rootClassName='table-fill'
				size='small'
				rowKey='id'
				pagination={{
					current: pageNum,
					pageSize,
					total,
					showSizeChanger: true,
					showQuickJumper: true,
					showTotal: (t) => `共 ${t} 条`,
					onChange: (page, size) => {
						setPageNum(page);
						setPageSize(size);
					},
				}}
				columns={[
					{
						title: '序号',
						width: 50,
						render: (text, record, index) => {
							return index + 1;
						},
					},
					{
						title: '会话编号',
						dataIndex: 'id',
						width: '16.7%',
						ellipsis: true,
					},
					{
						title: '登录名称',
						dataIndex: 'userName',
						width: '16.7%',
						ellipsis: true,
					},
					{
						title: '部门名称',
						dataIndex: 'deptName',
						width: '16.7%',
						ellipsis: true,
					},
					{
						title: '主机',
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
						title: '登录时间',
						dataIndex: 'loginTime',
						width: '16.7%',
						ellipsis: true,
						render: (value) => {
							if (value) {
								return moment(new Date(value)).format('YYYY-MM-DD HH:mm:ss');
							}
							return '-';
						},
					},
					{
						title: '操作',
						dataIndex: 'handle',
						width: 80,
						fixed: 'right',
						render: (value, record: any) => {
							return (
								<Space>
									<Popconfirm
										title='是否确认强退该用户?'
										placement='bottomRight'
										onConfirm={() => onForcedRetreat(record.id)}
									>
										<Button
											danger
											size='small'
											type='link'
											icon={<LogoutOutlined />}
										>
											强退
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
			/>
		</div>
	);
};

export const Component = Online;
