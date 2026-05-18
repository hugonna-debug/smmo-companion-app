import {
  Brain,
  Crosshair,
  LayoutDashboard,
  MoreHorizontal,
  Settings,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/pvp-assistant", label: "PvP", icon: Crosshair },
  { href: "/market", label: "Market", icon: MoreHorizontal },
  { href: "/advisor", label: "Advisor", icon: Brain },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      {navItems.map(item => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.href}
            to={item.href}
            className={`bottom-nav-item ${isActive ? "active" : ""}`}
          >
            <item.icon className="size-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
