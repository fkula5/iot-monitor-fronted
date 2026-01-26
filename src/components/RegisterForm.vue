<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useForm } from "vee-validate";
import {
  api,
  config,
  ApiError,
  type RegisterRequest,
  type AuthResponse,
} from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, AlertCircle } from "lucide-vue-next";
import { Alert, AlertDescription } from "@/components/ui/alert";

const serverErr = ref<string | null>(null);
const router = useRouter();

const formSchema = toTypedSchema(
  z
    .object({
      firstName: z.string().min(2, "Imię musi mieć co najmniej 2 znaki."),
      lastName: z.string().min(2, "Nazwisko musi mieć co najmniej 2 znaki."),
      email: z.string().email("Nieprawidłowy adres email."),
      password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków."),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Hasła nie są zgodne.",
      path: ["confirmPassword"],
    }),
);

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: formSchema,
});

const onSubmit = handleSubmit(async (values) => {
  serverErr.value = null;

  try {
    const registerData: RegisterRequest = {
      email: values.email,
      username: values.email,
      password: values.password,
      first_name: values.firstName,
      last_name: values.lastName,
    };

    const data = await api.post<AuthResponse>(
      config.endpoints.register,
      registerData,
    );

    console.log("Rejestracja udana:", data);

    if (data.token) {
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/panel");
    } else {
      router.push("/login");
    }
  } catch (err: any) {
    console.error("Błąd podczas rejestracji:", err);

    if (err instanceof ApiError) {
      if (err.status === 409) {
        serverErr.value = "Użytkownik o takim adresie email już istnieje.";
      } else {
        serverErr.value = err.message || "Błąd rejestracji. Spróbuj ponownie.";
      }
    } else {
      serverErr.value = "Nie można połączyć się z serwerem.";
    }
  }
});
</script>

<template>
  <Card class="w-full max-w-md shadow-lg">
    <CardHeader class="space-y-3 text-center">
      <CardTitle class="text-2xl font-bold">Utwórz konto</CardTitle>
      <CardDescription>
        Zacznij zarządzać swoimi sensorami już teraz
      </CardDescription>
    </CardHeader>

    <CardContent>
      <form class="space-y-4" @submit="onSubmit">
        <Alert v-if="serverErr" variant="destructive" class="mb-4">
          <AlertCircle class="h-4 w-4" />
          <AlertDescription>{{ serverErr }}</AlertDescription>
        </Alert>

        <div class="grid grid-cols-2 gap-4">
          <FormField v-slot="{ componentField }" name="firstName">
            <FormItem class="space-y-2">
              <FormLabel>Imię</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Jan"
                  v-bind="componentField"
                  :disabled="isSubmitting"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="lastName">
            <FormItem class="space-y-2">
              <FormLabel>Nazwisko</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Kowalski"
                  v-bind="componentField"
                  :disabled="isSubmitting"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <FormField v-slot="{ componentField }" name="email">
          <FormItem class="space-y-2">
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="jan@example.com"
                v-bind="componentField"
                :disabled="isSubmitting"
                autocomplete="email"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="password">
          <FormItem class="space-y-2">
            <FormLabel>Hasło</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="********"
                v-bind="componentField"
                :disabled="isSubmitting"
                autocomplete="new-password"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="confirmPassword">
          <FormItem class="space-y-2">
            <FormLabel>Potwierdź hasło</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="********"
                v-bind="componentField"
                :disabled="isSubmitting"
                autocomplete="new-password"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <Button type="submit" class="w-full" :disabled="isSubmitting">
          <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
          {{ isSubmitting ? "Tworzenie konta..." : "Zarejestruj się" }}
        </Button>
      </form>

      <div class="relative my-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-card text-muted-foreground">
            Masz już konto?
          </span>
        </div>
      </div>

      <RouterLink to="/login">
        <Button
          type="button"
          variant="outline"
          class="w-full"
          :disabled="isSubmitting"
        >
          Zaloguj się
        </Button>
      </RouterLink>
    </CardContent>
  </Card>
</template>

<style scoped>
.card {
  transition: box-shadow 0.3s ease;
}

.card:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}
</style>
