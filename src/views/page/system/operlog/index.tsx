import { useEffect, useState } from 'react';
import { App, Button, Form, Input, Space, Table, Tag } from 'antd';
import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { DICT_OPER_TYPE, useTable } from '@/core';
import { usePermission } from '@/authority';
import { cleanOperlog, deleteOperlog, getDictDataByType } from '@/service';

export const Component = () => {
	const { message, modal } = App.useApp();
	const { hasPermi } = usePermission();
	const [selectKeys, setSelectKeys] = useState<(string | number)[]>([]);
	const [operTypeDict, setOperTypeDict] = useState<AnyObject[]>([]);

	const { tableProps, getData } = useTable('/monitor/operlog/list', () => searchForm.getFieldsValue());

	const [searchForm] = Form.useForm();

	const onSearch = (values: AnyObject) => {
		getData(values);
	};

	const onReset = () => {
		searchForm.resetFields();
		getData();
	};

	const getDictLabel = (value: any) => {
		const dict = operTypeDict.find((item: any) => item.dictValue == value);
		return dict ? dict.dictLabel : value;
	};

	const onDelete = (ids: string | number) => {
		modal.confirm({
			title: '系统提示',
			content: '是否确认删除所选操作日志?',
			onOk() {
				deleteOperlog(ids).then(() => {
					message.success('删除成功');
					setSelectKeys([]);
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的操作日志');
			return;
		}
		onDelete(selectKeys.join(','));
	};

	const onClean = () => {
		modal.confirm({
			title: '系统提示',
			content: '是否确认清空所有操作日志数据?',
			onOk() {
				cleanOperlog().then(() => {
					message.success('清空成功');
					setSelectKeys([]);
					getData();
				});
			}
		});
	};

	const columns = [
		{
			title: '操作编号',
			dataIndex: 'operId'
		},
		{
			title: '操作模块',
			dataIndex: 'title'
		},
		{
			title: '业务类型',
			dataIndex: 'businessType',
			render: (value: any) => {
				return getDictLabel(value);
			}
		},
		{
			title: '操作人员',
			dataIndex: 'operName'
		},
		{
			title: '请求方式',
			dataIndex: 'requestMethod'
		},
		{
			title: '操作地址',
			dataIndex: 'operUrl'
		},
		{
			title: '操作IP',
			dataIndex: 'operIp'
		},
		{
			title: '操作状态',
			dataIndex: 'status',
			render: (value: any) => (
				<Tag color={value == 0 ? 'success' : 'error'}>
					{value == 0 ? '正常' : '异常'}
				</Tag>
			)
		},
		{
			title: '操作时间',
			dataIndex: 'operTime'
		}
	];

	useEffect(() => {
		getData();
	}, []);

	useEffect(() => {
		getDictDataByType(DICT_OPER_TYPE).then((result) => {
			setOperTypeDict(result.data || []);
		});
	}, []);

	return (
		<div className='p-4 flex flex-col gap-4'>
			<div className='flex items-center justify-between'>
				<Form form={searchForm} layout='inline' onFinish={onSearch}>
					<Form.Item name='title' label='操作模块'>
						<Input placeholder='请输入操作模块' />
					</Form.Item>
					<Form.Item name='operName' label='操作人员'>
						<Input placeholder='请输入操作人员' />
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
					{hasPermi('monitor:operlog:remove') && (
						<Button danger type='primary' onClick={onClean}>
							清空
						</Button>
					)}
					{hasPermi('monitor:operlog:remove') && (
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
				rowKey='operId'
				rowSelection={{
					selectedRowKeys: selectKeys,
					onChange: (keys) => setSelectKeys(keys as (string | number)[])
				}}
				columns={columns}
			/>
		</div>
	);
};
