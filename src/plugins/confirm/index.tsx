import { GLOBAL_THEME } from '@/theme';
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	ThemeProvider
} from '@mui/material';
import {
	WarningRegular,
	InfoRegular,
	DismissCircleRegular
} from '@fluentui/react-icons';
import { orange, blue, red } from '@mui/material/colors';
import { render, unmount } from '@rc-component/util/lib/React/render';
import { type ConfirmOptions } from 'material-ui-confirm';

interface Props extends ConfirmOptions {
	type?: StatusType;
	onOk?: () => void;
	onCancel?: () => void;
}

export const confirm = (props: Props) => {
	const container = document.createDocumentFragment();
	let timer: ReturnType<typeof setTimeout>;

	const destroy = () => {
		unmount(container);
	};

	const onCancel = () => {
		destroy();
		props.onCancel && props.onCancel();
	};

	const onConfirm = () => {
		destroy();
		props.onOk && props.onOk();
	};

	const scheduleRender = () => {
		clearTimeout(timer);

		timer = setTimeout(() => {
			const conElement = (
				<Dialog
					open={true}
					{...props.dialogProps}
					slotProps={{ paper: { sx: { outline: 'none' } } }}
				>
					<DialogTitle {...props.titleProps}>
						<div className='flex items-center gap-1.5'>
							{props.type == 'warning' ? (
								<WarningRegular style={{ color: orange[500] }} />
							) : props.type == 'info' ? (
								<InfoRegular style={{ color: blue[500] }} />
							) : props.type == 'error' ? (
								<DismissCircleRegular style={{ color: red[500] }} />
							) : null}
							{props.title}
						</div>
					</DialogTitle>
					<DialogContent {...props.contentProps}>
						<DialogContentText>{props.content}</DialogContentText>
					</DialogContent>
					<DialogActions {...props.dialogActionsProps}>
						{!props.hideCancelButton ? (
							<Button
								{...props.cancellationButtonProps}
								size='small'
								variant='outlined'
								onClick={onCancel}
							>
								{props.cancellationText ?? '取消'}
							</Button>
						) : null}
						<Button
							{...props.confirmationButtonProps}
							size='small'
							variant='contained'
							onClick={onConfirm}
						>
							{props.confirmationText ?? '确认'}
						</Button>
					</DialogActions>
				</Dialog>
			);

			render(
				<ThemeProvider theme={GLOBAL_THEME}>{conElement}</ThemeProvider>,
				container
			);
		});
	};

	scheduleRender();

	return {
		destroy
	};
};
