"use client"

import { createTheme, ThemeProvider, CssBaseline } from "@mui/material"
import { type ReactNode, useMemo } from "react"

const getDesignTokens = (mode: "light" | "dark") => ({
  palette: {
    mode,
    ...(mode === "light"
      ? {
          primary: {
            main: "#0ea5e9",
            light: "#38bdf8",
            dark: "#0284c7",
            contrastText: "#fff",
          },
          secondary: {
            main: "#ec4899",
            light: "#f472b6",
            dark: "#db2777",
            contrastText: "#fff",
          },
          background: {
            default: "#f8fafc",
            paper: "#ffffff",
          },
          text: {
            primary: "#0f172a",
            secondary: "#64748b",
          },
        }
      : {
          primary: {
            main: "#22d3ee",
            light: "#67e8f9",
            dark: "#06b6d4",
            contrastText: "#0c0a09",
          },
          secondary: {
            main: "#f472b6",
            light: "#f9a8d4",
            dark: "#ec4899",
            contrastText: "#fff",
          },
          background: {
            default: "#0c0a09",
            paper: "#1c1917",
          },
          text: {
            primary: "#f8fafc",
            secondary: "#94a3b8",
          },
        }),
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: "Geist, system-ui, -apple-system, sans-serif",
    h1: {
      fontWeight: 700,
      fontSize: "3.5rem",
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: "2.5rem",
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: "2rem",
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.5rem",
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.25rem",
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 600,
      fontSize: "1rem",
      lineHeight: 1.5,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shadows: [
    "none",
    "0px 2px 4px rgba(0,0,0,0.05)",
    "0px 4px 8px rgba(0,0,0,0.08)",
    "0px 8px 16px rgba(0,0,0,0.1)",
    "0px 12px 24px rgba(0,0,0,0.12)",
    "0px 16px 32px rgba(0,0,0,0.14)",
    "0px 20px 40px rgba(0,0,0,0.16)",
    "0px 24px 48px rgba(0,0,0,0.18)",
    "0px 28px 56px rgba(0,0,0,0.2)",
    ...Array(16).fill("none"),
  ] as any,
})

export function MUIThemeProvider({ children }: { children: ReactNode }) {
  const theme = useMemo(() => createTheme(getDesignTokens("dark")), [])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
