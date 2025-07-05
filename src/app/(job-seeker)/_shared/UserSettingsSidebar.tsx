import SidebarNavMenuGroup from '@/components/sidebar/SidebarNavMenuGroup';
import { BellIcon, FileIcon } from 'lucide-react';

export default function UserSettingsSidebar() {
  return (
    <SidebarNavMenuGroup
      items={[
        {
          href: '/user-settings/notifications',
          label: 'Notifications',
          icon: <BellIcon />
        },
        {
          href: '/user-settings/resume',
          label: 'Resume',
          icon: <FileIcon />
        }
      ]}
    />
  );
}
