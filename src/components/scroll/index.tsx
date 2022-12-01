import { useEffect, useRef, useState } from 'react';
import { fromEvent } from 'rxjs';

import style from './index.module.less';

interface Props {
	height: number;
	children: string | JSX.Element;
}

const BAR_HEIGHT = 13;
let _top = 0;

const JScroll = (props: Props) => {
	const jScroll = useRef(null);
	const jScrollC = useRef(null);
	const [top, setTop] = useState(0);
	const [cTop, setCTop] = useState(BAR_HEIGHT);
	const [scope, setScope] = useState(1);

	useEffect(() => {
		const _height = (jScrollC.current as any)!.clientHeight;
		const _scope = ((props.height - BAR_HEIGHT * 2) * props.height) / _height;
		if (_height > props.height) {
			setScope(_scope);
			fromEvent<WheelEvent>(jScroll.current!, 'mousewheel').subscribe((e) => {
				if (e.deltaY < 0) {
					_top += _scope;
					if (_top > 0) {
						_top = 0;
					}
				} else {
					_top -= _scope;
					if (_top < props.height - _height) {
						_top = props.height - _height;
					}
				}
				setCTop(-((_top * (props.height - BAR_HEIGHT * 2)) / _height) + 13);
				setTop(_top);
			});
		} else {
			setScope(props.height - 2 * BAR_HEIGHT);
		}
	}, []);

	return (
		<div
			ref={jScroll}
			className={style.jScroll}
			style={{
				height: `${props.height}px`,
			}}
		>
			<div
				ref={jScrollC}
				className={style.jScrollC}
				style={{ top: `${top}px` }}
			>
				{props.children}
			</div>
			<div className={style.jScrollE}>
				<div className={style.jScrollU}></div>
				<div
					className={style.jScrollH}
					style={{
						height: `${scope}px`,
						top: `${cTop}px`,
					}}
				></div>
				<div className={style.jScrollD}></div>
			</div>
		</div>
	);
};

export { JScroll };
