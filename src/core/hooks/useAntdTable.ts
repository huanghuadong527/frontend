import { TableProps } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { Service } from '@/service';
import { isArray, toArrayTree } from 'xe-utils';

export interface AntdTableProps {
	total: number;
	dataSource: any;
	loading: boolean;
	getTableData: (params?: object) => void;
	tableProps: Partial<TableProps<any>>;
}

export interface TData {
	total?: number;
	data: any;
}

export interface OptionType {
	[key: string]: any;
	isTreeData?: boolean;
}

const useAntdTable = (url: string, options?: OptionType): AntdTableProps => {
	const [current, setCurrent] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [dataSource, setDataSource] = useState([]);

	const onChange = (index: number, size: number) => {
		setCurrent(index);
		setPageSize(size);
	};

	const getTableData = useCallback(
		(params?: object) => {
			setLoading(true);
			Service(
				{ url, method: 'GET', ...options },
				{ pageNum: current, pageSize, ...options, ...params }
			)
				.then((result) => {
					setLoading(false);
					if (result && result.data) {
						if (isArray(result.data)) {
							if (options!.isTreeData) {
								setDataSource(toArrayTree(result.data) as any);
							}
						} else {
							if ('total' in result.data) {
								setTotal(result.data.total!);
							}
							if ('data' in result.data) {
								setDataSource(result.data.data);
							}
						}
					}
				})
				.catch(() => {
					setLoading(false);
				});
		},
		[current, pageSize]
	);

	useEffect(() => {
		getTableData();
	}, [getTableData, current, pageSize]);

	return {
		total,
		loading,
		dataSource,
		getTableData,
		tableProps: {
			pagination: {
				current,
				pageSize,
				total,
				size: 'default',
				showSizeChanger: true,
				showQuickJumper: true,
				onChange,
				showTotal: (total: number) => `共${total}条`,
			},
		},
	};
};

export { useAntdTable };
