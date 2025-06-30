import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <p>Go to the <Link href="/player">Player View</Link></p>
      <p>Go to the <Link href="/dashboard">Dashboard View</Link></p>
    </div>
  );
}