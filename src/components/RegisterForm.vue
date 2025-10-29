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
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useForm } from "vee-validate";

const serverErr = ref<string | null>(null);
const router = useRouter();

const formSchema = toTypedSchema(
  z
    .object({
      firstName: z
        .string()
        .min(2, { message: "Imię musi mieć co najmniej 2 znaki." }),
      lastName: z
        .string()
        .min(2, { message: "Nazwisko musi mieć co najmniej 2 znaki." }),
      email: z.string().email({ message: "Nieprawidłowy adres email." }),
      password: z
        .string()
        .min(8, { message: "Hasło musi mieć co najmniej 8 znaków." }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Hasła nie są zgodne.",
      path: ["confirmPassword"],
    })
);

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: formSchema,
});

const onSubmit = handleSubmit(async (values) => {
  serverErr.value = null;

  try {
    const response = await fetch("http://localhost:3000/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: values.email,
        username: values.email,
        password: values.password,
        first_name: values.firstName,
        last_name: values.lastName,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Błąd rejestracji. Spróbuj ponownie.");
    }

    console.log("Rejestracja udana:", data);

    if (data.token) {
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/panel");
    }
  } catch (err: any) {
    console.error("Błąd podczas rejestracji:", err);
    serverErr.value = err.message || "Wystąpił nieoczekiwany błąd.";
  }
});
</script>

<template>
  <Card class="w-full max-w-sm">
    <CardHeader class="space-y-3 text-center">
      <CardTitle class="text-2xl">Create account</CardTitle>
      <CardDescription>
        Get started with sensor management today
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form class="space-y-4" @submit="onSubmit">
        <div class="space-y-2">
          <FormField v-slot="{ componentField }" name="firstName">
            <FormItem class="space-y-2">
              <FormLabel>First name</FormLabel>
              <FormControl>
                <Input type="text" placeholder="John" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="lastName">
            <FormItem class="space-y-2">
              <FormLabel>Last name</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Doe" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

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
            <FormItem class="space-y-2">
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="********"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="confirmPassword">
            <FormItem class="space-y-2">
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="********"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <div class="flex items-start space-x-2">
            <Checkbox id="terms" />
            <Label
              for="terms"
              class="text-sm text-gray-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the
              <button type="button" class="text-primary hover:underline">
                terms and conditions
              </button>
            </Label>
          </div>
        </div>

        <p v-if="serverErr" class="text-sm font-medium text-destructive">
          {{ serverErr }}
        </p>

        <Button type="submit" class="w-full" :disabled="isSubmitting">
          {{ isSubmitting ? "Creating account..." : "Create account" }}
        </Button>
      </form>
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-card text-gray-500">
            Already have an account?
          </span>
        </div>
      </div>
      <RouterLink to="/login">
        <Button type="button" variant="outline" class="w-full text-black">
          Sign in
        </Button>
      </RouterLink>
    </CardContent>
  </Card>
</template>
