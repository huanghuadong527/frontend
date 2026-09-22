import InternalForm from './instance';
import { FormItem } from './item';
import { useForm } from './useForm';

type InternalFormType = typeof InternalForm;

type CompoundedComponent = InternalFormType & {
	Item: typeof FormItem;
};

const Form = InternalForm as CompoundedComponent;

Form.Item = FormItem;

export { Form, useForm };
