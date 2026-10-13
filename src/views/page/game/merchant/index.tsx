import { useEffect, useState } from 'react';
import {
	ArrowDownOutlined,
	ArrowUpOutlined,
	CheckOutlined,
	DeleteOutlined,
	EditOutlined,
	PlusOutlined,
	SearchOutlined
} from '@ant-design/icons';
import {
	App,
	Button,
	Form,
	Image,
	Input,
	Modal,
	Radio,
	Space,
	Table,
	Tag
} from 'antd';
import type { TableColumnsType } from 'antd';
import { API_UPLOAD, useTable } from '@/core';
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
	const { message, modal } = App.useApp();
	const [searchForm] = Form.useForm();
	const [businessForm] = Form.useForm();
	const [detailOpen, setDetailOpen] = useState(false);
	const [businessOpen, setBusinessOpen] = useState(false);
	const [detail, setDetail] = useState<MerchantDetail>({});
	const [editBusinessId, setEditBusinessId] = useState<string | number>('');

	const { tableProps, getData } = useTable('/game/merchant/list', () => searchForm.getFieldsValue());

	const onSearch = (values: AnyObject) => {
		getData({
			nickName: values.nickName || undefined
		});
	};

	const onReset = () => {
		searchForm.resetFields();
		getData();
	};

	const onBusinessFinish = (values: AnyObject) => {
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
	};

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
		businessForm.resetFields();
		setBusinessOpen(true);
	};

	const onEditBusiness = (item: BusinessItem) => {
		setEditBusinessId(item.id as number);
		businessForm.resetFields();
		businessForm.setFieldsValue({
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
		businessForm.resetFields();
	};

	const onBusinessSave = () => {
		businessForm.submit();
	};

	const onDeleteBusiness = (item: BusinessItem) => {
		modal.confirm({
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
		modal.confirm({
			title: '审核',
			content: '请选择审核结果',
			okText: '通过',
			cancelText: '拒绝',
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

	const columns: TableColumnsType<AnyObject> = [
		{ title: '编号', dataIndex: 'id', width: 80 },
		{
			title: '头像',
			dataIndex: 'avatar',
			width: 80,
			render: (value) => (
				<Image
					src={value ? API_UPLOAD + value : ''}
					width={40}
					height={40}
					style={{ objectFit: 'cover', borderRadius: '50%' }}
				/>
			)
		},
		{ title: '昵称', dataIndex: 'nickName' },
		{
			title: '人气值',
			dataIndex: 'popularity',
			width: 100,
			render: (value) => value ?? 0
		},
		{
			title: '审核状态',
			dataIndex: 'isAudit',
			width: 120,
			render: (value) => {
				const label = value == 1 ? '已通过' : value == 2 ? '已拒绝' : '待审核';
				const color = value == 1 ? 'success' : value == 2 ? 'error' : 'warning';
				return <Tag color={color}>{label}</Tag>;
			}
		},
		{
			title: '是否上架',
			dataIndex: 'isShelf',
			width: 100,
			render: (value) => (value == 1 ? <Tag color='success'>已上架</Tag> : <Tag color='default'>已下架</Tag>)
		},
		{
			title: '操作',
			dataIndex: 'action',
			width: 220,
			render: (_v, row) => (
				<>
					<Button type='link' size='small' onClick={() => onDetail(row.id)}>
						详情
					</Button>
					{row.isAudit == 0 && (
						<Button
							type='link'
							size='small'
							icon={<CheckOutlined />}
							title='审核'
							onClick={() => onAudit(row)}
						/>
					)}
					<Button
						type='link'
						size='small'
						danger={row.isShelf == 1}
						icon={row.isShelf == 1 ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
						title={row.isShelf == 1 ? '下架' : '上架'}
						onClick={() => onShelf(row)}
					/>
				</>
			)
		}
	];

	return (
		<div className='p-4 flex flex-col gap-4'>
			<div className='flex items-center justify-between'>
				<Form form={searchForm} layout='inline' onFinish={onSearch}>
					<Form.Item name='nickName' label='昵称'>
						<Input placeholder='请输入昵称' />
					</Form.Item>
					<Form.Item>
						<Space>
							<Button type='primary' htmlType='submit' icon={<SearchOutlined />}>
								查询
							</Button>
							<Button onClick={onReset}>重置</Button>
						</Space>
					</Form.Item>
				</Form>
			</div>
			<Table {...tableProps} columns={columns} />

			<Modal
				title='商人详情'
				open={detailOpen}
				footer={null}
				width={720}
				onCancel={onCloseDetail}
			>
				<Space direction='vertical' size={16} style={{ width: '100%' }}>
					<Space align='center'>
						<Image
							src={detail.avatar ? API_UPLOAD + detail.avatar : ''}
							width={64}
							height={64}
							style={{ objectFit: 'cover', borderRadius: '50%' }}
						/>
						<div>
							<div className='font-medium'>{detail.nickName ?? '--'}</div>
							<div className='text-sm text-gray-500'>
								人气值：{detail.popularity ?? 0}
							</div>
						</div>
					</Space>

					<div className='flex items-center justify-between'>
						<div className='text-sm font-medium'>常用业务</div>
						<Button
							size='small'
							type='primary'
							icon={<PlusOutlined />}
							onClick={onAddBusiness}
						>
							新增业务
						</Button>
					</div>

					{detail.businessList && detail.businessList.length > 0 ? (
						<Space direction='vertical' size={8} style={{ width: '100%' }}>
							{detail.businessList.map((item) => (
								<div
									key={item.id}
									className='flex items-center gap-2 rounded border border-solid border-gray-200 p-2'
								>
									<div className='flex-1'>
										<div className='flex items-center gap-2'>
											<span className='font-semibold'>{item.businessName}</span>
											<Tag color={item.status == 0 ? 'success' : 'default'}>
												{item.status == 0 ? '启用' : '停用'}
											</Tag>
										</div>
										<div className='text-sm text-gray-500'>
											{item.businessDesc || '--'}
										</div>
									</div>
									<Button
										type='link'
										size='small'
										icon={<EditOutlined />}
										title='编辑'
										onClick={() => onEditBusiness(item)}
									/>
									<Button
										type='link'
										size='small'
										danger
										icon={<DeleteOutlined />}
										title='删除'
										onClick={() => onDeleteBusiness(item)}
									/>
								</div>
							))}
						</Space>
					) : (
						<div className='text-sm text-gray-500'>暂无常用业务</div>
					)}
				</Space>
			</Modal>

			<Modal
				title={editBusinessId ? '编辑常用业务' : '新增常用业务'}
				open={businessOpen}
				onOk={onBusinessSave}
				onCancel={onBusinessCancel}
				destroyOnHidden
				forceRender
			>
				<Form
					form={businessForm}
					labelCol={{ flex: '0 0 100px' }}
					onFinish={onBusinessFinish}
					initialValues={{
						businessName: '',
						businessDesc: '',
						sort: '',
						status: '0'
					}}
				>
					<Form.Item
						name='businessName'
						label='业务名称'
						rules={[{ required: true, message: '请输入业务名称' }]}
					>
						<Input placeholder='请输入业务名称' />
					</Form.Item>
					<Form.Item name='businessDesc' label='业务描述'>
						<Input placeholder='请输入业务描述' />
					</Form.Item>
					<Form.Item name='sort' label='排序'>
						<Input placeholder='请输入排序' />
					</Form.Item>
					<Form.Item name='status' label='状态'>
						<Radio.Group>
							<Radio value='0'>启用</Radio>
							<Radio value='1'>停用</Radio>
						</Radio.Group>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};
