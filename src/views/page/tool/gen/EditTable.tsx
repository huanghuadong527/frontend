import { useCallback, useEffect, useState } from 'react';
import {
	Checkbox,
	Col,
	Form,
	Input,
	Modal,
	ModalProps,
	Radio,
	Row,
	Select,
	Table,
	Tabs,
	TreeSelect,
} from 'antd';
import { getDictSelectOptionData, getGenTableInfo } from '@/service';
import { LG_FORM_LAYOUT } from '@/core';
import { mapTree } from 'xe-utils';
import { SyncOutlined } from '@ant-design/icons';
import { useAppSelector } from '@/store';

interface EditTableProps extends ModalProps {
	id: string;
}

interface DictSelectOption {
	dictName: string;
	dictType: string;
}

const EditTable = (props: EditTableProps) => {
	const [title, setTitle] = useState('');
	const [dataSource, setDataSource] = useState([]);
	const [selectOption, setSelectOption] = useState<DictSelectOption[]>([]);

	const { menus } = useAppSelector((state) => state);

	const treeNodes = mapTree(menus, (item) => ({
		value: item.key,
		title: item.label,
	}));

	const [form] = Form.useForm();

	const genType = Form.useWatch('genType', form);

	const onResetGenPath = () => {
		form.setFieldsValue({
			genPath: '/',
		});
	};

	const getInfo = useCallback((id: string) => {
		getGenTableInfo(id).then((result) => {
			if (result.code == 200) {
				if (result.data.info) {
					form.setFieldsValue(result.data.info);
					if (result.data.info.tableName) {
						setTitle(result.data.info.tableName);
					}
				}
				if (result.data.rows) {
					setDataSource(result.data.rows);
				}
			}
		});
	}, []);

	const getSelectOption = useCallback(() => {
		getDictSelectOptionData().then((result) => {
			if (result.code == 200) {
				setSelectOption(result.data);
			}
		});
	}, []);

	const baseTemplate = (
		<div className='pl-md pr-md'>
			<Form {...LG_FORM_LAYOUT} form={form}>
				<Row gutter={10}>
					<Col span={12}>
						<Form.Item
							name='tableName'
							label='表名称'
							rules={[{ required: true, message: '请输入表名称!' }]}
						>
							<Input placeholder='请输入表名称' />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							name='tableComment'
							label='表描述'
							rules={[{ required: true, message: '请输入表描述!' }]}
						>
							<Input placeholder='请输入表描述' />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							name='className'
							label='实体类名'
							rules={[{ required: true, message: '请输入实体类名!' }]}
						>
							<Input placeholder='请输入实体类名' />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							name='functionAuthor'
							label='作者'
							rules={[{ required: true, message: '请输入作者!' }]}
						>
							<Input placeholder='请输入作者' />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item name='remark' label='描述'>
							<Input.TextArea placeholder='请输入描述' />
						</Form.Item>
					</Col>
				</Row>
			</Form>
		</div>
	);

	const fieldsTemplate = (
		<Table
			size='small'
			rowKey='id'
			pagination={false}
			scroll={{ x: 900, y: 450 }}
			columns={[
				{
					dataIndex: 'columnName',
					title: '字段列名',
					width: 120,
					ellipsis: true,
					fixed: 'left',
				},
				{
					dataIndex: 'columnComment',
					title: '字段描述',
					width: 180,
					fixed: 'left',
					render(value) {
						return <Input defaultValue={value} />;
					},
				},
				{
					dataIndex: 'columnType',
					title: '物理类型',
					width: 120,
					ellipsis: true,
				},
				{
					dataIndex: 'javaType',
					title: 'Java类型',
					width: 120,
					render(value) {
						return (
							<Select
								defaultValue={value}
								style={{ width: '100%' }}
								options={[
									{
										value: 'Long',
										label: 'Long',
									},
									{
										value: 'String',
										label: 'String',
									},
									{
										value: 'Integer',
										label: 'Integer',
									},
									{
										value: 'Double',
										label: 'Double',
									},
									{
										value: 'BigDecimal',
										label: 'BigDecimal',
									},
									{
										value: 'Date',
										label: 'Date',
									},
									{
										value: 'Boolean',
										label: 'Boolean',
									},
								]}
							/>
						);
					},
				},
				{
					dataIndex: 'javaField',
					title: 'java属性',
					width: 180,
					render(value) {
						return <Input defaultValue={value} />;
					},
				},
				{
					dataIndex: 'isInsert',
					title: '插入',
					width: 50,
					align: 'center',
					render(value) {
						return <Checkbox checked={value == '1'} />;
					},
				},
				{
					dataIndex: 'isEdit',
					title: '编辑',
					width: 50,
					align: 'center',
					render(value) {
						return <Checkbox checked={value == '1'} />;
					},
				},
				{
					dataIndex: 'isList',
					title: '列表',
					width: 50,
					align: 'center',
					render(value) {
						return <Checkbox checked={value == '1'} />;
					},
				},
				{
					dataIndex: 'isQuery',
					title: '查询',
					width: 50,
					align: 'center',
					render(value) {
						return <Checkbox checked={value == '1'} />;
					},
				},
				{
					dataIndex: 'queryType',
					title: '查询方式',
					width: 120,
					render(value) {
						return (
							<Select
								defaultValue={value}
								style={{ width: '100%' }}
								options={[
									{
										value: 'EQ',
										label: '=',
									},
									{
										value: 'NE',
										label: '!=',
									},
									{
										value: 'GT',
										label: '>',
									},
									{
										value: 'GTE',
										label: '>=',
									},
									{
										value: 'LT',
										label: '<',
									},
									{
										value: 'LTE',
										label: '<=',
									},
									{
										value: 'LIKE',
										label: 'LIKE',
									},
									{
										value: 'BETWEEN',
										label: 'BETWEEN',
									},
								]}
							/>
						);
					},
				},
				{
					dataIndex: 'isRequired',
					title: '必填',
					width: 50,
					align: 'center',
					render(value) {
						return <Checkbox checked={value == '1'} />;
					},
				},
				{
					dataIndex: 'htmlType',
					title: '显示类型',
					width: 120,
					render(value) {
						return (
							<Select
								defaultValue={value}
								style={{ width: '100%' }}
								options={[
									{
										value: 'input',
										label: '文本框',
									},
									{
										value: 'textarea',
										label: '文本域',
									},
									{
										value: 'select',
										label: '下拉框',
									},
									{
										value: 'radio',
										label: '单选框',
									},
									{
										value: 'checkbox',
										label: '复选框',
									},
									{
										value: 'datetime',
										label: '日期控件',
									},
									{
										value: 'imageUpload',
										label: '图片上传',
									},
									{
										value: 'fileUpload',
										label: '文件上传',
									},
									{
										value: 'editor',
										label: '富文本控件',
									},
								]}
							/>
						);
					},
				},
				{
					dataIndex: 'dictType',
					title: '字典类型',
					width: 240,
					render(value) {
						return (
							<Select
								defaultValue={value}
								style={{ width: '100%' }}
								options={selectOption.map((item) => {
									return {
										value: item.dictType,
										label: (
											<>
												<span className='float-left'>{item.dictName}</span>
												<span
													className='float-right'
													style={{ color: '#8492a6' }}
												>
													{item.dictType}
												</span>
											</>
										),
									};
								})}
							/>
						);
					},
				},
			]}
			dataSource={dataSource}
		/>
	);

	const generateTemplate = (
		<div className='pl-md pr-md'>
			<Form {...LG_FORM_LAYOUT} form={form}>
				<Row gutter={10}>
					<Col span={12}>
						<Form.Item
							name='tplCategory'
							label='生成模板'
							rules={[{ required: true, message: '请选择生成模板!' }]}
						>
							<Select
								style={{ width: '100%' }}
								options={[
									{
										value: 'crud',
										label: '单表(增删改查)',
									},
									{
										value: 'tree',
										label: '树表(增删改查)',
									},
									{
										value: 'sub',
										label: '主子表(增删改查)',
									},
								]}
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							name='packageName'
							label='生成包路径'
							tooltip='生成在哪个java包下, 例如 com.siyang.system'
							rules={[{ required: true, message: '请输入生成包路径!' }]}
						>
							<Input placeholder='请输入生成包路径' />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							name='moduleName'
							label='生成模块名'
							tooltip='可理解为子系统名, 例如 system'
							rules={[{ required: true, message: '请输入生成模块名!' }]}
						>
							<Input placeholder='请输入生成模块名' />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							name='businessName'
							label='生成业务名'
							tooltip='可理解为功能英文名, 例如 user'
							rules={[{ required: true, message: '请输入生成业务名!' }]}
						>
							<Input placeholder='请输入生成业务名' />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							name='functionName'
							label='生成功能名'
							tooltip='用作类描述, 例如 用户'
							rules={[{ required: true, message: '请输入生成功能名!' }]}
						>
							<Input placeholder='请输入生成功能名' />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							name='parentMenuId'
							label='上级菜单'
							tooltip='分配到指定菜单下, 例如 系统管理'
						>
							<TreeSelect
								showSearch
								allowClear
								treeDefaultExpandAll
								style={{ width: '100%' }}
								dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
								treeData={treeNodes}
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item name='genType' label='生成代码方式'>
							<Radio.Group
								options={[
									{
										value: '0',
										label: 'zip压缩包',
									},
									{
										value: '1',
										label: '自定义路径',
									},
								]}
							/>
						</Form.Item>
					</Col>
					{genType == '1' ? (
						<Col span={12}>
							<Form.Item name='genPath' label='自定义路径'>
								<Input.Search
									placeholder='请输入自定义路径'
									onSearch={onResetGenPath}
									enterButton={
										<>
											<SyncOutlined /> 恢复默认
										</>
									}
								/>
							</Form.Item>
						</Col>
					) : (
						''
					)}
				</Row>
			</Form>
		</div>
	);

	useEffect(() => {
		if (props.id) {
			getInfo(props.id);
		}
	}, [props.id]);

	useEffect(() => {
		getSelectOption();
	}, []);

	return (
		<Modal
			title={`修改[ ${title} ]生成配置`}
			bodyStyle={{ padding: 0 }}
			{...props}
		>
			<Tabs
				size='small'
				tabBarStyle={{ padding: '0 10px' }}
				items={[
					{ key: 'base', label: '基本信息', children: baseTemplate },
					{ key: 'generate', label: '生成信息', children: generateTemplate },
					{ key: 'fields', label: '字段信息', children: fieldsTemplate },
				]}
			/>
		</Modal>
	);
};

