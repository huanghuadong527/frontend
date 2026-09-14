import Editor, { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { getCodePreview } from '@/service';
import { Modal, ModalProps, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { useCallback, useEffect, useState } from 'react';

import 'monaco-editor/esm/vs/basic-languages/java/java.contribution';
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution';
import 'monaco-editor/esm/vs/basic-languages/sql/sql.contribution';
import 'monaco-editor/esm/vs/basic-languages/xml/xml.contribution';

loader.config({ monaco });

interface CodePreviewProps extends ModalProps {
	id: string;
}

const CodePreview = (props: CodePreviewProps) => {
	const [items, setItems] = useState<NonNullable<TabsProps['items']>>([]);

	const getCodePreviewData = useCallback((id: string) => {
		getCodePreview(id).then((result) => {
			if (result.code == 200) {
				const tabs: NonNullable<TabsProps['items']> = [];
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
							<Editor
								height={450}
								language={language}
								value={result.data[key]}
								options={{ readOnly: true }}
							/>
						)
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
		<Modal styles={{ body: { padding: 0 } }} {...props}>
			<Tabs size='small' items={items} />
		</Modal>
	);
};

export { CodePreview };
