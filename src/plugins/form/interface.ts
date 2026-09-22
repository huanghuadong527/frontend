import type { ReactNode } from 'react';
import type { GridBaseProps, Theme } from '@mui/material';
import type { SystemProps } from '@mui/system';
import type { FormikProps, FormikValues } from 'formik';

export type FormRef = {
	nativeElement?: HTMLElement;
};

export type FormLayout = 'horizontal' | 'inline' | 'vertical';

export interface FormProps {
	name?: string;
	initialValues?: CObject;
	labelCol?: GridBaseProps & SystemProps<Theme>;
	wrapperCol?: GridBaseProps;
	formik?: FormikProps<FormikValues>;
	children?: ReactNode;
	layout?: FormLayout;
	onSubmit?: (values: FormikValues) => void;
}

export interface FormItemLabelProps {
	name?: string;
	label?: ReactNode;
}

export interface FormItemProps extends FormItemLabelProps {
	required?: boolean;
	children?: ReactNode;
}
