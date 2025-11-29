// Adaptación del Sidebar visual avanzado de la plataforma visual
import * as React from 'react';
import { cn } from '../../lib/utils';
import { Slot } from '@radix-ui/react-slot';

export const SidebarGroup = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  function SidebarGroup({ className, ...props }, ref) {
    return (
      <div ref={ref} className={cn('relative flex w-full min-w-0 flex-col p-2', className)} {...props} />
    );
  }
);

export const SidebarGroupLabel = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'> & { asChild?: boolean }>(
  function SidebarGroupLabel({ className, asChild = false, ...props }, ref) {
    const Comp = asChild ? Slot : 'div';
    return (
      <Comp
        ref={ref}
        data-sidebar="group-label"
        className={cn('duration-200 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opa] ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0', className)}
        {...props}
      />
    );
  }
);

export const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  function SidebarGroupContent({ className, ...props }, ref) {
    return (
      <div ref={ref} data-sidebar="group-content" className={cn('w-full text-sm', className)} {...props} />
    );
  }
);

export const SidebarMenu = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(
  function SidebarMenu({ className, ...props }, ref) {
    return (
      <ul ref={ref} data-sidebar="menu" className={cn('flex w-full min-w-0 flex-col gap-1', className)} {...props} />
    );
  }
);

export const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(
  function SidebarMenuItem({ className, ...props }, ref) {
    return (
      <li ref={ref} data-sidebar="menu-item" className={cn('group/menu-item relative', className)} {...props} />
    );
  }
);

export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, React.ComponentProps<'button'> & { asChild?: boolean }>(
  function SidebarMenuButton({ asChild = false, className, ...props }, ref) {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        data-sidebar="menu-button"
        className={cn('peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0', className)}
        {...props}
      />
    );
  }
);
