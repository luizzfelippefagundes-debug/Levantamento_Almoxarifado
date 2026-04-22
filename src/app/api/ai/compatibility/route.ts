import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { modelName, type, image } = body;

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({
                error: "GEMINI_API_KEY não configurada.",
                tip: "Adicione GEMINI_API_KEY no seu arquivo .env na Vercel/Local para ativar a IA real."
            }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        if (image) {
            const prompt = `Identifique o modelo exato desta impressora ou toner na imagem. Responda apenas o nome do modelo (ex: HP Laserjet M404n). Se não identificar nada, responda "Não identificado".`;
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
            const prompt = `Você é um assistente técnico especialista em impressoras e toners da prefeitura. Responda de forma curta e objetiva à seguinte dúvida do usuário: "${modelName}". Se for sobre compatibilidade, seja específico. Se não souber, diga que não tem essa informação.`;
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
    } catch (error: any) {
        console.error("AI Error:", error);
        return NextResponse.json({ error: "Erro ao consultar a IA." }, { status: 500 });
    }
}
