'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { CREDIT_PACKS, PackId } from '@/lib/billing/packs';

export default function BillingPage() {
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState<PackId | null>(null);

    useEffect(() => {
        fetchBalance();
    }, []);

    const fetchBalance = async () => {
        try {
            const res = await fetch('/api/usage');
            const data = await res.json();
            if (data.wallet?.exists) {
                setBalance(data.wallet.balance);
            } else {
                setBalance(0);
            }
        } catch (e) {
            console.error('Failed to fetch balance', e);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async (packId: PackId) => {
        setPurchasing(packId);
        try {
            // 1. Create order on server
            const res = await fetch('/api/billing/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ packId })
            });
            const data = await res.json();

            if (!res.ok) {
                alert(`Error: ${data.message}`);
                return;
            }

            // 2. Open Razorpay Checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Use public key here
                amount: data.amount,
                currency: data.currency,
                name: "Vichith",
                description: `Purchase ${CREDIT_PACKS[packId].name} Pack`,
                order_id: data.orderId,
                handler: function (response: any) {
                    // Payment successful on client side, but we wait for webhook for actual grant
                    alert('Payment successful! Credits will be added momentarily.');
                    // Poll or refresh balance
                    setTimeout(fetchBalance, 3000);
                },
                theme: {
                    color: "#3399cc"
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                alert(`Payment failed: ${response.error.description}`);
            });
            rzp.open();
        } catch (e) {
            console.error(e);
            alert('Failed to initiate purchase.');
        } finally {
            setPurchasing(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white p-8">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
            
            <div className="max-w-4xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-3xl font-bold">Billing & Credits</h1>
                    <p className="text-gray-400 mt-2">Manage your AI credits for Vichith Studio.</p>
                </header>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-12">
                    <h2 className="text-xl font-semibold mb-2">Current Balance</h2>
                    {loading ? (
                        <div className="text-4xl font-bold text-gray-500 animate-pulse">...</div>
                    ) : (
                        <div className="text-4xl font-bold text-blue-400">
                            {balance?.toLocaleString()} <span className="text-lg text-gray-400 font-normal">credits</span>
                        </div>
                    )}
                </div>

                <h2 className="text-2xl font-semibold mb-6">Credit Packs</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.values(CREDIT_PACKS).map((pack) => (
                        <div key={pack.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col">
                            <h3 className="text-xl font-bold">{pack.name}</h3>
                            <p className="text-gray-400 text-sm mt-2 flex-grow">{pack.description}</p>
                            
                            <div className="my-6">
                                <div className="text-3xl font-bold">${pack.priceUsd}</div>
                                <div className="text-sm text-gray-500 mt-1">for {pack.credits.toLocaleString()} credits</div>
                            </div>

                            <button
                                onClick={() => handlePurchase(pack.id)}
                                disabled={purchasing === pack.id}
                                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:text-gray-400 rounded-lg font-medium transition-colors"
                            >
                                {purchasing === pack.id ? 'Processing...' : 'Buy Pack'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
