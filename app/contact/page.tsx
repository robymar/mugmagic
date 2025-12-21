export default function ContactPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-20 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-black text-gray-900 mb-4">
                        Get In Touch
                    </h1>
                    <p className="text-xl text-gray-600">
                        Have questions? We'd love to hear from you!
                    </p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-xl">
                    <form className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Name
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Your name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="your@email.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Message
                            </label>
                            <textarea
                                rows={5}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Tell us what's on your mind..."
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-xl transition-all"
                        >
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
