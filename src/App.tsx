import React, {useState, useMemo, useEffect, type SubmitEvent} from 'react';
import './App.css';

// --- Types & Constants (Translated Categories) ---
type Category = "jedzenie_i_napoje" | "transport" | "zakupy_i_odziez" | "zdrowie_i_uroda" | "rachunki_i_abonamenty" |
    "rozrywka" | "edukacja" | "mieszkanie" | "finanse_i_ubezpieczenia" | "inne";

interface Transaction {
    id: string;
    date: string;
    rawText: string;
    amount: number;
    category: Category;
}

const CATEGORIES = [
    "jedzenie_i_napoje",
    "transport",
    "zakupy_i_odziez",
    "zdrowie_i_uroda",
    "rachunki_i_abonamenty",
    "rozrywka",
    "edukacja",
    "mieszkanie",
    "finanse_i_ubezpieczenia",
    "inne"
]

function getLabel(cat: string) {
    const s1 = cat.replaceAll("_", " ");
    return s1.charAt(0).toUpperCase() + s1.slice(1);
}

const CATEGORY_COLORS: Record<Category, string> = {
    "jedzenie_i_napoje": '#f59e0b',    // Amber
    "transport": '#3b82f6',    // Blue
    "zakupy_i_odziez": '#8b5cf6',    // Purple
    "zdrowie_i_uroda": '#10b981',   // Emerald
    "rachunki_i_abonamenty": '#ec4899',      // Pink
    "rozrywka": '#c7fa0e',
    "edukacja": '#f5d60b',
    "mieszkanie": '#f43f5e',
    "finanse_i_ubezpieczenia": '#0cddc5',
    "inne": '#6b7280',        // Gray
};

