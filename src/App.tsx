import React, { useState, useMemo } from 'react';
import './App.css';

// --- Types & Constants ---
type Category = 'Food & Dining' | 'Utilities' | 'Entertainment' | 'Transport' | 'Shopping' | 'Other';

interface Transaction {
    id: string;
    date: string;
    rawText: string;
    amount: number;
    category: Category;
}

const CATEGORY_COLORS: Record<Category, string> = {
    'Food & Dining': '#f59e0b',
    'Utilities': '#3b82f6',
    'Entertainment': '#8b5cf6',
    'Transport': '#10b981',
    'Shopping': '#ec4899',
    'Other': '#6b7280',
};

export default function App() {
    // --- State ---
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>([
        { id: '1', date: '2026-06-05', rawText: 'Uber Trip 12.50 USD', amount: 12.50, category: 'Transport' },
        { id: '2', date: '2026-06-06', rawText: 'Starbucks coffee $6.20', amount: 6.20, category: 'Food & Dining' },
        { id: '3', date: '2026-06-07', rawText: 'Netflix subscription 15.99', amount: 15.99, category: 'Entertainment' },
        { id: '4', date: '2026-06-07', rawText: 'Target grocery run $84.30', amount: 84.30, category: 'Shopping' },
    ]);

    // --- Mock Transformers.js Parsing Pipeline ---
    const parseNotificationWithAI = async (text: string): Promise<{ amount: number; category: Category }> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const amountMatch = text.match(/\d+(?:\.\d{2})?/);
                const extractedAmount = amountMatch ? parseFloat(amountMatch[0]) : 0;

                const lowerText = text.toLowerCase();
                let detectedCategory: Category = 'Other';

                if (lowerText.includes('food') || lowerText.includes('restaurant') || lowerText.includes('starbucks') || lowerText.includes('eat')) {
                    detectedCategory = 'Food & Dining';
                } else if (lowerText.includes('electric') || lowerText.includes('water') || lowerText.includes('bill') || lowerText.includes('phone')) {
                    detectedCategory = 'Utilities';
                } else if (lowerText.includes('netflix') || lowerText.includes('movie') || lowerText.includes('spotify') || lowerText.includes('game')) {
                    detectedCategory = 'Entertainment';
                } else if (lowerText.includes('uber') || lowerText.includes('lyft') || lowerText.includes('gas') || lowerText.includes('train')) {
                    detectedCategory = 'Transport';
                } else if (lowerText.includes('amazon') || lowerText.includes('target') || lowerText.includes('store') || lowerText.includes('shop')) {
                    detectedCategory = 'Shopping';
                }

                resolve({ amount: extractedAmount, category: detectedCategory });
            }, 1200);
        });
    };

    // --- Form Handler Action ---
    const handleProcessText = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || isLoading) return;

        setIsLoading(true);
        try {
            const parsedResult = await parseNotificationWithAI(inputText);

            const newTransaction: Transaction = {
                id: crypto.randomUUID(),
                date: new Date().toISOString().split('T')[0],
                rawText: inputText,
                amount: parsedResult.amount,
                category: parsedResult.category
            };

            setTransactions(prev => [newTransaction, ...prev]);
            setInputText('');
        } catch (error) {
            console.error("AI execution failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Data Computation Matrix ---
    const totalsByCategory = useMemo(() => {
        const totals: Record<Category, number> = {
            'Food & Dining': 0,
            'Utilities': 0,
            'Entertainment': 0,
            'Transport': 0,
            'Shopping': 0,
            'Other': 0,
        };
        transactions.forEach(t => { totals[t.category] += t.amount; });
        return totals;
    }, [transactions]);

    const totalSpent = useMemo(() => {
        return Object.values(totalsByCategory).reduce((sum, amt) => sum + amt, 0);
    }, [totalsByCategory]);

    const maxCategoryValue = useMemo(() => {
        const max = Math.max(...Object.values(totalsByCategory));
        return max > 0 ? max : 10;
    }, [totalsByCategory]);

    return (
        <div className="app-container">
            {/* Global Header */}
            <header className="app-header">
                <div className="header-content">
                    <div className="logo-section">
                        {/*<div className="logo-box">*/}
                        {/*    <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">*/}
                        {/*        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />*/}
                        {/*    </svg>*/}
                        {/*</div>*/}
                        <h1 className="logo-title">AI Expense Tracker</h1>
                    </div>
                    {/*<div className="total-badge">*/}
                    {/*    Total Logged: ${totalSpent.toFixed(2)}*/}
                    {/*</div>*/}
                </div>
            </header>

            {/* Main Structural Framework Layout */}
            <main className="main-content">

                {/* Left Hand Sidebar Controls */}
                <div>
                    <div className="ui-card">
                        <h2 className="card-title">
                            <svg className="card-title-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Parse Notification Text
                        </h2>
                        <form onSubmit={handleProcessText}>
                        <textarea
                          className="input-textarea"
                          placeholder="Paste transaction text here... e.g., 'Bank Alert: Spent $54.20 at Amazon'"
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          disabled={isLoading}
                        />
                            <button type="submit" disabled={isLoading || !inputText.trim()} className="submit-button">
                                {isLoading ? 'Processing Local AI Engine...' : 'Process & Classify'}
                            </button>
                        </form>
                    </div>

                    <div className="ui-card">
                        <h3 className="status-header">Model Pipeline Status</h3>
                        <div className="status-indicator">
                            <span className="pulse-dot"></span>
                            Transformers.js Engine Ready
                        </div>
                        <p className="status-description">
                            Zero-Shot NLP Classifiers and RegEx pattern parsers are running locally inside your browser process context.
                        </p>
                    </div>
                </div>

                {/* Analytics Display Panel Dashboard Area */}
                <div>

                    {/* Custom Pure-CSS Scaled Graph Framework */}
                    <div className="ui-card">
                        <h2 className="card-title">
                            <svg className="card-title-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Expenses Breakdown
                        </h2>

                        <div className="chart-container">
                            {Object.entries(totalsByCategory).map(([cat, amount]) => {
                                const heightPct = (amount / maxCategoryValue) * 100;
                                return (
                                    <div key={cat} className="chart-bar-wrapper" title={`${cat}: $${amount.toFixed(2)}`}>
                                        <div
                                            className="chart-bar"
                                            style={{
                                                height: `${heightPct}%`,
                                                backgroundColor: CATEGORY_COLORS[cat as Category]
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        <div className="chart-labels-wrapper">
                            {Object.keys(totalsByCategory).map((cat) => (
                                <div key={cat} className="chart-label">
                                    {cat.split(' ')[0]}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Core Table Ledger Component */}
                    <div className="ui-card">
                        <div className="ledger-header">
                            <h2 className="ledger-title">
                                <svg className="card-title-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                                Parsed Ledger
                            </h2>
                        </div>

                        <div className="table-wrapper">
                            <table className="ledger-table">
                                <thead>
                                <tr>
                                    <th className="ledger-th">Date</th>
                                    <th className="ledger-th">Notification Context</th>
                                    <th className="ledger-th">Assigned Category</th>
                                    <th className="ledger-th" style={{ textAlign: 'right' }}>Amount</th>
                                </tr>
                                </thead>
                                <tbody>
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="ledger-td" style={{ textAlign: 'center', color: '#9ca3af' }}>
                                            No transactions logged yet.
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((t) => (
                                        <tr key={t.id}>
                                            <td className="ledger-td td-date">{t.date}</td>
                                            <td className="ledger-td td-context" title={t.rawText}>
                                                {t.rawText}
                                            </td>
                                            <td className="ledger-td">
                          <span
                              className="category-tag"
                              style={{
                                  backgroundColor: `${CATEGORY_COLORS[t.category]}15`,
                                  color: CATEGORY_COLORS[t.category]
                              }}
                          >
                            <span className="tag-dot" style={{ backgroundColor: CATEGORY_COLORS[t.category] }} />
                              {t.category}
                          </span>
                                            </td>
                                            <td className="ledger-td td-amount">
                                                ${t.amount.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}