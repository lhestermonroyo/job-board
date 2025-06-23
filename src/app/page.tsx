import { Suspense } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { LogInIcon } from 'lucide-react';
import { AppSidebarClient } from './_AppSidebarClient';
import { SignedIn, SignedOut } from '@/services/clerk/components/SignInStatus';
import { SidebarUserButton } from '@/features/users/components/SidebarUserButton';

export default function HomePage() {
  return (
    <SidebarProvider className="overflow-y-hidden">
      <AppSidebarClient>
        <Sidebar collapsible="icon" className="overflow-hidden">
          <SidebarHeader className="flex-row">
            <SidebarTrigger />
            <span className="text-xl text-wrap">JobPilot</span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                <Suspense>
                  <SignedOut>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="sign-in">
                          <LogInIcon />
                          <span>Log In</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SignedOut>
                </Suspense>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SignedIn>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarUserButton />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </SignedIn>
        </Sidebar>
        <main className="flex-1">Content</main>
      </AppSidebarClient>
    </SidebarProvider>
  );
}
