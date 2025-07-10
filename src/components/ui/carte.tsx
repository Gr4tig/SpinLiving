import React from "react";
import { cn } from "@/lib/utils";

type CarteProps = {
  icon?: React.ReactNode;
  title: string;
  text: string;
  className?: string;
  bg?: string;
  border?: string;
  rounded?: string;
};

export function Carte({
  icon,
  title,
  text,
  className = "",
  bg = "bg-white/5",
  border = "border-1 border-white/10",
  rounded = "rounded-lg",
}: CarteProps) {
  return (
    <div className={cn("p-8 shadow flex flex-col items-start text-start", bg, border, rounded, className)}>
      {icon && <div className="mb-4 text-primary">{icon}</div>}
      <h3 className="font-bold text-xl mb-4">{title}</h3>
      <p className="font-light text-base text-white/50">{text}</p>
    </div>
  );
}