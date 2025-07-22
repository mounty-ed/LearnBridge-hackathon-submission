'use client';

import { createTheme, ThemeProvider } from '@mui/material/styles';

const typography = {
  fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`,
}

const paletteLight = {
  mode: 'light' as const,
  divider: 'hsl(0, 0%, 80%)',
  background: {
    default: 'hsl(0, 0%, 94%)',
    paper: 'hsl(0, 0%, 96%)',
    light: 'hsl(0, 0%, 98%)'
  },
  text: {
    secondary: 'hsl(0, 0%, 20%)',
    primary: 'hsl(0, 0%, 5%)',
  },
  primary: {
    main: 'hsl(173, 50%, 46%)',
    light: 'hsl(172, 56%, 60%)',
    dark: 'hsl(173, 56%, 34%)',
    contrastText: 'hsl(0, 0%, 100%)',
    100: 'hsl(173, 60%, 75%)',
    200: 'hsl(173, 50%, 66%)',
    300: 'hsl(173, 45%, 58%)',
    400: 'hsl(173, 40%, 51%)',
    500: 'hsl(173, 38%, 45%)',
    600: 'hsl(173, 49%, 37%)',
    700: 'hsl(173, 59%, 30%)',
    800: 'hsl(174, 66%, 25%)',
  },
  secondary: {
    main: 'hsl(217, 91%, 60%)',
    light: 'hsl(217, 94%, 67%)',
    dark: 'hsl(223, 83%, 53%)',
    contrastText: 'hsl(0, 0%, 100%)',
  },
  error: {
    light: 'hsl(6, 85%, 95%)',
    main: 'hsl(4, 100%, 57%)',
    dark: 'hsl(0, 100%, 36%)',
    contrastText: 'hsl(0, 0%, 100%)',
  },
  success: {
    light: 'hsl(132, 35%, 93%)',
    main: 'hsl(122, 77%, 31%)',
    dark: 'hsl(131, 82%, 26%)',
    contrastText: 'hsl(0, 0%, 100%)',
  },
  grey: {
    50: 'hsl(0, 0%, 95%)',
    100: 'hsl(0, 0%, 91%)',
    200: 'hsl(0, 0%, 86%)',
    300: 'hsl(0, 0%, 78%)',
    400: 'hsl(0, 0%, 63%)',
    500: 'hsl(0, 0%, 44%)',
    600: 'hsl(0, 0%, 31%)',
    700: 'hsl(0, 0%, 22%)',
    800: 'hsl(0, 0%, 16%)',
    900: 'hsl(0, 0%, 11%)',
  },
};


const paletteDark = {
  mode: 'dark' as const,
  divider: 'hsl(0, 0%, 20%)',
  background: {
    default: 'hsl(0, 0%, 5%)',
    paper: 'hsl(0, 0%, 0%)',
    light: 'hsl(0, 0%, 9%)'
  },
  text: {
    primary: 'hsl(0, 0%, 90%)',
    secondary: 'hsl(0, 0%, 75%)',
  },
  primary: {
    main: 'hsl(173, 50%, 46%)',
    light: 'hsl(172, 56%, 60%)',
    dark: 'hsl(173, 56%, 34%)',
    contrastText: 'hsl(0, 0%, 100%)',
    100: 'hsl(173, 60%, 75%)',
    200: 'hsl(173, 50%, 66%)',
    300: 'hsl(173, 45%, 58%)',
    400: 'hsl(173, 40%, 51%)',
    500: 'hsl(173, 38%, 45%)',
    600: 'hsl(173, 49%, 37%)',
    700: 'hsl(173, 59%, 30%)',
    800: 'hsl(174, 66%, 25%)',
  },
  secondary: {
    main: 'hsl(217, 91%, 60%)',
    light: 'hsl(217, 94%, 67%)',
    dark: 'hsl(223, 83%, 53%)',
    contrastText: 'hsl(0, 0%, 100%)',
  },
  error: {
    light: 'hsl(6, 85%, 95%)',
    main: 'hsl(4, 100%, 57%)',
    dark: 'hsl(0, 100%, 36%)',
    contrastText: 'hsl(0, 0%, 100%)',
  },
  success: {
    light: 'hsl(132, 35%, 93%)',
    main: 'hsl(122, 77%, 31%)',
    dark: 'hsl(131, 82%, 26%)',
    contrastText: 'hsl(0, 0%, 100%)',
  },
  grey: {
    50: 'hsl(0, 0%, 12%)',
    100: 'hsl(0, 0%, 17%)',
    200: 'hsl(0, 0%, 23%)',
    300: 'hsl(0, 0%, 32%)',
    400: 'hsl(0, 0%, 45%)',
    500: 'hsl(0, 0%, 64%)',
    600: 'hsl(0, 0%, 83%)',
    700: 'hsl(0, 0%, 90%)',
    800: 'hsl(0, 0%, 96%)',
    900: 'hsl(0, 0%, 98%)',
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
        color: 'primary',
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
          backgroundColor: paletteDark.background.paper,
        },
        arrow: {
          color: paletteDark.background.paper,
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