import store, { delToken, delSelectable, delTabs } from '@/store';
import axios, {
	AxiosRequestConfig,
	AxiosResponse,
	AxiosError,
	Method,
} from 'axios';
import { message } from 'antd';
import { SY_KEY, TOKEN_COOKIE_KEY } from '@/core';
import { SY_CONFIG } from '@/core/config';
import nProgress from 'nprogress';
import { useNavigate } from 'react-router-dom';

export interface AxiosConfig extends AxiosRequestConfig {
	code?: string;
	type?: 'upload' | null;
}

axios.interceptors.request.use((request) => {
	if (store) {
		const state = store.getState();
		if (state.common && state.common.token) {
			request.headers![TOKEN_COOKIE_KEY] = `Bearer ${state.common.token}`;
		}
	}
	return request;
});

axios.interceptors.response.use((response) => {
	return response;
});

function onSuccessInterceptEvent(response: AxiosResponse<any>) {
	// console.log(response);
}

/**
 * 请求异常拦截
 */
function onErrorInterceptEvent(error: AxiosError) {
	message.destroy(SY_KEY);
	nProgress.done();
	if (error && error.response && error.response.data) {
		const data = error.response.data;
		// if (data.status == 500) {
		// 	message.error('系统异常, 请联系管理员!');
		// } else if (data.status == 400) {
		// 	if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
		// 		message.error(data.errors[0].defaultMessage);
		// 	}
		// } else {
		// 	message.error(data.resultMessage);
		// }
	} else {
		message.error({
			key: SY_KEY,
			content: '请求异常',
		});
	}
}

/**
 * 后台返回码定义 参考 com.siyang.com.enums.ResultCode
 * @param data code msg data
 */
function onStatusInterceptEvent(data: JsonResult) {
	message.destroy(SY_KEY);
	switch (data.code) {
		case 500:
			message.error(data.msg);
			nProgress.done();
			break;
		case 401 ||
			2001 ||
			2002 ||
			2003 ||
			2004 ||
			2005 ||
			2006 ||
			2007 ||
			2008 ||
			2009:
			store.dispatch(delSelectable);
			store.dispatch(delTabs);
			store.dispatch(delToken);
			window.location.replace('/#/login');
			return;
		default:
			message.error({
				key: SY_KEY,
				content: data.msg,
			});
			break;
	}
}

const Service = (options: AxiosConfig, data?: any) => {
	// 默认配置
	let config: AxiosConfig = {
		timeout: 60000,
		method: 'POST',
		baseURL: SY_CONFIG.proxy,
		headers: {
			'Content-Type': 'application/json; charset=UTF-8',
			'Access-Control-Expose-Headers': 'ssep_token',
		},
		...options,
	};

	// 添加发送数据
	if (
		config.method === 'PUT' ||
		config.method === 'POST' ||
		config.method === 'PATCH' ||
		config.method === 'put' ||
		config.method === 'post' ||
		config.method === 'patch'
	) {
		if (config.type && config.type == 'upload') {
			config = { ...config, data };
		} else {
			config = { ...config, data: JSON.stringify(data) };
		}
	} else {
		config = { ...config, params: data };
	}

	return new Promise<JsonResult>((resolve, reject) => {
		if (!config.url) {
			return;
		}
		nProgress.start();
		axios(config)
			.then((request) => {
				nProgress.done();
				onSuccessInterceptEvent(request);
				const data = request.data as JsonResult;
				if (data.code == 200 || data.code == undefined) {
					resolve(request.data as JsonResult);
				} else {
					reject(data);
					onStatusInterceptEvent(data);
				}
			})
			.catch((error) => {
				onErrorInterceptEvent(error);
				reject(error);
			});
	});
};

/**
 * 请求服务 GET POST PUT DELETE
 */
class ApiService<T = any> {
	request(url: string, method: Method, data?: T) {
		return Service({ url, method }, data);
	}

	download(url: string, data?: T, method: Method = 'POST') {
		return Service(
			{
				url,
				method,
				responseType: 'blob',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			},
			data
		);
	}

	get(url: string, data?: T) {
		return this.request(url, 'GET', data);
	}

	post(url: string, data?: T) {
		return this.request(url, 'POST', data);
	}

	put(url: string, data?: T) {
		return this.request(url, 'PUT', data);
	}

	delete(url: string, data?: T) {
		return this.request(url, 'DELETE', data);
	}
}

const Api = new ApiService();

export { Service, Api };