export default function App() {
    // --- State ---
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>([
        { id: '1', date: '2026-06-05', rawText: 'Uber Trip 12.50 PLN', amount: 12.50, category: "transport"},
        { id: '2', date: '2026-06-06', rawText: 'Starbucks kawa 24.50 PLN', amount: 24.50, category: "jedzenie_i_napoje"},
        { id: '3', date: '2026-06-07', rawText: 'Netflix subskrypcja 43.00', amount: 43.00, category: "rachunki_i_abonamenty" },
        { id: '4', date: '2026-06-07', rawText: 'Biedronka zakupy 124.30', amount: 124.30, category: "jedzenie_i_napoje" },
    ]);

    const workerRef = React.useRef<Worker | null>(null);
    const [modelStatus, setModelStatus] = useState('Inicjalizacja...');
    const [modelColor, setModelColor] = useState('dot-gray');

    React.useEffect(() => {
        // Tworzenie instancji workera (składnia wspierana przez Vite / Webpack 5)
        workerRef.current = new Worker(
            new URL('./worker.ts', import.meta.url),
            { type: 'module' }
        );

        workerRef.current.onmessage = (event) => {
            console.log("Worker Message:", event.data);
            // const { status, message } = event.data;
            // if (status === 'loading' || status === 'ready') {
            //     setModelStatus(message);
            // }
        };

        return () => {
            console.log("Worker Terminating...");
            workerRef.current?.terminate();
        };
    }, []);

    useEffect(() => {
        console.log("Model Status:", modelStatus);
    }, [modelStatus])


    const handleProcessText = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!inputText.trim() || isLoading || !workerRef.current) return;

        setIsLoading(true);

        // Wysyłamy żądanie do Workera
        workerRef.current.postMessage({ text: inputText });

        // Odbieramy jednorazowy wynik dla tej konkretnej operacji
        workerRef.current.onmessage = (event) => {
            const { status, result, message } = event.data;
            console.log("Worker Message:", event.data);

            if (status === 'success') {
                const newTransaction = {
                    id: crypto.randomUUID(),
                    date: new Date().toISOString().split('T')[0],
                    rawText: inputText,
                    amount: result.amount,
                    category: result.category
                };
                setTransactions(prev => [newTransaction, ...prev]);
                setInputText('');
                setIsLoading(false);
            } else if (status === 'error') {
                setModelStatus(message)
                setModelColor('dot-red')
                alert(message);
                // setIsLoading(false);
            } else if (status === 'loading') {
                setModelStatus(message);
                setModelColor('dot-yellow')
            } else {
                // Aktualizacja globalnego paska statusu ładowania w tle
                setModelStatus(message);
                setModelColor('dot-green')
            }
        };
    };

    // // --- Mock Transformers.js Parsing Pipeline (with Polish keyword matching) ---
    //
    // // --- Form Handler Action ---
    // const handleProcessText = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     if (!inputText.trim() || isLoading) return;
    //
    //     setIsLoading(true);
    //     try {
    //         const parsedResult = await parseNotificationWithAI(inputText);
    //
    //         const newTransaction: Transaction = {
    //             id: crypto.randomUUID(),
    //             date: new Date().toISOString().split('T')[0],
    //             rawText: inputText,
    //             amount: parsedResult.amount,
    //             category: parsedResult.category
    //         };
    //
    //         setTransactions(prev => [newTransaction, ...prev]);
    //         setInputText('');
    //     } catch (error) {
    //         console.error("Przetwarzanie AI nie powiodło się", error);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    // --- Data Computation Matrix ---
    const totalsByCategory = useMemo(() => {
        const totals: Record<Category, number> = Object.fromEntries(CATEGORIES.map(cat => [cat, 0])) as Record<Category, number>;
        transactions.forEach(t => { totals[t.category] += t.amount; });
        return totals;
    }, [transactions]);

    // const totalSpent = useMemo(() => {
    //     return Object.values(totalsByCategory).reduce((sum, amt) => sum + amt, 0);
    // }, [totalsByCategory]);

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
                        <h1 className="logo-title">Aplikacja do śledzenia wydatków z AI</h1>
                    </div>
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
                            Przeanalizuj powiadomienie bankowe
                        </h2>
                        <form onSubmit={(e) => handleProcessText(e)}>
              <textarea
                  className="input-textarea"
                  placeholder="Wklej treść powiadomienia... np. 'Płatność kartą w Biedronka na kwotę 45.20 PLN'"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isLoading}
              />
                            <button type="submit" disabled={isLoading || !inputText.trim()} className="submit-button">
                                {isLoading ? 'Przetwarzanie przez lokalny silnik AI...' : 'Przetwórz i sklasyfikuj'}
                            </button>
                        </form>
                    </div>

                    <div className="ui-card">
                        <h3 className="status-header">Status potoku modeli</h3>
                        <div className="status-indicator">
                            <span className={"pulse-dot " + modelColor}></span>
                            <span className={modelColor} style={{backgroundColor: "transparent"}}>{modelStatus}</span>
                        </div>
                        <p className="status-description">
                            Klasyfikatory NLP typu Zero-Shot oraz parser RegEx działają całkowicie lokalnie w kontekście Twojej przeglądarki.
                        </p>
                    </div>
                </div>

                {/* Analytics Display Panel Dashboard Area */}
                <div>

                    {/* Custom Pure-CSS Scaled Graph Framework */}
                    <div className="ui-card ui-card-graph">
                        <h2 className="card-title card-title-graph">
                            <svg className="card-title-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Podział wydatków według kategorii
                        </h2>

                        <div className="chart-container">
                            {Object.entries(totalsByCategory).map(([cat, amount]) => {
                                const heightPct = (amount / maxCategoryValue) * 100;
                                return (
                                    <div key={cat} className="chart-bar-wrapper" title={`${cat}: ${amount.toFixed(2)} PLN`}>
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
                                    {getLabel(cat)}
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
                                Zarejestrowane transakcje
                            </h2>
                        </div>

                        <div className="table-wrapper">
                            <table className="ledger-table">
                                <thead>
                                <tr>
                                    <th className="ledger-th">Data</th>
                                    <th className="ledger-th">Treść powiadomienia</th>
                                    <th className="ledger-th">Przypisana kategoria</th>
                                    <th className="ledger-th" style={{ textAlign: 'right' }}>Kwota</th>
                                </tr>
                                </thead>
                                <tbody>
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="ledger-td" style={{ textAlign: 'center', color: '#9ca3af' }}>
                                            Brak zarejestrowanych transakcji.
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
                              {getLabel(t.category)}
                          </span>
                                            </td>
                                            <td className="ledger-td td-amount">
                                                {t.amount.toFixed(2)} PLN
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