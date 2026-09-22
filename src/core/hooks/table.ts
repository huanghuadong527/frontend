import { useState } from 'react';
import type { GridFeatureMode } from '@mui/x-data-grid';
import type { DataGridPropsWithoutDefaultValue } from '@mui/x-data-grid/internals';
import { service } from '@/utils';

export const useTable = (url: string) => {
	const [loading, setLoading] = useState(false);
	const [pageNum, setPageNum] = useState(0);
	const [pageSize, setPageSize] = useState(10);
	const [total, setTotal] = useState(0);
	const [dataSource, setDataSource] = useState([]);

	const getData = (param: AnyObject = {}) => {
		setLoading(true);
		setDataSource([]);
		const page = param.pageNum ?? pageNum;
		const size = param.pageSize ?? pageSize;
		service
			.get(url, {
				params: {
					...param,
					pageNum: page + 1,
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

	return {
		tableProps: {
			paginationMode: 'server' as GridFeatureMode,
			loading,
			rowCount: total,
			paginationModel: {
				page: pageNum,
				pageSize
			},
			columns: [],
			rows: dataSource,
			onPaginationModelChange({ page, pageSize }) {
				setPageNum(page);
				setPageSize(pageSize);
				getData({ pageNum: page, pageSize });
			}
		} as DataGridPropsWithoutDefaultValue,
		getData
	};
};
