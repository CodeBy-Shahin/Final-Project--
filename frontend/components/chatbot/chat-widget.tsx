'use client';

import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

// Product Database
const PRODUCTS = [
    {
        name: 'Everyday Cotton Panjabi',
        category: 'Fashion & Lifestyle',
        price: 1690,
        originalPrice: 1990,
        vendor: 'Smart Commerce',
        description: 'Light, breathable panjabi suitable for family gatherings, Friday wear, and everyday festive styling.',
    },
    {
        name: 'Comfort Slide Sandals',
        category: 'Fashion & Lifestyle',
        price: 990,
        originalPrice: 1250,
        vendor: 'Smart Commerce',
        description: 'Soft cushioned sandals designed for home use, errands, and all-day casual comfort.',
    },
    {
        name: 'FastCharge Power Bank 20000mAh',
        category: 'Electronics & Gadgets',
        price: 2190,
        originalPrice: 2590,
        vendor: 'Smart Commerce',
        description: 'High-capacity fast-charging power bank ideal for heavy phone users, travel, and power backup during outages.',
    },
    {
        name: 'Non-Stick Fry Pan 28cm',
        category: 'Kitchen & Dining',
        price: 1450,
        originalPrice: 1690,
        vendor: 'Smart Commerce',
        description: 'Everyday fry pan with easy-clean coating for quick breakfasts and regular cooking.',
    },
    {
        name: 'Compact Kitchen Blender 1.5L',
        category: 'Kitchen & Dining',
        price: 2890,
        originalPrice: 3390,
        vendor: 'Smart Commerce',
        description: 'Reliable blender for smoothies, spice pastes, sauces, and quick kitchen prep. (Out of stock)',
        inStock: false,
    },
    {
        name: 'Herbal Repair Shampoo 650ml',
        category: 'Personal Care',
        price: 520,
        originalPrice: 610,
        vendor: 'Smart Commerce',
        description: 'Salon-style shampoo with herbal extracts for soft, manageable daily hair care.',
    },
    {
        name: 'Family Laundry Detergent 3kg',
        category: 'Home Care',
        price: 640,
        originalPrice: 760,
        vendor: 'Smart Commerce',
        description: 'Deep-clean detergent suitable for large family washing loads with long-lasting freshness.',
    },
    {
        name: 'Cold Pressed Mustard Oil 1L',
        category: 'Grocery Essentials',
        price: 260,
        originalPrice: 300,
        vendor: 'Smart Commerce',
        description: 'Rich mustard oil ideal for traditional cooking, curries, and frying.',
    },
    {
        name: 'Fresh Farm Eggs (12 pcs)',
        category: 'Grocery Essentials',
        price: 195,
        originalPrice: 220,
        vendor: 'Smart Commerce',
        description: 'Clean, carefully packed eggs for breakfast, baking, and healthy meals.',
    },
    // Muntakim Computer Products
    {
        name: 'Core i5 12th Gen Desktop PC',
        category: 'Computers',
        price: 52000,
        vendor: 'Muntakim',
        description: 'Powerful desktop setup with Intel Core i5 12th Gen processor, 8GB RAM, and 512GB SSD. Ideal for office work, freelancing, and light gaming.',
    },
    {
        name: '24-inch Full HD LED Monitor',
        category: 'Computers',
        price: 14500,
        vendor: 'Muntakim',
        description: 'Sleek 24-inch monitor with Full HD resolution, vibrant colors, and eye-care technology for long working hours.',
    },
    {
        name: 'Mechanical RGB Gaming Keyboard',
        category: 'Computers',
        price: 3200,
        vendor: 'Muntakim',
        description: 'Durable mechanical keyboard with RGB lighting, responsive keys, and comfortable design for gaming and typing.',
    },
    {
        name: 'Wireless Optical Mouse',
        category: 'Computers',
        price: 850,
        vendor: 'Muntakim',
        description: 'Smooth and precise wireless mouse with ergonomic design, perfect for everyday computing and office use.',
    },
    {
        name: '512GB NVMe SSD',
        category: 'Computers',
        price: 5800,
        vendor: 'Muntakim',
        description: 'High-speed NVMe SSD for faster boot times, quick file transfers, and improved system performance.',
    },
    {
        name: 'Gaming Headset with Mic',
        category: 'Computers',
        price: 2400,
        vendor: 'Muntakim',
        description: 'Comfortable over-ear gaming headset with clear microphone, deep bass sound, and noise isolation for immersive gameplay.',
    },
];

