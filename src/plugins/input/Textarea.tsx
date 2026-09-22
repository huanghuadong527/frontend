import type { RefAttributes } from 'react';
import {
	styled,
	TextareaAutosize,
	type TextareaAutosizeProps
} from '@mui/material';

type TextAreaProps = TextareaAutosizeProps & RefAttributes<Element>;

export const TextArea = styled(({ value, ...props }: TextAreaProps) => (
	<TextareaAutosize {...props} value={value ?? ''} />
))(({ theme }) => ({
	width: '100%',
	minWidth: 0,
	minHeight: '32px',
	padding: '5px 10px',
	listStyle: 'none',
	display: 'block',
	borderRadius: theme.vars!.shape.borderRadius,
	borderWidth: '1px',
	borderStyle: 'solid',
	borderColor: theme.palette.border.main,

	'&:hover': {
		borderColor: theme.palette.primary.light
	},

	'&:focus': {
		outline: 'none',
		borderColor: theme.palette.primary.main
	}
}));
