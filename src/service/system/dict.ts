import { service } from '@/utils';

/** 按类型查询字典数据 */
export const getDictDataByType = (type: string) =>
	service.get(`/system/dict/data/type/${type}`);

/** 按类型集合查询字典数据 */
export const getDictDataByTypes = (types: string) =>
	service.get(`/system/dict/data/types/${types}`);

/** 字典类型列表 */
export const getDictTypeList = (params: object) =>
	service.get(`/system/dict/type/list`, { params });

/** 字典类型详情 */
export const getDictTypeById = (id: string | number) =>
	service.get(`/system/dict/type/${id}`);

/** 新增字典类型 */
export const addDictType = (params: object) =>
	service.post(`/system/dict/type`, params);

/** 修改字典类型 */
export const updateDictType = (params: object) =>
	service.put(`/system/dict/type`, params);

/** 删除字典类型 */
export const deleteDictType = (id: string | number) =>
	service.delete(`/system/dict/type/${id}`);

/** 字典类型下拉列表 */
export const getDictTypeOptionSelect = () =>
	service.get(`/system/dict/type/optionselect`);

/** 字典数据列表 */
export const getDictDataList = (params: object) =>
	service.get(`/system/dict/data/list`, { params });

/** 字典数据详情 */
export const getDictDataById = (id: string | number) =>
	service.get(`/system/dict/data/${id}`);

/** 新增字典数据 */
export const addDictData = (params: object) =>
	service.post(`/system/dict/data`, params);

/** 修改字典数据 */
export const updateDictData = (params: object) =>
	service.put(`/system/dict/data`, params);

/** 删除字典数据 */
export const deleteDictData = (id: string | number) =>
	service.delete(`/system/dict/data/${id}`);
