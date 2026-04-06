<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "vue-sonner";
import { api } from "@/lib/api";

const route = useRoute();
const router = useRouter();

const token = ref("");
const password = ref("");
const confirmPassword = ref("");
const isLoading = ref(false);
const isTokenValid = ref(true);

onMounted(() => {
  const queryToken = route.query.token as string;
  if (!queryToken) {
    isTokenValid.value = false;
    toast.error("Brak tokenu resetowania. Link jest nieprawidłowy.");
  } else {
    token.value = queryToken;
  }
});

const onSubmit = async () => {
  if (password.value !== confirmPassword.value) {
    toast.error("Hasła nie są identyczne!");
    return;
  }

  if (password.value.length < 8) {
    toast.error("Hasło musi mieć co najmniej 8 znaków.");
    return;
  }

  isLoading.value = true;
  try {
    await api.auth.resetPassword(token.value, password.value);
    toast.success(
      "Hasło zostało pomyślnie zmienione! Możesz się teraz zalogować.",
    );
    router.push("/login");
  } catch (error) {
    toast.error("Nie udało się zresetować hasła. Token mógł wygasnąć.");
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div
    class="container flex h-screen w-screen flex-col items-center justify-center"
  >
    <Card class="w-[400px]">
      <CardHeader class="space-y-1">
        <CardTitle class="text-2xl font-bold tracking-tight"
          >Ustaw nowe hasło</CardTitle
        >
        <CardDescription v-if="isTokenValid">
          Wpisz swoje nowe hasło poniżej.
        </CardDescription>
        <CardDescription v-else class="text-destructive">
          Brak autoryzacji do zmiany hasła.
        </CardDescription>
      </CardHeader>

      <CardContent class="grid gap-4" v-if="isTokenValid">
        <form @submit.prevent="onSubmit" class="space-y-4">
          <div class="space-y-2">
            <Label for="password">Nowe hasło</Label>
            <Input
              id="password"
              type="password"
              v-model="password"
              required
              :disabled="isLoading"
            />
          </div>

          <div class="space-y-2">
            <Label for="confirmPassword">Powtórz nowe hasło</Label>
            <Input
              id="confirmPassword"
              type="password"
              v-model="confirmPassword"
              required
              :disabled="isLoading"
            />
          </div>

          <Button
            type="submit"
            class="w-full"
            :disabled="isLoading || !password || !confirmPassword"
          >
            <span v-if="isLoading">Zapisywanie...</span>
            <span v-else>Zmień hasło</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
