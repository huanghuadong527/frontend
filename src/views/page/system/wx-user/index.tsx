import { useEffect, useState } from 'react';
import {
	App,
	Button,
	Form,
	Image,
	Input,
	Modal,
	Radio,
	Select,
	Space,
	Table,
	Tag
} from 'antd';
import { DeleteOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import { ImageUpload } from '@/components/image-upload';
import { API_UPLOAD, useTable } from '@/core';
import { deleteWxUser, getWxUserById, updateWxUser } from '@/service';

export const Component = () => {
	const { message, modal } = App.useApp();
	const [isOpen, setIsOpen] = useState(false);
	const [editId, setEditId] = useState<string | number>('');
	const [selectKeys, setSelectKeys] = useState<(string | number)[]>([]);

	const { tableProps, getData } = useTable('/system/wx/user/list', () => searchForm.getFieldsValue());

	const [searchForm] = Form.useForm();
	const [form] = Form.useForm();
	const isMerchant = Form.useWatch('isMerchant', form);

	const onSearch = (values: AnyObject) => {
		getData({
			nickName: values.nickName || undefined,
			status: values.status === '' ? undefined : values.status
		});
	};

	const onReset = () => {
		searchForm.resetFields();
		getData();
	};

	const onFinish = (values: AnyObject) => {
		updateWxUser({
			id: editId,
			avatar: values.avatar || undefined,
			nickName: values.nickName,
			phonenumber: values.phonenumber || undefined,
			intro: values.intro || undefined,
			business: values.business || undefined,
			status: Number(values.status),
			previewCount: values.previewCount === '' ? undefined : Number(values.previewCount),
			isMember: Number(values.isMember),
			isMerchant: Number(values.isMerchant)
		}).then(() => {
			message.success('修改成功');
			onCancel();
			getData();
		});
	};

	const onEdit = (id: string | number) => {
		setEditId(id);
		getWxUserById(id).then((result) => {
			const record = result.data;
			form.setFieldsValue({
				avatar: record.avatar ?? '',
				nickName: record.nickName ?? '',
				phonenumber: record.phonenumber ?? '',
				intro: record.intro ?? '',
				business: record.business ?? '',
				status: record.status != null ? String(record.status) : '0',
				previewCount: record.previewCount != null ? String(record.previewCount) : '',
				isMember: record.isMember != null ? String(record.isMember) : '0',
				isMerchant: record.isMerchant != null ? String(record.isMerchant) : '0'
			});
			setIsOpen(true);
		});
	};

	const onCancel = () => {
		setIsOpen(false);
		setEditId('');
		form.resetFields();
	};

	const onDelete = (id: string | number) => {
		modal.confirm({
			title: '系统提示',
			content: '是否确认删除该微信用户?',
			onOk() {
				deleteWxUser(id).then(() => {
					message.success('删除成功');
					getData();
				});
			}
		});
	};

	const onBatchDelete = () => {
		if (selectKeys.length == 0) {
			message.warning('请选择要删除的微信用户');
			return;
		}
		modal.confirm({
			title: '系统提示',
			content: `是否确认删除选中的 ${selectKeys.length} 项数据?`,
			onOk() {
				deleteWxUser(selectKeys.join(',')).then(() => {
					message.success('删除成功');
					setSelectKeys([]);
					getData();
				});
			}
		});
	};

	const columns = [
		{
			title: '编号',
			dataIndex: 'id',
			width: 80
		},
		{
			title: '头像',
			dataIndex: 'avatar',
			width: 80,
			render: (value: any) => (
				<Image
					src={value ? API_UPLOAD + value : ''}
					width={40}
					height={40}
					style={{ objectFit: 'cover', borderRadius: '50%' }}
				/>
			)
		},
		{
			title: '用户昵称',
			dataIndex: 'nickName'
		},
		{
			title: '手机号码',
			dataIndex: 'phonenumber'
		},
		{
			title: '状态',
			dataIndex: 'status',
			render: (value: any) => (
				<Tag color={value == 0 ? 'success' : 'error'}>
					{value == 0 ? '正常' : '停用'}
				</Tag>
			)
		},
		{
			title: '剩余预览次数',
			dataIndex: 'previewCount',
			width: 120
		},
		{
			title: '会员',
			dataIndex: 'isMember',
			width: 100,
			render: (value: any) => (
				<Tag color={value == 1 ? 'warning' : 'default'}>
					{value == 1 ? '是' : '否'}
				</Tag>
			)
		},
		{
			title: '商人',
			dataIndex: 'isMerchant',
			width: 100,
			render: (value: any) => (
				<Tag color={value == 1 ? 'blue' : 'default'}>
					{value == 1 ? '是' : '否'}
				</Tag>
			)
		},
		{
			title: '创建时间',
			dataIndex: 'createTime'
		},
		{
			title: '备注',
			dataIndex: 'remark'
		},
		{
			title: '操作',
			dataIndex: 'action',
			width: 100,
			render: (_: any, row: AnyObject) => (
				<>
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

	useEffect(() => {
		getData();
	}, []);

	return (
		<div className='p-4 flex flex-col gap-4'>
			<div className='flex items-center justify-between'>
				<Form form={searchForm} layout='inline' onFinish={onSearch}>
					<Form.Item name='nickName' label='用户昵称'>
						<Input placeholder='请输入用户昵称' />
					</Form.Item>
					<Form.Item name='status' label='状态'>
						<Select
							placeholder='请选择状态'
							options={[
								{ value: '', label: '全部' },
								{ value: '0', label: '正常' },
								{ value: '1', label: '停用' }
							]}
						/>
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
				<Button
					danger
					type='primary'
					icon={<DeleteOutlined />}
					disabled={selectKeys.length == 0}
					onClick={onBatchDelete}
				>
					批量删除
				</Button>
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
				title='编辑微信用户'
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
						avatar: '',
						nickName: '',
						phonenumber: '',
						intro: '',
						business: '',
						status: '0',
						previewCount: '',
						isMember: '0',
						isMerchant: '0'
					}}
					onFinish={onFinish}
				>
					<Form.Item name='avatar' label='用户头像'>
						<ImageUpload />
					</Form.Item>
					<Form.Item
						name='nickName'
						label='用户昵称'
						rules={[{ required: true, message: '请输入用户昵称' }]}
					>
						<Input placeholder='请输入用户昵称' />
					</Form.Item>
					<Form.Item name='phonenumber' label='手机号码'>
						<Input placeholder='请输入手机号码' />
					</Form.Item>
					<Form.Item name='status' label='状态'>
						<Radio.Group>
							<Radio value='0'>正常</Radio>
							<Radio value='1'>停用</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item name='previewCount' label='剩余预览次数'>
						<Input placeholder='请输入剩余预览次数' />
					</Form.Item>
					<Form.Item name='isMember' label='会员'>
						<Radio.Group>
							<Radio value='1'>是</Radio>
							<Radio value='0'>否</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item name='isMerchant' label='是否商人'>
						<Radio.Group>
							<Radio value='1'>是</Radio>
							<Radio value='0'>否</Radio>
						</Radio.Group>
					</Form.Item>
					{isMerchant === '1' && (
						<>
							<Form.Item name='intro' label='简介'>
								<Input.TextArea rows={3} placeholder='请输入简介' />
							</Form.Item>
							<Form.Item name='business' label='常用业务'>
								<Input.TextArea rows={3} placeholder='请输入常用业务' />
							</Form.Item>
						</>
					)}
				</Form>
			</Modal>
		</div>
	);
};
