<script setup lang="ts">
import { useRouter, RouterView, RouterLink } from "vue-router";
import {
  Activity,
  Bell,
  CircleUser,
  Home,
  Menu,
  Package,
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
  <div
    class="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]"
  >
    <div class="hidden border-r bg-muted/40 md:block">
      <div class="flex h-full max-h-screen flex-col gap-2">
        <div class="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <RouterLink to="/panel" class="flex items-center gap-2 font-semibold">
            <Package class="h-6 w-6" />
            <span class="">IoT Monitor</span>
          </RouterLink>
        </div>
        <div class="flex-1">
          <nav class="grid items-start px-2 text-sm font-medium lg:px-4">
            <RouterLink
              to="/panel"
              exact-active-class="bg-muted text-primary"
              v-slot="{ isActive }"
            >
              <span
                :class="[
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  isActive && 'bg-muted text-primary',
                ]"
              >
                <Home class="h-4 w-4" />
                Panel Główny
              </span>
            </RouterLink>
            <RouterLink
              to="/panel/sensors"
              active-class="bg-muted text-primary"
              v-slot="{ isActive }"
            >
              <span
                :class="[
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  isActive && 'bg-muted text-primary',
                ]"
              >
                <Activity class="h-4 w-4" />
                Sensory
              </span>
            </RouterLink>
            <RouterLink
              to="/panel/alerts"
              active-class="bg-muted text-primary"
              v-slot="{ isActive }"
            >
              <span
                :class="[
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  isActive && 'bg-muted text-primary',
                ]"
              >
                <Bell class="h-4 w-4" />
                Alerty
              </span>
            </RouterLink>
          </nav>
        </div>
      </div>
    </div>

    <div class="flex flex-col">
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
                class="flex items-center gap-2 text-lg font-semibold"
              >
                <LayoutDashboard class="h-6 w-6" />
                <span class="sr-only">IoT Monitor</span>
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
                to="/panel/alerts"
                class="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
              >
                <Bell class="h-5 w-5" />
                Alerty
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
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{{
              user.first_name || "Moje Konto"
            }}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Ustawienia</DropdownMenuItem>
            <DropdownMenuItem>Pomoc</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="handleLogout" class="text-red-600">
              Wyloguj
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <main class="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
