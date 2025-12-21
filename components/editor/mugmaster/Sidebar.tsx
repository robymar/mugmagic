"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Type, Image as ImageIcon, Smile, User, Palette, ShoppingCart, ArrowLeft, Save } from 'lucide-react';
import { ActiveTab } from './MugMasterEditor';
import Link from 'next/link';

interface SidebarProps {
    activeTab: ActiveTab;
    setActiveTab: (tab: ActiveTab) => void;
    onAddToCart: () => void;
    onSave: () => void;
}

export const Sidebar = ({ activeTab, setActiveTab, onAddToCart, onSave }: SidebarProps) => {

    const tabs = [
        { id: 'text', label: 'Text', icon: <Type size={24} />, color: '#667eea' }, // Blue
        { id: 'stickers', label: 'Stickers', icon: <Smile size={24} />, color: '#764ba2' }, // Purple
        { id: 'avatar', label: 'Avatar', icon: <User size={24} />, color: '#ff6b9d' }, // Pink
        { id: 'upload', label: 'Upload', icon: <ImageIcon size={24} />, color: '#48bb78' }, // Green
        { id: 'color', label: 'Color', icon: <Palette size={24} />, color: '#f6ad55' }, // Orange
    ];

    return (
        <div className="
            w-full h-20 md:w-28 md:h-full 
            bg-white md:border-r border-t md:border-t-0 border-gray-100 
            flex md:flex-col items-center justify-between md:justify-start 
            px-4 md:py-8 gap-2 md:gap-6 z-50
            overflow-x-auto md:overflow-visible
        ">
            {/* BACK BUTTON (Desktop only here) */}
            <div className="hidden md:block mb-4">
                <Link href="/products">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-gray-100 hover:text-gray-800 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </motion.button>
                </Link>
            </div>

            {/* TABS */}
            <div className="flex flex-row md:flex-col gap-3 md:gap-4 w-full justify-center md:justify-start">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <motion.button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as ActiveTab)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`
                                relative group w-14 h-14 md:w-20 md:h-20 rounded-2xl flex flex-col items-center justify-center gap-1
                                transition-all duration-300
                                ${isActive ? 'bg-gray-900 text-white shadow-lg shadow-blue-500/20' : 'bg-[#F7F7F8] text-gray-500 hover:bg-white hover:shadow-md'}
                            `}
                        >
                            {/* Active Indicator Dot */}
                            {isActive && (
                                <motion.div
                                    layoutId="activeTabIndicator"
                                    className="absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-500 rounded-full hidden md:block"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}

                            <div className={`${isActive ? 'text-white' : 'text-gray-500'} transition-colors duration-300`}>
                                {React.cloneElement(tab.icon as React.ReactElement, { size: isActive ? 26 : 24 } as any)}
                            </div>
                            <span className="text-[10px] font-bold tracking-wide">{tab.label}</span>
                        </motion.button>
                    );
                })}
            </div>

            {/* ACTION (Cart) - Bottom on Desktop */}
            <div className="hidden md:flex flex-col mt-auto w-full gap-4">
                <motion.button
                    onClick={onAddToCart}
                    whileHover={{ scale: 1.02, translateY: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full aspect-square rounded-[24px] bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white shadow-xl shadow-purple-500/30 flex flex-col items-center justify-center gap-1"
                >
                    <ShoppingCart size={24} strokeWidth={2.5} />
                    <span className="text-xs font-bold">Add</span>
                </motion.button>

                <motion.button
                    onClick={onSave}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full h-12 rounded-2xl bg-white border-2 border-dashed border-gray-300 text-gray-400 flex items-center justify-center gap-2 hover:border-gray-400 hover:text-gray-600 transition-colors"
                >
                    <Save size={20} />
                    <span className="text-xs font-bold">Save</span>
                </motion.button>
            </div>
        </div>
    );
}
