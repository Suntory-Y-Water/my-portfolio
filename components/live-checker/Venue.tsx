'use client';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { VenueProps } from '@/app/types/types';
import React from 'react';
import Link from 'next/link';

interface FormValues {
  items: number[];
}

type GroupedVenues = {
  [key: string]: VenueProps[];
};

const groupVenuesByLiveName = (venues: VenueProps[]): GroupedVenues => {
  return venues.reduce<GroupedVenues>((acc, venue) => {
    (acc[venue.liveName.name] = acc[venue.liveName.name] || []).push(venue);
    return acc;
  }, {});
};

export default function Venue({ params }: { params: VenueProps[] }) {
  const form = useForm<FormValues>({
    defaultValues: {
      items: [],
    },
  });

  const groupedVenues = params ? groupVenuesByLiveName(params) : {};

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name='items'
        render={() => (
          <FormItem>
            {Object.keys(groupedVenues).map((liveName, index) => (
              <div className='mt-4 mb-2' key={liveName + index}>
                <FormLabel className='font-bold text-xl'>{liveName}</FormLabel>
                {groupedVenues[liveName].map((live) => (
                  <FormField
                    key={live.id}
                    control={form.control}
                    name='items'
                    render={({ field }) => (
                      <FormItem
                        key={live.id}
                        className='flex flex-row items-start space-x-3 space-y-0 py-1 my-2'
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(live.id)}
                            onCheckedChange={(checked) =>
                              checked
                                ? field.onChange([...field.value, live.id])
                                : field.onChange(field.value?.filter((value) => value !== live.id))
                            }
                          />
                        </FormControl>
                        <FormLabel className='font-normal'>{live.venueName}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            ))}
          </FormItem>
        )}
      />
      <Link
        href={{
          pathname: '/contents/live-checker/result',
          query: { venue_id: form.watch('items') },
        }}
      >
        <Button
          variant='default'
          className='w-full items-center justify-center p-6 my-2 tracking-tight'
        >
          結果を見る
        </Button>
      </Link>
      <Link href='/contents/live-checker/select-live'>
        <Button
          variant='secondary'
          className='w-full items-center justify-center p-6 my-2 tracking-tight'
        >
          ライブ選択に戻る
        </Button>
      </Link>
      <Link href='/contents/live-checker'>
        <Button
          variant='outline'
          className='w-full items-center justify-center p-6 my-2 tracking-tight'
        >
          最初に戻る
        </Button>
      </Link>
    </Form>
  );
}
