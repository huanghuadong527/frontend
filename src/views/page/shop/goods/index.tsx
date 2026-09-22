import * as Yup from 'yup';
import {
	useEffect,
	useState } from 'react';
import { Button,
	Chip,
	IconButton,
	MenuItem,
	RadioGroup,
	Stack } from '@mui/material';
import type { GridRowId } from '@mui/x-data-grid';
import { useFormik,
	type FormikValues } from 'formik';
import {
	AddRegular,
	EditRegular,
	DeleteRegular,
	SearchRegular
} from '@fluentui/react-icons';
import {
	Form,
	getColumnData,
	PageOverlay,
	Input,
	Modal,
	Radio,
	Select,
	Table,
	confirm,
	message
} from '@/plugins';
import { useTable } from '@/core';
import {
	addGoods,
	deleteGoods,
	getGoodsById,
	getMaterialOption,
	updateGoods
} from '@/service';

export const Component = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKeys, setSelectKeys] = useState<GridRowId[]>([]);
	const [materials, setMaterials] = useState<AnyObject[]>([]);

	const { tableProps, getData } = useTable('/shop/goods/list');

	const search = useFormik<FormikValues>({
		initialValues: { goodsName: '', goodsCode: '' },
		onSubmit(values) {
			getData(values);
		},
		onReset() {
			getData();
		}
	});

	const formik = useFormik<FormikValues>({
		initialValues: {
			goodsCode: '',
			goodsName: '',
			goodsMaterialId: '',
			goodsBarcode: '',
			goodsBarcodeUnit: '',
			goodsPurchasePrice: '',
			goodsRetailPrice: '',
			goodsSuggestedPrice: '',
			goodsInputTaxRate: '',
			goodsOrigin: '',
			goodsProducer: '',
			goodsExecutionStandards: '',
			status: '0'
		},
		validationSchema: Yup.object().shape({
			goodsName: Yup.string().required('请输入商品名称'),
			goodsCode: Yup.string().required('请输入商品编码')
		}),
		onSubmit(values) {
			if (editId) {
				updateGoods({ ...values, id: editId }).then(() => {
					message.success('修改成功');
					onCancel();
					getData();
				});
			} else {
				addGoods(values).then(() => {
					message.success('新增成功');
					onCancel();
					getData();
				});
			}
		}
	});

	const onEdit = (id?: string | number) => {
		if (id) {
			setEditId(id);
			getGoodsById(id).then((result) => {
				const record = result.data;
				formik.resetForm();
				formik.setValues({
					goodsCode: record.goodsCode ?? '',
					goodsName: record.goodsName ?? '',
					goodsMaterialId:
						record.goodsMaterialId != null ? String(record.goodsMaterialId) : '',
					goodsBarcode: record.goodsBarcode ?? '',
					goodsBarcodeUnit: record.goodsBarcodeUnit ?? '',
					goodsPurchasePrice: record.goodsPurchasePrice ?? '',
					goodsRetailPrice: record.goodsRetailPrice ?? '',
					goodsSuggestedPrice: record.goodsSuggestedPrice ?? '',
					goodsInputTaxRate: record.goodsInputTaxRate ?? '',
					goodsOrigin: record.goodsOrigin ?? '',
					goodsProducer: record.goodsProducer ?? '',
					goodsExecutionStandards: record.goodsExecutionStandards ?? '',
					status: String(record.status ?? '0')
				});
				setIsOpen(true);
			});
		} else {
			setEditId('');
			formik.resetForm();
			setIsOpen(true);
		}
	};

	const onSave = () => {
		formik.handleSubmit();
	};

	const onCancel = () => {
		setIsOpen(false);
		setEditId('');
		formik.resetForm();
	};

	const onDelete = (id: string | number) => {
		confirm({
			type: 'warning',
			title: '系统提示',
			content: '是否确认删除该商品?',
			onOk() {
				deleteGoods(id).then(() => {
					message.success('删除成功');
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的商品');
			return;
		}
		confirm({
			type: 'warning',
			title: '系统提示',
			content: `是否确认删除选中的 ${selectKeys.length} 项数据?`,
			onOk() {
				deleteGoods(selectKeys.join(',')).then(() => {
					message.success('删除成功');
					setSelectKeys([]);
					getData();
				});
			}
		});
	};

	useEffect(() => {
		getData();
	}, []);

	useEffect(() => {
		getMaterialOption().then((result) => {
			setMaterials(result.data ?? []);
		});
	}, []);

	return (
		<PageOverlay>
			<div className='flex items-center justify-between'>
				<Form layout='inline' formik={search}>
					<Form.Item name='goodsName' label='商品名称'>
						<Input size='small' placeholder='请输入商品名称' />
					</Form.Item>
					<Form.Item name='goodsCode' label='商品编码'>
						<Input size='small' placeholder='请输入商品编码' />
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
				<Stack direction='row' spacing={2}>
					<Button variant='contained' startIcon={<AddRegular />} onClick={() => onEdit()}>
						新建
					</Button>
					<Button
						color='error'
						variant='contained'
						startIcon={<DeleteRegular />}
						disabled={selectKeys.length == 0}
						onClick={onBatchDelete}
					>
						批量删除
					</Button>
				</Stack>
			</div>
			<Table
				{...tableProps}
				checkboxSelection
				onRowSelectionModelChange={(model) => setSelectKeys(Array.from(model.ids))}
				columns={getColumnData([
					{
						field: 'id',
						headerName: '编号'
					},
					{
						field: 'goodsCode',
						headerName: '商品编码'
					},
					{
						field: 'goodsName',
						headerName: '商品名称'
					},
					{
						field: 'materialName',
						headerName: '材质'
					},
					{
						field: 'goodsBarcode',
						headerName: '条码'
					},
					{
						field: 'goodsRetailPrice',
						headerName: '零售价'
					},
					{
						field: 'goodsSuggestedPrice',
						headerName: '建议零售价'
					},
					{
						field: 'status',
						headerName: '状态',
						renderCell({ value }) {
							return (
								<Chip
									size='small'
									color={value == 0 ? 'success' : 'error'}
									label={value == 0 ? '正常' : '停用'}
								/>
							);
						}
					},
					{
						field: 'action',
						headerName: '操作',
						flex: 0,
						width: 100,
						renderCell({ row }) {
							return (
								<>
									<IconButton
										color='primary'
										size='small'
										title='编辑'
										onClick={() => onEdit(row.id)}
									>
										<EditRegular />
									</IconButton>
									<IconButton
										color='error'
										size='small'
										title='删除'
										onClick={() => onDelete(row.id)}
									>
										<DeleteRegular />
									</IconButton>
								</>
							);
						}
					}
				])}
			/>
			<Modal
				title={editId ? '编辑商品' : '新增商品'}
				open={isOpen}
				onOk={onSave}
				onClose={onCancel}
			>
				<Form labelCol={{ flex: '0 0 110px' }} formik={formik}>
					<Form.Item required name='goodsCode' label='商品编码'>
						<Input size='small' placeholder='请输入商品编码' />
					</Form.Item>
					<Form.Item required name='goodsName' label='商品名称'>
						<Input size='small' placeholder='请输入商品名称' />
					</Form.Item>
					<Form.Item name='goodsMaterialId' label='材质'>
						<Select placeholder='请选择材质'>
							{materials.map((item) => (
								<MenuItem key={item.id} value={String(item.id)}>
									{item.materialName}
								</MenuItem>
							))}
						</Select>
					</Form.Item>
					<Form.Item name='goodsBarcode' label='条码'>
						<Input size='small' placeholder='请输入条码' />
					</Form.Item>
					<Form.Item name='goodsBarcodeUnit' label='条码单位'>
						<Input size='small' placeholder='请输入条码单位' />
					</Form.Item>
					<Form.Item name='goodsPurchasePrice' label='核算进价'>
						<Input size='small' placeholder='请输入核算进价' />
					</Form.Item>
					<Form.Item name='goodsRetailPrice' label='零售价'>
						<Input size='small' placeholder='请输入零售价' />
					</Form.Item>
					<Form.Item name='goodsSuggestedPrice' label='建议零售价'>
						<Input size='small' placeholder='请输入建议零售价' />
					</Form.Item>
					<Form.Item name='goodsInputTaxRate' label='进项税率(%)'>
						<Input size='small' placeholder='请输入进项税率' />
					</Form.Item>
					<Form.Item name='goodsOrigin' label='产地'>
						<Input size='small' placeholder='请输入产地' />
					</Form.Item>
					<Form.Item name='goodsProducer' label='生产商'>
						<Input size='small' placeholder='请输入生产商' />
					</Form.Item>
					<Form.Item name='goodsExecutionStandards' label='执行标准'>
						<Input size='small' placeholder='请输入执行标准' />
					</Form.Item>
					<Form.Item name='status' label='状态'>
						<RadioGroup row>
							<Radio value='0' label='正常' />
							<Radio value='1' label='停用' />
						</RadioGroup>
					</Form.Item>
				</Form>
			</Modal>
		</PageOverlay>
	);
};
