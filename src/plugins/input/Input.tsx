import {
	OutlinedInput as MuiOutlinedInput,
	outlinedInputClasses,
	styled,
	type OutlinedInputProps
} from '@mui/material';

export const OutlinedInput = styled((props: OutlinedInputProps) => (
	<MuiOutlinedInput
		{...props}
		fullWidth
		size='small'
		notched={false}
		slots={{}}
		slotProps={{
			input: {
				sx: {
					height: 'initial',
					lineHeight: 1.5,
					paddingBlock: '8px',
					paddingInline: '10px',
					fontSize: 16
				}
			},
			notchedOutline: {
				sx: {
					transition: '0.2s'
				}
			}
		}}
	/>
))(({ theme }) => ({
	'&:hover': {
		[`& .${outlinedInputClasses.notchedOutline}`]: {
			borderColor: theme.palette.primary.light
		}
	},
	[`&.${outlinedInputClasses.adornedStart}`]: {
		paddingLeft: 10
	},
	[`&.${outlinedInputClasses.adornedEnd}`]: {
		paddingRight: 10
	},
	[`&.${outlinedInputClasses.sizeSmall}`]: {
		[`& .${outlinedInputClasses.input}`]: {
			fontSize: 14,
			lineHeight: 1.5714285714285714,
			paddingBlock: 5
		}
	},
	[`& .${outlinedInputClasses.notchedOutline}`]: {
		borderColor: theme.palette.border.main
	},
	[`&.${outlinedInputClasses.error} .${outlinedInputClasses.notchedOutline}`]: {
		borderColor: theme.palette.error.main
	},
	[`&.${outlinedInputClasses.focused}`]: {
		[`& .${outlinedInputClasses.notchedOutline}`]: {
			borderWidth: '1px',
			borderColor: theme.palette.primary.main
		}
	}
}));
