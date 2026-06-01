import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware rules
  app.use(express.json());

  // API router to proxy Groq Completions API SECURELY
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, ordersContext } = req.body;
      
      const groqKey = process.env.GROQ_API_KEY;
      if (!groqKey) {
        return res.status(400).json({
          status: "needs_key",
          message: "A chave API do Groq ('GROQ_API_KEY') não foi configurada nos segredos do AI Studio. Adicione-a para habilitar a inteligência do agente de atendimento comercial."
        });
      }

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Parâmetro 'messages' é obrigatório e deve ser um array." });
      }

      // Convert orders into context to feed the Llama model
      const formattedOrders = ordersContext && Array.isArray(ordersContext) && ordersContext.length > 0
        ? ordersContext.map((o: any) => 
            `- Pedido [ID: ${o.id}] | Cliente: ${o.client_name} (Email: ${o.client_email}, Cel: ${o.client_phone}) | Produto: ${o.product_type} | Qtd: ${o.quantity} | Valor: R$ ${o.price ? o.price.toFixed(2) : "Calculando..."} | Status: ${o.status || 'Pendente'} | Cadastrado em: ${new Date(o.created_at).toLocaleDateString("pt-BR")}`
          ).join("\n")
        : "Nenhuma encomenda cadastrada até o momento no banco de dados.";

      // Enriching the assistant system prompt
      const systemPrompt = {
        role: "system",
        content: `Você é "Artie", o Assistente Virtual Oficial Inteligente da GRÁFICA ARTIMPRESSA.
Seu tom é extremamente profissional, prestativo, educado, moderno e focado em soluções comerciais. Respondendo sempre em português do Brasil.

INFORMAÇÕES INSTITUCIONAIS DA ARTIMPRESSA:
- Endereço Físico: Avenida Brigadeiro Faria Lima, 2012 - Pinheiros, São Paulo / SP. CEP: 01451-001.
- Contatos: WhatsApp comercial / SAC: (11) 99876-5432, E-mail oficial: contato@artimpressa.com.br.
- Horário de Funcionamento: Segunda a Sexta das 08h às 18h. Sábados das 09h às 13h.
- Garantia de Qualidade: Garantimos correspondência de pelo menos 95% na escala Pantone ou espectro de cores CMYK. Provas de cores digitais são submetidas antes de qualquer rodagem de grande escala.

PORTFÓLIO DE PRODUTOS E ESPECIFICAÇÕES TÉCNICAS:
1. Cartões de Visita Premium: Papel couché 300g com verniz localizado, laminação fosca Soft Touch e bordas arredondadas. (Ref de Preço: R$ 0.12/unidade, lote sugerido 500 ou 1000).
2. Panfletos A5/A4 Corporativos: Papel couché 90g/115g de alta tiragem, cores vibrantes, impressão frente ou frente/verso. (Ref de preço: R$ 0.06/unidade, lote de 1000 unidades).
3. Banners Roll-Up (80x200cm): Estrutura retrátil de alumínio durável, lona 440g fosca antirreflexo de altíssima definição (R$ 149.00/un).
4. Adesivos Vinílicos Decorativos: Vinil fosco de alta qualidade com meio-corte eletrônico de precisão, à prova d'água para vitrines e embalagens (R$ 0.50/un).
5. Agendas e Cadernos Coporativos: Miolo personalizado, folha de adesivos, capa dura com elástico e hot-stamping dourado (R$ 25.00/un).
6. Sacolas Ecológicas Kraft: Papel Kraft pardo resistente 120g com alça torcida de papel torcido, impressão em serigrafia rápida de alto contraste (R$ 1.80/un).
7. Canecas Personalizadas de Cerâmica: Brilho AAA com estampa por sublimação de altíssima fixação, resistente a micro-ondas e lava-louças.
8. Embalagens Cartonadas de Delivery: Papel cartão duplex premium com certificação alimentar e barreira protetora interna contra gorduras e óleos.

MÉTODO DE SOMA DE ORÇAMENTO (ENCOMENDA):
- Para simular ou fazer um pedido, o usuário deve ir até a seção "Solicitar Encomenda" no menu superior, preencher nome, e-mail, telefone, escolher o produto, definir a quantidade desejada, detalhar os acabamentos adicionais e opcionalmente arrastar o arquivo de arte (.pdf, .png ou .zip).
- Uma vez enviado, o sistema gera o ID do pedido (ex: ord-123) e calcula o preço automaticamente no nosso banco de dados. Os pedidos ficam listados no painel de encomendas.
- Métodos de pagamento aceitos: Pix (desconto extra), Faturamento por boleto corporativo (30 dias para empresas cadastradas e validadas), ou Cartões de Crédito.

ACESSO EM TEMPO REAL AO BANCO DE DADOS DE ENCOMENDAS:
Aqui estão as encomendas atuais no banco de dados da ArtImpressa para você dar suporte direto aos clientes de forma dinâmica. Se o cliente perguntar o status, consultar com base no Nome, ID (começando com "ord-"), Celular ou E-mail da planilha ativa abaixo.

ENCOMENDAS DISPONÍVEIS AGORA:
${formattedOrders}

INSTRUÇÕES DO AGENTE:
Quando o cliente te perguntar sobre o status do pedido dele:
- Analise os dados acima e verifique se há correspondência com o ID digitado (ex: "ord-101" ou apenas "101"), com o primeiro ou último nome, e-mail ou telefone.
- Se encontrar, informe de forma assertiva: o nome do cliente, o produto, a quantidade, o valor do pedido e o status atual ("Pendente", "Em Produção", "Concluido" ou "Entregue") com dicas úteis adicionais sobre o significado de cada status.
- Se não encontrar nenhum pedido com esses termos, sugira ao cliente que verifique o ID do pedido no painel de controle, ou forneça o nome exato registrado.
- Caso o usuário enfrente qualquer outra dificuldade, forneça o guia prático para entrar em contato (linkando para o telefone de WhatsApp ou formulário de e-mail ao fim da página), ou explique como funciona a ferramenta de novos orçamentos. Use formatação em Markdown (negritos, listas) para tornar a leitura muito fácil e visualmente espetacular.`
      };

      const requestBody = {
        model: "llama-3.1-8b-instant",
        messages: [systemPrompt, ...messages],
        temperature: 0.7,
        max_tokens: 1024
      };

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errDetails = await response.text();
        console.error("Erro retornado pelo Groq:", errDetails);
        return res.status(response.status).json({
          error: `Erro ao chamar a IA do Groq: status ${response.status}`,
          details: errDetails
        });
      }

      const result = await response.json();
      return res.json(result);

    } catch (err: any) {
      console.error("Erro crítico no proxy do Groq Chat:", err);
      return res.status(500).json({ error: "Erro de servidor interno ao processar chat", details: err?.message || err });
    }
  });

  // Serve Vite in development / Serve Static assets in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server rodando perfeitamente na porta (host: 0.0.0.0, port: ${PORT})`);
  });
}

startServer();
