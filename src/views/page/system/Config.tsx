import { DynamicSearch, DynamicTable } from '@/components';
import {
	Button,
	Form,
	Input,
	message,
	Modal,
	Popconfirm,
	Radio,
	Space,
	Tag,
	Upload,
	Image,
	UploadProps,
} from 'antd';
import {
	getDictTypeByType,
	addConfigData,
	deleteConfigData,
	getConfigDataById,
	updateConfigData,
	uploadImage,
} from '@/service';
import { useCallback, useEffect, useState } from 'react';
import { FORM_LAYOUT, SY_CONFIG, useAntdTable, useCommon } from '@/core';
import { LabeledValue } from 'antd/es/select';
import { PlusOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { updateConfig } from '@/store';

type ModeType = 'TEXT' | 'IMAGE';

const Config = () => {
	const dispatch = useDispatch();
	const [visible, setVisible] = useState(false);
	const [editId, setEditId] = useState('');
	const [modes, setModes] = useState<LabeledValue[]>([]);
	const [imageSrc, setImageSrc] = useState<string | null>(null);
	const [form] = Form.useForm();
	const { dataSource, tableProps, loading, getTableData } = useAntdTable(
		'/system/config/list'
	);
	const { updateSysConfig } = useCommon();

	const configMode: ModeType = Form.useWatch('configMode', form);

	const onEdit = (id?: string) => {
		if (id) {
			getConfigDataById(id).then((result) => {
				setEditId(id);
				setVisible(true);
				if (result.data && result.data.configMode == 'IMAGE') {
					setImageSrc(result.data.configValue);
				}
				form.setFieldsValue(result.data);
			});
		} else {
			setVisible(true);
		}
	};

	const onSave = () => {
		form.validateFields().then((values) => {
			let params: { [key: string]: any } = {};
			if (configMode == 'IMAGE') {
				if (imageSrc) {
					params.configValue = imageSrc;
				} else {
					message.error('请上传图片!');
					return false;
				}
			}
			if (editId) {
				updateConfigData({
					...values,
					...params,
					id: editId,
				}).then(() => {
					message.success('修改成功!');
					onCancel();
					getTableData();
					updateSysConfig(values);
					dispatch(updateConfig({ ...values, ...params }));
				});
			} else {
				addConfigData({
					...values,
					...params,
				}).then(() => {
					message.success('新增成功!');
					onCancel();
					getTableData();
					updateSysConfig(values);
					dispatch(updateConfig({ ...values, ...params }));
				});
			}
		});
	};

	const onCancel = () => {
		setEditId('');
		setVisible(false);
		setImageSrc(null);
		form.resetFields();
	};

	const onDelete = (id?: string) => {
		if (id) {
			deleteConfigData(id).then(() => {
				message.success('删除成功!');
				getTableData();
			});
		}
	};

	const onUpload = ({ file }: any) => {
		if (file) {
			const formData = new FormData();
			formData.append('file', file);
			uploadImage(formData).then((result) => {
				setImageSrc(result.data);
			});
		}
	};

	const onRemoveFile: UploadProps['onRemove'] = () => {
		setImageSrc(null);
		return true;
	};

	const getConfigModeData = useCallback(() => {
		getDictTypeByType('sys_config_type').then((result) => {
			if (result.code == 200) {
				setModes(
					result.data.map((item: any) => ({
						label: item.dictLabel,
						value: item.dictValue,
					}))
				);
			}
		});
	}, []);

	useEffect(() => {
		getConfigModeData();
	}, []);

	const headerRender = (
		<div className='flex-row' style={{ justifyContent: 'space-between' }}>
			<DynamicSearch />
			<Button type='primary' onClick={() => onEdit()}>
				新增
			</Button>
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
						title: '参数名称',
						dataIndex: 'configName',
						ellipsis: true,
					},
					{
						title: '参数键名',
						dataIndex: 'configKey',
					},
					{
						title: '参数键值',
						dataIndex: 'configValue',
						render: (value, record) => {
							if (record.configMode == 'IMAGE') {
								return (
									<Image height={30} src={`${SY_CONFIG.upload}${value}`} />
								);
							}
							return value;
						},
					},
					{
						title: '系统内置',
						dataIndex: 'configType',
						render: (value) => {
							return (
								<Tag color={value == 'Y' ? 'success' : 'error'}>
									{value == 'Y' ? '是' : '否'}
								</Tag>
							);
						},
					},
					{
						title: '备注',
						dataIndex: 'remark',
						ellipsis: true,
					},
					{
						title: '创建时间',
						dataIndex: 'createTime',
						ellipsis: true,
					},
					{
						title: '操作',
						dataIndex: 'handle',
						width: '100px',
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
										onConfirm={() => onDelete(record.id)}
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
					initialValues={{ configType: 'Y', configMode: 'TEXT' }}
				>
					<Form.Item
						label='参数类型'
						name={['configMode']}
						rules={[{ required: true }]}
					>
						<Radio.Group
							buttonStyle='solid'
							optionType='button'
							options={modes}
						></Radio.Group>
					</Form.Item>
					<Form.Item
						label='参数名称'
						name='configName'
						rules={[{ required: true }]}
					>
						<Input placeholder='请输入参数名称' />
					</Form.Item>
					<Form.Item
						label='参数键名'
						name='configKey'
						rules={[{ required: true }]}
					>
						<Input placeholder='请输入参数键名' />
					</Form.Item>
					<Form.Item label='参数键值' rules={[{ required: true }]}>
						{configMode == 'TEXT' ? (
							<Form.Item noStyle name='configValue'>
								<Input placeholder='请输入参数键值' />
							</Form.Item>
						) : configMode == 'IMAGE' ? (
							<Form.Item noStyle valuePropName='fileList'>
								<Upload
									listType='picture-card'
									showUploadList={false}
									customRequest={onUpload}
									onRemove={onRemoveFile}
								>
									{imageSrc ? (
										<Image
											src={`${SY_CONFIG.upload}${imageSrc}`}
											preview={false}
										/>
									) : (
										<div style={{ color: '#999999' }}>
											<PlusOutlined size={24} />
											<div style={{ marginTop: 8 }}>点击上传</div>
										</div>
									)}
								</Upload>
							</Form.Item>
						) : (
							<>未知参数类型</>
						)}
					</Form.Item>
					<Form.Item label='系统内置' name='configType'>
						<Radio.Group>
							<Radio value='Y'>是</Radio>
							<Radio value='N'>否</Radio>
						</Radio.Group>
					</Form.Item>
					<Form.Item label='备注' name='remark'>
						<Input.TextArea placeholder='请输入备注' />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default Config;
