import moment from 'moment';
import { useEffect, useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { DynamicSearch, DynamicTable } from '@/components';
import { FLEX_FORM_LAYOUT, SY_CONFIG, useAntdTable } from '@/core';
import {
	App,
	Button,
	Col,
	Form,
	Input,
	Image,
	Modal,
	Popconfirm,
	Row,
	Select,
	Space,
	Upload,
	type UploadProps,
	Flex,
	Typography,
	type UploadFile,
	Descriptions
} from 'antd';
import {
	addSkillsData,
	getCareerOptions,
	getRealmOption,
	getSkillsDataById,
	getSkillsOption,
	updateSkillsData,
	uploadImage
} from '@/service';
import { DefaultOptionType } from 'antd/es/select';
import { getFileName, getKeynote } from '@/utils';

const { Text } = Typography;
const { useWatch } = Form;

const Skills = () => {
	const [visible, setVisible] = useState(false);
	const [editId, setEditId] = useState<string>();
	const [realmOpts, setRealmOpts] = useState<DefaultOptionType[]>([]);
	const [careerOpts, setCareerOpts] = useState<DefaultOptionType[]>([]);
	const [skillsOpts, setSkillsOpts] = useState<DefaultOptionType[]>([]);
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [form] = Form.useForm();
	const { message } = App.useApp();
	const { dataSource, tableProps, loading, getTableData } =
		useAntdTable('/wm/skills/list');

	const skillCareerId = useWatch('skillCareerId', form);

	const uploadIconProps: UploadProps = {
		name: 'upload-skill-icon',
		listType: 'picture',
		fileList,
		onRemove() {
			form.setFieldValue('skillIcon', null);
			setFileList([]);
		},
		customRequest({ file }: any) {
			if (file) {
				const formData = new FormData();
				formData.append('file', file);

				setFileList([{ ...file, status: 'uploading' }]);

				uploadImage(formData).then((result) => {
					form.setFieldValue('skillIcon', result.data);
					setFileList([
						{
							...file,
							status: 'done',
							url: `${SY_CONFIG.upload}${result.data}`
						}
					]);
				});
			}
		}
	};

	const onEdit = (id?: string) => {
		if (id) {
			setEditId(id);
			getSkillsDataById(id).then((result) => {
				if (result.data) {
					if (result.data.skillIcon) {
						setFileList([
							{
								uid: result.data.id,
								name:
									getFileName(result.data.skillIcon) || result.data.skillName,
								url: `${SY_CONFIG.upload}${result.data.skillIcon}`
							}
						]);
					}
					if (result.data.skillCareerId) {
						getSkillsOptionData({ skillCareerId: result.data.skillCareerId });
					}
					form.setFieldsValue(result.data);
					setVisible(true);
				}
			});
		} else {
			setVisible(true);
		}
	};

	const onDelete = (id: string) => {};

	const onSave = () => {
		form.validateFields().then((values) => {
			if (editId) {
				updateSkillsData({
					...values,
					id: editId
				}).then(() => {
					onCancel();
					getTableData();
					message.success('修改成功!');
				});
			} else {
				addSkillsData(values).then(() => {
					onCancel();
					getTableData();
					message.success('添加成功!');
				});
			}
		});
	};

	const onCancel = () => {
		setVisible(false);
		setEditId('');
		form.resetFields();
		setFileList([]);
	};

	const headerRender = (
		<div className='flex-row' style={{ justifyContent: 'space-between' }}>
			<DynamicSearch />
			<Button type='primary' onClick={() => onEdit()}>
				新增
			</Button>
		</div>
	);

	const getRealmOptionData = () => {
		getRealmOption({}).then((result) => {
			if (result.data && Array.isArray(result.data)) {
				setRealmOpts(
					result.data.map((item) => ({
						value: item.id,
						label: item.realmName
					}))
				);
			}
		});
	};

	const getCareerOptionData = () => {
		getCareerOptions().then((result) => {
			if (result.data && Array.isArray(result.data)) {
				setCareerOpts(
					result.data.map((item) => ({
						value: item.id,
						label: item.careerName
					}))
				);
			}
		});
	};

	const getSkillsOptionData = (opt: object = {}) => {
		getSkillsOption(opt).then((result) => {
			if (result.data && Array.isArray(result.data)) {
				setSkillsOpts(
					result.data.map((item) => ({
						value: item.id,
						label: item.skillName,
						skillCareerId: item.skillCareerId
					}))
				);
			}
		});
	};

	useEffect(() => {
		getRealmOptionData();
		getCareerOptionData();
		getSkillsOptionData();
	}, []);

	return (
		<div className='container flex-column'>
			<DynamicTable
				size='small'
				rowKey='id'
				headerRender={headerRender}
				columns={[
					{
						title: '技能名称',
						dataIndex: 'skillName',
						width: '20%'
					},
					{
						title: '技能类型',
						dataIndex: 'skillType',
						width: '20%',
						render(value) {
							return value == 0 ? '主动技能' : value == 1 ? '被动技能' : '未知';
						}
					},
					{
						title: '技能图标',
						dataIndex: 'skillIcon',
						width: '20%',
						render(value) {
							return (
								<Image
									preview={false}
									height={32}
									src={`${SY_CONFIG.upload}${value}`}
								/>
							);
						}
					},
					{
						title: '武器',
						dataIndex: 'skillWeapon',
						width: '20%'
					},
					{
						title: '前置技能',
						dataIndex: 'skillPrerequisiteId',
						width: '20%'
					},
					{
						title: '修真',
						dataIndex: 'skillRealmId',
						width: '20%',
						render(value) {
							const realm = realmOpts.find((item) => item.value == value);
							return realm && realm.label;
						}
					},
					{
						title: '职业',
						dataIndex: 'skillCareerId',
						width: '20%',
						render(value) {
							const realm = careerOpts.find((item) => item.value == value);
							return realm && realm.label;
						}
					},
					{
						title: '技能最大等级',
						dataIndex: 'skillMaxLevel',
						width: '20%'
					},
					{
						title: '初始学习等级',
						dataIndex: 'skillInitialLevel',
						width: '20%'
					},
					{
						title: '显示排序',
						dataIndex: 'orderNum',
						width: '20%'
					},
					{
						title: '创建时间',
						dataIndex: 'createDate',
						width: '20%',
						render: (date) => {
							if (date) {
								return moment(new Date(date)).format('YYYY-MM-DD HH:mm:ss');
							}
							return '-';
						}
					},
					{
						title: '更新时间',
						dataIndex: 'updateDate',
						width: '20%',
						render: (date) => {
							if (date) {
								return moment(new Date(date)).format('YYYY-MM-DD HH:mm:ss');
							}
							return '-';
						}
					},
					{
						title: '备注',
						dataIndex: 'remark',
						width: '20%'
					},
					{
						title: '操作',
						dataIndex: 'handle',
						width: '150px',
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
						}
					}
				]}
				loading={loading}
				dataSource={dataSource}
				scroll={{ y: '100%' }}
				expandable={{
					expandedRowClassName: 'dynamic-expandable--wrapper',
					expandedRowRender: (record) => {
						return (
							<Descriptions
								bordered
								size='small'
								labelStyle={{ width: '120px' }}
								items={[
									{
										label: '升级级别',
										children: record.skillUpgradeLevel,
										span: 'filled'
									},
									{
										label: '技能说明',
										children: record.skillDesc,
										span: 'filled'
									},
									{
										label: <>满&#12288;&#12288;级</>,
										children: record.skillMaxed,
										span: 'filled'
									},
									{
										label: <>仙&ensp;技&ensp;能</>,
										children: (
											<div
												dangerouslySetInnerHTML={{
													__html: getKeynote(record.skillImmortal)
												}}
											></div>
										),
										span: 'filled'
									},
									{
										label: <>魔&ensp;技&ensp;能</>,
										children: (
											<div
												dangerouslySetInnerHTML={{
													__html: getKeynote(record.skillDevil)
												}}
											></div>
										),
										span: 'filled'
									}
								]}
							/>
						);
					},
					rowExpandable: (record) => record.name !== 'Not Expandable'
				}}
				{...tableProps}
			/>
			<Modal
				okText='保存'
				width={900}
				title={editId == '' ? '新增' : '编辑'}
				open={visible}
				onOk={onSave}
				onCancel={onCancel}
			>
				<Form {...FLEX_FORM_LAYOUT} form={form}>
					<Form.Item label='技能图标' name='skillIcon' valuePropName='file'>
						<Flex vertical gap={10}>
							<Upload {...uploadIconProps}>
								<Button type='primary' icon={<UploadOutlined />}>
									上传图标
								</Button>
							</Upload>
							<Text type='danger'>只能上传jpg/png文件, 且不超过500kb</Text>
						</Flex>
					</Form.Item>
					<Row>
						<Col span={12}>
							<Form.Item
								label='技能名称'
								name='skillName'
								rules={[{ required: true }]}
							>
								<Input placeholder='请输入技能名称' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item label='技能类型' name='skillType'>
								<Select
									placeholder='请选择技能类型'
									options={[
										{ value: 0, label: '主动技能' },
										{ value: 1, label: '被动技能' }
									]}
								/>
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item label='修真' name='skillRealmId'>
								<Select placeholder='请选择修真' options={realmOpts} />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item label='职业' name='skillCareerId'>
								<Select placeholder='请选择职业' options={careerOpts} />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item label='武器' name='skillWeapon'>
								<Input placeholder='请输入武器' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item label='前置技能' name='skillPrerequisiteId'>
								<Select
									placeholder='请选择前置技能'
									options={skillsOpts.filter(
										(item) => item.skillCareerId == skillCareerId
									)}
								/>
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item label='技能最大等级' name='skillMaxLevel'>
								<Input placeholder='请输入技能最大等级' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item label='初始学习等级' name='skillInitialLevel'>
								<Input placeholder='请输入初始学习等级' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item label='升级级别' name='skillUpgradeLevel'>
								<Input placeholder='请输入升级级别' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item label='技能说明' name='skillDesc'>
								<Input placeholder='请输入技能说明' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item label='显示排序' name='orderNum'>
								<Input placeholder='请输入显示排序' />
							</Form.Item>
						</Col>
					</Row>
					<Form.Item
						label='满级'
						name='skillMaxed'
						tooltip='标红(技能区分): [示例]'
					>
						<Input.TextArea
							showCount
							maxLength={245}
							placeholder='请输入仙技能描述'
						/>
					</Form.Item>
					<Form.Item
						label='仙技能'
						name='skillImmortal'
						tooltip='标红(技能区分): [示例]'
					>
						<Input.TextArea
							showCount
							maxLength={245}
							placeholder='请输入仙技能描述'
						/>
					</Form.Item>
					<Form.Item
						label='魔技能'
						name='skillDevil'
						tooltip='标红(技能区分): [示例]'
					>
						<Input.TextArea
							showCount
							maxLength={245}
							placeholder='请输入魔技能描述'
						/>
					</Form.Item>
					<Form.Item label='备注' name='remark'>
						<Input.TextArea placeholder='请输入备注' />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default Skills;
