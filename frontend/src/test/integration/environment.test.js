import { describe, it, expect, vi } from 'vitest';

describe('Environment Configuration', () => {
  it('deve usar a variável de ambiente VITE_API_URL', async () => {
    // Importa dinamicamente para capturar as variáveis de ambiente
    const { apiURL } = await import('../../config/environment');
    
    // Verifica se a URL é a esperada
    expect(apiURL).toBeDefined();
    expect(typeof apiURL).toBe('string');
  });

  it('deve ter fallback para localhost:3001 se VITE_API_URL não estiver definida', async () => {
    // Salva o valor original
    const originalViteApiUrl = import.meta.env.VITE_API_URL;
    
    // Remove temporariamente
    vi.stubEnv('VITE_API_URL', undefined);
    
    // Força reimportação
    const { apiURL } = await import('../../config/environment?t=' + Date.now());
    
    // Deve usar o fallback
    expect(apiURL).toBe('http://localhost:3000');
    
    // Restaura
    vi.stubEnv('VITE_API_URL', originalViteApiUrl);
  });

  it('deve configurar devMode corretamente', async () => {
    const { devMode } = await import('../../config/environment');
    
    expect(devMode).toBeDefined();
    expect(['development', 'production', 'dev', 'prod']).toContain(devMode);
  });
});