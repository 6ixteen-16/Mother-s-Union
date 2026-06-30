"use client";

import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  return (
    <div key={pathname} className="page-transition min-h-full w-full flex flex-col flex-1">
      {children}
    </div>
  );
}
