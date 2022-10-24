import { Api } from '@/service';

/**
 * 查询用户列表
 * @param params pageNum pageSize
 */
export const getUserData = (params: object) => Api.get('/system/user/list', params);
/**
 * 新增用户
 * @param params 
 */
export const addUserData = (params: object) => Api.post('/system/user', params);
/**
 * 修改角色
 * @param params id 用户ID
 */
export const updateUserData = (params: object) => Api.put('/system/user', params);
/**
 * 根据用户ID获取用户信息
 * @param id 用户ID
 */
export const getUserDataById = (id: string) => Api.get(`/system/user/info/${id}`);
/**
 * 删除用户
 * @param id userId
 */
export const deleteUserData = (id: string) => Api.delete(`/system/user/${id}`);
