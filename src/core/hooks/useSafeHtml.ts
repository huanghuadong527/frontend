import { useCallback } from 'react';

export const useSafeHtml = () => {
	/**
	 * 商品信息解析
	 */
	const safeHtml = useCallback((html: string) => {
		if (html) {
			var s =
				html.replace(/\ +/g, '').replace(/\s/g, '&nbsp;') +
				'&nbsp;&nbsp;&nbsp;';
			var array = new Array();
			var lastColor = 'ffffff';
			array.push(`<font style='color:#${lastColor}'>`);
			var re = /\^\w{6}/;
			for (var i = 0; i < s.length; ) {
				var c = s.charAt(i);
				var temp = s.substring(i, i + 7);
				var result = temp.match(re);
				if (result) {
					array.push(`</font><font style='color:#${temp.substring(1)}'>`);
					lastColor = temp.substring(1);
					i = i + 7;
				} else if (c == '\\' && s.charAt(i + 1) == 'r') {
					array.push(`</font><br/><font style='color:#${lastColor}'>`);
					i = i + 2;
				} else {
					array.push(s.charAt(i));
					i++;
				}
			}
			array.push('&nbsp;</font>');
			return array.join('');
		}
		return '';
	}, []);

	/**
	 * 技能描述信息浮动层内容解析
	 */
	const skillsSafeHtml = useCallback((html: string) => {
		if (html) {
			let text = html
				.replace(/\ +/g, '')
				.replace(/^(?:\\r\\n)|^(?:\\r){0,}/, '');
			text = text.replace(/\^(\w{6})/g, '</font><font style="color:#$1;">');
			text = text.substr(7);
			text = text.replace(/(?:\\r\\n)|(?:\\r)/g, '<br/>') + '</font>';
			return text;
		}
		return '';
	}, []);

	const picbookSafeHtml = useCallback((html: string) => {
		if (html) {
			let text = html
				.replace(/\ +/g, '')
				.replace(/^(?:\\r\\n)|^(?:\\r){0,}/, '');
			text =
				'<font style="color:#$1;">' +
				text.replace(/(?:\\r\\n)|(?:\\r)/g, '<br/>') +
				'</font>';
			return text;
		}
		return '';
	}, []);

	const moneySafeValue = useCallback((str: string) => {
		const arr = [];
		for (let i = str.length - 1; i >= 0; i--) {
			arr[arr.length] = str.charAt(i);
			if ((arr.length + 1) % 4 == 0 && i != 0) {
				arr[arr.length] = ',';
			}
		}
		arr.reverse();

		return arr.join('');
	}, []);

	return {
		safeHtml,
		skillsSafeHtml,
		picbookSafeHtml,
		moneySafeValue,
	};
};
