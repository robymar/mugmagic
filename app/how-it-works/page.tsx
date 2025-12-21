export default function HowItWorksPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-20 px-4">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-5xl font-black text-gray-900 mb-6">
                    How It Works
                </h1>
                <p className="text-xl text-gray-600 mb-12">
                    Create your perfect mug in 3 simple steps
                </p>

                <div className="grid md:grid-cols-3 gap-8 mt-16">
                    <div className="bg-white p-8 rounded-2xl shadow-lg">
                        <div className="text-5xl mb-4">🎨</div>
                        <h3 className="font-bold text-xl mb-3">1. Design</h3>
                        <p className="text-gray-600">
                            Choose a product and use our intuitive 2D editor to add text, images, or avatars
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-lg">
                        <div className="text-5xl mb-4">👀</div>
                        <h3 className="font-bold text-xl mb-3">2. Preview</h3>
                        <p className="text-gray-600">
                            See your design come to life in stunning 3D before you buy
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-lg">
                        <div className="text-5xl mb-4">📦</div>
                        <h3 className="font-bold text-xl mb-3">3. Receive</h3>
                        <p className="text-gray-600">
                            We print and ship your custom mug within 5-7 business days
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
