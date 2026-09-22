import { type ChangeEvent, useContext, useRef, useState } from 'react';
import {
	Box,
	CircularProgress,
	IconButton,
	styled,
	Typography
} from '@mui/material';
import {
	AddRegular,
	DismissRegular
} from '@fluentui/react-icons';
import { API_UPLOAD } from '@/core';
import { FormContext } from '@/context';
import { message } from '@/plugins/message';
import { uploadImage } from '@/service/common';

const UploadBox = styled('div')(({ theme }) => ({
	width: 72,
	height: 72,
	border: `1px dashed ${theme.palette.border.main}`,
	borderRadius: theme.shape.borderRadius,
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'center',
	gap: 2,
	color: theme.palette.text.secondary,
	cursor: 'pointer',
	transition: '0.2s',
	'&:hover': {
		borderColor: theme.palette.primary.main,
		color: theme.palette.primary.main
	}
}));

const PreviewBox = styled('div')(({ theme }) => ({
	width: 72,
	height: 72,
	borderRadius: theme.shape.borderRadius,
	border: `1px solid ${theme.palette.border.main}`,
	overflow: 'hidden',
	cursor: 'pointer',
	flexShrink: 0,
	'& img': {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		display: 'block'
	}
}));

interface UploadProps {
	name?: string;
	value?: string;
	multiple?: boolean;
}

const getSrc = (value: string) =>
	value.startsWith('http') ? value : API_UPLOAD + value;

export const Upload = ({ name, value, multiple }: UploadProps) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [loading, setLoading] = useState(false);
	const form = useContext(FormContext);

	const urls = value ? value.split(',').filter(Boolean) : [];

	const setValue = (list: string[]) => {
		if (form.formik && name) {
			const next = multiple ? list.join(',') : (list[0] ?? '');
			form.formik.setFieldValue(name, next);
		}
	};

	const onSelect = async (e: ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files ?? []);
		e.target.value = '';
		if (!files.length) return;

		setLoading(true);
		try {
			const uploaded: string[] = [];
			for (const file of files) {
				const formData = new FormData();
				formData.append('file', file);
				const result = await uploadImage(formData);
				const url = result?.data ?? '';
				if (!url) {
					message.error('上传失败，未获取到文件地址');
					continue;
				}
				uploaded.push(url);
			}
			if (uploaded.length) {
				setValue([...urls, ...uploaded]);
			}
		} catch {
			message.error('上传失败');
		} finally {
			setLoading(false);
		}
	};

	const removeAt = (index: number) => {
		setValue(urls.filter((_, i) => i !== index));
	};

	const renderPreview = (url: string, index: number) => (
		<Box key={url} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
			<PreviewBox
				onClick={() => {
					if (!multiple) inputRef.current?.click();
				}}
			>
				<img src={getSrc(url)} alt='图片' />
			</PreviewBox>
			<IconButton size='small' color='error' onClick={() => removeAt(index)}>
				<DismissRegular style={{ fontSize: 16 }} />
			</IconButton>
		</Box>
	);

	return (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
			<input
				ref={inputRef}
				type='file'
				accept='image/*'
				multiple={multiple}
				hidden
				onChange={onSelect}
			/>
			{urls.map(renderPreview)}
			{multiple || urls.length === 0 ? (
				<UploadBox onClick={() => inputRef.current?.click()}>
					{loading ? <CircularProgress size={20} /> : <AddRegular style={{ fontSize: 22 }} />}
					<Typography variant='caption'>上传</Typography>
				</UploadBox>
			) : null}
		</Box>
	);
};
