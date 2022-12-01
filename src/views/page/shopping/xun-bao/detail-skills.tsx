import { useSafeHtml } from '@/core/hooks/useSafeHtml';
import { Space, Image, Popover } from 'antd';
import { Props } from './goods-detail';
import { emptyItem } from './empty-item';
import { JScroll } from '@/components';
import { SY_CONFIG } from '@/core';

import style from './index.module.less';

const DetailSkills = ({ details }: Props) => {
	const { skillsSafeHtml } = useSafeHtml();

	return details ? (
		<div className={style.xbPanel}>
			<div className={style.xbDivider}>主动技能</div>
			<div className={style.xbPanelBasic}>
				<JScroll height={155}>
					<Space wrap size={[6, 6]}>
						{details.skills.positive.map((item) => (
							<Popover
								overlayClassName='xunbao-tooltip'
								placement='rightTop'
								key={item.id}
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
						{emptyItem(40 - details.skills.positive.length)}
					</Space>
				</JScroll>
			</div>
			<div className={style.xbDivider}>被动技能</div>
			<div className={style.xbPanelBasic}>
				<JScroll height={110}>
					<Space wrap size={[6, 6]}>
						{details.skills.passive.map((item) => (
							<Popover
								overlayClassName='xunbao-tooltip'
								placement='rightTop'
								key={item.id}
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
						{emptyItem(24 - details.skills.passive.length)}
					</Space>
				</JScroll>
			</div>
			<div className={style.xbDivider}>符纹刻位</div>
			<div className={style.xbPanelBasic}>
				<Space size={[17.14, 0]}>
					{details.storehouse.runes
						.filter((item) => ~~item.pos > -1 && ~~item.pos < 8)
						.map((item) => (
							<Popover
								overlayClassName='xunbao-tooltip'
								placement='rightTop'
								key={item.pos}
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
										width='32px'
										height='32px'
										preview={false}
										id={item.id}
										key={item.id}
										src={`${SY_CONFIG.xunbao}/${item.icon}`}
									/>
								</a>
							</Popover>
						))}
				</Space>
			</div>
			<div className={style.xbDivider}>符纹背包</div>
			<div className={style.xbPanelBasic}>
				<JScroll height={70}>
					<Space wrap size={[6, 6]}>
						{details.storehouse.runes
							.filter((item) => ~~item.pos > 8)
							.map((item) => (
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
						{emptyItem(
							64 -
								details.storehouse.runes.filter((item) => ~~item.pos > 8).length
						)}
					</Space>
				</JScroll>
			</div>
		</div>
	) : (
		<>加载信息出错了!</>
	);
};

export default DetailSkills;
