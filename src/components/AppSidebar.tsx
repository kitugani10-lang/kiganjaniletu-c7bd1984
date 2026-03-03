import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { NavLink } from '@/components/NavLink';
import { CATEGORIES } from '@/lib/categories';
import { Home, Bookmark, LogOut, LogIn, Mail } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { toast } from 'sonner';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel,
  SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from '@/components/ui/sidebar';

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const handleContact = () => {
    if (!user) { toast.error('Please sign in to see contact info'); return; }
    navigator.clipboard.writeText('support@kanisakiganjani.com');
    toast.success('Email copied: support@kanisakiganjani.com');
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/" end className="hover:bg-muted/50" activeClassName="bg-muted text-primary font-medium">
                    <Home className="mr-2 h-4 w-4" />
                    {!collapsed && <span>Home</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Categories</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {CATEGORIES.map(cat => (
                <SidebarMenuItem key={cat.slug}>
                  <SidebarMenuButton asChild>
                    <NavLink to={`/category/${cat.slug}`} className="hover:bg-muted/50" activeClassName="bg-muted text-primary font-medium">
                      <cat.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{cat.label}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {user ? (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink to="/bookmarks" className="hover:bg-muted/50" activeClassName="bg-muted text-primary font-medium">
                        <Bookmark className="mr-2 h-4 w-4" />
                        {!collapsed && <span>Bookmarks</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <button onClick={handleContact} className="flex w-full items-center hover:bg-muted/50 px-2 py-1.5 rounded-md text-sm">
                        <Mail className="mr-2 h-4 w-4" />
                        {!collapsed && <span>Contact Us</span>}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <button onClick={signOut} className="flex w-full items-center hover:bg-muted/50 px-2 py-1.5 rounded-md text-sm">
                        <LogOut className="mr-2 h-4 w-4" />
                        {!collapsed && <span>Logout</span>}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              ) : (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/auth" className="hover:bg-muted/50" activeClassName="bg-muted text-primary font-medium">
                      <LogIn className="mr-2 h-4 w-4" />
                      {!collapsed && <span>Sign In / Register</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <ThemeToggle collapsed={collapsed} />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