export { EditTable };

// import { Key, useCallback, useEffect, useState } from 'react';
// import {
// 	Col,
// 	Form,
// 	Input,
// 	Modal,
// 	ModalProps,
// 	Radio,
// 	Row,
// 	Select,
// 	Table,
// 	Tabs,
// } from 'antd';
// import { getGenTableInfo } from '@/service';
// import { LG_FORM_LAYOUT } from '@/core';
// import { EditableCell, EditableRow } from '@/components';

// interface EditTableProps extends ModalProps {
// 	id: string;
// }

// interface EditTableColumns {
// 	key: Key;
// 	columnName: string;
// }

// type EditableTableProps = Parameters<typeof Table>[0];

// type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;

// const EditTable = (props: EditTableProps) => {
// 	const [title, setTitle] = useState('');
// 	const [editing, setEditing] = useState(false);
// 	const [dataSource, setDataSource] = useState<EditTableColumns[]>([]);

// 	const [form] = Form.useForm();

// 	const getInfo = useCallback((id: string) => {
// 		getGenTableInfo(id).then((result) => {
// 			if (result.code == 200) {
// 				if (result.data.info && result.data.info.tableName) {
// 					setTitle(result.data.info.tableName);
// 				}
// 				if (result.data.rows) {
// 					setDataSource(result.data.rows.map((item: any) => {
//             return {
//               ...item,
//               key: item.id,
//             }
//           }));
// 				}
// 			}
// 		});
// 	}, []);

