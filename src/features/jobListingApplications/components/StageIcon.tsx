import { ComponentPropsWithRef } from 'react';
import { ApplicationStage } from '@/drizzle/schema';
import {
  CircleCheckIcon,
  CircleHelpIcon,
  CircleXIcon,
  HandshakeIcon,
  SpeechIcon
} from 'lucide-react';

export function StageIcon({
  stage,
  ...props
}: { stage: ApplicationStage } & ComponentPropsWithRef<typeof CircleHelpIcon>) {
  const Icon = getIcon(stage);
  return <Icon {...props} />;
}

function getIcon(stage: ApplicationStage) {
  switch (stage) {
    case 'applied':
      return CircleHelpIcon;
    case 'interested':
      return CircleCheckIcon;
    case 'rejected':
      return CircleXIcon;
    case 'interviewed':
      return SpeechIcon;
    case 'hired':
      return HandshakeIcon;
    default:
      throw new Error(`Unknown application stage: ${stage satisfies never}`);
  }
}
