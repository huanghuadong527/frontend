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
	Space,
	Table,
	Tag
} from 'antd';
import type { TableColumnsType } from 'antd';
import { ImageUpload } from '@/components/image-upload';
import { useTable } from '@/core';
import {
	addViolation,
	deleteViolation,
	getViolationById,
	updateViolation
} from '@/service';

const renderYesNo = (value: unknown) => (value == 1 ? '是' : '否');

export const Component = () => {
	const { message, modal } = App.useApp();
	const [searchForm] = Form.useForm();
	const [form] = Form.useForm();
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKeys, setSelectKeys] = useState<(string | number)[]>([]);

	const { tableProps, getData } = useTable('/game/wm/violation/list', () => searchForm.getFieldsValue());

	const onSearch = (values: AnyObject) => {
		getData({
			violator: values.violator || undefined,
			behavior: values.behavior || undefined
		});
	};

	const onReset = () => {
		searchForm.resetFields();
		getData();
	};

	const onFinish = (values: AnyObject) => {
		const params = {
			violator: values.violator,
			behavior: values.behavior || undefined,
			url: values.url || undefined,
			isShow: Number(values.isShow),
			isTop: Number(values.isTop),
			isNewZone: Number(values.isNewZone),
			isAudit: 1
		};
		if (editId) {
			updateViolation({ ...params, id: editId }).then(() => {
				message.success('修改成功');
				onCancel();
				getData();
			});
		} else {
			addViolation(params).then(() => {
				message.success('新增成功');
				onCancel();
				getData();
			});
		}
	};

	const onEdit = (id?: string | number) => {
		if (id) {
			setEditId(id);
			getViolationById(id).then((result) => {
				const record = result.data;
				form.resetFields();
				form.setFieldsValue({
					violator: record.violator ?? '',
					behavior: record.behavior ?? '',
					url: record.url ?? '',
					isShow: record.isShow != null ? String(record.isShow) : '1',
					isTop: record.isTop != null ? String(record.isTop) : '0',
					isNewZone: record.isNewZone != null ? String(record.isNewZone) : '0'
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
			content: '是否确认删除该违规记录?',
			onOk() {
				deleteViolation(id).then(() => {
					message.success('删除成功');
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的违规记录');
			return;
		}
		modal.confirm({
			title: '系统提示',
			content: `是否确认删除选中的 ${selectKeys.length} 项数据?`,
			onOk() {
				deleteViolation(selectKeys.join(',')).then(() => {
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
				updateViolation({ ...row, isAudit: 1 }).then(() => {
					message.success('已通过审核');
					getData();
				});
			},
			onCancel() {
				updateViolation({ ...row, isAudit: 2 }).then(() => {
					message.success('已拒绝');
					getData();
				});
			}
		});
	};

	useEffect(() => {
		getData();
	}, []);

	const columns: TableColumnsType<AnyObject> = [
		{ title: '编号', dataIndex: 'id' },
		{ title: '违规人', dataIndex: 'violator' },
		{ title: '违规行为', dataIndex: 'behavior' },
		{
			title: '是否展示',
			dataIndex: 'isShow',
			render: (value) => renderYesNo(value)
		},
		{
			title: '是否置顶',
			dataIndex: 'isTop',
			render: (value) => renderYesNo(value)
		},
		{
			title: '是否新区',
			dataIndex: 'isNewZone',
			render: (value) => renderYesNo(value)
		},
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
					<Form.Item name='violator' label='违规人'>
						<Input placeholder='请输入违规人' />
					</Form.Item>
					<Form.Item name='behavior' label='违规行为'>
						<Input placeholder='请输入违规行为' />
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
				title={editId ? '编辑违规' : '新增违规'}
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
						violator: '',
						behavior: '',
						url: '',
						isShow: '1',
						isTop: '0',
						isNewZone: '0'
					}}
				>
					<Form.Item
						name='violator'
						label='违规人'
						rules={[{ required: true, message: '请输入违规人' }]}
					>
						<Input placeholder='请输入违规人' />
					</Form.Item>
					<Form.Item name='behavior' label='违规行为'>
						<Input.TextArea rows={3} placeholder='请输入违规行为' />
					</Form.Item>
					<Form.Item name='url' label='违规图片'>
						<ImageUpload multiple />
					</Form.Item>
					<Form.Item name='isShow' label='是否展示'>
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
					<Form.Item name='isNewZone' label='是否新区'>
						<Radio.Group>
							<Radio value='1'>是</Radio>
							<Radio value='0'>否</Radio>
						</Radio.Group>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};
