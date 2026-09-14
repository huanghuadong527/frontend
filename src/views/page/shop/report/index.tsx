import { useCallback, useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Space, Table } from 'antd';
import type { TableProps } from 'antd';
import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { getReportById, getReportList } from '@/service';

const Report = () => {
	const [visible, setVisible] = useState(false);
	const [goods, setGoods] = useState<any[]>([]);
	const [dataSource, setDataSource] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [pageNum, setPageNum] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [total, setTotal] = useState(0);
	const [searchForm] = Form.useForm();

	const getData = useCallback(
		(params: object = {}) => {
			setLoading(true);
			getReportList({ pageNum, pageSize, ...params }).then((result) => {
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

	const onSearch = (values: any) => {
		getData({
			nickName: values.nickName || undefined
		});
	};

	const onReset = () => {
		searchForm.resetFields();
		getData();
	};

	const onDetail = (id: string | number) => {
		getReportById(id).then((result) => {
			setGoods(result.data?.goods ?? []);
			setVisible(true);
		});
	};

	const onClose = () => {
		setVisible(false);
		setGoods([]);
	};

	const columns: TableProps<any>['columns'] = [
		{ title: '报表编号', dataIndex: 'id' },
		{ title: '用户昵称', dataIndex: 'nickName' },
		{ title: '导出次数', dataIndex: 'count' },
		{ title: '导出时间', dataIndex: 'exportTime' },
		{
			title: '操作',
			width: 90,
			render: (_, record) => (
				<Button
					type='link'
					size='small'
					icon={<EyeOutlined />}
					onClick={() => onDetail(record.id)}
				>
					详情
				</Button>
			)
		}
	];

	const detailColumns: TableProps<any>['columns'] = [
		{ title: '商品编码', dataIndex: 'goodsCode' },
		{ title: '商品名称', dataIndex: 'goodsName' },
		{ title: '材质', dataIndex: 'materialName' },
		{ title: '零售价', dataIndex: 'goodsRetailPrice' },
		{ title: '条码', dataIndex: 'goodsBarcode' }
	];

	return (
		<div className='w-full h-full flex flex-col'>
			<div className='flex justify-between mb-4'>
				<Form layout='inline' form={searchForm} onFinish={onSearch}>
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
			<Table
				rootClassName='table-fill'
				size='small'
				rowKey='id'
				loading={loading}
				dataSource={dataSource}
				columns={columns}
				scroll={{ y: '100%' }}
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
					}
				}}
			/>
			<Modal title='报表详情' open={visible} onCancel={onClose} footer={null}>
				<Table
					rowKey='id'
					size='small'
					dataSource={goods}
					columns={detailColumns}
					pagination={false}
				/>
			</Modal>
		</div>
	);
};

export const Component = Report;
