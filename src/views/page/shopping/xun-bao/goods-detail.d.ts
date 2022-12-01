export interface Props {
	details?: GoodsDetailType;
}

export interface GoodsDetailType {
	/**
	 * 金币
	 */
	money: string;
	/**
	 * 银币
	 */
	bind_money: string;
	/**
	 * 基本信息
	 */
	basic: Basic;
	/**
	 * 战灵
	 */
	card: Card;
	/**
	 * 仙童
	 */
	fairchild: Fairchild;
	/**
	 * 势力信息
	 */
	forces: Forces;
	/**
	 * 宠物包裹
	 */
	pets: Pets[];
	/**
	 * 人物技能
	 */
	skills: Skills;
	/**
	 * 仓库包裹
	 */
	storehouse: StoreHouse;
	/**
	 * 称号属性
	 */
	titles: Titles;
	/**
	 * 普通包裹
	 */
	inventory: Equipment[];
	/**
	 * 灵脉
	 */
	meridians: Meridians;
	/**
	 * 装备信息
	 */
	equipment: Equipment[];
	/**
	 * 图鉴
	 */
	[illustration: string]: Illustration[];
	/**
	 * 时装图鉴
	 */
	fashion_illustration: Illustration[];
	/**
	 * 飞行器图鉴
	 */
	fly_sword_illustration: Illustration[];
	/**
	 * 观赏宠图鉴
	 */
	ornamental_pet_illustration: Illustration[];
	/**
	 * 坐骑图鉴
	 */
	riding_illustration: Illustration[];
}

interface Basic {
	name: string;
	avatar: string;
	agility: ParamsValue;
	astrolabe_exp: ParamsValue;
	astrolabe_level: ParamsValue;
	cls: ParamsValue;
	energy: ParamsValue;
	exp: ParamsValue;
	gender: ParamsValue;
	level: ParamsValue;
	level2: ParamsValue;
	max_level: ParamsValue;
	pp: ParamsValue;
	realm_exp: ParamsValue;
	realm_level: ParamsValue;
	reincarnation_count: ParamsValue;
	reincarnation_exp: ParamsValue;
	reincarnation_levels: ParamsValue;
	reputation: ParamsValue;
	sp: ParamsValue;
	strength: ParamsValue;
	vitality: ParamsValue;
}

interface Card {
	leadership: ParamsValue;
	faterings: CardFaterings[];
}

interface Forces extends ParamsValue {
	children: ForcesChildren[];
}

interface ForcesChildren {
	name: string;
	contribution: ParamsValue;
	reputation: ParamsValue;
}

export interface Equipment extends Information {
	count: string;
	equipmask: string;
	level: string;
	pos: string;
	proctype: string;
}

interface Information {
	id: string;
	name: string;
	icon: string;
	desc: string;
}

interface Fairchild {
	growth: ParamsValue;
	gender: ParamsValue;
	days: ParamsValue;
	child: FairchildChild[];
}

/**
 * 图鉴
 */
interface Illustration {
	id: string;
	name: string;
	icon: string;
	desc: string;
}

interface Meridians extends ParamsValue {
	acupoints: PosState[];
	attribute: MeridiansAttribute;
}

/**
 * 灵脉当前已获得属性
 */
interface MeridiansAttribute {
	[key: string]: ParamsValue;
	hp: ParamsValue;
	magic_damage: ParamsValue;
	magic_defence: ParamsValue;
	phy_damage: ParamsValue;
	phy_defence: ParamsValue;
}

interface Pets {
	icon: string;
	name: string;
	params: PetsParams;
}

interface PetsParams {
	attack: ParamsValue;
	attack_speed: ParamsValue;
	definition: ParamsValue;
	evade: ParamsValue;
	exp: ParamsValue;
	food: ParamsValue;
	hungry: ParamsValue;
	inhabit_type: ParamsValue;
	level: ParamsValue;
	level_requirement: ParamsValue;
	loyalty: ParamsValue;
	magic_defence: ParamsValue;
	max_hp: ParamsValue;
	move_speed: ParamsValue;
	nature: ParamsValue;
	physic_defence: ParamsValue;
	type: ParamsValue;
	inherited: PetsInherited;
	skills: Illustration[];
}

type PetsParamsKeys =
	| 'attack'
	| 'attack_speed'
	| 'definition'
	| 'evade'
	| 'exp'
	| 'food'
	| 'hungry'
	| 'inhabit_type'
	| 'level'
	| 'level_requirement'
	| 'loyalty'
	| 'magic_defence'
	| 'max_hp'
	| 'nature'
	| 'move_speed'
	| 'physic_defence'
	| 'type';

interface PetsInherited {
	[key: string]: PetsInheritedParams;
	inherit_atk_lvl_ration: PetsInheritedParams;
	inherit_atk_ration: PetsInheritedParams;
	inherit_def_lvl_ration: PetsInheritedParams;
	inherit_def_ration: PetsInheritedParams;
	inherit_hp_ration: PetsInheritedParams;
}

interface PetsInheritedParams {
	name: string;
	max_value: string;
	cur_value: string;
}

interface Skills {
	/** 主动技能 */
	positive: Information[];
	/** 被动技能 */
	passive: Information[];
}

interface StoreHouse {
	/** 金币 */
	money: string;
	/** 时装仓库 */
	dress: Equipment[];
	/** 战灵背包 */
	generalcard: Equipment[];
	/** 普通仓库 */
	items: Equipment[];
	/** 材料仓库 */
	material: Equipment[];
	/** 符文背包 */
	runes: Equipment[];
}

interface Titles {
	armor: ParamsValue;
	attack: ParamsValue;
	magic_damage: ParamsValue;
	magic_defence: ParamsValue;
	phy_damage: ParamsValue;
	phy_defence: ParamsValue;
}

interface FairchildChild {
	level: ParamsValue;
	profession: ParamsValue;
	quality_star: ParamsValue;
}

interface PosState {
	pos: string;
	state: string;
}

interface CardFaterings {
	name: string;
	pos: string;
	exp: ParamsValue;
	level: ParamsValue;
}

interface ParamsValue {
	name: string;
	value: string;
}
