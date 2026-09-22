import {
	useState,
	type ChangeEventHandler,
	type FocusEventHandler,
	type Ref
} from 'react';
import {
	ChevronDownRegular,
	DismissRegular
} from '@fluentui/react-icons';
import {
	Autocomplete as MuiAutocomplete,
	autocompleteClasses,
	Box,
	inputBaseClasses,
	outlinedInputClasses,
	styled,
	TextField,
	Typography,
	type AutocompleteProps as MuiAutocompleteProps
} from '@mui/material';

type AutocompleteType = MuiAutocompleteProps<AnyObject, boolean, boolean, boolean>;

interface AutocompleteProps<T = AnyObject> {
	name?: string;
	ref?: Ref<T>;
	placeholder?: string;
	options: ReadonlyArray<T>;
	onChange?: ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
}

const CustomAutocomplete = styled((props: AutocompleteType) => (
	<MuiAutocomplete {...props} />
))(() => ({
	minWidth: 120,
	paddingBlock: 0,
	[`& .${outlinedInputClasses.root}`]: {
		fontSize: 14,
		[`&.${inputBaseClasses.sizeSmall}`]: {
			paddingBlock: '3px'
		}
	},
	[`& .${autocompleteClasses.input}`]: {
		height: 'initial',
		lineHeight: 1.5
	}
}));

export const Autocomplete = styled(
	({
		ref,
		name,
		placeholder,
		options,
		onChange,
		onBlur,
		value,
		multiple,
		freeSolo,
		...props
	}: Omit<AutocompleteType, 'options' | 'renderInput'> &
		AutocompleteProps) => {
		const [inputValue, setInputValue] = useState('');

		const handleBlur: FocusEventHandler<HTMLDivElement> = (event) => {
			if (freeSolo && multiple) {
				const currentValue = (Array.isArray(value) ? value : []) as unknown[];
				const next = inputValue.trim();
				if (next && !currentValue.includes(next)) {
					onChange &&
						onChange({
							...event,
							target: { name, value: [...currentValue, next] }
						} as any);
				}
				setInputValue('');
			}
			onBlur && onBlur(event);
		};

		return (
			<CustomAutocomplete
				disableCloseOnSelect
				{...props}
				ref={ref}
				value={value}
				multiple={multiple}
				freeSolo={freeSolo}
				inputValue={inputValue}
				onInputChange={(_, newValue) => setInputValue(newValue)}
				onBlur={handleBlur}
				clearIcon={<DismissRegular style={{ fontSize: 12 }} />}
				popupIcon={props.popupIcon ?? <ChevronDownRegular style={{ fontSize: 16 }} />}
				noOptionsText={<Typography variant='body2'>暂无数据</Typography>}
				onChange={(e, v) =>
					onChange &&
					onChange({
						...e,
						...{ target: { name, value: v } }
					} as any)
				}
				renderInput={(params) => (
					<TextField
						{...params}
						size='small'
						name={name}
						aria-describedby={name}
						placeholder={placeholder}
						slotProps={{
							input: {
								...params.InputProps,
								sx: {
									'&:hover': {
										[`& .${outlinedInputClasses.notchedOutline}`]: {
											borderColor: 'primary.light'
										}
									},
									[`&.${outlinedInputClasses.focused}`]: {
										[`& .${outlinedInputClasses.notchedOutline}`]: {
											borderWidth: '1px',
											borderColor: 'primary.main'
										}
									}
								}
							}
						}}
					/>
				)}
				renderOption={(props, option, _, ownerState) => {
					const { key, ...optionProps } = props;
					return (
						<Box
							component='li'
							key={key}
							{...optionProps}
							sx={{
								fontSize: 14,
								[`&.${autocompleteClasses.option}`]: {
									padding: '5px 10px'
								}
							}}
						>
							{ownerState.getOptionLabel(option)}
						</Box>
					);
				}}
				options={options}
			/>
		);
	}
)();
