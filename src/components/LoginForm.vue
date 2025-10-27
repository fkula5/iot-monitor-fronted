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
  Form,
} from "@/components/ui/form";

function buttonForgotPassword() {
  alert("Forgot password clicked");
}
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
      <Form class="space-y-4">
        <div class="space-y-2">
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

          <Button type="submit" class="w-full"> Sign in </Button>

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
          <Button type="button" variant="outline" class="w-full">
            Create Account
          </Button>
        </div>
      </Form>
    </CardContent>
  </Card>
</template>
