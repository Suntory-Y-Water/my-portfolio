import Navigation from '../components/Navigation';
import Index from '../components/Index';
import LiveChecker from '../contents/liveChecker/page';
export default function Home() {
  return (
    <div className='flex'>
      <Index />
      <LiveChecker />
      <Navigation />
    </div>
  );
}
