import { Echarts } from '@/components';
import { CommandStatisticsOption, MemoryInformationOption } from '@/core';
import { getCacheData } from '@/service';
import { Card, Descriptions } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { clone, toNumber } from 'xe-utils';

const { Item } = Descriptions;

interface InfoInterface {
	redis_version: string;
	redis_mode: string;
	tcp_port: string;
	connected_clients: string;

	uptime_in_days: string;
	used_memory_human: string;
	used_cpu_user_children: string;
	maxmemory_human: string;

	aof_enabled: string;
	rdb_last_bgsave_status: string;
	dbSize: string;
	instantaneous_input_kbps: string;
}

const Cache = () => {
	const [commandStats, setCommandStats] = useState(CommandStatisticsOption);
	const [memoryInfo, setMemoryInfo] = useState(MemoryInformationOption);
	const [info, setInfo] = useState<InfoInterface>();
	const getCacheList = useCallback(() => {
		getCacheData().then((result) => {
			if (result.code == 200) {
				if (result.data) {
					const data = result.data;
					if (data.commandStats) {
						const option = clone(CommandStatisticsOption, true);
						(option.series as any)[0].data = result.data.commandStats;
						setCommandStats(option);
					}
					let dbSize = 0;
					if (data.dbSize) {
						dbSize = data.dbSize;
					}
					if (data.info) {
						if (data.info.used_memory_human) {
							const option = clone(MemoryInformationOption);
							(option.series as any)[0].data = [
								{
									value: toNumber(data.info.used_memory_human),
									name: '内存消耗',
								},
							];
							setMemoryInfo(option);
						}
						setInfo({
							...data.info,
							dbSize,
						});
					}
				}
			}
		});
	}, []);

	useEffect(() => {
		getCacheList();
	}, []);

	return (
		<div className='container flex-column'>
			<div className='mb-sm'>
				<Card
					size='small'
					title='基本信息'
					bodyStyle={{ padding: '1px 0 0' }}
					bordered={false}
				>
					<Descriptions
						bordered
						className='card-description'
						size='small'
						column={4}
						labelStyle={{ width: '120px' }}
					>
						<Item label='Redis版本'>{info ? info.redis_version : '--'}</Item>
						<Item label='运行模式'>
							{info && info.redis_mode == 'standalone' ? '单机' : '集群'}
						</Item>
						<Item label='端口'>{info ? info.tcp_port : '--'}</Item>
						<Item label='客户端数'>{info ? info.connected_clients : '--'}</Item>
						<Item label='运行时间(天)'>
							{info ? info.uptime_in_days : '--'}
						</Item>
						<Item label='使用内存'>{info ? info.used_memory_human : '--'}</Item>
						<Item label='使用CPU'>
							{info ? parseFloat(info.used_cpu_user_children).toFixed(2) : '--'}
						</Item>
						<Item label='内存配置'>{info ? info.maxmemory_human : '--'}</Item>
						<Item label='AOF是否开启'>
							{info && info.aof_enabled == '0' ? '否' : '是'}
						</Item>
						<Item label='RDB是否成功'>
							{info ? info.rdb_last_bgsave_status : '--'}
						</Item>
						<Item label='Key数量'>{info ? info.dbSize : '--'}</Item>
						<Item label='网络入口/出口'>
							{info ? info.instantaneous_input_kbps : '--'}
						</Item>
					</Descriptions>
				</Card>
			</div>
			<div className='flex-row flex-1'>
				<div className='flex-1 mr-sm'>
					<Card
						className='auto-card'
						size='small'
						title='命令统计'
						bordered={false}
					>
						<Echarts
							id='command-statistics'
							class='container'
							options={commandStats}
						/>
					</Card>
				</div>
				<div className='flex-1'>
					<Card
						className='auto-card'
						size='small'
						title='内存信息'
						bordered={false}
					>
						<div id='memory-information' className='container'></div>
						<Echarts
							id='memory-information'
							class='container'
							options={memoryInfo}
						/>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default Cache;
