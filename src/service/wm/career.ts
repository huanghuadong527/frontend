import { Api } from '@/service';

export const getCareerDataById = (id: string) => Api.get(`/wm/career/${id}`);

export const getCareerOptions = (params?: object) =>
	Api.get('/wm/career/options', params);

export const addCareerData = (params: object) => Api.post('/wm/career', params);

export const updateCareerData = (params: object) =>
	Api.put('/wm/career', params);

export const delCareerData = (id: string) => Api.delete(`/wm/career/${id}`);
