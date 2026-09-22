import {
	forwardRef,
	useMemo,
	type ForwardRefRenderFunction,
	type PropsWithChildren,
	type ReactElement,
	type RefAttributes
} from 'react';
import { Stack } from '@mui/material';
import { FormContext } from '@/context';
import type { FormProps, FormRef } from './interface';

type InternalFormProps = ForwardRefRenderFunction<FormRef, FormProps>;

const InternalForm: InternalFormProps = (props, _) => {
	const {
		name,
		labelCol,
		wrapperCol = { size: 'grow' },
		formik,
		layout = 'horizontal',
		...restFormProps
	} = props;

	const formContextValue = useMemo(
		() => ({
			name,
			labelCol,
			wrapperCol,
			formik
		}),
		[name, labelCol, wrapperCol, formik]
	);

	return (
		<FormContext value={formContextValue}>
			<form
				name={props.name}
				onSubmit={formik && formik.handleSubmit}
				onReset={formik && formik.handleReset}
			>
				<Stack
					spacing={2}
					direction={
						layout == 'horizontal' || layout == 'vertical'
							? 'column'
							: layout == 'inline'
								? 'row'
								: 'row'
					}
				>
					{restFormProps.children}
				</Stack>
			</form>
		</FormContext>
	);
};

const AntdForm = forwardRef<FormRef, FormProps>(InternalForm) as (
	props: PropsWithChildren<FormProps> & RefAttributes<FormRef>
) => ReactElement;

export default AntdForm;
