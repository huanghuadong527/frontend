import { ChangeEvent, useState } from 'react';
import { SearchOutlined, SyncOutlined } from '@ant-design/icons';
import { Button, Input, Space } from 'antd';

interface DynamicSearchType {
	onSearch?: (value: string) => void;
	onReset?: () => void;
}

/**
 * 搜索栏
 */
const DynamicSearch = ({ onSearch, onReset }: DynamicSearchType) => {
	const [searchVal, setSearchVal] = useState('');

	const onSearchCallBack = () => {
		if (onSearch) {
			onSearch(searchVal);
		}
	};

	const onCancelCallBack = () => {
		setSearchVal('');
		if (onSearch) {
			onSearch('');
		}
		if (onReset) {
			onReset();
		}
	};

	const onChangeCallBack = ({ target }: ChangeEvent<HTMLInputElement>) => {
		const { value: inputValue } = target;
		setSearchVal(inputValue);
	};

	return (
		<Space>
			<Input
				placeholder='按文档搜索'
				value={searchVal}
				onChange={onChangeCallBack}
			/>
			<Button
				type='primary'
				icon={<SearchOutlined />}
				onClick={onSearchCallBack}
			>
				搜索
			</Button>
			<Button icon={<SyncOutlined />} onClick={onCancelCallBack}>
				重置
			</Button>
		</Space>
	);
};

export { DynamicSearch };
