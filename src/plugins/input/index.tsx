import { OutlinedInput } from './Input';
import { TextArea } from './Textarea';

type InputProps = typeof OutlinedInput;

type TextAreaProps = typeof TextArea;

type CompoundedComponent = InputProps & {
	TextArea: TextAreaProps;
};

const Input = OutlinedInput as CompoundedComponent;

Input.TextArea = TextArea;

export { Input };
