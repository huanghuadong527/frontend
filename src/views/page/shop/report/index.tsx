import { useEffect, useState } from 'react';
import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, Space, Table } from 'antd';
import { useTable } from '@/core';
import { getReportById } from '@/service';

export const Component = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [goods, setGoods] = useState<AnyObject[]>([]);
	const [searchForm] = Form.useForm();

	const { tableProps, getData } = useTable('/shop/report/list', () => searchForm.getFieldsValue());

	const onSearch = (values: AnyObject) => {
		getData(values);
	};

	const onReset = () => {
		searchForm.resetFields();
		getData();
	};

	const onDetail = (id: string | number) => {
		getReportById(id).then((result) => {
			setGoods(result.data?.goods ?? []);
			setIsOpen(true);
		});
	};

	const onClose = () => {
		setIsOpen(false);
		setGoods([]);
	};

	const columns = [
		{ title: '报表编号', dataIndex: 'id' },
		{ title: '用户昵称', dataIndex: 'nickName' },
		{ title: '导出次数', dataIndex: 'count' },
		{ title: '导出时间', dataIndex: 'exportTime' },
		{
			title: '操作',
			dataIndex: 'action',
			width: 90,
			render: (_: any, row: AnyObject) => (
				<Button
					type='link'
					size='small'
					icon={<EyeOutlined />}
					title='详情'
					onClick={() => onDetail(row.id)}
				/>
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
					<Form.Item name='nickName' label='用户昵称'>
						<Input placeholder='请输入用户昵称' />
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
			<Table {...tableProps} columns={columns} />
			<Modal title='报表详情' open={isOpen} onCancel={onClose} footer={null}>
				<Table
					size='small'
					rowKey='id'
					dataSource={goods}
					pagination={false}
					columns={[
						{ title: '商品编码', dataIndex: 'goodsCode' },
						{ title: '商品名称', dataIndex: 'goodsName' },
						{ title: '材质', dataIndex: 'materialName' },
						{ title: '零售价', dataIndex: 'goodsRetailPrice' },
						{ title: '条码', dataIndex: 'goodsBarcode' }
					]}
				/>
			</Modal>
		</div>
	);
};
