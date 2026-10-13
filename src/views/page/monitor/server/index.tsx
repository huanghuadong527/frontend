import { Card, Col, Row } from 'antd';
import { useEffect, useState, type ReactNode } from 'react';
import { getServerData } from '@/service';

type KV = { label: string; value: string };

const tableCls = 'w-full border-collapse text-sm';
const thCls =
	'border border-gray-200 bg-[#fafafa] px-2 py-1 text-left font-semibold whitespace-nowrap';
const tdCls = 'border border-gray-200 px-2 py-1';
const labelTdCls =
	'border border-gray-200 bg-[#fafafa] px-2 py-1 font-semibold whitespace-nowrap w-[120px]';

const Panel = ({ title, children }: { title: string; children: ReactNode }) => (
	<Card title={title} size='small'>
		{children}
	</Card>
);

const InfoTable = ({
	title,
	columns,
	rows
}: {
	title: string;
	columns: string[];
	rows: (string | number)[][];
}) => (
	<Panel title={title}>
		<table className={tableCls}>
			<thead>
				<tr>
					{columns.map((c) => (
						<th key={c} className={thCls}>
							{c}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{rows.map((row, i) => (
					<tr key={i}>
						{row.map((cell, j) => (
							<td key={j} className={tdCls}>
								{cell}
							</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	</Panel>
);

const InfoCard = ({ title, items }: { title: string; items: KV[] }) => (
	<Panel title={title}>
		<table className={tableCls}>
			<tbody>
				{items.map((item) => (
					<tr key={item.label}>
						<td className={labelTdCls}>{item.label}</td>
						<td className={tdCls}>{item.value || '--'}</td>
					</tr>
				))}
			</tbody>
		</table>
	</Panel>
);

export const Component = () => {
	const [data, setData] = useState<AnyObject>();

	useEffect(() => {
		getServerData()
			.then((result) => setData(result.data))
			.catch(() => {});
	}, []);

	const cpu = data?.cpu;
	const mem = data?.mem;
	const jvm = data?.jvm;
	const sys = data?.sys;
	const sysFiles: AnyObject[] = data?.sysFiles ?? [];

	return (
		<div className='p-4'>
			<Row gutter={[16, 16]}>
				<Col xs={24} md={12}>
					<InfoTable
						title='CPU'
						columns={['属性', '值']}
						rows={[
							['核心数', cpu?.cpuNum ?? '--'],
							['用户使用率', cpu ? `${cpu.used}%` : '--'],
							['系统使用率', cpu ? `${cpu.sys}%` : '--'],
							['空闲率', cpu ? `${cpu.free}%` : '--']
						]}
					/>
				</Col>
				<Col xs={24} md={12}>
					<InfoTable
						title='内存'
						columns={['属性', '内存', 'JVM']}
						rows={[
							[
								'总内存',
								mem ? `${mem.total}G` : '--',
								jvm ? `${jvm.total}M` : '--'
							],
							[
								'已用内存',
								mem ? `${mem.used}G` : '--',
								jvm ? `${jvm.used}M` : '--'
							],
							[
								'剩余内存',
								mem ? `${mem.free}G` : '--',
								jvm ? `${jvm.free}M` : '--'
							],
							[
								'使用率',
								mem ? `${mem.usage}%` : '--',
								jvm ? `${jvm.usage}%` : '--'
							]
						]}
					/>
				</Col>
				<Col span={24}>
					<InfoCard
						title='服务器信息'
						items={[
							{ label: '服务器名称', value: sys?.computerName },
							{ label: '操作系统', value: sys?.osName },
							{ label: '服务器IP', value: sys?.computerIp },
							{ label: '系统架构', value: sys?.osArch },
							{ label: '项目路径', value: sys?.userDir }
						]}
					/>
				</Col>
				<Col span={24}>
					<InfoCard
						title='Java虚拟机信息'
						items={[
							{ label: 'Java名称', value: jvm?.name },
							{ label: 'Java版本', value: jvm?.version },
							{ label: '启动时间', value: jvm?.startTime },
							{ label: '运行时长', value: jvm?.runTime },
							{ label: '安装路径', value: jvm?.home },
							{ label: '运行参数', value: jvm?.inputArgs }
						]}
					/>
				</Col>
				<Col span={24}>
					<InfoTable
						title='磁盘状态'
						columns={[
							'盘符路径',
							'文件系统',
							'盘符类型',
							'总大小',
							'可用大小',
							'已用大小',
							'已用百分比'
						]}
						rows={sysFiles.map((f) => [
							f.dirName,
							f.sysTypeName,
							f.typeName,
							f.total,
							f.free,
							f.used,
							`${f.usage}%`
						])}
					/>
				</Col>
			</Row>
		</div>
	);
};
