import { Api } from '@/service';

/**
 * 查询布告列表
 * @param params 布告Name 分页
 */
export const getSyNoticeData = (params: object) => Api.get('/notice/list', params);
/**
 * 根据布告ID获取布告详情
 * @param id 布告ID
 */
export const getSyNoticeDataById = (id: string) => Api.get(`/notice/info/${id}`);
/**
 * 添加布告
 * @param params 布告信息 
 */
export const addSyNoticeData = (params: object) => Api.post('/notice', params);
/**
 * 更新布告
 * @param params 布告信息(id) 
 */
export const updateSyNoticeData = (params: object) => Api.put('/notice', params);
/**
 * 删除布告
 * @param id 布告ID
 */
export const deleteSyNoticeData = (id: string) => Api.delete(`/notice/${id}`);
