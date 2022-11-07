import { createTheme, PaletteMode, PaletteOptions, ThemeOptions } from '@mui/material'
import * as Changes from './changes.js'
import * as Components from './component-changes.js'
import { merge } from 'lodash-es'
import { DarkColor, LightColor, Color } from '../../CSSVariables/index.js'
import { MaskColors } from '../colors.js'

/**
 * TODO: Remove this and css color var after the dashboard be removed.
 */
const color = (mode: PaletteMode, color: Color): PaletteOptions => ({
    mode,
    primary: { main: color.primary, contrastText: color.primaryContrastText },
    secondary: { main: color.primary, contrastText: color.primaryContrastText },
    background: { paper: color.primaryBackground, default: color.secondaryBackground },
    error: { main: color.redMain, contrastText: color.redContrastText },
    success: { main: color.greenMain },
    warning: { main: color.orangeMain },
    divider: color.divider,
    text: { primary: color.textPrimary, secondary: color.textSecondary },
})

function DashboardTheme(mode: PaletteMode) {
    const colors = mode === 'dark' ? DarkColor : LightColor
    const maskColors = MaskColors[mode]

    const theme = merge(
        { palette: { ...color(mode, colors), maskColor: maskColors.maskColor } } as ThemeOptions,
        ...Object.values(Changes).map(applyColors),
        ...Object.values(Components).map(applyColors),
    )
    return createTheme(theme)
    function applyColors(x: any) {
        if (typeof x === 'function') return x(mode, colors)
        return x
    }
}
export const DashboardLightTheme = DashboardTheme('light')
export const DashboardDarkTheme = DashboardTheme('dark')
