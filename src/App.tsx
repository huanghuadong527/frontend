import {
	GlobalStyles,
	StyledEngineProvider,
	ThemeProvider
} from '@mui/material';
import { ConfirmProvider } from 'material-ui-confirm';
import { useMemo } from 'react';
import { Outlet } from 'react-router';
import { useStore } from '@/store';
import { createGlobalTheme } from './theme';

function App() {
	const theme = useStore((state) => state.root.theme);
	const globalTheme = useMemo(() => createGlobalTheme(theme), [theme]);

	return (
		// enableCssLayer emotion
		<StyledEngineProvider enableCssLayer={false}>
			<GlobalStyles styles='@layer theme, base, mui, components, utilities;' />
			<ThemeProvider theme={globalTheme}>
				<ConfirmProvider>
					<Outlet />
				</ConfirmProvider>
			</ThemeProvider>
		</StyledEngineProvider>
	);
}

export default App;
