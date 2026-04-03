<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "vue-sonner";
import { api } from "@/lib/api";

const email = ref("");
const isLoading = ref(false);
const isSubmitted = ref(false);

const onSubmit = async () => {
  if (!email.value) return;

  isLoading.value = true;
  try {
    await api.auth.forgotPassword(email.value);
    isSubmitted.value = true;
    toast.success("Żądanie zostało wysłane.");
  } catch (error) {
    toast.error("Wystąpił błąd podczas wysyłania żądania.");
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
          >Odzyskiwanie hasła</CardTitle
        >
        <CardDescription>
          Wpisz swój adres e-mail, a wyślemy Ci link do zresetowania hasła.
        </CardDescription>
      </CardHeader>

      <CardContent class="grid gap-4">
        <Alert
          v-if="isSubmitted"
          variant="default"
          class="bg-green-50 text-green-900 border-green-200"
        >
          <AlertTitle>Sprawdź skrzynkę e-mail</AlertTitle>
          <AlertDescription>
            Jeśli konto z adresem <b>{{ email }}</b> istnieje, wysłaliśmy na nie
            link do resetu hasła.
          </AlertDescription>
        </Alert>

        <form v-else @submit.prevent="onSubmit" class="space-y-4">
          <div class="space-y-2">
            <Label for="email">Adres e-mail</Label>
            <Input
              id="email"
              type="email"
              v-model="email"
              placeholder="m.kowalski@example.com"
              required
              :disabled="isLoading"
            />
          </div>
          <Button type="submit" class="w-full" :disabled="isLoading || !email">
            <span v-if="isLoading">Wysyłanie...</span>
            <span v-else>Wyślij link resetujący</span>
          </Button>
        </form>
      </CardContent>

      <CardFooter>
        <div class="text-sm text-muted-foreground w-full text-center">
          Przypomniałeś sobie hasło?
          <RouterLink to="/login" class="text-primary hover:underline">
            Zaloguj się
          </RouterLink>
        </div>
      </CardFooter>
    </Card>
  </div>
</template>
