import moment from 'moment';
import { FORM_LAYOUT, SY_CONFIG, useAntdTable } from '@/core';
import {
	addCharacterData,
	deleteCharacterData,
	getCharacterDataById,
	updateCharacterData,
	uploadImage,
} from '@/service';
import { UploadFile, UploadProps } from 'antd/lib/upload/interface';
import { DynamicSearch, DynamicTable } from '@/components';
import {
	Button,
	Form,
	Input,
	InputNumber,
	message,
	Modal,
	Popconfirm,
	Radio,
	Space,
	Typography,
	Upload,
} from 'antd';
import { Key, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';

const Character = () => {
	const [visible, setVisible] = useState(false);
	const [editId, setEditId] = useState('');
	const [selectKeys, setSelectKeys] = useState<Key[]>([]);
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [form] = Form.useForm();
	const { dataSource, tableProps, loading, getTableData } =
		useAntdTable('/character/list');

	const onSelectItem = (keys: Key[]) => {
		setSelectKeys(keys);
	};

	const onEdit = (id?: string) => {
		if (id) {
			if (id) {
				setEditId(id);
				getCharacterDataById(id).then((result) => {
					if (result.data) {
						if (result.data.characterUrl) {
							setFileList(
								result.data.characterUrl.split(',').map((url: string) => {
									return {
										uid: url,
										name: url,
										url: `${SY_CONFIG.upload}${url}`,
									};
								})
							);
						}
						form.setFieldsValue(result.data);
						setVisible(true);
					}
				});
			}
		} else {
			setVisible(true);
		}
	};

	const onSave = () => {
		form.validateFields().then((values) => {
			if (editId) {
				updateCharacterData({
					...values,
					id: editId,
					characterUrl: fileList.map((item) => item.name).join(','),
				}).then(() => {
					onCancel();
					message.success('更新成功!');
					getTableData();
				});
			} else {
				addCharacterData({
					...values,
					characterUrl: fileList.map((item) => item.name).join(','),
				}).then(() => {
					onCancel();
					message.success('添加成功!');
					getTableData();
				});
			}
		});
	};

	const onCancel = () => {
		setVisible(false);
		setEditId('');
		setFileList([]);
		form.resetFields();
		form.setFieldsValue({ status: 0 });
	};

	const onDeleteData = (id: string) => {
		if (id) {
			deleteCharacterData(id).then(() => {
        setSelectKeys([]);
				getTableData();
				message.success('删除成功!');
			});
		} else {
			message.warning('请选择删除代码!');
		}
	};

	const onBatchDeleteData = () => {
		if (selectKeys.length > 0) {
			onDeleteData(selectKeys.join(','));
		}
	};

	const onRemoveFile: UploadProps['onRemove'] = (file) => {
		setFileList(fileList.filter((item) => item.uid != file.uid));
		return true;
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
						title: '代码名称',
						dataIndex: 'characterName',
						width: '20%',
						ellipsis: true,
					},
					{
						title: '代码价格',
						dataIndex: 'characterPrice',
						width: '20%',
						ellipsis: true,
					},
					{
						title: '状态',
						dataIndex: 'status',
						width: 60,
						align: 'center',
						render: (value) => {
							switch (value) {
								case 0:
									return <Typography.Text type='success'>启用</Typography.Text>;
								default:
									return <Typography.Text type='danger'>停用</Typography.Text>;
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
          }
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
				<Form {...FORM_LAYOUT} form={form} initialValues={{ status: 0 }}>
					<Form.Item
						label='代码名称'
						name='characterName'
						rules={[{ required: true }]}
					>
						<Input placeholder='请输入代码名称' />
					</Form.Item>
					<Form.Item
						label='代码价格'
						name='characterPrice'
						rules={[{ required: true }]}
					>
						<InputNumber
							style={{ width: '100%' }}
							placeholder='请输入代码价格'
						/>
					</Form.Item>
					<Form.Item label='状态' name='status'>
						<Radio.Group>
							<Radio value={0}>启用</Radio>
							<Radio value={1}>停用</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item label='备注' name='remark'>
						<Input.TextArea placeholder='请输入备注' />
					</Form.Item>
					<Form.Item label='上传图片'>
						<Upload
							listType='picture-card'
							customRequest={onUpload}
							fileList={fileList}
							onRemove={onRemoveFile}
						>
							{fileList.length >= 8 ? null : (
								<div className='sy-update--picture'>
									<PlusOutlined />
									<div style={{ marginTop: 8 }}>点击上传</div>
								</div>
							)}
						</Upload>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default Character;
