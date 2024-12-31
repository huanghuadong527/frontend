import { Api } from '@/service';

export const getClassifyDataById = (id: string) =>
	Api.get(`/wm/classify/${id}`);

export const addClassifyData = (params: object) =>
	Api.post('/wm/career', params);

export const updateClassifyData = (params: object) =>
	Api.put('/wm/classify', params);

export const delClassifyData = (id: string) => Api.delete(`/wm/classify/${id}`);
