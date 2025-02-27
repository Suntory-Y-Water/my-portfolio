'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Props = {
  selectedSource: string;
  onSourceChange: (value: string) => void;
};

export default function PostsFilter({ selectedSource, onSourceChange }: Props) {
  return (
    <div className='w-[200px]'>
      <Select value={selectedSource} onValueChange={onSourceChange}>
        <SelectTrigger>
          <SelectValue placeholder='記事の種類を選択' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>すべて</SelectItem>
          <SelectItem value='Zenn'>Zenn</SelectItem>
          <SelectItem value='Qiita'>Qiita</SelectItem>
          <SelectItem value='note'>note</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
