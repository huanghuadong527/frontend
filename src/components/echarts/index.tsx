import * as echarts from 'echarts';
import { useEffect, useRef, type CSSProperties } from 'react';

interface EchartsProps {
	options: echarts.EChartsCoreOption;
	style?: CSSProperties;
	className?: string;
}

export const Echarts = ({ options, style, className }: EchartsProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const chartRef = useRef<echarts.ECharts | undefined>(undefined);

	useEffect(() => {
		if (!containerRef.current) return;
		const chart = echarts.init(containerRef.current);
		chartRef.current = chart;
		const onResize = () => chart.resize();
		window.addEventListener('resize', onResize);
		return () => {
			window.removeEventListener('resize', onResize);
			chart.dispose();
			chartRef.current = undefined;
		};
	}, []);

	useEffect(() => {
		chartRef.current?.setOption(options);
	}, [options]);

	return <div ref={containerRef} className={className} style={style} />;
};
