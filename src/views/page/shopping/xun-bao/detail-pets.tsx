import { SY_CONFIG } from '@/core';
import { useSafeHtml } from '@/core/hooks/useSafeHtml';
import { Space, Tooltip, Image, Popover } from 'antd';
import { useMemo, useState } from 'react';
import { emptyItem } from './empty-item';
import { Pets, PetsParamsKeys, Props } from './goods-detail';

import style from './index.module.less';

const DetailPets = ({ details }: Props) => {
	let _selectable = '';
	if (details && details.pets && details.pets.length > 0) {
		_selectable = details.pets[0].name;
	}
	const [selectable, setSelectable] = useState(_selectable);
	const { skillsSafeHtml } = useSafeHtml();

	const onSelectable = (name: string) => {
		setSelectable(name);
	};

	const getDetailItem = (pets: Pets, key: PetsParamsKeys) => {
		if (key in pets.params) {
			return (
				<div key={key} className={style.basicDetail}>
					<span className={style.basicLabel}>{pets.params[key].name}</span>
					{pets.params[key].value}
				</div>
			);
		}
		return null;
	};

	const getPetsInherited = useMemo(() => {
		if (selectable) {
			const pet = details!.pets.find((item) => item.name == selectable);
			if (pet && pet.params && pet.params.inherited) {
				const inherited = pet.params.inherited;
				const inheriteds = [];
				for (let key in inherited) {
					const name = inherited[key].name;
					const cur_value = Number(inherited[key].cur_value);
					const max_value = Number(inherited[key].max_value);
					inheriteds.push(
						<div key={key} className={style.xbInheritedItem}>
							<div className={style.xbInheritedLabel}>{name}</div>
							<div className={style.xbInheritedFc}>
								<div className={style.xbInheritedValue}>
									{cur_value}/{max_value}
								</div>
								<img
									height='10px'
									src={`${SY_CONFIG.xunbao}/images/game/role/role_bar.gif`}
									width={`${(cur_value / max_value) * 100}%`}
									className={style.xbInheritedProgress}
								/>
							</div>
						</div>
					);
				}
				return inheriteds;
			}
		}
		return null;
	}, [selectable]);

	const getPetSkills = useMemo(() => {
		if (selectable) {
			const pet = details!.pets.find((item) => item.name == selectable);
			if (pet && pet.params && pet.params.skills) {
				const skills = pet.params.skills;
				return (
					<Space wrap size={[8.4, 0]}>
						{skills.map((item) => (
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
				);
			}
		}
		return <div className={style.xbUnLearned}>未学习技能</div>;
	}, [selectable]);

	return (
		<div className={style.xbPanel}>
			<div className={style.xbDivider}>称号属性</div>
			<div className={style.xbPanelBasic}>
				<Space size={[8.4, 0]}>
					{details!.pets.map((item) => (
						<Tooltip
							placement='rightTop'
							key={item.name}
							title={
								<>
									<div key='name' className={style.basicDetail}>
										<span className={style.basicLabel}>宠物名称</span>
										{item.name}
									</div>
									{PETS_PARAMS_SORT.map((key) => getDetailItem(item, key))}
								</>
							}
						>
							<a onClick={() => onSelectable(item.name)}>
								<Image
									width={30}
									preview={false}
									src={`${SY_CONFIG.xunbao}/${item.icon}`}
								/>
							</a>
						</Tooltip>
					))}
					{emptyItem(10 - details!.pets.length)}
				</Space>
			</div>
			<div className={style.xbDivider}>宠物技能</div>
			{getPetSkills}
			<div className={style.xbDivider}>继承系数</div>
			<div className={style.xbInherited}>{getPetsInherited}</div>
		</div>
	);
};

const PETS_PARAMS_SORT: PetsParamsKeys[] = [
	'type',
	'level',
	'exp',
	'food',
	'move_speed',
	'hungry',
	'loyalty',
	'level_requirement',
	'max_hp',
	'attack',
	'physic_defence',
	'magic_defence',
	'definition',
	'evade',
	'attack_speed',
	'inhabit_type',
	'nature',
];

export default DetailPets;
