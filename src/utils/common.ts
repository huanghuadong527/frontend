/**
 * 判断变量是否为空
 * @param str 变量
 * @returns
 */
export const isEmpty = (str: any) => {
	return str === undefined || str === null || str === '';
};

/**
 * 参数处理
 * @param params 参数
 * @returns
 */
export const tansParams = (params: AnyObject) => {
	let result = '';
	for (const propName of Object.keys(params)) {
		const value = params[propName];
		const part = encodeURIComponent(propName) + '=';
		if (value !== null && value !== '' && typeof value !== 'undefined') {
			if (typeof value === 'object') {
				for (const key of Object.keys(value)) {
					if (
						value[key] !== null &&
						value[key] !== '' &&
						typeof value[key] !== 'undefined'
					) {
						const params = propName + '[' + key + ']';
						const subPart = encodeURIComponent(params) + '=';
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
