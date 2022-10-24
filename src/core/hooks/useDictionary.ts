import { getDictTypeByTypes } from '@/service';
import { useCallback, useEffect, useState } from 'react';

export interface useDictionaryOption {
	value: string;
	label: string;
}

export interface DictionaryInterface {
	[key: string]: useDictionaryOption[];
}

export interface useDictionaryInterface {
	dictionary: DictionaryInterface;
	getDictLabel: (type: string, value: any) => string;
}

/**
 * 字典
 * @params types 字典TYPE集合
 * @returns
 */
const useDictionary = (types: string[]): useDictionaryInterface => {
	const [dictionary, setDictionary] = useState<DictionaryInterface>({});

  /**
   * 根据字典类型集合获取字典集合
   * @params types 字典TYPE集合
   */
	const getDictionaryByTypes = useCallback(
		(types: string) => {
			getDictTypeByTypes(types).then((result) => {
				if (result.code == 200) {
					if (result.data) {
						Object.keys(result.data).forEach((key) => {
							result.data[key] = result.data[key].map((v: any) => {
								return {
									value: v.dictValue,
									label: v.dictLabel,
								};
							});
						});
						setDictionary(result.data);
					}
				}
			});
		},
		[dictionary]
	);

  /**
   * 获取字典数据Label
   * @params type 字典类型
   * @params value 字典数据Key
   */
	const getDictLabel = useCallback(
		(type: string, value: any) => {
			if (type && dictionary[type]) {
				const dict = dictionary[type].find((item) => item.value == value);
				if (dict) {
					return dict.label;
				}
			}
			return '--';
		},
		[dictionary]
	);

	useEffect(() => {
		getDictionaryByTypes(types.join(','));
	}, []);

	return {
		dictionary,
		getDictLabel,
	};
};

export { useDictionary };
