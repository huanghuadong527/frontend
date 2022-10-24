import { Api } from '@/service';

/**
 * 获取公告详情
 * @param id 公告ID
 */
export const getNoticeDataById = (id: string) => Api.get(`/system/notice/${id}`);

/**
 * 新增公告
 * @param params 公告信息 
 */
export const addNoticeData = (params: object) => Api.post('/system/notice', params);

/**
 * 修改公告
 * @param params 公告信息
 */
export const updateNoticeData = (params: object) => Api.put('/system/notice', params);

/**
 * 根据公告ID删除公告
 * @param id 公告ID
 */
export const deleteNoticeData = (id: string) => Api.delete(`/system/notice/${id}`)
