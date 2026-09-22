import React, { isValidElement, type ReactNode } from 'react';

type RenderProps =
	| AnyObject
	| ((originProps: AnyObject) => AnyObject | undefined);

export const replaceElement = <P>(
	element: ReactNode,
	replacement: ReactNode,
	props?: RenderProps
) => {
	if (!isValidElement<P>(element)) {
		return replacement;
	}
	return React.cloneElement<P>(
		element,
		typeof props === 'function' ? props(element.props || {}) : props
	);
};

export function cloneElement<P>(element: React.ReactNode, props?: RenderProps) {
	return replaceElement<P>(element, element, props) as React.ReactElement<P>;
}
