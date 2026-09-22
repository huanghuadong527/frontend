import { IconButton as MuiIconButton, styled } from '@mui/material';

export const IconButton = styled(MuiIconButton)(({ theme }) => ({
	color: theme.palette.common.black,
	transition: theme.transitions.create(['color', 'background-color'], {
		duration: theme.transitions.duration.standard
	}),
	'&:hover': {
		color: theme.palette.primary.light
	}
}));
