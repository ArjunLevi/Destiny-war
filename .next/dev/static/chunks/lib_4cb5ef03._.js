(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/theme/index.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MUIThemeProvider",
    ()=>MUIThemeProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$styles$2f$createTheme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__createTheme$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/styles/createTheme.js [app-client] (ecmascript) <export default as createTheme>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$styles$2f$ThemeProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ThemeProvider$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/styles/ThemeProvider.js [app-client] (ecmascript) <export default as ThemeProvider>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$CssBaseline$2f$CssBaseline$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CssBaseline$3e$__ = __turbopack_context__.i("[project]/node_modules/@mui/material/esm/CssBaseline/CssBaseline.js [app-client] (ecmascript) <export default as CssBaseline>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const getDesignTokens = (mode)=>({
        palette: {
            mode,
            ...mode === "light" ? {
                primary: {
                    main: "#0ea5e9",
                    light: "#38bdf8",
                    dark: "#0284c7",
                    contrastText: "#fff"
                },
                secondary: {
                    main: "#ec4899",
                    light: "#f472b6",
                    dark: "#db2777",
                    contrastText: "#fff"
                },
                background: {
                    default: "#f8fafc",
                    paper: "#ffffff"
                },
                text: {
                    primary: "#0f172a",
                    secondary: "#64748b"
                }
            } : {
                primary: {
                    main: "#22d3ee",
                    light: "#67e8f9",
                    dark: "#06b6d4",
                    contrastText: "#0c0a09"
                },
                secondary: {
                    main: "#f472b6",
                    light: "#f9a8d4",
                    dark: "#ec4899",
                    contrastText: "#fff"
                },
                background: {
                    default: "#0c0a09",
                    paper: "#1c1917"
                },
                text: {
                    primary: "#f8fafc",
                    secondary: "#94a3b8"
                }
            }
        },
        shape: {
            borderRadius: 12
        },
        typography: {
            fontFamily: "Geist, system-ui, -apple-system, sans-serif",
            h1: {
                fontWeight: 700,
                fontSize: "3.5rem",
                lineHeight: 1.2
            },
            h2: {
                fontWeight: 700,
                fontSize: "2.5rem",
                lineHeight: 1.3
            },
            h3: {
                fontWeight: 600,
                fontSize: "2rem",
                lineHeight: 1.4
            },
            h4: {
                fontWeight: 600,
                fontSize: "1.5rem",
                lineHeight: 1.4
            },
            h5: {
                fontWeight: 600,
                fontSize: "1.25rem",
                lineHeight: 1.5
            },
            h6: {
                fontWeight: 600,
                fontSize: "1rem",
                lineHeight: 1.5
            },
            button: {
                textTransform: "none",
                fontWeight: 600
            }
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
            ...Array(16).fill("none")
        ]
    });
