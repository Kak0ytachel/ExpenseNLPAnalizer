import { pipeline, env } from '@huggingface/transformers';


// env.allowLocalModels = false;

let classificationPipeline: any = null;
// console.log("2455666")

// const CANDIDATE_LABELS = ['Jedzenie', 'Rachunki', 'Rozrywka', 'Transport', 'Zakupy', 'Inne'];


async function initModel() {
    console.log("init model")

    if (!classificationPipeline) {
        console.log("112")

        self.postMessage({ status: 'loading', message: 'Pobieranie modelu z Hugging Face...' });

        classificationPipeline = await pipeline('text-classification', 'chel0d/xlm-roberta-expences-categories-pl', {
            model_file_name: 'model',
            subfolder: '',
            progress_callback: (progress) => {
                console.log(progress)
            }
        });
        console.log("loaded")
        self.postMessage({ status: 'ready', message: 'Model załadowany pomyślnie!' });
    }
}

function extractAmount(text: string): number {
    const regex = /(\d+(?:[.,]\d{2})?)/g;
    const matches = text.match(regex);
    if (matches && matches.length > 0) {
        const cleanAmount = matches[0].replace(',', '.');
        return parseFloat(cleanAmount);
    }
    return 0;
}

function cleanText(text: string): string {
    let cleaned = text.toLowerCase();
    cleaned = cleaned.replace(/\b(pln|plz|zl|zł|usd|eur|gbp|czk|chf)\b/g, '');
    cleaned = cleaned.replace(/\d+([.,]\d+)?/g, '');
    cleaned = cleaned.replace('/\b(kod|aut|nr|id|transakcja|karta|data|godz|blokada|operacja' +
        '|rachunek|konto)\b/g', '');
    cleaned = cleaned.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()@?+<>|[\]\\]/g, ' ');
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    return cleaned;
}

self.addEventListener('message', async (event: MessageEvent) => {
    const { text } = event.data;

    if (!text) return;

    try {
        await initModel();

        const amount = extractAmount(text);
        const clean_text = cleanText(text);
        console.log("clean text ", clean_text)
        const output = await classificationPipeline(clean_text);
        const bestCategory = output[0].label;

        console.log(output)
        self.postMessage({
            status: 'success',
            result: {
                amount: amount,
                category: bestCategory,
                text: text
            }
        });

    } catch (error: any) {
        self.postMessage({
            status: 'error',
            message: 'Błąd podczas przetwarzania tekstu przez AI: ' + error.message
        });
    }
});