import { Outlet } from "react-router-dom";
import { Navbar } from "./navbar";
import { CustomTooltip } from "./ui/tooltip";
import { CloudOffIcon } from "lucide-react";
import { useOnlineStatus } from "@/hooks/use-online";
import { useIsMobile } from "@/hooks/use-mobile";

export function AppLayout() {
  const isOnline = useOnlineStatus();
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col w-full bg-background">
      <Navbar />
      <main className="flex-1 pb-20 md:py-20 md:pb-0 ">
        {
          !isOnline && isMobile && (
            <div className="fixed top-5 right-5">
              <CustomTooltip
                Trigger={<CloudOffIcon className="w-5 h-5" />}
              >
                You are offline currently
              </CustomTooltip>
            </div>
          )
        }
        <Outlet />
      </main>
    </div>
  );
}
