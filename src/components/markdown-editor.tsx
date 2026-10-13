import { useEffect, useRef } from 'react';
import Vditor from 'vditor';
import 'vditor/dist/index.css';
import lutePath from 'vditor/dist/js/lute/lute.min.js?url';
import 'vditor/dist/js/i18n/zh_CN.js';
import 'vditor/dist/js/icons/ant.js';
import { App } from 'antd';
import { API_UPLOAD } from '@/core';
import { uploadImage } from '@/service/common';

interface MarkdownEditorProps {
	value?: string;
	onChange?: (value: string) => void;
	height?: number | string;
	placeholder?: string;
}

/**
 * Markdown 编辑器（基于 Vditor），配合 antd Form.Item 使用。
 * 通过 value/onChange 与表单双向绑定。
 */
export const MarkdownEditor = ({
	value = '',
	onChange,
	height = 360,
	placeholder
}: MarkdownEditorProps) => {
	const { message } = App.useApp();
	const containerRef = useRef<HTMLDivElement>(null);
	const vditorRef = useRef<Vditor | null>(null);
	const onChangeRef = useRef(onChange);
	onChangeRef.current = onChange;

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;

		const vditor = new Vditor(el, {
			value,
			mode: 'ir',
			height,
			placeholder: placeholder ?? '请输入内容(Markdown)',
			cache: { enable: false },
			icon: undefined,
			_lutePath: lutePath,
			i18n: window.VditorI18n,
			preview: {
				hljs: { enable: false },
				markdown: {
					codeBlockPreview: false,
					mathBlockPreview: false,
					// 图片存储为根相对路径(/upload/...)，渲染时统一加资源前缀
					linkPrefix: API_UPLOAD
				}
			},
			toolbar: [
				'headings',
				'bold',
				'italic',
				'strike',
				'link',
				'|',
				'list',
				'ordered-list',
				'check',
				'quote',
				'line',
				'code',
				'inline-code',
				'|',
				'upload',
				'table',
				'|',
				'undo',
				'redo',
				'|',
				'both',
				'fullscreen'
			],
			upload: {
				accept: 'image/*',
				handler: async (files) => {
					for (const file of files) {
						const data = new FormData();
						data.append('file', file);
						try {
							const result = await uploadImage(data);
							const url = (result?.data as string) ?? '';
							if (!url) {
								message.error(`图片「${file.name}」上传失败`);
								continue;
							}
							// 存相对路径，显示时由 linkPrefix 统一补资源前缀
							vditorRef.current?.insertValue(`![${file.name}](${url})`);
						} catch {
							message.error('图片上传失败');
						}
					}
					return null;
				}
			},
			input(inputValue) {
				onChangeRef.current?.(inputValue);
			}
		});

		vditorRef.current = vditor;

		return () => {
			vditor.destroy();
			vditorRef.current = null;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return <div ref={containerRef} />;
};
