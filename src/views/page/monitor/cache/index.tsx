import type { EChartsCoreOption } from 'echarts';
import { Fragment, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
	Card,
	CardHeader,
	Grid,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow
} from '@mui/material';
import { Echarts } from '@/components/echarts';
import { PageOverlay } from '@/plugins';
import { getCacheData } from '@/service';

const COLUMNS = 4;
const THEME_COLOR = '#1677ff';

type DescItem = { label: string; value: ReactNode };

const chunk = <T,>(arr: T[], size: number): T[][] =>
	Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
		arr.slice(i * size, i * size + size)
	);

const labelCellSx = {
	width: 120,
	bgcolor: '#fafafa',
	fontWeight: 600,
	whiteSpace: 'nowrap'
};

const Panel = ({ title, children }: { title: string; children: ReactNode }) => (
	<Card variant='outlined'>
		<CardHeader
			title={title}
			slotProps={{
				title: {
					variant: 'subtitle2'
				}
			}}
			sx={{
				paddingY: '8px',
				borderBottom: '1px solid',
				borderColor: 'divider'
			}}
		/>
		{children}
	</Card>
);

export const Component = () => {
	const [data, setData] = useState<AnyObject>();

	useEffect(() => {
		getCacheData()
			.then((result) => setData(result.data))
			.catch(() => {});
	}, []);

	const info = data?.info;
	const commandStats: Array<{ name: string; value: string }> =
		data?.commandStats ?? [];

	const basicInfo: DescItem[] = [
		{ label: 'Redis版本', value: info?.redis_version },
		{
			label: '运行模式',
			value: info
				? info.redis_mode === 'standalone'
					? '单机'
					: '集群'
				: undefined
		},
		{ label: '端口', value: info?.tcp_port },
		{ label: '客户端数', value: info?.connected_clients },
		{ label: '运行时间(天)', value: info?.uptime_in_days },
		{ label: '使用内存', value: info?.used_memory_human },
		{
			label: '使用CPU',
			value: info?.used_cpu_user_children
				? parseFloat(info.used_cpu_user_children).toFixed(2)
				: undefined
		},
		{ label: '内存配置', value: info?.maxmemory_human },
		{
			label: 'AOF是否开启',
			value: info ? (info.aof_enabled === '0' ? '否' : '是') : undefined
		},
		{ label: 'RDB是否成功', value: info?.rdb_last_bgsave_status },
		{ label: 'Key数量', value: data?.dbSize },
		{ label: '网络入口/出口', value: info?.instantaneous_input_kbps }
	];

	const commandOptions = useMemo<EChartsCoreOption>(
		() => ({
			tooltip: { trigger: 'item' },
			legend: { top: '5%', left: 'center' },
			series: [
				{
					name: '命令统计',
					type: 'pie',
					radius: ['40%', '70%'],
					avoidLabelOverlap: false,
					itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
					label: { show: false, position: 'center' },
					emphasis: {
						label: { show: true, fontSize: '40', fontWeight: 'bold' }
					},
					labelLine: { show: false },
					data: commandStats.map((item) => ({
						name: item.name,
						value: Number(item.value)
					}))
				}
			]
		}),
		[commandStats]
	);

	const usedMemory = info?.used_memory_human
		? parseFloat(info.used_memory_human) || 0
		: 0;

	const memoryOptions = useMemo<EChartsCoreOption>(
		() => ({
			color: [THEME_COLOR],
			tooltip: { formatter: '{b} <br/>{a} : {c}k' },
			series: [
				{
					name: '峰值',
					type: 'gauge',
					min: 0,
					max: 1000,
					progress: { show: true, width: 20 },
					axisLine: { lineStyle: { show: true, width: 20 } },
					axisLabel: { distance: 25 },
					detail: { valueAnimation: true, formatter: '{value}' },
					data: [{ value: usedMemory, name: '内存消耗' }]
				}
			]
		}),
		[usedMemory]
	);

	return (
		<PageOverlay>
			<Panel title='基本信息'>
				<TableContainer>
					<Table
						size='small'
						sx={{
							'& .MuiTableCell-root': {
								borderRight: '1px solid',
								borderBottom: '1px solid',
								borderColor: 'divider'
							},
							'& .MuiTableRow-root:last-child .MuiTableCell-root': {
								borderBottom: 'none'
							},
							'& .MuiTableCell-root:last-child': {
								borderRight: 'none'
							}
						}}
					>
						<TableBody>
							{chunk(basicInfo, COLUMNS).map((row, rowIndex) => (
								<TableRow key={rowIndex}>
									{row.map((item, colIndex) => (
										<Fragment key={colIndex}>
											<TableCell component='th' scope='row' sx={labelCellSx}>
												{item.label}
											</TableCell>
											<TableCell>{item.value ?? '--'}</TableCell>
										</Fragment>
									))}
									{row.length < COLUMNS && (
										<TableCell colSpan={(COLUMNS - row.length) * 2} />
									)}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			</Panel>
			<Grid container spacing={2}>
				<Grid size={{ xs: 12, lg: 6 }}>
					<Panel title='命令统计'>
						<Echarts options={commandOptions} style={{ height: 400 }} />
					</Panel>
				</Grid>
				<Grid size={{ xs: 12, lg: 6 }}>
					<Panel title='内存信息'>
						<Echarts options={memoryOptions} style={{ height: 400 }} />
					</Panel>
				</Grid>
			</Grid>
		</PageOverlay>
	);
};