// 	const handleSave = (row: EditTableColumns) => {
// 		const newData = [...dataSource];
// 		const index = newData.findIndex((item) => row.key === item.key);
// 		const item = newData[index];
// 		newData.splice(index, 1, {
// 			...item,
// 			...row,
// 		});
// 		setDataSource(newData);
// 	};

// 	const defaultColumns: (ColumnTypes[number] & {
// 		editable?: boolean;
// 		dataIndex: string;
//     type?: string;
// 	})[] = [
// 		{
// 			dataIndex: 'columnName',
// 			title: '字段列名',
// 			width: 120,
// 			ellipsis: true,
// 			fixed: 'left',
// 		},
// 		{
// 			dataIndex: 'columnComment',
// 			title: '字段描述',
// 			width: 200,
// 			fixed: 'left',
//       ellipsis: true,
//       editable: true,
//       type: 'input'
// 		},
// 		{
// 			dataIndex: 'columnType',
// 			title: '物理类型',
// 			width: 120,
// 			ellipsis: true,
// 		},
// 		{
// 			dataIndex: 'javaType',
// 			title: 'Java类型',
// 			width: 120,
// 		},
// 		{
// 			dataIndex: 'javaField',
// 			title: 'java属性',
// 			width: 200,
//       editable: true,
//       type: 'select'
// 		},
// 		{
// 			dataIndex: 'isInsert',
// 			title: '插入',
// 			width: 120,
// 		},
// 		{
// 			dataIndex: 'isEdit',
// 			title: '编辑',
// 			width: 120,
// 		},
// 		{
// 			dataIndex: 'isList',
// 			title: '列表',
// 			width: 120,
// 		},
// 		{
// 			dataIndex: 'isQuery',
// 			title: '查询',
// 			width: 120,
// 		},
// 		{
// 			dataIndex: 'queryType',
// 			title: '查询方式',
// 			width: 120,
// 		},
// 		{
// 			dataIndex: 'isRequired',
// 			title: '必填',
// 			width: 120,
// 		},
// 		{
// 			dataIndex: 'htmlType',
// 			title: '显示类型',
// 			width: 120,
// 		},
// 		{
// 			dataIndex: 'dictType',
// 			title: '字典类型',
// 			width: 120,
// 		},
// 	];

