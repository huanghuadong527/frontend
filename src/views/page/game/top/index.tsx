import { useEffect, useState } from 'react';
import {
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
	Radio,
	Select,
	Space,
	Table,
	Tag
} from 'antd';
import type { TableColumnsType } from 'antd';
import { ImageUpload } from '@/components/image-upload';
import { DICT_TOP_MODULE, useTable } from '@/core';
import { usePermission } from '@/authority';
import {
	addTop,
	deleteTop,
	getDictDataByType,
	getTopById,
	updateTop
} from '@/service';

const renderYesNo = (value: unknown) => (value == 1 ? '是' : '否');

export const Component = () => {
	const { hasPermi } = usePermission();
	const { message, modal } = App.useApp();
	const [searchForm] = Form.useForm();
	const [form] = Form.useForm();
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKeys, setSelectKeys] = useState<(string | number)[]>([]);
	const [modules, setModules] = useState<AnyObject[]>([]);

	const { tableProps, getData } = useTable('/game/wm/top/list', () => searchForm.getFieldsValue());

	const onSearch = (values: AnyObject) => {
		getData({
			name: values.name || undefined,
			module: values.module || undefined
		});
	};

	const onReset = () => {
		searchForm.resetFields();
		getData();
	};

	const onFinish = (values: AnyObject) => {
		const params = {
			name: values.name,
			module: values.module || undefined,
			image: values.image || undefined,
			isShow: Number(values.isShow),
			isTop: Number(values.isTop),
			sort: Number(values.sort) || 0,
			description: values.description || undefined,
			isAudit: 1
		};
		if (editId) {
			updateTop({ ...params, id: editId }).then(() => {
				message.success('修改成功');
				onCancel();
				getData();
			});
		} else {
			addTop(params).then(() => {
				message.success('新增成功');
				onCancel();
				getData();
			});
		}
	};

	const onEdit = (id?: string | number) => {
		if (id) {
			setEditId(id);
			getTopById(id).then((result) => {
				const record = result.data;
				form.resetFields();
				form.setFieldsValue({
					name: record.name ?? '',
					module: record.module ?? '0',
					image: record.image ?? '',
					isShow: record.isShow != null ? String(record.isShow) : '1',
					isTop: record.isTop != null ? String(record.isTop) : '0',
					sort: record.sort != null ? String(record.sort) : '0',
					description: record.description ?? ''
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
			content: '是否确认删除该置顶记录?',
			onOk() {
				deleteTop(id).then(() => {
					message.success('删除成功');
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的置顶记录');
			return;
		}
		modal.confirm({
			title: '系统提示',
			content: `是否确认删除选中的 ${selectKeys.length} 项数据?`,
			onOk() {
				deleteTop(selectKeys.join(',')).then(() => {
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
				updateTop({ ...row, isAudit: 1 }).then(() => {
					message.success('已通过审核');
					getData();
				});
			},
			onCancel() {
				updateTop({ ...row, isAudit: 2 }).then(() => {
					message.success('已拒绝');
					getData();
				});
			}
		});
	};

	useEffect(() => {
		getData();
	}, []);

	useEffect(() => {
		getDictDataByType(DICT_TOP_MODULE).then((result) => {
			const list = result.data ?? [];
			setModules(
				list.map((item: AnyObject) => ({
					value: item.dictValue,
					label: item.dictLabel
				}))
			);
		});
	}, []);

	const getModuleLabel = (value: unknown) =>
		modules.find((item) => item.value == value)?.label ?? value ?? '--';

	const columns: TableColumnsType<AnyObject> = [
		{ title: '编号', dataIndex: 'id' },
		{ title: '名称', dataIndex: 'name' },
		{
			title: '所属模块',
			dataIndex: 'module',
			render: (value) => getModuleLabel(value)
		},
		{
			title: '是否显示',
			dataIndex: 'isShow',
			render: (value) => renderYesNo(value)
		},
		{
			title: '是否置顶',
			dataIndex: 'isTop',
			render: (value) => renderYesNo(value)
		},
		{ title: '排序', dataIndex: 'sort' },
		{
			title: '审核状态',
			dataIndex: 'isAudit',
			render: (value) => {
				if (value == 2) return <Tag color='error'>已拒绝</Tag>;
				return value == 1 ? <Tag color='success'>已通过</Tag> : <Tag color='warning'>待审核</Tag>;
			}
		},
		{ title: '创建时间', dataIndex: 'createTime' },
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
					{hasPermi('game:top:edit') && (
						<Button
							type='link'
							size='small'
							icon={<EditOutlined />}
							title='编辑'
							onClick={() => onEdit(row.id)}
						/>
					)}
					{hasPermi('game:top:remove') && (
						<Button
							type='link'
							size='small'
							danger
							icon={<DeleteOutlined />}
							title='删除'
							onClick={() => onDelete(row.id)}
						/>
					)}
				</>
			)
		}
	];

	return (
		<div className='p-4 flex flex-col gap-4'>
			<div className='flex items-center justify-between'>
				<Form form={searchForm} layout='inline' onFinish={onSearch}>
					<Form.Item name='name' label='名称'>
						<Input placeholder='请输入名称' />
					</Form.Item>
					<Form.Item name='module' label='所属模块'>
						<Select placeholder='请选择所属模块' options={modules} />
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
					{hasPermi('game:top:add') && (
						<Button type='primary' icon={<PlusOutlined />} onClick={() => onEdit()}>
							新建
						</Button>
					)}
					{hasPermi('game:top:remove') && (
						<Button
							type='primary'
							danger
							icon={<DeleteOutlined />}
							disabled={selectKeys.length == 0}
							onClick={onBatchDelete}
						>
							批量删除
						</Button>
					)}
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
				title={editId ? '编辑置顶' : '新增置顶'}
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
						module: '0',
						image: '',
						isShow: '1',
						isTop: '0',
						sort: '0',
						description: ''
					}}
				>
					<Form.Item
						name='name'
						label='名称'
						rules={[{ required: true, message: '请输入名称' }]}
					>
						<Input placeholder='请输入名称' />
					</Form.Item>
					<Form.Item name='module' label='所属模块'>
						<Select placeholder='请选择所属模块' options={modules} />
					</Form.Item>
					<Form.Item name='image' label='置顶图片'>
						<ImageUpload />
					</Form.Item>
					<Form.Item name='isShow' label='是否显示'>
						<Radio.Group>
							<Radio value='1'>是</Radio>
							<Radio value='0'>否</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item name='isTop' label='是否置顶'>
						<Radio.Group>
							<Radio value='1'>是</Radio>
							<Radio value='0'>否</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item name='sort' label='排序'>
						<Input placeholder='请输入排序值(升序)' />
					</Form.Item>
					<Form.Item name='description' label='描述'>
						<Input.TextArea rows={3} placeholder='请输入描述' />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};
