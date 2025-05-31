import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="text-center sm:text-left">
          <h1 className="text-4xl font-bold mb-4">GitHub Copilot Agent Playground</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            A Next.js foundation for serverless deployment and AI-assisted development
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Features</h2>
            <ul className="space-y-2 text-sm">
              <li>✅ Next.js 15 with App Router</li>
              <li>✅ TypeScript configuration</li>
              <li>✅ ESLint for code quality</li>
              <li>✅ Tailwind CSS styling</li>
              <li>✅ API routes ready</li>
            </ul>
          </div>
          
          <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">API Endpoints</h2>
            <ul className="space-y-2 text-sm">
              <li><code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">/api/hello</code></li>
              <li><code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">/api/status</code></li>
            </ul>
          </div>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Link
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="/about"
          >
            Learn More
          </Link>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="/api/status"
            target="_blank"
          >
            API Status
          </a>
        </div>
      </main>
    </div>
  );
}
