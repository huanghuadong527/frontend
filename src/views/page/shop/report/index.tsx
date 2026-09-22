import {
	useEffect,
	useState } from 'react';
import {
	Button,
	IconButton,
	Stack,
	Table as MuiTable,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography
} from '@mui/material';
import { useFormik,
	type FormikValues } from 'formik';
import {
	EyeRegular,
	SearchRegular
} from '@fluentui/react-icons';
import {
	Form,
	getColumnData,
	PageOverlay,
	Input,
	Modal,
	Table
} from '@/plugins';
import { useTable } from '@/core';
import { getReportById } from '@/service';

export const Component = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [goods, setGoods] = useState<AnyObject[]>([]);

	const { tableProps, getData } = useTable('/shop/report/list');

	const search = useFormik<FormikValues>({
		initialValues: { nickName: '' },
		onSubmit(values) {
			getData(values);
		},
		onReset() {
			getData();
		}
	});

	const onDetail = (id: string | number) => {
		getReportById(id).then((result) => {
			setGoods(result.data?.goods ?? []);
			setIsOpen(true);
		});
	};

	const onClose = () => {
		setIsOpen(false);
		setGoods([]);
	};

	useEffect(() => {
		getData();
	}, []);

	return (
		<PageOverlay>
			<div className='flex items-center justify-between'>
				<Form layout='inline' formik={search}>
					<Form.Item name='nickName' label='用户昵称'>
						<Input size='small' placeholder='请输入用户昵称' />
					</Form.Item>
					<Form.Item>
						<Stack direction='row' spacing={2}>
							<Button variant='contained' type='submit' startIcon={<SearchRegular />}>
								查询
							</Button>
							<Button variant='outlined' type='reset'>
								重置
							</Button>
						</Stack>
					</Form.Item>
				</Form>
			</div>
			<Table
				{...tableProps}
				columns={getColumnData([
					{
						field: 'id',
						headerName: '报表编号'
					},
					{
						field: 'nickName',
						headerName: '用户昵称'
					},
					{
						field: 'count',
						headerName: '导出次数'
					},
					{
						field: 'exportTime',
						headerName: '导出时间'
					},
					{
						field: 'action',
						headerName: '操作',
						flex: 0,
						width: 90,
						renderCell({ row }) {
							return (
								<IconButton
									color='primary'
									size='small'
									title='详情'
									onClick={() => onDetail(row.id)}
								>
									<EyeRegular />
								</IconButton>
							);
						}
					}
				])}
			/>
			<Modal title='报表详情' open={isOpen} onClose={onClose} footer={false}>
				<TableContainer>
					<MuiTable size='small'>
						<TableHead>
							<TableRow>
								<TableCell sx={{ fontWeight: 600 }}>商品编码</TableCell>
								<TableCell sx={{ fontWeight: 600 }}>商品名称</TableCell>
								<TableCell sx={{ fontWeight: 600 }}>材质</TableCell>
								<TableCell sx={{ fontWeight: 600 }}>零售价</TableCell>
								<TableCell sx={{ fontWeight: 600 }}>条码</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{goods.length > 0 ? (
								goods.map((item) => (
									<TableRow key={item.id}>
										<TableCell>{item.goodsCode}</TableCell>
										<TableCell>{item.goodsName}</TableCell>
										<TableCell>{item.materialName}</TableCell>
										<TableCell>{item.goodsRetailPrice}</TableCell>
										<TableCell>{item.goodsBarcode}</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={5} align='center'>
										<Typography variant='body2'>暂无数据</Typography>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</MuiTable>
				</TableContainer>
			</Modal>
		</PageOverlay>
	);
};
