import type { HTMLAttributes } from 'react';
import { Box, Stack } from '@mui/material';

interface NavBtnProps extends HTMLAttributes<any> {}

export const NavBtn = ({ children, ...params }: NavBtnProps) => {
	return (
		<Box
			{...params}
			className='h-full flex px-2.5 items-center cursor-pointer'
			sx={{
				'&:hover': {
					bgcolor: 'action.selected'
				}
			}}
		>
			<Stack className='items-center' direction='row' spacing={1}>
				{children}
			</Stack>
		</Box>
	);
};
