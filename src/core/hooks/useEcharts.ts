import * as echarts from 'echarts';
import { useCallback, useEffect, useState } from 'react';

interface useEchartsInterface {
	eChartsInstance?: echarts.ECharts;
	initEcharts: (options?: echarts.EChartsCoreOption) => void;
	setOption: (options?: echarts.EChartsCoreOption) => void;
	resize: () => void;
}

export const useEcharts = (
	id: string,
	opts: echarts.EChartsCoreOption
): useEchartsInterface => {
	const [eChartsInstance, setEChartsInstance] = useState<echarts.ECharts>();

	const setOption = useCallback(
		(options?: echarts.EChartsCoreOption) => {
			if (eChartsInstance) {
				eChartsInstance.setOption(options ?? opts);
			}
		},
		[opts]
	);

	const resize = useCallback(() => {
		if (eChartsInstance) {
			eChartsInstance.resize();
		}
	}, [eChartsInstance]);

	const initEcharts = useCallback(
		(options?: echarts.EChartsCoreOption) => {
			if (id) {
				const $chart = document.getElementById(id);
				if ($chart) {
					let chart = echarts.getInstanceByDom($chart);
					if (!chart) {
						chart = echarts.init($chart);
					}
					setEChartsInstance(chart);
					chart.setOption(options ?? opts);
				}
			}
		},
		[id]
	);

	useEffect(() => {}, []);

	return {
		initEcharts,
		setOption,
		resize,
		eChartsInstance,
	};
};
