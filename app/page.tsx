import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-[var(--background)]">
      <div className="w-full max-w-4xl space-y-12 text-center">

        {/* Hero Section */}
        <div className="space-y-6">
          <h1 className="text-6xl font-black text-[var(--primary)] drop-shadow-sm">
            MugMagic
          </h1>
          <p className="text-2xl text-gray-600 font-medium">
            Personalize your style with Clay-tastic fun!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-6">
          <Link href="/products">
            <Button className="text-xl px-12 py-6">
              Start Creating 🎨
            </Button>
          </Link>
          <Button variant="secondary" className="text-xl px-12 py-6">
            My Profile 👤
          </Button>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <Card className="flex flex-col items-center p-8">
            <div className="text-4xl mb-4">🖼️</div>
            <h3 className="text-xl font-bold mb-2">Drag & Drop</h3>
            <p className="text-gray-500">Easy 2D Editor</p>
          </Card>
          <Card className="flex flex-col items-center p-8">
            <div className="text-4xl mb-4">🎲</div>
            <h3 className="text-xl font-bold mb-2">3D Preview</h3>
            <p className="text-gray-500">See it before you buy</p>
          </Card>
          <Card className="flex flex-col items-center p-8">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-bold mb-2">Fast Shipping</h3>
            <p className="text-gray-500">Worldwide delivery</p>
          </Card>
        </div>

      </div>
    </main>
  );
}
