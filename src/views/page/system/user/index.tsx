import xe from 'xe-utils';
import { useEffect, useState } from 'react';
import {
	App,
	Button,
	Form,
	Input,
	Modal,
	Radio,
	Space,
	Table,
	Tree,
	TreeSelect
} from 'antd';
import {
	DeleteOutlined,
	EditOutlined,
	PlusOutlined,
	SearchOutlined
} from '@ant-design/icons';
import {
	addUser,
	deleteUser,
	getDictDataByTypes,
	getUserById,
	getUserDeptTree,
	updateUser
} from '@/service';
import { DICT_STATUS, DICT_USER_SEX, useTable } from '@/core';
import { usePermission } from '@/authority';

export const Component = () => {
	const { message, modal } = App.useApp();
	const { hasPermi } = usePermission();
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKey, setSelectKey] = useState<string>();
	const [selectKeys, setSelectKeys] = useState<(string | number)[]>([]);
	const [dicts, setDicts] = useState<AnyObject>();
	const [expanedKey, setExpandKey] = useState<string[]>([]);
	const [deptTree, setDeptTree] = useState<TreeItemsType[]>([]);

	const { tableProps, getData } = useTable('/system/user/list', () => searchForm.getFieldsValue());

	const [searchForm] = Form.useForm();
	const [form] = Form.useForm();

	const onSearch = (values: AnyObject) => {
		getData({ deptId: selectKey, ...values });
	};

	const onReset = () => {
		searchForm.resetFields();
		getData({ deptId: selectKey });
	};

	const onFinish = (values: AnyObject) => {
		const params: AnyObject = {
			userName: values.userName,
			nickName: values.nickName,
			deptId:
				values.deptId === '' || values.deptId == null
					? null
					: Number(values.deptId),
			email: values.email || undefined,
			phonenumber: values.phonenumber || undefined,
			sex: Number(values.sex),
			status: Number(values.status),
			remark: values.remark || undefined
		};
		if (editId) {
			updateUser({ ...params, id: editId }).then(() => {
				message.success('修改成功');
				onCancel();
				getData();
			});
		} else {
			if (!values.password) {
				message.warning('请输入密码');
				return;
			}
			if (values.password.length < 6) {
				message.warning('密码不能少于6个字符');
				return;
			}
			addUser({ ...params, password: values.password }).then(() => {
				message.success('新增成功');
				onCancel();
				getData();
			});
		}
	};

	const getDictLabel = (type: string, value: any) => {
		if (dicts && dicts[type]) {
			const dict = dicts[type].find((item: any) => item.dictValue == value);
			if (dict && dict.dictLabel) {
				return dict.dictLabel;
			}
		}
		return '';
	};

	const getUserDeptTreeData = () => {
		getUserDeptTree({}).then((result) => {
			setExpandKey(xe.toTreeArray(result.data).map((item) => item.id));
			setDeptTree(result.data);
		});
	};

	const getDictTypesData = () => {
		getDictDataByTypes([DICT_USER_SEX, DICT_STATUS].join(',')).then(
			(result) => {
				setDicts(result.data);
			}
		);
	};

	const onSelectedChange = (key: string) => {
		setSelectKey(key);
	};

	const onEdit = (id?: string | number) => {
		if (id) {
			setEditId(id);
			getUserById(id).then((result) => {
				const record = result.data;
				form.setFieldsValue({
					userName: record.userName ?? '',
					nickName: record.nickName ?? '',
					deptId: record.deptId != null ? String(record.deptId) : '',
					password: '',
					email: record.email ?? '',
					phonenumber: record.phonenumber ?? '',
					sex: record.sex != null ? String(record.sex) : '0',
					status: record.status != null ? String(record.status) : '0',
					remark: record.remark ?? ''
				});
				setIsOpen(true);
			});
		} else {
			setEditId('');
			form.resetFields();
			setIsOpen(true);
		}
	};

	const onCancel = () => {
		setIsOpen(false);
		setEditId('');
		form.resetFields();
	};

	const onDelete = (id: string | number) => {
		modal.confirm({
			title: '系统提示',
			content: '是否确认删除该用户?',
			onOk() {
				deleteUser(id).then(() => {
					message.success('删除成功');
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的用户');
			return;
		}
		modal.confirm({
			title: '系统提示',
			content: `是否确认删除选中的 ${selectKeys.length} 项数据?`,
			onOk() {
				deleteUser(selectKeys.join(',')).then(() => {
					message.success('删除成功');
					setSelectKeys([]);
					getData();
				});
			}
		});
	};

	const columns = [
		{
			title: '用户名',
			dataIndex: 'userName'
		},
		{
			title: '用户昵称',
			dataIndex: 'nickName'
		},
		{
			title: '部门',
			dataIndex: 'deptId',
			render: (value: any) => {
				if (deptTree) {
					const mi = xe.findTree(deptTree, (item) => item.id == value);
					if (mi && mi.item) {
						return mi.item.label;
					}
				}
				return '';
			}
		},
		{
			title: '性别',
			dataIndex: 'sex',
			render: (value: any) => {
				return getDictLabel(DICT_USER_SEX, value);
			}
		},
		{
			title: '手机号',
			dataIndex: 'phonenumber'
		},
		{
			title: '状态',
			dataIndex: 'status',
			render: (value: any) => {
				return getDictLabel(DICT_STATUS, value);
			}
		},
		{
			title: '创建时间',
			dataIndex: 'createTime'
		},
		{
			title: '操作',
			dataIndex: 'action',
			width: 100,
			render: (_: any, row: AnyObject) => (
				<>
					{hasPermi('system:user:edit') && (
						<Button
							type='link'
							size='small'
							icon={<EditOutlined />}
							title='编辑'
							onClick={() => onEdit(row.id)}
						/>
					)}
					{hasPermi('system:user:remove') && (
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

	useEffect(() => {
		getData({ deptId: selectKey, ...searchForm.getFieldsValue() });
	}, [selectKey]);

	useEffect(() => {
		getDictTypesData();
		getUserDeptTreeData();
	}, []);

	return (
		<div className='p-4 flex gap-4'>
			<div className='w-3xs flex flex-col gap-4'>
				<Input
					placeholder='请输入部门名称'
					prefix={<SearchOutlined />}
				/>
				<div className='flex-1 overflow-y-auto'>
					<Tree
						showLine
						treeData={deptTree as AnyObject[]}
						fieldNames={{ title: 'label', key: 'id', children: 'children' }}
						expandedKeys={expanedKey}
						onExpand={(keys) => setExpandKey(keys as string[])}
						onSelect={(keys) => {
							if (keys.length) onSelectedChange(String(keys[0]));
						}}
					/>
				</div>
			</div>
			<div className='p-4 flex flex-col gap-4 flex-1'>
				<div className='flex items-center justify-between'>
					<Form form={searchForm} layout='inline' onFinish={onSearch}>
						<Form.Item name='userName' label='用户名'>
							<Input placeholder='请输入' />
						</Form.Item>
						<Form.Item>
							<Space>
								<Button type='primary' htmlType='submit'>
									查询
								</Button>
								<Button onClick={onReset}>重置</Button>
							</Space>
						</Form.Item>
					</Form>
					<Space>
						{hasPermi('system:user:add') && (
							<Button
								type='primary'
								icon={<PlusOutlined />}
								onClick={() => onEdit()}
							>
								新建
							</Button>
						)}
						{hasPermi('system:user:remove') && (
							<Button
								danger
								type='primary'
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
			</div>
			<Modal
				title={editId ? '编辑用户' : '新增用户'}
				open={isOpen}
				destroyOnHidden
				forceRender
				onOk={() => form.submit()}
				onCancel={onCancel}
			>
				<Form
					form={form}
					labelCol={{ flex: '0 0 100px' }}
					initialValues={{
						userName: '',
						nickName: '',
						deptId: '',
						password: '',
						email: '',
						phonenumber: '',
						sex: '0',
						status: '0',
						remark: ''
					}}
					onFinish={onFinish}
				>
					<Form.Item
						name='userName'
						label='用户名称'
						rules={[{ required: true, message: '请输入用户名称' }]}
					>
						<Input placeholder='请输入名称' />
					</Form.Item>
					<Form.Item
						name='nickName'
						label='用户昵称'
						rules={[{ required: true, message: '请输入用户昵称' }]}
					>
						<Input placeholder='请输入昵称' />
					</Form.Item>
					{!editId && (
						<Form.Item name='password' label='密码' required>
							<Input.Password placeholder='请输入密码' />
						</Form.Item>
					)}
					<Form.Item name='deptId' label='部门'>
						<TreeSelect
							placeholder='请选择部门'
							treeData={deptTree as AnyObject[]}
							fieldNames={{ value: 'id' }}
						/>
					</Form.Item>
					<Form.Item name='email' label='邮箱'>
						<Input placeholder='请输入邮箱' />
					</Form.Item>
					<Form.Item name='phonenumber' label='手机号码'>
						<Input placeholder='请输入手机号码' />
					</Form.Item>
					<Form.Item name='sex' label='性别'>
						<Radio.Group>
							{dicts &&
								dicts[DICT_USER_SEX].map((item: any) => (
									<Radio key={item.id} value={item.dictValue}>
										{item.dictLabel}
									</Radio>
								))}
						</Radio.Group>
					</Form.Item>
					<Form.Item name='status' label='状态'>
						<Radio.Group>
							{dicts &&
								dicts[DICT_STATUS].map((item: any) => (
									<Radio key={item.id} value={item.dictValue}>
										{item.dictLabel}
									</Radio>
								))}
						</Radio.Group>
					</Form.Item>
					<Form.Item name='remark' label='备注'>
						<Input.TextArea placeholder='请输入备注' />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};
