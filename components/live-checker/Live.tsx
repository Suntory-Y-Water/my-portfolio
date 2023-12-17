'use client';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { LiveName } from '@/app/types/types';
import Link from 'next/link';

interface FormValues {
  items: string[];
}

export default function Live({ params }: { params: LiveName[] }) {
  // ライブ種別ごとにフィルター化して画面表示
  const inoriMinaseLives = params.filter((param) => param.liveType.type === '水瀬いのり個人名義');
  const townMeetingLives = params.filter((param) => param.liveType.type === '町民集会');

  const form = useForm<FormValues>({
    defaultValues: {
      items: [],
    },
  });

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
          pathname: '/contents/live-checker/select-venue',
          query: { live_id: form.watch('items') },
        }}
      >
        <Button
          variant='default'
          className='w-full items-center justify-center p-6 my-2 tracking-tight'
        >
          次へ進む
        </Button>
      </Link>
      <Link href='/contents/live-checker'>
        <Button
          variant='secondary'
          className='w-full items-center justify-center p-6 my-2 tracking-tight'
        >
          最初に戻る
        </Button>
      </Link>
    </Form>
  );
}
