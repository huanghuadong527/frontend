import { Api } from '@/service';

/**
 * 获取岗位详情
 * @param id 岗位ID
 */
export const getPostDataById = (id: string) => Api.get(`/system/post/${id}`);
/**
 * 新增岗位
 */
export const addPostData = (params: object) => Api.post('/system/post', params);
/**
 * 修改岗位
 */
export const updatePostData = (params: object) => Api.put('/system/post', params);
/**
 * 删除岗位
 * @param id 岗位ID
 */
export const deletePostData = (id: string) => Api.delete(`/system/post/${id}`);


