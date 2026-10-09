import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import { Button, Chip, IconButton, MenuItem, RadioGroup, Stack } from '@mui/material';
import type { GridRowId } from '@mui/x-data-grid';
import { useFormik, type FormikValues } from 'formik';
import {
	EditRegular,
	DeleteRegular,
	SearchRegular
} from '@fluentui/react-icons';
import {
	Form,
	getColumnData,
	PageOverlay,
	ImagePreview,
	Input,
	Modal,
	Radio,
	Select,
	Table,
	Upload,
	confirm,
	message
} from '@/plugins';
import { useTable } from '@/core';
import {
	deleteWxUser,
	getWxUserById,
	updateWxUser
} from '@/service';

export const Component = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKeys, setSelectKeys] = useState<GridRowId[]>([]);

	const { tableProps, getData } = useTable('/system/wx/user/list');

	const search = useFormik<FormikValues>({
		initialValues: { nickName: '', status: '' },
		onSubmit(values) {
			getData({
				nickName: values.nickName || undefined,
				status: values.status === '' ? undefined : values.status
			});
		},
		onReset() {
			getData();
		}
	});

	const formik = useFormik<FormikValues>({
		initialValues: {
			avatar: '',
			nickName: '',
			phonenumber: '',
			intro: '',
			business: '',
			status: '0',
			previewCount: '',
			isMember: '0',
			isMerchant: '0'
		},
		validationSchema: Yup.object().shape({
			nickName: Yup.string().required('请输入用户昵称')
		}),
		onSubmit(values) {
			updateWxUser({
				id: editId,
				avatar: values.avatar || undefined,
				nickName: values.nickName,
				phonenumber: values.phonenumber || undefined,
				intro: values.intro || undefined,
				business: values.business || undefined,
				status: Number(values.status),
				previewCount: values.previewCount === '' ? undefined : Number(values.previewCount),
				isMember: Number(values.isMember),
				isMerchant: Number(values.isMerchant)
			}).then(() => {
				message.success('修改成功');
				onCancel();
				getData();
			});
		}
	});

	const onEdit = (id: string | number) => {
		setEditId(id);
		getWxUserById(id).then((result) => {
			const record = result.data;
			formik.resetForm();
			formik.setValues({
				avatar: record.avatar ?? '',
				nickName: record.nickName ?? '',
				phonenumber: record.phonenumber ?? '',
				intro: record.intro ?? '',
				business: record.business ?? '',
				status: record.status != null ? String(record.status) : '0',
				previewCount: record.previewCount != null ? String(record.previewCount) : '',
				isMember: record.isMember != null ? String(record.isMember) : '0',
				isMerchant: record.isMerchant != null ? String(record.isMerchant) : '0'
			});
			setIsOpen(true);
		});
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
			content: '是否确认删除该微信用户?',
			onOk() {
				deleteWxUser(id).then(() => {
					message.success('删除成功');
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的微信用户');
			return;
		}
		confirm({
			type: 'warning',
			title: '系统提示',
			content: `是否确认删除选中的 ${selectKeys.length} 项数据?`,
			onOk() {
				deleteWxUser(selectKeys.join(',')).then(() => {
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

	return (
		<PageOverlay>
			<div className='flex items-center justify-between'>
				<Form layout='inline' formik={search}>
					<Form.Item name='nickName' label='用户昵称'>
						<Input size='small' placeholder='请输入用户昵称' />
					</Form.Item>
					<Form.Item name='status' label='状态'>
						<Select placeholder='请选择状态'>
							<MenuItem value=''>全部</MenuItem>
							<MenuItem value='0'>正常</MenuItem>
							<MenuItem value='1'>停用</MenuItem>
						</Select>
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
				<Button
					color='error'
					variant='contained'
					startIcon={<DeleteRegular />}
					disabled={selectKeys.length == 0}
					onClick={onBatchDelete}
				>
					批量删除
				</Button>
			</div>
			<Table
				{...tableProps}
				checkboxSelection
				onRowSelectionModelChange={(model) => setSelectKeys(Array.from(model.ids))}
				columns={getColumnData([
					{
						field: 'id',
						headerName: '编号',
						flex: 0,
						width: 80
					},
					{
						field: 'avatar',
						headerName: '头像',
						flex: 0,
						width: 80,
						renderCell({ value }) {
							return <ImagePreview value={value} borderRadius='50%' />;
						}
					},
					{
						field: 'nickName',
						headerName: '用户昵称'
					},
					{
						field: 'phonenumber',
						headerName: '手机号码'
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
						field: 'previewCount',
						headerName: '剩余预览次数',
						flex: 0,
						width: 120
					},
					{
						field: 'isMember',
						headerName: '会员',
						flex: 0,
						width: 100,
						renderCell({ value }) {
							return (
								<Chip
									size='small'
									color={value == 1 ? 'warning' : 'default'}
									label={value == 1 ? '是' : '否'}
								/>
							);
						}
					},
					{
						field: 'isMerchant',
						headerName: '商人',
						flex: 0,
						width: 100,
						renderCell({ value }) {
							return (
								<Chip
									size='small'
									color={value == 1 ? 'primary' : 'default'}
									label={value == 1 ? '是' : '否'}
								/>
							);
						}
					},
					{
						field: 'createTime',
						headerName: '创建时间'
					},
					{
						field: 'remark',
						headerName: '备注'
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
				title='编辑微信用户'
				open={isOpen}
				onOk={onSave}
				onClose={onCancel}
			>
				<Form labelCol={{ flex: '0 0 100px' }} formik={formik}>
					<Form.Item name='avatar' label='用户头像'>
						<Upload />
					</Form.Item>
					<Form.Item required name='nickName' label='用户昵称'>
						<Input size='small' placeholder='请输入用户昵称' />
					</Form.Item>
					<Form.Item name='phonenumber' label='手机号码'>
						<Input size='small' placeholder='请输入手机号码' />
					</Form.Item>
					<Form.Item name='status' label='状态'>
						<RadioGroup row>
							<Radio value='0' label='正常' />
							<Radio value='1' label='停用' />
						</RadioGroup>
					</Form.Item>
					<Form.Item name='previewCount' label='剩余预览次数'>
						<Input size='small' placeholder='请输入剩余预览次数' />
					</Form.Item>
					<Form.Item name='isMember' label='会员'>
						<RadioGroup row>
							<Radio value='1' label='是' />
							<Radio value='0' label='否' />
						</RadioGroup>
					</Form.Item>
					<Form.Item name='isMerchant' label='是否商人'>
						<RadioGroup row>
							<Radio value='1' label='是' />
							<Radio value='0' label='否' />
						</RadioGroup>
					</Form.Item>
					{formik.values.isMerchant === '1' && (
						<>
							<Form.Item name='intro' label='简介'>
								<Input.TextArea minRows={3} placeholder='请输入简介' />
							</Form.Item>
							<Form.Item name='business' label='常用业务'>
								<Input.TextArea minRows={3} placeholder='请输入常用业务' />
							</Form.Item>
						</>
					)}
				</Form>
			</Modal>
		</PageOverlay>
	);
};
