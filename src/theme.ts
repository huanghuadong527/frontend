import {
	buttonClasses,
	createTheme,
	outlinedInputClasses
} from '@mui/material';
import { zhCN } from '@mui/x-data-grid/locales';
import { THEME_COLOR } from '@/core';

declare module '@mui/material/styles' {
	interface Palette {
		border: Palette['primary'];
	}

	interface PaletteOptions {
		border: PaletteOptions['primary'];
	}
}

export const createGlobalTheme = (primary: string) =>
	createTheme(
		{
			cssVariables: {
				cssVarPrefix: 'mui'
			},
			palette: {
				primary: {
					main: primary
				},
				info: {
					main: primary
				},
				success: {
					main: '#52c41a',
					contrastText: '#fff'
				},
				warning: {
					main: '#FF5722'
				},
				error: {
					main: '#ff4d4f',
					contrastText: '#fff'
				},
				border: {
					main: '#d9d9d9'
				}
			},
			shape: {
				borderRadius: 2
			},
			components: {
				MuiButton: {
					defaultProps: {
						disableRipple: true
					},
					styleOverrides: {
						root: {
							lineHeight: 'normal',
							[`& .${buttonClasses.startIcon}`]: {
								marginRight: '4px',
								'& > *:nth-of-type(1)': {
									fontSize: 'inherit'
								}
							}
						}
					}
				},
				MuiIconButton: {
					defaultProps: {},
					styleOverrides: {
						root: {
							fontSize: 'inherit'
						},
						sizeSmall: {
							fontSize: 'inherit'
						},
						sizeLarge: {
							fontSize: 'inherit'
						}
					}
				},
				MuiTab: {
					defaultProps: {
						disableRipple: true
					}
				},
				MuiCheckbox: {
					defaultProps: {
						disableRipple: true,
						disableFocusRipple: true,
						disableTouchRipple: true
					}
				},
				MuiTableCell: {
					styleOverrides: {
						root: {
							borderColor: '#f0f0f0'
						}
					}
				},
				MuiTextField: {
					styleOverrides: {
						root: {
							'& input:-webkit-autofill': {
								WebkitTextFillColor: 'inherit',
								caretColor: 'inherit',
								boxShadow: 'none'
							},
							'& input:-internal-autofill-selected': {
								WebkitTransitionDelay: '99999s',
								WebkitTransition:
									'color 99999s ease-out, background-color 99999s ease-out'
							},
							[`&.${outlinedInputClasses.focused} .${outlinedInputClasses.notchedOutline}`]:
								{
									borderColor: 'var(--mui-palette-text-primary)',
									borderWidth: '1px'
								}
						}
					}
				}
			}
		},
		zhCN // 国际化配置
	);

export const GLOBAL_THEME = createGlobalTheme(THEME_COLOR);
