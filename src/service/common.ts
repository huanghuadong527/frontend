import { Service, AxiosConfig } from '@/service';

export const login = (params: object) => Service({ url: '/login' }, params);
export const logout = () => Service({ url: '/logout' });

/**
 * 获取表格头部
 * @param params code
 * @returns 表格头部集合
 */
export const getColumns = (params: AxiosConfig) => Service({ url: '/base/page-info' }, params);

/**
 * 获取系统用户信息
 */
export const getSystemUserInfo = () => Service({url: '/getInfo', method: 'GET'});

/**
 * 获取系统配置
 * @returns Name Favicon logo miniLogo
 */
export const getSystemConfig = () => Service({url: '/getConfig', method: 'GET'});

/**
 * 更新系统用户信息
 */
export const updateSystemUserInfo = (params: object) => Service({url: '/system/user/profile', method: 'PUT'}, params);

/**
 * 上传图片
 */
export const uploadImage = (params: FormData) => Service({
	url: '/upload/image',
	method: 'POST',
  type: 'upload',
	headers: { 'Content-Type': 'multipart/form-data' },
}, params);
