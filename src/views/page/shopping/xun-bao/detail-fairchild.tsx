import { Props } from './goods-detail';
import { Image } from 'antd';
import { SY_CONFIG } from '@/core';

import style from './index.module.less';

const DetailFairchild = ({ details }: Props) => {
	const getQualityStyle = (quality: string) => {
		const cur = parseInt(quality);
		return {
			background: `url(${
				SY_CONFIG.xunbao
			}/images/game/role/role_child_level.png) no-repeat 0 ${
				-4 - 50 * (cur - 1)
			}px`,
		};
	};

	const getFairchildItem = () => {
		if (details && details.fairchild) {
			if (details.fairchild.child.length > 0) {
				return details.fairchild.child.map((item, index) => (
					<div key={index} className={style.xbFairchildItem}>
						<div
							className={style.xbFairchildLevel}
							style={getQualityStyle(item.quality_star.value)}
						></div>
						<img
							width='100%'
							height='41px'
							className={style.xbFairchildProfession}
							src={`${SY_CONFIG.xunbao}/images/game/role/profession_${item.profession.value}.png`}
						/>
						<img
							width='100%'
							height='41px'
							className={style.xbFairchildProfession}
							src={`${SY_CONFIG.xunbao}/images/game/role/grain_${item.profession.value}.png`}
						/>
						<p className={style.xbFairchildLevelText}>
							{item.level.name}:{item.level.value}
						</p>
					</div>
				));
			}
		}
		return null;
	};

	return details && details.fairchild ? (
		<div className={style.xbPanel}>
			<div className={style.xbFairchildTop}>
				{details.fairchild.gender ? (
					<Image
						width='200px'
						height='54px'
						src={`${SY_CONFIG.xunbao}/images/game/role/role_child_avatar_${
							details.fairchild.gender.value == '男' ? 'body' : 'girl'
						}.png`}
						preview={false}
					/>
				) : null}
				<div className={style.xbFairchildTopText}>
					{details.fairchild.days ? (
						<p className={style.fairchildDesc}>
							{details.fairchild.days.name}: {details.fairchild.days.value}
						</p>
					) : null}
					{details.fairchild.growth ? (
						<p className={style.fairchildDesc}>
							{details.fairchild.growth.name}:{details.fairchild.growth.value}
						</p>
					) : null}
				</div>
			</div>
			{getFairchildItem()}
		</div>
	) : null;
};

export default DetailFairchild;
