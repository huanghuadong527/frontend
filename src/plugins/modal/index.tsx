import {
	forwardRef,
	useState,
	type MouseEvent,
	type ReactElement,
	type ReactNode
} from 'react';
import {
	DismissRegular,
	FullScreenMaximizeRegular,
	FullScreenMinimizeRegular
} from '@fluentui/react-icons';
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Paper,
	Slide,
	Stack,
	type DialogProps,
	type PaperProps,
	type SlideProps
} from '@mui/material';
import { IconButton } from '../button';

const Transition = forwardRef<
	HTMLElement,
	SlideProps & { children: ReactElement }
>((props, ref) => {
	return <Slide direction='up' ref={ref} {...props} />;
});

const CustomPaperComponent = (props: PaperProps) => {
	return <Paper {...props} elevation={2} />;
};

interface Props {
	title?: ReactNode;
	closable?: boolean;
	width?: DialogProps['maxWidth'];
	fullWidth?: DialogProps['fullWidth'];
	open: DialogProps['open'];
	children?: DialogProps['children'];
	footer?: DialogProps['children'] | null;
	okText?: DialogProps['children'];
	cancelText?: DialogProps['children'];
	tool?: DialogProps['children'];
	onOk?: Func;
	onClose?: DialogProps['onClose'];
	onCancel?: Func;
}

export const Modal = ({
	title,
	open,
	closable = true,
	fullWidth = true,
	width = 'sm',
	...props
}: Props) => {
	const [fullScreen, setFullScreen] = useState(false);

	const onClose = (e: MouseEvent) => {
		props.onClose && props.onClose(e, 'backdropClick');
		setTimeout(() => {
			setFullScreen(false);
		}, 500);
	};

	const onCancel = (e: MouseEvent) => {
		props.onClose && props.onClose(e, 'backdropClick');
		props.onCancel && props.onCancel();
	};

	return (
		<Dialog
			disableRestoreFocus
			scroll='body'
			aria-hidden={false}
			fullScreen={fullScreen}
			fullWidth={fullWidth}
			open={open}
			maxWidth={width}
			PaperComponent={CustomPaperComponent}
			slots={{
				transition: Transition
			}}
			slotProps={{
				container: {
					sx: { '&::after': { height: 0 } }
				},
				paper: {
					sx: { margin: '0 auto', top: fullScreen ? 0 : '100px' }
				}
			}}
			onClose={props.onClose}
			aria-labelledby='draggable-dialog-title'
		>
			<div className='relative'>
				{title ? (
					<DialogTitle
						component='div'
						sx={{
							fontSize: 14,
							fontWeight: 'initial',
							padding: '10px 15px',
							backgroundColor: 'action.hover'
						}}
					>
						{title}
					</DialogTitle>
				) : null}
				{closable && (
					<div className='absolute top-2 right-5'>
						<Stack direction='row' spacing={0.5}>
							{props.tool}
							<IconButton
								size='small'
								aria-hidden={false}
								onClick={() => setFullScreen(!fullScreen)}
							>
								{fullScreen ? (
									<FullScreenMinimizeRegular />
								) : (
									<FullScreenMaximizeRegular />
								)}
							</IconButton>
							<IconButton size='small' aria-hidden={false} onClick={onClose}>
								<DismissRegular />
							</IconButton>
						</Stack>
					</div>
				)}
			</div>
			<DialogContent sx={{ padding: '15px 15px', fontSize: 14 }}>
				{props.children}
			</DialogContent>
			{props.footer ?? (
				<DialogActions sx={{ padding: '10px 15px' }}>
					<Button variant='outlined' onClick={onCancel}>
						{props.cancelText ?? '取消'}
					</Button>
					<Button variant='contained' color='primary' onClick={props.onOk}>
						{props.okText ?? '确认'}
					</Button>
				</DialogActions>
			)}
		</Dialog>
	);
};
