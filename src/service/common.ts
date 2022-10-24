import { Service, AxiosConfig } from '@/service';

export const login = (params: object) => Service({ url: '/login' }, params);
export const logout = () => Service({ url: '/logout' });

/**
 * 获取表格头部
 * @param params code
 * @returns 表格头部集合
 */
export const getColumns = (params: AxiosConfig) =>
	Service({ url: '/base/page-info' }, params);

export const uploadImage = (params: FormData) => Service({
	url: '/upload/image',
	method: 'POST',
  type: 'upload',
	headers: { 'Content-Type': 'multipart/form-data' },
}, params);
