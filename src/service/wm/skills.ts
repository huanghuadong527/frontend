import { Api } from '@/service';

export const getSkillsDataById = (id: string) => Api.get(`/wm/skills/${id}`);

export const getSkillsOption = (params?: object) =>
	Api.post(`/wm/skills/options`, params);

export const addSkillsData = (params: object) => Api.post('/wm/skills', params);

export const updateSkillsData = (params: object) =>
	Api.put('/wm/skills', params);

export const delSkillsData = (id: string) => Api.delete(`/wm/skills/${id}`);
