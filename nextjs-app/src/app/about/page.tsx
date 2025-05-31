export default function About() {
  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">About</h1>
        <div className="prose prose-lg mx-auto">
          <p className="text-lg mb-6">
            Welcome to the GitHub Copilot Agent Mode Playground Next.js application!
          </p>
          <p className="mb-6">
            This Next.js project serves as the foundation for our serverless deployment
            and demonstrates the capabilities of GitHub Copilot Agent Mode in creating
            modern web applications.
          </p>
          <h2 className="text-2xl font-semibold mb-4">Features</h2>
          <ul className="list-disc list-inside mb-6 space-y-2">
            <li>Next.js 15 with App Router</li>
            <li>TypeScript configuration</li>
            <li>ESLint for code quality</li>
            <li>Tailwind CSS for styling</li>
            <li>API routes for serverless functions</li>
            <li>Optimized for serverless deployment</li>
          </ul>
          <h2 className="text-2xl font-semibold mb-4">Tech Stack</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Next.js 15</li>
            <li>React 19</li>
            <li>TypeScript</li>
            <li>Tailwind CSS</li>
            <li>ESLint</li>
          </ul>
        </div>
      </main>
    </div>
  );
}