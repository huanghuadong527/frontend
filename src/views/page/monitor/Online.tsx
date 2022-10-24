import moment from 'moment';
import { DynamicSearch, DynamicTable } from '@/components';
import { useAntdTable } from '@/core';
import { LogoutOutlined } from '@ant-design/icons';
import { Button, message, Popconfirm, Space } from 'antd';
import { forceLogout } from '@/service';

const Online = () => {
	const { dataSource, tableProps, loading, getTableData } = useAntdTable(
		'/monitor/online/list'
	);

	const onForcedRetreat = (id: string) => {
		forceLogout(id).then((result) => {
			if (result.code == 200) {
				message.success('强退成功!');
				getTableData();
			}
		});
	};

	const headerRender = (
		<div className='flex-row'>
			<DynamicSearch />
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
				{...tableProps}
			/>
		</div>
	);
};

export default Online;
