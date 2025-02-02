export default function Footer() {
  return (
    <footer className='border-t text-sm md:h-24'>
      <div className='mx-auto max-w-[1024px] flex h-full flex-col justify-center gap-4 p-4'>
        <p>© {new Date().getFullYear()} - Copyright スイ, All Rights Reserved.</p>
        <p>
          このサイトは Google Analytics を使用しています。詳しくは
          <a
            className='underline hover:opacity-75'
            href='https://policies.google.com/technologies/partner-sites?hl=ja'
            target='_blank'
            rel='noopener noreferrer'
          >
            Google のサービスを使用するサイトやアプリから収集した情報の Google による使用
            – ポリシーと規約
          </a>
          をご覧ください。
        </p>
      </div>
    </footer>
  );
}
