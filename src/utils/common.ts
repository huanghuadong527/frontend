/**
 * 判断变量是否为空
 * @param str 变量
 * @returns
 */
export const isEmpty = (str: any) => {
	return str === undefined || str === null || str === '';
};

/**
 * 获取路径上的文件名（含格式）
 * @param path 文件相对路径
 * @returns
 */
export const getFileName = (path: string) => {
	return path.split('/').pop() ?? '';
};

/**
 * 参数处理
 * @param params 参数
 * @returns
 */
export const tansParams = (params: CObject) => {
	let result = '';
	for (const propName of Object.keys(params)) {
		const value = params[propName];
		var part = encodeURIComponent(propName) + '=';
		if (value !== null && value !== '' && typeof value !== 'undefined') {
			if (typeof value === 'object') {
				for (const key of Object.keys(value)) {
					if (
						value[key] !== null &&
						value[key] !== '' &&
						typeof value[key] !== 'undefined'
					) {
						let params = propName + '[' + key + ']';
						var subPart = encodeURIComponent(params) + '=';
						result += subPart + encodeURIComponent(value[key]) + '&';
					}
				}
			} else {
				result += part + encodeURIComponent(value) + '&';
			}
		}
	}
	return result;
};
