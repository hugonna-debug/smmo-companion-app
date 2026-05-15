import { LayoutDashboard, Settings, Skull, Swords, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/pvp", label: "PvP", icon: Swords },
  { href: "/guild", label: "Guild", icon: Users },
  { href: "/bosses", label: "Bosses", icon: Skull },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
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
