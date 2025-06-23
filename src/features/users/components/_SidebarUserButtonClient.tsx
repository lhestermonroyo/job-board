'use client';

import Link from 'next/link';
import { SignOutButton, useClerk } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { SidebarMenuButton, useSidebar } from '@/components/ui/sidebar';
import {
  ChevronsUpDown,
  LogOutIcon,
  SettingsIcon,
  UserIcon
} from 'lucide-react';

type UserProps = {
  email: string;
  name: string;
  imageUrl?: string;
};

export default function SidebarUserButtonClient({ user }: { user: UserProps }) {
  const { isMobile, setOpen } = useSidebar();
  const { openUserProfile } = useClerk();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <UserInfo {...user} />
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
          <UserInfo {...user} />
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            openUserProfile();
            setOpen(false); // Close the dropdown after opening profile
          }}
        >
          <UserIcon className="mr-1" /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/user/settings/notifications">
            <SettingsIcon className="mr-1" /> Notifications
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

function UserInfo({ email, name, imageUrl }: UserProps) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((str) => str.charAt(0))
    .join('');

  return (
    <div className="flex items-center gap-2 overflow-hidden">
      <Avatar className="rounded-lg size-8">
        <AvatarImage src={imageUrl} alt={name} />
        <AvatarFallback className="uppercase bg-primary text-primary-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col flex-1 min-w-0 leading-tight group-data-[state=collapese]:hidden">
        <span className="truncate text-sm font-semibold">{name}</span>
        <span className="truncate text-xs">{email}</span>
      </div>
    </div>
  );
}
