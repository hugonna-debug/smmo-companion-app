import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import {
  Crosshair,
  Eye,
  LayoutDashboard,
  Lock,
  LogOut,
  Package,
  Settings,
  Shield,
  ShoppingCart,
  Skull,
  Swords,
  Timer,
  Trophy,
  Users,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";

const mainNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

const gameNav = [
  { href: "/pvp", label: "Guild PvP", icon: Swords },
  { href: "/pvp-assistant", label: "PvP Assistant", icon: Crosshair },
  { href: "/guild", label: "Guild Hub", icon: Users },
  { href: "/bosses", label: "World Bosses", icon: Skull },
  { href: "/buffs", label: "Active Modifiers", icon: Timer },
  { href: "/equipment", label: "Equipment", icon: Shield },
  { href: "/market", label: "Market Tracker", icon: ShoppingCart },
  { href: "/items", label: "Item Tracker", icon: Package },
  { href: "/vault", label: "Vault", icon: Lock },
  { href: "/collection", label: "Collection", icon: Trophy },
  { href: "/watchlist", label: "Watchlist", icon: Eye },
];

function NavLink({
  href,
  label,
  icon: Icon,
  isActive,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
}) {
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link to={href} onClick={() => setOpenMobile(false)}>
          <Icon className="size-4" />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function SidebarNav() {
  const location = useLocation();

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel className="text-gold-dim text-[10px] uppercase tracking-widest">
          Overview
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {mainNav.map(item => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={location.pathname === item.href}
              />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel className="text-gold-dim text-[10px] uppercase tracking-widest">
          Game Tools
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {gameNav.map(item => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={location.pathname === item.href}
              />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}

function SidebarUserMenu() {
  const user = useQuery(api.auth.currentUser);
  const { signOut } = useAuthActions();
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarFooter className="border-t border-sidebar-border">
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg">
                <Avatar className="size-7">
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-left">
                  <span className="text-xs font-medium truncate">
                    {user?.name || "Adventurer"}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    {user?.email}
                  </span>
                </div>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="start"
              className="w-[--radix-dropdown-menu-trigger-width]"
            >
              <DropdownMenuItem asChild>
                <Link to="/settings" onClick={() => setOpenMobile(false)}>
                  <Settings className="size-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut()}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <LogOut className="size-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}

function SidebarHeaderContent() {
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarHeader className="border-b border-sidebar-border">
      <Link
        to="/"
        onClick={() => setOpenMobile(false)}
        className="flex items-center gap-2 px-2 py-1"
      >
        <div className="size-7 rounded-md bg-primary/20 flex items-center justify-center">
          <span className="text-primary font-bold text-sm">⚔️</span>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm text-gold">SMMO</span>
          <span className="text-[10px] text-muted-foreground -mt-0.5">
            Companion
          </span>
        </div>
      </Link>
    </SidebarHeader>
  );
}

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeaderContent />
      <SidebarNav />
      <SidebarUserMenu />
    </Sidebar>
  );
}
