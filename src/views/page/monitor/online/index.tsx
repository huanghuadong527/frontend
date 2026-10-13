import { useEffect, useState } from 'react';
import { LogoutOutlined, SearchOutlined } from '@ant-design/icons';
import { App, Button, Form, Input, Space, Table } from 'antd';
import { forceLogout, getOnlineList } from '@/service';
import { usePermission } from '@/authority';

const formatTime = (value?: number) => {
	if (!value) return '-';
	const d = new Date(value);
	const p = (n: number) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(
		d.getHours()
	)}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

export const Component = () => {
	const { message, modal } = App.useApp();
	const { hasPermi } = usePermission();
	const [rows, setRows] = useState<AnyObject[]>([]);
	const [loading, setLoading] = useState(false);
	const [searchForm] = Form.useForm();

	const getData = (params: AnyObject = {}) => {
		setLoading(true);
		getOnlineList(params)
			.then((result) => {
				setLoading(false);
				setRows(result.data?.data ?? []);
			})
			.catch(() => setLoading(false));
	};

	const onSearch = (values: AnyObject) => {
		getData(values);
	};

	const onReset = () => {
		searchForm.resetFields();
		getData();
	};

	const onForceLogout = (id: string | number) => {
		modal.confirm({
			title: '系统提示',
			content: '是否确认强退该用户?',
			onOk() {
				forceLogout(id).then(() => {
					message.success('强退成功');
					getData();
				});
			}
		});
	};

	const columns = [
		{ title: '会话编号', dataIndex: 'id' },
		{ title: '登录名称', dataIndex: 'userName' },
		{ title: '部门名称', dataIndex: 'deptName' },
		{ title: '主机', dataIndex: 'ipaddr' },
		{ title: '登录地点', dataIndex: 'loginLocation' },
		{ title: '浏览器', dataIndex: 'browser' },
		{ title: '操作系统', dataIndex: 'os' },
		{
			title: '登录时间',
			dataIndex: 'loginTime',
			render: (value: any) => formatTime(value)
		},
		{
			title: '操作',
			dataIndex: 'action',
			width: 90,
			render: (_: any, row: AnyObject) => (
				<>
					{hasPermi('monitor:online:forceLogout') && (
						<Button
							type='link'
							danger
							size='small'
							icon={<LogoutOutlined />}
							title='强退'
							onClick={() => onForceLogout(row.id)}
						/>
					)}
				</>
			)
		}
	];

	useEffect(() => {
		getData();
	}, []);

	return (
		<div className='p-4 flex flex-col gap-4'>
			<div className='flex items-center justify-between'>
				<Form form={searchForm} layout='inline' onFinish={onSearch}>
					<Form.Item name='ipaddr' label='登录地址'>
						<Input placeholder='请输入登录地址' />
					</Form.Item>
					<Form.Item name='userName' label='用户名称'>
						<Input placeholder='请输入用户名称' />
					</Form.Item>
					<Form.Item>
						<Space>
							<Button type='primary' htmlType='submit' icon={<SearchOutlined />}>
								查询
							</Button>
							<Button onClick={onReset}>重置</Button>
						</Space>
					</Form.Item>
				</Form>
			</div>
			<Table
				loading={loading}
				dataSource={rows}
				rowKey='id'
				pagination={false}
				columns={columns}
			/>
		</div>
	);
};
