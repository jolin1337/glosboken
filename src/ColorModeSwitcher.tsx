import {
  Text,
  useColorMode,
  useColorModeValue,
  IconButton,
  IconButtonProps,
} from "@chakra-ui/react"
import {forwardRef} from "react";
import { FaMoon, FaSun } from "react-icons/fa"

type ColorModeSwitcherProps = Omit<IconButtonProps, "aria-label">

export const ColorModeSwitcher = forwardRef((props: ColorModeSwitcherProps, ref) => {
  const { toggleColorMode } = useColorMode()
  const text = useColorModeValue("dark", "light")
  const SwitchIcon = useColorModeValue(FaMoon, FaSun)

  return (<Text onClick={toggleColorMode}>
    <IconButton
      ref={ref}
      size="md"
      fontSize="lg"
      variant="ghost"
      color="current"
      marginLeft="2"
      icon={<SwitchIcon />}
      aria-label={`Switch to ${text} mode`}
      {...props}
    />
  </Text>)
});
