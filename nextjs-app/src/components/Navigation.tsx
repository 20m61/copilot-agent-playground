import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-gray-100 dark:bg-gray-800 p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold hover:text-blue-600 transition-colors">
          Copilot Playground
        </Link>
        <div className="space-x-6">
          <Link 
            href="/" 
            className="hover:text-blue-600 transition-colors"
          >
            Home
          </Link>
          <Link 
            href="/about" 
            className="hover:text-blue-600 transition-colors"
          >
            About
          </Link>
        </div>
      </div>
    </nav>
  );
}