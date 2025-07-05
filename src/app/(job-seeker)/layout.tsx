import { Fragment, ReactNode } from 'react';
import {
  BrainCircuitIcon,
  ClipboardListIcon,
  LayoutDashboard,
  LogInIcon
} from 'lucide-react';
import AppSidebar from '@/components/sidebar/AppSidebar';
import SidebarUserButton from '@/features/users/components/SidebarUserButton';
import SidebarNavMenuGroup from '@/components/sidebar/SidebarNavMenuGroup';

export default function JobSeekerLayout({
  children,
  sidebar
}: {
  children: ReactNode;
  sidebar: ReactNode;
}) {
  const navItems = [
    {
      href: '/',
      icon: <ClipboardListIcon />,
      label: 'Job Board'
    },
    {
      href: '/ai-search',
      icon: <BrainCircuitIcon />,
      label: 'AI Search'
    },
    {
      href: '/employer',
      icon: <LayoutDashboard />,
      label: 'Employer Dashboard',
      authStatus: 'signedIn' as 'signedIn'
    },
    {
      href: '/sign-in',
      icon: <LogInIcon />,
      label: 'Sign In',
      authStatus: 'signedOut' as 'signedOut'
    }
  ];

  return (
    <AppSidebar
      content={
        <Fragment>
          {sidebar}
          <SidebarNavMenuGroup className="mt-auto" items={navItems} />
        </Fragment>
      }
      footerButton={<SidebarUserButton />}
    >
      {children}
    </AppSidebar>
  );
}
