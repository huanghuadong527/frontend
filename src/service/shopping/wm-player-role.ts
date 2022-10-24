import { Api } from '@/service';

export const getWmPlayerRoleData = (wmId: string) => Api.get(`/wm/player/role/info/${wmId}`);

export const updateWmPlayerRoleData = (params: object) => Api.post('/wm/player/role', params);

export const addWmPlayerRoleData = (params: object) => Api.put('/wm/player/role', params);

export const deleteWmPlayerRoleData = (wmId: string) => Api.delete(`/wm/player/role/${wmId}`);