// 	const columns = defaultColumns.map((col) => {
// 		if (!col.editable) {
// 			return col;
// 		}
// 		return {
// 			...col,
// 			onCell: (record: EditTableColumns) => ({
// 				record,
// 				editable: col.editable,
// 				dataIndex: col.dataIndex,
// 				title: col.title,
//         type: col.type,
// 				handleSave,
// 			}),
// 		};
// 	});

//   const components = {
//     body: {
//       row: EditableRow,
//       cell: EditableCell,
//     },
//   };

// 	const baseTemplate = (
// 		<div className='pl-md pr-md'>
// 			<Form {...LG_FORM_LAYOUT} form={form}>
// 				<Row gutter={10}>
// 					<Col span={12}>
// 						<Form.Item
// 							name='tableName'
// 							label='表名称'
// 							rules={[{ required: true, message: '请输入表名称!' }]}
// 						>
// 							<Input placeholder='请输入表名称' />
// 						</Form.Item>
// 					</Col>
// 					<Col span={12}>
// 						<Form.Item
// 							name='tableComment'
// 							label='表描述'
// 							rules={[{ required: true, message: '请输入表描述!' }]}
// 						>
// 							<Input placeholder='请输入表描述' />
// 						</Form.Item>
// 					</Col>
// 					<Col span={12}>
// 						<Form.Item
// 							name='className'
// 							label='实体类名'
// 							rules={[{ required: true, message: '请输入实体类名!' }]}
// 						>
// 							<Input placeholder='请输入实体类名' />
// 						</Form.Item>
// 					</Col>
// 					<Col span={12}>
// 						<Form.Item
// 							name='functionAuthor'
// 							label='作者'
// 							rules={[{ required: true, message: '请输入作者!' }]}
// 						>
// 							<Input placeholder='请输入作者' />
// 						</Form.Item>
// 					</Col>
// 					<Col span={12}>
// 						<Form.Item name='remark' label='描述'>
// 							<Input.TextArea placeholder='请输入描述' />
// 						</Form.Item>
// 					</Col>
// 				</Row>
// 			</Form>
// 		</div>
// 	);

