import logo from '@/assets/image/logo.png';
import {
	useRef } from 'react';
import { Box,
	Grid,
	Stack,
	Typography } from '@mui/material';
import {
	SearchRegular,
	FullScreenMaximizeRegular,
	FullScreenMinimizeRegular
} from '@fluentui/react-icons';
import { useFullscreen, useToggle } from 'react-use';
import { usePermis } from '@/authority';

import { NavBtn } from './nav-btn';
import { NavAvatar } from './avatar';

export const Header = () => {
	const dRef = useRef(document.body);
	const { user } = usePermis();
	const [show, toggle] = useToggle(false);
	const isFullscreen = useFullscreen(dRef, show, {
		onClose: () => toggle(false)
	});

	return (
		<Box
			sx={{
				color: 'primary.contrastText',
				bgcolor: 'primary.main'
			}}
		>
			<Grid
				container
				className='h-12.5 leading-12.5 px-5'
				direction='row'
				sx={{
					justifyContent: 'space-between',
					alignItems: 'center'
				}}
			>
				<Stack className='items-center' direction='row' spacing={1}>
					<img className='h-9' src={logo} />
					<Typography gutterBottom variant='h5'>
						智能管理系统
					</Typography>
				</Stack>
				<Stack className='h-full items-center' direction='row' spacing={1}>
					<NavBtn>
						<SearchRegular />
						<Typography gutterBottom variant='body2'>
							搜索
						</Typography>
					</NavBtn>
					<NavBtn onClick={() => toggle()}>
						{isFullscreen ? (
							<FullScreenMinimizeRegular />
						) : (
							<FullScreenMaximizeRegular />
						)}
						<Typography gutterBottom variant='body2'>
							全屏
						</Typography>
					</NavBtn>
					{user ? <NavAvatar /> : null}
				</Stack>
			</Grid>
		</Box>
	);
};
