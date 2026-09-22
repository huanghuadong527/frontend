import { Checkbox as MuiCheckbox, styled, type CheckboxProps } from '@mui/material';

export const Checkbox = styled((props: CheckboxProps) => (
	<MuiCheckbox {...props} />
))(() => ({}));
