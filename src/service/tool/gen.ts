import { Api } from '@/service';

export const getDBData = () => Api.get(`/tool/gen/db/list`);

/**
 * 导入表结构（保存）
 * @param params tables
 */
export const importTableSave = (params: object) => Api.post('/tool/gen/importTable', params);

/**
 * 预览代码
 * @param id 表ID
 */
export const getCodePreview = (id: string) => Api.get(`/tool/gen/preview/${id}`);

/**
 * 同步数据库
 * @param ids 表ID
 * @returns 
 */
export const synchGenTable = (ids: string) => Api.get(`/tool/gen/synchDb/${ids}`);

/**
 * 批量生成代码
 * @param params tables
 */
export const batchGenCode = (params: object) => Api.download('/tool/gen/batchGenCode', params, 'GET');

/**
 * 修改代码生成业务
 * @param id 表ID
 */
export const getGenTableInfo = (id: string) => Api.get(`/tool/gen/${id}`);
/**
 * 删除代码生成
 */
export const deleteGenTable = (ids: string) => Api.delete(`/tool/gen/${ids}`);


