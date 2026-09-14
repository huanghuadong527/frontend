import { Api } from '@/service';

/** 怪物列表 */
export const getMonsterList = (params: object) => Api.get('/game/wm/monster/list', params);
/** 怪物详情 */
export const getMonsterById = (id: string | number) => Api.get(`/game/wm/monster/${id}`);
/** 新增怪物 */
export const addMonster = (params: object) => Api.post('/game/wm/monster', params);
/** 修改怪物 */
export const updateMonster = (params: object) => Api.put('/game/wm/monster', params);
/** 删除怪物 */
export const deleteMonster = (ids: string | number) => Api.delete(`/game/wm/monster/${ids}`);

/** 任务列表 */
export const getTaskList = (params: object) => Api.get('/game/wm/task/list', params);
/** 任务树 */
export const getTaskTree = (params?: object) => Api.get('/game/wm/task/tree', params);
/** 任务详情 */
export const getTaskById = (id: string | number) => Api.get(`/game/wm/task/${id}`);
/** 新增任务 */
export const addTask = (params: object) => Api.post('/game/wm/task', params);
/** 修改任务 */
export const updateTask = (params: object) => Api.put('/game/wm/task', params);
/** 删除任务 */
export const deleteTask = (ids: string | number) => Api.delete(`/game/wm/task/${ids}`);

/** 称号列表 */
export const getTitleList = (params: object) => Api.get('/game/wm/title/list', params);
/** 称号详情 */
export const getTitleById = (id: string | number) => Api.get(`/game/wm/title/${id}`);
/** 新增称号 */
export const addTitle = (params: object) => Api.post('/game/wm/title', params);
/** 修改称号 */
export const updateTitle = (params: object) => Api.put('/game/wm/title', params);
/** 删除称号 */
export const deleteTitle = (ids: string | number) => Api.delete(`/game/wm/title/${ids}`);

/** 技能列表 */
export const getSkillList = (params: object) => Api.get('/game/wm/skill/list', params);
/** 技能详情 */
export const getSkillById = (id: string | number) => Api.get(`/game/wm/skill/${id}`);
/** 新增技能 */
export const addSkill = (params: object) => Api.post('/game/wm/skill', params);
/** 修改技能 */
export const updateSkill = (params: object) => Api.put('/game/wm/skill', params);
/** 删除技能 */
export const deleteSkill = (ids: string | number) => Api.delete(`/game/wm/skill/${ids}`);

/** 装备列表 */
export const getEquipmentList = (params: object) => Api.get('/game/wm/equipment/list', params);
/** 装备详情 */
export const getEquipmentById = (id: string | number) => Api.get(`/game/wm/equipment/${id}`);
/** 新增装备 */
export const addEquipment = (params: object) => Api.post('/game/wm/equipment', params);
/** 修改装备 */
export const updateEquipment = (params: object) => Api.put('/game/wm/equipment', params);
/** 删除装备 */
export const deleteEquipment = (ids: string | number) => Api.delete(`/game/wm/equipment/${ids}`);

/** 代码列表 */
export const getCharacterList = (params: object) => Api.get('/game/wm/character/list', params);
/** 代码详情 */
export const getCharacterById = (id: string | number) => Api.get(`/game/wm/character/${id}`);
/** 新增代码 */
export const addCharacter = (params: object) => Api.post('/game/wm/character', params);
/** 修改代码 */
export const updateCharacter = (params: object) => Api.put('/game/wm/character', params);
/** 删除代码 */
export const deleteCharacter = (ids: string | number) => Api.delete(`/game/wm/character/${ids}`);

/** 违规列表 */
export const getViolationList = (params: object) => Api.get('/game/wm/violation/list', params);
/** 违规详情 */
export const getViolationById = (id: string | number) => Api.get(`/game/wm/violation/${id}`);
/** 新增违规 */
export const addViolation = (params: object) => Api.post('/game/wm/violation', params);
/** 修改违规 */
export const updateViolation = (params: object) => Api.put('/game/wm/violation', params);
/** 删除违规 */
export const deleteViolation = (ids: string | number) => Api.delete(`/game/wm/violation/${ids}`);
