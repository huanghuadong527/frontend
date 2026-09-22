import type { GridBaseProps } from '@mui/material';
import type { FormikProps, FormikValues } from 'formik';
import { createContext } from 'react';

interface Props {
	name?: string;
	labelCol?: GridBaseProps;
	wrapperCol?: GridBaseProps;
	formik?: FormikProps<FormikValues>;
}

export const FormContext = createContext<Props>({});
