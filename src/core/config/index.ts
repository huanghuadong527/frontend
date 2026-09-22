/** 公共基础路径 */
export const API_BASE_URL = import.meta.env.VITE_BASE_URL;

/** 接口代理路径 */
export const API_URL = import.meta.env.VITE_API_URL;

/** 资源代理 */
export const API_UPLOAD = import.meta.env.VITE_API_UPLOAD;

/** 系统权限TOKEN缓存主键 */
export const TOKEN_COOKIE_KEY = 'Authorization';
/** 系统主题默认色 */
export const THEME_COLOR = '#1677ff';
/** 系统主题缓存主键 */
export const THEME_COLOR_KEY = 'GLOBAL_THEME';
/** 数据验证 */
export const CACHE_VALIDATE = 'cache_validate';
/** 标签列表 */
export const CACHE_TABS = 'cache_tabs';

/** 用户性别 */
export const DICT_USER_SEX = 'sys_user_sex';
/** 系统开关 */
export const DICT_STATUS = 'sys_normal_disable';
/** 通知类型 */
export const DICT_NOTICE_TYPE = 'sys_notice_type';
/** 通知状态 */
export const DICT_NOTICE_STATUS = 'sys_notice_status';
/** 操作类型 */
export const DICT_OPER_TYPE = 'sys_oper_type';
/** 称号区域 */
export const DICT_TITLE_AREA = 'game_wm_title_area';
/** 置顶所属模块 */
export const DICT_TOP_MODULE = 'game_wm_top_module';

/** 接口请求超时时间 */
export const SERVICE_TIMEOUT = 10000;

/** 接口提交数据大小限制提示词 */
export const TIP_LIMIT_SIZE = '请求数据大小超出允许的5M限制, 无法进行防重复提交验证。';
/** 接口数据重复提交提示词 */
export const TIP_REPORT = '数据正在处理, 请勿重复提交!';

/** 异常样式 */
export const ERROR_STYLE = 'padding: 3px; background-color: #FF4D4F; color: #FFFFFF;';
/** 异常提示 */
export const ERROR_TIPS = '系统故障, 请联系管理员!';

export const ERROR_CODE = {
	'401': '认证失败，无法访问系统资源',
	'403': '当前操作没有权限',
	'404': '访问资源不存在',
	default: '系统未知错误，请反馈给管理员'
} as CObject;
