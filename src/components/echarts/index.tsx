import { useEcharts } from '@/core';
import { useEffect } from 'react';
import { debounceTime, fromEvent, Subscription } from 'rxjs';

interface EchartsProps {
	id: string;
	class?: string;
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

		const observable = fromEvent(window, 'resize');
		let subscription: Subscription | null = null;
		const bindResizeEvent = () => {
			subscription = observable.pipe(debounceTime(10)).subscribe(() => {
				resize();
			});
		};
		bindResizeEvent();

		return () => {
			if (subscription) {
				subscription.unsubscribe();
			}
		};
	}, [resize]);

	return <div id={props.id} className={props.class}></div>;
};
