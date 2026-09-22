import axios from 'axios';
import store, { clear } from '@/store';
import {
	API_URL,
	CACHE_VALIDATE,
	ERROR_CODE,
	SERVICE_TIMEOUT,
	TIP_LIMIT_SIZE,
	TIP_REPORT,
	TOKEN_COOKIE_KEY
} from '@/core';
import { CACHE, isEmpty, tansParams } from '@/utils';
import { confirm } from '@/plugins/confirm';
import { message } from '@/plugins/message';

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8';

const service = axios.create({
	baseURL: API_URL,
	timeout: SERVICE_TIMEOUT
});

// 请求拦截器
service.interceptors.request.use(
	(request) => {
		// 系统缓存
		const state = store.getState();
		// 是否需要设置token
		const isToken = request.headers.isToken === false;
		// 是否需要防止数据重复提交
		const isRepeat = request.headers.repeatSubmit === false;
		// 重复提交间隔时间(ms)
		const interval = (request.headers.interval || 1000) as number;

		if (state && state.root.token && !isToken) {
			request.headers[TOKEN_COOKIE_KEY] = 'Bearer ' + state.root.token;
		}

		if (request.method) {
			const method = request.method.toLowerCase();
			// GET请求映射参数
			if (method === 'get' && request.params) {
				let url = request.url + '?' + tansParams(request.params);
				url = url.slice(0, -1);
				request.params = {};
				request.url = url;
			}

			if (!isRepeat && (method === 'post' || method === 'put')) {
				const params = {
					url: request.url,
					data:
						typeof request.data === 'object'
							? JSON.stringify(request.data)
							: request.data,
					time: new Date().getTime()
				};
				// 请求数据大小
				const resSize = Object.keys(JSON.stringify(params)).length;
				// 限制存放数据5M
				const limitSize = 5 * 1024 * 1024;
				if (resSize >= limitSize) {
					console.warn(`[${request.url}]: ${TIP_LIMIT_SIZE}`);
					return request;
				}
				const validate = CACHE.SESSION.getJSON(CACHE_VALIDATE);
				if (isEmpty(validate)) {
					CACHE.SESSION.setJSON(CACHE_VALIDATE, params);
				} else {
					const v_url = validate.url;
					const v_data = validate.data;
					const v_time = validate.time;
					if (
						v_data === params.data &&
						params.time - v_time < interval &&
						v_url === params.url
					) {
						console.warn(`[${v_url}]: ${TIP_REPORT}`);
						return Promise.reject(new Error());
					} else {
						CACHE.SESSION.setJSON(CACHE_VALIDATE, params);
					}
				}
			}
		}
		return request;
	},
	(error) => {
		console.error(error);
		return Promise.reject(error);
	}
);

// 响应拦截器
service.interceptors.response.use(
	(response) => {
		const code = response.data.code || 200;
		const msg = ERROR_CODE[code] || response.data.msg || ERROR_CODE['default'];
		const type = response.request.responseType;

		if (type === 'blob' || type == 'arraybuffer') {
			return response.data;
		}

		if (code === 401) {
			confirm({
				type: 'info',
				title: '系统提示',
				content: '登录状态已过期，您可以继续留在该页面，或者重新登录',
				confirmationText: '重新登录',
				onOk() {
					store.dispatch(clear());
					window.location.href = '/login';
				}
			});
			return Promise.reject('无效的会话, 或者会话已过期, 请重新登录.');
		} else if (code === 500) {
			message.error(msg);
			return Promise.reject(new Error(msg));
		} else if (code === 601) {
			message.warning(msg);
			return Promise.reject('error');
		} else if (code !== 200) {
			message.error(msg);
			return Promise.reject(msg);
		} else {
			return response.data;
		}
	},
	(error) => {
		console.error('ERROR: ' + error);
		if (error.message == 'Network Error') {
			error.message = '后端接口连接异常';
		} else if (error.message.includes('timeout')) {
			error.message = '系统接口请求超时';
		} else if (error.message.includes('Request failed with status code')) {
			error.message = '系统接口' + error.message.slice(-3) + '异常';
		}
		message.error(error.message);
		return Promise.reject(error);
	}
);

export { service };
