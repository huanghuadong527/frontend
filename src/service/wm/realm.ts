import { Api } from '@/service';

export const getRealmOption = (params: object) =>
	Api.get('/wm/realm/options', params);

export const getRealmDataById = (id: string) => Api.get(`/wm/realm/${id}`);

export const addRealmData = (params: object) => Api.post('/wm/realm', params);

export const updateRealmData = (params: object) => Api.put('/wm/realm', params);

export const delRealmData = (id: string) => Api.delete(`/wm/realm/${id}`);
