import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { ReactNode } from 'react';
import { useAppSelector } from '@/store';
import { createThemeConfig } from './theme';

interface Props {
	children?: ReactNode;
}

export const ThemeProvider = ({ children }: Props) => {
	const color = useAppSelector((state) => state.system.theme);

	return (
		<ConfigProvider locale={zhCN} theme={createThemeConfig(color)}>
			{children}
		</ConfigProvider>
	);
};
