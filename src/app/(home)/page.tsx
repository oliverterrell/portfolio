import { ImageAnnotator } from '@/app/(home)/ImageAnnotator';

const TopHeader = () => {
  return (
    <div className={'flex max-h-[90px] w-full flex-col gap-2 border-b border-gray-400 pb-3 pl-2 pt-2'}>
      <div className={'flex pl-2 text-3xl max-sm:text-xl'}>Goblins demo</div>
      <div className={'flex pl-2 max-sm:text-xs'}>Oliver Terrell</div>
    </div>
  );
};

export default function Home() {
  return (
    <div className="w-full max-sm:w-full-abs">
      <TopHeader />
      <div className={`flex flex-col items-center justify-center`}>
        <ImageAnnotator />
      </div>
    </div>
  );
}
