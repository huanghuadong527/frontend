import { Api } from '@/service';

/**
 * 根据私服ID获取私服详情
 * @param id 私服ID
 */
export const getPrivateServerDataById = (id: string) => Api.get(`/private/server/info/${id}`);

/**
 * 添加私服数据
 */
export const addPrivateServerData = (params: object) => Api.post('/private/server', params);

/**
 * 更新私服数据
 */
export const updatePrivateServerData = (params: object) => Api.put('/private/server', params);

/**
 * 更新私服状态
 * @param params ids status
 */
export const updatePrivateServerStatus = (params: object) => Api.post('/private/server/updateStatus', params);

/**
 * 删除私服数据
 * @param ids 私服ID
 */
export const deletePrivateServerData = (ids: string) => Api.delete(`/private/server/${ids}`);
