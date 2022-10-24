import { Api } from '@/service';

/**
 * 获取服务器列表树结构
 */
export const getGameServerTreeData = () => Api.get('/game/server/tree');

export const getGameServerDataById = (id: string) => Api.get(`/game/server/info/${id}`);

/**
 * 根据服务器类型获取服务器列表
 * @param type 类型
 */
export const getGameServerDataByType = (type: number) => Api.get(`/game/server/list/${type}`);

/**
 * 添加服务器
 * @param params name parentId type status remark
 */
export const addGameServerData = (params: object) => Api.post('/game/server', params);

/**
 * 更新服务器信息
 * @param params id name parentId type status remark
 */
export const updateGameServerData = (params: object) => Api.put('/game/server', params);

/**
 * 删除服务器数据
 * @param id 服务器ID
 */
export const deleteGameServerData = (id: string) => Api.delete(`/game/server/${id}`);
