import { getServerData } from '@/service';
import { Card, Col, Descriptions, Row, Table } from 'antd';
import { useCallback, useEffect, useState } from 'react';

interface CpuInterface {
	id: number;
	attribute?: string;
	value?: string;
}

interface MemInterface {
	id: number;
	attribute: string;
	mem: string;
	jvm: string;
}

interface JvmInterface {
	name: string;
	version: string;
	startTime: string;
	runTime: string;
	home: string;
	userDir: string;
	inputArgs: string;
}

interface SysInterface {
	computerName: string;
	osName: string;
	computerIp: string;
	osArch: string;
}

const Server = () => {
	const [loading, setLoading] = useState(true);
	// CPU相关信息
	const [cpuData, setCpuData] = useState<CpuInterface[]>();
	// 內存相关信息
	const [memData, setMemData] = useState<MemInterface[]>();
	// 服务器相关信息
	const [sysData, setSysData] = useState<SysInterface>();
	// JVM相关信息
	const [jvmData, setJvmData] = useState<JvmInterface>();
	// 磁盘相关信息
	const [diskData, setDiskData] = useState();

	const getServerList = useCallback(() => {
		setLoading(true);
		getServerData().then((result) => {
			if (result.code == 200) {
				setLoading(false);
				if (result.data) {
					if (result.data.cpu) {
						const cpu = result.data.cpu;
						setCpuData([
							{
								id: 1,
								attribute: '核心数',
								value: cpu['cpuNum']
							},
							{
								id: 2,
								attribute: '用户使用率',
								value: `${cpu['used']}%`
							},
							{
								id: 3,
								attribute: '系统使用率',
								value: `${cpu['sys']}%`
							},
							{
								id: 4,
								attribute: '核心数',
								value: `${cpu['free']}%`
							}
						]);
					}
					if (result.data.sys) {
						setSysData(result.data.sys);
					}
					if (result.data.jvm && result.data.sys) {
						setJvmData({
							...result.data.jvm,
							...result.data.sys
						});
					}
					if (result.data.jvm && result.data.mem) {
						const jvm = result.data.jvm;
						const mem = result.data.mem;
						setMemData([
							{
								id: 1,
								attribute: '总内存',
								mem: `${mem['total']}G`,
								jvm: `${jvm['total']}M`
							},
							{
								id: 2,
								attribute: '已用内存',
								mem: `${mem['used']}G`,
								jvm: `${jvm['used']}M`
							},
							{
								id: 3,
								attribute: '剩余内存',
								mem: `${mem['free']}G`,
								jvm: `${jvm['free']}M`
							},
							{
								id: 4,
								attribute: '使用率',
								mem: `${mem['usage']}%`,
								jvm: `${jvm['usage']}%`
							}
						]);
					}
					if (result.data.sysFiles) {
						setDiskData(result.data.sysFiles);
					}
				}
			}
		});
	}, []);

	useEffect(() => {
		getServerList();
	}, []);

	return (
		<div className='container o-y'>
			<Row gutter={[10, 10]}>
				<Col span={12}>
					<Card
						size='small'
						title='CPU'
						styles={{ body: { padding: '1px 0 0' } }}
						bordered={false}
					>
						<Table
							size='small'
							rowKey='id'
							pagination={false}
							loading={loading}
							columns={[
								{
									title: '属性',
									dataIndex: 'attribute',
									width: '50%',
									key: 'name'
								},
								{
									title: '值',
									dataIndex: 'value',
									width: '50%',
									key: 'name'
								}
							]}
							dataSource={cpuData}
						/>
					</Card>
				</Col>
				<Col span={12}>
					<Card
						size='small'
						title='内存'
						styles={{ body: { padding: '1px 0 0' } }}
					>
						<Table
							size='small'
							rowKey='id'
							pagination={false}
							loading={loading}
							columns={[
								{
									title: '属性',
									dataIndex: 'attribute',
									width: '33.333333%',
									key: 'name'
								},
								{
									title: '内存',
									dataIndex: 'mem',
									width: '33.333333%',
									key: 'name'
								},
								{
									title: 'JVM',
									dataIndex: 'jvm',
									width: '33.333333%',
									key: 'name'
								}
							]}
							dataSource={memData}
						/>
					</Card>
				</Col>
				<Col span={24}>
					<Card
						size='small'
						title='服务器信息'
						styles={{ body: { padding: '1px 0 0' } }}
						bordered={false}
					>
						<Descriptions
							bordered
							className='card-description'
							size='small'
							column={2}
							labelStyle={{ width: '120px' }}
						>
							<Descriptions.Item label='服务器名称'>
								{sysData ? sysData.computerName : '--'}
							</Descriptions.Item>
							<Descriptions.Item label='操作系统'>
								{sysData ? sysData.osName : '--'}
							</Descriptions.Item>
							<Descriptions.Item label='服务器IP'>
								{sysData ? sysData.computerIp : '--'}
							</Descriptions.Item>
							<Descriptions.Item label='系统架构'>
								{sysData ? sysData.osArch : '--'}
							</Descriptions.Item>
						</Descriptions>
					</Card>
				</Col>
				<Col span={24}>
					<Card
						size='small'
						title='Java虚拟机信息'
						styles={{ body: { padding: '1px 0 0' } }}
						bordered={false}
					>
						<Descriptions
							bordered
							className='card-description'
							size='small'
							column={2}
							labelStyle={{ width: '120px' }}
						>
							<Descriptions.Item label='Java名称'>
								{jvmData ? jvmData.name : '--'}
							</Descriptions.Item>
							<Descriptions.Item label='Java版本'>
								{jvmData ? jvmData.version : '--'}
							</Descriptions.Item>
							<Descriptions.Item label='启动时间'>
								{jvmData ? jvmData.startTime : '--'}
							</Descriptions.Item>
							<Descriptions.Item label='运行时长'>
								{jvmData ? jvmData.runTime : '--'}
							</Descriptions.Item>
							<Descriptions.Item label='安装路径' span={2}>
								{jvmData ? jvmData.home : '--'}
							</Descriptions.Item>
							<Descriptions.Item label='项目路径' span={2}>
								{jvmData ? jvmData.userDir : '--'}
							</Descriptions.Item>
							<Descriptions.Item label='运行参数' span={2}>
								{jvmData ? jvmData.inputArgs : '--'}
							</Descriptions.Item>
						</Descriptions>
					</Card>
				</Col>
				<Col span={24}>
					<Card
						size='small'
						title='磁盘状态'
						styles={{ body: { padding: '1px 0 0' } }}
						bordered={false}
					>
						<Table
							size='small'
							rowKey='dirName'
							pagination={false}
							loading={loading}
							columns={[
								{
									title: '盘符路径',
									dataIndex: 'dirName',
									width: '10%'
								},
								{
									title: '文件系统',
									dataIndex: 'sysTypeName',
									width: '10%'
								},
								{
									title: '盘符类型',
									dataIndex: 'typeName',
									width: '10%'
								},
								{
									title: '总大小',
									dataIndex: 'total',
									width: '10%'
								},
								{
									title: '可用大小',
									dataIndex: 'free',
									width: '10%'
								},
								{
									title: '已用大小',
									dataIndex: 'used',
									width: '10%'
								},
								{
									title: '已用百分比',
									dataIndex: 'usage',
									width: '10%',
									render: (value) => {
										return `${value}%`;
									}
								}
							]}
							dataSource={diskData}
						/>
					</Card>
				</Col>
			</Row>
		</div>
	);
};

export default Server;
