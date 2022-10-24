import { Api } from '@/service';

/**
 * 获取缓存监控
 */
export const getCacheData = () => Api.get('/monitor/cache');
