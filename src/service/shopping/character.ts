import { Api } from '@/service';

/**
 * 根据代码ID查询代码信息
 * @param id 代码ID 
 */
export const getCharacterDataById = (id: string) => Api.get(`/character/info/${id}`);

/**
 * 根据代码ID更新代码信息
 * @param params 代码信息
 */
export const updateCharacterData = (params: object) => Api.put('/character', params);

/**
 * 添加代码信息
 * @param params 代码信息
 */
export const addCharacterData = (params: object) => Api.post('/character', params);

/**
 * 根据代码ID删除代码信息
 * @param id 代码ID
 */
export const deleteCharacterData = (id: string) => Api.delete(`/character/${id}`);
