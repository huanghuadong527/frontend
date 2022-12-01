import { JScroll } from '@/components';
import { SY_CONFIG } from '@/core';
import { useSafeHtml } from '@/core/hooks/useSafeHtml';
import { Popover, Space, Tabs, Image } from 'antd';
import { Props } from './goods-detail';

import style from './index.module.less';

const DetailIllustration = ({ details }: Props) => {
	const { skillsSafeHtml } = useSafeHtml();

	const getIllustrationItems = (illustration: string) => {
		if (details && details[illustration]) {
			if (details[illustration].length > 0) {
				return (
					<JScroll height={300}>
						<Space wrap size={[6, 6]}>
							{details[illustration].map((item) => (
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
						</Space>
					</JScroll>
				);
			}
		}
		return null;
	};

	return (
		<div className={style.xbPanel}>
			<Tabs
				type='card'
				items={[
					{
						key: '13',
						label: '时装',
						children: getIllustrationItems('fashion_illustration'),
					},
					{
						key: '14',
						label: '坐骑',
            children: getIllustrationItems('riding_illustration'),
					},
					{
						key: '15',
						label: '观赏宠',
            children: getIllustrationItems('ornamental_pet_illustration'),
					},
					{
						key: '16',
						label: '飞行器',
            children: getIllustrationItems('fly_sword_illustration'),
					},
				]}
			></Tabs>
		</div>
	);
};

export default DetailIllustration;
