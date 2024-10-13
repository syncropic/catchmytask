// useLayout.ts
// This hook manages the layout states, including determining visibility of sections and computing the color scheme based on the user’s settings.

import { useMediaQuery } from "@mantine/hooks";
import { useAppStore } from "src/store";
import { useComputedColorScheme } from "@mantine/core";

export const useLayout = () => {
  const { activeLayout, activeActionInputLayout, colorScheme } = useAppStore();
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");

  const computedColorScheme = useComputedColorScheme("light"); // Default to light theme if auto is selected
  const effectiveScheme =
    colorScheme.scheme === "auto" ? computedColorScheme : colorScheme.scheme;

  const shouldDisplayLeftSection =
    activeLayout?.leftSection?.isDisplayed && isLargeScreen;
  const shouldDisplayRightSection =
    activeLayout?.rightSection?.isDisplayed && isLargeScreen;
  const shouldDisplayActionInputLeftSection =
    activeActionInputLayout?.leftSection?.isDisplayed && isLargeScreen;
  const shouldDisplayActionInputRightSection =
    activeActionInputLayout?.rightSection?.isDisplayed && isLargeScreen;

  return {
    shouldDisplayLeftSection,
    shouldDisplayRightSection,
    shouldDisplayActionInputLeftSection,
    shouldDisplayActionInputRightSection,
    effectiveScheme,
  };
};
