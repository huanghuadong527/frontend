import { EChartsCoreOption } from 'echarts';

export const CurrentPrice: EChartsCoreOption = {
	tooltip: {
		trigger: 'axis',
	},
	grid: {
		bottom: '10%',
		top: '25%',
		right: '5%',
		left: '11%',
	},
	legend: {
		data: ['神谕', '崛起', '齐天', '圣炎'],
	},
	xAxis: {
		type: 'category',
		data: [
			'2022.9.10',
			'2022.9.11',
			'2022.9.12',
			'2022.9.13',
			'2022.9.14',
			'2022.9.15',
			'2022.9.16',
		],
	},
	yAxis: {
		type: 'value',
		name: '价格',
	},
	series: [
		{
		  name: '神谕',
		  type: 'line',
		  data: [150, 230, 224, 218, 135, 147, 260],
		},
		{
		  name: '崛起',
		  type: 'line',
		  data: [120, 200, 220, 118, 105, 97, 160],
		},
		{
		  name: '齐天',
		  type: 'line',
		  data: [100, 230, 220, 218, 175, 197, 260],
		},
		{
		  name: '圣炎',
		  type: 'line',
		  data: [80, 240, 210, 108, 108, 108, 108],
		},
	],
};
