'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { LiveName } from '@/app/types/types';
import AlertDialogComponent from '../ui/AlertDialogComponent';

interface FormValues {
  items: string[];
}

export default function Live({ params }: { params: LiveName[] }) {
  const [isAlertDialogOpen, setAlertDialogOpen] = useState(false);

  // ライブ種別ごとにフィルター化して画面表示
  const inoriMinaseLives = params.filter((param) => param.liveType.type === '水瀬いのり個人名義');
  const townMeetingLives = params.filter((param) => param.liveType.type === '町民集会');

  const form = useForm<FormValues>({
    defaultValues: {
      items: [],
    },
  });

  const handleButtonClick = (e: React.SyntheticEvent) => {
    if (form.watch('items').length === 0) {
      e.preventDefault();
      setAlertDialogOpen(true);
    }
  };

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name='items'
        render={() => (
          <FormItem>
            <div className='mt-4 mb-2'>
              <FormLabel className='font-bold text-xl'>水瀬いのり個人名義</FormLabel>
            </div>
            {inoriMinaseLives.map((inoriMinaseLive) => (
              <FormField
                key={inoriMinaseLive.id}
                control={form.control}
                name='items'
                render={({ field }) => (
                  <FormItem
                    key={inoriMinaseLive.id}
                    className='flex flex-row items-start space-x-3 space-y-0 py-1'
                  >
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(inoriMinaseLive.id)}
                        onCheckedChange={(checked) =>
                          checked
                            ? field.onChange([...field.value, inoriMinaseLive.id])
                            : field.onChange(
                                field.value?.filter((value) => value !== inoriMinaseLive.id),
                              )
                        }
                      />
                    </FormControl>
                    <FormLabel className='font-normal'>{inoriMinaseLive.liveName}</FormLabel>
                  </FormItem>
                )}
              />
            ))}
            <div className='mt-4 mb-2'>
              <FormLabel className='font-bold text-xl'>水瀬いのり個人名義</FormLabel>
            </div>
            {townMeetingLives.map((townMeetingLive) => (
              <FormField
                key={townMeetingLive.id}
                control={form.control}
                name='items'
                render={({ field }) => (
                  <FormItem
                    key={townMeetingLive.id}
                    className='flex flex-row items-start space-x-3 space-y-0 py-1'
                  >
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(townMeetingLive.id)}
                        onCheckedChange={(checked) =>
                          checked
                            ? field.onChange([...field.value, townMeetingLive.id])
                            : field.onChange(
                                field.value?.filter((value) => value !== townMeetingLive.id),
                              )
                        }
                      />
                    </FormControl>
                    <FormLabel className='font-normal'>{townMeetingLive.liveName}</FormLabel>
                  </FormItem>
                )}
              />
            ))}
          </FormItem>
        )}
      />
      <Link
        href={{
          pathname: '/live-checker/select-venue',
          query: { live_id: form.watch('items') },
        }}
        onClick={handleButtonClick}
      >
        <Button
          variant='default'
          className='w-full items-center justify-center p-6 mt-6 mb-2 tracking-tight'
          disabled={form.watch('items').length === 0}
        >
          次へ進む
        </Button>
      </Link>
      <Link href='/live-checker'>
        <Button
          variant='secondary'
          className='w-full items-center justify-center p-6 my-2 tracking-tight'
        >
          最初に戻る
        </Button>
      </Link>
      <AlertDialogComponent
        isOpen={isAlertDialogOpen}
        onClose={() => setAlertDialogOpen(false)}
        description='ライブを選択してください。'
        cancelText='戻る'
      />
    </Form>
  );
}
