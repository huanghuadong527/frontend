import { Api } from '@/service';

/**
 * 获取参数列表
 * @param params pageNum pageSize
 */
export const getConfigData = (params: object) => Api.get('/system/config/list', params);
/**
 * 根据参数ID获取详细信息
 * @param id 参数ID
 */
export const getConfigDataById = (id: string) => Api.get(`/system/config/${id}`);
/**
 * 新增参数设置
 */
export const addConfigData = (params: object) => Api.post('/system/config', params);
/**
 * 编辑参数设置
 */
export const updateConfigData = (params: object) => Api.put('/system/config', params);
/**
 * 删除参数设置
 * @param id 参数ID
 */
export const deleteConfigData = (id: string) => Api.delete(`/system/config/${id}`);







