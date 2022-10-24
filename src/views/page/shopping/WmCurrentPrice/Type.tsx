import {
	Button,
	Card,
	Col,
	Form,
	Input,
	message,
	Modal,
	Row,
	Space,
	Typography,
} from 'antd';
import {
	CompressOutlined,
	DeleteOutlined,
	ExclamationCircleOutlined,
	ExpandOutlined,
	FormOutlined,
	LinkOutlined,
} from '@ant-design/icons';
import { useCallback, useEffect, useState } from 'react';
import * as echarts from 'echarts';
import {
	addWmCurrentPriceTypeData,
	deleteWmCurrentPriceTypeData,
	getWmCurrentPriceTypeAndData,
	getWmCurrentPriceTypeData,
	getWmCurrentPriceTypeDataById,
	updateWmCurrentPriceTypeData,
} from '@/service';
import { CurrentPrice } from '@/core';
import { useNavigate } from 'react-router-dom';
import { clone } from 'xe-utils';
import { fromEvent } from 'rxjs';

interface CurrentPriceTypeData {
	name: string;
	data: number[];
}

interface CurrentPriceType {
	id: string;
	name: string;
}

interface InterfaceLastWeek {
	id: string;
	dates: string[];
	data: CurrentPriceTypeData[];
}

const Type = () => {
	const [visible, setVisible] = useState(false);
	const [editId, setEditId] = useState<string | null>(null);
	const [screenfullId, setScreenfullId] = useState<string | null>(null);
	const [types, setTypes] = useState<CurrentPriceType[]>([]);
	const [lastWeek, setLastWeek] = useState<InterfaceLastWeek[]>([]);
	const [form] = Form.useForm();
	const navigate = useNavigate();

	const getTypesData = useCallback(() => {
		getWmCurrentPriceTypeData().then((result) => {
			if (result.code == 200) {
				setTypes(result.data);
			}
		});
	}, []);

	const getTypeAndData = useCallback(() => {
		getWmCurrentPriceTypeAndData().then((result) => {
			setLastWeek(result.data);
		});
	}, []);

	const onEdit = (id?: string) => {
		if (id) {
			getWmCurrentPriceTypeDataById(id).then((result) => {
				if (result.code == 200) {
					setEditId(id);
					setVisible(true);
					form.setFieldsValue(result.data);
				}
			});
		} else {
			setVisible(true);
		}
	};

	const onSave = () => {
		form.validateFields().then((values) => {
			if (editId) {
				updateWmCurrentPriceTypeData({
					...values,
					id: editId,
				}).then((result) => {
					if (result.code == 200) {
						onCancel();
						message.success('更新成功');
						getTypesData();
					}
				});
			} else {
				addWmCurrentPriceTypeData(values).then((result) => {
					if (result.code == 200) {
						onCancel();
						message.success('添加成功');
						getTypesData();
					}
				});
			}
		});
	};

	const onCancel = () => {
		setVisible(false);
		setEditId(null);
		form.resetFields();
	};

	const onJump = (id: string) => {
		navigate(`/index/wm-current-price/list/${id}`);
	};

	const onDelete = (id: string) => {
		const item = types.find((item) => item.id == id);
		if (item && item.id) {
			Modal.confirm({
				icon: <ExclamationCircleOutlined />,
				content: `请确认是否删除${item.name}?`,
				onOk() {
					deleteWmCurrentPriceTypeData(id).then((result) => {
						if (result.code == 200) {
							message.success('删除成功');
							getTypesData();
						} else {
							message.error('删除失败');
						}
					});
				},
			});
		}
	};

	const onScreenfull = (id: string) => {
		if (screenfullId == id) {
			setScreenfullId(null);
		} else {
			setScreenfullId(id);
		}
	};

	const onInitCharts = () => {
		types.forEach((item) => {
			const $echarts = document.getElementById('chart' + item.id);
			if ($echarts) {
				let charts = echarts.getInstanceByDom($echarts);
				if (!charts) {
					charts = echarts.init($echarts);
				}
				const chartData = lastWeek.find((v) => v.id == item.id);
				if (charts && chartData) {
					const option = clone(CurrentPrice);
					(option.legend as any).data = chartData.data.map((v) => v.name);
					(option.xAxis as any).data = chartData.dates;
					option.series = chartData.data.map((v) => {
						return {
							...v,
							type: 'line',
						};
					});
					charts.setOption(option);
				}
			}
		});
	};

	const onResizeCharts = () => {
		types.forEach((item) => {
			const $chart = document.getElementById('chart' + item.id);
			if ($chart) {
				const chart = echarts.getInstanceByDom($chart);
				if (chart) {
					chart.resize();
				}
			}
		});
	};

	useEffect(() => {
		getTypesData();
		getTypeAndData();
	}, []);

	useEffect(() => {
		onResizeCharts();
	}, [screenfullId]);

	useEffect(() => {
		fromEvent(window, 'resize').subscribe(() => {
			onResizeCharts();
		});
	}, [types]);

	useEffect(() => {
		onInitCharts();
	}, [lastWeek]);

	return (
		<div className='container ffffff p-md flex-column'>
			<div className='flex-row mb-sm'>
				<div className='flex-1'>
					<Typography.Title level={4}>全服时价</Typography.Title>
				</div>
				<Button type='primary' onClick={() => onEdit()}>
					新增
				</Button>
			</div>
			<div className='flex-1'>
				<Row gutter={[15, 15]}>
					{types.map((item, index) => (
						<Col key={index} span={6}>
							<Card
								size='small'
								className={
									(screenfullId == item.id ? 'screenfull' : '') + ' flex-column'
								}
								bodyStyle={{ flex: 1 }}
								title={item.name}
								extra={
									<Space>
										<a onClick={() => onScreenfull(item.id)}>
											{screenfullId == item.id ? (
												<CompressOutlined />
											) : (
												<ExpandOutlined />
											)}
										</a>
										<a onClick={() => onJump(item.id)}>
											<LinkOutlined />
										</a>
										<a onClick={() => onEdit(item.id)}>
											<FormOutlined />
										</a>
										<a onClick={() => onDelete(item.id)}>
											<DeleteOutlined />
										</a>
									</Space>
								}
							>
								<div
									id={'chart' + item.id}
									style={{ height: screenfullId == item.id ? '100%' : '220px' }}
								></div>
							</Card>
						</Col>
					))}
				</Row>
			</div>
			<Modal
				okText='保存'
				width={300}
				title={editId == null ? '新增' : '编辑'}
				open={visible}
				onOk={onSave}
				onCancel={onCancel}
			>
				<Form form={form}>
					<Form.Item
						name='name'
						rules={[{ required: true, message: '请输入名称!' }]}
					>
						<Input placeholder='请输入名称' />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default Type;
