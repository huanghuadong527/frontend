import { EChartsCoreOption } from 'echarts';

/**
 * 命令统计
 */
export const CommandStatisticsOption: EChartsCoreOption = {
	tooltip: {
		trigger: 'item',
	},
	legend: {
		top: '5%',
		left: 'center',
	},
	series: [
		{
			name: '命令统计',
			type: 'pie',
			radius: ['40%', '70%'],
			avoidLabelOverlap: false,
			itemStyle: {
				borderRadius: 10,
				borderColor: '#fff',
				borderWidth: 2,
			},
			label: {
				show: false,
				position: 'center',
			},
			emphasis: {
				label: {
					show: true,
					fontSize: '40',
					fontWeight: 'bold',
				},
			},
			labelLine: {
				show: false,
			},
			data: [],
		},
	],
};