import Link from 'next/link';
export default function NotFound() {
  return (
    <main className="boot">
      <h1>This page could not be found.</h1>
      <Link href="/">Return to workspace</Link>
    </main>
  );
}
