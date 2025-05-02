import ImageOverlay from "../components/ImageOverlay";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <header className="mb-10 sm:mb-14 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4 leading-tight">
            Create Your Special Birthday Wish
          </h1>
          <p className="mt-3 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Add your photo and details to personalize your celebration image.
          </p>
        </header>

        <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-8 md:p-10 overflow-hidden border border-gray-100">
          <ImageOverlay />
        </div>

        <footer className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Zeel Bhanderi. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
