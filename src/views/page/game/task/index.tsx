import * as Yup from 'yup';
import xe from 'xe-utils';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, IconButton, Stack } from '@mui/material';
import type { GridRowId } from '@mui/x-data-grid';
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
	Input,
	Modal,
	Table,
	Tree,
	TreeSelect,
	confirm,
	message
} from '@/plugins';
import {
	addTask,
	deleteTask,
	getTaskById,
	getTaskCategoryList,
	getTaskTree,
	updateTask
} from '@/service';
import { useTable } from '@/core';

export const Component = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKeys, setSelectKeys] = useState<GridRowId[]>([]);
	const [parentTree, setParentTree] = useState<AnyObject[]>([]);
	const [nameMap, setNameMap] = useState<CObject>({});
	const [categories, setCategories] = useState<AnyObject[]>([]);
	const selectKeyRef = useRef('');
	const { tableProps, getData } = useTable('/game/wm/task/list');
	const categoryMap: CObject = categories.reduce((acc: CObject, c) => {
		acc[c.id] = c.name;
		return acc;
	}, {});
	const categorySelectTree = useMemo<AnyObject[]>(
		() => categories.map((c) => ({ id: c.id, label: c.name })),
		[categories]
	);
	const categoryTree = useMemo<AnyObject[]>(
		() => [
			{ id: 0, label: '全部任务' },
			...categories.map((c) => ({ id: c.id, label: `[${c.type}]${c.name}` }))
		],
		[categories]
	);

	const loadData = (params: AnyObject = {}) => {
		getData({
			...params,
			categoryId: selectKeyRef.current
				? Number(selectKeyRef.current)
				: undefined
		});
	};

	const getCategoryData = () => {
		getTaskCategoryList().then((result) => {
			setCategories(result.data ?? []);
		});
	};

	const onSelectedChange = (key: string) => {
		selectKeyRef.current = key !== '0' ? key : '';
		loadData();
	};

	const getParentData = () => {
		getTaskTree().then((result) => {
			const list: AnyObject[] = result.data ?? [];
			setNameMap(
				list.reduce((acc: CObject, item) => {
					acc[item.id] = item.name;
					return acc;
				}, {})
			);
			const tree = xe.toArrayTree(
				list.map((item) => ({
					id: item.id,
					label: item.name,
					parentId: item.parentId ?? 0
				}))
			);
			setParentTree(tree);
		});
	};

	const search = useFormik<FormikValues>({
		initialValues: { name: '', level: '' },
		onSubmit(values) {
			loadData({
				name: values.name || undefined,
				level: values.level === '' ? undefined : values.level
			});
		},
		onReset() {
			loadData();
		}
	});

	const formik = useFormik<FormikValues>({
		initialValues: {
			name: '',
			categoryId: '',
			parentId: '',
			level: '',
			npcClaim: '',
			npcComplete: '',
			content: '',
			goldCoin: '',
			exp: '',
			spirit: '',
			prestige: '',
			reward: '',
			remark: ''
		},
		validationSchema: Yup.object().shape({
			name: Yup.string().required('请输入任务名称')
		}),
		onSubmit(values) {
			const toNumber = (v: string) => (v === '' ? null : Number(v));
			const params = {
				...values,
				parentId: values.parentId || null,
				categoryId: toNumber(values.categoryId),
				level: toNumber(values.level),
				goldCoin: toNumber(values.goldCoin),
				exp: toNumber(values.exp),
				spirit: toNumber(values.spirit),
				prestige: toNumber(values.prestige),
				isAudit: 1
			};
			if (editId) {
				updateTask({ ...params, id: editId }).then(() => {
					message.success('修改成功');
					onCancel();
					loadData();
					getParentData();
				});
			} else {
				addTask({ ...params, isShelf: 1 }).then(() => {
					message.success('新增成功');
					onCancel();
					loadData();
					getParentData();
				});
			}
		}
	});

	const onEdit = (id?: string | number) => {
		if (id) {
			setEditId(id);
			getTaskById(id).then((result) => {
				const record = result.data;
				formik.resetForm();
				formik.setValues({
					name: record.name ?? '',
					categoryId:
						record.categoryId != null ? String(record.categoryId) : '',
					parentId: record.parentId != null ? record.parentId : '',
					level: record.level != null ? String(record.level) : '',
					npcClaim: record.npcClaim ?? '',
					npcComplete: record.npcComplete ?? '',
					content: record.content ?? '',
					goldCoin: record.goldCoin != null ? String(record.goldCoin) : '',
					exp: record.exp != null ? String(record.exp) : '',
					spirit: record.spirit != null ? String(record.spirit) : '',
					prestige: record.prestige != null ? String(record.prestige) : '',
					reward: record.reward ?? '',
					remark: record.remark ?? ''
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
			content: '是否确认删除该任务?',
			onOk() {
				deleteTask(id).then(() => {
					message.success('删除成功');
					loadData();
					getParentData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的任务');
			return;
		}
		confirm({
			type: 'warning',
			title: '系统提示',
			content: `是否确认删除选中的 ${selectKeys.length} 项数据?`,
			onOk() {
				deleteTask(selectKeys.join(',')).then(() => {
					message.success('删除成功');
					setSelectKeys([]);
					loadData();
					getParentData();
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
				updateTask({ ...row, isAudit: 1 }).then(() => {
					message.success('已通过审核');
					loadData();
				});
			},
			onCancel() {
				updateTask({ ...row, isAudit: 2 }).then(() => {
					message.success('已拒绝');
					loadData();
				});
			}
		});
	};

	const onShelf = (row: AnyObject) => {
		const next = row.isShelf == 1 ? 0 : 1;
		updateTask({ ...row, isShelf: next }).then(() => {
			message.success(next == 1 ? '已上架' : '已下架');
			loadData();
		});
	};

	useEffect(() => {
		loadData();
		getParentData();
		getCategoryData();
	}, []);

	return (
		<PageOverlay direction='row'>
			<div className='w-3xs flex flex-col gap-4'>
				<div className='flex-1 overflow-y-auto'>
					<Tree
						items={categoryTree}
						onItemSelectionToggle={(_, id, isSelected) =>
							isSelected && onSelectedChange(String(id))
						}
					/>
				</div>
			</div>
			<PageOverlay sx={{ flex: 1 }}>
				<div className='flex items-center justify-between'>
					<Form layout='inline' formik={search}>
						<Form.Item name='name' label='任务名称'>
							<Input size='small' placeholder='请输入任务名称' />
						</Form.Item>
						<Form.Item name='level' label='接取等级'>
							<Input size='small' placeholder='请输入接取等级' />
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
					onRowSelectionModelChange={(model) =>
						setSelectKeys(Array.from(model.ids))
					}
					columns={getColumnData([
						{
							field: 'id',
							headerName: '编号',
							width: 70,
							flex: 0
						},
						{
							field: 'name',
							headerName: '任务名称',
							width: 160,
							flex: 0
						},
						{
							field: 'categoryId',
							headerName: '分类',
							width: 180,
							flex: 0,
							renderCell({ value }) {
								return value ? (categoryMap[value] ?? '--') : '--';
							}
						},
						{
							field: 'parentId',
							headerName: '前置任务',
							width: 160,
							flex: 0,
							renderCell({ value }) {
								return value ? (nameMap[value] ?? value) : '--';
							}
						},
						{
							field: 'level',
							headerName: '接取等级',
							width: 90,
							flex: 0
						},
						{
							field: 'area',
							headerName: '区域',
							width: 90,
							flex: 0
						},
						{
							field: 'npcClaim',
							headerName: '领取NPC',
							width: 150,
							flex: 0
						},
						{
							field: 'npcComplete',
							headerName: '完成NPC',
							width: 150,
							flex: 0
						},
						{
							field: 'content',
							headerName: '任务内容',
							width: 220,
							flex: 0
						},
						{
							field: 'subTask',
							headerName: '子任务',
							width: 120,
							flex: 0
						},
						{
							field: 'summary',
							headerName: '概要',
							width: 120,
							flex: 0
						},
						{
							field: 'killMonster',
							headerName: '击杀怪物',
							width: 130,
							flex: 0
						},
						{
							field: 'monsterLocation',
							headerName: '怪物位置',
							width: 150,
							flex: 0
						},
						{
							field: 'goldCoin',
							headerName: '金币',
							width: 90,
							flex: 0
						},
						{
							field: 'exp',
							headerName: '经验',
							width: 110,
							flex: 0
						},
						{
							field: 'spirit',
							headerName: '元神',
							width: 90,
							flex: 0
						},
						{
							field: 'prestige',
							headerName: '声望',
							width: 90,
							flex: 0
						},
						{
							field: 'sp',
							headerName: 'SP',
							width: 110,
							flex: 0
						},
						{
							field: 'reward',
							headerName: '奖励',
							width: 150,
							flex: 0
						},
						{
							field: 'subSource',
							headerName: '子来源',
							width: 90,
							flex: 0
						},
						{
							field: 'isAudit',
							headerName: '审核状态',
							width: 110,
							flex: 0,
							renderCell({ value }) {
								if (value == 2) return '已拒绝';
								return value == 1 ? '已通过' : '待审核';
							}
						},
						{
							field: 'isShelf',
							headerName: '是否上架',
							width: 110,
							flex: 0,
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
			</PageOverlay>
			<Modal
				title={editId ? '编辑任务' : '新增任务'}
				open={isOpen}
				onOk={onSave}
				onClose={onCancel}
			>
				<Form labelCol={{ flex: '0 0 100px' }} formik={formik}>
					<Form.Item required name='name' label='任务名称'>
						<Input size='small' placeholder='请输入任务名称' />
					</Form.Item>
					<Form.Item name='categoryId' label='分类'>
						<TreeSelect
							placeholder='请选择分类'
							treeData={categorySelectTree}
						/>
					</Form.Item>
					<Form.Item name='parentId' label='前置任务'>
						<TreeSelect placeholder='请选择前置任务' treeData={parentTree} />
					</Form.Item>
					<Form.Item name='level' label='接取等级'>
						<Input size='small' placeholder='请输入接取等级' />
					</Form.Item>
					<Form.Item name='npcClaim' label='领取NPC'>
						<Input size='small' placeholder='请输入领取NPC' />
					</Form.Item>
					<Form.Item name='npcComplete' label='完成NPC'>
						<Input size='small' placeholder='请输入完成NPC' />
					</Form.Item>
					<Form.Item name='content' label='任务内容'>
						<Input.TextArea minRows={3} placeholder='请输入任务内容' />
					</Form.Item>
					<Form.Item name='goldCoin' label='金币'>
						<Input size='small' placeholder='请输入金币' />
					</Form.Item>
					<Form.Item name='exp' label='经验'>
						<Input size='small' placeholder='请输入经验' />
					</Form.Item>
					<Form.Item name='spirit' label='元神'>
						<Input size='small' placeholder='请输入元神' />
					</Form.Item>
					<Form.Item name='prestige' label='声望'>
						<Input size='small' placeholder='请输入声望' />
					</Form.Item>
					<Form.Item name='reward' label='奖励'>
						<Input size='small' placeholder='请输入奖励' />
					</Form.Item>
					<Form.Item name='remark' label='备注'>
						<Input.TextArea placeholder='请输入备注' />
					</Form.Item>
				</Form>
			</Modal>
		</PageOverlay>
	);
};
