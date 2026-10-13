import { useEffect, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { App, Upload } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { API_UPLOAD } from '@/core';
import { uploadImage } from '@/service/common';

const getSrc = (value: string) =>
	value.startsWith('http') ? value : API_UPLOAD + value;

interface ImageUploadProps {
	value?: string;
	onChange?: (value: string) => void;
	multiple?: boolean;
	/** 单张图片大小上限(字节) */
	maxSize?: number;
	onPreview?: (file: UploadFile) => void;
}

const buildList = (value?: string): UploadFile[] => {
	const urls = value ? value.split(',').filter(Boolean) : [];
	return urls.map((url) => ({
		uid: url,
		name: url,
		status: 'done',
		url: getSrc(url)
	}));
};

export const ImageUpload = ({
	value,
	onChange,
	multiple,
	maxSize,
	onPreview
}: ImageUploadProps) => {
	const { message } = App.useApp();

	// antd v6 的 onSuccess 要求文件仍在受控 fileList 中，否则跳过 onChange 不触发回显；
	// 因此用本地 state 持有完整 fileList（含上传中的文件），再从中提取字符串值回传。
	const [fileList, setFileList] = useState<UploadFile[]>(() => buildList(value));

	// 外部 value 变化（编辑回填、重置）时同步，保留上传中的文件避免被清掉。
	useEffect(() => {
		setFileList((prev) => {
			const uploading = prev.filter((file) => file.status === 'uploading');
			return [...uploading, ...buildList(value)];
		});
	}, [value]);

	const beforeUpload: UploadProps['beforeUpload'] = (file) => {
		if (maxSize && file.size > maxSize) {
			message.error(
				`单张图片大小不能超过 ${Math.round(maxSize / 1024 / 1024)}MB`
			);
			return Upload.LIST_IGNORE;
		}
		return true;
	};

	const customRequest: UploadProps['customRequest'] = async ({
		file,
		onSuccess,
		onError
	}) => {
		try {
			const formData = new FormData();
			formData.append('file', file as File);
			const result = await uploadImage(formData);
			const url = result?.data ?? '';
			if (!url) {
				message.error('上传失败，未获取到文件地址');
				onError?.(new Error('no url'));
				return;
			}
			onSuccess?.(url);
		} catch {
			message.error('上传失败');
			onError?.(new Error('upload failed'));
		}
	};

	const handleChange: UploadProps['onChange'] = ({ fileList: nextList }) => {
		setFileList(nextList);
		const urls = nextList
			.filter((file) => file.status === 'done')
			.map((file) => (file.response as string) ?? file.name);
		onChange?.(multiple ? urls.join(',') : (urls[0] ?? ''));
	};

	const urls = value ? value.split(',').filter(Boolean) : [];

	return (
		<Upload
			listType='picture-card'
			accept='image/*'
			multiple={multiple}
			fileList={fileList}
			beforeUpload={beforeUpload}
			customRequest={customRequest}
			onChange={handleChange}
			onPreview={onPreview}
		>
			{multiple || urls.length === 0 ? (
				<div className='flex flex-col items-center'>
					<PlusOutlined />
					<div style={{ marginTop: 8 }}>上传</div>
				</div>
			) : null}
		</Upload>
	);
};
