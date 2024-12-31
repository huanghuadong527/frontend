/**
 * 突出字符串重点部分
 *
 * @param str [示例]
 * @param className default text-error
 * @returns <span class="text-error">示例</span>
 */
export const getKeynote = (str: string, className = 'text-error'): string => {
	if (!str.includes('[')) {
		return str;
	}
	const note = str.match(/\[(.*?)\]/);
	if (!note) {
		return str;
	}
	return getKeynote(
		str.replace(note[0], `<span class="${className}">${note[1]}</span>`),
		className
	);
};

/**
 * 获取路径上文件名（含格式）
 * @param path
 * @returns
 */
export const getFileName = (path: string) => {
	return path.split('/').pop();
};
