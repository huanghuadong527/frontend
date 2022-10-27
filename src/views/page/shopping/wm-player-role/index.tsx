import moment from 'moment';
import { DynamicSearch, DynamicTable } from '@/components';
import { FORM_LAYOUT, SY_CONFIG, useAntdTable } from '@/core';
import {
	Button,
	Form,
	Input,
	message,
	Modal,
	Popconfirm,
	Radio,
	Space,
	Tabs,
	Tag,
	Typography,
	Upload,
	UploadFile,
	UploadProps,
} from 'antd';
import { Key, useState } from 'react';
import {
	addWmPlayerRoleData,
	deleteWmPlayerRoleData,
	getWmPlayerRoleData,
	updateWmPlayerRoleData,
	uploadImage,
} from '@/service';
import { PlusOutlined } from '@ant-design/icons';

import style from './index.module.less';

const WmPlayerRole = () => {
	const [visible, setVisible] = useState(false);
	const [editId, setEditId] = useState('');
	const [selectTabKey, setSelectTabKey] = useState('1');
	const [selectKeys, setSelectKeys] = useState<Key[]>([]);
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [form] = Form.useForm();
	const { dataSource, tableProps, loading, getTableData } = useAntdTable(
		'/wm/player/role/list'
	);

	const onEdit = (id?: string) => {
		if (id) {
			getWmPlayerRoleData(id).then((result) => {
				form.setFieldsValue(result.data);
				if (result.data.wmImage) {
					setFileList(JSON.parse(result.data.wmImage));
				}
				setEditId(id);
				setVisible(true);
			});
		} else {
			setVisible(true);
		}
	};

	const onCancel = () => {
		setVisible(false);
		setEditId('');
		setFileList([]);
		setSelectTabKey('1');
		form.resetFields();
		form.setFieldsValue({ status: 0, noticeIsTop: 0, type: 0 });
	};

	const onSave = () => {
		form.validateFields().then((values) => {
			let wmImage = null;
			if (fileList.length > 0) {
				wmImage = JSON.stringify(
					fileList.map((item) => {
						return {
							url: item.url,
						};
					})
				);
			}
			if (editId) {
				updateWmPlayerRoleData({
					...values,
					id: editId,
					wmImage,
				}).then(() => {
					message.success('更新成功!');
					onCancel();
					getTableData();
				});
			} else {
				addWmPlayerRoleData({
					...values,
					wmImage,
				}).then(() => {
					message.success('添加成功!');
					onCancel();
					getTableData();
				});
			}
		});
	};

	const onSelectItem = (ids: Key[]) => {
		setSelectKeys(ids);
	};

	const onDeleteData = (id: string) => {
		if (id) {
			deleteWmPlayerRoleData(id).then(() => {
				message.success('删除成功!');
				getTableData();
			});
		} else {
			message.warning('请选择布告');
		}
	};

	const onBatchDeleteData = () => {
		if (selectKeys.length > 0) {
			onDeleteData(selectKeys.join(','));
		}
	};

	const onUpload = ({ file }: any) => {
		if (file) {
			const formData = new FormData();
			formData.append('file', file);
			uploadImage(formData).then((result) => {
				setFileList([
					...fileList,
					{
						uid: file.uid,
						name: result.data,
						fileName: file.name,
						status: 'done',
						url: `${SY_CONFIG.upload}${result.data}`,
					},
				]);
			});
		}
	};

	const onRemoveFile: UploadProps['onRemove'] = (file) => {
		setFileList(fileList.filter((item) => item.uid != file.uid));
		return true;
	};

	const onChangeTab = (key: string) => {
		setSelectTabKey(key);
	}

	const headerRender = (
		<div className='flex-row' style={{ justifyContent: 'space-between' }}>
			<DynamicSearch />
			<Space>
				<Button type='primary' onClick={() => onEdit()}>
					新增
				</Button>
				<Popconfirm
					title='是否确认删除?'
					placement='bottomRight'
					onConfirm={() => onBatchDeleteData()}
				>
					<Button danger type='primary' disabled={selectKeys.length == 0}>
						批量删除
					</Button>
				</Popconfirm>
			</Space>
		</div>
	);

	return (
		<div className='container flex-column'>
			<DynamicTable
				size='small'
				rowKey='id'
				headerRender={headerRender}
				columns={[
					{
						title: '角色名称',
						dataIndex: 'wmRoleName',
						width: '20%',
						ellipsis: true,
					},
					{
						title: '区服',
						dataIndex: 'wmServer',
						width: '20%',
						ellipsis: true,
					},
					{
						title: '是否置顶',
						dataIndex: 'wmIsTop',
						width: 80,
						align: 'center',
						ellipsis: true,
						render: (value) => {
							switch (value) {
								case 0:
									return (
										<Tag color='#f50' style={{ margin: 0 }}>
											置顶
										</Tag>
									);
								default:
									return <Tag style={{ margin: 0 }}>普通</Tag>;
							}
						},
					},
					{
						title: '职业性别',
						dataIndex: 'wmOccupationSex',
						width: '20%',
						ellipsis: true,
					},
					{
						title: '等级境界',
						dataIndex: 'wmLevelRealm',
						width: '20%',
						ellipsis: true,
					},
					{
						title: '商品号',
						dataIndex: 'wmGoodsId',
						width: '20%',
						ellipsis: true,
					},
					{
						title: '联系方式',
						dataIndex: 'wmContact',
						width: '20%',
						ellipsis: true,
					},
					{
						title: '武器精炼',
						dataIndex: 'wmWeaponRefining',
						width: '20%',
						ellipsis: true,
					},
					{
						title: '是否可谈',
						dataIndex: 'wmIsNegotiable',
						width: 120,
						align: 'center',
						render: (value) => {
							switch (value) {
								case 0:
									return <Typography.Text type='success'>是</Typography.Text>;
								default:
									return <Typography.Text type='danger'>否</Typography.Text>;
							}
						},
					},
					{
						title: '创建日期',
						dataIndex: 'createDate',
						width: '20%',
						ellipsis: true,
						render: (date) => {
							if (date) {
								return moment(new Date(date)).format('YYYY-MM-DD HH:mm:ss');
							}
							return '-';
						},
					},
					{
						title: '更新日期',
						dataIndex: 'createDate',
						width: '20%',
						ellipsis: true,
						render: (date) => {
							if (date) {
								return moment(new Date(date)).format('YYYY-MM-DD HH:mm:ss');
							}
							return '-';
						},
					},
					{
						title: '操作',
						dataIndex: 'handle',
						width: 100,
						fixed: 'right',
						render: (value, record: any) => {
							return (
								<Space>
									<Button
										size='small'
										type='link'
										onClick={() => onEdit(record.id)}
									>
										编辑
									</Button>
									<Popconfirm
										title='是否确认删除?'
										placement='bottomRight'
										onConfirm={() => onDeleteData(record.id)}
									>
										<Button danger size='small' type='link'>
											删除
										</Button>
									</Popconfirm>
								</Space>
							);
						},
					},
				]}
				rowSelection={{
					onChange: (keys: Key[]) => {
						onSelectItem(keys);
					},
				}}
				loading={loading}
				dataSource={dataSource}
				scroll={{ y: '100%' }}
				{...tableProps}
			/>
			<Modal
				okText='保存'
				title={editId == '' ? '新增' : '编辑'}
				open={visible}
				onOk={onSave}
				onCancel={onCancel}
			>
				<Form
					{...FORM_LAYOUT}
					form={form}
					initialValues={{ wmIsTop: 1, wmIsNegotiable: 0 }}
				>
					<Tabs activeKey={selectTabKey} onChange={onChangeTab}>
						<Tabs.TabPane tab='基本信息' key='1' forceRender={true}>
							<Form.Item
								label='角色名称'
								name='wmRoleName'
								rules={[{ required: true }]}
							>
								<Input placeholder='请输入角色名称' />
							</Form.Item>
							<Form.Item
								label='区服'
								name='wmServer'
								rules={[{ required: true }]}
							>
								<Input placeholder='请输入区服' />
							</Form.Item>
							<Form.Item label='是否置顶' name='wmIsTop'>
								<Radio.Group>
									<Radio value={0}>是</Radio>
									<Radio value={1}>否</Radio>
								</Radio.Group>
							</Form.Item>
							<Form.Item label='商品号' name='wmGoodsId'>
								<Input placeholder='请输入商品号' />
							</Form.Item>
							<Form.Item label='价格' name='wmPrice'>
								<Input placeholder='请输入价格' />
							</Form.Item>
							<Form.Item
								label='联系方式'
								name='wmContact'
								rules={[{ required: true }]}
							>
								<Input placeholder='请输入联系方式' />
							</Form.Item>
							<Form.Item label='是否可谈' name='wmIsNegotiable'>
								<Radio.Group>
									<Radio value={0}>是</Radio>
									<Radio value={1}>否</Radio>
								</Radio.Group>
							</Form.Item>
						</Tabs.TabPane>
						<Tabs.TabPane tab='账号信息' key='2' forceRender={true}>
							<Form.Item
								label='职业性别'
								name='wmOccupationSex'
								rules={[{ required: true }]}
							>
								<Input placeholder='请输入职业性别' />
							</Form.Item>
							<Form.Item
								label='等级境界'
								name='wmLevelRealm'
								rules={[{ required: true }]}
							>
								<Input placeholder='请输入等级境界' />
							</Form.Item>
							<Form.Item
								label='武器精炼'
								name='wmWeaponRefining'
								rules={[{ required: true }]}
							>
								<Input placeholder='请输入武器精炼' />
							</Form.Item>
							<Form.Item
								label='战灵'
								name='wmWarSpirit'
								rules={[{ required: true }]}
							>
								<Input placeholder='请输入战灵' />
							</Form.Item>
							<Form.Item
								label='星盘'
								name='wmAstrolabe'
								rules={[{ required: true }]}
							>
								<Input placeholder='请输入星盘' />
							</Form.Item>
							<Form.Item
								label='装备石头'
								name='wmEquipStone'
								rules={[{ required: true }]}
							>
								<Input placeholder='请输入装备石头' />
							</Form.Item>
							<Form.Item label='家园情况' name='wmHomeland'>
								<Input placeholder='请输入家园情况' />
							</Form.Item>
							<Form.Item label='符文情况' name='wmRune'>
								<Input placeholder='请输入符文情况' />
							</Form.Item>
							<Form.Item label='称号情况' name='wmTitle'>
								<Input placeholder='请输入称号情况' />
							</Form.Item>
							<Form.Item label='宠物情况' name='wmPet'>
								<Input placeholder='请输入宠物情况' />
							</Form.Item>
						</Tabs.TabPane>
						<Tabs.TabPane tab='上传图片' key='3' forceRender={true}>
							<Upload
								listType='picture-card'
								customRequest={onUpload}
								fileList={fileList}
								onRemove={onRemoveFile}
							>
								{fileList.length >= 8 ? null : (
									<div className={style.updatePicture}>
										<PlusOutlined />
										<div style={{ marginTop: 8 }}>点击上传</div>
									</div>
								)}
							</Upload>
						</Tabs.TabPane>
					</Tabs>
				</Form>
			</Modal>
		</div>
	);
};

export default WmPlayerRole;
