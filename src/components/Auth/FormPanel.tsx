import type { ReactNode } from "react";

export const FormPanel = ({ children }: { children: ReactNode }) => (
  <div className="w-full md:flex-1 px-6 py-10 md:px-12 md:py-16 flex flex-col justify-center">
    <div className="w-full max-w-md mx-auto">
      {children}
    </div>
  </div>
);
