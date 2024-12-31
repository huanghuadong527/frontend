import moment from 'moment';
import { DynamicSearch, DynamicTable } from '@/components';
import { FLEX_FORM_LAYOUT, useAntdTable } from '@/core';
import {
	App,
	Button,
	Col,
	Form,
	Input,
	Modal,
	Popconfirm,
	Row,
	Space
} from 'antd';
import { useState } from 'react';
import {
	addEquipmentData,
	getEquipmentDataById,
	updateEquipmentData
} from '@/service';

const Equipment = () => {
	const [visible, setVisible] = useState(false);
	const [editId, setEditId] = useState('');
	const [form] = Form.useForm();
	const { message } = App.useApp();
	const { dataSource, tableProps, loading, getTableData } =
		useAntdTable('/wm/equipment/list');

	const onEdit = (id?: string) => {
		if (id) {
			setEditId(id);
			getEquipmentDataById(id).then((result) => {
				form.setFieldsValue(result.data);
				setVisible(true);
			});
		} else {
			setVisible(true);
		}
	};

	const onDelete = (id: string) => {};

	const onSave = () => {
		form.validateFields().then((values) => {
			if (editId) {
				updateEquipmentData({
					...values,
					id: editId
				}).then(() => {
					onCancel();
					getTableData();
					message.success('修改成功!');
				});
			} else {
				addEquipmentData(values).then(() => {
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
	};

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
						title: '装备名称',
						dataIndex: 'equipName'
					},
					{
						title: '装备分类',
						dataIndex: 'equipClassifyId'
					},
					{
						title: '装备类型',
						dataIndex: 'equipType'
					},
					{
						title: '孔洞',
						dataIndex: 'equipHole'
					},
					{
						title: '品阶',
						dataIndex: 'equipGrade'
					},
					{
						title: '物理防御',
						dataIndex: 'equipPhysical'
					},
					{
						title: '物理攻击',
						dataIndex: 'equipPhysicalAttack'
					},
					{
						title: '法术防御',
						dataIndex: 'equipSpell'
					},
					{
						title: '法术攻击',
						dataIndex: 'equipSpellAttack'
					},
					{
						title: '生命值',
						dataIndex: 'equipHp'
					},
					{
						title: '真气值',
						dataIndex: 'equipMp'
					},
					{
						title: '职业限制',
						dataIndex: 'equipCareer'
					},
					{
						title: '等级要求',
						dataIndex: 'equipLevel'
					},
					{
						title: '额外属性',
						dataIndex: 'equipExtra'
					},
					{
						title: '价格',
						dataIndex: 'equipPrice'
					},
					{
						title: '装备描述',
						dataIndex: 'equipDesc'
					},
					{
						title: '额外限制',
						dataIndex: 'equipLimit'
					},
					{
						title: '套装',
						dataIndex: 'equipSuit'
					},
					{
						title: '显示排序',
						dataIndex: 'orderNum'
					},
					{
						title: '创建时间',
						dataIndex: 'createDate',
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
						render: (date) => {
							if (date) {
								return moment(new Date(date)).format('YYYY-MM-DD HH:mm:ss');
							}
							return '-';
						}
					},
					{
						title: '备注',
						dataIndex: 'remark'
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
				{...tableProps}
			/>
			<Modal
				okText='保存'
				width={800}
				title={editId == '' ? '新增' : '编辑'}
				open={visible}
				onOk={onSave}
				onCancel={onCancel}
			>
				<Form {...FLEX_FORM_LAYOUT} form={form}>
					<Row>
						<Col span={12}>
							<Form.Item label='装备名称' name='equipName'>
								<Input placeholder='请输入装备名称' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item label='装备分类' name='equipClassifyId'>
								<Input placeholder='请输入装备分类' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item label='装备类型' name='equipType'>
								<Input placeholder='请输入装备类型' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item label='孔洞数量' name='equipHole'>
								<Input placeholder='请输入孔洞数量' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item label='装备品阶' name='equipGrade'>
								<Input placeholder='请输入装备品阶' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item label='物理防御' name='equipPhysical'>
								<Input placeholder='请输入物理防御' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item label='物理攻击' name='equipPhysicalAttack'>
								<Input placeholder='请输入物理攻击' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item label='法术防御' name='equipSpell'>
								<Input placeholder='请输入法术防御' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item label='法术攻击' name='equipSpellAttack'>
								<Input placeholder='请输入法术攻击' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item label='生命值' name='equipHp'>
								<Input placeholder='请输入生命值' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item label='真气值' name='equipMp'>
								<Input placeholder='请输入职业描述' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item label='耐久度' name='equipDurability'>
								<Input placeholder='请输入耐久度' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item label='职业限制' name='equipCareer'>
								<Input placeholder='请输入职业限制' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item label='等级要求' name='equipLevel'>
								<Input placeholder='请输入等级要求' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item label='价格' name='equipPrice'>
								<Input placeholder='请输入价格' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item label='显示排序' name='orderNum'>
								<Input placeholder='请输入显示排序' />
							</Form.Item>
						</Col>
					</Row>
					<Form.Item label='额外属性' name='equipExtra'>
						<Input.TextArea placeholder='请输入额外属性' />
					</Form.Item>
					<Form.Item label='额外限制' name='equipLimit'>
						<Input.TextArea placeholder='请输入额外限制' />
					</Form.Item>
					<Form.Item label='套装属性' name='equipSuit'>
						<Input.TextArea placeholder='请输入套装属性' />
					</Form.Item>
					<Form.Item label='装备描述' name='equipDesc'>
						<Input.TextArea placeholder='请输入装备描述' />
					</Form.Item>
					<Form.Item label='备注' name='remark'>
						<Input.TextArea placeholder='请输入备注' />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default Equipment;
