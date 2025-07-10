import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-4">
      <div className="container mx-auto text-center">
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} Lala Tools. All rights reserved.
        </p>

        <Link
          href="https://temesgen-debebe.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors duration-300 flex items-center justify-center gap-1 mt-2"
        >
          <span>Made By Temesgen (Lala) K</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 7h6m0 0v6m0-6L10 16"
            />
          </svg>
        </Link>
      </div>
    </footer>
  );
}
