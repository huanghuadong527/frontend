import { Api } from '@/service';

/**
 * 强退会话
 * @param id 会话编号
 */
export const forceLogout = (id: string) => Api.delete(`/monitor/online/${id}`);
