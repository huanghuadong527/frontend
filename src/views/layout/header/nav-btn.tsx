import type { HTMLAttributes } from 'react';

interface NavBtnProps extends HTMLAttributes<HTMLDivElement> {}

export const NavBtn = ({ children, ...params }: NavBtnProps) => {
	return (
		<div
			{...params}
			className='h-full flex px-2.5 items-center cursor-pointer hover:bg-black/10'
		>
			<div className='flex items-center gap-1'>{children}</div>
		</div>
	);
};
