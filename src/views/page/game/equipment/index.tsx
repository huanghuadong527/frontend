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
	addEquipment,
	deleteEquipment,
	getEquipmentById,
	updateEquipment
} from '@/service';

const GROUP_OPTIONS = [
	{ value: '神月谷', label: '神月谷' },
	{ value: '99（天狱套装）', label: '99（天狱套装）' },
	{ value: '黄昏圣殿 · 90', label: '黄昏圣殿 · 90' },
	{ value: '黄昏圣殿 · 100', label: '黄昏圣殿 · 100' },
	{ value: '覆霜城', label: '覆霜城' },
	{ value: '职业装', label: '职业装' }
];

export const Component = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKeys, setSelectKeys] = useState<GridRowId[]>([]);

	const { tableProps, getData } = useTable('/game/wm/equipment/list');

	const search = useFormik<FormikValues>({
		initialValues: { groupName: '', slot: '', name: '' },
		onSubmit(values) {
			getData({
				groupName: values.groupName || undefined,
				slot: values.slot || undefined,
				name: values.name || undefined
			});
		},
		onReset() {
			getData();
		}
	});

	const formik = useFormik<FormikValues>({
		initialValues: {
			groupName: '',
			name: '',
			holes: '',
			slot: '',
			grade: '',
			level: '',
			durability: '',
			price: '',
			className: '',
			ammo: '',
			requirements: '',
			attributes: '',
			bonuses: '',
			setName: '',
			setCount: '',
			setBonuses: ''
		},
		validationSchema: Yup.object().shape({
			name: Yup.string().required('请输入装备名称')
		}),
		onSubmit(values) {
			const params = {
				...values,
				holes: values.holes === '' ? null : Number(values.holes),
				grade: values.grade === '' ? null : Number(values.grade),
				level: values.level === '' ? null : Number(values.level),
				price: values.price === '' ? null : Number(values.price),
				setCount: values.setCount === '' ? null : Number(values.setCount)
			};
			if (editId) {
				updateEquipment({ ...params, id: editId }).then(() => {
					message.success('修改成功');
					onCancel();
					getData();
				});
			} else {
				addEquipment(params).then(() => {
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
			getEquipmentById(id).then((result) => {
				const record = result.data;
				formik.resetForm();
				formik.setValues({
					groupName: record.groupName ?? '',
					name: record.name ?? '',
					holes: record.holes != null ? String(record.holes) : '',
					slot: record.slot ?? '',
					grade: record.grade != null ? String(record.grade) : '',
					level: record.level != null ? String(record.level) : '',
					durability: record.durability ?? '',
					price: record.price != null ? String(record.price) : '',
					className: record.className ?? '',
					ammo: record.ammo ?? '',
					requirements: record.requirements ?? '',
					attributes: record.attributes ?? '',
					bonuses: record.bonuses ?? '',
					setName: record.setName ?? '',
					setCount: record.setCount != null ? String(record.setCount) : '',
					setBonuses: record.setBonuses ?? ''
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
			content: '是否确认删除该装备?',
			onOk() {
				deleteEquipment(id).then(() => {
					message.success('删除成功');
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的装备');
			return;
		}
		confirm({
			type: 'warning',
			title: '系统提示',
			content: `是否确认删除选中的 ${selectKeys.length} 项数据?`,
			onOk() {
				deleteEquipment(selectKeys.join(',')).then(() => {
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
					<Form.Item name='groupName' label='分组'>
						<Select placeholder='请选择分组'>
							{GROUP_OPTIONS.map((item) => (
								<MenuItem key={item.value} value={item.value}>
									{item.label}
								</MenuItem>
							))}
						</Select>
					</Form.Item>
					<Form.Item name='slot' label='部位'>
						<Input size='small' placeholder='请输入装备部位' />
					</Form.Item>
					<Form.Item name='name' label='装备名称'>
						<Input size='small' placeholder='请输入装备名称' />
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
					{ field: 'groupName', headerName: '分组' },
					{ field: 'name', headerName: '装备名称' },
					{ field: 'holes', headerName: '孔数' },
					{ field: 'slot', headerName: '部位' },
					{ field: 'grade', headerName: '品阶' },
					{ field: 'level', headerName: '等级' },
					{ field: 'durability', headerName: '耐久' },
					{ field: 'price', headerName: '价格' },
					{ field: 'className', headerName: '职业限制' },
					{ field: 'setName', headerName: '套装名称', flex: 1 },
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
				title={editId ? '编辑装备' : '新增装备'}
				open={isOpen}
				onOk={onSave}
				onClose={onCancel}
			>
				<Form labelCol={{ flex: '0 0 100px' }} formik={formik}>
					<Form.Item required name='groupName' label='分组'>
						<Select placeholder='请选择分组'>
							{GROUP_OPTIONS.map((item) => (
								<MenuItem key={item.value} value={item.value}>
									{item.label}
								</MenuItem>
							))}
						</Select>
					</Form.Item>
					<Form.Item required name='name' label='装备名称'>
						<Input size='small' placeholder='请输入装备名称' />
					</Form.Item>
					<Form.Item name='holes' label='孔数'>
						<Input size='small' placeholder='请输入孔数' />
					</Form.Item>
					<Form.Item name='slot' label='部位'>
						<Input size='small' placeholder='请输入装备部位' />
					</Form.Item>
					<Form.Item name='grade' label='品阶'>
						<Input size='small' placeholder='请输入品阶' />
					</Form.Item>
					<Form.Item name='level' label='等级'>
						<Input size='small' placeholder='请输入装备等级' />
					</Form.Item>
					<Form.Item name='durability' label='耐久'>
						<Input size='small' placeholder='请输入耐久' />
					</Form.Item>
					<Form.Item name='price' label='价格'>
						<Input size='small' placeholder='请输入价格' />
					</Form.Item>
					<Form.Item name='className' label='职业限制'>
						<Input size='small' placeholder='请输入职业限制' />
					</Form.Item>
					<Form.Item name='ammo' label='弹药'>
						<Input size='small' placeholder='请输入弹药' />
					</Form.Item>
					<Form.Item name='setName' label='套装名称'>
						<Input size='small' placeholder='请输入套装名称' />
					</Form.Item>
					<Form.Item name='setCount' label='套装件数'>
						<Input size='small' placeholder='请输入套装件数' />
					</Form.Item>
					<Form.Item name='requirements' label='需求'>
						<Input.TextArea minRows={3} placeholder='JSON 格式，如 {"力量":55}' />
					</Form.Item>
					<Form.Item name='attributes' label='属性'>
						<Input.TextArea minRows={3} placeholder='JSON 格式，如 [{"k":"物理防御","v":"+158"}]' />
					</Form.Item>
					<Form.Item name='bonuses' label='加成'>
						<Input.TextArea minRows={3} placeholder='JSON 格式，如 [{"k":"走跑速度","v":"+0.30"}]' />
					</Form.Item>
					<Form.Item name='setBonuses' label='套装加成'>
						<Input.TextArea minRows={3} placeholder='JSON 格式，如 ["(2) 体质+10"]' />
					</Form.Item>
				</Form>
			</Modal>
		</PageOverlay>
	);
};
