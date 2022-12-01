import { useCallback, useEffect, useState } from 'react';
import { DynamicTable } from '@/components';
import { SY_CONFIG, useAntdTable } from '@/core';
import { Button, Cascader, Space, Image, Popover, Select } from 'antd';
import { getWmServiceAreaData } from '@/service';
import { mapTree, toArrayTree } from 'xe-utils';
import { useSafeHtml } from '@/core/hooks/useSafeHtml';

interface AreaOption {
	value: string;
	label: string;
}

const goodsType = [
	'武器',
	'防具',
	'饰品',
	'时装',
	'灵符',
	'弹药',
	'宠物蛋',
	'魂石',
	'药品',
	'生产原料',
	'飞行工具',
	'寻龙物品',
	'其它',
	'游戏币',
	'角色',
];

const GoodsList = () => {
	const [area, setArea] = useState<AreaOption[]>([]);
	const [goodsServerId, setGoodsServerId] = useState('');
	const { dataSource, tableProps, loading, getTableData } = useAntdTable(
		'/xunbao/getWmGoodsData',
		{
			goodsServerId,
		}
	);
	const { safeHtml } = useSafeHtml();

	const onChangeArea = (e: any) => {
		if (e && Array.isArray(e)) {
			if (e.length > 1) {
				setGoodsServerId(e[1]);
				getTableData({ goodsServerId: e[1] });
			}
		}
	};

	const getWmServiceArea = useCallback(() => {
		getWmServiceAreaData().then((result) => {
			if (result.code == 200) {
				setArea(
					mapTree(toArrayTree(result.data), (item) => ({
						value: item.id,
						label: item.name,
					}))
				);
			}
		});
	}, []);

	useEffect(() => {
		getWmServiceArea();
	}, []);

	const headerRender = (
		<div className='flex-row space-between'>
			<Space>
				<Cascader
					style={{ width: '180px' }}
					options={area}
					onChange={onChangeArea}
				></Cascader>
				<Select
					style={{ width: '180px' }}
					options={goodsType.map((item) => ({ value: item, label: item }))}
				></Select>
			</Space>
			<Space>
				<Button type='primary'>同步服务器</Button>
				<Button className='ant-btn-export' type='primary'>
					同步数据
				</Button>
			</Space>
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
						title: '图片',
						dataIndex: 'goodsIcon',
						width: 50,
						align: 'center',
						ellipsis: true,
						render(src, record) {
							const __html = safeHtml(record.goodsDetail);
							return (
								<Popover
									overlayClassName='xunbao-tooltip'
									placement='right'
									content={<div dangerouslySetInnerHTML={{ __html }}></div>}
								>
									<Image
										width={30}
										preview={false}
										src={`${SY_CONFIG.xunbao}/${src}`}
									/>
								</Popover>
							);
						},
					},
					{
						title: '服务器',
						dataIndex: 'goodsServerId',
						fixed: 'left',
						width: '16.7%',
						ellipsis: true,
					},
					{
						title: 'COMMID',
						dataIndex: 'goodsCommid',
						width: '16.7%',
						ellipsis: true,
					},
					{
						title: '寻宝页码',
						dataIndex: 'page',
						width: '16.7%',
						ellipsis: true,
					},
					{
						title: '名称',
						dataIndex: 'goodsName',
						width: '16.7%',
					},
					{
						title: '数量',
						dataIndex: 'goodsQuantity',
						width: '16.7%',
						ellipsis: true,
					},
					{
						title: '等级',
						dataIndex: 'goodsGrade',
						width: '16.7%',
						ellipsis: true,
					},
					{
						title: '价格',
						dataIndex: 'goodsPrice',
						width: '16.7%',
						ellipsis: true,
					},
					{
						title: '剩余时间',
						dataIndex: 'goodsTimeRemaining',
						width: '16.7%',
						ellipsis: true,
					},
					{
						title: '卖家',
						dataIndex: 'goodsSeller',
						width: '16.7%',
						ellipsis: true,
					},
					{
						title: '操作',
						dataIndex: 'handle',
						width: 100,
						fixed: 'right',
						render: (value, record: any) => {
							return (
								<Space>
									<Button size='small' type='link'>
										同步
									</Button>
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

export default GoodsList;
