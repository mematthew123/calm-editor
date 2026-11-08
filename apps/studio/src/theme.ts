import {fonts, palette} from '@calm/tokens'
import {buildTheme} from '@sanity/themer'

/**
 * A light touch: the Studio keeps Sanity UI's layout but takes on the Writing Room's
 * paper, warm neutrals, clay accent and UI typeface, so moving between them isn't a jolt.
 */
const colors = buildTheme({
  light: {accent: palette.light.accent, text: palette.light.inkMuted, background: palette.light.paper},
  dark: {accent: palette.dark.accent, text: '#8F8478', background: palette.dark.paper},
})

type ThemeFonts = ReturnType<typeof buildTheme>['fonts']

function withUiFont(font: ThemeFonts): ThemeFonts {
  return {
    ...font,
    text: {...font.text, family: fonts.ui},
    heading: {...font.heading, family: fonts.ui},
    label: {...font.label, family: fonts.ui},
  }
}

export const theme = {
  ...colors,
  fonts: withUiFont(colors.fonts),
  ...(colors.v2 && {v2: {...colors.v2, font: withUiFont(colors.v2.font)}}),
}
