import { Api } from '@/service';

/** 角色服务 */
/**
 * 获取角色列表
 * @param params pageNum pageSize
 */
export const getRoleData = (params: object) => Api.get('/system/role/list', params);
/**
 * 获取角色详情
 * @param id 角色ID
 */
export const getRoleDataById = (id: string) => Api.get(`/system/role/${id}`);
/**
 * 新增角色
 * @param params roleName roleKey status remark
 */
export const addRoleData = (params: object) => Api.post('/system/role', params);
/**
 * 修改角色信息
 * @param params roleId 角色ID
 */
export const updateRoleData = (params: object) => Api.put('/system/role', params);
/**
 * 删除角色
 * @param id 角色ID
 */
export const deleteRoleData = (id: string) => Api.delete(`/system/role/${id}`);
