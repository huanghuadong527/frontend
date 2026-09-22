import type { ReactNode } from 'react';
import {
	ChevronDownRegular
} from '@fluentui/react-icons';
import {
	ListSubheader,
	Select as MuiSelect,
	styled,
	SvgIcon,
	Typography,
	type SelectProps as MuiSelectProps
} from '@mui/material';
import { CustomIcon } from '@/core';
import { OutlinedInput } from '../input/Input';

type SelectProps<T> = MuiSelectProps<T> & {
	placeholder?: ReactNode;
};

export const Select = styled((props: SelectProps<any>) => (
	<MuiSelect<any>
		{...props}
		fullWidth
		displayEmpty
		size='small'
		variant='outlined'
		IconComponent={ChevronDownRegular}
		input={<OutlinedInput />}
		renderValue={(selected) => {
			if (!selected || (Array.isArray(selected) && selected.length === 0)) {
				return (
					<Typography variant='body2' sx={{ color: 'grey.500' }}>
						{props.placeholder}
					</Typography>
				);
			}
			if (Array.isArray(selected)) {
				return selected.join(', ');
			}
			return selected;
		}}
	>
		{props.children ? (
			props.children
		) : (
			<ListSubheader sx={{ lineHeight: 'initial', textAlign: 'center' }}>
				<SvgIcon
					inheritViewBox
					component={CustomIcon.Empty}
					style={{ fontSize: '64px' }}
				/>
				<Typography variant='body2'>暂无数据</Typography>
			</ListSubheader>
		)}
	</MuiSelect>
))();
