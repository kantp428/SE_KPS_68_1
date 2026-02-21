import ModeToggle from "@/components/mode-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";

function StaffHeader() {
  return (
    <>
      <header className="flex h-16 items-center border-b px-6 justify-between bg-background">
        <SidebarTrigger />
        <div className="font-semibold">TCM CLINIC</div>
        <div className="w-8 h-8">
          <ModeToggle />
        </div>{" "}
      </header>
    </>
  );
}

export default StaffHeader;
