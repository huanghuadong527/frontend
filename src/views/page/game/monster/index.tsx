import * as Yup from 'yup';
import {
	useEffect,
	useState } from 'react';
import { Button,
	IconButton,
	MenuItem,
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
	Select,
	Table,
	confirm,
	message
} from '@/plugins';
import { useTable } from '@/core';
import {
	addMonster,
	deleteMonster,
	getMonsterById,
	updateMonster
} from '@/service';

const METHOD_OPTIONS = [
	{ value: 0, label: '混合攻击' },
	{ value: 1, label: '远程攻击' },
	{ value: 2, label: '物理攻击' },
	{ value: 3, label: '法术攻击' }
];

const ATTRIBUTE_OPTIONS = [
	{ value: 0, label: '无属性' },
	{ value: 1, label: '金' },
	{ value: 2, label: '木' },
	{ value: 3, label: '水' },
	{ value: 4, label: '火' },
	{ value: 5, label: '土' }
];

const getOptionLabel = (options: typeof METHOD_OPTIONS, value: unknown) =>
	options.find((item) => item.value == value)?.label ?? '--';

export const Component = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKeys, setSelectKeys] = useState<GridRowId[]>([]);

	const { tableProps, getData } = useTable('/game/wm/monster/list');

	const search = useFormik<FormikValues>({
		initialValues: { name: '', fall: '' },
		onSubmit(values) {
			getData(values);
		},
		onReset() {
			getData();
		}
	});

	const formik = useFormik<FormikValues>({
		initialValues: {
			name: '',
			level: '',
			method: '',
			attribute: '',
			fall: ''
		},
		validationSchema: Yup.object().shape({
			name: Yup.string().required('请输入怪物名称')
		}),
		onSubmit(values) {
			const params = {
				...values,
				level: values.level === '' ? null : Number(values.level),
				method: values.method === '' ? null : Number(values.method),
				attribute: values.attribute === '' ? null : Number(values.attribute)
			};
			if (editId) {
				updateMonster({ ...params, id: editId }).then(() => {
					message.success('修改成功');
					onCancel();
					getData();
				});
			} else {
				addMonster(params).then(() => {
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
			getMonsterById(id).then((result) => {
				const record = result.data;
				formik.resetForm();
				formik.setValues({
					name: record.name ?? '',
					level: record.level != null ? String(record.level) : '',
					method: record.method != null ? String(record.method) : '',
					attribute: record.attribute != null ? String(record.attribute) : '',
					fall: record.fall ?? ''
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
			content: '是否确认删除该怪物?',
			onOk() {
				deleteMonster(id).then(() => {
					message.success('删除成功');
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的怪物');
			return;
		}
		confirm({
			type: 'warning',
			title: '系统提示',
			content: `是否确认删除选中的 ${selectKeys.length} 项数据?`,
			onOk() {
				deleteMonster(selectKeys.join(',')).then(() => {
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
					<Form.Item name='name' label='怪物名称'>
						<Input size='small' placeholder='请输入怪物名称' />
					</Form.Item>
					<Form.Item name='fall' label='掉落物品'>
						<Input size='small' placeholder='请输入掉落物品' />
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
					<Button
						variant='contained'
						startIcon={<AddRegular />}
						onClick={() => onEdit()}
					>
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
						field: 'name',
						headerName: '怪物名称'
					},
					{
						field: 'level',
						headerName: '等级'
					},
					{
						field: 'method',
						headerName: '攻击方式',
						renderCell({ value }) {
							return getOptionLabel(METHOD_OPTIONS, value);
						}
					},
					{
						field: 'attribute',
						headerName: '属性',
						renderCell({ value }) {
							return getOptionLabel(ATTRIBUTE_OPTIONS, value);
						}
					},
					{
						field: 'fall',
						headerName: '掉落物品'
					},
					{
						field: 'createTime',
						headerName: '创建时间'
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
				title={editId ? '编辑怪物' : '新增怪物'}
				open={isOpen}
				onOk={onSave}
				onClose={onCancel}
			>
				<Form labelCol={{ flex: '0 0 100px' }} formik={formik}>
					<Form.Item required name='name' label='怪物名称'>
						<Input size='small' placeholder='请输入怪物名称' />
					</Form.Item>
					<Form.Item name='level' label='怪物等级'>
						<Input size='small' placeholder='请输入怪物等级' />
					</Form.Item>
					<Form.Item name='method' label='攻击方式'>
						<Select placeholder='请选择攻击方式'>
							{METHOD_OPTIONS.map((item) => (
								<MenuItem key={item.value} value={String(item.value)}>
									{item.label}
								</MenuItem>
							))}
						</Select>
					</Form.Item>
					<Form.Item name='attribute' label='怪物属性'>
						<Select placeholder='请选择怪物属性'>
							{ATTRIBUTE_OPTIONS.map((item) => (
								<MenuItem key={item.value} value={String(item.value)}>
									{item.label}
								</MenuItem>
							))}
						</Select>
					</Form.Item>
					<Form.Item name='fall' label='掉落物品'>
						<Input size='small' placeholder='请输入掉落物品' />
					</Form.Item>
				</Form>
			</Modal>
		</PageOverlay>
	);
};
