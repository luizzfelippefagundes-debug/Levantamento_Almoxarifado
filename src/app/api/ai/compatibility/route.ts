import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { modelName, type, image } = body;

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({
                error: "GEMINI_API_KEY não configurada.",
                tip: "Adicione GEMINI_API_KEY no seu arquivo .env na Vercel/Local para ativar a IA real."
            }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // Fetch local context
        const [localPrinters, localToners] = await Promise.all([
            prisma.printerModel.findMany({ select: { name: true, brand: true } }),
            prisma.tonerModel.findMany({ select: { name: true } })
        ]);

        const catalogContext = `
        CATÁLOGO LOCAL DA PREFEITURA:
        Impressoras: ${localPrinters.map(p => `${p.brand} ${p.name}`).join(', ')}
        Toners: ${localToners.map(t => t.name).join(', ')}
        
        Sempre verifique se o modelo que o usuário perguntou existe (ou tem algo parecido) no Catálogo Local acima.
        `;

        // Try models available in the current environment (2026)
        // gemini-1.5-flash is very reliable and has higher quotas
        const modelsToTry = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-pro"];
        let lastError = null;

        for (const modelId of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ model: modelId });

                if (image) {
                    const prompt = `
                    ${catalogContext}
                    Identifique o modelo exato desta impressora ou toner na imagem. 
                    Responda apenas o nome do modelo (ex: HP Laserjet M404n). 
                    Se o modelo for muito parecido com um que já temos no CATÁLOGO LOCAL, use o nome exato do catálogo. 
                    Se não identificar nada, responda "Não identificado".`;

                    const imageParts = [{
                        inlineData: {
                            data: image.split(',')[1],
                            mimeType: "image/jpeg"
                        }
                    }];
                    const result = await model.generateContent([prompt, ...imageParts]);
                    const response = await result.response;
                    return NextResponse.json({ result: response.text().trim() });
                }

                if (type === 'chat') {
                    const prompt = `
                    ${catalogContext}
                    Você é um assistente técnico especialista em impressoras e toners da prefeitura. 
                    Responda de forma curta e objetiva à seguinte dúvida do usuário: "${modelName}". 
                    Se for sobre compatibilidade, informe se já temos esses itens no CATÁLOGO LOCAL ou se precisam ser cadastrados.
                    Seja muito útil e direto.`;

                    const result = await model.generateContent(prompt);
                    const response = await result.response;
                    return NextResponse.json({ result: response.text().trim() });
                }

                const prompt = type === 'printer'
                    ? `Liste os modelos de toners compatíveis para a impressora: ${modelName}. Retorne apenas uma lista separada por vírgulas.`
                    : `Liste os modelos de impressoras compatíveis para o toner: ${modelName}. Retorne apenas uma lista separada por vírgulas.`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                return NextResponse.json({ result: response.text().trim() });
            } catch (err: any) {
                lastError = err;
                console.warn(`Model ${modelId} failed:`, err.message);

                // If it's an API key invalid error, don't bother trying other models
                if (err.message.includes("API key not valid")) break;

                // If model not found, try next one
                if (err.message.includes("not found")) continue;

                break; // Other errors: stop and show
            }
        }

        throw lastError;

    } catch (error: any) {
        console.error("AI Final Error:", error);
        return NextResponse.json({
            error: "Erro ao consultar a IA.",
            details: error.message
        }, { status: 500 });
    }
}
