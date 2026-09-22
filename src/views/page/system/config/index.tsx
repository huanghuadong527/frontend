import * as Yup from 'yup';
import {
	useEffect,
	useState } from 'react';
import { Button,
	Chip,
	IconButton,
	RadioGroup,
	Stack } from '@mui/material';
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
	Table,
	confirm,
	message
} from '@/plugins';
import { useTable } from '@/core';
import { usePermission } from '@/authority';
import { addConfig, deleteConfig, getConfigById, updateConfig } from '@/service';

export const Component = () => {
	const { hasPermi } = usePermission();
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');

	const { tableProps, getData } = useTable('/system/config/list');

	const search = useFormik<FormikValues>({
		initialValues: { configName: '', configKey: '' },
		onSubmit(values) {
			getData(values);
		},
		onReset() {
			getData();
		}
	});

	const formik = useFormik<FormikValues>({
		initialValues: {
			configName: '',
			configKey: '',
			configValue: '',
			configType: 'Y',
			remark: ''
		},
		validationSchema: Yup.object().shape({
			configName: Yup.string().required('请输入参数名称'),
			configKey: Yup.string().required('请输入参数键名'),
			configValue: Yup.string().required('请输入参数键值')
		}),
		onSubmit(values) {
			if (editId) {
				updateConfig({ ...values, id: editId }).then(() => {
					message.success('修改成功');
					onCancel();
					getData();
				});
			} else {
				addConfig(values).then(() => {
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
			getConfigById(id).then((result) => {
				formik.resetForm();
				formik.setValues(result.data);
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
			content: '是否确认删除该参数?',
			onOk() {
				deleteConfig(id).then(() => {
					message.success('删除成功');
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
					<Form.Item name='configName' label='参数名称'>
						<Input size='small' placeholder='请输入参数名称' />
					</Form.Item>
					<Form.Item name='configKey' label='参数键名'>
						<Input size='small' placeholder='请输入参数键名' />
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
				{hasPermi('system:config:add') && (
					<Button
						variant='contained'
						startIcon={<AddRegular />}
						onClick={() => onEdit()}
					>
						新建
					</Button>
				)}
			</div>
			<Table
				{...tableProps}
				columns={getColumnData([
					{
						field: 'configName',
						headerName: '参数名称'
					},
					{
						field: 'configKey',
						headerName: '参数键名'
					},
					{
						field: 'configValue',
						headerName: '参数键值'
					},
					{
						field: 'configType',
						headerName: '系统内置',
						renderCell({ value }) {
							return (
								<Chip
									size='small'
									color={value == 'Y' ? 'success' : 'default'}
									label={value == 'Y' ? '是' : '否'}
								/>
							);
						}
					},
					{
						field: 'remark',
						headerName: '备注'
					},
					{
						field: 'createTime',
						headerName: '创建时间'
					},
					{
						field: 'id',
						headerName: '操作',
						flex: 0,
						width: 100,
						renderCell({ row }) {
							return (
								<>
									{hasPermi('system:config:edit') && (
										<IconButton
											color='primary'
											size='small'
											title='编辑'
											onClick={() => onEdit(row.id)}
										>
											<EditRegular />
										</IconButton>
									)}
									{hasPermi('system:config:remove') && (
										<IconButton
											color='error'
											size='small'
											title='删除'
											onClick={() => onDelete(row.id)}
										>
											<DeleteRegular />
										</IconButton>
									)}
								</>
							);
						}
					}
				])}
			/>
			<Modal
				title={editId ? '编辑参数' : '新增参数'}
				open={isOpen}
				onOk={onSave}
				onClose={onCancel}
			>
				<Form labelCol={{ flex: '0 0 100px' }} formik={formik}>
					<Form.Item required name='configName' label='参数名称'>
						<Input size='small' placeholder='请输入参数名称' />
					</Form.Item>
					<Form.Item required name='configKey' label='参数键名'>
						<Input size='small' placeholder='请输入参数键名' />
					</Form.Item>
					<Form.Item required name='configValue' label='参数键值'>
						<Input size='small' placeholder='请输入参数键值' />
					</Form.Item>
					<Form.Item name='configType' label='系统内置'>
						<RadioGroup row>
							<Radio value='Y' label='是' />
							<Radio value='N' label='否' />
						</RadioGroup>
					</Form.Item>
					<Form.Item name='remark' label='备注'>
						<Input.TextArea placeholder='请输入备注' />
					</Form.Item>
				</Form>
			</Modal>
		</PageOverlay>
	);
};
