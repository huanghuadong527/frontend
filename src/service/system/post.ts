import { service } from '@/utils';

/** 岗位列表 */
export const getPostList = (params: object) =>
	service.get(`/system/post/list`, { params });

/** 岗位详情 */
export const getPostById = (id: string | number) =>
	service.get(`/system/post/${id}`);

/** 新增岗位 */
export const addPost = (params: object) => service.post(`/system/post`, params);

/** 修改岗位 */
export const updatePost = (params: object) => service.put(`/system/post`, params);

/** 删除岗位 */
export const deletePost = (id: string | number) =>
	service.delete(`/system/post/${id}`);