function MUIThemeProvider({ children }) {
    _s();
    const theme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "MUIThemeProvider.useMemo[theme]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$styles$2f$createTheme$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__createTheme$3e$__["createTheme"])(getDesignTokens("dark"))
    }["MUIThemeProvider.useMemo[theme]"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$styles$2f$ThemeProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ThemeProvider$3e$__["ThemeProvider"], {
        theme: theme,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mui$2f$material$2f$esm$2f$CssBaseline$2f$CssBaseline$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CssBaseline$3e$__["CssBaseline"], {}, void 0, false, {
                fileName: "[project]/lib/theme/index.tsx",
                lineNumber: 114,
                columnNumber: 7
            }, this),
            children
        ]
    }, void 0, true, {
        fileName: "[project]/lib/theme/index.tsx",
        lineNumber: 113,
        columnNumber: 5
    }, this);
}
_s(MUIThemeProvider, "TF0AHbRu8DO10P/SWtT0KIxHEhc=");
_c = MUIThemeProvider;
var _c;
__turbopack_context__.k.register(_c, "MUIThemeProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/farcaster/auth-provider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FarcasterAuthProvider",
    ()=>FarcasterAuthProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$farcaster$2f$auth$2d$kit$2f$dist$2f$auth$2d$kit$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@farcaster/auth-kit/dist/auth-kit.js [app-client] (ecmascript) <locals>");
"use client";
;
;
function FarcasterAuthProvider({ children }) {
    const config = {
        rpcUrl: "https://mainnet.base.org",
        domain: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_DOMAIN || "destinywar.app",
        siweUri: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_SIWE_URI || "https://destinywar.app/login"
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$farcaster$2f$auth$2d$kit$2f$dist$2f$auth$2d$kit$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["AuthKitProvider"], {
        config: config,
        children: children
    }, void 0, false, {
        fileName: "[project]/lib/farcaster/auth-provider.tsx",
        lineNumber: 17,
        columnNumber: 10
    }, this);
}
_c = FarcasterAuthProvider;
var _c;
__turbopack_context__.k.register(_c, "FarcasterAuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/farcaster/miniapp-provider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FarcasterMiniAppProvider",
    ()=>FarcasterMiniAppProvider,
    "sendNotification",
    ()=>sendNotification,
    "useFarcasterContext",
    ()=>useFarcasterContext
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$farcaster$2f$frame$2d$sdk$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@farcaster/frame-sdk/dist/index.js [app-client] (ecmascript) <locals>");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
function FarcasterMiniAppProvider({ children }) {
    _s();
    const [isReady, setIsReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [context, setContext] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FarcasterMiniAppProvider.useEffect": ()=>{
            const initFarcaster = {
                "FarcasterMiniAppProvider.useEffect.initFarcaster": async ()=>{
                    try {
                        // Initialize the Farcaster SDK
                        const farcasterContext = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$farcaster$2f$frame$2d$sdk$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["sdk"].context;
                        // Get user information if available
                        if (farcasterContext?.user) {
                            console.log("[v0] Farcaster user detected:", farcasterContext.user);
                            setContext(farcasterContext);
                        }
                        // Signal that the app is ready
                        await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$farcaster$2f$frame$2d$sdk$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["sdk"].actions.ready();
                        setIsReady(true);
                        console.log("[v0] Farcaster Mini App initialized");
                    } catch (error) {
                        console.error("[v0] Failed to initialize Farcaster Mini App:", error);
                        // If not in Farcaster, continue normally
                        setIsReady(true);
                    }
                }
            }["FarcasterMiniAppProvider.useEffect.initFarcaster"];
            initFarcaster();
        }
    }["FarcasterMiniAppProvider.useEffect"], []);
    if (!isReady) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                background: "#000",
                color: "#00ffff"
            },
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    textAlign: "center"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    children: "Loading Destiny War..."
                }, void 0, false, {
                    fileName: "[project]/lib/farcaster/miniapp-provider.tsx",
                    lineNumber: 51,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/lib/farcaster/miniapp-provider.tsx",
                lineNumber: 50,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/lib/farcaster/miniapp-provider.tsx",
            lineNumber: 40,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false);
}
_s(FarcasterMiniAppProvider, "wjvvVng94LtNOfjdq8FHy1I2UoU=");
_c = FarcasterMiniAppProvider;
function useFarcasterContext() {
    _s1();
    const [context, setContext] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useFarcasterContext.useEffect": ()=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$farcaster$2f$frame$2d$sdk$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["sdk"].context.then({
                "useFarcasterContext.useEffect": (ctx)=>setContext(ctx)
            }["useFarcasterContext.useEffect"]).catch({
                "useFarcasterContext.useEffect": ()=>setContext(null)
            }["useFarcasterContext.useEffect"]);
        }
    }["useFarcasterContext.useEffect"], []);
    return context;
}
_s1(useFarcasterContext, "ztvb7hV9oniuJGQKZiqfN+TZ/Dc=");
async function sendNotification(title, body) {
    try {
        await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$farcaster$2f$frame$2d$sdk$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["sdk"].actions.openUrl(`https://warpcast.com/~/compose?text=${encodeURIComponent(body)}`);
    } catch (error) {
        console.error("[v0] Failed to send notification:", error);
    }
}
var _c;
__turbopack_context__.k.register(_c, "FarcasterMiniAppProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=lib_4cb5ef03._.js.map