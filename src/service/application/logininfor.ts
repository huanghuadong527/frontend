import { Api } from '@/service';

/**
 * 获取系统访问记录列表
 * @param params pageNum pageSize
 */
export const getLogininforData = (params: object) => Api.get('/monitor/logininfor/list', params);

/**
 * 导出系统访问记录
 */
export const exportLogininforData = (params: object) =>Api.download('/monitor/logininfor/export', params);

/**
 * 删除系统访问记录
 */
export const deleteLogininforData = (ids: string) => Api.delete(`/monitor/logininfor/${ids}`);

/**
 * 清空系统访问记录
 */
export const cleanLogininforData = () => Api.delete('/monitor/logininfor/clean');
