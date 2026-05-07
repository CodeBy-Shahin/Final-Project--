'use client';

import { useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';

import { fallbackProducts, siteConfig } from '@/lib/site';
import { formatPrice, getDiscountPercentage, getStockMessage } from '@/lib/commerce';
import type { Product } from '@/types/domain';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

type KnowledgeEntry = {
  title: string;
  keywords: string[];
  answer: string;
};

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'can',
  'do',
  'does',
  'for',
  'how',
  'i',
  'in',
  'is',
  'me',
  'of',
  'on',
  'the',
  'to',
  'what',
  'with',
  'you',
  'your',
]);

const CATEGORY_ALIASES: Record<string, string[]> = {
  'Grocery Essentials': ['grocery', 'groceries', 'rice', 'egg', 'eggs', 'oil', 'food', 'pantry'],
  'Home Care': ['home care', 'laundry', 'detergent', 'cleaner', 'floor', 'cleaning', 'home'],
  'Personal Care': ['personal care', 'beauty', 'shampoo', 'face wash', 'grooming', 'skin', 'hair'],
  'Kitchen & Dining': ['kitchen', 'dining', 'cookware', 'pan', 'blender', 'lunch box', 'appliance'],
  'Electronics & Gadgets': ['electronics', 'gadgets', 'power bank', 'lantern', 'mobile', 'tech'],
  'Fashion & Lifestyle': ['fashion', 'lifestyle', 'panjabi', 'sandals', 'footwear', 'menswear'],
};

