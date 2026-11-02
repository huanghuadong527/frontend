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

/** 教程列表 */
export const getTutorialList = (params: object) =>
	service.get(`/game/wm/tutorial/list`, { params });

/** 教程详情 */
export const getTutorialById = (id: string | number) =>
	service.get(`/game/wm/tutorial/${id}`);

/** 新增教程 */
export const addTutorial = (params: object) =>
	service.post(`/game/wm/tutorial`, params);

/** 修改教程 */
export const updateTutorial = (params: object) =>
	service.put(`/game/wm/tutorial`, params);

/** 删除教程 */
export const deleteTutorial = (ids: string | number) =>
	service.delete(`/game/wm/tutorial/${ids}`);

/** 骑宠列表 */
export const getMountPetList = (params: object) =>
	service.get(`/game/wm/mount-pet/list`, { params });

/** 骑宠详情 */
export const getMountPetById = (id: string | number) =>
	service.get(`/game/wm/mount-pet/${id}`);

/** 新增骑宠 */
export const addMountPet = (params: object) =>
	service.post(`/game/wm/mount-pet`, params);

/** 修改骑宠 */
export const updateMountPet = (params: object) =>
	service.put(`/game/wm/mount-pet`, params);

/** 删除骑宠 */
export const deleteMountPet = (ids: string | number) =>
	service.delete(`/game/wm/mount-pet/${ids}`);

/** 商人排行榜 TOP5 */
export const getMerchantRankTop = () => service.get(`/game/merchant/rank/top`);

/** 商人排行榜列表 */
export const getMerchantList = (params: object) =>
	service.get(`/game/merchant/list`, { params });

/** 商人详情 */
export const getMerchantById = (id: string | number) =>
	service.get(`/game/merchant/${id}`);

/** 商人访问打点 */
export const visitMerchant = (id: string | number, params?: object) =>
	service.get(`/game/merchant/${id}/visit`, { params });

/** 常用业务列表 */
export const getMerchantBusinessList = (params: object) =>
	service.get(`/game/merchant/business/list`, { params });

/** 新增常用业务 */
export const addMerchantBusiness = (params: object) =>
	service.post(`/game/merchant/business`, params);

/** 修改常用业务 */
export const updateMerchantBusiness = (params: object) =>
	service.put(`/game/merchant/business`, params);

/** 删除常用业务 */
export const deleteMerchantBusiness = (ids: string | number) =>
	service.delete(`/game/merchant/business/${ids}`);

/** 生产列表 */
export const getProductionList = (params: object) =>
	service.get(`/game/wm/production/list`, { params });

/** 生产详情 */
export const getProductionById = (id: string | number) =>
	service.get(`/game/wm/production/${id}`);

/** 新增生产 */
export const addProduction = (params: object) =>
	service.post(`/game/wm/production`, params);

/** 修改生产 */
export const updateProduction = (params: object) =>
	service.put(`/game/wm/production`, params);

/** 删除生产 */
export const deleteProduction = (ids: string | number) =>
	service.delete(`/game/wm/production/${ids}`);

/** 家园列表 */
export const getHomeList = (params: object) =>
	service.get(`/game/wm/home/list`, { params });

/** 家园详情 */
export const getHomeById = (id: string | number) =>
	service.get(`/game/wm/home/${id}`);

/** 新增家园 */
export const addHome = (params: object) => service.post(`/game/wm/home`, params);

/** 修改家园 */
export const updateHome = (params: object) => service.put(`/game/wm/home`, params);

/** 删除家园 */
export const deleteHome = (ids: string | number) =>
	service.delete(`/game/wm/home/${ids}`);

/** 计时器分组列表 */
export const getTimerGroupList = (params?: object) =>
	service.get(`/game/wm/timer/group/list`, { params });

/** 新增计时器分组 */
export const addTimerGroup = (params: object) =>
	service.post(`/game/wm/timer/group`, params);

/** 修改计时器分组 */
export const updateTimerGroup = (params: object) =>
	service.put(`/game/wm/timer/group`, params);

/** 删除计时器分组 */
export const deleteTimerGroup = (ids: string | number) =>
	service.delete(`/game/wm/timer/group/${ids}`);

/** 计时器BOSS列表 */
export const getTimerBossList = (params?: object) =>
	service.get(`/game/wm/timer/boss/list`, { params });

/** 计时器BOSS详情 */
export const getTimerBossById = (id: string | number) =>
	service.get(`/game/wm/timer/boss/${id}`);

/** 新增计时器BOSS */
export const addTimerBoss = (params: object) =>
	service.post(`/game/wm/timer/boss`, params);

/** 修改计时器BOSS */
export const updateTimerBoss = (params: object) =>
	service.put(`/game/wm/timer/boss`, params);

/** 删除计时器BOSS */
export const deleteTimerBoss = (ids: string | number) =>
	service.delete(`/game/wm/timer/boss/${ids}`);

/** 币价列表 */
export const getCurrencyPriceList = (params: object) =>
	service.get(`/game/wm/currency-price/list`, { params });

/** 币价详情 */
export const getCurrencyPriceById = (id: string | number) =>
	service.get(`/game/wm/currency-price/${id}`);

/** 新增币价 */
export const addCurrencyPrice = (params: object) =>
	service.post(`/game/wm/currency-price`, params);

/** 修改币价 */
export const updateCurrencyPrice = (params: object) =>
	service.put(`/game/wm/currency-price`, params);

/** 删除币价 */
export const deleteCurrencyPrice = (ids: string | number) =>
	service.delete(`/game/wm/currency-price/${ids}`);
