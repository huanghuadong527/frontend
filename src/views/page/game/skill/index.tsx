import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import { Button, IconButton, MenuItem, Stack } from '@mui/material';
import type { GridRowId } from '@mui/x-data-grid';
import { useFormik, type FormikValues } from 'formik';
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
	addSkill,
	deleteSkill,
	getSkillById,
	updateSkill
} from '@/service';

const PROFESSION_OPTIONS = [
	{ value: '武侠', label: '武侠' },
	{ value: '法师', label: '法师' },
	{ value: '羽芒', label: '羽芒' },
	{ value: '羽灵', label: '羽灵' },
	{ value: '妖兽', label: '妖兽' },
	{ value: '妖精', label: '妖精' }
];

const CATEGORY_OPTIONS = [
	{ value: '普通技能', label: '普通技能' },
	{ value: '仙技能', label: '仙技能' },
	{ value: '魔技能', label: '魔技能' }
];

export const Component = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKeys, setSelectKeys] = useState<GridRowId[]>([]);

	const { tableProps, getData } = useTable('/game/wm/skill/list');

	const search = useFormik<FormikValues>({
		initialValues: { profession: '', category: '', name: '' },
		onSubmit(values) {
			getData({
				profession: values.profession || undefined,
				category: values.category || undefined,
				name: values.name || undefined
			});
		},
		onReset() {
			getData();
		}
	});

	const formik = useFormik<FormikValues>({
		initialValues: {
			profession: '',
			category: '',
			name: '',
			description: '',
			weapon: '',
			prerequisite: '',
			xiudaoLevel: '',
			skillType: '',
			maxLevel: '',
			learnLevel: '',
			upgradeLevels: '',
			brief: '',
			icon: ''
		},
		validationSchema: Yup.object().shape({
			name: Yup.string().required('请输入技能名称')
		}),
		onSubmit(values) {
			const params = {
				...values,
				maxLevel: values.maxLevel === '' ? null : Number(values.maxLevel)
			};
			if (editId) {
				updateSkill({ ...params, id: editId }).then(() => {
					message.success('修改成功');
					onCancel();
					getData();
				});
			} else {
				addSkill(params).then(() => {
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
			getSkillById(id).then((result) => {
				const record = result.data;
				formik.resetForm();
				formik.setValues({
					profession: record.profession ?? '',
					category: record.category ?? '',
					name: record.name ?? '',
					description: record.description ?? '',
					weapon: record.weapon ?? '',
					prerequisite: record.prerequisite ?? '',
					xiudaoLevel: record.xiudaoLevel ?? '',
					skillType: record.skillType ?? '',
					maxLevel: record.maxLevel != null ? String(record.maxLevel) : '',
					learnLevel: record.learnLevel ?? '',
					upgradeLevels: record.upgradeLevels ?? '',
					brief: record.brief ?? '',
					icon: record.icon ?? ''
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
			content: '是否确认删除该技能?',
			onOk() {
				deleteSkill(id).then(() => {
					message.success('删除成功');
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的技能');
			return;
		}
		confirm({
			type: 'warning',
			title: '系统提示',
			content: `是否确认删除选中的 ${selectKeys.length} 项数据?`,
			onOk() {
				deleteSkill(selectKeys.join(',')).then(() => {
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
					<Form.Item name='profession' label='职业'>
						<Select placeholder='请选择职业'>
							{PROFESSION_OPTIONS.map((item) => (
								<MenuItem key={item.value} value={item.value}>
									{item.label}
								</MenuItem>
							))}
						</Select>
					</Form.Item>
					<Form.Item name='category' label='技能分类'>
						<Select placeholder='请选择技能分类'>
							{CATEGORY_OPTIONS.map((item) => (
								<MenuItem key={item.value} value={item.value}>
									{item.label}
								</MenuItem>
							))}
						</Select>
					</Form.Item>
					<Form.Item name='name' label='技能名称'>
						<Input size='small' placeholder='请输入技能名称' />
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
					{ field: 'id', headerName: '编号' },
					{ field: 'profession', headerName: '职业' },
					{ field: 'category', headerName: '技能分类' },
					{ field: 'name', headerName: '技能名称' },
					{ field: 'skillType', headerName: '技能类型' },
					{ field: 'maxLevel', headerName: '最高等级' },
					{ field: 'learnLevel', headerName: '学习等级' },
					{ field: 'xiudaoLevel', headerName: '修真期' },
					{ field: 'weapon', headerName: '武器限制' },
					{ field: 'brief', headerName: '技能简介', flex: 1 },
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
				title={editId ? '编辑技能' : '新增技能'}
				open={isOpen}
				onOk={onSave}
				onClose={onCancel}
			>
				<Form labelCol={{ flex: '0 0 100px' }} formik={formik}>
					<Form.Item required name='profession' label='职业'>
						<Select placeholder='请选择职业'>
							{PROFESSION_OPTIONS.map((item) => (
								<MenuItem key={item.value} value={item.value}>
									{item.label}
								</MenuItem>
							))}
						</Select>
					</Form.Item>
					<Form.Item required name='category' label='技能分类'>
						<Select placeholder='请选择技能分类'>
							{CATEGORY_OPTIONS.map((item) => (
								<MenuItem key={item.value} value={item.value}>
									{item.label}
								</MenuItem>
							))}
						</Select>
					</Form.Item>
					<Form.Item required name='name' label='技能名称'>
						<Input size='small' placeholder='请输入技能名称' />
					</Form.Item>
					<Form.Item name='description' label='技能描述'>
						<Input.TextArea minRows={6} placeholder='请输入技能描述' />
					</Form.Item>
					<Form.Item name='weapon' label='武器限制'>
						<Input size='small' placeholder='请输入武器限制' />
					</Form.Item>
					<Form.Item name='prerequisite' label='前置技能'>
						<Input size='small' placeholder='请输入前置技能' />
					</Form.Item>
					<Form.Item name='xiudaoLevel' label='修真期'>
						<Input size='small' placeholder='请输入修真期要求' />
					</Form.Item>
					<Form.Item name='skillType' label='技能类型'>
						<Input size='small' placeholder='请输入技能类型' />
					</Form.Item>
					<Form.Item name='maxLevel' label='最高等级'>
						<Input size='small' placeholder='请输入最高等级' />
					</Form.Item>
					<Form.Item name='learnLevel' label='学习等级'>
						<Input size='small' placeholder='请输入学习等级' />
					</Form.Item>
					<Form.Item name='upgradeLevels' label='升级等级'>
						<Input size='small' placeholder='请输入升级等级' />
					</Form.Item>
					<Form.Item name='brief' label='技能简介'>
						<Input size='small' placeholder='请输入技能简介' />
					</Form.Item>
					<Form.Item name='icon' label='技能图标'>
						<Input size='small' placeholder='请输入技能图标' />
					</Form.Item>
				</Form>
			</Modal>
		</PageOverlay>
	);
};
