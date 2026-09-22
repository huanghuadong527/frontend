import {
	useEffect,
	useState } from 'react';
import { Button,
	Chip,
	Stack } from '@mui/material';
import type { GridRowId } from '@mui/x-data-grid';
import { useFormik,
	type FormikValues } from 'formik';
import {
	DeleteRegular,
	SearchRegular
} from '@fluentui/react-icons';
import {
	Form,
	getColumnData,
	PageOverlay,
	Input,
	Table,
	confirm,
	message
} from '@/plugins';
import { useTable } from '@/core';
import { usePermission } from '@/authority';
import { cleanLogininfor, deleteLogininfor } from '@/service';

export const Component = () => {
	const { hasPermi } = usePermission();
	const [selectKeys, setSelectKeys] = useState<GridRowId[]>([]);

	const { tableProps, getData } = useTable('/monitor/logininfor/list');

	const search = useFormik<FormikValues>({
		initialValues: { userName: '', ipaddr: '', status: '' },
		onSubmit(values) {
			getData(values);
		},
		onReset() {
			getData();
		}
	});

	const onDelete = (ids: string | number) => {
		confirm({
			type: 'warning',
			title: '系统提示',
			content: '是否确认删除所选登录日志?',
			onOk() {
				deleteLogininfor(ids).then(() => {
					message.success('删除成功');
					setSelectKeys([]);
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的登录日志');
			return;
		}
		onDelete(selectKeys.join(','));
	};

	const onClean = () => {
		confirm({
			type: 'warning',
			title: '系统提示',
			content: '是否确认清空所有登录日志数据?',
			onOk() {
				cleanLogininfor().then(() => {
					message.success('清空成功');
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
					<Form.Item name='userName' label='用户名称'>
						<Input size='small' placeholder='请输入用户名称' />
					</Form.Item>
					<Form.Item name='ipaddr' label='登录地址'>
						<Input size='small' placeholder='请输入登录地址' />
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
					{hasPermi('monitor:logininfor:remove') && (
						<Button color='warning' variant='contained' onClick={onClean}>
							清空
						</Button>
					)}
					{hasPermi('monitor:logininfor:remove') && (
						<Button
							color='error'
							variant='contained'
							startIcon={<DeleteRegular />}
							disabled={selectKeys.length == 0}
							onClick={onBatchDelete}
						>
							批量删除
						</Button>
					)}
				</Stack>
			</div>
			<Table
				{...tableProps}
				checkboxSelection
				onRowSelectionModelChange={(model) => setSelectKeys(Array.from(model.ids))}
				columns={getColumnData([
					{
						field: 'id',
						headerName: '访问编号'
					},
					{
						field: 'userName',
						headerName: '用户名称'
					},
					{
						field: 'ipaddr',
						headerName: '登录地址'
					},
					{
						field: 'loginLocation',
						headerName: '登录地点'
					},
					{
						field: 'browser',
						headerName: '浏览器'
					},
					{
						field: 'os',
						headerName: '操作系统'
					},
					{
						field: 'status',
						headerName: '登录状态',
						renderCell({ value }) {
							return (
								<Chip
									size='small'
									color={value == 0 ? 'success' : 'error'}
									label={value == 0 ? '成功' : '失败'}
								/>
							);
						}
					},
					{
						field: 'msg',
						headerName: '操作信息'
					},
					{
						field: 'loginTime',
						headerName: '登录日期'
					}
				])}
			/>
		</PageOverlay>
	);
};
