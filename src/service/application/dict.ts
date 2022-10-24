import { Api } from '@/service';

/**
 * 获取数据字典信息列表
 */
export const getDictTypes = (params: object) => Api.get('/system/dict/type/list', params);
/**
 * 查询字典类型详细
 * @param id 字典ID
 */
export const getDictTypeById = (id: string) => Api.get(`/system/dict/type/${id}`);
/**
 * 查询字典信息详情
 * @param id 字典信息ID
 */
export const getDictDataById = (id: string) => Api.get(`/system/dict/data/${id}`);
/**
 * 根据字典类型查询字典数据信息
 * @param type 字典类型
 */
export const getDictTypeByType = (type: string) => Api.get(`/system/dict/data/type/${type}`);
/**
 * 根据字典类型查询字典数据集合
 * @param types 字典类型集合
 */
export const getDictTypeByTypes = (types: string) => Api.get(`/system/dict/data/types/${types}`);
/**
 * 获取字典信息列表
 * @param params pageNum pageSize dictType
 */
export const getDictDataByType = (params: object) => Api.get('/system/dict/data/list', params);
/**
 * 获取字典选择框列表
 */
export const getDictSelectOptionData = () => Api.get('/system/dict/type/optionselect');
/**
 * 新增字典类型
 */
export const addDictType = (params: object) => Api.post('/system/dict/type', params);
/**
 * 新增字典信息
 */
export const addDictData = (params: object) => Api.post('/system/dict/data', params);
/**
 * 修改字典类型
 */
export const updateDictType = (params: object) => Api.put('/system/dict/type', params);
/**
 * 修改字典信息
 */
export const updateDictData = (params: object) => Api.put('/system/dict/data', params);
/**
 * 删除字典类型
 */
export const deleteDictType = (id: string) => Api.delete(`/system/dict/type/${id}`);
/**
 * 删除字典信息
 */
export const deleteDictData = (id: string) => Api.delete(`/system/dict/data/${id}`);



















