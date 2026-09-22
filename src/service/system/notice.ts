import { service } from '@/utils';

/** 公告列表 */
export const getNoticeList = (params: object) =>
	service.get(`/system/notice/list`, { params });

/** 公告详情 */
export const getNoticeById = (id: string | number) =>
	service.get(`/system/notice/${id}`);

/** 新增公告 */
export const addNotice = (params: object) => service.post(`/system/notice`, params);

/** 修改公告 */
export const updateNotice = (params: object) =>
	service.put(`/system/notice`, params);

/** 删除公告 */
export const deleteNotice = (id: string | number) =>
	service.delete(`/system/notice/${id}`);
