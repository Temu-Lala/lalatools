import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t py-6 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-2 md:gap-0">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} LALA Tools
        </p>

        <span> Made By Bereket K</span>
        <Link
          href="http://github.com/bekione"
          //           href="https://temesgen-debebe.vercel.app/"

          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors duration-300 flex items-center gap-1"
        >
          <span> Made By Bereket K</span>
          {/* <span> Made By Bereket K</span> */}
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
