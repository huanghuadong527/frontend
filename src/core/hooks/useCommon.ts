import { delSelectable, delTabs, delToken } from '@/store';
import { useDispatch } from 'react-redux';
import { CONFIG_FAVICON, CONFIG_TITLE, SY_CONFIG } from '@/core';

interface SysConfigProps {
	configKey: string;
	configValue: string;
}

interface CommonProps {
	logout: () => void;
	setTitle: (title: string) => void;
	setFavicon: (src: string) => void;
	updateSysConfig: (params: SysConfigProps) => void;
}

/**
 * 系统常用工具
 */
const useCommon = (): CommonProps => {
	const dispatch = useDispatch();

	/**
	 * 退出登录
	 */
	const logout = () => {
		dispatch(delToken());
		dispatch(delTabs());
		dispatch(delSelectable());
	};

	/**
	 * 系统标题
	 * @param title 标题
	 */
	const setTitle = (title: string) => {
		let $title = document.querySelector('title');
		if ($title) {
			$title.innerText = title;
		} else {
			$title = document.createElement('title');
			$title.innerText = title;
			document.head.appendChild($title);
		}
	};

	/**
	 * 设置系统Favicon
	 * @param src Favicon图片地址
	 */
	const setFavicon = (src: string) => {
		let $favicon: any = document.querySelector('link[rel="icon"]');
		if ($favicon !== null) {
			$favicon.href = src;
		} else {
			$favicon = document.createElement('link');
			$favicon.rel = 'icon';
			$favicon.type = 'image/x-icon';
			$favicon.href = src;
			document.head.appendChild($favicon);
		}
	};

	const updateSysConfig = ({ configKey, configValue }: SysConfigProps) => {
		if (configKey == CONFIG_TITLE) {
			setTitle(configValue);
		}
		if (configKey == CONFIG_FAVICON) {
			setFavicon(`${SY_CONFIG.upload}${configValue}`);
		}
	};

	return {
		logout,
		setTitle,
		setFavicon,
		updateSysConfig,
	};
};

export { useCommon };
