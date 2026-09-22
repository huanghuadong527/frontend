import { service } from '@/utils';

/**
 * 用户列表
 * @param params
 * @returns
 */
export const getUserList = (params: object) =>
	service.get(`/system/user/list`, { params });

/**
 * 用户类部门列表
 * @param params
 * @returns
 */
export const getUserDeptTree = (params: object) =>
	service.get(`/system/user/deptTree`, { params });

/** 用户详情 */
export const getUserById = (id: string | number) =>
	service.get(`/system/user/info/${id}`);

/** 新增用户 */
export const addUser = (params: object) => service.post(`/system/user`, params);

/** 修改用户 */
export const updateUser = (params: object) => service.put(`/system/user`, params);

/** 删除用户 */
export const deleteUser = (ids: string | number) =>
	service.delete(`/system/user/${ids}`);
