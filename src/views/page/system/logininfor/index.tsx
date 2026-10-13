import { useEffect, useState } from 'react';
import { App, Button, Form, Input, Space, Table, Tag } from 'antd';
import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useTable } from '@/core';
import { usePermission } from '@/authority';
import { cleanLogininfor, deleteLogininfor } from '@/service';

export const Component = () => {
	const { message, modal } = App.useApp();
	const { hasPermi } = usePermission();
	const [selectKeys, setSelectKeys] = useState<(string | number)[]>([]);

	const { tableProps, getData } = useTable('/monitor/logininfor/list', () => searchForm.getFieldsValue());

	const [searchForm] = Form.useForm();

	const onSearch = (values: AnyObject) => {
		getData(values);
	};

	const onReset = () => {
		searchForm.resetFields();
		getData();
	};

	const onDelete = (ids: string | number) => {
		modal.confirm({
			title: '系统提示',
			content: '是否确认删除所选登录日志?',
			onOk() {
				deleteLogininfor(ids).then(() => {
					message.success('删除成功');
					setSelectKeys([]);
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的登录日志');
			return;
		}
		onDelete(selectKeys.join(','));
	};

	const onClean = () => {
		modal.confirm({
			title: '系统提示',
			content: '是否确认清空所有登录日志数据?',
			onOk() {
				cleanLogininfor().then(() => {
					message.success('清空成功');
					setSelectKeys([]);
					getData();
				});
			}
		});
	};

	const columns = [
		{
			title: '访问编号',
			dataIndex: 'id'
		},
		{
			title: '用户名称',
			dataIndex: 'userName'
		},
		{
			title: '登录地址',
			dataIndex: 'ipaddr'
		},
		{
			title: '登录地点',
			dataIndex: 'loginLocation'
		},
		{
			title: '浏览器',
			dataIndex: 'browser'
		},
		{
			title: '操作系统',
			dataIndex: 'os'
		},
		{
			title: '登录状态',
			dataIndex: 'status',
			render: (value: any) => (
				<Tag color={value == 0 ? 'success' : 'error'}>
					{value == 0 ? '成功' : '失败'}
				</Tag>
			)
		},
		{
			title: '操作信息',
			dataIndex: 'msg'
		},
		{
			title: '登录日期',
			dataIndex: 'loginTime'
		}
	];

	useEffect(() => {
		getData();
	}, []);

	return (
		<div className='p-4 flex flex-col gap-4'>
			<div className='flex items-center justify-between'>
				<Form form={searchForm} layout='inline' onFinish={onSearch}>
					<Form.Item name='userName' label='用户名称'>
						<Input placeholder='请输入用户名称' />
					</Form.Item>
					<Form.Item name='ipaddr' label='登录地址'>
						<Input placeholder='请输入登录地址' />
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
				<Space>
					{hasPermi('monitor:logininfor:remove') && (
						<Button danger type='primary' onClick={onClean}>
							清空
						</Button>
					)}
					{hasPermi('monitor:logininfor:remove') && (
						<Button
							danger
							type='primary'
							icon={<DeleteOutlined />}
							disabled={selectKeys.length == 0}
							onClick={onBatchDelete}
						>
							批量删除
						</Button>
					)}
				</Space>
			</div>
			<Table
				{...tableProps}
				rowSelection={{
					selectedRowKeys: selectKeys,
					onChange: (keys) => setSelectKeys(keys as (string | number)[])
				}}
				columns={columns}
			/>
		</div>
	);
};
