import { SY_CONFIG } from '@/core';
import { Avatar } from 'antd';
import { Props } from './goods-detail';

import style from './index.module.less';

const DetailBasic = ({ details }: Props) => {
	return details ? (
		<div className={style.xbPanel}>
			<div className={style.xbPanelBasic}>
				<div className={style.basicItem}>
					<div className={style.basicItemAvatar}>
						<Avatar
							shape='square'
							size={50}
							src={`${SY_CONFIG.xunbao}/${details.basic.avatar}`}
						/>
					</div>
				</div>
				<div className={style.basicItem}>
					<h2 className={style.basicItemInfo}>{details.basic.name}</h2>
					<div className={style.basicDetail}>
						<span className={style.basicLabel}>{details.basic.cls.name}</span>
						{details.basic.cls.value}
					</div>
					<div className={style.basicDetail}>
						<span className={style.basicLabel}>
							{details.basic.gender.name}
						</span>
						{details.basic.gender.value}
					</div>
					<div className={style.basicDetail}>
						<span className={style.basicLabel}>{details.basic.level.name}</span>
						{details.basic.level.value}
					</div>
				</div>
			</div>
			<div className={style.xbPanelBasic}>
				<div className={style.basicItem}>
					<div className={style.basicDetail}>
						<span className={style.basicLabel}>
							{details.basic.reincarnation_levels.name}
						</span>
						{details.basic.reincarnation_levels.value}
					</div>
					<div className={style.basicDetail}>
						<span className={style.basicLabel}>
							{details.basic.reincarnation_count.name}
						</span>
						{details.basic.reincarnation_count.value}
					</div>
					<div className={style.basicDetail}>
						<span className={style.basicLabel}>
							{details.basic.realm_level.name}
						</span>
						{details.basic.realm_level.value}
					</div>
					<div className={style.basicDetail}>
						<span className={style.basicLabel}>
							{details.basic.astrolabe_exp.name}
						</span>
						{details.basic.astrolabe_exp.value}
					</div>
					<div className={style.basicDetail}>
						<span className={style.basicLabel}>
							{details.basic.reputation.name}
						</span>
						{details.basic.reputation.value}
					</div>
					<div className={style.basicDetail}>
						<span className={style.basicLabel}>
							{details.basic.level2.name}
						</span>
						{details.basic.level2.value}
					</div>
					<div className={style.basicDetail}>
						<span className={style.basicLabel}>{details.basic.pp.name}</span>
						{details.basic.pp.value}
					</div>
					<div className={style.basicDetail}>
						<span className={style.basicLabel}>
							{details.basic.energy.name}
						</span>
						{details.basic.energy.value}
					</div>
					<div className={style.basicDetail}>
						<span className={style.basicLabel}>
							{details.basic.agility.name}
						</span>
						{details.basic.agility.value}
					</div>
				</div>
				<div className={style.basicItem}>
					<div className={style.basicDetail}>
						<span className={style.basicLabel}>
							{details.basic.max_level.name}
						</span>
						{details.basic.max_level.value}
					</div>
					<div className={style.basicDetail}>
						<span className={style.basicLabel}>
							{details.basic.reincarnation_exp.name}
						</span>
						{details.basic.reincarnation_exp.value}
					</div>
					<div className={style.basicDetail}>
						<span className={style.basicLabel}>
							{details.basic.realm_exp.name}
						</span>
						{details.basic.realm_exp.value}
					</div>
					<div className={style.basicDetail}>
						<span className={style.basicLabel}>
							{details.basic.astrolabe_exp.name}
						</span>
						{details.basic.astrolabe_exp.value}
					</div>
					<div className={style.basicDetail}>
						<span className={style.basicLabel}>{details.basic.exp.name}</span>
						{details.basic.exp.value}
					</div>
					<div className={style.basicDetail}>
						<span className={style.basicLabel}>{details.basic.sp.name}</span>
						{details.basic.sp.value}
					</div>
					<div className={style.basicDetail}>
						<span className={style.basicLabel}>
							{details.basic.vitality.name}
						</span>
						{details.basic.vitality.value}
					</div>
					<div className={style.basicDetail}>
						<span className={style.basicLabel}>
							{details.basic.strength.name}
						</span>
						{details.basic.strength.value}
					</div>
					<div className={style.basicDetail}>
						<span className={style.basicLabel}>{details.forces.name}</span>
						{details.forces.value}
					</div>
				</div>
			</div>
			{/** 势力信息 */}
			<div className={`${style.xbPanelBasic} ${style.forces}`}>
				{details.forces.children.map((item) => (
					<div key={item.name} className={style.basicItem}>
						<div className={style.basicDetail}>
							<div className={style.basicLabel}>{item.name}</div>
							<div className={style.basicLabel}>{item.contribution.name}:</div>
							<div>{item.contribution.value}</div>
							<div className={style.basicLabel}>{item.reputation.name}:</div>
							<div>{item.reputation.value}</div>
						</div>
					</div>
				))}
			</div>
			<div className={style.xbDivider}>称号属性</div>
			<div className={style.xbPanelBasic}>
				<div className={style.basicItem}>
					<div className={style.basicDetail}>
						<span className={style.basicLabel}>
							{details.titles.phy_damage.name}
						</span>
						{details.titles.phy_damage.value}
					</div>
					<div className={style.basicDetail}>
						<span className={style.basicLabel}>
							{details.titles.phy_defence.name}
						</span>
						{details.titles.phy_defence.value}
					</div>
					<div className={style.basicDetail}>
						<span className={style.basicLabel}>
							{details.titles.attack.name}
						</span>
						{details.titles.attack.value}
					</div>
				</div>
				<div className={style.basicItem}>
					<div className={style.basicDetail}>
						<span className={style.basicLabel}>
							{details.titles.magic_damage.name}
						</span>
						{details.titles.magic_damage.value}
					</div>
					<div className={style.basicDetail}>
						<span className={style.basicLabel}>
							{details.titles.magic_defence.name}
						</span>
						{details.titles.magic_defence.value}
					</div>
					<div className={style.basicDetail}>
						<span className={style.basicLabel}>
							{details.titles.armor.name}
						</span>
						{details.titles.armor.value}
					</div>
				</div>
			</div>
		</div>
	) : (
		<>加载信息出错了!</>
	);
};

export default DetailBasic;
