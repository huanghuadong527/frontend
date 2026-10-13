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
	Input,
	Modal,
	Select,
	Space,
	Table,
	Tag
} from 'antd';
import type { TableColumnsType } from 'antd';
import { DICT_TITLE_AREA, useTable } from '@/core';
import {
	addTitle,
	deleteTitle,
	getDictDataByType,
	getTitleById,
	updateTitle
} from '@/service';

export const Component = () => {
	const { message, modal } = App.useApp();
	const [searchForm] = Form.useForm();
	const [form] = Form.useForm();
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKeys, setSelectKeys] = useState<(string | number)[]>([]);
	const [areas, setAreas] = useState<AnyObject[]>([]);

	const { tableProps, getData } = useTable('/game/wm/title/list', () => searchForm.getFieldsValue());

	const onSearch = (values: AnyObject) => {
		getData({
			name: values.name || undefined,
			taskName: values.taskName || undefined,
			area: values.area || undefined
		});
	};

	const onReset = () => {
		searchForm.resetFields();
		getData();
	};

	const onFinish = (values: AnyObject) => {
		const params = {
			...values,
			sort: values.sort === '' ? null : Number(values.sort),
			isAudit: 1
		};
		if (editId) {
			updateTitle({ ...params, id: editId }).then(() => {
				message.success('修改成功');
				onCancel();
				getData();
			});
		} else {
			addTitle({ ...params, isShelf: 1 }).then(() => {
				message.success('新增成功');
				onCancel();
				getData();
			});
		}
	};

	const onEdit = (id?: string | number) => {
		if (id) {
			setEditId(id);
			getTitleById(id).then((result) => {
				const record = result.data;
				form.resetFields();
				form.setFieldsValue({
					name: record.name ?? '',
					taskName: record.taskName ?? '',
					sort: record.sort != null ? String(record.sort) : '',
					area: record.area ?? '',
					attr: record.attr ?? '',
					process: record.process ?? ''
				});
				setIsOpen(true);
			});
		} else {
			setEditId('');
			form.resetFields();
			setIsOpen(true);
		}
	};

	const onSave = () => {
		form.submit();
	};

	const onCancel = () => {
		setIsOpen(false);
		setEditId('');
		form.resetFields();
	};

	const onDelete = (id: string | number) => {
		modal.confirm({
			title: '系统提示',
			content: '是否确认删除该称号?',
			onOk() {
				deleteTitle(id).then(() => {
					message.success('删除成功');
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的称号');
			return;
		}
		modal.confirm({
			title: '系统提示',
			content: `是否确认删除选中的 ${selectKeys.length} 项数据?`,
			onOk() {
				deleteTitle(selectKeys.join(',')).then(() => {
					message.success('删除成功');
					setSelectKeys([]);
					getData();
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
				updateTitle({ ...row, isAudit: 1 }).then(() => {
					message.success('已通过审核');
					getData();
				});
			},
			onCancel() {
				updateTitle({ ...row, isAudit: 2 }).then(() => {
					message.success('已拒绝');
					getData();
				});
			}
		});
	};

	const onShelf = (row: AnyObject) => {
		const next = row.isShelf == 1 ? 0 : 1;
		updateTitle({ ...row, isShelf: next }).then(() => {
			message.success(next == 1 ? '已上架' : '已下架');
			getData();
		});
	};

	useEffect(() => {
		getData();
	}, []);

	useEffect(() => {
		getDictDataByType(DICT_TITLE_AREA).then((result) => {
			const list = result.data ?? [];
			setAreas(
				list.map((item: AnyObject) => ({
					value: item.dictValue,
					label: item.dictLabel
				}))
			);
		});
	}, []);

	const getAreaLabel = (value: unknown) =>
		areas.find((item) => item.value == value)?.label ?? value ?? '--';

	const columns: TableColumnsType<AnyObject> = [
		{ title: '编号', dataIndex: 'id' },
		{ title: '称号名称', dataIndex: 'name' },
		{ title: '任务名称', dataIndex: 'taskName' },
		{ title: '顺序', dataIndex: 'sort' },
		{
			title: '区域',
			dataIndex: 'area',
			render: (value) => getAreaLabel(value)
		},
		{ title: '属性', dataIndex: 'attr' },
		{ title: '流程', dataIndex: 'process' },
		{
			title: '审核状态',
			dataIndex: 'isAudit',
			render: (value) => {
				if (value == 2) return <Tag color='error'>已拒绝</Tag>;
				return value == 1 ? <Tag color='success'>已通过</Tag> : <Tag color='warning'>待审核</Tag>;
			}
		},
		{
			title: '是否上架',
			dataIndex: 'isShelf',
			render: (value) => (value == 1 ? <Tag color='success'>已上架</Tag> : <Tag color='default'>已下架</Tag>)
		},
		{
			title: '操作',
			dataIndex: 'action',
			width: 220,
			render: (_v, row) => (
				<>
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
					<Button
						type='link'
						size='small'
						icon={<EditOutlined />}
						title='编辑'
						onClick={() => onEdit(row.id)}
					/>
					<Button
						type='link'
						size='small'
						danger
						icon={<DeleteOutlined />}
						title='删除'
						onClick={() => onDelete(row.id)}
					/>
				</>
			)
		}
	];

	return (
		<div className='p-4 flex flex-col gap-4'>
			<div className='flex items-center justify-between'>
				<Form form={searchForm} layout='inline' onFinish={onSearch}>
					<Form.Item name='name' label='称号名称'>
						<Input placeholder='请输入称号名称' />
					</Form.Item>
					<Form.Item name='taskName' label='任务名称'>
						<Input placeholder='请输入任务名称' />
					</Form.Item>
					<Form.Item name='area' label='区域'>
						<Select placeholder='请选择区域' options={areas} />
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
				<Space>
					<Button type='primary' icon={<PlusOutlined />} onClick={() => onEdit()}>
						新建
					</Button>
					<Button
						type='primary'
						danger
						icon={<DeleteOutlined />}
						disabled={selectKeys.length == 0}
						onClick={onBatchDelete}
					>
						批量删除
					</Button>
				</Space>
			</div>
			<Table
				{...tableProps}
				rowSelection={{
					selectedRowKeys: selectKeys,
					onChange: (keys) => setSelectKeys(keys as (string | number)[])
				}}
				columns={columns}
			/>
			<Modal
				title={editId ? '编辑称号' : '新增称号'}
				open={isOpen}
				onOk={onSave}
				onCancel={onCancel}
				destroyOnHidden
				forceRender
			>
				<Form
					form={form}
					labelCol={{ flex: '0 0 100px' }}
					onFinish={onFinish}
					initialValues={{
						name: '',
						taskName: '',
						sort: '',
						area: '',
						attr: '',
						process: ''
					}}
				>
					<Form.Item
						name='name'
						label='称号名称'
						rules={[{ required: true, message: '请输入称号名称' }]}
					>
						<Input placeholder='请输入称号名称' />
					</Form.Item>
					<Form.Item name='taskName' label='任务名称'>
						<Input placeholder='请输入任务名称' />
					</Form.Item>
					<Form.Item name='sort' label='顺序'>
						<Input placeholder='请输入顺序' />
					</Form.Item>
					<Form.Item name='area' label='区域'>
						<Select placeholder='请选择区域' options={areas} />
					</Form.Item>
					<Form.Item name='attr' label='属性'>
						<Input placeholder='请输入属性' />
					</Form.Item>
					<Form.Item name='process' label='流程'>
						<Input placeholder='请输入流程' />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};
