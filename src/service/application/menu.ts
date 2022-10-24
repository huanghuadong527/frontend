import { Api } from '@/service';

/**
 * 加载对应角色菜单列表树
 * @param id 角色ID
 */
export const getMenuByRoleId = (id: string) => Api.get(`/system/menu/roleMenuTreeselect/${id}`);
/**
 * 根据菜单ID获取菜单详情
 * @param id 菜单ID
 */
export const getMenuById = (id: string) => Api.get(`/system/menu/${id}`);
/**
 * 获取菜单下拉树列表
 */
export const getMenuTreeSelectData = () => Api.get('/system/menu/treeselect');
/**
 * 添加菜单
 */
export const addMenuData = (params: object) => Api.post('/system/menu', params);
/**
 * 更新菜单信息
 * @param params 
 */
export const updateMenuData = (params: object) => Api.put('/system/menu', params);
/**
 * 根据菜单ID删除菜单
 * @param id 菜单ID
 */
export const deleteMenuData = (id: string) => Api.delete(`/system/menu/${id}`);
