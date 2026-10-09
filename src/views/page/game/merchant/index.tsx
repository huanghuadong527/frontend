import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import { Button, Chip, IconButton, RadioGroup, Stack, Typography } from '@mui/material';
import { useFormik, type FormikValues } from 'formik';
import {
	AddRegular,
	EditRegular,
	DeleteRegular,
	SearchRegular,
	CheckmarkRegular,
	ArrowUpRegular,
	ArrowDownRegular
} from '@fluentui/react-icons';
import {
	Form,
	getColumnData,
	PageOverlay,
	ImagePreview,
	Input,
	Modal,
	Radio,
	Table,
	confirm,
	message
} from '@/plugins';
import { useTable } from '@/core';
import {
	addMerchantBusiness,
	deleteMerchantBusiness,
	getMerchantById,
	updateMerchantBusiness,
	updateWxUser
} from '@/service';

interface BusinessItem {
	id?: number;
	merchantId?: number;
	businessName?: string;
	businessDesc?: string;
	sort?: number;
	status?: number;
}

interface MerchantDetail {
	merchantId?: number;
	nickName?: string;
	avatar?: string;
	popularity?: number;
	businessList?: BusinessItem[];
}

export const Component = () => {
	const [detailOpen, setDetailOpen] = useState(false);
	const [businessOpen, setBusinessOpen] = useState(false);
	const [detail, setDetail] = useState<MerchantDetail>({});
	const [editBusinessId, setEditBusinessId] = useState<string | number>('');

	const { tableProps, getData } = useTable('/game/merchant/list');

	const search = useFormik<FormikValues>({
		initialValues: { nickName: '' },
		onSubmit(values) {
			getData({
				nickName: values.nickName || undefined
			});
		},
		onReset() {
			getData();
		}
	});

	const businessFormik = useFormik<FormikValues>({
		initialValues: {
			businessName: '',
			businessDesc: '',
			sort: '',
			status: '0'
		},
		validationSchema: Yup.object().shape({
			businessName: Yup.string().required('请输入业务名称')
		}),
		onSubmit(values) {
			const params = {
				merchantId: detail.merchantId,
				businessName: values.businessName,
				businessDesc: values.businessDesc || undefined,
				sort: values.sort === '' ? 0 : Number(values.sort),
				status: Number(values.status)
			};
			if (editBusinessId) {
				updateMerchantBusiness({ ...params, id: editBusinessId }).then(() => {
					message.success('修改成功');
					onBusinessCancel();
					loadDetail(detail.merchantId as number);
				});
			} else {
				addMerchantBusiness(params).then(() => {
					message.success('新增成功');
					onBusinessCancel();
					loadDetail(detail.merchantId as number);
				});
			}
		}
	});

	const loadDetail = (merchantId: number) => {
		getMerchantById(merchantId).then((result) => {
			setDetail(result.data);
		});
	};

	const onDetail = (id: string | number) => {
		getMerchantById(id).then((result) => {
			setDetail(result.data);
			setDetailOpen(true);
		});
	};

	const onCloseDetail = () => {
		setDetailOpen(false);
		setDetail({});
	};

	const onAddBusiness = () => {
		setEditBusinessId('');
		businessFormik.resetForm();
		setBusinessOpen(true);
	};

	const onEditBusiness = (item: BusinessItem) => {
		setEditBusinessId(item.id as number);
		businessFormik.resetForm();
		businessFormik.setValues({
			businessName: item.businessName ?? '',
			businessDesc: item.businessDesc ?? '',
			sort: item.sort != null ? String(item.sort) : '',
			status: item.status != null ? String(item.status) : '0'
		});
		setBusinessOpen(true);
	};

	const onBusinessCancel = () => {
		setBusinessOpen(false);
		setEditBusinessId('');
		businessFormik.resetForm();
	};

	const onBusinessSave = () => {
		businessFormik.handleSubmit();
	};

	const onDeleteBusiness = (item: BusinessItem) => {
		confirm({
			type: 'warning',
			title: '系统提示',
			content: '是否确认删除该常用业务?',
			onOk() {
				deleteMerchantBusiness(item.id as number).then(() => {
					message.success('删除成功');
					loadDetail(detail.merchantId as number);
				});
			}
		});
	};

	const onAudit = (row: AnyObject) => {
		confirm({
			type: 'warning',
			title: '审核',
			content: '请选择审核结果',
			confirmationText: '通过',
			cancellationText: '拒绝',
			onOk() {
				updateWxUser({ id: row.id, isAudit: 1 }).then(() => {
					message.success('已通过审核');
					getData();
				});
			},
			onCancel() {
				updateWxUser({ id: row.id, isAudit: 2 }).then(() => {
					message.success('已拒绝');
					getData();
				});
			}
		});
	};

	const onShelf = (row: AnyObject) => {
		const next = row.isShelf == 1 ? 0 : 1;
		updateWxUser({ id: row.id, isShelf: next }).then(() => {
			message.success(next == 1 ? '已上架' : '已下架');
			getData();
		});
	};

	useEffect(() => {
		getData();
	}, []);

	return (
		<PageOverlay>
			<div className='flex items-center justify-between'>
				<Form layout='inline' formik={search}>
					<Form.Item name='nickName' label='昵称'>
						<Input size='small' placeholder='请输入昵称' />
					</Form.Item>
					<Form.Item>
						<Stack direction='row' spacing={2}>
							<Button
								variant='contained'
								type='submit'
								startIcon={<SearchRegular />}
							>
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
					{ field: 'id', headerName: '编号', flex: 0, width: 80 },
					{
						field: 'avatar',
						headerName: '头像',
						flex: 0,
						width: 80,
						renderCell({ value }) {
							return <ImagePreview value={value} borderRadius='50%' />;
						}
					},
					{ field: 'nickName', headerName: '昵称' },
					{
						field: 'popularity',
						headerName: '人气值',
						flex: 0,
						width: 100,
						renderCell({ value }) {
							return value ?? 0;
						}
					},
					{
						field: 'isAudit',
						headerName: '审核状态',
						flex: 0,
						width: 120,
						renderCell({ value }) {
							const label = value == 1 ? '已通过' : value == 2 ? '已拒绝' : '待审核';
							const color = value == 1 ? 'success' : value == 2 ? 'error' : 'warning';
							return (
								<Chip
									size='small'
									color={color}
									label={label}
								/>
							);
						}
					},
					{
						field: 'isShelf',
						headerName: '是否上架',
						flex: 0,
						width: 100,
						renderCell({ value }) {
							return value == 1 ? '上架' : '下架';
						}
					},
					{
						field: 'action',
						headerName: '操作',
						flex: 0,
						width: 220,
						renderCell({ row }) {
							return (
								<>
									<Button
										size='small'
										variant='text'
										onClick={() => onDetail(row.id)}
									>
										详情
									</Button>
									{row.isAudit == 0 && (
										<IconButton
											color='primary'
											size='small'
											title='审核'
											onClick={() => onAudit(row)}
										>
											<CheckmarkRegular />
										</IconButton>
									)}
									<IconButton
										color={row.isShelf == 1 ? 'warning' : 'success'}
										size='small'
										title={row.isShelf == 1 ? '下架' : '上架'}
										onClick={() => onShelf(row)}
									>
										{row.isShelf == 1 ? <ArrowDownRegular /> : <ArrowUpRegular />}
									</IconButton>
								</>
							);
						}
					}
				])}
			/>

			<Modal
				title='商人详情'
				open={detailOpen}
				width='md'
				footer={<></>}
				onClose={onCloseDetail}
			>
				<Stack spacing={2}>
					<Stack direction='row' spacing={2} alignItems='center'>
						<ImagePreview value={detail.avatar} borderRadius='50%' />
						<Stack>
							<Typography variant='subtitle1'>
								{detail.nickName ?? '--'}
							</Typography>
							<Typography variant='body2' color='text.secondary'>
								人气值：{detail.popularity ?? 0}
							</Typography>
						</Stack>
					</Stack>

					<div className='flex items-center justify-between'>
						<Typography variant='subtitle2'>常用业务</Typography>
						<Button
							size='small'
							variant='contained'
							startIcon={<AddRegular />}
							onClick={onAddBusiness}
						>
							新增业务
						</Button>
					</div>

					{detail.businessList && detail.businessList.length > 0 ? (
						<Stack spacing={1}>
							{detail.businessList.map((item) => (
								<Stack
									key={item.id}
									direction='row'
									alignItems='center'
									spacing={1}
									sx={{
										border: '1px solid',
										borderColor: 'divider',
										borderRadius: 1,
										padding: 1
									}}
								>
									<Stack sx={{ flex: 1 }}>
										<Stack direction='row' spacing={1} alignItems='center'>
											<Typography variant='body2' fontWeight={600}>
												{item.businessName}
											</Typography>
											<Chip
												size='small'
												color={item.status == 0 ? 'success' : 'default'}
												label={item.status == 0 ? '启用' : '停用'}
											/>
										</Stack>
										<Typography
											variant='body2'
											color='text.secondary'
										>
											{item.businessDesc || '--'}
										</Typography>
									</Stack>
									<IconButton
										color='primary'
										size='small'
										title='编辑'
										onClick={() => onEditBusiness(item)}
									>
										<EditRegular />
									</IconButton>
									<IconButton
										color='error'
										size='small'
										title='删除'
										onClick={() => onDeleteBusiness(item)}
									>
										<DeleteRegular />
									</IconButton>
								</Stack>
							))}
						</Stack>
					) : (
						<Typography variant='body2' color='text.secondary'>
							暂无常用业务
						</Typography>
					)}
				</Stack>
			</Modal>

			<Modal
				title={editBusinessId ? '编辑常用业务' : '新增常用业务'}
				open={businessOpen}
				onOk={onBusinessSave}
				onClose={onBusinessCancel}
			>
				<Form labelCol={{ flex: '0 0 100px' }} formik={businessFormik}>
					<Form.Item required name='businessName' label='业务名称'>
						<Input size='small' placeholder='请输入业务名称' />
					</Form.Item>
					<Form.Item name='businessDesc' label='业务描述'>
						<Input size='small' placeholder='请输入业务描述' />
					</Form.Item>
					<Form.Item name='sort' label='排序'>
						<Input size='small' placeholder='请输入排序' />
					</Form.Item>
					<Form.Item name='status' label='状态'>
						<RadioGroup row>
							<Radio value='0' label='启用' />
							<Radio value='1' label='停用' />
						</RadioGroup>
					</Form.Item>
				</Form>
			</Modal>
		</PageOverlay>
	);
};
