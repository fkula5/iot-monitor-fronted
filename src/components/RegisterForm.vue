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
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
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
      <Form class="space-y-4">
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
        <Button type="submit" class="w-full mt-2">Create account</Button>
      </Form>
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
