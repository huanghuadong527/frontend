import { Api } from '@/service';

export const getEquipmentDataById = (id: string) =>
	Api.get(`/wm/equipment/${id}`);

export const addEquipmentData = (params: object) =>
	Api.post('/wm/equipment', params);

export const updateEquipmentData = (params: object) =>
	Api.put('/wm/equipment', params);

export const delEquipmentData = (id: string) =>
	Api.delete(`/wm/equipment/${id}`);
