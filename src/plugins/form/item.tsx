import { useContext } from 'react';
import {
	FormControl,
	FormHelperText,
	FormLabel,
	formLabelClasses,
	Grid,
	styled,
	Typography,
	type GridProps
} from '@mui/material';
import { FormContext } from '@/context';
import { cloneElement } from '@/utils';
import type { FormItemProps } from './interface';

const GridFormLabel = styled((props: GridProps) => (
	<Grid
		container
		{...props}
		sx={{
			height: '32px',
			alignItems: 'center',
			justifyContent: 'flex-end'
		}}
	/>
))();

const CustomFormLabel = styled(FormLabel)(({ theme }) => ({
	[`&.${formLabelClasses.focused}`]: {
		color: theme.palette.text.secondary
	},
	'&.required:before': {
		content: '"*"',
		marginInlineEnd: '4px',
		color: theme.palette.error.main,
		fontSize: '14px',
		lineHeight: 1
	},
	'&::after': {
		content: '":"',
		position: 'relative',
		marginBlock: 0,
		marginInlineStart: '2px',
		marginInlineEnd: '8px',
		fontFamily: 'var(--font-sans)'
	}
}));

export const FormItem = ({
	label,
	children,
	required,
	...restProps
}: FormItemProps) => {
	const form = useContext(FormContext);
	const name = restProps.name;
	const formik = form.formik;
	let error: string | undefined;
	let showError = false;
	if (name && formik) {
		error = formik.errors[name] as string | undefined;
		showError = !!error && !!(formik.touched[name] || formik.submitCount > 0);
	}

	return (
		form.formik && (
			<FormControl error={showError}>
				<Grid container>
					{label ? (
						<GridFormLabel {...form.labelCol}>
							<CustomFormLabel className={required ? 'required' : ''}>
								<Typography component='span' variant='body2'>
									{label}
								</Typography>
							</CustomFormLabel>
						</GridFormLabel>
					) : null}
					<Grid size='auto' {...form.wrapperCol}>
						{name
							? cloneElement(children, {
									...restProps,
									value: form.formik.values[name],
									onChange: form.formik.handleChange,
									onBlur: form.formik.handleBlur
								})
							: children}
						{showError ? <FormHelperText>{error}</FormHelperText> : null}
					</Grid>
				</Grid>
			</FormControl>
		)
	);
};
