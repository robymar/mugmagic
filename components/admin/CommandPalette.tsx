'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
    Search, LayoutDashboard, Package,
    ShoppingCart, Users, Settings,
    Image as ImageIcon, Box
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/Dialog';

export function CommandPalette() {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false);
        command();
    }, []);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-all w-full max-w-md shadow-sm"
            >
                <Search size={16} />
                <span className="flex-1 text-left">Search (Ctrl+K)...</span>
                <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-gray-50 px-1.5 font-mono text-[10px] font-medium text-gray-500 opacity-100">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="p-0 overflow-hidden shadow-2xl max-w-2xl bg-white rounded-xl border-0">
                    <Command className="[&_[cmdk-root]]:border rounded-xl">
                        <div className="flex items-center border-b px-3">
                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                            <Command.Input
                                placeholder="Type a command or search..."
                                className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                        <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
                            <Command.Empty className="py-6 text-center text-sm text-gray-400">
                                No results found.
                            </Command.Empty>

                            <Command.Group heading="Navigation" className="text-gray-500 px-2 py-1.5 text-xs font-medium">
                                <Command.Item
                                    onSelect={() => runCommand(() => router.push('/admin'))}
                                    className="flex items-center px-2 py-2 rounded-md hover:bg-gray-100 cursor-pointer text-sm text-gray-700 data-[selected=true]:bg-blue-50 data-[selected=true]:text-blue-700"
                                >
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    <span>Dashboard</span>
                                </Command.Item>
                                <Command.Item
                                    onSelect={() => runCommand(() => router.push('/admin/orders'))}
                                    className="flex items-center px-2 py-2 rounded-md hover:bg-gray-100 cursor-pointer text-sm text-gray-700 data-[selected=true]:bg-blue-50 data-[selected=true]:text-blue-700"
                                >
                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                    <span>Orders</span>
                                </Command.Item>
                                <Command.Item
                                    onSelect={() => runCommand(() => router.push('/admin/products'))}
                                    className="flex items-center px-2 py-2 rounded-md hover:bg-gray-100 cursor-pointer text-sm text-gray-700 data-[selected=true]:bg-blue-50 data-[selected=true]:text-blue-700"
                                >
                                    <Package className="mr-2 h-4 w-4" />
                                    <span>Products</span>
                                </Command.Item>
                                <Command.Item
                                    onSelect={() => runCommand(() => router.push('/admin/customers'))}
                                    className="flex items-center px-2 py-2 rounded-md hover:bg-gray-100 cursor-pointer text-sm text-gray-700 data-[selected=true]:bg-blue-50 data-[selected=true]:text-blue-700"
                                >
                                    <Users className="mr-2 h-4 w-4" />
                                    <span>Customers</span>
                                </Command.Item>
                            </Command.Group>

                            <Command.Separator className="my-1 h-px bg-gray-200" />

                            <Command.Group heading="Quick Actions" className="text-gray-500 px-2 py-1.5 text-xs font-medium">
                                <Command.Item
                                    onSelect={() => runCommand(() => router.push('/admin/products/new'))}
                                    className="flex items-center px-2 py-2 rounded-md hover:bg-gray-100 cursor-pointer text-sm text-gray-700 data-[selected=true]:bg-blue-50 data-[selected=true]:text-blue-700"
                                >
                                    <Box className="mr-2 h-4 w-4" />
                                    <span>Create New Product</span>
                                </Command.Item>
                            </Command.Group>
                        </Command.List>
                    </Command>
                </DialogContent>
            </Dialog>
        </>
    );
}
