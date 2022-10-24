import { Form, FormInstance, Input, InputRef, Select } from 'antd';
import {
	createContext,
	FC,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';

interface EditableRowProps {
	index: number;
}

const EditableContext = createContext<FormInstance<any> | null>(null);

export interface EeditableItem {
	key: string;
}

export interface EditableCellProps<T> {
	title: React.ReactNode;
	editable: boolean;
	type: 'input' | 'select';
	children: React.ReactNode;
	dataIndex: keyof T;
	record: T;
	handleSave: (record: T) => void;
}

const EditableRow: FC<EditableRowProps> = ({ index, ...props }) => {
	const [form] = Form.useForm();
	return (
		<Form form={form} component={false}>
			<EditableContext.Provider value={form}>
				<tr {...props} />
			</EditableContext.Provider>
		</Form>
	);
};

const EditableCell: FC<EditableCellProps<any>> = ({
	title,
	editable,
	type,
	children,
	dataIndex,
	record,
	handleSave,
	...restProps
}) => {
	const [editing, setEditing] = useState(false);
	const inputRef = useRef<InputRef>(null);
	const form = useContext(EditableContext)!;

	useEffect(() => {
		if (editing) {
			if (type) {
				if (type == 'input') {
					inputRef.current!.focus();
				}
			}
		}
	}, [editing]);

	const toggleEdit = () => {
		setEditing(!editing);
		form.setFieldsValue({ [dataIndex]: record[dataIndex] });
	};

	const save = async () => {
		try {
			const values = await form.validateFields();

			toggleEdit();
			handleSave({ ...record, ...values });
		} catch (errInfo) {
			console.log('Save failed:', errInfo);
		}
	};

	let childNode = children;

	const childrenNode = () => {
		if (type) {
			switch (type) {
				case 'input':
					return <Input ref={inputRef} onPressEnter={save} onBlur={save} />;
				case 'select': 
					return <Select />
				default:
					return <div></div>;
			}
		}
		return <div></div>;
	};

	if (editable) {
		childNode = editing ? (
			<Form.Item
				style={{ margin: 0 }}
				name={dataIndex as any}
				rules={[
					{
						required: true,
						message: `${title} is required.`,
					},
				]}
			>
				{childrenNode()}
			</Form.Item>
		) : (
			<div
				className='editable-cell-value-wrap'
				style={{ paddingRight: 24 }}
				onClick={toggleEdit}
			>
				{children}
			</div>
		);
	}

	return <td {...restProps}>{childNode}</td>;
};

export { EditableCell, EditableRow };
