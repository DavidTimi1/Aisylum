import { NavLink } from "react-router-dom";
import { MessageSquare, FileEdit, LayoutDashboardIcon, CloudOffIcon, LockIcon, LanguagesIcon } from "lucide-react";
import { cn } from "@/lib/utils";


const navigation = [
    { name: "Dashboard", to: "/", icon: LayoutDashboardIcon },
    { name: "AI Chat", to: "/chat", icon: MessageSquare },
    { name: "Documents", to: "/documents", icon: FileEdit },
    { name: "Language Tools", to: "/language", icon: LanguagesIcon },
];

export const Navbar = () => {

    return (
        <aside className="fixed left-0 bottom-0 md:bottom-auto md:top-0 w-screen pb-2 md:py-2 px-15 md:bg-background/90 md:backdrop-blur-sm z-10">
            <div className="md:hidden absolute left-0 bottom-0 w-full h-8 blur-2xl bg-gradient-to-t from-foreground/50 to-background"></div>
            <div className="flex items-center justify-between md:w-full border md:border-none rounded-xl bg-background/90 backdrop-blur-sm md:bg-none md:backdrop-blur-none">
                <header className="hidden md:flex items-center gap-1 montserrat-font">
                    <div className="w-10">
                        <img src="/logo.png" alt="aisylum logo" className="w-full object-cover" />
                    </div>
                    <a className="text-lg font-bold text-foreground">
                        Aisylum
                    </a>
                </header>
                <nav className="flex w-full md:w-auto py-2 md:py-0 items-center justify-evenly gap-3">
                    {
                        navigation.map((item) => (
                            <NavItem
                                key={item.to}
                                to={item.to}
                                name={item.name}
                                icon={item.icon}
                            />
                        ))
                    }
                </nav>

                <div className="hidden md:flex items-center gap-2">
                    <CloudOffIcon className="w-4 h-4" />
                    <LockIcon className="w-4 h-4" />
                </div>

            </div>
        </aside>
    )
}

const NavItem = ({ to, name, icon: Icon }: { to: string; name: string; icon: React.ComponentType }) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                cn(
                    "flex flex-col items-center gap-1 rounded-md p-3 md:p-2 transition-colors duration-200",
                    isActive
                        ? "bg-foreground text-background"
                        : "text-foreground hover:bg-muted"
                )
            }
        >
            <Icon className="h-5 w-5" />
            <span className="hidden md:block text-xs">
                {name}
            </span>
        </NavLink>
    );
}