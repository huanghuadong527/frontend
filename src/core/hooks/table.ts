import { useRef, useState } from 'react';
import type { TablePaginationConfig } from 'antd';
import { service } from '@/utils';

const buildQueryKey = (query: AnyObject) =>
	Object.keys(query)
		.filter((key) => {
			const value = query[key];
			return value !== undefined && value !== null && value !== '';
		})
		.sort()
		.map((key) => `${key}=${JSON.stringify(query[key])}`)
		.join('&');

export const useTable = (url: string, getSearchParams?: () => AnyObject) => {
	const [loading, setLoading] = useState(false);
	const [pageNum, setPageNum] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [total, setTotal] = useState(0);
	const [dataSource, setDataSource] = useState([]);
	const lastQueryKeyRef = useRef('');

	const getData = (param: AnyObject = {}) => {
		const { pageNum: paramPageNum, pageSize: paramPageSize, ...query } = param;
		const search = getSearchParams ? getSearchParams() : {};
		const mergedQuery = { ...search, ...query };
		const queryKey = buildQueryKey(mergedQuery);
		setLoading(true);
		setDataSource([]);
		// 查询条件变化(搜索/筛选/树节点切换)时回到第一页；
		// 条件未变(如新增/编辑/删除后的刷新)时保持当前页；翻页显式传入 pageNum 优先。
		const page = paramPageNum ?? (queryKey !== lastQueryKeyRef.current ? 1 : pageNum);
		lastQueryKeyRef.current = queryKey;
		const size = paramPageSize ?? pageSize;
		setPageNum(page);
		setPageSize(size);
		service
			.get(url, {
				params: {
					...search,
					...query,
					pageNum: page,
					pageSize: size
				}
			})
			.then(
				(result) => {
					setLoading(false);
					if (result.data) {
						setTotal(result.data.total ?? 0);
						if (result.data.data) {
							setDataSource(result.data.data);
						}
					}
				},
				() => setLoading(false)
			);
	};

	const onChange = (pagination: TablePaginationConfig) => {
		const page = pagination.current ?? 1;
		const size = pagination.pageSize ?? 10;
		getData({ pageNum: page, pageSize: size });
	};

	return {
		tableProps: {
			loading,
			rowKey: 'id',
			dataSource,
			pagination: {
				current: pageNum,
				pageSize,
				total,
				showSizeChanger: true,
				showTotal: (t: number) => `共 ${t} 条`
			},
			onChange
		},
		getData
	};
};