const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    title: 'Smart Commerce overview',
    keywords: ['smart commerce', 'about', 'platform', 'ecommerce', 'marketplace', 'what is'],
    answer: `${siteConfig.name} is a full-stack e-commerce platform with a customer storefront, cart and checkout flow, order tracking, role-based dashboards, product management, inventory alerts, analytics, and audit logging. ${siteConfig.description}`,
  },
  {
    title: 'Customer shopping flow',
    keywords: ['order', 'buy', 'purchase', 'checkout', 'cart', 'customer flow', 'place order'],
    answer:
      'Customer flow: browse products, open a product detail page, add items to cart, go to /cart, proceed to checkout, enter shipping details, choose COD/card/bank payment, submit the order, then view the confirmation and order status from /dashboard.',
  },
  {
    title: 'Order tracking',
    keywords: ['track', 'tracking', 'order status', 'my order', 'dashboard orders'],
    answer:
      'Customers can track orders from the customer dashboard at /dashboard. Order statuses move through pending, processing, shipped, delivered, and can be reviewed from the order history area.',
  },
  {
    title: 'Payment methods',
    keywords: ['payment', 'pay', 'cod', 'card', 'bank', 'cash'],
    answer:
      'The checkout flow supports cash on delivery, card, and bank payment options. Seeded demo orders include COD and card payments with paid or pending payment status.',
  },
  {
    title: 'Admin dashboard',
    keywords: ['admin', 'administrator', 'dashboard', 'analytics', 'users', 'vendors', 'audit'],
    answer:
      'Admins use /admin to monitor KPIs, revenue trends, inventory alerts, recent orders, top products, and audit activity. Admin pages also include order management, user activation/disable controls, vendor account creation, and inventory views.',
  },
  {
    title: 'Vendor dashboard',
    keywords: ['vendor', 'seller', 'vendor dashboard', 'products manage', 'vendor orders'],
    answer:
      'Vendors use /vendor to see overview stats, manage products at /vendor/products, create new products at /vendor/products/new, review incoming orders at /vendor/orders, and update delivery status through pending, processing, shipped, and delivered.',
  },
  {
    title: 'Inventory intelligence',
    keywords: ['inventory', 'stock', 'reorder', 'low stock', 'forecast', 'demand'],
    answer:
      'Smart Commerce tracks stock, reorder points, low-stock alerts, product velocity metrics, and recommended reorder quantities. The project roadmap also includes demand forecasting and recommendation features for smarter inventory planning.',
  },
  {
    title: 'Demo accounts',
    keywords: ['login', 'demo account', 'credentials', 'password', 'email', 'quick fill'],
    answer:
      'Demo accounts: Admin uses admin@smartcommerce.local / Admin12345 at /admin. Vendor uses vendor@smartcommerce.local / Vendor1234 at /vendor. Customer uses customer@smartcommerce.local / Customer123 at /dashboard. The login page also has quick-fill buttons.',
  },
  {
    title: 'Technology stack',
    keywords: ['tech stack', 'technology', 'frontend', 'backend', 'database', 'next', 'express', 'mongodb'],
    answer:
      'The project uses Next.js 16, React 19, TypeScript, Tailwind CSS, and shadcn/ui on the frontend. The backend uses Express 5, Node.js 22, TypeScript, MongoDB 8 with Mongoose, JWT auth, Docker, and Docker Compose.',
  },
  {
    title: 'Local run commands',
    keywords: ['run', 'start', 'docker', 'seed', 'localhost', 'setup', 'install'],
    answer:
      'Recommended run flow: docker compose up --build, then seed with docker compose exec backend node dist/seed.js. The frontend runs at http://localhost:3000, backend API at http://localhost:5000, and MongoDB at port 27017.',
  },
  {
    title: 'Roles and permissions',
    keywords: ['role', 'roles', 'rbac', 'permission', 'super admin', 'inventory manager', 'analyst'],
    answer:
      'Seeded roles include super_admin, admin, inventory_manager, analyst, vendor, and customer. The backend includes RBAC-ready middleware and permissions such as products.manage, orders.manage, analytics.read, audit.read, forecast.read, and catalog.read.',
  },
  {
    title: 'Support and app availability',
    keywords: ['support', 'contact', 'mobile app', 'pwa', 'business hours', 'help'],
    answer:
      'Smart Commerce is responsive and works as a progressive web app. For help inside the demo, use this chat widget; it can answer questions about products, orders, roles, dashboards, and setup.',
  },
];

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokenize(value: string) {
  return normalize(value)
    .split(' ')
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function getProductSearchText(product: Product) {
  return [
    product.name,
    product.sku,
    product.slug,
    product.description,
    product.category?.name,
    product.category?.slug,
    ...product.tags,
  ]
    .filter(Boolean)
    .join(' ');
}

function scoreText(query: string, target: string) {
  const normalizedQuery = normalize(query);
  const normalizedTarget = normalize(target);
  const tokens = tokenize(query);

  let score = 0;

  if (normalizedTarget.includes(normalizedQuery)) {
    score += 8;
  }

  for (const token of tokens) {
    if (normalizedTarget.includes(token)) {
      score += token.length > 3 ? 2 : 1;
    }
  }

  return score;
}

function findBestProduct(query: string) {
  return fallbackProducts
    .map((product) => ({
      product,
      score: scoreText(query, getProductSearchText(product)) + (normalize(product.name).includes(normalize(query)) ? 8 : 0),
    }))
    .sort((a, b) => b.score - a.score)[0];
}

function findCategory(query: string) {
  const normalizedQuery = normalize(query);

  return Object.entries(CATEGORY_ALIASES).find(([category, aliases]) => {
    const categoryMatch = normalize(category).includes(normalizedQuery) || normalizedQuery.includes(normalize(category));
    const aliasMatch = aliases.some((alias) => normalizedQuery.includes(normalize(alias)));

    return categoryMatch || aliasMatch;
  })?.[0];
}

function formatProductInfo(product: Product): string {
  const discount = getDiscountPercentage(product);
  const stockMessage = getStockMessage(product);
  const compareAt = product.compareAtPrice ? `, was ${formatPrice(product.compareAtPrice)}` : '';
  const discountText = discount > 0 ? ` (${discount}% off)` : '';

  return [
    `${product.name}`,
    `SKU: ${product.sku}`,
    `Category: ${product.category?.name ?? 'Uncategorized'}`,
    `Price: ${formatPrice(product.price)}${compareAt}${discountText}`,
    `Stock: ${product.stock} units - ${stockMessage}`,
    `Rating: ${product.rating}/5`,
    `Details: ${product.description}`,
  ].join('\n');
}

function formatProductList(products: Product[], heading: string) {
  return [
    heading,
    ...products.map((product) => {
      const stockMessage = getStockMessage(product);
      return `- ${product.name}: ${formatPrice(product.price)} (${stockMessage}, stock ${product.stock})`;
    }),
  ].join('\n');
}

function answerProductQuestion(message: string) {
  const lowerMessage = normalize(message);

  if (lowerMessage.includes('discount') || lowerMessage.includes('sale') || lowerMessage.includes('offer')) {
    const discountedProducts = fallbackProducts
      .filter((product) => getDiscountPercentage(product) > 0)
      .sort((a, b) => getDiscountPercentage(b) - getDiscountPercentage(a))
      .slice(0, 6);

    return formatProductList(discountedProducts, 'Current discounted products:');
  }

  if (lowerMessage.includes('featured') || lowerMessage.includes('popular') || lowerMessage.includes('top')) {
    const featuredProducts = fallbackProducts.filter((product) => product.featured).slice(0, 6);

    return formatProductList(featuredProducts, 'Featured products:');
  }

  if (lowerMessage.includes('category') || lowerMessage.includes('categories') || lowerMessage.includes('what products') || lowerMessage.includes('what do you sell')) {
    const categories = [...new Set(fallbackProducts.map((product) => product.category?.name).filter(Boolean))];

    return `Smart Commerce sells products in these categories:\n${categories.map((category) => `- ${category}`).join('\n')}\n\nAsk about any category to see matching products.`;
  }

  const category = findCategory(message);
  if (category) {
    const products = fallbackProducts.filter((product) => product.category?.name === category);

    return formatProductList(products, `${category} products:`);
  }

  const bestProduct = findBestProduct(message);
  if (bestProduct && bestProduct.score >= 3) {
    return formatProductInfo(bestProduct.product);
  }

  if (lowerMessage.includes('product') || lowerMessage.includes('price') || lowerMessage.includes('stock') || lowerMessage.includes('available')) {
    return formatProductList(fallbackProducts.slice(0, 8), 'Here are some available products:');
  }

  return null;
}

function answerFromKnowledgeBase(message: string) {
  const bestEntry = KNOWLEDGE_BASE.map((entry) => ({
    entry,
    score: scoreText(message, `${entry.title} ${entry.keywords.join(' ')}`),
  })).sort((a, b) => b.score - a.score)[0];

  if (bestEntry && bestEntry.score >= 3) {
    return bestEntry.entry.answer;
  }

  return null;
}

function getBotResponse(userMessage: string): string {
  const trimmedMessage = userMessage.trim();

  if (!trimmedMessage) {
    return 'Please type a question about products, orders, accounts, dashboards, inventory, or project setup.';
  }

  const productAnswer = answerProductQuestion(trimmedMessage);
  if (productAnswer) {
    return productAnswer;
  }

  const knowledgeAnswer = answerFromKnowledgeBase(trimmedMessage);
  if (knowledgeAnswer) {
    return knowledgeAnswer;
  }

  return [
    'I can answer from the Smart Commerce project data. Try asking about:',
    '- product prices, stock, categories, discounts, or featured items',
    '- checkout, cart, order tracking, and payment methods',
    '- admin, vendor, and customer dashboards',
    '- demo login accounts',
    '- inventory alerts, analytics, tech stack, or Docker setup',
  ].join('\n');
}

interface ChatWidgetProps {
  position?: 'left' | 'right' | 'bottom';
}

export default function ChatWidget({ position = 'bottom' }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! Welcome to Smart Commerce. Ask me about products, orders, accounts, dashboards, or project setup.',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    const currentInput = inputValue.trim();

    if (!currentInput || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: currentInput,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(currentInput),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsLoading(false);
    }, 350);
  };

  const positionClasses = {
    left: 'left-4 bottom-4',
    right: 'right-4 bottom-4',
    bottom: 'left-1/2 -translate-x-1/2 bottom-4',
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 font-sans`}>
      {isOpen && (
        <div className="mb-4 flex max-h-[32rem] w-[calc(100vw-2rem)] max-w-96 flex-col rounded-lg border border-gray-200 bg-white shadow-2xl animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between rounded-t-lg bg-orange-600 p-4 text-white">
            <div>
              <h3 className="text-lg font-bold">Smart Commerce Support</h3>
              <p className="text-xs opacity-90">Answers from project data</p>
            </div>
            <button
              type="button"
              aria-label="Close chat"
              onClick={() => setIsOpen(false)}
              className="rounded p-1 text-white hover:bg-orange-700"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs rounded-lg px-4 py-2 ${
                    message.sender === 'user'
                      ? 'rounded-br-none bg-orange-600 text-white'
                      : 'rounded-bl-none bg-gray-200 text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-line text-sm leading-relaxed">{message.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg rounded-bl-none bg-gray-200 px-4 py-2 text-gray-900">
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500 delay-100" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500 delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-b-lg border-t border-gray-200 bg-white p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    void handleSendMessage();
                  }
                }}
                placeholder="Ask about products, orders, setup..."
                className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-600 focus:outline-none"
              />
              <button
                type="button"
                aria-label="Send message"
                onClick={() => void handleSendMessage()}
                disabled={isLoading}
                className="rounded-lg bg-orange-600 p-2 text-white hover:bg-orange-700 disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full bg-orange-600 p-4 text-white shadow-lg transition-all duration-300 hover:bg-orange-700"
      >
        <MessageCircle size={24} />
      </button>
    </div>
  );
}
