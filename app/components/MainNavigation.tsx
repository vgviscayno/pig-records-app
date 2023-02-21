import { NavLink } from "@remix-run/react";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "~/components/ui/navigation-menu";

export default function MainNavigation() {
  return (
    <div className="flex flex-row items-center p-4">
      <h1 className="scroll-m-20 border-b border-b-slate-200 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0 dark:border-b-slate-700">
        Bestseller Hogs
      </h1>
      <NavigationMenu className="ml-2 justify-start">
        <NavigationMenuList className="space-x-4">
          <NavigationMenuItem>
            <NavLink to="/deliveries">
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Deliveries
              </NavigationMenuLink>
            </NavLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavLink to="/inventory">
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Inventory
              </NavigationMenuLink>
            </NavLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavLink to="/suppliers">
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Suppliers
              </NavigationMenuLink>
            </NavLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavLink to="/customers">
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Customers
              </NavigationMenuLink>
            </NavLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
