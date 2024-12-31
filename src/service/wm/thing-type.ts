import { Api } from '@/service';

export const getThingTypeDataById = (id: string) =>
	Api.get(`/wm/thing-type/${id}`);

export const addThingTypeData = (params: object) =>
	Api.post('/wm/thing-type', params);

export const updateThingTypeData = (params: object) =>
	Api.put('/wm/thing-type', params);

export const delThingTypeData = (id: string) =>
	Api.delete(`/wm/thing-type/${id}`);
