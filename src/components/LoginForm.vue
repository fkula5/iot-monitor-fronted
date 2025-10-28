<script setup lang="ts">
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
import { ref } from "vue";
import { useRouter } from "vue-router";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useForm } from "vee-validate";

function buttonForgotPassword() {
  alert("Forgot password clicked");
}

const serverErr = ref<string | null>(null);
const router = useRouter();

const formSchema = toTypedSchema(
  z.object({
    email: z.string().email({ message: "Nieprawidłowy adres email." }),
    password: z.string().nonempty({ message: "Hasło jest wymagane." }),
  })
);

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: formSchema,
});

const onSubmit = handleSubmit(async (values) => {
  serverErr.value = null;

  try {
    const response = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: values.email,
        password: values.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Nieprawidłowy adres email lub hasło.");
      }
      throw new Error(data.message || "Błąd logowania. Spróbuj ponownie.");
    }

    if (data.token) {
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard/sensors");
    }
  } catch (err: any) {
    console.error("Błąd podczas logowania:", err);
    serverErr.value = err.message || "Wystąpił nieoczekiwany błąd.";
  }
});
</script>

<template>
  <Card class="w-full max-w-sm">
    <CardHeader class="space-y-3 text-center">
      <CardTitle class="text-2xl">Login</CardTitle>
      <CardDescription>
        Enter your email below to login to your account.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form class="space-y-4" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="email">
          <FormItem class="space-y-2">
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="m@example.com"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="password">
          <FormItem>
            <div class="flex items-center justify-between">
              <FormLabel>Password</FormLabel>
              <button
                type="button"
                className="text-sm text-primary hover:underline"
                @click="buttonForgotPassword()"
              >
                Forgot password?
              </button>
            </div>

            <FormControl>
              <Input
                type="password"
                v-bind="componentField"
                placeholder="Enter your password"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <p v-if="serverErr" class="text-sm font-medium text-destructive">
          {{ serverErr }}
        </p>

        <Button type="submit" class="w-full" :disabled="isSubmitting">
          {{ isSubmitting ? "Logging in..." : "Log in" }}
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-card text-gray-500">
              Don't have an account?
            </span>
          </div>
        </div>
        <RouterLink to="/register">
          <Button type="button" variant="outline" class="w-full text-black">
            Create Account
          </Button>
        </RouterLink>
      </form>
    </CardContent>
  </Card>
</template>
