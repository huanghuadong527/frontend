import { service } from '@/utils';

/** 商品列表 */
export const getGoodsList = (params: object) =>
	service.get(`/shop/goods/list`, { params });

/** 商品详情 */
export const getGoodsById = (id: string | number) =>
	service.get(`/shop/goods/info/${id}`);

/** 新增商品 */
export const addGoods = (params: object) => service.post(`/shop/goods`, params);

/** 修改商品 */
export const updateGoods = (params: object) => service.put(`/shop/goods`, params);

/** 删除商品 */
export const deleteGoods = (ids: string | number) =>
	service.delete(`/shop/goods/${ids}`);

/** 材质列表 */
export const getMaterialList = (params: object) =>
	service.get(`/shop/material/list`, { params });

/** 材质下拉列表 */
export const getMaterialOption = () => service.get(`/shop/material/option`);

/** 材质详情 */
export const getMaterialById = (id: string | number) =>
	service.get(`/shop/material/info/${id}`);

/** 新增材质 */
export const addMaterial = (params: object) =>
	service.post(`/shop/material`, params);

/** 修改材质 */
export const updateMaterial = (params: object) =>
	service.put(`/shop/material`, params);

/** 删除材质 */
export const deleteMaterial = (id: string | number) =>
	service.delete(`/shop/material/${id}`);

/** 报表列表 */
export const getReportList = (params: object) =>
	service.get(`/shop/report/list`, { params });

/** 报表详情 */
export const getReportById = (id: string | number) =>
	service.get(`/shop/report/${id}`);
