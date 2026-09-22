import { service } from '@/utils';

/** 在线用户列表 */
export const getOnlineList = (params: object) =>
	service.get(`/monitor/online/list`, { params });

/** 强退用户 */
export const forceLogout = (tokenId: string | number) =>
	service.delete(`/monitor/online/${tokenId}`);

/** 服务监控 */
export const getServerData = () => service.get(`/monitor/server`);

/** 缓存监控 */
export const getCacheData = () => service.get(`/monitor/cache`);
