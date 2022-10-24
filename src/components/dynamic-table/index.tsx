import { Table, TableProps } from 'antd';

interface DynamicTableProps extends Partial<TableProps<any>> {
	headerRender?: JSX.Element;
	footerRender?: JSX.Element;
}

const DynamicTable = (props: DynamicTableProps) => {
	return (
		<div className='dynamic-table'>
			{props.headerRender ? (
				<div className='dynamic-table--header'>{props.headerRender}</div>
			) : (
				''
			)}
			<div className='dynamic-table--content'>
				<Table {...props} />
			</div>
			{props.footerRender ? (
				<div className='dynamic-table--footer'>{props.footerRender}</div>
			) : (
				''
			)}
		</div>
	);
};

export { DynamicTable };
