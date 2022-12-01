import { useSafeHtml } from '@/core/hooks/useSafeHtml';
import { Button, Col, Row, Space, Image, Popover, Tabs, Tooltip } from 'antd';
import { useState } from 'react';
import { Equipment, Props } from './goods-detail';
import { JScroll } from '@/components';
import { emptyItem } from './empty-item';
import { SY_CONFIG } from '@/core';

import classname from 'classnames';
import style from './index.module.less';

const DetailInventory = ({ details }: Props) => {
	const [mode, setMode] = useState('common');
	const { safeHtml, skillsSafeHtml, moneySafeValue } = useSafeHtml();

	const onSelectMode = (type: string) => {
		setMode(type);
	};

	const getEquipmentByPos = (pos: string) => {
		if (details && details.equipment) {
			const item = details.equipment.find((item) => item.pos == pos);
			if (item) {
				const __html = safeHtml(item.desc);
				return (
					<Popover
						overlayClassName='xunbao-tooltip'
						placement='right'
						content={<div dangerouslySetInnerHTML={{ __html }}></div>}
						key={`equipment-${pos}`}
					>
						<a>
							<Image
								width={30}
								preview={false}
								src={`${SY_CONFIG.xunbao}/${item.icon}`}
							/>
						</a>
					</Popover>
				);
			}
		}
		return (
			<Image
				width='30px'
				height='30px'
				preview={false}
				src={`${SY_CONFIG.xunbao}/images/game/role/pic_bg.gif`}
			/>
		);
	};

	const getPackageItems = (equipments: Equipment[], count: number) => {
		if (equipments && equipments.length > 0) {
			return (
				<JScroll height={155}>
					<Space wrap size={[6, 6]}>
						{equipments.map((item) => (
							<Popover
								overlayClassName='xunbao-tooltip'
								placement='rightTop'
								key={item.id + item.pos}
								content={
									<div
										dangerouslySetInnerHTML={{
											__html: skillsSafeHtml(item.desc),
										}}
									></div>
								}
							>
								<a>
									<Image
										width='30px'
										height='30px'
										preview={false}
										id={item.id}
										key={item.id}
										src={`${SY_CONFIG.xunbao}/${item.icon}`}
									/>
								</a>
							</Popover>
						))}
						{details ? emptyItem(count - equipments.length) : ''}
					</Space>
				</JScroll>
			);
		}
		return (
			<JScroll height={155}>
				<Space wrap size={[6, 6]}>
					{emptyItem(count)}
				</Space>
			</JScroll>
		);
	};

	return (
		<div className={style.xbPanel}>
			<div className={classname(style.xbPanelBasic, style.xbPanelPic, 'mb-md')}>
				<Space className='mb-md'>
					<Button
						type='primary'
						size='small'
						className={`xb-mode--btn ${mode == 'common' ? 'active' : ''}`}
						onClick={() => onSelectMode('common')}
					>
						普通模式
					</Button>
					<Button
						type='primary'
						size='small'
						className={`xb-mode--btn ${mode == 'fashion' ? 'active' : ''}`}
						onClick={() => onSelectMode('fashion')}
					>
						时装模式
					</Button>
				</Space>
				{mode == 'common' ? (
					<div className={style.xbBagPic}>
						<Row style={{ width: '105px' }} wrap={true} gutter={[5, 5]}>
							{PIC_LEFT.map((item) => (
								<Col key={item}>{getEquipmentByPos(item)}</Col>
							))}
						</Row>
						<Row style={{ width: '105px' }} wrap={true} gutter={[5, 5]}>
							{PIC_RIGHT.map((item) => (
								<Col key={item}>{getEquipmentByPos(item)}</Col>
							))}
						</Row>
					</div>
				) : (
					<div className={style.xbBagPicFashion}>
						<div
							className={style.fashionItem}
							style={{ left: '60px', top: '0px' }}
						>
							{getEquipmentByPos('16')}
						</div>
						<div
							className={style.fashionItem}
							style={{ left: '60px', top: '90px' }}
						>
							{getEquipmentByPos('15')}
						</div>
						<div
							className={style.fashionItem}
							style={{ left: '280px', top: '0px' }}
						>
							{getEquipmentByPos('25')}
						</div>
						<div
							className={style.fashionItem}
							style={{ left: '280px', top: '45px' }}
						>
							{getEquipmentByPos('13')}
						</div>
						<div
							className={style.fashionItem}
							style={{ left: '280px', top: '90px' }}
						>
							{getEquipmentByPos('14')}
						</div>
					</div>
				)}
			</div>
			<Tabs
				type='card'
				items={[
					{
						key: '8',
						label: '普通物品',
						children: (
							<>
								<div className='mb-md'>
									{getPackageItems(details!.inventory, 96)}
								</div>
								<Space>
									<div className={style.xbMoney}>
										<Image
											width='20px'
											height='20px'
											src={`${SY_CONFIG.xunbao}/images/game/role/game_coin_ico.gif`}
											className={style.xbMoneyIcon}
										/>
										<span className={style.xbMoneyValue}>
											{moneySafeValue(details!.money)}
										</span>
									</div>
									<div className={style.xbMoney}>
										<Image
											width='20px'
											height='20px'
											src={`${SY_CONFIG.xunbao}/images/bind_money.png`}
											className={style.xbMoneyIcon}
										/>
										<span className={style.xbMoneyValue}>
											{moneySafeValue(details!.bind_money)}
										</span>
									</div>
								</Space>
							</>
						),
					},
					{
						key: '9',
						label: '材料仓库',
						children: (
							<>
								<div className='mb-md'>
									{getPackageItems(details!.storehouse.dress, 200)}
								</div>
								<Space>
									<div className={style.xbMoney}>
										<Image
											width='20px'
											height='20px'
											src={`${SY_CONFIG.xunbao}/images/game/role/game_coin_ico.gif`}
											className={style.xbMoneyIcon}
										/>
										<span className={style.xbMoneyValue}>
											{moneySafeValue(details!.storehouse.money)}
										</span>
									</div>
								</Space>
							</>
						),
					},
					{
						key: '10',
						label: '普通仓库',
						children: (
							<>
								<div className='mb-md'>
									{getPackageItems(details!.storehouse.items, 96)}
								</div>
								<Space>
									<div className={style.xbMoney}>
										<Image
											width='20px'
											height='20px'
											src={`${SY_CONFIG.xunbao}/images/game/role/game_coin_ico.gif`}
											className={style.xbMoneyIcon}
										/>
										<span className={style.xbMoneyValue}>
											{moneySafeValue(details!.storehouse.money)}
										</span>
									</div>
								</Space>
							</>
						),
					},
					{
						key: '11',
						label: '时装物品',
						children: getPackageItems(details!.storehouse.material, 96),
					},
					{
						key: '12',
						label: '战灵背包',
						children: (
							<>
								<div className='mb-md'>
									{getPackageItems(details!.storehouse.generalcard, 120)}
								</div>
								<div className={style.xbDivider}>已装备</div>
								<div className='align-center'>
									<div className={style.xbCardLeaderShip}>
										{details?.card.leadership.name}:
										{details?.card.leadership.value}
									</div>
									<Space>
										{PIC_CARD.map((item) => getEquipmentByPos(item))}
									</Space>
									<Space>
										{details?.card.faterings.map((item) => (
											<Tooltip
												key={item.pos}
												title={
													<>
														<div>
															{item.level.name}: {item.level.value}
														</div>
														<div>
															{item.exp.name}: {item.exp.value}
														</div>
													</>
												}
											>
												<div className={style.xbCardFaterings}>{item.name}</div>
											</Tooltip>
										))}
									</Space>
								</div>
							</>
						),
					},
				]}
			/>
		</div>
	);
};

const PIC_LEFT = [
	'20',
	'21',
	'12',
	'2',
	'3',
	'18',
	'8',
	'5',
	'22',
	'9',
	'10',
	'23',
];

const PIC_RIGHT = [
	'24',
	'1',
	'19',
	'26',
	'4',
	'17',
	'27',
	'6',
	'0',
	'38',
	'7',
	'11',
];

const PIC_CARD = ['32', '33', '34', '35', '36', '37'];

export default DetailInventory;
