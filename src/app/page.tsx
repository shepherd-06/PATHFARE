
'use client';

import React, {useState} from 'react';
import {Address, Dimensions} from '@/services/delivery-cost';
import {calculateDeliveryCost} from '@/services/delivery-cost';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {packagingSuggestions} from '@/ai/flows/packaging-suggestions';
import {useToast} from "@/hooks/use-toast";
import {useEffect} from 'react';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Separator} from "@/components/ui/separator";

const addressSchema = z.object({
  street: z.string().min(1, {message: "Street is required."}),
  city: z.string().min(1, {message: "City is required."}),
  state: z.string().min(2, {message: "State is required."}).max(2, {message: "State must be 2 characters."}),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, {message: "Invalid zip code."}),
});

const dimensionsSchema = z.object({
  length: z.number().gt(0, {message: "Length must be greater than 0."}),
  width: z.number().gt(0, {message: "Width must be greater than 0."}),
  height: z.number().gt(0, {message: "Height must be greater than 0."}),
});

const deliveryFormSchema = z.object({
  origin: addressSchema,
  destination: addressSchema,
  weight: z.number().gt(0, {message: "Weight must be greater than 0."}),
  dimensions: dimensionsSchema,
});

export default function Home() {
  const [cost, setCost] = useState<number | null>(null);
  const [deliveryTime, setDeliveryTime] = useState<number | null>(null);
  const [packagingSuggestion, setPackagingSuggestion] = useState<any>(null);
  const {toast} = useToast();
  const form = useForm<z.infer<typeof deliveryFormSchema>>({
    resolver: zodResolver(deliveryFormSchema),
    defaultValues: {
      origin: {street: '', city: '', state: '', zip: ''},
      destination: {street: '', city: '', state: '', zip: ''},
      weight: 1,
      dimensions: {length: 1, width: 1, height: 1},
    },
  });

  const {watch} = form;

  const watchedDimensions = watch("dimensions");
  const watchedWeight = watch("weight");

  useEffect(() => {
    async function getPackagingSuggestions() {
      if (watchedDimensions && watchedWeight) {
        try {
          const suggestions = await packagingSuggestions({
            itemLength: watchedDimensions.length,
            itemWidth: watchedDimensions.width,
            itemHeight: watchedDimensions.height,
            itemWeight: watchedWeight,
          });
          setPackagingSuggestion(suggestions);
        } catch (error: any) {
          console.error("Error fetching packaging suggestions:", error);
          toast({
            title: "Error",
            description: "Failed to fetch packaging suggestions.",
            variant: "destructive",
          });
        }
      }
    }

    getPackagingSuggestions();
  }, [watchedDimensions, watchedWeight, toast]);

  const onSubmit = async (values: z.infer<typeof deliveryFormSchema>) => {
    try {
      const deliveryQuote = await calculateDeliveryCost(values);
      setCost(deliveryQuote.cost);
      setDeliveryTime(deliveryQuote.deliveryTime);
      toast({
        title: "Calculation successful!",
        description: `Delivery cost: $${deliveryQuote.cost}, Delivery time: ${deliveryQuote.deliveryTime} days`,
      });
    } catch (error: any) {
      console.error("Error calculating delivery cost:", error);
      toast({
        title: "Error",
        description: "Failed to calculate delivery cost.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">SwiftRoute Delivery Calculator</h1>
      <Card>
        <CardHeader>
          <CardTitle>Delivery Details</CardTitle>
          <CardDescription>Enter the origin, destination, and package details to calculate the delivery cost.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Origin Address</h2>
                  <FormField
                    control={form.control}
                    name="origin.street"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Street</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} />
                        </FormControl>
                        <FormMessage/>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="origin.city"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Anytown" {...field} />
                        </FormControl>
                        <FormMessage/>
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="origin.state"
                      render={({field}) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="CA" maxLength={2} {...field} />
                          </FormControl>
                          <FormMessage/>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="origin.zip"
                      render={({field}) => (
                        <FormItem>
                          <FormLabel>Zip Code</FormLabel>
                          <FormControl>
                            <Input placeholder="90210" {...field} />
                          </FormControl>
                          <FormMessage/>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-2">Destination Address</h2>
                  <FormField
                    control={form.control}
                    name="destination.street"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Street</FormLabel>
                        <FormControl>
                          <Input placeholder="456 Elm St" {...field} />
                        </FormControl>
                        <FormMessage/>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="destination.city"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="New City" {...field} />
                        </FormControl>
                        <FormMessage/>
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="destination.state"
                      render={({field}) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="NY" maxLength={2} {...field} />
                          </FormControl>
                          <FormMessage/>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="destination.zip"
                      render={({field}) => (
                        <FormItem>
                          <FormLabel>Zip Code</FormLabel>
                          <FormControl>
                            <Input placeholder="10001" {...field} />
                          </FormControl>
                          <FormMessage/>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              <Separator/>
              <div>
                <h2 className="text-lg font-semibold mb-2">Package Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Weight (lbs)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="10" {...field} />
                        </FormControl>
                        <FormMessage/>
                      </FormItem>
                    )}
                  />
                  <div>
                    <h3 className="text-md font-semibold mb-2">Dimensions (inches)</h3>
                    <div className="grid grid-cols-3 gap-2">
                      <FormField
                        control={form.control}
                        name="dimensions.length"
                        render={({field}) => (
                          <FormItem>
                            <FormLabel>Length</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="12" {...field} />
                            </FormControl>
                            <FormMessage/>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dimensions.width"
                        render={({field}) => (
                          <FormItem>
                            <FormLabel>Width</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="9" {...field} />
                            </FormControl>
                            <FormMessage/>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dimensions.height"
                        render={({field}) => (
                          <FormItem>
                            <FormLabel>Height</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="3" {...field} />
                            </FormControl>
                            <FormMessage/>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <Button type="submit">Calculate Delivery Cost</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {cost !== null && deliveryTime !== null && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Delivery Quote</h2>
          <Card>
            <CardContent>
              <p>
                <strong>Estimated Cost:</strong> ${cost}
              </p>
              <p>
                <strong>Estimated Delivery Time:</strong> {deliveryTime} days
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {packagingSuggestion && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Packaging Optimization Suggestion</h2>
          <Card>
            <CardContent>
              <p>
                <strong>Suggested Package Type:</strong> {packagingSuggestion.suggestedPackageType}
              </p>
              <p>
                <strong>Suggested Package Dimensions:</strong> {packagingSuggestion.suggestedPackageDimensions}
              </p>
              <p>
                <strong>Packaging Tips:</strong> {packagingSuggestion.packagingTips}
              </p>
              <p>
                <strong>Estimated Cost Savings:</strong> {packagingSuggestion.estimatedCostSavings}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
