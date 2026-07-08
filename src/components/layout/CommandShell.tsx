import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

export function CommandShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#050505] text-stone-100">
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(120,83,30,0.10),transparent_30%),linear-gradient(180deg,#050505_0%,#080808_45%,#11100c_100%)]" />
            <div className="fixed inset-0 -z-10 bg-[linear-gradient(rgba(212,175,55,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.025)_1px,transparent_1px)] bg-[size:56px_56px]" />

            <div className="flex min-h-screen">
                <Sidebar />

                <div className="flex min-h-screen flex-1 flex-col">
                    <TopBar />
                    <div className="flex-1 px-5 py-6 md:px-8 lg:px-10">{children}</div>
                </div>
            </div>
        </div>
    );
}