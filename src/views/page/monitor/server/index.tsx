import { useEffect, useState, type ReactNode } from 'react';
import {
	Card,
	CardHeader,
	Grid,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow
} from '@mui/material';
import { PageOverlay } from '@/plugins';
import { getServerData } from '@/service';

type KV = { label: string; value: string };

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

const tableSx = {
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
};

const headCellSx = {
	bgcolor: '#fafafa',
	fontWeight: 600,
	whiteSpace: 'nowrap'
};

const labelCellSx = {
	width: 120,
	bgcolor: '#fafafa',
	fontWeight: 600,
	whiteSpace: 'nowrap'
};

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
		<TableContainer>
			<Table size='small' sx={tableSx}>
				<TableHead>
					<TableRow>
						{columns.map((c) => (
							<TableCell key={c} sx={headCellSx}>
								{c}
							</TableCell>
						))}
					</TableRow>
				</TableHead>
				<TableBody>
					{rows.map((row, i) => (
						<TableRow key={i}>
							{row.map((cell, j) => (
								<TableCell key={j}>{cell}</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	</Panel>
);

const InfoCard = ({ title, items }: { title: string; items: KV[] }) => (
	<Panel title={title}>
		<TableContainer>
			<Table size='small' sx={tableSx}>
				<TableBody>
					{items.map((item) => (
						<TableRow key={item.label}>
							<TableCell sx={labelCellSx}>{item.label}</TableCell>
							<TableCell>{item.value || '--'}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
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
		<PageOverlay>
			<Grid container spacing={2}>
				<Grid size={{ xs: 12, md: 6 }}>
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
				</Grid>
				<Grid size={{ xs: 12, md: 6 }}>
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
				</Grid>
				<Grid size={{ xs: 12 }}>
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
				</Grid>
				<Grid size={{ xs: 12 }}>
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
				</Grid>
				<Grid size={{ xs: 12 }}>
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
				</Grid>
			</Grid>
		</PageOverlay>
	);
};
