import type { ReactNode } from 'react';
import { FormControlLabel, Radio as MuiRadio } from '@mui/material';

interface RadioProps {
	value?: PropertyKey;
	label?: ReactNode;
}

export const Radio = ({ value, label }: RadioProps) => {
	return (
		<FormControlLabel
			value={value}
			label={label}
			control={
				<MuiRadio
					disableRipple
					disableFocusRipple
					size='small'
					slotProps={{
						root: {
							disableRipple: true,
							sx: {
								padding: '6px'
							}
						}
					}}
				/>
			}
			sx={{
				marginLeft: '-6px'
			}}
			slotProps={{
				typography: {
					sx: {
						fontSize: 14
					}
				}
			}}
		/>
	);
};
