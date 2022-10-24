import { Api } from '@/service';

/**
 * 获取时价列表
 */
export const getWmCurrentPriceTypeData = () => Api.get('/wm/current/price/type/list');

export const getWmCurrentPriceTypeAndData = () => Api.get('/wm/current/price/type/last-week');

/**
 * 获取时价类型详情
 * @param id 时价类型ID
 */
export const getWmCurrentPriceTypeDataById = (id: string) => Api.get(`/wm/current/price/type/${id}`);

/**
 * 添加时价类型
 */
export const addWmCurrentPriceTypeData = (params: object) => Api.post('/wm/current/price/type', params);

/**
 * 更新时价类型
 */
export const updateWmCurrentPriceTypeData = (params: object) => Api.put('/wm/current/price/type', params);

/**
 * 根据ID删除时价类型
 */
export const deleteWmCurrentPriceTypeData = (id: string) => Api.delete(`/wm/current/price/type/${id}`);

/**
 * 根据时价ID获取时价详情
 */
export const getWmCurrentPriceDataById = (id: string) => Api.get(`/wm/current/price/${id}`);

/**
 * 添加时价
 */
export const addWmCurrentPriceData = (params: object) => Api.post('/wm/current/price', params);

/**
 * 更新时价
 */
export const updateWmCurrentPriceData = (params: object) => Api.put('/wm/current/price', params);

/**
 * 根据ID删除时价
 */
export const deleteWmCurrentPriceData = (id: string) => Api.delete(`/wm/current/price/${id}`);

/**
 * 根据时价及时价类型查询服务器列表
 */
export const getWmCurrentPriceServerByDate = (params: object) => Api.get('/wm/current/price/date', params);

/**
 * 分享今日时价
 */
export const getWmCurrentPriceShare = (params: object) => Api.post('/wm/current/price/share', params);
