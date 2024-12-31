import config from '@/assets/config/index.json';

export interface SyConfigInterface {
	proxy: string;
	upload: string;
	xunbao: string;
}

/** 系统主题色 */
export const THEME_COLOR = '#2EAFBB';

/** 系统Cookie存储Key */
export const TOKEN_COOKIE_KEY = 'Authorization';

/** 系统主题存储Key */
export const GLOBAL_THEME = 'GLOBAL_THEME';

/** 系统页签存储Key */
export const TABS = 'SELECT_TABS';

/** 系统页签选中项Key */
export const TABS_SELECTABLE = 'SELECT_ID';

/** 用于关闭全局提示框(message.destroy(MSG_KEY)) */
export const SY_KEY = 'SY_KEY';

export const CONFIG_TITLE = 'sys.config.title';
export const CONFIG_FAVICON = 'sys.config.favicon';
export const CONFIG_LOGO = 'sys.config.mini.logo';
export const CONFIG_MINI_LOGO = 'sys.config.logo';

/** 系统Cookie存储周期 */
export const EXPIRES = 7;

export const DIALOG_SM = 520;
export const DIALOG_MD = 600;
export const DIALOG_LG = 900;

export const SY_CONFIG: SyConfigInterface = config;
/**
 * 表单布局(*限四字)
 */
export const FORM_LAYOUT = {
	labelCol: { span: 5 },
	wrapperCol: { span: 19 }
};

export const LG_FORM_LAYOUT = {
	labelCol: { span: 7 },
	wrapperCol: { span: 17 }
};

export const FLEX_FORM_LAYOUT = {
	labelCol: { flex: '110px' },
	wrapperCol: { flex: 'auto' }
};
