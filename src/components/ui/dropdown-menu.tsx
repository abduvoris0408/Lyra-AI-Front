"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Root — `modal={false}` standart sifatida.
 * Radix modal rejimi `document.body` ga `pointer-events: none` qo'yadi va
 * mobil/iOS'da menyu yopilganda buni ba'zan tozalamay qoladi — natijada
 * butun sahifa bosilmaydigan bo'lib qoladi. Non-modal bu muammoni yo'qotadi.
 */
export function DropdownMenu(
  props: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root>,
) {
  return <DropdownMenuPrimitive.Root modal={false} {...props} />;
}
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuSub = DropdownMenuPrimitive.Sub;

export function DropdownMenuSubTrigger({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger>) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      className={cn(
        "flex w-full cursor-pointer select-none items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink outline-none transition focus:bg-elevated data-[state=open]:bg-elevated",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRight size={15} className="ml-auto text-muted" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

export function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.SubContent
        className={cn(
          "z-50 min-w-[10rem] overflow-hidden rounded-xl border border-line bg-surface p-1.5 shadow-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export function DropdownMenuContent({
  className,
  sideOffset = 8,
  align = "start",
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        align={align}
        className={cn(
          "z-50 min-w-[12rem] overflow-hidden rounded-xl border border-line bg-surface p-1.5 shadow-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1",
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export function DropdownMenuItem({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        "relative flex w-full cursor-pointer select-none items-start gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-ink outline-none transition focus:bg-elevated data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuLabel({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>) {
  return (
    <DropdownMenuPrimitive.Label
      className={cn("px-3 py-1.5 text-xs font-medium text-muted", className)}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn("my-1 h-px bg-line", className)}
      {...props}
    />
  );
}

/** Tanlangan holatni ko'rsatadigan belgi (model selektori uchun). */
export function DropdownCheck({ active }: { active: boolean }) {
  return (
    <Check
      size={16}
      className={cn(
        "mt-0.5 shrink-0 text-accent",
        active ? "opacity-100" : "opacity-0",
      )}
    />
  );
}
