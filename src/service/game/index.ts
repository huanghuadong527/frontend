import { service } from '@/utils';

/** 怪物列表 */
export const getMonsterList = (params: object) =>
	service.get(`/game/wm/monster/list`, { params });

/** 怪物详情 */
export const getMonsterById = (id: string | number) =>
	service.get(`/game/wm/monster/${id}`);

/** 新增怪物 */
export const addMonster = (params: object) =>
	service.post(`/game/wm/monster`, params);

/** 修改怪物 */
export const updateMonster = (params: object) =>
	service.put(`/game/wm/monster`, params);

/** 删除怪物 */
export const deleteMonster = (ids: string | number) =>
	service.delete(`/game/wm/monster/${ids}`);

/** 任务列表 */
export const getTaskList = (params: object) =>
	service.get(`/game/wm/task/list`, { params });

/** 任务树 */
export const getTaskTree = (params?: object) =>
	service.get(`/game/wm/task/tree`, { params });

/** 任务分类列表 */
export const getTaskCategoryList = (params?: object) =>
	service.get(`/game/wm/taskCategory/list`, { params });

/** 任务详情 */
export const getTaskById = (id: string | number) =>
	service.get(`/game/wm/task/${id}`);

/** 新增任务 */
export const addTask = (params: object) => service.post(`/game/wm/task`, params);

/** 修改任务 */
export const updateTask = (params: object) =>
	service.put(`/game/wm/task`, params);

/** 删除任务 */
export const deleteTask = (ids: string | number) =>
	service.delete(`/game/wm/task/${ids}`);

/** 称号列表 */
export const getTitleList = (params: object) =>
	service.get(`/game/wm/title/list`, { params });

/** 称号详情 */
export const getTitleById = (id: string | number) =>
	service.get(`/game/wm/title/${id}`);

/** 新增称号 */
export const addTitle = (params: object) => service.post(`/game/wm/title`, params);

/** 修改称号 */
export const updateTitle = (params: object) =>
	service.put(`/game/wm/title`, params);

/** 删除称号 */
export const deleteTitle = (ids: string | number) =>
	service.delete(`/game/wm/title/${ids}`);

/** 技能列表 */
export const getSkillList = (params: object) =>
	service.get(`/game/wm/skill/list`, { params });

/** 技能详情 */
export const getSkillById = (id: string | number) =>
	service.get(`/game/wm/skill/${id}`);

/** 新增技能 */
export const addSkill = (params: object) => service.post(`/game/wm/skill`, params);

/** 修改技能 */
export const updateSkill = (params: object) =>
	service.put(`/game/wm/skill`, params);

/** 删除技能 */
export const deleteSkill = (ids: string | number) =>
	service.delete(`/game/wm/skill/${ids}`);

/** 装备列表 */
export const getEquipmentList = (params: object) =>
	service.get(`/game/wm/equipment/list`, { params });

/** 装备详情 */
export const getEquipmentById = (id: string | number) =>
	service.get(`/game/wm/equipment/${id}`);

/** 新增装备 */
export const addEquipment = (params: object) =>
	service.post(`/game/wm/equipment`, params);

/** 修改装备 */
export const updateEquipment = (params: object) =>
	service.put(`/game/wm/equipment`, params);

/** 删除装备 */
export const deleteEquipment = (ids: string | number) =>
	service.delete(`/game/wm/equipment/${ids}`);

/** 代码列表 */
export const getCharacterList = (params: object) =>
	service.get(`/game/wm/character/list`, { params });

/** 代码详情 */
export const getCharacterById = (id: string | number) =>
	service.get(`/game/wm/character/${id}`);

/** 新增代码 */
export const addCharacter = (params: object) =>
	service.post(`/game/wm/character`, params);

/** 修改代码 */
export const updateCharacter = (params: object) =>
	service.put(`/game/wm/character`, params);

/** 删除代码 */
export const deleteCharacter = (ids: string | number) =>
	service.delete(`/game/wm/character/${ids}`);

/** 违规列表 */
export const getViolationList = (params: object) =>
	service.get(`/game/wm/violation/list`, { params });

/** 违规详情 */
export const getViolationById = (id: string | number) =>
	service.get(`/game/wm/violation/${id}`);

/** 新增违规 */
export const addViolation = (params: object) =>
	service.post(`/game/wm/violation`, params);

/** 修改违规 */
export const updateViolation = (params: object) =>
	service.put(`/game/wm/violation`, params);

/** 删除违规 */
export const deleteViolation = (ids: string | number) =>
	service.delete(`/game/wm/violation/${ids}`);

/** 画廊列表 */
export const getGalleryList = (params: object) =>
	service.get(`/game/wm/gallery/list`, { params });

/** 画廊详情 */
export const getGalleryById = (id: string | number) =>
	service.get(`/game/wm/gallery/${id}`);

/** 新增画廊 */
export const addGallery = (params: object) =>
	service.post(`/game/wm/gallery`, params);

/** 修改画廊 */
export const updateGallery = (params: object) =>
	service.put(`/game/wm/gallery`, params);

/** 删除画廊 */
export const deleteGallery = (ids: string | number) =>
	service.delete(`/game/wm/gallery/${ids}`);

/** 公告列表 */
export const getWmNoticeList = (params: object) =>
	service.get(`/game/wm/notice/list`, { params });

/** 公告详情 */
export const getWmNoticeById = (id: string | number) =>
	service.get(`/game/wm/notice/${id}`);

/** 新增公告 */
export const addWmNotice = (params: object) =>
	service.post(`/game/wm/notice`, params);

/** 修改公告 */
export const updateWmNotice = (params: object) =>
	service.put(`/game/wm/notice`, params);

/** 删除公告 */
export const deleteWmNotice = (ids: string | number) =>
	service.delete(`/game/wm/notice/${ids}`);

/** 同步官方公告 */
export const syncWmNotice = () => service.post(`/game/wm/notice/sync`);

/** 置顶列表 */
export const getTopList = (params: object) =>
	service.get(`/game/wm/top/list`, { params });

/** 置顶详情 */
export const getTopById = (id: string | number) =>
	service.get(`/game/wm/top/${id}`);

/** 新增置顶 */
export const addTop = (params: object) => service.post(`/game/wm/top`, params);

/** 修改置顶 */
export const updateTop = (params: object) => service.put(`/game/wm/top`, params);

/** 删除置顶 */
export const deleteTop = (ids: string | number) =>
	service.delete(`/game/wm/top/${ids}`);