const APP_RESPONSES: Record<string, string> = {
    'what is smart commerce': 'Smart Commerce is an e-commerce platform offering groceries, beauty products, home goods, gadgets, and fashion items all in one place.',
    'how do i place an order': 'You can browse products, add items to your cart, and proceed to checkout. You\'ll need to log in to complete your purchase.',
    'what are your delivery options': 'We offer fast delivery options. Check the checkout page for available delivery slots in your area.',
    'how do i track my order': 'Once your order is placed, you can track it from your Orders page by logging into your account.',
    'what payment methods do you accept': 'We accept all major payment methods including credit cards, debit cards, and digital wallets.',
    'how do i return a product': 'You can initiate returns from your Orders page within 7 days of delivery. Contact support for more details.',
    'do you have a mobile app': 'Yes, Smart Commerce is accessible on all devices and works as a progressive web app.',
    'how do i contact support': 'Click on this chat widget to connect with our support team. We\'re here to help!',
    'what are your business hours': 'Our support team is available 24/7 to assist you.',
    'how do i create an account': 'Click the Login button at the top of the page and select Sign Up to create your account.',
};

function findProduct(query: string) {
    const lowerQuery = query.toLowerCase();
    return PRODUCTS.find(p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery)
    );
}

function getProductsInCategory(category: string) {
    return PRODUCTS.filter(p => p.category.toLowerCase().includes(category.toLowerCase()));
}

function getProductsByVendor(vendor: string) {
    return PRODUCTS.filter(p => p.vendor.toLowerCase().includes(vendor.toLowerCase()));
}

function findProductsByVendorAndCategory(vendor: string, category: string) {
    return PRODUCTS.filter(p =>
        p.vendor.toLowerCase().includes(vendor.toLowerCase()) &&
        p.category.toLowerCase().includes(category.toLowerCase())
    );
}

function formatProductInfo(product: any): string {
    let priceStr = `💰 Price: BDT ${product.price}`;
    if (product.originalPrice) {
        const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
        priceStr += ` (was BDT ${product.originalPrice}) - ${discount}% OFF`;
    }
    const stockStatus = product.inStock === false ? '❌ Out of stock' : '✅ In stock';
    const vendor = product.vendor ? `👨‍💼 Vendor: ${product.vendor}` : '';
    return `
📦 ${product.name}
${priceStr}
📝 ${product.description}
${stockStatus}
${vendor}
    `.trim();
}

function getBotResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase().trim();

    // Check for predefined responses
    for (const [key, response] of Object.entries(APP_RESPONSES)) {
        if (lowerMessage.includes(key)) {
            return response;
        }
    }

    // Check for vendor queries (e.g., "What does Muntakim sell?", "Muntakim computer products")
    if (lowerMessage.includes('muntakim')) {
        // If asking about specific category by Muntakim
        if (lowerMessage.includes('computer')) {
            const muntakimComputers = findProductsByVendorAndCategory('Muntakim', 'Computers');
            if (muntakimComputers.length > 0) {
                return `📦 Computer Products by Muntakim:\n\n${muntakimComputers.map(p =>
                    `• ${p.name} - BDT ${p.price}\n  ${p.description.substring(0, 60)}...`
                ).join('\n\n')}`;
            }
        }

        // General Muntakim query
        const muntakimProducts = getProductsByVendor('Muntakim');
        if (muntakimProducts.length > 0) {
            return `✨ Products by Muntakim:\n\n${muntakimProducts.map(p =>
                `• ${p.name} - BDT ${p.price}`
            ).join('\n')}\n\nAsk me about any specific Muntakim product!`;
        }
    }

    // Check for "who sells" queries (e.g., "who sells computer products?")
    if (lowerMessage.includes('who sells') || lowerMessage.includes('who has')) {
        if (lowerMessage.includes('computer')) {
            const computerVendors = [...new Set(PRODUCTS.filter(p => p.category === 'Computers').map(p => p.vendor))];
            if (computerVendors.length > 0) {
                return `🖥️ Computer products are available from: ${computerVendors.join(', ')}\n\nAsk me about their products!`;
            }
        }
    }

    // Check for specific product queries
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
        const product = findProduct(userMessage);
        if (product) {
            return formatProductInfo(product);
        }
    }

    // Check for category queries
    const categories = ['fashion', 'electronics', 'kitchen', 'personal care', 'home care', 'grocery', 'computer'];
    for (const category of categories) {
        if (lowerMessage.includes(category)) {
            const categoryName = category === 'personal care' ? 'Personal Care' :
                category === 'home care' ? 'Home Care' :
                    category === 'grocery' ? 'Grocery Essentials' :
                        category === 'electronics' ? 'Electronics & Gadgets' :
                            category === 'kitchen' ? 'Kitchen & Dining' :
                                category === 'computer' ? 'Computers' :
                                    'Fashion & Lifestyle';

            const products = getProductsInCategory(categoryName);
            if (products.length > 0) {
                return `Here are our ${categoryName} products:\n\n${products.map(p =>
                    `• ${p.name} - BDT ${p.price}${p.originalPrice ? ` (was BDT ${p.originalPrice})` : ''}`
                ).join('\n')}`;
            }
        }
    }

    // Check for specific product names
    const product = findProduct(userMessage);
    if (product) {
        return formatProductInfo(product);
    }

    // Generic product inquiry - list available products
    if (lowerMessage.includes('product') && !lowerMessage.includes('category')) {
        const randomProducts = PRODUCTS.slice(0, 5);
        return `Here are some popular products:\n\n${randomProducts.map(p =>
            `• ${p.name} - BDT ${p.price}`
        ).join('\n')}\n\nAsk me about any specific product or category!`;
    }

    // Check for discount/sale queries
    if (lowerMessage.includes('discount') || lowerMessage.includes('sale') || lowerMessage.includes('offer')) {
        const discountProducts = PRODUCTS.filter(p => p.originalPrice).map(p => ({
            ...p,
            discount: Math.round(((p.originalPrice! - p.price) / p.originalPrice!) * 100)
        })).sort((a, b) => b.discount - a.discount);

        if (discountProducts.length > 0) {
            return `🎉 Check out our current offers:\n\n${discountProducts.slice(0, 5).map(p =>
                `• ${p.name} - ${p.discount}% OFF! Now BDT ${p.price}`
            ).join('\n')}\n\nBrowse all products to see more deals!`;
        }
    }

    // Check for what products available
    if (lowerMessage.includes('what') && (lowerMessage.includes('product') || lowerMessage.includes('sell') || lowerMessage.includes('have'))) {
        const categories = [...new Set(PRODUCTS.map(p => p.category))];
        return `We have products in these categories:\n\n${categories.map(cat => `• ${cat}`).join('\n')}\n\nAsk me about any category or specific product!`;
    }

    return 'I can help you with:\n• Product information and prices\n• Category browsing\n• Orders and delivery\n• Account help\n\nWhat would you like to know?';
}

interface ChatWidgetProps {
    position?: 'left' | 'right' | 'bottom';
}

export default function ChatWidget({ position = 'bottom' }: ChatWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Hi! 👋 Welcome to Smart Commerce. How can I help you today?',
            sender: 'bot',
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        setTimeout(() => {
            const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: getBotResponse(inputValue),
                sender: 'bot',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botResponse]);
            setIsLoading(false);
        }, 500);
    };

    const positionClasses = {
        left: 'left-4 bottom-4',
        right: 'right-4 bottom-4',
        bottom: 'left-1/2 -translate-x-1/2 bottom-4',
    };

    return (
        <div className={`fixed ${positionClasses[position]} z-50 font-sans`}>
            {isOpen && (
                <div className="mb-4 w-96 max-h-96 bg-white rounded-lg shadow-2xl flex flex-col border border-gray-200 animate-in fade-in slide-in-from-bottom-2">
                    {/* Header */}
                    <div className="bg-orange-600 text-white p-4 rounded-t-lg flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-lg">Smart Commerce Support</h3>
                            <p className="text-xs opacity-90">We typically reply instantly</p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:bg-orange-700 p-1 rounded"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-xs px-4 py-2 rounded-lg ${message.sender === 'user'
                                        ? 'bg-orange-600 text-white rounded-br-none'
                                        : 'bg-gray-200 text-gray-900 rounded-bl-none'
                                        }`}
                                >
                                    <p className="text-sm">{message.text}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg rounded-bl-none">
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Type your message..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600 text-sm"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={isLoading}
                                className="bg-orange-600 text-white p-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-orange-600 text-white p-4 rounded-full shadow-lg hover:bg-orange-700 transition-all duration-300 animate-pulse hover:animate-none"
            >
                <MessageCircle size={24} />
            </button>
        </div>
    );
}
