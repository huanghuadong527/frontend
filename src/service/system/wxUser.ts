import { service } from '@/utils';

/** 微信用户列表 */
export const getWxUserList = (params: object) =>
	service.get(`/system/wx/user/list`, { params });

/** 微信用户详情 */
export const getWxUserById = (id: string | number) =>
	service.get(`/system/wx/user/${id}`);

/** 修改微信用户 */
export const updateWxUser = (params: object) =>
	service.put(`/system/wx/user`, params);

/** 修改微信用户状态 */
export const updateWxUserStatus = (params: object) =>
	service.post(`/system/wx/user/status`, params);

/** 删除微信用户 */
export const deleteWxUser = (ids: string | number) =>
	service.delete(`/system/wx/user/${ids}`);
