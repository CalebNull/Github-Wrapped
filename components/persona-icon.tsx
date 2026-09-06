import {
  BoatIcon,
  BriefcaseIcon,
  CompassIcon,
  FlameIcon,
  GhostIcon,
  LightningIcon,
  MagnifyingGlassIcon,
  PawPrintIcon,
  PersonSimpleRunIcon,
  TargetIcon,
  TentIcon,
  TranslateIcon,
} from "@phosphor-icons/react/dist/ssr"
import type { Icon, IconProps } from "@phosphor-icons/react/dist/lib/types"
import type { PersonaIcon as PersonaIconName } from "@/lib/persona"

const ICONS: Record<PersonaIconName, Icon> = {
  GhostIcon,
  MagnifyingGlassIcon,
  BoatIcon,
  PawPrintIcon,
  TranslateIcon,
  TargetIcon,
  FlameIcon,
  TentIcon,
  BriefcaseIcon,
  LightningIcon,
  PersonSimpleRunIcon,
  CompassIcon,
}

export function PersonaIcon({
  name,
  ...props
}: { name: PersonaIconName } & IconProps) {
  const Icon = ICONS[name]
  return <Icon {...props} />
}
