import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';

@Injectable()
export class AiClient {
  private readonly groq: Groq;
  private readonly MODEL = 'llama-3.1-8b-instant';

  constructor(config: ConfigService) {
    const apiKey = config.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      throw new Error('GROQ_API_KEY não está configurado');
    }
    this.groq = new Groq({ apiKey });
  }

  async generateAnalysis(prompt: string): Promise<string> {
    try {
      const completion = await this.groq.chat.completions.create({
        model: this.MODEL,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new InternalServerErrorException('Resposta inválida recebida do serviço de IA');
      }
      return content;
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;
      console.error('Erro ao chamar Groq:', error);
      throw new InternalServerErrorException('Falha ao chamar o serviço de IA');
    }
  }
}
