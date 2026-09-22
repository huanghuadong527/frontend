import { service } from '@/utils';

/** 部门列表 */
export const getDeptList = (params?: object) =>
	service.get(`/system/dept/list`, { params });

/** 部门详情 */
export const getDeptById = (id: string | number) =>
	service.get(`/system/dept/${id}`);

/** 部门下拉树 */
export const getDeptTreeSelect = () => service.get(`/system/dept/treeselect`);

/** 新增部门 */
export const addDept = (params: object) => service.post(`/system/dept`, params);

/** 修改部门 */
export const updateDept = (params: object) => service.put(`/system/dept`, params);

/** 删除部门 */
export const deleteDept = (id: string | number) =>
	service.delete(`/system/dept/${id}`);
