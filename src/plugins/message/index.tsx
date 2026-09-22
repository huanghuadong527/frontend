import { Alert, Snackbar, ThemeProvider } from '@mui/material';
import { render, unmount } from '@rc-component/util/lib/React/render';
import { createPortal } from 'react-dom';
import { GLOBAL_THEME } from '@/theme';

interface Props {
	type: StatusType;
	title: string;
	duration?: number;
}

const messageApi = () => {
	const container = document.createDocumentFragment();
	let timer: ReturnType<typeof setTimeout>;

	const destroy = () => {
		unmount(container);
	};

	const scheduleRender = ({ type, title, duration = 3000 }: Props) => {
		clearTimeout(timer);

		timer = setTimeout(() => {
			const conElement = (
				<Snackbar
					open={true}
					autoHideDuration={duration}
					anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
					onClose={destroy}
				>
					<Alert severity={type}>{title}</Alert>
				</Snackbar>
			);

			setTimeout(() => {
				destroy();
			}, duration);

			render(
				<ThemeProvider theme={GLOBAL_THEME}>
					{createPortal(conElement, document.body)}
				</ThemeProvider>,
				container
			);
		}, 200);
	};

	return {
		destroy,
		open: scheduleRender,
		info: (title: string) => scheduleRender({ type: 'info', title }),
		success: (title: string) => scheduleRender({ type: 'success', title }),
		warning: (title: string) => scheduleRender({ type: 'warning', title }),
		error: (title: string) => scheduleRender({ type: 'error', title })
	};
};

export const message = messageApi();
