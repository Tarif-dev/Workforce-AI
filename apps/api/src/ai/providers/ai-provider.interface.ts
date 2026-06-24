export interface AIProvider {
  generate(prompt: string, systemPrompt?: string): Promise<string>;
}
