import { SY_CONFIG } from '@/core';
import { Col, Image, Row } from 'antd';
import { CSSProperties } from 'react';
import { Props } from './goods-detail';

import style from './index.module.less';

const DetailMeridians = ({ details }: Props) => {
	const getAcupointsItems = () => {
		if (details && details.meridians) {
			if (details.meridians.acupoints.length > 0) {
				return details.meridians.acupoints.map((item) => (
					<div
						key={item.pos}
						attr-pos={item.pos}
						className={style.xbAcupointsLm}
						style={LM_POSITION[item.pos]}
					>
						{item.state == '2' ? (
							<Image
								width='22px'
								height='22px'
								preview={false}
								src={`${SY_CONFIG.xunbao}/images/game/role/role_lm_3.gif`}
							/>
						) : null}
					</div>
				));
			}
		}
		return null;
	};

	const getAttributeItems = () => {
		if (details && details.meridians) {
			const attributes = details.meridians.attribute;
			const _attributes = [];
			for (let key in attributes) {
				_attributes.push(
					<Col key={key} span={8}>
						<div className={style.basicDetail}>
							<span className={style.basicLabel}>
                {attributes[key].name}
              </span>
							{attributes[key].value}
						</div>
					</Col>
				);
			}
			return _attributes;
		}
	};

	return (
		<div className={style.xbPanel}>
			<div className={style.xbPanelAcupoints}>
				<div className={style.xbAcupointsTitle}>道法自然</div>
				{getAcupointsItems()}
			</div>
			<div className={style.xbAcupointsCurrent}>当前已获得属性</div>
			<Row>{getAttributeItems()}</Row>
		</div>
	);
};

const LM_POSITION: { [key: string]: CSSProperties } = {
	'0': {
		top: '316px',
		left: '148px',
	},
	'1': {
		top: '295px',
		left: '106px',
	},
	'2': {
		top: '267px',
		left: '72px',
	},
	'3': {
		top: '226px',
		left: '46px',
	},
	'4': {
		top: '177px',
		left: '41px',
	},
	'5': {
		top: '133px',
		left: '50px',
	},
	'6': {
		top: '92px',
		left: '73px',
	},
	'7': {
		top: '65px',
		left: '108px',
	},
	'8': {
		top: '47px',
		left: '152px',
	},
	'9': {
		top: '317px',
		left: '206px',
	},
	'10': {
		top: '300px',
		left: '247px',
	},
	'11': {
		top: '271px',
		left: '285px',
	},
	'12': {
		top: '237px',
		left: '304px',
	},
	'13': {
		top: '201px',
		left: '315px',
	},
	'14': {
		top: '163px',
		left: '314px',
	},
	'15': {
		top: '126px',
		left: '303px',
	},
	'16': {
		top: '91px',
		left: '284px',
	},
	'17': {
		top: '66px',
		left: '253px',
	},
	'18': {
		top: '46px',
		left: '212px',
	},
	'19': {
		top: '177px',
		left: '176px',
	},
};

export default DetailMeridians;