// 	const fieldsTemplate = (
// 		<Table
// 			size='small'
// 			pagination={false}
// 			scroll={{ x: 900, y: 450 }}
//       components={components}
// 			columns={columns as ColumnTypes}
// 			dataSource={dataSource}
// 		/>
// 	);

// 	const generateTemplate = (
// 		<div className='pl-md pr-md'>
// 			<Form {...LG_FORM_LAYOUT} form={form}>
// 				<Row gutter={10}>
// 					<Col span={12}>
// 						<Form.Item
// 							name='tableName'
// 							label='生成模板'
// 							rules={[{ required: true, message: '请选择生成模板!' }]}
// 						>
// 							<Input placeholder='请选择生成模板' />
// 						</Form.Item>
// 					</Col>
// 					<Col span={12}>
// 						<Form.Item
// 							name='tableComment'
// 							label='生成包路径'
// 							tooltip='生成在哪个java包下, 例如 com.siyang.system'
// 							rules={[{ required: true, message: '请输入生成包路径!' }]}
// 						>
// 							<Input placeholder='请输入生成包路径' />
// 						</Form.Item>
// 					</Col>
// 					<Col span={12}>
// 						<Form.Item
// 							name='className'
// 							label='生成模块名'
// 							tooltip='可理解为子系统名, 例如 system'
// 							rules={[{ required: true, message: '请输入生成模块名!' }]}
// 						>
// 							<Input placeholder='请输入生成模块名' />
// 						</Form.Item>
// 					</Col>
// 					<Col span={12}>
// 						<Form.Item
// 							name='functionAuthor'
// 							label='生成业务名'
// 							tooltip='可理解为功能英文名, 例如 user'
// 							rules={[{ required: true, message: '请输入生成业务名!' }]}
// 						>
// 							<Input placeholder='请输入生成业务名' />
// 						</Form.Item>
// 					</Col>
// 					<Col span={12}>
// 						<Form.Item
// 							name='functionAuthor'
// 							label='生成功能名'
// 							tooltip='用作类描述, 例如 用户'
// 							rules={[{ required: true, message: '请输入生成功能名!' }]}
// 						>
// 							<Input placeholder='请输入生成功能名' />
// 						</Form.Item>
// 					</Col>
// 					<Col span={12}>
// 						<Form.Item
// 							name='remark'
// 							label='上级菜单'
// 							tooltip='分配到指定菜单下, 例如 系统管理'
// 						>
// 							<Select placeholder='请选择上级菜单' options={[]} />
// 						</Form.Item>
// 					</Col>
// 					<Col span={12}>
// 						<Form.Item name='remark' label='生成代码方式'>
// 							<Radio></Radio>
// 						</Form.Item>
// 					</Col>
// 				</Row>
// 			</Form>
// 		</div>
// 	);

// 	useEffect(() => {
// 		if (props.id) {
// 			getInfo(props.id);
// 		}
// 	}, [props.id]);

// 	return (
// 		<Modal
// 			title={`修改[ ${title} ]生成配置`}
// 			bodyStyle={{ padding: 0 }}
// 			{...props}
// 		>
// 			<Tabs
// 				size='small'
// 				tabBarStyle={{ padding: '0 10px' }}
// 				items={[
// 					{ key: 'base', label: '基本信息', children: baseTemplate },
// 					{ key: 'generate', label: '生成信息', children: generateTemplate },
// 					{ key: 'fields', label: '字段信息', children: fieldsTemplate },
// 				]}
// 			/>
// 		</Modal>
// 	);
// };

// export { EditTable };
