import { EChartsCoreOption } from 'echarts';
import { THEME_COLOR } from '@/core';

/**
 * 内存信息
 */
export const MemoryInformationOption: EChartsCoreOption = {
	color: THEME_COLOR,
	tooltip: {
		formatter: '{b} <br/>{a} : {c}k',
	},
	series: [
		{
			name: '峰值',
			type: 'gauge',
			min: 0,
			max: 1000,
			progress: {
				show: true,
				width: 20,
			},
			axisLine: {
				lineStyle: {
					show: true,
					width: 20,
				},
			},
			axisLabel: {
				distance: 25,
			},
			detail: {
				valueAnimation: true,
				formatter: '{value}',
			},
			data: [],
		},
	],
};
