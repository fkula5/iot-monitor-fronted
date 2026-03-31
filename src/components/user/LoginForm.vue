<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import * as z from "zod";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-vue-next";
import {
  api,
  config,
  type LoginRequest,
  type AuthResponse,
  ApiError,
} from "@/lib/api";

const router = useRouter();
const serverErr = ref<string | null>(null);
const isPasswordVisible = ref(false);

const formSchema = toTypedSchema(
  z.object({
    email: z
      .string()
      .min(1, "Email jest wymagany")
      .email("Nieprawidłowy format email"),
    password: z
      .string()
      .min(1, "Hasło jest wymagane")
      .min(6, "Hasło musi mieć min. 6 znaków"),
  }),
);

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: formSchema,
  initialValues: {
    email: "",
    password: "",
  },
});

const onSubmit = handleSubmit(async (values) => {
  serverErr.value = null;

  try {
    const loginData: LoginRequest = {
      email: values.email,
      password: values.password,
    };

    const response = await api.post<AuthResponse>(
      config.endpoints.login,
      loginData,
    );

    if (response.token) {
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      router.push("/panel");
    } else {
      throw new Error("Brak tokenu w odpowiedzi");
    }
  } catch (err: any) {
    console.error("Login error:", err);

    if (err instanceof ApiError) {
      if (err.status === 401) {
        serverErr.value = "Nieprawidłowy email lub hasło";
      } else if (err.status === 429) {
        serverErr.value = "Zbyt wiele prób logowania. Spróbuj ponownie później";
      } else if (err.status >= 500) {
        serverErr.value = "Błąd serwera. Spróbuj ponownie później";
      } else {
        serverErr.value = err.message || "Wystąpił błąd podczas logowania";
      }
    } else {
      serverErr.value = "Nie można połączyć z serwerem";
    }
  }
});

function togglePasswordVisibility() {
  isPasswordVisible.value = !isPasswordVisible.value;
}
</script>

<template>
  <Card class="w-full max-w-md shadow-lg">
    <CardHeader class="space-y-3 text-center">
      <div
        class="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 text-primary-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      </div>
      <CardTitle class="text-2xl font-bold">Witaj ponownie</CardTitle>
      <CardDescription> Zaloguj się do systemu IoT Monitor </CardDescription>
    </CardHeader>

    <CardContent>
      <form class="space-y-4" @submit="onSubmit">
        <Alert v-if="serverErr" variant="destructive" class="mb-4">
          <AlertCircle class="h-4 w-4" />
          <AlertDescription>{{ serverErr }}</AlertDescription>
        </Alert>

        <FormField v-slot="{ componentField }" name="email">
          <FormItem class="space-y-2">
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="nazwa@example.com"
                v-bind="componentField"
                :disabled="isSubmitting"
                autocomplete="email"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="password">
          <FormItem>
            <div class="flex items-center justify-between">
              <FormLabel>Hasło</FormLabel>
              <RouterLink
                to="/forgot-password"
                class="text-sm font-medium text-primary hover:underline"
              >
                Zapomniałeś hasła?
              </RouterLink>
            </div>
            <FormControl>
              <div class="relative">
                <Input
                  :type="isPasswordVisible ? 'text' : 'password'"
                  v-bind="componentField"
                  placeholder="Wprowadź hasło"
                  :disabled="isSubmitting"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  @click="togglePasswordVisibility"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  :disabled="isSubmitting"
                >
                  <svg
                    v-if="isPasswordVisible"
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <Button type="submit" class="w-full" :disabled="isSubmitting">
          <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
          {{ isSubmitting ? "Logowanie..." : "Zaloguj się" }}
        </Button>

        <div class="relative my-4">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-card text-muted-foreground">
              Nie masz konta?
            </span>
          </div>
        </div>

        <RouterLink to="/register">
          <Button
            type="button"
            variant="outline"
            class="w-full"
            :disabled="isSubmitting"
          >
            Utwórz konto
          </Button>
        </RouterLink>
      </form>

      <div class="mt-6 text-center text-xs text-muted-foreground">
        <p>Logując się, akceptujesz nasze</p>
        <div class="mt-1 space-x-2">
          <a href="#" class="hover:underline">Warunki użytkowania</a>
          <span>•</span>
          <a href="#" class="hover:underline">Polityka prywatności</a>
        </div>
      </div>
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
