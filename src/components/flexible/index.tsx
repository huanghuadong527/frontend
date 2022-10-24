import RcMotion from 'rc-motion';
import { CSSProperties } from 'react';

import './index.less';

interface FlexiableType {
	/** 是否可见 */
	visible: boolean;
	style?: CSSProperties;
	children: JSX.Element;
}

async function forceDelay(): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, 300);
	});
}

/**
 * 折叠展开动画
 */
export const Flexiable = (props: FlexiableType) => {
	return (
		<RcMotion
			visible={props.visible}
			motionDeadline={500}
			motionName='transition'
			leavedClassName='hidden'
			onAppearPrepare={forceDelay}
			onEnterPrepare={forceDelay}
			onEnterStart={() => ({ height: 0, opacity: 0 })}
			onEnterActive={(node) => ({ height: node.scrollHeight, opacity: 1 })}
			onLeaveStart={(node) => ({ height: node.offsetHeight })}
			onLeaveActive={() => ({ height: 0, opacity: 0 })}
			onEnterEnd={(_, event) =>
				(event as TransitionEvent).propertyName === 'height'
			}
			onLeaveEnd={(_, event) =>
				(event as TransitionEvent).propertyName === 'height'
			}
		>
			{({ className, style }) => (
				<div
					className={[className, 'flexible'].join(' ')}
					style={{ ...style, ...props.style }}
				>
					{props.children}
				</div>
			)}
		</RcMotion>
	);
};
