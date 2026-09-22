import { service } from '@/utils';

/**
 * 登录
 * @param param username password
 * @returns token
 */
export const login = (param: object) =>
	service.post(`/login`, param, { headers: { isToken: false } });

/**
 * 上传图片
 * @param data FormData（字段名 file）
 * @returns { url } 文件相对地址
 */
export const uploadImage = (data: FormData): Promise<AnyObject> =>
	service.post(`/upload/image`, data, {
		headers: { 'Content-Type': 'multipart/form-data' }
	});

/**
 * 上传文件
 * @param data FormData（字段名 file）
 * @returns { url } 文件相对地址
 */
export const uploadFile = (data: FormData): Promise<AnyObject> =>
	service.post(`/upload/file`, data, {
		headers: { 'Content-Type': 'multipart/form-data' }
	});

/**
 * 下载文件
 * @param fileName 文件相对路径(如 /file/2025/07/10/xxx.zip)
 * @returns Blob
 */
export const downloadFile = (fileName: string) =>
	service.get(`/upload/download`, {
		params: { fileName },
		responseType: 'blob'
	});

/**
 * 获取系统用户权限
 * @returns 用户信息 权限列表
 */
export const getSystemUserInfo = () => service.get(`/getInfo`);

/**
 * 更新系统用户基本资料
 * @param params nickName sex phonenumber email avatar
 */
export const updateSystemUserInfo = (params: object) =>
	service.put(`/system/user/profile`, params);

/**
 * 更新系统用户密码
 * @param params oldPassword newPassword
 */
export const updateSystemUserPwd = (params: object) =>
	service.put(`/system/user/profile/updatePwd`, params);

/**
 * 获取系统资源
 * @returns 菜单树（仅目录/菜单，不含按钮）
 */
export const getSystemResource = () => service.get(`/system/menu/userMenuTree`);
