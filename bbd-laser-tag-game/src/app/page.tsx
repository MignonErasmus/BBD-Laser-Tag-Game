import Link from 'next/link';
import SocketTest from "../components/SocketTest"

export default function Home() {
  return (
    <div>
      <p>Go to the <Link href="/player">Player View</Link></p>
      <p>Go to the <Link href="/dashboard">Dashboard View</Link></p>
      <SocketTest/>
    </div>
  );
}