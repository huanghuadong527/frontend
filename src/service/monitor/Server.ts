import { Api } from '@/service';

/**
 * 获取服务器相关信息
 */
export const getServerData = () => Api.get('/monitor/server');
