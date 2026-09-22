import { service } from '@/utils';

/** 登录日志列表 */
export const getLogininforList = (params: object) =>
	service.get(`/monitor/logininfor/list`, { params });

/** 删除登录日志 */
export const deleteLogininfor = (ids: string | number) =>
	service.delete(`/monitor/logininfor/${ids}`);

/** 清空登录日志 */
export const cleanLogininfor = () => service.delete(`/monitor/logininfor/clean`);
