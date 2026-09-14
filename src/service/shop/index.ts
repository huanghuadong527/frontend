import { Api } from '@/service';

/** 商品列表 */
export const getGoodsList = (params: object) => Api.get('/shop/goods/list', params);
/** 商品详情 */
export const getGoodsById = (id: string | number) => Api.get(`/shop/goods/info/${id}`);
/** 新增商品 */
export const addGoods = (params: object) => Api.post('/shop/goods', params);
/** 修改商品 */
export const updateGoods = (params: object) => Api.put('/shop/goods', params);
/** 删除商品 */
export const deleteGoods = (ids: string | number) => Api.delete(`/shop/goods/${ids}`);

/** 材质列表 */
export const getMaterialList = (params: object) => Api.get('/shop/material/list', params);
/** 材质下拉列表 */
export const getMaterialOption = () => Api.get('/shop/material/option');
/** 材质详情 */
export const getMaterialById = (id: string | number) => Api.get(`/shop/material/info/${id}`);
/** 新增材质 */
export const addMaterial = (params: object) => Api.post('/shop/material', params);
/** 修改材质 */
export const updateMaterial = (params: object) => Api.put('/shop/material', params);
/** 删除材质 */
export const deleteMaterial = (id: string | number) => Api.delete(`/shop/material/${id}`);

/** 报表列表 */
export const getReportList = (params: object) => Api.get('/shop/report/list', params);
/** 报表详情 */
export const getReportById = (id: string | number) => Api.get(`/shop/report/${id}`);
