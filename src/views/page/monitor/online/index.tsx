import {
	useEffect,
	useState } from 'react';
import { Button,
	IconButton,
	Stack } from '@mui/material';
import { useFormik,
	type FormikValues } from 'formik';
import {
	SearchRegular,
	SignOutRegular
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
import { forceLogout, getOnlineList } from '@/service';
import { usePermission } from '@/authority';

const formatTime = (value?: number) => {
	if (!value) return '-';
	const d = new Date(value);
	const p = (n: number) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(
		d.getHours()
	)}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

export const Component = () => {
	const { hasPermi } = usePermission();
	const [rows, setRows] = useState<AnyObject[]>([]);
	const [loading, setLoading] = useState(false);

	const search = useFormik<FormikValues>({
		initialValues: { ipaddr: '', userName: '' },
		onSubmit(values) {
			getData(values);
		},
		onReset() {
			getData();
		}
	});

	const getData = (params: AnyObject = {}) => {
		setLoading(true);
		getOnlineList(params)
			.then((result) => {
				setLoading(false);
				setRows(result.data?.data ?? []);
			})
			.catch(() => setLoading(false));
	};

	const onForceLogout = (id: string | number) => {
		confirm({
			type: 'warning',
			title: '系统提示',
			content: '是否确认强退该用户?',
			onOk() {
				forceLogout(id).then(() => {
					message.success('强退成功');
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
					<Form.Item name='ipaddr' label='登录地址'>
						<Input size='small' placeholder='请输入登录地址' />
					</Form.Item>
					<Form.Item name='userName' label='用户名称'>
						<Input size='small' placeholder='请输入用户名称' />
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
				loading={loading}
				rows={rows}
				getRowId={(row) => row.id}
				columns={getColumnData([
					{
						field: 'id',
						headerName: '会话编号'
					},
					{
						field: 'userName',
						headerName: '登录名称'
					},
					{
						field: 'deptName',
						headerName: '部门名称'
					},
					{
						field: 'ipaddr',
						headerName: '主机'
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
						field: 'loginTime',
						headerName: '登录时间',
						renderCell({ value }) {
							return formatTime(value);
						}
					},
					{
						field: 'action',
						headerName: '操作',
						flex: 0,
						width: 90,
						renderCell({ row }) {
							return (
								<>
									{hasPermi('monitor:online:forceLogout') && (
										<IconButton
											color='error'
											size='small'
											title='强退'
											onClick={() => onForceLogout(row.id)}
										>
											<SignOutRegular />
										</IconButton>
									)}
								</>
							);
						}
					}
				])}
			/>
		</PageOverlay>
	);
};
