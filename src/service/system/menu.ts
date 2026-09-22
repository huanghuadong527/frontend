import { service } from '@/utils';

/** 菜单列表 */
export const getMenuList = (params?: object) =>
	service.get(`/system/menu/list`, { params });

/** 菜单详情 */
export const getMenuById = (id: string | number) =>
	service.get(`/system/menu/${id}`);

/** 菜单下拉树 */
export const getMenuTreeSelect = () => service.get(`/system/menu/treeselect`);

/** 新增菜单 */
export const addMenu = (params: object) => service.post(`/system/menu`, params);

/** 修改菜单 */
export const updateMenu = (params: object) => service.put(`/system/menu`, params);

/** 删除菜单 */
export const deleteMenu = (id: string | number) =>
	service.delete(`/system/menu/${id}`);
