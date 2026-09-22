import { service } from '@/utils';

/** 参数列表 */
export const getConfigList = (params: object) =>
	service.get(`/system/config/list`, { params });

/** 参数详情 */
export const getConfigById = (id: string | number) =>
	service.get(`/system/config/${id}`);

/** 新增参数 */
export const addConfig = (params: object) => service.post(`/system/config`, params);

/** 修改参数 */
export const updateConfig = (params: object) =>
	service.put(`/system/config`, params);

/** 删除参数 */
export const deleteConfig = (id: string | number) =>
	service.delete(`/system/config/${id}`);
