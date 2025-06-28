'use client';

import Link from 'next/link';
import { SignOutButton, useClerk } from '@clerk/nextjs';
import {
  ArrowLeftRightIcon,
  Building2Icon,
  ChevronsUpDown,
  CreditCardIcon,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
  UserRoundCogIcon
} from 'lucide-react';
import { SidebarMenuButton, useSidebar } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type UserProps = {
  email: string;
};

type OrganizationProps = {
  name: string;
  imageUrl: string | null;
};

export default function SidebarOrganizationButtonClient({
  user,
  organization
}: {
  user: UserProps;
  organization: OrganizationProps;
}) {
  const { isMobile, setOpenMobile } = useSidebar();
  const { openUserProfile } = useClerk();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <OrganizationInfo user={user} organization={organization} />
          <ChevronsUpDown className="ml-auto group-data-[state=collapsed]:hidden" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        sideOffset={4}
        align="end"
        side={isMobile ? 'bottom' : 'right'}
        className="min-w-60 max-w-70"
      >
        <DropdownMenuLabel className="font-normal p-1">
          <OrganizationInfo user={user} organization={organization} />
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            openUserProfile();
            setOpenMobile(false); // Close the dropdown after opening profile
          }}
        >
          <Building2Icon className="mr-1" /> Manage Organization
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/employer/user-settings">
            <UserRoundCogIcon className="mr-1" /> User Notifications
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/employer/pricing">
            <CreditCardIcon className="mr-1" /> Change Plan
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/organizations/select">
            <ArrowLeftRightIcon className="mr-1" /> Switch Organizations
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <SignOutButton>
          <DropdownMenuItem>
            <LogOutIcon className="mr-1" /> Log Out
          </DropdownMenuItem>
        </SignOutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function OrganizationInfo({
  organization,
  user
}: {
  organization: OrganizationProps;
  user: UserProps;
}) {
  const initials = organization.name
    .split(' ')
    .slice(0, 2)
    .map((str) => str.charAt(0))
    .join('');

  return (
    <div className="flex items-center gap-2 overflow-hidden">
      <Avatar className="rounded-lg size-8">
        <AvatarImage
          src={organization.imageUrl ?? undefined}
          alt={organization.name}
        />
        <AvatarFallback className="uppercase bg-primary text-primary-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col flex-1 min-w-0 leading-tight group-data-[state=collapese]:hidden">
        <span className="truncate text-sm font-semibold">
          {organization.name}
        </span>
        <span className="truncate text-xs">{user.email}</span>
      </div>
    </div>
  );
}
