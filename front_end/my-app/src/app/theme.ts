'use client';

import { createTheme, ThemeProvider } from '@mui/material/styles';

const typography = {
  fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`,
}

const paletteLight = {
  mode: 'light' as const,
  divider: '#d4d4d4',
  background: {
    default: '#ebebeb',
    paper:    '#f0f0f0', 
  },
  text: {
    secondary: '#2e2e2e', // was #333333
    primary:   '#1f1f1f', // was #474747
  },
  primary: {
    main: '#3aafa2',
    light: '#50d2c2',
    dark: '#248c82',
    contrastText: '#fff',
    100: '#86eadc', 
    200: '#75d8cb', 
    300: '#64c6ba', 
    400: '#53b4a8', 
    500: '#42a197', 
    600: '#308f86', // dark
    700: '#1f7d74', 
    800: '#147169',
  },
  secondary: {
    main: '#3B82F6',
    light: '#60A5FA',
    dark: '#2563EB',
    contrastText: '#ffffff',
  },
  error: {
    light: '#fdecea',
    main:  '#ff3729',
    dark:  '#ba000d',
    contrastText: '#fff',
  },
  success: {
    light: '#e6f4ea',
    main:  '#118d15ff',
    dark:  '#087f23',
    contrastText: '#fff',
  },
  grey: {
    50:  '#f2f2f2', // was #fafafa
    100: '#e8e8e8', // was #f4f4f4
    200: '#dcdcdc', // was #e5e5e5
    300: '#c8c8c8', // was #d4d4d4
    400: '#a1a1a1', // was #a3a3a3
    500: '#707070', // was #737373
    600: '#505050', // was #525252
    700: '#393939', // was #3a3a3a
    800: '#2a2a2a', // was #2c2c2c
    900: '#1c1c1c', // was #1e1e1e
  },
}

const paletteDark = {
  mode: 'dark' as const,
  divider: '#2e2e2e',
  background: {
    default: '#212121',
    paper:   '#1a1a1a',
  },
  text: {
    primary:   '#ebebeb',
    secondary: '#e0e0e0',
  },
  primary: {
    main: '#3aafa2',
    light: '#50d2c2',
    dark: '#248c82',
    contrastText: '#fff',
    100: '#86eadc', 
    200: '#75d8cb', 
    300: '#64c6ba', 
    400: '#53b4a8', 
    500: '#42a197', 
    600: '#308f86', // dark
    700: '#1f7d74', 
    800: '#147169',
  },
  secondary: {
    main: '#3B82F6',
    light: '#60A5FA',
    dark: '#2563EB',
    contrastText: '#ffffff',
  },
  error: {
    light: '#fdecea',
    main:  '#ff3729',
    dark:  '#ba000d',
    contrastText: '#fff',
  },
  success: {
    light: '#e6f4ea',
    main:  '#118d15ff',
    dark:  '#087f23',
    contrastText: '#fff',
  },
  grey: {
    50:  '#1e1e1e',
    100: '#2c2c2c',
    200: '#3a3a3a',
    300: '#525252',
    400: '#737373',
    500: '#a3a3a3',
    600: '#d4d4d4',
    700: '#e5e5e5',
    800: '#f4f4f4',
    900: '#fafafa',
  },
};

export const lightTheme = createTheme({
  typography,
  palette: paletteLight,
});

export const darkTheme = createTheme({
  typography,
  palette: paletteDark,
  components: {
    MuiAppBar: {
      defaultProps: {
        enableColorOnDark: true,
        color: 'primary',  // or 'inherit'
      },
      styleOverrides: {
        root: {
          backgroundColor: paletteDark.background.paper,
          backgroundImage: 'none',
          boxShadow: 'none',
        },
        colorPrimary: {
          backgroundColor: paletteDark.background.paper,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: paletteDark.background.paper,
          backgroundImage: 'none',
          boxShadow: 'none',
          border: `1px solid ${paletteDark.divider}`,
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: 'none!important',
          '&:hover': { boxShadow: 'none!important' },
          border: `1px solid ${paletteDark.divider}`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: 'none!important',
          '&:hover': { boxShadow: 'none!important' },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: paletteDark.background.paper, // background color
        },
        arrow: {
          color: paletteDark.background.paper, // arrow color (same as background)
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        valueLabel: {
          backgroundColor: paletteDark.background.default,
          '& *': {
            backgroundColor: 'transparent',
          },
        },
      },
    },
}});