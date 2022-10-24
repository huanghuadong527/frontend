import MonacoEditor from 'react-monaco-editor';
import { getCodePreview } from '@/service';
import { Modal, ModalProps, Tabs } from 'antd';
import { Tab } from 'rc-tabs/lib/interface';
import { useCallback, useEffect, useState } from 'react';

import 'monaco-editor/esm/vs/basic-languages/java/java.contribution';
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution';
import 'monaco-editor/esm/vs/basic-languages/sql/sql.contribution';
import 'monaco-editor/esm/vs/basic-languages/xml/xml.contribution';

interface CodePreviewProps extends ModalProps {
	id: string;
}

const CodePreview = (props: CodePreviewProps) => {
	const [items, setItems] = useState<Tab[]>([]);

	const getCodePreviewData = useCallback((id: string) => {
		getCodePreview(id).then((result) => {
			if (result.code == 200) {
				const tabs: Tab[] = [];
				for (const key in result.data) {
					const fileName = key.substring(
						key.lastIndexOf('/') + 1,
						key.indexOf('.vm')
					);
					let language = fileName.substring(
						fileName.indexOf('.') + 1,
						fileName.length
					);
					if (language == 'js' || language == 'react') {
						language = 'javascript';
					}
					console.log(language);
					tabs.push({
						key,
						label: fileName,
						children: (
							<MonacoEditor
								height={450}
								language={language}
								value={result.data[key]}
								options={{ readOnly: true }}
							/>
						),
					});
				}
				setItems(tabs);
			}
		});
	}, []);

	useEffect(() => {
		if (props.id) {
			getCodePreviewData(props.id);
		}
	}, [props.id]);
	return (
		<Modal bodyStyle={{ padding: 0 }} {...props}>
			<Tabs size='small' items={items} />
		</Modal>
	);
};

export { CodePreview };
