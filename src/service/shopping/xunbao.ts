import { Api } from '@/service';

export const getWmServiceAreaData = () => Api.get('/xunbao/getWmServiceAreaData');

export const getWmGoodsData = (params: object) => Api.get('/xunbao/getWmGoodsData', params);

export const getWmGoodsTotal = (params: object) => Api.get('/xunbao/getWmGoodsTotal', params);

export const getWmGoodsDetail = (params: object) => Api.get('/xunbao/getWmGoodsDetail', params);
