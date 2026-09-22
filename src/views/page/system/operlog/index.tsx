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
import { DICT_OPER_TYPE, useTable } from '@/core';
import { usePermission } from '@/authority';
import { cleanOperlog, deleteOperlog, getDictDataByType } from '@/service';

export const Component = () => {
	const { hasPermi } = usePermission();
	const [selectKeys, setSelectKeys] = useState<GridRowId[]>([]);
	const [operTypeDict, setOperTypeDict] = useState<AnyObject[]>([]);

	const { tableProps, getData } = useTable('/monitor/operlog/list');

	const search = useFormik<FormikValues>({
		initialValues: { title: '', operName: '' },
		onSubmit(values) {
			getData(values);
		},
		onReset() {
			getData();
		}
	});

	const getDictLabel = (value: any) => {
		const dict = operTypeDict.find((item: any) => item.dictValue == value);
		return dict ? dict.dictLabel : value;
	};

	const onDelete = (ids: string | number) => {
		confirm({
			type: 'warning',
			title: '系统提示',
			content: '是否确认删除所选操作日志?',
			onOk() {
				deleteOperlog(ids).then(() => {
					message.success('删除成功');
					setSelectKeys([]);
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的操作日志');
			return;
		}
		onDelete(selectKeys.join(','));
	};

	const onClean = () => {
		confirm({
			type: 'warning',
			title: '系统提示',
			content: '是否确认清空所有操作日志数据?',
			onOk() {
				cleanOperlog().then(() => {
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

	useEffect(() => {
		getDictDataByType(DICT_OPER_TYPE).then((result) => {
			setOperTypeDict(result.data || []);
		});
	}, []);

	return (
		<PageOverlay>
			<div className='flex items-center justify-between'>
				<Form layout='inline' formik={search}>
					<Form.Item name='title' label='操作模块'>
						<Input size='small' placeholder='请输入操作模块' />
					</Form.Item>
					<Form.Item name='operName' label='操作人员'>
						<Input size='small' placeholder='请输入操作人员' />
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
					{hasPermi('monitor:operlog:remove') && (
						<Button color='warning' variant='contained' onClick={onClean}>
							清空
						</Button>
					)}
					{hasPermi('monitor:operlog:remove') && (
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
				getRowId={(row) => row.operId}
				checkboxSelection
				onRowSelectionModelChange={(model) => setSelectKeys(Array.from(model.ids))}
				columns={getColumnData([
					{
						field: 'operId',
						headerName: '操作编号'
					},
					{
						field: 'title',
						headerName: '操作模块'
					},
					{
						field: 'businessType',
						headerName: '业务类型',
						renderCell({ value }) {
							return getDictLabel(value);
						}
					},
					{
						field: 'operName',
						headerName: '操作人员'
					},
					{
						field: 'requestMethod',
						headerName: '请求方式'
					},
					{
						field: 'operUrl',
						headerName: '操作地址'
					},
					{
						field: 'operIp',
						headerName: '操作IP'
					},
					{
						field: 'status',
						headerName: '操作状态',
						renderCell({ value }) {
							return (
								<Chip
									size='small'
									color={value == 0 ? 'success' : 'error'}
									label={value == 0 ? '正常' : '异常'}
								/>
							);
						}
					},
					{
						field: 'operTime',
						headerName: '操作时间'
					}
				])}
			/>
		</PageOverlay>
	);
};
