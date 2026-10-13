import { useState } from 'react';
import type { TablePaginationConfig } from 'antd';
import { service } from '@/utils';

export const useTable = (url: string, getSearchParams?: () => AnyObject) => {
	const [loading, setLoading] = useState(false);
	const [pageNum, setPageNum] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [total, setTotal] = useState(0);
	const [dataSource, setDataSource] = useState([]);

	const getData = (param: AnyObject = {}) => {
		const { pageNum: paramPageNum, pageSize: paramPageSize, ...query } = param;
		const search = getSearchParams ? getSearchParams() : {};
		setLoading(true);
		setDataSource([]);
		const page = paramPageNum ?? pageNum;
		const size = paramPageSize ?? pageSize;
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
						if (result.data.total) {
							setTotal(result.data.total);
						}
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
		setPageNum(page);
		setPageSize(size);
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
