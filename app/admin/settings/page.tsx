'use client';

import { useState } from 'react';
import { Settings, Save, Store, Mail, Globe, MapPin } from 'lucide-react';

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        storeName: 'MugMagic',
        storeEmail: 'admin@mugmagic.com',
        storePhone: '+34 600 000 000',
        storeAddress: 'Calle Ejemplo, 123',
        storeCity: 'Madrid',
        storeCountry: 'España',
        currency: 'EUR',
        timezone: 'Europe/Madrid',
        shippingEnabled: true,
        taxRate: 21
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate save
        setTimeout(() => {
            alert('Settings saved successfully!');
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900">Settings</h1>
                <p className="text-gray-500 mt-1">Manage your store configuration</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Store Information */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Store size={20} className="text-blue-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Store Information</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Store Name
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={settings.storeName}
                                onChange={e => setSettings({ ...settings, storeName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Store Email
                            </label>
                            <input
                                type="email"
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={settings.storeEmail}
                                onChange={e => setSettings({ ...settings, storeEmail: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Phone
                            </label>
                            <input
                                type="tel"
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={settings.storePhone}
                                onChange={e => setSettings({ ...settings, storePhone: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Currency
                            </label>
                            <select
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={settings.currency}
                                onChange={e => setSettings({ ...settings, currency: e.target.value })}
                            >
                                <option value="EUR">EUR (€)</option>
                                <option value="USD">USD ($)</option>
                                <option value="GBP">GBP (£)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <MapPin size={20} className="text-green-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Location</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Address
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={settings.storeAddress}
                                onChange={e => setSettings({ ...settings, storeAddress: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                City
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={settings.storeCity}
                                onChange={e => setSettings({ ...settings, storeCity: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Country
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={settings.storeCountry}
                                onChange={e => setSettings({ ...settings, storeCountry: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Tax & Shipping */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Settings size={20} className="text-purple-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Tax & Shipping</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Tax Rate (%)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={settings.taxRate}
                                onChange={e => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Timezone
                            </label>
                            <select
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={settings.timezone}
                                onChange={e => setSettings({ ...settings, timezone: e.target.value })}
                            >
                                <option value="Europe/Madrid">Europe/Madrid</option>
                                <option value="Europe/London">Europe/London</option>
                                <option value="America/New_York">America/New_York</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 rounded text-blue-600"
                                    checked={settings.shippingEnabled}
                                    onChange={e => setSettings({ ...settings, shippingEnabled: e.target.checked })}
                                />
                                <span className="font-medium text-gray-700">Enable Shipping</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50"
                    >
                        <Save size={20} />
                        {loading ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
}
