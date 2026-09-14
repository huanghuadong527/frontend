import { useEcharts } from '@/core';
import { CSSProperties, useEffect } from 'react';

interface EchartsProps {
	id: string;
	class?: string;
	style?: CSSProperties;
	options: echarts.EChartsCoreOption;
}

export const Echarts = (props: EchartsProps) => {
	const { initEcharts, setOption, resize } = useEcharts(
		props.id,
		props.options
	);

	useEffect(() => {
		setOption(props.options);
	}, [props.options]);

	useEffect(() => {
		initEcharts();

		const onResize = () => resize();
		window.addEventListener('resize', onResize);

		return () => {
			window.removeEventListener('resize', onResize);
		};
	}, [resize]);

	return <div id={props.id} className={props.class} style={props.style}></div>;
};
