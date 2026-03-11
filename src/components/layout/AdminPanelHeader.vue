<script lang="ts" setup>
import { useRouter, RouterLink } from "vue-router";
import {
  Activity,
  Bell,
  CircleUser,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  User,
  RadioReceiver,
  Folder,
} from "lucide-vue-next";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const router = useRouter();

const userRaw = localStorage.getItem("user");

const user = userRaw ? JSON.parse(userRaw) : { first_name: "Gość", email: "" };

function handleLogout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");

  router.push("/login");
}
</script>
<template>
  <header
    class="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6"
  >
    <Sheet>
      <SheetTrigger as-child>
        <Button variant="outline" size="icon" class="shrink-0 md:hidden">
          <Menu class="h-5 w-5" />
          <span class="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" class="flex flex-col">
        <nav class="grid gap-2 text-lg font-medium">
          <RouterLink
            to="/panel"
            class="flex items-center gap-2 text-lg font-semibold mb-4"
          >
            <span class="font-bold">IoT Monitor</span>
          </RouterLink>
          <RouterLink
            to="/panel"
            class="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
          >
            <LayoutDashboard class="h-5 w-5" />
            Panel Główny
          </RouterLink>
          <RouterLink
            to="/panel/sensors"
            class="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
          >
            <Activity class="h-5 w-5" />
            Sensory
          </RouterLink>
          <RouterLink
            to="/panel/sensor-types"
            class="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
          >
            <RadioReceiver class="h-5 w-5" />
            Typy Sensorów
          </RouterLink>
          <RouterLink
            to="/panel/groups"
            class="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
          >
            <Folder class="h-5 w-5" />
            Grupy
          </RouterLink>
          <RouterLink
            to="/panel/alerts"
            class="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
          >
            <Bell class="h-5 w-5" />
            Alerty
          </RouterLink>
          <RouterLink
            to="/panel/alert-rules"
            class="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
          >
            <Bell class="h-5 w-5" />
            Reguły Alertów
          </RouterLink>
          <RouterLink
            to="/panel/settings"
            class="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
          >
            <Settings class="h-5 w-5" />
            Ustawienia
          </RouterLink>
        </nav>
      </SheetContent>
    </Sheet>

    <div class="w-full flex-1">
      <Breadcrumb class="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink as-child>
              <RouterLink to="/panel">Panel</RouterLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{{ $route.name }}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>

    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="secondary" size="icon" class="rounded-full">
          <CircleUser class="h-5 w-5" />
          <span class="sr-only">Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" class="w-56">
        <DropdownMenuLabel class="font-normal">
          <div class="flex flex-col space-y-1">
            <p class="text-sm font-medium leading-none">
              {{ user.first_name }} {{ user.last_name }}
            </p>
            <p class="text-xs leading-none text-muted-foreground">
              {{ user.email }}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem @click="router.push('/panel/settings')">
          <User class="mr-2 h-4 w-4" />
          <span>Profil</span>
        </DropdownMenuItem>
        <DropdownMenuItem @click="router.push('/panel/settings')">
          <Settings class="mr-2 h-4 w-4" />
          <span>Ustawienia</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          @click="handleLogout"
          class="text-red-600 focus:text-red-600"
        >
          <LogOut class="mr-2 h-4 w-4" />
          <span>Wyloguj się</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </header>
</template>
