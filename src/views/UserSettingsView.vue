<script setup lang="ts">
import { onMounted, ref } from "vue";
import { User, Lock, Bell, Shield, Save } from "lucide-vue-next";
import PageHeader from "@/components/shared/PageHeader.vue";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "vue-sonner";
import { api, config, type UserInfo } from "@/lib/api";

const profileForm = ref({
  first_name: "",
  last_name: "",
  email: "",
});

const passwordForm = ref({
  current: "",
  new: "",
  confirm: "",
});

const isLoading = ref(false);

async function getUser() {
  try {
    const response = await api.get<UserInfo>(config.endpoints.user);
    const userData = response || response;

    profileForm.value = {
      first_name: userData.first_name || "",
      last_name: userData.last_name || "",
      email: userData.email || "",
    };
  } catch (error) {
    console.error("Failed to load user profile", error);
    toast.error("Nie udało się pobrać danych profilu.");
  }
}

const handleUpdateUser = async () => {
  isLoading.value = true;
  try {
    const response = await api.put<UserInfo>(config.endpoints.user, {
      first_name: profileForm.value.first_name,
      last_name: profileForm.value.last_name,
    });

    localStorage.setItem("user", JSON.stringify(response));

    toast.success("Profil został zaktualizowany");
  } catch (error) {
    console.error(error);
    toast.error("Wystąpił błąd podczas zapisywania zmian.");
  } finally {
    isLoading.value = false;
  }
};

const handleChangePassword = () => {
  if (passwordForm.value.new !== passwordForm.value.confirm) {
    toast.error("Nowe hasła nie są identyczne");
    return;
  }

  toast.success("Hasło zostało zmienione");
  passwordForm.value = { current: "", new: "", confirm: "" };
};

onMounted(() => {
  getUser();
});
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Ustawienia konta"
      description="Zarządzaj swoimi danymi osobowymi i preferencjami bezpieczeństwa."
    />

    <div class="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <div class="flex items-center gap-2">
            <User class="h-5 w-5 text-blue-600" />
            <CardTitle>Profil użytkownika</CardTitle>
          </div>
          <CardDescription>
            Zaktualizuj swoje podstawowe informacje.
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <Label for="first_name">Imię</Label>
              <Input id="first_name" v-model="profileForm.first_name" />
            </div>
            <div class="space-y-2">
              <Label for="last_name">Nazwisko</Label>
              <Input id="last_name" v-model="profileForm.last_name" />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="email">Adres email</Label>
            <Input
              id="email"
              type="email"
              v-model="profileForm.email"
              disabled
              class="bg-muted text-muted-foreground opacity-100"
            />
            <p class="text-[0.8rem] text-muted-foreground">
              Zmiana adresu email nie jest możliwa w tym panelu.
            </p>
          </div>
        </CardContent>
        <CardFooter class="border-t px-6 py-4">
          <Button
            @click="handleUpdateUser"
            class="ml-auto bg-blue-600 hover:bg-blue-700"
            :disabled="isLoading"
          >
            <Save class="mr-2 h-4 w-4" />
            {{ isLoading ? "Zapisywanie..." : "Zapisz zmiany" }}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div class="flex items-center gap-2">
            <Lock class="h-5 w-5 text-blue-600" />
            <CardTitle>Zmiana hasła</CardTitle>
          </div>
          <CardDescription>
            Zadbaj o bezpieczeństwo swojego konta.
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="current">Aktualne hasło</Label>
            <Input
              id="current"
              type="password"
              v-model="passwordForm.current"
            />
          </div>
          <div class="space-y-2">
            <Label for="new">Nowe hasło</Label>
            <Input id="new" type="password" v-model="passwordForm.new" />
          </div>
          <div class="space-y-2">
            <Label for="confirm">Potwierdź nowe hasło</Label>
            <Input
              id="confirm"
              type="password"
              v-model="passwordForm.confirm"
            />
          </div>
        </CardContent>
        <CardFooter class="border-t px-6 py-4">
          <Button
            @click="handleChangePassword"
            variant="outline"
            class="ml-auto"
          >
            Aktualizuj hasło
          </Button>
        </CardFooter>
      </Card>

      <Card class="md:col-span-2">
        <CardHeader>
          <div class="flex items-center gap-2">
            <Bell class="h-5 w-5 text-blue-600" />
            <CardTitle>Powiadomienia i system</CardTitle>
          </div>
          <CardDescription>
            Konfiguracja alertów i statusu systemu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            class="flex items-center justify-between p-4 bg-muted/20 rounded-lg"
          >
            <div class="space-y-0.5">
              <p class="text-sm font-medium">Wersja systemu</p>
              <p class="text-xs text-muted-foreground">
                Aktualnie korzystasz z wersji 1.0.0
              </p>
            </div>
            <div
              class="flex items-center gap-2 text-sm text-green-600 font-medium"
            >
              <Shield class="h-4 w-4" />
              System bezpieczny
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
