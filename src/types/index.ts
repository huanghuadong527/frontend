import { ColumnType } from 'antd/lib/table';

export interface OptionType {
	value: string;
	label: string;
	children?: OptionType[];
}

export interface ColumnsOptions<T = any> extends ColumnType<T> {
	[key: string]: any;
	status?: boolean;
}
