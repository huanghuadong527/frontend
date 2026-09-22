import { service } from '@/utils';

/** 角色列表 */
export const getRoleList = (params: object) =>
	service.get(`/system/role/list`, { params });

/** 角色详情 */
export const getRoleById = (id: string | number) =>
	service.get(`/system/role/${id}`);

/** 角色菜单树 */
export const getRoleMenuTree = (id: string | number) =>
	service.get(`/system/menu/roleMenuTreeselect/${id}`);

/** 新增角色 */
export const addRole = (params: object) => service.post(`/system/role`, params);

/** 修改角色 */
export const updateRole = (params: object) => service.put(`/system/role`, params);

/** 删除角色 */
export const deleteRole = (id: string | number) =>
	service.delete(`/system/role/${id}`);
