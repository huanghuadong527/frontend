import { Api } from '@/service';

/**
 * 获取部门下拉树列表
 */
export const getDeptTreeSelectData = () => Api.get('/system/dept/treeselect');
/**
 * 获取指定部门详情
 * @param id 部门ID
 */
export const getDeptDataById = (id: string) => Api.get(`/system/dept/${id}`);
/**
 * 新增部门
 */
export const addDeptData = (params: object) => Api.post('/system/dept', params);
/**
 * 更新部门信息
 */
export const updateDeptData = (params: object) => Api.put('/system/dept', params);
/**
 * 删除指定部门
 * @param id 部门ID
 */
export const deleteDeptData = (id: string) => Api.delete(`/system/dept/${id}`);
