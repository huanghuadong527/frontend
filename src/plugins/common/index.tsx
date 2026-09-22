import { Grid, styled, type GridBaseProps } from '@mui/material';

/** 容器居中 */
export const StyledGridOverlay = styled('div')(() => ({
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'center',
	textAlign: 'center',
	height: '100%'
}));

/**
 * 单页面容器
 * @default direction: column
 * @default height: 100%
 */
const PageOverlay = styled((props: GridBaseProps) => (
	<Grid
		container
		direction='column'
		wrap='nowrap'
		gap={2}
		sx={{ width: '100%', height: '100%' }}
		{...props}
	/>
))(() => ({}));

export { PageOverlay };
