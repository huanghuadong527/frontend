import { SY_CONFIG } from '@/core';
import { Image } from 'antd';

export const emptyItem = (len: number) => {
	const $elempty: JSX.Element[] = [];
	if (len > 0) {
		for (let i = 0; i < len; i++) {
			$elempty.push(
				<Image
					width='30px'
					height='30px'
					preview={false}
					key={i}
					src={`${SY_CONFIG.xunbao}/images/game/role/pic_bg.gif`}
				/>
			);
		}
	}
	return $elempty;
};
