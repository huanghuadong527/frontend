import { Key, PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { Empty, Input, Spin, Tree, TreeProps } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';
import { DataNode } from 'antd/lib/tree';
import { toTreeArray } from 'xe-utils';

interface SearchTreeType {
	loading: boolean;
	treeOptions?: PropsWithChildren<TreeProps<any>>;
	treeData: DataNode[];
}

const getParentKey = (key: React.Key, tree: DataNode[]): React.Key => {
	let parentKey: React.Key;
	for (let i = 0; i < tree.length; i++) {
		const node = tree[i];
		if (node.children) {
			if (node.children.some((item) => item.key === key)) {
				parentKey = node.key;
			} else if (getParentKey(key, node.children)) {
				parentKey = getParentKey(key, node.children);
			}
		}
	}
	return parentKey!;
};

const SearchTree = (props: SearchTreeType) => {
	const [searchVal, setSearchVal] = useState('');
	const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);
	const [autoExpandParent, setAutoExpandParent] = useState(true);

	const dataList = useMemo(() => {
		return toTreeArray(props.treeData, {});
	}, [props.treeData]);

	const allDataKey = useMemo(() => {
		const items = toTreeArray(props.treeData);
		return items.map((item) => item.key);
	}, [props.treeData]);

	const onSearch = (value: string) => {
		const newExpandedKeys = dataList
			.map((item) => {
				if ((item.title as string).indexOf(value) > -1) {
					return getParentKey(item.key, props.treeData);
				}
				return null;
			})
			.filter((item, i, self) => item && self.indexOf(item) === i);
		setExpandedKeys(newExpandedKeys as React.Key[]);
		setSearchVal(value);
		setAutoExpandParent(true);
	};

	const onExpand = (newExpandedKeys: Key[]) => {
		setExpandedKeys(newExpandedKeys);
		setAutoExpandParent(false);
	};

	const searchTreeData = useMemo(() => {
		const loop = (data: DataNode[]): DataNode[] =>
			data.map((item) => {
				const strTitle = item.title as string;
				const index = strTitle.indexOf(searchVal);
				const beforeStr = strTitle.substring(0, index);
				const afterStr = strTitle.slice(index + searchVal.length);
				const title =
					index > -1 ? (
						<span>
							{beforeStr}
							<span className='mes-search-tree--select'>{searchVal}</span>
							{afterStr}
						</span>
					) : (
						<span>{strTitle}</span>
					);
				if (item.children) {
					return { title, key: item.key, children: loop(item.children) };
				}
				return { title, key: item.key };
			});
		return loop(props.treeData);
	}, [searchVal, props.treeData]);

	useEffect(() => {
		setExpandedKeys(allDataKey);
	}, [props.treeData]);

	return (
		<div className='mes-content--sider flex-column'>
			<div className='mb-xs'>
				<Input.Search
          allowClear
					enterButton
					placeholder='请输入搜索关键字'
					onSearch={onSearch}
				/>
			</div>
			<Spin
				wrapperClassName='mes-content--sider__body'
				spinning={props.loading}
			>
				{props.treeData && props.treeData.length > 0 ? (
					<Tree
						{...props.treeOptions}
						showLine
						blockNode
						defaultExpandAll={true}
						expandedKeys={expandedKeys}
						switcherIcon={<CaretDownOutlined />}
						treeData={searchTreeData}
						autoExpandParent={autoExpandParent}
						onExpand={onExpand}
					/>
				) : (
					<Empty />
				)}
			</Spin>
		</div>
	);
};

export { SearchTree };
