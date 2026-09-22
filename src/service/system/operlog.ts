import { service } from '@/utils';

/** 操作日志列表 */
export const getOperlogList = (params: object) =>
	service.get(`/monitor/operlog/list`, { params });

/** 删除操作日志 */
export const deleteOperlog = (ids: string | number) =>
	service.delete(`/monitor/operlog/${ids}`);

/** 清空操作日志 */
export const cleanOperlog = () => service.delete(`/monitor/operlog/clean`);
