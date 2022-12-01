import { DynamicTable } from '@/components';
import { useSafeHtml } from '@/core/hooks/useSafeHtml';
import {
	getWmGoodsData,
	getWmGoodsDetail,
	getWmGoodsTotal,
	getWmServiceAreaData,
} from '@/service';
import { Button, List, Image, Popover, Space, Select, Modal, Tabs } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { GoodsDetailType } from './goods-detail';
import { SY_CONFIG } from '@/core';

import style from './index.module.less';

import DetailBasic from './detail-basic';
import DetailSkills from './detail-skills';
import DetailInventory from './detail-inventory';
import DetailPets from './detail-pets';
import DetailMeridians from './detail-meridians';
import DetailIllustration from './detail-illustration';
import DetailFairchild from './detail-fairchild';

interface AreaInterface {
	id: string;
	name: string;
}

const goodsType = [
	'全部',
	'角色',
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
];

const XunBaoGoods = () => {
	const [areas, setAreas] = useState<AreaInterface[]>([]);
	const [areaId, setAreaId] = useState('');
	const [group, setGroup] = useState('');
	const [pageNum, setPageNum] = useState(1);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [visible, setVisible] = useState(false);
	const [details, setDetail] = useState<GoodsDetailType>();
	const [dataSource, setDataSource] = useState([]);
	const { safeHtml } = useSafeHtml();

	const onSelectArea = (id: string) => {
		setPageNum(1);
		setGroup('');
		setAreaId(id);
	};

	const onChangePage = (page: number) => {
		setPageNum(page);
	};

	const onChangeGroup = (key: string) => {
		setPageNum(1);
		setGroup(key);
	};

	const onCancel = () => {
		setVisible(false);
	}

	const onSelectGoodsById = ({ goodsCommid }: any) => {
		if (group == '角色') {
			getWmGoodsDetailById(areaId, goodsCommid);
		} else {
			setVisible(true);
		}
	};

	const headerRender = (
		<div className='flex-row space-between'>
			<Space>
				<Select
					value={group}
					style={{ width: '180px' }}
					options={goodsType.map((item) => ({
						value: item == '全部' ? '' : item,
						label: item,
					}))}
					onChange={onChangeGroup}
				></Select>
			</Space>
		</div>
	);

	const getWmServiceArea = useCallback(() => {
		getWmServiceAreaData().then((result) => {
			if (result.code == 200) {
				const $areas = result.data.filter((item: any) => item.id != '-1');
				if ($areas.length > 0) {
					setAreaId($areas[0].id);
					setAreas($areas);
				}
			}
		});
	}, []);

	const getWmGoodsDetailById = useCallback((areaId: string, commid: string) => {
		getWmGoodsDetail({
			areaId,
			commid,
		}).then((result) => {
			if (result.code == 200) {
				setVisible(true);
				setDetail(result.data);
			} else {
				setDetail(undefined);
			}
		});
	}, []);

	const getWmGoods = useCallback(() => {
		if (areaId) {
			setLoading(true);
			getWmGoodsData({
				areaId: areaId,
				group: group,
				page: pageNum,
			}).then((result) => {
				setLoading(false);
				if (result.code == 200) {
					setDataSource(result.data);
				} else {
					setDataSource([]);
				}
			});
		}
	}, [pageNum, group, areaId]);

	const getTotal = useCallback(() => {
		if (areaId) {
			getWmGoodsTotal({
				areaId: areaId,
				group: group,
			}).then((result) => {
				if (result.code == 200) {
					setTotal(result.data);
				} else {
					setTotal(0);
				}
			});
		}
	}, [group, areaId]);

	useEffect(() => {
		getWmServiceArea();
	}, []);

	useEffect(() => {
		getTotal();
	}, [getTotal]);

	useEffect(() => {
		getWmGoods();
	}, [getWmGoods]);

	return (
		<div className={style.container}>
			<div className={style.sider}>
				<List>
					{areas.map((item) => (
						<List.Item key={item.id}>
							<Button
								block
								type={areaId == item.id ? 'primary' : 'text'}
								onClick={() => onSelectArea(item.id)}
							>
								{item.name}
							</Button>
						</List.Item>
					))}
				</List>
			</div>
			<div className={style.content}>
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
											<a onClick={() => onSelectGoodsById(record)}>
												<Image
													width={30}
													preview={false}
													src={`${SY_CONFIG.xunbao}/${src}`}
												/>
											</a>
										</Popover>
									);
								},
							},
							{
								title: '商品号',
								dataIndex: 'goodsCommid',
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
								render(value) {
									if (!value || value == 'null') {
										return 1;
									}
									return value;
								},
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
						]}
						loading={loading}
						dataSource={dataSource}
						scroll={{ y: '100%' }}
						pagination={{
							current: pageNum,
							pageSize: 10,
							total,
							size: 'default',
							showSizeChanger: false,
							showQuickJumper: true,
							onChange: onChangePage,
							showTotal: (total: number) => `共${total}条`,
						}}
					/>
				</div>
			</div>
			<Modal
				width={418}
				wrapClassName={style.modal}
				title={false}
				footer={false}
				open={visible}
				onCancel={onCancel}
			>
				<Tabs
					type='card'
					items={[
						{
							key: '1',
							label: '人物属性',
							children: <DetailBasic details={details} />,
						},
						{
							key: '2',
							label: '人物技能',
							children: <DetailSkills details={details} />,
						},
						{
							key: '3',
							label: '人物背包',
							children: <DetailInventory details={details} />,
						},
						{
							key: '4',
							label: '宠物背包',
							children: <DetailPets details={details} />,
						},
						{
							key: '5',
							label: '灵脉',
							children: <DetailMeridians details={details} />,
						},
						{
							key: '6',
							label: '图鉴',
							children: <DetailIllustration details={details} />,
						},
						{
							key: '7',
							label: '仙童',
							children: <DetailFairchild details={details} />,
						},
					]}
				></Tabs>
			</Modal>
		</div>
	);
};

export default XunBaoGoods;
