import { Suspense } from "react"
import { Header } from "@/components/header"
import { SearchResults } from "@/components/search-results"

interface SearchPageProps {
  searchParams: {
    q?: string
  }
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ""

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Search results for "{query}"</h1>
        <Suspense fallback={<div>Searching...</div>}>
          <SearchResults query={query} />
        </Suspense>
      </div>
    </div>
  )
}
