/**
 * Loading skeleton components for better UX during data fetching.
 */

export const ProductCardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
        <div className="aspect-square bg-gray-200" />
        <div className="p-4 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-6 bg-gray-200 rounded w-1/3" />
        </div>
    </div>
);

export const ProductListSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
            <ProductCardSkeleton key={i} />
        ))}
    </div>
);

export const CartItemSkeleton = () => (
    <div className="flex gap-4 p-4 bg-gray-50 rounded-lg animate-pulse">
        <div className="w-20 h-20 bg-gray-200 rounded-lg" />
        <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>
    </div>
);

export const EditorSkeleton = () => (
    <div className="h-screen flex animate-pulse">
        {/* Left Panel */}
        <div className="w-80 bg-gray-100 border-r border-gray-200 p-4 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 bg-gray-200 rounded" />
                ))}
            </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-gray-50 flex items-center justify-center">
            <div className="w-96 h-96 bg-gray-200 rounded-xl" />
        </div>

        {/* Right Panel */}
        <div className="w-80 bg-gray-100 border-l border-gray-200 p-4 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="aspect-square bg-gray-200 rounded-xl" />
        </div>
    </div>
);

export const CheckoutFormSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-gray-200 rounded" />
                <div className="h-10 bg-gray-200 rounded" />
            </div>
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
        </div>
    </div>
);

export const OrderSummarySkeleton = () => (
    <div className="bg-gray-50 rounded-xl p-6 space-y-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2" />
        <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                </div>
            ))}
        </div>
        <div className="border-t border-gray-300 pt-4">
            <div className="flex justify-between">
                <div className="h-6 bg-gray-200 rounded w-1/4" />
                <div className="h-6 bg-gray-200 rounded w-1/3" />
            </div>
        </div>
    </div>
);

export const ProfileSkeleton = () => (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-pulse">
        {/* Header */}
        <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-gray-200 rounded-full" />
            <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded w-48" />
                <div className="h-4 bg-gray-200 rounded w-64" />
            </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="aspect-square bg-gray-200 rounded-lg" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
            ))}
        </div>
    </div>
);
