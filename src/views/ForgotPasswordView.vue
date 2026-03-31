<script lang="ts" setup>
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { FormControl, FormField, FormMessage } from '@/components/ui/form';
import FormItem from '@/components/ui/form/FormItem.vue';
import FormLabel from '@/components/ui/form/FormLabel.vue';
import { Input } from '@/components/ui/input';
import { AlertCircle } from 'lucide-vue-next';

</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
  >
    <Card class="w-full max-w-md shadow-lg">
        <CardHeader class="space-y-3 text-center">
            <CardTitle class="text-2xl font-bold">Odzyskaj hasło</CardTitle>
            <CardDescription>
                Wprowadź swój email, a wyślemy Ci link do odzyskania hasła.
            </CardDescription>
        </CardHeader>
        
        <CardContent>
            <form class="space-y-4">
                <Alert v-if="serverErr" variant="destructive" class="mb-4">
                    <AlertCircle class="h-4 w-4" />
                    <AlertDescription>{{ serverErr }}</AlertDescription>
                </Alert>
                <FormField v-slot="{componentField}" name="email">
                    <FormItem class="space-y-2">
                        <FormControl>
                            <Input type="email" placeholder="nazwa@example.com" v-bind="componentField" autocomplete="email" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                </FormField>
               <Button>
                    Wyślij link do odzyskania hasła
               </Button>
            </form>
        </CardContent>
    </Card>
  </div>
</template>