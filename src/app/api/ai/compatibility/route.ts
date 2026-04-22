import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
    try {
        const { modelName, type } = await request.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({
                error: "GEMINI_API_KEY não configurada.",
                tip: "Adicione GEMINI_API_KEY no seu arquivo .env na Vercel/Local para ativar a IA real."
            }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = type === 'printer'
            ? `Liste os modelos de toners compatíveis para a impressora: ${modelName}. Retorne apenas uma lista separada por vírgulas.`
            : `Liste os modelos de impressoras compatíveis para o toner: ${modelName}. Retorne apenas uma lista separada por vírgulas.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ result: text.trim() });
    } catch (error: any) {
        console.error("AI Error:", error);
        return NextResponse.json({ error: "Erro ao consultar a IA." }, { status: 500 });
    }
}
